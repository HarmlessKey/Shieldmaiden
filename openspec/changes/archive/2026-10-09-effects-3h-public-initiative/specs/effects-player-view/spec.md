## MODIFIED Requirements

### Requirement: The live initiative list shows active effects

The live initiative list SHALL show each entity's active effect instances with the
tracker's effect chips (effects-display): the same icon or initial, badge and "+N"
overflow menu. It SHALL read NPC effects from the broadcast encounter's entity, and player
and companion effects from the campaign's player or companion, and SHALL NOT read a legacy
`conditions` map. SRD names come from the campaign's edition (5e when none is set), other
names from the resolved definition or the stored `name`.

#### Scenario: NPC is Prone and Blessed
- **WHEN** a broadcast NPC has a Prone instance and a Bless (custom) instance
- **THEN** its row shows the Prone condition chip and a generic effect chip with the letter "B", with tooltips "Prone" and "Bless"

#### Scenario: Player Exhaustion
- **WHEN** a player has an Exhaustion instance with `level: 3` stored on the campaign
- **THEN** the player's row shows the Exhaustion chip with the badge 3

#### Scenario: Rounds left
- **WHEN** an NPC has a Bless instance with 7 rounds left
- **THEN** its chip shows the badge 7, and the tooltip shows the duration in words, as in the tracker

#### Scenario: 5.5e names
- **WHEN** the campaign's edition is `"5.5e"` and an NPC has an SRD Concentration instance
- **THEN** the tooltip uses the name from the 5.5e SRD data

#### Scenario: Overflow
- **WHEN** an entity has more chips than fit in its row
- **THEN** the chips that don't fit are listed in the "+N" menu

#### Scenario: No effects
- **WHEN** an entity has no effect instances
- **THEN** its effects cell is empty

## ADDED Requirements

### Requirement: Effect chips on the live initiative are read-only

On the live initiative, clicking an effect chip SHALL NOT open the DM's effect detail
drawer or any other DM action. Players see the chip and its tooltip only.

#### Scenario: Player clicks a chip
- **WHEN** a player clicks the Prone chip of an NPC on the live initiative
- **THEN** nothing opens, and the tooltip still shows "Prone"

### Requirement: The caster is named only when players can see it

A chip's tooltip on the live initiative SHALL name the caster only when the caster is a
player or companion, or an NPC in the encounter that isn't hidden and whose name is shown
to players. The name SHALL be the one players see. Otherwise the tooltip leaves the caster
out.

#### Scenario: Visible caster
- **WHEN** a player has Bless cast by another player
- **THEN** the tooltip names that player as the caster

#### Scenario: Hidden caster
- **WHEN** a player has Bane cast by a hidden NPC
- **THEN** the tooltip doesn't name a caster

### Requirement: Live values are calculated by effects

The live initiative and its current-turn bar SHALL show AC (also when transformed),
maximum hit points and the health bar from the same calculation as the tracker: stored
values, manual bonuses and effects. Formulas SHALL use the creature's stats: the player,
the DM's NPC or companion, or the SRD monster. An effect whose definition can't be read
changes no values.

#### Scenario: Haste
- **WHEN** an NPC with AC 15 and a visible AC has Haste
- **THEN** the live initiative shows AC 17

#### Scenario: Aid
- **WHEN** a player with 30 maximum hit points has Aid at level 2 (+5)
- **THEN** the live initiative shows a maximum of 35

#### Scenario: Formula from the monster's stats
- **WHEN** an SRD NPC with Dexterity 14 has Mage Armor (base AC 13 + Dexterity modifier)
- **THEN** the live initiative shows AC 15

#### Scenario: Manual bonus and effect
- **WHEN** a player with AC 16 has a manual AC bonus of 1 and Shield of Faith
- **THEN** the live initiative shows AC 19

### Requirement: Changed values are marked with their sources when effects are visible

A value on the live initiative that differs from its stored value SHALL be marked like in
the tracker. When that entity's effects are shown to players, its tooltip SHALL list the
effects and manual bonuses ("Haste: +2"). When they are hidden, the tooltip SHALL only show
the net change ("Armor Class +2").

#### Scenario: Effects visible
- **WHEN** an NPC whose effects are shown to players has Haste, and its AC is visible
- **THEN** its AC is marked, with the tooltip "Haste: +2"

#### Scenario: Effects hidden
- **WHEN** the DM hides that NPC's effects but shows its AC
- **THEN** its AC 17 is marked, with the tooltip "Armor Class +2"

### Requirement: Hidden values stay hidden

A value the share settings hide from players SHALL stay hidden on the live initiative when
effects change it. Effects SHALL NOT reveal it, mark it or name it.

#### Scenario: Hidden AC
- **WHEN** an NPC's AC is hidden from players and it has Haste
- **THEN** its AC still shows as hidden
