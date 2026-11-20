## MODIFIED Requirements

### Requirement: Application asks for the definition's choices

When an effect's definition has sub-effects whose value comes from a caster choice
(ability, damage type, skill, condition, creature type, a free option, or a number value) or a
roll whose damage type is chosen from a list, the application SHALL ask for each distinct
choice and SHALL NOT allow applying until every choice has a value. Ability, damage type,
skill, condition and creature type choices SHALL be picked from the corresponding fixed lists;
a damage type choice limited by a roll's list SHALL only offer those types; an option choice
SHALL be free text; a value choice SHALL be a number input that accepts negative numbers. The
values SHALL be stored in the instance's `choices` keyed by choice kind, as strings (a value
choice of 2 is stored as `"2"`). Effects without choices SHALL NOT show choice inputs and SHALL
NOT carry `choices`.

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
