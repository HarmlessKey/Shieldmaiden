## MODIFIED Requirements

### Requirement: SRD definitions exist per edition with a shared url

The SRD effect and condition definitions SHALL be served by the HK API per edition, at
`/v2/effects/5e` and `/v2/effects/5.5e`. An edition's list holds:
- the effects of that edition's rules
- the effects used in both editions, which the API marks `edition: "generic"`
- that edition's conditions, which the API marks `is_condition: true`

The app SHALL read the generic effects as effects without `edition`. It SHALL read the
conditions as that edition's condition list, without `edition`. It SHALL NOT bundle SRD
effect or condition lists of its own.

An effect definition that follows one edition's rules SHALL have `edition` set to that
edition and SHALL only be used in campaigns of that edition. An effect definition without
`edition` SHALL be used in campaigns of both editions. An edition's set of definitions is the
effects without `edition`, the effects with that `edition`, and that edition's conditions.

Every definition SHALL be identified by its `url`: the same unique identifier the HK API
uses for its content, not the API's uuid `_id`. It SHALL NOT carry a separate `key`. The app
SHALL drop the API's `_id` and `is_condition`. A definition that exists in both editions
SHALL use the same `url` in both editions. Within an edition's set, a `url` SHALL occur at
most once. So an effect without `edition` SHALL NOT share its `url` with an edition-specific
effect or a condition. Active effect instances SHALL reference a definition by
`source: "srd"` and a `source_key` equal to its `url`.

Every definition SHALL validate against `src/schemas/hk-effects-schema.json`. It SHALL NOT
carry duration fields (`duration_type`, `duration_value`, `cancel_trigger`), origin fields
(`category`, `spell_level`, `magical`, `tags`, `removed_by`, `area`) or `cancelable`. No
sub-effect SHALL carry `scaling`. Conditions SHALL NOT carry `edition` in the app: their
list already belongs to one edition.

#### Scenario: Concentration is resolvable in both editions
- **WHEN** an effect instance with `source: "srd"` and `source_key: "concentration"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's set returns exactly one definition with `url: "concentration"`, the one with that campaign's `edition`

#### Scenario: A condition is resolvable in both editions by the same url
- **WHEN** an effect instance with `source: "srd"` and `source_key: "prone"` is resolved for a `"5e"` campaign and for a `"5.5e"` campaign
- **THEN** each edition's set returns exactly one definition with `url: "prone"`, found in that edition's condition list

#### Scenario: An effect without edition is in both sets
- **WHEN** the sets of both editions are searched for `url: "reaction-used"`
- **THEN** each finds the same single definition, which has no `edition` (the API's `"generic"`)

#### Scenario: urls are unique within an edition
- **WHEN** the `url`s of an edition's set are combined
- **THEN** no `url` occurs more than once

#### Scenario: A generic effect can't shadow an edition-specific one
- **WHEN** an effect without `edition` has the same `url` as an effect with `edition: "5e"`
- **THEN** the SRD data validation fails and names the `url`

#### Scenario: No definition uses key
- **WHEN** the fetched SRD effects and conditions are read in the app
- **THEN** no definition has a `key`, `_id` or `is_condition` property, and no condition has `edition`

#### Scenario: Definitions validate against the effects schema
- **WHEN** every SRD effect and condition the API serves is validated against the effects schema
- **THEN** all entries pass with no errors and none contains a duration field, an origin field or a sub-effect with `scaling`

#### Scenario: No local lists
- **WHEN** the app's source is searched for SRD effect or condition lists
- **THEN** there are none: `src/data/effects.js`, `src/data/5e/conditions.js` and `src/data/5.5e/conditions.js` don't exist

### Requirement: Each edition ships exactly the SRD conditions

Each edition's condition list (the entries the API marks `is_condition`) SHALL contain
exactly these 15 conditions, one entry each, with `url` equal to the HK API condition `url`:
`blinded`, `charmed`, `deafened`, `exhaustion`, `frightened`, `grappled`, `incapacitated`,
`invisible`, `paralyzed`, `petrified`, `poisoned`, `prone`, `restrained`, `stunned`,
`unconscious`.

Every entry SHALL have a display `name` and a `description` that summarises that edition's
rules text. Being in the condition list is what makes a definition a condition; entries have
no `category`. Entries that are not SRD conditions of that edition SHALL NOT be present, such
as `Dying` or `Surprised` in 5.5e, or per-level `Exhaustion N` entries.

The app SHALL also keep these 15 `url`s as a fixed list. It uses that list to recognise a
condition (for its icon and for condition-only lists) when the API's data isn't there.

#### Scenario: Condition set matches the SRD
- **WHEN** the `url`s of the 5e condition list and of the 5.5e condition list are read
- **THEN** each is exactly the 15 `url`s above

#### Scenario: Non-SRD 5.5e entries are gone
- **WHEN** the 5.5e condition list is searched for `Dying` or `Surprised`
- **THEN** no entry matches

#### Scenario: url matches the icon and API naming
- **WHEN** a condition with `url` `u` is displayed with its icon
- **THEN** the icon class is `hki-u` and `u` equals the HK API condition `url` for that condition

#### Scenario: Recognised without the API
- **WHEN** the API couldn't be reached and an entity has an instance `{ source: "srd", source_key: "prone" }`
- **THEN** it's still shown as a condition with the Prone icon, by its stored name

### Requirement: SRD data can be validated with one command

The repository SHALL provide a command that checks the SRD effects and conditions against the
effects schema and the cross-list rules in this spec, per edition set:
- unique `url`s
- no `key` or duration fields
- `edition` only on effects, and only `"5e"` or `"5.5e"` (the API's `"generic"` read as
  none)
- every reference resolves in each edition set that contains the referencing entry
- no reference cycles
- exactly the 15 SRD conditions per edition

The data SHALL be read from the HK API by default. JSON files can be given instead, so the
API's data can be checked before it is published. The command SHALL exit non-zero with a
readable list of problems when any check fails, and also when the API can't be reached.

#### Scenario: Clean data passes
- **WHEN** the validation command is run against the API
- **THEN** it reports no problems and exits with code 0

#### Scenario: A broken reference fails
- **WHEN** a condition references a `url` that doesn't exist in its edition and the command is run
- **THEN** it names the edition, entry and missing `url` and exits non-zero

#### Scenario: A generic effect references an edition-only url
- **WHEN** an effect without `edition` references a `url` that only exists with `edition: "5.5e"`
- **THEN** the command reports the missing `url` for the 5e set and exits non-zero

#### Scenario: Data from files
- **WHEN** the command is given JSON files of the editions' lists instead of the API
- **THEN** it checks those lists

#### Scenario: API unreachable
- **WHEN** the API can't be reached and no files are given
- **THEN** the command says so and exits non-zero

## ADDED Requirements

### Requirement: The condition compendium reads the v2 conditions

The compendium's conditions (the list, a condition's page, the campaign resources
compendium) and the condition selects (`hk-condition-select`, the NPC form's condition
immunities) SHALL read the HK API's `/v2/conditions/{edition}`, `"5e"` or `"5.5e"`. The app
SHALL NOT read the old `/conditions` endpoints.

A condition SHALL be shown with its `description`, each of its sub-effects described in a
line as in the Effects drawer, and for Exhaustion the edition's level table. Its icon SHALL be
`hki-<url>`. A condition page's meta description SHALL be taken from its `description`.

#### Scenario: Compendium list
- **WHEN** the 5.5e conditions compendium is opened and "blin" is searched
- **THEN** Blinded is listed, from `/v2/conditions/5.5e`

#### Scenario: Condition page
- **WHEN** the page of the 5e condition Blinded is opened
- **THEN** it shows the 5e description, a line per sub-effect (Disadvantage on attack rolls) and the Blinded icon

#### Scenario: Exhaustion
- **WHEN** the page of Exhaustion is opened for an edition
- **THEN** it also shows that edition's level table

#### Scenario: Unknown condition
- **WHEN** a condition page is opened for a url that doesn't exist
- **THEN** it says the condition couldn't be found

#### Scenario: Condition select
- **WHEN** the NPC form's condition immunities are opened for a 5.5e NPC
- **THEN** the 15 conditions of `/v2/conditions/5.5e` are offered, each with its icon
