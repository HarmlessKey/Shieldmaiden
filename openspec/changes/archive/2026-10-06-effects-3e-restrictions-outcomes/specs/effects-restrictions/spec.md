## Purpose

How the DM's combat tracker handles what effects stop a creature from doing (`restrict`
sub-effects) and the fixed results some effects have (`outcome` sub-effects): restrictions
shown on the actor and confirmed before rolling, death offered with a prompt, and
Concentration broken automatically.

## ADDED Requirements

### Requirement: Restrictions are collected from active effects

A creature's restrictions SHALL be the `restrict` sub-effects of its active effects that
have no `trigger`, one per sub-type. These are `action`, `bonus_action`, `reaction`,
`attack`, `movement`, `speech`, `concentration` and any other sub-type, each named after its
effect, with the sub-effect's description. A `condition` on the sub-effect SHALL be checked
as for other modifiers. In an attack the other party is the target, so a restriction whose
condition can't be checked is a possible restriction. Level limits and choices that weren't
made SHALL be handled as for other effect modifiers. Restrictions with a `trigger` (Haste's
lethargy on expiry) SHALL NOT count.

#### Scenario: Incapacitated
- **WHEN** a creature is 5.5e Incapacitated
- **THEN** it has the restrictions action, bonus_action, reaction, concentration and speech, named Incapacitated

#### Scenario: Stunned includes Incapacitated
- **WHEN** a creature is Stunned
- **THEN** it has Incapacitated's restrictions, named after Stunned

#### Scenario: Haste's lethargy doesn't count
- **WHEN** a creature has Haste
- **THEN** it has no restrictions from Haste

### Requirement: Restricted rolls are confirmed

Before the tracker rolls an action or spell for an actor, it SHALL check the actor's
restrictions:
- `action` restricts actions, bonus actions, legendary actions, special abilities and spells
- `bonus_action` restricts bonus actions
- `reaction` restricts reactions, and any action or spell rolled while another entity has
  the turn
- `attack` restricts an action with a to-hit against a target for which the restriction's
  condition holds, or can't be checked (Charmed: attacking the charmer)

When any applies, the tracker SHALL ask the DM to confirm, naming the actor, the effects and
what they restrict ("Goblin is Stunned: can't take actions. Roll anyway?"). **Roll anyway**
rolls as usual; **Cancel** rolls nothing and uses nothing up.

Manual damage and healing by an actor, from the actor panel (including the top bar's apply
button) and the legacy actions panel, SHALL be checked the same way, as an action. Out of
turn it counts as a reaction. For damage, the `attack` restriction is also checked against
each target. The confirmation reads **Apply anyway**. **Cancel** applies nothing and keeps the
entered value.

#### Scenario: Stunned goblin
- **WHEN** the DM rolls a Stunned goblin's Scimitar
- **THEN** a confirmation names Stunned and "can't take actions", and the roll happens only after Roll anyway

#### Scenario: Slowed reaction
- **WHEN** during another creature's turn the DM rolls an attack for a slowed creature
- **THEN** a confirmation names Slow and "can't take reactions"

#### Scenario: Charmed against the charmer
- **WHEN** a goblin Charmed by Lyra attacks Lyra
- **THEN** a confirmation names Charmed and "can't attack Lyra"

#### Scenario: Charmed against someone else
- **WHEN** that goblin attacks another creature
- **THEN** the attack is rolled without a confirmation

#### Scenario: Cancel
- **WHEN** the DM cancels the confirmation
- **THEN** nothing is rolled, no limited use is spent and no Reaction Used prompt is shown

#### Scenario: Manual damage by a Stunned actor
- **WHEN** the DM enters 8 manual damage for a Stunned goblin as the actor
- **THEN** a confirmation names Stunned and "can't take actions" with Apply anyway; cancelling applies no damage and keeps the 8

#### Scenario: Manual damage to the charmer
- **WHEN** a goblin Charmed by Lyra is the actor and the DM applies manual damage to Lyra
- **THEN** a confirmation names Charmed and "can't attack Lyra"

#### Scenario: Manual healing
- **WHEN** a Charmed goblin heals Lyra by manual input
- **THEN** no confirmation is asked (healing isn't an attack)

### Requirement: Restrictions are shown in the details bar

The actor's details bar (effects-roll-modifiers) SHALL show each restriction as a chip after
Reaction Used:
- "Can't take actions", "Can't take bonus actions", "Can't take reactions"
- "Can't attack <creature>" for an `attack` restriction whose condition names the other party,
  else "Can't attack"
- "Can't move" (also "can't willingly move closer" restrictions), "Can't speak", "Can't
  concentrate"
- the sub-type's name for any other

Each chip's tooltip SHALL name the effects and their descriptions. A restriction whose
condition can't be checked SHALL be shown as possible ("May not move").

#### Scenario: Paralyzed goblin
- **WHEN** a Paralyzed goblin is the actor
- **THEN** the details bar shows chips for its actions, reactions and speech restrictions, with Paralyzed in the tooltips

#### Scenario: Frightened
- **WHEN** a Frightened creature is the actor
- **THEN** the details bar shows "Can't move", with the tooltip "Frightened: Can't willingly move closer to the source of its fear"

### Requirement: Death outcomes are offered with a prompt

When a creature gets an effect instance whose `outcome` sub-effect with sub-type `death`
applies (Exhaustion with `min_level: 6` at level 6), whether newly applied or raised to that
level, the tracker SHALL show a prompt "<creature>: <effect> — dies". Its buttons:
- **Mark dead**: the creature is set to 0 hit points (and 0 temporary hit points), which fires
  "drops to 0 hit points" (Concentration breaks). Players and companions are also marked
  dead, so they show as dead instead of with a health bar, as after three failed death
  saves.
- **Dismiss**

Nothing SHALL happen without the DM choosing Mark dead.

#### Scenario: Exhaustion 6
- **WHEN** the DM raises a player's Exhaustion to level 6
- **THEN** a prompt "Lyra: Exhaustion 6 — dies" is shown, and Mark dead sets Lyra to 0 hit points and marks her dead, so no health bar is shown for her

#### Scenario: NPC
- **WHEN** an NPC reaches Exhaustion 6 and the DM chooses Mark dead
- **THEN** the NPC's hit points are set to 0

### Requirement: Concentration breaks by itself on its trigger

When a trigger fires an `outcome` sub-effect with sub-type `break_concentration` and no
`save` (Concentration's "dropping to 0 hit points"), its Concentration instance SHALL end,
with the notice reason naming the trigger ("dropped to 0 hit points"). Its linked effects
end through the cascade. This replaces the prompt line for that sub-effect. The save-based
`break_concentration` keeps its Concentration save prompt, except when the damage drops the
holder to 0 hit points: Concentration ends, so no save is asked for.

#### Scenario: Concentrating player drops to 0
- **WHEN** a concentrating player with a linked Bless drops to 0 hit points
- **THEN** Concentration ends with a notice, and Bless ends with it, without a Concentration save prompt
