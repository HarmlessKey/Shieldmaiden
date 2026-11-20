## MODIFIED Requirements

### Requirement: Database rules accept valid instances only

The Realtime Database rules SHALL allow an `effects` map on encounter entities, campaign
players and campaign companions, writable only by the owner of the encounter or campaign
(the existing owner rules). An effect key SHALL be at most 100 characters of letters,
digits, `_` and `-`. A stored instance SHALL require `name` (string, at most 200
characters), `source` (`srd`, `custom` or `api`) and `source_key` (string, at most 100
characters). The optional fields SHALL be type-checked:
- `duration` must have a `type` from the schema's duration types, and its `unit`, `anchor`
  and `edge` must come from their schema enums
- `choices` values are strings
- `caster_key`, `concentration_id`, `parent_id` and `applied_turn_key` are strings
- `caster_name` is a string of at most 200 characters
- `concentration_for` has `source` (`srd`, `custom`, `api`, or `spell` for a spell cast),
  `source_key` (string, at most 100 characters) and an optional `name` (string, at most 200
  characters), and nothing else
- `applied_round`, `rounds_remaining`, `save_dc`, `level`, `charges`, `save_successes`,
  `save_failures`, `immune_until_round` and `temp_hp_granted` are numbers
- `magical` is a boolean

Any other field on an instance SHALL be rejected. Existing rules for other entity data SHALL
NOT change.

#### Scenario: Valid instance accepted for a player
- **WHEN** the owner writes `{ name: "Exhaustion", source: "srd", source_key: "exhaustion", duration: { type: "cancelled" }, level: 2, applied_round: 1 }` under a campaign player's `effects`
- **THEN** the write succeeds

#### Scenario: Caster name accepted
- **WHEN** the owner writes an instance with `caster_key: "npc_1"` and `caster_name: "Goblin"`
- **THEN** the write succeeds

#### Scenario: Concentration fields accepted
- **WHEN** the owner writes a Concentration instance with `concentration_for: { source: "srd", source_key: "bless", name: "Bless" }`, `applied_turn_key: "npc_1"` and `temp_hp_granted: 5`
- **THEN** the write succeeds

#### Scenario: Concentration for a spell accepted
- **WHEN** the owner writes a Concentration instance with `concentration_for: { source: "spell", source_key: "-Nx1abc", name: "Hold Person" }`
- **THEN** the write succeeds

#### Scenario: Magical instance accepted
- **WHEN** the owner writes a Paralyzed instance with `magical: true`
- **THEN** the write succeeds, and `magical: "yes"` is rejected

#### Scenario: Invalid concentration_for rejected
- **WHEN** an instance with `concentration_for: { source: "srd" }` or `concentration_for: { source: "srd", source_key: "bless", extra: 1 }` is written
- **THEN** the write is rejected

#### Scenario: Unknown field rejected
- **WHEN** an instance containing `sub_effects` is written
- **THEN** the write is rejected

#### Scenario: Missing source rejected
- **WHEN** an instance without `source` is written
- **THEN** the write is rejected

#### Scenario: Invalid duration type rejected
- **WHEN** an instance with `duration: { type: "forever" }` is written
- **THEN** the write is rejected
