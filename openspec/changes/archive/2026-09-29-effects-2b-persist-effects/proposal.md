## Why

Step 2a shipped the Effects drawer, but applied effects live only in memory: a reload
loses them. Step 2b of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
saves each active effect instance to the Realtime Database, following the same split as HP.
NPC effects belong to the encounter; player and companion effects belong to the campaign,
so they carry across encounters the way `curHp` does. This is what 2e (resolving
`sub_effects`) and later the trigger and duration steps (2g, 2h) build on. Instance
shape: plan §2d and `$defs/active_instance` in `src/schemas/hk-effects-schema.json`
(background in [effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §2).

## What Changes

- **Write on apply** in the 2a `runEncounter` actions, at their `// 2b: persist here`
  markers, before the in-memory commit:
  - NPCs: `encounters/{uid}/{campaignId}/{encounterId}/entities/{entityKey}/effects/{effectKey}`
    via a new `encounters/set_entity_effect` action (like `set_entity_condition`).
  - Players and companions:
    `campaigns/{uid}/{campaignId}/{players|companions}/{entityKey}/effects/{effectKey}`
    via a new `campaigns/set_campaign_entity_effect` action (like `update_campaign_entity`).
  - The plan text used Firestore-style `users/{uid}/campaigns/...` paths. The app uses
    the Realtime Database paths above, and the plan is corrected.
- **Exhaustion level updates** write only the `level` of the existing instance.
- **Remove** writes `null` at the same path.
- **Both Vuex caches stay in sync**: the cached encounter (NPCs) and the cached campaign
  (players/companions), so reopening an encounter in the same session still sees the
  effects.
- **Load on encounter init (raw)**: `add_entity` fills `entity.effects` from the stored
  map: the encounter entity for NPCs, the campaign player/companion for players and
  companions. Instances are copied as stored, with no `sub_effects`/`includes`
  resolution (that is 2e). Demo and test-mode entities start empty.
- **Encounter reset** (`encounters/reset_encounter`) clears NPC `effects`, as it already
  does for `conditions` and `reminders`. Player/companion effects on the campaign are
  left alone.
- **No writes in demo or test mode**. The existing `!demo && !test` guard is kept.
- **Firebase rules** (`firebase_rules/firebase-rules.json`, uploaded by the user): an
  `effects/$effectId` block under encounter entities, campaign players and campaign
  companions. Without it, player and companion writes fail, because those nodes reject
  unknown keys. The block validates the `$defs/active_instance` fields and rejects
  unknown ones.

## Capabilities

### New Capabilities
- `effects-instance-storage`: where active effect instances are stored per entity type,
  when they are written, updated and deleted, how they are loaded when an encounter
  starts, what the database rules accept, and what happens in demo and test mode or when a
  write fails.

### Modified Capabilities
- `effects-drawer`: the requirement "Applied instances are held in encounter state only"
  is removed. Persistence now belongs to `effects-instance-storage`.

## Impact

- `src/store/modules/runEncounter.js`: persistence in `apply_effect` / `remove_effect`;
  `add_entity` loads stored effects.
- `src/store/modules/userContent/encounters.js`: `set_entity_effect` action,
  `SET_ENTITY_EFFECT` cache mutation, `reset_encounter` deletes `effects`.
- `src/store/modules/userContent/campaigns.js`: `set_campaign_entity_effect` action and
  cache mutation.
- `c:\Users\keyro\Documents\development\firebase_rules\firebase-rules.json` (separate
  repo): three `effects` blocks. **Deploy order:** upload the rules before the code
  reaches users, or player/companion effect writes are rejected.
- No change to the drawer UI, the SRD data, the schema or legacy conditions/reminders.
- `.planning/effects-implementation-plan.md` §2b: paths corrected; marked done after
  archive.
