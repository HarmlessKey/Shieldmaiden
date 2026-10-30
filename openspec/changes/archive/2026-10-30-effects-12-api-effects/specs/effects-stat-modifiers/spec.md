## ADDED Requirements

### Requirement: Bonus drawers list and apply the effects that change their values

Every drawer that adds manual bonuses SHALL also list the effects that change its values, and
apply them. These drawers and their values are:
- the tracker's bonuses drawer: the values it shows
- the run campaign screen's AC drawer: AC
- the player Edit drawer: AC and maximum hit points
- Group Health: maximum hit points

**Which effects.** The SRD effects of the campaign's edition and the user's custom effects
SHALL be listed when one of their sub-effects, of any type, has a sub-type that counts for
one of the drawer's values. That matches the HK API's `sub_type` filter. SRD conditions SHALL
NOT be listed: they have their own Conditions option. Each sub-type SHALL count for these
values:
- `ac`, `max_hp`, the speeds, `initiative`, `passive_perception`, `spell_save_dc`,
  `spell_attack`, `death_save`, `concentration_save`, `attack` and `damage`: the value of the
  same name
- `ability_score`: the score of each of its abilities, or of every ability without abilities
- `save`: the saves of each of its abilities, or all saves without abilities
- `ability`: the checks of each of its abilities, or all checks without abilities
- `skill`: each of its skills, or every skill without skills
- `d20_test`: attacks, all checks and all saves

An effect SHALL be listed once per drawer, even when it counts for several of its values. A
choice of an ability or skill SHALL be set from the drawer's values when they name exactly
one option of that kind. For example, the Dexterity drawer (the score, checks and saves) sets
the ability to Dexterity. Otherwise the choice is asked when applying. Examples:
- AC: Armor Class Bonus, Armor Class Minimum, Mage Armor, Haste, Slow and Warding Bond
- maximum hit points: Hit Point Maximum Bonus and Hit Point Maximum Reduction
- Bless and Bane for attacks and saves
- Skill Bonus for every skill
- not listed anywhere: Prone (a condition) and Reaction Used (no value)

**Applying.** The list SHALL be under the add form, with a search when it has more than a
few entries. The list SHALL look and work exactly as the Effects drawers' lists: each entry
expands to the effect's details, its apply button opens the regular apply form in a popover
and shift+click applies it until removed. Every such list SHALL have the SRD and custom effects in
tabs and show at most 10 entries at a time, with pagination. The apply form has, for that effect:
- its choices, with a value choice asked
- its duration, until removed by default
- its level, repeat save and escape as in the Effects drawers
- an optional caster:
  - the tracker: the encounter's entities and None, defaulting to None
  - the campaign drawers: the campaign's players and None
- Concentration when a caster is set, as in the Effects drawers

Apply SHALL apply it as the Effects drawers do, so immunities, notices, prompts, temporary or
maximum hit points and Concentration all behave the same:
- the tracker's drawer: to its entity
- the AC drawer and the Edit drawer: to the player, on the campaign
- Group Health: to every selected player, and only when at least one is selected

An applied effect SHALL show among the drawer's effect modifiers, not among its manual
bonuses.

#### Scenario: Armor Class Bonus from the AC drawer
- **WHEN** the DM opens a goblin's AC bonuses drawer, picks Armor Class Bonus, enters 2 and applies
- **THEN** the goblin has an Armor Class Bonus instance with value 2, until removed, and the drawer lists "Armor Class Bonus: +2" under the effect modifiers and not under the manual bonuses

#### Scenario: AC effects
- **WHEN** the DM opens the AC bonuses drawer in a `"5.5e"` campaign
- **THEN** Armor Class Bonus, Armor Class Minimum, Mage Armor, Haste, Slow and Warding Bond are listed, and Bless isn't

#### Scenario: Haste from the AC drawer
- **WHEN** the DM applies Haste from Lyra's AC drawer with Mira as the caster and Concentration
- **THEN** Lyra gets Haste as from the Effects drawer, with all of its sub-effects, linked to Mira's Concentration

#### Scenario: Roll bonuses
- **WHEN** the DM opens the roll bonuses of a player in a `"5.5e"` campaign in the tracker
- **THEN** Bless, Bane and Skill Bonus are listed, and no conditions

#### Scenario: Ability choice from the drawer
- **WHEN** the DM applies Ability Check Bonus 2 from the Dexterity drawer
- **THEN** the ability isn't asked, the instance's choices are `{ ability: "dexterity", value: "2" }`, and Dexterity checks rise by 2

#### Scenario: Skill choice asked
- **WHEN** the DM applies Skill Bonus from the roll bonuses drawer, which shows every skill
- **THEN** the apply form asks for the skill and the value

#### Scenario: Custom effect
- **WHEN** the DM opens the maximum hit points drawer and has a custom "Toughness" effect with a `max_hp` bonus of 10
- **THEN** Hit Point Maximum Bonus, Hit Point Maximum Reduction and Toughness are listed, and Armor Class Bonus isn't

#### Scenario: Group Health
- **WHEN** the DM selects three players in Group Health and applies Hit Point Maximum Bonus 5
- **THEN** each of the three gets the effect on the campaign, and their maximum and current hit points rise as with it from the Effects drawer

#### Scenario: Group Health without players
- **WHEN** no player is selected in Group Health
- **THEN** the effects can't be applied, and the drawer says to select players

#### Scenario: Search in a bonus drawer
- **WHEN** the DM types "armor" in the AC drawer's effects search
- **THEN** only Armor Class Bonus, Armor Class Minimum and Mage Armor are listed
