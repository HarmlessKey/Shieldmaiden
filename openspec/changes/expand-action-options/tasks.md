# Tasks

Verification is static (lint, schema checks in throwaway scripts); running the app is left to
Harm.

## 1. Schema and database rules

- [ ] 1.1 Add `option_actions` (object of action lists, `$ref` to the action-list definition) to the five ability groups in `src/schemas/hk-npc-schema.json`; verify with a throwaway ajv script that the Breath Weapons example from the spec validates and an option list with six entries doesn't
- [ ] 1.2 Copy the same schema change to `schemas/hk-npc-schema.json` in HK API; verify `pnpm test` and `pnpm skill:check` there still pass
- [ ] 1.3 Add `option_actions` with `$option` children that check each list like `action_list` to the five ability groups of user NPCs in `firebase_rules/firebase-rules.json`; verify the file parses as JSON and the `$option` rules match the `action_list` rules (diff the two blocks)

## 2. Import

- [ ] 2.1 In `ImportUserContent.vue`, validate `option_actions` with the schema and reject keys that aren't an option after the first; verify with a throwaway script over the import check that the three key scenarios of the spec (valid, first option, unknown option) give the right result, and `npm run lint` passes

## 3. Rolling

- [ ] 3.1 In `src/mixins/dice.js`, roll `ability.option_actions[option]` instead of `action_list` when the chosen option has one, and skip the `roll.options` changes then; verify by reading the roll path for Sleep Breath and Charge against the spec scenarios, and `npm run lint` passes
- [ ] 3.2 Make `hasRolls` in `src/utils/generalFunctions.js` consider every option list; verify with a throwaway script calling it on the spec's "only the option rolls damage" ability
- [ ] 3.3 Add the names of options with their own list after the caption in `RollActions.vue` and `CardActions.vue` (`captionEntries`); verify with a throwaway script on `captionEntries` and `npm run lint`

## 4. NPC form

- [ ] 4.1 Add the **Own actions** switch per option after the first in `src/components/npcs/Actions.vue`: on copies the action list (without roll options), off confirms and removes it; verify by reading the saved NPC object in the form's save path, and `npm run lint`
- [ ] 4.2 Show and edit the option's own Actions list with the existing entry, roll and link editors; hide the per-roll option fields of `hk-action-roll-form` for an option with its own list; verify `npm run lint` and that the save path strips unset fields in option lists as it does for `action_list`
- [ ] 4.3 Rename the `option_actions` key when an option is renamed and remove it when the option is removed (next to the `roll.options` handling in `removeOption`); verify by reading `addOption`/`removeOption` against the spec scenario "Removing an option"
- [ ] 4.4 Make sure saving an NPC keeps `option_actions` that the form didn't touch; verify by reading `EditNpc.vue`'s save and copy paths

## 5. Documentation and specs

- [ ] 5.1 Describe options with their own actions in the NPC actions documentation (the options popover in `Actions.vue` and the docs page on NPC actions); verify the text names the Own actions switch as the form shows it
- [ ] 5.2 Run `openspec validate expand-action-options` and verify it passes

## Workflow follow-up

- Harm tests the form, rolling Breath Weapons with Sleep Breath and Gore with Charge in the tracker.
- HK API, its own step: the monster action parser skill writes `options` and `option_actions` for "uses one of the following" and for 5.5e charge attacks, with benchmark cases; then the `monsters_v2` backfill.
- Archive this change once implemented (`/opsx:archive`).
