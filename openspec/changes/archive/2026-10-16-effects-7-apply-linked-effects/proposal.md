## Why

Monster actions, traits and spells can carry linked effects (steps 6–6c), and the roll result
already says which ones apply ("Paralyzed · On a failed save · Applies"). But the DM still has
to apply each one by hand from the Effects drawer, picking the caster, duration and choices
again. Step 7 makes the roll apply them, with what the link already says.

## What Changes

- **Applying with the roll:** the roll's Apply buttons (Full, Half, Double, Missed) also apply
  every linked effect that applies to that card's target. Each applying effect line gets a
  checkbox, on by default, to skip it. A roll without damage or healing gets a single
  **Apply** button. An area roll applies once per target card.
- **Open fields inline:** a link that leaves a choice open, or has no duration, shows the
  missing fields under its line in the roll card: a select per open choice and a duration
  field. Apply is disabled while a checked effect misses a choice.
- **The link's settings are used:** fixed choices, level, duration, `magical`. The caster is
  the creature that rolled.
- **Spells:** the slot the spell is cast with drives the link's value, level and duration
  (`scaledLink`, including Duration by slot level). A repeat save without a DC gets the
  caster's spell save DC. A Concentration duration starts or shares the caster's Concentration
  **for the spell**: casting another Concentration spell replaces it, and a tier that drops
  Concentration (Bestow Curse at 5th) starts none.
- **Saves wait for the hit:** in an ability with several actions, a save action after an
  attack that missed doesn't apply its effects ("Attack missed"), the ghoul's claws.
- **Magical effects:** an applied effect stores `magical`, and its repeat saves count as saves
  against magic (Magic Resistance).
- **All actions shown:** the tracker's action list and the entity card show every action of an
  ability, not only the first.
- **BREAKING (data):** `concentration_for.source` also accepts `spell`, and instances accept
  `magical`; the database rules must be deployed with the app.

## Capabilities

### New Capabilities

- `effects-apply-from-rolls`: applying an action's or spell's linked effects from the roll
  result: which effects apply, the inline fields, the instances built (caster, choices,
  duration, level, magical), spell scaling and save DC, Concentration for spells, saves after
  a hit, and magical repeat saves.

### Modified Capabilities

- `effects-action-links`: "Abilities with several entries can be rolled" now shows every
  entry in captions and stat blocks; "The roll result shows linked effects, without applying
  them" is replaced by the new capability.
- `effects-instance-storage`: "Database rules accept valid instances only" accepts `magical`
  and `concentration_for.source: "spell"`.

## Impact

- `src/components/hk-components/hk-rolls/hk-single-roll.vue`: linked effect lines with
  checkboxes and inline fields; applying them with the roll; the Apply button for rolls
  without damage; saves after a missed attack.
- `src/mixins/runEncounter.js` and `src/mixins/dice.js`: the roll carries the spell cast
  (spell, cast level, caster level, spell save DC).
- `src/utils/effectFunctions.js`: building instances from a link (`linkApplication`), the
  spell Concentration plan.
- `src/store/modules/runEncounter.js`: applying linked effects with Concentration.
- `src/components/combat/EffectTriggerNotifier.vue` (and the active effect drawer): repeat
  saves pass the instance's `magical`.
- `src/components/combat/actions/RollActions.vue` and `combat/entities/Card/CardActions.vue`:
  every action of an ability.
- `src/schemas/hk-effects-schema.json`, `scripts/validate-effects-data/check-constants.mjs`,
  `src/utils/effectsConstants.js`, `../firebase_rules/firebase-rules.json`.
- `src/docs/effects.md` and the effects plan.
