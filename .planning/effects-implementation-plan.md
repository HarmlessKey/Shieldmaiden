# Effects Feature - Implementation Plan

Builds on [.planning/effects-schema.md](./effects-schema.md). Goal: replace the current
ad-hoc condition/reminder system with a unified "Effects" model that drives conditions,
monster/action abilities, and combat tracker behavior.

## 1. Finalize the Effects JSON Schema
- Reconcile `src/utils/effectsConstants.js` with the proposed superset in
  `effects-schema.md` (new effect_types: `grant_advantage`, `grant_disadvantage`,
  `reroll`, `grant_action`, `damage_modifier`, `score_swap`, `outcome`; new triggers
  and duration_types).
- Define the full effect object shape (fields: `type`, `sub_type(s)`, `duration_type`,
  `duration_value`, `cancelable`, `cancel_trigger`, `trigger`, `sub_effects`, `source`
  metadata placeholder for later steps).
- Decide on `condition` sub-schema for conditional sub-effects (e.g. "only if attacker
  within 5ft", "only vs sight-based") - flagged as open question in schema doc.

## 2. Update EffectsForm.vue
- Rework `src/components/EffectsForm.vue` to support the full schema: new types/subtypes,
  conditional sub-effects, nested sub_effects arrays, trigger selection.
- Support array-of-effects editing (an "action" or "condition" has multiple effects).
- Add validation matching the schema (required fields per type/subtype).

## 3. Create Conditions using the new schema
- Rebuild `src/mixins/conditions.js` condition list as data using the new effect schema
  (per Section 1 of effects-schema.md: Blinded, Charmed, ... Unconscious, Exhaustion 1-6,
  plus 2024 Dying/Surprised).
- Store as static constants/content (likely `src/utils/effectsConstants.js` or a new
  `src/utils/conditions.js`) - decide whether these become Firestore content or stay
  static SRD data alongside `src/store/modules/content/conditions.js` for homebrew.

## 4. Extend monster actions with effects
- Extend the `action_list` sub-action shape in monster actions
  (`src/components/combat/actions/RollActions.vue`, monster docs in
  `src/store/modules/content/monsters.js`) to allow an `effects` array per sub-action -
  e.g. a damage roll sub-action plus a separate "apply Stunned" effect sub-action.
- Update monster/action edit forms (wherever actions are authored/edited) to use
  EffectsForm for the new effects array.
- Migration plan for existing monster data (old `rolls`/`type` shape must keep working
  or be migrated).

## 5. Update action rolls to include effects
- Update `src/mixins/runEncounter.js` and `RollActions.vue` roll execution so that
  rolling an action also evaluates/applies its `effects` array (not just damage/healing
  rolls) - e.g. on-hit applies Stunned condition to target, sets duration/trigger.
- Decide UI for "this action also applies X - apply to target(s)?" confirmation step.

## 6. Replace condition application in the combat tracker
- Replace the current reminder-driven condition handling with the new effects engine:
  applying a condition = attaching its effect set to the combatant with source/duration
  tracking.
- New Vuex state per combatant: active effects list (effect definition + source entity +
  applied-on-round + duration/expiry + cancel trigger).
- Update `src/components/combat/entities/effects/index.vue` / `Effect.vue` to render
  from this new active-effects list instead of the old ad-hoc display.

## 7. Replace reminders with new effects engine
This is the largest step - breaks into sub-steps:

### 7a. Trigger/event bus
- Define the full set of triggers (start/end of turn for target/caster, on damage taken,
  on hit, on crit, on hit taken, on failed/successful save, combat start, short/long
  rest, zero hp, etc. - per Section 3 of effects-schema.md).
- Central place in `runEncounter.js`/Vuex that fires these trigger events during combat
  (turn changes, damage application, roll results).

### 7b. Effect lifecycle & duration tracking
- Track per active effect: source entity, applied round/turn, duration_type +
  duration_value, cancelable + cancel_trigger.
- For `duration_type: "concentration"` effects applied to a target, store a
  `source.effect_id` linking back to the caster's active Concentration effect instance.
  When that Concentration instance is removed/cancelled, cascade-remove every active
  effect (on any entity) whose `source.effect_id` matches it.
- On each relevant trigger, tick down durations, expire effects, and surface
  "save ends" / "until cancelled" prompts.

### 7c. Effect application/resolution
- Implement resolvers per effect_type so each automatically modifies combat math:
  - `bonus`/`base`/`fixed` -> AC, HP, attack, damage, ability, skill, save, speed
    calculations wherever those are currently computed.
  - `advantage`/`disadvantage`/`grant_advantage`/`grant_disadvantage` -> roll UI
    (auto-toggle advantage/disadvantage on relevant rolls).
  - `defense` (v/r/i) -> damage application in `HpManipulations.js`.
  - `damage`/`healing` (DoT/HoT) -> fire on trigger, apply via `HpManipulations.js`.
  - `auto_fail`/`auto_success`, `outcome` (death, etc.) -> save/check resolution.
  - `restrict` -> disable relevant action buttons (attack/reaction/movement) in UI.
  - `reroll`, `damage_modifier`, `score_swap`, `grant_action` -> roll/action flow hooks.
- This step touches: `runEncounter.js`, `HpManipulations.js`, roll components, AC/HP
  display computeds.

### 7d. UI replacement
- Replace `Reminders.vue` / `TargetReminders.vue` displays with the new active-effects
  list (read from 7b), showing source, remaining duration, and manual cancel.
- Keep user-authored custom reminders (`src/views/UserContent/Reminders/`) as a
  separate "freeform note" feature, or migrate them to `descriptive`/`special` effects.

### 7e. Migration / compatibility
- Existing encounters in Firestore have old reminder data - decide on
  read-migration or one-time conversion script.

## Suggested Order
1 -> 2 -> 3 (schema + form + conditions are foundational and low-risk)
4 -> 5 (monster actions, still mostly additive)
6 (active-effects data model, no UI dependency yet)
7a -> 7b -> 7c -> 7d -> 7e (engine + UI replacement, biggest risk/effort)

Each numbered step should get its own `.planning/<step-name>.md` spec before
implementation, per CLAUDE.md.
