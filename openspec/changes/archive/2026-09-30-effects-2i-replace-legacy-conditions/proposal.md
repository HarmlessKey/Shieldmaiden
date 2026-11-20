## Why

Since 2a–2h, conditions exist twice. There is the legacy `entity.conditions` map with its
own drawer, chips and store action, and there are SRD condition instances in the effects
model. Only the second one has durations, triggers, saves and cascades. That is confusing
for the DM and forces `hasCondition` to read both. The effects model is now stable, so
conditions can run only through it (plan step 2i).

## What Changes

- **BREAKING** The legacy Conditions drawer (`drawers/encounter/Conditions.vue`) is
  replaced by the Effects drawer in conditions mode. It opens from the same places (the
  Conditions option with its `c` shortcut, the target menu and the mobile menu). The
  single-condition drawer `drawers/encounter/Condition.vue` is removed. Condition chips
  open the effect detail view like every other effect.
- The Effects option no longer lists SRD conditions. Conditions are listed only in
  conditions mode (the Conditions option), and the Effects option lists SRD and custom
  effects.
- **BREAKING** `entity.conditions`, the `set_condition` action, the
  `SET_CONDITION` / `DELETE_CONDITION` mutations, `encounters/set_entity_condition` and
  `SET_ENTITY_CONDITION` are removed. So is `src/components/combat/Conditions.vue`: the
  legacy Current pane shows effect chips instead. `hasCondition` stops reading the
  conditions map.
- The unused `src/components/combat/legacy/TargetItem.vue` is deleted. It is the last
  other opener of the removed Condition drawer.
- Legacy conditions saved in encounters are converted when an encounter is loaded in the
  tracker. Each one becomes an "until removed" instance of that SRD condition, and
  Exhaustion keeps its level. The instances are stored where effects belong (the encounter
  for NPCs, the campaign for players and companions), and the old map is then deleted.
  The demo encounter's legacy Exhaustion is converted in memory.
- The chip row drops its legacy condition chips and its `conditions` flag.
- The player-facing live view (track campaign initiative list) shows all active effects
  instead of the conditions map: condition icons and the Exhaustion level for SRD
  conditions, and a generic icon for other effects. It uses local SRD data of the
  campaign's edition, not the conditions API. The same "Conditions" visibility setting
  controls it, now labelled "Conditions and effects".
- Not changed: non-tracker uses of the `api_conditions` store (compendium, NPC
  condition immunities, `hk-condition-select`), the tutorial's "conditions" step, and the
  database rules. The rules still accept a `conditions` node, which the conversion deletes.

## Capabilities

### New Capabilities
- `effects-player-view`: how active effects are shown to players in the track campaign
  live initiative list

### Modified Capabilities
- `effects-drawer`: the Conditions option opens the Effects drawer in conditions mode,
  the legacy drawer is gone, and the Effects option no longer lists conditions
- `effects-display`: no legacy condition chips and no `conditions` filter flag
- `effects-durations`: `hasCondition` no longer reads the legacy conditions map
- `effects-instance-storage`: legacy conditions are converted on load and removed, and the
  "legacy conditions untouched" rule and the reset rule's conditions wording are updated
- `effects-srd-data`: Concentration's Incapacitated end condition is answered from effect
  instances, not the conditions map

## Impact

- Store: `src/store/modules/runEncounter.js` (entity init, `set_condition`, mutations,
  the new conversion at `init_Encounter`, demo data) and
  `src/store/modules/userContent/encounters.js` (`set_entity_condition` replaced by a
  removal of the conditions node).
- Utils: `src/utils/effectFunctions.js` (`hasCondition`, a new pure
  `legacyConditionInstances` helper).
- Components:
  - `drawers/encounter/Conditions.vue` becomes a thin wrapper
  - `drawers/encounter/Condition.vue`, `combat/Conditions.vue` and
    `combat/legacy/TargetItem.vue` are deleted
  - `combat/legacy/Current.vue`, `combat/entities/effects/index.vue` and `Effect.vue`,
    `combat/mobile/Menu.vue`, `combat/initiative/Overview.vue`
  - `trackCampaign/live/Initiative.vue` and `live/index.vue`,
    `settings/TrackEncounter.vue`
- Data: encounters with a legacy `conditions` map are rewritten the first time they are
  run after release. Nothing is converted for encounters that are never opened again.
- No schema or rules changes. No new dependencies.
