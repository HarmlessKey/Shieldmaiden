## Context

- `RunEncounter.vue` shows `SetInitiative` (`combat/initiative/index.vue`: Players, NPCs and
  Overview panes) while `encounter.round === 0`, and the tracker panes (with `Targeted.vue`)
  after it, so they never mount together.
- `Targeted.vue`'s header builds its buttons from `options` (keys, icons, tooltips, methods
  that open drawers acting on the store's `targeted`) and an Untarget button. Out of turn
  damage is added when `outOfTurnActions` is on.
- `Overview.vue` lists the active entities with row buttons: surprised (`setSurprised`, which
  adds the premade `surprised` reminder from `mixins/reminders.js` via `set_targetReminder`,
  keybind S), hide and inactive. `Avatar.vue` shows the surprised icon from
  `entity.reminders.surprised`. There's no targeting on this screen.
- `src/data/effects.js` has Surprised per edition (5e: restrict + a start-of-turn notice;
  5.5e: Disadvantage on Initiative). The NPC initiative roll already uses roll modifiers
  (3c1).
- `convert_legacy_conditions` (2i) converts an entity's legacy map into instances when an
  encounter loads, and deletes the map once stored.
- Player effects are stored on the campaign (`campaigns/{uid}/{campaignId}/players/{id}/effects`)
  and written with `campaigns/set_campaign_entity_effect`. The run campaign screen's
  `campaign/Players.vue` shows no effects, and doesn't list companions.
- The Effects drawer (`drawers/encounter/Effects.vue`) reads the encounter store (entities,
  round, turn, effect definitions). Its apply form (`effects/ApplyEffect.vue`) and details
  (`effects/EffectDetails.vue`) only take props. `effectChipItems` builds chip data from
  instances and definitions.

## Goals / Non-Goals

**Goals:** targeting and the header actions before combat, Surprised as an effect, and the
campaign's player effects on the run campaign screen.

**Non-Goals:**
- Companions on the run campaign screen: the pane doesn't list them.
- Ticking durations outside combat: in-world time isn't tracked, so rounds count from the next
  encounter.
- The public initiative and the player live view of campaign effects (they already show
  effects in encounters).
- Retiring the other premade reminders (step 9).

## Decisions

### 1. Targeting in the Overview

An Overview row click calls `set_targeted({ type: e.shiftKey || e.ctrlKey ? "multi" : "single",
key })`. Targeted rows get the tracker's targeted marker class. The row buttons use
`@click.stop`, so they don't target. `targeted` is store state, so it stays when combat starts.

### 2. One header-actions component

`TargetActions.vue` (in `combat/`) takes the same `options` as `Targeted.vue`, plus an
`outOfTurn` prop, and owns the buttons, shortcuts, arrow-key cycling, Untarget and the
tutorial popovers. `Targeted.vue` uses it with out of turn on when `outOfTurnActions` is set.
The Overview pane's `header-action` slot (and the mobile Overview tab) uses it without. The
drawer methods (Conditions, Reminders, Effects, Transform, Edit) and Hide/Show move into the
component, since they only use the store. The two screens never mount together, so
`v-shortkey` can't fire twice.

### 3. Surprised as an effect

`setSurprised(key, value)` in `Overview.vue`:
- **Set:** builds the instance with `buildEffectInstance` from
  `findSrdDefinition(edition, "surprised")`, with no caster, and duration
  `{ type: "next_turn", anchor: "target", edge: "end" }` in 5e or `{ type: "cancelled" }` in
  5.5e. It's applied with `apply_effect`.
- **Remove:** `remove_effect({ key, source: "srd", source_key: "surprised" })`.
- **The S shortcut** toggles based on `hasSurprised(entity)`, a small helper in
  `effectFunctions.js` (an instance with `source_key` `surprised`).

5e: before round 1 nobody has had a turn, so `next_turn`/end ends at the end of its first turn
(verify with 2h1's `durationActions`: no same-turn skip, since `applied_turn_key` is unset).

5.5e: the action that starts combat (where `fire_turn_triggers` fires `combat_start`)
removes every `surprised` instance in a 5.5e campaign, with the reason "combat started".
That's explicit and doesn't depend on cancel-trigger support for `combat_start`.

`Avatar.vue` shows the icon when `hasSurprised(entity)`. `premade.surprised` is removed from
`mixins/reminders.js`.

**Old data:** `convert_legacy_surprised`, run next to `convert_legacy_conditions` when an
encounter loads. For an entity with `reminders.surprised` and no Surprised instance, it
applies the effect as in Set and removes the reminder with `set_targetReminder` (remove).
Like 2i, the demo converts in memory, test runs don't convert, and a failure is logged and
retried on the next load.

### 4. Campaign player effects

- **Chips:** `campaign/PlayerEffects.vue` renders a player's campaign `effects` with
  `effectChipItems`. Definitions come from `findSrdDefinition` (SRD) and `effects/get_effect`
  (custom, loaded once). For the DM, clicking a chip opens the tracker's effect drawer
  (`ActiveEffect.vue`) in campaign mode: the chips take an `effectDrawerData` function that
  gives the drawer `{ campaign: { campaignId, playerId, playerName, names, edition },
  effectKey }`. In campaign mode the drawer:
  - reads the instance from the campaigns store
  - shows the player's name instead of the encounter entity
  - sets the Exhaustion level with `set_campaign_entity_effect_prop`
  - removes with `remove_campaign_effect`
  - leaves out escape rolls, which belong to an encounter

  (Changed during apply: a popover with details and Remove was replaced by this drawer, at the
  user's request.)
- **Drawer:** `drawers/campaign/Effects.vue` gets `{ campaignId, playerId }`. It lists the
  edition's SRD conditions and effects and the user's custom effects like the encounter
  drawer, and uses `ApplyEffect` with:
  - `casters` = the campaign's players (by character name) and None
  - `casterConcentration` = the caster player's Concentration instance
- **Store actions** in `userContent/campaigns.js`:
  - `apply_campaign_effect({ campaignId, playerId, application, entry, definition })`:
    - checks condition immunity against the player's `condition_immunities` (with a notice)
    - carries out the Concentration plan on the caster player (`concentrationPlan`; start, or
      replace with a cascade)
    - builds the instance with `buildEffectInstance` (round 0, no turn)
    - writes it with `set_campaign_entity_effect`
    - Exhaustion updates the existing instance's level, as the encounter's `apply_effect` does.
  - `remove_campaign_effect({ campaignId, playerId, effectKey })`: removes it (value `null`)
    and the instances `cascadeTargets` finds on the campaign's players.

  This is a separate path from the encounter store, because the encounter store needs a
  loaded encounter. The pure helpers (`buildEffectInstance`, `concentrationPlan`,
  `cascadeTargets`, `effectChipItems`) are shared.
- **Players.vue:** each player row gets the chips and an Effects button (`fa-sparkles`), for
  the DM only (`viewerIsUser`).

### 5. One hit point calculation for the tracker and the campaign (user request at apply)

The arithmetic leaves the tracker's components and store and becomes pure functions in
`effectFunctions.js`, used by both:
- `damageResult({ amount, curHp, tempHp, transformed, maxHp })`: temporary hit points, then the
  transformed pool, then hit points. Returns
  `{ tempHp, transformedCurHp, curHp, taken, overkill, dropsToZero }`. `HpManipulations.isDamage`
  uses it.
- `healingResult({ amount, curHp, maxHp })`: returns `{ curHp, healed, overhealing }`.
  `isHealing` uses it.
- `hpAfterEffects` (above): the tracker's also-heal on apply and `sync_effect_hp` use it.
- applying and removing effects:
  - `applyNotices` and `removeNotices` give the campaign screen's notices; the tracker keeps
    its prompts
  - the tracker's `tempHpToLose` and `alsoHealAmount` serve both

The tracker's encounter parts stay in the tracker: writes, the log, meters, triggers, drop to 1,
and healing caps with their notify. Healing caps go through `healingCap`, already pure.

The campaign path uses them through `campaignEntities(players, basePlayers)` (a player's own
data under its campaign data):
- `sync_campaign_player_hp` sets `curHp` with `hpAfterEffects`
- `apply_campaign_effect` and `remove_campaign_effect` heal, keep HP within the maximum, end
  conditions a new immunity covers, remove lost temp HP, and return `notices`
- the actions take `context: { basePlayers, definitionOf }` from the screen, which loads the
  custom definitions

Manual damage and healing (`campaign_player_damage` and `campaign_player_heal` in the campaigns
store) apply `damageModifiers` and defenses through `applyDamageModifiers`/the effective
defenses, as the tracker's manual input does, then `damageResult` / `healingResult`. They write
`tempHp`, `curHp`, `transformed.curHp`, `saves` and `dead`. Notices: Concentration DC
(`concentrationSaveDc`), drop to 0. The popover is `campaign/PlayerHealth.vue`, opened from the
player's hit points.

## Risks / Trade-offs

- [Two apply paths] Encounter and campaign application differ in storage; the shared pure
  helpers keep the instance shape identical, and a scratchpad check compares both.
- [5e `next_turn` before round 1] If 2h1 treats round 0 differently, 5e Surprised could end
  early or late; a task verifies it with `durationActions`.
- [Old encounters] The conversion writes once per entity; a failure leaves the reminder for the
  next load.
