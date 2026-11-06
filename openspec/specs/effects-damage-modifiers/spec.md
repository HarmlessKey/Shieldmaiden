# effects-damage-modifiers Specification

## Purpose

How the DM's combat tracker applies effects that change the damage a creature takes
(`damage_modifier` sub-effects): reductions offered as toggles, "drop to 1 instead", Evasion
and Absorb applied automatically, and the rest shown as reminders.

## Requirements

### Requirement: Damage modifiers are collected from the target's effects

A creature's damage modifiers SHALL be the `damage_modifier` sub-effects of its active
effects with `direction` `incoming` (the default). They follow the same rules as other
effect modifiers:
- one per definition
- level limits
- choices that weren't made leave the modifier out
- a `condition` is checked, and a condition that can't be checked is named on the modifier
- `damage_types`, `except_damage_types` and a chosen damage type (`choice: "damage_type"`)
  limit the damage types it applies to

The sub-types SHALL be handled as follows:
- `reduce_damage`, `halve_damage`, `negate_damage`: toggles
- `floor_at_1`: drop to 1
- `evasion`
- `absorb`
- `threshold`, `transfer`, `redirect_damage`, `bypass_resistance`, `bypass_immunity`,
  `convert_type`: reminders

#### Scenario: 5.5e Resistance with a chosen type
- **WHEN** a creature has 5.5e Resistance with fire chosen
- **THEN** it has a reduce_damage modifier of 1d4 for fire damage, named Resistance

#### Scenario: Choice not made
- **WHEN** a creature has 5.5e Resistance without a chosen damage type
- **THEN** it has no damage modifier from Resistance

### Requirement: Reductions are toggles on the damage

In the roll dialog, the tracker SHALL show a toggle for each of a target's reduce, halve and
negate modifiers next to its damage. The toggle names the effect, what it does, its damage
types, its condition and its frequency, for example "Resistance: −1d4 fire, once per turn".
A toggle SHALL be off by default. The roll dialog SHALL only show a toggle whose damage
types match a damage type the roll deals. Damage without a type matches every toggle,
so a roll without a damage type shows them all, and a switched-on toggle applies to it.
- **reduce_damage**: switching it on rolls the reduction once: the `roll`, or the `value`,
  which can be a number or a formula over the holder's values. The rolled amount is shown.
  It is subtracted from the matching damage, not below 0.
- **halve_damage**: the matching damage is halved, rounded down.
- **negate_damage**: the matching damage becomes 0.

The order SHALL be: reductions, then halving, then resistance, vulnerability and immunity.
Each damage roll's result in the roll dialog SHALL show what the toggles did to it, before
its defenses ("(7) − 3 = 4 fire").
Switching a toggle off restores the damage. Manual damage from the actor panel (including
the top bar's apply button) and from the legacy actions panel SHALL offer the same toggles
for each target before the damage is applied. They come in a dialog with a checkbox per
target and toggle, all unchecked; checked reductions are rolled. Cancel applies nothing and
keeps the entered value. Nothing is asked when no toggle applies to the damage type.

#### Scenario: Resistance reduces fire damage
- **WHEN** a goblin's attack deals 7 fire damage to a creature with 5.5e Resistance (fire), and the DM switches on its toggle, rolling a 3
- **THEN** the creature takes 4 fire damage

#### Scenario: Off by default
- **WHEN** the DM doesn't switch on the Resistance toggle
- **THEN** the creature takes the full 7

#### Scenario: Other damage types
- **WHEN** the goblin's attack deals 7 slashing damage to that creature
- **THEN** the roll dialog doesn't show the Resistance (fire) toggle

#### Scenario: Manual damage without a type
- **WHEN** the DM applies 8 manual damage without a type to that creature, checks Resistance and rolls a 2
- **THEN** the creature takes 6 damage

#### Scenario: Uncanny Dodge halves before resistance
- **WHEN** a rogue with Uncanny Dodge and resistance to slashing is hit for 15 slashing, and the DM switches on Uncanny Dodge
- **THEN** the damage is halved to 7, then resisted to 3

#### Scenario: Manual damage
- **WHEN** the DM applies 8 manual fire damage to a creature with 5.5e Resistance (fire) and switches on its toggle, rolling a 2
- **THEN** the creature takes 6 fire damage

### Requirement: Evasion changes Dexterity saves for half damage

When a target with an `evasion` damage modifier makes a Dexterity saving throw against
damage that is halved on a success, the tracker SHALL apply Evasion automatically: on a
success the target takes no damage, and on a failure it takes half. The result SHALL name
Evasion. Saves of other abilities, and damage that a success doesn't halve, are unchanged.

#### Scenario: Fireball against a rogue
- **WHEN** a rogue with Evasion succeeds on the Dexterity save against a 28 damage Fireball
- **THEN** it takes 0 damage, with Evasion named

#### Scenario: Failed save
- **WHEN** the rogue fails that save
- **THEN** it takes 14 damage

### Requirement: Absorbed damage heals instead

Damage of a type a target absorbs (an `absorb` damage modifier with `damage_types`) SHALL
heal the target by that amount instead of damaging it, in the roll dialog and in manual
damage. This happens automatically, and the result names the effect.

#### Scenario: Clay golem
- **WHEN** a clay golem with Acid Absorption takes 10 acid damage
- **THEN** it regains 10 hit points instead, with Acid Absorption named

### Requirement: Drop to 1 instead of 0

When damage would drop a creature from above 0 to 0 hit points, and it has a `floor_at_1`
damage modifier that applies, the tracker SHALL apply it automatically. The modifier applies
when the damage matches its `damage_types` / `except_damage_types` (Undead Fortitude: not
radiant) and its condition holds. With unknown damage types it applies, and the types are
named. An exception the data only describes, such as "not from a critical hit", is left to
the DM: the notice or prompt SHALL show the effect's description.
- **Without a `save`**: the creature drops to 1 hit point instead, with a notice naming the
  effect. A single-use one (`consume`) is used up: with `scope: "effect"` its effect ends,
  as Death Ward does.
- **With a `save`**: the creature drops to 1 hit point, and a prompt shows the save with
  its DC (Undead Fortitude: Constitution, DC 5 + the damage taken), with a Roll button and
  Success / Failure. On a failure the creature drops to 0 hit points, and "drops to 0 hit
  points" fires then. On a success it stays at 1.

While a modifier holds the creature at 1, "drops to 0 hit points" SHALL NOT fire. A player's
death on massive damage SHALL NOT be checked either.

#### Scenario: Death Ward
- **WHEN** a player with Death Ward at 6 hit points takes 20 damage
- **THEN** the player drops to 1 hit point instead, a notice names Death Ward, and Death Ward ends

#### Scenario: Undead Fortitude
- **WHEN** a zombie with Undead Fortitude at 5 hit points takes 9 slashing damage
- **THEN** the zombie stays at 1 hit point, and a prompt asks for a Constitution save with DC 14; a failure drops it to 0

#### Scenario: Not for radiant damage
- **WHEN** that zombie takes 9 radiant damage
- **THEN** it drops to 0 hit points, with no Undead Fortitude prompt

### Requirement: Damage modifiers that aren't applied are reminders

The `threshold`, `transfer`, `redirect_damage`, `bypass_resistance`, `bypass_immunity` and
`convert_type` damage modifiers, and any with `direction: "outgoing"`, SHALL be shown as
reminders in the roll dialog for the target or attacker they belong to, and in the actor's
details bar (effects-roll-modifiers). They SHALL NOT change the damage.

#### Scenario: Warding Bond
- **WHEN** a creature with a transfer damage modifier takes damage in the roll dialog
- **THEN** the dialog shows a reminder naming the effect and its description, and the damage is unchanged
