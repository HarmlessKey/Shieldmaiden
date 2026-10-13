## MODIFIED Requirements

### Requirement: SRD definitions exist per edition with a shared url

The system SHALL ship one SRD effect definition list shared by both supported editions
(`"5e"` and `"5.5e"`), and an SRD condition definition list per edition. An effect
definition that follows one edition's rules SHALL have `edition` set to that edition and
SHALL only be used in campaigns of that edition. An effect definition without `edition`
SHALL be used in campaigns of both editions. An edition's set of definitions is the effects
without `edition`, the effects with that `edition`, and that edition's conditions.

Every definition SHALL be identified by its `url` — the same unique identifier the HK API
uses for its content, not the API's uuid `_id` — and SHALL NOT carry a separate `key`. A
definition that exists in both editions SHALL use the same `url` in both editions. Within an
edition's set, a `url` SHALL occur at most once, so an effect without `edition` SHALL NOT
share its `url` with an edition-specific effect or a condition. Active effect instances SHALL
reference a definition by `source: "srd"` and `source_key` equal to its `url`. Every
definition SHALL validate against `src/schemas/hk-effects-schema.json` and SHALL NOT carry
duration fields (`duration_type`, `duration_value`, `cancel_trigger`), origin fields
(`category`, `spell_level`, `magical`, `tags`, `removed_by`, `area`) or `cancelable`. No
sub-effect SHALL carry `scaling`. Conditions SHALL NOT carry `edition`: their list already
belongs to one edition.

#### Scenario: Concentration is resolvable in both editions
- **WHEN** an effect instance with `source: "srd"` and `source_key: "concentration"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's set returns exactly one definition with `url: "concentration"`, the one with that campaign's `edition`

#### Scenario: A condition is resolvable in both editions by the same url
- **WHEN** an effect instance with `source: "srd"` and `source_key: "prone"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's set returns exactly one definition with `url: "prone"`, found in that edition's condition list

#### Scenario: An effect without edition is in both sets
- **WHEN** the sets of both editions are searched for `url: "reaction-used"`
- **THEN** each finds the same single definition, which has no `edition`

#### Scenario: urls are unique within an edition
- **WHEN** the `url`s of an edition's set are combined
- **THEN** no `url` occurs more than once

#### Scenario: A generic effect can't shadow an edition-specific one
- **WHEN** an effect without `edition` has the same `url` as an effect with `edition: "5e"`
- **THEN** the SRD data validation fails and names the `url`

#### Scenario: No definition uses key
- **WHEN** the SRD effect list and both condition lists are read
- **THEN** no definition has a `key` property

#### Scenario: Definitions validate against the effects schema
- **WHEN** every entry of the SRD effect list and of both condition lists is validated against the effects schema
- **THEN** all entries pass with no errors and none contains a duration field, an origin field or a sub-effect with `scaling`

### Requirement: SRD data can be validated with one command

The repository SHALL provide a command that checks the SRD effect file and both condition
files against the effects schema and the cross-file rules in this spec, per edition set:
unique `url`s, no `key` or duration fields, `edition` only on effects and only `"5e"` or
`"5.5e"`, every reference resolves in each edition set that contains the referencing entry,
no reference cycles. It SHALL exit non-zero with a readable list of problems when any check
fails.

#### Scenario: Clean data passes
- **WHEN** the validation command is run on the committed data files
- **THEN** it reports no problems and exits with code 0

#### Scenario: A broken reference fails
- **WHEN** a condition references a `url` that doesn't exist in its edition and the command is run
- **THEN** it names the file, entry and missing `url` and exits non-zero

#### Scenario: A generic effect references an edition-only url
- **WHEN** an effect without `edition` references a `url` that only exists with `edition: "5.5e"`
- **THEN** the command reports the missing `url` for the 5e set and exits non-zero

### Requirement: 5.5e ships the Burning hazard

The SRD effect list SHALL contain a definition with `url: "burning"`, `name: "Burning"` and
`edition: "5.5e"`, following the SRD 5.2.1 Rules Glossary. It SHALL have one `damage`
sub-effect with `trigger: "start_turn_target"` and `roll: { dice_count: 1, dice_type: 4,
damage_type: "fire" }`. Its description SHALL say that the creature takes 1d4 Fire damage at
the start of each of its turns, and that it can end the effect with an action by giving
itself the Prone condition. The 5e set SHALL NOT contain `burning`, because SRD 5.1 has no
such hazard.

#### Scenario: Burning resolves in 5.5e
- **WHEN** an instance with `source: "srd"` and `source_key: "burning"` is resolved for a `"5.5e"` campaign
- **THEN** the definition is found in the 5.5e set, with one start-of-turn 1d4 fire damage sub-effect

#### Scenario: Burning is not in 5e
- **WHEN** the 5e set is read
- **THEN** it contains no definition with `url: "burning"`

#### Scenario: Burning validates
- **WHEN** the SRD data validation command is run
- **THEN** Burning passes with no errors

### Requirement: SRD effects for damage modifiers, rerolls and roll floors

The SRD effect list SHALL contain these definitions for each edition, following that
edition's SRD text (5.1 for 5e, 5.2.1 for 5.5e), with `edition` set:
- **Death Ward** (`death-ward`): a `damage_modifier` `floor_at_1` with `consume`
  (`scope: "effect"`)
- **Uncanny Dodge** (`uncanny-dodge`): a `damage_modifier` `halve_damage` on attack damage,
  with the condition that the holder can see the attacker
- **Evasion** (`evasion`): a `damage_modifier` `evasion` on Dexterity saves. In 5.5e it
  doesn't apply while the holder is Incapacitated.
- **Reliable Talent** (`reliable-talent`): a `roll_floor` of 10 on the die for skill
  checks, with the proficiency requirement in its description
- **Lucky** (5e) / **Luck** (5.5e) (`luck`): a `reroll` on a natural 1 for attack rolls,
  ability checks and saving throws (5.5e: D20 Tests), keeping the new roll
- **Undead Fortitude** (`undead-fortitude`): a `damage_modifier` `floor_at_1` with
  `except_damage_types: ["radiant"]` and a Constitution save, DC `5 + damage_taken`. The
  description names the critical hit exception.

Acid Absorption is not one of them: the generic basic effect Absorption (`absorption`, no
`edition`) replaces it, and `acid-absorption` SHALL NOT be a definition in the list.

#### Scenario: Both editions
- **WHEN** the 5e and 5.5e sets are read
- **THEN** each contains these definitions with its own `edition`, and the SRD data validation passes

#### Scenario: Death Ward ends when used
- **WHEN** Death Ward's damage modifier is read
- **THEN** it is a `floor_at_1` with `consume` and `scope: "effect"`

#### Scenario: Acid Absorption is gone
- **WHEN** the SRD effect list is searched for `url: "acid-absorption"`
- **THEN** no entry matches, and `absorption` is present without `edition`

## ADDED Requirements

### Requirement: Effects identical in both editions have no edition

An SRD effect whose mechanics and description are the same under both editions' rules SHALL
be one entry without `edition`, not two copies. Reaction Used SHALL be such an entry. An
effect whose description quotes or summarises one edition's rules text SHALL keep one entry
per edition, each with `edition`.

#### Scenario: Reaction Used is shared
- **WHEN** the SRD effect list is searched for `url: "reaction-used"`
- **THEN** exactly one entry matches and it has no `edition`

#### Scenario: Haste stays per edition
- **WHEN** the SRD effect list is searched for `url: "haste"`
- **THEN** two entries match, one with `edition: "5e"` and one with `edition: "5.5e"`

### Requirement: Plain bonuses are basic effects, not items or spells

An item or spell whose mechanics are one plain bonus, minimum or set value SHALL NOT be an SRD
effect of its own: it is a basic effect with the number (and ability) fixed where it's
linked. The SRD effect list SHALL NOT contain Gauntlets of Ogre Power, Ioun Stone (Strength),
Robe of the Archmagi, Aid, Barkskin, Fly, Longstrider or Shield of Faith. Their `url`s no
longer resolve: stored instances of them are unresolved references.

#### Scenario: Items aren't listed
- **WHEN** the SRD effects of either edition are listed
- **THEN** none of the eight effects above is listed, and Ability Score Bonus, Ability Score Minimum, Armor Class Minimum and Fly Speed are

#### Scenario: A stored removed effect
- **WHEN** an encounter loads an instance with `source_key: "shield-of-faith"`
- **THEN** it doesn't resolve and is handled as an unresolved reference: its name shows and it has no mechanics

### Requirement: SRD ships Surprised per edition

The SRD effect list SHALL contain Surprised (`surprised`) once per edition, each with
`edition` set. It is an effect, not a condition: the condition lists SHALL NOT contain it.
- **5e**: the holder can't move, take an action or take a reaction (a `restrict`), and a
  `start_turn_target` sub-effect tells the DM at the start of its turn that it is surprised.
  It is meant to be applied until the end of the holder's next turn.
- **5.5e**: Disadvantage on the Initiative roll, and nothing else.

#### Scenario: 5e Surprised at the start of its turn
- **WHEN** a creature in a `"5e"` campaign has Surprised and its turn starts
- **THEN** a notification says it is surprised, and its movement, actions and reactions are restricted

#### Scenario: 5.5e Surprised
- **WHEN** a creature in a `"5.5e"` campaign with Surprised rolls Initiative
- **THEN** the roll has Disadvantage, and the effect restricts nothing

### Requirement: SRD ships Hex, Hunter's Mark, Warding Bond and Rage

The SRD effect list SHALL contain Hex (`hex`), Hunter's Mark (`hunters-mark`), Warding Bond
(`warding-bond`) and Rage (`rage`), one entry per edition whose SRD contains it, each with
`edition` set and following that edition's text:
- **Hex**: extra 1d6 necrotic damage when the caster hits the holder, and Disadvantage on
  ability checks with a chosen ability (`choice: "ability"`).
- **Hunter's Mark**: extra 1d6 force (5.5e) or weapon (5e) damage when the caster hits the
  holder with an attack.
- **Warding Bond**: +1 to AC and saving throws, resistance to all damage, and the damage the
  holder takes is also dealt to the caster.
- **Rage**: resistance to bludgeoning, piercing and slashing damage; a damage bonus on
  Strength attacks whose amount is a value choice (the Rage Damage of the barbarian's
  level); Advantage on Strength checks and saves; no spellcasting or Concentration; ends when
  the holder is Incapacitated (5.5e) or Unconscious (5e).

#### Scenario: Hex asks for the ability
- **WHEN** a DM in a campaign whose edition has Hex applies it and picks Wisdom
- **THEN** the holder has Disadvantage on Wisdom checks, and the caster's hits on it deal an extra 1d6 necrotic damage

#### Scenario: Rage damage is a choice
- **WHEN** the DM applies Rage and enters 2
- **THEN** the holder's Strength attacks deal 2 extra damage

#### Scenario: Only where the SRD has it
- **WHEN** an edition's SRD does not contain one of these effects
- **THEN** that edition's set contains no entry with its `url`
