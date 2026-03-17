# Phase 2 Changelog

All changes made during Phase 2 implementation, with deviations from the plan noted.

---

## Step 1: Fix Immediate Breaking Changes ✓

**Status:** Complete (commit b5080c1)
**Files changed:** 51

### 1.1 Replace `.sync` modifier → `v-model:` (6 files)
- All q-table `:pagination.sync` and `:selected.sync` migrated
- No deviations from plan

### 1.2 Replace `::v-deep` → `:deep()` (38 files)
- All occurrences migrated
- **Deviation:** The background agent restructured some block-level `::v-deep { ... }` into multiple `:deep(.selector)` rules (e.g., Home.vue, LinkPatreonAccount.vue, RunCampaign.vue). This is correct behavior — more precise than `:deep() { }` which would match all children.

### 1.3 Replace `beforeDestroy` → `beforeUnmount` (6 files) + `destroyed` → `unmounted` (2 files)
- **Deviation:** Plan listed 6+2=8 files. Found exactly 6 `beforeDestroy` and 2 `destroyed` (hk-timer.vue, hk-roll.vue). Plan had listed hk-timer and hk-roll under both categories but they only had `destroyed`, not `beforeDestroy`.

### 1.4 Remove `.native` event modifier (1 file: hk-popover.vue)
- No deviations

### 1.5 Replace `$scopedSlots` → `$slots` (3 files)
- hk-tip.vue, hk-card.vue, hk-select.vue
- **Deviation:** Plan listed 6 files but only 3 had `$scopedSlots`. The other 3 (hk-input, hk-dialog, hk-pane) use different slot patterns that don't reference `$scopedSlots`.

---

## Step 2: Replace vue-snotify → Quasar Notify + Dialog ✓

**Status:** Complete (commits 031cc46 + current)
**Files changed:** ~46 + 1 new utility + 1 deleted boot file

### 2.1 Created notification utility (`src/utils/notify.js`)
- `notifySuccess`, `notifyError`, `notifyWarning`, `notifyHtml`, `confirmAction`, `warningAction`
- Uses Quasar Notify and Dialog plugins

### 2.2 Migrated all 46 files from `$snotify` to utility functions
- Simple notifications: `this.$snotify.success(msg, title)` → `notifySuccess(msg, title)`
- Confirm dialogs: Replaced verbose button-based patterns with `confirmAction({ title, message, onOk })`
- HTML notifications (dice rolls): `this.$snotify.html()` → `notifyHtml()`

### 2.3 Cleanup
- Deleted `src/boot/vue-snotify.js`
- Removed snotify CSS from `src/css/styles.scss` (~190 lines of overrides)
- Removed `vue-snotify` from boot entries in `quasar.config.js`
- Removed `vue-snotify` from `package.json`

---

## Step 3: Replace vue-shortkey → Custom Vue 3 Directive ✓

**Status:** Complete
**Files changed:** 2 new/modified, 1 config change

### 3.1 Created custom directive (`src/directives/shortkey.js`)
- Lightweight replacement that replicates vue-shortkey behavior
- Supports array syntax (`['esc']`) and object syntax for named shortcuts
- Prevents shortcuts in input/textarea/contentEditable elements
- Uses WeakMap for cleanup

### 3.2 Updated boot file (`src/boot/vue-shortkey.js`)
- Now imports custom directive instead of npm package

### 3.3 Enabled in quasar.config.js
- Uncommented the `vue-shortkey` boot entry

### 3.4 No template changes needed
- Existing `v-shortkey` and `@shortkey` syntax is fully compatible

---

## Step 4: Upgrade Third-Party Plugins ✓

**Status:** Complete

### 4.1 vuedraggable v2 → v4
- Updated `src/components/combat/Targets.vue` — new `item-key`, `#item` slot template, `tag="transition-group"` with `component-data`
- Updated `src/components/npcs/Actions.vue` — same pattern
- **Deviation:** vuedraggable v4 uses `<template #item="{ element, index }">` instead of `v-for` inside `<transition-group>`

### 4.2 splitpanes v2 → v3
- Updated version in package.json to `^3.1.5`
- No code changes needed — API is compatible

### 4.3 @egjs/vue-flicking
- Already Vue 3 compatible at v4.12.0, no changes needed

### 4.4 Removed vue2-flip-countdown
- Removed from package.json (never imported in code)

---

## Step 5: Replace vue-croppa → vue-advanced-cropper ✓

**Status:** Complete
**Files changed:** 1 rewritten

### 5.1 Rewrote `src/components/hk-components/hk-image-uploader.vue`
- Replaced `<croppa>` component with `<Cropper>` from vue-advanced-cropper
- Added file input for image selection
- Mapped operations: `crop.rotate(-1)` → `$refs.cropper.rotate(-90)`, etc.
- Added placeholder UI with click-to-choose

---

## Step 6: Migrate vee-validate v3 → v4 (In Progress)

**Status:** In Progress

### 6.1 Rewrote boot file (`src/boot/vee-validate.js`)
- `extend()` → `defineRule()`
- `ValidationObserver`/`ValidationProvider` → aliased to `Form`/`Field`
- Added `@vee-validate/rules` imports
- Registered `VForm`, `VField`, `VErrorMessage` globally

### 6.2 Updated wrapper components
- `hk-input.vue` — updated ValidationProvider slot from `{ errors, invalid, validated }` to `{ errorMessage }`, added `as="div"`, `modelValue` binding
- `hk-select.vue` — same pattern

### 6.3 Template migration (39 files) — In Progress
- Migrating `invalid && validated` → `!!errorMessage`
- Migrating `errors[0]` → `errorMessage`
- Adding `as="div"` and `:modelValue` bindings

---

## Step 7: Re-add Google Tag Manager ✓

**Status:** Complete
**Files changed:** 1

### 7.1 Added GTM to `src/boot/plugins.js`
- Using `@gtm-support/vue-gtm` (Vue 3 compatible)
- Configured with existing GTM ID `GTM-5XJCCDMS`
- Only enabled in production

---

## Additional Fixes

### Fix `$listeners` (removed in Vue 3)
- `hk-pane.vue` — removed `v-on="$listeners"` (merged into `$attrs` in Vue 3)
- `hk-dialog.vue` — removed `v-on="$listeners"`
- `hk-roll-action.vue` — replaced `this.$listeners["roll"]` with `this.$attrs["onRoll"]`

### Fix `$set` / `$delete` / `Vue.set` / `Vue.delete` (In Progress)
- ~59 files with 437 occurrences
- Replacing with direct property assignment (`obj[key] = value`) and `delete` operator
- Removing `import Vue from 'vue'` where no longer needed

---

## Dependency Changes Summary

**Removed:**
- `vue-snotify`
- `vue-shortkey`
- `vue-croppa`
- `vue2-flip-countdown`

**Added:**
- `vue-advanced-cropper@^2.8.9`
- `@vee-validate/rules@^4.13.2`
- `@gtm-support/vue-gtm@^2.2.0`

**Upgraded:**
- `vee-validate@^3.4.14` → `^4.13.2`
- `splitpanes@^2.4.1` → `^3.1.5`
- `vuedraggable@^2.24.3` → `^4.1.0`
