# effects-runtime-resolution Specification

## Purpose

How the combat tracker pairs each active effect instance with its effect definition at
runtime, including `includes` flattening and unresolved references, so display, triggers
and mechanics can read an effect's sub-effects without caring where the definition came
from.

## Requirements

### Requirement: SRD definitions are looked up by url in the campaign edition

An instance with `source: "srd"` SHALL resolve to the definition whose `url` equals its
`source_key`, searched across both the SRD effects and the SRD conditions of the running
encounter's campaign edition (`"5.5e"` selects 5.5e data, any other value 5e data). The
instance's own data and the entity's edition SHALL NOT affect which edition is used.

#### Scenario: Condition found in the campaign edition
- **WHEN** an entity in a `"5.5e"` campaign has an instance `{ source: "srd", source_key: "exhaustion" }`
- **THEN** it resolves to the 5.5e Exhaustion definition (D20 Tests reduced by 2 × level)

#### Scenario: Effect found in the effects data
- **WHEN** an entity has an instance `{ source: "srd", source_key: "concentration" }`
- **THEN** it resolves to the Concentration definition from the edition's effects data

#### Scenario: Same instance, other edition
- **WHEN** the same stored Exhaustion instance is loaded in an encounter of a `"5e"` campaign
- **THEN** it resolves to the 5e Exhaustion definition

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

### Requirement: Includes are flattened into the resolved sub-effects

The resolved sub-effects of a definition SHALL be its own sub-effects followed by the
resolved sub-effects of every definition it references through an `includes` sub-effect,
recursively. Each pulled-in sub-effect SHALL record which definition it came from (its
`source`, `source_key` and `name`). A definition SHALL be included at most once per
resolution, even when referenced along several paths, and a reference back to a definition
already being resolved SHALL be skipped. An `includes` reference that cannot be resolved
SHALL contribute no sub-effects and SHALL NOT make the including definition unresolved.

#### Scenario: Paralyzed carries Incapacitated
- **WHEN** Paralyzed is resolved
- **THEN** its sub-effects contain Paralyzed's own sub-effects and Incapacitated's sub-effects, the latter marked as coming from `incapacitated`

#### Scenario: Included once
- **WHEN** a definition includes both Paralyzed and Incapacitated
- **THEN** Incapacitated's sub-effects appear exactly once in the result

#### Scenario: Cycle
- **WHEN** definition A includes B and B includes A
- **THEN** resolving A terminates and contains A's and B's own sub-effects once each

#### Scenario: Missing include
- **WHEN** a definition includes an `srd` url that does not exist in the edition
- **THEN** the definition resolves with its other sub-effects and is not marked unresolved

### Requirement: Resolved definitions are held apart from the stored instances

A resolved definition SHALL provide `name`, `description`, the flattened `sub_effects` and
whether it is `unresolved`. It SHALL NOT provide `category`, `magical` or `cancelable`:
whether an instance is an SRD condition SHALL be decided by whether its `source_key` is in
the SRD conditions list. It SHALL be held in the running
encounter's state, keyed by `source` and `source_key`, and SHALL NOT be added to the
instance objects, the app's cached encounter or campaign, or the database. For any entity,
the tracker SHALL be able to list each active instance together with its resolved
definition.

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

### Requirement: Resolution runs at encounter start and on apply

When an encounter is initialised, every distinct definition referenced by any entity's
instances SHALL be resolved after the entities are added and before the encounter counts as
initialised. When an effect is applied and its write succeeds (or in demo and test mode),
its definition SHALL be resolved if it isn't already. Resolved definitions SHALL be
discarded when a new encounter is initialised, so changes to the campaign edition or to a
custom effect take effect at the next encounter start and not during a running encounter.

#### Scenario: Loaded effects resolved on start
- **WHEN** an encounter starts in which an NPC has a stored Prone instance
- **THEN** once the encounter is initialised, Prone's resolved definition is available

#### Scenario: Applied mid-encounter
- **WHEN** the DM applies Stunned during the encounter and no entity had Stunned before
- **THEN** Stunned's resolved definition, including Incapacitated's sub-effects, is available after the apply

#### Scenario: Edited custom effect
- **WHEN** the user edits a custom effect while an encounter using it is running
- **THEN** the running encounter keeps the old resolved definition, and the next encounter start uses the edited one

#### Scenario: Edition changed between encounters
- **WHEN** the campaign's edition is changed from `"5e"` to `"5.5e"` and an encounter with a stored Exhaustion instance is started
- **THEN** Exhaustion resolves to the 5.5e definition

### Requirement: Unresolved references are not errors

When an instance's definition cannot be found (unknown SRD `url`, deleted or unreadable
custom effect, `source: "api"`, or no signed-in user for a custom effect), the tracker SHALL
keep the instance and its stored `name`. It SHALL resolve it to no sub-effects, marked
`unresolved`, and log one warning per definition per encounter. Loading the encounter and
applying other effects SHALL continue normally.

#### Scenario: Deleted custom effect
- **WHEN** a player has an instance of custom effect `-Nx12` that the user has deleted, and an encounter starts
- **THEN** the encounter loads, the instance keeps its name, its resolved definition is marked unresolved with no sub-effects, and one warning is logged

#### Scenario: Warning logged once
- **WHEN** three entities have instances of the same unresolvable definition
- **THEN** exactly one warning is logged for it in that encounter

### Requirement: The live view resolves definitions from the DM's data

The player live view SHALL resolve the effect instances it shows. SRD instances use the
campaign's edition (5e when none is set). Custom instances SHALL resolve to the custom
effect of the DM whose campaign is shown, not of the signed-in viewer, with the same
legacy-shape handling. A definition that can't be read is unresolved: the effect shows by
its stored name and changes no values. Resolution SHALL NOT write anything.

#### Scenario: DM's custom effect
- **WHEN** a player views the DM's live initiative, and an NPC has an instance `{ source: "custom", source_key: "-Nx12" }` of the DM's custom effect "Stoneskin"
- **THEN** it resolves to the DM's custom effect `-Nx12`, and its name and mechanics apply

#### Scenario: Not readable
- **WHEN** the DM's custom effect can't be read, or was deleted
- **THEN** the chip shows the instance's stored name, and the effect changes no values

#### Scenario: Viewer's own effects aren't used
- **WHEN** the signed-in viewer also has a custom effect with id `-Nx12`
- **THEN** the live view still resolves the DM's custom effect
