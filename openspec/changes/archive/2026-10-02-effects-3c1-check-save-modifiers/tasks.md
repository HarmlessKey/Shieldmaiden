## 1. Pure helpers

- [x] 1.1 Add `conditionState` (design decision 2). Verify in the scratchpad: each evaluable type for self and caster, unknown for counterpart, distance, line_of_sight, can_see and a missing caster, negate, and the all_of/any_of/array rules. Also check that `test-durations.mjs` / `test-3b.mjs` still pass (`evaluateConditionSet` unchanged)
- [x] 1.2 Add `rollModifiers` and `rollPlan` (design decisions 1 and 3), and in `entityFunctions.js` `skillBonusKey` and the roll-bonus keys in `BONUS_LABELS` (decision 5). Verify with a scratchpad script against every scenario of these requirements, using the real 5e/5.5e conditions and the SRD test effects (Haste, Slow, Robe, Exhaustion, Bless as a custom definition):
  - "Roll modifiers are collected per roll"
  - "Advantage and Disadvantage change the roll"
  - "Flat and dice bonuses are added"
  - "Automatic failure and success skip the roll"
  - "Modifiers the tracker can't check are reminders"
  - "Single-use modifiers end their effect"
  - "Manual roll bonuses"

## 2. Dice and store

- [x] 2.1 `rollD` `extras` (bonus dice, notes, `bonus_rolls`). Verify in the scratchpad with the real dice mixin (as in `test-rollaction.mjs`): the total includes the signed bonus dice, existing calls are unchanged, and both advantage keys roll one d20
- [x] 2.2 Add the `roll_modifiers` getter and the `consume_roll_modifiers` action. Verify by reading

## 3. Roll sites

- [x] 3.1 `hk-roll.vue`: `roll.plan` (advantage merge, colour, auto result, consume). Verify by reading that callers without `plan` are unchanged, and that each Vue option appears once
- [x] 3.2 `CardDetails.vue`, `CardSkills.vue`, `Targeted.vue`: plans on MOD/SAVE/skills, shown values with markers (`EffectModifiedValue` `lines` / `modified`). Verify by reading against "The tracker's d20 roll sites use roll modifiers"
- [x] 3.3 `hk-single-roll.vue` `rollSave` (plan, total instead of dice, auto, notes) and `rollAction`'s `source` for spells. Verify by reading against the "Roll-dialog save uses the total", "Target save in the roll dialog" and "Robe against a spell" scenarios
- [x] 3.4 `effectRolls.rollEffectCheck` with plans, plus repeat saves (`EffectTriggerNotifier`) and escapes (`ActiveEffect`) resolving auto results. Verify by reading against the "Repeat save" scenario
- [x] 3.5 `initiative/NPCs.vue` `rollMonster` with the initiative plan. Verify by reading against "Invisible initiative", and that `rollGroup` is unchanged

## 4. Manual roll bonuses

- [x] 4.1 Rules: extend the `$stat` regex in the three `bonuses` blocks of `firebase_rules/firebase-rules.json`. Verify with the rules emulator: every new key accepted, `skill_luck` / `save_luck` rejected, and the 3b and effects emulator tests still pass
- [x] 4.2 `StatBonuses.vue` with several values and the add-for select, roll values (stored and effective modifier, plan lines), the ability score opener, and the new skills button. Verify by reading against the modified "The bonuses drawer…" scenarios, and that each Vue option appears once

- [x] 4.3 (Added on the user's request) SRD test effects in both editions' `effects.js`:
  - Bless (+1d4) and Bane (−1d4) on attacks and saves
  - Guidance: 2014 is one ability check and then ends (`consume`); 2024 is a chosen skill until the spell ends (`choice: "skill"`)
  - Resistance: 2014 is one save and then ends; 2024 reduces damage of a chosen type (`damage_modifier`, applied in a later step)

  `rollModifiers` now lets `choice: "ability"` / `"skill"` limit which rolls a modifier applies to. Verify that `validate.mjs` passes, and with `test-3c1.mjs` per edition (Bless, Bane, both Guidances, both Resistances, a Hex-style ability choice)

## 6. Concentration saves (added during testing, at the user's request)

- [x] 6.1 `rollModifiers` roll kind `concentration`. Verify in `test-3c1.mjs` against the "Modifiers on the save" scenario, plus a `concentration_save` Advantage effect
- [x] 6.2 `fire_trigger`: the `concentration_save` prompt with the evaluated DC (design decision 7). Verify in the scratchpad that the DC arithmetic matches the "Minimum and maximum DC" scenario using the real Concentration definitions, and by reading that other sub-effects keep their trigger prompt
- [x] 6.3 `EffectTriggerNotifier.vue` `showConcentrationSave` (Roll / Succeeded / Failed, auto, failure removes with the reason), and `StatBonuses.vue` `concentration_save` as a roll value. Verify by reading against the "Failed save ends linked effects" and "Unknown damage" scenarios, and that each Vue option appears once
- [x] 6.4 Run lint and `openspec validate --strict`, and ask the user to check: a 5.5e Concentration at 23 damage shows DC 11. Roll with Bless and a `concentration_save` bonus names both. Failing removes Concentration and a linked effect.
  - 2026-10-02: lint and strict validation pass. User tested the Concentration rolls in the app; everything works. The prompt text was simplified on request to "Took # damage." / "Constitution saving throw, DC #."

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-3c1-check-save-modifiers --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app (upload the rules to the develop database first):
  - Poisoned: a card check and a skill have Disadvantage (red roll button, the result names Poisoned)
  - Paralyzed: card Strength save → "fails automatically (Paralyzed)". A Dexterity save of a Paralyzed target in the roll dialog is failed without a roll.
  - Haste: Dexterity save with Advantage. Haste + Restrained: a normal roll.
  - Slow: card Dexterity SAVE shows 2 lower, marked
  - 5.5e Exhaustion level 2: checks, saves and NPC initiative 4 lower
  - Bless: the save result shows "Bless +1d4: n" in the total. Bane: "Bane −1d4: n".
  - 5e Guidance: a skill check adds 1d4 and Guidance ends ("used"). 5.5e Guidance on Stealth: only Stealth checks get +1d4, and it stays.
  - 5e Resistance: a save adds 1d4 and it ends. 5.5e Resistance: no roll change (damage reduction comes later).
  - Frightened: the check is rolled normally, with the reminder in the result
  - Robe of the Archmagi: a roll-dialog save against a spell has Advantage, and a card save shows the reminder
  - 5.5e Invisible NPC: initiative with Advantage
  - a roll-dialog save now compares the total with the DC
  - manual bonuses: Cloak of Protection `save_all` +1 from the skills button, `skill_stealth` +2 and `check_dexterity` +1 → Stealth +3 and Acrobatics +1. The Dexterity score opens Dexterity, checks and saves.

  Record the outcome here
  - 2026-10-02: user checked the 5.3 list in the app; everything works

- [x] 5.4 After archiving, mark 3c1 done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order), and note that 3c2 is open. Verify the plan shows it
