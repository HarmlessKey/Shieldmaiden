## Context

See proposal.md (Why). Requirements: `specs/effects-display/spec.md`.

Current state:

- **`src/components/combat/entities/effects/index.vue`** builds a flat `effects` list of
  `{ type, key, icon, title, value, color }` from `entity.conditions` (type `condition`) and
  `entity.reminders` (type `reminder`), filtered by the `conditions` / `reminders` boolean
  props. It splits the list into `visible` / `collapsed` using `availableSpace` and a 33px
  item size when `collapse` is set. Used by `TargetEntity.vue` (tracker rows),
  `Card/CardDetails.vue` (entity card), and the Conditions, TargetReminders and 2a Effects
  drawers.
- **`Effect.vue`** renders one chip (30px square, badge `.value`, `hki-` icon via `hk-icon`,
  `q-tooltip`) and, on click, opens `drawers/encounter/Condition` or `…/reminders/Reminder`
  with `data: { key, condition, entity }`.
- **2e getters** (non-namespaced `encounter` module): `entity_effects(key)` →
  `[{ key, instance, definition }]`, `effect_definition(instance)`. `definition` can be
  `undefined` for a moment right after apply, or `unresolved: true`.
- **2a/2b actions**: `remove_effect({ key, effectKey })` removes one instance and saves it;
  `apply_effect({ key, instance, definition })` sets Exhaustion's `level` on the existing
  instance and saves it.
- **2a `EffectDetails.vue`** takes a `definition` and an `edition`, and prints the
  description, one line per sub-effect (description, or type/subtypes) and, when
  `definition.url === "exhaustion"`, the Exhaustion table. Resolved definitions (2e) have
  no `url`.
- Entities in the store don't reliably carry their own `key` property. The target list
  passes entity objects, so the key is taken from `entity.key` where the parent sets it
  (`TargetEntity` / `RunEncounter._active` do), with a fallback lookup by identity in
  `entities`.

## Goals / Non-Goals

**Goals:**
- Effect instances visible everywhere the legacy chips are, with no change to legacy chips.
- Everything the DM needs to read an applied effect in one place, plus remove and the
  Exhaustion level.
- Duration wording in one pure helper that 2h's prompts can reuse.

**Non-Goals:**
- Player live view (`trackCampaign`), which is 2i.
- Ticking or expiring durations, and trigger prompts (2g/2h). The badge shows the stored
  `rounds_remaining` as is.
- Editing an instance's duration, choices or save after applying.
- A distinct style for "legacy vs new" chips. Both coexist until 2i removes the legacy ones.

## Decisions

### 1. Pure display helpers in `effectFunctions.js`
- `describeDuration(instance, { casterName, holderName })` returns a string per the spec's
  table. For `next_turn`, the name comes from `anchor` (`caster` → `casterName` or "the
  caster"; `target` → `holderName` or "its"), and `edge` gives start/end. `time` with
  `rounds_remaining` gives "N rounds left" ("1 round left"), and without it
  "<value> <unit>(s)". `concentration` with value gives "Concentration, up to <value>
  <unit>(s)". Unknown types use a small label map (`rest` → "Until a rest", `dawn` →
  "Until dawn", `save_ends` → "Until saved", …), falling back to the type with underscores
  replaced.
- `effectBadge(instance)` returns `instance.level` for Exhaustion, `rounds_remaining` for
  `time`, otherwise `undefined`.
- Both are pure and tested in the scratchpad against the spec scenarios.

### 2. Effect items in `index.vue`
- New boolean prop `effects`. Filtering: collect the kinds whose flag is set, and when none
  is set show all kinds. This keeps today's behavior for the `conditions` / `reminders`
  callers exactly.
- Effect items come from `this.$store.getters.entity_effects(entityKey)` and map to
  `{ type: "effect", key: "effect:" + key, effectKey: key, icon, initial, title, value,
  duration, caster }`:
  - `icon`: the `source_key` when `source === "srd"` and the definition's `category` is
    `"condition"`, else undefined.
  - `title`: the definition's `name` (resolved), else the instance's `name`, capitalised
    for display with the existing `String.prototype.capitalize`.
  - `value`: `effectBadge(instance)`.
  - `duration`: `describeDuration`, with the caster and holder names from `entities`.
- `entityKey`: `this.entity.key`, falling back to finding the entity in `entities` by
  identity. Computed once.
- Order: `[...reminders, ...conditions, ...effects]`. The existing slicing code is
  unchanged.
- *As built:* the existing computed chip list was also called `effects`, which clashes with
  the new prop (`vue/no-dupe-keys`). The computed is renamed to `items`; the prop keeps
  its name to match `conditions` / `reminders`.

### 3. `Effect.vue` for effect items
- Chip class `effect` (same geometry as `condition`). It shows `hk-icon hki-<icon>` when
  `icon` is set, else a generic icon `fas fa-sparkles` with the `initial` overlaid (small
  bold letter). The badge `.value` is positioned like the condition badge.
- The tooltip gets a second and third line for effects (`duration`, "from <caster>").
- Click: effect items open
  `setDrawer({ show: true, type: "drawers/encounter/effects/ActiveEffect", data: { entityKey, effectKey } })`.
  Legacy items keep their current drawers.

### 4. `ActiveEffect.vue` detail drawer
- `props: ["data"]` (`entityKey`, `effectKey`), matching the other drawers. Computed
  `entity`, `instance = entity.effects[effectKey]` and `definition =
  effect_definition(instance)`. It's reactive, so a level change or removal elsewhere
  shows up. If the instance disappears (removed), it shows "This effect is no longer
  active" instead of erroring.
- Layout, top to bottom:
  - `BasicEntity`
  - an `h2` with the icon and capitalised name
  - a small definition list: Duration (`describeDuration`), Applied (round N),
    Caster (name, or "not in this encounter", or omitted when there's no `caster_key`),
    Choices (each `startCase(kind)`: `startCase(value)`) and Repeat save ("Wisdom save DC
    15, at the end of the target's turn"; trigger labels as in the 2a form)
  - the Exhaustion table when `source_key === "exhaustion"`
  - `EffectDetails` with the resolved definition
  - the Remove button
- Exhaustion table: the rows of `EXHAUSTION_LEVELS[edition]`, current rows marked like the
  legacy Condition drawer. Clicking row N dispatches
  `apply_effect({ key, instance: { ...instance, level: N }, definition })`. A final
  "Remove" row (level 0) dispatches `remove_effect({ key, effectKey })`.
- Remove button: `v-if="definition?.cancelable !== false"`. It dispatches `remove_effect({
  key: entityKey, effectKey })`, then closes the drawer with `setDrawer({ show: false })`
  once the instance is gone.

### 5. `EffectDetails.vue` labels `from`
- Each sub-effect line appends ` (from <from.name>)` when `sub_effect.from` is set.
- The Exhaustion table check also accepts a new optional `url` prop, so the detail view can
  pass `instance.source_key`, since resolved definitions carry no `url`. The detail view
  shows its own interactive table, so it passes `show-exhaustion-table="false"`. That's a
  new boolean prop defaulting to true, which keeps the 2a drawer as it is.

### 6. Effects drawer target list
`drawers/encounter/Effects.vue` passes `effects` to its `<Effects>` rows instead of no
flag, so the drawer shows the instances it manages. The Conditions and Reminders drawers
keep their flags.

## Risks / Trade-offs

- [Right after an apply, the definition may not be resolved yet (async)] → Chips fall back
  to the instance's `name`, with no condition icon until resolved. That's a moment at most.
- [Duplicate chips when a DM sets the same condition in both the legacy drawer and the
  Effects drawer] → Expected until 2i. Both are removable from their own detail views.
- [`rounds_remaining` never changes yet] → The badge is correct for what's stored. 2h ticks
  it.
- [Chip width assumption (33px) also applies to effect chips] → Same geometry as condition
  chips.

## Migration Plan

UI only; no data changes. Rollback is reverting the commit.

## Open Questions

None.
