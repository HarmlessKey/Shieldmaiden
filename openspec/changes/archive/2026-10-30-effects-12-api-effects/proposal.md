## Why

The HK API now serves the SRD effects and conditions on its v2 paths. The unversioned
`/effects` paths are gone.
- `/v2/effects/5e` and `/v2/effects/5.5e`: that edition's effects, the shared ones
  (`edition: "generic"`) and its 15 conditions (`is_condition: true`). That is 81 entries
  for 5e and 85 for 5.5e.
- `/v2/conditions/{edition}`: the same 15 conditions alone.

Checked on 2026-10-28, the effects equal the app's `src/data/effects.js` and the conditions
equal `src/data/5e|5.5e/conditions.js`, field for field. The only additions are `_id`,
`is_condition`, and `edition` on the conditions.

Step 12 of the [effects implementation plan](../../../.planning/effects-implementation-plan.md)
makes the app use them. It also adds two things to the lists that grow with it:
- a name search
- the effects that change a value, listed in its manual bonus drawer

## What Changes

- **SRD effects and conditions come from the HK API only (decided at proposal).**
  `src/data/effects.js` and `src/data/5e|5.5e/conditions.js` are removed.
  - **One store module** fetches `/v2/effects/{edition}`, one request per edition, and
    splits it into conditions (`is_condition`) and effects. It keeps them for the session.
  - **Lookups stay synchronous and become reactive.** `findSrdDefinition` and
    `getSrdDefinitions` read the fetched lists. Screens that list or resolve SRD
    definitions update when the lists arrive.
  - **The tracker and the player live view wait for the lists** of their edition before
    they resolve definitions. Every other screen asks for them and fills in when they
    arrive.
  - **When the API can't be reached, SRD effects and conditions are unresolved** and keep
    their stored name. A condition is still recognised as a condition by its `url`, from a
    fixed list of the 15 SRD condition urls, so it keeps its icon. The next screen that asks
    fetches again.
  - **The app's shape is kept:**
    - `edition: "generic"` is read as no edition
    - conditions drop their `edition`, since their list already belongs to one
    - `_id` and `is_condition` are dropped
  - **The compendium and the condition selects move to v2 too** (added after testing):
    `api_conditions` reads `/v2/conditions/{edition}` instead of the old `/conditions`. A
    condition page shows the description and its mechanics, described as in the Effects
    drawer (`EffectDetails`), with the Exhaustion table. The old icon path, short text and
    rules list aren't used: icons are the `hki-<url>` classes. The app's other API content
    (spells, monsters, items) keeps its paths.
- **The validation and constants checks** (`scripts/validate-effects-data`) read the SRD
  effects and conditions from the API, or from JSON files given on the command line.
- **A name search on every effect list.** It matches case- and accent-insensitively, and
  filters in the client over the fetched and custom lists. The lists are:
  - the encounter and campaign Effects drawers, conditions mode included
  - the effect pickers of the effect, NPC and spell forms
  - the reminder form's effect select
  - the custom effects list
- **Effects in the manual bonus drawers.** These drawers also list the effects that change
  their values, and apply them:
  - the tracker's bonuses drawer (every value it shows, decided at proposal)
  - the campaign's AC drawer
  - the player Edit drawer (AC, maximum HP)
  - Group Health (maximum HP, to the selected players)

  The listed effects are any SRD effect or custom effect with a sub-effect on one of the
  drawer's values (decided at proposal), like the API's `sub_type` filter: AC lists Armor
  Class Bonus, Armor Class Minimum, Mage Armor, Haste, Slow and Warding Bond. Conditions
  are left out. The filtering happens in the app over the fetched lists, so custom effects
  are included and no extra request is made. The list is the Effects drawers' list (details,
  apply popover, shift+click), and the effects are applied with the regular apply form. Its choices, duration (until removed by default), an optional caster and
  Concentration (decided at proposal) all work as in the Effects drawers. An applied effect
  then shows under the drawer's effect modifiers, not as a manual bonus.
- **Docs:** `src/docs/effects.md` covers where the SRD data comes from, the search and the
  effects in the bonus drawers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `effects-srd-data`: the SRD effects and conditions are the HK API's per edition, not files
  in the app. Their validation reads the API.
- `effects-runtime-resolution`: SRD definitions are fetched from the API. The tracker and the
  live view wait for them. Not reaching the API leaves them unresolved.
- `effects-drawer`: the SRD groups and the conditions come from the fetched lists, and effect
  lists have a name search.
- `effects-authoring`: the constants check reads the SRD data from the API.
- `effects-stat-modifiers`: the bonus drawers list and apply the effects that change their
  values.

## Impact

- **New files:**
  - `src/services/api/effects.js`
  - the `api_effects` store module (`src/store/modules/content/effects.js`), registered in
    `src/store/index.js`
  - a client-only boot file that starts the fetch
- **`src/utils/effectFunctions.js`:**
  - the SRD definitions come from a registered, reactive source instead of the imports
  - `isSrdCondition` uses a fixed list of the 15 condition urls (`effectsConstants.js`)
  - new helpers for the search and for the values an effect changes
- **Callers of `getSrdDefinitions` / `findSrdDefinition`:** unchanged where the lookup
  updates by itself. `resolve_effect_definitions` (runEncounter) and the live view
  (`trackCampaign/live`) await the fetch.
- **Removed:** `src/data/effects.js`, `src/data/5e/conditions.js`,
  `src/data/5.5e/conditions.js`.
- **Changed:** `scripts/validate-effects-data/validate.mjs` and `check-constants.mjs`.
- **Conditions on v2:** `src/services/api/conditions.js`, the `api_conditions` module's meta
  text, `components/compendium/Condition.vue` and the condition page's icon.
- **Search:**
  - the Effects drawers (encounter and campaign)
  - `EffectRefPicker.vue` / `fieldControls.js`
  - `ReminderForm.vue`
  - `views/UserContent/Effects/index.vue`
- **Bonus drawers:**
  - `drawers/encounter/StatBonuses.vue`
  - `drawers/campaign/Bonuses.vue`
  - `drawers/EditPlayer.vue`
  - `drawers/party/health.vue`
  - a shared component that lists and applies the effects
  - the apply logic shared with the Effects drawers
- **Unchanged:** the Firebase rules, the stored instance shape (`source: "srd"`,
  `source_key: <url>`) and the HK API. The app depends on the API being up for SRD
  mechanics.
