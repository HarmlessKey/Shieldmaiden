## Context

- **Data:** the v2 schema already has every field this change needs:
  - `damage_modifier`: `sub_types`, `roll`/`value`, `damage_types`, `except_damage_types`,
    `direction`, `frequency`, `consume`, `save`
  - `reroll`: `reroll_condition`, `keep`, `reroll_bonus`, `with_advantage`
  - `roll_floor`: `value`, `applies_to`
  - `grant_action`: `sub_types`, `allowed_actions`

  Today only Haste (`grant_action`) and 5.5e Resistance (`reduce_damage`) use them.
- **Roll modifiers:** `rollModifiers` (`src/utils/effectFunctions.js`) collects roll
  modifiers per roll (`ROLL_TYPES`). `rollPlan` turns them into what the roll sites pass to
  `rollD` (`src/mixins/dice.js`): `m`, `advantage`, `bonus_dice` and `notes`.
  - Every d20 roll site goes through `rollD`, which builds the notification toast for
    checks and saves.
  - The roll dialog (`hk-single-roll.vue`) rerolls a die when it's clicked (`reroll`).
- **Damage in the roll dialog** (`hk-single-roll.vue`): one target per dialog.
  `totalRollValue` applies save/miss, then the defenses (`checkDefenses` on the
  `resistances` snapshot) to each damage roll. `totalValue` sums them, and `apply` calls
  `setHP(amounts, target, current, config)`.
- **Manual damage** (`actions/Manual.vue`, `legacy/actions/custom/Manual.vue`) has a damage
  type and per-target defenses (3d), and calls `setHP`.
- **`isDamage`** (`src/mixins/HpManipulations.js`) works out the new HP and fires
  `damage_taken`, `on_zero_hp` (with `dropsToZero`) and `on_bloodied`.
- **Details bar:** `actor/AttackReminders.vue` shows chips (Reaction Used, restrictions,
  attack modifiers) and a reminders chip.

## Goals / Non-Goals

**Goals:**
- Pure helpers for damage modifiers, extra actions and effect reminders, tested in the
  scratchpad.
- Floors and reroll offers through `rollModifiers` → `rollPlan` → `rollD`, so every d20 roll
  site gets them without changes of its own.

**Non-Goals:**
- `frequency` tracking. "Once per turn" is named on the toggle, and the DM decides.
- Outgoing damage modifiers. They are reminders only.
- Damage modifiers on the player live view.

## Decisions

### 1. `damageModifiers` (pure)

`damageModifiers({ entity, holderKey, entities, definitionOf, counterpartKey })` returns:

```
{
  toggles:   [{ id, name, effectKey, kind, roll, value, damageTypes, exceptTypes, text, notes }],
  evasion:   [{ name, effectKey, abilities }],
  absorb:    [{ name, effectKey, damageTypes }],
  dropToOne: [{ name, effectKey, damageTypes, exceptTypes, save, consume, notes }],
  reminders: [string],
}
```

It loops like `restrictions`:
- one entry per definition, with level limits and choices
- `conditionState` with `counterpartKey` (the attacker in the roll dialog)

**Conditions and types:**
- A condition that is false leaves the entry out.
- A condition that is unknown is added to its `notes`, and the entry is kept. These are
  toggles the DM switches on, or a drop to 1 the notice names, so dropping them would hide
  them.
- A `choice: "damage_type"` becomes `damageTypes: [chosen]`.
- `kind` is the `reduce` / `halve` / `negate` sub-type.
- `text` is the toggle label: "Resistance: −1d4 fire, once per turn".

**Alternative considered:** extending `effectiveDefenses`. Rejected because defenses are
always-on lists, while these entries carry amounts, choices and states.

### 2. `applyDamageModifiers` (pure)

`applyDamageModifiers({ parts, toggles, active, absorb, evasion, save, defenseOf })` takes
the target's damage parts `[{ damageType, amount }]`, which the dialog already has per
damage roll. It returns `{ parts, healing, notes }`.

For each switched-on toggle, in this order:
1. **Reduce:** the rolled amount is subtracted from the matching parts in order, until the
   amount is used up. Parts don't go below 0.
2. **Halve, then negate.**
3. **Defenses:** `defenseOf(damageType)`, as `totalRollValue` does today.

Absorbed parts move to `healing`. Evasion changes the save factor: a success becomes 0, a
failure 0.5, when the part's save factor is 0.5 and the save is a Dexterity save.

**Wiring:**
- **Roll dialog:** `hk-single-roll.vue` calls this from `totalValue`, and `apply` passes
  `healing` to `setHP`.
- **Manual damage:** the Manual components call it with one part.
- **Rolled reduction:** switching on a reduce toggle rolls it once with `rollD`. The result
  is kept in the dialog's data (`reductionRolls[id]`) and shown on the toggle. Switching it
  off clears the result.

### 3. Drop to 1 in `isDamage`

Before HP is set, when `curHp > 0` and the new HP would be 0:
1. The `damage_modifiers` getter gives `dropToOne` for the target.
2. The first entry that matches the damage types (from `config.actions`) wins.
3. The new HP becomes 1 and `dropsToZero` becomes false, so `on_zero_hp` doesn't fire. The
   massive-damage death and stable checks are skipped.

**Then:**
- **Without a save:** a notice "<creature>: <effect> — drops to 1 hit point instead". When
  it has `consume` with `scope: "effect"`, it's ended with `remove_effect`.
- **With a save:** the store queues a prompt `{ kind: "drop_to_one", holderKey, effectKey,
  ability, dc, damage, notes }`. The DC comes from the formula with `damage_taken`, as with
  Concentration saves.
  - The notifier shows it with Roll, Success and Failure, using the 3c1 Concentration save
    prompt as the model.
  - Failure: `set_hp` 0, then `fire_trigger` `on_zero_hp`.
- **Exceptions:** damage types are checked (`except_damage_types`). With unknown damage
  types it applies, and the types are named in the notes. Changed during apply: the
  schema has no field for "not from a critical hit", only the description. So it isn't
  checked; the save prompt shows the description and the DM decides.

### 4. Roll floors and rerolls through `rollPlan`

- **`ROLL_TYPES`:** gains `roll_floor` and `reroll`.
- **`rollModifiers`:**
  - collects `floors: [{ name, value, appliesTo }]`, with the value resolved like `bonus`
    values
  - collects `rerolls: [{ name, effectKey, condition, keep, bonus, withAdvantage, consume }]`
- **`rollPlan`:** passes them on as `floor` (the highest per `appliesTo`) and `rerolls`.
- **`rollD`, in `extras`:**
  - **Floor:** after Advantage or Disadvantage picks the die, a die floor raises
    `throwsTotal`, and a total floor raises `total`. A note "Reliable Talent: 7 → 10" is
    added. `roll.natural` keeps the rolled die, so nat-1/20 checks use the real die.
  - **Reroll:** a `natural 1` condition (regex `/^(a |natural )?1$/i`) is offered only when
    the kept die is 1, and other conditions always.
    - **Toast:** with notify, the toast gets a button per offer, "Reroll (Luck)", and a
      longer timeout. The button calls `rollD` again with the same arguments, advantage
      when `withAdvantage`, the bonus added to `m`, and no reroll offers. It keeps the new
      roll, the higher or the lower one, and shows the kept result.
    - **Roll dialog:** the dialog shows the offers as notes on the to-hit or save: "Luck:
      reroll the 1".

The rerolled result isn't written back into a roll dialog. There the DM clicks the die, as
today.

### 5. Extra actions and effect reminders (pure)

- **`extraActions({ entity, … })`:** `[{ kind, name, description, allowedActions }]` from
  `grant_action` sub-effects, by the same rules as restrictions.
- **`effectReminders({ entity, … })`:** returns strings for the reminder-only types:
  `compel`, `deny`, `forced_movement`, `sense`, `proficiency`, `score_swap`, a `restrict`
  with `limit` or `exclusive`, and the damage modifier reminders.
- **`AttackReminders.vue`:** adds the extra-action chips after the restriction chips, and
  merges `effectReminders` into the reminders chip.
- **Store getters:** `extra_actions(key)` and `effect_reminders(key)`, with effective
  entities.

### 6. Store getter

`damage_modifiers(key, counterpartKey)` wraps `damageModifiers` with the effective entity,
like `restrictions`.

### 7. Data

The test effects go into both `effects.js` files (spec effects-srd-data), and
`validate.mjs` must pass.
- **SRD 5.2.1 for Acid Absorption:** before adding it to 5.5e, check whether the 5.2.1
  Clay Golem has it. Leave it out of 5.5e if it doesn't.
- **5.5e Evasion and Incapacitated:** "not while Incapacitated" uses the definition-level
  `condition`, if `conditionState` supports `has_condition` with `negate` on the holder.
  Otherwise it goes in the description.

## Risks / Trade-offs

- [Reduce toggles need a click] → This is intended: most of these are a reaction or a
  choice. "Once per turn" isn't tracked.
- [Reduction order] → The 2024 order is reductions, then resistance, then vulnerability. 5e
  2014 puts other modifiers first as well, so one order works for both.
- [Reroll in the roll dialog isn't a button] → The die is already clickable there. A note
  is enough, and avoids rewriting the dialog's roll state.
- [Drop to 1 and Concentration] → While held at 1, nothing breaks Concentration on 0 HP.
  The Concentration save from the damage still prompts, because `dropsToZero` is false.
- [`rollD` is shared outside the tracker] (character builder, roller) → Without `floor` or
  `rerolls` in `extras`, it behaves as before.

## Migration Plan

None. The only data change is the new SRD definitions. There are no schema, rules or
Firestore changes.
