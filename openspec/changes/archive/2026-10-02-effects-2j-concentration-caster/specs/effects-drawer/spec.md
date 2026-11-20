## ADDED Requirements

### Requirement: The application form chooses the caster

The application form SHALL have a **Caster** select listing every entity in the encounter by
name, plus "None". It SHALL default to the entity whose turn it is, or "None" when no entity
has the turn. The chosen caster SHALL be the caster of every instance created by that
application, of its Concentration options (effects-concentration) and its Concentration
link. Formulas that read the caster use it. Shift+click, which applies without the form,
SHALL use the default caster.

#### Scenario: Reaction out of turn
- **WHEN** it is `npc_1`'s turn and the DM applies an effect with Lyra (`player_1`) chosen as the caster
- **THEN** the instance has `caster_key: "player_1"` and `caster_name: "Lyra"`

#### Scenario: Before combat
- **WHEN** no entity has the turn and the DM opens the application form
- **THEN** the caster is "None", and choosing Lyra gives the instance `caster_key: "player_1"`

#### Scenario: Heroism from the chosen caster
- **WHEN** the DM applies Heroism with an Archmage (Intelligence +5) chosen as the caster, during another creature's turn
- **THEN** the temporary hit points offered at the start of the target's turn are 5

## MODIFIED Requirements

### Requirement: Applying creates an active effect instance per target

Applying SHALL create, for each target, an active effect instance with a newly generated
key unique within that entity's effects, and SHALL add it to that entity's effects in the
running encounter. The instance SHALL contain:
- `name` (the definition's display name)
- `source` (`"srd"` for SRD conditions and effects, `"custom"` for custom effects)
- `source_key` (the SRD definition's `url`, or the custom effect's id)
- `duration`
- `applied_round` (the current round, 0 before combat starts)
- `caster_key` and `caster_name`: the key and name of the chosen caster, both omitted for
  "None"
- `applied_turn_key`: the key of the entity whose turn it is, omitted when no entity has the
  turn

It SHALL also contain `choices`, `save_dc`, `level`, `rounds_remaining` and
`concentration_id` where the application provides them. The instance SHALL NOT contain the
definition's `sub_effects`, `description` or `cancelable`. Every created instance SHALL be
valid against the effects schema's active instance shape. An SRD condition other than
Exhaustion that a target already has SHALL NOT be added a second time to that target. Other
effects SHALL be added as a new instance on every apply.

#### Scenario: Stunned applied to two targets
- **WHEN** it is round 3, `player_1` "Lyra" has the turn and is the caster, and the DM applies Stunned to `npc_1` and `npc_2`
- **THEN** each of `npc_1` and `npc_2` has a new instance `{ name: "Stunned", source: "srd", source_key: "stunned", duration: { type: "cancelled" }, caster_key: "player_1", caster_name: "Lyra", applied_turn_key: "player_1", applied_round: 3 }` under its own generated key

#### Scenario: Custom effect reference
- **WHEN** the DM applies the custom effect with id `-Nx12` named "Burning"
- **THEN** the instance has `source: "custom"`, `source_key: "-Nx12"` and `name: "Burning"`

#### Scenario: Condition already present
- **WHEN** the DM applies Prone to `npc_1` (already Prone) and `npc_2` (not Prone)
- **THEN** `npc_1` keeps its single Prone instance and `npc_2` gets a new Prone instance

#### Scenario: Applied before combat starts
- **WHEN** the DM applies an effect in round 0 with no entity having the turn and the caster "None"
- **THEN** the instance has `applied_round: 0` and no `caster_key`, `caster_name` or `applied_turn_key`

#### Scenario: Caster other than the active entity
- **WHEN** it is `npc_1`'s turn and the DM applies an effect with `player_1` as the caster
- **THEN** the instance has `caster_key: "player_1"` and `applied_turn_key: "npc_1"`

### Requirement: Application can link the effect to the caster's Concentration

For a duration type other than `concentration`, when the chosen caster has an active
Concentration instance, the application form SHALL offer an option "Ends with <caster>'s
Concentration", off by default. When on, every created instance SHALL have
`concentration_id` set to the key of that Concentration instance. When the caster has no
Concentration instance, or the caster is "None", the option SHALL NOT be shown.

For the `concentration` duration type, the Concentration options of effects-concentration
SHALL be offered instead: start, share, replace or link to the caster's Concentration.

#### Scenario: Ongoing effect linked to Concentration
- **WHEN** `player_1` is the caster, has a Concentration instance `eff_5c10`, and the DM applies an effect until removed to `npc_1` with the option on
- **THEN** the instance has `concentration_id: "eff_5c10"` and `caster_key: "player_1"`

#### Scenario: Hex linked to Concentration
- **WHEN** `player_1` is the caster, concentrates on Hex with Concentration `eff_5c10`, and the DM applies Hex to another creature with duration Concentration
- **THEN** the Hex instance has `concentration_id: "eff_5c10"`, shared as in effects-concentration

#### Scenario: No Concentration on the caster
- **WHEN** the chosen caster has no Concentration instance and the duration isn't Concentration
- **THEN** the application form shows no Concentration option and the instance has no `concentration_id`
