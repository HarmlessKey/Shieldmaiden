## MODIFIED Requirements

### Requirement: Drawer opens for the targeted entities and from the Conditions option

The tracker SHALL offer an "Effects" option wherever the Conditions and Reminders options
are offered for targeted entities (the targeted-entity options bar with a keyboard
shortcut, the per-entity target menu, and the mobile menu), and so SHALL the set initiative
screen's Overview header for the entities targeted there. Choosing it SHALL open the
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

#### Scenario: From the set initiative screen
- **WHEN** the DM targets two entities in the set initiative screen's Overview and chooses Effects in its header
- **THEN** the Effects drawer opens listing both entities as targets
