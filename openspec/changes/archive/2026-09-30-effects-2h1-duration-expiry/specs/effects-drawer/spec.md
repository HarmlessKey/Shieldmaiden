## MODIFIED Requirements

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

## ADDED Requirements

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
