## 1. Pure helpers

- [x] 1.1 `buildEffectInstance`: `turnKey` → `applied_turn_key`, and `concentrationFor` → `concentration_for`. `rounds_remaining` for `concentration` with a value and no `concentration_id` (design decision 4). `escalationInstance` keeps `applied_turn_key`. Verify in the scratchpad against the "Applying creates an active effect instance per target" scenarios, plus an unlinked and a linked Concentration duration
- [x] 1.2 `durationActions`:
  - the same-turn rule uses `applied_turn_key ?? caster_key` (decision 5)
  - unlinked Concentration durations tick like `time`
  - `describeDuration` / `effectBadge` for them

  Verify with `test-durations.mjs` (still passes), plus the "Reaction during the target's turn", "Caster's next turn, cast out of turn", "Concentration duration" and both "Unlinked Concentration duration" scenarios
  - `test-durations.mjs` is no longer in the scratchpad. `test-2j.mjs` covers the next-turn rules instead, including old instances without `applied_turn_key` and "applied by someone else". The 3a/3b/3c1 scripts still pass. A shared `isCountingDown` decides the countdown, the description and the badge.
- [x] 1.3 `concentrationPlan` (decision 2). Verify in the scratchpad: none (option off, no caster), start, share, replace (different effect), and link and replace for an unknown effect
- [x] 1.4 `tempHpToLose`, and `expires_with_effect` on `tempHpParts` parts (decision 6). Verify in the scratchpad: 4 of 7 → 4, 12 of 5 → 0, 0 → 0, and no `temp_hp_granted` → 0

## 2. Storage

- [x] 2.1 Schema `$defs/active_instance`: `concentration_for`, `applied_turn_key`, `temp_hp_granted`. Verify that `validate.mjs` passes, and that a built Concentration instance validates against the schema in the scratchpad
- [x] 2.2 Rules: the three `effects` blocks in `firebase_rules/firebase-rules.json` (decision 7). Verify with the rules emulator against the "Database rules accept valid instances only" scenarios, and that the existing effects and bonuses emulator tests still pass

## 3. Drawer

- [x] 3.1 `ApplyEffect.vue`:
  - caster select with None
  - the `casterConcentration` function prop
  - "<caster> concentrates on it" for Concentration durations, with the warning, the link/replace choice and "Replace and apply"
  - "Ends with…" for other durations (off by default)
  - the application's `caster_key` and `concentration` plan

  Verify by reading against the "The application form chooses the caster" and "Application can link the effect to the caster's Concentration" scenarios, and that each Vue option appears once
- [x] 3.2 `Effects.vue`: `casters` / `defaultCaster` / `casterConcentration`, Shift+click with the default caster, and `apply` in the order replace → start → targets (decision 3), with `applied_turn_key`. Verify by reading against every effects-concentration scenario, and that each Vue option appears once

## 4. Temporary hit points

- [x] 4.1 `grantEffectTempHp` records `temp_hp_granted`. `remove_effect` removes the temporary HP and adds the `temp_hp_lost` prompt (not when `skipExpire`). `EffectTriggerNotifier` shows it. Verify by reading against the "Temporary hit points end with their effect" scenarios and "Recorded grant"
- [x] 4.2 5e False Life `expires_with_effect: true`. Verify that `validate.mjs` passes
- [x] 4.3 (Added on the user's request) Effect notifications show a small effect icon instead of snotify's large info/warning icon: the condition's icon (`hki-<url>`), else the default effect icon (`fa-sparkles`, as on the effect chips).
  - `effectRolls.effectToast` renders the toast as html, with the title and body escaped. The title is no longer cut off.
  - `EffectTriggerNotifier` uses it for every prompt, and so do the mixin's own toasts (incomplete amount, keeps its temporary HP, automatic results).
  - Notice prompts of ended effects carry `source` / `source_key` for the icon.
  - The incomplete-amount text now names the chosen caster instead of "whose turn it was".

  Verify that lint passes, and by reading that no effect toast still calls `$snotify.info` / `warning` directly

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-2j-concentration-caster --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app (upload the rules to the develop database first):
  - **Caster select:** during an NPC's turn, Heroism with an Archmage as the caster offers 5 temporary HP at the start of the target's turn. Before combat the caster is None.
  - **Start:** Bless (Concentration, up to 1 minute) on three creatures gives the caster one Concentration with 10 rounds left, and the three are linked
  - **Share:** Bless on a fourth creature links it to the same Concentration
  - **Replace:** Hex with the same caster shows the warning and "Replace and apply". The Bless Concentration and the three Bless effects end with notices, and the caster concentrates on Hex.
  - **Hand-applied Concentration:** link (default) or replace
  - **Up-to time:** after 10 of the caster's turns, Concentration and Bless end with "1 minute passed"
  - **Option off:** Bless with the option off has its own countdown
  - **Reaction:** a "until the end of its next turn" effect applied during the target's turn by another caster isn't removed at the end of that turn
  - **Toast icons:** a Poisoned notice shows the small Poisoned icon, and a Bless or Concentration prompt shows the sparkles icon, both at the left. Long titles aren't cut off, and the buttons still work.
  - **Temporary HP:** 5e False Life, take some damage, remove it → the rest of the temporary HP are removed with a notice. Heroism ending with its Concentration does the same. Temporary HP higher than the grant stay.

  Record the outcome here
  - 2026-10-02: user tested the whole 5.3 list in the app; everything works

- [x] 5.4 After archiving, mark 2j done in `.planning/effects-implementation-plan.md` (step 2j and the Suggested Order), including the temporary HP follow-up. Verify the plan shows it
