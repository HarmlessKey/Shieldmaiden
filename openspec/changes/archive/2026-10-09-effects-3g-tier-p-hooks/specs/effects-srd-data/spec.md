## ADDED Requirements

### Requirement: SRD effects for damage modifiers, rerolls and roll floors

Each edition's effect list SHALL contain these definitions, following that edition's SRD
text (5.1 for 5e, 5.2.1 for 5.5e):
- **Death Ward** (`death-ward`, spell, magical, 8 hours): a `damage_modifier` `floor_at_1`
  with `consume` (`scope: "effect"`)
- **Uncanny Dodge** (`uncanny-dodge`, feature): a `damage_modifier` `halve_damage` on attack
  damage, with the condition that the holder can see the attacker
- **Evasion** (`evasion`, feature): a `damage_modifier` `evasion` on Dexterity saves. In 5.5e
  it doesn't apply while the holder is Incapacitated.
- **Reliable Talent** (`reliable-talent`, feature): a `roll_floor` of 10 on the die for skill
  checks, with the proficiency requirement in its description
- **Lucky** (5e) / **Luck** (5.5e) (`luck`, feature): a `reroll` on a natural 1 for attack
  rolls, ability checks and saving throws (5.5e: D20 Tests), keeping the new roll
- **Undead Fortitude** (`undead-fortitude`, monster trait): a `damage_modifier` `floor_at_1`
  with `except_damage_types: ["radiant"]` and a Constitution save, DC `5 + damage_taken`.
  The description names the critical hit exception.
- **Acid Absorption** (`acid-absorption`, monster trait), in each edition whose SRD has it:
  a `damage_modifier` `absorb` with `damage_types: ["acid"]`

#### Scenario: Both editions
- **WHEN** the 5e and 5.5e effect lists are read
- **THEN** each contains these definitions (Acid Absorption only where its SRD has it), and the SRD data validation passes

#### Scenario: Death Ward ends when used
- **WHEN** Death Ward's damage modifier is read
- **THEN** it is a `floor_at_1` with `consume` and `scope: "effect"`
