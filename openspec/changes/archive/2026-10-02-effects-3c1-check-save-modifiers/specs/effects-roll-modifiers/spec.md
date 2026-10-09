## Purpose

How active effects and the DM's manual roll bonuses change d20 rolls in the DM's combat
tracker for ability checks, skills, saving throws and initiative: Advantage and
Disadvantage, flat and dice bonuses, automatic results, single-use modifiers, and reminders
for modifiers the tracker can't check.

## ADDED Requirements

### Requirement: Roll modifiers are collected per roll

For a d20 roll by an entity in the DM's tracker, the tracker SHALL collect the modifiers of
the entity's active effects and manual bonuses that apply to that roll. The roll kinds and
the sub-types that apply to them are:
- **ability check** of an ability: `ability`, `d20_test`
- **skill check**: `skill` (with the skill in `skills`, or no `skills`), plus everything
  for an ability check of the skill's ability
- **saving throw** of an ability: `save`, `d20_test`
- **initiative**: `initiative`, plus everything for a Dexterity check
- **Concentration save**: `concentration_save`, plus everything for a saving throw of the
  save's ability (Constitution)

A sub-effect with `abilities` SHALL apply only to rolls of those abilities. A sub-effect with
`perspective: "against"`, or the legacy `grant_advantage` / `grant_disadvantage`, SHALL NOT
apply to the holder's own rolls. Level limits (`min_level`, `max_level`), `choice`, unresolved
definitions, and the same definition on one entity twice SHALL be handled as for numeric
modifiers (effects-stat-modifiers).

#### Scenario: Poisoned ability check
- **WHEN** a Poisoned creature makes a Wisdom check from its card
- **THEN** the check has Disadvantage from Poisoned

#### Scenario: Skill inherits its ability
- **WHEN** a Poisoned creature rolls Perception
- **THEN** the roll has Disadvantage, because Perception is a Wisdom check

#### Scenario: Ability filter
- **WHEN** a Restrained creature rolls a Strength save
- **THEN** Restrained's Disadvantage on Dexterity saves doesn't apply

#### Scenario: Against-modifiers don't apply to own rolls
- **WHEN** a Blinded creature rolls a save
- **THEN** Blinded's "attack rolls against it have Advantage" doesn't change the roll

### Requirement: Advantage and Disadvantage change the roll

When at least one collected modifier gives Advantage and none gives Disadvantage, the roll
SHALL be made with Advantage, and the other way around for Disadvantage. When both are
present, they SHALL cancel and the roll is made normally. The DM's own Advantage or
Disadvantage (Shift, Ctrl, or the hold menu) SHALL count as one more source in the same
rule. The roll's result SHALL name the effects that gave Advantage or Disadvantage. A roll
button whose roll has Advantage or Disadvantage from effects SHALL show it, as it does for
the DM's own choice.

#### Scenario: Haste
- **WHEN** a hasted creature rolls a Dexterity save
- **THEN** the save is rolled with Advantage, and the result names Haste

#### Scenario: Cancel
- **WHEN** a hasted and Restrained creature rolls a Dexterity save
- **THEN** Advantage and Disadvantage cancel and one d20 is rolled

#### Scenario: DM disadvantage cancels effect advantage
- **WHEN** the DM Ctrl-clicks the Dexterity save of a hasted creature
- **THEN** one d20 is rolled

### Requirement: Flat and dice bonuses are added

Every collected `bonus` modifier SHALL add to the roll:
- a number or formula `value` (evaluated as in effects-damage-healing, for the roller), plus
  `scaling.by: "level"` × `per_unit_value`, as a flat bonus
- a `roll` as bonus dice, whose sign follows a negative `fixed_val` or a negative
  `multiplier` (Bane −1d4)

Manual roll bonuses SHALL add as flat bonuses. The flat bonuses SHALL be part of the roll's
modifier. The bonus dice SHALL be rolled with it, and their results added to the total. The
roll's result SHALL show each bonus die with its effect ("Bless +1d4: 3"). Modifiers whose
formula can't be evaluated SHALL be left out and named in the result.

#### Scenario: Slow
- **WHEN** a slowed creature with a +2 Dexterity save rolls a Dexterity save
- **THEN** the modifier is +0, and the result names "Slow −2"

#### Scenario: 2024 Exhaustion
- **WHEN** a creature with 5.5e Exhaustion level 2 makes any check, save or initiative roll
- **THEN** the roll's modifier is 4 lower

#### Scenario: Bless
- **WHEN** a blessed creature (a `bonus` on `save` with `roll: { dice_count: 1, dice_type: 4 }`) rolls a save with modifier +3 and rolls 12 on the d20 and 2 on the d4
- **THEN** the total is 17, and the result shows "Bless +1d4: 2"

### Requirement: Automatic failure and success skip the roll

When a collected modifier is `auto_fail` and none is `auto_success`, the roll SHALL NOT be
made, and the result SHALL say it failed automatically and which effect caused it. The same
goes for `auto_success`. When both are present, `auto_fail` SHALL win. For a save against a
DC (roll-dialog target saves, repeat saves), an automatic result SHALL resolve the save as
failed or succeeded.

#### Scenario: Paralyzed Strength save from the card
- **WHEN** the DM rolls a Paralyzed creature's Strength save from its card
- **THEN** no dice are rolled and a result "Strength save: fails automatically (Paralyzed)" is shown

#### Scenario: Target save in the roll dialog
- **WHEN** the DM rolls the Dexterity save of a Stunned target in the roll dialog
- **THEN** the save is marked as failed without a roll, with "Stunned" as the reason

#### Scenario: Repeat save
- **WHEN** a Paralyzed creature's repeat save is a Dexterity save and the DM chooses Roll
- **THEN** it is resolved as a failure, without a roll

### Requirement: Modifiers the tracker can't check are reminders

A collected modifier SHALL NOT change the roll when it depends on something the tracker can't
check. That is the case when:
- it has a `context` (sight, hearing, social…)
- its `condition`, or its definition's `condition`, can't be evaluated (distance, line of
  sight, the other party). A condition that evaluates false leaves the modifier out silently.
- it has a `source` filter and the roll's source is unknown

Its description, or its effect and kind ("Frightened: Disadvantage"), SHALL be listed with
the roll's result as a reminder. A `source` filter with `magical` SHALL count as checkable for
target saves in the roll dialog against a spell (magical), and for repeat saves of an effect
whose definition is `magical`.

#### Scenario: Frightened
- **WHEN** a Frightened creature makes an ability check
- **THEN** the check is rolled normally, and the result lists "Frightened: Disadvantage while the source of its fear is within line of sight"

#### Scenario: Robe against a spell
- **WHEN** a creature with Robe of the Archmagi makes a target save in the roll dialog against a spell
- **THEN** the save is rolled with Advantage

#### Scenario: Robe against an unknown source
- **WHEN** that creature rolls a save from its card
- **THEN** the save is rolled normally, with the reminder "Robe of the Archmagi: Advantage on saving throws against spells and other magical effects"

### Requirement: Single-use modifiers end their effect

When a modifier with `consume: { on: "roll" }` (uses 1, the default) changed a roll, its
instance SHALL end after that roll, announced as "used". Scope `"effect"` is the default. A
`consume` with another `on`, more than one use, or scope `"sub_effect"` SHALL NOT be enforced:
the modifier applies, and the result reminds the DM that it may be used up.

#### Scenario: Next check
- **WHEN** a creature with an effect `{ type: "bonus", sub_types: ["ability"], roll: { dice_count: 1, dice_type: 4 }, consume: { on: "roll" } }` makes an ability check
- **THEN** the d4 is added, and the effect ends with the notice "used"

### Requirement: The tracker's d20 roll sites use roll modifiers

These rolls SHALL use the roll modifiers:
- **Card**: the ability MOD (check) and SAVE, and the skill rolls
- **Targeted panel**: MOD (check) and SAVE
- **Roll dialog**: target saves
- **Effect prompts**: repeat saves and escape attempts (a skill check, or an ability check)
- **NPC initiative**: single NPC rolls

The modifier these sites show SHALL include the flat bonuses. When effects or manual bonuses
change it, it SHALL be marked like 3b's values, with a tooltip listing the flat bonuses, the
bonus dice, Advantage and Disadvantage, automatic results and reminders. Group initiative SHALL
keep its current behaviour (lowest effective Dexterity, no roll modifiers). Players' initiative
is entered by the players, so it isn't affected.

#### Scenario: Card shows the modified save
- **WHEN** a creature with a +2 Dexterity save is slowed
- **THEN** its card shows SAVE +0 for Dexterity, marked, with the tooltip "Slow: −2"

#### Scenario: Roll-dialog save uses the total
- **WHEN** a target with a +5 Dexterity save rolls 9 on the d20 against DC 13 in the roll dialog
- **THEN** the dialog shows 14 and marks the save as a success. Before 3c1, the dice alone (9) were compared, so it showed a failure.

#### Scenario: Invisible initiative
- **WHEN** the DM rolls initiative for a 5.5e Invisible NPC
- **THEN** the roll has Advantage, naming Invisible

### Requirement: Manual roll bonuses

The DM SHALL be able to give an entity labelled manual roll bonuses, stored like the manual
bonuses of effects-stat-modifiers, under these keys:
- `skill_<skill>`: one per skill, the skill name in lower case with spaces as underscores
  (`skill_animal_handling`, `skill_sleight_of_hand`)
- `check_<ability>` and `check_all`: ability checks of that ability, or all of them
- `save_<ability>` and `save_all`: saving throws of that ability, or all of them
- `death_save` and `concentration_save`

They SHALL apply as flat bonuses to the matching rolls:
- skill checks get their skill's bonuses and their ability's check bonuses
- initiative gets the Dexterity check bonuses
- Concentration saves get the `concentration_save` bonuses and the Constitution save bonuses

Death save bonuses SHALL only be shown in the bonuses drawer until the tracker rolls death
saves.

#### Scenario: Cloak of Protection
- **WHEN** the DM gives a player a `save_all` bonus +1 labelled "Cloak of Protection"
- **THEN** every save of that player is 1 higher, and the tooltip lists "Cloak of Protection: +1"

#### Scenario: Skill and check bonuses together
- **WHEN** a creature has a `skill_stealth` bonus +2 and a `check_dexterity` bonus +1
- **THEN** its Stealth check is 3 higher, and its Acrobatics check 1 higher

### Requirement: Concentration saves are rolled from the damage prompt

When `damage_taken` fires for a creature whose effect has an `outcome` sub-effect with
`break_concentration`, a `save` and that trigger (Concentration), the tracker SHALL show a
**Concentration save** prompt instead of the plain trigger line for that sub-effect:
- **The DC** is the save's `dc` evaluated with `damage_taken` as the damage of the event,
  including `min`, `max` and rounding. In 5.5e that is 10 or half the damage, at most 30;
  in 5e it has no maximum. The prompt's text SHALL be "Took <damage> damage." and
  "<Ability> saving throw, DC <dc>.". When the damage isn't known, the prompt names the rule
  instead of a number.
- **Buttons**: Roll, Succeeded and Failed.
  - **Roll** rolls the save with the roll modifiers of a **Concentration save**: everything
    for a save of the sub-effect's ability (Constitution), plus `concentration_save`
    sub-effects and the `concentration_save` manual bonuses.
  - An automatic result resolves the save without a roll.
  - With a DC, the total resolves it. Without a DC, the roll is only shown and the DM
    chooses Succeeded or Failed.
- **Failure** ends the Concentration instance, announced as "failed its Concentration save".
  Its linked effects end through the existing cascade. **Success** keeps it.

Each damage event SHALL give its own prompt. Other sub-effects of the same trigger SHALL keep
their normal trigger prompt.

#### Scenario: 5.5e Concentration after 23 damage
- **WHEN** a player concentrating in a 5.5e campaign takes 23 damage
- **THEN** a prompt "Lyra: Concentration save DC 11" says "Took 23 damage." and "Constitution saving throw, DC 11.", with Roll, Succeeded and Failed

#### Scenario: Minimum and maximum DC
- **WHEN** the damage is 7 in 5.5e, or 70 in 5.5e, or 70 in 5e
- **THEN** the DC is 10, 30 and 35

#### Scenario: Modifiers on the save
- **WHEN** a blessed player with a +2 Constitution save, a `concentration_save` manual bonus +1 labelled "War Caster (manual)", and 5.5e Exhaustion level 1 rolls the Concentration save
- **THEN** the roll is d20 + 2 + 1 − 2 + 1d4, and the result names Bless, the manual bonus and Exhaustion

#### Scenario: Failed save ends linked effects
- **WHEN** the save fails and the player's Concentration has a Hex linked to it on an NPC
- **THEN** Concentration ends with the notice "failed its Concentration save", and the Hex ends with it

#### Scenario: Unknown damage
- **WHEN** `damage_taken` fires without a damage amount
- **THEN** the prompt names the DC rule instead of a number, and Roll only shows the roll
