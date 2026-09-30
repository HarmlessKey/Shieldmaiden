## 1. Schema and rules

- [x] 1.1 Add `caster_name` (string, max 200) to `$defs/active_instance` in `src/schemas/hk-effects-schema.json`. Verify `node scripts/validate-effects-data/validate.mjs` still passes
- [x] 1.2 Add the `caster_name` rule to the three `effects` blocks in `c:\Users\keyro\Documents\development\firebase_rules\firebase-rules.json` (design decision 5). Rerun the 2g scratchpad `check-rules.mjs` (blocks identical, instance fields match the schema) and the emulator test with an added `caster_name` case (accepted) and a 201-character one (rejected). Verify all pass
- [x] 1.3 Ask the user to upload the rules to the develop database. Record the date here
  - 2026-09-30: uploaded to the develop database (confirmed by the user; the 5.3 checks with player effects passed). Production still needs these rules before release

## 2. Pure helpers

- [x] 2.1 `resolveDefinition` also returns `ends_when`; add `hasCondition` and `evaluateConditionSet` (design decision 1). Verify in the scratchpad: Stunned counts as Incapacitated (via includes); the legacy `conditions.incapacitated` counts; each supported check type, `negate`, list / `all_of` / `any_of`, `subject: "caster"` with a missing caster; an unsupported check → false; Concentration's definition `ends_when` is true for a Stunned holder
- [x] 2.2 Add `anchorKey`, `durationActions` and `endsWhenExpiries`. Verify with a scratchpad script covering every scenario of "Timed effects count down…", "Next-turn and end-of-turn durations…" (including the same-turn skip with `event.round`), "Effects without automatic expiry…", "Cancel triggers end an effect" (pass / fail / unknown filter) and "End conditions end an effect"
- [x] 2.3 Add `cascadeTargets` and `carriedOverReview`, extend `buildEffectInstance` (`casterName` → `caster_name`, `application.concentration_id`), and change the `matchTriggers` fallback to cover no caster. Verify in the scratchpad: the Concentration → Hex link (and no match for the same key on another caster), `parent_id` on the same holder only, review selection (missing caster, dangling Concentration link, `cancelled` excluded, NPCs excluded), `caster_name` in built instances (schema-valid), a no-caster `start_turn_caster` match; rerun the 2g `test-triggers.mjs`

## 3. Store

- [x] 3.1 Add `set_effect_prop` and give `remove_effect` a `reason`, notices and the cascade, skipping instances already gone (design decision 3). Verify by reading: a hand removal passes no reason, and each cascaded removal is saved and announced
- [x] 3.2 Make `fire_trigger` run `durationActions` + `endsWhenExpiries` and dispatch ticks, expiries and `maybe` prompts. Pass `event.round` from `set_turn` / `fire_turn_triggers` (old round for the end triggers). Verify by reading against design decision 2 and the "Going back a turn undoes nothing" requirement
- [x] 3.3 In `init_Encounter`, collect `effect_review` and queue a `review` prompt when it isn't empty. Verify it runs after `resolve_effect_definitions`, and that nothing is changed without a DM choice

## 4. UI

- [x] 4.1 `EffectTriggerNotifier.vue`: `notice` (auto-close), `maybe` (Remove / Keep) and `review` (Review opens CarriedOver) kinds. Verify the 2g `trigger` prompts are unchanged
- [x] 4.2 Create `src/components/drawers/encounter/effects/CarriedOver.vue` with Keep (clears `caster_key` / `concentration_id`) and Remove. Verify by reading against the "Missing casters are reviewed…" scenarios; each Vue option appears once
- [x] 4.3 Concentration link in `ApplyEffect.vue` + `Effects.vue`, and `caster_name` passed to `buildEffectInstance`. Verify against the "Application can link the effect to the caster's Concentration" scenarios
- [x] 4.4 Chips and `ActiveEffect.vue` show "<caster_name> (not in this encounter)". Verify against the modified effects-display scenarios

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-2h1-duration-expiry --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app (console `TRIGGER` log available as in 2g):
  - a 2-round timed effect (e.g. Prone applied with a duration of 2 rounds) ticks on its caster's turn end, the badge counts down, and it's removed with a notice
  - `next_turn` start/end on caster and target, including the same-turn skip
  - `end_of_turn` expires at the turn end
  - Concentration on a player, then Stunned applied to that player → Concentration removed with a notice
  - a Hex-like effect linked to Concentration (drawer option) is removed when Concentration is removed by hand, with a notice for the linked effect only
  - previous turn changes nothing
  - a carried-over player effect with an NPC caster from another encounter shows "from <name> (not in this encounter)" and the Review notice. Keep stops the review next time; Remove removes it

  Record the outcome here
  - 2026-09-30: user tested all checks in the app, no issues
- [x] 5.4 After archiving, update `.planning/effects-implementation-plan.md`: split §2h into 2h1 (done — archived as effects-2h1-duration-expiry, <date>) and 2h2 (repeat saves, escape, on_expire; open), mark the missing-caster points 1–3 as done, record the `caster_key` = "turn entity at apply" assumption for steps 6–7, and update the Suggested Order. Verify the plan shows 2h1 as done and 2h2 as open
