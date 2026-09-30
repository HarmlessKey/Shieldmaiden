## Purpose

How active effect instances are shown on combatants in the combat tracker and what the
detail view for a single applied effect shows and lets the DM change.

## ADDED Requirements

### Requirement: Active effects are shown on combatants

Wherever the tracker shows an entity's conditions and reminders (the target list, the
entity card and the target lists of drawers), it SHALL also show one chip per active effect
instance of that entity, after the reminders and legacy conditions. An SRD condition's chip
SHALL show that condition's icon. Any other effect SHALL show a generic effect icon with
the first letter of its name. Chips SHALL follow the existing overflow behavior: when space
runs out, the remaining chips move into the "+N" menu. The legacy condition and reminder
chips SHALL keep working unchanged.

#### Scenario: Prone NPC
- **WHEN** an NPC has a Prone effect instance
- **THEN** its row in the tracker shows a chip with the Prone condition icon

#### Scenario: Custom effect
- **WHEN** a player has an instance of custom effect "burning"
- **THEN** its row shows a chip with the generic effect icon and the letter "B"

#### Scenario: Legacy and new side by side
- **WHEN** an entity has the legacy `poisoned` condition and a Prone effect instance
- **THEN** both chips are shown, the legacy one first

#### Scenario: Overflow
- **WHEN** an entity has more chips than fit in its row
- **THEN** the chips that don't fit are listed in the "+N" menu, including effect chips

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
<caster name>".

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

### Requirement: Chip filtering per context

The entity-effects row SHALL accept flags that limit it to reminders, legacy conditions or
effect instances. With no flag it SHALL show all three kinds. The legacy Conditions drawer
SHALL keep showing only legacy conditions, the Reminders drawer only reminders, and the
Effects drawer's target list SHALL show only effect instances.

#### Scenario: Effects drawer targets
- **WHEN** the Effects drawer is open for an entity with a reminder, a legacy condition and a Prone instance
- **THEN** its target list shows only the Prone chip for that entity

#### Scenario: Tracker row
- **WHEN** the same entity is shown in the tracker's target list
- **THEN** all three chips are shown

### Requirement: Clicking an effect opens its detail view

Clicking an effect chip SHALL open a detail drawer for that entity and that instance. It
SHALL show:
- the entity, and the effect's name and icon
- its duration in words, the rounds left for a `time` duration, the round it was applied,
  and the caster's name, or "not in this encounter" when the caster key doesn't match an
  entity in the encounter
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
- **WHEN** a player's carried-over instance has a `caster_key` that isn't in the current encounter
- **THEN** the drawer shows the caster as "not in this encounter"

#### Scenario: Unresolved custom effect
- **WHEN** the DM clicks an instance whose custom definition was deleted
- **THEN** the drawer shows the instance's name and "No details available"

### Requirement: Effects can be removed from the detail view

The detail view SHALL offer a Remove button that removes that one instance, saved the same
way as removing from the Effects drawer, and closes the detail view. The button SHALL be
hidden when the resolved definition has `cancelable: false`, and SHALL be shown when
`cancelable` is true, absent, or the definition is unresolved.

#### Scenario: Remove one instance
- **WHEN** an NPC has two instances of a custom effect and the DM removes one from its detail view
- **THEN** only that instance is removed and the other remains

#### Scenario: Not cancelable
- **WHEN** the resolved definition has `cancelable: false`
- **THEN** the detail view shows no Remove button

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
