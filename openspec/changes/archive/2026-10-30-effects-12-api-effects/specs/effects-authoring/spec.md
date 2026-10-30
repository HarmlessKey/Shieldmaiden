## MODIFIED Requirements

### Requirement: Constants stay in sync with the schema, the SRD data and the database rules

A check SHALL fail and name each problem when:
- a value of a schema enum the form offers has no constants entry, or a constants entry
  isn't in the schema
- a type/sub-type pair used in the SRD effects or conditions (as the HK API serves them, both
  editions) isn't allowed by the constants
- a choice kind used in the SRD data, alone or in a list, isn't in the constants
- the duration types accepted by the `effects` blocks in the database rules differ from the
  schema's `duration.type` enum

The SRD data SHALL be read from the HK API by default, or from JSON files given on the
command line. When the rules file isn't available, the check SHALL skip the rules part with
a warning. When the API can't be reached and no file is given, the check SHALL fail and say
so.

#### Scenario: New schema enum value
- **WHEN** a trigger is added to the schema without a constants entry
- **THEN** the check fails and names the trigger

#### Scenario: Rules regex out of date
- **WHEN** the schema has a duration type that a rules regex doesn't accept
- **THEN** the check fails and names the rules path and the missing type

#### Scenario: Rules file missing
- **WHEN** the rules repo isn't next to this repo
- **THEN** the check warns that the rules part was skipped, and still checks the rest

#### Scenario: Shared SRD file is checked
- **WHEN** an effect the API serves as `"generic"` uses a type/sub-type pair the constants don't allow
- **THEN** the check fails and names the entry

#### Scenario: API unreachable
- **WHEN** the API can't be reached and no effects file is given
- **THEN** the check fails and says that the SRD effects couldn't be read
