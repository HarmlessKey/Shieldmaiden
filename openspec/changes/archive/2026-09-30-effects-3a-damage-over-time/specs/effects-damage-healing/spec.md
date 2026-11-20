## Purpose

How `damage` and `healing` sub-effects of active effects are rolled and applied in the combat
tracker: from which prompts, what amount is rolled, who takes and who deals it, and how saves
and unknown amounts are handled, always with the DM applying the result.

## ADDED Requirements

### Requirement: Prompts with damage or healing offer a roll

An effect prompt SHALL offer a **Roll** button when it lists at least one `damage` or
`healing` sub-effect with a known recipient. This applies to:
- trigger prompts (an effect listens for a trigger that fired)
- the repeat-save failure prompt (`duration.save.on_fail`)
- the prompt shown when an effect ends (`duration.on_expire` and `on_expire`-triggered
  sub-effects)

Choosing Roll SHALL roll those sub-effects and open the result in the tracker's roll dialog,
with the recipient as the target, and close the prompt. The dialog SHALL behave as for an
action roll: the DM can see and change the defenses, mark the save result, edit the total,
and apply or dismiss it. Applying SHALL change HP, log, update damage meters and fire the HP
triggers as applying an action roll does. No damage or healing SHALL be applied without the
DM applying it in the dialog. Prompts without damage or healing sub-effects SHALL NOT change.

#### Scenario: Burning at the start of its turn
- **WHEN** an NPC with Burning (a `damage` sub-effect, `trigger: "start_turn_target"`, 1d4 fire) starts its turn
- **THEN** the trigger prompt for Burning shows Roll next to Details and Dismiss

#### Scenario: Roll opens the roll dialog
- **WHEN** the DM chooses Roll on that prompt
- **THEN** 1d4 fire damage is rolled, the roll dialog opens with the NPC as target, and the prompt closes

#### Scenario: Applying goes through the normal damage path
- **WHEN** the DM applies the rolled 3 fire damage in the roll dialog to an NPC with fire resistance
- **THEN** the NPC takes 1 damage, the log records it, and `damage_taken` fires for the NPC

#### Scenario: Prompt without damage
- **WHEN** a trigger prompt only lists an `outcome` sub-effect (Concentration on damage)
- **THEN** it shows no Roll button

#### Scenario: Damage on a failed repeat save
- **WHEN** a repeat save fails for an instance whose `duration.save.on_fail` has a `damage` sub-effect of 4d10 psychic
- **THEN** the failure prompt shows Roll, which rolls 4d10 psychic damage against the holder

### Requirement: The rolled amount comes from the sub-effect

The amount rolled for a `damage` or `healing` sub-effect SHALL be:
- its `roll` when present: `dice_count` × d`dice_type` plus `fixed_val` plus the evaluated
  `modifier` formula, with the roll's `damage_type` and `magical`
- otherwise its `value`: a number (or numeric string) as a fixed amount, or a formula

With `scaling.by: "level"` or `"stacks"`, `per_unit_dice` SHALL add that many dice, and
`per_unit_value` that much fixed value, per instance `level` above `scaling.base`
(default 0). Other `scaling.by` values SHALL be ignored and named in the roll's name. When
the sub-effect has `choice: "damage_type"` or its roll has `damage_type_choice`, the damage
type SHALL be the instance's `choices.damage_type` when set. A damage sub-effect's type
SHALL otherwise fall back to the first of its `damage_types`. Several damage or healing
sub-effects of one prompt that go to the same recipient SHALL be rolled as one roll with one
part per sub-effect. The roll SHALL be named after the effect. Effect damage SHALL never be a
critical hit.

#### Scenario: Dice with a damage type
- **WHEN** a sub-effect has `roll: { dice_count: 1, dice_type: 4, damage_type: "fire" }`
- **THEN** the roll is 1d4 with damage type fire

#### Scenario: Fixed value
- **WHEN** a `healing` sub-effect has `value: 5` and no roll
- **THEN** the roll is 5 healing

#### Scenario: Chosen damage type
- **WHEN** a sub-effect has `choice: "damage_type"` and `roll: { dice_count: 1, dice_type: 6 }`, and the instance has `choices: { damage_type: "cold" }`
- **THEN** the roll is 1d6 cold

#### Scenario: Level scaling
- **WHEN** a sub-effect has `roll: { dice_count: 1, dice_type: 6 }` and `scaling: { by: "level", per_unit_dice: 1, base: 1 }`, and the instance has `level: 3`
- **THEN** the roll is 3d6

#### Scenario: Two parts to one recipient
- **WHEN** one prompt lists two damage sub-effects for the holder, 1d6 fire and 1d6 radiant
- **THEN** one roll with a fire part and a radiant part opens

### Requirement: Formulas are evaluated safely

A formula (`$defs/formula`) SHALL be evaluated with numbers, the variables below, `+ - * /`
and parentheses, and nothing else. No code in a formula SHALL ever be executed. The result
SHALL be rounded as `round` says (default down) and limited by `min` / `max`. The variables
SHALL be:
- `str`…`cha` (ability scores) and `str_mod`…`cha_mod`
- `pb` (proficiency bonus) and `max_hp` of the holder
- `level`: the instance's level
- `damage_taken`: the triggering event's amount

The same variables prefixed with `caster.` SHALL read the instance's caster instead of the
holder. A formula that uses a variable with no known value (an unknown name, or a `caster.`
variable while the caster isn't in the encounter) SHALL NOT be guessed. Its contribution
SHALL be 0, and the roll's name SHALL say what was left out.

#### Scenario: Caster modifier
- **WHEN** a sub-effect has `roll: { dice_count: 1, dice_type: 8, modifier: { formula: "caster.wis_mod" } }` and the caster has Wisdom 16
- **THEN** the roll is 1d8+3

#### Scenario: Minimum
- **WHEN** a `healing` sub-effect has `value: { formula: "caster.cha_mod", min: 1 }` and the caster has Charisma 8
- **THEN** the roll is 1 healing

#### Scenario: Unknown variable
- **WHEN** a sub-effect has `roll: { dice_count: 2, dice_type: 6, modifier: { formula: "spellcasting_mod" } }`
- **THEN** the roll is 2d6 and its name says that "spellcasting_mod" was not included

#### Scenario: Not code
- **WHEN** a custom effect's formula is `"alert(1)"` or `"constructor"`
- **THEN** nothing is executed and the formula's contribution is 0

### Requirement: The recipient follows the sub-effect's target

A sub-effect's recipient SHALL be:
- `self` (default): the holder
- `caster`: the instance's caster
- `trigger_source` and `counterpart`: the other party of the triggering event (e.g. the
  attacker for `on_hit_taken` and `damage_taken`, the target for `on_hit`)

When the recipient isn't an entity in the running encounter, or the event doesn't name one
(for example a turn trigger), that sub-effect SHALL NOT be rolled. The prompt SHALL still
list it.

#### Scenario: Hex damage lands on the holder
- **WHEN** `on_hit_taken` fires for `npc_1`, hit by its Hex caster `player_1`, and Hex's damage sub-effect has no `target`
- **THEN** Roll opens a roll against `npc_1`

#### Scenario: Retaliation
- **WHEN** `on_hit_taken` fires for `player_1`, hit by `npc_2`, and `player_1`'s effect has a damage sub-effect with `target: "trigger_source"`
- **THEN** Roll opens a roll against `npc_2`

#### Scenario: No recipient known
- **WHEN** a damage sub-effect with `target: "trigger_source"` fires on `start_turn_target`
- **THEN** the prompt lists it and offers no Roll for it

#### Scenario: Caster gone
- **WHEN** a damage sub-effect with `target: "caster"` fires and the instance's caster isn't in the encounter
- **THEN** it offers no Roll

### Requirement: The dealer is the holder or the caster

The entity recorded as dealing the damage or healing (for the log, damage meters and
`damage_dealt`) SHALL be:
- the holder when the recipient is the other party of the event (`trigger_source`,
  `counterpart`)
- otherwise the instance's caster when it is in the running encounter
- otherwise the holder

#### Scenario: Caster deals damage over time
- **WHEN** an NPC's Burning was applied by `player_2`, who is in the encounter, and its start-of-turn damage is applied
- **THEN** the log and damage meters record `player_2` as dealing it, and `damage_dealt` fires for `player_2`

#### Scenario: No caster
- **WHEN** an NPC's Burning has no caster and its damage is applied
- **THEN** the NPC is recorded as dealing it

### Requirement: A sub-effect save becomes a save in the roll

A `damage` sub-effect with `save` SHALL be rolled as a save in the roll dialog. The save SHALL
use `save.ability`, or the first of `save.abilities`. Its DC SHALL be `save.dc` (a number, or
a formula evaluated as above) or else the instance's `save_dc`. The save's success SHALL be
treated per `save.on_success`: `half` halves that damage, and `negate` (default) and `partial`
leave no damage. When no DC is known, the dialog SHALL show the save without a DC and the DM
SHALL mark the result. A `healing` sub-effect's `save` SHALL be ignored.

#### Scenario: Save for half
- **WHEN** a damage sub-effect has 2d6 fire and `save: { ability: "dexterity", on_success: "half" }`, and the instance has `save_dc: 13`
- **THEN** the roll dialog shows a Dexterity save DC 13, and a success halves the damage

#### Scenario: No DC known
- **WHEN** a damage sub-effect has `save: { ability: "constitution" }` and the instance has no `save_dc`
- **THEN** the dialog shows a Constitution save without a DC, and the damage follows the save result the DM marks

### Requirement: Damage without an amount can still be rolled

A `damage` or `healing` sub-effect that has neither `roll` nor `value` (custom effects saved
by the legacy effect form) SHALL still offer Roll. The roll SHALL have an amount of 0 and a
name saying the amount is not set, so the DM can enter the total in the roll dialog before
applying it.

#### Scenario: Legacy custom damage
- **WHEN** a custom effect's legacy sub-effect `{ type: "damage", subtype: "roll", trigger: "start_turn_target" }` fires
- **THEN** the prompt offers Roll, and the roll dialog opens with 0 damage and the name "<effect> (amount not set)"
