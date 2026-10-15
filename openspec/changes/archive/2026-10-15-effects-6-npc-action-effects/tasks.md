## 1. Schemas

- [x] 1.1 Add `$defs/effect_link` to `src/schemas/hk-effects-schema.json` (`effect` required, `duration`, `choices`, `level` ≥ 1, `magical`; `additionalProperties: false`), switch the five `$defs/action_effects` lists to it and remove `action_effects.save`; update the `action_effects` description (action's own save is used). Verify with a scratchpad Ajv script: the grapple link from the spec validates, a link with `save` and action effects with `save` don't
- [x] 1.2 Add optional `effects` (`$ref` to `https://harmlesskey.com/schemas/hk-effects-schema.json#/$defs/action_effects`) to the `action-list` item in `src/schemas/hk-npc-schema.json` (shared by all five groups) and raise `maxItems` from 1 to 5. Verify with the scratchpad script (effects schema added to Ajv): an existing NPC without `effects` validates, a trait with an `on_fail` Poisoned link validates, the two-entry bite from the spec validates, 6 entries fail, a link without `effect` fails
- [x] 1.3 Run `node scripts/validate-effects-data/validate.mjs` and `check-constants.mjs` and verify both still pass (the definition checks are unaffected by the link shape)

## 2. Helpers and constants

- [x] 2.1 Add `action_outcomes` (outcome → label: On a hit, On a miss, On a failed save, On a successful save, Always) and `outcomesFor(type)` to `src/utils/effectsConstants.js` (design 4). Verify with a scratchpad script: `melee_weapon` → hit/miss/always, `save` → fail/success/always, `other` → always
- [x] 2.2 Extract the recursive cleaner of `cleanEffectDefinition` in `src/utils/effectFunctions.js` and add `cleanEffectLink(link)` and `cleanActionEffects(effects)` (design 8: no empty choices, `magical: false` dropped, choices stay strings, empty outcome lists and empty `effects` return undefined). Verify with a scratchpad script on sample links, including `choices: { value: "3" }` staying a string, and that `cleanEffectDefinition` output is unchanged for `src/data/effects.js`
- [x] 2.3 Move the choice label/option logic from `ApplyEffect.vue` into a `choiceField(choice, { conditions })` helper in `hk-effects-form/fieldControls.js` and use it in `ApplyEffect.vue` (design 6). Verify `npm run lint` passes and the drawer's choice inputs render the same labels and options as before (read the template diff: only the source of labels/options changes)

## 3. Link form, list and sub-actions

- [x] 3.1 Create `hk-effects-form/EffectLinkForm.vue`: Effect (`EffectRefPicker`, required), When (`outcomesFor` of the entry's action type, required), Duration (`OptionalBlock` + `DurationEditor`), Choices (one field per `getRequiredChoices` of the resolved definition, first option "Chosen when applied"), Level (only with a level track, ≥ 1), Magical toggle. Resolve the definition per design 7 (NPC edition, fallback edition, custom via `get_effect`, not found state). Drop fixed choices the new definition doesn't ask for when the effect changes. Verify `npm run lint` passes
- [x] 3.2 Create `hk-effects-form/ActionEffects.vue`: list of all links of an action-list entry in outcome order with name, outcome label, summary (duration via `describeDuration`, fixed choices), warning for an outcome that doesn't fit the type, edit and remove; "No effects" when empty; Add effect button; q-dialog with ValidationObserver around `EffectLinkForm` working on a copy, Save disabled while invalid, Cancel leaves the entry unchanged; save writes or moves the link into its outcome list with `$set`. Emits a change so the parent can `$forceUpdate()`. Verify `npm run lint` passes
- [x] 3.3 Add `<ActionEffects>` to `src/components/npcs/Actions.vue` for every action-list entry of the five groups, below the rolls card and also for type `other`, passing the NPC edition and the entry's action type. Verify `npm run lint` passes and that `Actions.vue` still has one `components`/`methods`/`computed` block each
- [x] 3.4 Add sub-actions in `src/components/npcs/Actions.vue` (design 5): a "Sub-action N" header with a remove button from the second entry on, and an Add sub-action button below the last entry (hidden at 5 entries) that pushes `{ type: "save" }`; adding and removing call `$forceUpdate()` like the existing roll methods. Verify `npm run lint` passes and, by reading the template, that rolls and the roll dialog use each entry's own `action_index`

- [x] 3.5 Third review: list the entries under an **Actions** label with **Add action** at the end of its line, each entry a collapse item with a one-line header (`actionHeader`: type · to hit or save · rolls and effects count), with its inputs, rolls and effects inside and a remove button in the header from the second entry on; a new entry opens. Verify `npm run lint` passes and a scratchpad check of `actionHeader` gives "Save · DC15 CON · 1 roll, 2 effects" and "Melee weapon · +4 to hit · 1 roll, 1 effect"

## 4. Rolling several entries

- [x] 4.1 In `rollAction` (`src/mixins/dice.js`) treat an entry without `rolls` as `[]` (design 2b), and check that `hk-single-roll.vue` (totals, save handling, damage types) and `shareRoll` in `runEncounter.js` accept an action with an empty `rolls`. Verify with a scratchpad script that runs the same loop shape over the two-entry bite and a save entry without rolls without throwing, and by reading the `hk-single-roll.vue` code paths
- [x] 4.2 Add `hasRolls(ability)` to `src/utils/generalFunctions.js` (some entry not of type other with rolls) and use it for the roll-button checks in `RollActions.vue`, `combat/actor/Actions.vue`, `CardActions.vue`, `compendium/Monster.vue` and `npcs/Actions.vue`; leave the first-entry captions as they are. Verify with a scratchpad script (first entry other + second attack → true, single other → false), `npm run lint`, and a search for `action_list[0]` / `action_list?.[0]` whose remaining hits are all display only

- [x] 4.3 Fourth review: in `hk-single-roll.vue` separate the rolled actions with space and a divider, and list each action's linked effects (passed along by `rollAction`) with whether they apply for the chosen hit/miss or fail/save (`linkedEffects`), without a note about applying them (that's planned in step 7). Verify `npm run lint` passes and a scratchpad check of `linkedEffects` for hit, miss, unchosen, save and always

## 5. Saving and import

- [x] 5.1 In `src/views/UserContent/Npcs/EditNpc.vue` run `cleanActionEffects` over every action-list entry of the five groups before `add_npc` / `edit_npc`, deleting `effects` when it comes back undefined. Verify with a scratchpad script that applies the same loop to an NPC fixture with an empty outcome list and a link with `magical: false`, and that the result validates against the NPC schema
- [x] 5.2 In `src/components/userContent/ImportUserContent.vue` add the effects schema to the Ajv instance before compiling the NPC schema, and add a line to the schema dialog that `effects` follows the effects schema. Verify with a scratchpad script using the same Ajv setup: an NPC with a link imports as valid, one with a link without `effect` lists the schema error

## 6. Database rules

- [x] 6.1 Add the `effects` block from design 9 to `action_list/$listIndex` of `special_abilities`, `actions`, `bonus_actions`, `legendary_actions` and `reactions` under `npcs` in `../firebase_rules/firebase-rules.json`. Verify the file parses as JSON and a scratchpad script confirms the five blocks are identical
- [x] 6.2 Run `node scripts/validate-effects-data/check-constants.mjs` and verify it passes and counts the five new duration blocks (temporarily break one regex in a scratchpad copy passed with `--rules` to confirm it is reported)

## 7. Documentation and plan

- [x] 7.1 Update "Action effects" in `src/docs/effects.md`: field labels as in the dialog (Effect, When, Duration, Choices, Level, Magical), several sub-actions per ability (damage on a hit plus a save that poisons), traits with an action type can link effects, Scaling is for spell links only; keep the step 7 text about applying from rolls. Verify every field listed for a monster action link exists in `EffectLinkForm.vue` with the same label
- [x] 7.2 Add an "As built" note to step 6 of `.planning/effects-implementation-plan.md` (`effect_link`, links on each `action_list` entry, up to 5 entries per ability with rolls and links in any entry, all five groups, no `save` on action effects, value choices are numbers, display of extra entries and applying links are later). Verify the note matches the schema and the spec

## 8. Shared duration fields (revised after review, design 10)

- [x] 8.1 Add `durationToForm(duration)` to `src/utils/effectFunctions.js` (the inverse of `repeatSaveFromForm` / `escapeFromForm` plus type, value, unit, anchor, edge and cancel triggers), and make `cleanEffectLink` drop `ends_when`, `on_expire`, `ends_by_action` and `rest_type` from the duration. Verify with a scratchpad script: form → duration → form round-trips for a time + repeat save (escalation, auto success) + escape + cancel triggers duration, and the cleaner drops the four fields
- [x] 8.2 Create `hk-effects-form/ApplicationDuration.vue` with the drawer's duration fields and labels, Ends early when, `optional` (No duration), `defaultSave`, a slot after the type fields, `input` and `valid` events. Verify `npm run lint` passes
- [x] 8.3 Use `ApplicationDuration` in `ApplyEffect.vue` (Concentration options in its slot, `apply()` takes the emitted duration). Verify `npm run lint` passes and, by reading the diff, that the drawer's fields, labels, defaults and checks are unchanged apart from Ends early when
- [x] 8.4 Use `ApplicationDuration` in `EffectLinkForm.vue` instead of `OptionalBlock` + `DurationEditor` (optional, default save from a save sub-action), and disable the dialog's Save in `ActionEffects.vue` while the duration is invalid. Verify `npm run lint` passes
- [x] 8.5 Update the docs (`src/docs/effects.md`): the link's Duration is the drawer's duration, and Ends early when in the drawer's application form. Verify the labels match `ApplicationDuration.vue`

- [x] 8.6 In `ApplicationDuration.vue` replace the Repeat save to end / Can escape checkboxes and the Ends early when field with the End effect select and a tab per selected option (design 10, second review); in `optional` mode make the duration select empty by default and clearable, with the "Without a duration…" hint, and hide End effect without a duration; remove the hint from `EffectLinkForm.vue`. Verify `npm run lint` passes and the duration round-trip script still passes
- [x] 8.7 Update the docs for the End effect select (drawer section and the link's Duration). Verify the labels match `ApplicationDuration.vue`

## 9. Verification

- [x] 9.1 Run `npm run lint`, `node scripts/validate-effects-data/validate.mjs` and `check-constants.mjs`, and validate fixture NPCs against the NPC schema in a scratchpad script: one per group with one link per outcome that fits its type, and the two-entry bite; all pass. Leave testing the NPC form and rolling in the browser, and deploying the rules, to the user
- [x] 9.2 After group 8: rerun lint, the scratchpad checks and both validator scripts; all pass
- [x] 9.3 After 8.6–8.7: rerun lint, the scratchpad checks, both validator scripts and `openspec validate`; all pass
