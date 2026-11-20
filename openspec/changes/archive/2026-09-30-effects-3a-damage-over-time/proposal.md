## Why

Since 2g, a Burning effect only *says* "at the start of its turn: Damage". The DM still has
to open a dice roller, roll 1d4, find the target and apply the damage by hand. The same goes
for Hex's extra 1d6 when the caster hits, Fire Shield-style retaliation, healing over time,
and the damage on each failed repeat save (Phantasmal Killer). Damage and healing
sub-effects are the most common tier-A mechanic in the catalogue, and the plan names them
the first priority of step 3.

Step 3 of [.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
is split into sub-steps (3a–3g). This is **3a: damage and healing sub-effects**. Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §3.3 (damage over
time, on-hit riders, caster-linked damage, retaliation), §2 decision 5 (values are amounts),
and `$defs/dice_roll`, `$defs/amount`, `$defs/formula`, `$defs/save_spec` in
`src/schemas/hk-effects-schema.json`.

## What Changes

- **Roll from the prompt**: an effect prompt whose sub-effects include `damage` or
  `healing` gets a **Roll** button. That covers trigger prompts, the repeat-save `on_fail`
  prompt and the `on_expire` prompt. Roll rolls the sub-effect and opens the result in the
  tracker's existing roll dialog, with the recipient as target. The DM applies it there as
  with any action roll: resistances, vulnerabilities and immunities, save for half, editing
  the total, the log, damage meters and the HP triggers (`damage_taken`, `on_zero_hp`,
  `on_bloodied`, Concentration) all work as they do today. Nothing is applied without the
  DM.
- **What is rolled**: the sub-effect's `roll` (dice, fixed value, damage type,
  magical), or its `value` (a number or a formula). Level scaling (`scaling.by: "level"`)
  reads the instance's `level`. A `damage_type` choice made when the effect was applied
  (`choice: "damage_type"`) sets the damage type. Several damage or healing sub-effects of
  one prompt that go to the same recipient are rolled together into one roll.
- **Formulas**: a small, safe formula evaluator for `$defs/formula`. Variables are ability
  scores and modifiers, `pb`, `max_hp`, `level` (the instance's level) and `damage_taken`
  (the triggering event's amount), plus the same with a `caster.` prefix. A formula with
  unknown variables isn't guessed: the known part is rolled and the roll's name says what
  was left out.
- **Who takes it**: `target` decides the recipient:
  - `self` (default): the holder
  - `caster`: the instance's caster
  - `trigger_source` / `counterpart`: the other party of the triggering event
  
  When the recipient isn't in the encounter or the event doesn't name one, that sub-effect
  gets no Roll button and stays a line in the prompt.
- **Who deals it** (for the log, meters and `damage_dealt`): the holder when the recipient
  is the other party (retaliation), otherwise the instance's caster when it is in the
  encounter, otherwise the holder.
- **Save per resolution**: a sub-effect with `save` becomes a save action in the roll
  dialog. It uses `save.ability`, the DC from `save.dc` (a number or a formula) or the
  instance's `save_dc`, and `on_success` (`half` halves the damage, `negate` and `partial`
  mean no damage). Without a known DC the dialog shows no DC and the DM marks the save
  result.
- **Unknown amount**: custom effects saved by the legacy form have no dice or value (the
  form never asked; step 4 reworks it). Roll still opens the dialog, with an amount of 0 and
  the name "amount not set", so the DM enters the total and keeps the target, the damage
  type and the logging.
- **SRD data**: 5.5e `effects.js` gains the SRD 5.2.1 **Burning** hazard (1d4 Fire damage at
  the start of each of its turns), so the flow can be tried from the Effects drawer without
  authoring a custom effect.

Not in 3a (later sub-steps): enforcing `frequency` and `consume`, evaluating a sub-effect's
own `condition`, temporary HP (`fixed temp_hp`, 3b), defenses granted by effects (3d), and
on-hit riders that add to the attacker's own action roll instead of a separate roll.

## Capabilities

### New Capabilities
- `effects-damage-healing`: rolling and applying `damage` / `healing` sub-effects from
  effect prompts: what is rolled, formulas, recipient and dealer, saves, unknown amounts.

### Modified Capabilities
- `effects-srd-data`: the 5.5e effect list ships the Burning hazard.

## Impact

- `src/utils/effectFunctions.js`: pure helpers, tested in the scratchpad:
  - `evaluateFormula` / `resolveAmount`
  - `effectRollRecipients` (recipient and dealer per sub-effect)
  - `effectRollAbility` (builds the action-roll `action_list` from damage/healing
    sub-effects)
  - `resolveRepeatSave` and `onExpireLines` also return the raw sub-effects next to their
    lines.
- `src/store/modules/runEncounter.js`: trigger, `on_fail` and `on_expire` prompts carry the
  rollable sub-effects and the event's `sourceKey`.
- `src/mixins/effectRolls.js`: formula variables per entity (`pb`, modifiers). It also rolls
  the sub-effects through the dice mixin's `rollAction` and opens the result with
  `setActionRoll`.
- `EffectTriggerNotifier.vue`: the Roll button on trigger, `on_fail` and `on_expire` prompts.
- `src/data/5.5e/effects.js`: Burning, validated by `scripts/validate-effects-data`.
- No schema, rules or database changes. `hk-single-roll.vue` and `HpManipulations.js` are
  reused unchanged.
- `.planning/effects-implementation-plan.md`: step 3 records the 3a–3g split now, and 3a is
  marked done after archive.
