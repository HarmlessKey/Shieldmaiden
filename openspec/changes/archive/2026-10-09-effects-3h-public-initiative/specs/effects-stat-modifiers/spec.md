## MODIFIED Requirements

### Requirement: Effective values are shown and marked

The entity card (stats, ability scores, modifiers, saves, skills, passive Perception and
spellcasting), the targeted panel, the target rows and the health bar SHALL show effective
values. A value that differs from its stored value because of effects or manual bonuses SHALL
be marked. Its tooltip SHALL list each effect or manual bonus that changed it and how
("Grappled: set to 0", "Exhaustion: −15", "Ring of Protection: +1"), and any sub-effect listed
as not applied. Quick edits SHALL keep showing and editing the stored base values. The player
live view SHALL show effective AC and maximum hit points too (effects-player-view).

#### Scenario: Marked AC
- **WHEN** a player with AC 16 has Shield of Faith (+2 AC) and the DM opens its card
- **THEN** the card shows AC 18, marked, with a tooltip "Shield of Faith: +2"

#### Scenario: Quick edit
- **WHEN** the DM opens the AC quick edit of that player
- **THEN** it shows the stored AC 16

#### Scenario: Player live view
- **WHEN** that player is shown on the live initiative with a visible AC
- **THEN** the live initiative shows AC 18 as well

### Requirement: Screens outside the tracker use manual bonuses

Outside the DM's tracker and the player live view, manual bonuses SHALL be totalled per
value, without effects:
- the campaign overview SHALL show AC and maximum hit points with their manual bonuses, and
  its rest dialog SHALL offer one "Manual bonuses" reset that removes `bonuses`, `ac_bonus`
  and `maxHpMod`
- the party health drawer's maximum HP field and the player edit drawer's AC bonus and maximum
  HP fields SHALL set the "Manual" bonus, keeping other manual bonuses
- resetting an encounter SHALL remove its NPCs' `bonuses`, `ac_bonus` and `maxHpMod`
- exports SHALL leave out `bonuses`

The player live view shows manual bonuses together with effects (effects-player-view).

#### Scenario: Campaign overview
- **WHEN** a player with AC 15 has manual AC bonuses of 1 and 2
- **THEN** the campaign overview shows AC 18 with a tooltip listing both

#### Scenario: Campaign overview ignores effects
- **WHEN** that player also has Shield of Faith
- **THEN** the campaign overview still shows AC 18

#### Scenario: Player edit drawer
- **WHEN** a player has manual AC bonuses "Manual" +1 and "Cover" +2, and the DM sets AC bonus 3 in the player edit drawer
- **THEN** the "Manual" bonus becomes +3 and "Cover" stays +2
