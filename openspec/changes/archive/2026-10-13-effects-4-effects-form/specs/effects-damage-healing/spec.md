## MODIFIED Requirements

### Requirement: Damage without an amount can still be rolled

A `damage` or `healing` sub-effect that has neither `roll` nor `value` SHALL still offer
Roll. The roll SHALL have an amount of 0 and a name saying the amount is not set, so the DM
can enter the total in the roll dialog before applying it.

#### Scenario: Legacy custom damage
- **WHEN** a sub-effect `{ type: "damage", trigger: "start_turn_target" }` without `roll` or `value` fires
- **THEN** the prompt offers Roll, and the roll dialog opens with 0 damage and the name "<effect> (amount not set)"

### Requirement: The rolled amount comes from the sub-effect

The amount rolled for a `damage` or `healing` sub-effect SHALL be:
- its `roll` when present: `dice_count` × d`dice_type` plus `fixed_val` plus the evaluated
  `modifier` formula, with the roll's `damage_type` and `magical`
- otherwise its `value`: a number (or numeric string) as a fixed amount, or a formula

A formula SHALL get the instance's `level` as the variable `level`, so an amount can grow
with the effect's own level. Sub-effects have no `scaling`. When the sub-effect has
`choice: "damage_type"` or its roll has `damage_type_choice`, the damage type SHALL be the
instance's `choices.damage_type` when set. A damage sub-effect's type SHALL otherwise fall
back to the first of its `damage_types`. Several damage or healing sub-effects of one prompt
that go to the same recipient SHALL be rolled as one roll with one part per sub-effect. The
roll SHALL be named after the effect. Effect damage SHALL never be a critical hit.

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
- **WHEN** a `damage` sub-effect has `value: { formula: "2 * level" }` and the instance has `level: 3`
- **THEN** the roll is 6 damage

#### Scenario: Two parts to one recipient
- **WHEN** one prompt lists two damage sub-effects for the holder, 1d6 fire and 1d6 radiant
- **THEN** one roll with a fire part and a radiant part opens
