## MODIFIED Requirements

### Requirement: Chips show a badge and a tooltip

An effect chip SHALL show a badge with the Exhaustion level for Exhaustion, with the
duplicates left for an effect with a Duplicates sub-effect, and with the rounds left for a
`time` duration. When an effect has both duplicates and a `time` duration, the badge SHALL show
the duplicates. Other effects SHALL show no badge. Hovering a chip SHALL show a tooltip with the
effect's name (capitalised) and its duration in words:
- "Until removed" for `cancelled`
- "N rounds left" for `time`
- "Concentration" with the maximum when set, e.g. "Concentration, up to 1 hour"
- "Until the start/end of <name>'s next turn" for `next_turn`, where <name> is the anchor
  (the caster or the effect's holder)
- "Until the end of this turn" for `end_of_turn`
- the duration type in plain words for any other type

For an effect with duplicates, the tooltip SHALL add "N duplicates left" ("1 duplicate left").

When the instance has a caster that is in the encounter, the tooltip SHALL add "from
<caster name>". When its caster isn't in the encounter but the instance has a stored
`caster_name`, the tooltip SHALL add "from <caster_name> (not in this encounter)".

#### Scenario: Exhaustion badge
- **WHEN** a player has Exhaustion with `level: 3`
- **THEN** the chip's badge shows 3

#### Scenario: Timed effect
- **WHEN** an NPC has a custom Burning instance with `duration.type: "time"` and `rounds_remaining: 7`, applied while `player_2` "Lyra" had the turn
- **THEN** the badge shows 7 and the tooltip reads "Burning", "7 rounds left", "from Lyra"

#### Scenario: Duplicates left
- **WHEN** a wizard has Mirror Image with `charges: 2` and `rounds_remaining: 8`
- **THEN** the badge shows 2 and the tooltip reads "Mirror image", "8 rounds left", "2 duplicates left"

#### Scenario: Next turn anchored to the caster
- **WHEN** an instance has `duration: { type: "next_turn", anchor: "caster", edge: "start" }` and caster "Goblin"
- **THEN** the tooltip reads "Until the start of Goblin's next turn"

#### Scenario: Until removed
- **WHEN** a Prone instance has `duration: { type: "cancelled" }`
- **THEN** no badge is shown and the tooltip reads "Prone", "Until removed"

#### Scenario: Caster from an earlier encounter
- **WHEN** a player's Bless instance has `caster_name: "Goblin"` and a `caster_key` that isn't in the encounter
- **THEN** the tooltip reads "from Goblin (not in this encounter)"
