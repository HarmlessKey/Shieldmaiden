# Breaking Changes Documentation

This document details all breaking changes that need to be addressed during the Vue 2 → Vue 3 and Quasar 1 → Quasar 2 migration.

## Table of Contents
1. [Vue 3 Breaking Changes](#vue-3-breaking-changes)
2. [Quasar 2 Breaking Changes](#quasar-2-breaking-changes)
3. [Vue Router 4 Changes](#vue-router-4-changes)
4. [Vuex 4 Changes](#vuex-4-changes)
5. [VeeValidate 4 Changes](#veevalidate-4-changes)
6. [Firebase 9+ Changes](#firebase-9-changes)
7. [Plugin Replacements](#plugin-replacements)

---

## Vue 3 Breaking Changes

### 1. Global API Changes

**Before (Vue 2):**
```javascript
import Vue from 'vue'
import VueFire from 'vuefire'
import VueCookies from 'vue-cookies'

Vue.use(VueFire)
Vue.use(VueCookies)
Vue.component('MyComponent', MyComponent)
```

**After (Vue 3):**
```javascript
import { createApp } from 'vue'
import VueFire from 'vuefire'
import VueCookies from 'vue-cookies'

const app = createApp(App)
app.use(VueFire)
app.use(VueCookies)
app.component('MyComponent', MyComponent)
```

**Impact:** All boot files (src/boot/*.js) need updating.

---

### 2. Filters Removed

**Before (Vue 2):**
```vue
<template>
  <div>{{ price | numeral('0,0.00') }}</div>
</template>

<script>
export default {
  filters: {
    uppercase(value) {
      return value.toUpperCase()
    }
  }
}
</script>
```

**After (Vue 3):**
```vue
<template>
  <div>{{ formatPrice(price) }}</div>
</template>

<script>
export default {
  methods: {
    formatPrice(value) {
      return numeral(value).format('0,0.00')
    },
    uppercase(value) {
      return value.toUpperCase()
    }
  }
}
</script>
```

**Impact:** All filter usage must be converted to methods or computed properties. This affects `vue-numeral-filter` usage throughout the app.

**Search for:**
- `{{ ... | ... }}`
- `filters: {`
- Vue.filter()

---

### 3. Event Bus / Event API Removed

**Before (Vue 2):**
```javascript
// Event bus
const EventBus = new Vue()

// Emit
EventBus.$emit('event-name', data)

// Listen
EventBus.$on('event-name', handler)

// Remove listener
EventBus.$off('event-name', handler)
```

**After (Vue 3):**
```javascript
// Option 1: Use mitt library
import mitt from 'mitt'
const emitter = mitt()

// Emit
emitter.emit('event-name', data)

// Listen
emitter.on('event-name', handler)

// Remove listener
emitter.off('event-name', handler)

// Option 2: Use provide/inject
// Option 3: Use Vuex
```

**Impact:** Search for all `$on`, `$off`, `$once` usage and replace with mitt or alternative patterns.

---

### 4. v-model Changes on Custom Components

**Before (Vue 2):**
```vue
<!-- Parent -->
<custom-input v-model="value" />

<!-- Child -->
<script>
export default {
  props: ['value'],
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>
```

**After (Vue 3):**
```vue
<!-- Parent (same) -->
<custom-input v-model="value" />

<!-- Child -->
<script>
export default {
  props: ['modelValue'], // Changed from 'value'
  emits: ['update:modelValue'], // Explicit emits
  methods: {
    updateValue(newValue) {
      this.$emit('update:modelValue', newValue) // Changed event name
    }
  }
}
</script>
```

**Impact:** All custom components using v-model need prop and emit updates.

---

### 5. $listeners Merged into $attrs

**Before (Vue 2):**
```vue
<template>
  <div>
    <button v-bind="$attrs" v-on="$listeners">
      Click me
    </button>
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>
```

**After (Vue 3):**
```vue
<template>
  <div>
    <button v-bind="$attrs">
      Click me
    </button>
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>
```

**Impact:** Remove all `v-on="$listeners"` usage, as it's now included in `$attrs`.

---

### 6. Functional Components

**Before (Vue 2):**
```vue
<template functional>
  <div>{{ props.message }}</div>
</template>
```

**After (Vue 3):**
```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>
```

Or use function syntax:
```javascript
import { h } from 'vue'

export default function MyComponent(props) {
  return h('div', props.message)
}
```

**Impact:** Identify and update all functional components.

---

### 7. Async Component Creation

**Before (Vue 2):**
```javascript
const AsyncComponent = () => import('./MyComponent.vue')
```

**After (Vue 3):**
```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./MyComponent.vue')
)
```

**Impact:** Update all async component definitions.

---

### 8. Transition Class Names

**Before (Vue 2):**
```css
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

**After (Vue 3):**
```css
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
```

**Impact:** Update CSS for all transitions. Classes changed:
- `v-enter` → `v-enter-from`
- `v-leave` → `v-leave-from`

---

### 9. Key Attribute on v-if/v-else

**Before (Vue 2):**
```vue
<div v-if="condition" key="a">A</div>
<div v-else key="b">B</div>
```

**After (Vue 3):**
```vue
<div v-if="condition">A</div>
<div v-else>B</div>
```

**Impact:** Key is no longer required on v-if branches (automatic).

---

### 10. Lifecycle Hook Changes

Most hooks remain the same, but composition API introduces new names:
- `beforeDestroy` → `beforeUnmount` (Options API still works)
- `destroyed` → `unmounted` (Options API still works)

---

## Quasar 2 Breaking Changes

### 1. Configuration File Rename

**Before:** `quasar.conf.js`
**After:** `quasar.config.js`

**Changes needed:**
```javascript
// quasar.config.js structure slightly different
module.exports = function (/* ctx */) {
  return {
    // boot files format same
    boot: ['plugins'],

    // framework config same structure
    framework: {
      plugins: ['Notify', 'Dialog']
    }
  }
}
```

---

### 2. Quasar CLI Package

**Before:** `@quasar/app` (v2.x for Quasar v1)
**After:** `@quasar/app-vite` (v2.x for Quasar v2) or `@quasar/app-webpack`

Recommended: Use Vite for better performance.

---

### 3. Component API Changes

Review each Quasar component for changes:

**QScrollArea:**
- Check for any prop/event changes

**QDialog:**
- May have prop changes

**QInput, QSelect, etc:**
- Review validation and model changes

---

### 4. SSR Changes

SSR configuration structure may have updates. Review:
- SSR boot files
- SSR context usage
- SSR store initialization

---

### 5. Import Strategy

Auto-import still works but may have refinements in Quasar 2.

---

## Vue Router 4 Changes

### 1. Router Creation

**Before (Vue 2 / Vue Router 3):**
```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

export default function ({ store }) {
  const Router = new VueRouter({
    routes,
    mode: 'history'
  })
  return Router
}
```

**After (Vue 3 / Vue Router 4):**
```javascript
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

export default function ({ store }) {
  const Router = createRouter({
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE)
  })
  return Router
}
```

---

### 2. Navigation Guards

Most navigation guards work the same, but type signatures may differ.

---

### 3. Scroll Behavior

Signature is the same, but implementation might need review.

---

## Vuex 4 Changes

### 1. Store Creation

**Before (Vuex 3):**
```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    modules: { ... }
  })
  return Store
}
```

**After (Vuex 4):**
```javascript
import { createStore } from 'vuex'

export default function () {
  const Store = createStore({
    modules: { ... }
  })
  return Store
}
```

**Impact:** Minimal - mostly just import and creation changes.

---

## VeeValidate 4 Changes

VeeValidate 4 is a **major rewrite** with significant API changes.

### 1. ValidationProvider → useField

**Before (VeeValidate 3):**
```vue
<template>
  <ValidationProvider rules="required|email" v-slot="{ errors }">
    <input v-model="email" />
    <span>{{ errors[0] }}</span>
  </ValidationProvider>
</template>
```

**After (VeeValidate 4):**
```vue
<template>
  <Field name="email" rules="required|email" v-slot="{ field, errors }">
    <input v-bind="field" />
    <span>{{ errors[0] }}</span>
  </Field>
</template>

<script>
import { Field } from 'vee-validate'
export default {
  components: { Field }
}
</script>
```

Or with Composition API:
```vue
<script setup>
import { useField } from 'vee-validate'

const { value: email, errorMessage } = useField('email', 'required|email')
</script>
```

---

### 2. ValidationObserver → useForm

**Before (VeeValidate 3):**
```vue
<ValidationObserver v-slot="{ handleSubmit }">
  <form @submit.prevent="handleSubmit(onSubmit)">
    <!-- fields -->
  </form>
</ValidationObserver>
```

**After (VeeValidate 4):**
```vue
<Form @submit="onSubmit" v-slot="{ errors }">
  <!-- fields -->
</Form>

<script>
import { Form } from 'vee-validate'
export default {
  components: { Form }
}
</script>
```

---

### 3. Rules Import

**Before:**
```javascript
import { required, email, min } from 'vee-validate/dist/rules'
```

**After:**
```javascript
import * as rules from '@vee-validate/rules'
```

**Impact:** All VeeValidate usage needs migration. This is substantial.

---

## Firebase 9+ Changes

Firebase 9 introduced a **modular SDK** with breaking changes across all APIs.

### 1. Initialization

**Before (Firebase 8):**
```javascript
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = { ... }
firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore()
export const auth = firebase.auth()
```

**After (Firebase 9+):**
```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = { ... }
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
```

---

### 2. Firestore Operations

**Before:**
```javascript
db.collection('users').doc('userId').get()
db.collection('users').add({ name: 'John' })
```

**After:**
```javascript
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'

getDoc(doc(db, 'users', 'userId'))
addDoc(collection(db, 'users'), { name: 'John' })
```

---

### 3. Authentication

**Before:**
```javascript
firebase.auth().signInWithEmailAndPassword(email, password)
firebase.auth().currentUser
```

**After:**
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth'

signInWithEmailAndPassword(auth, email, password)
auth.currentUser
```

**Impact:** Every Firebase call needs updating. This is extensive.

---

## Plugin Replacements

### 1. vue-snotify → Quasar Notify

**Before:**
```javascript
this.$snotify.success('Success message')
```

**After:**
```javascript
import { Notify } from 'quasar'

Notify.create({
  type: 'positive',
  message: 'Success message'
})
```

Or in composition API:
```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()
$q.notify({ type: 'positive', message: 'Success message' })
```

---

### 2. vue-numeral-filter → Helper Function

**Before:**
```vue
<template>
  {{ amount | numeral('0,0.00') }}
</template>
```

**After:**
```vue
<template>
  {{ formatCurrency(amount) }}
</template>

<script>
import numeral from 'numeral'

export default {
  methods: {
    formatCurrency(value) {
      return numeral(value).format('0,0.00')
    }
  }
}
</script>
```

Or create a global helper:
```javascript
// utils/formatters.js
import numeral from 'numeral'

export function formatCurrency(value, format = '0,0.00') {
  return numeral(value).format(format)
}
```

---

### 3. vue-shortkey → Alternative

Vue-shortkey is not Vue 3 compatible. Alternatives:
- **@vueuse/core** - useEventListener + key detection
- **vue3-shortkey** (if available)
- Custom implementation with event listeners

---

### 4. vue-cookies → Alternative

Options:
- **js-cookie** (vanilla JS)
- **@vueuse/integrations** (useCookies)
- Quasar Cookies (already used in project)

Recommendation: Use Quasar Cookies for consistency.

---

### 5. vue-croppa → Vue 3 Alternative

Options:
- **vue-advanced-cropper** (Vue 3 compatible)
- **cropperjs** with wrapper

---

### 6. vue-qr → qrcode.vue

Replace:
```javascript
// Old
import VueQr from 'vue-qr'

// New
import { QrcodeVue } from 'qrcode.vue'
```

---

## Search Patterns

To find instances of breaking changes, search for:

1. **Filters:** `{{ .* | .* }}`
2. **Event bus:** `$on`, `$off`, `$once`
3. **v-model custom:** `this.$emit('input'`
4. **$listeners:** `$listeners`
5. **Functional:** `<template functional>`
6. **Transition classes:** `.v-enter`, `.v-leave`
7. **Firebase calls:** `firebase\.` or `\.collection\(` or `\.doc\(`
8. **VeeValidate:** `ValidationProvider`, `ValidationObserver`
9. **Filters definition:** `filters: {`
10. **Global Vue:** `Vue.use`, `Vue.component`, `Vue.filter`

---

## Migration Checklist

- [ ] Update package.json dependencies
- [ ] Convert quasar.conf.js to quasar.config.js
- [ ] Update all boot files (Global API)
- [ ] Remove all filters, convert to methods
- [ ] Replace event bus usage
- [ ] Update custom v-model components
- [ ] Remove $listeners usage
- [ ] Update functional components
- [ ] Update async components
- [ ] Update transition CSS classes
- [ ] Migrate router creation
- [ ] Migrate store creation
- [ ] Migrate Firebase initialization
- [ ] Update all Firebase calls
- [ ] Migrate VeeValidate usage
- [ ] Replace incompatible plugins
- [ ] Test all components
- [ ] Test SSR
- [ ] Test PWA

---

## References

- [Vue 3 Migration Build](https://v3-migration.vuejs.org/migration-build.html)
- [Vue 3 Breaking Changes](https://v3-migration.vuejs.org/breaking-changes/)
- [Quasar Upgrade Guide](https://quasar.dev/start/upgrade-guide)
- [Firebase Modular SDK](https://firebase.google.com/docs/web/modular-upgrade)
- [VeeValidate v4 Guide](https://vee-validate.logaretm.com/v4/)
