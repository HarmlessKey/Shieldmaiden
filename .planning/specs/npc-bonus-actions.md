# NPC Bonus Actions

## Goal

Add a visible "Bonus Actions" section to NPC action display and editing. The storage model is unchanged: bonus actions live in the existing `actions` array with an optional `timing: "bonus_action"` field. The UI splits that array into two rendered sections ("Actions" and "Bonus Actions") by filtering on this field. No new Firebase arrays, no combat system changes, no data migration.

## Context

### Key findings from investigation

**Data layer (two hard blockers):**
- `src/schemas/hk-npc-schema.json` defines action items with `"additionalProperties": false`. A `timing` field will be rejected by import validation unless explicitly added.
- `firebase-rules.json` has `"$other": { ".validate": false }` under the `actions` array. Firebase will deny any write that includes an unknown field. Both files must be updated before any UI changes.
- Precedent: `hk-spell-schema.json` already uses `"bonus_action"` as a `cast_time_type` enum value. Use the same string.

**`src/components/npcs/Actions.vue` (edit component):**
- A `data()` array named `actions` (4 entries) drives a `v-for` loop that renders each section (header, Add button, draggable list).
- Current `draggable` uses `v-model="npc[category]"` with no `@change` handler — vue-draggable mutates the array directly.
- All action-manipulation methods (`remove`, `removeOption`, `newRoll`, `editRoll`, `deleteRoll`) receive `ability_index` from the inner `v-for` loop and use it to index directly into `npc[category]`.
- `add(category)` pushes a bare `{ name: "New", action_list: [{ type }] }` object with no `timing` field.

**Display-only components (`CardActions.vue`, `Monster.vue`):**
- Both iterate the same 4-entry `actions` config array, render `entity[category]` or `monster[category]` unfiltered. No drag-and-drop, no methods.

**`combat/actor/Actions.vue`:**
- Uses a different `action_types` object format (not an array). No changes needed — it filters by whether an action has rollable `action_list` items, not by timing.

**No tests exist** in this codebase. Nothing to break on that front.

## Implementation Steps

### Step 1 — Update `src/schemas/hk-npc-schema.json`

In the `actions.items.properties` object (which currently has `name`, `recharge`, `limit`, `limit_type`, `desc`, `reach`, `range`, `aoe_type`, `aoe_size`, `options`, `action_list`), add:

```json
"timing": {
  "title": "Action timing",
  "type": "string",
  "enum": ["action", "bonus_action"]
}
```

Field is optional (not added to `required`). The four action array schemas (`special_abilities`, `actions`, `legendary_actions`, `reactions`) each have their own `items` block — add `timing` only to `actions.items.properties` since only actions can be bonus actions.

**File touched:** `src/schemas/hk-npc-schema.json`

---

### Step 2 — Update `firebase-rules.json`

Inside the `"$actionIndex"` block under `"actions"`, before the `"$other": { ".validate": false }` catch-all, add:

```json
"timing": {
  ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^(action|bonus_action)$/))"
}
```

The `!newData.exists()` clause allows the field to be absent entirely (backward compatibility for existing NPCs without timing).

**File touched:** `firebase-rules.json`

---

### Step 3 — Update `src/components/npcs/Actions.vue`

This is the main change. It requires extending the config array, adding computed properties and methods, extending `add()`, adding a timing dropdown, and updating the template. Do all sub-steps together — partial states will break the component.

#### 3a. Extend the `actions` config array

Add a fifth entry for Bonus Actions between Actions and Legendary Actions. The new entry has `category: "actions"` (same storage target) and a `timing` field that carries routing information through the template loop:

```javascript
actions: [
  { category: "special_abilities", name: "Special Abilities", name_single: "Special ability" },
  { category: "actions",           name: "Actions",           name_single: "Action" },
  { category: "actions",           name: "Bonus Actions",     name_single: "Bonus action", timing: "bonus_action" },
  { category: "legendary_actions", name: "Legendary Actions", name_single: "Legendary action" },
  { category: "reactions",         name: "Reactions",         name_single: "Reaction" },
],
```

`timing` is absent on all other entries (undefined = regular action). All rendering and routing logic reads from this config.

#### 3b. Add `regularActions` and `bonusActions` read-only computed properties

These provide stable array references for the draggable `:list` binding. A factory function returning a new array each call cannot be used with `:list` — sortable.js resets its internal DOM state when the bound reference changes on every render.

```javascript
regularActions() {
  return (this.npc.actions || []).filter(a => !a.timing || a.timing === "action");
},
bonusActions() {
  return (this.npc.actions || []).filter(a => a.timing === "bonus_action");
},
```

The template resolves which computed to bind based on whether the config entry's `timing` field is set.

#### 3c. Add `getActionIndex(action)` method and `onDraggableChange` handler

**`getActionIndex`** maps a filtered-loop item back to its real index in `npc.actions`. All existing action-manipulation methods (`remove`, `removeOption`, `newRoll`, `editRoll`, `deleteRoll`) use `ability_index` to index directly into `npc[category]`. With filtered v-for loops the loop index is relative to the filtered array — this method bridges that gap.

```javascript
getActionIndex(action) {
  return (this.npc.actions || []).indexOf(action);
},
```

`indexOf` uses object reference equality. The computed getter returns the same references (no clones), so this is safe. **Do not change any existing method signatures** — only update template callsites (step 3f).

**`onDraggableChange`** is the `@change` handler for both action draggables. It translates filtered-array indices back to real array indices after a drag reorder:

```javascript
onDraggableChange(event, category, timing) {
  if (!event.moved) return;
  const { oldIndex, newIndex } = event.moved;
  // Collect the real indices of items belonging to this section
  const slots = (this.npc[category] || [])
    .map((a, i) => i)
    .filter(i =>
      timing
        ? this.npc[category][i].timing === timing
        : !this.npc[category][i].timing || this.npc[category][i].timing === "action"
    );
  // Splice the item in the real array
  const arr = [...this.npc[category]];
  const [item] = arr.splice(slots[oldIndex], 1);
  arr.splice(slots[newIndex], 0, item);
  this.npc[category] = arr;
},
```

`event.added` and `event.removed` are ignored — cross-section dragging is disabled via `:group` (step 3f), so only `event.moved` fires.

#### 3d. Extend `add(category, timing)` method

Change signature from `add(category)` to `add(category, timing = null)`. The `timing` value comes from the config entry via `@click="add(category, timing)"` in the template loop.

```javascript
add(category, timing = null) {
  let type;
  if (category === "actions" && !timing) {
    type = "melee_weapon";
  } else if (category === "legendary_actions") {
    type = "save";
  } else {
    type = "other";
  }

  const action = {
    name: "New",
    action_list: [{ type }],
  };

  if (timing) {
    action.timing = timing;
  }
  // Absent timing = regular action (backward compatible with existing data)

  if (!this.npc[category]) {
    this.npc[category] = [];
  }
  this.npc[category].push(action);
  this.$forceUpdate();
},
```

Bonus actions get `type: "other"` by default (same as reactions/special abilities). Existing call sites that pass only `category` continue to work.

#### 3e. Add timing dropdown inside the action accordion body

In the accordion body for each action item (where `name`, `desc`, `recharge`, etc. are edited), add a select control gated with `v-if="category === 'actions'"` — it does not apply to special abilities, legendary actions, or reactions.

```vue
<q-select
  v-if="category === 'actions'"
  :value="ability.timing || 'action'"
  :options="[
    { label: 'Action', value: 'action' },
    { label: 'Bonus Action', value: 'bonus_action' },
  ]"
  label="Timing"
  emit-value
  map-options
  @input="val => { $set(ability, 'timing', val); $forceUpdate(); }"
/>
```

Use `$set` (not `v-model`) to ensure Vue 2 reactivity fires for the `timing` property on old action objects stored without it. `$forceUpdate()` triggers re-filtering of the two sections after the change.

#### 3f. Update the template loop

**Loop key:** Two entries now share `category: "actions"`. Change the `:key` on the outer loop element from `:key="category"` to a composite:

```vue
:key="`${category}-${timing || 'default'}`"
```

This prevents Vue from reusing the wrong DOM node across the two actions sections.

**Destructure `timing` from the loop:**

```vue
<template v-for="{ name, category, name_single, timing } in actions">
```

**Visibility condition:** The existing `v-if="npc[category] && npc[category].length > 0"` would show or hide both actions sections together since both read `npc.actions`. Replace with a per-section check. Add a helper method:

```javascript
sectionItems(category, timing) {
  if (category !== "actions") return this.npc[category] || [];
  return timing ? this.bonusActions : this.regularActions;
},
```

Then use `v-if="sectionItems(category, timing).length > 0"` on the section wrapper.

**Add button:** Change `@click="add(category)"` to `@click="add(category, timing)"`. `timing` is `undefined` for non-bonus entries, so existing sections are unaffected.

**Draggable binding:** Replace `v-model="npc[category]"` with `:list` + `@change`. For the actions category, bind to the named computed; for all other categories, bind to `npc[category]` directly (no filtering needed):

```vue
<draggable
  tag="div"
  :list="sectionItems(category, timing)"
  :animation="200"
  class="accordion"
  handle=".drag-handle"
  ghost-class="drag-ghost"
  drag-class="drag-dragging"
  :force-fallback="true"
  :group="{ name: `${category}-${timing || 'default'}`, pull: false, put: false }"
  @change="category === 'actions' ? onDraggableChange($event, category, timing) : null"
>
```

`:group` with a unique name per section and `pull: false, put: false` prevents cross-section dragging. Without this, items can be dragged between Actions and Bonus Actions, bypassing the timing field.

Note: for the non-actions categories this switches from `v-model` to `:list` with no `@change` handler, which means reordering those categories will no longer persist. To keep their reorder working, either keep `v-model="npc[category]"` on a separate branch in the template for non-actions sections, or provide a generic `@change` handler that directly mutates `npc[category]` for non-filtered lists.

**Inner v-for and method calls:** Iterate over `sectionItems(category, timing)`:

```vue
<div
  v-for="(ability, filtered_index) in sectionItems(category, timing)"
  :key="`${category}-${timing || 'default'}-${getActionIndex(ability) ?? filtered_index}`"
>
```

Replace every occurrence of `ability_index` in method calls within the accordion with `getActionIndex(ability)`:
- `@click="remove(category, ability_index)"` → `@click="remove(category, getActionIndex(ability))"`
- `newRoll(category, ability_index, ...)` → `newRoll(category, getActionIndex(ability), ...)`
- All other action-manipulation method calls follow the same pattern.

`filtered_index` is unused in method calls — only used as a `:key` fallback for newly pushed items not yet reflected in `npc.actions`.

**File touched:** `src/components/npcs/Actions.vue`

---

### Step 4 — Update `src/components/combat/entities/Card/CardActions.vue`

Display-only change. No drag-and-drop.

Add two computed properties:

```javascript
regularActions() {
  return (this.entity.actions || []).filter(a => !a.timing || a.timing === "action");
},
bonusActions() {
  return (this.entity.actions || []).filter(a => a.timing === "bonus_action");
},
```

In the template, replace the section that renders `entity.actions` (the `category: "actions"` entry in the existing loop) with two inline blocks:

```vue
<!-- Regular actions -->
<template v-if="regularActions.length > 0">
  <h3 class="label">Actions</h3>
  <div v-for="(action, idx) in regularActions" :key="`action-${idx}`">
    <!-- existing action display markup -->
  </div>
</template>

<!-- Bonus actions -->
<template v-if="bonusActions.length > 0">
  <h3 class="label">Bonus Actions</h3>
  <div v-for="(action, idx) in bonusActions" :key="`bonus-${idx}`">
    <!-- same display markup -->
  </div>
</template>
```

The display markup inside the loops is identical to the current `entity.actions` rendering — duplicate it for the bonus section.

**File touched:** `src/components/combat/entities/Card/CardActions.vue`

---

### Step 5 — Update `src/components/compendium/Monster.vue`

Same pattern as Step 4. Display-only, no drag-and-drop.

Add `regularActions` and `bonusActions` computed properties on `this.monster.actions` using the same filter logic. Split the actions section in the template the same way — replace the `category: "actions"` entry's rendering with two filtered blocks.

**File touched:** `src/components/compendium/Monster.vue`

---

## Constraints & Gotchas

- **Both `hk-npc-schema.json` and `firebase-rules.json` must be updated first.** Deploying the UI before updating Firebase rules will cause write failures the moment a user saves an NPC with a `timing` field.

- **`additionalProperties: false` in the schema** means `timing` must appear in `properties` — it is not enough to simply not validate it.

- **Vue 2 reactivity and new properties:** Old NPC action objects stored in Firebase won't have a `timing` key. Use `this.$set(ability, 'timing', val)` in the timing dropdown's `@input` handler — direct assignment (`ability.timing = val`) is not reactive for properties that didn't exist at object creation.

- **`getActionIndex` relies on object reference equality.** The computed getter returns item references from the original array without cloning. Do not clone items in the getter or `indexOf` will return -1.

- **Cross-section drag prevention:** The `:group` prop with `pull: false, put: false` and a unique group name per section is essential. Without it, items can be dragged between sections without updating the `timing` field.

- **`:list` vs `v-model` for non-actions categories:** Switching all sections to `:list` + `@change` means the non-actions categories lose their reorder persistence unless a generic `@change` handler is provided for them. Decide during implementation whether to use a unified `:list` approach with a catch-all handler, or keep `v-model` for the simple (unfiltered) categories.

- **`$forceUpdate()` after timing toggle:** Vue 2 won't re-render filtered sections automatically when `timing` is set via `$set` on a previously absent property. The `$forceUpdate()` call in the `@input` handler is required.

- **Section visibility:** Both sections should show their Add button regardless of whether items exist (matching the existing pattern), but the draggable list and section header should only render when the filtered array is non-empty.

- **`combat/actor/Actions.vue` needs no changes.** It filters by whether actions have rollable `action_list` items, not by timing. Bonus actions with rolls will appear in the combat dropdown automatically.

## Decisions Made

- **UI-only hybrid approach** — no new Firebase arrays. The `actions` array stores all action items; `timing` is a field on each item.
- **Absent `timing` = regular action** — backward compatible. Old NPCs render correctly without any data migration.
- **Config array stays unified** — a 5th entry with `timing: "bonus_action"` encodes the routing. The template loop resolves section items and draggable bindings from the config rather than hardcoding two explicit blocks.
- **`:list` + `@change` for draggable** — named read-only computed properties (`regularActions`, `bonusActions`) provide stable references; `onDraggableChange` translates filtered indices to real array indices.
- **Option A drag-and-drop** — two separate draggable instances with cross-section drag disabled. Timing is changed via a dropdown in the accordion, not by dragging between sections.
- **Option A Add UI** — two separate Add buttons ("Add Action", "Add Bonus Action"), driven by the config entry's `name_single` and `timing` fields.
- **`getActionIndex(action)` method** — maps filtered-loop items back to real array indices for all existing methods, with no changes to those method signatures.

## Out of Scope

- Changes to the combat roll system (`runEncounter.js`, `RollActions.vue`) — bonus actions participate in combat via the existing `actions` array automatically.
- Changes to `combat/actor/Actions.vue` — the existing rollable-action filter works regardless of `timing`.
- SRD monster import (`monster.js`) — SRD data has no separate bonus actions array. If future SRD sources add one, the parser would need updating separately.
- PDF export or print view (if one exists) — not in scope for this feature.
- Data migration script — absent `timing` is treated as regular action by design.

## Open Questions

None — all ambiguities resolved before spec was written.
