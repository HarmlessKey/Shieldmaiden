## 1. Pure helpers

- [x] 1.1 Extend `durationActions` with `round`, `save` and `save_auto` actions (design decision 1). Verify with a scratchpad script covering:
  - end-of-turn default trigger
  - `damage_taken` with Advantage
  - `start_turn_caster` with the caster present and missing
  - no prompt for other triggers
  - `save_auto` after 1 minute
  - the 2h1 `test-durations.mjs` still passes
- [x] 1.2 Add `resolveRepeatSave`, `onExpireLines` and `escalationInstance`. Verify in the scratchpad:
  - single success → end
  - 3 successes needed (count, then end)
  - failure → count with `onFail` lines
  - failure reaching `failures_to_escalate` → escalate (the replacement keeps caster, `caster_name` and `concentration_id`, and is schema-valid)
  - `lock` → duration without `save`
  - `onExpireLines` from `duration.on_expire` and definition `on_expire` sub-effects

## 2. Store

- [x] 2.1 `fire_trigger` queues `save` prompts and resolves `save_auto`; add `resolve_repeat_save` and `escape_effect` (design decision 2). Verify by reading against the "Repeat saves end, count and escalate", "Saves can succeed automatically…" and "Escape attempts end an effect" scenarios
- [x] 2.2 `remove_effect` gets `skipExpire` and queues the `on_expire` prompt. Verify by reading that an escalation replacement skips it, and that cascade removals show their own

## 3. UI

- [x] 3.1 Create `src/mixins/effectRolls.js` (design decision 3) with formulas copied from `Targeted.vue` / `CardDetails.vue`. Verify by reading side by side that the formulas match
- [x] 3.2 `EffectTriggerNotifier.vue`: the `save` prompt (Roll / Succeeded / Failed, Advantage and action notes) and the `on_expire` prompt. Verify the earlier prompt kinds are unchanged
- [x] 3.3 `ActiveEffect.vue`: save counters and the Escape block (per-check Roll, Escaped / Failed). Verify against "Escape attempts end an effect"
- [x] 3.4 `ApplyEffect.vue`: repeat-save extras and the Escape section, emitting only non-default extras. Verify with a scratchpad `buildEffectInstance` run of the emitted applications for the modified effects-drawer scenarios (schema-valid), and that each Vue option appears once

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors
- [x] 4.2 Run `openspec validate effects-2h2-repeat-saves --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app:
  - apply Paralyzed with a Wisdom save DC 15; at the end of the NPC's turn the save prompt appears; Roll resolves it, and a success removes the effect with "saved"
  - with 3 successes needed, the counters show in the detail view
  - escalation "after 2 failures becomes Petrified": two Failed → Petrified replaces it
  - "succeeds automatically after 1 round" resolves without a prompt
  - Grappled with escape DC 14: the detail view shows the escape block, and a Roll Athletics success removes it with "escaped"
  - an effect with on_expire lines shows the end prompt (via a custom effect or the console)

  Record the outcome here
  - 2026-09-30: user tested all situations in the app, no issues
  - 2026-09-30: user noticed the detail view didn't show `auto_success_after`. The Repeat save line in `ActiveEffect.vue` now ends with "; succeeds automatically after <n> <unit>(s)"
- [x] 4.4 After archiving, mark 2h2 done in `.planning/effects-implementation-plan.md` (the §2h heading notes and the Suggested Order) as `(done — archived as effects-2h2-repeat-saves, <date>)`. Verify the plan shows 2h (both parts) done
