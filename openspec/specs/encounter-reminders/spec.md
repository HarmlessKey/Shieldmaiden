# encounter-reminders Specification

## Purpose

Reminders for the DM that come up at the right moment in an encounter: stored on the
encounter, about the encounter or one entity, fired by round, turn and defeat triggers, shown
as a prompt that can offer an effect or damage, and managed in the tracker's Reminders drawer.

## Requirements

### Requirement: Reminders are stored on the encounter

An encounter SHALL hold its reminders. Each reminder SHALL have a title, an optional text, a
color, a trigger (which decides whether it fires once or repeats), and optionally either an
effect to offer (an SRD condition, SRD effect or custom effect, by reference) or damage to
roll, never both. A reminder SHALL be either about the encounter or about one entity of the
encounter, players and companions included. Reminders SHALL be kept when the encounter is
reloaded, and a once reminder SHALL keep whether it fired. In the demo and test mode nothing
SHALL be written to the database.

#### Scenario: Reload
- **WHEN** the DM sets "Round 3: the boss may flee" and reloads the tracker
- **THEN** the reminder is still set on the encounter

#### Scenario: Reminder about a player
- **WHEN** the DM sets a reminder about a player in this encounter
- **THEN** it is stored on the encounter, not on the campaign player

### Requirement: Reminders fire on encounter rounds

A reminder about the encounter SHALL be able to fire:
- **when combat starts**
- **at the start of round N**: when round N begins, with the first turn of that round
- **every N rounds from round M**: at the start of rounds M, M+N, M+2N, …

The two round triggers MAY have a turn (added at apply, user request): they then fire as that
turn of a matching round starts (turn T is the T-th turn in initiative order), after the
round's start and before that turn's entity reminders. A round with fewer turns fires it at
its last turn.

Round triggers SHALL fire only when combat moves forward. Going back a turn or round SHALL NOT
fire reminders or undo the ones that fired.

#### Scenario: Round 3
- **WHEN** the encounter has "Start of round 3: the boss changes tactics" and the last turn of round 2 ends
- **THEN** its prompt is shown as round 3 starts

#### Scenario: Every 2 rounds
- **WHEN** a repeating reminder is set for every 2 rounds from round 1
- **THEN** it fires at the start of rounds 1, 3 and 5

#### Scenario: Burning ground at turn 4
- **WHEN** "Burning ground" is set for every round at turn 4, with 1d10 fire damage
- **THEN** its prompt is shown as the 4th turn of every round starts, and Damage targets rolls it for the creatures in the area

#### Scenario: Fewer turns
- **WHEN** only 3 creatures are left in round 5
- **THEN** the turn 4 reminder is shown as the 3rd turn starts

#### Scenario: Going back
- **WHEN** round 3 started, its reminder fired, and the DM goes back to round 2 and forward again
- **THEN** the reminder doesn't fire again when round 3 starts a second time if it fires once

### Requirement: Reminders fire on an entity's turns

A reminder about an entity SHALL be able to fire at the start or at the end of that entity's
turn, in every round or only in round N. Turn triggers SHALL fire only when combat moves
forward. An inactive entity's turn reminders SHALL NOT fire, since it has no turn.

#### Scenario: Start of turn
- **WHEN** the goblin has "Start of turn: it's burning" and its turn starts
- **THEN** the prompt is shown

#### Scenario: End of turn in round 2
- **WHEN** the ogre has "End of turn, round 2: it calls for help" and its turn in round 1 ends
- **THEN** no prompt is shown, and it is shown when its turn in round 2 ends

### Requirement: Reminders fire when an entity is defeated or removed

A reminder about an entity SHALL be able to fire when that entity is defeated or removed:
an NPC drops to 0 hit points, a player or companion is marked dead, or the entity is set
inactive or removed from the encounter. It SHALL fire once per such event, and only during
combat (from round 1), so setting an entity inactive on the set initiative screen fires
nothing. Removing an entity from the encounter SHALL remove its reminders after its defeated
reminders fired, since they can't fire any more.

#### Scenario: Boss defeated
- **WHEN** the dragon has "Defeated: the doors open" and drops to 0 hit points
- **THEN** the prompt is shown

#### Scenario: Removed from the encounter
- **WHEN** the DM removes the dragon from the encounter
- **THEN** the same prompt is shown, and the dragon's reminders are removed from the encounter

#### Scenario: Before combat
- **WHEN** the DM sets the dragon inactive on the set initiative screen
- **THEN** no prompt is shown

### Requirement: A reminder fires once or repeats

The trigger SHALL decide whether a reminder repeats; there is no separate choice (changed at
apply: the choice overlapped with the triggers). Every N rounds, and the start or end of an
entity's turn in every round, repeat. The others fire once: when combat starts, the start of
round N, a turn in round N (or in N rounds), defeated or removed. A converted reminder that
was "remove on trigger" on a turn stays once.
- A **once** reminder SHALL be done after it fires: it no longer fires, isn't shown as a chip,
  and stays in the Reminders drawer's list as done, where it can be re-armed.
- A **repeating** reminder SHALL keep firing at its trigger until it's removed.

#### Scenario: Start of round 2
- **WHEN** a reminder at the start of round 2 fires
- **THEN** it doesn't fire in round 3, and the drawer lists it as done

#### Scenario: Every round from round 2
- **WHEN** a reminder is set for every 1 round from round 2
- **THEN** it fires at the start of rounds 2, 3, 4 and on

#### Scenario: Re-arm
- **WHEN** the DM re-arms the done round 2 reminder in the drawer and goes back to round 1
- **THEN** it fires again when round 2 starts

### Requirement: The reminder prompt

When a reminder fires, the tracker SHALL show a prompt like the effect prompts, which stays
until the DM answers it:
- **title:** the reminder's title, after the entity's name for a reminder about an entity
  ("Goblin: burning"), or after the round for one about the encounter ("Round 3: the boss may
  flee")
- **body:** its text, with its variables filled in
- **buttons:** **Dismiss** for a once reminder; **Keep** and **Remove** for a repeating one
  (Remove removes the reminder)
- **Apply <effect>** when the reminder has an effect (see below)

Several reminders firing at the same moment SHALL each show their own prompt.

#### Scenario: Repeating reminder
- **WHEN** a repeating reminder fires and the DM chooses Remove
- **THEN** the reminder is removed from the encounter

#### Scenario: Variables
- **WHEN** a converted reminder with the text "[target] takes [damage] damage" had target "the paladin" and damage "2d6" chosen
- **THEN** the prompt reads "the paladin takes 2d6 damage"

### Requirement: A reminder can offer an effect

A reminder MAY name an effect. Its prompt SHALL then offer **Apply <effect name>**, which opens
the Effects drawer's apply form for that effect, with the campaign edition's definition (SRD)
or the user's custom effect:
- for a reminder about an entity, for that entity
- for a reminder about the encounter, for the targets the DM picks in the drawer: everyone in
  combat (active entities) or the current targets

Applying SHALL work as in the Effects drawer (duration, choices, Concentration, immunities).
An effect that no longer exists SHALL be named in the prompt without the button.

#### Scenario: Sandstorm
- **WHEN** "Round 5: a sandstorm starts" has the Blinded condition and round 5 starts
- **THEN** its prompt offers Apply Blinded, which opens the apply form for Blinded with everyone in combat as the targets

#### Scenario: Entity reminder with an effect
- **WHEN** "Start of turn: the cultist's ritual" offers a custom effect and fires
- **THEN** Apply opens the apply form for that effect for the cultist

### Requirement: A reminder can deal damage

Instead of an effect, a reminder about the encounter MAY deal damage: a number of dice and a
die (d4, d6, d8, d10, d12, d20 or d100), a fixed value, or both, and optionally a damage type.
A reminder about an entity SHALL NOT deal damage (changed at apply: damage on one creature is
an effect); the form doesn't offer it there, and it isn't stored. Its prompt SHALL name the
damage ("2d6+3 fire damage") and offer **Damage targets**: roll it once and open it in the roll
dialog for each current target (with none, a message says to target creatures), where the DM
applies it as any rolled damage (defenses, temporary hit points, Concentration), dealt by the
Environment (as the Select Actor list's: logged by that name, not counted in damage meters).

#### Scenario: Lava every round
- **WHEN** "Every round: the lava rises" deals 2d6 fire damage, round 2 starts and three creatures are targeted
- **THEN** the prompt shows "2d6 fire damage", and Damage targets rolls it once and opens it for each of the three

#### Scenario: One or the other
- **WHEN** the DM switches a reminder that offers Blinded to Damage
- **THEN** the reminder no longer offers Blinded

### Requirement: Setting and managing reminders in the tracker

The tracker's Reminders drawer SHALL be opened from two buttons, and the button decides what
it's for; the drawer has no choice between the two:
- the targets' Reminders option (and its shortcut, where it is now): reminders for the
  targeted entities
- an encounter Reminders button in the encounter progress bar, between the progress bar and
  the previous/next turn buttons, also before combat: reminders for the encounter. It shows
  how many of the encounter's own reminders aren't done.

Reminders are quick notes, mostly added while preparing the encounter. The drawer SHALL show,
on top, the reminders it's for (the encounter's own reminders, or those of the targeted
entities; done ones marked) with each one's trigger in words, to edit, re-arm or remove; and
below them a form to add one: title, color, trigger, text, and what the prompt offers:
nothing, an effect from the SRD and custom effects, or damage. It SHALL NOT offer the user's
personal reminders. Adding one for several targeted entities SHALL give each its own
reminder. The form stays open for the next one. Reminders about an entity that aren't done
SHALL show as chips on that entity, and clicking a chip SHALL open that reminder.

#### Scenario: Encounter reminder
- **WHEN** the DM clicks the encounter Reminders button and sets "Start of round 3" with the title "Boss may flee"
- **THEN** the encounter has that reminder, the drawer lists it as "Start of round 3", and the button shows 1

#### Scenario: Two targets
- **WHEN** two goblins are targeted and the DM adds a reminder at the start of their turn
- **THEN** each goblin gets its own reminder and shows its chip, and the drawer lists both above the form

### Requirement: The reminder form, and personal reminders under My content

The reminder form (the drawer's and a reminder's edit) SHALL set the color as an NPC's color
label is set: a color field with a picker on the Shieldmaiden palette. Reminders with an old
color name keep showing in that color. The form SHALL offer the new triggers (combat start,
start of round N, every N rounds from round M, start or end of the entity's turn with an
optional round, defeated or removed), with no once/repeating choice (the trigger decides),
and an optional effect or damage. It SHALL also offer "start of its turn in N rounds" (the
old timer), which is stored as the start of the entity's turn in the round N rounds from when
it's added, once.

The personal reminders under My content SHALL be deprecated (changed at apply, user request):
they SHALL be viewable (the list, and each reminder in the reminder form with every field
disabled and no save button) and deletable, but not created or edited; there is no New
reminder button. A reminder's page SHALL say Deprecated in its header. The list (and the old
add route) SHALL show a notice that they are deprecated and that effects (for what happens to
a creature) and encounter reminders (for what comes up at a moment in the encounter) replace
them. The tracker doesn't offer them.

#### Scenario: Timer
- **WHEN** the DM adds "start of its turn in 3 rounds" for the goblin in round 2
- **THEN** the goblin's reminder fires at the start of its turn in round 5, once

#### Scenario: Old personal reminder
- **WHEN** the DM opens an existing personal reminder "Hexed" with trigger "start of own turn" and action "notify on trigger" under My content
- **THEN** it shows in the disabled form, as "Start of its turn", with Deprecated in the header and no save button

#### Scenario: No new personal reminders
- **WHEN** the DM opens Reminders under My content
- **THEN** the list has view and delete buttons, no New reminder button, and the deprecation notice

### Requirement: Legacy entity reminders are converted when an encounter loads

When an encounter loads, reminders stored on its entities (`entity.reminders`, players
included) SHALL be converted to reminders about that entity on the encounter, and removed from
the entity:
- start or end of turn: the entity's turn trigger; "remove" becomes once, "notify" repeating
- timed with N rounds left: the start of the entity's turn in the round it would have ended,
  once
- the "damage" trigger, and the premade "Concentrating" and "Reaction used" reminders, SHALL be
  dropped

Title, text, color and chosen variables SHALL be kept. The premade "Concentrating" and
"Reaction used" reminders SHALL no longer be offered.

#### Scenario: Timed reminder
- **WHEN** an encounter in round 2 loads with a goblin reminder timed with 3 rounds left
- **THEN** the goblin has a once reminder at the start of its turn in round 5, and no `reminders` on the entity

#### Scenario: Damage reminder
- **WHEN** an encounter loads with a reminder with the damage trigger on an NPC
- **THEN** that reminder is gone and nothing replaces it
