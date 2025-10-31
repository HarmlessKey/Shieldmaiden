# Vue 3 Compatibility Analysis - Codebase Scan Results

**Date**: 2025-10-31
**Status**: ✅ Server Running - No Compilation Errors
**Scan Scope**: Full codebase (src/ directory)

---

## 🎉 Current Status

**SSR Server**: ✅ Running successfully on port 8080
**Import Errors**: ✅ Zero - All resolved
**Compilation Errors**: ✅ Zero - Server compiles cleanly
**Runtime Status**: ⏳ Pending browser testing

---

## 📊 Vue 3 Compatibility Issues Found

### Summary Table

| Issue Type | Count | Severity | Est. Hours |
|-----------|-------|----------|------------|
| **Filters** (numeral) | 19 | High | 1-2 |
| **Event Bus** ($on) | 1 | Medium | 0.5 |
| **$listeners** | 5 | Medium | 0.5-1 |
| **VeeValidate 3** | 398 | High | 15-20 |
| **$snotify** | 144 | High | 6-8 |
| **v-shortkey** | 14 | Medium | 2-3 |
| **::v-deep** | Unknown | Low | 1-2 |
| **TOTAL** | **581+** | - | **26-37 hours** |

---

## 🔴 Critical Issues (Must Fix)

### 1. VeeValidate 3 → 4 Component Migration
**Count**: 398 instances
**Severity**: High (Will break forms)
**Effort**: 15-20 hours

**Components to Replace**:
- `<ValidationProvider>` → `<Field>`
- `<ValidationObserver>` → `<Form>`

**Files Affected**: 50-70 Vue components with forms

**Migration Example**:
```vue
<!-- OLD (VeeValidate 3) -->
<ValidationObserver v-slot="{ handleSubmit }">
  <form @submit.prevent="handleSubmit(onSubmit)">
    <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
      <input v-model="email" />
      <span>{{ errors[0] }}</span>
    </ValidationProvider>
  </form>
</ValidationObserver>

<!-- NEW (VeeValidate 4) -->
<Form @submit="onSubmit">
  <Field name="email" v-model="email" rules="required|email" v-slot="{ field, errors }">
    <input v-bind="field" />
    <span>{{ errors[0] }}</span>
  </Field>
</Form>
```

**Status**: Boot file migrated ✅, component usage needs updating ⏳

---

### 2. $snotify → Quasar Notify Migration
**Count**: 144 instances
**Severity**: High (Notification system broken)
**Effort**: 6-8 hours

**Plugin Status**: vue-snotify removed, needs replacement

**Migration Example**:
```javascript
// OLD
this.$snotify.success('Success message')
this.$snotify.error('Error message', 'Error Title', { timeout: 3000 })

// NEW (Quasar Notify)
import { Notify } from 'quasar'
Notify.create({
  type: 'positive',
  message: 'Success message'
})
Notify.create({
  type: 'negative',
  message: 'Error message',
  caption: 'Error Title',
  timeout: 3000
})

// OR in Options API
this.$q.notify({
  type: 'positive',
  message: 'Success message'
})
```

**Top Files by Usage**:
```bash
# To find top files:
grep -r '$snotify' src/ --include="*.vue" --include="*.js" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
```

---

### 3. Filters → Methods/Computed Migration
**Count**: 19 instances
**Severity**: High (Will break in production)
**Effort**: 1-2 hours

**Filter Used**: `numeral` (number formatting)

**Files Affected**:
1. `src/components/contribute/spell/ViewSpell.vue` - 1x
2. `src/components/campaign/Players.vue` - 1x
3. `src/components/trackCampaign/Meters.vue` - 2x
4. `src/components/Admin/Patrons/Patron.vue` - 1x
5. `src/components/Admin/Patrons/Notifications.vue` - 2x
6. `src/components/npcs/SpellCasting.vue` - 2x
7. `src/components/combat/side/Dmg.vue` - 2x
8. `src/components/combat/actions/Spellcasting.vue` - 1x
9. `src/components/combat/ViewEntity.vue` - 2x
10. `src/components/drawers/party/Inventory.vue` - 1x
11. `src/components/compendium/Monster.vue` - 2x
12. `src/components/compendium/Spell.vue` - 1x
13. `src/views/Admin/Patrons/index.vue` - 1x

**Migration Approach**:
```vue
<!-- OLD -->
{{ spell.level | numeral("0o") }}

<!-- NEW (Option 1: Helper method) -->
{{ formatNumeral(spell.level, "0o") }}

<script>
import numeral from 'numeral'

export default {
  methods: {
    formatNumeral(value, format) {
      return numeral(value).format(format)
    }
  }
}
</script>

<!-- NEW (Option 2: Computed property for specific value) -->
{{ formattedSpellLevel }}

<script>
import numeral from 'numeral'

export default {
  computed: {
    formattedSpellLevel() {
      return numeral(this.spell.level).format("0o")
    }
  }
}
</script>

<!-- NEW (Option 3: Global mixin - Best for consistency) -->
// In src/mixins/numeral.js
import numeral from 'numeral'

export const numeralMixin = {
  methods: {
    $numeral(value, format) {
      return numeral(value).format(format)
    }
  }
}

// Register globally in main.js or create as plugin
{{ $numeral(spell.level, "0o") }}
```

**Recommendation**: Create a global `$numeral` helper method via mixin or plugin for consistency across all 19 usages.

---

## 🟡 Medium Priority Issues

### 4. v-shortkey → Alternative Implementation
**Count**: 14 instances
**Severity**: Medium (Keyboard shortcuts won't work)
**Effort**: 2-3 hours

**Plugin Status**: vue-shortkey removed (not Vue 3 compatible)

**Files Using v-shortkey**:
```bash
# Run to find exact locations:
grep -rn 'v-shortkey' src/ --include="*.vue"
```

**Migration Options**:

**Option 1: @vueuse/core (Recommended)**
```vue
<template>
  <div>Content</div>
</template>

<script>
import { useEventListener } from '@vueuse/core'
import { onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const handleKeydown = (e) => {
      // Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Handle save
      }
      // Escape
      if (e.key === 'Escape') {
        // Handle escape
      }
    }

    useEventListener(document, 'keydown', handleKeydown)

    return {}
  }
}
</script>
```

**Option 2: Native Event Listeners**
```vue
<script>
export default {
  mounted() {
    document.addEventListener('keydown', this.handleShortcut)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleShortcut)
  },
  methods: {
    handleShortcut(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        this.save()
      }
    }
  }
}
</script>
```

**Recommendation**: Use @vueuse/core for cleaner, more composable approach.

---

### 5. $listeners → $attrs Migration
**Count**: 5 instances
**Severity**: Medium (Component event passing may break)
**Effort**: 0.5-1 hour

**Vue 3 Change**: `$listeners` has been merged into `$attrs`

**Migration**:
```vue
<!-- OLD (Vue 2) -->
<ChildComponent v-bind="$attrs" v-on="$listeners" />

<!-- NEW (Vue 3) -->
<ChildComponent v-bind="$attrs" />
```

**Files to Update**:
```bash
# Find exact locations:
grep -rn '$listeners' src/ --include="*.vue"
```

**Notes**: In Vue 3, `$attrs` contains both attributes AND event listeners, so `v-on="$listeners"` is no longer needed.

---

### 6. Event Bus → mitt or Composition API
**Count**: 1 instance
**Severity**: Medium (Inter-component communication broken)
**Effort**: 0.5 hour

**Location**: `src/components/crumble/index.vue:49`
```javascript
this.$root.$on("route-name", (name) => {
```

**Vue 3 Change**: `$on`, `$off`, `$once` removed from Vue instances

**Migration Options**:

**Option 1: mitt Event Emitter (Already installed)**
```javascript
// src/utils/eventBus.js
import mitt from 'mitt'
export const eventBus = mitt()

// Emitting
import { eventBus } from '@/utils/eventBus'
eventBus.emit('route-name', name)

// Listening
import { eventBus } from '@/utils/eventBus'
import { onUnmounted } from 'vue'

export default {
  mounted() {
    eventBus.on('route-name', this.handleRouteName)
  },
  beforeUnmount() {
    eventBus.off('route-name', this.handleRouteName)
  },
  methods: {
    handleRouteName(name) {
      // handle event
    }
  }
}
```

**Option 2: Composition API with provide/inject**
```javascript
// For closely related components
provide('routeName', ref(name))
// In child
const routeName = inject('routeName')
```

**Recommendation**: Use mitt for this single case as it's already installed and provides drop-in replacement.

---

## 🟢 Low Priority Issues (Non-Breaking)

### 7. ::v-deep → :deep() Syntax
**Count**: Unknown (appears in warnings)
**Severity**: Low (Deprecated but still works)
**Effort**: 1-2 hours

**Migration**:
```vue
<!-- OLD (Deprecated) -->
<style scoped>
::v-deep .child-class {
  color: red;
}
</style>

<!-- NEW (Vue 3) -->
<style scoped>
:deep(.child-class) {
  color: red;
}
</style>
```

**Status**: Non-breaking warning, can be addressed later

**To Find All**:
```bash
grep -rn '::v-deep' src/ --include="*.vue"
```

---

## 📋 Migration Priority & Strategy

### Phase 1: Critical Fixes (Must Do - ~8-10 hours)
1. **Create global numeral helper** - Fix all 19 filter usages (1-2 hrs)
2. **Migrate top 20 $snotify files** - Fix most common notifications (3-4 hrs)
3. **Fix event bus usage** - Create mitt eventBus (0.5 hr)
4. **Fix $listeners** - Update 5 instances (0.5-1 hr)
5. **Fix v-shortkey in critical paths** - Main navigation/shortcuts (2-3 hrs)

### Phase 2: VeeValidate Migration (Large Effort - ~15-20 hours)
6. **Identify form patterns** - Group similar forms (2 hrs)
7. **Create migration templates** - Standard patterns (2 hrs)
8. **Migrate forms systematically** - 50-70 components (11-16 hrs)

### Phase 3: Cleanup (Optional - ~1-2 hours)
9. **Replace ::v-deep syntax** - Cosmetic improvement (1-2 hrs)

---

## 🛠️ Recommended Next Steps

### Immediate Actions (Can Start Now):
1. **Create global numeral helper mixin**
   - File: `src/mixins/numeral.js`
   - Register globally
   - Update all 19 usages

2. **Create mitt event bus utility**
   - File: `src/utils/eventBus.js`
   - Update crumble component
   - Document for future use

3. **Create $snotify → Quasar Notify helper**
   - File: `src/utils/notify.js`
   - Create wrapper for common patterns
   - Update high-usage files first

### Testing Strategy:
1. Test forms after each VeeValidate component migration
2. Test notifications after $snotify replacements
3. Test keyboard shortcuts after v-shortkey replacements
4. Use browser to identify runtime errors

---

## 📈 Progress Tracking

### Current Status:
- ✅ **Infrastructure**: 100% (SSR, build system, imports)
- ✅ **Boot Files**: 100% (All migrated to Vue 3 API)
- ⏳ **Component API**: 10% (Imports fixed, API usage needs updating)
- ⏳ **Forms**: 0% (VeeValidate components not migrated)
- ⏳ **Notifications**: 0% ($snotify not replaced)
- ⏳ **Keyboard Shortcuts**: 0% (v-shortkey not replaced)

### Estimated Completion:
- **Critical fixes**: 2-3 days of focused work
- **VeeValidate migration**: 3-4 days of focused work
- **Total remaining**: 5-7 days (26-37 hours)

**Overall Migration**: Currently 55%, will be ~75% after critical fixes, 100% after VeeValidate.

---

## 🎯 Success Criteria

**Phase 1 Complete When**:
- ✅ All filters converted to methods
- ✅ All $snotify calls use Quasar Notify
- ✅ Event bus uses mitt
- ✅ $listeners removed
- ✅ v-shortkey replaced

**Phase 2 Complete When**:
- ✅ All forms use VeeValidate 4 components
- ✅ All form validation working
- ✅ No VeeValidate 3 components remain

**Migration Complete When**:
- ✅ App runs in browser without errors
- ✅ All core functionality works
- ✅ Forms submit successfully
- ✅ Notifications display correctly
- ✅ Keyboard shortcuts work

---

**Generated**: 2025-10-31
**Scan Scope**: src/ directory
**Total Issues**: 581+ instances
**Estimated Fix Time**: 26-37 hours

🤖 Generated with [Claude Code](https://claude.com/claude-code)
