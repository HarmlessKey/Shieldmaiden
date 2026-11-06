## MODIFIED Requirements

### Requirement: SRD definitions are looked up by url in the campaign edition

An instance with `source: "srd"` SHALL resolve to the definition whose `url` equals its
`source_key`, searched in the running encounter's campaign edition set: the SRD effects
without `edition`, the SRD effects whose `edition` is the campaign edition, and the campaign
edition's SRD conditions (`"5.5e"` selects 5.5e, any other value 5e). An SRD effect with the
other edition SHALL NOT be found. The instance's own data and the entity's edition SHALL NOT
affect which edition is used.

#### Scenario: Condition found in the campaign edition
- **WHEN** an entity in a `"5.5e"` campaign has an instance `{ source: "srd", source_key: "exhaustion" }`
- **THEN** it resolves to the 5.5e Exhaustion definition (D20 Tests reduced by 2 × level)

#### Scenario: Effect found in the effects data
- **WHEN** an entity has an instance `{ source: "srd", source_key: "concentration" }`
- **THEN** it resolves to the Concentration definition whose `edition` is the campaign edition

#### Scenario: Same instance, other edition
- **WHEN** the same stored Exhaustion instance is loaded in an encounter of a `"5e"` campaign
- **THEN** it resolves to the 5e Exhaustion definition

#### Scenario: Effect without edition
- **WHEN** an entity in a `"5e"` or a `"5.5e"` campaign has an instance `{ source: "srd", source_key: "armor-class-bonus" }`
- **THEN** it resolves to the Armor Class Bonus definition in both

#### Scenario: Effect of the other edition
- **WHEN** an entity in a `"5e"` campaign has an instance `{ source: "srd", source_key: "burning" }`
- **THEN** it doesn't resolve (Burning has `edition: "5.5e"`) and is handled as an unresolved reference

#### Scenario: A retired url
- **WHEN** an entity has an instance whose `source_key` is a url this change removed (`acid-absorption`, `shield-of-faith`, `gauntlets-of-ogre-power`…)
- **THEN** it doesn't resolve and is handled as an unresolved reference; nothing keeps old urls working (testing phase, user decision)
