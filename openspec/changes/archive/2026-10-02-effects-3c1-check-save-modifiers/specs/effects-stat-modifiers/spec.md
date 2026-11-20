## MODIFIED Requirements

### Requirement: Manual bonuses are labelled lists

The DM's manual bonuses SHALL be stored per entity as `bonuses`, keyed by value and then by a
bonus id: `bonuses.<value>.<id> = { value, label }`. The values are:
- numbers (effects-stat-modifiers): `ac`, `speed`, `fly_speed`, `swim_speed`, `climb_speed`,
  `burrow_speed`, `max_hp`, `initiative`, `passive_perception`, `spell_save_dc`,
  `spell_attack`, `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom` and
  `charisma`
- rolls (effects-roll-modifiers): `skill_<skill>` for each skill, `check_<ability>`,
  `check_all`, `save_<ability>`, `save_all`, `death_save` and `concentration_save`

`value` SHALL be a whole number from −9999 to 9999, and `label` a non-empty text of at most 50
characters. Players' and companions' bonuses SHALL be saved on the campaign, and NPCs' on the
encounter, like their hit points. The database rules SHALL accept this shape and nothing else
under `bonuses`. The manual bonus with id `manual` SHALL be the entry labelled "Manual" that
single-value inputs edit. The transformed hit point pool's own maximum hit point modifier
SHALL stay a single number.

#### Scenario: Two AC bonuses
- **WHEN** the DM gives a player an AC bonus of 1 labelled "Ring of Protection" and one of 2 labelled "Cover"
- **THEN** the campaign stores `bonuses.ac` with two entries, `{ value: 1, label: "Ring of Protection" }` and `{ value: 2, label: "Cover" }`

#### Scenario: Roll bonus keys
- **WHEN** the DM gives a player a Sleight of Hand bonus and an all-saves bonus
- **THEN** the campaign stores them under `bonuses.skill_sleight_of_hand` and `bonuses.save_all`, and the database rules accept them

#### Scenario: Invalid bonus
- **WHEN** a client writes a bonus without a label, or under an unknown value such as `bonuses.luck` or `bonuses.skill_luck`
- **THEN** the database rules reject the write

### Requirement: The bonuses drawer shows and edits a value's bonuses

On the entity card, AC, maximum hit points, Speed, initiative, the ability scores, passive
Perception and the spellcasting save DC and attack bonus SHALL open a bonuses drawer for that
value when clicked. An ability score SHALL open the drawer for the score, the checks and the
saves of that ability. A button next to the card's skill list SHALL open the drawer for all
roll bonuses: all checks, all saves, death saves, Concentration saves and every skill. For
each value, the drawer SHALL show:
- the stored value (for roll bonuses: the modifier without effects and manual bonuses)
- every effect modifier for it, read-only, named after its effect, with a link to the effect's
  details, including modifiers listed as not applied
- every manual bonus, whose value and label can be edited and which can be removed
- the effective value

Values without effect modifiers or manual bonuses MAY be collapsed. The drawer SHALL have one
form to add a manual bonus: a value, a label ("Manual" by default) and which of the drawer's
values it is for.

The AC and HP quick edits SHALL offer a button that opens the drawer for AC or maximum hit
points instead of a bonus field. While an entity is transformed, the HP quick edit SHALL keep
its field for the transformed pool's modifier. The entity edit drawer SHALL do the same for a
single entity. For several entities, its AC and maximum hit point bonus fields SHALL set the
"Manual" bonus of each, where 0 removes it.

#### Scenario: Open from the card
- **WHEN** the DM clicks the AC value on a player's card
- **THEN** the bonuses drawer for AC opens, showing stored AC 16, "Shield of Faith: +2" read-only, the manual bonuses and the effective AC

#### Scenario: Add a bonus
- **WHEN** the DM adds a Speed bonus of 10 labelled "Boots of Striding" in the drawer
- **THEN** it is saved, listed, and the effective Speed rises by 10

#### Scenario: Ability score opens checks and saves
- **WHEN** the DM clicks the Dexterity score on a slowed creature's card
- **THEN** the drawer shows Dexterity, Dexterity checks and Dexterity saves, the last with "Slow: −2" read-only, and the add form can target any of the three

#### Scenario: All roll bonuses
- **WHEN** the DM clicks the roll bonuses button by the skill list and adds +2 labelled "Gloves of Thievery" for Sleight of Hand
- **THEN** it is saved under `skill_sleight_of_hand`, and the card's Sleight of Hand modifier rises by 2

#### Scenario: Quick edit button
- **WHEN** the DM opens the AC quick edit
- **THEN** it shows the override AC field and a button that opens the AC bonuses drawer
