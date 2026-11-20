## 1. Schema and engine

- [x] 1.1 Add `roll` to `choice_kind` and a `chosen_roll` object (`dice_count` and `dice_type` together, `fixed_val`) to the instance, application and link `choices` in `src/schemas/hk-effects-schema.json`, and `roll` to `choice_kinds` in `effectsConstants.js` (`field: "roll"`); verify with Ajv that a sub-effect with `choice: "roll"` and a link with `choices: { roll: { dice_count: 1, dice_type: 6 } }` validate, and `"1d6"`, `{ dice_count: 1 }` and an extra key don't
- [x] 1.2 `chosenRoll(choice)` and `chosenRollText` in `effectFunctions.js` (decision 1); verify with a scratchpad test: `{2, d6}`, `{1, d10, +2}`, `{3, d4, −1}`, `{ fixed_val: 5 }` and numeric strings are rolls; nothing, text, `{}`, a count or die alone, a count of 0, a die of 1, 1.5 dice and 100 dice aren't
- [x] 1.3 `withChosenRoll` and `withChoices` (decision 2), used everywhere `withChosenValue` is now; `rollEffectValues` rolls a chosen roll; verify with a scratchpad test for the spec scenarios: Burning 2d6 fire in `effectRollParts`, Weakening Breath 1d6 rolled into `rolled_values` and lowering Strength, 2d4+2 acid, a fixed 5 without dice, a −1d4 roll bonus chosen as 2d4 in `rollModifiers`, no choice made does nothing, and the existing value choice tests still pass
- [x] 1.4 `fixChoices` merges a fixed roll into the sub-effect's `roll` and drops the open choice; `getRequiredChoices` returns the roll kind with the defined dice as default; `cleanEffectLink` keeps a roll object (decision 3); verify with a scratchpad test that a linked Weakening Breath with a 1d6 roll asks for nothing and rolls 1d6, and that link cleanup keeps a valid roll and drops half a die

## 2. Applying and links

- [x] 2.1 `ChosenRollInput` (Dice, Die, Fixed value, like a reminder's damage) in the Effects drawer application form and the roll dialog's linked effects, prefilled with the defined dice, validated with `validChoice` and stored with `storedChoice`; verify by reading the components and with the scratchpad checks of `validChoice` and `storedChoice`
- [x] 2.2 NPC and spell link dialog: `ChosenRollInput` for a roll choice (empty is "Chosen when applied", required on a trait, a count needs a die and the other way around, so Save stays disabled); the link summary and trait label show "1d6"; verify by reading the components and the `traitEffectsLabel` test
- [x] 2.3 Database rules: `roll` in the seven link `$choice` regexes, and a roll object under `choices.roll` in those and the three instance blocks (decision 5); verify with the rules emulator: roll objects on NPC, spell and instance writes are accepted; text, half a die, an extra key and 1.5 dice are rejected; string choices still work; and the earlier rules tests still pass

## 3. Form

- [x] 3.1 Custom effect form: Roll offered as a choice only with a Roll field; Roll and Value exclude each other; with Roll the Roll field stays with a "default when applied" label and the Value field is hidden; with Value the Roll's dice are hidden and cleared, keeping a damage roll's damage type (decision 4); the configuration summary names the default roll; verify with a scratchpad script against `showsField`, `rollKeysToClear`, `exclusiveChoiceKinds` and the summary, and by reading `SubEffect.vue` and `SubEffectField.vue`
- [x] 3.2 Show a chosen roll in the detail view's choices ("Roll: 2d6") with `chosenRollText`; sub-effect texts don't show amounts, so nothing changes there; verify by reading `ActiveEffect.vue`

## 4. Docs and checks

- [x] 4.1 `src/docs/effects.md`: the Roll choice entered as Dice, Die and Fixed value, damage over time with a chosen roll, links fixing it, and that a chosen roll replaces a modifier formula; verify by reading
- [x] 4.2 Run `npm run lint`, all scratchpad tests, the rules emulator tests and `openspec validate roll-choice --strict`, and confirm all pass
