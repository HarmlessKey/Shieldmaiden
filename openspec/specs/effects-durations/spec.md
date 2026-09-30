# effects-durations Specification

## Purpose

How active effects end by themselves in the combat tracker: ticking and expiry per
duration type, cancel triggers, state-based ends, the cascade to linked effects, what
happens when the caster is missing, and how the DM is told.

## Requirements

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

### Requirement: End conditions are evaluated against effect instances

After every trigger fires, the tracker SHALL evaluate, for every instance in the encounter,
its duration's `ends_when` and its resolved definition's `ends_when`. It SHALL remove the
instance when either holds. The evaluator SHALL support `has_condition`, `has_effect`,
`bloodied`, `hp_zero`, `temp_hp_zero` and `hp_threshold` (with `comparator`), with
`subject` `self` (the holder, the default) or `caster`, and `negate`, lists (all must
hold), `all_of` and `any_of`. A check it can't evaluate SHALL count as not holding. An entity
has a condition when it has an instance of that SRD condition, or when one of its effects
includes that condition. Nothing else SHALL count as having a condition.

#### Scenario: Concentration ends when Stunned
- **WHEN** a player has Concentration (whose definition ends when the holder has the Incapacitated condition) and the DM applies Stunned to the player
- **THEN** Concentration is removed, because Stunned includes Incapacitated

#### Scenario: Incapacitated set from the Conditions option
- **WHEN** a player has Concentration and the DM applies Incapacitated through the Conditions option
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

### Requirement: Repeat saves are prompted at their triggers

When a trigger fires, every instance whose `duration.save.triggers` (default
`["end_turn_target"]`) contains it SHALL prompt the DM for a repeat save. For holder-scoped
triggers (`start_turn_target`, `end_turn_target`, `damage_taken`) this applies to the
holder's instances. For `start_turn_caster` / `end_turn_caster` it applies to instances
whose caster is that entity, or to the holder's own turn when the caster is missing or
absent. The prompt SHALL name the holder, the effect, the save ability and the DC (the
instance's `save_dc`). It SHALL say "with Advantage" when the trigger is listed in
`advantage_on_triggers`, and "costs its action" when `costs_action` is set. It SHALL offer:
- **Roll**: rolls the holder's saving throw for that ability (with Advantage where it
  applies) and resolves it against the DC
- **Succeeded** and **Failed**: resolve it directly

A locked instance (after `escalate.lock`) SHALL NOT prompt again.

#### Scenario: Hold-Person-style save at end of turn
- **WHEN** an NPC has Paralyzed with `duration.save: { ability: "wisdom", triggers: ["end_turn_target"] }` and `save_dc: 15`, and its turn ends
- **THEN** a prompt "Goblin: Paralyzed — Wisdom save DC 15" with Roll, Succeeded and Failed is shown

#### Scenario: Advantage on damage
- **WHEN** an effect has `triggers: ["end_turn_target", "damage_taken"]` and `advantage_on_triggers: ["damage_taken"]`, and its holder takes damage
- **THEN** the prompt says "with Advantage", and Roll rolls the save with Advantage

#### Scenario: Roll resolves against the DC
- **WHEN** the DM chooses Roll for a Wisdom save DC 15 and the holder's Wisdom save totals 17
- **THEN** the save is resolved as a success

### Requirement: Repeat saves end, count and escalate

Resolving a repeat save as a success SHALL add 1 to the instance's `save_successes`. When
that reaches `successes_to_end` (default 1), the instance SHALL end, announced as "saved".
Resolving it as a failure SHALL add 1 to `save_failures`, and SHALL show the DM the
descriptions of `save.on_fail` sub-effects when present. When `failures_to_escalate` is set
and `save_failures` reaches it, `escalate` SHALL apply:
- without `lock`, the instance SHALL be replaced by a new instance of `escalate.effect`,
  with `escalate.duration` or else the same duration without the repeat save, and the same
  caster, caster name and `concentration_id`. The replaced instance SHALL end without an
  end-of-effect prompt, and the change SHALL be announced (e.g. "Restrained became
  Petrified").
- with `lock`, the instance SHALL stay and SHALL NOT prompt for saves again.

The counters SHALL be saved like other instance changes.

#### Scenario: Single success ends
- **WHEN** a Paralyzed instance with a default repeat save is resolved as a success
- **THEN** the instance is removed with a notice "Paralyzed ended (saved)"

#### Scenario: Three successes needed
- **WHEN** an instance has `successes_to_end: 3` and `save_successes: 1`, and a save succeeds
- **THEN** `save_successes` becomes 2 and the effect stays

#### Scenario: Escalation to Petrified
- **WHEN** a Restrained instance has `failures_to_escalate: 2`, `escalate: { effect: { source: "srd", source_key: "petrified" } }` and `save_failures: 1`, and a save fails
- **THEN** the Restrained instance is removed without an end-of-effect prompt, a Petrified instance with the same caster is created on the same holder, and a notice says "Restrained became Petrified"

#### Scenario: Failure effects shown
- **WHEN** a save fails for an effect whose `save.on_fail` has a sub-effect described "Take 4d10 psychic damage"
- **THEN** the DM is shown "Take 4d10 psychic damage"

### Requirement: Saves can succeed automatically after a time

When an instance's repeat save has `auto_success_after` and at least that much time (in
rounds, `minute` = 10 rounds) has passed since `applied_round`, the save SHALL be resolved as
a success without prompting the DM, and this SHALL be announced.

#### Scenario: After 1 minute
- **WHEN** an effect applied in round 1 has `auto_success_after: { value: 1, unit: "minute" }` and its save comes up in round 11
- **THEN** the save succeeds automatically and the effect's success is counted without a prompt

### Requirement: Escape attempts end an effect

An instance with `duration.escape` SHALL show in its detail view the escape DC, the
allowed checks (default Strength (Athletics) or Dexterity (Acrobatics) when none are
given), who may attempt it (`by`) and what it costs (`cost`, default an action). The DM
SHALL be able to roll an escape attempt for each allowed check, using the holder's
modifier for that check and resolving it against the DC, or mark the attempt as
Succeeded or Failed. A success SHALL end the instance, announced as "escaped". A failure
SHALL change nothing.

#### Scenario: Escape a grapple
- **WHEN** an NPC is Grappled with `duration.escape: { dc: 14 }` and the DM rolls Athletics for it, totalling 15
- **THEN** the Grappled instance is removed with a notice "Grappled ended (escaped)"

#### Scenario: Failed escape
- **WHEN** the DM marks an escape attempt as Failed
- **THEN** the effect stays and nothing is changed

### Requirement: Ending an effect shows what happens next

When an instance ends (removed by hand, automatically or by the cascade, but not when it is
replaced by an escalation), the DM SHALL be shown the descriptions of its
`duration.on_expire` sub-effects and of its resolved definition's sub-effects with
`trigger: "on_expire"`, when there are any. The prompt SHALL stay until dismissed.
Nothing SHALL be applied automatically.

#### Scenario: Haste lethargy
- **WHEN** a Haste instance whose `duration.on_expire` has a sub-effect described "Can't move or take actions until after its next turn" is removed
- **THEN** a prompt "Lyra: Haste ended" lists "Can't move or take actions until after its next turn"

#### Scenario: No expire effects
- **WHEN** an instance without on_expire sub-effects ends
- **THEN** no end-of-effect prompt is shown
