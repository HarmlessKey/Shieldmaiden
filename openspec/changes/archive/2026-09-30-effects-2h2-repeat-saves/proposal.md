## Why

2h1 made effects end by time, triggers and state, but three ways out in the rules still
need the DM to remember them:
- **repeat saves**: "repeats the save at the end of each of its turns", Hold Person,
  Flesh to Stone's 3 failures, the basilisk's second failure
- **escapes**: Grappled "escape DC 14", Web, Ensnaring Strike
- **what happens when an effect ends**: Haste's lethargy

Instances can already carry a repeat save (drawer, 2a), but nothing ever asks for it.
This is the second half of step 2h in
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
(2h1 is archived as `effects-2h1-duration-expiry`). Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §4 (durations, repeat
saves, escape), `$defs/repeat_save` and `$defs/escape` in `src/schemas/hk-effects-schema.json`,
and the 2024 monster scan in plan §0a (repeat saves at end of turn, escalating saves, escape
DCs).

## What Changes

- **Repeat-save prompts**: at each of an instance's `duration.save.triggers` (default: the
  end of the holder's turn; caster-anchored triggers use the holder when the caster is
  missing), the DM gets a prompt such as "Goblin: Paralyzed — Wisdom save DC 15". It shows
  "with Advantage" when the trigger is in `advantage_on_triggers`, and "costs its action"
  for `costs_action`. It offers:
  - **Roll**: rolls the holder's saving throw, with Advantage where it applies, and
    resolves it against the DC
  - **Succeeded** / **Failed**: for a roll made at the table
- **Resolving a repeat save**:
  - *Success*: counts toward `successes_to_end` (default 1). When it's reached, the effect
    ends (announced: "saved").
  - *Failure*:
    - the `save.on_fail` sub-effects are shown to the DM (step 3 automates them)
    - the failure is counted
    - when `failures_to_escalate` is reached, `escalate` applies: the effect is **replaced**
      by the escalation effect (e.g. Restrained → Petrified), as a new instance with the
      given or the same duration, the same caster and the same Concentration link. With
      `lock`, it stops asking for saves and keeps the effect.
  - The counters `save_successes` / `save_failures` are saved on the instance.
  - `auto_success_after` (e.g. 1 minute): once that much time has passed since the effect
    was applied, the save succeeds automatically without a prompt.
- **`save_ends`** durations end only through their repeat save, which 2h1 already respects.
- **Escape** (`duration.escape`): the effect's detail view shows the escape DC and the
  allowed checks (default Strength (Athletics) or Dexterity (Acrobatics)), and who may try
  (`by`) and what it costs (`cost`). An **escape attempt** can be rolled per allowed check
  with the holder's modifier, or marked Succeeded / Failed. Success ends the effect
  (announced: "escaped").
- **When an effect ends** (by hand, automatically or through the cascade, but not when
  replaced by an escalation), its `duration.on_expire` sub-effects and its definition's
  `trigger: "on_expire"` sub-effects are shown to the DM in a prompt. Step 3 automates them.
- **Drawer**: the application form gets:
  - an **Escape** section: DC, allowed checks and who may try
  - in the repeat-save section: **successes needed to end**, **escalation** ("after N
    failures it becomes <condition>"), and **succeeds automatically after** (time)
  - the rarer `advantage_on_triggers`, `costs_action` and `lock` are supported on instances
    but have no drawer input (steps 6–7 set them from actions)

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `effects-durations`: adds repeat-save prompting and resolution, counters and escalation,
  automatic success, escape attempts, and end-of-effect prompts.
- `effects-drawer`: the repeat-save requirement gains successes needed, escalation and
  automatic success. A new requirement covers escape input.

## Impact

- `src/utils/effectFunctions.js`: `durationActions` returns `save` actions for matching
  save triggers. Also pure `resolveRepeatSave` (counters, end, escalate, lock) and
  `onExpireLines`, tested in the scratchpad.
- `src/store/modules/runEncounter.js`:
  - `resolve_repeat_save` (success / failure → counters, removal, escalation)
  - `escape_effect`
  - `remove_effect` queues the `on_expire` prompt (not on escalation replacement)
  - new prompt kinds `save` and `on_expire`
- New `src/mixins/effectRolls.js`: the holder's save and skill modifiers (same formulas as
  `Targeted.vue` / `CardDetails.vue`) and a roll helper on the dice mixin.
- `EffectTriggerNotifier.vue` (the `save` prompt with Roll / Succeeded / Failed, and the
  `on_expire` prompt), `ActiveEffect.vue` (escape section, save counters),
  `ApplyEffect.vue` (escape and repeat-save extras).
- No schema or rules changes: `duration.save` / `duration.escape` are open objects in the
  rules, and `save_successes` / `save_failures` are already allowed.
- `.planning/effects-implementation-plan.md`: 2h2 marked done after archive.
