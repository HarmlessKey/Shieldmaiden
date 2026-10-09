## Context

See proposal.md (Why). Requirements: `specs/effects-stat-modifiers/spec.md`.

Current state:
- **Resolved definitions**: `runEncounter.effect_definitions`, read through the
  `effect_definition(instance)` and `entity_effects(key)` getters. `evaluateConditionSet`,
  `hasCondition`, `resolveAmount` / `evaluateFormula` (3a) and `normalizeTrigger` are pure
  helpers in `effectFunctions.js`.
- **`displayStats(entity)`** (`entityFunctions.js`) derives `ac` (stored AC or
  `transformedAc`, plus `ac_bonus`), `speed` (`speed || walk_speed`), `maxHp`, `curHp` and
  `initiative_modifier`. Readers:
  - `CardDetails`, `actor/Details`, `TargetEntity`, `HealthBar`
  - `hk-single-roll` (hit or miss)
  - `Targeted.vue` has its own copy.
- **Speeds**: players have `speed` (a number). Current-format NPCs have `walk_speed`,
  `fly_speed`, `swim_speed`, `burrow_speed`, `climb_speed`. Old-format NPCs have `speed`
  as text.
- **Hit points**: the stored `maxHp` in encounter state already includes `maxHpMod` (see
  `quick-edit/index.vue`). `HpManipulations` reads `target.maxHp` for the healing clamp,
  overkill death and Bloodied. `target` is often the roll's snapshot of the entity.
- **The card**: `Card/index.vue` passes one `entity` to `CardDetails` (which makes
  `full_entity` and passes it to `CardSkills`), `CardSpellcasting` and `CardActions`. It is
  opened from the drawer with a data snapshot, and from `TargetInfo`.
- **Spell rolls**: `mixins/runEncounter.js roll_action` reads
  `entity[`${category}_spell_attack`]` and `_save_dc`. NPC initiative is rolled in
  `initiative/NPCs.vue` from `initiative_modifier` or the Dexterity modifier. Test mode
  auto-rolls it in `add_entity`.
- **Proficiency** comes from the `experience` mixin (`experience_table` in
  `characterConstants`), so the store can't use it today.
- **Prompts**: 3a prompts carry `sub_effects`, an `instance` snapshot and `event`, and the
  notifier adds buttons from `effectRolls`.

## Goals / Non-Goals

**Goals:**
- One pure function decides every effective value and its explanation. Components only
  read its result.
- Stored data never changes because of a modifier, except current HP clamping and grants
  that the spec asks for.

**Non-Goals:**
- Caching or memoizing beyond Vue's own. Entities have a handful of effects.
- Changing the stored attack or damage of NPC actions when scores change.
- The live view, compendium, NPC editor and campaign overview.
- Removing temp HP when an effect ends.

## Decisions

### 1. One pure computation: `effectiveStats`
`effectiveStats({ entity, holderKey, entities, definitionOf, vars })` returns
`{ values, modifiers }`:
- `values` holds only the fields that changed, using the entity's own field names: `ac`,
  `transformedAc`, `speed`, `walk_speed`, `fly_speed`, `swim_speed`, `climb_speed`,
  `burrow_speed`, `maxHp`, `initiative_modifier`, `passive_perception`, `caster_save_dc`,
  `caster_spell_attack`, `innate_save_dc`, `innate_spell_attack`, `strength` … `charisma`.
- `modifiers[field]` is `[{ name, text, applied }]`, used for tooltips.

How it works:
- **Collect** per value: walk the holder's instances. Skip unresolved definitions, and
  apply the level, `condition` and `choice` rules. Map `sub_types` to fields:
  - `speed` → every speed field the entity has
  - `ability_score` → `abilities`, or `choices.ability`
  - `spell_save_dc` / `spell_attack` → both caster and innate fields when present
  - `ac` → `ac`, plus `transformedAc` when transformed
- **Same definition twice**: group contributions by `source:source_key`. Compute the
  value once per instance in the group and keep the instance with the largest absolute
  change.
- **Combine**: base → bonus → multiply → round down → floor / cap → fixed (spec order).
  Passive Perception's stored value is derived from the effective Wisdom first (the card's
  existing formula), then modified.
- **Text speed**: only `fixed` applies, and it gives `"0 ft."` / `"<n> ft."`.
- **Formulas**: 3a's `resolveAmount`, with `vars` as `{ self, caster }` built by
  `formulaVars` (below).
- **Why a copy of fields** and not a new "stats" object: every reader already reads
  `entity.ac`, `entity.strength` and so on. Handing them an entity whose fields are
  already effective changes one line per reader, not every template.
- **Alternatives**:
  - *Extending `displayStats`*: it only knows five fields and isn't used for scores or
    spellcasting.
  - *Baking into stored fields* (as `maxHpMod` does): it would need undoing on every
    removal and would drift with the DM's own edits. Rejected.

### 2. `effectiveEntity` and the `effective_entity(key)` getter
- `effectiveEntity(entity, stats)` returns `{ ...entity, ...stats.values,
  effect_modifiers: stats.modifiers, stored: <the replaced stored values> }`.
- The getter `effective_entity: (state, getters) => (key) => …` computes it from
  `state.entities[key]`. It returns `undefined` for an unknown key, so callers fall back
  to their entity.
- `formulaVars(entity)` (pure: scores, modifiers, `pb`, `max_hp`) moves from 3a's mixin
  into `effectFunctions.js`, next to a pure `proficiencyBonus(entity)`, which imports
  `experience_table` and gives the same result as `effectProficiency`. `effectRolls` keeps
  its method names and delegates. The variables are read from the effective entities
  (spec: formula variables use effective values). Using effective values inside
  `effectiveStats` itself would recurse, so there `vars` come from the **stored** entity.

### 3. Readers
- **`Card/index.vue`**: `card_entity = effective_entity(entity.key) || entity`, passed to
  all three children. `CardDetails`, `CardSkills` and `CardSpellcasting` then show effective
  values unchanged. Only the markers are new.
- **`displayStats` readers** (`TargetEntity`, `HealthBar`, `actor/Details`,
  `hk-single-roll`) and `Targeted.vue` call it on `effective_entity(key)`. `Targeted.vue`'s
  local `displayStats` copy is replaced by the shared one.
- **`hk-single-roll`**:
  - `checkHitOrMiss` uses the effective target, looked up by `roll.target.key` at that
    moment, not the snapshot.
  - `rollSave` uses the effective entity.
- **`effectRolls`**: `effectSaveModifier`, `effectSkillModifier` and `effectFormulaVars`
  look up the effective entity by key themselves (`effectEntity`). Their callers
  (`EffectTriggerNotifier`, `ActiveEffect`) stay unchanged. *As built:* this covers every
  caller in one place, instead of each caller passing the effective entity.
- **`mixins/runEncounter.js roll_action`**: reads the DC and attack from
  `effective_entity(entity.key)`.
- **`initiative/NPCs.vue`**: the modifier comes from the effective entity.
- **`add_entity`**: test mode never loads effects (`load_effects` is false for `test`), so
  when the test-mode roll runs the effective modifier always equals the stored one. The
  roll stays where it is. *As built:* found during apply; the planned
  `roll_test_initiative` step was dropped because it couldn't change any result.
- **Markers**: a small `EffectModifiedValue.vue` component (value, a marked class, a
  `q-tooltip` with `effect_modifiers[field]`). It is used in `CardDetails` stats and scores,
  `CardSpellcasting`, `TargetEntity` AC and the `actor/Details` stats.

### 4. Hit points
- **`HpManipulations`**: `isDamage` / `isHealing` read `maxHp` from
  `this.$store.getters.effective_entity(target.key)?.maxHp ?? target.maxHp`, for the main
  pool only. The transformed pool keeps its own fields.
- **`sync_effect_hp(key)`** is a store action. When `effective_entity(key).maxHp <
  curHp`, it dispatches `set_hp` for the main pool with the effective max. It is called at
  the end of `apply_effect`, `remove_effect` (for each affected holder, including cascade
  targets) and `set_effect_prop` when `level` changes. It is also called at the end of
  `init_Encounter` for every entity (carried-over effects).
- **`also_heal`**: in `apply_effect`, after the instance is saved and resolved, sum the
  instance's applicable `bonus` `max_hp` sub-effects with `also_heal` and dispatch `set_hp`
  with `min(curHp + sum, effective max)`.
- **Why `set_hp`**: it already saves players and companions on the campaign and NPCs on
  the encounter, and handles demo/test.

### 5. Temporary HP
- **`tempHpParts({ sub_effects, instance, event, vars })`** (pure) returns one `{
  dice_count, dice_type, fixed_val, notes }` per applicable `fixed` `temp_hp` sub-effect.
  Temporary HP don't stack, so the grant rolls each and uses the highest. It reuses 3a's
  amount rules through a shared internal `amountRoll`, extracted from `effectRollParts`
  without changing its output.
- **Prompts**:
  - Trigger prompts already carry `sub_effects`, so the notifier adds **Grant temp HP**
    when `tempHpParts` yields an amount (or a roll).
  - For sub-effects without a trigger, `apply_effect` queues a new prompt kind
    `temp_hp`: "Goblin: False Life — grant temporary hit points" with Grant temp HP and
    Dismiss. It carries the same `sub_effects` / `instance` / `event` fields.
- **Granting** (in `effectRolls.grantEffectTempHp(prompt)`):
  - roll dice with `rollD` (the roll notification is shown) or use the value
  - then `set_hp({ key, pool: "temp", newHp: Math.max(tempHp || 0, amount) })`. `set_hp`'s
    temp pool saves directly.
- **Why a button and not automatic**: same principle as 3a. The DM applies.

### 6. Manual bonuses (added during apply)
Requirements: the "Manual bonuses…" and "Changing maximum hit point bonuses…" requirements in
the spec.

- **Shape**: `bonuses: { <value>: { <id>: { value, label } } }`, a keyed object because
  Firebase has no real arrays. Value keys are the 3b sub-type names (`ac`, `speed`, `max_hp`,
  …), and ability scores use the ability name, so `effectiveStats` maps them through the same
  `statFields` (`<ability>` → `ability_score` with `abilities: [<ability>]`). New ids use
  `generateEffectKey`. The legacy and single-value "Manual" entry uses the fixed id `manual`,
  so repeated conversions and single-value edits always hit the same entry.
- **Pure helpers** in `entityFunctions.js` (no imports, so the store, `effectFunctions` and
  outside screens can use them):
  - `manualBonuses(data)` → `{ <value>: { <id>: { value, label } } }`: `data.bonuses` per
    value, else `ac_bonus` / `maxHpMod` as the `manual` entry
  - `manualBonusTotal(data, value)` → the sum
  - `hpAfterMaxHpChange(curHp, oldMax, newMax)` → `newMax > oldMax ? min(curHp + delta,
    newMax) : min(curHp, newMax)`
  - `BONUS_VALUES` (the value keys) and `BONUS_LABELS` (names for the drawer)
- **Encounter state**: `add_entity` sets `entity.bonuses = manualBonuses(saved)` and no longer
  bakes `maxHpMod` into `maxHp`. `entity.maxHpMod` / `ac_bonus` are not kept for the main
  pool. `displayStats` stops adding `ac_bonus`: `effectiveStats` already contains the manual
  AC bonuses. The transformed pool keeps `transformedMaxHpMod` exactly as before.
- **`effectiveStats`** adds every manual bonus as a `bonus` entry, with name = label and a
  unique group key per bonus id, so manual bonuses are never collapsed.
  `effect_modifiers[field][]` gains `effectKey` for effect entries and `bonusId` for manual
  ones, so the drawer can link or edit them.
- **Store actions**:
  - `save_bonuses(key, bonuses)` writes the whole `bonuses` node, plus `ac_bonus: null` and
    `maxHpMod: null` (through `encounters/set_entity_prop` or
    `campaigns/update_campaign_entity`), and commits it. It is skipped in demo and test.
  - `set_bonus({ key, value, id?, amount, label })` and `remove_bonus({ key, value, id })`
    build on it.
  - `set_manual_bonus({ key, value, amount })` sets or removes (0) the `manual` entry.
  - For `max_hp` changes, these apply `hpAfterMaxHpChange` to `curHp` between the effective
    maximum before and after, through `set_hp`.
- **Why rewrite the whole node** rather than one bonus: the first change must also convert
  the legacy entry and remove the old fields, and the node is tiny.
- **Drawer** `drawers/encounter/StatBonuses.vue` (`data: { entityKey, value }`):
  - It reads `effective_entity(entityKey)`, the stored value (`stored[field]` or the field),
    and `effect_modifiers`.
  - Effect lines link to `drawers/encounter/effects/ActiveEffect`.
  - Manual lines have inline value and label inputs and a remove button.
  - An add row adds a bonus.
- **Clickable card values**: `EffectModifiedValue` gets an optional `bonus` prop (the value
  key) and opens the drawer on click when the entity is in the encounter.
- **Outside the tracker** these screens use `manualBonusTotal` / `manualBonuses`:
  - the campaign overview and its rest-dialog reset
  - the party health drawer and the player edit drawer (which set the `manual` entry and
    remove the old fields)
  - the live view and `trackEncounter`
  
  Encounter reset, `players.js` and the export also drop `bonuses`.
- **Rules**: a `bonuses` block on campaign companions and players, and on encounter entities:
  `$value` matching the value keys, `$id` matching `^[A-Za-z0-9_-]{1,100}$` with
  `hasChildren(['value','label'])`, a number `value` from −9999 to 9999, a 1–50 character
  string `label`, and `$other: false`.
- **Alternatives**:
  - *Keep `ac_bonus` / `maxHpMod` as sums next to the list*: rejected by the user (full
    migration).
  - *Write the converted format on load*: rejected. Loading would write to every player of
    the campaign without the DM changing anything.

## Risks / Trade-offs

- [Removing a positive maximum HP bonus used to subtract it from current HP. Now current HP
  is only clamped] → That matches the rules (Aid ending) and the spec. Damage taken while
  boosted isn't "refunded" or doubled.
- [The `bonuses` rules block isn't live in production] → Like 2b, upload the rules to
  production before releasing. Until then, writes of `bonuses` fail there and are logged,
  and the tracker keeps working from memory.
- [An entity that is never edited keeps its old `ac_bonus` / `maxHpMod` forever] → Every
  reader understands both formats (`manualBonuses`), so there is no visible difference.

- [Readers that aren't switched keep showing stored values: legacy `ViewEntity.vue`, the
  mobile and legacy layouts] → They are listed as unchanged. The legacy components are
  on their way out. The tooltip marker makes the difference visible where it matters.
- [`effective_entity` is recomputed on every read (the getter returns a function)] → Only
  a handful of instances per entity, and pure arithmetic. If profiling shows it, a
  `SET_EFFECTIVE` cache keyed by an effects hash can follow.
- [Lowering max HP writes current HP. Undoing the effect doesn't give it back] → That
  matches the rules (2014 Exhaustion, Harm). The HP change is visible on the health bar
  like any other; it isn't logged as damage.
- [`ac_bonus` (the DM's quick AC bonus) is still added after `fixed` AC] → That's
  intentional: it is the DM's manual override and lives outside effects.
- [A Speed rule choice: `speed` affects every movement mode] → Matches "Speed 0" and
  Exhaustion's intent. Effects that only change walking can't be expressed yet. A
  `walk_speed` subtype can be added to the schema later.
- [Recursion: formula variables need scores, and scores can be modified] → `effectiveStats`
  reads stored values for its own formulas (decision 2).

## Migration Plan

No data migration. Stored values are untouched, so rolling back means reverting the change.
The only writes are current HP clamping and temp HP grants, both through the existing
`set_hp`.
