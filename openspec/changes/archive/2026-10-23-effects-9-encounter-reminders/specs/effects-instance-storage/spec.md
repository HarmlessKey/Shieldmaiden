## MODIFIED Requirements

### Requirement: Resetting an encounter clears NPC effects

Resetting an encounter SHALL remove the stored `effects` of its NPC entities. It SHALL also
remove any legacy `conditions` map and legacy entity `reminders` that are still stored. It
SHALL keep the encounter's reminders and clear whether they fired, so once reminders fire
again. It SHALL NOT change player or companion effects stored on the campaign.

#### Scenario: Reset
- **WHEN** the DM resets an encounter where an NPC is Prone and a player has Exhaustion
- **THEN** the NPC has no stored effects and the player's Exhaustion instance remains on the campaign

#### Scenario: Reset with a leftover legacy map
- **WHEN** the DM resets an encounter that was never run since the release and still has a legacy `conditions` map on an entity
- **THEN** that `conditions` map is removed

#### Scenario: Reset keeps reminders
- **WHEN** the DM resets an encounter whose "Start of round 3" once reminder fired
- **THEN** the reminder is still set and fires again when round 3 starts
