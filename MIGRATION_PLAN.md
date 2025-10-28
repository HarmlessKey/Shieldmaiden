# Vue 2 → Vue 3 & Quasar 1 → Quasar 2 Migration Plan

## Project Overview

**Shieldmaiden** - A Dungeons and Dragons Combat Tracker
- Current: Vue 2.7.16 + Quasar 1.0.0
- Target: Vue 3 + Quasar 2
- Components: 325 Vue components
- Mode: SSR + PWA
- State Management: Vuex 3 → 4
- Routing: Vue Router 3 → 4

## Current Dependencies Analysis

### Core Framework
- `vue`: ~2.7.16 → ^3.4.0
- `quasar`: ^1.0.0 → ^2.16.0
- `@quasar/app`: ~2.4.3 → REMOVE (use @quasar/app-vite or @quasar/app-webpack)
- `@quasar/extras`: ^1.16.12 → ^1.16.12 (compatible)

### State & Routing
- `vuex`: ^3.0.1 → ^4.1.0
- `vue-router`: (implicit 3.x) → ^4.4.0

### Vue 2 Plugins Requiring Migration
1. **vuefire**: ^1.4.5 → ^3.1.0 (VueFire 3 for Vue 3)
2. **vuedraggable**: ^2.24.3 → ^4.1.0 (Vue 3 compatible)
3. **vee-validate**: ^3.4.14 → ^4.13.0 (major API changes)
4. **@gtm-support/vue2-gtm**: ^1.3.0 → @gtm-support/vue-gtm ^3.0.0
5. **vue-cookies**: ^1.8.4 → needs evaluation/alternative
6. **vue-croppa**: ^1.3.8 → needs Vue 3 alternative
7. **vue-numeral-filter**: ^2.2.0 → convert to composable/helper
8. **vue-qr**: ^4.0.9 → needs Vue 3 alternative (e.g., qrcode.vue ^3.x)
9. **vue-shortkey**: ^3.1.7 → alternative needed (not Vue 3 compatible)
10. **vue-snotify**: ^3.2.1 → alternative needed (use Quasar Notify or vue-toastification)
11. **vue2-flip-countdown**: ^0.12.1 → find Vue 3 alternative
12. **splitpanes**: ^2.4.1 → check compatibility (likely works)
13. **@egjs/vue-flicking**: ^4.12.0 → should have Vue 3 support

### Firebase
- `firebase`: ^8.0.0 → ^10.13.0 (modular SDK - major breaking changes)
- `firebase-admin`: ^13.4.0 → ^13.4.0 (compatible, server-side)

### Other Dependencies (likely compatible)
- `axios`: ^0.28.1
- `html2canvas`: ^1.4.1
- `jspdf`: ^3.0.1
- `lodash`: ^4.17.21
- `marked`: ^4.0.16
- `sanitize-html`: ^2.13.0
- `animate.css`: ^4.1.1

## Migration Strategy

### Phase 1: Preparation & Analysis (CURRENT)
- ✅ Analyze project structure
- ✅ Document all dependencies
- ✅ Create migration branch
- ⏳ Create migration state tracking file
- ⏳ Review Vue 3 and Quasar 2 breaking changes

### Phase 2: Core Framework Update
1. Update Quasar CLI and core packages
   - Remove @quasar/app v2
   - Install @quasar/app-vite v2 (or @quasar/app-webpack v2)
   - Update quasar.conf.js → quasar.config.js
2. Update Vue core
   - Update vue to v3.x
   - Update vue-router to v4.x
   - Update vuex to v4.x
3. Update build configuration
   - Migrate quasar.conf.js to quasar.config.js
   - Update boot files syntax
   - Update SSR configuration

### Phase 3: Boot Files & Plugin Updates
1. Update boot files to Vue 3 API
   - Convert Vue.use() to app.use()
   - Update plugin initialization
2. Migrate or replace Vue 2-specific plugins
   - VueFire: update to v3
   - Vuedraggable: update to v4
   - VeeValidate: migrate to v4 (major API changes)
   - GTM: update to Vue 3 version
   - Find alternatives for incompatible plugins

### Phase 4: Component Migration
1. Global API changes in components
   - Update Vue 2 lifecycle hooks (if using new names)
   - Remove filters → use methods/computed
   - Update $listeners and $attrs usage
   - Fix v-model usage on custom components
   - Update functional components
2. Quasar component updates
   - Review Quasar 2 breaking changes
   - Update component props and events
   - Update QScrollArea, QDialog, etc.
3. Third-party component updates
   - Update component imports and usage

### Phase 5: Store & Router Updates
1. Vuex 4 migration
   - Update store creation syntax
   - Update TypeScript types (if needed)
   - Test all store modules
2. Vue Router 4 migration
   - Update router creation
   - Update navigation guards
   - Update scroll behavior

### Phase 6: Firebase Migration
1. Migrate to Firebase v9+ modular SDK
   - Update firebase initialization
   - Update all firebase calls to modular imports
   - Update VueFire bindings

### Phase 7: Testing & Fixes
1. Test SSR functionality
2. Test PWA functionality
3. Fix any runtime errors
4. Update tests (if any)
5. Performance optimization

### Phase 8: Final Review & Documentation
1. Update package.json scripts
2. Update documentation
3. Final testing across all features
4. Create PR for review

## Breaking Changes to Address

### Vue 3 Breaking Changes
1. **Global API** - Vue.use() → app.use()
2. **Filters removed** - Use methods or computed properties
3. **Event API** - $on, $off, $once removed (no event bus)
4. **v-model** - Changed syntax for custom components
5. **Functional components** - New syntax
6. **Async components** - defineAsyncComponent()
7. **$listeners** - Merged into $attrs
8. **$scopedSlots** - Merged into $slots
9. **Transition classes** - Renamed (v-enter → v-enter-from)
10. **Key usage** - No longer needed on v-if/v-else/v-else-if branches

### Quasar 2 Breaking Changes
1. **Quasar.conf.js** → quasar.config.js
2. **Component changes** - Some props and events renamed
3. **Import strategy** - Changes in auto-import
4. **SSR changes** - Updated SSR API
5. **Build tool** - Option to use Vite (recommended)

### VeeValidate 4 Breaking Changes
1. **ValidationProvider/ValidationObserver** - New API
2. **Rules import** - Changed structure
3. **Form handling** - New composition API based

### Firebase 9+ Breaking Changes
1. **Import style** - Modular imports only
2. **Initialization** - New syntax
3. **All methods** - Tree-shakeable functions

## File Structure Changes

```
Current:                    After Migration:
quasar.conf.js         →    quasar.config.js
src/boot/*.js          →    Updated syntax (app instead of Vue)
src/router/index.js    →    createRouter() instead of new VueRouter()
src/store/index.js     →    createStore() instead of new Vuex.Store()
src/firebase.js        →    Modular SDK imports
```

## Risk Assessment

### High Risk
- 325 Vue components need review
- Firebase SDK migration (major breaking changes)
- VeeValidate migration (significant API changes)
- Several plugins need alternatives
- SSR functionality needs careful testing

### Medium Risk
- Vuex and Router updates (minor API changes)
- Quasar component API changes
- Build configuration changes

### Low Risk
- Most utility functions and services
- CSS and styling
- Static assets

## Rollback Plan
- Migration branch isolated from main
- Can revert to main branch if critical issues arise
- Incremental commits for easy rollback to specific points

## Timeline Estimate
- Phase 1: 1-2 hours (CURRENT)
- Phase 2: 2-4 hours
- Phase 3: 4-6 hours
- Phase 4: 15-25 hours (largest effort)
- Phase 5: 2-3 hours
- Phase 6: 3-5 hours
- Phase 7: 5-10 hours
- Phase 8: 2-3 hours

**Total Estimate**: 34-58 hours

## Resources
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Quasar v2 Upgrade Guide](https://quasar.dev/start/upgrade-guide)
- [Vue Router 4 Migration](https://router.vuejs.org/guide/migration/)
- [Vuex 4 Migration](https://vuex.vuejs.org/guide/migrating-to-4-0-from-3-x.html)
- [VeeValidate 4 Migration](https://vee-validate.logaretm.com/v4/guide/migration/)
- [Firebase 9 Upgrade](https://firebase.google.com/docs/web/modular-upgrade)
