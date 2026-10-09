## MODIFIED Requirements

### Requirement: Next-turn and end-of-turn durations expire on the right edge

An instance with `duration.type: "next_turn"` SHALL be removed at the first start
(`edge: "start"`) or end (`edge: "end"`) of its anchor's turn that comes after it was
applied. The anchor is the caster for `anchor: "caster"` (the default), and the holder for
`anchor: "target"`. A missing or absent caster anchors to the holder. When the instance
was applied during the anchor's own turn, the end of that same turn SHALL NOT count. The
entity whose turn it was is the instance's `applied_turn_key`, or its `caster_key` for
instances saved without `applied_turn_key`. An instance with `duration.type: "end_of_turn"`
SHALL be removed when the turn during which it was applied ends.

#### Scenario: Until the start of the caster's next turn
- **WHEN** during `npc_1`'s turn, `npc_1` applies an effect to `player_1` with `{ type: "next_turn", anchor: "caster", edge: "start" }`, and turns pass until `npc_1`'s next turn starts
- **THEN** the effect is removed at the start of `npc_1`'s next turn, not before

#### Scenario: Until the end of its next turn, applied on its own turn
- **WHEN** during `player_1`'s turn an effect with `{ type: "next_turn", anchor: "target", edge: "end" }` is applied to `player_1` by `player_1`, and `player_1`'s turn ends
- **THEN** the effect stays, and is removed at the end of `player_1`'s following turn

#### Scenario: Until the end of the target's next turn, applied by someone else
- **WHEN** during `npc_1`'s turn `npc_1` applies `{ type: "next_turn", anchor: "target", edge: "end" }` to `player_1`, and later `player_1`'s turn ends
- **THEN** the effect is removed at that end of `player_1`'s turn

#### Scenario: Reaction during the target's turn
- **WHEN** during `npc_1`'s turn in round 2, `player_1` is chosen as the caster of an effect on `npc_1` with `{ type: "next_turn", anchor: "target", edge: "end" }` (`applied_turn_key: "npc_1"`), and `npc_1`'s turn ends
- **THEN** the effect stays, and is removed at the end of `npc_1`'s turn in round 3

#### Scenario: Caster's next turn, cast out of turn
- **WHEN** during `npc_1`'s turn in round 2, `player_1` (later in the initiative order) is chosen as the caster of `{ type: "next_turn", anchor: "caster", edge: "end" }`, and `player_1`'s turn in round 2 ends
- **THEN** the effect is removed at that end of `player_1`'s turn

#### Scenario: End of this turn
- **WHEN** an effect with `{ type: "end_of_turn" }` is applied during `npc_1`'s turn and the turn advances
- **THEN** the effect is removed as `npc_1`'s turn ends

### Requirement: Effects without automatic expiry stay until removed

Instances with `duration.type` `cancelled`, `concentration`, or any type other than `time`,
`next_turn` and `end_of_turn` (for example `rest`, `dawn` or `save_ends`) SHALL NOT expire
by time. They SHALL end only when removed by hand, by a cancel trigger, by an end
condition, or by the cascade. The exception is a `concentration` duration with an "up to"
time that was applied without a `concentration_id`: it SHALL count down that time like a
`time` duration (rounds left, ticked at the end of the caster's turn, the holder's for a
missing caster) and be removed with "<time> passed". Linked `concentration` instances end
with their Concentration (effects-concentration).

#### Scenario: Concentration duration
- **WHEN** an effect has `{ type: "concentration", value: 1, unit: "hour" }` and a `concentration_id`, and many rounds pass
- **THEN** it stays until it is removed or its Concentration ends

#### Scenario: Unlinked Concentration duration with an up-to time
- **WHEN** an effect is applied with `{ type: "concentration", value: 1, unit: "minute" }` and no `concentration_id`, and its caster's turn ends ten times
- **THEN** it is removed with the notice "1 minute passed"

#### Scenario: Unlinked Concentration duration without an up-to time
- **WHEN** an effect has `{ type: "concentration" }` without a value or `concentration_id`
- **THEN** it stays until it is removed
