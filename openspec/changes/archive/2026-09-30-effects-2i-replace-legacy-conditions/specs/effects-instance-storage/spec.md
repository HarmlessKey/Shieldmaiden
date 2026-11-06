## REMOVED Requirements

### Requirement: Instances are stored per entity type
**Reason**: It required the legacy `conditions` map to stay untouched. Conditions are now stored only as instances, and the map is deleted during conversion.
**Migration**: Replaced by "Instances are stored per entity type, conditions included", which keeps the paths and the other scenarios.

## MODIFIED Requirements

### Requirement: Resetting an encounter clears NPC effects

Resetting an encounter SHALL remove the stored `effects` of its NPC entities. It SHALL also
remove their reminders and any legacy `conditions` map that is still stored. It SHALL NOT
change player or companion effects stored on the campaign.

#### Scenario: Reset
- **WHEN** the DM resets an encounter where an NPC is Prone and a player has Exhaustion
- **THEN** the NPC has no stored effects and the player's Exhaustion instance remains on the campaign

#### Scenario: Reset with a leftover legacy map
- **WHEN** the DM resets an encounter that was never run since the release and still has a legacy `conditions` map on an entity
- **THEN** that `conditions` map is removed

## ADDED Requirements

### Requirement: Instances are stored per entity type, conditions included

An active effect instance SHALL be stored under its effect key in the entity's `effects`
map:
- for an NPC, at `encounters/{uid}/{campaignId}/{encounterId}/entities/{entityKey}/effects/{effectKey}`;
- for a player, at `campaigns/{uid}/{campaignId}/players/{entityKey}/effects/{effectKey}`;
- for a companion, at `campaigns/{uid}/{campaignId}/companions/{entityKey}/effects/{effectKey}`.

The stored value SHALL be exactly the instance held in the tracker (`$defs/active_instance`
fields only, no `sub_effects`, `description` or `cancelable`). Applying or removing an
effect SHALL NOT write the entity's `reminders`. Conditions SHALL be stored only as effect
instances. The tracker SHALL NOT write a `conditions` map, except to delete it during the
conversion of legacy conditions.

#### Scenario: Effect on an NPC
- **WHEN** the DM applies Prone to NPC `npc_1` in encounter `enc1` of campaign `camp1`
- **THEN** the instance is stored at `encounters/{uid}/camp1/enc1/entities/npc_1/effects/{effectKey}` and nothing is written under the campaign

#### Scenario: Effect on a player
- **WHEN** the DM applies Exhaustion to player `player_1` in campaign `camp1`
- **THEN** the instance is stored at `campaigns/{uid}/camp1/players/player_1/effects/{effectKey}` and nothing is written under the encounter entity

#### Scenario: Effect on a companion
- **WHEN** the DM applies Charmed to companion `comp_1` in campaign `camp1`
- **THEN** the instance is stored at `campaigns/{uid}/camp1/companions/comp_1/effects/{effectKey}`

#### Scenario: Conditions are instances
- **WHEN** the DM applies Blinded to an entity through the Conditions option
- **THEN** a Blinded instance is stored in the entity's `effects` and no `conditions` map is written

### Requirement: Legacy conditions are converted when an encounter is loaded

When the tracker loads an encounter whose entities still have a legacy `conditions` map,
it SHALL convert each entry whose key is an SRD condition url of the campaign edition into
an instance of that SRD condition:
- `name` is the condition's name, `source` is `"srd"`, `source_key` is the key, and
  `duration` is `{ type: "cancelled" }`
- `applied_round` is the encounter's current round
- for `exhaustion`, `level` is the stored number (at least 1)

The conversion SHALL store each instance where that entity's effects belong (the encounter
for NPCs, the campaign for players and companions). It SHALL NOT fire `on_apply` or
`on_condition_applied`. It SHALL skip a condition the entity already has as an instance,
and entries whose key is not an SRD condition. After the instances of an entity are
stored, the entity's `conditions` map SHALL be deleted from the encounter. When a write
fails, the map SHALL be kept so the conversion runs again the next time. In the demo
encounter the conversion SHALL happen in memory only. Test runs SHALL NOT convert.

#### Scenario: NPC with two conditions
- **WHEN** an encounter is loaded whose NPC `npc_1` has `conditions: { poisoned: true, prone: true }` and no effects
- **THEN** `npc_1` gets a Poisoned and a Prone instance with duration "until removed", both stored on the encounter entity, and `npc_1`'s `conditions` map is deleted

#### Scenario: Player Exhaustion
- **WHEN** an encounter is loaded whose player `player_1` has `conditions: { exhaustion: 2 }` on the encounter entity
- **THEN** an Exhaustion instance with `level: 2` is stored at `campaigns/{uid}/{campaignId}/players/player_1/effects/{effectKey}` and the encounter entity's `conditions` map is deleted

#### Scenario: Already converted
- **WHEN** an entity has `conditions: { prone: true }` and already has a Prone instance
- **THEN** no second Prone instance is created and the `conditions` map is deleted

#### Scenario: No triggers during conversion
- **WHEN** a legacy `unconscious` condition is converted
- **THEN** no prompt for Unconscious's `on_apply` sub-effect is shown

#### Scenario: Unknown key
- **WHEN** a legacy `conditions` map contains a key that is not an SRD condition url
- **THEN** no instance is created for it and the map is still deleted

#### Scenario: Demo encounter
- **WHEN** the demo encounter is started and its player has the legacy Exhaustion 1
- **THEN** the player shows an Exhaustion instance with level 1 and nothing is written to the database
