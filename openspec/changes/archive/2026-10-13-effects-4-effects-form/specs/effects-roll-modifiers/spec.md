## MODIFIED Requirements

### Requirement: Flat and dice bonuses are added

Every collected `bonus` modifier SHALL add to the roll:
- a number or formula `value` (evaluated as in effects-damage-healing, for the roller, with
  the instance's level as `level`), as a flat bonus
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
- **WHEN** a creature with 5.5e Exhaustion level 2 (`bonus` on `d20_test` with `value: { formula: "-2 * level" }`) makes any check, save or initiative roll
- **THEN** the roll's modifier is 4 lower

#### Scenario: Bless
- **WHEN** a blessed creature (a `bonus` on `save` with `roll: { dice_count: 1, dice_type: 4 }`) rolls a save with modifier +3 and rolls 12 on the d20 and 2 on the d4
- **THEN** the total is 17, and the result shows "Bless +1d4: 2"

### Requirement: Modifiers the tracker can't check are reminders

A collected modifier SHALL NOT change the roll when it depends on something the tracker can't
check. That is the case when:
- it has a `context` (sight, hearing, social…)
- its `condition`, or its definition's `condition`, can't be evaluated. Examples: a distance
  other than the assumed attack distances, line of sight, or the other party outside an
  attack. A condition that evaluates false leaves the modifier out silently.
- it has a `source` filter and the roll's source is unknown
- it has an `attack_types` filter that can't be decided for the attack

Its description, or its effect and kind ("Frightened: Disadvantage"), SHALL be listed with
the roll's result as a reminder. A `source` filter with `magical` SHALL count as checkable for
target saves in the roll dialog against a spell (magical) and for spell attacks. Repeat saves
of an effect have an unknown source: effect definitions don't say whether they are magical
(that comes with links to spells, steps 6–7). In an attack the other party is known
(effects-roll-modifiers "The other party is checked in attacks").

#### Scenario: Frightened
- **WHEN** a Frightened creature makes an ability check
- **THEN** the check is rolled normally, and the result lists "Frightened: Disadvantage while the source of its fear is within line of sight"

#### Scenario: Robe against a spell
- **WHEN** a creature with Robe of the Archmagi makes a target save in the roll dialog against a spell
- **THEN** the save is rolled with Advantage

#### Scenario: Robe against an unknown source
- **WHEN** that creature rolls a save from its card, or a repeat save of an effect
- **THEN** the save is rolled normally, with the reminder "Robe of the Archmagi: Advantage on saving throws against spells and other magical effects"

#### Scenario: Dodge
- **WHEN** a goblin attacks a creature that took the Dodge action
- **THEN** the to-hit is rolled normally, with the reminder that attacks against it have Disadvantage if it can see the attacker
