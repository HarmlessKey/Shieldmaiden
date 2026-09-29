## RENAMED Requirements

- FROM: `### Requirement: SRD effect definitions exist per edition with shared keys`
- TO: `### Requirement: SRD definitions exist per edition with a shared url`

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
(`duration_type`, `duration_value`, `cancel_trigger`).

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
- **THEN** all entries pass with no errors and none contains a duration field

## ADDED Requirements

### Requirement: Each edition ships exactly the SRD conditions

Each edition's condition list SHALL contain exactly these 15 conditions, one entry each,
with `url` equal to the HK API condition `url`: `blinded`,
`charmed`, `deafened`, `exhaustion`, `frightened`, `grappled`, `incapacitated`,
`invisible`, `paralyzed`, `petrified`, `poisoned`, `prone`, `restrained`, `stunned`,
`unconscious`. Every entry SHALL have `category: "condition"`, a display `name`, and a
`description` that summarises that edition's rules text. Entries that are not SRD
conditions of that edition (such as `Dying` or `Surprised` in 5.5e, or per-level
`Exhaustion N` entries) SHALL NOT be present.

#### Scenario: Condition set matches the SRD
- **WHEN** the `url`s of the 5e condition list and of the 5.5e condition list are read
- **THEN** each is exactly the 15 `url`s above

#### Scenario: Non-SRD 5.5e entries are gone
- **WHEN** the 5.5e condition list is searched for `Dying` or `Surprised`
- **THEN** no entry matches

#### Scenario: url matches the icon and API naming
- **WHEN** a condition with `url` `u` is displayed with its icon
- **THEN** the icon class is `hki-u` and `u` equals the HK API condition `url` for that condition

### Requirement: Exhaustion is a single leveled condition

In both editions Exhaustion SHALL be one definition with `url` `exhaustion` that stacks by
level: applying it to a holder that already has it raises the level instead of adding a
second instance. The level SHALL start at 1, SHALL NOT exceed 6, SHALL drop by 1 when the
holder finishes a Long Rest, and the condition SHALL end when the level reaches 0. At
level 6 the holder dies.

#### Scenario: Re-applying raises the level
- **WHEN** the Exhaustion definition's stacking and level settings are read
- **THEN** stacking is by level, the initial level is 1 and the maximum is 6

#### Scenario: Long Rest removes a level
- **WHEN** the Exhaustion definition's level settings are read
- **THEN** a Long Rest changes the level by −1 and the condition is removed at level 0

#### Scenario: Level 6 is death
- **WHEN** the Exhaustion sub-effects active at level 6 are collected, in either edition
- **THEN** they include a death outcome, and no death outcome is active at levels 1–5

### Requirement: 5e Exhaustion applies the 2014 cumulative rows

The 5e Exhaustion definition SHALL express the 2014 table as sub-effects that become
active from a given level and stay active at higher levels: level 1 Disadvantage on
ability checks; level 2 Speed halved; level 3 Disadvantage on attack rolls and saving
throws; level 4 Hit Point maximum halved; level 5 Speed 0; level 6 death.

#### Scenario: Level 3 is cumulative
- **WHEN** the 5e Exhaustion sub-effects active at level 3 are collected
- **THEN** they are Disadvantage on ability checks, Speed halved, and Disadvantage on attack rolls and saving throws, and nothing else

### Requirement: 5.5e Exhaustion scales with level

The 5.5e Exhaustion definition SHALL express the 2024 rule as level-scaled values: each D20
Test is reduced by 2 × level and Speed is reduced by 5 × level feet. It SHALL NOT impose
Disadvantage on any roll.

#### Scenario: Level 3 penalties
- **WHEN** the 5.5e Exhaustion sub-effects are evaluated at level 3
- **THEN** D20 Tests get −6, Speed gets −15 ft, and no sub-effect is Disadvantage

### Requirement: Conditions that include Incapacitated reference it

In both editions, Paralyzed, Petrified, Stunned and Unconscious SHALL reference the
Incapacitated condition by its `url` (an `includes` sub-effect) instead of restating
Incapacitated's rules, so their holders have exactly the mechanics of that edition's
Incapacitated for as long as the including condition lasts. Unconscious SHALL also leave
the holder Prone, and that Prone SHALL remain after Unconscious ends. Every condition
reference SHALL resolve to a definition `url` in the same edition, and following
references SHALL never lead back to the starting condition.

#### Scenario: Paralyzed carries Incapacitated
- **WHEN** the 5.5e Paralyzed definition is resolved with its references
- **THEN** the result contains the 5.5e Incapacitated mechanics (no actions, Bonus Actions, Reactions or speech; Concentration broken; Disadvantage on Initiative) without Paralyzed listing them itself

#### Scenario: A fix to Incapacitated propagates
- **WHEN** the Incapacitated definition of an edition changes
- **THEN** Paralyzed, Petrified, Stunned and Unconscious of that edition resolve to the changed mechanics with no edit of their own

#### Scenario: Unconscious leaves the holder Prone
- **WHEN** the Unconscious definition of either edition is read
- **THEN** it includes Incapacitated and applies Prone as a separate condition when Unconscious is applied, so Prone is not removed when Unconscious ends

#### Scenario: References resolve and don't cycle
- **WHEN** every condition reference in an edition's lists is followed
- **THEN** each resolves to a `url` in the same edition and no chain returns to its start

### Requirement: 5.5e conditions follow the SRD 5.2.1 rules

The 5.5e condition definitions SHALL encode the 2024 rules where they differ from 2014:

- Incapacitated: no actions, Bonus Actions or Reactions; can't speak; Concentration is
  broken; Disadvantage on Initiative.
- Invisible: Advantage on Initiative; Concealed (not affected by effects that require
  seeing it, unless the effect's creator can see it); attack rolls against it have
  Disadvantage and its attack rolls have Advantage, except against a creature that can see
  it.
- Grappled: Speed 0 and can't increase; Disadvantage on attack rolls against any target
  other than the grappler; ends when the grappler is Incapacitated.
- Stunned: Incapacitated, automatically fails Strength and Dexterity saves, attack rolls
  against it have Advantage — nothing about movement or speech beyond Incapacitated.

#### Scenario: Incapacitated breaks Concentration in 5.5e
- **WHEN** the 5.5e Incapacitated definition is read
- **THEN** it states Concentration is broken and has no text saying otherwise

#### Scenario: Grappled spares the grappler
- **WHEN** the 5.5e Grappled holder attacks the grappler
- **THEN** the Grappled Disadvantage on attack rolls does not apply, and it does apply when the holder attacks anyone else

#### Scenario: Invisible helps Initiative
- **WHEN** the 5.5e Invisible definition is read
- **THEN** it grants Advantage on Initiative

#### Scenario: 2024 Stunned has no extra movement rule
- **WHEN** the 5.5e Stunned definition is read
- **THEN** it has no Speed or speech sub-effect of its own and its description does not say "can't move" or "speak falteringly"

### Requirement: Grappled ends when the grappler is Incapacitated

In both editions the Grappled definition SHALL declare a definition-level end condition
that is true when the entity that applied the grapple has the `incapacitated` condition.

#### Scenario: Grappler becomes Incapacitated
- **WHEN** the entity that applied Grappled has the `incapacitated` condition
- **THEN** the Grappled definition's end condition evaluates true

### Requirement: SRD data can be validated with one command

The repository SHALL provide a command that checks all four SRD data files (effects and
conditions, both editions) against the effects schema and the cross-file rules in this
spec — unique `url`s per edition, no `key` or duration fields, every condition reference
resolves in the same edition, no reference cycles — and exits non-zero with a readable list of
problems when any check fails.

#### Scenario: Clean data passes
- **WHEN** the validation command is run on the committed data files
- **THEN** it reports no problems and exits with code 0

#### Scenario: A broken reference fails
- **WHEN** a condition references a `url` that doesn't exist in its edition and the command is run
- **THEN** it names the file, entry and missing `url` and exits non-zero
