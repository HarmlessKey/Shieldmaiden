## Why

Some effects change a creature's value by a rolled amount: a Shadow's Strength Drain lowers
Strength by 1d4, and other monster effects lower the hit point maximum by a roll. The schema
lets a sub-effect have a `roll`, but `effectiveStats` only reads `value`, so a roll on a
value sub-type (`max_hp`, `ability_score`, `ac`…) does nothing. The form doesn't offer the
Roll field for these sub-types either, so the only workaround is for the DM to roll the dice
and type the result in as a chosen value.

Damage bonuses have a related gap. The schema says `multiplier` is "applied after value/roll",
and d20 roll bonuses use `multiplier: -1` for penalty dice (Bane −1d4). `damageAmount` ignores
`multiplier`, though, so a damage sub-effect with `roll: 1d4, multiplier: -1` adds 1d4 instead
of subtracting it. A negative `fixed_val` also means different things for d20 rolls (the
sign of the dice) and for damage (a flat amount added to the dice). On top of that, a damage
penalty is added as a negative damage roll, which can push a damage type's total below 0.

## What Changes

- **Rolled values**: a numeric sub-effect (`bonus`, `base`, `fixed`, `floor`, `cap`) on a
  value sub-type can have a `roll` instead of a `value`. The roll is made once, when the
  effect is applied, and its total is stored on the instance. The effective value uses that
  stored total like a `value`, so `multiplier` applies to it and `multiplier: -1` makes it a
  penalty (Strength −1d4). Each target of an application gets its own roll. The result is
  shown when the effect is applied and wherever the modifier is listed.
- Rolled `max_hp` bonuses with **Also raise current hit points** heal by the rolled amount.
- The effects form shows the **Roll** field for value sub-types (except `temp_hp`, which
  already has it).
- **Damage penalties**: a damage bonus sub-effect with a negative `multiplier`, or with dice
  and a negative `fixed_val`, subtracts its dice from the hit. This matches how d20 roll bonuses
  read the sign. A flat negative value still subtracts that number.
- **Penalties never go below 0**: negative damage from bonuses (effects and manual bonuses)
  lowers the hit's damage of its type, or of the attack's first damage type, and never takes
  that damage below 0.
- New optional instance field `rolled_values`, in the schema and the database rules.
- **Admin testing**: custom effects are still held back, so nothing could use the above yet.
  Admins now get their custom effects in Effects under My content and in the drawers, and can
  create one by pasting its JSON. Other users are unchanged until the release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `effects-stat-modifiers`: numeric sub-effects can use a roll made when the effect is
  applied; also-heal uses the rolled amount.
- `effects-roll-modifiers`: damage bonuses take their sign from `multiplier` and
  `fixed_val` like d20 roll bonuses, and damage penalties lower the hit's damage without
  going below 0.
- `effects-authoring`: the Roll field is shown for value sub-types. Admins bypass the
  custom effects hold-back and can create an effect from pasted JSON.
- `effects-instance-storage`: instances may store `rolled_values`, and the database rules
  accept it.

## Impact

- `src/utils/effectFunctions.js`: `buildEffectInstance` (or a new helper next to it),
  `effectiveStats`, `alsoHealAmount`, `damageAmount`, `applyDamageModifiers`.
- The apply paths that build instances: `src/mixins/applyEffect.js`,
  `src/store/modules/runEncounter.js`, `src/store/modules/userContent/campaigns.js`.
- `src/mixins/dice.js`: damage bonus rolls with a sign.
- `src/components/hk-components/hk-effects-form/fieldControls.js`: the Roll field rule.
- `src/schemas/hk-effects-schema.json` (`active_instance.rolled_values`, the `roll` and
  `multiplier` descriptions), mirrored in `HarmlessKey_API/schemas/hk-effects-schema.json`.
- `firebase_rules/firebase-rules.json`: the three `effects` blocks.
- `src/docs/effects.md`: documentation of rolled values and damage penalties.
- No migration. Existing instances have no `rolled_values`, and existing definitions with a
  `roll` on a value sub-type did nothing before.
