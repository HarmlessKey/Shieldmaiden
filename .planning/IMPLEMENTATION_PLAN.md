# Vue 3 Migration — Implementation Plan

## Overview

Migrate Shieldmaiden (D&D Combat Tracker) from Vue 2 + Quasar v1 to Vue 3 + Quasar v2, using `@vue/compat` as a bridge. The migration is split into 4 phases.

---

## Phase 0 — Pre-Migration Prep (on Vue 2) ✅ COMPLETE

All changes made while still on Vue 2 to ensure compatibility before the big swap.

### 0.1 Remove Template Filters
- **381 occurrences in 154 files** — filters have zero support in `@vue/compat`
- Converted all `{{ value | filterName }}` to `{{ filterName(value) }}`
- Created `src/utils/filters.js` exporting each filter as a plain function
- Removed `vue-numeral-filter` dependency

### 0.2 Replace Event Bus
- Replaced `src/event-bus.js` (`new Vue()`) with `mitt`
- Updated 5 consumer files: `$emit` → `emit`, `$on` → `on`, `$off` → `off`

### 0.3 Replace vue-cookies
- Removed `vue-cookies` dependency
- Replaced `this.$cookies` calls with Quasar `Cookies` plugin

### 0.4 Validate
- Confirmed app still builds and runs on Vue 2 after all Phase 0 changes

---

## Phase 1 — Core Dependency Upgrade ✅ COMPLETE

The "big swap" — get `quasar dev` to boot on Vue 3 + compat mode.

### 1.1 Package Changes
**Removed:** `@gtm-support/vue2-gtm`, `vuefire`, `vuejs-logger`, `@quasar/app`, `babel-eslint`, `eslint-webpack-plugin`

**Added:** `@vue/compat@^3.3`, `vue-router@^4.2`, `autoprefixer`, `postcss`, `webpack`, `@quasar/babel-preset-app`

**Upgraded:** `vue@^3.3`, `quasar@^2.14`, `vuex@^4.1`, `@quasar/app-webpack@^3`, `@babel/eslint-parser@^7.23`, `eslint-plugin-vue@^9`

### 1.2 Quasar Config
- Renamed `quasar.conf.js` → `quasar.config.js`
- Rewrote using `configure()` wrapper from `quasar/wrappers`
- Added `chainWebpack` alias: `vue` → `@vue/compat`
- Disabled incompatible boot files: `vee-validate`, `vue-shortkey`, `vue-snotify`

### 1.3 Vue 3 Compat Mode
- Created `src/boot/compat.js` with `configureCompat({ MODE: 2, INSTANCE_EVENT_EMITTER: false })`

### 1.4 Store (Vuex 3 → 4)
- Rewrote `src/store/index.js` using `store()` wrapper and `createStore()`
- All 18 modules unchanged

### 1.5 Router (Vue Router 3 → 4)
- Rewrote `src/router/index.js` using `route()` wrapper, `createRouter()`, `createWebHistory()`
- Replaced `Notify.create()` for offline detection (was using vue-snotify)

### 1.6 Boot Files
- `src/boot/plugins.js`: `({ Vue })` → `({ app })`, `Vue.use()` → `app.use()`, removed vuefire
- `src/boot/hk-components.js`: All 26 `Vue.component()` → `app.component()`
- `src/boot/firebase-auth.js`: Removed `Vue` from destructured params

### 1.7 Code Fixes
- `src/App.vue`: Replaced `<q-no-ssr>`, `destroyed()` → `unmounted()`, removed `$forceUpdate()`
- `process.browser` → `typeof window !== "undefined"` in 5 files
- `<template v-for>` key placement fixed in 22 files (Vue 3 requires key on `<template>`)
- Removed `dotenv` import from `src/services/patreon.js` (webpack 5 doesn't polyfill Node builtins)
- Fixed `browserslist` in package.json (removed `"maintained node versions"`)

### 1.8 ESLint
- Updated `.eslintrc.js`: `@babel/eslint-parser`, `plugin:vue/vue3-essential`

### 1.9 Validation
- SPA dev server boots at `http://localhost:8080/`
- Only deprecation warnings (expected in compat mode), no errors

---

## Phase 2 — Stabilize the Dev Build

With the dev server booting, fix remaining issues and re-enable disabled plugins.

### 2.1 Fix Quasar v1 → v2 Component API Changes
- Audit Quasar components against v2 docs (prop/event name changes)
- Key areas: `<q-no-ssr>` (removed), slot syntax changes, component prop renames
- Follow [Quasar v1→v2 upgrade guide](https://quasar.dev/start/upgrade-guide)

### 2.2 Replace vue-snotify with Quasar Notify + Dialog
- **139 `$snotify` calls across 46 files**
- Simple notifications → `Notify.create()` (Quasar plugin)
- Confirmation dialogs (`$snotify.confirm`) → `Dialog.create()` (Quasar plugin)
- Pattern mapping:
  - `$snotify.success(msg, title)` → `Notify.create({ message: msg, type: 'positive' })`
  - `$snotify.error(msg, title)` → `Notify.create({ message: msg, type: 'negative' })`
  - `$snotify.confirm(msg, title, { buttons })` → `Dialog.create({ title, message: msg, cancel: true })`

### 2.3 Replace vee-validate v3 → v4
- Complete API rewrite: `<ValidationObserver>` / `<ValidationProvider>` → `useForm()` / `useField()` composition API
- Or use `<Form>` / `<Field>` component wrappers from vee-validate v4
- Migrate validation rules

### 2.4 Replace vue-shortkey
- Replace with custom Vue 3 directive or `@vueuse/core` keyboard utilities

### 2.5 Replace vue-croppa
- Replace with `vue-advanced-cropper` or similar Vue 3 compatible cropper

### 2.6 Fix SCSS / CSS Issues
- Update `::v-deep` (41 files, 38 unique) to `:deep()` syntax
- Check Quasar v2 SCSS variable changes

### 2.7 Upgrade Other Plugins
- `splitpanes@^2` → `splitpanes@^3` (Vue 3 native)
- `vuedraggable@^2` → `vuedraggable@^4` (Vue 3 support)
- `@gtm-support/vue2-gtm` → `@gtm-support/vue-gtm@^2` (already removed, re-add Vue 3 version)
- `vue2-flip-countdown` → `vue3-flip-countdown`
- `@egjs/vue-flicking` → verify import path (`@egjs/vue3-flicking`)

---

## Phase 3 — Incremental Component Migration

Convert from Options API + compat shims to Vue 3 native patterns.

### 3.1 Migration Order
1. **`src/components/hk-components/`** (28 files) — shared UI primitives, maximum impact
2. **`src/mixins/`** (17 files → composables) — convert each mixin to a `use*()` composable, update 112 consuming files
3. **`src/components/`** — work through subdirectories, leaf components first
4. **`src/views/`** — migrate views (mainly compose other components)
5. **`src/layouts/`** (7 files) — migrate alongside views

### 3.2 Remove Vue 2 Patterns
- `this.$set()` / `Vue.set()` → direct assignment (406 occurrences, 59 files)
- `this.$delete()` / `Vue.delete()` → `delete obj.prop` (104 occurrences, 36 files)
- `$listeners` → `$attrs` (5 files)
- `$scopedSlots` → `$slots` (3 files)
- `.native` modifier → remove (1 file)
- `.sync` modifier → `v-model:propName` (7 files)
- `v-model` on components: `value`/`input` → `modelValue`/`update:modelValue` (583 occurrences)
- `render(h)` → `import { h } from 'vue'` (9 files)
- Transition class names: `v-enter` → `v-enter-from` (58 files)

### 3.3 Disable Compat Flags Incrementally
As each pattern is fully migrated, disable its compat shim:
```js
configureCompat({
  MODE: 2,
  INSTANCE_SET: false,           // after removing all $set
  INSTANCE_DELETE: false,        // after removing all $delete
  COMPONENT_V_MODEL: false,     // after migrating v-model
  INSTANCE_LISTENERS: false,    // after removing $listeners
  INSTANCE_SCOPED_SLOTS: false, // after removing $scopedSlots
  RENDER_FUNCTION: false,       // after migrating render(h)
  // ... etc
});
```

When all flags are `false`, remove `@vue/compat` entirely.

### 3.4 Vuex → Pinia (Optional)
- Only after compat layer is fully removed
- Vuex 4 works fine with Vue 3; Pinia is preferred but not urgent

---

## Phase 4 — SSR Re-enablement

### 4.1 Update src-ssr/ Files
- Quasar v2 has different SSR architecture
- Rewrite `src-ssr/index.js` and `src-ssr/extension.js` for Quasar v2

### 4.2 Test SSR Mode
- `quasar dev -m ssr`
- Fix hydration mismatches
- Verify preFetch hooks (15 components)

### 4.3 PWA Validation
- Test service worker registration
- Verify offline capabilities

---

## Codebase Scale Reference

| Metric | Count |
|---|---|
| `.vue` files | 359 |
| Mixins | 17 (used in 112 files) |
| Vuex store modules | 17 |
| Boot files | 6 |
| Global component registrations | 34 |
| preFetch hooks | 15 |
| Template filter usages (removed) | 381 in 154 files |
| `$snotify` calls (to replace) | 139 in 46 files |
| `$set`/`$delete` calls (to remove) | 510 in ~70 files |
| `v-model` on components (to update) | 583 in 153 files |
