## ADDED Requirements

### Requirement: Setting reminders on the edit encounter screen

The edit encounter screen SHALL have a Reminders tab next to its other tabs. It SHALL NOT be
shown in the demo encounter builder. The tab SHALL list the encounter's reminders. The
encounter's own reminders come first, then those about a creature, grouped under the
creature's name. Each SHALL show:
- its title
- its trigger in words
- whether it repeats
- the effect or damage it offers
- whether it's done

Each reminder SHALL have an edit and a remove button. A done reminder SHALL also have a
re-arm button.

Below the list, a form SHALL add a reminder: the reminder form of the tracker, with a **For**
choice of **The encounter** (the default) or one of the encounter's creatures by name. The
triggers and offers SHALL follow that choice as in the tracker:
- **The encounter**: the encounter's triggers, and nothing, an effect or damage
- **a creature**: that creature's triggers, and nothing or an effect

When the For choice changes and the chosen trigger doesn't fit it, the trigger SHALL be
cleared. Damage SHALL be cleared when a creature is chosen.

The effects it can offer SHALL be the SRD effects of the campaign's edition and the user's
custom effects. The targets of an offered effect or damage are chosen when the prompt fires,
as in the tracker. "Start of its turn in N rounds" SHALL count from the encounter's current
round, which is 0 before combat. After adding, the form SHALL be empty for the next reminder.

Editing a reminder SHALL load it into the same form. It then saves that reminder instead of
adding one, and Cancel leaves it unchanged. The trigger SHALL decide whether it repeats, as
in the tracker.

Reminders set, edited, re-armed or removed here SHALL be stored on the encounter in the same
way as in the tracker. The tracker and test runs of the encounter SHALL then fire them and
list them in their Reminders drawer.

#### Scenario: Encounter reminder prepared
- **WHEN** the DM opens the Reminders tab of an encounter that hasn't started, keeps For on The encounter, and adds "Boss may flee" at the start of round 3
- **THEN** the tab lists it as "Start of round 3", and when the encounter is run, its prompt is shown when round 3 starts

#### Scenario: Reminder about a creature
- **WHEN** the DM chooses the dragon under For and adds "Defeated: the doors open" with the trigger "When it's defeated or removed"
- **THEN** the tab lists it under the dragon, and in the tracker the dragon shows its chip and the prompt is shown when it drops to 0 hit points

#### Scenario: No damage on a creature
- **WHEN** the DM chooses the dragon under For
- **THEN** the form doesn't offer damage, and damage set before the switch is cleared

#### Scenario: Trigger that doesn't fit
- **WHEN** the DM chose "Start of round 3" for the encounter and then chooses the dragon under For
- **THEN** the trigger is cleared, and the reminder can't be added until a trigger of the dragon is chosen

#### Scenario: Timer before combat
- **WHEN** the encounter is at round 0 and the DM adds a reminder about the dragon at "Start of its turn in 2 rounds"
- **THEN** it is stored at the start of the dragon's turn in round 2

#### Scenario: Offer an effect
- **WHEN** the DM adds "Sandstorm" at the start of round 5 for the encounter, offering Blinded
- **THEN** the reminder stores Blinded, and in the tracker its prompt offers Apply for Blinded with the choice of everyone in combat or the current targets

#### Scenario: Edit
- **WHEN** the DM clicks edit on "Boss may flee", changes the round to 4 and saves
- **THEN** the same reminder is stored with "Start of round 4", and no second reminder is added

#### Scenario: Re-arm
- **WHEN** the encounter was run, "Boss may flee" fired and is done, and the DM clicks re-arm in the tab
- **THEN** it's no longer done and fires again the next time round 3 starts

#### Scenario: Demo builder
- **WHEN** someone opens the demo encounter builder
- **THEN** there is no Reminders tab

### Requirement: Removing an entity outside combat removes its reminders

When an entity is removed from an encounter outside the tracker, its reminders SHALL be
removed from the encounter, since they can't fire any more. This covers:
- removing it on the edit encounter screen
- removing it as a ghost when the encounter loads, because its player, NPC or companion no
  longer exists

Removing it SHALL NOT fire its "defeated or removed" reminders, since no combat is running.
The encounter's own reminders and those of other entities SHALL stay.

#### Scenario: Removed on the edit screen
- **WHEN** the dragon has two reminders, the encounter has "Boss may flee", and the DM removes the dragon on the edit encounter screen
- **THEN** both of the dragon's reminders are removed, "Boss may flee" stays, and no prompt is shown

#### Scenario: Ghost entity
- **WHEN** an encounter loads with a goblin whose custom NPC was deleted, and the goblin has a reminder
- **THEN** the goblin and its reminder are removed from the encounter
