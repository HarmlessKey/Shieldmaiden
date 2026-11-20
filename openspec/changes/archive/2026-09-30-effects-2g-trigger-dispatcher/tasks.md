## 1. Matching

- [x] 1.1 Move the sub-effect wording from `EffectDetails.vue` into `describeSubEffect(sub_effect)` in `src/utils/effectFunctions.js` and use it from `EffectDetails`. Add `normalizeTrigger` and a `TRIGGER_LABELS` map. Verify the drawer and the detail view wording is unchanged (lint, and a scratchpad comparison on the Paralyzed lines)
- [x] 1.2 Add `matchTriggers` (design decision 1): scopes, the missing-caster fallback, `effectKey` restriction, skipping unresolved, filters with pass/fail/unknown and unchecked labels. Verify with a scratchpad script covering every scenario of "Matching effects are found per trigger", "Caster-anchored triggers fall back…" and "Trigger filters are applied…", including legacy spellings and no listeners

## 2. Store

- [x] 2.1 Add the `turn_order` getter and switch the Effects drawer's caster computation to it (design decision 2). Verify by reading that the sort matches `RunEncounter._active` (filter, name sort, initiative sort with `initOrder`)
- [x] 2.2 Add `effect_prompts` state, `ADD_EFFECT_PROMPTS` / `CLEAR_EFFECT_PROMPTS`, clearing in `init_Encounter`, and the `fire_trigger` action. Verify by reading that it never commits anything except prompts
- [x] 2.3 Fire the turn triggers from `set_turn` (start, forward, backward rules). Verify by reading against the "Turn triggers fire when combat moves forward" scenarios, and that the outgoing entity is computed before the commit
- [x] 2.4 Fire `on_apply` (instance only) and `on_condition_applied` from `apply_effect` for new instances only. Verify against the "Applying an effect fires its apply triggers" scenarios

## 3. Hooks

- [x] 3.1 `HpManipulations.js`: `damage_taken`, `damage_dealt`, `on_zero_hp` and `on_bloodied` in `isDamage`, `on_heal` in `isHealing`, with the events of design decision 3, and none for undo or 0. Verify by reading against the "HP changes fire their triggers" scenarios (20/20 → 8, 5 → 0, 8 → 5)
- [x] 3.2 `hk-single-roll.vue` `apply`: the hit, crit and save triggers per action, with attack types and the natural roll. Verify against the "Roll outcomes fire their triggers" scenarios
- [x] 3.3 `hk-roll.vue` optional `roll.trigger`, and `CardDetails.vue` / `CardSkills.vue` pass it for checks and skills but not saves. Verify other `hk-roll` callers are untouched. *Added 2026-09-30 after user feedback:* the targeted panel's check buttons (`Targeted.vue`, MOD) pass it too; its SAVE buttons don't. The legacy layout's current-entity card (`ViewEntity.vue`: ability, NPC skill and player skill checks) got it as well. That makes 7 check rolls across 4 components
- [x] 3.4 ~~Short rest / Long rest items in `TargetMenu.vue` and `mobile/Menu.vue`~~ Dropped on 2026-09-30 at the user's request: `TargetMenu` is never rendered, and rests wait for a real rest feature. The items were removed from both menus and the spec's rest requirement was changed accordingly. Verify: `grep -n "rest" TargetMenu.vue mobile/Menu.vue` shows no rest items

## 4. Prompts

- [x] 4.1 Create `src/components/combat/EffectTriggerNotifier.vue` and mount it once in `RunEncounter.vue` (design decision 4), with a title per trigger label, lines, and Details / Dismiss buttons. Verify it is mounted once for both the desktop and mobile layouts, and each Vue option appears once

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-2g-trigger-dispatcher --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app. There are no SRD effects with turn triggers yet, so use the custom effects form or check via the console (`store.dispatch("fire_trigger", …)` and `store.state.encounter.effect_prompts`). Check:
  - Concentration on an entity prompts on damage (`damage_taken`) and at 0 HP
  - applying Unconscious prompts "apply Prone" (`on_apply`)
  - next turn fires the end/start triggers; previous turn fires nothing
  - start encounter fires `combat_start`
  - a crit applied from the roll dialog prompts `on_crit_taken` listeners
  - a card skill roll fires `on_check`
  - Short/Long rest fire their triggers
  - Details opens the detail view
  - the Effects drawer still picks the right caster

  Record the outcome here
  - 2026-09-30: first run showed no prompts. Cause: `<EffectTriggerNotifier />` had been placed in RunEncounter's `v-else` loading block instead of the running-encounter block, so it unmounted once the encounter loaded (prompts piled up in `effect_prompts`). Fixed by moving it to the main `q-no-ssr`. The console check confirmed the triggers themselves (turn order end caster/target → start caster/target; `damage_taken` + `damage_dealt` on damage; matches returned for Concentration). After the fix the user confirmed: Concentration prompts on damage and at 0 HP, Unconscious prompts on apply, Details / Dismiss work. The user later also confirmed: previous turn fires nothing, the hit/crit/save triggers from the roll dialog, `on_check` from the card and the targeted panel, and the drawer caster. Short/Long rest dropped (see 3.4). Save/check modifiers are left to step 3 (plan note added)
- [x] 5.4 After archiving, mark step 2g done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-2g-trigger-dispatcher, <date>)`, record the missing-caster fallback as decided in §2g, and note in §2h that points 2–3 of its open question remain. Verify the plan shows 2g as done
