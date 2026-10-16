# effects-roll-modifiers Specification

## Purpose

How active effects and the DM's manual roll bonuses change d20 rolls in the DM's combat
tracker for ability checks, skills, saving throws, initiative and attacks: Advantage and
Disadvantage, flat and dice bonuses, automatic results, single-use modifiers, critical hits,
damage bonuses on hits, and reminders for modifiers the tracker can't check.

## Requirements

### Requirement: Roll modifiers are collected per roll

For a d20 roll by an entity in the DM's tracker, the tracker SHALL collect the modifiers of
the entity's active effects and manual bonuses that apply to that roll. The roll kinds and
the sub-types that apply to them are:
- **ability check** of an ability: `ability`, `d20_test`
- **skill check**: `skill` (with the skill in `skills`, or no `skills`), plus everything
  for an ability check of the skill's ability
- **saving throw** of an ability: `save`, `d20_test`
- **initiative**: `initiative`, plus everything for a Dexterity check
- **Concentration save**: `concentration_save`, plus everything for a saving throw of the
  save's ability (Constitution)

A sub-effect with `abilities` SHALL apply only to rolls of those abilities. A sub-effect with
`perspective: "against"`, or the legacy `grant_advantage` / `grant_disadvantage`, SHALL NOT
apply to the holder's own rolls. Level limits (`min_level`, `max_level`), `choice`, unresolved
definitions, and the same definition on one entity twice SHALL be handled as for numeric
modifiers (effects-stat-modifiers).

#### Scenario: Poisoned ability check
- **WHEN** a Poisoned creature makes a Wisdom check from its card
- **THEN** the check has Disadvantage from Poisoned

#### Scenario: Skill inherits its ability
- **WHEN** a Poisoned creature rolls Perception
- **THEN** the roll has Disadvantage, because Perception is a Wisdom check

#### Scenario: Ability filter
- **WHEN** a Restrained creature rolls a Strength save
- **THEN** Restrained's Disadvantage on Dexterity saves doesn't apply

#### Scenario: Against-modifiers don't apply to own rolls
- **WHEN** a Blinded creature rolls a save
- **THEN** Blinded's "attack rolls against it have Advantage" doesn't change the roll

### Requirement: Advantage and Disadvantage change the roll

When at least one collected modifier gives Advantage and none gives Disadvantage, the roll
SHALL be made with Advantage, and the other way around for Disadvantage. When both are
present, they SHALL cancel and the roll is made normally. The DM's own Advantage or
Disadvantage (Shift, Ctrl, or the hold menu) SHALL count as one more source in the same
rule. The roll's result SHALL name the effects that gave Advantage or Disadvantage. A roll
button whose roll has Advantage or Disadvantage from effects SHALL show it, as it does for
the DM's own choice.

#### Scenario: Haste
- **WHEN** a hasted creature rolls a Dexterity save
- **THEN** the save is rolled with Advantage, and the result names Haste

#### Scenario: Cancel
- **WHEN** a hasted and Restrained creature rolls a Dexterity save
- **THEN** Advantage and Disadvantage cancel and one d20 is rolled

#### Scenario: DM disadvantage cancels effect advantage
- **WHEN** the DM Ctrl-clicks the Dexterity save of a hasted creature
- **THEN** one d20 is rolled

### Requirement: Flat and dice bonuses are added

Every collected `bonus` modifier SHALL add to the roll:
- a number or formula `value` (evaluated as in effects-damage-healing, for the roller, with
  the instance's level as `level`), as a flat bonus
- a `roll` as bonus dice, whose sign follows a negative `fixed_val` or a negative
  `multiplier` (Bane −1d4)

Manual roll bonuses SHALL add as flat bonuses. The flat bonuses SHALL be part of the roll's
modifier. The bonus dice SHALL be rolled with it, and their results added to the total. The
roll's result SHALL show each bonus die with its effect ("Bless +1d4: 3"). Modifiers whose
formula can't be evaluated SHALL be left out and named in the result.

#### Scenario: Slow
- **WHEN** a slowed creature with a +2 Dexterity save rolls a Dexterity save
- **THEN** the modifier is +0, and the result names "Slow −2"

#### Scenario: 2024 Exhaustion
- **WHEN** a creature with 5.5e Exhaustion level 2 (`bonus` on `d20_test` with `value: { formula: "-2 * level" }`) makes any check, save or initiative roll
- **THEN** the roll's modifier is 4 lower

#### Scenario: Bless
- **WHEN** a blessed creature (a `bonus` on `save` with `roll: { dice_count: 1, dice_type: 4 }`) rolls a save with modifier +3 and rolls 12 on the d20 and 2 on the d4
- **THEN** the total is 17, and the result shows "Bless +1d4: 2"

### Requirement: Automatic failure and success skip the roll

When a collected modifier is `auto_fail` and none is `auto_success`, the roll SHALL NOT be
made, and the result SHALL say it failed automatically and which effect caused it. The same
goes for `auto_success`. When both are present, `auto_fail` SHALL win. For a save against a
DC (roll-dialog target saves, repeat saves), an automatic result SHALL resolve the save as
failed or succeeded.

#### Scenario: Paralyzed Strength save from the card
- **WHEN** the DM rolls a Paralyzed creature's Strength save from its card
- **THEN** no dice are rolled and a result "Strength save: fails automatically (Paralyzed)" is shown

#### Scenario: Target save in the roll dialog
- **WHEN** the DM rolls the Dexterity save of a Stunned target in the roll dialog
- **THEN** the save is marked as failed without a roll, with "Stunned" as the reason

#### Scenario: Repeat save
- **WHEN** a Paralyzed creature's repeat save is a Dexterity save and the DM chooses Roll
- **THEN** it is resolved as a failure, without a roll

### Requirement: Modifiers the tracker can't check are reminders

A collected modifier SHALL NOT change the roll when it depends on something the tracker can't
check. That is the case when:
- it has a `context` (sight, hearing, social…)
- its `condition`, or its definition's `condition`, can't be evaluated. Examples: a distance
  other than the assumed attack distances, line of sight, or the other party outside an
  attack. A condition that evaluates false leaves the modifier out silently.
- it has a `source` filter and the roll's source is unknown
- it has an `attack_types` filter that can't be decided for the attack

Its description, or its effect and kind ("Frightened: Disadvantage"), SHALL be listed with
the roll's result as a reminder. A `source` filter with `magical` SHALL count as checkable for
target saves in the roll dialog against a spell (magical) and for spell attacks. Repeat saves
of an effect have an unknown source: effect definitions don't say whether they are magical
(that comes with links to spells, steps 6–7). In an attack the other party is known
(effects-roll-modifiers "The other party is checked in attacks").

#### Scenario: Frightened
- **WHEN** a Frightened creature makes an ability check
- **THEN** the check is rolled normally, and the result lists "Frightened: Disadvantage while the source of its fear is within line of sight"

#### Scenario: Robe against a spell
- **WHEN** a creature with Robe of the Archmagi makes a target save in the roll dialog against a spell
- **THEN** the save is rolled with Advantage

#### Scenario: Robe against an unknown source
- **WHEN** that creature rolls a save from its card, or a repeat save of an effect
- **THEN** the save is rolled normally, with the reminder "Robe of the Archmagi: Advantage on saving throws against spells and other magical effects"

#### Scenario: Dodge
- **WHEN** a goblin attacks a creature that took the Dodge action
- **THEN** the to-hit is rolled normally, with the reminder that attacks against it have Disadvantage if it can see the attacker

### Requirement: Single-use modifiers end their effect

When a modifier with `consume: { on: "roll" }` (uses 1, the default) changed a roll, its
instance SHALL end after that roll, announced as "used". Scope `"effect"` is the default. A
`consume` with another `on`, more than one use, or scope `"sub_effect"` SHALL NOT be enforced:
the modifier applies, and the result reminds the DM that it may be used up.

#### Scenario: Next check
- **WHEN** a creature with an effect `{ type: "bonus", sub_types: ["ability"], roll: { dice_count: 1, dice_type: 4 }, consume: { on: "roll" } }` makes an ability check
- **THEN** the d4 is added, and the effect ends with the notice "used"

### Requirement: The tracker's d20 roll sites use roll modifiers

These rolls SHALL use the roll modifiers:
- **Card**: the ability MOD (check) and SAVE, and the skill rolls
- **Targeted panel**: MOD (check) and SAVE
- **Roll dialog**: target saves
- **Effect prompts**: repeat saves and escape attempts (a skill check, or an ability check)
- **NPC initiative**: single NPC rolls

The modifier these sites show SHALL include the flat bonuses. When effects or manual bonuses
change it, it SHALL be marked like 3b's values, with a tooltip listing the flat bonuses, the
bonus dice, Advantage and Disadvantage, automatic results and reminders. Group initiative SHALL
keep its current behaviour (lowest effective Dexterity, no roll modifiers). Players' initiative
is entered by the players, so it isn't affected.

#### Scenario: Card shows the modified save
- **WHEN** a creature with a +2 Dexterity save is slowed
- **THEN** its card shows SAVE +0 for Dexterity, marked, with the tooltip "Slow: −2"

#### Scenario: Roll-dialog save uses the total
- **WHEN** a target with a +5 Dexterity save rolls 9 on the d20 against DC 13 in the roll dialog
- **THEN** the dialog shows 14 and marks the save as a success. Before 3c1, the dice alone (9) were compared, so it showed a failure.

#### Scenario: Invisible initiative
- **WHEN** the DM rolls initiative for a 5.5e Invisible NPC
- **THEN** the roll has Advantage, naming Invisible

### Requirement: Manual roll bonuses

The DM SHALL be able to give an entity labelled manual roll bonuses, stored like the manual
bonuses of effects-stat-modifiers, under these keys:
- `skill_<skill>`: one per skill, the skill name in lower case with spaces as underscores
  (`skill_animal_handling`, `skill_sleight_of_hand`)
- `check_<ability>` and `check_all`: ability checks of that ability, or all of them
- `save_<ability>` and `save_all`: saving throws of that ability, or all of them
- `death_save` and `concentration_save`
- `attack`: the to-hit of all its attacks
- `damage`: the damage of all its attack hits

They SHALL apply as flat bonuses to the matching rolls:
- skill checks get their skill's bonuses and their ability's check bonuses
- initiative gets the Dexterity check bonuses
- Concentration saves get the `concentration_save` bonuses and the Constitution save bonuses
- attacks get the `attack` bonuses on the to-hit, and the `damage` bonuses on the first
  damage of a hit

Death save bonuses SHALL only be shown in the bonuses drawer until the tracker rolls death
saves.

#### Scenario: Cloak of Protection
- **WHEN** the DM gives a player a `save_all` bonus +1 labelled "Cloak of Protection"
- **THEN** every save of that player is 1 higher, and the tooltip lists "Cloak of Protection: +1"

#### Scenario: Skill and check bonuses together
- **WHEN** a creature has a `skill_stealth` bonus +2 and a `check_dexterity` bonus +1
- **THEN** its Stealth check is 3 higher, and its Acrobatics check 1 higher

#### Scenario: Attack and damage bonuses
- **WHEN** an NPC has an `attack` bonus +1 and a `damage` bonus +2 labelled "+1 Longsword (manual)", and hits with a 1d8+3 attack
- **THEN** its to-hit is 1 higher, the hit deals 1d8+3 plus 2 of the same damage type, and the result names the bonus

### Requirement: Concentration saves are rolled from the damage prompt

When `damage_taken` fires for a creature whose effect has an `outcome` sub-effect with
`break_concentration`, a `save` and that trigger (Concentration), the tracker SHALL show a
**Concentration save** prompt instead of the plain trigger line for that sub-effect:
- **The DC** is the save's `dc` evaluated with `damage_taken` as the damage of the event,
  including `min`, `max` and rounding. In 5.5e that is 10 or half the damage, at most 30;
  in 5e it has no maximum. The prompt's text SHALL be "Took <damage> damage." and
  "<Ability> saving throw, DC <dc>.". When the damage isn't known, the prompt names the rule
  instead of a number.
- **Buttons**: Roll, Succeeded and Failed.
  - **Roll** rolls the save with the roll modifiers of a **Concentration save**: everything
    for a save of the sub-effect's ability (Constitution), plus `concentration_save`
    sub-effects and the `concentration_save` manual bonuses.
  - An automatic result resolves the save without a roll.
  - With a DC, the total resolves it. Without a DC, the roll is only shown and the DM
    chooses Succeeded or Failed.
- **Failure** ends the Concentration instance, announced as "failed its Concentration save".
  Its linked effects end through the existing cascade. **Success** keeps it.

Each damage event SHALL give its own prompt. Other sub-effects of the same trigger SHALL keep
their normal trigger prompt.

#### Scenario: 5.5e Concentration after 23 damage
- **WHEN** a player concentrating in a 5.5e campaign takes 23 damage
- **THEN** a prompt "Lyra: Concentration save DC 11" says "Took 23 damage." and "Constitution saving throw, DC 11.", with Roll, Succeeded and Failed

#### Scenario: Minimum and maximum DC
- **WHEN** the damage is 7 in 5.5e, or 70 in 5.5e, or 70 in 5e
- **THEN** the DC is 10, 30 and 35

#### Scenario: Modifiers on the save
- **WHEN** a blessed player with a +2 Constitution save, a `concentration_save` manual bonus +1 labelled "War Caster (manual)", and 5.5e Exhaustion level 1 rolls the Concentration save
- **THEN** the roll is d20 + 2 + 1 − 2 + 1d4, and the result names Bless, the manual bonus and Exhaustion

#### Scenario: Failed save ends linked effects
- **WHEN** the save fails and the player's Concentration has a Hex linked to it on an NPC
- **THEN** Concentration ends with the notice "failed its Concentration save", and the Hex ends with it

#### Scenario: Unknown damage
- **WHEN** `damage_taken` fires without a damage amount
- **THEN** the prompt names the DC rule instead of a number, and Roll only shows the roll

### Requirement: Attack rolls use the attacker's and the target's modifiers

When the tracker rolls the to-hit of an attack action against a target, it SHALL use roll
modifiers from both parties, as for other rolls (Advantage and Disadvantage, flat and dice
bonuses, single-use modifiers, reminders). An attack action is a monster action or a spell
with type `melee_weapon`, `ranged_weapon` or `spell_attack`. The modifiers come from:
- **the attacker:** its effects' sub-effects on `attack` or `d20_test` (not `against`), and
  its manual `attack` bonuses
- **the target:** its effects' sub-effects on `attack` with `perspective: "against"` (or the
  legacy `grant_advantage` / `grant_disadvantage`)

A sub-effect with `attack_types` SHALL apply only when the attack is of one of them:
- `melee_weapon` is `melee`, `weapon` and `melee_weapon`
- `ranged_weapon` is `ranged`, `weapon` and `ranged_weapon`
- `spell_attack` is `spell`

Other attack types (`melee_spell`, `ranged_spell`, `unarmed`, `thrown`, `opportunity`) can't
be decided and SHALL make the sub-effect a reminder. A spell's attack is magical, as for
saves. An area attack, rolled once for all targets, SHALL use only the attacker's
modifiers. Each attack of a multiattack is a roll of its own, so a single-use modifier is
used by the first one.

The to-hit's result SHALL name the effects that gave Advantage or Disadvantage, each flat and
dice bonus, and the reminders. The DM's own Advantage or Disadvantage counts as one more
source, as for other rolls. Players' attacks, entered as manual damage, aren't rolled and
aren't affected.

#### Scenario: Poisoned attacker
- **WHEN** a Poisoned goblin attacks a player with its Scimitar
- **THEN** the to-hit is rolled with Disadvantage, and the result names Poisoned

#### Scenario: Blinded target
- **WHEN** a goblin attacks a Blinded player
- **THEN** the to-hit is rolled with Advantage, naming Blinded

#### Scenario: Both sides cancel
- **WHEN** a Poisoned goblin attacks a Restrained player
- **THEN** Advantage and Disadvantage cancel and one d20 is rolled

#### Scenario: Bless on an attack
- **WHEN** a blessed creature with +4 to hit rolls 11 on the d20 and 3 on the d4
- **THEN** the to-hit total is 18, and the result shows "Bless +1d4: 3"

#### Scenario: Guiding Bolt is used by the next attack
- **WHEN** a target has Guiding Bolt (Advantage on the next attack against it, used up) and an ogre attacks it twice with a multiattack
- **THEN** the first to-hit has Advantage, Guiding Bolt ends with the notice "used", and the second to-hit is rolled normally

#### Scenario: Weapon-only modifier on a spell attack
- **WHEN** a creature with Magic Weapon (+1 to hit with weapon attacks) makes a spell attack
- **THEN** the +1 isn't added

### Requirement: The other party is checked in attacks

In an attack, the other party is known: for the attacker's modifiers it is the target, and
for the target's "against" modifiers it is the attacker. A `condition` with
`subject: "counterpart"` SHALL be evaluated when its type is one the tracker can check for
an entity:
- `has_condition`, `has_effect`, `bloodied`, `hp_zero`, `temp_hp_zero`, `hp_threshold`
- `is_caster`: whether the other party is the instance's caster
- `distance`, as in "Distance is assumed from the attack type"

Other types (sight, line of sight) stay unknown, so their modifiers are reminders.

#### Scenario: 5.5e Grappled against the grappler
- **WHEN** a goblin Grappled by `npc_2` (caster) attacks `npc_2`
- **THEN** Grappled's Disadvantage ("against any target other than the grappler") doesn't apply

#### Scenario: 5.5e Grappled against another target
- **WHEN** that goblin attacks `player_1`
- **THEN** the to-hit has Disadvantage from Grappled

#### Scenario: Sight stays a reminder
- **WHEN** a 5.5e Invisible creature attacks
- **THEN** its Advantage ("if the other party can't see it") is listed as a reminder, and the to-hit is rolled normally

### Requirement: Distance is assumed from the attack type

The tracker doesn't know distances. In an attack it SHALL assume:
- a `melee_weapon` attack is made within 5 feet
- a `ranged_weapon` attack is made from more than 5 feet

A `distance` condition on the other party SHALL be evaluated with that assumption when its
comparison is to 5 feet (`lte`/`lt` 5 or `gt`/`gte` 5). Other distances, and spell attacks,
SHALL stay unknown. When an assumption decided a modifier, the result SHALL note it ("melee:
assumed within 5 ft").

#### Scenario: Prone and melee
- **WHEN** a goblin makes a melee attack against a Prone player
- **THEN** the to-hit has Advantage from Prone, and the result notes the assumed distance

#### Scenario: Prone and ranged
- **WHEN** a goblin makes a ranged attack against a Prone player
- **THEN** the to-hit has Disadvantage from Prone

#### Scenario: Spell attack and Prone
- **WHEN** a mage makes a spell attack against a Prone player
- **THEN** both of Prone's attack modifiers are reminders

### Requirement: Critical hits from effects

The tracker SHALL determine critical hits from effects:
- **The attacker's crit range:** a `critical` sub-effect on `crit_range` with `crit_range`
  lowers the natural roll that is a critical hit, for attacks it applies to. The lowest one
  counts. A natural roll at or above it is a critical hit, and a critical hit hits.
- **Incoming critical hits:** a `critical` sub-effect on `incoming_crit_range` of the target
  (Paralyzed, Unconscious, within 5 feet) makes a hit against it a critical hit. Its
  condition is checked as for other modifiers, with the assumed distance.

The attack's damage SHALL be rolled as a critical hit when either applies, following the
DM's Critical Hits setting of the run encounter settings, as for a natural 20:
- **Roll:** the damage dice are rolled twice
- **Double:** the rolled damage is doubled
- **Max + Roll:** the dice's maximum is added
- **Disabled:** no extra damage

With an incoming critical hit, the to-hit must still hit the target's AC. The roll dialog
SHALL show the hit as critical, and fire the critical-hit triggers, for these critical hits as
for a natural 20, naming the effect.

#### Scenario: Paralyzed target, melee
- **WHEN** a goblin hits a Paralyzed player with a melee attack, rolling 14 to hit against AC 12
- **THEN** the hit is critical (Paralyzed), its damage follows the Critical Hits setting, and `on_crit` fires

#### Scenario: Critical Hits setting
- **WHEN** the Critical Hits setting is Max + Roll and a 1d6+2 melee attack hits a Paralyzed player, rolling 3 on the d6
- **THEN** the damage is 3 + 6 + 2 = 11

#### Scenario: Paralyzed target, ranged
- **WHEN** a goblin hits that player with a ranged attack
- **THEN** the hit isn't critical

#### Scenario: Incoming critical, missed
- **WHEN** a melee attack against a Paralyzed player rolls 5 to hit against AC 12
- **THEN** it misses, and no damage is applied

#### Scenario: Improved Critical
- **WHEN** a creature with a `critical` sub-effect `{ sub_types: ["crit_range"], crit_range: 19, attack_types: ["weapon"] }` rolls a natural 19 on a weapon attack
- **THEN** it is a critical hit, and it hits

### Requirement: Damage bonuses are added to hits

The attacker's `bonus` sub-effects on `damage` SHALL add to the damage of its attack actions,
for attacks they apply to (`attack_types`). They are rolled with the attack:
- **With a damage type** (the roll's `damage_type`, or the instance's chosen damage type),
  the bonus is a separate damage roll of that type, so defenses apply per type. Divine
  Favor's 1d4 radiant is an example.
- **Without a damage type**, its dice and value are damage of the attack's first damage type.
  Magic Weapon's +1 is an example.

The target's effects SHALL add damage the same way when the target takes extra damage from
being hit by this attacker: a `damage` sub-effect with `trigger: "on_hit_taken"` that damages
the target itself (no `target`, or `self`), whose `trigger_filter.by` is `caster` with the
attacker as the instance's caster, or `any`, `counterpart` or none, and whose filter's
`attack_types` (if any) include the attack. Hex's 1d6 necrotic and Hunter's Mark's 1d6 are
examples. A sub-effect with a `save`, a `frequency`, a `condition` that can't be checked, or
another filter field (`natural_roll`, `damage_types`, `min_amount`, `within`, `source`, or
`by` an ally or enemy) is not rolled with the attack; it stays a prompt.

The manual `damage` bonuses of the attacker SHALL add as flat damage of the first damage
type. On a critical hit, damage bonus dice SHALL follow the Critical Hits setting like the
attack's own dice. The bonuses count only for a hit: a miss that deals damage (half damage on
a miss) gets no damage bonuses. The roll dialog SHALL show each bonus with its effect.

#### Scenario: Divine Favor
- **WHEN** a creature with Divine Favor hits with a weapon attack dealing 1d8+3 slashing
- **THEN** the hit deals 1d8+3 slashing and a separate 1d4 radiant, shown as "Divine Favor"

#### Scenario: Magic Weapon
- **WHEN** a creature with Magic Weapon hits with a weapon attack dealing 1d8+3 slashing
- **THEN** its to-hit is 1 higher, and the hit deals 1d8+3 slashing plus 1 slashing shown as "Magic Weapon"

#### Scenario: Critical with Divine Favor
- **WHEN** that Divine Favor hit is a critical hit
- **THEN** both the 1d8 and the 1d4 are handled by the Critical Hits setting: rolled twice with Roll, and no extra with Disabled

#### Scenario: Not for saves
- **WHEN** a creature with Divine Favor casts a spell that calls for a saving throw
- **THEN** no radiant damage is added

#### Scenario: Hex
- **WHEN** a warlock concentrating on Hex hits the hexed goblin with an Eldritch Blast dealing 1d10 force
- **THEN** the hit deals 1d10 force and a separate 1d6 necrotic, shown as "Hex"

#### Scenario: Someone else hits the hexed target
- **WHEN** a fighter who isn't Hex's caster hits the hexed goblin
- **THEN** no necrotic damage is added

#### Scenario: Hunter's Mark (5e) without a damage type
- **WHEN** the ranger who cast the 5e Hunter's Mark hits the marked creature with a weapon attack dealing 1d8+3 piercing
- **THEN** the hit deals 1d8+3 piercing and a separate 1d6 piercing, shown as "Hunter's Mark"

#### Scenario: Hunter's Mark (5e) with a spell attack
- **WHEN** that ranger hits the marked creature with a spell attack
- **THEN** no damage from Hunter's Mark is added

#### Scenario: Missing the hexed target
- **WHEN** the warlock misses the hexed goblin
- **THEN** no necrotic damage is rolled for the miss

#### Scenario: Damage to the attacker stays a prompt
- **WHEN** a creature with an effect that deals 2d8 fire to a creature that hits it in melee (`target: "trigger_source"`) is hit
- **THEN** the attack's damage has no fire roll from it, and its prompt is shown after the roll is applied

### Requirement: The actor's attack modifiers are shown in the details bar

For every actor, player or NPC, the actor panel's details bar SHALL show, after its name,
what its effects do to its attacks, as compact reminders on one line. A player's attacks
aren't rolled in the tracker, so this is how the DM knows them. For NPCs it previews what
their rolls apply. The actor's Reaction Used tag (effects-reaction-used) SHALL always come
first, in red, followed by its restrictions (effects-restrictions). Then its extra actions
(`grant_action`): one chip per kind ("Extra action", "Extra attack", "Extra bonus action",
"Extra reaction", "Bonus action option", "Extra turn"). The tooltip names the effect, its
description and the allowed actions. Then:
- **Advantage or Disadvantage**, as a green A or a red D with their sources (both when they
  cancel)
- **To-hit bonuses**: flat and dice, from effects and manual `attack` bonuses
- **Critical hits**: its crit range, and hits that are critical against the target
- **Damage bonuses** on hits, including the extra damage the targeted creature takes when this
  actor hits it (its hit-taken damage, see "Damage bonuses are added to hits"), named after
  the effect and the target ("Hex: +1d6 necrotic (against Goblin)")
- **The number of reminders**: what the tracker can't check, single-use modifiers, and the
  actor's effects the tracker only reminds of. These are `compel`, `deny`,
  `forced_movement`, `sense`, `proficiency`, `score_swap`, restrictions with `limit` or
  `exclusive`, and damage modifiers that aren't applied (effects-damage-modifiers). They also
  include the hit-taken damage of other creatures that this actor cast ("Hex on Goblin: +1d6
  necrotic when you hit it"), so the DM is reminded while that creature isn't targeted.

Each reminder SHALL list its sources in a tooltip, with filters such as "(weapon)". When
exactly one other creature is targeted, that target's "attacks against it" modifiers are
included and named. Melee or ranged isn't known, so distance-based modifiers stay
reminders. Nothing SHALL be shown when it hasn't used its reaction, has no restrictions, no
extra actions and no reminders, and no effect or manual bonus changes its attacks. What
doesn't fit on the line is cut off.

#### Scenario: Blessed player against a Blinded target
- **WHEN** it is a blessed player's turn and a Blinded goblin is the only target
- **THEN** the details bar shows a green A (Blinded, against the goblin) and "To hit +1d4" (Bless)

#### Scenario: NPC with Reaction Used
- **WHEN** a poisoned goblin with Reaction Used is the actor
- **THEN** the details bar shows the red Reaction Used tag first, then a red D (Poisoned)

#### Scenario: Restrictions come after Reaction Used
- **WHEN** a Stunned goblin with Reaction Used is the actor
- **THEN** the details bar shows Reaction Used, then its restriction chips, then the attack reminders

#### Scenario: Hasted creature
- **WHEN** a creature with Haste is the actor
- **THEN** the details bar shows "Extra action", with Haste and its allowed actions in the tooltip

#### Scenario: Effect reminders
- **WHEN** an actor has an effect with a `compel` sub-effect
- **THEN** the reminders chip counts it, and its tooltip names the effect and its description

#### Scenario: No target
- **WHEN** no creature is targeted
- **THEN** only the player's own modifiers are shown, with the hit-taken damage of creatures it cast effects on as reminders

#### Scenario: Nothing to show
- **WHEN** a player without attack modifiers or restrictions has the turn
- **THEN** no reminders are shown

#### Scenario: Hexed target
- **WHEN** the warlock concentrating on Hex has the turn and the hexed goblin is the only target
- **THEN** the Damage chip shows "+1d6 necrotic", with "Hex: +1d6 necrotic (against Goblin)" in its tooltip

#### Scenario: Hexed creature not targeted
- **WHEN** the warlock has the turn and the hexed goblin isn't targeted
- **THEN** the reminders chip counts "Hex on Goblin: +1d6 necrotic when you hit it"

### Requirement: Roll floors raise the die or the total

A `roll_floor` sub-effect SHALL be collected like other roll modifiers: the same sub-types,
filters, conditions, level limits and choices, so a condition that can't be checked makes it
a reminder. Its `value` is a number or a formula over the holder's values. When it applies
to a d20 roll:
- `applies_to: "die"` (the default): a kept d20 lower than the value counts as the value
- `applies_to: "total"`: a total lower than the value becomes the value

With several floors, the highest SHALL count. The roll result SHALL name the effect and the
change ("Reliable Talent: 7 → 10"). The floor is applied after Advantage or Disadvantage
picks the die, and before bonuses are added. A natural 1 or 20 SHALL keep counting as the
natural die that was rolled. A value on the card or in the targeted panel that has a floor
SHALL be marked as changed by effects, with the floor in its tooltip.

#### Scenario: Reliable Talent
- **WHEN** a creature with Reliable Talent rolls a Stealth check and the die shows 7
- **THEN** the die counts as 10, and the result names Reliable Talent

#### Scenario: High roll unchanged
- **WHEN** that creature's die shows 14
- **THEN** the roll is unchanged and the floor isn't named

#### Scenario: Marked on the card
- **WHEN** the card of a creature with Reliable Talent is shown
- **THEN** its skill modifiers are marked as changed, and the tooltip says "Reliable Talent: die at least 10"

#### Scenario: Not for other rolls
- **WHEN** that creature rolls a saving throw
- **THEN** Reliable Talent doesn't change it

### Requirement: Rerolls are offered, not applied

A `reroll` sub-effect SHALL be collected like other roll modifiers. When it applies to a d20
roll, the tracker SHALL offer it and never reroll by itself:
- **Its condition:** a `reroll_condition` of "natural 1" (also "1" or "a 1") is only offered
  when the kept die shows a 1. Any other condition is offered with its text ("Indomitable:
  failed save").
- **Checks and saves rolled from the card or the targeted panel:** the result notification
  SHALL have a **Reroll (<effect>)** button. It rolls the d20 again with the same modifiers,
  plus `reroll_bonus`, and with Advantage when `with_advantage` is set. It keeps the new
  roll, the higher or the lower one, as `keep` says (new by default), and shows the result.
- **Rolls in the roll dialog (attacks, target saves):** the roll SHALL show a note naming the
  effect and its condition. The dialog doesn't reroll the to-hit itself: a new d20 could
  change a critical hit, and the damage is already rolled. The DM rerolls by hand (a target
  save can be rolled again).

A reroll with `consume` is used up when the Reroll button is used.

#### Scenario: Luck on a natural 1
- **WHEN** a halfling with Luck rolls a Dexterity save from its card and the die shows a 1
- **THEN** the result has a Reroll (Luck) button, and the new roll is the one kept

#### Scenario: Not offered without a 1
- **WHEN** that halfling's die shows a 2
- **THEN** no reroll is offered

#### Scenario: Attack in the roll dialog
- **WHEN** a halfling NPC with Luck rolls a natural 1 on an attack
- **THEN** the to-hit shows a note "Luck: reroll the 1"
