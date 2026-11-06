## REMOVED Requirements

### Requirement: Active effects are shown on combatants
**Reason**: It placed effect chips next to legacy condition chips, which no longer exist.
**Migration**: Replaced by "Effect chips are shown on combatants". Legacy conditions become effect instances when an encounter is loaded (see effects-instance-storage).

## MODIFIED Requirements

### Requirement: Chip filtering per context

The entity-effects row SHALL accept flags that limit it to reminders or to effect
instances. With no flag it SHALL show both kinds. The Reminders drawer SHALL show only
reminders, and the Effects drawer's target list (in either mode) SHALL show only effect
instances.

#### Scenario: Effects drawer targets
- **WHEN** the Effects drawer is open for an entity with a reminder and a Prone instance
- **THEN** its target list shows only the Prone chip for that entity

#### Scenario: Tracker row
- **WHEN** the same entity is shown in the tracker's target list
- **THEN** both chips are shown

## ADDED Requirements

### Requirement: Effect chips are shown on combatants

Wherever the tracker shows an entity's effects and reminders (the target list, the entity
card, the current-turn pane of the legacy layout and the target lists of drawers), it SHALL
show one chip per active effect instance of that entity, after the reminders. An SRD
condition's chip SHALL show that condition's icon. Any other effect SHALL show a generic
effect icon with the first letter of its name. Chips SHALL follow the existing overflow
behavior: when space runs out, the remaining chips move into the "+N" menu. Reminder chips
SHALL keep working unchanged. There SHALL be no separate legacy condition chips.

#### Scenario: Prone NPC
- **WHEN** an NPC has a Prone effect instance
- **THEN** its row in the tracker shows a chip with the Prone condition icon

#### Scenario: Custom effect
- **WHEN** a player has an instance of custom effect "burning"
- **THEN** its row shows a chip with the generic effect icon and the letter "B"

#### Scenario: Condition chip opens the detail view
- **WHEN** the DM clicks the chip of a Poisoned instance
- **THEN** the effect detail view for that instance opens

#### Scenario: Current turn in the legacy layout
- **WHEN** the tracker uses the legacy layout and the entity whose turn it is has a Prone instance
- **THEN** the current-turn pane shows the Prone chip

#### Scenario: Overflow
- **WHEN** an entity has more chips than fit in its row
- **THEN** the chips that don't fit are listed in the "+N" menu, including effect chips
