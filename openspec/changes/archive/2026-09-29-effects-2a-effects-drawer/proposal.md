## Why

The SRD conditions and effects now exist as schema-valid local data (steps 0 and 1b), but
nothing in the combat tracker can apply them: the only way to set a condition is the legacy
Conditions drawer, which reads HK API text and writes a flat `entity.conditions` map. Step 2a
of [.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
adds the Effects drawer — the single place a DM picks an effect or condition, fills in how it
is applied (duration, save DC, choices, Exhaustion level) and applies it to the targeted
entities. It validates the application shape end-to-end before storage (2b), resolution (2e)
and display (2f) are built on top of it. Relevant catalogue sections:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §2 (application vs
definition), §3.5 (triggers), §4 (durations) and §5 (Exhaustion leveling).

## What Changes

- **New drawer** `src/components/drawers/encounter/Effects.vue`, opened through the existing
  `setDrawer` system, modelled on the Reminders/Conditions drawers (target list at the top,
  selectable effect list below).
- **Grouped effect list**:
  - SRD conditions from `src/data/{edition}/conditions.js`,
  - SRD effects from `src/data/{edition}/effects.js` (Concentration),
  - both selected by the `runEncounter` `edition` getter (`"5e"` / `"5.5e"`),
  - custom effects from the user's Realtime Database via the existing `effects` store
    module, shown for every edition.
  Each entry expands to show its description and sub-effects (descriptions for SRD entries,
  full definition fetched on expand for custom ones).
- **`mode` prop**: `mode="conditions"` limits the list to SRD conditions (used by 2i to
  replace the legacy drawer). Default shows all groups.
- **Application form** producing a `$defs/application`-shaped object per target:
  - duration: type (`cancelled` default, `time`, `concentration`, `next_turn`,
    `end_of_turn`), value + unit for `time`/`concentration`, anchor + edge for
    `next_turn`;
  - repeat save (ability, DC, trigger) when the DM wants one — the save ability comes from
    the source, so it is entered here, never read from the definition;
  - `choices` derived from the definition's sub-effects (`choice` on a sub-effect,
    `damage_type_choice` on a roll) — e.g. Hex ability, Protection from Energy damage type;
  - Exhaustion: pick/increment the level instead of stacking instances.
- **New `apply_effect` / `remove_effect` runEncounter actions** that build an active
  instance (`$defs/active_instance`: `name`, `source`, `source_key`, `duration`,
  `choices`, `save_dc`, `level`, `caster_key` = current actor, `applied_round` = current
  round, `rounds_remaining` for round-based time durations) under a generated short key and
  commit it to in-memory `entity.effects`. **No Firebase write in this change** — step 2b
  adds persistence inside these actions; until then applied effects are lost on reload.
- **Entities get an `effects` map** in memory (initialised to `{}` in `add_entity`) so
  instances are reactive. Reading persisted instances is step 2e.
- **Entry points**: an "Effects" option next to Conditions/Reminders in `Targeted.vue`
  (with its own hotkey), `TargetMenu.vue` and the mobile `Menu.vue`. The legacy Conditions
  drawer stays available unchanged until 2i.
- **Demo edition fix**: the demo encounter sets the edition to `"5.5e"` instead of `"2024"`,
  so the `edition` getter only ever holds `"5e"` / `"5.5e"` (plan 0b.2).

## Capabilities

### New Capabilities
- `effects-drawer`: the tracker drawer for choosing SRD conditions, SRD effects and custom
  effects by campaign edition, filling in an application and applying/removing the resulting
  active effect instances on targeted entities (in-memory in this step).

### Modified Capabilities
<!-- none: effects-srd-data requirements are read, not changed -->

## Impact

- New: `src/components/drawers/encounter/Effects.vue` (plus small child components for
  the effect row and application form if the file grows large).
- New: `src/utils/effects.js`-style helpers for listing SRD definitions by edition,
  deriving required choices and building an active instance (pure functions, testable with
  a scratchpad script).
- `src/store/modules/runEncounter.js`: `apply_effect` / `remove_effect` actions,
  `SET_EFFECT` / `DELETE_EFFECT` mutations, `entity.effects` init, demo edition `"5.5e"`.
- `src/components/combat/Targeted.vue`, `TargetMenu.vue`, `mobile/Menu.vue`: new menu
  entry. Tutorial steps are not added.
- Reads `src/store/modules/userContent/effects.js` (`get_effects`, `get_effect`); no
  changes to the service or Firebase rules.
- No change to the legacy Conditions drawer, `entity.conditions`, reminders, the HK API or
  the SRD data files.
