## Why

The effects schema has sub-effect types the tracker ignores today. Some change incoming
damage: 5.5e Resistance's 1d4, Uncanny Dodge's halving, Death Ward's "drop to 1 instead",
Evasion and a golem's acid absorption. Others are extra actions (Haste) or rerolls and
minimum rolls (Luck, Reliable Talent). Some can't be automated at all, such as compelled
movement or senses. The DM has to remember all of these. Step 3g of the effects plan
handles them: it applies what can be applied, offers the rest at the right moment, and
shows everything else as a reminder.

## What Changes

- **Damage modifiers (`damage_modifier`)** on the creature taking the damage:
  - **Reduce, halve, negate** (5.5e Resistance 1d4, Uncanny Dodge, Shield against Magic
    Missile): a per-target toggle in the roll dialog, next to the defense buttons, naming
    the effect. It's off by default, because most of these are a choice or a reaction.
    Switching on a reduction rolls its die. Manual damage from the actor panel and the
    legacy actions panel gets the same toggles.
  - **Drop to 1 instead** (`floor_at_1`: Death Ward, Relentless Endurance, Undead
    Fortitude): applied automatically when damage would drop the holder to 0, with a
    notice. A single-use one is used up (Death Ward ends). One with a save first holds the
    holder at 1 and prompts for the save; a failure drops it to 0.
  - **Evasion**: applied automatically to Dexterity saves for half damage (success: none,
    failure: half), and named in the result.
  - **Absorb** (golems): damage of the absorbed types heals instead, automatically.
  - Threshold, transfer, redirect, bypass and convert become reminders.
- **Roll floors (`roll_floor`)**: a minimum die or total, applied automatically to
  matching d20 rolls (Reliable Talent: a 9 or lower on the die counts as a 10). The roll
  names it.
- **Rerolls (`reroll`)**: offered on matching d20 rolls, never applied by themselves. A
  "natural 1" reroll (Luck) is only offered when the die shows a 1. The roll result names
  the effect and its condition, with a Reroll button.
- **Extra actions (`grant_action`)**: chips in the actor's details bar after the
  restrictions ("Extra action", "Extra attack"), with the effect and the allowed actions
  in the tooltip (Haste).
- **Reminders for the rest**: `compel`, `deny`, `forced_movement`, `sense`, `proficiency`,
  `score_swap`, `limit` / `exclusive` restrictions and the damage modifiers that aren't
  automated are counted in the details bar's reminders chip and listed in its tooltip.
- **SRD test data**, in both editions:
  - Death Ward (spell)
  - Uncanny Dodge, Evasion and Reliable Talent (class features)
  - Lucky / Luck (halfling trait)
  - Undead Fortitude and Acid Absorption (monster traits)
- Not in this change:
  - triggered restrictions (Haste's lethargy)
  - automating `limit` (Slow's one attack)
  - `compel` / `deny` behavior
  - the Effects form for these fields (step 4)
  - the legacy reminders (moved to step 9)

## Capabilities

### New Capabilities
- `effects-damage-modifiers`: incoming damage changed by effects. It covers the reduce,
  halve and negate toggles, drop to 1, Evasion and Absorb, and reminders for the rest.

### Modified Capabilities
- `effects-roll-modifiers`:
  - new requirements for roll floors and offered rerolls
  - "The actor's attack modifiers are shown in the details bar" gains extra-action chips
    and the effect reminders
- `effects-srd-data`: a new requirement for the test effects.

## Impact

- **Code:**
  - `src/utils/effectFunctions.js`: pure helpers `damageModifiers`, `applyDamageModifiers`,
    `dropToOne` and `extraActions`, and `reroll` / `roll_floor` in `rollModifiers` and
    `rollPlan`
  - `src/mixins/dice.js` (`rollD`): the floor, and reroll offers on the result
  - `src/components/hk-components/hk-rolls/hk-single-roll.vue`: the toggles, Evasion,
    Absorb and reroll notes
  - `src/mixins/HpManipulations.js` (`isDamage`): drop to 1 instead
  - `src/store/modules/runEncounter.js`: a `damage_modifiers` getter, and the drop-to-1
    save prompt
  - `src/components/combat/EffectTriggerNotifier.vue`: the drop-to-1 save prompt
  - `src/components/combat/actions/Manual.vue` and `legacy/actions/custom/Manual.vue`: the
    toggles
  - `src/components/combat/actor/AttackReminders.vue`: extra-action chips and reminders
- **Data:** `src/data/5e/effects.js` and `src/data/5.5e/effects.js`.
- **No schema, rules or migration changes.** All the fields already exist in the v2
  schema.
