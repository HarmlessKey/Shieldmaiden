# Rename `initiative`/`initiative_bonus` → `initiative_modifier`

## Background

NPC stat blocks can carry a flat initiative bonus override (5.5e stat blocks — some
2024 monsters add their proficiency bonus to initiative instead of just their Dex
modifier). This was added to `hk-npc-schema.json` as a field named `initiative`, but
the rest of the codebase already has a partial convention — visible in
`entityFunctions.js`, `NPCs.vue`, `ViewEntity.vue`, and `CardDetails.vue` — where a
combat entity's flat override is read from `initiative_modifier`. The runtime combat
entity for **players**, however, uses `initiative_bonus` instead (`runEncounter.js`).
This plan unifies both onto `initiative_modifier` — one name, one meaning, for both
entity types.

**Firebase field name for players is unaffected.** A player's saved stat-sheet field
stays `initiative` in `players/$uid/$playerid/initiative` — only the in-memory combat
entity property changes, from `entity.initiative_bonus` to `entity.initiative_modifier`.
The player-facing rename is code-only; nothing in `firebase-rules.json` or the player
schema changes for this part.

**No data migration needed.** `firebase-rules.json` never added a `.validate` rule
for `initiative` under the `npcs/$uid/$npcId` node, and that node ends with a
`"$other": { ".validate": false }` catch-all (line ~1357) that rejects any
unlisted child key. So any client write of an NPC's `initiative` field has always
been rejected by production security rules — no existing NPC record can actually
have this field populated. This is a same-time rename + first-time rules addition,
not a migration.

## Latent bug this rename also fixes

In `src/store/modules/runEncounter.js` (~line 519), when a combat entity is hydrated
from NPC data:

```js
if (data_npc.initiative !== undefined) entity.initiative_bonus = data_npc.initiative;
```

This stores the override under `entity.initiative_bonus`. But every consumer of a
combat entity's initiative override reads `entity.initiative_modifier`:
- `src/utils/entityFunctions.js:10` — `entity.initiative_modifier ?? entity.initiative_bonus`
- `src/components/combat/initiative/NPCs.vue:121`
- `src/components/combat/ViewEntity.vue:417`
- `src/components/combat/entities/Card/CardDetails.vue:204`

So even once an NPC's override could be saved, it would never actually reach the
initiative roll, tooltip, or entity-card display during a run encounter — it's
silently ignored. Fixing the write to use `initiative_modifier` resolves this at
the same time as the rename.

## Scope

### 1. Schema — `src/schemas/hk-npc-schema.json`
Rename the `initiative` property key to `initiative_modifier` (keep title/description/
min/max as-is).

### 2. Firebase rules — `firebase_rules/firebase-rules.json`
Add an `initiative_modifier` validation node under `npcs/$uid/$npcId` (it currently
has no entry at all, hence rejected by the `$other: false` catch-all). Match the
schema bounds: integer, -10 to 30. Do **not** touch:
- `players/$uid/$playerid/initiative` (~line 359) — unrelated: a player's own
  initiative bonus stat.
- `entities/$entityId/initiative` (~line 1506) — unrelated: the rolled initiative
  value tracked live during an encounter.

### 3. NPC editor form — `src/components/npcs/BasicInfo.vue`
`v-model.number="npc.initiative"` and `@input="parseToInt($event, npc, 'initiative')"`
→ `npc.initiative_modifier` / `parseToInt($event, npc, 'initiative_modifier')`.

Also relabel the field from "bonus" to "modifier" to match the renamed prop:
- `label="Initiative bonus"` → `label="Initiative modifier"`
- `<hk-popover header="Initiative bonus">` → `header="Initiative modifier"`
- Popover body text "Overrides the initiative bonus, shown on 5.5e (2024) stat
  blocks." → "Overrides the initiative modifier, shown on 5.5e (2024) stat blocks."

### 4. Compendium display — `src/components/compendium/Monster.vue`
`initiative_bonus` computed property currently reads `this.monster.initiative` →
switch to `this.monster.initiative_modifier`.

### 5. Combat engine — `src/store/modules/runEncounter.js`
Two spots in the NPC/companion hydration block (~lines 519, 536-538):
- `if (data_npc.initiative !== undefined) entity.initiative_bonus = data_npc.initiative;`
  → read `data_npc.initiative_modifier`, write `entity.initiative_modifier`.
- The `state.test` auto-roll fallback that currently checks
  `entity.initiative_bonus !== undefined ? entity.initiative_bonus : calc_mod(...)`
  → check `entity.initiative_modifier` instead, so test-mode rolls stay consistent
  with the real path.

Leave `entity.initiative` (the rolled/tracked value for the round) alone — unrelated
to either override.

### 6. Combat engine, player branch — `src/store/modules/runEncounter.js`
Two spots in the player hydration block:
- Line 387: `entity.initiative_bonus = db_player.initiative || 0;` →
  `entity.initiative_modifier = db_player.initiative || 0;`. Note `db_player.initiative`
  stays as the read side — only the entity property being assigned changes.
- Line 406: `entity.initiative = Math.ceil(Math.random() * 20) + (entity.initiative_bons || 0);`
  → `entity.initiative = Math.ceil(Math.random() * 20) + (entity.initiative_modifier || 0);`.
  This also fixes a pre-existing typo (`initiative_bons`, missing the `u`) that has
  been silently dropping a player's initiative bonus in every test-mode auto-roll.

### 7. `src/utils/entityFunctions.js`
`displayStats()` currently does `entity.initiative_modifier ?? entity.initiative_bonus`
with a comment explaining the two-name split. Once both entity types use the same
property, simplify to `const initiative = entity.initiative_modifier;` and drop the
now-inaccurate comment.

### 8. `src/components/combat/ViewEntity.vue`
- Line 41: `v-if="entity.initiative_modifier !== undefined || entity.initiative_bonus"`
  → simplify to `v-if="entity.initiative_modifier !== undefined"`.
- Lines 416-420, the `initiative()` computed, currently falls back to
  `entity.initiative_bonus`; simplify to `return this.entity.initiative_modifier;`.

**Minor UI behavior change to flag:** today, a player with an initiative bonus of
exactly `0` doesn't show the Initiative row at all, because the v-if relies on
`entity.initiative_bonus` being truthy (falsy for `0`). After this change,
`entity.initiative_modifier` is always set for players (defaults to `0`), so the
`!== undefined` check is always true and the row will always render for players,
showing "Initiative: 0" instead of hiding the row. This seems like a reasonable
side effect (it's more informative), but call it out explicitly since it's a visible
change beyond the rename itself.

`CardDetails.vue` needs no change — it already keys off `initiative_modifier` via
`displayStats()`, which will keep resolving correctly once player entities set that
property directly.

### Out of scope
- `players/$uid/$playerid/initiative` in `firebase-rules.json` and the player data
  schema — the saved field name stays `initiative`, per the requirement above.
- `hk-encounter-schema.json`'s `initiative` field — the rolled-initiative concept,
  unrelated to either override.

## Verification
- JSON-schema-validate an NPC import with `initiative_modifier` set against the
  updated `hk-npc-schema.json`.
- Confirm Firebase rules accept a write to `npcs/$uid/$npcId/initiative_modifier`
  in range and reject out-of-range/wrong-type values (emulator test).
- In the NPC editor, set an initiative bonus, save, reload, confirm it persists.
- In compendium, view an NPC/monster with the override set, confirm the displayed
  bonus reflects it (not the Dex mod).
- Start a run encounter with that NPC, roll initiative, confirm the roll tooltip
  and entity card both use the override (this is the bug-fix path — verify it
  didn't work before this change and does after).
- Add a player with a non-zero initiative bonus on their sheet, start a run
  encounter, confirm `ViewEntity.vue` and the entity card still show the correct
  value.
- Add a player with an initiative bonus of exactly `0`, confirm the Initiative row
  now renders showing `0` (the flagged behavior change above), and that this reads
  as acceptable rather than noisy.
- Run a test-mode encounter (`state.test`) with a player who has a non-zero
  initiative bonus, confirm the auto-rolled initiative now actually includes that
  bonus (previously silently dropped by the `initiative_bons` typo).
