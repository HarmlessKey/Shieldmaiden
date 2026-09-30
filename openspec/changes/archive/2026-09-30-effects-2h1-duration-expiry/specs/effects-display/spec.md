## MODIFIED Requirements

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
