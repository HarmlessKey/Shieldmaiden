## ADDED Requirements

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
