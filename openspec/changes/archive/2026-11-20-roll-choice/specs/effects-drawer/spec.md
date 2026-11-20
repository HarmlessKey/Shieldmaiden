## MODIFIED Requirements

### Requirement: Application asks for the definition's choices

When an effect's definition has sub-effects whose value comes from a caster choice
(ability, damage type, skill, condition, creature type, a free option, a number value or a
roll) or a roll whose damage type is chosen from a list, the application SHALL ask for each
distinct choice kind and SHALL NOT allow applying until every choice has a valid value. A
sub-effect whose `choice` lists several kinds SHALL add each of them. A kind used by several
sub-effects SHALL be asked once and shared by them. Ability, damage type, skill, condition and
creature type choices SHALL be picked from the corresponding fixed lists; a damage type choice
limited by a roll's or a sub-effect's list SHALL only offer those types; an option choice
SHALL be free text; a value choice SHALL be a number input that accepts negative numbers. A
roll choice SHALL be asked like every other roll (a reminder's damage, a sub-effect's Roll):
Dice (a count), Die (d4 to d20) and Fixed value, filled in with the sub-effect's defined dice
when it has them. It needs dice (count and die together), a fixed value, or both. The values
SHALL be stored in the instance's `choices` keyed by choice kind: as strings (a value choice of
2 is stored as `"2"`), and a roll as `{ dice_count, dice_type, fixed_val }` with only the parts
that are set. Effects without choices SHALL NOT show choice inputs and SHALL NOT carry
`choices`.

#### Scenario: Hex asks for an ability
- **WHEN** the DM applies an effect whose sub-effect has `choice: "ability"` and picks Wisdom
- **THEN** the instance has `choices: { ability: "wisdom" }`

#### Scenario: Missing choice blocks apply
- **WHEN** an effect requires a damage type choice and none is picked
- **THEN** the effect cannot be applied

#### Scenario: Conditions have no choices
- **WHEN** the DM applies Blinded
- **THEN** no choice inputs are shown and the instance has no `choices`

#### Scenario: A value is asked as a number
- **WHEN** the DM applies a custom "Armor Class Bonus" whose sub-effect has `choice: "value"` and enters 2
- **THEN** the instance has `choices: { value: "2" }`, and the effect can't be applied while the value is empty or not a number

#### Scenario: A roll is asked like other rolls
- **WHEN** the DM applies a custom "Burning" whose damage sub-effect has `choice: "roll"` and `roll: { dice_count: 1, dice_type: 6, damage_type: "fire" }`
- **THEN** the roll inputs show Dice 1, Die d6 and an empty Fixed value; changing Dice to 2 stores `choices: { roll: { dice_count: 2, dice_type: 6 } }`, and the effect can't be applied while all three are empty or Dice is set without a Die

#### Scenario: Two kinds on one sub-effect
- **WHEN** the DM applies Skill Bonus (`choice: ["skill", "value"]`), picks Stealth and enters 5
- **THEN** the application showed a skill input and a number input, and the instance has `choices: { skill: "stealth", value: "5" }`

#### Scenario: Shift+click asks for both kinds
- **WHEN** the DM shift+clicks the apply button of Damage Reduction
- **THEN** the application form opens instead of applying directly, because the effect needs a damage type and a value
