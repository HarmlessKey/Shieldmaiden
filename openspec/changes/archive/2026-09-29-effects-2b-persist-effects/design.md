## Context

See proposal.md (Why). Requirements: `specs/effects-instance-storage/spec.md`, plus the
removal in `specs/effects-drawer/spec.md`.

Current state that shapes the approach:

- **Tracker actions (2a)**: `runEncounter/apply_effect({ key, instance, definition })`
  and `remove_effect({ key, source, source_key, effectKey })` commit
  `SET_EFFECT` / `DELETE_EFFECT`. Each has empty `// 2b: persist here` blocks behind
  `if (!state.demo && !state.test)`. The drawer calls them without `await`, once per
  target.
- **Encounter writes**: `encounters/set_entity_condition` calls
  `services.updateEncounter(uid, cid, eid, "/entities/{id}/conditions", { [k]: v })`,
  then commits `SET_ENTITY_CONDITION` to `cached_encounters`. `updateEncounter` awaits
  the update and rethrows, so failures reach the caller.
- **Campaign writes**: `campaigns/update_campaign_entity` uses
  `services.updateCampaign`, which **does not return its promise**. The
  `.then().catch(throw)` chain is dropped, so a rejected write is never seen by the
  caller (the error surfaces only as an unhandled rejection). That can't meet "failed
  writes leave the tracker unchanged".
- **Init**: `add_entity` builds each entity from the encounter entity (`db_entity`).
  Players and companions then take `curHp`, `saves` etc. from the cached campaign
  (`campaign.players[key]` / `campaign.companions[key]`), which comes from
  `campaigns/get_campaign`. The demo uses `db_entity` for both. 2a sets
  `entity.effects = {}` unconditionally.
- **Rules** (`firebase_rules/firebase-rules.json`, a separate git repo): encounter
  entities have per-field `.validate` rules and **no** `$other` catch-all, so an
  `effects` child is accepted today unvalidated. `campaigns/$uid/$campaignId/players/$playerId`
  and `companions/$companionId` end in `"$other": { ".validate": false }`, so an `effects`
  child is rejected until a rule exists. Write permission comes from the `$uid` level
  (`$uid === auth.uid || admin`) and is unchanged.
- The plan's paths (`users/{uid}/campaigns/...`) are Firestore-style. The app is on the
  Realtime Database, under `encounters/{uid}/{cid}/{eid}` and `campaigns/{uid}/{cid}`.

## Goals / Non-Goals

**Goals:**
- One write per apply, level change or removal, done before the in-memory commit.
- Player and companion effects follow the campaign like HP does. NPC effects follow the
  encounter.
- Rules that reject malformed instances, tested in the emulator before the user uploads.

**Non-Goals:**
- Resolving `sub_effects` / `includes` into loaded instances (2e).
- Showing effects on combatants (2f), triggers and duration ticking (2g/2h).
- Batching multi-target writes into one multi-path update. Targets are written
  independently so one failure doesn't block the rest (spec).
- Clearing player/companion effects outside the tracker (a campaign-level reset or rest).
  They persist until removed in the drawer, like HP persists until healed.
- Live player view (`track` / `broadcast`) and migrating legacy `conditions` (2i).

## Decisions

### 1. Store actions mirror the existing entity writes
- `encounters/set_entity_effect({ campaignId, encounterId, entityId, effectKey, value })`:
  `services.updateEncounter(uid, cid, eid, "/entities/{entityId}/effects", { [effectKey]: value })`,
  then commits `SET_ENTITY_EFFECT` (create the `effects` map on the cached entity if
  missing; `Vue.delete` when `value === null`). `value` is the full instance, or `null` to
  delete.
- `encounters/set_entity_effect_prop({ ..., effectKey, property, value })` for the
  Exhaustion level: update path `/entities/{entityId}/effects/{effectKey}` with
  `{ [property]: value }`, and the same cache mutation on the nested object. Kept
  separate from `set_entity_effect` so a level change never rewrites the whole instance.
- `campaigns/set_campaign_entity_effect({ campaignId, type, id, effectKey, value })` and
  `campaigns/set_campaign_entity_effect_prop({ ..., property, value })` do the same under
  `/{type}/{id}/effects`, with a `SET_CAMPAIGN_ENTITY_EFFECT` cache mutation.
  `type` is `"players"` or `"companions"`.

*Alternative:* reuse `set_entity_prop` / `update_campaign_entity` with
`property: "effects/eff_x"`. Rejected: slash paths inside an update key work in Firebase,
but the cache mutations would then write a literal `"effects/eff_x"` key.

### 2. Awaited campaign write
Add `campaignServices.updateCampaignEntity(uid, campaignId, path, value)` that
`await`s `CAMPAIGNS_REF.child(...).update(value)` and lets errors propagate. The new
campaign actions use it. `updateCampaign` itself stays as it is: changing it would change
error behavior for every existing caller, which is out of scope.

### 3. Persistence inside `apply_effect` / `remove_effect`
- A small internal helper action `persist_effect({ key, effectKey, value, property })`
  picks the target from `state.entities[key].entityType`. `npc` → encounter actions;
  `player` / `companion` → campaign actions with `type: entityType + "s"` (same convention
  as `set_save`). With `property` it calls the `_prop` variant.
- `apply_effect`: new instance → `persist_effect({ value: instance })`, then commit.
  Exhaustion present → `persist_effect({ effectKey, property: "level", value })`, then
  commit. Duplicate condition → return before any write.
- `remove_effect`: per matching key, `persist_effect({ value: null })`, then commit.
- Errors: the actions `try/catch` around each write, `console.error` and skip that
  commit. The drawer already calls them per target without awaiting, so one target's
  failure doesn't stop the others. No user-facing notification in this step (none exists
  for condition writes either).
- The guard stays `!state.demo && !state.test`. In those modes only the commit runs.

### 4. Raw load in `add_entity`
- Replace `entity.effects = {}` with: `state.test || state.demo ? {} : { ...(source.effects || {}) }`,
  where `source` is `db_entity` for NPCs, `campaign.players[key]` for players and
  `campaign.companions[key]` for companions. Assigned inside the existing `switch`
  branches, next to where `saves` / `stable` are read, so the source is the same one HP
  uses. The default `{}` stays above the switch so every entity has the map.
- Spread copy so the tracker never mutates the cached campaign or encounter object.
- No `sub_effects` resolution, which 2e adds in this same place.

### 5. Encounter reset
`reset_encounter` adds `delete entity.effects;` next to `delete entity.conditions;`.
It rewrites whole encounter entities, so this also drops any stray `effects` on player
entities in the encounter (there shouldn't be any).

### 6. Rules block
One JSON block, copied verbatim into three places:
`encounters/$uid/$campaignId/$encounterId/entities/$entityId/effects`,
`campaigns/$uid/$campaignId/players/$playerId/effects` and
`campaigns/$uid/$campaignId/companions/$companionId/effects`.

```json
"effects": {
  "$effectId": {
    ".validate": "$effectId.matches(/^[A-Za-z0-9_-]{1,100}$/) && newData.hasChildren(['name', 'source', 'source_key'])",
    "name": { ".validate": "newData.isString() && newData.val().length <= 200" },
    "source": { ".validate": "newData.isString() && newData.val().matches(/^(srd|custom|api)$/)" },
    "source_key": { ".validate": "newData.isString() && newData.val().length <= 100" },
    "duration": {
      ".validate": "newData.hasChildren(['type'])",
      "type": { ".validate": "newData.isString() && newData.val().matches(/^(instant|time|cancelled|concentration|next_turn|end_of_turn|rest|dawn|trigger|save_ends|special|action_removed|long_rest)$/)" },
      "value": { ".validate": "newData.isNumber() || newData.isString() || newData.hasChildren()" },
      "unit": { ".validate": "newData.isString() && newData.val().matches(/^(round|minute|hour|day)$/)" },
      "anchor": { ".validate": "newData.isString() && newData.val().matches(/^(caster|target)$/)" },
      "edge": { ".validate": "newData.isString() && newData.val().matches(/^(start|end)$/)" },
      "save": { ".validate": "newData.hasChildren(['ability'])" }
    },
    "choices": { "$choice": { ".validate": "newData.isString() && newData.val().length <= 100" } },
    "caster_key": { ".validate": "newData.isString() && newData.val().length <= 100" },
    "concentration_id": { ".validate": "newData.isString() && newData.val().length <= 100" },
    "parent_id": { ".validate": "newData.isString() && newData.val().length <= 100" },
    "applied_round": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 9999" },
    "rounds_remaining": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999999" },
    "save_dc": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 99" },
    "level": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 99" },
    "charges": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 9999" },
    "save_successes": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 99" },
    "save_failures": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 99" },
    "immune_until_round": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 9999" },
    "$other": { ".validate": false }
  }
}
```

`duration` has no `$other`. Its nested parts (`cancel_triggers`, `ends_when`, `escape`,
`on_expire`, repeat-save details) are deep schema objects that steps 6–7 will write, and
the RTDB rules language can't validate recursive structures. The top-level instance is
closed. The duration type enum is copied from `$defs/duration.type`. Step 4's
constants check should also cover the rules, a note left in the plan.

*Alternative:* no validation, just allow `effects` (`".validate": true`). Rejected: player
nodes are deliberately closed today, and a typed block costs little.

### 7. Verification without running the app
- A scratchpad script checks the three rules blocks are identical and that the duration
  type enum matches the schema.
- Rules emulator test (Firebase CLI and Java are installed): a scratchpad
  `firebase.json` pointing at a copy of the rules, `firebase emulators:exec --only database`
  running a node script with `@firebase/rules-unit-testing`, installed in the scratchpad
  only. It covers the four rules scenarios for players, plus owner-only access and an NPC
  path. If the emulator can't run, fall back to the console's Rules Playground and record
  that.
- `npm run lint`, and the user verifies in the app (task list).

## Risks / Trade-offs

- [Code deployed before rules are uploaded → player/companion effect writes rejected] →
  The failure is logged and the tracker stays consistent (spec). Deploy order is noted in
  the proposal, and the user uploads the rules as part of the tasks.
- [Player effects persist indefinitely across encounters] → Intended (plan §2d, like
  `curHp`). They are visible and removable in the drawer. A campaign-level clear is out
  of scope.
- [Write-then-commit makes applying feel slower on a slow connection] → Same pattern as
  conditions and HP today.
- [A cached campaign is shared with other views] → Cache mutations only touch
  `.../{type}/{id}/effects`, the same way `SET_DEATH_SAVE` touches `saves`.
- [The duration type enum is duplicated in the rules] → Checked by the scratchpad script
  now. The step 4 constants check is extended to it later.

## Migration Plan

1. The user uploads the updated rules (the change stays on `feature/effects` until then).
2. Ship the code. No data migration: nothing was stored under `effects` before, and
   legacy `conditions` are untouched.
3. Rollback: revert the code. The rules block can stay (it only adds allowed data), and
   stored `effects` maps are ignored by older code.
