# Vue 2 → Vue 3 / Quasar 1 → Quasar 2 migration

Branch: `feature/vue3-migration` (from `develop`)

## Goal

Run Shieldmaiden on Vue 3 + Quasar 2 with **no Vue 2 code left in `src/`**, a green SSR
build, a green dev server, a clean browser console, and a PR that passes the existing
quality gates. Migrate first, refactor later — the diff must stay reviewable.

---

## 1. Review of the previous attempts

Three branches exist. Two are the same commit.

| Branch | HEAD | Verdict |
|---|---|---|
| `origin/vue3-migration` | `86df0f68` | The real attempt. 27 commits, 283 files, based on `main`@2.42.0. Claims "migration finished". |
| `origin/claude/vue3-migration-plan-9q0qC` | `86df0f68` | Identical to the above — duplicate ref, no extra work. |
| `origin/claude/vue3-quasar2-migration-rt4fb0` | `c2feb661` | Investigation notes only (one doc commit). Proposes a **Vite** rewrite. Nothing implemented. |

### 1.1 What the previous attempt got right

It is genuinely ~85% correct and was deployed at least once, so its mechanical transforms
have been exercised against a real browser. Worth keeping:

- `quasar.conf.js` → `quasar.config.js` with `configure()` from `quasar/wrappers`.
- SSR restructure: `src-ssr/index.js` + `extension.js` → `src-ssr/middlewares/{compression,api,render}.js`
  + `src-ssr/production-export.js`. This is the correct Quasar v2-CLI SSR layout and it
  preserves the BFF (`/api` mounted from `src-ssr/api`).
- `ssr.pwa: ctx.prod` — PWA in SSR **dev** causes an infinite reload loop
  (GenerateSW re-emits `service-worker.js` on every HMR poll, `skipWaiting` +
  `clientsClaim` force a refresh, the refresh triggers another build). Keep this.
- `framework.config.dark: true` — `index.template.html` hard-codes `body--dark`; without
  this the SSR markup and the client markup disagree and hydration warns.
- Env keys referenced in `src/` that are absent from `.env.*` must still be defined in
  `build.env`, otherwise webpack leaves a bare `process.env.X` in the browser bundle.
- The documented pitfalls in its `VUE3_MIGRATION_GUIDE.md` (invalid table nesting breaking
  hydration, named slots silently dropped by `<component :is>` resolving to a plain
  element, duplicate component options after a merge) are real and were paid for.

### 1.2 Flaws found — all must be fixed here

1. **Stale base.** It branches from `main`@2.42.0. `develop` is at 2.43.1 and has 16 new
   source files it has never seen (content reports, spell cards, `hk-edition-select`,
   `ViewSpell`, `debouncedSearch`). A naive merge brings them in **unmigrated**.
   It also reverts the PWA manifest description to the pre-5.5e wording and deletes every
   `.planning/` spec.
2. **Dual v-model contract.** 17 components keep *both* `value` + `@input` (Vue 2) and
   `modelValue` + `@update:modelValue` (Vue 3):
   `get() { return this.modelValue !== undefined ? this.modelValue : this.value }`.
   This permanently doubles the public API of every form component and directly violates
   "no Vue 2 in the codebase". Single Vue 3 contract only.
3. **Dependencies silently dropped.** `boot/plugins.js` loses `vuefire`, `vue-cookies`,
   `vue-croppa` and `vue-numeral-filter` with no replacement and no note. Three of those
   are in fact dead code (see §2.1) — but `vue-croppa` is *not*: it backs
   `hk-image-uploader.vue`. Dropping it is a silent feature regression.
4. **GTM behaviour change.** `enabled: process.env.NODE_ENV === "production"` where the
   Vue 2 code had `enabled: true`. Unrelated to the migration; revert to the old
   behaviour.
5. **The BFF swallows its own errors.** `try { app.use("/api", require("../api")) } catch
   (e) { console.warn(...) }` turns any bug in the API layer — a typo, a bad import —
   into a silently disabled API. The only condition that should degrade gracefully is a
   missing `firebaseServiceAccountKey.json`; everything else must throw.
6. **Lost SSR response header.** The render middleware drops
   `Access-Control-Allow-Origin: https://harmlesskey.com` that the Vue 2 server set.
7. **ESLint no longer runs during the build.** `chainWebpack` drops the
   `eslint-webpack-plugin` registration without saying so.
8. **The hand-rolled `v-shortkey` directive is wrong.** It compares
   `keys.length !== pressed.length`, attaches one `window` keydown listener *per element*,
   ignores the `prevent: ['input','textarea']` configuration it claims to replicate, and
   dispatches a native `CustomEvent` — which never reaches a `@shortkey` listener placed
   on a *component* rather than an element.
9. **The `rt4fb0` branch's Vite proposal is the wrong call here.** Vite would force a
   rewrite of the webpack-specific SSR/PWA plumbing on top of the framework migration.
   Out of scope.

**Conclusion:** the previous branch is a useful reference for the mechanical transforms,
but it is not mergeable as-is. This migration is built on `develop` and consults that
branch file-by-file rather than inheriting it wholesale.

---

## 2. Strategy

Keep the diff reviewable by attacking the problem in the order that shrinks it fastest.

### 2.1 Delete dead weight before migrating it

Three dependencies are referenced **only** in `src/boot/plugins.js` and nowhere else in
the app. They cost nothing to remove and remove themselves from the migration surface:

| Package | Real usage |
|---|---|
| `vue-cookies` | none (`$cookies` never used; Quasar's `Cookies` is used instead) |
| `vuejs-logger` | none (not even imported) |
| `vue2-flip-countdown` | none (not even imported) |

`vuefire` looks like a fourth, and it was removed as one at first — that was wrong.
Nothing imports it outside `boot/plugins.js`, but the plugin installs a `firebase()`
component option that 18 components and `mixins/HpManipulations.js` use, and templates
depend on its `.key` / `.value` record conventions. vuefire 1.x is Vue 2 only and
vuefire 3 requires the modular Firebase SDK, which `CLAUDE.md` rules out, so it is
replaced by `src/plugins/vuefire.js` — see §2.2.

`src/store/store.js` is also dead — it imports `store/modules/encounter` and
`store/modules/content`, which do not exist. Delete it.

### 2.2 Shim the wide, shallow dependencies instead of rewriting their call sites

Three Vue 2 packages have hundreds of call sites but a very narrow API surface. Replacing
the *package* with a small Vue 3 implementation of the same surface keeps 100+ files
untouched, which is the single biggest lever on reviewability.

| Package | Call sites | Replacement |
|---|---|---|
| `vue-snotify` | 150 calls in 52 files | `src/plugins/snotify.js` — provides `$snotify` over Quasar `Notify`/`Dialog`. Surface actually used: `success`, `error`, `warning`, `html`, `remove(id)`, `clear`, and options `{ timeout, buttons: [{ text, action(toast), bold }], position, closeOnClick }`. |
| `vee-validate` v3 | 43 files, 155 × `v-slot="{ errors, invalid, validated }"` | `vee-validate` v4 + two shim components in `src/components/validation/` exposing the v3 slot contract (`ValidationProvider` → `errors`/`invalid`/`validated`; `ValidationObserver` → `handleSubmit`/`valid`/`validate`/`reset`). Value is auto-detected from the slot's `v-model` vnode, exactly as v3 did. |
| `vue-shortkey` | 17 files | `src/directives/shortkey.js` — a correct `v-shortkey` directive: array and object (`{ name: keys }`) forms, one shared keydown listener, the `@shortkey` handler read off the vnode so it also works on components, and the `input`/`textarea`/`contenteditable` guard. |
| `vuefire` 1.x | 19 files | `src/plugins/vuefire.js` — the same `firebase()` component option on the Firebase v8 namespaced API, same `.key` / `.value` record shape, client-side only. |

These shims are our own Vue 3 code, not Vue 2 compatibility layers — nothing imports from
`vue2-*`, `@vue/compat`, or a Vue 2 package. Removing them in favour of the native Quasar
/ vee-validate v4 APIs is a follow-up refactor, deliberately out of scope.

**No `@vue/compat`.** The previous attempt used it as a staging step and then removed it;
going straight to plain Vue 3 avoids a whole class of "works in compat, breaks without it"
bugs.

### 2.3 Everything else is a mechanical, file-at-a-time transform

| Pattern | Sites / files | Transform |
|---|---|---|
| `slot="x"` / `slot-scope` | 441 / 126 | `<template v-slot:x="scope">` |
| `Vue.set` / `Vue.delete` (store only) | 313 / 20 | direct assignment / `delete obj[k]` — **check array vs object**, `Vue.delete(arr, i)` spliced |
| `this.$set` / `this.$delete` | 247 / 50 | `obj[key] = value` / `delete obj[key]` |
| `{{ x \| numeral(fmt) }}` | 26 | `{{ $numeral(x, fmt) }}` (global property over `numeral`) |
| `filters: {}` block | 1 | plain method |
| `:pagination.sync` / `:selected.sync` | 8 | `v-model:pagination` / `v-model:selected` |
| `beforeDestroy` / `destroyed` | 10 | `beforeUnmount` / `unmounted` |
| `::v-deep` | 39 | `:deep()` (and drop entirely in global CSS) |
| `$listeners` | 5 | merged into `$attrs`; `inheritAttrs: false` where needed |
| `$scopedSlots` | 3 | `$slots` |
| `<q-table :data>` | 17 | `:rows` |
| `process.browser` | 7 | `typeof window !== "undefined"` |
| `meta()` option | 10 | `createMetaMixin()` |
| `is="transition-group"` | 1 | `<transition-group tag="tbody">` |
| transition CSS `.x-enter`/`.x-leave` | — | `.x-enter-from`/`.x-leave-from` |
| `EventBus = new Vue({})` | 1 | `mitt()`; `$off` in `beforeUnmount` |

### 2.4 Component-library swaps

| Vue 2 | Vue 3 | Files |
|---|---|---|
| `vue-croppa` | `vue-advanced-cropper` | `hk-image-uploader.vue` + `css/styles.scss` |
| `@egjs/vue-flicking` | `@egjs/vue3-flicking` | `components/home/Feedback.vue` |
| `vue-qr` | `qrcode.vue` | `components/PlayerLink.vue` |
| `vuedraggable@2` | `vuedraggable@4` | 3 files — `v-model` replaces `:list`, `item` slot is now `#item` |
| `splitpanes@2` | `splitpanes@3` | `RunCampaign.vue`, `hk-pane.vue`, `css/splitpanes.scss` |
| `@gtm-support/vue2-gtm` | `@gtm-support/vue-gtm` | `boot/plugins.js` |

### 2.5 Build toolchain

`@quasar/app@2` → **`@quasar/app-webpack@3.15.1`**, not v4.

This is a deliberate, flagged trade-off. `@quasar/app-webpack` v4 **dropped Vuex
support entirely** (`lib/cache/module.storeProvider.js` hard-codes `pinia`), and its
generated `preFetch` wiring only injects `store` when a pinia store is present. Shieldmaiden
has 15 `preFetch({ store })` hooks and ~20 Vuex modules, so v4 would drag a full
Vuex → Pinia migration into this branch. v3.15.1 keeps webpack 5, Quasar 2.16+, Vue 3,
`vuex@4` and `preFetch({ store })` working, which is the minimal path.

**Known cost:** v3 is no longer maintained (last release Nov 2024). Moving to
`@quasar/app-webpack@4` + Pinia should be a separate follow-up; it is a store migration,
not a framework migration, and it is much safer once the app already runs on Vue 3.

Also: `vuex@3` → `vuex@4`, `vue-router@3` → `vue-router@4` (explicit dependency),
`babel-eslint` → `@babel/eslint-parser`, `eslint-plugin-vue@7` → `@9` with the
`vue3-essential` preset, `postcss@8` + `autoprefixer@10` as explicit dev deps.

### 2.6 SSR / BFF

Keep the mini-BFF intact — this is the part with API keys and it must not regress.

- `src-ssr/api/index.js` is **unchanged** (it is plain Express + firebase-admin).
- `src-ssr/middlewares/api.js` mounts it on `/api`, plus `morgan` in prod, `express.json()`,
  `x-powered-by` off. It degrades gracefully **only** when
  `firebaseServiceAccountKey.json` is missing — any other error rethrows (fixes §1.5).
- `src-ssr/middlewares/render.js` keeps the `Access-Control-Allow-Origin` header the Vue 2
  server set (fixes §1.6).
- `src-ssr/middlewares/compression.js` — prod only.
- `src-ssr/production-export.js` listens on `PORT || 3000`. The Docker `ENTRYPOINT` is
  `pm2-runtime index.js` against `dist/ssr`, which Quasar v2-CLI still emits — verify.

### 2.7 PWA

Stays `GenerateSW` + `workbox-webpack-plugin@7`, same manifest (keeping the **5.5e**
description from `develop`), same icons and shortcuts. Only change: `ssr.pwa: ctx.prod`.

---

## 3. Phases

Each phase is one or more commits and should be reviewable on its own.

| # | Phase | Contents |
|---|---|---|
| 0 | Prune | Remove the 4 dead deps and `src/store/store.js`. |
| 1 | Toolchain | `package.json`, `quasar.config.js`, `babel.config.js`, `.eslintrc.js`, `.postcssrc.js`, `jsconfig.json`. |
| 2 | SSR + PWA | `src-ssr/*` restructure. |
| 3 | Bootstrap | `store/index.js`, `router/index.js`, `boot/*`, `App.vue`, `event-bus.js`, layouts. |
| 4 | Shims | `plugins/snotify.js`, `components/validation/*`, `directives/shortkey.js`, `utils/numeral.js`. |
| 5 | Store sweep | `Vue.set`/`Vue.delete` across `src/store/`. |
| 6 | hk-components | The 30 shared `hk-*` components (single v-model contract, slots, `$attrs`). |
| 7 | Component sweep | Remaining `src/components/`, `src/views/`, `src/mixins/` — slots, `$set`, lifecycle, filters, `.sync`, `::v-deep`. |
| 8 | Library swaps | croppa, flicking, qr, draggable, splitpanes. |
| 9 | Green build | `quasar build` (SPA) + `quasar build -m ssr` + `npm run lint` clean. |
| 10 | Browser QA | dev server + built SSR server, zero console errors on every route incl. auth-gated ones. |
| 11 | PR | `feature/vue3-migration` → `develop`, CI green. |

## 4. Verification

```bash
npm run lint                     # no parsing errors, no vue/no-deprecated-*
npx quasar build                 # SPA build
npx quasar build -m ssr          # SSR build (what CI/Docker runs)
npx quasar dev -m ssr            # dev server, console clean
npm ci --dry-run                 # lockfile valid for the Docker image (npm 11)
docker build -t sm-vue3 .        # what the staging workflow does
```

Grep gates — all must return nothing over `src/`:

```
slot="  slot-scope=  $set(  $delete(  Vue.set  Vue.delete  $snotify-import
beforeDestroy  destroyed(  ::v-deep  .sync=  $scopedSlots  $listeners
process.browser  <q-table :data=  new Vue(  Vue.prototype  Vue.use(  filters:
```

Manual routes to click through with the console open (auth-gated screens are where the
previous attempt's only post-deploy bug hid): home, compendium (monsters/spells/items/
conditions/rules), user content (campaigns/encounters/npcs/players/characters/spells/
items/reminders), character builder, **run encounter**, **DM screen**, track campaign /
player view, profile, admin.

## 5. Out of scope (follow-ups)

- Vuex → Pinia and `@quasar/app-webpack` v4.
- Removing the `$snotify` / `ValidationProvider` shims in favour of native APIs.
- Composition API / `<script setup>` rewrites.
- Firebase v8 → modular (explicitly forbidden by `CLAUDE.md`).
- Any behavioural or styling change not required by the framework upgrade.
