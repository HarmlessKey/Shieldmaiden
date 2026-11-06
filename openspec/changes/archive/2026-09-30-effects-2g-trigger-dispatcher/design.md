## Context

See proposal.md (Why). Requirements: `specs/effects-triggers/spec.md`.

Where things happen today:

- **Turns**: `runEncounter/set_turn({ turn, round })` saves and commits `SET_TURN` /
  `SET_ROUND`. It is called by `startEncounter` / `nextTurn` / `prevTurn` in
  `combat/top/EncounterProgress.vue` and `combat/legacy/Turns.vue` (and mobile).
  Reminders fire from components: a `watch: turn` in `top/index.vue`,
  `legacy/Current.vue` and `mobile/Current.vue` (`startTurn`), and `nextTurn`
  (`endTurn`). The turn order exists only as `RunEncounter.vue`'s `_active` computed:
  active and not down, sorted by name, then by initiative in `userSettings.encounter.initOrder`
  order. 2a copied that logic into the Effects drawer.
- **HP**: `src/mixins/HpManipulations.js` `setHP(amounts, target, current, config)` →
  `isDamage` / `isHealing`. It knows the target, the source (`current`), the amount, the
  pools (temp, transformed, main), the new HP, `config.actions[].rolls[].damage_type`,
  `config.crit` and `config.undo`, and calls `checkReminders(target, "damage")`.
- **Action rolls**: `hk-single-roll.vue` `apply(multiplier)` has `this.roll.current`
  (attacker), `this.roll.target`, `this.hitOrMiss[index]` (`"hit"` / `"miss"`),
  `action.toHit.throwsTotal === 20` (crit), `this.savingThrowResult[index]` (`"save"` /
  `"fail"`), and `action.type` (`melee_weapon`, `ranged_weapon`, `spell_attack`, `save`,
  `damage`, `healing`, `other`).
- **Card rolls**: `hk-roll.vue` gets a `roll` object (`d`, `n`, `m`, `title`,
  `entity_name`, `notify`) and calls `rollD(...)` from the dice mixin. `CardDetails.vue`
  uses it for ability `mod` (a check) and `save`, and for NPC skills; `CardSkills.vue` for
  player skills.
- **Notifications**: reminders use `this.$snotify.warning(..., { timeout: 0, buttons })`
  from components. The store has no access to `$snotify`.
- **Resolved definitions** (2e): `effect_definition(instance)` →
  `{ sub_effects, unresolved, … }`. Sub-effects carry `trigger` and optionally
  `trigger_filter` (`by`, `damage_types`, `attack_types`, `natural_roll`, `within`,
  `min_amount`, `source`).

## Goals / Non-Goals

**Goals:**
- One store entry point (`fire_trigger`) that every hook calls, so 2h (durations, repeat
  saves, `cancel_triggers`) and step 3 (mechanics) plug into the same events.
- Matching logic as pure, tested code.
- Turn triggers fired in exactly one place, independent of which layout is mounted.

**Non-Goals:**
- Resolving anything: no damage rolled, no condition applied, no durations ticked or effects
  expired. Those are step 3 and 2h.
- Moving the legacy reminders onto the dispatcher (retired in step 3).
- The rest of the v2 vocabulary: `on_attack`, `on_attacked`, `on_miss`,
  `on_natural_20/1`, `on_cast`, area triggers, `on_move`, `on_death`, `on_kill`, `dawn`,
  `on_expire`. They're added where their hooks appear (2h, step 7).
- Rest mechanics (hit dice, HP, Exhaustion −1).

## Decisions

### 1. Pure matching in `effectFunctions.js`
- `normalizeTrigger(trigger)` maps `failed_save` → `on_save_fail`, `success_save` →
  `on_save_success` and `zero_hp` → `on_zero_hp`. Anything else is returned unchanged.
- `matchTriggers({ trigger, entityKey, entities, definitionOf, event = {}, effectKey })`
  returns `[{ holderKey, effectKey, instance, definition, matches: [{ sub_effect,
  unchecked: [labels] }] }]`.
  - Scope:
    - holder-scoped triggers → the instances of `entityKey`
    - `start/end_turn_caster` → the instances on any entity with `caster_key ===
      entityKey`
    - `combat_start` → every instance
    - `effectKey` set → that one instance of `entityKey` (for `on_apply`)
  - Missing-caster fallback: for `start_turn_target` / `end_turn_target`, the holder's
    instances whose `caster_key` isn't a key of `entities` also match their
    `start_turn_caster` / `end_turn_caster` sub-effects.
  - Skipped: instances without a definition or with `unresolved: true`.
  - Filters: each field is `pass`, `fail` or `unknown`.
    - `by`: `any` passes. `caster` compares `event.sourceKey` with `instance.caster_key`.
      `counterpart` passes when `event.sourceKey` is set. Other values are unknown.
    - `damage_types`: intersection with `event.damageTypes`.
    - `attack_types`: `event.attackTypes`, a list derived from the action type, e.g.
      `melee_weapon` → `["melee_weapon", "melee", "weapon"]`.
    - `natural_roll`: `event.naturalRoll`.
    - `min_amount`: `event.amount`.
    - `within`, `source`: always unknown.
    - Any `fail` drops the sub-effect. `unknown` keeps it and adds a label ("within 5
      ft", "if caused by an ally").

### 2. Store
- Getter `turn_order`: entity keys ordered exactly like `RunEncounter._active`, using
  `rootGetters.userSettings?.encounter?.initOrder`. The Effects drawer's `turnEntityKey`
  becomes `round ? turn_order[turn] : undefined` (same result).
- State `effect_prompts: []` with mutations `ADD_EFFECT_PROMPTS(prompts)` and
  `CLEAR_EFFECT_PROMPTS`. Each prompt is `{ id, holderKey, effectKey, holderName,
  effectName, trigger, lines: [] }`, built from `matchTriggers` output with
  `describeSubEffect` (the same wording as `EffectDetails`, moved into `effectFunctions`
  so both use it) plus the unchecked labels. The prompts are cleared in `init_Encounter`.
- Action `fire_trigger({ trigger, entityKey, event, effectKey })` normalises the trigger,
  runs `matchTriggers` against `state.entities` and the `effect_definition` getter, and
  commits the prompts. It returns the matches, for 2h/step 3 to reuse.
- `set_turn`: it reads the old `turn` / `round` before committing. After the commit:
  - forward means `round > oldRound || (round === oldRound && turn > oldTurn)`
  - if forward and `oldRound === 0`: `combat_start` (entityKey undefined), then the start
    triggers for `turn_order[turn]`
  - if forward otherwise: the end triggers for `turn_order` at the old turn index,
    computed *before* the commit (same list), then the start triggers for the new
    `turn_order[turn]`
  - backward: nothing

  Only this action changes turns, so every layout is covered once.
- *As built:* the outgoing entity is not looked up by the old turn index. `nextTurn` calls
  `update_round` (not awaited) before `set_turn` on a round change, and in the demo it
  commits `down` flags synchronously, so `turn_order` can already have shrunk. The store
  instead keeps `turn_entity` (the key of the entity whose turn it is). It is set from
  `turn_order[turn]` at the end of `init_Encounter` and on every `set_turn`, forward or
  back, and the end-of-turn triggers use its previous value.
- `apply_effect`: after a *new* instance is committed and resolved, it fires `on_apply`
  with `effectKey`, and `on_condition_applied` for the holder when the definition's
  `category` is `"condition"`. The Exhaustion-level and duplicate-condition paths fire
  neither.

### 3. Hooks
- `HpManipulations.isDamage`: capture `curHp` / `maxHp` before, and after the final
  `set_hp` fire, unless `config.undo` or `amount <= 0`:
  - `damage_taken` (target) with `{ sourceKey: current.key, amount, damageTypes }`, where
    `damageTypes` come from `config.actions[].rolls[].damage_type`
  - `damage_dealt` (current) with `{ sourceKey: target.key, … }`
  - `on_zero_hp` when `before > 0 && after === 0`
  - `on_bloodied` when `before > maxHp / 2 && after <= maxHp / 2`

  These use the main HP pool (not transformed or temp): Bloodied is about the creature's
  hit points. `isHealing`: `on_heal` (target) with `{ sourceKey, amount }` when
  `amount > 0` and not undo.
- `hk-single-roll.apply`: after `setHP`, for each action index:
  - `hitOrMiss === "hit"`: `on_hit` (current) / `on_hit_taken` (target), plus
    `on_crit` / `on_crit_taken` when `throwsTotal === 20`
  - `action.type === "save"` with a `savingThrowResult`: `on_save_success` or
    `on_save_fail` (target), with `{ sourceKey: current.key }`
  - Events carry `attackTypes` from `action.type` and `naturalRoll` from
    `toHit.throwsTotal`.
- `hk-roll`: an optional `roll.trigger = { name, entity_key }`. After `rollD`, if set,
  dispatch `fire_trigger({ trigger: name, entityKey: entity_key, event: { naturalRoll } })`,
  with the natural roll from `rollD`'s return value. `CardDetails` sets it for the `mod`
  roll (not `save`) and for the skills; `CardSkills` for the skills.
- Rests: *as built, dropped.* The planned "Short rest" / "Long rest" items in
  `TargetMenu.vue` turned out to be invisible, because `TargetMenu` is imported by
  `TargetEntity.vue` but never rendered. The user chose to defer `short_rest` /
  `long_rest` until a rest feature exists instead of adding them to the options bar. The
  items were removed from both menus. `matchTriggers` and `TRIGGER_LABELS` still know the
  names, so a later rest feature only needs to call `fire_trigger`.

### 4. Notifier
`src/components/combat/EffectTriggerNotifier.vue` (renders nothing) is mounted once in
`RunEncounter.vue` at the root of the running encounter. It watches `effect_prompts`, and
for each new prompt calls `this.$snotify.info(lines.join("\n"), `${holderName}:
${effectName}, ${triggerLabel}`, { timeout: 0, buttons: [Details → setDrawer ActiveEffect,
Dismiss] })`, then commits `CLEAR_EFFECT_PROMPTS`. Trigger labels live in a small map in
`effectFunctions.js` (`start_turn_target` → "at the start of its turn", `damage_taken` →
"when it takes damage", …).

*Alternative:* call `Vue.prototype.$snotify` from the store. Rejected: it couples the
store to a UI plugin and is untestable. The queue also gives 2h a place to add
interactive prompts (repeat saves).

## Risks / Trade-offs

- [Too many toasts, e.g. Concentration on every damage instance of multi-target rolls] →
  One toast per instance per trigger, and prompts only exist for effects that listen.
  Grouping comes later if it's noisy in play.
- [Turn triggers moving from components to the store] → Only the new effect triggers use
  `set_turn`. Reminders keep their component hooks, so there's no behavior change for them.
- [`turn_order` must match `_active` exactly] → Same filter and sort, and the drawer
  switches to it. A mismatch would show in the drawer's caster in the user check.
- [Bloodied edge: `maxHp` includes `maxHpMod`] → The same `maxHp` the tracker displays.
- [Card roll hook changes a shared component (`hk-roll`)] → Opt-in via `roll.trigger`.
  Other callers are unaffected.

## Migration Plan

UI/store only; no data changes. Rollback is reverting the commit.

## Open Questions

None.
