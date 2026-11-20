# effects-display Specification

## Purpose

How active effect instances are shown on combatants in the combat tracker and what the
detail view for a single applied effect shows and lets the DM change.

## Requirements

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

### Requirement: Chips show a badge and a tooltip

An effect chip SHALL show a badge with the Exhaustion level for Exhaustion, and with the
rounds left for a `time` duration. Other effects SHALL show no badge. Hovering a chip SHALL
show a tooltip with the effect's name (capitalised) and its duration in words:
- "Until removed" for `cancelled`
- "N rounds left" for `time`
- "Concentration" with the maximum when set, e.g. "Concentration, up to 1 hour"
- "Until the start/end of <name>'s next turn" for `next_turn`, where <name> is the anchor
  (the caster or the effect's holder)
- "Until the end of this turn" for `end_of_turn`
- the duration type in plain words for any other type

When the instance has a caster that is in the encounter, the tooltip SHALL add "from
<caster name>". When its caster isn't in the encounter but the instance has a stored
`caster_name`, the tooltip SHALL add "from <caster_name> (not in this encounter)".

#### Scenario: Exhaustion badge
- **WHEN** a player has Exhaustion with `level: 3`
- **THEN** the chip's badge shows 3

#### Scenario: Timed effect
- **WHEN** an NPC has a custom Burning instance with `duration.type: "time"` and `rounds_remaining: 7`, applied while `player_2` "Lyra" had the turn
- **THEN** the badge shows 7 and the tooltip reads "Burning", "7 rounds left", "from Lyra"

#### Scenario: Next turn anchored to the caster
- **WHEN** an instance has `duration: { type: "next_turn", anchor: "caster", edge: "start" }` and caster "Goblin"
- **THEN** the tooltip reads "Until the start of Goblin's next turn"

#### Scenario: Until removed
- **WHEN** a Prone instance has `duration: { type: "cancelled" }`
- **THEN** no badge is shown and the tooltip reads "Prone", "Until removed"

#### Scenario: Caster from an earlier encounter
- **WHEN** a player's Bless instance has `caster_name: "Goblin"` and a `caster_key` that isn't in the encounter
- **THEN** the tooltip reads "from Goblin (not in this encounter)"

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

### Requirement: Clicking an effect opens its detail view

Clicking an effect chip SHALL open a detail drawer for that entity and that instance. It
SHALL show:
- the entity, and the effect's name and icon
- its duration in words, the rounds left for a `time` duration, the round it was applied,
  and the caster's name. When the caster key doesn't match an entity in the encounter, it
  SHALL show the stored `caster_name` followed by "(not in this encounter)", or just "Not in
  this encounter" without a stored name.
- the choices made when applying, if any (e.g. "Ability: Wisdom")
- the repeat save, if any (ability, DC and when it is repeated)
- the resolved definition's description and sub-effects, where each sub-effect pulled in
  through `includes` is labelled with the definition it came from (e.g. "from
  Incapacitated")

For an unresolved definition, it SHALL show the stored name and "No details available".

#### Scenario: Paralyzed details
- **WHEN** the DM clicks a Paralyzed chip in a `"5.5e"` encounter
- **THEN** the drawer shows Paralyzed's description, its own sub-effects, and Incapacitated's sub-effects labelled "from Incapacitated"

#### Scenario: Hold-Person-style instance
- **WHEN** the DM clicks a Paralyzed instance with a Wisdom repeat save DC 15 at the end of the target's turn
- **THEN** the drawer shows "Wisdom save DC 15, at the end of the target's turn"

#### Scenario: Caster gone
- **WHEN** a player's carried-over instance has a `caster_key` that isn't in the current encounter and no `caster_name`
- **THEN** the drawer shows the caster as "Not in this encounter"

#### Scenario: Caster gone with a stored name
- **WHEN** the instance has `caster_name: "Goblin"` and its caster isn't in the encounter
- **THEN** the drawer shows the caster as "Goblin (not in this encounter)"

#### Scenario: Unresolved custom effect
- **WHEN** the DM clicks an instance whose custom definition was deleted
- **THEN** the drawer shows the instance's name and "No details available"

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

### Requirement: Exhaustion level can be changed from the detail view

For an Exhaustion instance, the detail view SHALL show the campaign edition's per-level
table with the current level marked. Choosing a level SHALL set the instance's `level`,
saved the same way as applying Exhaustion from the drawer. Choosing a level below 1 SHALL
remove the instance.

#### Scenario: Raise level
- **WHEN** a player's Exhaustion is at level 2 and the DM chooses level 4 in the table
- **THEN** that instance's `level` becomes 4 and the chip's badge shows 4

#### Scenario: Remove via level
- **WHEN** the DM lowers Exhaustion below level 1 in the detail view
- **THEN** the Exhaustion instance is removed

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

### Requirement: Effects' extra values are shown as one value

Where the tracker shows what effects add to a roll, it SHALL show one value for all of them,
with each effect's part in a tooltip:
- The attacker's to-hit and damage chips SHALL add the effects' bonuses up: dice of the same
  size and sign are counted together and flat values summed, per damage type. Dice of
  opposite signs (Bless and Bane) stay apart. Each effect's line stays in the tooltip.
- In the roll dialog, the to-hit line SHALL show the effects' bonus dice as one signed total,
  and a damage line SHALL show its penalties as one "− N". Their tooltips SHALL list each
  effect once, with its dice counted together and every die rolled, e.g. "Weak Grip −2d4:
  3, 1".

#### Scenario: Two stacked attack penalties
- **WHEN** an attacker has two independent "Shaky Aim" copies with −1d4 on attack rolls
- **THEN** its to-hit chip reads "To hit −2d4", and its tooltip lists both copies

#### Scenario: Bless and Bane
- **WHEN** an attacker has Bless (+1d4) and Bane (−1d4)
- **THEN** its to-hit chip reads "To hit +1d4 −1d4"

#### Scenario: Roll dialog to-hit
- **WHEN** an attack is rolled with Bless rolling 3 and two Shaky Aim copies rolling 4 and 1
- **THEN** the to-hit line shows "− 2" after the modifier, and its tooltip reads "Bless +1d4: 3" and "Shaky Aim −2d4: 4, 1"

#### Scenario: Roll dialog damage penalties
- **WHEN** a hit of 20 slashing has two Weak Grip copies rolling 3 and 2
- **THEN** the damage line reads "(20 − 5)", and its tooltip reads "Weak Grip −5 (2d4: 3 + 2)"
