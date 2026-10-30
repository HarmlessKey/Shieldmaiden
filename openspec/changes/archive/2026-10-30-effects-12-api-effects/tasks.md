## 1. Fetch SRD effects and conditions from the API

- [x] 1.1 `src/services/api/effects.js` (`getEffects(edition)`) and the `api_effects` store module (`src/store/modules/content/effects.js`, registered in `src/store/index.js`) per design 3. Verify with a `check-api-effects-store` scratchpad check on a mocked service. It checks:
  - parallel calls share one request
  - the request goes to `/v2/effects/<edition>`
  - the split on `is_condition`
  - `_id`, `is_condition`, the conditions' `edition` and `"generic"` are dropped
  - a failure logs, returns empty lists and retries on the next call
  - `srd_loaded`
- [x] 1.2 `effectFunctions.js` (design 1, 2): remove the imports of the three data files, add `registerSrdDefinitions`, and have `getSrdDefinitions` / `findSrdDefinition` read the registered lists. `isSrdCondition` uses `srd_condition_urls` in `effectsConstants.js`. The store module registers its state. Verify:
  - `npm run lint`
  - a scratchpad check registering the saved API data, where `findSrdDefinition("5e", "concentration")` is the 5e one, `burning` isn't found in 5e, and `prone` is the edition's condition
  - an empty registry gives no definitions while `isSrdCondition("srd", "prone")` stays true
- [x] 1.3 Who waits (design 4): a client-only boot file starting both fetches; `resolve_effect_definitions` and the live view's resolver await their edition. Verify:
  - `npm run lint`
  - a scratchpad check on the runEncounter mock: `resolve_effect_definitions` dispatches the fetch before resolving
  - with a failing fetch, SRD effects and conditions are unresolved with their stored names, and the encounter loads
- [x] 1.4 Remove `src/data/effects.js`, `src/data/5e/conditions.js` and `src/data/5.5e/conditions.js`, and any other import of them. Update the validation and constants scripts (design 6: `--api`, `--from`, normalizing, the fixed condition urls). Update the scratchpad checks that import the files to use the saved API data and `registerSrdDefinitions`. Verify that the following all pass:
  - `node scripts/validate-effects-data/validate.mjs`
  - `node scripts/validate-effects-data/check-constants.mjs`
  - both with `--from` on the saved responses
  - all scratchpad checks except the obsolete `check-action-info`

## 2. Search

- [x] 2.1 `matchesName` in `effectFunctions.js` (design 7). Verify with a scratchpad check: case, accents ("Énervation" for "enervation"), a part of the name, an empty needle
- [x] 2.2 A search field in both Effects drawers, without a mode and in conditions mode: it filters every group, hides empty ones and shows "No effects match". Conditions mode says when the conditions couldn't be loaded (`srd_loaded`). Verify `npm run lint`
- [x] 2.3 `EffectRefPicker`, `ReminderForm` and the custom effects list use `matchesName`. Verify `npm run lint`

## 3. Effects in the bonus drawers

- [x] 3.1 `effectValues` and `effectChoicesFor` in `effectFunctions.js` (design 8). Verify with a scratchpad check over the saved API data and a few custom effects:
  - in 5.5e, the effects for `ac` are exactly Armor Class Bonus, Armor Class Minimum, Mage Armor, Haste, Slow and Warding Bond, the same set as the API's `sub_type=ac` without conditions
  - `max_hp` gives Hit Point Maximum Bonus and Reduction
  - Bless and Bane give `attack` and the saves, Skill Bonus every skill
  - Reaction Used gives `[]`
  - a custom `max_hp` bonus of 10 gives `max_hp`
  - the Dexterity drawer's values preset `{ ability: "dexterity" }`, and the roll bonuses drawer's values preset nothing
- [x] 3.2 Move the encounter Effects drawer's apply and Concentration code into `src/mixins/applyEffect.js`, and the campaign drawer's into `src/mixins/applyCampaignEffect.js` (design 10). Behavior unchanged. Verify `npm run lint` and that the step 7/8 drawer scratchpad checks still pass
- [x] 3.3 `ApplyEffect.vue` gets `presetChoices`. `src/components/bonuses/BonusEffects.vue` (design 9) does the listing (no conditions), the search above 8 entries, the list through `EffectList.vue` (the Effects drawers' list, taken out of the encounter drawer and used by both Effects drawers), `disabled` with a message, and emits `apply`. Verify `npm run lint`
- [x] 3.4 The tracker's `StatBonuses.vue`: `BonusEffects` for its values, with the encounter's casters, applied to its entity through `applyEffect`. Verify `npm run lint`
- [x] 3.5 The campaign drawers, through `applyCampaignEffect` with the campaign's players as casters. Verify `npm run lint`. The drawers:
  - `campaign/Bonuses.vue` (AC)
  - `EditPlayer.vue` (AC, max HP)
  - `party/health.vue` (max HP, to each selected player; disabled without any)

## 4. Documentation and plan

- [x] 4.1 `src/docs/effects.md`: SRD effects and conditions come from the API, the search fields, and the effects in the bonus drawers (which effects, applying with a caster). Verify every label it names matches the screens
- [x] 4.2 `.planning/effects-implementation-plan.md`: an "As built" note on step 12, and steps 11a/11b marked as done in the API project. Verify it matches the spec

## 4b. Conditions on v2 (added after testing)

- [x] 4b.1 `src/services/api/conditions.js` reads `/v2/conditions/{5e|5.5e}` and `/v2/conditions/{edition}/{url}` (design 11). Verify with a scratchpad check that calls the service against the API: the list with `name`, `skip`, `limit`, `sort` and `fields`, one condition, and a 404 for an unknown url
- [x] 4b.2 `components/compendium/Condition.vue` shows the condition through `EffectDetails`; the `api_conditions` meta description from `description`; the condition page's icon `hki-<url>`. Verify `npm run lint`
- [x] 4b.3 Nothing in `src` reads the old `/conditions` path any more; `src/docs/effects.md` says the compendium reads v2. Verify by searching `src`
- [x] 4b.4 Manual test by the user: the conditions compendium in both editions (search, paging, a condition's page, Exhaustion), the campaign resources compendium, and an NPC's condition immunities

## 5. Verification

- [x] 5.1 `npm run lint`, `openspec validate effects-12-api-effects --strict`, both validation scripts against the API, and all scratchpad checks (except `check-action-info`) pass
- [x] 5.2 Manual test by the user (no dev server or browser by Claude):
  - start an encounter and see SRD effects and conditions resolve and list
  - search in the Effects drawer, conditions mode and the effect form
  - apply Armor Class Bonus from the AC drawer, and Haste from it with a caster and Concentration
  - apply Hit Point Maximum Bonus from Group Health
  - optionally, block `api.harmlesskey.com` and start an encounter (there is no local fallback): it loads; effects already applied to creatures show their stored name, and conditions keep their icon (`srd_condition_urls`); the drawers list no SRD effects, conditions mode says the conditions couldn't be loaded
