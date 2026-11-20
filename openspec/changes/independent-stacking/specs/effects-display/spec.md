## MODIFIED Requirements

### Requirement: Effect chips are shown on combatants

Wherever the tracker shows an entity's effects and reminders (the target list, the entity
card, the current-turn pane of the legacy layout and the target lists of drawers), it SHALL
show one chip per active effect of that entity, after the reminders. Copies of the same
effect from the same caster SHALL share one chip (see "Copies of the same effect from the
same caster share one chip"); every other instance SHALL have its own chip. An SRD
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

## ADDED Requirements

### Requirement: Copies of the same effect from the same caster share one chip

Instances on one entity with the same `source`, `source_key` and `caster_key` (or none of
them with a caster) SHALL be shown as one chip. This applies to every effect, whatever its
stacking; copies from different casters keep their own chips. A shared chip SHALL:
- show the number of copies as "×N" in its bottom-left corner
- show the badge of the copy that ends first (the fewest rounds left)
- add "N copies" to its tooltip
- open the detail view of the newest copy when clicked

The detail view of an instance that has other copies on the same entity SHALL list every
copy, newest first, each with the round it was applied, its rounds left for a timed
duration, its choices and its rolled values. Choosing a copy SHALL show that copy's details.
Each copy SHALL have its own Remove button that removes only that copy. When the shown copy
is removed and others remain, the detail view SHALL show the newest remaining copy.

#### Scenario: Strength Drain twice
- **WHEN** a fighter was hit twice by the same Shadow, with Strength Drain instances that rolled 3 and 2
- **THEN** the fighter has one Strength Drain chip with "×2", and its tooltip says "2 copies"

#### Scenario: Different casters
- **WHEN** a goblin has Hunter's Mark from two different rangers
- **THEN** it has two Hunter's Mark chips, without a count

#### Scenario: Badge of the copy that ends first
- **WHEN** a shared chip stands for timed copies with 7 and 3 rounds left
- **THEN** its badge shows 3

#### Scenario: Copies in the detail view
- **WHEN** the DM clicks the fighter's Strength Drain chip
- **THEN** the detail view shows the newest copy and lists both copies with their rolled values, "Strength −2" and "Strength −3"

#### Scenario: Remove one copy
- **WHEN** the DM removes one copy from the detail view
- **THEN** only that instance is removed, the detail view shows the remaining copy, and the chip no longer shows a count
