## MODIFIED Requirements

### Requirement: Choices are marked as chosen when applied

A sub-effect SHALL let the user set `choice` to one or more of ability, damage type, skill,
condition, creature type, option, value or roll. Only choices whose field the sub-effect shows
SHALL be offered (Value only for a sub-effect with a value; Roll only for a sub-effect with a
roll; option always). Value and Roll SHALL exclude each other: picking one removes the other.
With one kind picked, the saved `choice` SHALL be that kind as a string; with more, a list of
kinds; with none, no `choice`. Every field that a picked kind fills SHALL be shown as "chosen
when applied", and its fixed value removed. A Roll choice is the exception: the Roll field
SHALL stay, as the default roll offered when applying, and keep its damage type and magical
settings; its modifier SHALL be removed, because the chosen roll replaces it. With a Roll
choice the Value field SHALL be hidden and its value removed. With a Value choice the Roll's
dice, fixed value and modifier SHALL be hidden and removed, because a chosen value isn't
rolled: a Damage, Damage modifier or Critical sub-effect keeps its Roll for the damage type
and magical, and any other sub-effect doesn't show the Roll field. For a damage-type choice, the damage types the user lists SHALL be
the options offered when the effect is applied. With no types listed, every type SHALL be
offered.

#### Scenario: Generic absorption
- **WHEN** the user builds a "Damage modifier → Absorb" sub-effect with choice "damage type" and no damage types
- **THEN** the saved sub-effect has `choice: "damage_type"` and no `damage_types`, and applying the effect from the drawer asks for any damage type

#### Scenario: Limited damage type choice
- **WHEN** the choice is "damage type" and the listed damage types are acid, cold, fire, lightning and thunder
- **THEN** applying the effect asks for one of those five types

#### Scenario: Generic value
- **WHEN** the user builds a "Bonus → Armor Class" sub-effect with choice "Value"
- **THEN** the Value field shows "Chosen when the effect is applied", the Roll field is hidden, the saved sub-effect has `choice: "value"` and no `value` or `roll` dice, and applying the effect asks for a number

#### Scenario: Chosen value on damage
- **WHEN** the user builds a "Damage" sub-effect with a 1d6 fire roll and picks choice "Value"
- **THEN** the Roll field shows only its damage type and magical, and the saved sub-effect has `choice: "value"` and `roll: { damage_type: "fire" }`

#### Scenario: Generic damage over time
- **WHEN** the user builds a "Damage" sub-effect with a start-of-turn trigger, a 1d6 fire roll and choice "Roll"
- **THEN** the Roll field stays and says it's the default, the saved sub-effect has `choice: "roll"` and `roll: { dice_count: 1, dice_type: 6, damage_type: "fire" }`, and applying the effect asks for a roll filled in with Dice 1 and Die d6

#### Scenario: Roll replaces Value
- **WHEN** a sub-effect has choice "Value" and the user picks "Roll"
- **THEN** the saved sub-effect has `choice: "roll"`, and the Value choice is removed

#### Scenario: Two choices
- **WHEN** the user builds a "Bonus → Skill checks" sub-effect and picks the choices "Skill" and "Value"
- **THEN** the Skills and Value fields both show "Chosen when the effect is applied", the saved sub-effect has `choice: ["skill", "value"]` and no `skills` or `value`, and the configuration summary names both

#### Scenario: Removing one of two choices
- **WHEN** the user removes "Value" from a sub-effect with `choice: ["skill", "value"]`
- **THEN** the saved sub-effect has `choice: "skill"` and the Value field is editable again

#### Scenario: Fields say they can be variable
- **WHEN** a sub-effect shows a field a choice can fill (Value, Roll, Damage types, Abilities, Skills, Conditions or Creature types)
- **THEN** the field has an info icon whose popover explains that it can be made variable with Choice and gives an example; once the choice is set, the popover says the value is chosen when the effect is applied

#### Scenario: No value to choose
- **WHEN** the sub-effect is a "Defense → Resistant"
- **THEN** neither Value nor Roll is offered as a choice
