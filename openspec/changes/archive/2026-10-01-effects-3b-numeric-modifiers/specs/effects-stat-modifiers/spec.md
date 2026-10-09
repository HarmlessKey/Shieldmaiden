## Purpose

How active effects change a creature's numbers in the DM's combat tracker: which values are
computed from numeric sub-effects, how the modifiers combine, where the effective values are
shown and used, and how maximum and temporary hit points follow effects.

## ADDED Requirements

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
2. **bonus**: every `bonus` value is added. The value is a number, a formula (evaluated as
   in effects-damage-healing), or `scaling.by: "level"` / `"stacks"` × `per_unit_value`
   using the instance's level. A `multiplier` on a sub-effect with a value multiplies that
   value.
3. **multiply**: each sub-effect that has only a `multiplier` multiplies the result. The
   result is then rounded down.
4. **floor / cap**: the result is at least the highest `floor` and at most the lowest `cap`.
5. **fixed**: when any `fixed` applies, the lowest `fixed` value is the result.

A formula with unknown variables SHALL contribute nothing and SHALL be named as not applied.

#### Scenario: 2024 Exhaustion level 3
- **WHEN** a player with Speed 30 has 5.5e Exhaustion at level 3 (`bonus` `speed` with `scaling: { by: "level", per_unit_value: -5 }`)
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
the value most.

#### Scenario: Exhaustion rows by level
- **WHEN** a player has 5e Exhaustion at level 1
- **THEN** its Speed isn't halved, and it is halved from level 2

#### Scenario: Same effect twice
- **WHEN** an entity has two instances of a custom effect with `bonus` `ac` 2
- **THEN** its effective AC is 2 higher, not 4

#### Scenario: Different effects stack
- **WHEN** an entity has two different custom effects, each with `bonus` `ac` 2
- **THEN** its effective AC is 4 higher

### Requirement: Effective values are shown and marked

The entity card (stats, ability scores, modifiers, saves, skills, passive Perception and
spellcasting), the targeted panel, the target rows and the health bar SHALL show effective
values. A value that differs from its stored value because of effects or manual bonuses SHALL
be marked. Its tooltip SHALL list each effect or manual bonus that changed it and how
("Grappled: set to 0", "Exhaustion: −15", "Ring of Protection: +1"), and any sub-effect listed
as not applied. Quick edits SHALL keep showing and editing the stored base values. The player
live view SHALL show stored values plus manual bonuses, without effects.

#### Scenario: Marked AC
- **WHEN** a player with AC 16 has Shield of Faith (+2 AC) and the DM opens its card
- **THEN** the card shows AC 18, marked, with a tooltip "Shield of Faith: +2"

#### Scenario: Quick edit
- **WHEN** the DM opens the AC quick edit of that player
- **THEN** it shows the stored AC 16

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
new effective maximum, and be saved. A transformed entity's transformed hit point pool SHALL
NOT follow `max_hp` sub-effects.

#### Scenario: Exhaustion halves the maximum
- **WHEN** a player at 40/40 HP reaches 5e Exhaustion level 4
- **THEN** its effective maximum is 20 and its current HP is set to 20

#### Scenario: Healing stops at the effective maximum
- **WHEN** that player at 10/20 is healed for 15
- **THEN** its HP becomes 20

#### Scenario: Aid
- **WHEN** Aid (a `bonus` `max_hp` of 5 with `also_heal`) is applied to a player at 12/30
- **THEN** its effective maximum is 35 and its HP 17

#### Scenario: Maximum restored
- **WHEN** an effect that lowered the maximum ends
- **THEN** the maximum is back and current HP stays as it is

### Requirement: Temporary hit points are granted from a prompt

A `fixed` sub-effect with `temp_hp` SHALL grant temporary hit points through a **Grant temp
HP** button:
- with a `trigger`: on the prompt of that trigger, next to the other buttons
- without a `trigger`: on a prompt shown when the effect is applied

The amount is the sub-effect's `roll` (rolled, the roll is shown) or its `value` (number,
formula, level scaling), as for damage in effects-damage-healing, for the holder. Granting
SHALL set the holder's temporary hit points to the higher of its current temporary hit points
and the amount, and save them. Nothing SHALL be granted without the DM choosing the button.

#### Scenario: False Life
- **WHEN** an effect with `{ type: "fixed", sub_types: ["temp_hp"], roll: { dice_count: 1, dice_type: 4, fixed_val: 4 } }` is applied to a player with 0 temporary HP
- **THEN** a prompt with Grant temp HP is shown, and choosing it rolls 1d4+4 and sets the player's temporary HP to the result

#### Scenario: Keep the higher
- **WHEN** a creature with 8 temporary HP is granted 5
- **THEN** it keeps 8

#### Scenario: Heroism each turn
- **WHEN** a creature's effect has a `fixed` `temp_hp` sub-effect with `trigger: "start_turn_target"` and `value: { formula: "caster.cha_mod" }`, and its turn starts
- **THEN** the trigger prompt offers Grant temp HP for the caster's Charisma modifier

### Requirement: Manual bonuses are labelled lists

The DM's manual bonuses SHALL be stored per entity as `bonuses`, keyed by value and then by a
bonus id: `bonuses.<value>.<id> = { value, label }`. The values are `ac`, `speed`,
`fly_speed`, `swim_speed`, `climb_speed`, `burrow_speed`, `max_hp`, `initiative`,
`passive_perception`, `spell_save_dc`, `spell_attack`, `strength`, `dexterity`,
`constitution`, `intelligence`, `wisdom` and `charisma`. `value` SHALL be a whole number from
−9999 to 9999, and `label` a non-empty text of at most 50 characters. Players' and companions'
bonuses SHALL be saved on the campaign, and NPCs' on the encounter, like their hit points. The
database rules SHALL accept this shape and nothing else under `bonuses`. The manual bonus with
id `manual` SHALL be the entry labelled "Manual" that single-value inputs edit. The
transformed hit point pool's own maximum hit point modifier SHALL stay a single number.

#### Scenario: Two AC bonuses
- **WHEN** the DM gives a player an AC bonus of 1 labelled "Ring of Protection" and one of 2 labelled "Cover"
- **THEN** the campaign stores `bonuses.ac` with two entries, `{ value: 1, label: "Ring of Protection" }` and `{ value: 2, label: "Cover" }`

#### Scenario: Invalid bonus
- **WHEN** a client writes a bonus without a label, or under an unknown value such as `bonuses.luck`
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
value when clicked. The drawer SHALL show:
- the stored value
- every effect modifier for it, read-only, named after its effect, with a link to the effect's
  details, including modifiers listed as not applied
- every manual bonus, whose value and label can be edited and which can be removed
- a form to add a manual bonus (value and label, label "Manual" by default)
- the effective value

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

Outside the DM's tracker, manual bonuses SHALL be totalled per value, without effects:
- the campaign overview SHALL show AC and maximum hit points with their manual bonuses, and
  its rest dialog SHALL offer one "Manual bonuses" reset that removes `bonuses`, `ac_bonus`
  and `maxHpMod`
- the player live view SHALL show AC and maximum hit points with their manual bonuses
- the party health drawer's maximum HP field and the player edit drawer's AC bonus and maximum
  HP fields SHALL set the "Manual" bonus, keeping other manual bonuses
- resetting an encounter SHALL remove its NPCs' `bonuses`, `ac_bonus` and `maxHpMod`
- exports SHALL leave out `bonuses`

#### Scenario: Campaign overview
- **WHEN** a player with AC 15 has manual AC bonuses of 1 and 2
- **THEN** the campaign overview shows AC 18 with a tooltip listing both

#### Scenario: Player edit drawer
- **WHEN** a player has manual AC bonuses "Manual" +1 and "Cover" +2, and the DM sets AC bonus 3 in the player edit drawer
- **THEN** the "Manual" bonus becomes +3 and "Cover" stays +2
