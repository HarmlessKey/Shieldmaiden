## Why

Hex and Hunter's Mark deal extra damage "whenever the caster hits the target". They are held
by the target as a `damage` sub-effect with `trigger: "on_hit_taken"` and
`trigger_filter.by: "caster"`, so today that damage only shows up as a separate prompt with a
Roll button after the attack is applied. Found while testing Hex: the DM expects the 1d6 to be
rolled with the attack, like Divine Favor's damage bonus (3c2).

## What Changes

- Damage the target's effects deal when the attacker hits it (`damage` sub-effects with
  `trigger: "on_hit_taken"`, caused by the caster or by anyone) is rolled with the attack, as
  its own named damage roll ("Hex", 1d6 necrotic), like the attacker's damage bonuses: hits
  only, crits follow the Critical Hits setting, the attack's first damage type when it has
  none (5e Hunter's Mark).
- The prompt after the roll is applied no longer lists damage that was rolled with the
  attack. Damage whose trigger filter can't be checked before the attack is rolled (a natural
  roll, an amount, a distance…) keeps the prompt.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `effects-roll-modifiers`: "Damage bonuses are added to hits" also covers the target's
  `on_hit_taken` damage caused by the attacker.
- `effects-triggers`: "The DM is prompted for matching effects" leaves out damage already
  rolled with the attack.

## Impact

- `src/utils/effectFunctions.js`: `damageBonuses` also reads the target's effects; a shared
  helper decides which `on_hit_taken` damage is rolled with the attack.
- `src/store/modules/runEncounter.js`: `fire_trigger` leaves those sub-effects out of the
  prompt for an attack's `on_hit_taken`.
- `src/components/hk-components/hk-rolls/hk-single-roll.vue`: `fireRollTriggers` marks the
  event as coming from an attack roll.
- `src/docs/effects.md` and the effects plan.
- No schema, data or database rules change.
