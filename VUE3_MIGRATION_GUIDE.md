# Vue 2 → Vue 3 Migration Guide for Parallel Branches

This guide is for migrating code that was written **on a Vue 2 branch** (develop,
feature branches, hotfixes) into the **Vue 3 codebase**. Follow it whenever you
merge a branch that was created before the Vue 3 migration landed.

Every pattern and pitfall in this document was actually encountered while
migrating this codebase and while merging `main` (2.42.0, Vue 2) into the
migration branch — none of it is theoretical.

**The golden rule for every merge:**

> **The feature branch wins on *what* the code does. The Vue 3 branch wins on
> *how* it is written.** Keep all new features, then re-express any Vue 2
> syntax in Vue 3 style using the cheat sheet below.

---

## 1. The merge procedure

Always **merge**, never rebase. Rebasing replays the Vue 2 commits one at a
time and forces you to resolve the same conflicts over and over.

```bash
git checkout <vue3-branch>
git fetch origin
git merge origin/develop        # or the feature branch
```

If it stops with conflicts, don't panic and don't blanket-resolve. Work
file by file:

```bash
git status                      # lists conflicted files (UU / DU / UD)
```

### 1.1 Choosing a resolution strategy per file

For every conflicted file, look at **both complete versions** before touching
the conflict markers:

```bash
git show HEAD:src/components/Foo.vue        > /tmp/ours.vue    # Vue 3 side
git show MERGE_HEAD:src/components/Foo.vue  > /tmp/theirs.vue  # Vue 2 side
```

Then pick one of these strategies:

| Situation | Strategy |
|---|---|
| Feature branch only touched code the migration didn't change | Take **theirs**, then run the sweep (§3) on the file |
| Migration only re-syntaxed code the feature branch didn't change | Take **ours** (`git checkout --ours <file>`) |
| Both sides changed the same region | Take the feature branch's *content*, apply the cheat sheet (§2) to it |
| Git produced a huge scrambled conflict (feature branch reformatted or restructured the file) | Don't untangle the markers. Take **theirs** wholesale (`git checkout --theirs <file>`), then apply the cheat sheet to the whole file. This is faster and much less error-prone. |
| `DU` — deleted by us, modified by them (e.g. `quasar.conf.js`) | Keep the deletion (`git rm <file>`), then port the meaningful change into the replacement file (`quasar.config.js`) |

After resolving each file: `git add <file>`. Escape hatch if a merge goes
sideways: `git merge --abort` and start over.

### 1.2 What NOT to do

- **Never `git checkout --ours .` across the board** — you silently lose every
  feature the other branch added.
- **Never `git checkout --theirs .` and commit** — you silently reintroduce
  Vue 2 syntax that compiles but breaks at runtime.
- **Never trust a clean auto-merge.** Files that merged *without* conflict can
  still contain Vue 2 patterns from the feature branch (this happened with a
  brand-new store module full of `Vue.set`, a new component using
  `slot="header"` and `$snotify`, and a `process.browser` check that crashed
  the whole app on boot). §3's sweep is mandatory over **all** files the
  feature branch touched, not just the conflicted ones:

  ```bash
  git diff --name-only $(git merge-base HEAD MERGE_HEAD)..MERGE_HEAD -- src/ > /tmp/touched.txt
  ```

---

## 2. Vue 2 → Vue 3 conversion cheat sheet

Apply these to any Vue 2 code that comes in from the feature branch.

### 2.1 Slots — `slot="x"` / `slot-scope`

```html
<!-- Vue 2 -->
<div slot="header" class="card-header">...</div>
<div slot="name" slot-scope="data">{{ data.item }}</div>

<!-- Vue 3 -->
<template v-slot:header>
	<div class="card-header">...</div>
</template>
<template v-slot:name="data">
	<div>{{ data.item }}</div>
</template>
```

Rules that bite:
- The `<template v-slot:...>` must be a **direct child** of the component
  receiving the slot.
- A slot name may appear **once** per component: if two siblings target the
  same slot (e.g. via `v-if`/`v-else`), put both inside ONE template wrapper
  and keep the conditionals on the inner elements.
- Keep `v-if`/`v-for` on the inner element, not the template wrapper.

### 2.2 Reactivity — `$set` / `$delete` / `Vue.set` / `Vue.delete`

Vue 3 proxies track direct assignment, so:

```js
this.$set(obj, key, value)   →  obj[key] = value
Vue.set(state, "foo", bar)   →  state.foo = bar
this.$delete(obj, key)       →  delete obj[key]
Vue.delete(arr, index)       →  arr.splice(index, 1)   // ⚠ see below
```

**Pitfall:** `Vue.delete` on an **array** did splice semantics. A plain
`delete arr[i]` leaves a hole. Check whether the target is an array or object
(how is it initialized? how is it iterated?) before converting. Also remove
the now-unused `import Vue from "vue"`.

### 2.3 Quasar v2 component API renames

These are the sneakiest because **nothing errors — the handler just never
fires** (we found 101 dead handlers this way):

```html
<!-- Vue 2 / Quasar v1 -->
<q-select :value="x" @input="onChange" />

<!-- Vue 3 / Quasar v2 -->
<q-select :model-value="x" @update:model-value="onChange" />
```

- `@input=` → `@update:model-value=` on ALL `q-*` form components
  (q-input, q-select, q-checkbox, q-toggle, q-range, q-slider, q-btn-toggle, …).
  On `q-input` the native `@input` still fires but delivers an **Event object
  instead of the value** — equally broken, just quieter.
- `:value=` → `:model-value=` on the same components.
  **Exception:** `q-linear-progress` / `q-circular-progress` legitimately keep
  `:value` — it's their real prop name in v2.
- QTable: `:data=` → `:rows=`. (But `:data` as a prop of *our own* components
  like `ViewMonster` is fine — only rename it on `q-table`.)
- The component option `meta()` no longer works — wrap it in
  `createMetaMixin(function () { ... })` from `quasar`.
- `Cookies.parseSSR(ssrContext)` only exists server-side:
  `process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies`.

### 2.4 vee-validate v3 → v4

```html
<!-- Vue 2 (v3 API) -->
<ValidationProvider rules="required" name="Name" v-slot="{ errors, invalid, validated }">
	<q-input v-model="npc.name" :error="invalid && validated" :error-message="errors[0]" />
</ValidationProvider>

<!-- Vue 3 (v4 API) — the aliases ValidationObserver/ValidationProvider still exist -->
<ValidationProvider rules="required" name="Name" v-slot="{ errorMessage }" :modelValue="npc.name" as="div">
	<q-input v-model="npc.name" :error="!!errorMessage" :error-message="errorMessage" />
</ValidationProvider>
```

- `errors[0]` → `errorMessage`; `invalid`/`validated` → `!!errorMessage`.
- Observer submit: `handleSubmit(save)` → `handleSubmit($event, save)`,
  `v-slot="{ handleSubmit, valid }"` → `v-slot="{ handleSubmit, meta }"` +
  `meta.valid`.
- Every `Field`/`ValidationProvider` needs a string `name` — an undefined name
  crashes vee-validate at runtime.

### 2.5 Notifications — vue-snotify is gone

Use `src/utils/notify.js`:

```js
import { notifySuccess, notifyError, confirmAction } from "src/utils/notify";

this.$snotify.success("Saved!", "Critical hit!")   →  notifySuccess("Saved!", "Critical hit!")
this.$snotify.error("Oops", "Failed")              →  notifyError("Oops", "Failed")

// The confirm-toast pattern with Yes/No buttons:
confirmAction({
	title: "Delete Group",
	message: `Are you sure you want to delete "${name}"?`,
	onOk: () => { /* the Yes action */ },
});
```

### 2.6 Async components

```js
// Vue 2 — plain function in a components block
components: { Shares: () => import("./Shares") }

// Vue 3
import { defineAsyncComponent } from "vue";
components: { Shares: defineAsyncComponent(() => import("./Shares")) }
```

**Exception:** router `component: () => import(...)` in `routes.js` stays as
is — Vue Router 4 handles those natively.

### 2.7 Everything else, quick-fire

| Vue 2 | Vue 3 |
|---|---|
| `{{ value \| filter }}` | function call: `{{ formatNumber(value) }}` |
| `this.$root.$on/$emit`, `this.$on` | `EventBus` from `src/event-bus` (mitt): `EventBus.on/emit`, and `EventBus.off` in `beforeUnmount` |
| `beforeDestroy()` / `destroyed()` | `beforeUnmount()` / `unmounted()` |
| `.sync` modifier | `v-model:propName` |
| `::v-deep` in scoped styles | `:deep(...)` — and Sass can't use `&`-suffixes inside it: `:deep(.pane__header)`, not `:deep(.pane) { &__header }`. In **global** css, drop it entirely and nest normally |
| `<div :is="comp">`, `<tag :is="...">` | `<component :is="comp">` |
| `<tbody is="transition-group">` | `<transition-group tag="tbody">` |
| `render(c) { return c("router-view") }` | `{ render: () => h(RouterView) }` |
| `process.browser` | `typeof window !== "undefined"` |
| `$scopedSlots` | `$slots` (⚠ check for `a \|\| a` duplicates after replacing) |
| transition CSS `.x-enter` / `.x-leave` | `.x-enter-from` / `.x-leave-from` |

### 2.8 Components with v-model (custom components)

Migrated components use a **dual contract** so both old and new consumers work
— follow this pattern (reference implementation: `hk-input.vue`):

```js
props: {
	value: { type: Object },        // Vue 2 contract, kept
	modelValue: { type: Object },   // Vue 3 contract, added
},
emits: ["input", "update:modelValue"],
computed: {
	npc: {
		get() { return this.modelValue !== undefined ? this.modelValue : this.value; },
		set(newValue) {
			this.$emit("input", newValue);          // old consumers
			this.$emit("update:modelValue", newValue); // new consumers
		},
	},
},
```

If the feature branch adds a *new* v-model component, give it the same dual
contract. `Boolean` model props need `default: undefined` or the absent-prop
cast to `false` shadows the fallback.

---

## 3. The post-merge sweep (mandatory)

Run these over the repo after every merge — they catch what auto-merge lets
through. All must return **nothing**:

```bash
# Vue 2 syntax that compiles but breaks or warns at runtime
grep -rnP '(?<!v-)(?<!#)slot="|slot-scope=' src/ --include='*.vue'
grep -rn  '\$set(\|\$delete(\|Vue\.set\|Vue\.delete' src/
grep -rn  '\$snotify\|beforeDestroy\|::v-deep\|\.sync=\|\$scopedSlots\|\$listeners' src/
grep -rn  'process\.browser' src/
grep -rnP '<q-table[^>]*:data=' src/ --include='*.vue'

# Dead Quasar handlers/bindings (no error, silently broken!)
grep -rnP '<q-(range|slider|select|checkbox|toggle|radio|btn-toggle|date|time|input|file)\b[^>]*@input=' src/ --include='*.vue'

# Env keys: every process.env.X used in src MUST be defined in quasar.config.js
# build.env, or webpack leaves a bare `process` that crashes the browser
grep -rhoP 'process\.env\.[A-Z_]+' src/ | sort -u
```

Then lint (deprecation rules are enforced):

```bash
npm run lint 2>&1 | grep -E "deprecated|parsing error"
```

---

## 4. Merge pitfalls we actually hit (check for these!)

### 4.1 Duplicate component options after a merge

Git happily produces a file with **two `computed:` blocks** (or two `methods:`,
`watch:`, …). JavaScript silently discards the first one — features vanish
with no error. This broke `Meters.vue` in the main merge. After resolving any
component conflict:

```bash
grep -c "computed:" src/components/Foo.vue   # must be 1
grep -c "methods:"  src/components/Foo.vue   # must be 1
```

### 4.2 Mechanical renames creating nonsense expressions

The `$scopedSlots` → `$slots` rename turned
`this.$slots.default || this.$scopedSlots.default` into
`this.$slots.default || this.$slots.default`. Harmless-looking, flagged by
Sonar as a bug. When a rename makes both sides of `||`/`&&` identical, delete
one side.

### 4.3 Slot passthrough with undefined scope (blank screens!)

```html
<!-- CRASHES when the slot is invoked without props:
     scope is undefined → Vue passes null props → renderSlot reads null.key -->
<template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
	<slot :name="slot" v-bind="scope" />
</template>

<!-- CORRECT -->
	<slot :name="slot" v-bind="scope || {}" />
```

Symptom in production: the component's children silently don't render (we had
five empty DM-screen panels) and the console repeats
`TypeError: Cannot read properties of null (reading 'key')`.

### 4.4 Named slots on dynamic components

`<component :is="cond ? 'hk-card' : 'div'">` **silently drops named slots**
when it resolves to a plain element. If a dynamic component needs a header
slot in one mode, restructure so the content is a plain child in both modes.

### 4.5 `npm ci` fails in Docker but works locally

```
npm error `npm ci` can only install packages when your package.json and
package-lock.json are in sync. Missing: fsevents@2.3.3 from lock file
```

Running `npm install`/`npm uninstall` on **Linux with npm 10** drops
macOS-only optional deps (fsevents) from the lockfile; the Docker image's
npm 11 then rejects it. Fix:

```bash
npx -y npm@11 install --package-lock-only
git add package-lock.json
```

### 4.6 Invalid HTML table nesting breaks SSR hydration

`<th>` directly inside `<thead>`, or `<tr>` directly inside `<table>` —
browsers re-parent these elements, which breaks Vue's SSR hydration. Always
`<thead><tr><th>…` and wrap body rows in `<tbody>`. The build prints
"cannot be child of" warnings for these — treat them as errors.

### 4.7 Stale service worker after deploying

The PWA uses `skipWaiting` + `clientsClaim`: after a deploy the browser may
serve the **old bundle** on the first load. Before debugging a "broken"
deploy, check the `vendor.*.js` hash in the Network tab actually changed;
hard-refresh once or twice.

### 4.8 Reading production stack traces

Production errors come minified (`vendor.9001f1d8.js:1605:25802`). The bundle
hashes are content-based, so a local `npx quasar build -m ssr` from the same
commit produces **byte-identical files** — open the local copy at that
line/column to see the real code. This is how the DM-screen crash was found.

---

## 5. Verification checklist before pushing the merge

```bash
npm run lint                    # no parsing errors, no vue/no-deprecated-*
npx quasar build                # SPA build must succeed
npx quasar build -m ssr         # SSR build must succeed
npx -y npm@11 ci --dry-run      # lockfile valid for the Docker image
```

Then run the dev server (`npx quasar dev`) and click through **every screen
the feature branch touched**, with the browser console open. Pay special
attention to auth-gated screens (DM screen, run encounter, character builder,
content pages) — automated route audits don't reach them, and that's exactly
where the only post-deploy bug of the main merge was hiding.
