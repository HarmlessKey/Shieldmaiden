## REMOVED Requirements

### Requirement: Drawer opens for the targeted entities
**Reason**: The legacy Conditions drawer it kept available is removed. The Conditions option now opens this drawer in conditions mode.
**Migration**: Replaced by "Drawer opens for the targeted entities and from the Conditions option", which keeps every other rule and scenario.

## MODIFIED Requirements

### Requirement: Effects are listed by source and campaign edition

Without a mode, the drawer SHALL list available effects in two groups, in this order: SRD
effects, custom effects. SRD conditions SHALL NOT be listed there; they are listed only in
conditions mode. The SRD groups SHALL come from the local SRD data of the encounter's
campaign edition (`"5e"` or `"5.5e"`); the entity's own edition SHALL NOT affect which SRD
definitions are listed. Custom effects SHALL be the signed-in user's custom effects and
SHALL be listed for every edition. When no user is signed in (demo) or the user has no
custom effects, the custom group SHALL be omitted. Entries within a group SHALL be sorted
by name. Conditions SHALL show their condition icon.

#### Scenario: 5e campaign lists 2014 definitions
- **WHEN** the drawer is opened without a mode in an encounter of a campaign with edition `"5e"`
- **THEN** the SRD effects group lists the 5e effects (Concentration), and no conditions group is shown

#### Scenario: 5.5e campaign lists 2024 definitions
- **WHEN** the drawer is opened in an encounter of a campaign with edition `"5.5e"`
- **THEN** the SRD groups list the 5.5e definitions, e.g. Concentration with the 2024 description, and in conditions mode Exhaustion with the 2024 description

#### Scenario: Campaign without edition
- **WHEN** the campaign has no edition set
- **THEN** the drawer lists the 5e definitions

#### Scenario: Demo encounter uses 5.5e
- **WHEN** the drawer is opened in the demo encounter
- **THEN** the SRD groups list the 5.5e definitions and no custom group is shown

#### Scenario: Custom effects are edition-agnostic
- **WHEN** a signed-in user with custom effects opens the drawer in a `"5e"` and in a `"5.5e"` campaign
- **THEN** both show the same custom effects group

### Requirement: Conditions-only mode

The drawer SHALL accept a mode that limits the list to SRD conditions. In conditions mode
only the SRD conditions group SHALL be shown, listing the 15 conditions of the campaign
edition's condition data. The SRD effects and custom effects groups SHALL NOT be shown.
Without a mode the SRD conditions group SHALL NOT be shown.

#### Scenario: Conditions mode
- **WHEN** the drawer is opened in conditions mode
- **THEN** only the SRD conditions group is listed

#### Scenario: Effects option lists no conditions
- **WHEN** the DM opens the drawer with the Effects option
- **THEN** no SRD conditions are listed, only SRD and custom effects

## ADDED Requirements

### Requirement: Drawer opens for the targeted entities and from the Conditions option

The tracker SHALL offer an "Effects" option wherever the Conditions and Reminders options
are offered for targeted entities (the targeted-entity options bar with a keyboard
shortcut, the per-entity target menu, and the mobile menu). Choosing it SHALL open the
Effects drawer for the targeted entities, or for the entity keys passed to the drawer when
opened from a single entity's menu. The drawer SHALL list its targets at the top. With no
targets it SHALL show a prompt to select one or more targets and SHALL NOT offer apply
actions. The Conditions option SHALL stay in the same places, with the same keyboard
shortcut, and SHALL open the Effects drawer in conditions mode for the same targets. There
SHALL be no separate legacy Conditions drawer.

#### Scenario: Open from the options bar
- **WHEN** the DM has targeted two entities and chooses the Effects option
- **THEN** the Effects drawer opens listing both entities as targets

#### Scenario: Open from an entity's menu
- **WHEN** the DM chooses Effects from one entity's target menu
- **THEN** the drawer opens with only that entity as target, regardless of the current targeting

#### Scenario: No targets
- **WHEN** the drawer is open and no entity is targeted
- **THEN** it shows a prompt to select targets and no effect can be applied

#### Scenario: Conditions option opens conditions mode
- **WHEN** the DM has targeted an entity and chooses Conditions (or presses its shortcut)
- **THEN** the Effects drawer opens in conditions mode for that entity, listing only the SRD conditions

#### Scenario: Conditions from an entity's menu
- **WHEN** the DM chooses Conditions from one entity's target menu or from the mobile menu
- **THEN** the Effects drawer opens in conditions mode with only that entity as target
