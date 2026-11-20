## Context

See proposal.md (Why). Requirements: `specs/effects-durations/spec.md` (added) and
`specs/effects-drawer/spec.md` (modified repeat save, added escape).

State after 2h1:
- `durationActions({ trigger, entityKey, entities, event })` returns `tick` / `expire` /
  `maybe`. `fire_trigger` runs it after the trigger prompts. Caster-anchored timing goes
  through `anchorKey`, which falls back to the holder.
- `remove_effect({ key, effectKey, reason })` saves, announces when there's a reason, and
  cascades. `set_effect_prop` saves one field (`null` deletes it).
- Instances already get `duration.save` (ability, triggers) and `save_dc` from the drawer.
  `buildEffectInstance` strips `dc` from the save into `save_dc` and passes the rest of
  the save object through.
- `$defs/repeat_save` allows `successes_to_end`, `failures_to_escalate`, `escalate {
  effect, duration, lock }`, `on_fail`, `advantage_on_triggers`, `costs_action` and
  `auto_success_after { value, unit }`. `$defs/escape` allows `dc`, `checks [{ ability,
  skill }]`, `by` and `cost`. The rules' `duration` block has no `$other` and
  `save_successes` / `save_failures` are allowed, so no rules change is needed.
- The save and skill modifier formulas exist only as component methods:
  `Targeted.vue savingThrow(entity, ability)` and `CardDetails.vue skillModifier(skill)`.
  Both use the `experience` mixin (`returnProficiency`, `calculatedLevel`) and
  `calc_mod` / `calc_skill_mod`.
- The dice mixin `rollD(e, d, n, m, title, entity_name, notify, advantage_object, share)`
  returns `{ total, throwsTotal, … }` and shows the roll notification.

## Goals / Non-Goals

**Goals:**
- Repeat saves, escapes and end-of-effect consequences reach the DM at the right moment.
  Resolution goes through one store action each.
- The rules for counting, ending and escalating are pure and tested.

**Non-Goals:**
- Applying `on_fail` / `on_expire` sub-effects automatically (for example rolling the
  damage). That's step 3; 2h2 shows them.
- Enforcing `costs_action` or escape `cost` / `by` (text only).
- A contested escape (the grappler's check instead of a DC).
- Rest-based expiry.

## Decisions

### 1. Pure helpers (`effectFunctions.js`)
- `durationActions` takes a `round` (the current round) and additionally returns:
  - `{ kind: "save", holderKey, effectKey, advantage }` for instances with
    `duration.save`, where the trigger (normalised) is in `save.triggers` (default
    `["end_turn_target"]`):
    - holder-scoped triggers (`start_turn_target`, `end_turn_target`, `damage_taken`)
      match the holder's instances
    - `start_turn_caster` / `end_turn_caster` match when `anchorKey(instance, holderKey,
      entities, "caster") === entityKey`. The holder's own turn fires both `_caster` and
      `_target` for that entity, so the missing-caster fallback comes for free.
    - `advantage` is true when the trigger is in `advantage_on_triggers`
  - `{ kind: "save_auto", holderKey, effectKey }` instead, when `auto_success_after`
    has passed: `round - applied_round >= durationToRounds(auto_success_after)`
- `resolveRepeatSave(instance, success)` returns one of:
  - `{ result: "end" }`: a success with `save_successes + 1 >= (successes_to_end || 1)`
  - `{ result: "count", property, value }`: a success or failure below its threshold
  - `{ result: "escalate", value, escalate }`: a failure reaching `failures_to_escalate`
    with an `escalate.effect` and no `lock`
  - `{ result: "lock", value, duration }`: the same with `lock`; `duration` is the
    duration without `save`

  Failures also return `onFail`, the descriptions of `save.on_fail` via
  `describeSubEffect`.
- `onExpireLines({ instance, definition })` returns the descriptions of
  `duration.on_expire` and of the definition's sub-effects with
  `normalizeTrigger(trigger) === "on_expire"`.
- `escalationInstance({ instance, definition, round })` returns the replacement for
  `buildEffectInstance`: source / source_key / name from `escalate.effect`, duration
  `escalate.duration` or the old duration without `save`, and the old `caster_key`,
  `caster_name` and `concentration_id`, applied in the current round.

### 2. Store (`runEncounter.js`)
- `fire_trigger` passes `round: state.encounter?.round` to `durationActions`:
  - `save` → queues a prompt `{ kind: "save", holderKey, effectKey, holderName,
    effectName, ability, dc: instance.save_dc, advantage, costsAction, trigger }`
  - `save_auto` → dispatches `resolve_repeat_save({ …, success: true, auto: true })`,
    announced with a notice "succeeded automatically"
- `resolve_repeat_save({ key, effectKey, success, auto })` runs `resolveRepeatSave`:
  - `end` → `remove_effect({ reason: "saved" })`
  - `count` → `set_effect_prop`
  - `escalate`:
    - `set_effect_prop(save_failures)`
    - `resolve_effect_definitions([escalate.effect])` to fetch the replacement
    - `remove_effect({ reason: "became <name>", skipExpire: true })`
    - `apply_effect({ key, instance: escalationInstance(...), definition })`
  - `lock` → `set_effect_prop(save_failures)` and `set_effect_prop("duration", …)`
  - a failure with `onFail` lines → a `trigger`-style prompt "…: <effect>, on a failed
    save" listing them
- `escape_effect({ key, effectKey, success })`: success → `remove_effect({ reason:
  "escaped" })`; failure → nothing.
- `remove_effect` gets `skipExpire`. Before the delete it computes `onExpireLines` with
  the resolved definition and, unless `skipExpire`, queues `{ kind: "on_expire", … }`
  when there are lines. The cascade passes no `skipExpire`, so linked effects show their
  own consequences.

### 3. `src/mixins/effectRolls.js`
A mixin with the `dice` and `experience` mixins:
- `effectSaveModifier(entity, ability)`: `Targeted.savingThrow` logic
- `effectSkillModifier(entity, ability, skill)`: `CardDetails.skillModifier` logic
- `rollEffectCheck({ entity, title, modifier, advantage })`: `rollD` with notification,
  returns the total

The originals in `Targeted.vue` / `CardDetails.vue` are not changed. Consolidating them is
out of scope, and the formulas are copied verbatim.

### 4. UI
- `EffectTriggerNotifier.vue`:
  - `save` prompt: the title "<holder>: <effect> — <Ability> save DC <dc>", with " (with
    Advantage)" / " (costs its action)" added when they apply. Buttons: **Roll** (rolls
    with the mixin and dispatches `resolve_repeat_save` with `total >= dc`; without a DC
    it only rolls and leaves the toast open), **Succeeded**, **Failed**. Timeout 0.
  - `on_expire` prompt: "<holder>: <effect> ended", with its lines and Dismiss.
- `ActiveEffect.vue`:
  - under Repeat save, "Successes a/b, failures c/d" when counters or thresholds exist
  - an **Escape** block: "DC 14 · Strength (Athletics) or Dexterity (Acrobatics) · by
    itself · costs an action", one **Roll <skill>** button per check, plus **Escaped** /
    **Failed**. It closes the drawer when the effect is gone.
- `ApplyEffect.vue`, all inside the existing single `data` / `computed` / `watch`
  blocks:
  - repeat-save section: **Successes needed** (default 1); **Escalates** (checkbox →
    failures N and a condition select from the `conditions` prop); **Succeeds
    automatically after** (checkbox → value and unit)
  - new **Escape** checkbox → DC, checks (multi-select: Strength (Athletics), Dexterity
    (Acrobatics), both preselected), and by (itself / itself or a creature within reach /
    anyone)
  - only non-default extras are emitted (`successes_to_end` only when > 1)
  - `escalate.effect` is `{ source: "srd", source_key, name }`
- *As built:*
  - The conversion from the form to `$defs/repeat_save` / `$defs/escape` lives in two
    pure helpers, `repeatSaveFromForm` and `escapeFromForm` (`effectFunctions.js`), so the
    emitted shapes are tested in the scratchpad.
  - `fire_trigger` now only skips further actions for an instance that has *ended*,
    instead of allowing one action per instance. A timed effect with a repeat save gets
    both its tick and its save prompt on the same end of turn.
  - An automatic success that doesn't end the effect gets its own notice text (`text` on
    the notice prompt), instead of the "ended" wording.

## Risks / Trade-offs

- [Several prompts per turn: a trigger prompt and a save prompt for the same effect] →
  They are different questions. Grouping can come later if it's noisy.
- [An escalation writes a remove and then an apply, so a failure in between loses the
  effect] → Each write logs its failure. The DM sees the notice and can re-apply. It's
  rare, and acceptable for now.
- [Copied modifier formulas can drift from the originals] → Noted in `effectRolls.js`.
  Step 3 consolidates when it routes all rolls through effects.
- [`auto_success_after` only resolves when a save trigger fires] → That matches the rules
  text ("succeeds automatically" when it would save).

## Migration Plan

No data or rules changes. Rollback is reverting the commit.

## Open Questions

None.
