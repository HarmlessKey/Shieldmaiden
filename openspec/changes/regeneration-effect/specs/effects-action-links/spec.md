## MODIFIED Requirements

### Requirement: An effect link stores the effect and how it is applied

The effects schema SHALL define an effect link with these fields, and no others:
- `effect` (required): a reference `{ source, source_key, name }` to an SRD condition, an SRD
  effect or a custom effect
- `duration`: a duration as applied in the tracker (type, value and unit, anchor and edge,
  repeat save, escape, cancel triggers, ends when, effects when it ends)
- `choices`: fixed choices by kind (`ability`, `damage_type`, `skill`, `condition`,
  `creature_type`, `option`, `value`, `roll`); a value choice is a number written as a string,
  a roll choice `{ dice_count, dice_type, fixed_val }` like a reminder's damage, every other
  choice a string. A `damage_type` choice MAY instead be a list of damage types, when the
  effect's definition marks that choice as taking several (see "Definitions can mark choices
  optional or multiple")
- `level`: the levels it applies, an integer of at least 1, for an effect with a level track
- `magical`: a boolean
- `scaling`: tiers that change the value choice and level with the slot or caster level, for
  links on spells only (see effects-spell-links)
- `duration_scaling`: tiers that change the duration with the slot level, for links on spells
  only, and only together with `duration` (see effects-spell-links)

A link SHALL NOT carry a save of its own or a concentration id. Links on NPC actions and traits
SHALL NOT carry `scaling` or `duration_scaling`.

#### Scenario: A grapple link
- **WHEN** a link is `{ effect: { source: "srd", source_key: "grappled", name: "Grappled" }, duration: { type: "cancelled", escape: { dc: 14 } } }`
- **THEN** it validates against the effect link schema

#### Scenario: A link with a fixed roll
- **WHEN** a young gold dragon's Weakening Breath links Weakening Breath with `choices: { roll: { dice_count: 1, dice_type: 6 } }`
- **THEN** it validates against the effect link schema, and the same link with `choices: { roll: "1d6" }` or `choices: { roll: { dice_count: 1 } }` does not

#### Scenario: A link with a save is rejected
- **WHEN** a link has `save: { ability: "constitution", dc: 13 }`
- **THEN** it does not validate against the effect link schema

#### Scenario: A scaled link
- **WHEN** a link has `scaling: [{ level: 3, value: 2 }]`
- **THEN** it validates against the effect link schema, and an NPC action carrying it does not validate against the NPC schema

#### Scenario: A link with duration scaling
- **WHEN** a link has `duration: { type: "time", value: 1, unit: "hour" }` and `duration_scaling: [{ level: 3, duration: { type: "time", value: 8, unit: "hour" } }]`
- **THEN** it validates against the effect link schema, the same tiers without `duration` don't, and an NPC action carrying them does not validate against the NPC schema

#### Scenario: Several damage types
- **WHEN** a link is `{ effect: <Regeneration>, choices: { value: "5", damage_type: ["acid", "fire"] } }`
- **THEN** it validates against the effect link schema

## ADDED Requirements

### Requirement: Definitions can mark choices optional or multiple

The effects schema SHALL let a definition mark choice kinds its sub-effects ask for as
**optional** (a link or an applied instance may leave it out) or **multiple** (it takes a list;
only `damage_type`). A choice without a mark SHALL be required and single, as before.

A sub-effect whose optional choice isn't set SHALL be left out of the resolved definition: it
never fires, modifies or prompts. A multiple `damage_type` choice SHALL fill the sub-effect's
damage types with every chosen type.

In the link dialog and when an effect is applied (from a roll or the Effects drawer), a
multiple choice SHALL be a multi-select, and an optional choice SHALL NOT be required.

#### Scenario: Optional choice left out
- **WHEN** an oni's Regeneration link has `choices: { value: "10" }` and no damage type
- **THEN** its damage-taken sub-effect is left out, and its start-of-turn healing works

#### Scenario: Multi-select
- **WHEN** the user adds Regeneration to a link and opens the damage type choice
- **THEN** it is a multi-select, and picking Acid and Fire saves `damage_type: ["acid", "fire"]`
