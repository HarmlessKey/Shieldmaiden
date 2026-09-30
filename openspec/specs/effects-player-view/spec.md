# effects-player-view Specification

## Purpose

How active effect instances are shown to players in the track campaign live view (the
player-facing initiative list), and which setting controls their visibility.

## Requirements

### Requirement: The live initiative list shows active effects

The live initiative list SHALL show, per entity, one icon for each of its active effect
instances. It SHALL read NPC effects from the broadcast encounter's entity, and player and
companion effects from the campaign's player or companion. It SHALL NOT read a legacy
`conditions` map. Each icon SHALL look like this:
- an SRD condition shows its condition icon
- Exhaustion also shows its level
- any other effect shows a generic effect icon

Names SHALL come from the local SRD data of the campaign's edition (5e when none is set)
for SRD instances, and from the instance's stored `name` otherwise. Each icon SHALL have a
tooltip with the name, plus the level for Exhaustion. The existing overflow SHALL be kept:
up to the shown count, then "+N", and a popup listing all effects with their icons and
names.

#### Scenario: NPC is Prone and Blessed
- **WHEN** a broadcast NPC has a Prone instance and a Bless (custom) instance
- **THEN** its row shows the Prone condition icon and a generic effect icon, with tooltips "Prone" and "Bless"

#### Scenario: Player Exhaustion
- **WHEN** a player has an Exhaustion instance with `level: 3` stored on the campaign
- **THEN** the player's row shows the Exhaustion icon with 3

#### Scenario: 5.5e names
- **WHEN** the campaign's edition is `"5.5e"` and an NPC has an SRD Concentration instance
- **THEN** the tooltip uses the name from the 5.5e SRD data

#### Scenario: No effects
- **WHEN** an entity has no effect instances
- **THEN** its effects cell is empty

### Requirement: Effect visibility follows the Conditions setting

Effects in the live initiative list SHALL be shown under the same rules as the conditions
before: the player setting with key `conditions`, and for NPCs the per-NPC display
setting. Companions are always shown. The setting SHALL be labelled "Conditions and
effects", and its description SHALL say that players can see the conditions and effects.

#### Scenario: Hidden for NPCs
- **WHEN** the DM has hidden conditions and effects for NPCs
- **THEN** NPC rows show no effect icons, while player rows still do

#### Scenario: Setting label
- **WHEN** the DM opens the track encounter settings
- **THEN** the option reads "Conditions and effects"
