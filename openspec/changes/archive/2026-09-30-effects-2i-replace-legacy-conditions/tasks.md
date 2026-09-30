## 1. Pure helpers

- [x] 1.1 Add `legacyConditionInstances({ conditions, effects, edition, round })` to `effectFunctions.js` (design decision 2). Verify with a scratchpad script covering:
  - NPC `{ poisoned: true, prone: true }` → 2 instances with `duration.type: "cancelled"` and `applied_round` = round
  - `{ exhaustion: 2 }` → `level: 2`, and `{ exhaustion: true }` → `level: 1`
  - an existing Prone instance → Prone skipped
  - an unknown key → skipped
  - every instance is schema-valid against `$defs/active_instance`
- [x] 1.2 Remove the legacy map check from `hasCondition`. Verify:
  - an entity with only `conditions: { incapacitated: true }` → false
  - Incapacitated or Paralyzed instances → true (the "effects-srd-data" scenarios)
  - the 2h1 `test-durations` and 2h2 `test-saves` scratchpad suites still pass

## 2. Store

- [x] 2.1 `encounters.js`: replace `set_entity_condition` / `SET_ENTITY_CONDITION` with `delete_entity_conditions` (writes `conditions: null` on the entity and clears the cached copy). Verify by reading that no other caller of the removed action exists (grep)
- [x] 2.2 `runEncounter.js`: add `convert_legacy_conditions` and call it in `init_Encounter` after the `add_entity` loop and before `resolve_effect_definitions` (design decision 2). It persists unless demo, is skipped in test runs, and deletes the map only after all writes succeed. Verify by reading against the "Legacy conditions are converted when an encounter is loaded" scenarios
- [x] 2.3 `runEncounter.js`: remove `entity.conditions` init, `set_condition`, `SET_CONDITION` and `DELETE_CONDITION`; remove `set_condition` from `initiative/Overview.vue`. Verify that a grep for `set_condition`, `SET_CONDITION` and `\.conditions\b` in `src/store` and `src/components/combat` only finds the reset cleanup in `encounters.js`

## 3. Tracker UI

- [x] 3.1 Rewrite `drawers/encounter/Conditions.vue` as a wrapper around `<Effects mode="conditions" :data="data" />`; change `mobile/Menu.vue`'s Conditions `data` to `[targeted[0]]`. Verify against the effects-drawer scenarios "Conditions option opens conditions mode" and "Conditions from an entity's menu" by reading `Targeted.vue`, `TargetMenu.vue` and `mobile/Menu.vue`
- [x] 3.2 Delete `drawers/encounter/Condition.vue`, `combat/Conditions.vue` and `combat/legacy/TargetItem.vue`. In `legacy/Current.vue`, replace `<Conditions>` with the chip row (`effects` flag). Remove the `type: "condition"` branch from `Effect.vue`, and the condition items and the `conditions` prop from `effects/index.vue`. Verify with a grep for `encounter/Condition"`, `encounter/Condition'`, `combat/Conditions` and `TargetItem` (no matches) and that each Vue option appears once

- [x] 3.3 `drawers/encounter/Effects.vue`: without a mode, list only SRD effects and custom effects; the conditions group only in conditions mode (added on request). Verify by reading `groups` against the modified effects-drawer requirements "Effects are listed by source and campaign edition" and "Conditions-only mode"

## 4. Live view

- [x] 4.1 `live/index.vue` passes `:edition="campaign.edition"` to both `Initiative` usages; `Initiative.vue` gets `effectsOf(entity)` and renders its items in the cell, "+N" and popup, and drops `api_conditions` and `returnConditions` (design decision 4). Verify with a scratchpad run of the `effectsOf` logic for an NPC (Prone + custom Bless), a player with Exhaustion 3 from `campPlayers`, and a 5.5e Concentration name
- [x] 4.2 `settings/TrackEncounter.vue`: relabel both `conditions` options "Conditions and effects" and update their info text. Verify by reading

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-2i-replace-legacy-conditions --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app:
  - the Conditions button, `c` and both menus open the Effects drawer with only conditions
  - the Effects option lists no conditions, only SRD effects (Concentration) and custom effects
  - applying and removing a condition there works, and its chip opens the detail view
  - an encounter with a legacy `conditions` map (set one on develop via the console) converts on load: NPC instances land on the encounter, a player's on the campaign, and the map is gone
  - the demo shows the player's Exhaustion 1
  - the legacy layout's current pane shows effect chips
  - the live view shows condition icons, Exhaustion level and a generic icon for other effects, and respects the "Conditions and effects" setting

  Record the outcome here
  - 2026-09-30: during testing the user asked to drop conditions from the Effects option (task 3.3)
  - 2026-09-30: user tested all situations in the app, no issues
- [x] 5.4 After archiving, mark 2i done in `.planning/effects-implementation-plan.md` (the §2i heading and the Suggested Order) as `(done — archived as effects-2i-replace-legacy-conditions, <date>)`. Verify the plan shows 2i done
