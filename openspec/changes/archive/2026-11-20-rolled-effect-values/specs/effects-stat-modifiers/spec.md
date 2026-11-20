## ADDED Requirements

### Requirement: Rolled values are rolled when the effect is applied

A numeric sub-effect (`bonus`, `base`, `fixed`, `floor`, `cap`) whose `sub_types` change an
effective value (any value of "Numeric sub-effects change effective values") SHALL use its
`roll` as its value when it has dice (`dice_count` and `dice_type`). The roll SHALL be made
once, when the instance is applied, and its total (dice, `fixed_val` and the `modifier`
formula, with the caster's and the holder's formula variables) SHALL be stored on the
instance. Every application path SHALL do this: the Effects drawer, effect links on actions
and spells, the bonus drawers, and effects applied outside combat. Each target of an
application SHALL get its own roll.

The stored total SHALL then count as the sub-effect's value everywhere effective values are
computed. That includes the combining order, so a `multiplier` applies to it and
`multiplier: -1` makes it a penalty. The stored total SHALL NOT be rolled again when the
instance changes level, when the encounter is reloaded or when the definition changes.

- A sub-effect with `choice: "value"` SHALL use the chosen value. Nothing is rolled for it.
- A sub-effect with both a `value` and a roll with dice SHALL use the roll.
- A sub-effect with a roll but no stored total SHALL contribute nothing and SHALL be listed
  as not applied ("not rolled"). This covers instances applied before the definition got a
  roll, and trait effects, which are never applied.
- `temp_hp` keeps its own grant prompt (Temporary hit points are granted from a prompt) and
  SHALL NOT be rolled on application.

The apply notice SHALL show each roll with its result and its effect on the value
("Strength Drain: 1d4 = 3, Strength −3"). The value's tooltip SHALL show the stored amount
and the roll it came from ("Strength Drain: −3 (1d4)"). Demo and test mode SHALL roll the same
way without writing (effects-instance-storage).

#### Scenario: Strength Drain
- **WHEN** an effect with `{ type: "bonus", sub_types: ["ability_score"], abilities: ["strength"], roll: { dice_count: 1, dice_type: 4 }, multiplier: -1 }` is applied to a player with Strength 14, and the d4 rolls 3
- **THEN** the instance stores the total 3, the player's effective Strength is 11, its Strength modifier is +0, and the notice shows "1d4 = 3"

#### Scenario: Rolled maximum reduction
- **WHEN** an effect with a `bonus` `max_hp` sub-effect with `roll: { dice_count: 3, dice_type: 6 }` and `multiplier: -1` is applied to an NPC at 40/40 HP, and the dice roll 11
- **THEN** its effective maximum is 29 and its current HP is set to 29

#### Scenario: Rolled bonus
- **WHEN** an effect with a `bonus` `ac` sub-effect with `roll: { dice_count: 1, dice_type: 4 }` and no multiplier is applied to a creature with AC 15, and the d4 rolls 2
- **THEN** its effective AC is 17, with the tooltip "<effect>: +2 (1d4)"

#### Scenario: Each target rolls
- **WHEN** that Strength Drain effect is applied to two creatures at once
- **THEN** each instance stores its own roll

#### Scenario: Not rolled again
- **WHEN** an instance with a stored total of 3 changes level, or the encounter is closed and opened again
- **THEN** its total is still 3

#### Scenario: Modifier formula
- **WHEN** an effect with a `bonus` `ac` roll of `{ dice_count: 1, dice_type: 4, modifier: { formula: "caster.wis_mod" } }` is applied by a caster with Wisdom modifier +3, and the d4 rolls 1
- **THEN** the stored total is 4

#### Scenario: Instance without a roll
- **WHEN** an instance has no stored total for a sub-effect with a roll
- **THEN** that sub-effect doesn't change the value and the tooltip lists it as not rolled

#### Scenario: Chosen value wins
- **WHEN** a sub-effect has both a roll and `choice: "value"`, and is applied with `choices: { value: "-2" }`
- **THEN** nothing is rolled and the value is −2

## MODIFIED Requirements

### Requirement: Hit points follow the effective maximum

Healing SHALL stop at the effective hit point maximum. Bloodied (`on_bloodied`) and instant
death from damage SHALL use it. When an entity's effective maximum drops below its current hit
points (an effect applied, removed or changed level), its current hit points SHALL be set to
the effective maximum and saved. When an instance is applied whose definition has a `bonus`
`max_hp` sub-effect with `also_heal`, current hit points SHALL rise by that bonus, up to the
new effective maximum, and be saved. The bonus is its value, or its rolled total (Rolled
values are rolled when the effect is applied) times its multiplier. A transformed entity's
transformed hit point pool SHALL NOT follow `max_hp` sub-effects.

#### Scenario: Exhaustion halves the maximum
- **WHEN** a player at 40/40 HP reaches 5e Exhaustion level 4
- **THEN** its effective maximum is 20 and its current HP is set to 20

#### Scenario: Healing stops at the effective maximum
- **WHEN** that player at 10/20 is healed for 15
- **THEN** its HP becomes 20

#### Scenario: Aid
- **WHEN** Aid (a `bonus` `max_hp` of 5 with `also_heal`) is applied to a player at 12/30
- **THEN** its effective maximum is 35 and its HP 17

#### Scenario: Rolled also-heal
- **WHEN** an effect with a `bonus` `max_hp` roll of 2d4 with `also_heal` is applied to a player at 12/30, and the dice roll 5
- **THEN** its effective maximum is 35 and its HP 17

#### Scenario: Maximum restored
- **WHEN** an effect that lowered the maximum ends
- **THEN** the maximum is back and current HP stays as it is
