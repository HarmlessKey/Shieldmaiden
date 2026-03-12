# Shieldmaiden Vue 3 Migration Plan

## Goal

Get the dev server running on Vue 3 (via `@vue/compat` compatibility mode) with Quasar v2 so we can begin testing for breaking changes and incrementally migrate components to the Composition API.

This is **not** a production-ready upgrade. It is the smallest step forward that swaps the core framework dependencies and produces a bootable dev environment.

---

## Current Stack Snapshot

| Dependency | Current Version | Target Version |
|---|---|---|
| `vue` | ~2.7.16 | ^3.3 + `@vue/compat` ^3.3 |
| `quasar` | ^1.0.0 | ^2.14 |
| `@quasar/app` (dev) | ~2.4.3 | **removed** — replaced by `@quasar/app-webpack` ^3.13 or `@quasar/app-vite` ^2 |
| `vuex` | ^3.0.1 | ^4.1 (Vuex 4 for Vue 3) |
| `vue-router` | (bundled by Quasar v1 CLI) | ^4.2 (Vue Router 4) |
| `vee-validate` | ^3.4.14 | ^4.13 (complete rewrite for Vue 3) |
| `firebase` | ^8.0.0 | ^8.0.0 (keep — modular v9+ is a separate migration) |
| `eslint-plugin-vue` | ^7.7.0 | ^9 |
| `@quasar/extras` | ^1.16.12 | ^1.16 (compatible) |

### Codebase Scale

- **359 `.vue` files** across components, views, and layouts
- **17 mixins** (used in 112 files / 31% of components)
- **17 Vuex store modules**
- **6 boot files** with 10 `Vue.use()` calls and 34 `Vue.component()` registrations
- **SSR mode** with Express server (`src-ssr/`)
- **preFetch** hooks in 15 components/layouts
- **PWA** support enabled

---

## Vue 2 Patterns Audit — Migration Impact

### Critical (will cause build/runtime errors)

| Pattern | Occurrences | Files | Vue 3 Change |
|---|---|---|---|
| `Vue.set()` / `this.$set()` | 406 | 59 | **Removed** — Vue 3 reactivity doesn't need it. `@vue/compat` shims it, but every call is a deprecation warning. |
| `Vue.delete()` / `this.$delete()` | 104 | 36 | **Removed** — use `delete obj.prop`. Shimmed in compat. |
| Template filters (`\| filterName`) | 381 | 154 | **Removed entirely** — must convert to method calls or computed properties. Filters are **not supported** even in compat mode. |
| `Vue.use()` plugin registration | 10 | 5 | **Changed** — must use `app.use()` on the app instance instead. |
| `Vue.component()` global registration | 34 | 3 | **Changed** — must use `app.component()`. |
| Event Bus (`new Vue()` as bus) | 1 bus + 5 consumers | 6 | **Removed** — `$on`, `$off`, `$once` removed from instances. Replace with `mitt` or `tiny-emitter`. |
| `$listeners` | 5 | 5 | **Removed** — merged into `$attrs` in Vue 3. |
| `$scopedSlots` | 4 | 3 | **Removed** — unified with `$slots` in Vue 3. |
| `.native` modifier | 2 | 1 | **Removed** — all events pass through by default in Vue 3. |
| `.sync` modifier | 8 | 7 | **Removed** — replaced by `v-model:propName`. |
| `$forceUpdate` | ~1 | 1 | **Removed** — should not be needed with Vue 3 reactivity. |
| `destroyed` lifecycle hook | used in App.vue+ | multiple | **Renamed** to `unmounted`. Shimmed in compat. |

### Moderate (deprecation warnings but functional in compat mode)

| Pattern | Occurrences | Files | Vue 3 Change |
|---|---|---|---|
| `this.$store` direct access | 96 | 87 | Works with Vuex 4 but `useStore()` is the Vue 3 way. |
| `mapGetters/mapActions/mapState` | 651 | 201 | Works with Vuex 4 Options API. Will need conversion for Composition API later. |
| `v-model` on components | 583 | 153 | Breaking: `value` prop + `input` event changed to `modelValue` + `update:modelValue`. Compat shims this. |
| `::v-deep` / `/deep/` / `>>>` | 41 | 38 | **Deprecated** — use `:deep()` pseudo-selector. |
| `beforeRouteEnter/Leave/Update` | usage | 6 | Available in Vue Router 4 Options API, but signature changes slightly. |
| `preFetch` (Quasar feature) | usage | 15 | Quasar v2 still supports `preFetch` — no change needed. |
| Render functions `render(h)` | 31 | 9 | `h` is no longer passed as argument — must be imported from `vue`. Compat shims this. |
| Mixins | 17 files | 112 users | Still work in Vue 3, but are deprecated in favor of composables. |
| `transition` / `transition-group` | 161 | 58 | Mostly compatible, but class names changed (`v-enter` → `v-enter-from`). |

### Low Risk (compatible or trivial)

| Pattern | Occurrences | Notes |
|---|---|---|
| `this.$emit` | 84 | Works in Vue 3. |
| `this.$refs` | 49 | Works in Vue 3. |
| `$attrs` | 9 | Now includes listeners too — broader scope. |
| `v-slot` / slot syntax | 361 | Fully compatible. |
| `$route` / `$router` | many | Available in Options API with Vue Router 4. |

---

## Third-Party Plugin Compatibility Matrix

Each plugin must either have a Vue 3 version, be replaceable, or be dropped.

| Plugin | Current | Vue 3 Compatible? | Migration Path |
|---|---|---|---|
| **`vuefire`** | ^1.4.5 | **No** — v1 is Vue 2 only | Upgrade to `vuefire@^3` (complete rewrite using composables). **Defer** — disable for initial boot. |
| **`vee-validate`** | ^3.4.14 | **No** — v3 is Vue 2 only | Upgrade to `vee-validate@^4` (composition API based). **Defer** — disable for initial boot. |
| **`vue-snotify`** | ^3.2.1 | **No** — Vue 2 only | Replace with Quasar `Notify` (already in use) or a Vue 3 toast library. **Defer.** |
| **`vue-shortkey`** | ^3.1.7 | **No** — Vue 2 only, unmaintained | Replace with a Vue 3 alternative or custom directive. **Defer.** |
| **`vue-croppa`** | ^1.3.8 | **No** — Vue 2 only, unmaintained | Replace with `vue-advanced-cropper` or similar. **Defer.** |
| **`vue-cookies`** | ^1.8.4 | **No** — uses `Vue.use()` | Replace with Quasar `Cookies` plugin (already available). **Easy.** |
| **`vue-numeral-filter`** | ^2.2.0 | **No** — Vue 2 filter plugin | Replace with direct `numeral` usage in methods/computed. **Easy.** |
| **`vue2-flip-countdown`** | ^0.12.1 | **No** — Vue 2 only by name | Replace with `vue3-flip-countdown` or equivalent. **Defer.** |
| **`vuedraggable`** | ^2.24.3 | **No** — v2 is Vue 2 only | Upgrade to `vuedraggable@^4` (Vue 3 support) or `vuedraggable@next`. **Defer.** |
| **`splitpanes`** | ^2.4.1 | **Partial** — v2 supports Vue 2 | Upgrade to `splitpanes@^3` (Vue 3 native). **Easy.** |
| **`vue-qr`** | ^4.0.9 | **Yes** — v4 supports Vue 3 | Keep. May need minor import adjustments. |
| **`@egjs/vue-flicking`** | 4.12.0 | **Yes** — v4 has Vue 3 support | Keep. Check import path (`@egjs/vue3-flicking`). |
| **`@gtm-support/vue2-gtm`** | ^2.0.0 | **No** — Vue 2 specific | Switch to `@gtm-support/vue-gtm@^2` (Vue 3). **Easy.** |
| **`vuejs-logger`** | ^1.10.2 | **No** — unmaintained | Drop or replace with `console` wrappers. **Trivial.** |
| **`marked`** | ^4.0.16 | Framework-agnostic | Keep as-is. |
| **`axios`** | ^1.7.0 | Framework-agnostic | Keep as-is. |
| **`lodash`** | ^4.17.21 | Framework-agnostic | Keep as-is. |
| **`firebase`** | ^8.0.0 | Framework-agnostic | Keep as-is (compat SDK). Modular v9 migration is separate. |

---

## Migration Strategy: Phased Approach

### Phase 0 — Pre-Migration Prep (on current Vue 2)

Before touching any dependency, prepare the codebase while it still builds and runs:

#### 0.1 Remove Template Filters (381 occurrences in 154 files)

**This is the single largest mandatory change.** Filters are the one Vue 2 feature that has **zero support** in `@vue/compat` — they will cause hard parse errors.

Every template expression like:
```html
{{ value | capitalize }}
{{ amount | numeral('0,0') }}
```
Must become:
```html
{{ capitalize(value) }}
{{ formatNumber(amount, '0,0') }}
```

**Approach:**
1. Audit all unique filter names in the codebase (likely from `vue-numeral-filter` and custom filters in mixins).
2. Create a `src/utils/filters.js` module exporting each filter as a plain function.
3. Systematically replace template filter pipes with method/function calls.
4. Remove `vue-numeral-filter` from boot and dependencies; import `numeral` directly in the utility module.

#### 0.2 Replace Event Bus

Replace `src/event-bus.js` (`new Vue()`) with `mitt`:
```bash
npm install mitt
```
```js
// src/event-bus.js
import mitt from 'mitt';
export const EventBus = mitt();
```
Update 5 consumer files to use `EventBus.emit()` / `EventBus.on()` instead of `EventBus.$emit()` / `EventBus.$on()`.

#### 0.3 Replace `vue-cookies` with Quasar Cookies

The Quasar `Cookies` plugin is already registered and imported in several files. Remove the `vue-cookies` dependency and replace any `this.$cookies` calls with `Cookies` from `quasar`.

#### 0.4 Verify and Commit

Ensure the app still builds and runs on Vue 2 after these changes. This is a critical checkpoint — all Phase 0 work must be validated against the existing stack.

---

### Phase 1 — Core Dependency Upgrade (The Big Swap)

This is the phase that gets `quasar dev` to boot on Vue 3 + compat mode.

#### 1.1 Upgrade Quasar CLI

Replace the Quasar v1 CLI with v2 CLI (webpack variant for minimal change):

```bash
npm remove @quasar/app
npm install --save-dev @quasar/app-webpack@^3
```

#### 1.2 Upgrade Core Dependencies

```bash
npm install vue@^3.3 @vue/compat@^3.3
npm install quasar@^2.14
npm install vue-router@^4.2 vuex@^4.1
npm install @quasar/extras@^1.16
```

#### 1.3 Configure `@vue/compat`

In `quasar.config.js` (renamed from `quasar.conf.js` for Quasar v2):

```js
// quasar.config.js
const { configure } = require('quasar/wrappers');

module.exports = configure(function (/* ctx */) {
  return {
    build: {
      vueRouterMode: 'history',

      // Enable Vue 3 compat mode
      chainWebpack(chain) {
        chain.resolve.alias.set('vue', '@vue/compat');
      },

      // ... rest of build config
    },
    // ...
  };
});
```

Also create or update `vue.config.js` or the Quasar config to set compat mode:

```js
// In main boot or app entry
import { configureCompat } from 'vue';

configureCompat({
  // Defaults: enable all compat behaviors
  MODE: 2, // Run in Vue 2 mode by default

  // Disable specific compat features as you migrate them:
  // GLOBAL_MOUNT: false,          // after migrating createApp
  // INSTANCE_EVENT_EMITTER: false, // after removing event bus
  // INSTANCE_SET: false,           // after removing $set calls
  // INSTANCE_DELETE: false,        // after removing $delete calls
  // COMPONENT_V_MODEL: false,     // after migrating v-model
  // RENDER_FUNCTION: false,       // after migrating render functions
});
```

#### 1.4 Update `quasar.conf.js` → `quasar.config.js`

The Quasar v2 CLI expects a different config format. Key changes:

```js
// quasar.config.js
const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    // boot files — same array, but the format may differ slightly
    boot: [
      { path: 'plugins', server: false },
      { path: 'hk-components', server: false },
      // Temporarily DISABLE these until Vue 3 versions are ready:
      // { path: 'vee-validate', server: false },
      { path: 'firebase-auth', server: false },
      // { path: 'vue-shortkey', server: false },
      // { path: 'vue-snotify', server: false },
    ],

    css: ['styles.scss'],
    extras: ['roboto-font', 'material-icons'],

    build: {
      vueRouterMode: 'history',
      env: require('dotenv').config({
        path: `.env.${process.env.NODE_ENV}.local`
      }).parsed,

      // Compat alias
      chainWebpack(chain) {
        chain.resolve.alias.set('vue', '@vue/compat');
      },
    },

    framework: {
      plugins: ['AppFullscreen', 'Notify', 'Cookies', 'Meta', 'Dialog'],
    },

    // SSR config changes for Quasar v2
    ssr: {
      pwa: true,
      // Quasar v2 SSR has a different middleware structure
      // The src-ssr/ files will need updating (see Phase 1.7)
    },
  };
});
```

#### 1.5 Update Boot Files for Vue 3 App Instance API

Boot files in Quasar v2 receive `{ app, router, store }` instead of `{ Vue, ... }`.

**`src/boot/plugins.js`** — before:
```js
export default async ({ router, Vue }) => {
  Vue.use(VueFire);
  Vue.use(VueCookies);
  // ...
};
```

**`src/boot/plugins.js`** — after:
```js
import { Splitpanes, Pane } from 'splitpanes';
import VueGtm from '@gtm-support/vue-gtm'; // Vue 3 version
import 'animate.css';

export default async ({ app, router }) => {
  // VueFire — DISABLED until migrated to vuefire@3
  // VueCookies — REMOVED, using Quasar Cookies
  // vue-numeral-filter — REMOVED, using utils/filters.js
  // Croppa — DISABLED until replacement found

  app.component('Splitpanes', Splitpanes);
  app.component('Pane', Pane);

  require('../functions.js');

  app.use(VueGtm, {
    id: 'GTM-5XJCCDMS',
    vueRouter: router,
    // ... rest of config
  });
};
```

**`src/boot/hk-components.js`** — change all `Vue.component()` → `app.component()`:
```js
export default async ({ app }) => {
  app.component('hk-input', HkInput);
  app.component('hk-select', HkSelect);
  // ... all 30 components
};
```

**`src/boot/vee-validate.js`** — **DISABLE entirely** for initial boot. VeeValidate v3→v4 is a complete rewrite. Comment out the boot entry in `quasar.config.js`.

**`src/boot/vue-shortkey.js`** — **DISABLE** for initial boot.

**`src/boot/vue-snotify.js`** — **DISABLE** for initial boot.

**`src/boot/firebase-auth.js`** — Already clean, no `Vue.use()`. Receives `{ app, router, store }` — update parameter destructuring if it references `Vue`.

#### 1.6 Update Router and Store

**`src/router/index.js`** — Quasar v2 handles router creation differently:

```js
import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import routes from './routes';
import { Notify } from 'quasar';

export default route(function ({ store, ssrContext }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHistory;

  const router = createRouter({
    scrollBehavior() {
      const el = document.querySelector('.scroll');
      if (el) {
        el.scrollLeft = 0;
        el.scrollTop = 0;
      }
    },
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  router.beforeEach((to, from, next) => {
    store.dispatch('setDrawer', false);
    store.commit('CLEAR_ACTION_ROLLS');

    const offline_available = to.matched.some((record) => record.meta.offline);

    if (process.env.CLIENT && !navigator.onLine && !offline_available) {
      Notify.create({
        message: 'Page not available offline, redirected to home.',
        icon: 'fas fa-wifi-slash',
        color: 'negative',
        position: 'top',
      });
      next('/');
    }
    next();
  });

  return router;
});
```

**`src/store/index.js`** — Vuex 4 uses `createStore`:

```js
import { store } from 'quasar/wrappers';
import { createStore } from 'vuex';
// ... module imports stay the same

export default store(function () {
  return createStore({
    modules: {
      general,
      tutorial,
      tips,
      user,
      encounter: run_encounter,
      api_spells,
      campaigns,
      api_monsters,
      api_items,
      api_conditions,
      npcs,
      items,
      spells,
      reminders,
      players,
      encounters,
      characters,
      trackCampaign,
    },
    strict: false,
  });
});
```

Remove the `Vue.use(Vuex)` and `Vue.use(VueRouter)` calls — in Vue 3 these are installed via `app.use()` which Quasar handles automatically.

#### 1.7 Update SSR Files

Quasar v2 has a different SSR architecture. The `src-ssr/` files need to be updated:

- `src-ssr/index.js` → Rewrite based on the Quasar v2 SSR template
- `src-ssr/extension.js` → Migrate to Quasar v2 SSR middleware pattern
- The `quasar-ssr` import changes to Quasar v2's SSR utilities

**For the initial dev server, start with SPA mode only** (`quasar dev` without `-m ssr`). SSR can be re-enabled after the SPA build is stable.

#### 1.8 Update `process.browser` Checks

Vue 2 / Quasar v1 used `process.browser` to detect client-side execution. Quasar v2 uses:
- `process.env.CLIENT` (true on client)
- `process.env.SERVER` (true on server)

Files affected: `src/App.vue`, `src/functions.js`, and likely others.

#### 1.9 Remove/Update ESLint Config

```bash
npm remove babel-eslint eslint-webpack-plugin
npm install --save-dev @babel/eslint-parser
```

Update `.eslintrc.js` to use `@babel/eslint-parser` and `eslint-plugin-vue@^9`.

#### 1.10 Attempt First Boot

```bash
npx quasar dev
```

This will produce a wall of `@vue/compat` deprecation warnings. **That is expected and correct.** The goal is a running dev server, not zero warnings.

**Expected issues at first boot:**
- Missing Vue 3 versions of disabled plugins (forms won't validate, etc.)
- Quasar component API changes (some prop/event names changed between Quasar v1→v2)
- SCSS variable changes (`$header-height` and other Quasar SCSS variables may have moved)

---

### Phase 2 — Stabilize the Dev Build

Once the dev server boots (even with errors on some pages), stabilize:

#### 2.1 Fix Quasar v1 → v2 Component API Changes

Quasar v2 has breaking changes in its own components. Common ones:

| Quasar v1 | Quasar v2 | Files Affected |
|---|---|---|
| `<q-scroll-area :dark="...">` | Check prop still exists | App.vue |
| `<q-no-ssr>` | Removed — use `<client-only>` or `v-if="$q.platform.is.client"` | App.vue |
| `<q-resize-observer>` | May need `@resize` event shape check | App.vue |
| Various `q-*` component props | Audit against Quasar v2 docs | Many |

Quasar provides a detailed [v1 → v2 upgrade guide](https://quasar.dev/start/upgrade-guide).

#### 2.2 Fix SCSS / CSS Issues

- Quasar v2 changes some SCSS variables. Check that `$header-height` and other custom vars in `src/css/styles.scss` are still valid.
- Update `::v-deep` (41 files) to `:deep()` syntax.

#### 2.3 Re-enable Plugins One at a Time

Work through the disabled boot files, upgrading each plugin:

1. **`splitpanes`** → `npm install splitpanes@^3` (straightforward)
2. **`@gtm-support/vue-gtm`** → `npm install @gtm-support/vue-gtm@^2` (drop `vue2-gtm`)
3. **`vuedraggable`** → `npm install vuedraggable@^4.1` (API changes)
4. **`vee-validate`** → This is a full rewrite (v3 → v4). Stub it out or migrate incrementally.
5. **`vue-snotify`** → Replace with Quasar Notify or a Vue 3 toast lib
6. **`vue-shortkey`** → Replace with custom directive or Vue 3 alternative
7. **`vue-croppa`** → Replace with `vue-advanced-cropper` or custom solution
8. **`vuefire`** → Upgrade to `vuefire@^3` or replace with direct Firebase SDK calls

---

### Phase 3 — Incremental Component Migration (Ongoing)

With a running dev build, begin migrating components from Options API to Composition API, and removing `@vue/compat` shims one feature at a time.

#### 3.1 Migration Order (recommended)

Start with leaf components (no children) and work up:

1. **`src/components/hk-components/`** (28 files) — These are the shared UI primitives used everywhere. Migrating these first has maximum impact.
2. **`src/mixins/`** (17 files → composables) — Convert each mixin to a composable (`use*` function). Update the 112 consuming files.
3. **`src/components/`** — Work through component subdirectories.
4. **`src/views/`** — Migrate views last since they mainly compose other components.
5. **`src/layouts/`** (7 files) — Migrate alongside views.

#### 3.2 `@vue/compat` Feature Flags

As each pattern is fully migrated, disable its compat shim in the `configureCompat` call:

```js
configureCompat({
  MODE: 2,
  // Flip these to false one-by-one as you migrate:
  INSTANCE_SET: false,           // after removing all $set (406 occurrences)
  INSTANCE_DELETE: false,        // after removing all $delete (104 occurrences)
  COMPONENT_V_MODEL: false,     // after migrating v-model (583 occurrences)
  INSTANCE_LISTENERS: false,    // after removing $listeners (5 occurrences)
  INSTANCE_SCOPED_SLOTS: false, // after removing $scopedSlots (4 occurrences)
  INSTANCE_EVENT_EMITTER: false, // after event bus migration
  RENDER_FUNCTION: false,       // after migrating render(h) (31 occurrences)
  // ... etc
});
```

When all flags are `false`, remove `@vue/compat` entirely and alias `vue` back to itself.

#### 3.3 Vuex → Pinia (Optional, Later)

Vuex 4 works with Vue 3, but the ecosystem has moved to Pinia. This is a separate, optional migration that should only happen after the compat layer is fully removed.

---

## Detailed File Change Checklist

### Files to Rename/Replace

| Current File | Action |
|---|---|
| `quasar.conf.js` | Rename to `quasar.config.js`, rewrite to Quasar v2 format |
| `src/event-bus.js` | Rewrite to use `mitt` |

### Files to Modify

| File | Changes |
|---|---|
| `package.json` | Update all dependencies per Phase 1.2 |
| `src/boot/plugins.js` | `Vue.use()` → `app.use()`, disable incompatible plugins |
| `src/boot/hk-components.js` | `Vue.component()` → `app.component()` |
| `src/boot/vee-validate.js` | **Disable** (comment out boot entry) |
| `src/boot/vue-shortkey.js` | **Disable** (comment out boot entry) |
| `src/boot/vue-snotify.js` | **Disable** (comment out boot entry) |
| `src/boot/firebase-auth.js` | Update destructured params (`{ app }` instead of `{ Vue }`) |
| `src/router/index.js` | Rewrite for Vue Router 4 + Quasar v2 `route()` wrapper |
| `src/store/index.js` | Rewrite for Vuex 4 + Quasar v2 `store()` wrapper |
| `src/App.vue` | Replace `<q-no-ssr>`, update `process.browser`, `destroyed` → `unmounted` |
| `src/functions.js` | `process.browser` → `process.env.CLIENT` |
| **154 files** | Remove template filter pipes (Phase 0) |
| **5 files** | Update EventBus usage (Phase 0) |

### Files to Remove

| File | Reason |
|---|---|
| `src/store/store.js` | Duplicate store file (if exists) — consolidate into `index.js` |

### Dependencies to Remove

```
vue-cookies
vue-numeral-filter
@gtm-support/vue2-gtm
babel-eslint
eslint-webpack-plugin
@quasar/app
```

### Dependencies to Add

```
@vue/compat@^3.3
@quasar/app-webpack@^3
vue-router@^4.2
mitt
@gtm-support/vue-gtm@^2
@babel/eslint-parser
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Quasar v2 component API breaks | High | Medium | Follow Quasar v1→v2 migration guide; fix errors as they appear |
| SSR breaks | High | High | **Start with SPA-only dev mode**; defer SSR to Phase 2+ |
| Firebase auth flow breaks | Medium | High | Firebase boot file is clean; test auth flow early |
| VeeValidate v4 migration too large | High | Medium | Disable validation initially; forms won't validate but will render |
| `@vue/compat` doesn't cover all patterns | Low | High | Template filters are the known gap — must be pre-migrated |
| Mixin conflicts with compat mode | Medium | Medium | Mixins work in compat; migrate to composables in Phase 3 |
| SCSS variable changes break styling | Medium | Low | Visual regression; fix incrementally |
| Third-party components break | High | Medium | Disabled in Phase 1; re-enable one-by-one in Phase 2 |

---

## Summary: Minimal Steps to a Running Dev Server

1. **Phase 0** (still on Vue 2 — safe to validate):
   - Remove all 381 template filter usages → plain function calls
   - Replace event bus with `mitt`
   - Replace `vue-cookies` with Quasar Cookies

2. **Phase 1** (the big swap):
   - Upgrade `vue`, `quasar`, `vuex`, `vue-router`, `@quasar/app-webpack`
   - Add `@vue/compat` with `MODE: 2`
   - Rewrite `quasar.config.js`
   - Update boot files (`Vue` → `app` instance)
   - Update router (Vue Router 4 `createRouter`)
   - Update store (Vuex 4 `createStore`)
   - Disable incompatible third-party plugins
   - Boot dev server in **SPA mode**

3. **Phase 2** (stabilize):
   - Fix Quasar v1→v2 component API changes
   - Fix SCSS issues
   - Re-enable plugins one-by-one with Vue 3 versions

4. **Phase 3** (incremental, ongoing):
   - Convert components to Composition API
   - Convert mixins to composables
   - Disable compat flags one-by-one
   - Eventually remove `@vue/compat`
