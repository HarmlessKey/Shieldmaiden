## Context

See proposal.md (Why). Requirements: `specs/effects-damage-healing/spec.md` (new) and
`specs/effects-srd-data/spec.md` (Burning).

State after 2i:
- `fire_trigger` queues `ADD_EFFECT_PROMPTS` entries built from `matchTriggers` results:
  `{ trigger, holderKey, effectKey, holderName, effectName, lines }`. `lines` are strings
  from `describeSubEffect`. The sub-effects and the event are not kept.
- `resolve_repeat_save` queues the `on_fail` prompt (kind `trigger`, `trigger:
  "on_save_fail"`) with `lines` from `resolveRepeatSave(...).onFail`. `remove_effect` queues
  the `on_expire` prompt with `lines` from `onExpireLines`. By then the instance is gone from
  the store.
- `EffectTriggerNotifier.vue` renders prompts as snotify toasts and already mixes in
  `effectRolls` (which mixes in `dice` and `experience`). `effectProficiency(entity)` gives
  `pb`.
- The action roll pipeline:
  - `dice.rollAction(e, ability, config)` turns `ability.action_list` (each `{ type, rolls:
    [{ damage_type, dice_count, dice_type, fixed_val, save_fail_mod, magical }] }`, plus
    `save_ability` / `save_dc` for `type: "save"`) into a rolled `{ name, actions }`.
  - `setActionRoll(roll)` with `roll.target` / `roll.current` shows it in the global
    `hk-rolls` dialog (`hk-single-roll.vue`). Applying calls `setHP(amounts, target, current,
    config)`, which handles defenses from the target's `damage_*` lists, the save result
    toggle, the total override, the log, meters, and the HP triggers.
- `$defs/dice_roll` uses the same field names as action rolls (`damage_type`, `dice_count`,
  `dice_type`, `fixed_val`, `magical`), plus `modifier` (a formula) and
  `damage_type_choice`.
- No formula evaluator exists. Concentration's DC formula is only shown as text.
- Legacy custom damage/healing sub-effects are `{ type, subtype: "roll" | "fixed_value",
  trigger }` with no amount. `normalizeDefinition` turns `subtype` into `sub_types`.

## Goals / Non-Goals

**Goals:**
- One click from the prompt to a filled-in roll dialog. Everything after that is the
  existing, familiar apply flow.
- All rules (amounts, formulas, recipients, dealers, save mapping) live in pure helpers
  that are tested in the scratchpad.

**Non-Goals:**
- Rolling or applying without the DM: no auto-apply setting in 3a.
- `frequency`, `consume`, and a sub-effect's own `condition`: not enforced. The line in the
  prompt is all the DM gets, as in 2g.
- Adding rider dice to the attacker's own action roll (Hunter's Mark and Divine Favor as
  part of the weapon roll). 3a rolls them separately from the `on_hit` prompt.
- Defenses granted by effects (3d), `temp_hp` (3b), `max_damage` / `max_healing` (later).
- Sharing effect rolls to the player live view.

## Decisions

### 1. Reuse the action roll dialog instead of a new resolver
An effect damage roll is turned into an action roll and pushed with `setActionRoll`.
- **Why:** `hk-single-roll` + `setHP` already do everything the spec asks after the roll:
  - defenses per damage type, including non-magical physical damage
  - save result and `save_fail_mod`
  - editing the total
  - log, meters, and the HP triggers
  
  A new dialog would duplicate that and drift from it.
- **Alternatives:**
  - *Apply directly from the toast* (roll, then `setHP` with no dialog): faster for Burning,
    but it skips defenses, gives no chance to fix the amount, and can't take a save result.
    A later "auto-apply" setting can call the same helpers.
  - *A new drawer*: more UI for the same result.

### 2. Pure helpers in `effectFunctions.js`
- `evaluateFormula(formula, vars)` returns `{ value, missing: string[] }`. It is a small
  tokenizer plus a recursive-descent parser for numbers, identifiers (`[a-z_][a-z0-9_.]*`),
  `+ - * /`, unary minus and parentheses.
  - Identifiers are looked up in `vars` (own properties only). An unknown name is added to
    `missing`, and then the whole formula counts as 0 (spec: not guessed), with no
    `min` / `max` applied.
  - Any other character makes the whole formula count as 0, with the formula in
    `missing`.
  - Division by zero gives 0.
  - `round` (default `down`), `min` and `max` apply to the result.
  - **Never `eval` / `Function`**: custom effects are user data.
- `resolveAmount(amount, vars)` accepts a number, a numeric string, a formula object or a
  formula string (sub-effect `value` allows a string). It returns `{ value, missing }`.
- `effectRollParts({ sub_effects, instance, holderKey, event, entities, vars })` returns
  one entry per recipient: `{ recipientKey, dealerKey, action_list, notes }`.
  - It keeps only `damage` / `healing` sub-effects, groups them by recipient, and drops
    those without a recipient in `entities`.
  - Recipient: `self` → holder; `caster` → `instance.caster_key`; `trigger_source` /
    `counterpart` → `event.sourceKey`.
  - Dealer: the holder for `trigger_source` / `counterpart`, otherwise the caster when it
    is in `entities`, otherwise the holder.
  - Each sub-effect becomes one action:
    - `type`: `healing`; or `save` when a damage sub-effect has `save`; otherwise `damage`
    - one roll: `dice_count` / `dice_type` / `fixed_val` / `damage_type` / `magical`,
      with `fixed_val += modifier`
    - level scaling adds `per_unit_dice` / `per_unit_value` × `max(0, level − base)`
    - damage type order: `choices.damage_type` (when `choice: "damage_type"` or
      `damage_type_choice`), then `roll.damage_type`, then `damage_types[0]`
    - for saves: `save_ability`, `save_dc` (resolved from `save.dc` or `instance.save_dc`,
      else `undefined`), and `save_fail_mod` (`half` → 0.5, else 0)
  - `notes` collects the formula variables that were left out, unsupported `scaling.by`
    values, and "amount not set" when there is neither `roll` nor `value`.
  - `vars` is `{ self: {...}, caster: {...} | undefined }`, built by the component. The
    helper flattens it into `name` / `caster.name` for the evaluator, and adds `level`
    from the instance and `damage_taken` from `event.amount`.
- `resolveRepeatSave` additionally returns `onFailSubEffects`, and a new
  `onExpireSubEffects({ instance, definition })` returns what `onExpireLines` describes.
  `onExpireLines` maps it. The existing return values don't change.

### 3. Prompts carry what a roll needs
Trigger prompts (in `fire_trigger`), the `on_fail` prompt and the `on_expire` prompt gain:
- `sub_effects`: the matched sub-effects. For triggers that is `matches[].sub_effect`, for
  the others the raw lists from 2.
- `instance`: a shallow snapshot. On expiry the instance is already removed, and a later
  tick shouldn't change the roll.
- `event`: `{ sourceKey, amount }` from the trigger event.

The store stays free of dice. Prompts are only data. `effectRollParts` runs in the
notifier when the toast is shown, to decide whether Roll appears (at least one part), and
again on click, so a recipient who left the encounter meanwhile is dropped.

### 4. Rolling in the notifier (`effectRolls` mixin)
- New `effectFormulaVars(entity)`: `str…cha`, `str_mod…cha_mod` (`calc_mod`), `pb`
  (`effectProficiency`) and `max_hp` (`maxHp`), read from the entity as the repeat-save
  modifiers already are.
- New `rollEffectParts(prompt)`:
  - builds `vars` (holder, caster when present, `damage_taken` from `prompt.event.amount`,
    `level` from the instance)
  - calls `effectRollParts`, and for each part calls `rollAction({ e: {} }, { name,
    action_list }, {})`
  - on the result, sets `save_dc` back to the helper's value (`rollAction` defaults it to 10)
  - sets `target` / `current` from `entities`, and calls `setActionRoll`
  - `name` is the effect name plus the notes in parentheses, e.g. "Burning" or "Burning
    (amount not set)".
- `rollAction` never marks a crit without a to-hit, so effect damage is never a crit
  (spec).

### 5. Burning data (5.5e only)
`src/data/5.5e/effects.js` gets `{ url: "burning", name: "Burning", category: "hazard",
cancelable: true, description, sub_effects: [{ type: "damage", trigger:
"start_turn_target", roll: { dice_count: 1, dice_type: 4, damage_type: "fire" },
description: "Takes 1d4 Fire damage at the start of each of its turns." }] }`. The
extinguish rule (an action, giving itself Prone) stays in the description. The DM removes
the effect by hand, as with any `cancelled` duration. 5e gets nothing: SRD 5.1 has no
Burning hazard. More SRD encodings (Hex, Searing Smite…) come with step 5. Their SRD
availability per edition must be checked against the SRD texts first.

## Risks / Trade-offs

- [Dealer is the holder when there is no caster, so "Goblin did 3 damage to Goblin" in the
  log and meters] → Rare (effects without a caster are applied before combat or kept in
  the carried-over review). The alternative, making `setHP` accept no `current`, touches
  every meter and log path. Revisit if it bothers in play.
- [A trigger with many listeners queues many toasts, each with Roll] → Same as today's
  prompts. Grouping is a notifier concern for later.
- [`rollAction` depends on the ability shape, and future changes there may break effect
  rolls] → The helper builds only the fields `rollAction` reads (`name`, `action_list`,
  `type`, `rolls`, `save_ability`, `save_dc`). The scratchpad test pins that shape.
- [A formula variable name clashes with an object prototype key (`constructor`)] → Lookups
  use own-property checks on a null-prototype object.
- [`on_hit` riders roll as a second dialog next to the attack's own] → Acceptable for 3a
  (non-goal). Merging into the attack roll is a step 7 concern.

## Migration Plan

No data migration. Existing custom effects keep working: their damage now offers Roll with
an amount the DM fills in. Rollback is reverting the change. The Burning entry is additive,
and an instance of it with the entry gone resolves as unresolved (name only), per 2e.
