# Phase 2 — Stabilize the Dev Build: Detailed Implementation Plan

> **Goal:** Fix all breaking changes, re-enable all disabled plugins with Vue 3 alternatives, and get every page rendering without runtime errors. The dev server already boots (Phase 1); this phase makes it *functional*.

---

## Execution Order & Dependencies

Phase 2 is divided into **7 steps**, ordered by dependency and risk. Each step is independently testable — run `quasar dev` after each one and verify no new errors appear.

```
Step 1: Fix Immediate Breaking Changes (.sync, ::v-deep, lifecycle hooks)
   ↓
Step 2: Replace vue-snotify → Quasar Notify + Dialog
   ↓
Step 3: Replace vue-shortkey → custom Vue 3 directive
   ↓
Step 4: Upgrade third-party plugins (splitpanes, vuedraggable, flicking, etc.)
   ↓
Step 5: Replace vue-croppa → vue-advanced-cropper
   ↓
Step 6: Migrate vee-validate v3 → v4
   ↓
Step 7: Re-add Google Tag Manager (Vue 3 version)
```

**Rationale for ordering:**
- Step 1 must be first — these are hard runtime errors
- Step 2 is next because snotify is used in 46 files and blocks many pages from working
- Step 3 is independent and small (14 files)
- Step 4 is independent plugin upgrades
- Step 5 is small and isolated (1 file)
- Step 6 is the largest task (51 files) and saved for when the rest is stable
- Step 7 is a trivial add-back, saved for last

**Estimated scope:** ~180 file modifications across all steps

---

## Step 1: Fix Immediate Breaking Changes

These are patterns that cause hard runtime errors or broken behavior right now.

### 1.1 Replace `.sync` modifier (6 files)

The `.sync` modifier was removed in Vue 3. All instances are on `<q-table>` components.

**Files:**
| File | Props using `.sync` |
|---|---|
| `src/components/encounters/Entities.vue:92` | `:pagination.sync` |
| `src/components/userContent/ImportUserContent.vue:92,95` | `:pagination.sync`, `:selected.sync` |
| `src/views/Compendium/Conditions.vue` | `:pagination.sync` |
| `src/views/Compendium/Items.vue` | `:pagination.sync` |
| `src/views/Compendium/Monsters.vue:81` | `:pagination.sync` |
| `src/views/Compendium/Spells.vue` | `:pagination.sync` |

**Pattern:**
```vue
<!-- BEFORE -->
<q-table :pagination.sync="pagination" :selected.sync="selected" />

<!-- AFTER (Quasar v2) -->
<q-table v-model:pagination="pagination" v-model:selected="selected" />
```

> Note: Quasar v2 `q-table` supports `v-model:pagination` and `v-model:selected` natively.

### 1.2 Replace `::v-deep` with `:deep()` (38 files, 41 occurrences)

**Files:**
| File | Occurrences |
|---|---|
| `src/components/combat/side/DamageMeters.vue` | 1 |
| `src/components/combat/actions/Manual.vue` | 1 |
| `src/components/combat/actions/Projectiles.vue` | 1 |
| `src/components/combat/entities/Card/index.vue` | 1 |
| `src/components/combat/entities/quick-edit/ArmorClassQuickEdit.vue` | 1 |
| `src/components/combat/entities/quick-edit/HealthQuickEdit.vue` | 1 |
| `src/components/combat/entities/quick-edit/InitiativeQuickEdit.vue` | 1 |
| `src/components/combat/initiative/index.vue` | 1 |
| `src/components/combat/initiative/NPCs.vue` | 1 |
| `src/components/combat/initiative/Players.vue` | 1 |
| `src/components/combat/Pane.vue` | 1 |
| `src/components/combat/side/Side.vue` | 1 |
| `src/components/dialogs/PatreonLinkDialog.vue` | 1 |
| `src/components/Drawer.vue` | 1 |
| `src/components/encounters/Entities.vue` | 1 |
| `src/components/hk-components/hk-pane.vue` | 1 |
| `src/components/hk-components/hk-rolls/hk-single-roll.vue` | 1 |
| `src/components/home/Builder.vue` | 1 |
| `src/components/home/Header.vue` | 1 |
| `src/components/home/Pricing.vue` | 1 |
| `src/components/npcs/Actions.vue` | 1 |
| `src/components/ToolsPage.vue` | 1 |
| `src/components/trackCampaign/CampaignOverview.vue` | 1 |
| `src/components/userContent/importer/DuplicateOptions.vue` | 1 |
| `src/components/userContent/ImportUserContent.vue` | 1 |
| `src/components/weather/index.vue` | 1 |
| `src/views/Home.vue` | 1 |
| `src/views/Pages/LinkPatreonAccount.vue` | 1 |
| `src/views/Pages/Patreon.vue` | 1 |
| `src/views/Pages/WeatherDemo.vue` | 1 |
| `src/views/Tools/CharacterSync.vue` | 1 |
| `src/views/Tools/DmScreen.vue` | 1 |
| `src/views/Tools/MonsterCreator.vue` | 1 |
| `src/views/UserContent/Campaigns/RunCampaign.vue` | 1 |
| + ~4 more files | |

**Pattern:**
```scss
/* BEFORE */
::v-deep .some-class { color: red; }

/* AFTER */
:deep(.some-class) { color: red; }
```

### 1.3 Replace `beforeDestroy` → `beforeUnmount` (8 files)

**Files:**
| File | Hook |
|---|---|
| `src/views/Home.vue` | `beforeDestroy` |
| `src/components/PromoBanner.vue` | `beforeDestroy` |
| `src/components/trackCampaign/live/Initiative.vue` | `beforeDestroy` |
| `src/components/trackCampaign/index.vue` | `beforeDestroy` |
| `src/components/combat/actions/Manual.vue` | `beforeDestroy` |
| `src/components/hk-components/hk-timer.vue` | `beforeDestroy` |
| `src/components/hk-components/hk-roll.vue` | `beforeDestroy` |
| `src/components/hk-components/hk-popover.vue` | `beforeDestroy` |

**Pattern:**
```js
// BEFORE
beforeDestroy() { ... }

// AFTER
beforeUnmount() { ... }
```

> Note: `destroyed` → `unmounted` was already done for App.vue in Phase 1. These are the remaining instances.

### 1.4 Remove `.native` event modifier (1 file)

**File:** `src/components/hk-components/hk-popover.vue:13`

```vue
<!-- BEFORE -->
<div @mouseover.native="show" @mouseout.native="hide">

<!-- AFTER -->
<div @mouseover="show" @mouseout="hide">
```

### 1.5 Verify: `$scopedSlots` → `$slots` (6 files)

These work under compat mode but should be fixed now to reduce warnings:

| File | Usage |
|---|---|
| `src/components/hk-components/hk-card.vue:84` | `this.$scopedSlots.default` |
| `src/components/hk-components/hk-select.vue:16,51-56` | `$scopedSlots` |
| `src/components/hk-components/hk-tip.vue:44,47` | `this.$scopedSlots` |
| `src/components/hk-components/hk-input.vue:16` | slot forwarding |
| `src/components/hk-components/hk-dialog.vue` | slot checks |
| `src/components/hk-components/hk-pane.vue` | slot checks |

**Pattern:**
```js
// BEFORE
if (this.$scopedSlots.default) { ... }

// AFTER
if (this.$slots.default) { ... }
```

**Step 1 total: ~55 files modified**

---

## Step 2: Replace vue-snotify → Quasar Notify + Dialog

**Scope:** 46 files, ~73 calls (20 success, 42 error, 4 warning, + 12 confirm dialogs)

### 2.1 Create a notification helper utility

Create `src/utils/notify.js` to centralize the migration and provide a clean API:

```js
import { Notify, Dialog } from 'quasar';

export function notifySuccess(message, title) {
  Notify.create({
    message: title ? `${title}: ${message}` : message,
    type: 'positive',
    position: 'top',
    timeout: 3000,
  });
}

export function notifyError(message, title) {
  Notify.create({
    message: title ? `${title}: ${message}` : message,
    type: 'negative',
    position: 'top',
    timeout: 5000,
  });
}

export function notifyWarning(message, title) {
  Notify.create({
    message: title ? `${title}: ${message}` : message,
    type: 'warning',
    position: 'top',
    timeout: 4000,
  });
}

export function confirmAction({ title, message, onOk, okLabel = 'Yes', cancelLabel = 'No' }) {
  Dialog.create({
    title,
    message,
    cancel: { label: cancelLabel, flat: true },
    ok: { label: okLabel, color: 'negative', flat: true },
    persistent: true,
  }).onOk(onOk);
}
```

### 2.2 Migration pattern for simple notifications (34 files)

```js
// BEFORE
this.$snotify.success('Item saved', 'Success');
this.$snotify.error('Failed to save', 'Error');
this.$snotify.warning('No connection');

// AFTER
import { notifySuccess, notifyError, notifyWarning } from 'src/utils/notify';
notifySuccess('Item saved', 'Success');
notifyError('Failed to save', 'Error');
notifyWarning('No connection');
```

### 2.3 Migration pattern for confirm dialogs (12 files, 12 confirm patterns)

All confirm patterns follow the same structure. Example:

```js
// BEFORE
this.$snotify.error(
  'Are you sure you want to delete "' + name + '"?',
  "Delete character",
  {
    buttons: [
      { text: "Yes", action: (toast) => { this.remove(key); this.$snotify.remove(toast.id); } },
      { text: "No", action: (toast) => { this.$snotify.remove(toast.id); } },
    ],
  }
);

// AFTER
import { confirmAction } from 'src/utils/notify';
confirmAction({
  title: 'Delete character',
  message: `Are you sure you want to delete "${name}"?`,
  onOk: () => this.remove(key),
});
```

### 2.4 Files with confirm patterns (12 instances in 10 files)

| File | Confirm Action |
|---|---|
| `src/views/UserContent/CharacterBuilder/EditCharacter/class/index.vue` | Change class (×2: selectClass, confirmDeleteClass) |
| `src/components/combat/Targets.vue` | Remove entity from encounter |
| `src/components/campaign/EditDamageMeters.vue` | Reset all meters |
| `src/components/combat/mobile/Menu.vue` | Remove entity from encounter |
| `src/components/combat/TargetMenu.vue` | Remove entity from encounter |
| `src/components/combat/top/Menu.vue` | Finish encounter |
| `src/views/UserContent/Spells/Spells.vue` | Delete spell |
| `src/views/UserContent/CharacterBuilder/index.vue` | Delete character |
| `src/views/UserContent/Encounters/index.vue` | Delete encounter (×2: single, all finished) |
| `src/views/UserContent/Npcs/Npcs.vue` | Delete NPC |
| `src/views/UserContent/Players/index.vue` | Delete player |

### 2.5 Cleanup

- Remove `src/boot/vue-snotify.js`
- Remove `vue-snotify` from `package.json`
- Remove snotify CSS imports (if any in `src/css/`)
- Ensure `Dialog` plugin is in `quasar.config.js` framework plugins (already present)

**Step 2 total: 46 files modified, 1 new utility file, 1 boot file deleted**

---

## Step 3: Replace vue-shortkey → Custom Vue 3 Directive

**Scope:** 14 files, 24 keyboard shortcuts

### 3.1 Create a custom `v-shortkey` directive

Create `src/directives/shortkey.js`:

```js
// Lightweight Vue 3 keyboard shortcut directive
// Replicates vue-shortkey behavior with { prevent: ['input', 'textarea'] }

function keyMatchesShortcut(event, keys) {
  const pressed = [];
  if (event.ctrlKey) pressed.push('ctrl');
  if (event.shiftKey) pressed.push('shift');
  if (event.altKey) pressed.push('alt');
  pressed.push(event.key.toLowerCase());

  if (keys.length !== pressed.length) return false;
  return keys.every(k => pressed.includes(k.toLowerCase()));
}

function shouldPrevent(event) {
  const tag = event.target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
}

const handlers = new WeakMap();

export const shortkey = {
  mounted(el, binding) {
    let shortcuts;
    const value = binding.value;

    // Normalize: array → single shortcut, object → named shortcuts
    if (Array.isArray(value)) {
      shortcuts = { default: value };
    } else {
      shortcuts = value;
    }

    const handler = (event) => {
      if (shouldPrevent(event)) return;
      for (const [name, keys] of Object.entries(shortcuts)) {
        if (keyMatchesShortcut(event, keys)) {
          event.preventDefault();
          el.dispatchEvent(new CustomEvent('shortkey', { detail: { srcKey: name } }));
        }
      }
    };

    handlers.set(el, handler);
    window.addEventListener('keydown', handler);
  },
  unmounted(el) {
    const handler = handlers.get(el);
    if (handler) {
      window.removeEventListener('keydown', handler);
      handlers.delete(el);
    }
  },
};

export default {
  install(app) {
    app.directive('shortkey', shortkey);
  },
};
```

### 3.2 Create new boot file

Replace `src/boot/vue-shortkey.js`:

```js
import shortkeyPlugin from 'src/directives/shortkey';

export default async ({ app }) => {
  app.use(shortkeyPlugin);
};
```

### 3.3 Re-enable in quasar.config.js

Uncomment the `vue-shortkey` boot entry in `quasar.config.js`.

### 3.4 Files using `v-shortkey` (14 files, 24 shortcuts)

| File | Shortcuts |
|---|---|
| `src/components/Drawer.vue` | `['esc']` — hide drawer |
| `src/components/combat/Targets.vue` | `['=']`, `['shift','+']`, `['arrowdown']`, `['shift','arrowdown']`, `['arrowup']`, `['shift','arrowup']`, `[i]` (dynamic index 0-9) |
| `src/components/combat/top/EncounterProgress.vue` | `['shift','arrowleft']`, `['shift','arrowright']` — prev/next turn |
| `src/components/combat/side/log/index.vue` | `['ctrl','z']` — undo |
| `src/components/combat/legacy/side/Log.vue` | `['ctrl','z']` — undo |
| `src/views/RunEncounter.vue` | `['d']` focus damage, `[',']`/`['.']` cycle panes, `['esc']` clear |
| `src/components/combat/actor/SelectActor.vue` | `['shift','d']` — toggle menu |
| `src/components/combat/actor/ActionsDropdown.vue` | `['a']` actions, `['s']` spells |
| `src/components/combat/actions/Manual.vue` | `['d']` — focus damage |
| `src/components/combat/legacy/Turns.vue` | `['shift','arrowleft']`, `['shift','arrowright']` — prev/next turn |
| `src/components/combat/initiative/index.vue` | `[',']`/`['.']` — cycle panes |
| `src/components/hk-components/hk-rolls/index.vue` | `['esc']` — close roll sheet |
| `src/components/header/index.vue` | `['r']` — open dice roller |

**No changes needed to the template syntax** — the `v-shortkey` directive and `@shortkey` event handler pattern remain the same. The custom directive replicates this behavior.

**Step 3 total: 1 new file, 1 modified boot file, 1 config change**

---

## Step 4: Upgrade Third-Party Plugins

### 4.1 Upgrade splitpanes v2 → v3 (1 dependency, ~3 files)

```bash
npm install splitpanes@^3
```

**Breaking changes in splitpanes v3:**
- Component names remain `Splitpanes` and `Pane`
- Props are largely the same
- CSS class names may differ — check `src/css/splitpanes.scss`

**Files to verify:**
- `src/boot/plugins.js` — already registers `Splitpanes` and `Pane` globally
- `src/views/UserContent/Campaigns/RunCampaign.vue` — main usage
- `src/components/combat/Pane.vue` — custom wrapper
- `src/components/hk-components/hk-pane.vue` — custom wrapper
- `src/css/splitpanes.scss` — custom styles (may need class name updates)

### 4.2 Upgrade vuedraggable v2 → v4 (1 dependency, 2 files)

```bash
npm install vuedraggable@^4.1
```

**Breaking changes in vuedraggable v4:**
- No longer wraps `<transition-group>` — uses `<component :is>` approach
- `tag` prop replaced with `item-key` prop
- Uses `modelValue` instead of `value`

**Files to update:**
| File | Current Pattern | New Pattern |
|---|---|---|
| `src/components/combat/Targets.vue` | `<draggable tag="div" :value="targets">` wrapped in `<transition-group>` | `<draggable :list="targets" item-key="key" tag="transition-group">` |
| `src/components/npcs/Actions.vue` | `<draggable tag="div" v-model="npc[category]">` wrapped in `<transition-group>` | `<draggable v-model="npc[category]" item-key="..."  tag="transition-group">` |

### 4.3 Verify @egjs/vue-flicking (1 file)

The package `@egjs/vue-flicking@4.12.0` supports Vue 3, but the import path may need to change:

**File:** `src/components/home/Feedback.vue`

```js
// CURRENT — check if this works
import { Flicking } from "@egjs/vue-flicking";

// IF NEEDED — switch to Vue 3 specific package
import { Flicking } from "@egjs/vue3-flicking";
```

Test by loading the home page and checking the feedback carousel renders.

### 4.4 Remove vue2-flip-countdown (0 files)

**No code uses this package.** It's declared in `package.json` but never imported. Simply remove:

```bash
npm uninstall vue2-flip-countdown
```

### 4.5 Verify vue-qr (1 file)

**File:** `src/components/PlayerLink.vue`

`vue-qr@4.0.9` supports Vue 3. Verify it renders correctly — no code changes expected.

**Step 4 total: 2-5 files modified, dependency updates**

---

## Step 5: Replace vue-croppa → vue-advanced-cropper

**Scope:** 1 file (`src/components/hk-components/hk-image-uploader.vue`)

### 5.1 Install replacement

```bash
npm uninstall vue-croppa
npm install vue-advanced-cropper@^2
```

### 5.2 Rewrite the cropper component

**Current croppa usage:**
```vue
<croppa
  v-model="crop"
  :width="250"
  :height="250"
  placeholder="Choose an image"
  :prevent-white-space="true"
  :show-remove-button="false"
  @file-choose="startCrop"
  @image-remove="stopCrop"
/>
```

**Operations used:** `crop.rotate(-1)`, `crop.flipY()`, `crop.flipX()`, `crop.generateDataUrl()`, `crop.remove()`

**New pattern with vue-advanced-cropper:**
```vue
<Cropper
  ref="cropper"
  :src="imageSrc"
  :stencil-props="{ aspectRatio: 1 }"
  :canvas="{ width: 250, height: 250 }"
/>
```

**Operation mapping:**
| vue-croppa | vue-advanced-cropper |
|---|---|
| `crop.rotate(-1)` | `this.$refs.cropper.rotate(-90)` |
| `crop.flipY()` | `this.$refs.cropper.flip(false, true)` |
| `crop.flipX()` | `this.$refs.cropper.flip(true, false)` |
| `crop.generateDataUrl()` | `this.$refs.cropper.getResult().canvas.toDataURL()` |
| `crop.remove()` | Reset `imageSrc` to null |

This is a Patreon-tier feature — test with a Patreon user account if possible.

**Step 5 total: 1 file rewritten**

---

## Step 6: Migrate vee-validate v3 → v4

**Scope:** 51 files, largest task in Phase 2

### 6.1 Install vee-validate v4

```bash
npm uninstall vee-validate
npm install vee-validate@^4.13 @vee-validate/rules@^4.13
```

### 6.2 Strategy: Use v4 Component API (minimal template changes)

VeeValidate v4 offers two approaches:
1. **Composition API** (`useForm`, `useField`) — requires rewriting every form to `<script setup>`
2. **Component API** (`<Form>`, `<Field>`, `<ErrorMessage>`) — closest to v3's `<ValidationObserver>`/`<ValidationProvider>`

**We will use the Component API** to minimize template changes. The migration is primarily a rename:

| vee-validate v3 | vee-validate v4 |
|---|---|
| `<ValidationObserver>` | `<Form>` (or alias as `<VForm>` to avoid conflict with `<q-form>`) |
| `<ValidationProvider>` | `<Field>` (or alias as `<VField>`) |
| `v-slot="{ handleSubmit, valid }"` | `v-slot="{ handleSubmit, meta }"` (`meta.valid` replaces `valid`) |
| `v-slot="{ errors, invalid, validated }"` | `v-slot="{ errorMessage, field }"` (simplified) |
| `extend('ruleName', ...)` | `defineRule('ruleName', ...)` |
| `rules="required\|email"` | `rules="required\|email"` (same!) |

### 6.3 Rewrite boot file

Replace `src/boot/vee-validate.js`:

```js
import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate';
import {
  required, length, max, min, max_value, min_value,
  alpha_dash, numeric, alpha_num, email, confirmed, between
} from '@vee-validate/rules';
import { db } from 'src/firebase';

export default async ({ app }) => {
  // Register components globally
  // Use V-prefixed names to avoid conflict with HTML <form> and Quasar components
  app.component('VForm', Form);
  app.component('VField', Field);
  app.component('VErrorMessage', ErrorMessage);

  // Also register under old names for gradual migration
  app.component('ValidationObserver', Form);
  app.component('ValidationProvider', Field);

  // Built-in rules
  defineRule('required', required);
  defineRule('max', max);
  defineRule('max_value', max_value);
  defineRule('min', min);
  defineRule('min_value', min_value);
  defineRule('length', length);
  defineRule('alpha_dash', alpha_dash);
  defineRule('numeric', numeric);
  defineRule('alpha_num', alpha_num);
  defineRule('email', email);
  defineRule('confirmed', confirmed);
  defineRule('between', between);

  // Custom rules
  defineRule('recharge', (value) => {
    if (!value) return 'Allowed format: 6, 5-6 or rest';
    return /^[\d]+(-[\d]+)*$/.test(value) || value === 'rest' || 'Allowed format: 6, 5-6 or rest';
  });

  defineRule('range', (value) => {
    if (!value) return 'Allowed format: 20 or 20/60';
    return /^[\d]+(\/[\d]+)*$/.test(value) || 'Allowed format: 20 or 20/60';
  });

  defineRule('hit_dice', (value) => {
    if (!value) return 'Allowed format: 2d6';
    return /^[\d]+d[\d]+$/.test(value) || 'Allowed format: 2d6';
  });

  defineRule('url', (value) => {
    if (!value) return '{field} must be a valid URL';
    const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z\d]+([-.]{1}[a-z\d]+)*\.[a-z]{2,5}(:[\d]{1,5})?(\/.*)?$/;
    return regex.test(value) || '{field} must be a valid URL';
  });

  defineRule('audio', (value) => {
    if (!value) return '{field} must be a valid URL or URI';
    const url_expr = /[A-z\d@:%._+~#=-]{1,256}\.[A-z\d()]{1,6}\b([A-z\d()@:%_+.~#?&/=-]+)?/gi;
    const spotify_expr = /^spotify:.+/gi;
    return url_expr.test(value) || spotify_expr.test(value) || '{field} must be a valid URL or URI';
  });

  defineRule('variable_check', (value, [variables]) => {
    const regexpr = /\[(\w+)\]/g;
    const text_vars = value.match(regexpr);
    if (!text_vars) return true;
    for (const v of text_vars) {
      const stripped = v.slice(1, -1);
      if (!variables || !Object.keys(variables).includes(stripped)) {
        return 'Contains undefined variables.';
      }
    }
    return true;
  });

  defineRule('json', (value) => {
    try { JSON.parse(value); return true; }
    catch { return 'Invalid JSON'; }
  });

  defineRule('username', async (value) => {
    const username_ref = db.ref('search_users').orderByChild('username').equalTo(value.toLowerCase());
    let exists = false;
    await username_ref.once('value', (snapshot) => { exists = snapshot.exists(); });
    return !exists || 'This username has already been taken';
  });

  // Configure default messages
  configure({
    generateMessage: (ctx) => `${ctx.field} is invalid`,
  });
};
```

### 6.4 Template migration patterns

**Pattern A: Forms with `<ValidationObserver>` + `<ValidationProvider>` (41 files)**

The v4 `<Form>` and `<Field>` components have different slot props:

```vue
<!-- BEFORE (v3) -->
<ValidationObserver v-slot="{ handleSubmit, valid }">
  <q-form @submit.prevent="handleSubmit(onSubmit)">
    <ValidationProvider rules="required|max:100" name="Name" v-slot="{ errors, invalid, validated }">
      <q-input v-model="name" :error="invalid && validated" :error-message="errors[0]" />
    </ValidationProvider>
    <q-btn type="submit" :disabled="!valid" />
  </q-form>
</ValidationObserver>

<!-- AFTER (v4) — minimal changes -->
<VForm v-slot="{ handleSubmit, meta }" as="div">
  <q-form @submit.prevent="handleSubmit($event, onSubmit)">
    <VField rules="required|max:100" name="Name" v-slot="{ errors, field }" v-model="name">
      <q-input v-bind="field" v-model="name" :error="!!errors.length" :error-message="errors[0]" />
    </VField>
    <q-btn type="submit" :disabled="!meta.valid" />
  </q-form>
</VForm>
```

**Key differences:**
- `valid` → `meta.valid`
- `invalid && validated` → `!!errors.length` (or `meta.dirty && !meta.valid` for Field)
- `handleSubmit(fn)` → `handleSubmit($event, fn)` (v4 takes event first)
- Add `as="div"` to `<VForm>` to prevent it rendering its own `<form>` (since we wrap `<q-form>`)

**Pattern B: Wrapper components `hk-input` and `hk-select` (2 files, impacts ~40+ consumers)**

These are the most critical files because they wrap `ValidationProvider` internally:

```vue
<!-- BEFORE (hk-input.vue) -->
<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
  <q-input v-model="modelValue" :error="invalid && validated" :error-message="errors[0]" />
</ValidationProvider>

<!-- AFTER (hk-input.vue) -->
<VField :rules="rules" :name="name" v-slot="{ errors }" v-model="modelValue" as="div">
  <q-input v-model="modelValue" :error="!!errors.length" :error-message="errors[0]" />
</VField>
```

Since `hk-input` and `hk-select` wrap the validation internally, updating these 2 files fixes validation for ~40 consuming files automatically.

**Pattern C: Legacy `v-validate` directive (4 files)**

These must be fully rewritten since vee-validate v4 has no directive:

| File | Approach |
|---|---|
| `src/views/Admin/Patrons/New.vue` | Convert `v-validate` to `<VField>` wrapper |
| `src/components/EffectsForm.vue` | Convert `v-validate` and `errors.has()`/`errors.first()` |
| `src/views/UserContent/Players/EditPlayer.vue` | Check for mixed usage |
| `src/components/drawers/trackCampaign/playerRequests/index.vue` | Convert directive usage |

### 6.5 Migration sub-steps (recommended order)

1. **Rewrite boot file** — install v4, define all rules
2. **Update `hk-input.vue` and `hk-select.vue`** — fixes ~40 files automatically
3. **Update `hk-image-uploader.vue`** and `hk-action-roll-form.vue` — other hk-component wrappers
4. **Update remaining `ValidationObserver`/`ValidationProvider` usage** — ~35 files, mechanical rename
5. **Convert 4 legacy `v-validate` files** — manual rewrite
6. **Re-enable vee-validate boot entry** in `quasar.config.js`
7. **Test all forms** — sign up, NPC editing, item editing, spell editing, player editing, character builder

**Step 6 total: ~51 files modified, 1 boot file rewritten**

---

## Step 7: Re-add Google Tag Manager

### 7.1 Install Vue 3 GTM package

```bash
npm install @gtm-support/vue-gtm@^2
```

### 7.2 Add to plugins boot file

In `src/boot/plugins.js`, re-add the GTM registration:

```js
import { createGtm } from '@gtm-support/vue-gtm';

export default async ({ app, router }) => {
  // ... existing code ...

  app.use(createGtm({
    id: 'GTM-5XJCCDMS',
    vueRouter: router,
    enabled: process.env.NODE_ENV === 'production',
  }));
};
```

**Step 7 total: 1 file modified, 1 dependency added**

---

## Summary Table

| Step | Task | Files | Risk | Dependency |
|---|---|---|---|---|
| 1.1 | Replace `.sync` modifier | 6 | Low | None |
| 1.2 | Replace `::v-deep` → `:deep()` | 38 | Low | None |
| 1.3 | `beforeDestroy` → `beforeUnmount` | 8 | Low | None |
| 1.4 | Remove `.native` modifier | 1 | Low | None |
| 1.5 | `$scopedSlots` → `$slots` | 6 | Low | None |
| 2 | Replace vue-snotify | 46 + 1 new | Medium | Step 1 |
| 3 | Replace vue-shortkey | 1 new + 1 boot | Low | None |
| 4.1 | Upgrade splitpanes | ~3 | Low | None |
| 4.2 | Upgrade vuedraggable | 2 | Medium | None |
| 4.3 | Verify @egjs/vue-flicking | 1 | Low | None |
| 4.4 | Remove vue2-flip-countdown | 0 | None | None |
| 5 | Replace vue-croppa | 1 | Low | None |
| 6 | Migrate vee-validate v3→v4 | ~51 | **High** | Steps 1-5 |
| 7 | Re-add GTM | 1 | Low | None |

**Total: ~180 file modifications**

---

## Testing Checklist

After completing all steps, verify these critical flows work:

- [ ] Dev server boots without errors (`quasar dev`)
- [ ] Home page renders (Flicking carousel, pricing section)
- [ ] Sign up / Sign in forms validate
- [ ] Campaign list loads, create/delete campaigns
- [ ] Encounter list loads, create/delete encounters
- [ ] Run encounter: targets render, keyboard shortcuts work, damage input works
- [ ] NPC editor: all form sections validate, draggable actions work
- [ ] Spell editor: form validates, save works
- [ ] Item editor: form validates, image URL validates
- [ ] Player editor: form validates
- [ ] Character builder: race/class/abilities validate
- [ ] Image uploader: cropper works (Patreon feature)
- [ ] Campaign splitpanes layout renders
- [ ] Damage meters display
- [ ] QR code for player link renders
- [ ] Notifications appear for success/error/warning actions
- [ ] Confirm dialogs work for delete operations
- [ ] Console shows only compat deprecation warnings (no errors)

---

## Files Created/Deleted Summary

**New files:**
- `src/utils/notify.js` — notification helper (Step 2)
- `src/directives/shortkey.js` — keyboard shortcut directive (Step 3)

**Deleted files:**
- `src/boot/vue-snotify.js` — replaced by Quasar Notify (Step 2)

**Rewritten files:**
- `src/boot/vee-validate.js` — v3 → v4 API (Step 6)
- `src/boot/vue-shortkey.js` — uses custom directive (Step 3)

**Dependencies removed:**
- `vue-snotify`
- `vue-shortkey`
- `vue-croppa`
- `vue2-flip-countdown`

**Dependencies added:**
- `vee-validate@^4.13`
- `@vee-validate/rules@^4.13`
- `vue-advanced-cropper@^2`
- `@gtm-support/vue-gtm@^2`
- `splitpanes@^3` (upgrade)
- `vuedraggable@^4.1` (upgrade)
