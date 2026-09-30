# effects-instance-storage Specification

## Purpose

Where and how active effect instances on combat-tracker entities are saved to the
Realtime Database, loaded when an encounter starts, and protected by database rules. NPC
effects belong to the encounter; player and companion effects belong to the campaign.

## Requirements

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

### Requirement: Apply, level change and removal are written

Applying an effect that creates a new instance SHALL write that instance. Applying
Exhaustion to an entity that already has Exhaustion SHALL write only the new `level` of the
existing instance. Applying an SRD condition the entity already has (other than
Exhaustion) SHALL NOT write anything. Removing an instance SHALL delete it at its path. The
tracker SHALL show a change only after its write has succeeded.

#### Scenario: New instance written
- **WHEN** the DM applies Stunned to an NPC without Stunned
- **THEN** one new instance is stored for that NPC and appears in the tracker

#### Scenario: Exhaustion level updated in place
- **WHEN** a player's stored Exhaustion instance has `level: 2` and the DM applies Exhaustion with level 3
- **THEN** that instance's stored `level` becomes 3, its other fields and key are unchanged, and no second instance is stored

#### Scenario: Duplicate condition not written
- **WHEN** the DM applies Prone to an NPC that already has Prone
- **THEN** no database write happens

#### Scenario: Removal deleted
- **WHEN** the DM removes Poisoned from two targets
- **THEN** every Poisoned instance of both targets is deleted from the database and from the tracker

### Requirement: Failed writes leave the tracker unchanged

When a write for applying, updating or removing an instance fails, the tracker's
in-memory state for that entity SHALL stay as it was before the action, and the failure
SHALL be reported in the browser console. A failure for one target SHALL NOT prevent the
action for the other targets.

#### Scenario: Rules reject the write
- **WHEN** the database rejects the write of a new instance for one of two targets
- **THEN** that target shows no new effect, the other target gets its instance, and the error is logged

### Requirement: Demo and test mode do not write

In the demo encounter and in test mode, applying, updating and removing effects SHALL
change only the tracker's in-memory state and SHALL NOT write to the database.

#### Scenario: Demo encounter
- **WHEN** the DM applies Prone in the demo encounter
- **THEN** the effect appears in the tracker and no database write happens

#### Scenario: Test mode
- **WHEN** the DM applies Prone while running an encounter in test mode
- **THEN** the effect appears in the tracker and no database write happens

### Requirement: Stored instances load when an encounter starts

When an encounter is initialised, each entity's `effects` SHALL be filled from its stored
`effects` map: NPCs from the encounter entity, players and companions from the campaign
player or companion. Instances SHALL be loaded as stored, keyed by their effect key.
Entities without stored effects, entities in the demo encounter and entities in test mode
SHALL start with an empty effects map. Player and companion effects SHALL therefore carry
over between encounters of the same campaign.

#### Scenario: Reload keeps NPC effects
- **WHEN** an NPC has a stored Prone instance and the DM reloads the encounter
- **THEN** the NPC's effects contain that Prone instance under the same key

#### Scenario: Player effects carry over
- **WHEN** a player got Exhaustion level 2 in one encounter and the DM starts another encounter of the same campaign
- **THEN** the player's effects contain that Exhaustion instance with `level: 2`

#### Scenario: Re-applying after reload does not duplicate
- **WHEN** after a reload the DM applies Exhaustion to a player whose stored Exhaustion has `level: 2`
- **THEN** the existing instance is updated to level 3 and no second Exhaustion instance is created

#### Scenario: Test mode starts empty
- **WHEN** an encounter whose NPC has stored effects is run in test mode
- **THEN** that NPC starts with an empty effects map

### Requirement: Reopening an encounter in the same session sees current effects

Effect writes SHALL also update the app's cached copy of the encounter (for NPCs) and of
the campaign (for players and companions), so an encounter reopened without a page reload
loads the same effects as after a reload.

#### Scenario: Leave and reopen
- **WHEN** the DM applies Prone to an NPC and a player, leaves the encounter and opens it again without reloading
- **THEN** both entities still have their Prone instance

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

### Requirement: Database rules accept valid instances only

The Realtime Database rules SHALL allow an `effects` map on encounter entities, campaign
players and campaign companions, writable only by the owner of the encounter or campaign
(the existing owner rules). An effect key SHALL be at most 100 characters of letters,
digits, `_` and `-`. A stored instance SHALL require `name` (string, at most 200
characters), `source` (`srd`, `custom` or `api`) and `source_key` (string, at most 100
characters). The optional fields SHALL be type-checked: `duration` must have a `type` from
the schema's duration types, and its `unit`, `anchor` and `edge` must come from their
schema enums; `choices` values are strings; `caster_key`, `concentration_id` and
`parent_id` are strings; `caster_name` is a string of at most 200 characters;
`applied_round`, `rounds_remaining`, `save_dc`, `level`, `charges`, `save_successes`,
`save_failures` and `immune_until_round` are numbers. Any other field on an instance SHALL
be rejected. Existing rules for other entity data SHALL NOT change.

#### Scenario: Valid instance accepted for a player
- **WHEN** the owner writes `{ name: "Exhaustion", source: "srd", source_key: "exhaustion", duration: { type: "cancelled" }, level: 2, applied_round: 1 }` under a campaign player's `effects`
- **THEN** the write succeeds

#### Scenario: Caster name accepted
- **WHEN** the owner writes an instance with `caster_key: "npc_1"` and `caster_name: "Goblin"`
- **THEN** the write succeeds

#### Scenario: Unknown field rejected
- **WHEN** an instance containing `sub_effects` is written
- **THEN** the write is rejected

#### Scenario: Missing source rejected
- **WHEN** an instance without `source` is written
- **THEN** the write is rejected

#### Scenario: Invalid duration type rejected
- **WHEN** an instance with `duration: { type: "forever" }` is written
- **THEN** the write is rejected
