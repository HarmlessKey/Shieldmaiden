## 1. Pure helpers

- [x] 1.1 `rollEffectValues` and the sub-effect key helper (`id` or `sub_<index>`) in `effectFunctions.js` (design decisions 1–2). Verify with a scratchpad script with a seeded `random`: Strength Drain (1d4 → `{ sub_0: 3 }`), a `modifier` formula with the caster's Wisdom, a sub-effect with `id`, nothing rolled for `choice: "value"`, `temp_hp`, d20 roll bonuses or out-of-level rows
- [x] 1.2 `effectiveStats` reads `rolled_values` for sub-effects whose roll has dice, and lists "not rolled" without a stored total (decision 3). Its tooltip text shows the roll ("−3 (1d4)"). Verify in the scratchpad against the "Rolled values are rolled when the effect is applied" scenarios (Strength 14 → 11, max HP 40 → 29, AC +2, instance without a roll, chosen value wins), plus the existing "Numeric sub-effects change effective values" and "Modifiers combine in a fixed order" scenarios unchanged
- [x] 1.3 `alsoHealAmount` uses the stored total times the multiplier. Verify the "Rolled also-heal" scenario and that Aid still heals 5
- [x] 1.4 `signedRoll` (decision 4): `rollModifiers` switches to it without a change in behaviour, and `damageAmount` returns `sign` and `flat`. Verify with a scratchpad script: Bane −1d4 unchanged, damage `multiplier: -1` → sign −1, `fixed_val: -1` with dice → sign −1 and flat 0, flat `value: -2` → −2
- [x] 1.5 Penalty folding at the start of `applyDamageModifiers` (decision 5). Verify in the scratchpad: 7 slashing with −2 → 5, 2 slashing with −4 → 0 (no negative part), radiant penalty on slashing → unchanged, 10 slashing −2 with resistance → 4, plus a few existing damage-modifier cases (reduction, resistance, Evasion) unchanged

## 2. Rolling and display

- [x] 2.1 `dice.js`: negate the dice total of a damage bonus with `sign < 0`, add `flat`, and label the line with "−", including the crit Roll/Max branches. Verify by reading against the "Penalty dice", "Negative fixed value gives the sign" and "Penalty on a critical hit" scenarios, and with `npm run lint`
- [x] 2.2 `apply_effect` in `runEncounter.js`: for new instances, resolve the definition, call `rollEffectValues` with the holder's and the caster's variables, set `instance.rolled_values` before persisting (demo/test included, without writing), and add a notice with the rolls. Verify by reading the code path for the effects drawer, effect links, the bonus drawers and escalation, and that level updates of existing instances don't roll
- [x] 2.3 The campaign apply in `userContent/campaigns.js`: the same as 2.2 for players and companions outside combat. Verify by reading against the "Each target rolls" scenario, and with `npm run lint`
- [x] 2.4 Roll dialog and damage prompt: the penalty line shows its negative roll, and per-type totals use the folded parts. Verify by reading `hk-single-roll.vue` and `damageModifiers.js` against "Penalty doesn't go below 0"

## 3. Form

- [x] 3.1 `fieldControls.js`: `RULES.roll` for value types on stat sub-types, and `RULES.multiplier` for those when they have a roll (decision 6). Verify with a scratchpad script against `fieldShown`: Bonus + Armor Class shows value and roll but no multiplier, and with a roll shows the multiplier. Ability score shows abilities, the roll and the multiplier. Saving throws are unchanged. Also check that the unused-field clearing removes `roll` when Applies to changes to something without it

## 4. Storage

- [x] 4.1 Schema `$defs/active_instance.rolled_values`, plus the `roll` and `multiplier` descriptions (decision 7), in `src/schemas/hk-effects-schema.json` and `HarmlessKey_API/schemas/hk-effects-schema.json`. Verify that `validate.mjs` passes, and that an instance built by `rollEffectValues` validates in the scratchpad
  - Only the app schema was changed. The API copy already lags the app schema in many places (enums, triggers, `magical`, `concentration_for`…), so it needs a full sync of its own rather than this one field.
- [x] 4.2 Rules: `rolled_values` in the three `effects` blocks of `firebase_rules/firebase-rules.json`. Verify with the rules emulator against the "Rolled values accepted" and "Invalid rolled values rejected" scenarios, and that the existing effects and bonuses emulator tests still pass

## 5. Docs and checks

- [x] 5.1 `src/docs/effects.md`: rolled values on value sub-types (rolled once when applied, `multiplier: -1` for a penalty, shown in the notice and the tooltip), and damage penalties (sign rules, never below 0). Verify by reading against the specs
- [x] 5.2

## 6. Admin testing before the release

- [x] 6.1 `customEffectsEnabled(userInfo)` (released, or an admin) and an `enabled` parameter on `withCustomComingSoon`. The encounter and campaign Effects drawers and the bonus drawers load custom effects and leave out the Coming soon tab when it's true. Verify with a scratchpad script (no user, admin, contributor; the Custom tab with and without), and `npm run lint`
- [x] 6.2 Effects under My content for admins: the list with search and delete, no links to the form, and a Paste JSON button in the header. The form routes still redirect. Verify by reading against the "Admin before the release" scenario, and that each Vue option appears once
- [x] 6.3 `PasteEffect.vue`: parse, clean, validate with the shared `getEffectValidator` (moved out of `EditEffect.vue` into `src/utils/effectValidator.js`), and save with `add_effect`. Verify by reading against the "Admins can create an effect from pasted JSON" scenarios, and that test effects generated in the scratchpad pass the same clean + validate Run `npm run lint` and `openspec validate rolled-effect-values --strict`, and check that each touched Vue component has every option once
