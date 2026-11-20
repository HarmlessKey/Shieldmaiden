## 1. Database rules

- [x] 1.1 In `c:\Users\keyro\Documents\development\firebase_rules\firebase-rules.json`, add the `effects` block from design decision 6 under encounter `entities/$entityId`, campaign `players/$playerId` and campaign `companions/$companionId` (before their `$other`). Keep the file's formatting and change nothing else. Verify with `git -C ../firebase_rules diff --stat` (one file) and that `node -e "JSON.parse(...)"` parses it
- [x] 1.2 Scratchpad script: assert the three `effects` blocks are deep-equal and that the `duration.type` regex lists exactly the `$defs/duration.type` enum of `src/schemas/hk-effects-schema.json`. Verify it exits 0
- [x] 1.3 Scratchpad emulator test (design decision 7): copy the rules, run `firebase emulators:exec --only database` with `@firebase/rules-unit-testing` installed in the scratchpad. Cover every scenario of "Database rules accept valid instances only" on a player path, plus: the same valid instance on an NPC encounter path and a companion path, a write by another uid rejected, and an unchanged existing player field (`curHp`) still accepted. Verify all assertions pass. If the emulator can't start, record why here and fall back to 4.3
  - 2026-09-29: emulator run passed 17/17 (player: valid, full time/save/choices instance, sub_effects / missing source / `forever` / bad source / bad key rejected, level update, delete, other uid rejected, `curHp` still accepted, unknown player field still rejected; companion valid; NPC valid via set and via update on the map, sub_effects rejected, other uid rejected)
- [x] 1.4 Ask the user to upload the rules to the Firebase project. Record the date here once confirmed
  - 2026-09-29: uploaded to the **develop** database. Production still needs the same rules before this code is released there (deploy order in the proposal)

## 2. Store: writes

- [x] 2.1 Add `updateCampaignEntity(uid, campaignId, path, value)` to `src/services/campaigns.js`, awaiting the update so errors propagate (design decision 2). Leave `updateCampaign` unchanged. Verify by reading: the promise is awaited and not swallowed
- [x] 2.2 Add `set_entity_effect` and `set_entity_effect_prop` actions plus `SET_ENTITY_EFFECT` / `SET_ENTITY_EFFECT_PROP` cache mutations to `src/store/modules/userContent/encounters.js` (design decision 1): create the cached `effects` map if missing, delete on `null`. Verify the actions use `updateEncounter` with `/entities/{entityId}/effects` and `/entities/{entityId}/effects/{effectKey}`
- [x] 2.3 Add `set_campaign_entity_effect` and `set_campaign_entity_effect_prop` plus the cache mutations to `src/store/modules/userContent/campaigns.js`, using `updateCampaignEntity` under `/{type}/{id}/effects`. Verify the same way as 2.2
- [x] 2.4 In `src/store/modules/runEncounter.js`, add `persist_effect` and call it from the `// 2b: persist here` blocks in `apply_effect` (new instance → full value; Exhaustion → `property: "level"`) and `remove_effect` (`null`), each write in `try/catch` that logs and skips the commit on failure (design decision 3). Verify by reading against "Apply, level change and removal are written", "Failed writes leave the tracker unchanged" and "Demo and test mode do not write". A duplicate condition returns before any write

## 3. Store: load and reset

- [x] 3.1 In `add_entity`, fill `entity.effects` from the encounter entity (NPC) or the campaign player/companion, as a spread copy, `{}` in demo and test mode (design decision 4). Verify every entity type still gets an `effects` map and the source matches where `saves` is read
- [x] 3.2 In `encounters/reset_encounter`, add `delete entity.effects` next to `delete entity.conditions`. Verify no campaign path is written by the reset

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors in the changed files
- [x] 4.2 Run `openspec validate effects-2b-persist-effects --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app, after the rules are uploaded: apply Prone to an NPC and Exhaustion to a player and a companion; check the paths in the Firebase console; reload and confirm the effects (and drawer presence) are back; apply Exhaustion again and confirm the level updates in place; remove them and confirm the keys are gone; leave and reopen the encounter without reloading; open another encounter of the same campaign and confirm the player's Exhaustion carries over; reset an encounter; confirm the demo and test mode write nothing. Record the outcome here
  - 2026-09-29: user tested against the develop database, no issues found. Open question raised for 2g/2h: effects carried over on players whose `caster_key` is not in the current encounter
- [x] 4.4 Update `.planning/effects-implementation-plan.md` §2b with the Realtime Database paths (instead of `users/{uid}/campaigns/...`), and add a step 4 note that the constants check should also cover the rules' duration type enum. Verify with `grep -n "users/{uid}/campaigns" .planning/effects-implementation-plan.md` (no matches in §2b)
- [x] 4.5 After archiving, mark step 2b done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-2b-persist-effects, <date>)`. Verify the plan shows 2b as done
