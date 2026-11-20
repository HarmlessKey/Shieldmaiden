## Why

An effect can leave a number to be chosen when it's applied (`choice: "value"`), but not dice.
That's rarely what you want for damage over time: a generic "Burning" or "Bleeding" effect
should deal "2d6 fire each turn" with dice the DM picks, rolled every turn, not the same flat
number. Monster effects have the same problem: Weakening Breath reduces Strength by 1d4, 1d6
or 1d10 depending on the dragon, so it needs three definitions today (and Giggling Magic two).

## What Changes

- New choice kind `roll`: the sub-effect's roll is chosen when the effect is applied, entered
  like every other roll (Dice, Die, Fixed value) and saved as `{ dice_count, dice_type,
  fixed_val }`, the same shape as a reminder's damage.
- The chosen roll replaces the sub-effect's dice and fixed value everywhere its `roll` is used:
  - stat values (Strength, AC, hit point maximum…) roll it once when applied and store the
    total in `rolled_values`, as a fixed roll does now
  - damage and healing sub-effects (damage over time) roll it every time they trigger
  - roll and damage bonuses roll it on every roll they add to
  The roll's damage type and magical flag stay as defined.
- Applying asks for it with the Dice, Die and Fixed value inputs, filled in with the
  definition's dice when it has them.
- Effect links on NPC actions, traits and spells can fix it, so each dragon's Weakening Breath
  links one definition with its own dice.
- The custom effect form offers "Roll" as a choice for sub-effects that have a roll. Roll and
  Value exclude each other. With a Value choice the Roll's dice are hidden, because a chosen
  value isn't rolled.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `effects-stat-modifiers`: new requirement "A chosen roll is the sub-effect's roll", next to
  "A chosen value is the sub-effect's value".
- `effects-drawer`: "Application asks for the definition's choices" asks for a roll.
- `effects-authoring`: "Choices are marked as chosen when applied" offers Roll, and hides the
  Roll field with a Value choice.
- `effects-action-links`: "An effect link stores the effect and how it is applied" and "The
  link dialog edits every link field" accept a fixed roll choice.

## Impact

- `src/schemas/hk-effects-schema.json`: `roll` in `choice_kind`, and a `chosen_roll` object in
  the instance, application and link `choices`.
- `src/utils/effectsConstants.js` (`choice_kinds`), `src/utils/effectFunctions.js`
  (`chosenRoll`, `withChosenRoll` next to `withChosenValue`, `fixChoices`, `rollEffectValues`,
  `amountRoll`, link cleanup and the roll and damage bonus code).
- A `ChosenRollInput` (Dice, Die, Fixed value) in the Effects drawer application form, the
  roll dialog's linked effects and the NPC/spell link dialog.
- Custom effect form (`fieldControls.js`, `SubEffect.vue`, `SubEffectField.vue`) and its
  configuration summary.
- `firebase_rules/firebase-rules.json`: `roll` in the allowed choice kinds of the seven link
  blocks, and a roll object (dice count, die, fixed value) under `choices.roll` in those and the
  three instance blocks; every other choice stays a string.
- `src/docs/effects.md`: the Roll choice and damage over time.
- HK API data (follow-up, not in this change): Weakening Breath and Giggling Magic can become
  one definition each, with the monsters' links fixing the dice.
