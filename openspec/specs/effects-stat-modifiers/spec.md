# effects-stat-modifiers Specification

## Purpose

How active effects and the DM's manual bonuses change a creature's numbers in the DM's combat
tracker: which values are computed from numeric sub-effects and labelled manual bonuses, how
the modifiers combine, where the effective values are shown, used and edited, and how maximum
and temporary hit points follow them.

## Requirements

### Requirement: Numeric sub-effects change effective values

In the DM's combat tracker, an entity's effective value SHALL be computed from its stored
value and the numeric sub-effects (`bonus`, `base`, `fixed`, `floor`, `cap`, or a sub-effect
with only a `multiplier`) of its active effect instances. The value is chosen by the
sub-effect's `sub_types`:
- `ac`: Armor Class, also while transformed
- `speed`: walking Speed and every other Speed the entity has
- `fly_speed`, `swim_speed`, `climb_speed`, `burrow_speed`: only that Speed
- `max_hp`: the hit point maximum of the main hit point pool
- `initiative`: the initiative modifier
- `passive_perception`: passive Perception
- `spell_save_dc` and `spell_attack`: the spellcasting and innate spellcasting save DC and
  spell attack bonus
- `ability_score`: the scores in the sub-effect's `abilities`, or the ability chosen at
  application when it has `choice: "ability"`

Stored values SHALL NOT be changed. When an effect ends or changes level, the effective
value SHALL follow without further action. Sub-effects pulled in through `includes` SHALL
count like the effect's own. Unresolved definitions SHALL contribute nothing. A Speed stored
as text (old NPC format) SHALL only follow `fixed`; other modifiers SHALL be listed but not
applied to it.

#### Scenario: Grappled Speed 0
- **WHEN** an NPC with walking Speed 30 and fly Speed 60 has Grappled (a `fixed` `speed` sub-effect with value 0)
- **THEN** its effective walking and fly Speed are 0, and they're back to 30 and 60 when Grappled is removed

#### Scenario: Custom AC bonus
- **WHEN** a player with AC 16 has a custom effect with `{ type: "bonus", sub_types: ["ac"], value: 2 }`
- **THEN** its effective AC is 18, and the stored AC stays 16

#### Scenario: Ability score
- **WHEN** an entity with Strength 10 has a sub-effect `{ type: "fixed", sub_types: ["ability_score"], abilities: ["strength"], value: 19 }`
- **THEN** its effective Strength is 19 and its Strength modifier +4

#### Scenario: Old-format Speed text
- **WHEN** an old-format NPC with Speed "30 ft., climb 30 ft." has Restrained
- **THEN** its effective Speed shows as 0 ft.

### Requirement: Modifiers combine in a fixed order

For each value, the modifiers that apply SHALL combine in this order:
1. **base**: the highest `base` value replaces the stored value. A `base` without a value
   multiplies the stored value by its `multiplier`.
2. **bonus**: every `bonus` value is added. The value is a number or a formula (evaluated as
   in effects-damage-healing, with the instance's level as `level`). A `multiplier` on a
   sub-effect with a value multiplies that value.
3. **multiply**: each sub-effect that has only a `multiplier` multiplies the result. The
   result is then rounded down.
4. **floor / cap**: the result is at least the highest `floor` and at most the lowest `cap`.
5. **fixed**: when any `fixed` applies, the lowest `fixed` value is the result.

A formula with unknown variables SHALL contribute nothing and SHALL be named as not applied.

#### Scenario: 2024 Exhaustion level 3
- **WHEN** a player with Speed 30 has 5.5e Exhaustion at level 3 (`bonus` `speed` with `value: { formula: "-5 * level" }`)
- **THEN** its effective Speed is 15

#### Scenario: 2014 Exhaustion level 2
- **WHEN** a player with Speed 30 has 5e Exhaustion at level 2 (`base` `speed` with `multiplier: 0.5` and `min_level: 2`)
- **THEN** its effective Speed is 15

#### Scenario: Doubling after a bonus
- **WHEN** an entity with Speed 30 has a `bonus` `speed` of 10 and a sub-effect `{ type: "bonus", sub_types: ["speed"], multiplier: 2 }` without a value
- **THEN** its effective Speed is 80

#### Scenario: Fixed wins
- **WHEN** an entity has a `bonus` `speed` of 10 and Grappled's `fixed` `speed` of 0
- **THEN** its effective Speed is 0

#### Scenario: Floor
- **WHEN** an entity with AC 12 has a sub-effect `{ type: "floor", sub_types: ["ac"], value: 16 }`
- **THEN** its effective AC is 16, and with AC 18 it stays 18

### Requirement: Only applicable modifiers count

A numeric sub-effect SHALL count only when:
- the instance's level is at least its `min_level` and at most its `max_level` (when set)
- its `condition`, and its definition's `condition`, evaluate true with the effect
  condition checks. A check that can't be evaluated counts as false, and the sub-effect is
  listed as not applied.
- with `choice`, the instance has that choice

When the same definition (the same `source` and `source_key`) is on one entity more than
once, its sub-effects SHALL count for one instance only: the one whose contributions change
the value most. A definition with `stacking.mode: "independent"` is the exception: every
instance of it SHALL count, each with its own choices, level and rolled values. This applies
everywhere the tracker counts a definition once: effective values, d20 roll modifiers,
damage bonuses, damage modifiers and restrictions.

#### Scenario: Exhaustion rows by level
- **WHEN** a player has 5e Exhaustion at level 1
- **THEN** its Speed isn't halved, and it is halved from level 2

#### Scenario: Same effect twice
- **WHEN** an entity has two instances of a custom effect with `bonus` `ac` 2
- **THEN** its effective AC is 2 higher, not 4

#### Scenario: Different effects stack
- **WHEN** an entity has two different custom effects, each with `bonus` `ac` 2
- **THEN** its effective AC is 4 higher

#### Scenario: Strength Drain twice
- **WHEN** a fighter with Strength 16 is hit twice by a Shadow, and the two Strength Drain instances (`stacking.mode: "independent"`) rolled 3 and 2
- **THEN** its effective Strength is 11, and the tooltip lists both reductions

#### Scenario: Independent roll penalty
- **WHEN** an entity has two instances of a custom effect with `stacking.mode: "independent"` and a −1d4 bonus on attack rolls
- **THEN** its attack rolls subtract two separate d4s

#### Scenario: Doesn't stack is unchanged
- **WHEN** an entity has two Bless instances from different clerics (no `stacking`)
- **THEN** its attack rolls add one d4

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

### Requirement: Effective values are used by the tracker's rolls

The tracker SHALL use effective values when:
- the roll dialog decides hit or miss against a target's AC
- saves are rolled in the roll dialog, and repeat-save and escape rolls are made
- ability checks, saves and skill checks are rolled from the entity card and the targeted
  panel
- an NPC casts a spell (spell save DC and spell attack bonus)
- initiative is rolled for NPCs, or auto-rolled in test mode
- 3a's formula variables (scores, modifiers, `max_hp`) are read

Stored attack bonuses and damage of NPC actions SHALL NOT change with ability scores.

#### Scenario: Hit against effective AC
- **WHEN** an attack totalling 17 is rolled against an NPC with AC 15 and a +2 AC effect
- **THEN** the roll dialog marks it as a miss

#### Scenario: Save with a changed score
- **WHEN** the DM rolls a Strength save from the card of an entity with Strength 10 and an effect setting Strength to 19
- **THEN** the roll uses a +4 modifier

#### Scenario: NPC initiative
- **WHEN** the DM rolls initiative for an NPC with initiative modifier +2 and a `bonus` `initiative` of 5
- **THEN** the roll uses +7

### Requirement: Hit points follow the effective maximum

Healing SHALL stop at the effective hit point maximum. Bloodied (`on_bloodied`) and instant
death from damage SHALL use it. When an entity's effective maximum drops below its current hit
points (an effect applied, removed or changed level), its current hit points SHALL be set to
the effective maximum and saved. When an instance is applied whose definition has a `bonus`
`max_hp` sub-effect with `also_heal`, current hit points SHALL rise by that bonus, up to the
new effective maximum, and be saved. The bonus is its value, or its rolled total (Rolled
values are rolled when the effect is applied) times its multiplier. A transformed entity's
transformed hit point pool SHALL NOT follow `max_hp` sub-effects.

#### Scenario: Exhaustion halves the maximum
- **WHEN** a player at 40/40 HP reaches 5e Exhaustion level 4
- **THEN** its effective maximum is 20 and its current HP is set to 20

#### Scenario: Healing stops at the effective maximum
- **WHEN** that player at 10/20 is healed for 15
- **THEN** its HP becomes 20

#### Scenario: Aid
- **WHEN** Aid (a `bonus` `max_hp` of 5 with `also_heal`) is applied to a player at 12/30
- **THEN** its effective maximum is 35 and its HP 17

#### Scenario: Rolled also-heal
- **WHEN** an effect with a `bonus` `max_hp` roll of 2d4 with `also_heal` is applied to a player at 12/30, and the dice roll 5
- **THEN** its effective maximum is 35 and its HP 17

#### Scenario: Maximum restored
- **WHEN** an effect that lowered the maximum ends
- **THEN** the maximum is back and current HP stays as it is

### Requirement: Temporary hit points are granted from a prompt

A `fixed` sub-effect with `temp_hp` SHALL grant temporary hit points through a **Grant temp
HP** button:
- with a `trigger`: on the prompt of that trigger, next to the other buttons
- without a `trigger`: on a prompt shown when the effect is applied

The amount is the sub-effect's `roll` (rolled, the roll is shown) or its `value` (number or
formula), as for damage in effects-damage-healing, for the holder. Granting SHALL set the
holder's temporary hit points to the higher of its current temporary hit points and the
amount, and save them. Nothing SHALL be granted without the DM choosing the button. When the
sub-effect has `expires_with_effect` and the grant raised the holder's temporary hit points,
the amount SHALL be saved on the instance as `temp_hp_granted`, when the instance still
exists.

#### Scenario: False Life
- **WHEN** an effect with `{ type: "fixed", sub_types: ["temp_hp"], roll: { dice_count: 1, dice_type: 4, fixed_val: 4 } }` is applied to a player with 0 temporary HP
- **THEN** a prompt with Grant temp HP is shown, and choosing it rolls 1d4+4 and sets the player's temporary HP to the result

#### Scenario: Keep the higher
- **WHEN** a creature with 8 temporary HP is granted 5
- **THEN** it keeps 8, and no `temp_hp_granted` is saved

#### Scenario: Heroism each turn
- **WHEN** a creature's effect has a `fixed` `temp_hp` sub-effect with `trigger: "start_turn_target"` and `value: { formula: "caster.cha_mod" }`, and its turn starts
- **THEN** the trigger prompt offers Grant temp HP for the caster's Charisma modifier

#### Scenario: Recorded grant
- **WHEN** Heroism (`expires_with_effect`) grants 5 temporary hit points to a creature with 0
- **THEN** the Heroism instance has `temp_hp_granted: 5`

### Requirement: Temporary hit points end with their effect

When an instance with `temp_hp_granted` ends, and its holder's temporary hit points are above
0 and at most `temp_hp_granted`, the holder SHALL lose them, and the change SHALL be saved.
A notice SHALL say "<holder> loses <n> temporary hit points from <effect>". This happens
however the instance ends: by hand, by expiry, or by the cascade. When an escalation replaces
the instance, it doesn't. Temporary hit points above `temp_hp_granted` came from somewhere
else and SHALL be kept. The 2014 (5e) False Life SHALL have `expires_with_effect` on its
temporary hit points, as Heroism has in both editions.

#### Scenario: False Life ends
- **WHEN** a 5e False Life instance with `temp_hp_granted: 7` is removed and its holder has 4 temporary hit points left
- **THEN** the holder's temporary hit points become 0, with the notice "Lyra loses 4 temporary hit points from False Life"

#### Scenario: Heroism ends with Concentration
- **WHEN** the caster's Concentration ends and Heroism linked to it has `temp_hp_granted: 5`, and its holder has 5 temporary hit points
- **THEN** Heroism ends through the cascade and the holder loses the 5 temporary hit points

#### Scenario: Temporary hit points from elsewhere
- **WHEN** a Heroism instance with `temp_hp_granted: 5` ends, and its holder has 12 temporary hit points from another source
- **THEN** the holder keeps the 12

### Requirement: Manual bonuses are labelled lists

The DM's manual bonuses SHALL be stored per entity as `bonuses`, keyed by value and then by a
bonus id: `bonuses.<value>.<id> = { value, label }`. The values are:
- numbers (effects-stat-modifiers): `ac`, `speed`, `fly_speed`, `swim_speed`, `climb_speed`,
  `burrow_speed`, `max_hp`, `initiative`, `passive_perception`, `spell_save_dc`,
  `spell_attack`, `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom` and
  `charisma`
- rolls (effects-roll-modifiers): `skill_<skill>` for each skill, `check_<ability>`,
  `check_all`, `save_<ability>`, `save_all`, `death_save`, `concentration_save`, `attack`
  and `damage`

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

#### Scenario: Attack and damage keys
- **WHEN** the DM gives an NPC an attack bonus and a damage bonus
- **THEN** the encounter stores them under `bonuses.attack` and `bonuses.damage`, and the database rules accept them

#### Scenario: Invalid bonus
- **WHEN** a client writes a bonus without a label, or under an unknown value such as `bonuses.luck`, `bonuses.skill_luck` or `bonuses.attack_melee`
- **THEN** the database rules reject the write

### Requirement: Old single-value bonuses are converted

When an encounter loads an entity whose saved data has a non-zero `ac_bonus` or `maxHpMod` and
no `bonuses` for that value, the tracker SHALL treat it as a manual bonus with id `manual`,
labelled "Manual", under `ac` or `max_hp`. Nothing SHALL be written by loading. The first time
a manual bonus of that entity changes, the tracker SHALL save the entity's whole `bonuses` and
remove its `ac_bonus` and `maxHpMod`. Screens that show bonuses outside the tracker SHALL read
both the new and the old format, with `bonuses` taking precedence.

#### Scenario: Old AC bonus
- **WHEN** an encounter loads a player whose campaign data has `ac_bonus: 2`
- **THEN** its AC tooltip lists "Manual: +2" and nothing is written

#### Scenario: First change saves the new format
- **WHEN** the DM then adds an AC bonus "Cover" +2 to that player
- **THEN** the campaign stores `bonuses.ac` with the Manual and Cover entries, and `ac_bonus` is removed

### Requirement: Manual bonuses count like effect bonuses

In the DM's tracker, each manual bonus SHALL count as a `bonus` modifier for its value, named
after its label, in the same combination order as effect modifiers. Manual bonuses SHALL NOT
be grouped with each other or with effects. `speed` SHALL apply to every Speed the entity has,
as for effects. The stored maximum hit points SHALL no longer include manual maximum hit point
bonuses: the effective maximum adds them.

#### Scenario: Manual and effect bonuses together
- **WHEN** a player with AC 16 has Shield of Faith and a manual AC bonus "Cover" +2
- **THEN** its effective AC is 20, and the tooltip lists "Shield of Faith: +2" and "Cover: +2"

#### Scenario: Manual bonus and fixed Speed
- **WHEN** an entity has a manual Speed bonus "Boots" +10 and is Grappled
- **THEN** its effective Speed is 0

### Requirement: The bonuses drawer shows and edits a value's bonuses

On the entity card, AC, maximum hit points, Speed, initiative, the ability scores, passive
Perception and the spellcasting save DC and attack bonus SHALL open a bonuses drawer for that
value when clicked. An ability score SHALL open the drawer for the score, the checks and the
saves of that ability. A button next to the card's skill list SHALL open the drawer for all
roll bonuses: attacks, damage, all checks, all saves, death saves, Concentration saves and
every skill. For each value, the drawer SHALL show:
- the stored value (for roll bonuses: the modifier without effects and manual bonuses).
  Attacks and damage have no single stored value, so none is shown for them.
- every effect modifier for it, read-only, named after its effect, with a link to the effect's
  details, including modifiers listed as not applied. For attacks and damage, these are the
  entity's own modifiers. Modifiers that depend on the target are only known when it attacks.
- every manual bonus, whose value and label can be edited and which can be removed
- the effective value, except for attacks and damage

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

#### Scenario: Attack bonuses in the drawer
- **WHEN** the DM opens the roll bonuses of a blessed NPC with Magic Weapon
- **THEN** Attacks lists "Bless: +1d4" and "Magic Weapon: +1 (weapon)" read-only, Damage lists "Magic Weapon: +1 (weapon)", and the add form can add an `attack` or `damage` bonus

#### Scenario: Quick edit button
- **WHEN** the DM opens the AC quick edit
- **THEN** it shows the override AC field and a button that opens the AC bonuses drawer

### Requirement: Changing maximum hit point bonuses adjusts current hit points

When manual maximum hit point bonuses change, by the drawer, the entity edit drawer, the party
health drawer, the player edit drawer or a draining attack, current hit points SHALL follow:
when the maximum rises, current hit points rise by the same amount; when it falls, current
hit points are only lowered to the new maximum when they're above it. The maximum SHALL NOT go
below 0.

#### Scenario: Raise
- **WHEN** a player at 20/30 gets a manual maximum HP bonus of 5
- **THEN** it is at 25/35

#### Scenario: Remove
- **WHEN** that bonus is removed while the player is at 33/35
- **THEN** it is at 30/30, and at 25/35 it would stay at 25/30

#### Scenario: Draining attack
- **WHEN** an attack with a drain special deals 7 damage to an NPC
- **THEN** the NPC gets a maximum HP bonus of −7 labelled with the attack's name

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

### Requirement: A chosen value is the sub-effect's value

A sub-effect with `choice: "value"` SHALL use the instance's `choices.value` as its value,
read as a number, everywhere the tracker uses a sub-effect's value: effective values (bonus,
base, fixed, floor, cap), roll bonuses and minimum rolls, damage bonuses, damage reduction,
damage and healing rolls, temporary hit points and hit point maximum healing. A negative value
SHALL be a penalty. Until the value is chosen, the sub-effect SHALL do nothing. The resolved
definition SHALL NOT be changed: each instance uses its own choice.

#### Scenario: Generic AC bonus
- **WHEN** a creature with AC 15 has a custom "Armor Class Bonus" (`bonus` `ac` with `choice: "value"`) applied with `choices: { value: "2" }`
- **THEN** its effective AC is 17, marked with "Armor Class Bonus: +2"

#### Scenario: Two instances, two values
- **WHEN** one creature has that effect with value "1" and another with value "3"
- **THEN** their AC goes up by 1 and by 3

#### Scenario: Chosen penalty
- **WHEN** the chosen value is "-1"
- **THEN** the effective AC is 14

#### Scenario: Chosen roll bonus
- **WHEN** a creature has a `bonus` on `save` with `choice: "value"` and `choices: { value: "3" }`
- **THEN** its saving throws get +3

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

### Requirement: A chosen roll is the sub-effect's roll

A sub-effect with `choice: "roll"` SHALL use the instance's `choices.roll` as its roll. The
chosen roll is an object like a reminder's damage: `{ dice_count, dice_type, fixed_val }`, with
dice (a count of 1 to 99 and a die of 2 to 100, given together), a whole fixed value, or both.
It SHALL replace the roll's `dice_count`, `dice_type`, `fixed_val` and `modifier`; the roll's
other fields (`damage_type`, `damage_type_choice`, `magical`) and the sub-effect's
`multiplier` SHALL stay as defined. A fixed value without dice SHALL be a fixed amount. It
SHALL be used everywhere the tracker uses a sub-effect's roll:
- stat values (bonus, base, fixed, floor, cap) roll it once when the effect is applied and
  store the total in `rolled_values`, like a defined roll
- `damage` and `healing` sub-effects roll it every time they trigger
- roll bonuses and damage bonuses roll it on every roll they add to

Until a valid roll is chosen, the sub-effect SHALL do nothing. The resolved definition SHALL
NOT be changed: each instance uses its own choice. An instance or link without a roll but
with a numeric `choices.value` SHALL use that value as a fixed roll, so instances and links
made while an effect had a value choice keep working after it switches to a roll choice.

#### Scenario: Damage over time
- **WHEN** a creature has a custom "Burning" effect (`damage` triggered at the start of its turn, `roll: { damage_type: "fire" }`, `choice: "roll"`) applied with `choices: { roll: { dice_count: 2, dice_type: 6 } }`
- **THEN** at the start of each of its turns the damage prompt rolls 2d6 fire

#### Scenario: Chosen Strength reduction
- **WHEN** Weakening Breath (`bonus` `ability_score` Strength, `multiplier: -1`, `choice: "roll"`) is applied with `choices: { roll: { dice_count: 1, dice_type: 6 } }` and rolls 4
- **THEN** the instance has `rolled_values` 4 and the creature's Strength is 4 lower

#### Scenario: Roll with a fixed value
- **WHEN** a damage sub-effect with `roll: { dice_count: 1, dice_type: 4, damage_type: "acid" }` and `choice: "roll"` has `choices: { roll: { dice_count: 2, dice_type: 4, fixed_val: 2 } }`
- **THEN** it rolls 2d4+2 acid

#### Scenario: Only a fixed value
- **WHEN** the chosen roll is `{ fixed_val: 5 }` on a damage sub-effect
- **THEN** it deals 5 damage without rolling

#### Scenario: Made with a value choice
- **WHEN** a creature has a Damage Over Time instance with `choices: { damage_type: "fire", value: "5" }`, and the definition now has `choice: ["damage_type", "roll"]`
- **THEN** it still takes 5 fire damage at the start of its turns, and a link with `choices: { value: "4" }` on Hit Point Maximum Reduction doesn't ask for a roll

#### Scenario: Two instances, two rolls
- **WHEN** one creature has Burning with roll 1d4 and another with 3d6
- **THEN** their damage prompts roll 1d4 and 3d6

### Requirement: Rolled values are rolled when the effect is applied

A numeric sub-effect (`bonus`, `base`, `fixed`, `floor`, `cap`) whose `sub_types` change an
effective value (any value of "Numeric sub-effects change effective values") SHALL use its
`roll` as its value when it has dice (`dice_count` and `dice_type`). The roll SHALL be made
once, when the instance is applied, and its total (dice, `fixed_val` and the `modifier`
formula, with the caster's and the holder's formula variables) SHALL be stored on the
instance. Every application path SHALL do this: the Effects drawer, effect links on actions
and spells, the bonus drawers, and effects applied outside combat. Each target of an
application SHALL get its own roll.

The stored total SHALL then count as the sub-effect's value everywhere effective values are
computed. That includes the combining order, so a `multiplier` applies to it and
`multiplier: -1` makes it a penalty. The stored total SHALL NOT be rolled again when the
instance changes level, when the encounter is reloaded or when the definition changes.

- A sub-effect with `choice: "value"` SHALL use the chosen value. Nothing is rolled for it.
- A sub-effect with both a `value` and a roll with dice SHALL use the roll.
- A sub-effect with a roll but no stored total SHALL contribute nothing and SHALL be listed
  as not applied ("not rolled"). This covers instances applied before the definition got a
  roll, and trait effects, which are never applied.
- `temp_hp` keeps its own grant prompt (Temporary hit points are granted from a prompt) and
  SHALL NOT be rolled on application.

The apply notice SHALL show each roll with its result and its effect on the value
("Strength Drain: 1d4 = 3, Strength −3"). The value's tooltip SHALL show the stored amount
and the roll it came from ("Strength Drain: −3 (1d4)"). Demo and test mode SHALL roll the same
way without writing (effects-instance-storage).

#### Scenario: Strength Drain
- **WHEN** an effect with `{ type: "bonus", sub_types: ["ability_score"], abilities: ["strength"], roll: { dice_count: 1, dice_type: 4 }, multiplier: -1 }` is applied to a player with Strength 14, and the d4 rolls 3
- **THEN** the instance stores the total 3, the player's effective Strength is 11, its Strength modifier is +0, and the notice shows "1d4 = 3"

#### Scenario: Rolled maximum reduction
- **WHEN** an effect with a `bonus` `max_hp` sub-effect with `roll: { dice_count: 3, dice_type: 6 }` and `multiplier: -1` is applied to an NPC at 40/40 HP, and the dice roll 11
- **THEN** its effective maximum is 29 and its current HP is set to 29

#### Scenario: Rolled bonus
- **WHEN** an effect with a `bonus` `ac` sub-effect with `roll: { dice_count: 1, dice_type: 4 }` and no multiplier is applied to a creature with AC 15, and the d4 rolls 2
- **THEN** its effective AC is 17, with the tooltip "<effect>: +2 (1d4)"

#### Scenario: Each target rolls
- **WHEN** that Strength Drain effect is applied to two creatures at once
- **THEN** each instance stores its own roll

#### Scenario: Not rolled again
- **WHEN** an instance with a stored total of 3 changes level, or the encounter is closed and opened again
- **THEN** its total is still 3

#### Scenario: Modifier formula
- **WHEN** an effect with a `bonus` `ac` roll of `{ dice_count: 1, dice_type: 4, modifier: { formula: "caster.wis_mod" } }` is applied by a caster with Wisdom modifier +3, and the d4 rolls 1
- **THEN** the stored total is 4

#### Scenario: Instance without a roll
- **WHEN** an instance has no stored total for a sub-effect with a roll
- **THEN** that sub-effect doesn't change the value and the tooltip lists it as not rolled

#### Scenario: Chosen value wins
- **WHEN** a sub-effect has both a roll and `choice: "value"`, and is applied with `choices: { value: "-2" }`
- **THEN** nothing is rolled and the value is −2
