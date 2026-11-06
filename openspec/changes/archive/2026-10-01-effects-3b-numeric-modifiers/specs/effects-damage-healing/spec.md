## MODIFIED Requirements

### Requirement: Formulas are evaluated safely

A formula (`$defs/formula`) SHALL be evaluated with numbers, the variables below, `+ - * /`
and parentheses, and nothing else. No code in a formula SHALL ever be executed. The result
SHALL be rounded as `round` says (default down) and limited by `min` / `max`. The variables
SHALL be:
- `str`…`cha` (ability scores) and `str_mod`…`cha_mod`
- `pb` (proficiency bonus) and `max_hp` of the holder
- `spellcasting_mod`: the modifier of the holder's spellcasting ability. For NPCs and
  companions this is their spellcasting ability, or else their innate spellcasting ability.
  For players it is derived from their spell save DC, as DC − 8 − proficiency bonus. It is
  unknown for a creature with neither.
- `level`: the instance's level
- `damage_taken`: the triggering event's amount

The same variables prefixed with `caster.` SHALL read the instance's caster instead of the
holder. A formula that uses a variable with no known value (an unknown name, a
`spellcasting_mod` of a creature without spellcasting, or a `caster.` variable while the
caster isn't in the encounter) SHALL NOT be guessed. Its contribution SHALL be 0, and the
roll's name SHALL say what was left out.

#### Scenario: Caster modifier
- **WHEN** a sub-effect has `roll: { dice_count: 1, dice_type: 8, modifier: { formula: "caster.wis_mod" } }` and the caster has Wisdom 16
- **THEN** the roll is 1d8+3

#### Scenario: Minimum
- **WHEN** a `healing` sub-effect has `value: { formula: "caster.cha_mod", min: 1 }` and the caster has Charisma 8
- **THEN** the roll is 1 healing

#### Scenario: Spellcasting modifier of an NPC caster
- **WHEN** Heroism's temporary hit points (`value: { formula: "caster.spellcasting_mod", min: 0 }`) are granted, and its caster is an Archmage with Intelligence as spellcasting ability and Intelligence 20
- **THEN** the amount is 5

#### Scenario: Spellcasting modifier of a player caster
- **WHEN** the caster is a level 5 player with spell save DC 15
- **THEN** `caster.spellcasting_mod` is 15 − 8 − 3 = 4

#### Scenario: Unknown variable
- **WHEN** a sub-effect has `roll: { dice_count: 2, dice_type: 6, modifier: { formula: "spellcasting_mod" } }` and the holder has no spellcasting ability and no spell save DC
- **THEN** the roll is 2d6 and its name says that "spellcasting_mod" was not included

#### Scenario: Not code
- **WHEN** a custom effect's formula is `"alert(1)"` or `"constructor"`
- **THEN** nothing is executed and the formula's contribution is 0
