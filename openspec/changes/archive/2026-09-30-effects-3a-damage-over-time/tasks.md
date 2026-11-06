## 1. Pure helpers

- [x] 1.1 Add `evaluateFormula` and `resolveAmount` to `src/utils/effectFunctions.js` (design decision 2, no `eval` / `Function`). Verify with a scratchpad script covering:
  - `caster.wis_mod` with Wisdom 16 → 3
  - `damage_taken / 2` with `min: 10, max: 30` and round down
  - an unknown variable → 0 and named in `missing`
  - `"alert(1)"` and `"constructor"` → 0, nothing executed
  - parentheses, unary minus, division by zero → 0
  - a number, a numeric string, a formula object and a formula string as `amount`
- [x] 1.2 Add `effectRollParts` (recipient, dealer, grouping, action shape, damage type order, level scaling, save mapping, notes). Verify in the scratchpad against every scenario of "The rolled amount comes from the sub-effect", "The recipient follows the sub-effect's target", "The dealer is the holder or the caster", "A sub-effect save becomes a save in the roll" and "Damage without an amount can still be rolled" (including the legacy `subtype: "roll"` sub-effect after `normalizeDefinition`)
- [x] 1.3 `resolveRepeatSave` also returns `onFailSubEffects`; add `onExpireSubEffects` and let `onExpireLines` map it. Verify that the 2h2 scratchpad tests still pass unchanged, and that the new fields hold the raw sub-effects

## 2. Store

- [x] 2.1 `fire_trigger` trigger prompts, the `on_fail` prompt in `resolve_repeat_save` and the `on_expire` prompt in `remove_effect` carry `sub_effects`, an `instance` snapshot and `event: { sourceKey, amount }` (design decision 3). Verify by reading that prompts without damage or healing are unchanged in content and that no dice code enters the store

## 3. UI

- [x] 3.1 `src/mixins/effectRolls.js`: add `effectFormulaVars(entity)` and `rollEffectParts(prompt)` (design decision 4: `rollAction` on the built ability, `save_dc` restored, `target` / `current` set, `setActionRoll`). Verify with a scratchpad run that feeds `effectRollParts` output through a copy of `rollAction`'s field reads (`name`, `action_list[].type/rolls/save_ability/save_dc`) and gets the expected actions
- [x] 3.2 `EffectTriggerNotifier.vue`: a Roll button on trigger, `on_fail` and `on_expire` prompts when `effectRollParts` yields at least one part. It re-checks the parts on click and closes the toast. Verify by reading that prompts without damage or healing keep their current buttons, and that each Vue option appears once

## 4. SRD data

- [x] 4.1 Add Burning to `src/data/5.5e/effects.js` (design decision 5). Verify that `node scripts/validate-effects-data/validate.mjs` passes and that 5e has no `burning`

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-3a-damage-over-time --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app:
  - in a 5.5e campaign, apply Burning to an NPC. At the start of its turn the prompt shows Roll, which opens the roll dialog with 1d4 fire against the NPC. Applying it lowers HP and logs it.
  - an NPC with fire resistance takes half
  - Burning applied by a player: the log and meters credit that player
  - a legacy custom damage effect: Roll opens "<name> (amount not set)" with 0, and the DM can enter a total
  - a repeat save with an `on_fail` damage sub-effect (custom effect or console): the failure prompt offers Roll
  - prompts without damage (Concentration on damage) look as before

  Record the outcome here
  - 2026-09-30: user tested all situations in the app, no issues. The `on_fail` case was tested by adding `duration.save.on_fail` to a running instance from the browser console (the drawer has no input for it)
- [x] 5.4 After archiving, mark 3a done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order) as `(done — archived as effects-3a-damage-over-time, <date>)`. Verify the plan shows 3a done and 3b–3g open
