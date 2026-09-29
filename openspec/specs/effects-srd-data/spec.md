# effects-srd-data Specification

## Purpose

Defines the SRD effect definitions the app ships per rules edition (5e / 2014 and
5.5e / 2024), which the effects engine resolves by `source: "srd"` + `key` against the
campaign's edition. Starts with Concentration.

## Requirements

### Requirement: SRD effect definitions exist per edition with shared keys

The system SHALL ship an SRD effect definition list for each supported edition (`"5e"`
and `"5.5e"`). Every definition SHALL have a `key`, and a definition that exists in
both editions SHALL use the same `key` in both lists. Every definition SHALL validate
against `src/schemas/hk-effects-schema.json` and SHALL NOT carry duration fields
(`duration_type`, `duration_value`, `cancel_trigger`).

#### Scenario: Concentration is resolvable in both editions
- **WHEN** an effect instance with `source: "srd"` and `source_key: "concentration"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's list returns exactly one definition with `key: "concentration"`

#### Scenario: Definitions validate against the effects schema
- **WHEN** every entry of the 5e and 5.5e SRD effect lists is validated against the effects schema
- **THEN** all entries pass with no errors and none contains a duration field

### Requirement: Concentration save on damage uses a structured, capped DC in 5.5e

The 5.5e Concentration definition SHALL express the saving throw made when the holder
takes damage as a structured save on a `damage_taken`-triggered sub-effect: a
Constitution save with DC equal to half the damage taken (rounded down) or 10,
whichever is higher, to a maximum of 30. A failed save ends Concentration. The
sub-effect SHALL keep a human-readable description stating the same rule.

#### Scenario: Small hit uses the DC 10 floor
- **WHEN** a 5.5e holder of Concentration takes 13 damage
- **THEN** the definition yields a Constitution save with DC 10

#### Scenario: Large hit uses half the damage
- **WHEN** a 5.5e holder of Concentration takes 45 damage
- **THEN** the definition yields a Constitution save with DC 22

#### Scenario: DC is capped at 30
- **WHEN** a 5.5e holder of Concentration takes 80 damage
- **THEN** the definition yields a Constitution save with DC 30, not 40

### Requirement: Concentration save on damage in 5e has no DC cap

The 5e Concentration definition SHALL express the same structured Constitution save on
`damage_taken` (DC 10 or half the damage taken, rounded down, whichever is higher)
without a maximum, matching the 2014 rules.

#### Scenario: 2014 DC is not capped
- **WHEN** a 5e holder of Concentration takes 80 damage
- **THEN** the definition yields a Constitution save with DC 40

### Requirement: Concentration ends when the holder is Incapacitated

The Concentration definition in both editions SHALL declare a definition-level end
condition that is true when the holder has the `incapacitated` condition. Until
conditions move onto the effects model, this check SHALL be answerable from the
holder's existing conditions map, using the condition key `"incapacitated"`.

#### Scenario: Holder becomes Incapacitated
- **WHEN** the holder of Concentration has `incapacitated` in its conditions
- **THEN** the definition's end condition evaluates true, meaning Concentration ends

#### Scenario: Holder is not Incapacitated
- **WHEN** the holder of Concentration has no `incapacitated` condition (other conditions such as `prone` may be present)
- **THEN** the definition's end condition evaluates false

### Requirement: Concentration ends at 0 HP

The Concentration definition in both editions SHALL keep an `on_zero_hp`-triggered
sub-effect stating that Concentration is broken, so dropping to 0 HP ends it even when
the Unconscious/Incapacitated condition has not been set on the entity.

#### Scenario: Holder drops to 0 HP
- **WHEN** the holder of Concentration reaches 0 HP
- **THEN** the definition contains an `on_zero_hp` sub-effect that breaks Concentration

### Requirement: Concentration description matches the edition's rules text

Each edition's Concentration `description` SHALL summarise that edition's rules: ends
on casting another Concentration spell, failing the damage save, being Incapacitated,
or dying; the 5.5e text SHALL state the DC maximum of 30.

#### Scenario: 5.5e description mentions the cap
- **WHEN** the 5.5e Concentration definition is displayed
- **THEN** its description states the save DC maximum of 30 and that Incapacitated ends Concentration
