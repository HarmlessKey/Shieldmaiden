## MODIFIED Requirements

### Requirement: Basic effects ship without an edition

The SRD effects data SHALL contain the basic effects below. None of them SHALL have an
`edition`, so each is available in campaigns of both editions. Each SHALL have one
sub-effect, a `name`, and a `description` that says what is chosen when the effect is
applied, if anything. A sub-effect's choices are listed after the arrow; "value" is a number,
negative for a penalty; "roll" is dice, a fixed value, or both (`{ dice_count, dice_type,
fixed_val }`).

Bonuses (`bonus`):
- `armor-class-bonus` "Armor Class Bonus": Armor Class → value
- `attack-roll-bonus` "Attack Roll Bonus": attack rolls → value
- `damage-roll-bonus` "Damage Roll Bonus": damage rolls → value
- `saving-throw-bonus` "Saving Throw Bonus": all saving throws → value
- `ability-saving-throw-bonus` "Saving Throw Bonus (One Ability)": saving throws → ability, value
- `ability-check-bonus` "Ability Check Bonus": ability checks → ability, value
- `skill-bonus` "Skill Bonus": skill checks → skill, value
- `initiative-bonus` "Initiative Bonus": Initiative → value
- `speed-bonus` "Speed Bonus": Speed → value
- `spell-save-dc-bonus` "Spell Save DC Bonus": spell save DC → value
- `spell-attack-bonus` "Spell Attack Bonus": spell attack → value
- `passive-perception-bonus` "Passive Perception Bonus": passive Perception → value
- `hit-point-maximum-bonus` "Hit Point Maximum Bonus": Hit Point maximum → value; an increase
  also raises current Hit Points by the same amount (`also_heal`), a reduction heals nothing
- `ability-score-bonus` "Ability Score Bonus": ability score → ability, value

For monster actions and traits:
- `hit-point-maximum-reduction` "Hit Point Maximum Reduction": `bonus` on Hit Point maximum
  with `multiplier: -1` → roll (rolled once when applied: 1d10 from a disease, or a fixed
  value such as the damage taken)
- `no-healing` "No Healing": `cap` on `healing_received`, value 0 (no choice)
- `speed-halved` "Speed Halved": `bonus` on Speed with `multiplier: 0.5` (no choice)
- `no-reactions` "No Reactions": `restrict` Reactions (no choice)
- `damage-over-time` "Damage Over Time": `damage` on `start_turn_target` → damage type, roll
  (rolled every turn)
- `healing-over-time` "Healing Over Time": `healing` on `start_turn_target` → roll (rolled every
  turn; a monster's Regeneration links it with its amount)
- `magic-resistance` "Magic Resistance": Advantage on saving throws whose source is magical
  (no choice)

Minimums and set values:
- `armor-class-minimum` "Armor Class Minimum": `floor` on Armor Class → value
- `ability-score-minimum` "Ability Score Minimum": `floor` on an ability score → ability, value
- `fly-speed` "Fly Speed": `fixed` Fly Speed → value

Advantage and Disadvantage:
- `advantage-on-saving-throws` / `disadvantage-on-saving-throws`: saving throws → ability
- `advantage-on-ability-checks` / `disadvantage-on-ability-checks`: ability checks → ability
- `advantage-on-attack-rolls` / `disadvantage-on-attack-rolls`: the holder's attack rolls
- `attacks-against-have-advantage` / `attacks-against-have-disadvantage`: attack rolls
  against the holder

Defenses:
- `damage-resistance` "Damage Resistance", `damage-vulnerability` "Damage Vulnerability",
  `damage-immunity` "Damage Immunity": `defense` → damage type
- `damage-reduction` "Damage Reduction": `damage_modifier` `reduce_damage` → damage type, value
- `absorption` "Absorption": `damage_modifier` `absorb` → damage type

#### Scenario: Available in both editions
- **WHEN** the SRD effects of a `"5e"` campaign and of a `"5.5e"` campaign are listed
- **THEN** both lists contain every basic effect above, each exactly once

#### Scenario: Basic effects validate
- **WHEN** the SRD data validation command is run
- **THEN** every basic effect passes, and none has an `edition`

#### Scenario: Damage over time rolls every turn
- **WHEN** Damage Over Time is applied with damage type fire and roll 2d6
- **THEN** the creature's start-of-turn prompt rolls 2d6 fire each turn

#### Scenario: Regeneration as healing over time
- **WHEN** an oni's Regeneration trait links Healing Over Time with `choices: { roll: { fixed_val: 10 } }`
- **THEN** at the start of each of the oni's turns, the prompt offers Roll, which opens the roll dialog with 10 healing for the oni

#### Scenario: Rolled healing
- **WHEN** Healing Over Time is applied with roll 2d6
- **THEN** the creature's start-of-turn prompt rolls 2d6 healing each turn
