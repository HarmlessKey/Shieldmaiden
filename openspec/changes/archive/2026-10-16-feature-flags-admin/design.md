## Context

Shieldmaiden has no existing feature-flag mechanism. Toggleable behavior today is either a Vuex/UI concern (e.g. `userSettings`) or hardcoded. The first concrete need is a kill switch for the AI monster generator (`src/components/npcs/GenerateMonster.vue` → `POST /ai/generate-monster` in `src-ssr/api/index.js` → the external `MONSTER_GENERATOR_API_URL` service), so it can be turned off quickly if the external API misbehaves or gets expensive, without a release.

The codebase already has a `/admin` section (`src/layouts/admin.vue`, gated client-side via `preFetch` on `store.getters.userInfo.admin`) with several simple admin pages that read/write Firebase Realtime Database paths directly from the client SDK (e.g. `src/services/promotions.js`, `src/views/Admin/Promotions.vue`), and a small standalone Vuex module pattern for lightweight admin-adjacent state (`src/store/modules/contentReports.js`). The app runs in Quasar SSR mode behind Express + PM2 in a long-running Docker container (`src-ssr/index.js`, `Dockerfile`), but per the product decision below, flags are read fresh on every render rather than cached for the process lifetime — so the container's lifetime doesn't matter here.

## Goals / Non-Goals

**Goals:**
- A fixed, code-defined registry of boolean flags (id, label, default), extensible by adding an entry — no schema migration needed for a new flag.
- Firebase-backed storage so an admin toggle is durable and consistent with how other admin tools already persist state.
- An admin page consistent with the existing `/admin` pages' look, auth gating, and direct-Firebase-write style.
- A flag change is visible on the next page load/reload (client re-fetch on boot, fresh read on every SSR render) — confirmed with the user that this is the desired freshness bar, explicitly **not** requiring a redeploy or a live push to open tabs.
- The `monster_generator` flag is enforced in two places: hiding the client entry point (UX) and rejecting the server endpoint (the actual kill switch).

**Non-Goals:**
- Real-time/live propagation to already-open tabs (no `onValue`/`.on("value")` listeners for flags, no websockets).
- Per-user, per-tier, or percentage-rollout flags — this is a single global boolean per flag.
- Admin-created/deleted flags — the registry is code-only; the admin page only toggles existing entries.
- A generic "requires redeploy" build-time-constant model — explicitly rejected in favor of the simpler Firebase-read-per-load model (see Decision 1).

## Decisions

### 1. Freshness model: read fresh per load, not cached for the server process lifetime

Two designs were considered for how a toggle reaches running clients:
- **(a) Read fresh on every load/render.** The client fetches flag state once during app boot (mirroring `checkExtensionInstalled` in `src/store/modules/general.js`); SSR reads it fresh on every `renderToString` call (since Quasar SSR already re-runs boot/store `initialize` per request). A reload always shows the current value. No redeploy needed, ever.
- **(b) Cache in memory for the life of the SSR Node process.** Read once at process boot into a module-level singleton in `src-ssr`, outside the per-request Vuex lifecycle. A reload hits the same process and gets the stale value; only a new deploy (new PM2/Docker process) re-reads and picks up the change.

Confirmed with the user: **(a)**. It's simpler (reuses the existing per-request boot fetch pattern, no new server-lifetime cache module to build/reason about), matches how every other piece of admin-toggled data in this app already works (promotions, vouchers — visible next load, no redeploy), and still fully satisfies the actual need (a fast kill switch that doesn't require a release).

### 2. Registry lives in one shared module, importable from both client and server

`src/utils/featureFlags.js` exports a plain object/array registry, e.g.:
```js
const FEATURE_FLAGS = {
  monster_generator: { label: "AI Monster Generator", default: true },
};
```
This file has no Firebase or Vue dependency, so it can be `require`d from `src-ssr/api/index.js` (CommonJS-compatible, following the existing pattern where `src-ssr/api/index.js` already imports plain services from `src/services/`) and imported from the Vuex module and admin page. One registry, one source of truth for ids/labels/defaults on both sides.

**Alternative considered:** duplicate the registry (one for client, one for server). Rejected — guarantees drift (e.g. a flag id typo'd differently in each place silently fails open).

### 3. Storage shape and read/write helpers

Firebase path: `feature_flags/<flag_id>` → `{ enabled: boolean }` (object, not a bare boolean) to leave room for future metadata (e.g. `updated_at`) without a breaking shape change, consistent with `promotions`' shape.

`src/services/featureFlags.js` (mirrors `src/services/promotions.js` / `src/services/contentReports.js`):
- `getAllFlags()` — one `.once("value")` read of `feature_flags`, merged over the registry defaults so every registered flag always has a defined value even if never written.
- `setFlagEnabled(id, enabled)` — `FEATURE_FLAGS_REF.child(id).child("enabled").set(enabled)`.

`src/store/modules/featureFlags.js` (namespaced, mirrors `contentReports.js`):
- State: `{ flags: {} }` (id → boolean, already merged with defaults).
- Action `fetch_flags()` — calls the service once, commits the result. Called from `general.js`'s `initialize()` action, in both the authenticated and unauthenticated branches (flags aren't user-specific, and future flags may gate public-facing behavior).
- Getter `isFlagEnabled: (state) => (id) => state.flags[id] ?? FEATURE_FLAGS[id]?.default ?? true` — reads the fetched value, falling back to the registry default (covers "fetch hasn't resolved yet" and "fetch failed" the same way).

Server side (`src-ssr/api/index.js`): a small local helper using the existing `admin.database()` instance already initialized in that file:
```js
async function isFlagEnabled(id) {
  const snap = await admin.database().ref(`feature_flags/${id}/enabled`).once("value");
  const val = snap.val();
  return val === null ? (FEATURE_FLAGS[id]?.default ?? true) : val;
}
```
No new service class needed server-side — this mirrors the existing inline `admin.database()` usage already in that route handler for tiers/users/patrons.

### 4. Admin UI: simple list with toggles, no new nav pattern

`src/views/Admin/FeatureFlags.vue`: one `q-table`/`q-list` iterating the registry, each row a `q-toggle` bound to the flag's current stored state, calling `setFlagEnabled` on change (optimistic local update + Firebase write, same interaction pattern as `Promotions.vue`'s enable/disable buttons). Added to `src/views/Admin/index.vue`'s `items` list and as a new child route under `/admin` in `src/router/routes.js`, following the existing `vouchers`/`promotions` route shape exactly (flat child, no nested `:id`).

**Alternative considered:** reuse `q-table` with row actions like `Promotions.vue`. Rejected as overkill for a handful of boolean rows — a plain list with inline toggles is less code and clearer for this shape of data.

### 5. Monster generator enforcement in two places

- **Client (UX only):** in `EditNpc.vue`, wrap the existing "Generate from description" `<button>` in `v-if="isFlagEnabled('monster_generator')"` (mapped getter from the new module). This just avoids showing an option that will fail.
- **Server (the actual kill switch):** in `src-ssr/api/index.js`'s `router.post("/ai/generate-monster", ...)`, check `isFlagEnabled('monster_generator')` immediately after auth (before the credit lookup and before calling `MonsterGenerator.generateMonster`), returning a 4xx with a clear message if disabled. This is what actually stops cost/abuse even if someone calls the endpoint directly, and is why the flag is checked here rather than relying on the client hide alone.

## Risks / Trade-offs

- **[Risk]** A client that already has the New Monster dialog's history/tab open when a flag is disabled can still submit a request that then gets rejected server-side. → **Mitigation:** acceptable per the non-reactive requirement; the server rejection returns a clear error message rather than a generic 500.
- **[Risk]** Firebase read failure for a flag makes the feature behave as if enabled (fail-open) rather than disabled (fail-closed). → **Mitigation:** deliberate choice — a transient read error should never accidentally take down a feature; for a true kill switch (server-side), an admin can retry, and read failures are logged the same way other `admin.database()` reads already are in that file.
- **[Trade-off]** No live propagation means a determined admin trying to stop live abuse mid-incident still needs users to reload, or can rely on the server-side check being effective on that user's *next* request regardless of open tabs (Express reads the flag fresh per request, not cached) — so the practical kill-switch latency is actually "next API call," not "next page load," which is fast enough for the stated use case.
- **[Risk]** Firebase security rules for the new `feature_flags` path aren't managed in this repo. → **Mitigation:** called out explicitly in the proposal's Impact section and as a task; must be verified/added in the Firebase console (or wherever rules are currently managed) before relying on the admin-only write restriction.
