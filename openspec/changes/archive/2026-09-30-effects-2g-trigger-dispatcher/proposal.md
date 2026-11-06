## Why

Effects are now applied, saved, resolved and shown (2a–2f), but they never *do* anything
during combat. A Burning effect with a `start_turn_target` damage sub-effect, Concentration's
`damage_taken` save, or Unconscious's `on_apply` "fall Prone" are silent. The DM has to
remember them. Step 2g of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
adds one central trigger dispatcher that fires named trigger events during combat, finds the
active effects whose sub-effects listen for them, and prompts the DM. Step 3 automates the
mechanics and 2h ticks durations; both build on this. Trigger vocabulary:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §3.5 and
`$defs/trigger` in `src/schemas/hk-effects-schema.json`.

## What Changes

- **Central dispatcher** in the `runEncounter` store: `fire_trigger({ trigger, entityKey,
  event })`. It collects the effect instances whose resolved sub-effects (2e) have a
  matching `trigger`, applies the sub-effect's `trigger_filter` where the event carries
  enough information, and queues one prompt per effect instance and trigger.
- **Turn triggers are fired from `set_turn`**, and only when combat moves forward:
  - `end_turn_caster`, then `end_turn_target`, for the outgoing entity
  - `start_turn_caster`, then `start_turn_target`, for the incoming entity
  - `combat_start` for every entity when the encounter starts (round 0 → 1)

  Going back a turn fires nothing. The turn order comes from a new store getter that orders
  entities the way the tracker does (initiative, name, the user's `initOrder`). The Effects
  drawer's caster computation (2a) switches to it.
- **Caster not in the encounter** (the open question from 2b, decided here): if an
  effect's `caster_key` isn't in the running encounter, its `start_turn_caster` /
  `end_turn_caster` sub-effects fire on the holder's own start/end of turn instead.
  Nothing gets stuck. The review on encounter init and `caster_name` (plan §2h points 2–3)
  stay for 2h.
- **HP triggers**, fired from `HpManipulations` when damage or healing is applied:
  - `damage_taken` for the target and `damage_dealt` for the source
  - `on_heal` for the target of healing
  - `on_zero_hp` when HP reaches 0 from above 0
  - `on_bloodied` when HP drops to half its maximum or lower from above half (both editions)
- **Roll triggers**, fired from the roll dialog (`hk-single-roll`) when the DM applies an
  action roll:
  - `on_hit` for the attacker and `on_hit_taken` for the target
  - `on_crit` / `on_crit_taken` on a natural 20 hit
  - `on_save_success` / `on_save_fail` for the target of a save action
- **Check trigger**: `on_check` fires for the entity when an ability or skill check is
  rolled from its card.
- **Rest triggers are deferred** (decided during implementation): the tracker has no rest
  action, and the entity target menu turned out to be unused (`TargetMenu.vue` is imported
  but never rendered). `short_rest` / `long_rest` wait for a real rest feature.
- **Apply triggers**: `on_apply` fires for the holder when an effect instance is created,
  for that effect's own sub-effects only. `on_condition_applied` fires for the holder,
  across its effects, when an SRD condition instance is created.
- **Legacy trigger spellings** in definitions (`failed_save`, `success_save`, `zero_hp`)
  count as `on_save_fail`, `on_save_success` and `on_zero_hp`.
- **Prompt**: queued prompts are shown as tracker notifications ("Goblin: Burning, start of
  turn") listing the matching sub-effects' descriptions. Each has **Details** (opens the 2f
  detail view) and **Dismiss**. Nothing is applied automatically.
- The legacy reminders keep their own triggers unchanged.

## Capabilities

### New Capabilities
- `effects-triggers`: which trigger events the tracker fires and when, how matching
  effects are found (holder vs caster scope, the missing-caster fallback, filters, legacy
  spellings), and how the DM is prompted.

### Modified Capabilities
<!-- none: the drawer's caster_key rule is unchanged, only its implementation moves to the shared turn-order getter -->

## Impact

- `src/store/modules/runEncounter.js`:
  - `turn_order` getter, `fire_trigger` action, `set_turn` turn dispatch
  - `apply_effect` fires `on_apply` / `on_condition_applied`
  - a notification queue in state, with mutations
- `src/utils/effectFunctions.js`: pure `matchTriggers` (collection plus filters) and
  `normalizeTrigger` (legacy aliases), tested in the scratchpad.
- New `src/components/combat/EffectTriggerNotifier.vue`, mounted once in
  `src/views/RunEncounter.vue`, which shows queued prompts with `$snotify`.
- `src/mixins/HpManipulations.js` (damage and healing), `hk-single-roll.vue` (apply),
  `hk-roll.vue` plus the card roll call sites (`CardDetails.vue`, `CardSkills.vue`) for
  `on_check`.
- `src/components/drawers/encounter/Effects.vue`: uses `turn_order` for `caster_key`.
- No database, rules or data changes.
- `.planning/effects-implementation-plan.md`: §2g marked done after archive, and the
  missing-caster rule recorded as decided.
