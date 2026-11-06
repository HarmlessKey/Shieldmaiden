## MODIFIED Requirements

### Requirement: SRD definitions exist per edition with a shared url

The system SHALL ship, for each supported edition (`"5e"` and `"5.5e"`), an SRD effect
definition list and an SRD condition definition list. Every definition in either list
SHALL be identified by its `url` — the same unique identifier the HK API uses for its
content, not the API's uuid `_id` — and SHALL NOT carry a separate `key`. A definition
that exists in both editions SHALL use the same `url` in both editions. Within one
edition, a `url` SHALL occur at most once across the effect list and the condition list
combined. Active effect instances SHALL reference a definition by `source: "srd"` and
`source_key` equal to its `url`. Every definition SHALL validate against
`src/schemas/hk-effects-schema.json` and SHALL NOT carry duration fields
(`duration_type`, `duration_value`, `cancel_trigger`), origin fields (`category`,
`spell_level`, `magical`, `tags`, `removed_by`, `area`) or `cancelable`. No sub-effect SHALL carry
`scaling`.

#### Scenario: Concentration is resolvable in both editions
- **WHEN** an effect instance with `source: "srd"` and `source_key: "concentration"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's lists return exactly one definition with `url: "concentration"`

#### Scenario: A condition is resolvable in both editions by the same url
- **WHEN** an effect instance with `source: "srd"` and `source_key: "prone"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's lists return exactly one definition with `url: "prone"`, found in that edition's condition list

#### Scenario: urls are unique within an edition
- **WHEN** the `url`s of an edition's effect list and condition list are combined
- **THEN** no `url` occurs more than once

#### Scenario: No definition uses key
- **WHEN** the SRD effect and condition lists of both editions are read
- **THEN** no definition has a `key` property

#### Scenario: Definitions validate against the effects schema
- **WHEN** every entry of the 5e and 5.5e SRD effect and condition lists is validated against the effects schema
- **THEN** all entries pass with no errors and none contains a duration field, an origin field or a sub-effect with `scaling`

### Requirement: Each edition ships exactly the SRD conditions

Each edition's condition list SHALL contain exactly these 15 conditions, one entry each,
with `url` equal to the HK API condition `url`: `blinded`,
`charmed`, `deafened`, `exhaustion`, `frightened`, `grappled`, `incapacitated`,
`invisible`, `paralyzed`, `petrified`, `poisoned`, `prone`, `restrained`, `stunned`,
`unconscious`. Every entry SHALL have a display `name` and a `description` that summarises
that edition's rules text. Being in the condition list is what makes a definition a
condition; entries have no `category`. Entries that are not SRD conditions of that edition
(such as `Dying` or `Surprised` in 5.5e, or per-level `Exhaustion N` entries) SHALL NOT be
present.

#### Scenario: Condition set matches the SRD
- **WHEN** the `url`s of the 5e condition list and of the 5.5e condition list are read
- **THEN** each is exactly the 15 `url`s above

#### Scenario: Non-SRD 5.5e entries are gone
- **WHEN** the 5.5e condition list is searched for `Dying` or `Surprised`
- **THEN** no entry matches

#### Scenario: url matches the icon and API naming
- **WHEN** a condition with `url` `u` is displayed with its icon
- **THEN** the icon class is `hki-u` and `u` equals the HK API condition `url` for that condition

### Requirement: 5.5e Exhaustion scales with level

The 5.5e Exhaustion definition SHALL express the 2024 rule as formulas on the instance's
level: each D20 Test gets a `bonus` with `value: { formula: "-2 * level" }` and Speed gets
a `bonus` with `value: { formula: "-5 * level" }`. It SHALL NOT impose Disadvantage on any
roll.

#### Scenario: Level 3 penalties
- **WHEN** the 5.5e Exhaustion sub-effects are evaluated at level 3
- **THEN** D20 Tests get −6, Speed gets −15 ft, and no sub-effect is Disadvantage

### Requirement: 5.5e ships the Burning hazard

The 5.5e SRD effect list SHALL contain a definition with `url: "burning"` and
`name: "Burning"`, following the SRD 5.2.1 Rules Glossary. It SHALL have one `damage`
sub-effect with `trigger: "start_turn_target"` and `roll: { dice_count: 1, dice_type: 4,
damage_type: "fire" }`. Its description SHALL say that the creature takes 1d4 Fire damage at
the start of each of its turns, and that it can end the effect with an action by giving
itself the Prone condition. The 5e lists SHALL NOT contain `burning`, because SRD 5.1 has no
such hazard.

#### Scenario: Burning resolves in 5.5e
- **WHEN** an instance with `source: "srd"` and `source_key: "burning"` is resolved for a `"5.5e"` campaign
- **THEN** the definition is found in the 5.5e effect list, with one start-of-turn 1d4 fire damage sub-effect

#### Scenario: Burning is not in 5e
- **WHEN** the 5e effect and condition lists are read
- **THEN** neither contains a definition with `url: "burning"`

#### Scenario: Burning validates
- **WHEN** the SRD data validation command is run
- **THEN** Burning passes with no errors

### Requirement: SRD effects for damage modifiers, rerolls and roll floors

Each edition's effect list SHALL contain these definitions, following that edition's SRD
text (5.1 for 5e, 5.2.1 for 5.5e):
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
- **Acid Absorption** (`acid-absorption`), in each edition whose SRD has it: a
  `damage_modifier` `absorb` with `damage_types: ["acid"]`

#### Scenario: Both editions
- **WHEN** the 5e and 5.5e effect lists are read
- **THEN** each contains these definitions (Acid Absorption only where its SRD has it), and the SRD data validation passes

#### Scenario: Death Ward ends when used
- **WHEN** Death Ward's damage modifier is read
- **THEN** it is a `floor_at_1` with `consume` and `scope: "effect"`
