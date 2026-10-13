## MODIFIED Requirements

### Requirement: Custom definitions are read from the user's custom effects

An instance with `source: "custom"` SHALL resolve to the signed-in user's custom effect
whose id equals its `source_key`. Custom effects SHALL be read in the v2 shape
(`sub_effects`, `sub_types`). The legacy form shape (`subeffects`, `subtype`) SHALL NOT be
converted: a custom effect without `sub_effects` resolves with no sub-effects. Resolution
SHALL NOT write to the custom effect.

#### Scenario: Custom effect resolved
- **WHEN** an entity has an instance `{ source: "custom", source_key: "-Nx12" }` and the user has custom effect `-Nx12`
- **THEN** it resolves to that custom effect's definition

#### Scenario: Legacy custom effect
- **WHEN** custom effect `-Nx12` is stored as `{ name: "burning", subeffects: [{ type: "damage", subtype: "fire" }] }`
- **THEN** it resolves with name "burning" and no sub-effects, and the stored custom effect is unchanged

### Requirement: Resolved definitions are held apart from the stored instances

A resolved definition SHALL provide `name`, `description`, the flattened `sub_effects` and
whether it is `unresolved`. It SHALL NOT provide `category`, `magical` or `cancelable`:
whether an instance is an SRD condition SHALL be decided by whether its `source_key` is in
the SRD conditions list. It SHALL be held in the running encounter's state, keyed by
`source` and `source_key`, and SHALL NOT be added to the instance objects, the app's cached
encounter or campaign, or the database. For any entity, the tracker SHALL be able to list
each active instance together with its resolved definition.

#### Scenario: Instance stays a reference
- **WHEN** an NPC's Paralyzed instance is loaded and resolved
- **THEN** the instance in the tracker, the cached encounter and the database contain no `sub_effects` or `description`

#### Scenario: Entity effects with definitions
- **WHEN** the tracker lists an entity that has Prone and a custom Burning effect
- **THEN** each listed instance comes with its resolved definition

#### Scenario: Shared definition
- **WHEN** four NPCs are Prone
- **THEN** Prone is resolved once and all four instances use that resolved definition

#### Scenario: Conditions are recognized without a category
- **WHEN** an entity has an SRD Prone instance and an SRD Bless instance
- **THEN** Prone is shown as a condition (with its condition icon) and Bless is not
