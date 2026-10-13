## Context

- **Schema** (`src/schemas/hk-effects-schema.json`, v2): a definition plus `$defs` for
  sub-effects (31 types, about 60 fields, 150+ sub-types), amounts (number, dice roll or
  formula), condition sets (check, array, `all_of`, `any_of`), durations, saves, repeat
  saves, escapes, triggers and filters. Some enum values are legacy aliases:
  `grant_advantage` / `grant_disadvantage`, the `action_removed` / `long_rest` durations,
  and the `failed_save` / `success_save` / `zero_hp` triggers.
- **Current form** (`hk-effects-form.vue`, 271 lines): one flat list of `subeffects`, each
  with a single `subtype`. It's driven by `effectsConstants.js`, which has 13 types and
  writes `duration_type` / `duration`. `EditEffect.vue` wraps it in a vee-validate
  `ValidationObserver`. It saves through the `effects` store (`add_effect` / `edit_effect`)
  to `effects/<uid>/<id>`, with a name-only copy in `search_effects`.
- **Constants consumers**: the form, and `describeSubEffect` in `effectFunctions.js`, which
  reads `effect_types[type].label` and `effect_subtypes[sub_type].label`.
- **Engine helpers the form can use**:
  - `getRequiredChoices(definition)`: what the drawer asks when applying an effect. It
    uses `damage_types` as the options for a `damage_type` choice, and
    `roll.damage_type_choice` as options too.
  - `evaluateFormula(formula, vars)`: the safe formula evaluator.
  - `findSrdDefinition(edition, url)` and the SRD data files of both editions.
- **Validation tooling**: `scripts/validate-effects-data/validate.mjs` (Ajv over the SRD
  data). `ajv` and `ajv-formats` are runtime dependencies already.
- **Database rules** (`../firebase_rules/firebase-rules.json`, separate repo): three
  `effects` blocks for instances (encounter entities, campaign players, companions). Each
  copies the duration types into a regex. `effects/<uid>` (definitions) has no validation.

## Goals / Non-Goals

**Goals:**
- One source for the form's labels, per-type sub-types and per-type fields: the constants.
  A check catches drift from the schema, the SRD data and the rules.
- The form writes data the engine runs unchanged. Nothing new is added on the engine
  side, except removing the legacy read.
- Editors that repeat in the schema are written once and reused at any depth: sub-effect
  list, condition set, amount, duration and effect reference.

**Non-Goals:**
- Adding to the schema. If the form exposes a gap, it's recorded for step 5. The only
  schema change here is removing what makes a definition less generic (decision 10).
- A raw JSON editor. Every field gets a real control, as decided.
- Editing effect links on actions or features (step 6).
- Live preview of an effect's mechanics in the tracker.

## Decisions

### 1. Constants: hand-written, keyed, with type metadata

`effectsConstants.js` is rewritten by hand, using the schema enums as the list. Labels and
descriptions are written for users, so they can't be generated, and the check in
decision 7 keeps them complete. Shape:

- One frozen object per enum, keyed by value: `{ value, label, description?, legacy? }`.
  The exports are `effect_types`, `effect_subtypes`, `triggers`, `duration_types`,
  `condition_check_types`, `condition_subjects`, `comparators`,
  `stacking_modes`, `consume_on`, `frequencies`, `targets`, `area_shapes`,
  `attack_types`, `bypass_sources`, `mechanics`, `choice_kinds`, `time_units` and the
  smaller enums. `effect_types` and `effect_subtypes` keep their names and `label`, so
  `describeSubEffect` keeps working.
- `effect_types[type]` also has:
  - `sub_types`: the allowed sub-types, or `[]` for types without them (`includes`,
    `damage`)
  - `fields`: the type-specific fields the editor shows (decision 3)
  - `required`: the type-specific required fields (decision 5)
- Legacy aliases get an entry with `legacy: true`, so the check sees them and
  `describeSubEffect` can still label them. The form doesn't offer them.
- Enums that already have shared constants (abilities, damage types, creature types,
  skills) aren't copied: the form uses `generalConstants.js`. The check compares those
  enums against `generalConstants` instead (decision 7). The legacy `non_magical_*` damage
  types are hidden from the form.
- The old `triggers` / `duration_types` arrays go. Their only consumer is the form.

Per-type sub-type lists start from the schema's sub-type groups, the catalogue and the
pairs the SRD data already uses (`bonus` → `ac`, `max_hp`, `speed`… `d20_test`;
`damage_modifier` → `floor_at_1`, `halve_damage`, `evasion`, `absorb`, `reduce_damage`…).
The check makes sure no SRD pair is left out.

*Alternative:* generate the constants from the schema at build time, with labels from
`title`. Rejected: the schema has no titles for enum values, and adding them would mix UI
copy into the data contract.

### 2. Component structure

`hk-effects-form.vue` stays the registered entry with the same `v-model` API. It holds
the definition-level fields. Everything else goes in
`src/components/hk-components/hk-effects-form/`:

| Component | Edits |
|---|---|
| `SubEffectList` | a sub-effect array: add, remove, reorder, accordion headers using `describeSubEffect` |
| `SubEffect` | one sub-effect: type, sub-types, type fields, optional parts |
| `AmountInput` | number / dice roll / formula, with a mode toggle. `FormulaInput` and `DiceRollInput` inside |
| `ConditionSetEditor` | a set: a single check or an `all_of` / `any_of` group, recursive |
| `ConditionCheck` | one `condition_check` |
| `DurationEditor` | `$defs/duration`, including cancel triggers, repeat save, escape and `on_expire` |
| `SaveSpecEditor`, `RepeatSaveEditor`, `EscapeEditor` | `save_spec`, `repeat_save`, `escape` |
| `TriggerFilterEditor`, `SourceFilterEditor` | `trigger_filter`, `source_filter` |
| `EffectRefPicker` | one `effect_ref`, or a list of them (`multiple`) |
| `StackingInput`, `LevelTrackInput`, `SustainInput`, `AreaInput`, `AuraInput`, `ConsumeInput`, `TimeInput` | their `$defs` |

Recursion (`SubEffectList` → `SubEffect` → `SaveSpecEditor` / `DurationEditor` /
`AuraInput` → `SubEffectList`) is broken with an async local registration on the back
edge (`SubEffectList: () => import("./SubEffectList.vue")`). That avoids circular ES
imports in webpack 4. Each component has a `name`.

**Data flow**: as in the current form, editors get the object they edit as `value` and
change it in place with `$set` / `$delete`. An optional block (a save, an aura) is created
or removed by its parent with `$set` / `$delete`. This keeps deep nesting simple. It works
because `EditEffect`'s deep watcher already tracks unsaved changes.

*Alternative:* immutable `input` events at every level. Rejected: every nested change
would rebuild the path up to the root, for no gain in a form-local object.

### 3. Fields per type, and clearing on type change

Each `SubEffect` shows:
- **Always**: type, sub-types (if the type has any), description, and a Configuration
  select for the optional parts (decision 11).
- **Type fields** from `effect_types[type].fields`, rendered through one field registry
  (`fieldControls`: field name → control and props). An example: `bonus` →
  `value, roll, multiplier, abilities, skills, attack_types, damage_types,
  creature_types, perspective, context, also_heal, stacking, expires_with_effect`. Fields
  that only fit one sub-type (`also_heal` for `max_hp`, `stacking` /
  `expires_with_effect` for `temp_hp`) carry a `when` on their registry entry.
- **Optional parts**, shown as cards when selected or when they have values: trigger (`trigger`,
  `trigger_filter`, `frequency`), target, save, condition, consume, level range
  (`min_level`, `max_level`), source filter, choice, and `id`.

Changing the type deletes every key that isn't type, description, an optional part, or in
the new type's `fields`. Sub-types not allowed by the new type are dropped.

### 4. Choices

`choice` is an optional part. Setting it marks the field it fills (from `choice_kinds`:
ability → `abilities`, damage_type → `damage_types`, skill → `skills`, condition →
`conditions`, creature_type → `creature_types`, option → none) as "Chosen when applied":
- **damage_type**: `damage_types` stays editable and is labelled "Allowed types (empty =
  any)", because `getRequiredChoices` uses it as the options.
- **The other kinds**: the field is cleared and disabled. The engine reads the value from
  `application.choices` and ignores the list.

`DiceRollInput` also edits `damage_type_choice` ("caster picks one of"), which the drawer
already asks for. Nothing changes in the drawer: it already derives choices from the
definition.

### 5. Validation: field rules plus Ajv before saving

- **In the form**: vee-validate rules on each control for what the schema requires and
  what users get wrong most. The type-specific required fields come from
  `effect_types[type].required`, and integer and range rules follow the schema's
  minimum and maximum. Formula fields get a `formula` rule that runs `evaluateFormula`
  with every variable set to 1 and fails if it throws or doesn't return a number.
  Sub-effect headers keep the red error icon.
- **Before saving**: `EditEffect` cleans the effect (decision 6), then validates it with
  Ajv against `hk-effects-schema.json`, using the same options as `validate.mjs`. Ajv and
  the schema load with a dynamic `import()` inside the save method. That keeps them in an
  async chunk and out of the SSR entry. On failure, nothing is saved, and the errors are
  listed in a notice above the save bar:
  - Each error's `instancePath` is mapped to readable labels with the constants
    ("Sub-effect 2 › Scaling › by").
  - `oneOf` / `if` noise is filtered: only the deepest error per path is kept, and
    duplicates are dropped.

*Alternative:* Ajv only, no field rules. Rejected: errors would show only when saving,
far from the field. Field rules only: rejected, because the schema has cross-field rules
(`remove_effect` needs `effects` or `conditions`) that are easy to miss in the form.

### 6. Clean output and round trip

`cleanEffectDefinition(effect)` is a pure function in `effectFunctions.js`. It returns a
deep copy without empty strings, `null`, `undefined`, empty arrays and empty objects, at
any depth, and turns numeric strings from inputs into numbers. Inputs already store
numbers, so this is a safety net. It keeps `false` and `0`. `EditEffect` runs it when
saving, and also when loading, before it takes the copy that `unsaved_changes` compares
against. That way an unchanged effect compares equal (round-trip scenario). The deprecated
definition fields are deleted in the same function.

### 7. Sync check script

`scripts/validate-effects-data/check-constants.mjs`, run with `node` like `validate.mjs`:
1. Walk the schema and collect every `enum` with its JSON pointer.
2. A table in the script maps each pointer to the constants export (or the
   `generalConstants` export) it must match. An enum pointer not in the table is reported
   as a problem, so a new enum forces a decision.
3. Report schema values without an entry, and entries not in the schema.
4. Walk the SRD data files of both editions. Report each `type` / `sub_type` pair not in
   `effect_types[type].sub_types`, and each type-specific key not in
   `effect_types[type].fields`.
5. Read the rules file (`--rules <path>`, default `../firebase_rules/firebase-rules.json`).
   Find each `duration` → `type` `.validate` regex under an `effects` key, parse the
   `^(a|b|…)$` alternation and compare it with `$defs/duration.type`. A missing file prints
   a warning and skips this step.

It prints one problem per line and exits 1 on any problem, the same output style as
`validate.mjs`.

### 8. Effect reference picker

The options are grouped as Conditions, SRD effects and My effects. SRD options are the
union of `conditions.js` and `effects.js` of both editions, one per `url`. The label comes
from 5.5e when the url exists there, otherwise 5e. A url found in only one edition gets
an "(5e only)" or "(5.5e only)" hint, since references resolve per campaign edition. My
effects come from the `effects` store (`get_effects`, name plus key). The effect being
edited (route `id`) is left out. A pick is saved as `{ source, source_key, name }`.
Condition fields that take bare urls (`conditions`, `has_condition` values, the
`condition` choice) use the same SRD condition list.

### 9. Legacy removal

`normalizeDefinition` keeps copying the definition and defaulting `sub_effects` to `[]`,
but drops the `subeffects` / `subtype` branch. Legacy schema aliases that the SRD data or
the engine still use (`normalizeTrigger`, `grant_*`) are untouched. Only the custom-effect
shape goes. The user deletes `effects/<uid>` and `search_effects/<uid>` test data by hand.

### 10. Generic definitions: origin and scaling leave the definition

Decided 2026-10-12, while testing the form. A definition says what an effect does, not
where it comes from. Removed from the schema, the SRD data, the constants and the form:
`category`, `spell_level`, `magical`, `tags`, `removed_by`, `scaling` (with
`$defs/scaling` and `scaling_by`) and `source_filter.tags`. The formula variables
`spell_level`, `char_level` and `class_level` go too (the engine never filled them).
`class.<column>` stays: it reads the holder's or caster's class table, not the effect's
source. `cancelable` goes as well: every effect can be removed by the DM, so the detail
view always shows Remove (no SRD definition had `cancelable: false`). `area` (with
`$defs/area`) goes too: an area is the action's or spell's, which already have an AOE type
and size; nothing in the engine or the SRD data read it.

- **Conditions**: every "is this an SRD condition?" check used `category === "condition"`.
  A new `isSrdCondition(source, url)` in `effectFunctions.js` answers it from the SRD
  conditions lists instead (the 15 urls are the same in both editions). It replaces the
  checks in `effectChipItems`, `legacyConditionInstances`, `apply_effect`,
  `end_immune_conditions`, `effectToastIcon`, the Effects drawer and `ActiveEffect.vue`.
  The resolved definition drops `category`.
- **Scaling**: the engine read `scaling` in three places (rolled amounts, stat bonuses,
  roll bonuses), and only with `by: "level"` / `"stacks"`, the instance's own level.
  Formulas already get that level as `level`, so 5.5e Exhaustion becomes
  `value: { formula: "-2 * level" }` and `{ formula: "-5 * level" }`. The scaling code is
  removed. Dice per level can't be written as a formula; no SRD effect needs it, and
  scaling with a spell slot or caster belongs on the link (steps 6–7).
- **Magical**: the resolved definition's `magical` fed two things:
  - Repeat saves passed `source: { magical: true }`. Without it the source is unknown, so
    a `source.magical` modifier on a repeat save becomes a reminder (the existing rule for
    unknown sources). The link will carry `magical` in steps 6–7.
  - Damage bonuses took `magical` from the definition. They take it from the sub-effect's
    `roll.magical` instead (the field damage sub-effects already use), and the SRD data
    sets `roll.magical: true` on damage-bonus rolls of definitions that were magical.
- **Data migration**: SRD data is rewritten in place; custom effects were deleted (task
  1.1). Instances keep working: they reference definitions by `url`.

*Alternative:* keep `scaling` for the effect's own level only. Rejected by the user: a
formula on `level` covers it, and one less concept keeps definitions simpler.

### 11. A configuration list instead of "add" buttons

Decided 2026-10-12, while testing: a row of "+ Level track", "+ Sustain"… buttons didn't
say what they do, and inline blocks made the form long. The optional parts of the effect and
of each sub-effect are a `ConfigurationList`:
- an **Add** menu with the configurations not in the list yet, each with its explanation.
  Adding one opens its edit dialog.
- an accordion item per configuration: name on the left, Edit and Remove on the right.
  Expanded, it shows the settings in words from `summarizeConfiguration(level, key, target)`
  in `configurationSummaries.js` (pure, tested in the scratchpad). The summary also returns
  `incomplete` when required settings are missing, shown as a warning icon on the item.
- a dialog (`q-dialog` with an `hk-card`) with the explanation and the inputs, rendered by
  the parent through an `editor` slot. Edits apply in place, as everywhere in the form, so the
  dialog only has Done.

Fields inside a closed dialog aren't rendered, so their vee-validate rules don't run until the
dialog is opened. The warning icon covers the required settings, and the schema check at save
covers the rest; a configuration left empty is removed by the cleaning on save.
- The options, their explanations, the fields each owns (`keys`) and their start value
  (`initial`) live in `fieldControls.js`: `effect_configurations` and
  `sub_effect_configurations`. A check makes sure every optional field is owned by exactly
  one configuration.
- A configuration is selected when one of its fields is set. Configurations that start
  without a value (target, choice, level range, id, trigger) are kept open in local state
  until filled in, as before.
- The effect's list comes after the sub-effects: the sub-effects are the main content.
- Smaller toggles inside an editor (a save's "Effects on a success", a trigger filter, a dice
  modifier) keep their `OptionalBlock` buttons, inside the dialog.

*Alternatives:* "+" buttons with a tooltip each, rejected because the explanation should be
visible while choosing. A Configuration multi-select with inline cards (tried first),
rejected by the user: the cards made the form long, and a summary in words is easier to scan.

### 12. Documentation page from a markdown file

Decided 2026-10-13: effects are complex, so the form gets a documentation page at
`/documentation/effects`. The text is `src/docs/effects.md`, imported as a string through
`raw-loader@4.0.2` (the last version for webpack 4) with a `.md` rule in `chainWebpack`, and
rendered with `marked` and `sanitize-html` (both already used by the changelog). Bundling
keeps the page server-rendered and available offline.
- Heading ids are kept by sanitize-html, so the table of contents and links like
  `/documentation/effects#triggers` work.
- The page uses the default layout, like Support and About us.
- A scratchpad check makes sure every label of the form's constants appears in the file, so
  new fields don't go undocumented silently.

*Alternative:* fetch the file from `src/statics` at runtime. Rejected by the user: the server
would render an empty page first.

## Risks / Trade-offs

- **Lost magical source on repeat saves** (Magic Resistance against a Hold Person save
  becomes a reminder instead of Advantage). → Accepted until steps 6–7, where the link
  knows its spell. The reminder still tells the DM.

- **Size**: this is the biggest step so far. → The tasks are ordered so that constants,
  the check and the core sub-effect editor work and can be verified before the
  definition-level blocks are built. If it runs long, groups 6–7 (definition blocks) can be
  split into their own change without touching the rest.
- **Long forms for complex effects** (Spirit Guardians with aura, save and trigger). →
  Accordions per sub-effect, optional parts only as cards when selected, and nested lists indented
  and collapsed by default.
- **Ajv errors are hard to read for `oneOf` (amount, condition set)**. → The filter in
  decision 5. Field rules catch most cases before Ajv runs.
- **Bundle size**: Ajv adds about 120 KB. → Loaded with dynamic `import()` only when saving
  a custom effect.
- **Constants drift when the schema changes in step 5**. → The check in decision 7. The
  apply notes ask for it to be run in every later effects change.
- **Recursive async components flash on first open**. → Acceptable: they only load the
  first time a nested list is opened.
- **Instances of deleted test effects** in saved encounters show by name with no
  mechanics. → This is the existing "unresolved reference" rule. No action needed.

## Migration Plan

1. Deploy the form and the engine change together. Old custom effects stop resolving
   their sub-effects.
2. The user deletes the existing custom effect test data (`effects/<uid>`,
   `search_effects/<uid>`) in the Firebase console.
3. Rollback: revert the commit. There's no data migration to undo.
