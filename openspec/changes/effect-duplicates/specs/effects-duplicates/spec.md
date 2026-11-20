## Purpose

Defines the Duplicates sub-effect: illusory duplicates (Mirror Image) that an effect starts
with, the check that sends an attack to a duplicate, the attackers it doesn't work against, and
how the count goes down and ends the effect.

## ADDED Requirements

### Requirement: A Duplicates sub-effect describes the duplicates and their check

A sub-effect with `type: "duplicates"` SHALL have:
- `count`: the number of duplicates the effect starts with, an integer of at least 1
- `check`: when the check is made and what is rolled
  - `when: "targeted"`: before the attack roll is compared to the holder's AC. One die of
    `dice_type` is rolled.
  - `when: "hit"`: only when the attack hits the holder. One die of `dice_type` is rolled per
    duplicate left, and one die reaching the minimum is enough.
  - `min_roll`: the minimum roll, either one number, or a list of `{ duplicates, min }` that
    gives the minimum for the number of duplicates left
- optionally `ac`: the duplicate's AC as a formula, with the holder's variables (`10 +
  dex_mod`). Without `ac`, an attack that goes to a duplicate hits it.

The existing `condition` of the sub-effect SHALL decide against which attackers the duplicates
work, with `subject: "counterpart"` being the attacker. The definition SHALL validate against
the effects schema, and a Duplicates sub-effect SHALL have no `sub_types`, `value`, `roll` or
`trigger`.

#### Scenario: 2014 Mirror Image
- **WHEN** a definition has `{ type: "duplicates", count: 3, check: { when: "targeted", dice_type: 20, min_roll: [{ duplicates: 3, min: 6 }, { duplicates: 2, min: 8 }, { duplicates: 1, min: 11 }] }, ac: { formula: "10 + dex_mod" } }`
- **THEN** it validates, and it describes three duplicates with the 2014 table and AC 10 + Dex modifier

#### Scenario: 2024 Mirror Image
- **WHEN** a definition has `{ type: "duplicates", count: 3, check: { when: "hit", dice_type: 6, min_roll: 3 } }`
- **THEN** it validates, and on a hit it rolls a d6 per duplicate left, where a 3 or higher sends the hit to a duplicate

#### Scenario: Invalid count
- **WHEN** a Duplicates sub-effect has `count: 0`
- **THEN** the definition fails validation

### Requirement: Applying stores the number of duplicates

Applying an effect whose own sub-effects include a Duplicates sub-effect SHALL store its
`count` in the instance's `charges`. Applying it again to a holder that already has it SHALL
follow the effect's stacking rule, so a new instance starts with the full count. A level
change on an existing instance SHALL NOT change `charges`.

#### Scenario: Mirror Image applied
- **WHEN** a wizard casts Mirror Image on itself
- **THEN** its Mirror Image instance has `charges: 3`

#### Scenario: Cast again
- **WHEN** the wizard has Mirror Image with 1 duplicate left and casts it again
- **THEN** it has one Mirror Image instance, with 3 duplicates

### Requirement: Attacks against the holder roll the duplicate check

When the attack roll dialog resolves an attack roll (melee, ranged or spell attack) against a
target that holds an effect with duplicates left, it SHALL make that effect's check for each
attack in the dialog:
- **`targeted`**: the die is rolled first. When it reaches the minimum for the duplicates
  left, the attack goes to a duplicate: it hits the duplicate when its total reaches the
  duplicate's AC (a natural 20 hits and a natural 1 misses), and it doesn't hit the creature
  either way. Otherwise the attack is resolved against the creature as usual.
- **`hit`**: when the attack hits the creature, a die is rolled per duplicate left. When one
  reaches the minimum, a duplicate is hit instead of the creature.

The dialog SHALL show the dice, the minimum, the duplicate's AC when it has one, and the
outcome ("hits a duplicate", "misses a duplicate" or "goes to the creature"). The DM SHALL be
able to change the outcome, as with Hit and Miss.

The attacks in one dialog SHALL be checked in order, each with the duplicates left after the
earlier ones. A target with several effects with duplicates SHALL use the one with the most
duplicates left. Saving throws and damage without an attack roll SHALL NOT be checked.

#### Scenario: 2014, the duplicate is targeted and hit
- **WHEN** a goblin attacks a wizard with 3 duplicates and Dex modifier +2, the d20 rolls 9 and the attack total is 13
- **THEN** the dialog shows "d20 = 9 (needs 6)", the attack goes to a duplicate with AC 12, and it hits the duplicate

#### Scenario: 2014, the duplicate is missed
- **WHEN** the attack goes to a duplicate with AC 12 and its total is 10
- **THEN** the attack misses the duplicate, and the wizard isn't hit

#### Scenario: 2014, the check fails
- **WHEN** the wizard has 1 duplicate left and the d20 rolls 7
- **THEN** the attack is resolved against the wizard's AC

#### Scenario: 2024, a hit goes to a duplicate
- **WHEN** a goblin hits a 2024 wizard with 2 duplicates and the d6s roll 1 and 4
- **THEN** the dialog shows "d6: 1, 4 (needs 3)" and a duplicate is hit instead of the wizard

#### Scenario: 2024, a miss rolls nothing
- **WHEN** the goblin's attack misses the 2024 wizard
- **THEN** no d6 is rolled

#### Scenario: Multiattack
- **WHEN** a 2014 wizard has 1 duplicate and a monster's dialog has two attacks against it, and the first attack hits the duplicate
- **THEN** the second attack is resolved against the wizard without a check

#### Scenario: DM changes the outcome
- **WHEN** the dialog says a duplicate is hit and the DM changes it to the creature
- **THEN** the attack is resolved as a hit on the creature, and no duplicate is destroyed

### Requirement: A hit duplicate takes the attack instead of the creature

For an attack that hits a duplicate, or goes to a duplicate and misses it:
- the creature SHALL NOT take the attack's damage, and no damage modifiers, concentration
  save or damage prompts SHALL follow from it
- its linked effects on a hit SHALL NOT be offered, and the on-hit triggers of the attacker
  and the creature SHALL NOT fire
- its linked effects on a miss SHALL NOT be offered either, since the attack didn't target
  the creature

When the dialog's roll is applied, each duplicate hit SHALL lower the effect's `charges` by
one, saved the same way as a level change. At 0 the effect SHALL end, the same way as when
it is used up.

#### Scenario: Duplicate destroyed
- **WHEN** a goblin's 1d6+2 hit goes to one of the wizard's 3 duplicates and the DM applies the roll
- **THEN** the wizard's HP doesn't change and the Mirror Image instance has `charges: 2`

#### Scenario: Last duplicate
- **WHEN** the last duplicate is hit and the roll is applied
- **THEN** Mirror Image is removed from the wizard

#### Scenario: Linked effect not applied
- **WHEN** a monster's bite links Poisoned on a hit, and the hit goes to a duplicate
- **THEN** Poisoned isn't offered for the wizard

### Requirement: Duplicates don't work against attackers that can't be fooled

When the Duplicates sub-effect has a `condition`, the check SHALL only be made when the
condition holds for the attack, with the attacker as the other party. In an attack, a
condition on the other party SHALL be evaluated for:
- `has_condition`, as for other attack modifiers (Blinded)
- `sense`: whether the attacker has that sense from its stat block senses, or from a Sense
  sub-effect of one of its active effects. A sense with a range is assumed to reach the target.

A player character without stat block senses SHALL count as having only the senses its
effects give it. When the condition doesn't hold, the dialog SHALL say why ("Mirror Image
doesn't work: the attacker has Truesight") and the DM SHALL be able to make the check anyway.

#### Scenario: Blinded attacker
- **WHEN** a Blinded goblin attacks a wizard with Mirror Image (condition: not Blinded, no Blindsight, no Truesight)
- **THEN** no duplicate check is made, the dialog says the attacker is Blinded, and the attack is resolved against the wizard

#### Scenario: Attacker with Blindsight
- **WHEN** a monster whose stat block has Blindsight 30 ft. attacks the wizard with a ranged attack
- **THEN** no duplicate check is made

#### Scenario: Truesight from an effect
- **WHEN** a player under an effect with a Sense sub-effect granting Truesight attacks the wizard
- **THEN** no duplicate check is made

#### Scenario: DM makes the check anyway
- **WHEN** the dialog skips the check because of Blindsight and the DM chooses to check anyway
- **THEN** the check is rolled and resolved as usual

### Requirement: The DM can change the duplicates left

The effect's detail view SHALL show the duplicates left for an effect with a Duplicates
sub-effect, and let the DM lower or raise them between 0 and the sub-effect's `count`. This is
for attacks the dialog doesn't resolve, like attacks entered by hand. The change SHALL be
saved the same way as a level change, and 0 SHALL end the effect.

#### Scenario: Player hits a duplicate
- **WHEN** a player's attack, entered by hand, hits one of the NPC's 3 duplicates and the DM lowers the count in the detail view
- **THEN** the instance has `charges: 2` and the chip's badge shows 2

#### Scenario: Lowered to 0
- **WHEN** the DM lowers the duplicates to 0
- **THEN** the effect is removed

#### Scenario: Not above the count
- **WHEN** an instance has 3 duplicates of a `count: 3` sub-effect
- **THEN** the detail view doesn't offer to raise it
