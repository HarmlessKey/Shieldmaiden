## MODIFIED Requirements

### Requirement: The actor's attack modifiers are shown in the details bar

For every actor, player or NPC, the actor panel's details bar SHALL show, after its name,
what its effects do to its attacks, as compact reminders on one line. A player's attacks
aren't rolled in the tracker, so this is how the DM knows them. For NPCs it previews what
their rolls apply. The actor's Reaction Used tag (effects-reaction-used) SHALL always come
first, in red, followed by its restrictions (effects-restrictions). Then:
- **Advantage or Disadvantage**, as a green A or a red D with their sources (both when they
  cancel)
- **To-hit bonuses**: flat and dice, from effects and manual `attack` bonuses
- **Critical hits**: its crit range, and hits that are critical against the target
- **Damage bonuses** on hits
- **The number of reminders**: what the tracker can't check, and single-use modifiers

Each reminder SHALL list its sources in a tooltip, with filters such as "(weapon)". When
exactly one other creature is targeted, that target's "attacks against it" modifiers are
included and named. Melee or ranged isn't known, so distance-based modifiers stay
reminders. Nothing SHALL be shown when it hasn't used its reaction, has no restrictions, and
no effect or manual bonus changes its attacks. What doesn't fit on the line is cut off.

#### Scenario: Blessed player against a Blinded target
- **WHEN** it is a blessed player's turn and a Blinded goblin is the only target
- **THEN** the details bar shows a green A (Blinded, against the goblin) and "To hit +1d4" (Bless)

#### Scenario: NPC with Reaction Used
- **WHEN** a poisoned goblin with Reaction Used is the actor
- **THEN** the details bar shows the red Reaction Used tag first, then a red D (Poisoned)

#### Scenario: Restrictions come after Reaction Used
- **WHEN** a Stunned goblin with Reaction Used is the actor
- **THEN** the details bar shows Reaction Used, then its restriction chips, then the attack reminders

#### Scenario: No target
- **WHEN** no creature is targeted
- **THEN** only the player's own modifiers are shown

#### Scenario: Nothing to show
- **WHEN** a player without attack modifiers or restrictions has the turn
- **THEN** no reminders are shown
