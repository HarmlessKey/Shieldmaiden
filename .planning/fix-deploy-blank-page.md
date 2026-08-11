# Fix: blank page + `Unexpected token '<'` after deploys (issue #264)

## Problem

After a deploy that significantly changes components, returning users get a blank
page on their **first** page load, with the console error:

```
Uncaught SyntaxError: Unexpected token '<'
```

A manual reload always fixes it. It has never been consistently reproducible.

## Root cause — a service-worker update race, not HTTP caching

The app runs SSR with PWA takeover (`ssr: { pwa: true }`, `workboxPluginMode:
"GenerateSW"`). Quasar's generated service worker:

- precaches **all** hashed JS/CSS chunks plus a client-only shell `offline.html`
- registers `navigateFallback: /offline.html` — once the SW controls the browser,
  **every navigation is served the cached `offline.html`**, not SSR output

So a returning user's page load starts from the `offline.html` **cached during
their previous visit**, referencing the old build's chunk URLs.

On the first navigation after a deploy, two things race:

1. The old SW instantly serves the **old** `offline.html`; the page starts
   requesting **old** hashed chunks.
2. In parallel the browser revalidates `/service-worker.js`, finds the new one and
   installs it. Because of `workboxOptions: { skipWaiting: true, clientsClaim: true }`
   the new SW activates immediately and takes control of the half-loaded page.
   Workbox's activate step purges all outdated precache entries — i.e. exactly the
   old chunks the page is still loading. The `updated()` hook in
   `src-pwa/register-service-worker.js` then deletes **every** cache on top of that.

The page's pending chunk requests miss the cache and go to the network. The new
Docker container no longer has the old files (image swap deletes the previous
build), so in `src-ssr/index.js` the request falls through `express.static` into
the SSR catch-all `app.get("*")`, which matches the router's `path: "*"` →
`Error404.vue` route and returns **HTML with status 200 and
`Content-Type: text/html`** for a `.js` URL. The browser parses
`<!DOCTYPE html>` as JavaScript → `Unexpected token '<'` → the app never boots →
the empty `offline.html` shell stays blank.

Why it was never reproducible: it is a real timing race — if the old chunks finish
loading from the old precache before the new SW activates, nothing breaks. Big
component changes invalidate more chunk hashes, widening the window.

Two aggravating findings:

- **`src-pwa/custom-service-worker.js` is dead code.** It is only used with
  `workboxPluginMode: "InjectManifest"`; under `GenerateSW` Quasar ignores it. Its
  `SKIP_WAITING` listener and navigation blacklist have never been active.
- **The delete-all-caches `updated()` handler is counterproductive.** It also
  deletes the *new* precache that was just downloaded, forcing a full re-download
  and widening the race. Workbox already cleans up outdated entries itself.

## Decisions (from maintainer)

- **No "new content available" banner.** No UI around updates at all.
- **Never reload a tab that is actively in use.** Check for a new version when the
  tab regains focus and install it in the background, but the running session keeps
  the old version. The new version applies on the user's **next page load** (which
  performs one quick self-reload to switch over).
- **Safety net**: if a chunk fails to load anyway, auto-reload instead of showing a
  broken page.
- **Friendly error response** for missing static assets: not a 404 page, but a
  "Whoops, something went wrong — please try reloading" page, served with a 4xx
  status (400) so the browser never executes HTML as a script.
- Offline availability is not a concern.

## Implementation plan

### 1. Background install + switch on next page load

**`quasar.conf.js`**: remove `skipWaiting: true` from `pwa.workboxOptions`
(keep `clientsClaim: true`). This is the core change: a newly downloaded SW now
installs into the **waiting** state instead of activating under a live page.
While it waits, the old SW stays in control and the old precache stays intact,
so an active tab can never lose the chunks it is running on — the race is gone
by construction.

Two behaviors then need to be added in **`src-pwa/register-service-worker.js`**
(full rewrite of the hooks):

- **Delete** the `updated()` delete-all-caches handler.
- **Delete** the `updatefound()` → `registration.update()` call.
- **Update check on tab focus.** A browser only looks for a new
  `service-worker.js` on document navigations, so an always-open tab would never
  even learn about a deploy. On `visibilitychange` → visible (throttled to at
  most once a minute), call `registration.update()`. The new SW downloads and
  installs in the background and *waits* — the active session is not touched.
- **Activate the waiting SW on page load.** A waiting SW does NOT take over on a
  normal reload by itself (browsers keep the old SW in control until every tab is
  closed). So at registration time, if `registration.waiting` exists, send it
  `{ type: "SKIP_WAITING" }` (the GenerateSW-generated worker ships a listener
  for exactly this message). It activates, workbox purges the outdated precache,
  `controllerchange` fires, and we do one immediate `location.reload()` — the
  page is barely started, so this shows as a slightly longer load, not a visible
  reload. The reloaded page is served the new `offline.html` + new chunks.

```js
import { register } from "register-service-worker";

let refreshing = false;
let hadController = !!navigator.serviceWorker.controller;

// Reloads the page when a waiting SW we told to SKIP_WAITING takes control.
// Never fires mid-session: SKIP_WAITING is only ever sent at page-load time.
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (!hadController) {
		hadController = true; // first-ever install claiming the page (clientsClaim)
		return;
	}
	if (refreshing) return;
	refreshing = true;
	window.location.reload();
});

register(process.env.SERVICE_WORKER_FILE, {
	registered(registration) {
		// A new version was installed during a previous session and has been
		// waiting since: switch over now, at load time.
		if (registration.waiting) {
			registration.waiting.postMessage({ type: "SKIP_WAITING" });
		}

		// Look for new versions when the user returns to the tab (max 1/min).
		let lastCheck = Date.now();
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible" && Date.now() - lastCheck > 60000) {
				lastCheck = Date.now();
				registration.update().catch(() => {});
			}
		});
	},
});
```

Resulting behavior:

- Deploy while the user is mid-session → on next tab focus the new SW installs in
  the background and waits. The session keeps running the old version off the old
  precache. Nothing breaks, nothing reloads.
- Next page load (reload or reopening the app) → waiting SW is told to activate →
  one quick self-reload at load time → user is on the new version.
- If a new SW finishes installing *during* a page load (the original race
  scenario), it now just waits instead of purging the old precache — the load
  completes on the old version and the switch happens on the following load.

### 2. Remove dead code — `src-pwa/custom-service-worker.js`

Delete the file. It is ignored under `GenerateSW` and its presence suggests
behavior (skip-waiting messaging, navigation blacklist) that does not exist.

### 3. Chunk-load safety net — `src/router/index.js`

Client-side only. Catch lazy-route chunk failures and reload once instead of
leaving the user on a dead page:

```js
if (process.browser) {
	router.onError((err) => {
		const chunkFailed =
			err.name === "ChunkLoadError" || /loading( css)? chunk .* failed/i.test(err.message);
		if (chunkFailed) {
			// prevent a reload loop if the server is genuinely broken
			const last = Number(sessionStorage.getItem("chunk_reload_at") || 0);
			if (Date.now() - last > 30000) {
				sessionStorage.setItem("chunk_reload_at", String(Date.now()));
				window.location.reload();
			}
		}
	});
}
```

Notes:
- Webpack 4 rejects failed dynamic imports with `Loading chunk N failed` /
  `Loading CSS chunk N failed`; the regex covers both.
- The 30s `sessionStorage` guard prevents an infinite reload loop when the asset is
  missing for a real reason (server down, corrupted build).

### 4. Friendly 400 page for missing assets — `src-ssr/index.js`

After the static middleware and `extension.extendApp` (so `/api` keeps priority),
before the SSR catch-all, short-circuit any asset-looking URL that reached this
point — the file does not exist in `www`:

```js
const MISSING_ASSET_RE = /\.(js|mjs|css|map|json|woff2?|ttf|eot|otf|ico|png|jpe?g|gif|svg|webp|webmanifest)$/i;

app.use((req, res, next) => {
	if (!MISSING_ASSET_RE.test(req.path)) return next();
	res
		.status(400)
		.type("html")
		.send(missingAssetPage); // small inline HTML string, see below
});
```

`missingAssetPage` is a minimal self-contained HTML string (no external assets —
they might be missing too): dark background matching the app theme (`#191a1c`),
text along the lines of *"Whoops, something went wrong. Please try reloading the
page."* and a reload button (`onclick="location.reload()"`).

Effects:
- `<script>`/`<link>` requests for stale chunks now fail cleanly (4xx = script not
  executed) instead of producing `Unexpected token '<'`; the failure surfaces as a
  `ChunkLoadError`, which triggers the safety net in step 3.
- A human who lands on such a URL sees a friendly message instead of the SSR 404
  page rendered under a wrong URL.
- The real page-level 404 (`Error404.vue` via the router's `path: "*"`) is
  untouched — it only stops seeing asset URLs.

Production only (`src-ssr/index.js`); the dev server serves assets from webpack's
memory and doesn't have this failure mode, so `extension.js` stays unchanged.

## Order of work

1. `src-pwa/register-service-worker.js` rewrite (step 1) + delete
   `custom-service-worker.js` (step 2) — removes the cause.
2. `src/router/index.js` safety net (step 3) — self-heal for residual failures.
3. `src-ssr/index.js` missing-asset page (step 4) — clean failure mode.

Steps are independent and individually shippable, but 3 and 4 belong together:
4 converts poisoned HTML responses into load errors, 3 recovers from them.

## Verification

- `npm run build && node dist/ssr/index.js` locally:
  - `curl -i http://localhost:3000/js/does-not-exist.js` → 400 + whoops page.
  - `curl -i http://localhost:3000/some/unknown/page` → SSR-rendered 404 page (unchanged).
- SW update flow (Chrome, `localhost` allows SW):
  1. Build, serve, open the app, let the SW install (Application → Service Workers).
  2. Change a component, rebuild, restart the server.
  3. Blur and refocus the open tab: DevTools must show the new SW in **waiting**
     state; the page must NOT reload and must keep working (navigate to a
     not-yet-visited lazy route to prove old chunks still resolve).
  4. Reload the tab: the waiting SW activates and the page performs one extra
     self-reload, landing on the new version. No `Unexpected token '<'` in the
     console, no further reloads.
  5. First-ever visit (cleared storage) must NOT trigger a reload.
- Safety net: with the app loaded, delete a lazy chunk from `dist/ssr/www/js/`,
  navigate to the matching route → expect a single automatic reload.

## Out of scope

- Cache-header hygiene: `serve(".", true)` applies 30-day `max-age` to non-hashed
  files (`manifest.json`, icons). Harmless for this bug; revisit separately.
- Keeping previous-build assets available across deploys (multi-version `www`).
- The pre-existing double-`next()` in the router's `beforeEach` offline check.
