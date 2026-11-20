## ADDED Requirements

### Requirement: A new effect can start from a copy

Creating a custom effect SHALL work like creating an NPC or a spell: the form SHALL first ask
whether to copy an existing effect or create one from scratch, and while the effect is new
(not yet saved) its header SHALL have a Copy button that offers the same copy search. A
saved effect SHALL NOT offer Copy.

The copy search SHALL offer:
- **Custom**: the user's own custom effects, when they have any
- **SRD**: the SRD effects and the SRD conditions of an edition, `"5e"` or `"5.5e"`, chosen
  with an edition toggle

It SHALL search by name, matching a part of the name and ignoring case and accents, as the
other effect lists do. The SRD results SHALL come from the SRD lists the app already fetched,
without a request per search, sorted by name and paged. An empty search SHALL list the first
page. When the SRD lists couldn't be loaded, the SRD search SHALL say so.

Copying SHALL fill the form with the whole definition: name, description, sub-effects,
stacking, level, effect-wide condition, ends when, sustain and aura. The copy SHALL:
- keep the name as it is
- not carry the original's `url` or `edition`: a custom effect is used in every edition
- keep its references to other effects as they are, SRD `url`s and custom ids alike
- leave the original unchanged, wherever it came from
- be a new effect: the form shows unsaved changes, and Save adds a new custom effect

A copied condition SHALL be a custom effect like any other: it is not a condition (no
condition icon, not offered in the Conditions option).

#### Scenario: Create dialog
- **WHEN** the user opens a new custom effect
- **THEN** the form asks to copy an existing effect or create one from scratch

#### Scenario: Copy an SRD effect
- **WHEN** the user picks the SRD tab, the 5.5e edition, types "bless" and copies Bless
- **THEN** the form holds Bless's name, description and sub-effects, without `url` or `edition`, and shows unsaved changes

#### Scenario: Saving the copy
- **WHEN** the user changes the copied Bless's die to 1d6 and saves
- **THEN** a new custom effect "Bless" is added, and the SRD Bless is unchanged

#### Scenario: Copy a condition
- **WHEN** the user copies the 5e condition Grappled
- **THEN** the form holds Grappled's definition, and once saved it is listed with the custom effects, without a condition icon

#### Scenario: References are kept
- **WHEN** the user copies the 5.5e condition Paralyzed
- **THEN** its `includes` sub-effect still references the SRD condition `incapacitated`

#### Scenario: Copy a custom effect
- **WHEN** the user copies their own custom effect "Stoneskin"
- **THEN** the form holds its definition, and saving adds a second custom effect while the first is unchanged

#### Scenario: Copy button while creating
- **WHEN** the user chose Create from scratch and then clicks Copy in the header
- **THEN** the copy search opens in a dialog, and copying replaces what the form holds

#### Scenario: No Copy on a saved effect
- **WHEN** the user opens a saved custom effect
- **THEN** there is no Copy button and no create dialog

#### Scenario: SRD lists not loaded
- **WHEN** the SRD lists couldn't be fetched and the user opens the SRD tab
- **THEN** the search says the SRD effects couldn't be loaded, and the Custom tab still works
