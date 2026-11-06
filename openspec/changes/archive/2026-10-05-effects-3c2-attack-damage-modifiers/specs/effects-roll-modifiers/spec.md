## ADDED Requirements

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

### Requirement: The actor's attack modifiers are shown in the details bar

For every actor, player or NPC, the actor panel's details bar SHALL show, after its name,
what its effects do to its attacks, as compact reminders on one line. A player's attacks
aren't rolled in the tracker, so this is how the DM knows them. For NPCs it previews what
their rolls apply. The actor's Reaction Used tag (effects-reaction-used) SHALL always come
first, in red. Then:
- **Advantage or Disadvantage**, as a green A or a red D with their sources (both when they
  cancel)
- **To-hit bonuses**: flat and dice, from effects and manual `attack` bonuses
- **Critical hits**: its crit range, and hits that are critical against the target
- **Damage bonuses** on hits
- **The number of reminders**: what the tracker can't check, and single-use modifiers

Each reminder SHALL list its sources in a tooltip, with filters such as "(weapon)". When
exactly one other creature is targeted, that target's "attacks against it" modifiers are
included and named. Melee or ranged isn't known, so distance-based modifiers stay
reminders. Nothing SHALL be shown when it hasn't used its reaction and no effect or manual
bonus changes its attacks. What doesn't fit on the line is cut off.

#### Scenario: Blessed player against a Blinded target
- **WHEN** it is a blessed player's turn and a Blinded goblin is the only target
- **THEN** the details bar shows a green A (Blinded, against the goblin) and "To hit +1d4" (Bless)

#### Scenario: NPC with Reaction Used
- **WHEN** a poisoned goblin with Reaction Used is the actor
- **THEN** the details bar shows the red Reaction Used tag first, then a red D (Poisoned)

#### Scenario: No target
- **WHEN** no creature is targeted
- **THEN** only the player's own modifiers are shown

#### Scenario: Nothing to show
- **WHEN** a player without attack modifiers has the turn
- **THEN** no reminders are shown

## MODIFIED Requirements

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
target saves in the roll dialog against a spell (magical), for repeat saves of an effect
whose definition is `magical`, and for spell attacks. In an attack the other party is known
(effects-roll-modifiers "The other party is checked in attacks").

#### Scenario: Frightened
- **WHEN** a Frightened creature makes an ability check
- **THEN** the check is rolled normally, and the result lists "Frightened: Disadvantage while the source of its fear is within line of sight"

#### Scenario: Robe against a spell
- **WHEN** a creature with Robe of the Archmagi makes a target save in the roll dialog against a spell
- **THEN** the save is rolled with Advantage

#### Scenario: Robe against an unknown source
- **WHEN** that creature rolls a save from its card
- **THEN** the save is rolled normally, with the reminder "Robe of the Archmagi: Advantage on saving throws against spells and other magical effects"

#### Scenario: Dodge
- **WHEN** a goblin attacks a creature that took the Dodge action
- **THEN** the to-hit is rolled normally, with the reminder that attacks against it have Disadvantage if it can see the attacker

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
