## ADDED Requirements

### Requirement: 5.5e ships the Burning hazard

The 5.5e SRD effect list SHALL contain a definition with `url: "burning"`, `name: "Burning"`
and `category: "hazard"`, following the SRD 5.2.1 Rules Glossary. It SHALL have one `damage`
sub-effect with `trigger: "start_turn_target"` and `roll: { dice_count: 1, dice_type: 4,
damage_type: "fire" }`. Its description SHALL say that the creature takes 1d4 Fire damage at
the start of each of its turns, and that it can end the effect with an action by giving
itself the Prone condition. The 5e lists SHALL NOT contain `burning`, because SRD 5.1 has no
such hazard.

#### Scenario: Burning resolves in 5.5e
- **WHEN** an instance with `source: "srd"` and `source_key: "burning"` is resolved for a `"5.5e"` campaign
- **THEN** the definition is found in the 5.5e effect list, with one start-of-turn 1d4 fire damage sub-effect

#### Scenario: Burning is not in 5e
- **WHEN** the 5e effect and condition lists are read
- **THEN** neither contains a definition with `url: "burning"`

#### Scenario: Burning validates
- **WHEN** the SRD data validation command is run
- **THEN** Burning passes with no errors
