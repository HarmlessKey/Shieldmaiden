# Vue 3 Migration — Implementation Progress

> Last updated: 2026-07-06
> Branch: `claude/vue3-migration-plan-9q0qC`

---

## Status Summary

| Phase | Status | Progress |
|---|---|---|
| Phase 0 — Pre-Migration Prep | ✅ Complete | 100% |
| Phase 1 — Core Dependency Upgrade | ✅ Complete | 100% |
| Phase 2 — Stabilize Dev Build | ✅ Complete | 100% |
| Phase 2.5 — Runtime Verification | ✅ Complete | 100% |
| Phase 3 — Component Migration (compat removal) | ✅ Complete | 100% |
| Phase 4 — SSR Re-enablement | ✅ Complete | 100% |

**THE MIGRATION IS COMPLETE.** The app runs on plain `vue@3` (no `@vue/compat`),
builds in SPA and SSR modes, server-side renders with correct meta/title tags,
and hydrates without functional mismatches.

---

## Phase 3 — Component Migration ✅

Executed with parallel agents on disjoint file sets, verified per batch with
production builds + headless-browser audits.

| Task | Status | Scope |
|---|---|---|
| Migrate `slot="x"`/`slot-scope` → `v-slot` | ✅ | 429 occurrences, 120 files |
| Remove Vue.set/Vue.delete from stores | ✅ | 149 calls, 8 modules (splice for the one array case) |
| Remove template `$set`/`$delete` | ✅ | 3 files |
| Dual-mode v-model (value/input + modelValue) | ✅ | 16 components; 8 display-only components identified and skipped |
| `defineAsyncComponent` for async registrations | ✅ | boot file + 5 components + Drawer dynamic loader |
| WATCH_ARRAY: `deep: true` where mutated in place | ✅ | 3 watchers (evidence-based); rest verified safe |
| Transition classes → `-from` suffixes | ✅ | 1 file (old estimate of 58 was stale) |
| `render(c)` router passthroughs → `h(RouterView)` | ✅ | 36 in routes.js |
| Vue 2 `is=` attribute fixes | ✅ | App.vue, character-descriptions, Initiative (transition-group), Players (dynamic component + slot restructure) |
| Replace Vue 2-only vue-qr with qrcode.vue | ✅ | PlayerLink.vue |
| Remove @vue/compat + alias + boot file | ✅ | app runs on standard vue@3 |

**Deliberate deviation:** the original plan's "convert ~300 files to Composition
API" and "mixins → composables" items were dropped. Options API and mixins are
fully supported in Vue 3; converting them is not required to complete the
migration and would add regression risk with no functional gain. Convert
incrementally later if desired.

---

## Phase 4 — SSR Re-enablement ✅

| Task | Status | Details |
|---|---|---|
| Rewrite src-ssr for @quasar/app-webpack v3 | ✅ | middlewares/render, compression, api + production-export.js |
| Port /api express routes | ✅ | fail-soft when firebaseServiceAccountKey.json missing |
| Boot files server-enabled | ✅ | plugins/hk-components/vee-validate/vue-shortkey run on server; GTM client-guarded; firebase-auth client-only |
| SSR dev mode works | ✅ | `quasar dev -m ssr` renders real content |
| Hydration mismatches fixed | ✅ | Quasar dark config (body--dark), SSR-stable useId for vee-validate field names, invalid `<thead>`/`<tr>` HTML nesting in 7 files |
| Quasar Meta plugin restored | ✅ | v1 `meta()` option → `createMetaMixin`; titles/OG/canonical render server-side again (was silently broken since Phase 1) |
| Runtime template compiler enabled | ✅ | `build.vueCompiler: true` for character-descriptions.vue |
| Production SSR build + server | ✅ | `quasar build -m ssr` succeeds; server boots, renders, serves PWA |

**Known cosmetic issue:** Quasar QField auto-generated `id`/`for` attributes
log check-only hydration notices in dev (ids are added client-side by design
in Quasar's useId). No functional impact; silent in production.

---

## Phase 2.5 — Runtime Verification ✅

Headless-browser audit of 10+ public routes (see `.planning/VERIFICATION_REPORT.md`).
8 runtime bugs found and fixed: dotenv fallback never firing (app failed to boot),
missing env-key defaults, `Cookies.parseSSR` in SPA mode, `modelValue` prop/computed
collision in hk-input/hk-select, vee-validate Field crash on unnamed inputs, leftover
`$root.$on`/`$emit` event-bus usage (6 files), Vue 2 build of vue-flicking replaced
with `@egjs/vue3-flicking`, and QTable `data` → `rows` rename (18 occurrences).
Result: all audited routes render with zero console errors; production build passes.

---

## Phase 0 — Pre-Migration Prep ✅

All completed on Vue 2 before the dependency swap.

| Task | Status | Details |
|---|---|---|
| Remove template filters | ✅ | 381 usages in 154 files converted to function calls |
| Replace event bus (mitt) | ✅ | `new Vue()` → `mitt`, 5 consumer files updated |
| Replace vue-cookies | ✅ | Switched to Quasar `Cookies` plugin |
| Validate Vue 2 build | ✅ | App builds and runs on Vue 2 |

---

## Phase 1 — Core Dependency Upgrade ✅

**Commit:** `c199ad9` — "Phase 1: Core dependency upgrade — Vue 3 + Quasar v2 + compat mode"

| Task | Status | Files Changed |
|---|---|---|
| Upgrade package.json dependencies | ✅ | `package.json` |
| Rename & rewrite quasar config | ✅ | `quasar.conf.js` → `quasar.config.js` |
| Create compat boot file | ✅ | `src/boot/compat.js` (new) |
| Rewrite store for Vuex 4 | ✅ | `src/store/index.js` |
| Rewrite router for Vue Router 4 | ✅ | `src/router/index.js` |
| Update boot files (Vue → app) | ✅ | `src/boot/plugins.js`, `src/boot/hk-components.js`, `src/boot/firebase-auth.js` |
| Disable incompatible plugins | ✅ | vee-validate, vue-shortkey, vue-snotify disabled in config |
| Fix process.browser references | ✅ | `src/App.vue`, `src/functions.js`, `src/store/modules/tips.js`, `src/store/modules/general.js`, `src/components/PlayerLink.vue`, `src/components/hk-components/hk-share-button.vue` |
| Fix `<template v-for>` key placement | ✅ | 22 files — key moved from child to `<template>` tag |
| Remove dotenv from client bundle | ✅ | `src/services/patreon.js` |
| Fix browserslist | ✅ | `package.json` — removed "maintained node versions" |
| Update ESLint config | ✅ | `.eslintrc.js` |
| SPA dev server boots | ✅ | `http://localhost:8080/` — deprecation warnings only |

### Issues Resolved During Phase 1

| Issue | Root Cause | Fix |
|---|---|---|
| Cannot find module 'autoprefixer' | Missing devDependency after CLI upgrade | `npm install --save-dev autoprefixer` |
| Cannot find module 'postcss' | Peer dependency of autoprefixer | `npm install --save-dev postcss` |
| webpack chunk format error | `browserslist` included "maintained node versions" | Removed entry from package.json |
| Cannot find module 'webpack' | Nested in `@quasar/app-webpack`, not at root | `npm install --save-dev webpack` |
| Cannot find '@quasar/babel-preset-app' | Was bundled with old `@quasar/app` | `npm install --save-dev @quasar/babel-preset-app` |
| dotenv Module not found (path, os, crypto) | webpack 5 doesn't polyfill Node built-ins | Removed dotenv require from patreon.js |
| VueCompilerError: template v-for key | Vue 3 requires key on `<template>` tag | Moved `:key` in 22 files |

---

## Phase 2 — Stabilize Dev Build ✅

| Task | Status | Scope |
|---|---|---|
| Replace `.sync` → `v-model:` | ✅ | 6 files |
| Fix `::v-deep` → `:deep()` | ✅ | 38 files |
| Replace `beforeDestroy` → `beforeUnmount` | ✅ | 6 files |
| Replace `destroyed` → `unmounted` | ✅ | 2 files |
| Remove `.native` event modifier | ✅ | 1 file |
| Replace `$scopedSlots` → `$slots` | ✅ | 3 files |
| Remove `$listeners` / fix `$attrs` | ✅ | 3 files |
| Replace vue-snotify → Quasar Notify/Dialog | ✅ | 46 files + 1 utility |
| Replace vue-shortkey → custom directive | ✅ | 2 files |
| Replace vue-croppa → vue-advanced-cropper | ✅ | 1 file |
| Upgrade vuedraggable v2 → v4 | ✅ | 2 files |
| Upgrade splitpanes v2 → v3 | ✅ | package.json |
| Re-add GTM (Vue 3 version) | ✅ | 1 boot file |
| Remove vue2-flip-countdown | ✅ | package.json |
| Verify @egjs/vue-flicking | ✅ | Already v3-compatible |
| Migrate vee-validate v3 → v4 | ✅ | Boot file + 48 template files |
| Remove `$set`/`$delete`/`Vue.set`/`Vue.delete` | ✅ | All occurrences removed |

---

## Phase 3 — Component Migration 🔲

| Task | Status | Scope |
|---|---|---|
| Migrate v-model on components | 🔲 | 583 occurrences, 153 files |
| Migrate render(h) functions | 🔲 | 9 files |
| Fix transition class names | 🔲 | 58 files |
| Convert hk-components to Composition API | 🔲 | 28 files |
| Convert mixins to composables | 🔲 | 17 mixins, 112 consumers |
| Convert remaining components | 🔲 | ~300 files |
| Disable all compat flags | 🔲 | configureCompat() |
| Remove @vue/compat | 🔲 | Final step |

---

## Phase 4 — SSR Re-enablement 🔲

| Task | Status | Scope |
|---|---|---|
| Rewrite src-ssr/ for Quasar v2 | 🔲 | src-ssr/index.js, extension.js |
| Test SSR mode | 🔲 | `quasar dev -m ssr` |
| Fix hydration mismatches | 🔲 | TBD |
| Verify preFetch hooks | 🔲 | 15 components |
| Validate PWA | 🔲 | Service worker, offline |

---

## Known Deprecation Warnings (Expected)

These appear in the console during dev and are expected while in compat mode:

- `v-model` component binding (value/input) — fix in Phase 3
- Slot syntax warnings from Quasar components — cosmetic, resolved when compat removed
