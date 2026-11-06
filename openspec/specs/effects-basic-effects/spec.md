# effects-basic-effects Specification

## Purpose

Ready-made, edition-neutral SRD effects for common bonuses, Advantage and Disadvantage, and
damage defenses. Their details (the number, the ability, the skill, the damage type) are
choices made when the effect is applied, so a DM can apply them during combat without
building a custom effect.

## Requirements

### Requirement: Basic effects ship without an edition

The SRD effects data SHALL contain the basic effects below. None of them SHALL have an
`edition`, so each is available in campaigns of both editions. Each SHALL have one
sub-effect, a `name`, and a `description` that says what is chosen when the effect is
applied, if anything. A sub-effect's choices are listed after the arrow; "value" is a number,
negative for a penalty.

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
  with `multiplier: -1` → value (the amount it is reduced by)
- `no-healing` "No Healing": `cap` on `healing_received`, value 0 (no choice)
- `speed-halved` "Speed Halved": `bonus` on Speed with `multiplier: 0.5` (no choice)
- `no-reactions` "No Reactions": `restrict` Reactions (no choice)
- `damage-over-time` "Damage Over Time": `damage` on `start_turn_target` → damage type, value
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

### Requirement: No Healing blocks regaining hit points

A creature with an effect that has a `cap` on `healing_received` SHALL regain at most that
many hit points from one heal; with No Healing (cap 0) it SHALL regain none. When a heal is
limited, the tracker SHALL notify the DM and name the effect. Undoing a heal is not limited.

#### Scenario: Healing a creature with No Healing
- **WHEN** a creature with No Healing at 10 of 30 Hit Points is healed for 8
- **THEN** it stays at 10 Hit Points and a notification says it can't regain hit points, naming No Healing

#### Scenario: Without the effect
- **WHEN** the same creature without No Healing is healed for 8
- **THEN** it has 18 Hit Points

### Requirement: Basic effects ask for their choices when applied

Applying a basic effect SHALL ask for every choice its sub-effect lists and SHALL NOT apply
it until each has a value. A damage type choice SHALL offer every damage type.

#### Scenario: Armor Class Bonus
- **WHEN** the DM applies Armor Class Bonus to a creature with AC 15 and enters 2
- **THEN** the instance has `choices: { value: "2" }` and the creature's AC is 17

#### Scenario: Ability Score Minimum
- **WHEN** the DM applies Ability Score Minimum with Strength and 19 to a creature with Strength 10, and to one with Strength 20
- **THEN** the first has Strength 19 and the second keeps 20

#### Scenario: A higher Hit Point maximum heals
- **WHEN** the DM applies Hit Point Maximum Bonus with 5 to a creature with 20 Hit Points out of 20
- **THEN** its maximum is 25 and it has 25 Hit Points; with -5 its maximum is 15 and it isn't healed

#### Scenario: A penalty
- **WHEN** the DM applies Speed Bonus and enters -10 on a creature with Speed 30 ft
- **THEN** its Speed is 20 ft

#### Scenario: Skill Bonus asks for two choices
- **WHEN** the DM applies Skill Bonus
- **THEN** the application asks for a skill and a value, and can't be applied while either is empty

#### Scenario: Damage Resistance
- **WHEN** the DM applies Damage Resistance with damage type fire and the creature then takes 10 fire damage and 10 cold damage
- **THEN** the fire damage is halved to 5 and the cold damage is not reduced

#### Scenario: Absorption
- **WHEN** the DM applies Absorption with damage type acid and the creature then takes 8 acid damage
- **THEN** it takes no damage and regains 8 Hit Points instead

### Requirement: A sub-effect can take more than one choice

A sub-effect's `choice` SHALL be either one choice kind or a list of kinds. Each kind in the
list SHALL fill its own field (ability → abilities, skill → skills, damage type → damage
types, value → value) from the instance's `choices`. A sub-effect SHALL have no effect while
any of its kinds has no value in the instance's `choices`. A single kind written as a string
SHALL behave as before.

#### Scenario: Skill and value
- **WHEN** a creature has Skill Bonus with `choices: { skill: "stealth", value: "5" }` and rolls Stealth and Athletics
- **THEN** Stealth gets +5 and Athletics gets no bonus

#### Scenario: Ability and value on saves
- **WHEN** a creature has Saving Throw Bonus (One Ability) with `choices: { ability: "wisdom", value: "1" }`
- **THEN** its Wisdom saves get +1 and its other saves don't

#### Scenario: Damage type and value
- **WHEN** a creature has Damage Reduction with `choices: { damage_type: "slashing", value: "3" }` and takes 10 slashing damage
- **THEN** it takes 7 damage

#### Scenario: A missing choice disables the sub-effect
- **WHEN** an instance of Skill Bonus has `choices: { skill: "stealth" }` and no value
- **THEN** the sub-effect does nothing

#### Scenario: A string choice still works
- **WHEN** a custom effect saved before this change has a sub-effect with `choice: "ability"`
- **THEN** applying it asks for an ability and the sub-effect uses it, as before

### Requirement: Advantage and Disadvantage on one skill's checks

The SRD effects data SHALL contain two more basic effects without an `edition`, each with one
sub-effect on skill checks (`sub_types: ["skill"]`) and the skill as a choice made when the
effect is applied (or fixed on a link):
- `advantage-on-skill-checks` "Advantage on Skill Checks": `advantage` → skill
- `disadvantage-on-skill-checks` "Disadvantage on Skill Checks": `disadvantage` → skill

Their `description` SHALL say that the skill is chosen when the effect is applied. Checks with
other skills and other ability checks SHALL NOT be affected.

#### Scenario: Armstrong's Arcana
- **WHEN** a special ability links Advantage on Skill Checks with the skill fixed to Arcana, and the creature makes an Intelligence (Arcana) check
- **THEN** the check has Advantage from the trait

#### Scenario: Other skills
- **WHEN** the same creature makes an Intelligence (History) check
- **THEN** the check has no Advantage from it
