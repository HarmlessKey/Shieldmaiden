## ADDED Requirements

### Requirement: A chosen roll is the sub-effect's roll

A sub-effect with `choice: "roll"` SHALL use the instance's `choices.roll` as its roll. The
chosen roll is an object like a reminder's damage: `{ dice_count, dice_type, fixed_val }`, with
dice (a count of 1 to 99 and a die of 2 to 100, given together), a whole fixed value, or both.
It SHALL replace the roll's `dice_count`, `dice_type`, `fixed_val` and `modifier`; the roll's
other fields (`damage_type`, `damage_type_choice`, `magical`) and the sub-effect's
`multiplier` SHALL stay as defined. A fixed value without dice SHALL be a fixed amount. It
SHALL be used everywhere the tracker uses a sub-effect's roll:
- stat values (bonus, base, fixed, floor, cap) roll it once when the effect is applied and
  store the total in `rolled_values`, like a defined roll
- `damage` and `healing` sub-effects roll it every time they trigger
- roll bonuses and damage bonuses roll it on every roll they add to

Until a valid roll is chosen, the sub-effect SHALL do nothing. The resolved definition SHALL
NOT be changed: each instance uses its own choice. An instance or link without a roll but
with a numeric `choices.value` SHALL use that value as a fixed roll, so instances and links
made while an effect had a value choice keep working after it switches to a roll choice.

#### Scenario: Damage over time
- **WHEN** a creature has a custom "Burning" effect (`damage` triggered at the start of its turn, `roll: { damage_type: "fire" }`, `choice: "roll"`) applied with `choices: { roll: { dice_count: 2, dice_type: 6 } }`
- **THEN** at the start of each of its turns the damage prompt rolls 2d6 fire

#### Scenario: Chosen Strength reduction
- **WHEN** Weakening Breath (`bonus` `ability_score` Strength, `multiplier: -1`, `choice: "roll"`) is applied with `choices: { roll: { dice_count: 1, dice_type: 6 } }` and rolls 4
- **THEN** the instance has `rolled_values` 4 and the creature's Strength is 4 lower

#### Scenario: Roll with a fixed value
- **WHEN** a damage sub-effect with `roll: { dice_count: 1, dice_type: 4, damage_type: "acid" }` and `choice: "roll"` has `choices: { roll: { dice_count: 2, dice_type: 4, fixed_val: 2 } }`
- **THEN** it rolls 2d4+2 acid

#### Scenario: Only a fixed value
- **WHEN** the chosen roll is `{ fixed_val: 5 }` on a damage sub-effect
- **THEN** it deals 5 damage without rolling

#### Scenario: Made with a value choice
- **WHEN** a creature has a Damage Over Time instance with `choices: { damage_type: "fire", value: "5" }`, and the definition now has `choice: ["damage_type", "roll"]`
- **THEN** it still takes 5 fire damage at the start of its turns, and a link with `choices: { value: "4" }` on Hit Point Maximum Reduction doesn't ask for a roll

#### Scenario: Two instances, two rolls
- **WHEN** one creature has Burning with roll 1d4 and another with 3d6
- **THEN** their damage prompts roll 1d4 and 3d6
