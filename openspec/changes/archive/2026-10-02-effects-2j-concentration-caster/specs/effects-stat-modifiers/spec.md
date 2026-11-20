## MODIFIED Requirements

### Requirement: Temporary hit points are granted from a prompt

A `fixed` sub-effect with `temp_hp` SHALL grant temporary hit points through a **Grant temp
HP** button:
- with a `trigger`: on the prompt of that trigger, next to the other buttons
- without a `trigger`: on a prompt shown when the effect is applied

The amount is the sub-effect's `roll` (rolled, the roll is shown) or its `value` (number,
formula, level scaling), as for damage in effects-damage-healing, for the holder. Granting
SHALL set the holder's temporary hit points to the higher of its current temporary hit points
and the amount, and save them. Nothing SHALL be granted without the DM choosing the button.
When the sub-effect has `expires_with_effect` and the grant raised the holder's temporary hit
points, the amount SHALL be saved on the instance as `temp_hp_granted`, when the instance
still exists.

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

### Requirement: Temporary hit points end with their effect

When an instance with `temp_hp_granted` ends, and its holder's temporary hit points are above
0 and at most `temp_hp_granted`, the holder SHALL lose them, and the change SHALL be saved.
A notice SHALL say "<holder> loses <n> temporary hit points from <effect>". This happens
however the instance ends: by hand, by expiry, or by the cascade. When an escalation replaces
the instance, it doesn't. Temporary hit points above `temp_hp_granted` came from somewhere
else and SHALL be kept. The 2014 (5e) False Life SHALL have `expires_with_effect` on its
temporary hit points, as Heroism has in both editions.

#### Scenario: False Life ends
- **WHEN** a 5e False Life instance with `temp_hp_granted: 7` is removed and its holder has 4 temporary hit points left
- **THEN** the holder's temporary hit points become 0, with the notice "Lyra loses 4 temporary hit points from False Life"

#### Scenario: Heroism ends with Concentration
- **WHEN** the caster's Concentration ends and Heroism linked to it has `temp_hp_granted: 5`, and its holder has 5 temporary hit points
- **THEN** Heroism ends through the cascade and the holder loses the 5 temporary hit points

#### Scenario: Temporary hit points from elsewhere
- **WHEN** a Heroism instance with `temp_hp_granted: 5` ends, and its holder has 12 temporary hit points from another source
- **THEN** the holder keeps the 12
