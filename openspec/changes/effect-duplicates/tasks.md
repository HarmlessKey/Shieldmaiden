## 1. Schema and constants

- [ ] 1.1 Add `duplicates` to the sub-effect `type` enum in `src/schemas/hk-effects-schema.json` with `count`, `check` (`when`, `dice_type`, `min_roll` as integer or `{ duplicates, min }` array) and `ac` (formula), and an `if type = duplicates` branch requiring `count`/`check` and forbidding `sub_types`/`value`/`roll`/`trigger`; verify with an Ajv scratchpad script that both Mirror Image examples pass and `count: 0` fails
- [ ] 1.2 Add the type and its labels to `src/utils/effectsConstants.js` (type list, fields, check options); verify the constants check script (`check-constants.mjs`) still passes against the schema

## 2. Engine

- [ ] 2.1 Set `charges` from the first own Duplicates sub-effect's `count` in `buildEffectInstance`; verify in a scratchpad test that applying Mirror Image gives `charges: 3` and a definition without one gives no `charges`
- [ ] 2.2 Add `duplicatesOf(instance, definition)` and `targetDuplicates(entity, entityKey, definitionOf)` (most left wins) to `effectFunctions.js`; verify with a scratchpad test with two instances
- [ ] 2.3 Add the pure `duplicateCheck({ sub_effect, left, attack, ac, random })` for `targeted` and `hit`, including the closest-lower `min_roll` row and natural 20/1; verify with a seeded scratchpad test for every scenario in "Attacks against the holder roll the duplicate check"
- [ ] 2.4 Make `sense` evaluable for an entity (stat block senses and active Sense sub-effects) and add it to `EVALUABLE_CHECKS`; verify in a scratchpad test that a Blindsight NPC, a player with a Truesight effect and a Blinded attacker each fail the Mirror Image condition, and a plain goblin passes

## 3. Store

- [ ] 3.1 Add `use_duplicates` and `set_duplicates` to `runEncounter.js`, clamping to `0..max`, saving with `persist_effect` and removing with `reason: "used"` at 0; verify in a scratchpad test of the action with mocked dispatch/commit that 3 → 2 persists and 1 → 0 removes

## 4. Roll dialog

- [ ] 4.1 In `hk-single-roll.vue`, fill `duplicates[index]` in `checkHitOrMiss` in action order with a running count, using the target's formula variables for the duplicate AC, and show the dice, minimum, AC and outcome per attack; verify with `npm run lint` and by reading the template paths for `targeted` and `hit`
- [ ] 4.2 Add the outcome toggle and the "Check anyway" button for a skipped check, recomputing the following attacks; verify by reading the code path that changing the first attack's outcome updates the second's count
- [ ] 4.3 Treat an action that goes to a duplicate as not hitting the creature: no damage, no hit triggers, no linked effects, damage lines marked "hits a duplicate"; verify by reading `fireRollTriggers`, `linksToApply` and the damage result for that case
- [ ] 4.4 On Apply, dispatch `use_duplicates` with the number of duplicate hits; verify with `npm run lint`

## 5. Display

- [ ] 5.1 Show the duplicates left as the chip's badge (after Exhaustion, before rounds) and "N duplicates left" in the tooltip; verify against the "Duplicates left" scenario by reading the badge code
- [ ] 5.2 Show "Duplicates: N of max" with − and + in `ActiveEffect.vue`, calling `set_duplicates`, + disabled at max; verify with `npm run lint`

## 6. Form and docs

- [ ] 6.1 Add Duplicates to the form: its fields in `fieldControls.js` and an input for the check and the `min_roll` table, hiding and clearing Applies to/Value/Roll/Multiplier/Trigger; verify with `npm run lint` and that a built definition validates with the form's validator
- [ ] 6.2 Document the Duplicates type in `src/docs/effects.md`, with both Mirror Image examples and the sight condition; verify the examples validate against the schema

## 7. Definitions and test effects

- [ ] 7.1 Write the 2014 and 2024 Mirror Image SRD definitions (`url: "mirror-image"`, `edition` 5e / 5.5e) as JSON in the scratchpad for the HK API, and validate them against the schema
- [ ] 7.2 Write admin paste-test effects (both editions, plus one without a sight condition) and validate them; hand the paths to the user
- [ ] 7.3 Run `npm run lint` and `openspec validate effect-duplicates --strict`, and confirm both pass
