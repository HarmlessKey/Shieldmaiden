## Context

See proposal.md (Why). Requirements: `specs/effects-roll-modifiers/spec.md` (new) and
`specs/effects-stat-modifiers/spec.md` (manual-bonus keys and the drawer).

State after 3b:
- **`effectFunctions.js`**:
  - `effectiveStats` handles numeric modifiers. It treats a `condition` that can't be
    evaluated as false and lists the modifier as not applied.
  - `evaluateConditionSet` returns a boolean, and `false` for check types it doesn't know
    (distance, line_of_sight, can_see, is_caster with a counterpart).
  - `formulaVars` / `resolveAmount` / `amountRoll` evaluate values and dice.
- **Manual bonuses**: `entityFunctions.js` (`BONUS_LABELS`, `manualBonuses`), the store
  actions `set_bonus` / `remove_bonus`, the `StatBonuses.vue` drawer (one `stat`), and three
  `bonuses` rules blocks with a `$stat` regex.
- **d20 roll sites**:
  - `hk-roll.vue` takes a `roll` config `{ d, n, m, title, entity_name, notify, advantage,
    trigger }`. It merges the DM's Shift/Ctrl/hold choice into `advantage` and calls the
    dice mixin's `rollD`. Its colour class follows `roll.advantage` when that has exactly
    one key.
  - `hk-roll` is used for the card's MOD/SAVE (`CardDetails.vue`, `modifier(ability, type)`),
    the card's skills (`CardSkills.vue`, `skillModifier` from `CardDetails`), and the
    Targeted panel's MOD/SAVE.
  - `rollD(e, d, n, m, title, entity_name, notify, advantage_object, share)` rolls n×d+m.
    With exactly one advantage key it rolls 2d20 and keeps one. It shows a toast and can
    share the roll.
  - `hk-single-roll.vue` `rollSave` rolls a target's save with `rollD` and compares
    `throwsTotal` (the dice only) with the DC: that's a bug, fixed here.
  - `effectRolls.rollEffectCheck` is used for repeat saves (`EffectTriggerNotifier`) and
    escapes (`ActiveEffect`). `initiative/NPCs.vue` `rollMonster` / `rollGroup` roll NPC
    initiative.
  - `rollAction` (attacks) is untouched; that's 3c2.
- **Death saves** are marked by hand (`DeathSaves.vue`). Concentration saves are only a
  prompt line.

## Goals / Non-Goals

**Goals:**
- One pure function decides every d20 modifier for a roll. Roll sites only turn its result
  into a roll.
- What the tracker can't know is never guessed: it becomes a visible reminder.

**Non-Goals:**
- Attack and damage rolls, `perspective: "against"`, crits, rerolls, `roll_floor`: 3c2 or
  later.
- Rolling death saves.
- `consume` beyond "one use, on the roll, ends the effect".
- Changing the player live view, or showing shared rolls' modifiers there beyond the total.

## Decisions

### 1. `rollModifiers` (pure, `effectFunctions.js`)
`rollModifiers({ entity, holderKey, entities, definitionOf, roll })`, where `roll = { kind:
"check" | "skill" | "save" | "initiative", ability, skill, source }`. It returns:

```
{ advantage: [name], disadvantage: [name],
  flat: [{ name, value }], dice: [{ name, dice_count, dice_type, sign }],
  autoFail: [name], autoSuccess: [name],
  reminders: [text], consume: [{ holderKey, effectKey }], usedUp: [text] }
```

- **Kinds to sub-types** (spec): check → `ability`, `d20_test`; skill → `skill` plus the
  check of `skills[skill].ability`; save → `save`, `d20_test`; initiative → `initiative`
  plus the Dexterity check.
- **Filters**: `abilities` (the roll's ability), `skills` (the skill's value).
  `perspective: "against"` and `grant_*` are skipped.
- **Shared rules with 3b**: unresolved definitions, level limits, `choice`, and the same
  definition twice. The "strongest" instance is the one with the most entries for this roll.
- **Types**:
  - `advantage` / `disadvantage` → names
  - `bonus` with `value` or level scaling → flat (`resolveAmount`, vars from the effective
    roller and caster, as in 3b)
  - `bonus` with `roll` → dice. `sign` is −1 when `fixed_val < 0` or `multiplier < 0`
    (Bane), and the dice's own `fixed_val` is added as flat.
  - `auto_fail` / `auto_success` → names
- **Reminders** (spec):
  - a `context`
  - a `condition` or definition `condition` whose state is unknown (decision 2)
  - a `source` filter: only `magical: true` is checkable, against `roll.source?.magical`
    when known
  
  The text is the sub-effect's `description`, else "<Effect>: <Type>" (`describeSubEffect`).
- **Consume**: `consume.on === "roll"` with uses 1 and scope effect → `consume`. Other
  consume forms → `usedUp` reminder lines.
- **Manual bonuses** (`manualBonuses(entity)`) add flat entries named after their label:
  - skill → `skill_<key>` + `check_<ability>` + `check_all`
  - check → `check_<ability>` + `check_all`
  - save → `save_<ability>` + `save_all`
  - initiative → `check_dexterity` + `check_all`
- **Getter** `roll_modifiers: (state, getters) => (key, roll)` uses
  `getters.effect_definition`.

### 2. Three-valued conditions
New `conditionState(set, ctx)` → `true` / `false` / `"unknown"`:
- `has_condition`, `has_effect`, `bloodied`, `hp_zero`, `temp_hp_zero` and `hp_threshold`
  for subject self or a present caster are evaluated as `evaluateConditionSet` does.
- Any other type, the `counterpart` / `trigger_source` subjects, and a missing caster give
  `"unknown"`.
- `negate` flips true/false and leaves unknown alone.
- Arrays and `all_of`: false wins, then unknown. `any_of`: true wins, then unknown.

`evaluateConditionSet` keeps its boolean behaviour (unknown → false) for 2h1/3b callers.
3b's `effectiveStats` is not changed.

### 3. `rollPlan` and the dice mixin
`rollPlan(modifiers, { modifier, advantage })` (pure) turns the result into:
- `m`: the modifier plus the flat bonuses
- `advantage`: an object built from the effect names and the DM's choice. Both present →
  `{ advantage: true, disadvantage: true }`, which `rollD` already treats as cancelled.
- `bonus_dice`, `notes` (the named Advantage/Disadvantage, flat and dice lines, reminders,
  used-up hints) and `auto` (`"fail"` | `"success"` | undefined, with its names)

`rollD` gets an optional 10th argument `extras = { bonus_dice, notes }`:
- each bonus die group is rolled, signed and added to `total`
- the toast's footer lists "Bless +1d4: 3" and the notes
- the returned roll carries `bonus_rolls` and `notes`, and the shared roll keeps its total

Existing callers pass nothing and are unchanged.

### 4. Roll sites
- **`hk-roll`**:
  - New optional `roll.plan` (from `rollPlan`).
  - When present, `roll.advantage` comes from the plan, so the button colour shows effect
    Advantage. The DM's Shift/Ctrl is merged by the same rule.
  - `plan.auto` → no `rollD`. Instead a toast "<title>: fails automatically (Paralyzed)",
    and `on_check` still fires, without a natural roll.
  - After rolling, dispatches `consume_roll_modifiers(plan.consume)`.
- **`CardDetails` / `CardSkills` / `Targeted`**:
  - The roll config gets `plan` from `roll_modifiers(key, roll)` and `m: plan.m`.
  - The shown value uses `plan.m`.
  - The marker reuses `EffectModifiedValue` through new optional `lines` / `modified` props.
- **`hk-single-roll` `rollSave`**:
  - Plan for the target's save. `source.magical` is true when the roll came from a spell:
    `rollAction` sets `returnRoll.source = { magical: config.type === "spell" }` for spells,
    and leaves it unknown for monster actions.
  - Compares the **total** (bug fix) and shows it.
  - `plan.auto` → sets the result without rolling.
  - The notes show under the save row.
- **`effectRolls.rollEffectCheck`**:
  - Takes a `roll` descriptor and builds the plan.
  - Returns `{ total, auto }`. `auto` resolves repeat saves (`EffectTriggerNotifier`) and
    escape attempts (`ActiveEffect`) without a roll.
  - The source for repeat saves is `{ magical: definition.magical }` when the definition
    says so.
- **`initiative/NPCs.vue` `rollMonster`**: the initiative plan with the effective modifier
  from 3b. `rollGroup` is unchanged (spec).
- **`consume_roll_modifiers`** (store): for each `{ holderKey, effectKey }`,
  `remove_effect` with reason "used".

### 5. Manual roll-bonus keys
- `entityFunctions.js`:
  - `skillBonusKey(skill) = "skill_" + skill.toLowerCase().replace(/ /g, "_")`
  - `BONUS_LABELS` gains the 18 skills ("Animal Handling"), `check_<ability>` ("Strength
    checks"), `check_all` ("All ability checks"), `save_<ability>`, `save_all`,
    `death_save` and `concentration_save`.
- `manualBonuses` already keeps only known keys, so it picks them up. `effectiveStats`
  ignores them (`statFields` returns nothing for them).
- **Rules**: the `$stat` regex of all three blocks is extended with
  `skill_(acrobatics|animal_handling|…|survival)`, `check_(…abilities…|all)`,
  `save_(…|all)`, `death_save` and `concentration_save`. The emulator test from 3b is
  extended.

### 6. The bonuses drawer with several values
`StatBonuses.vue` takes `data: { entityKey, stats: [..] }` (and still `stat` for one).
- Each value is a section with stored, effect lines, manual bonuses and effective. Sections
  without lines or bonuses are collapsed.
- One add form, with a select over the drawer's values.
- **Roll values**:
  - "stored" is the base modifier (the same formulas as the card), and effective is the
    plan's `m`
  - effect lines are the plan's lines (flat, dice, Advantage/Disadvantage, automatic,
    reminders)
  - `check_all`, `save_all`, `death_save` and `concentration_save` show only their manual
    bonuses
- **Openers**:
  - an ability score opens `[ability, check_<ability>, save_<ability>]`
  - the new skills button opens `[check_all, save_all, death_save, concentration_save,
    ...skills]`

### As built (apply)
- `rollModifiers` also returns `lines` (`{ name, text, effectKey, applied }`), so the
  drawer can link roll modifiers to their effect. Reminders are `applied: false`.
- `rollPlan` also returns `roll_notes`: the notes without the bonus-dice lines, which the
  roll result shows with their rolled values instead.
- `rollD` escapes note lines and bonus labels, because manual bonus labels are DM text in
  an HTML toast.
- Bonus dice: a negative `fixed_val` only gives the dice their sign (Bane). A positive one
  is added as flat.
- Two existing bugs fixed on the way:
  - Roll-dialog saves passed `hk-roll`'s `{ e, advantage_disadvantage }` to `rollD` as if
    it were the event, so the DM's Advantage choice was lost there.
  - Escape attempts without a skill used the save modifier instead of the check modifier.
- The card's SAVE roll title said "check". It now says "save".
- Shown modifiers with Advantage or Disadvantage from effects get a green **A** or a red
  **D** next to the value (`EffectModifiedValue` `advantage` prop, on request). When both
  apply they cancel, and no letter is shown.
- `choice: "ability"` / `"skill"` limit which rolls a modifier applies to: the instance's
  chosen ability or skill. This is the roll equivalent of 3b's ability-score choice. It's
  needed for 2024 Guidance (a chosen skill) and Hex-style "checks with the chosen ability".
- NPC initiative has no roll toast, so when a plan has notes, a short info toast names
  them ("Goblin: initiative 17 — Advantage: Invisible").

### 7. Concentration saves (added during testing)
- **Store**: in `fire_trigger`, a matched sub-effect that is an `outcome` with
  `break_concentration` and a `save` becomes its own prompt of kind `concentration_save`.
  - The prompt carries `{ holderKey, effectKey, ability, dc, damage, dcText }`.
  - `dc` comes from `resolveAmount(save.dc, { damage_taken: event.amount })`, which applies
    min, max and rounding. Without an amount the DC is undefined, and `dcText` is the
    sub-effect's description.
  - The other matched sub-effects keep the normal trigger prompt, which is skipped when none
    are left.
- **`rollModifiers`**: roll kind `concentration` = parts `{ kind: "concentration" }`
  (sub-type `concentration_save`, manual key `concentration_save`) plus a save of the
  ability (default Constitution). `roll.ability` sets it.
- **Notifier**: `showConcentrationSave` has Roll / Succeeded / Failed, like the repeat-save
  prompt.
  - Roll uses `rollEffectCheck` with the save modifier and `roll: { kind: "concentration",
    ability }`. An automatic result resolves the save.
  - Failure → `remove_effect({ key, effectKey, reason: "failed its Concentration save" })`.
    The cascade does the rest.
- **Drawer**: `concentration_save` becomes a roll value (Constitution save modifier →
  effective). Only `death_save` stays manual-only.

## Risks / Trade-offs

- [Initiative as a Dexterity check means a Poisoned NPC rolls initiative with Disadvantage]
  → That is the rule in both editions. The roll result names Poisoned, so it's visible.
- [Roll-dialog saves change results compared to before (the total instead of the dice)] →
  It's a bug fix. The old behaviour made every save modifier irrelevant.
- [`hk-roll` is shared with non-tracker pages (compendium, character sheets)] → `plan` is
  optional. Without it nothing changes.
- [Rules must be uploaded before release for the new keys] → As in 3b. Until then, writes of
  the new keys fail and are logged.
- [A reminder can be missed in a quick toast] → The reminders are also in the roll button's
  tooltip and the drawer, so the DM can check before rolling.

## Migration Plan

No data migration: new keys only. Rollback is reverting the change. Saved roll-bonus keys
would then be ignored, because `manualBonuses` drops unknown keys.
