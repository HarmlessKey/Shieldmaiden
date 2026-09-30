# effects-drawer Specification

## Purpose

The combat tracker's Effects drawer: where a DM chooses an SRD condition, SRD effect or
custom effect for the campaign's rules edition, fills in how it is applied, and applies or
removes the resulting active effect instances on the targeted entities.

## Requirements

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

### Requirement: Effect details are expandable

Each listed effect SHALL be expandable to show its description and the descriptions of
its sub-effects. For Exhaustion the expanded view SHALL also show the per-level table of
the campaign edition. For a custom effect the full definition SHALL be loaded when it is
first expanded or applied; if it cannot be loaded, the entry SHALL show that no details are
available and SHALL still be applicable by name.

#### Scenario: Expand a condition
- **WHEN** the DM expands Prone
- **THEN** the drawer shows Prone's description and a line per sub-effect

#### Scenario: Expand Exhaustion
- **WHEN** the DM expands Exhaustion in a `"5.5e"` campaign
- **THEN** the drawer shows the description and the 2024 per-level table

#### Scenario: Custom effect details missing
- **WHEN** the DM expands a custom effect whose full definition cannot be loaded
- **THEN** the entry says no details are available and can still be applied

### Requirement: The apply button opens the application form, shift+click applies directly

Each listed effect SHALL have an apply button. Clicking it SHALL open the application form
(duration, repeat save, choices, Exhaustion level and, when offered, the Concentration
link) in a popover next to the button. Applying from the popover SHALL apply the effect to
all targets and close the popover. Cancelling, or clicking outside the popover, SHALL close
it without applying anything.

Shift+clicking the apply button SHALL apply the effect directly to all targets with
duration "until removed", without opening the form. When the effect needs a choice, a
shift+click SHALL open the popover instead. For Exhaustion, a shift+click SHALL apply the
default level (the targets' highest current level plus one, capped at 6, or 1).

The application form SHALL only be reachable through the apply button. Expanding an entry
SHALL show its details only.

#### Scenario: Click opens the form
- **WHEN** the DM clicks the apply button of Prone with two targets
- **THEN** a popover with the application form opens and nothing is applied yet

#### Scenario: Apply from the popover
- **WHEN** the DM sets a duration of 2 rounds in the popover and chooses Apply
- **THEN** both targets get a Prone instance with that duration and the popover closes

#### Scenario: Cancel
- **WHEN** the DM opens the popover and clicks outside it
- **THEN** the popover closes and no effect is applied

#### Scenario: Shift+click applies until removed
- **WHEN** the DM shift+clicks the apply button of Prone
- **THEN** Prone is applied to the targets with `duration: { type: "cancelled" }` and no popover opens

#### Scenario: Shift+click on an effect that needs a choice
- **WHEN** the DM shift+clicks the apply button of an effect whose sub-effect has `choice: "ability"`
- **THEN** the popover opens so the ability can be chosen, and nothing is applied yet

#### Scenario: Shift+click on Exhaustion
- **WHEN** the DM shift+clicks the apply button of Exhaustion for a target at level 2
- **THEN** that target's Exhaustion becomes level 3 without a popover

#### Scenario: Expanding shows details only
- **WHEN** the DM expands an entry
- **THEN** its description and sub-effects are shown, and there is no application form or "Apply with options" button

### Requirement: Application captures duration

Applying an effect SHALL let the DM set its duration. The duration SHALL be captured at
application time and never read from the definition. Supported duration types SHALL be:
until removed (`cancelled`), a number of rounds/minutes/hours (`time`), concentration with
an optional maximum (`concentration`), until the start or end of the caster's or target's
next turn (`next_turn`, with `anchor` `caster`/`target` and `edge` `start`/`end`,
defaulting to caster/start), and until the end of the current turn (`end_of_turn`). The
default SHALL be `cancelled`. For a `time` duration the value SHALL be a positive integer.

#### Scenario: Condition applied without a duration
- **WHEN** the DM applies Prone without changing the duration
- **THEN** the resulting instance has `duration: { type: "cancelled" }`

#### Scenario: Timed effect
- **WHEN** the DM applies a custom Burning effect with duration 10 rounds
- **THEN** the instance has `duration: { type: "time", value: 10, unit: "round" }` and `rounds_remaining: 10`

#### Scenario: Minutes are converted to rounds
- **WHEN** the DM applies an effect with duration 1 minute
- **THEN** the instance has `duration: { type: "time", value: 1, unit: "minute" }` and `rounds_remaining: 10`

#### Scenario: Next-turn duration anchored to the target
- **WHEN** the DM applies Frightened "until the end of the target's next turn"
- **THEN** the instance has `duration: { type: "next_turn", anchor: "target", edge: "end" }`

#### Scenario: Invalid time value
- **WHEN** the DM chooses a `time` duration and enters 0 or leaves the value empty
- **THEN** the effect cannot be applied until a positive value is entered

### Requirement: Application captures an optional repeat save

The DM SHALL be able to add a repeat save to an application: the save ability, the DC
(a positive integer) and when the save is repeated (default: end of the target's turn;
also start of the target's turn and when it takes damage). With a repeat save, the DM
SHALL also be able to set:
- the number of successes needed to end the effect (a positive integer, default 1)
- an escalation: after a number of failures (a positive integer), the effect becomes an SRD
  condition of the campaign edition
- a time after which the save succeeds automatically (a positive integer with a unit of
  rounds, minutes or hours)

The save ability and DC SHALL be entered at application time and not read from the
definition. Without a repeat save the instance SHALL carry no save fields. Extras left at
their defaults SHALL NOT be stored.

#### Scenario: Hold-Person-style save
- **WHEN** the DM applies Paralyzed with a Wisdom repeat save DC 15 at the end of the target's turn
- **THEN** the instance has `duration.save: { ability: "wisdom", triggers: ["end_turn_target"] }` and `save_dc: 15`

#### Scenario: No repeat save
- **WHEN** the DM applies Prone without a repeat save
- **THEN** the instance has neither `duration.save` nor `save_dc`

#### Scenario: Flesh-to-Stone-style save
- **WHEN** the DM applies Restrained with a Constitution save DC 15, 3 successes needed, and "after 3 failures it becomes Petrified"
- **THEN** the instance has `duration.save: { ability: "constitution", triggers: ["end_turn_target"], successes_to_end: 3, failures_to_escalate: 3, escalate: { effect: { source: "srd", source_key: "petrified", name: "Petrified" } } }`

#### Scenario: Automatic success
- **WHEN** the DM sets "succeeds automatically after 1 minute"
- **THEN** the instance's save has `auto_success_after: { value: 1, unit: "minute" }`

### Requirement: Application asks for the definition's choices

When an effect's definition has sub-effects whose value comes from a caster choice
(ability, damage type, skill, condition, creature type, or a free option) or a roll whose
damage type is chosen from a list, the application SHALL ask for each distinct choice and
SHALL NOT allow applying until every choice has a value. Ability, damage type, skill,
condition and creature type choices SHALL be picked from the corresponding fixed lists; a
damage type choice limited by a roll's list SHALL only offer those types; an option choice
SHALL be free text. The values SHALL be stored in the instance's `choices` keyed by choice
kind. Effects without choices SHALL NOT show choice inputs and SHALL NOT carry `choices`.

#### Scenario: Hex asks for an ability
- **WHEN** the DM applies an effect whose sub-effect has `choice: "ability"` and picks Wisdom
- **THEN** the instance has `choices: { ability: "wisdom" }`

#### Scenario: Missing choice blocks apply
- **WHEN** an effect requires a damage type choice and none is picked
- **THEN** the effect cannot be applied

#### Scenario: Conditions have no choices
- **WHEN** the DM applies Blinded
- **THEN** no choice inputs are shown and the instance has no `choices`

### Requirement: Exhaustion is applied as one leveled instance

Applying Exhaustion SHALL ask for a level from 1 to 6. For a target without Exhaustion the
level SHALL default to 1 and one Exhaustion instance with that `level` SHALL be created. For
a target that already has Exhaustion, applying SHALL update the level of its existing
instance instead of adding a second instance; the default SHALL be its current level plus
one, capped at 6. When several targets have different current levels, the chosen level
SHALL be set on each of them. The drawer SHALL show each target's current Exhaustion level.

#### Scenario: First level of Exhaustion
- **WHEN** the DM applies Exhaustion to a target without Exhaustion, keeping the default
- **THEN** the target has one Exhaustion instance with `level: 1`

#### Scenario: Exhaustion increments
- **WHEN** the DM applies Exhaustion to a target whose Exhaustion instance has `level: 2`, keeping the default
- **THEN** that same instance now has `level: 3` and the target still has exactly one Exhaustion instance

#### Scenario: Level is capped
- **WHEN** a target has Exhaustion level 6
- **THEN** the default level offered is 6 and no level above 6 can be chosen

### Requirement: Applying creates an active effect instance per target

Applying SHALL create, for each target, an active effect instance with a newly generated
key unique within that entity's effects, and SHALL add it to that entity's effects in the
running encounter. The instance SHALL contain `name` (the definition's display name),
`source` (`"srd"` for SRD conditions and effects, `"custom"` for custom effects),
`source_key` (the SRD definition's `url`, or the custom effect's id), `duration`,
`applied_round` (the current round, 0 before combat starts), and `caster_key` and
`caster_name` (the key and name of the entity whose turn it is, both omitted when no entity
has the turn). It SHALL also contain `choices`, `save_dc`, `level`, `rounds_remaining` and
`concentration_id` where the application provides them. The instance SHALL NOT contain the
definition's `sub_effects`, `description` or `cancelable`. Every created instance SHALL be
valid against the effects schema's active instance shape. An SRD condition other than
Exhaustion that a target already has SHALL NOT be added a second time to that target. Other
effects SHALL be added as a new instance on every apply.

#### Scenario: Stunned applied to two targets
- **WHEN** it is round 3, `player_1` "Lyra" has the turn, and the DM applies Stunned to `npc_1` and `npc_2`
- **THEN** each of `npc_1` and `npc_2` has a new instance `{ name: "Stunned", source: "srd", source_key: "stunned", duration: { type: "cancelled" }, caster_key: "player_1", caster_name: "Lyra", applied_round: 3 }` under its own generated key

#### Scenario: Custom effect reference
- **WHEN** the DM applies the custom effect with id `-Nx12` named "Burning"
- **THEN** the instance has `source: "custom"`, `source_key: "-Nx12"` and `name: "Burning"`

#### Scenario: Condition already present
- **WHEN** the DM applies Prone to `npc_1` (already Prone) and `npc_2` (not Prone)
- **THEN** `npc_1` keeps its single Prone instance and `npc_2` gets a new Prone instance

#### Scenario: Applied before combat starts
- **WHEN** the DM applies an effect in round 0 with no entity having the turn
- **THEN** the instance has `applied_round: 0` and no `caster_key` or `caster_name`

### Requirement: Applied effects can be removed from the drawer

For each listed effect the drawer SHALL show whether all, some or none of the targets have
an instance of it. The DM SHALL be able to remove an effect from the targets, which removes
every instance of that definition (same `source` and `source_key`) from each target.
Removing Exhaustion SHALL remove the instance regardless of its level.

#### Scenario: Remove a condition from all targets
- **WHEN** both targets are Prone and the DM removes Prone
- **THEN** neither target has a Prone instance

#### Scenario: Partial presence is shown
- **WHEN** one of two targets is Poisoned
- **THEN** the Poisoned entry indicates that some, not all, targets have it

### Requirement: Application can link the effect to the caster's Concentration

When the entity whose turn it is has an active Concentration instance, the application
form SHALL offer an option "Ends with <caster>'s Concentration". It SHALL be on by
default when the chosen duration type is `concentration`, and off otherwise. When on, every
created instance SHALL have `concentration_id` set to the key of that Concentration
instance. When the caster has no Concentration instance, or no entity has the turn, the
option SHALL NOT be shown.

#### Scenario: Hex linked to Concentration
- **WHEN** it is `player_1`'s turn, `player_1` has a Concentration instance `eff_5c10`, and the DM applies a custom Hex effect to `npc_1` with duration Concentration
- **THEN** the option is on and the Hex instance has `concentration_id: "eff_5c10"` and `caster_key: "player_1"`

#### Scenario: No Concentration on the caster
- **WHEN** the entity whose turn it is has no Concentration instance
- **THEN** the application form shows no Concentration option and the instance has no `concentration_id`

### Requirement: Application captures an optional escape

The DM SHALL be able to add an escape to an application: the escape DC (a positive integer),
the allowed checks (Strength (Athletics) and/or Dexterity (Acrobatics), both by default),
and who may attempt it (the holder, the holder or a creature within reach, or anyone;
default the holder). The escape SHALL be stored as `duration.escape`. Without it, the
instance SHALL carry no escape.

#### Scenario: Grappled with escape DC
- **WHEN** the DM applies Grappled with escape DC 14 and the default checks
- **THEN** the instance has `duration.escape: { dc: 14, checks: [{ ability: "strength", skill: "athletics" }, { ability: "dexterity", skill: "acrobatics" }] }`

#### Scenario: No escape
- **WHEN** the DM applies Prone without an escape
- **THEN** the instance has no `duration.escape`
