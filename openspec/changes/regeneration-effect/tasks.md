# Tasks

Verification is static (lint, schema checks and throwaway scripts in the scratchpad); running
the app is left to Harm. Nothing is written to the HK API: Harm publishes the definitions.

## 1. Schema and database rules

- [ ] 1.1 In `src/schemas/hk-effects-schema.json`, add `choice_settings` to definitions (per choice kind: `optional`, `multiple`; `multiple` only for `damage_type`) and allow a list of damage types as the `damage_type` choice of links and instances; verify with a throwaway ajv script that the spec's Regeneration link (`damage_type: ["acid", "fire"]`) validates and a list for `ability` doesn't
- [ ] 1.2 Copy the schema change to `schemas/hk-effects-schema.json` in HK API; verify `pnpm test` and `pnpm skill:check` there still pass
- [ ] 1.3 On the `effects` branch of `firebase_rules`, let `choices.damage_type` be a string or a list of short strings in the 10 places that check `isString()`; verify the file parses as JSON and the 10 blocks are identical (diff)

## 2. Resolving choices

- [ ] 2.1 In `fixChoices` (`src/utils/effectFunctions.js`), fill every chosen damage type, and put them in `trigger_filter.damage_types` for sub-effects with a `damage_taken` or `damage_dealt` trigger; verify with a throwaway script on the Regeneration definition that the troll limb's link gives a filter of acid and fire
- [ ] 2.2 Leave out the sub-effects whose optional choice isn't set when resolving a definition with its choices; verify with the same script that the oni's link (value only) resolves to the healing sub-effect alone

## 3. Trigger prompts

- [ ] 3.1 Offer **Apply** for `apply_effect` sub-effects in trigger prompts: apply the effect to the recipient with the sub-effect's duration and the instance's caster, once; verify by reading the apply path against the spec's "Suppressing Regeneration" and "Damage on its own turn" scenarios, and `npm run lint`
- [ ] 3.2 List a sub-effect whose checkable condition doesn't hold as "doesn't function" with the condition's description, without Roll or Apply; verify with a throwaway script over the prompt builder for the oni at 0 Hit Points and the suppressed limb, and `npm run lint`

## 4. Forms

- [ ] 4.1 In the link dialog and the Effects drawer's application form, show a multiple choice as a multi-select and don't require an optional choice; verify `npm run lint` and that the saved link stores `damage_type` as a list only for a multiple choice
- [ ] 4.2 In the trait link dialog, require every choice except optional ones; verify `npm run lint` and the spec's "Optional choice left empty" scenario by reading the dialog's validation

## 5. SRD data

- [ ] 5.1 Write the Regeneration and Regeneration Suppressed definitions as JSON (one entry each, no `edition`) for Harm to publish; verify `scripts/validate-effects-data` passes on them together with the current API data, including the reference from Regeneration to Regeneration Suppressed

## 6. Documentation

- [ ] 6.1 Describe Regeneration on the How effects work page (`src/views/Pages/EffectsDocumentation`): the healing, at least 1 Hit Point, the damage types and Apply in the prompt, and what stays in the description; verify `npm run lint`
- [ ] 6.2 Run `openspec validate regeneration-effect` and verify it passes

## Workflow follow-up

- Harm publishes the two definitions to the HK API and tests the oni and a troll limb in the tracker.
- Rolled amounts: once the effects can hold a roll in a value, Regeneration takes "regains 2d6 Hit Points".
- HK API, its own step: rebuild the parser skill's catalogue (`pnpm skill:catalogue`), add a Regeneration rule and benchmark case, and re-parse the oni, troll and vampire traits.
- Archive this change once implemented (`/opsx:archive`).
