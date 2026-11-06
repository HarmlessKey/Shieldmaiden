## MODIFIED Requirements

### Requirement: Effects are listed by source and campaign edition

Without a mode, the drawer SHALL list available effects in two groups, in this order: SRD
effects, custom effects. SRD conditions SHALL NOT be listed there; they are listed only in
conditions mode. The SRD effects and conditions SHALL be the ones fetched from the HK API
for the encounter's campaign edition (`"5e"` or `"5.5e"`): the effects without `edition` and
those with the campaign edition, and that edition's conditions. The entity's own edition SHALL NOT affect which SRD definitions are listed. Custom
effects SHALL be the signed-in user's custom effects and SHALL be listed for every edition.
When no user is signed in (demo) or the user has no custom effects, the custom group SHALL
be omitted. Entries within a group SHALL be sorted by name. Conditions SHALL show their
condition icon. When there are several groups, each SHALL be a tab with its number of entries
(Effects, Custom). A list SHALL show at most 10 entries at a time, with pagination.

#### Scenario: 5e campaign lists 2014 definitions
- **WHEN** the drawer is opened without a mode in an encounter of a campaign with edition `"5e"`
- **THEN** the SRD effects group lists the effects with `edition: "5e"` (Concentration with the 2014 description) and the effects without `edition` (Armor Class Bonus), and no conditions group is shown

#### Scenario: 5.5e campaign lists 2024 definitions
- **WHEN** the drawer is opened in an encounter of a campaign with edition `"5.5e"`
- **THEN** the SRD groups list the 5.5e definitions, e.g. Concentration with the 2024 description, and in conditions mode Exhaustion with the 2024 description

#### Scenario: Other edition's effects are hidden
- **WHEN** the drawer is opened in a `"5e"` campaign
- **THEN** Burning (`edition: "5.5e"`) is not listed, and no `url` is listed twice

#### Scenario: Campaign without edition
- **WHEN** the campaign has no edition set
- **THEN** the drawer lists the 5e definitions

#### Scenario: Demo encounter uses 5.5e
- **WHEN** the drawer is opened in the demo encounter
- **THEN** the SRD groups list the 5.5e definitions and no custom group is shown

#### Scenario: Custom effects are edition-agnostic
- **WHEN** a signed-in user with custom effects opens the drawer in a `"5e"` and in a `"5.5e"` campaign
- **THEN** both show the same custom effects group

#### Scenario: API not reachable
- **WHEN** the SRD definitions couldn't be fetched and the drawer is opened
- **THEN** the SRD effects group is omitted, the custom effects are listed, and conditions mode says the conditions couldn't be loaded

## ADDED Requirements

### Requirement: Effect lists have a name search

Every list to pick an effect from SHALL have a search field that filters it by name:
- the encounter's Effects drawer, without a mode and in conditions mode
- the campaign's Effects drawer
- the effect pickers of the effect, NPC and spell forms
- the reminder form's effect select
- the custom effects list under My content

The search SHALL match a part of the name, ignoring case and accents. It SHALL filter all of
the list's groups at once: conditions, SRD effects and custom effects. A group without
matches SHALL be hidden. An empty search SHALL show the whole list. When nothing matches, the
list SHALL say so. The search SHALL filter what is already loaded and SHALL NOT request
anything.

#### Scenario: Search in the drawer
- **WHEN** the DM types "bless" in the Effects drawer's search
- **THEN** only Bless is listed in the SRD effects tab, and a custom effect "Blessing of the Forge" in the Custom tab

#### Scenario: Case and accents
- **WHEN** the DM types "ENERVATION" and the user has a custom effect "Énervation"
- **THEN** "Énervation" is listed

#### Scenario: Nothing found
- **WHEN** the search matches no effect
- **THEN** the drawer shows that no effects match, with no empty groups

#### Scenario: Picker
- **WHEN** the user types "incap" in an Includes sub-effect's effect picker
- **THEN** Incapacitated is offered
