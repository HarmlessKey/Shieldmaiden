## MODIFIED Requirements

### Requirement: Modifiers combine in a fixed order

For each value, the modifiers that apply SHALL combine in this order:
1. **base**: the highest `base` value replaces the stored value. A `base` without a value
   multiplies the stored value by its `multiplier`.
2. **bonus**: every `bonus` value is added. The value is a number or a formula (evaluated as
   in effects-damage-healing, with the instance's level as `level`). A `multiplier` on a
   sub-effect with a value multiplies that value.
3. **multiply**: each sub-effect that has only a `multiplier` multiplies the result. The
   result is then rounded down.
4. **floor / cap**: the result is at least the highest `floor` and at most the lowest `cap`.
5. **fixed**: when any `fixed` applies, the lowest `fixed` value is the result.

A formula with unknown variables SHALL contribute nothing and SHALL be named as not applied.

#### Scenario: 2024 Exhaustion level 3
- **WHEN** a player with Speed 30 has 5.5e Exhaustion at level 3 (`bonus` `speed` with `value: { formula: "-5 * level" }`)
- **THEN** its effective Speed is 15

#### Scenario: 2014 Exhaustion level 2
- **WHEN** a player with Speed 30 has 5e Exhaustion at level 2 (`base` `speed` with `multiplier: 0.5` and `min_level: 2`)
- **THEN** its effective Speed is 15

#### Scenario: Doubling after a bonus
- **WHEN** an entity with Speed 30 has a `bonus` `speed` of 10 and a sub-effect `{ type: "bonus", sub_types: ["speed"], multiplier: 2 }` without a value
- **THEN** its effective Speed is 80

#### Scenario: Fixed wins
- **WHEN** an entity has a `bonus` `speed` of 10 and Grappled's `fixed` `speed` of 0
- **THEN** its effective Speed is 0

#### Scenario: Floor
- **WHEN** an entity with AC 12 has a sub-effect `{ type: "floor", sub_types: ["ac"], value: 16 }`
- **THEN** its effective AC is 16, and with AC 18 it stays 18

### Requirement: Temporary hit points are granted from a prompt

A `fixed` sub-effect with `temp_hp` SHALL grant temporary hit points through a **Grant temp
HP** button:
- with a `trigger`: on the prompt of that trigger, next to the other buttons
- without a `trigger`: on a prompt shown when the effect is applied

The amount is the sub-effect's `roll` (rolled, the roll is shown) or its `value` (number or
formula), as for damage in effects-damage-healing, for the holder. Granting SHALL set the
holder's temporary hit points to the higher of its current temporary hit points and the
amount, and save them. Nothing SHALL be granted without the DM choosing the button. When the
sub-effect has `expires_with_effect` and the grant raised the holder's temporary hit points,
the amount SHALL be saved on the instance as `temp_hp_granted`, when the instance still
exists.

#### Scenario: False Life
- **WHEN** an effect with `{ type: "fixed", sub_types: ["temp_hp"], roll: { dice_count: 1, dice_type: 4, fixed_val: 4 } }` is applied to a player with 0 temporary HP
- **THEN** a prompt with Grant temp HP is shown, and choosing it rolls 1d4+4 and sets the player's temporary HP to the result

#### Scenario: Keep the higher
- **WHEN** a creature with 8 temporary HP is granted 5
- **THEN** it keeps 8, and no `temp_hp_granted` is saved

#### Scenario: Heroism each turn
- **WHEN** a creature's effect has a `fixed` `temp_hp` sub-effect with `trigger: "start_turn_target"` and `value: { formula: "caster.cha_mod" }`, and its turn starts
- **THEN** the trigger prompt offers Grant temp HP for the caster's Charisma modifier

#### Scenario: Recorded grant
- **WHEN** Heroism (`expires_with_effect`) grants 5 temporary hit points to a creature with 0
- **THEN** the Heroism instance has `temp_hp_granted: 5`

## ADDED Requirements

### Requirement: A chosen value is the sub-effect's value

A sub-effect with `choice: "value"` SHALL use the instance's `choices.value` as its value,
read as a number, everywhere the tracker uses a sub-effect's value: effective values (bonus,
base, fixed, floor, cap), roll bonuses and minimum rolls, damage bonuses, damage reduction,
damage and healing rolls, temporary hit points and hit point maximum healing. A negative value
SHALL be a penalty. Until the value is chosen, the sub-effect SHALL do nothing. The resolved
definition SHALL NOT be changed: each instance uses its own choice.

#### Scenario: Generic AC bonus
- **WHEN** a creature with AC 15 has a custom "Armor Class Bonus" (`bonus` `ac` with `choice: "value"`) applied with `choices: { value: "2" }`
- **THEN** its effective AC is 17, marked with "Armor Class Bonus: +2"

#### Scenario: Two instances, two values
- **WHEN** one creature has that effect with value "1" and another with value "3"
- **THEN** their AC goes up by 1 and by 3

#### Scenario: Chosen penalty
- **WHEN** the chosen value is "-1"
- **THEN** the effective AC is 14

#### Scenario: Chosen roll bonus
- **WHEN** a creature has a `bonus` on `save` with `choice: "value"` and `choices: { value: "3" }`
- **THEN** its saving throws get +3
