## Purpose

How active effects end by themselves in the combat tracker: ticking and expiry per
duration type, cancel triggers, state-based ends, the cascade to linked effects, what
happens when the caster is missing, and how the DM is told.

## ADDED Requirements

### Requirement: Timed effects count down on the caster's turn

An instance with `duration.type: "time"` and a `rounds_remaining` SHALL have
`rounds_remaining` lowered by 1 at the end of its caster's turn, and the new value SHALL be
saved like other instance changes. When it reaches 0, the instance SHALL be removed. When
the caster is not in the encounter, or the instance has no caster, the count SHALL go down
at the end of the holder's own turn instead.

#### Scenario: Ten rounds
- **WHEN** `player_1` applied a 10-round Burning to `npc_1` and `player_1`'s turn ends
- **THEN** the instance's `rounds_remaining` becomes 9, and the chip's badge shows 9

#### Scenario: Last round
- **WHEN** an instance has `rounds_remaining: 1` and its caster's turn ends
- **THEN** the instance is removed and a notice says it ended

#### Scenario: Caster gone
- **WHEN** a player's carried-over timed effect has a caster that isn't in the encounter
- **THEN** its `rounds_remaining` goes down at the end of the player's own turn

### Requirement: Next-turn and end-of-turn durations expire on the right edge

An instance with `duration.type: "next_turn"` SHALL be removed at the first start
(`edge: "start"`) or end (`edge: "end"`) of its anchor's turn that comes after it was
applied. The anchor is the caster for `anchor: "caster"` (the default), and the holder for
`anchor: "target"`. A missing or absent caster anchors to the holder. When the instance
was applied during the anchor's own turn (the caster had the turn when it was applied, and
the anchor is that entity), the end of that same turn SHALL NOT count. An instance with
`duration.type: "end_of_turn"` SHALL be removed when the turn during which it was applied
ends.

#### Scenario: Until the start of the caster's next turn
- **WHEN** during `npc_1`'s turn, `npc_1` applies an effect to `player_1` with `{ type: "next_turn", anchor: "caster", edge: "start" }`, and turns pass until `npc_1`'s next turn starts
- **THEN** the effect is removed at the start of `npc_1`'s next turn, not before

#### Scenario: Until the end of its next turn, applied on its own turn
- **WHEN** during `player_1`'s turn an effect with `{ type: "next_turn", anchor: "target", edge: "end" }` is applied to `player_1` by `player_1`, and `player_1`'s turn ends
- **THEN** the effect stays, and is removed at the end of `player_1`'s following turn

#### Scenario: Until the end of the target's next turn, applied by someone else
- **WHEN** during `npc_1`'s turn `npc_1` applies `{ type: "next_turn", anchor: "target", edge: "end" }` to `player_1`, and later `player_1`'s turn ends
- **THEN** the effect is removed at that end of `player_1`'s turn

#### Scenario: End of this turn
- **WHEN** an effect with `{ type: "end_of_turn" }` is applied during `npc_1`'s turn and the turn advances
- **THEN** the effect is removed as `npc_1`'s turn ends

### Requirement: Effects without automatic expiry stay until removed

Instances with `duration.type` `cancelled`, `concentration`, or any type other than `time`,
`next_turn` and `end_of_turn` (for example `rest`, `dawn` or `save_ends`) SHALL NOT expire
by time. They SHALL end only when removed by hand, by a cancel trigger, by an end
condition, or by the cascade.

#### Scenario: Concentration duration
- **WHEN** an effect has `{ type: "concentration", value: 1, unit: "hour" }` and many rounds pass
- **THEN** it stays until it is removed or its Concentration ends

### Requirement: Cancel triggers end an effect

When a trigger fires for an entity, every instance on that entity whose
`duration.cancel_triggers` lists that trigger (legacy spellings normalised) SHALL be
removed, when the entry's `filter` passes for the event. When the filter can't be checked
from what the event knows, the instance SHALL NOT be removed; instead the DM SHALL be
prompted that it may have ended, naming the unchecked condition.

#### Scenario: Hypnotic-Pattern-style end on damage
- **WHEN** an entity has an effect with `cancel_triggers: [{ trigger: "damage_taken" }]` and takes damage
- **THEN** the effect is removed and a notice says it ended

#### Scenario: Charm-Person-style filter that can't be checked
- **WHEN** an effect has `cancel_triggers: [{ trigger: "damage_taken", filter: { by: "caster_or_allies" } }]` and its holder takes damage
- **THEN** the effect stays and the DM is prompted that it may have ended "if caused by the caster or its allies"

### Requirement: End conditions end an effect

After every trigger fires, the tracker SHALL evaluate, for every instance in the encounter,
its duration's `ends_when` and its resolved definition's `ends_when`. It SHALL remove the
instance when either holds. The evaluator SHALL support `has_condition`, `has_effect`,
`bloodied`, `hp_zero`, `temp_hp_zero` and `hp_threshold` (with `comparator`), with
`subject` `self` (the holder, the default) or `caster`, and `negate`, lists (all must
hold), `all_of` and `any_of`. A check it can't evaluate SHALL count as not holding. An entity
has a condition when it has an instance of that SRD condition, when one of its effects
includes that condition, or when its legacy conditions map has it.

#### Scenario: Concentration ends when Stunned
- **WHEN** a player has Concentration (whose definition ends when the holder has the Incapacitated condition) and the DM applies Stunned to the player
- **THEN** Concentration is removed, because Stunned includes Incapacitated

#### Scenario: Legacy condition counts
- **WHEN** a player has Concentration and the DM sets Incapacitated through the legacy Conditions drawer, and then any trigger fires
- **THEN** Concentration is removed

#### Scenario: Unsupported check
- **WHEN** an effect ends when `{ type: "distance", subject: "caster", comparator: "gt", value: 60 }`
- **THEN** the effect is never removed automatically by that check

### Requirement: Removing an effect removes the effects linked to it

When an instance is removed (by hand, from the drawer or detail view, by expiry, by a
cancel trigger, by an end condition, or by the cascade itself), the tracker SHALL also
remove:
- when it is a Concentration instance, every instance on any entity whose
  `concentration_id` is its key and whose `caster_key` is its holder
- every instance on the same holder whose `parent_id` is its key

This SHALL repeat for each removed instance. Each removal SHALL be saved like any removal.

#### Scenario: Concentration drops, Hex ends
- **WHEN** `player_1`'s Concentration instance `eff_5c10` is removed and `npc_1` has a Hex instance with `concentration_id: "eff_5c10"` and `caster_key: "player_1"`
- **THEN** the Hex instance on `npc_1` is removed too, and a notice says it ended because Concentration ended

#### Scenario: Parent removed
- **WHEN** an NPC's Grappled instance is removed and the same NPC has a Restrained instance with `parent_id` equal to the Grappled instance's key
- **THEN** the Restrained instance is removed too

### Requirement: Missing casters are reviewed when an encounter starts

When an encounter starts, the tracker SHALL collect carried-over instances on players and
companions whose duration type isn't `cancelled` and that either have a `caster_key` that
isn't in the encounter, or a `concentration_id` that doesn't match a loaded instance on its
caster. When any are found, a notice SHALL offer Review, which lists them with their holder,
name, duration and stored caster name. For each, Keep SHALL remove the dangling references
(`caster_key` and `concentration_id`) and save it, so it isn't listed again. Remove SHALL
remove it (with the cascade). Nothing SHALL change until the DM chooses.

#### Scenario: Bless from an earlier encounter
- **WHEN** a player has a 10-round Bless with `rounds_remaining: 6` applied by an NPC of the previous encounter, and a new encounter of the campaign starts
- **THEN** a notice offers Review, and the review lists that Bless with "from <NPC name>"

#### Scenario: Keep
- **WHEN** the DM keeps it in the review
- **THEN** its `caster_key` is removed, it isn't listed again next encounter, and it ticks on the player's own turn

#### Scenario: Nothing to review
- **WHEN** no carried-over effect has a missing caster or link
- **THEN** no review notice is shown

### Requirement: Automatic ends are announced

Every instance removed automatically (by time, turn edge, cancel trigger, end condition or
cascade) SHALL be announced with a short notice naming the holder, the effect and the
reason (for example "Goblin: Bless ended (10 rounds passed)"). The notice SHALL go away by
itself. Removals done by hand SHALL NOT be announced, except for what the cascade removes
as a result.

#### Scenario: Cascade notice after a manual removal
- **WHEN** the DM removes Concentration by hand and it cascades to two linked effects
- **THEN** two notices announce the linked effects ending, and none announces the Concentration itself

### Requirement: Going back a turn undoes nothing

Moving to the previous turn SHALL NOT change `rounds_remaining`, SHALL NOT restore
expired or cascaded instances, and SHALL NOT expire anything.

#### Scenario: Previous turn after expiry
- **WHEN** an effect expired at the end of `npc_1`'s turn and the DM goes back to `npc_1`'s turn
- **THEN** the effect stays removed
