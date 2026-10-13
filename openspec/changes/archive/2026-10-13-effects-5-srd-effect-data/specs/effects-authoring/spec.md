## MODIFIED Requirements

### Requirement: Choices are marked as chosen when applied

A sub-effect SHALL let the user set `choice` to one or more of ability, damage type, skill,
condition, creature type, option or value. Only choices whose field the sub-effect shows
SHALL be offered (Value only for a sub-effect with a value; option always). With one kind
picked, the saved `choice` SHALL be that kind as a string; with more, a list of kinds; with
none, no `choice`. Every field that a picked kind fills SHALL be shown as "chosen when
applied", and its fixed value removed. For a damage-type choice, the damage types the user
lists SHALL be the options offered when the effect is applied. With no types listed, every
type SHALL be offered.

#### Scenario: Generic absorption
- **WHEN** the user builds a "Damage modifier → Absorb" sub-effect with choice "damage type" and no damage types
- **THEN** the saved sub-effect has `choice: "damage_type"` and no `damage_types`, and applying the effect from the drawer asks for any damage type

#### Scenario: Limited damage type choice
- **WHEN** the choice is "damage type" and the listed damage types are acid, cold, fire, lightning and thunder
- **THEN** applying the effect asks for one of those five types

#### Scenario: Generic value
- **WHEN** the user builds a "Bonus → Armor Class" sub-effect with choice "Value"
- **THEN** the Value field shows "Chosen when the effect is applied", the saved sub-effect has `choice: "value"` and no `value`, and applying the effect asks for a number

#### Scenario: Two choices
- **WHEN** the user builds a "Bonus → Skill checks" sub-effect and picks the choices "Skill" and "Value"
- **THEN** the Skills and Value fields both show "Chosen when the effect is applied", the saved sub-effect has `choice: ["skill", "value"]` and no `skills` or `value`, and the configuration summary names both

#### Scenario: Removing one of two choices
- **WHEN** the user removes "Value" from a sub-effect with `choice: ["skill", "value"]`
- **THEN** the saved sub-effect has `choice: "skill"` and the Value field is editable again

#### Scenario: Fields say they can be variable
- **WHEN** a sub-effect shows a field a choice can fill (Value, Damage types, Abilities, Skills, Conditions or Creature types)
- **THEN** the field has an info icon whose popover explains that it can be made variable with Choice and gives an example; once the choice is set, the popover says the value is chosen when the effect is applied

#### Scenario: No value to choose
- **WHEN** the sub-effect is a "Defense → Resistant"
- **THEN** Value isn't offered as a choice

### Requirement: Constants stay in sync with the schema, the SRD data and the database rules

A check SHALL fail and name each problem when:
- a value of a schema enum the form offers has no constants entry, or a constants entry
  isn't in the schema
- a type/sub-type pair used in the SRD effect data (the shared file, all editions) or the
  condition data of either edition isn't allowed by the constants
- a choice kind used in the SRD data, alone or in a list, isn't in the constants
- the duration types accepted by the `effects` blocks in the database rules differ from the
  schema's `duration.type` enum

When the rules file isn't available, the check SHALL skip the rules part with a warning.

#### Scenario: New schema enum value
- **WHEN** a trigger is added to the schema without a constants entry
- **THEN** the check fails and names the trigger

#### Scenario: Rules regex out of date
- **WHEN** the schema has a duration type that a rules regex doesn't accept
- **THEN** the check fails and names the rules path and the missing type

#### Scenario: Rules file missing
- **WHEN** the rules repo isn't next to this repo
- **THEN** the check warns that the rules part was skipped, and still checks the rest

#### Scenario: Shared SRD file is checked
- **WHEN** an entry without `edition` in the shared SRD effects file uses a type/sub-type pair the constants don't allow
- **THEN** the check fails and names the entry
