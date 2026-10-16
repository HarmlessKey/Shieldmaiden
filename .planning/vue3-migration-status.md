# Vue 3 migration — status before staging stress test

Branch `feature/vue3-migration` → `develop`, PR
[#361](https://github.com/HarmlessKey/Shieldmaiden/pull/361). Written 2026-09-25.

This is the read-through document: what changed, what replaced what, what went wrong on
the way, and — most importantly — **what has and has not been tested**, so gaps can be
spotted before staging. The design reasoning and the phase-by-phase plan live in
[`vue3-migration.md`](vue3-migration.md); this document does not repeat it.

---

## 1. Status in one screen

| | |
|---|---|
| Vue 2 code left in `src/` | **None.** Every Vue 2 grep gate is clear (§7). Only Vue 3.5 is in the dependency tree. |
| Build | `npm run lint`, SPA build and SSR build all clean. |
| Dev server | Compiles clean. |
| CI on #361 | All four checks pass: build (Docker), Snyk, SonarCloud ×2. |
| Docker image | Boots and serves (after the `source-map` fix, §4.3). |
| Public pages | Verified in a browser against the production build — zero console errors. |
| Signed-in pages | **Loaded and checked**, both dev and production build. **Interactions mostly not exercised.** |
| Found by clicking, after all gates were green | 4 bugs, all fixed: combat tracker HP/AC 0/0, `[object Promise]`, empty campaign panels, missing Projectiles dialog. |

Size: 286 files changed, 26 commits. Base is `develop` @ 2.43.1.

**The biggest risk left is interactive behaviour behind login.** Three of the four
bugs found by hand produced no console error at all. So "the console is clean" is
necessary, but it is not evidence that a screen works. §6 lists exactly what has not been
clicked through.

---

## 2. What was updated (general)

### 2.1 Framework and toolchain

- **Vue 2.7 → Vue 3.5**, **Quasar 1.22 → Quasar 2.33**, **Vuex 3 → 4**, **Vue Router 3 → 4**.
- **`@quasar/app` 2 (webpack 4) → `@quasar/app-webpack` 3.15.1 (webpack 5).** v4 was
  deliberately *not* used: it dropped Vuex, and the app has ~20 Vuex modules and 15
  `preFetch({ store })` hooks. v3 is no longer maintained, so v4 + Pinia is the follow-up.
- `quasar.conf.js` → `quasar.config.js` (`configure()` wrapper).
- ESLint: `babel-eslint` → `@babel/eslint-parser`, `eslint-plugin-vue` 7 → 9 with the
  `vue3-essential` preset and the `no-deprecated-*` rules, `no-dupe-keys` switched on,
  and ESLint runs inside the webpack build again.
- `browserslist` lost `"maintained node versions"`. With it, webpack 5 builds the client
  bundle as a non-web target, and jspdf 3 fails to resolve.
- `build.env` sets every `process.env.X` that browser code reads. Webpack 5 no longer
  shims `process`, so a missing key throws in the browser. Server-only keys
  (`MONSTER_GENERATOR_*`) are deliberately **not** in it, so they stay runtime reads.

### 2.2 SSR server, BFF and Docker

- `src-ssr/index.js` + `extension.js` → the Quasar 2 middleware layout:
  `middlewares/compression.js` (prod only) → `middlewares/api.js` → `middlewares/render.js`,
  plus `production-export.js` (listens on `PORT || 3000`).
- **The BFF (`src-ssr/api/`) is unchanged.** It is mounted on `/api` with
  `express.json()`, `morgan` in prod and `x-powered-by` off. It only degrades gracefully when
  `firebaseServiceAccountKey.json` is missing; any other error throws. The previous attempt
  swallowed all errors here.
- The rendered page's `Access-Control-Allow-Origin: https://harmlesskey.com` header is
  kept.
- Static files and the no-cache rule for `service-worker.js` are handled by the Quasar
  CLI (`ssr.maxAge`) rather than hand-written `express.static` calls.
- `source-map` is now an explicit dependency. Without it the container crashes on boot
  (§4.3).
- `Dockerfile` and `docker-compose` are unchanged.

### 2.3 PWA

- Same `GenerateSW` + Workbox 7, same manifest (including the 5.5e description), same
  icons and shortcuts.
- **PWA is off in the dev server** (`ssr.pwa: ctx.prod`). In SSR dev it causes an endless
  reload loop. A browser that still has an old service worker for `localhost:8080`
  (for example from develop's dev server) has to unregister it once.

### 2.4 App bootstrap

- `createStore`, `createRouter` (memory history on the server), boot files take
  `{ app }` and register through `app.component` / `app.use` / `app.directive`.
- The event bus is `mitt` (`on`/`off`/`emit`). `$root.$emit` and `EventBus.$on` are gone,
  and listeners that were never removed now unsubscribe in `beforeUnmount`.
- `meta()` → `createMetaMixin()`. `process.browser` → `process.env.CLIENT`.
- **Every `hk-*` component is registered synchronously** in `boot/hk-components.js`,
  because lazy ones caused hydration errors in production (§4.2). This costs +15 KB gzip
  on the initial payload.
- 37 routes that used a Vue 2 render function as a passthrough now share one
  `RouterPassthrough` component.

### 2.5 Templates and components (patterns, not files)

- `slot=` / `slot-scope=` → `<template v-slot:…>` (~440 sites, mostly lint autofix plus
  prettier). **Review that commit with whitespace hidden.**
- **One v-model contract:** our own form components take `modelValue` and emit
  `update:modelValue` (24 components). No dual `value`/`modelValue` API, unlike the
  previous attempt.
- `$listeners` merged into `$attrs` with `inheritAttrs: false` where a wrapper forwards
  listeners. `.native` modifiers removed. `$scopedSlots` → `$slots`.
- `<template v-for>` keys moved onto the `<template>`. `v-text` on components → default
  slot. `<div :is>` → `<component :is>`. `router-link tag=` → `custom` + `navigate`.
- Lifecycle: `beforeDestroy`/`destroyed` → `beforeUnmount`/`unmounted`.
- Filters (`| numeral`) → `$numeral()`. One `filters:` block → method.
- `() => import()` component registrations → `defineAsyncComponent` (§4.1).
- Transition classes `-enter`/`-leave` → `-enter-from`/`-leave-from`.
- Invalid table nesting fixed (`<th>` outside `<tr>`, `<tr>` directly under `<table>`),
  because it breaks hydration.

### 2.6 Reactivity and store

- `Vue.set` / `Vue.delete` (≈420 in the store) and `this.$set` / `this.$delete` (≈245 in
  components) → plain assignment and `delete`. Every call site was checked for **array
  vs object**: arrays use `splice`, because a plain `delete` on an array leaves a hole where
  `Vue.delete` removed the element.

### 2.7 Quasar 1 → 2 component API

None of these are caught by the compiler or linter. The old names bind as plain
attributes, and the old handlers silently never fire.

- `@input` → `@update:model-value` on Quasar form components (~109 sites). On Quasar 2,
  `@input` on a `q-input` still fires, but receives a DOM `Event` instead of the value.
- `:value` → `:model-value` (~44 sites). `q-linear-progress` / `q-circular-progress`
  keep `:value`, which is their real prop name.
- `<q-table :data>` → `:rows` (19 tables).
- `q-select` option slot: `itemEvents` folded into `itemProps`.
- Language pack `en-us` → `en-US`. `framework.config.dark: true`, because
  `index.template.html` hard-codes `body--dark`.

### 2.8 Styles

- `::v-deep` → `:deep()` everywhere (39). BEM `&__suffix` inside a deep block needs its
  own `:deep()`. One `::v-deep` in global CSS never compiled to anything and was deleted.
- ~180 lines of `vue-snotify` DOM overrides replaced by the few rules the new toasts need.
- `hk-pane` gets `contain: strict` back (§4.1).
- `Tools/SpellCreator.vue` had `<styles>` (typo), so its CSS **never applied on develop**.
  Now it does. **This is a visible change on that page. Worth a look.**

---

## 3. Libraries replaced

### 3.1 Replaced by in-repo code

These four were wide (100+ call sites) but shallow (small API surface). Reimplementing
the surface kept those call sites untouched. They are plain Vue 3 code, **not**
compatibility layers.

| Was | Now | Surface kept | Risk to watch |
|---|---|---|---|
| `vue-snotify` | `src/plugins/snotify.js` over Quasar `Notify` / `Dialog` | `$snotify.success/error/warning/html/remove/clear`, options `timeout`, `buttons[{text, action, bold}]`, `position`, `closeOnClick` | Toasts **with buttons** (confirmations) are the least exercised path. |
| `vee-validate` 3 | `src/plugins/validation/` (`ValidationProvider`, `ValidationObserver`, `rules.js`) | v3 slot contract: `errors`, `invalid`, `validated`, `handleSubmit`, `valid`, `validate`, `reset`. Value auto-detected from the slot's `v-model` | Every create/edit form in the app goes through it. Only the add-player form in the demo has been exercised. |
| `vue-shortkey` | `src/directives/shortkey.js` | Array and named (`{ name: keys }`) forms, `@shortkey` on elements *and* components, ignores keys typed in `input`/`textarea`/`contenteditable` | **No shortcut has been exercised yet**, including the combat tracker's keybindings and `esc` on the drawer. |
| `vuefire` 1.x | `src/plugins/vuefire.js` on the Firebase v8 namespaced API | The `firebase()` component option, `.key` / `.value` records, `readyCallback` / `cancelCallback`, ordering by `child_moved`. Client-side only | Initial loads work (track campaign, content lists). **Live updates** (changes arriving from another tab or device) are untested. |

vee-validate was dropped entirely rather than upgraded: v4 shares nothing with v3
but the name. The app's rules are ~40 lines in `rules.js`.

### 3.2 Replaced by another library

| Was | Now | Where | Notes |
|---|---|---|---|
| `vue-croppa` | `vue-advanced-cropper` | `hk-image-uploader.vue` | croppa owned the file picker; the component now has its own hidden input and object-URL lifecycle. Same emitted API. **Untested.** |
| `vue-qr` | `qrcode.vue` | `PlayerLink.vue` | No logo option; the logo is overlaid with CSS on an H-level QR code. **Scanning with a phone untested.** |
| `@egjs/vue-flicking` | `@egjs/vue3-flicking` | `home/Feedback.vue` | Renders; swiping untested. |
| `vuedraggable` 2 | `vuedraggable` 4 | `combat/Targets.vue`, `npcs/Actions.vue` | Plain `ul`/`div` tag, **no transition-group** (§4.1). Sortable attaches on the target lists; no drag performed in either place. |
| `splitpanes` 2 | `splitpanes` 3 | `RunCampaign.vue`, `hk-pane.vue` | Same API. Resizing and remembered pane sizes untested. |
| `@gtm-support/vue2-gtm` | `@gtm-support/vue-gtm` | `boot/plugins.js` | `enabled: true` kept as on develop. Tag firing not verified. |
| `vue-numeral-filter` | `numeral` + global `$numeral()` | templates | — |
| Vue event bus | `mitt` | `event-bus.js` | — |

### 3.3 Removed as dead code

`vue-cookies`, `vuejs-logger` and `vue2-flip-countdown` were imported only in
`boot/plugins.js` and never used. `src/store/store.js` imported modules that don't
exist. `EffectsForm.vue` and `mixins/effects.js` were imported by nothing (the work is
preserved on `origin/feature/effects`). vee-validate 2 leftovers (`v-validate`,
`errors.has`) were removed from three files. Two webpack-4-era `overrides` were removed.

---

## 4. Pitfalls encountered

### 4.1 Silent at runtime — the dangerous ones

Each of these passed lint, both builds, and (except where noted) a clean console.

1. **`() => import()` is no longer an async component.** In `components:` or `:is`, Vue 3
   calls the bare function as a functional component and renders the Promise as the text
   `[object Promise]`. **No warning.** Found by you on staging. 17 registrations plus
   `Drawer.vue` (so every drawer) are fixed.
2. **vuedraggable 4 + `tag="transition-group"` crashes.** Vue clones keyed transition
   children, so vuedraggable's vnodes never get a DOM element. Its `mounted` throws and
   aborts the rest of Vue's update queue. Symptom: the combat tracker showed **0/0 HP and
   AC 0** and drag-reorder was dead. The only console message was a generic warning.
   **Cost of the fix: those two lists lost their enter/leave animations.**
3. **Quasar 2 `.q-scrollarea` is `contain: size`, not `contain: strict`.** A
   `position: static` scroll area is no longer the containing block for absolute children.
   The campaign Share overlay covered the whole screen.
4. **A file rewrite lost a `<style>` block** (`hk-pane.vue`, Phase 6). Every campaign
   panel had zero height. This was a process error, not a Vue one. A check across all
   modified `.vue` files found no other lost styles.
5. **`@input` on Quasar components receives an `Event`, not the value** (§2.7).
6. **`v-text` on a component renders nothing.** It becomes a `textContent` prop.
7. **Named slots on a plain element are dropped.** `<component :is>` that resolves to a
   `div` loses its `#header` slot.
8. **A `v-if` / `v-else-if` chain cannot cross a slot boundary.**
9. **Duplicate component options are silently discarded.** A second `methods:` or `mixins:`
   replaces the first. This took out breadcrumbs and the dice mixin until `no-dupe-keys`
   caught it. It also exposed a pre-existing duplicate `computed:` in
   `trackCampaign/Meters.vue`.
10. **A named slot invoked with no props passes `null`**, and forwarding it with
    `v-bind="scope"` throws. The fix is `v-bind="scope || {}"`.
11. **A component used without being registered** only warns (`Projectiles` in
    `CardActions`). It was already broken on develop, and is fixed now.

### 4.2 SSR and hydration

12. **Async components hydrate late.** An async subtree hydrates after mount, when
    `loading` flags and Quasar's pre-hydration state have already changed. That is a
    console **error in production**. The fix was synchronous registration of `hk-*`.
    *The components converted in §4.1 #1 are still async. They were checked on the
    signed-in pages and `/weather-demo` with no mismatches, but they are the first
    suspect if one appears.*
13. **Capitalised HTML tags** (`<P>`) resolve as components in Vue 3 and render nothing.
14. **Invalid table nesting** is re-parented by the browser, which breaks hydration.
15. **Vue 3 render functions take no `h` argument.** The Vue 2-style passthrough routes
    returned 500 on every `/compendium` and `/tools` page.
16. **Env and node builtins:** webpack 5 doesn't shim `process` or node modules.
    `dotenv` in `services/patreon.js` pulled `path`/`os`/`crypto` into the browser bundle.

### 4.3 Build and deploy

17. **Docker 502 on staging.** `@quasar/ssr-helpers` needs `source-map` but doesn't declare
    it. Locally it resolves through hoisting; in the container's fresh `/app` it doesn't,
    so the server never listens, pm2 keeps the container "Up", and nginx returns 502. Fixed
    by declaring it. Verified in the real image.
18. **`build.env` shadows runtime env.** Defining a server-only key at build time inlines
    `""` and ignores what docker-compose passes in. Fixed for `MONSTER_GENERATOR_*`.
19. **`maintained node versions` in `browserslist`** turns the client build into a non-web
    target (§2.1).
20. **PWA in SSR dev** causes an endless reload loop. A **stale service worker** on
    `localhost:8080` makes the dev server look broken until it is unregistered.

### 4.4 Testing itself

21. Green lint, green builds and a clean console **did not** catch the four bugs in §1.
    They were only found by clicking through screens and checking page text and
    screenshots.
22. Google sign-in refuses automated Chrome. Signed-in testing used a Firebase custom
    token minted with the local service-account key for your account.

---

## 5. What has been tested

"Verified" means clicked through in a real browser with the console open. "Loads" means
the page rendered correctly and was checked visually, but nothing on it was operated.

### 5.1 Build, deploy, infrastructure

| Area | Result |
|---|---|
| `npm run lint`, SPA build, SSR build | Clean |
| `npm ci --dry-run` (lockfile, npm 11) | Valid |
| CI on #361 (Docker build, Snyk, SonarCloud ×2) | Pass |
| Docker image boots with **no** env vars set | Listens on 3000; all routes 200; `/api` returns 401 unauthenticated as expected |
| Container without `firebaseServiceAccountKey.json` | Fails to start. **Same as develop** — the key must be mounted at `/app/firebaseServiceAccountKey.json` |

### 5.2 Public, signed out (production SSR build)

| Area | Result |
|---|---|
| 24 public routes (home, demo, encounter builder, tools pages, pricing, privacy policy and the other static pages) | Verified: 200, zero console errors, no hydration mismatch |
| Compendium lists and detail pages (monsters, spells, items, conditions, rules) | Verified: zero console errors |
| Sign-in page | Loads |
| Weather demo | Loads (dev) |

### 5.3 Demo combat flow (dev server, live content API)

| Step | Result |
|---|---|
| Encounter builder: monster search, add monster, difficulty recalculation | Verified |
| Add player form (hk-input + validation) | Verified |
| Run encounter → roll all initiative → set initiative → start | Verified |
| Combat tracker: HP / AC, targeting, 20 damage → 115/135, combat log, damage meters, statblock | Verified, and matches the live site |
| Target drag-reorder | Sortable attaches to all three lists; **no actual drag performed** |

### 5.4 Signed in (dev server **and** production build, your develop account)

| Area | Result |
|---|---|
| Every `/content/*` list page (manage, campaigns, players, character builder list, npcs, companions, spells, reminders, items, characters, followed, settings, import) | Loads, clean console |
| Campaigns page sidebar (share initiative, subscription tier) | Loads; `[object Promise]` fixed |
| Campaign overview (splitpanes, encounters, players, soundboard, share, resources) | Loads; empty panels fixed |
| Encounter edit (entities tab, difficulty) | Loads |
| Run encounter on an in-progress encounter | Loads; `Projectiles` warning fixed |
| Track campaign / player view (`/user/:id/:campaign`) | Loads |
| Broadcast drawer (Go live) | Opens and renders; not toggled |
| Profile | Loads |
| `/admin` | Route loads with no error; admin screens not inspected |

---

## 6. What has NOT been tested

Ordered by risk: how much migrated code the path runs through, times how bad a failure
would be. **This is the list to check for gaps.**

### 6.1 High — run through replaced code, and nothing has exercised them

- **Create / edit / save forms** for NPCs, spells, items, players, companions, reminders,
  campaigns and encounters. Every one goes through the in-repo `ValidationObserver`,
  Quasar 2 `update:model-value` handlers and plain-assignment reactivity. Save errors,
  validation messages and "unsaved changes" guards are all unverified.
- **Character builder steps** (info, general, race, class, abilities, equipment).
- **NPC editor**, including drag-reordering actions (vuedraggable 4, `WeakMap` keys).
- **Combat tracker beyond damage:** actually dragging targets to reorder, healing, conditions, reminders, death saves, legendary
  and limited uses, rolling actions and spells (including multi-projectile), ending combat
  → **Finished screen** (async `Players`), undo in the log, adding entities mid-combat.
- **Keyboard shortcuts** in the combat tracker (`v-shortkey` replacement).
- **Confirmation toasts with buttons** (`$snotify` replacement), e.g. delete confirmations.
- **Live updates across devices:** go live, then a second browser on the player view
  should update as you damage and advance turns (in-repo vuefire + broadcast).
- **Image upload / avatar crop** (`vue-advanced-cropper`).
- **Sign-in and sign-up through the UI** — email/password, Google popup/redirect, sign
  out, password reset.

### 6.2 Medium

- Import / export of content (JSON import, HK import), content reports.
- PDF / image export (jspdf 3, html2canvas) — spell cards and similar.
- Character sync with the browser extension (`postMessage` bridge).
- Patreon link flow and subscription tiers. Note: this is where the exposed client secret
  lives (§8).
- AI monster generator via the BFF (needs `MONSTER_GENERATOR_*` at runtime).
- Soundboard / ambience playback; weather effects on the player view.
- Splitpanes resizing and remembered pane sizes; `hk-pane` scrolling with long content.
- Share / QR code drawer (`qrcode.vue` with the overlaid logo — **scan it with a phone**).
- Home page feedback carousel swiping (`vue3-flicking`).
- Admin screens (patrons, subscriptions, users).
- Light theme (`setTheme`) — Quasar is forced to dark mode at boot.

### 6.3 Low, but only staging can show them

- **Mobile widths:** the campaign overview switches to a `q-tab-panels` layout below
  `sm`; the drawer and header collapse.
- **Service-worker upgrade from the Vue 2 site.** Existing users have develop's service
  worker cached. With `skipWaiting` + `clientsClaim` they should switch over on the next
  visit, but **a returning visitor on staging is the only real test.**
- GTM tags firing.
- Browsers other than Chromium (Safari especially).
- Performance under load: initial payload is +15 KB gzip. Workbox warns that five assets
  (four hero images and the vendor chunk) are too large to precache. That is unchanged
  from develop.

---

## 7. Vue 2 residue check (re-run 2026-09-25)

All return **0** over `src/`: bare `slot=`, `slot-scope`, `$set(`, `$delete(`,
`Vue.set`, `Vue.delete`, `beforeDestroy`, `destroyed()`, `::v-deep`, `.sync=`,
`$scopedSlots`, `$listeners`, `process.browser`, `new Vue(`, `Vue.prototype`, `Vue.use(`,
`filters:`, `$on(`, `$off(`.

Bare `() => import(` only remains in `src/router/` (correct for Vue Router 4) and in
`Drawer.vue`'s loader, which is awaited before use. `npm ls vue` shows only `vue@3.5.43`.

Lint suppressions added on this branch: `vue/no-mutating-props` ×3 (pre-existing demo
prop mutations, left as they were), `vue/require-toggle-inside-transition` ×1 (a
Sidebar transition that never animated on develop either), `vue/no-parsing-error` ×1,
and `no-unused-vars` ×2.

---

## 8. Known behaviour changes and open items

### 8.1 Visible differences from develop

- **Combat target list and NPC action list no longer animate** items in and out
  (§4.1 #2). Restoring it means driving Sortable.js directly instead of through
  vuedraggable (~40 lines, and it drops an unmaintained dependency).
- **Spell creator page styles now apply** (the `<styles>` typo, §2.8).
- **The multi-projectile dialog on entity cards now opens with content** (it was empty on
  develop).
- `Meters.vue`'s `npcSettings` / `allySettings` getters were removed. They never existed
  at runtime on develop because of a duplicate `computed:`.

### 8.2 Deploy checklist for staging

- [ ] `firebaseServiceAccountKey.json` mounted at `/app/firebaseServiceAccountKey.json`
      (same as develop; without it the container stays "Up" but never listens).
- [ ] `MONSTER_GENERATOR_API_URL` and `MONSTER_GENERATOR_API_KEY` set in docker-compose.
      They are runtime reads now and are not in `.env.production.local`.
- [ ] `VUE_APP_*` values come from `secrets.STAGING_ENV_FILE` at **build** time. Nothing
      to change there.

### 8.3 Pre-existing problems found on the way (not fixed here)

- **Patreon client secret** is in the browser bundle and is logged to the console by
  `services/patreon.js`. **Rotate it**, and move the token exchange behind the BFF.
- A compendium detail page for an unknown slug returns 500 instead of 404.
- Firebase warns about a missing `.indexOn: "private"` at
  `/search_campaigns/$uid/results` (database rules, not app code).

### 8.4 Follow-ups (out of scope by design)

- `@quasar/app-webpack` 4 + Vuex → Pinia (v3 is unmaintained).
- Replace the in-repo `$snotify` / validation shims with native Quasar / vee-validate 4
  APIs.
- Restore list animations with a direct Sortable wrapper (§8.1).
- Composition API / `<script setup>` — no reason to do it during a migration.

---

## 9. Suggested order for the staging stress test

1. **Returning visitor:** open staging in a browser that visited it before the deploy.
   Confirm the new version loads without a hard refresh (service-worker upgrade).
2. **Full combat, signed in:** build an encounter with players and monsters, run it with
   the console open, and use every control on an entity (damage, heal, conditions,
   reminders, rolls including a multi-projectile attack, death saves), keyboard shortcuts,
   log undo. Then **finish** it.
3. **Go live, with a second device on the player view.** Advance turns and deal damage;
   the player view should follow in real time. Scan the QR code.
4. **Create and edit one of each** content type: NPC (reorder actions), spell, item,
   player, companion, reminder, campaign. Include a validation error and a delete
   confirmation.
5. **Character builder** end to end; avatar upload and crop.
6. **Sign out, sign in with email, sign in with Google, sign up a new account.**
7. **Phone-width pass** over the campaign overview, the combat tracker and the player view.
8. Import / export, PDF export, Patreon linking and the admin screens, as time allows.
