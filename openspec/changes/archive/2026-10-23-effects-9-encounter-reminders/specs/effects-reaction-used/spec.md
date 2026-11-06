## MODIFIED Requirements

### Requirement: Reaction Used is shown where the actor is chosen

The actor panel SHALL show a "Reaction Used" tag in the actor's details bar, after its
name, when the actor has Reaction Used. It is shown the same way for every kind of entity.
The Select Actor list SHALL mark the entities that have Reaction Used.
The legacy actions panel's "Reaction used" warning SHALL show when the chosen entity has the
Reaction Used effect. The legacy "Reaction used" reminder is retired, so the warning SHALL NOT
look for it.

#### Scenario: Actor panel
- **WHEN** the DM selects `npc_2` as the actor and it has Reaction Used
- **THEN** a "Reaction Used" tag is shown in its details bar, after its name

#### Scenario: Select Actor list
- **WHEN** the DM opens the Select Actor list and `npc_2` has Reaction Used
- **THEN** `npc_2` is marked in the list, and entities without it aren't

#### Scenario: Legacy warning
- **WHEN** the DM picks `npc_2` in the legacy actions panel's done-by select and it has the Reaction Used effect
- **THEN** the "Reaction used" warning is shown
