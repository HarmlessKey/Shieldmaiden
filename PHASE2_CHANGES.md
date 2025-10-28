# Phase 2: Core Framework Update - Dependency Changes

## Date: 2025-10-28

## Summary
Updated package.json to migrate from Vue 2/Quasar 1 to Vue 3/Quasar 2.

## Core Framework Updates

### Vue Ecosystem
- **vue**: `~2.7.16` → `^3.4.0` ✅
- **vue-router**: (implicit v3) → `^4.4.0` ✅ (explicitly added)
- **vuex**: `^3.0.1` → `^4.1.0` ✅
- **pinia**: (new) → `^2.2.0` ✅ (alternative to Vuex, optional)

### Quasar Framework
- **quasar**: `^1.0.0` → `^2.16.0` ✅
- **@quasar/extras**: `^1.16.12` → `^1.16.12` (no change, compatible)

### Build Tools
- **@quasar/app**: `~2.4.3` → REMOVED ❌
- **@quasar/app-vite**: (new) → `^2.0.0` ✅
- **vite**: (new) → `^5.0.0` ✅
- **@vitejs/plugin-vue**: (new) → `^5.0.0` ✅

## Vue 3 Compatible Plugin Updates

### Successfully Updated
- **vuefire**: `^1.4.5` → `^3.1.0` ✅
- **vuedraggable**: `^2.24.3` → `^4.1.0` ✅
- **vee-validate**: `^3.4.14` → `^4.13.0` ✅
- **@gtm-support/vue2-gtm**: `^1.3.0` → **@gtm-support/vue-gtm** `^3.0.0` ✅
- **@egjs/vue-flicking**: `^4.12.0` → `^4.12.0` (already compatible)

### Replaced Plugins
- **vue-qr**: `^4.0.9` → **qrcode.vue** `^3.4.1` ✅
- **vue-numeral-filter**: `^2.2.0` → **numeral** `^2.0.6` ✅ (direct use)
- **vue-cookies**: `^1.8.4` → REMOVED (use Quasar Cookies instead)
- **vue-snotify**: `^3.2.1` → REMOVED (use Quasar Notify instead)

### Removed (Need Implementation)
- **vue-croppa**: `^1.3.8` → REMOVED ❌ (need Vue 3 alternative)
- **vue-shortkey**: `^3.1.7` → REMOVED ❌ (need alternative)
- **vue2-flip-countdown**: `^0.12.1` → REMOVED ❌ (need alternative)

### New Additions
- **mitt**: `^3.0.1` ✅ (event bus replacement for $on/$off/$once)

## Firebase Updates
- **firebase**: `^8.0.0` → `^10.13.0` ✅ (modular SDK)
- **firebase-admin**: `^13.4.0` → `^13.4.0` (no change, compatible)

## DevDependencies Updates

### Build Tools
- **babel-eslint**: `^10.0.1` → REMOVED (replaced by modern ESLint parser)
- **eslint-webpack-plugin**: `^2.4.0` → REMOVED (not needed with Vite)
- **workbox-webpack-plugin**: `^6.5.3` → **workbox-build** `^7.0.0` ✅

### Linting
- **eslint**: `^7.21.0` → `^8.57.0` ✅
- **eslint-config-prettier**: `^8.1.0` → `^9.1.0` ✅
- **eslint-plugin-vue**: `^7.7.0` → `^9.0.0` ✅ (Vue 3 compatible)

### Unchanged
- **@types/sanitize-html**: `^2.11.0` (compatible)
- **husky**: `^8.0.2` (compatible)
- **prettier**: `^3.3.3` (compatible)

## Breaking Changes Introduced

### 1. Vue 3 Global API Changes
All boot files need updates from `Vue.use()` to `app.use()`.

### 2. Vue Router 4 API Changes
Router creation changed from `new VueRouter()` to `createRouter()`.

### 3. Vuex 4 API Changes
Store creation changed from `new Vuex.Store()` to `createStore()`.

### 4. Firebase Modular SDK
All Firebase imports and methods need migration to modular format.

### 5. VeeValidate 4 Major API Changes
Complete rewrite - all validation components need migration.

### 6. Quasar Config File
`quasar.conf.js` needs migration to `quasar.config.js` with Vite-specific config.

## Plugins Needing Manual Implementation

### vue-croppa → Alternative Needed
- **Options**: vue-advanced-cropper, cropperjs
- **Files affected**: Search for Croppa usage
- **Priority**: Medium

### vue-shortkey → Alternative Needed
- **Options**: @vueuse/core (useEventListener), custom implementation
- **Files affected**: Search for v-shortkey directive
- **Priority**: High (keyboard shortcuts)

### vue2-flip-countdown → Alternative Needed
- **Options**: Find Vue 3 countdown component or build custom
- **Files affected**: Search for flip-countdown usage
- **Priority**: Low

### vue-numeral-filter → Convert to Helper
- Filters removed in Vue 3
- Use direct numeral() calls or create helper methods
- **Files affected**: All templates using `| numeral` filter
- **Priority**: High

### vue-snotify → Use Quasar Notify
- Replace all $snotify calls with Quasar $q.notify
- **Files affected**: Search for $snotify usage
- **Priority**: High

## Next Steps

1. ✅ Update package.json (COMPLETED)
2. ⏳ Install dependencies (`npm install`)
3. ⏳ Migrate `quasar.conf.js` → `quasar.config.js`
4. ⏳ Update boot files for Vue 3 API
5. ⏳ Update router for Vue Router 4
6. ⏳ Update store for Vuex 4
7. ⏳ Test compilation
8. ⏳ Fix compilation errors

## Rollback
Backup files created:
- `package.json.vue2.backup`
- `quasar.conf.js.backup`

To rollback:
```bash
cp package.json.vue2.backup package.json
rm -rf node_modules package-lock.json
npm install
```

## Notes
- Using Vite instead of Webpack for faster builds and HMR
- Pinia added as modern alternative to Vuex (can migrate gradually)
- Event bus pattern replaced with mitt library
- Some plugins removed completely - need alternatives
