## MODIFIED Requirements

### Requirement: An effect link stores the effect and how it is applied

The effects schema SHALL define an effect link with these fields, and no others:
- `effect` (required): a reference `{ source, source_key, name }` to an SRD condition, an SRD
  effect or a custom effect
- `duration`: a duration as applied in the tracker (type, value and unit, anchor and edge,
  repeat save, escape, cancel triggers, ends when, effects when it ends)
- `choices`: fixed choices by kind (`ability`, `damage_type`, `skill`, `condition`,
  `creature_type`, `option`, `value`), each a string; a value choice is a number written as a
  string
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

#### Scenario: A link with a save is rejected
- **WHEN** a link has `save: { ability: "constitution", dc: 13 }`
- **THEN** it does not validate against the effect link schema

#### Scenario: A scaled link
- **WHEN** a link has `scaling: [{ level: 3, value: 2 }]`
- **THEN** it validates against the effect link schema, and an NPC action carrying it does not validate against the NPC schema

#### Scenario: A link with duration scaling
- **WHEN** a link has `duration: { type: "time", value: 1, unit: "hour" }` and `duration_scaling: [{ level: 3, duration: { type: "time", value: 8, unit: "hour" } }]`
- **THEN** it validates against the effect link schema, the same tiers without `duration` don't, and an NPC action carrying them does not validate against the NPC schema
