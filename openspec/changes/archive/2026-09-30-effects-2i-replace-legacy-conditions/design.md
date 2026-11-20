## Context

See proposal.md for the motivation. The current state is:

- `runEncounter.add_entity` copies `db_entity.conditions` to `entity.conditions`. This
  includes players, because player conditions were written on the encounter entity by
  `encounters/set_entity_condition`. Effects are loaded separately: NPCs from the
  encounter entity, players and companions from the campaign. Demo and test runs load no
  stored effects.
- The legacy UI lives in these places:
  - `drawers/encounter/Conditions.vue` (opened as `drawers/encounter/Conditions` from
    `Targeted.vue` with the `c` shortcut, `TargetMenu.vue` and `mobile/Menu.vue`, which
    passes the entity object and not an array of keys)
  - `drawers/encounter/Condition.vue` (opened from `combat/Conditions.vue`, from the chip
    `Effect.vue` for `type: "condition"`, and from the unused `legacy/TargetItem.vue`)
  - `combat/Conditions.vue`, used only by the legacy layout's `legacy/Current.vue`
- `Drawer.vue` passes `drawer.data` as the `data` prop, and spreads it as props only when
  it isn't an array. So `Effects.vue`'s `mode` prop can't be set from `setDrawer` together
  with an array of keys.
- The live view (`trackCampaign/live/Initiative.vue`) reads `entity.conditions` from the
  broadcast encounter. It gets names from the `api_conditions` store (always 5e). It
  already receives `campPlayers` and `campCompanions` from the campaign the track view
  listens to, but not the campaign's edition.
- `hasCondition` in `effectFunctions.js` checks `entity.conditions?.[url]` first.

## Goals / Non-Goals

**Goals:**
- One code path for conditions (the effects model). No reads or writes of
  `entity.conditions` remain outside the conversion and the existing cleanup.
- Keep every entry point: the Conditions button, the `c` shortcut, the menus and the
  tutorial step.
- Make the conversion idempotent and safe to interrupt.

**Non-Goals:**
- A bulk migration of encounters that are never opened again. Their maps stay in the
  database and are harmless, and reset removes them.
- Database rules changes. The `conditions` validation can go in a later cleanup.
- Mechanics of conditions (step 3), and a per-effect "hidden from players" flag.

## Decisions

### 1. Conditions drawer becomes a thin wrapper

`drawers/encounter/Conditions.vue` is rewritten to render
`<Effects mode="conditions" :data="data" />`, passing through the entity keys. Every
`setDrawer({ type: "drawers/encounter/Conditions" })` call keeps working as is. The mobile
menu changes its `data` from the entity object to `[targeted[0]]`, as its Effects entry
already does.

- **Alternative:** point every caller at `drawers/encounter/Effects` with
  `data: { mode: "conditions", ... }`. Rejected: `Drawer.vue` would pass an object as the
  Array `data` prop, which means changing the prop type and every caller, for no gain.
- `Condition.vue` and `combat/Conditions.vue` are deleted. `Effect.vue` loses the
  `type: "condition"` branch. `legacy/TargetItem.vue` is imported nowhere and is deleted,
  not patched.
- In `legacy/Current.vue`, `<Conditions :entity>` is replaced by the chip row
  (`combat/entities/effects`) with the `effects` flag. Reminders stay in their own
  component, as they are now.

### 2. Conversion runs once in `init_Encounter`, after entities are added

A pure helper `legacyConditionInstances({ conditions, effects, edition, round })` in
`effectFunctions.js` returns the instances to create. It:
- skips keys that `findSrdDefinition(edition, key)` doesn't resolve to a
  `category: "condition"` definition
- skips conditions that are already an instance (`source: "srd"`, same `source_key`)
- builds each instance with `buildEffectInstance` and `{ duration: { type: "cancelled" } }`
- sets `level: max(1, Number(value) || 1)` for Exhaustion

A new store action `convert_legacy_conditions` runs in `init_Encounter` after the
`add_entity` loop and before `resolve_effect_definitions` and the carried-over review. So
the converted instances get resolved definitions and are part of the same load. For each
entity in `state.encounter.entities` with a non-empty `conditions` map, it:
1. For each instance: generates a key with `generateEffectKey`, calls
   `persist_effect` (skipped in demo), and commits `SET_EFFECT`. It does not go through
   `apply_effect`, so `on_apply` and `on_condition_applied` don't fire (spec).
2. When every write succeeded and it isn't the demo, calls a new
   `encounters/delete_entity_conditions` action. That action writes `conditions: null`
   on `/entities/{id}` through `updateEncounter`, and clears the cached encounter's map.

It is skipped entirely in test runs. The source is `state.encounter.entities`, the raw
data, because `entity.conditions` no longer exists on tracker entities.

- **Why not convert in `add_entity`:** player effects are assigned from the campaign in the
  middle of `add_entity`, and persisting from there would mix I/O into entity building.
  One pass afterwards keeps `add_entity` a plain loader.
- **Idempotence:** the dedupe by `source_key` plus deleting the map only after the writes
  means a failed run repeats safely. A player carrying the same condition in two old
  encounters gets one instance. The second encounter's map is dropped without changing the
  existing instance (for example, the Exhaustion level).

### 3. Legacy state removal

The following are removed:
- in `runEncounter`: `entity.conditions` init, `set_condition`, `SET_CONDITION`,
  `DELETE_CONDITION`, and `set_condition` from `Overview.vue`'s `mapActions`
- in `encounters.js`: `set_entity_condition` and `SET_ENTITY_CONDITION`, which are
  replaced by `delete_entity_conditions`
- in the chip row (`effects/index.vue`): the `conditions` items and prop
- in `hasCondition`: the legacy map check

The following stay:
- `delete entity.conditions` in the reset and in `ExportUserContent.vue`, which clean old
  data
- the demo data's `conditions: { exhaustion: 1 }`, converted in memory by decision 2

### 4. Live view reads effects per entity type

`Initiative.vue` gets an `edition` prop, which `live/index.vue` passes as
`campaign.edition`. A method `effectsOf(entity)` returns display items `{ key, name, icon,
level }`. It reads the instances as follows:
- NPCs: `entity.effects`
- players: `campPlayers[entity.key]?.effects`
- companions: `campCompanions[entity.key]?.effects`

The name comes from `findSrdDefinition(edition || "5e", source_key)` for SRD instances,
and from `instance.name` otherwise. The icon is `hki-<url>` for a condition and
`fas fa-sparkles` otherwise. The template keeps its structure (count limit, "+N", popup)
but iterates these items. The `api_conditions` fetch and `returnConditions` are removed.
`TrackEncounter.vue` relabels the two `conditions` settings.

- **Alternative:** a shared display helper with the tracker chips. Rejected: the chip row
  depends on the runEncounter store, which doesn't exist in the track view.
- **As built:** building the items is a pure `effectDisplayItems(effects, edition)` in
  `effectFunctions.js`, so it can be tested outside Vue. `effectsOf(entity)` only picks
  the source (encounter or campaign) and calls it.

## Risks / Trade-offs

- [A DM opens an old encounter offline or without write access, and the writes fail] →
  The instances aren't shown (nothing is committed after a failed write) and the map is
  kept, so it converts on the next load. The error is logged.
- [`applied_round` of a converted condition is the load round, not the real one] → It is
  only shown in the detail view and doesn't matter for "until removed". Accepted.
- [Player conditions from an old encounter now live on the campaign, so they also show in
  the player's other encounters] → This is the intended effects-model behavior (player
  effects belong to the campaign).
- [Players see custom effect names in the live view] → They are behind the same setting as
  conditions. A per-effect hidden flag is a later change.

## Migration Plan

1. Release. The first tracker load of each encounter with legacy conditions converts it.
2. No rules upload is needed, because deleting `conditions` and writing `effects` are
   already allowed. The effects rules from 2b still need to be on production before this
   release.
3. Rollback: an older build would ignore the converted instances and see no conditions.
   Rolling back after encounters were converted loses the display of those conditions but
   no data (the instances stay in `effects`).
