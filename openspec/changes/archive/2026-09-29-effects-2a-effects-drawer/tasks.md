## 1. Helpers

- [x] 1.1 Create `src/utils/effectFunctions.js` with `getSrdDefinitions(edition)` (design decision 1): returns `{ conditions, effects }` for `"5.5e"`, 5e for anything else, each sorted by `name`. Verify with a scratchpad script: 15 conditions + Concentration per edition, `undefined` edition returns 5e, and 5.5e Exhaustion carries the 2024 description
- [x] 1.2 Add `getRequiredChoices(definition)` collecting sub-effect `choice` kinds and `roll.damage_type_choice` lists recursively, one entry per kind. Verify in the scratchpad against a Hex-like fixture (`choice: "ability"`), a Chromatic-Orb-like fixture (`damage_type_choice`), every SRD condition (no choices) and a custom definition without `sub_effects` (no error, no choices)
- [x] 1.3 Add `durationToRounds` and `generateEffectKey(existingKeys)` (`eff_` + 4 base36 chars, regenerated on collision). Verify: 10 round → 10, 1 minute → 10, 1 hour → 600; a key set containing the first generated key yields a different key
- [x] 1.4 Add `buildEffectInstance({ definition, source, sourceKey, application, round, casterKey })` per the spec's "Applying creates an active effect instance per target" requirement: no `sub_effects` / `description` / `cancelable`, no undefined or empty fields, `rounds_remaining` only for `time`, `save_dc` + `duration.save` only with a repeat save, `caster_key` omitted when there is no actor. Verify with a scratchpad script that builds the instance for every scenario in `specs/effects-drawer/spec.md` (Stunned, Burning 10 rounds, 1 minute, next_turn target/end, Paralyzed with Wisdom DC 15, Hex choice, round 0 without actor) and validates each with Ajv against `$defs/active_instance`

## 2. Store

- [x] 2.1 In `src/store/modules/runEncounter.js` `add_entity`, set `entity.effects = {}` next to `conditions` / `reminders`. Verify by reading the code path: every entity (NPC, player, companion, demo) passes through this assignment
- [x] 2.2 Add `SET_EFFECT` / `DELETE_EFFECT` mutations using `Vue.set` / `Vue.delete` on `state.entities[key].effects`. Verify the mutations follow the `SET_CONDITION` / `DELETE_CONDITION` pattern
- [x] 2.3 Add `apply_effect({ key, instance, definition })` (design decision 2): non-Exhaustion SRD condition already present → no-op; Exhaustion present → set the chosen `level` on the existing instance; otherwise generate a key and commit. Returns the effect key. Include the `// 2b: persist here` marker inside an `if (!state.demo && !state.test)` guard with no database call. Verify by reading against the spec scenarios "Condition already present" and "Exhaustion increments", and that `entity.conditions` / reminders are not touched
- [x] 2.4 Add `remove_effect({ key, source, source_key, effectKey })` removing every matching instance (or the one `effectKey`). Verify it does not dispatch any `encounters/` or `campaigns/` action
- [x] 2.5 Change the demo branch of `init_Encounter` to `SET_EDITION("5.5e")`. Verify `grep -rn '"2024"' src/store` returns no edition assignment

## 3. Drawer

- [x] 3.1 Create `src/components/drawers/encounter/effects/EffectDetails.vue`: description, sub-effect descriptions, Exhaustion per-level table from `EXHAUSTION_LEVELS[edition]`, "No details available" fallback. Verify with lint and by reading against the "Effect details are expandable" scenarios
- [x] 3.2 Create `src/components/drawers/encounter/effects/ApplyEffect.vue` (design decision 4): duration type/value/unit/anchor/edge, repeat save toggle (ability, DC, triggers, default `end_turn_target`), choice inputs from `getRequiredChoices`, Exhaustion level 1–6 with the given default; emits `apply` with the application object and `cancel`. Apply disabled while invalid (time value ≤ 0 or empty, missing DC or choice). Verify by reading against the duration, repeat-save and choices scenarios
- [x] 3.3 Create `src/components/drawers/encounter/Effects.vue`: targets from `data` (entity keys) or `targeted`, "select targets" prompt when empty, `mode` prop, groups SRD conditions / SRD effects / custom (custom only with a signed-in user and at least one effect, loaded via `effects/get_effects`), condition icons `hki-<url>`, expandable entries with `EffectDetails` and `ApplyEffect`, full custom definition via `effects/get_effect` on expand/apply. Verify with `npm run lint` and by reading against the listing and mode scenarios
- [x] 3.4 Wire apply/remove in `Effects.vue`: all/some/none presence indicator from `entity.effects`, one-click apply for entries without choices (default `cancelled`), Exhaustion opens the level picker defaulting to current level + 1 (max 6, 1 when absent), apply builds one instance per target with `buildEffectInstance` (`round` getter, turn entity key — see design Context) and dispatches `apply_effect`; remove dispatches `remove_effect` per target. Verify by reading against the apply/remove scenarios; the whole component block uses a single `computed` / `methods` / `data` option each

## 4. Entry points

- [x] 4.1 Add an `effects` option to `src/components/combat/Targeted.vue` after `reminders` opening `drawers/encounter/Effects` with hotkey `f`; first check the hotkey handling for an existing `f` binding and pick another free key if taken. Verify the options list has no duplicate key
- [x] 4.2 Add an "Effects" item next to Conditions in `src/components/combat/TargetMenu.vue` (`data: [entity.key]`) and `src/components/combat/mobile/Menu.vue` (`data: [targeted[0]]`, keys only). Verify both menus still open the legacy Conditions drawer unchanged

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors in the changed files
- [x] 5.2 Run `node scripts/validate-effects-data/validate.mjs` and verify the SRD data is unchanged and still passes
- [x] 5.3 Run `openspec validate effects-2a-effects-drawer --strict` and verify it passes
- [x] 5.4 Ask the user to verify in the running app: open the drawer in a 5e campaign, a 5.5e campaign and the demo; apply Prone, Stunned with a repeat save, Exhaustion twice and a custom effect; remove them; confirm the legacy Conditions drawer still works. Record the outcome here
  - 2026-09-29: user confirmed applying effects works and the drawer tracks them correctly across different targets (all/some presence). Also confirmed: tested in a 5e campaign, a 5.5e campaign and the demo; removing works; the legacy Conditions drawer still works
- [x] 5.5 After archiving, mark step 2a done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-2a-effects-drawer, <date>)`, and note in 2b that `apply_effect` / `remove_effect` hold the persistence marker. Verify the plan shows 2a as done
