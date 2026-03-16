# Vue 3 Migration — Implementation Progress

> Last updated: 2026-03-16
> Branch: `claude/vue3-migration-plan-9q0qC`

---

## Status Summary

| Phase | Status | Progress |
|---|---|---|
| Phase 0 — Pre-Migration Prep | ✅ Complete | 100% |
| Phase 1 — Core Dependency Upgrade | ✅ Complete | 100% |
| Phase 2 — Stabilize Dev Build | 🔲 Not Started | 0% |
| Phase 3 — Component Migration | 🔲 Not Started | 0% |
| Phase 4 — SSR Re-enablement | 🔲 Not Started | 0% |

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

## Phase 2 — Stabilize Dev Build 🔲

| Task | Status | Scope |
|---|---|---|
| Fix Quasar v1→v2 component API changes | 🔲 | Audit all Quasar components |
| Replace vue-snotify → Quasar Notify/Dialog | 🔲 | 139 calls, 46 files |
| Replace vee-validate v3 → v4 | 🔲 | Complete API rewrite |
| Replace vue-shortkey | 🔲 | Custom directive or @vueuse |
| Replace vue-croppa | 🔲 | vue-advanced-cropper or similar |
| Fix ::v-deep → :deep() | 🔲 | 41 occurrences, 38 files |
| Upgrade splitpanes to v3 | 🔲 | 1 dependency |
| Upgrade vuedraggable to v4 | 🔲 | 1 dependency |
| Re-add GTM (Vue 3 version) | 🔲 | 1 boot file |
| Replace vue2-flip-countdown | 🔲 | 1 component |
| Verify @egjs/vue-flicking | 🔲 | Import path check |

---

## Phase 3 — Component Migration 🔲

| Task | Status | Scope |
|---|---|---|
| Remove $set/$delete calls | 🔲 | 510 calls, ~70 files |
| Migrate v-model on components | 🔲 | 583 occurrences, 153 files |
| Remove $listeners usage | 🔲 | 5 files |
| Remove $scopedSlots usage | 🔲 | 3 files |
| Remove .native modifier | 🔲 | 1 file |
| Replace .sync with v-model:prop | 🔲 | 7 files |
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

## Disabled Features (to re-enable in Phase 2)

These boot files/plugins are currently disabled to allow the dev server to boot:

| Plugin | Boot File | Replacement Strategy |
|---|---|---|
| vee-validate v3 | `src/boot/vee-validate.js` | Upgrade to v4 (composition API) |
| vue-shortkey | `src/boot/vue-shortkey.js` | Custom directive or @vueuse |
| vue-snotify | `src/boot/vue-snotify.js` | Quasar Notify + Dialog |
| vue-croppa | (in plugins.js) | vue-advanced-cropper |
| GTM (vue2-gtm) | (in plugins.js) | @gtm-support/vue-gtm@^2 |
| vuefire | (in plugins.js) | Removed — was never used |

---

## Known Deprecation Warnings (Expected)

These appear in the console during dev and are expected while in compat mode:

- `::v-deep` usage (41 files) — fix in Phase 2
- `$set` / `$delete` usage — fix in Phase 3
- `v-model` component binding (value/input) — fix in Phase 3
- Slot syntax warnings from Quasar components — fix in Phase 2
- Various HTML structure warnings from Quasar v2 — fix in Phase 2
