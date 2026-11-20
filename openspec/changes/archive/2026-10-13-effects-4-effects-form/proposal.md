## Why

The tracker now runs the whole v2 effects schema, but the custom effect form still writes
the old shape: one `subtype` per sub-effect, a dozen types, and a duration on the definition.
A DM can't build anything the engine supports beyond a flat bonus. Steps 6–7 will link
effects to monster actions and spells, so the form has to cover the full schema first. This
is step 4 of the effects plan ([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
"4. Effects form and constants" and "Generic effects").

## What Changes

- **Constants from the v2 schema**: `src/utils/effectsConstants.js` is rewritten with a
  label (and a description where it helps) for every enum value the form offers. That
  covers sub-effect types, sub-types, triggers, duration types, condition check types and
  the other enums. It also records which sub-types and fields go with each
  sub-effect type. The form reads these constants, not the schema.
- **Sync check**: a script checks that every schema enum value has a constants entry, and
  that every type/sub-type pair in the SRD data is allowed by the constants. It also checks
  that the duration-type regex in the `effects` blocks of `firebase-rules.json` (separate
  `firebase_rules` repo) matches the schema's `duration.type` enum.
- **Effects form covers every schema field**: `hk-effects-form` is rebuilt from smaller
  components.
  - **Definition level**: name, description, cancelable, stacking, level track,
    effect-wide condition, ends when, sustain and aura.
  - **Each sub-effect**: type and sub-types, then only the fields that type uses: value,
    roll or formula, multiplier, perspective, the filters (abilities, skills,
    attack/damage/creature types, source), choice, trigger with filter and frequency,
    target, save, condition, consume, level range, and the type-specific fields.
  - **References and nesting**: `includes`, `apply_effect` and `remove_effect` pick SRD
    conditions, SRD effects or the user's other custom effects. Nested sub-effect lists
    (aura, save success and fail-by-5 effects, repeat-save `on_fail`, duration `on_expire`)
    use the same editor. So do the nested durations of `apply_effect` and repeat-save
    `escalate`.
  - Rarely used parts are collapsed until added, so a simple effect stays a short form.
- **Choices on generic definitions**: a sub-effect can take its ability, damage type,
  skill, condition, creature type or option from a choice made when the effect is applied.
  The form marks these as "chosen when applied", so one "Absorption" effect works for any
  damage type.
- **Definitions are generic** (**BREAKING** for the schema and the SRD data, decided
  2026-10-12 while testing this change): an effect is a generic building block. It becomes
  a spell effect, a feature or a monster trait when it's linked to a spell, an action or an
  ability (steps 6–7). So everything that describes where an effect comes from, or how it
  grows with its source, leaves the definition:
  - `category`, `spell_level`, `magical`, `tags` and `removed_by` are removed from the
    schema, the SRD data and the form. "Is this an SRD condition?" is answered by the
    conditions list instead of `category: "condition"`.
  - `scaling` (and `$defs/scaling`) is removed from the schema, the engine, the SRD data and
    the form. 5.5e Exhaustion's per-level penalties become formulas on the effect's own
    level (`-2 * level`, `-5 * level`). Scaling with a spell slot or caster level is set on
    the link in steps 6–7.
  - The source filter's `tags` goes too, since no definition has tags to match.
  - `cancelable` goes: every effect can be removed by the DM. `area` goes: the area belongs to
    the action or spell (its AOE type and size), set in steps 6–7. So do the formula variables
    `spell_level`, `char_level` and `class_level`.
  - Until links carry it (steps 6–7), an effect's origin is unknown to the engine:
    repeat saves are no longer "against magic", so a "against spells and magical effects"
    modifier on them becomes a reminder. Damage bonuses take `magical` from their own roll;
    the SRD data moves the flag onto those rolls.
- **No duration on the definition** (**BREAKING** for old custom effects): the form drops
  `duration_type` / `duration_value`. Duration is set when an effect is applied (drawer)
  and, later, on action links (steps 6–7).
- **Validation matching the schema**: required fields per type are enforced in the form,
  and the whole effect is validated against `hk-effects-schema.json` before it's saved.
  Saving is blocked with readable errors when it fails. Saved effects only contain fields
  that are set.
- **Legacy custom effects dropped** (**BREAKING**): custom effects aren't in use yet, and the
  user deletes the existing test data. The engine stops reading the old shape (`subeffects`
  / `subtype`). There's no migration.
- Not in this change:
  - editing a list of effect links for an action or feature, and fixing or leaving open
    choices per link (step 6)
  - SRD effect data and collapsing per-case definitions into generic ones (step 5)
  - database rules validating custom effect definitions (`effects/<uid>` has none today)

## Capabilities

### New Capabilities

- `effects-authoring`: the custom effect form, its constants and the check that keeps the
  constants in sync with the schema, the SRD data and the database rules.

### Modified Capabilities

- `effects-runtime-resolution`: custom effects are read in the v2 shape only. The
  legacy-shape requirement and scenario are removed.
  Resolved definitions no longer carry `category`, `magical` or `cancelable`.
- `effects-display`: the detail view always shows Remove.
- `effects-drawer`: a value choice is asked as a number when the effect is applied.
- `effects-stat-modifiers` (also): a chosen value is the sub-effect's value everywhere the
  tracker uses values.
- `effects-damage-healing`: "Damage without an amount can still be rolled" no longer
  refers to the legacy form. The scenario uses a v2 sub-effect. Rolled amounts have no
  level scaling.
- `effects-stat-modifiers`: bonuses have no level scaling; 5.5e Exhaustion uses a formula.
- `effects-roll-modifiers`: flat bonuses have no level scaling, and repeat saves of an
  effect are no longer a known magical source.
- `effects-srd-data`: entries have no `category` (conditions, Burning), 5.5e Exhaustion
  uses formulas on its level, and the SRD effects list no longer describes Death Ward as
  magical.

## Impact

- `src/utils/effectsConstants.js`: rewritten. `effectFunctions.js` reads its labels for
  sub-effect descriptions, so those labels must stay in place.
- `src/components/hk-components/hk-effects-form.vue`: rebuilt. New sub-components go in
  `src/components/hk-components/hk-effects-form/`.
- `src/views/UserContent/Effects/EditEffect.vue`: validates against the schema before
  saving and cleans the effect before writing it.
- `src/utils/effectFunctions.js`: `normalizeDefinition` loses the legacy branch. Scaling
  code goes; a new `isSrdCondition` replaces the `category === "condition"` checks (also in
  `runEncounter.js`, `effectRolls.js`, the Effects drawer and `ActiveEffect.vue`).
- `src/schemas/hk-effects-schema.json`: `category`, `spell_level`, `magical`, `tags`,
  `removed_by`, `scaling`, `$defs/scaling` and `source_filter.tags` removed.
- `src/data/{5e,5.5e}/{effects,conditions}.js`: those fields removed; Exhaustion formulas;
  `magical` moved onto damage-bonus rolls where the definition was magical.
- `.planning/effects-implementation-plan.md`: "Generic effects" records that scaling and
  origin (`magical`, category) are set on the link in steps 6–7.
- `scripts/validate-effects-data/`: new constants sync check, next to the existing data
  validation.
- Reads `../firebase_rules/firebase-rules.json` (separate repo) for the rules check. Skipped
  with a warning when the file isn't there.
- Data: the user deletes the existing custom effects (`effects/<uid>`, `search_effects/<uid>`)
  by hand. Instances of deleted custom effects in encounters show by name, unresolved (the
  existing rule).
