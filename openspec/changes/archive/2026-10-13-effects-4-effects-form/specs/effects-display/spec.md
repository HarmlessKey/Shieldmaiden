## MODIFIED Requirements

### Requirement: Effects can be removed from the detail view

The detail view SHALL offer a Remove button that removes that one instance, saved the same
way as removing from the Effects drawer, and closes the detail view. The button SHALL always
be shown: every effect can be removed by the DM, and definitions have no `cancelable`.

#### Scenario: Remove one instance
- **WHEN** an NPC has two instances of a custom effect and the DM removes one from its detail view
- **THEN** only that instance is removed and the other remains

#### Scenario: Not cancelable
- **WHEN** the DM opens the detail view of any effect, SRD or custom, resolved or not
- **THEN** the detail view shows the Remove button
