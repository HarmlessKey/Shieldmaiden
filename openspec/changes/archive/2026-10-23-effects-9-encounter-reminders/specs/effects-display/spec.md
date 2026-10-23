## MODIFIED Requirements

### Requirement: Effect chips are shown on combatants

Wherever the tracker shows an entity's effects and reminders (the target list, the entity
card, the current-turn pane of the legacy layout and the target lists of drawers), it SHALL
show one chip per active effect instance of that entity, after the reminders. An SRD
condition's chip SHALL show that condition's icon. Any other effect SHALL show a generic
effect icon with the first letter of its name. Chips SHALL follow the existing overflow
behavior: when space runs out, the remaining chips move into the "+N" menu. Reminder chips
SHALL show the encounter's reminders about that entity that aren't done, with their title and
color. There SHALL be no separate legacy condition chips.

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

#### Scenario: Reminder chip
- **WHEN** the encounter has a reminder about the goblin that isn't done, and a done one
- **THEN** the goblin's row shows a chip for the first and none for the done one
