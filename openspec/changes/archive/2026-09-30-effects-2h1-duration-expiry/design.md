## Context

See proposal.md (Why). Requirements: `specs/effects-durations/spec.md`, plus the deltas for
`effects-drawer`, `effects-display`, `effects-instance-storage` and `effects-triggers`.

State of the code after 2a–2g:

- **Instances** (`entity.effects[key]`) carry `duration`, `rounds_remaining` (set by
  `buildEffectInstance` for `time`, converted to rounds), `caster_key` (the entity whose
  turn it was when applied from the drawer, absent before combat), `applied_round`, and
  optionally `concentration_id` / `parent_id` (nothing sets these yet).
- **Writes**: `apply_effect` / `remove_effect` / `persist_effect` (with `property` for a
  single field) save and then commit. `remove_effect` takes `effectKey` or
  `source` + `source_key`.
- **Triggers** (2g): `fire_trigger({ trigger, entityKey, event, effectKey })` runs
  `matchTriggers` and queues prompts. `set_turn` calls `fire_turn_triggers` after
  committing the new turn / round, only when moving forward. The outgoing entity comes from
  `turn_entity`. **The end-of-turn triggers therefore fire after the round may already have
  gone up.**
- **Resolved definitions** (2e): `effect_definition(instance)` has `sub_effects` (with
  `from` tags for includes), `category`, and the definition's `ends_when` is **not** copied
  yet (`resolveDefinition` returns name / description / category / cancelable /
  sub_effects).
- **Notifier** (2g): `EffectTriggerNotifier` drains `effect_prompts`. Every prompt shows as a
  persistent info toast with Details / Dismiss.
- **Schema / rules**: `$defs/active_instance` and the three rules `effects` blocks are
  closed (`$other: false`). A new field needs both.

## Goals / Non-Goals

**Goals:**
- All duration logic as pure functions over `(trigger, entityKey, event, entities)`,
  tested in the scratchpad.
- One removal path (`remove_effect`) that saves, cascades and announces, so hand
  removal, expiry and cascade behave the same.
- No effect can get stuck because its caster is missing.

**Non-Goals (2h2 or later):**
- Repeat saves (`duration.save`, counters, `escalate`, `on_fail`,
  `advantage_on_triggers`, `auto_success_after`), `escape`, `on_expire`.
- Expiry for `rest`, `dawn` (no rest or day feature), `trigger`, `save_ends` (2h2),
  `special`.
- Undo: going back a turn is not reversed.
- Distance, line of sight and the other checks that need positions or senses.
- Setting `parent_id` (steps 6–7). The cascade supports it now.

## Decisions

### 1. Pure helpers in `effectFunctions.js`
- `resolveDefinition` also returns `ends_when` (the definition's), so the evaluator can
  reach it.
- `hasCondition(entityKey, url, { entities, definitionOf })` is true when the entity's
  legacy `conditions[url]` is set, or any instance has `source: "srd"` and
  `source_key === url`, or any instance's resolved sub-effects contain an `includes` of that
  url, or a sub-effect with `from.source_key === url`.
- `evaluateConditionSet(set, ctx)` covers a single check, a list (all), `all_of` and
  `any_of`, plus `negate`. The subject is `self` (holder) or `caster` (the entity with
  `caster_key`; false when missing). Supported checks:
  - `has_condition` (via `hasCondition`) and `has_effect` (any instance whose
    `source_key === value`)
  - `bloodied` (`0 < curHp <= maxHp / 2`), `hp_zero` (`curHp <= 0`) and `temp_hp_zero`
    (`!tempHp`)
  - `hp_threshold` (`curHp` against `value` with `comparator`)

  Anything else is `false`.
- `anchorKey(instance, holderKey, entities, anchor)`: `target` → the holder; `caster` →
  `caster_key` when that entity is in `entities`, else the holder (the missing-caster
  anchor). `time` uses the caster anchor.
- `durationActions({ trigger, entityKey, entities, definitionOf, event })` returns
  `[{ kind: "tick", holderKey, effectKey, value }]`,
  `[{ kind: "expire", holderKey, effectKey, reason }]` and
  `[{ kind: "maybe", holderKey, effectKey, unchecked }]`:
  - on `end_turn_target` for E:
    - `time` whose anchor is E: tick (`rounds_remaining - 1`), or expire at ≤ 0 with the
      reason "<value> <unit>(s) passed"
    - `next_turn` with `edge: "end"` whose anchor is E: expire, unless it was applied
      during E's own turn in the round that just ended (see decision 2)
    - every `end_of_turn`: expire (the first turn end after applying is the turn it was
      applied in)
  - on `start_turn_target` for E: `next_turn` with `edge: "start"` whose anchor is E →
    expire
  - on any trigger T for E: the instances on E whose `duration.cancel_triggers` contain T
    (normalised). The entry's `filter` goes through the 2g `checkFilter`: fail → nothing;
    pass with unknowns → `maybe`; pass → expire with the reason "ended: <trigger label>"
  - Ticking and expiry use `*_turn_target` only, because every turn fires both
    `_caster` and `_target` for the same entity. Hooking one of them avoids counting twice.
    The anchor decides which instances.
- `endsWhenExpiries({ entities, definitionOf })` returns an `expire` action for every
  instance whose `duration.ends_when` or definition `ends_when` evaluates true. The reason
  is the set's `description`, or "end condition met".
- `cascadeTargets({ holderKey, effectKey, instance, entities })` returns the directly
  linked instances:
  - the `concentration_id` links when the removed instance is SRD Concentration (matching
    `concentration_id === effectKey && caster_key === holderKey`)
  - the `parent_id` links on the same holder
- `carriedOverReview({ entities })` returns the player / companion instances with
  `duration.type !== "cancelled"` and a `caster_key` that isn't in `entities`, or a
  `concentration_id` that isn't on `entities[caster_key].effects`.
- `buildEffectInstance` takes `casterName` and writes `caster_name` next to `caster_key`,
  and copies `application.concentration_id`.
- `matchTriggers`: the fallback condition becomes `!instance.caster_key ||
  !entities[instance.caster_key]` (the no-caster delta in effects-triggers).

### 2. "Applied during the anchor's own turn" for `edge: "end"`
`caster_key` is the entity whose turn it was when the effect was applied (drawer, 2a).
Steps 6–7 must keep that meaning, or add a field. So "applied during E's turn" is
`caster_key === E`, and it's that same turn when the round of the turn that just ended
equals `applied_round`. `set_turn` knows the old round, so `fire_turn_triggers` passes
`event.round = oldRound` to the end triggers and `event.round = round` to the start triggers.
The skip rule is `instance.caster_key === E && event.round === instance.applied_round`.
An effect applied before combat (round 0, no caster) is never skipped.

### 3. Store
- `fire_trigger`, after queuing the trigger prompts, runs `durationActions`, then
  `endsWhenExpiries`, and dispatches the results:
  - `tick` → `set_effect_prop({ key, effectKey, property: "rounds_remaining", value })`
  - `expire` → `remove_effect({ key, effectKey, reason })`
  - `maybe` → a prompt `{ kind: "maybe", … }` with **Remove** / **Keep**

  `fire_trigger` becomes `async` (it awaits the removals). Callers that don't await it
  keep working.
- New action `set_effect_prop({ key, effectKey, property, value })`: `persist_effect` with
  `property` (so `value: null` deletes the field), then commits `SET_EFFECT` with the
  updated copy (the field deleted when `null`). Used for ticks and for the review's Keep.
- `remove_effect({ key, effectKey | source + source_key, reason })`: per removed instance,
  save, commit, then:
  - when `reason` is set, queue a `notice` prompt "<holder>: <name> ended (<reason>)"
  - dispatch `remove_effect` for each `cascadeTargets` entry, with the reason
    "<removed name> ended"

  Hand removals (drawer, detail view) pass no reason, so only their cascade is announced.
  An instance already gone (for example removed twice through a cascade diamond) is
  skipped.
- `fire_turn_triggers` / `set_turn`: pass `round` in the events as in decision 2.
- `init_Encounter`: after `resolve_effect_definitions`, commit
  `SET_EFFECT_REVIEW(carriedOverReview(...))`, and when it isn't empty, queue a `review`
  prompt.
- Prompt kinds in `effect_prompts`:
  - `trigger` (2g's, unchanged)
  - `notice`: an info toast that closes after 4 s, no buttons
  - `maybe`: persistent; Remove dispatches `remove_effect` with a reason, Keep closes it
  - `review`: persistent; Review opens `drawers/encounter/effects/CarriedOver`

### 4. UI
- `EffectTriggerNotifier.vue` switches on `prompt.kind`.
- `CarriedOver.vue`: lists `effect_review` entries that still exist. Each shows the holder,
  name, `describeDuration` and "from <caster_name>". **Keep** dispatches
  `set_effect_prop` twice (`caster_key: null`, `concentration_id: null`) and drops the entry;
  **Remove** dispatches `remove_effect`.
- `ApplyEffect.vue` gets the props `concentrationKey` / `casterName`. When
  `concentrationKey` is set it shows a checkbox "Ends with <caster>'s Concentration",
  defaulting to `duration.type === "concentration"` (it follows the type until the DM
  toggles it), and emits `application.concentration_id`.
- `Effects.vue` (drawer) passes the turn entity's name as `casterName` to
  `buildEffectInstance`, and the key of its `srd:concentration` instance as
  `concentrationKey`.
- Chips (`index.vue`) and `ActiveEffect.vue`: when the caster isn't in the encounter, use
  `caster_name` with "(not in this encounter)", including in `describeDuration`'s caster
  name.

### 5. Schema and rules
- `$defs/active_instance.properties.caster_name: { type: "string", maxLength: 200 }`.
- Rules: `"caster_name": { ".validate": "newData.isString() && newData.val().length <= 200" }`
  in all three `effects` blocks. The 2g consistency script and the emulator test are rerun
  with a `caster_name` case, then the user uploads.

## Risks / Trade-offs

- [Automatic removal is a destructive write] → Only for the cases the spec lists. An
  uncheckable filter prompts instead, and unsupported `ends_when` checks never fire. Every
  automatic end is announced.
- [`caster_key` as a stand-in for "whose turn it was"] → Holds for every current applier
  (the drawer). Documented for steps 6–7, where an out-of-turn reaction would need an
  `applied_turn` field.
- [Effect keys are only unique per entity] → The cascade matches on `concentration_id` +
  `caster_key` (and `parent_id` on the same holder), so the key alone is never trusted
  across entities.
- [Several `fire_trigger` calls in flight per turn change] → Each touches the instances of
  its own event. `remove_effect` skips instances that are already gone.
- [Ticks write to the database every turn] → One small property write per timed effect per
  turn, the same scale as HP writes.
- [Going back a turn doesn't restore anything] → Stated in the spec. The DM can re-apply.

## Migration Plan

1. The user uploads the updated rules (`caster_name`). Until then, writes of new instances
   on players/companions are rejected. NPC writes pass.
2. Existing instances have no `caster_name`. The display falls back to "Not in this
   encounter".
3. Rollback: revert the code. The `caster_name` rule can stay.

## Open Questions

None.
