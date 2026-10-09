## ADDED Requirements

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
natural die that was rolled.

#### Scenario: Reliable Talent
- **WHEN** a creature with Reliable Talent rolls a Stealth check and the die shows 7
- **THEN** the die counts as 10, and the result names Reliable Talent

#### Scenario: High roll unchanged
- **WHEN** that creature's die shows 14
- **THEN** the roll is unchanged and the floor isn't named

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

## MODIFIED Requirements

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
- **Damage bonuses** on hits
- **The number of reminders**: what the tracker can't check, single-use modifiers, and the
  actor's effects the tracker only reminds of. These are `compel`, `deny`,
  `forced_movement`, `sense`, `proficiency`, `score_swap`, restrictions with `limit` or
  `exclusive`, and damage modifiers that aren't applied (effects-damage-modifiers).

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
- **THEN** only the player's own modifiers are shown

#### Scenario: Nothing to show
- **WHEN** a player without attack modifiers or restrictions has the turn
- **THEN** no reminders are shown
