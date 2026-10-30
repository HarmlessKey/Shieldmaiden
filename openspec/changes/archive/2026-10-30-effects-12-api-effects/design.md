## Context

**The SRD definitions in the app today.** They live in local files:
- `src/data/effects.js`: one effect list, with `edition` on the entries that follow one
  edition
- `src/data/5e/conditions.js` and `src/data/5.5e/conditions.js`: the conditions

`effectFunctions.js` imports them into `SRD_DEFINITIONS` and builds `SRD_CONDITION_URLS`
(used by `isSrdCondition`) from the condition lists. Two synchronous helpers read them, about
25 call sites in total:
- `getSrdDefinitions(edition)`, which lists them
- `findSrdDefinition(edition, url)`, which resolves one

The callers are the tracker store (`resolve_effect_definitions`, plus fixed lookups of
`concentration`, `reaction-used` and `surprised`), the Effects drawers, the forms' pickers
(`fieldControls.js`), `ReminderForm`, `hk-single-roll`, the campaign Players and
PlayerEffects screens, and the live view (`trackCampaign/live`).

**The HK API now serves the same data on v2 paths**, checked on 2026-10-28. The unversioned
`/effects` paths return 404.
- `/v2/effects/5e` (81 entries) and `/v2/effects/5.5e` (85): that edition's effects, the
  shared ones (`edition: "generic"`) and its 15 conditions (`is_condition: true`,
  `edition: "5e"` or `"5.5e"`).
- `/v2/effects/generic`: only the shared effects.
- `/v2/conditions/{5e|5.5e}`: the 15 conditions alone, equal to those in the effects list.

The effects equal `src/data/effects.js` and the conditions equal the local condition files,
field for field. The only additions are `_id`, `is_condition`, and the conditions'
`edition`.

A list call takes `skip`, `limit`, `fields`, `name`, `is_condition`, `type` and `sub_type`:
- `sub_type` matches effects with any sub-effect of that sub-type
- repeating it ORs the values: `sub_type=ac&sub_type=max_hp`
- `type` and `sub_type` together match any sub-effects, not necessarily the same one

**The old `/conditions` endpoints.** `api_conditions` read them for the compendium,
`hk-condition-select` and `npcs/Defenses.vue`: the icon path, the short `condition` text and
the `effects` rules list. v2 has `/v2/conditions/{5e|5.5e}` with the same list parameters
(`skip`, `limit`, `fields`, `sort`, `name`) and `/v2/conditions/{edition}/{url}` for one
(404 when unknown), but its conditions are effect definitions: `description` and
`sub_effects`, no icon, short text or rules list. The app's other API services (spells,
monsters, items) aren't on v2.

**API content in the app** follows one pattern: an axios service in `src/services/api/` and a
Vuex module in `src/store/modules/content/` with services, caches and `fetch_*` actions.

**The bonus drawers.** All four use the shared `BonusAddForm` and `ManualBonusRows`:
- `StatBonuses.vue`, the tracker, with `data: { entityKey, stat | stats }` over
  `BONUS_VALUES`
- `campaign/Bonuses.vue`, AC
- `EditPlayer.vue`, AC and max HP
- `party/health.vue`, max HP for the selected players

The Effects drawers apply through `ApplyEffect.vue`, with casters, a default caster and the
caster's Concentration, plus their own apply method:
- the encounter drawer: `concentrateOn`, `buildEffectInstance` and `apply_effect`
- the campaign drawer: `campaigns/apply_campaign_effect`

## Goals / Non-Goals

**Goals:**
- One source for SRD effects and conditions, the API, with lookups that stay synchronous for
  their callers.
- Nothing breaks when the API is slow or down: it degrades to unresolved SRD definitions,
  and conditions keep their icon.
- Pure helpers for the search and for the effects a value is changed by, tested in the
  scratchpad.
- The bonus drawers apply through the same code paths as the Effects drawers.

**Non-Goals:**
- Caching across sessions (localStorage). The data is small and fetched once per session.
- Server-side rendering of SRD definitions. The boot fetch runs in the browser only.
- Changes to the API.

## Decisions

**1. A reactive registry in `effectFunctions.js` fed by the store.**
The `api_effects` module keeps this in its state:

```
lists: { "5e": null | { conditions, effects }, "5.5e": … }
```

When the module is created, it registers that reactive state object with
`registerSrdDefinitions(state.lists)` in `effectFunctions.js`.
- `getSrdDefinitions` and `findSrdDefinition` read `source[edition] || { conditions: [],
  effects: [] }`.
- Inside a component's computed property or the tracker's getters, that read is a reactive
  dependency, so the lists update by themselves when the fetch commits.
- In plain node (the scratchpad checks), a test calls `registerSrdDefinitions(...)` with
  saved API data.
- *Alternative:* moving every lookup into Vuex getters. Rejected: it would touch the 25 call
  sites and the pure functions (`resolveDefinition`, `effectFunctions` internals) that get
  definitions through `findSrdDefinition`.
- *Alternative:* `Vue.observable` inside `effectFunctions.js`. Rejected: it would make a pure
  utility own state. The store owns it, and the util only reads.

**2. `isSrdCondition` from a fixed list.**
`effectsConstants.js` gets `srd_condition_urls`, the 15 urls. `isSrdCondition` uses it
instead of the loaded lists. Condition chips, icons and condition-only filters then work
before and without the fetch. The validator checks the API's conditions against the same
list.

**3. Fetching, one request per edition.**
`services/api/effects.js` has `getEffects(edition)`, which calls
`GET /v2/effects/{5e|5.5e}?limit=500&fields=ALL`. The `/v2` prefix is a constant in that
service, so the other services' paths don't change. The list is one page; the response has
`meta.count` to assert that.

The action `api_effects/fetch_srd_definitions({ edition })`:
- keeps one promise per edition, so parallel callers share one request
- splits the results on `is_condition` into `conditions` and `effects`
- normalizes each entry: drops `_id` and `is_condition`, drops `edition` on conditions and
  when it is `"generic"`
- commits `{ conditions, effects }` on success, and returns it
- on failure, logs the error, clears the promise so the next call retries, and returns empty
  lists

A getter `srd_loaded(edition)` tells whether the lists arrived, so conditions mode can say
they couldn't be loaded.

**4. Who waits.**
- **A client-only boot file** (`src/boot/api-effects.js`, `server: false`) dispatches the
  fetch for both editions without awaiting it.
- **The tracker:** `resolve_effect_definitions` awaits the fetch for `state.edition` before
  it resolves. That covers encounter start, traits and every apply.
- **The live view:** its resolve method awaits it for the campaign edition.
- **Every other screen** relies on the boot fetch and the reactive registry, pickers
  included.
- **An encounter that started while the API was down** keeps its SRD definitions unresolved
  for that run. The tracker caches resolved definitions per encounter, as before. Reloading
  the encounter retries.

**5. Fixed lookups keep their fallbacks.**
`findSrdDefinition(edition, "concentration") || { name: "Concentration" }` and the like
already exist. With the API down, Concentration, Reaction Used and Surprised still apply with
their name, as unresolved instances.

**6. Validation scripts.**
`validate.mjs` and `check-constants.mjs` read the data in one of two ways:
- by default, from `--api <root>` (default `https://api.harmlesskey.com`, overridable by
  `VUE_APP_HK_API_ROOT`): `/v2/effects/5e` and `/v2/effects/5.5e`
- with `--from <dir>`, from `5e.json` and `5.5e.json` (raw API responses) in that directory

They normalize the data as the store does, then check:
- each edition's set
- the conditions against `srd_condition_urls`
- that an effect present in both editions without `edition` is identical in both

A fetch error is a problem line, and the scripts exit 1. `--data` and the per-file wording
go away. The scratchpad keeps a saved copy of the API responses for the node checks.

**7. Search: `matchesName(name, needle)` in `effectFunctions.js`.**
It lowercases both strings and strips diacritics (`normalize("NFD")` and removing
`\p{Diacritic}`), then tests `includes`. The lists use it:
- **The Effects drawers (both modes):** a search input above the groups that filters each
  group, hides empty groups and shows "No effects match".
- **`EffectRefPicker`:** its existing `@filter` uses `matchesName`.
- **`ReminderForm`:** its existing `effectFilter` uses `matchesName`.
- **The custom effects list:** `q-table` gets a `filter-method` that uses `matchesName` on
  the name.
- **The bonus drawers' effect list.**

**8. Which effects a value is changed by: `effectValues(definition)`.**
It mirrors the API's `sub_type` filter, but runs in the app over the fetched lists and the
custom effects:
- It returns the `BONUS_VALUES` keys that any sub-effect touches, through its sub-types (spec
  mapping), its `abilities`/`skills`, or a choice. A skill choice counts for every `skill_*`
  key, and an ability choice for every `<ability>`, `save_*` or `check_*` key of its
  sub-type.
- It looks only at the definition's own `sub_effects`. Nested lists (`save.success_effects`,
  `duration.on_expire`) and `includes` don't count.
- SRD conditions are left out by the caller. Custom effects are included.
- *Alternative:* the API's `sub_type` query per drawer. Rejected (user decision at proposal):
  it costs a request per drawer, misses custom effects, and the app already has the full
  lists.

`effectChoicesFor(definition, values)` returns the choices the drawer's values fix. A skill
or ability choice is fixed only when the values name exactly one skill or ability: the
Dexterity drawer (`dexterity`, `check_dexterity`, `save_dexterity`) gives
`{ ability: "dexterity" }`. The roll bonuses drawer gives `{}`, so the choice is asked.

**9. One `BonusEffects.vue` component for the four drawers.**
`src/components/bonuses/BonusEffects.vue` takes:
- `values`: the drawer's `BONUS_VALUES`
- `edition`
- `casters`: the options
- `defaultCaster`
- `casterConcentration`: a function
- `disabled`, with a message, for Group Health without selected players

It lists the SRD effects (not conditions) and custom effects whose `effectValues` meet
`values`, sorted by name, with a search when there are more than 8. The list itself is
`EffectList.vue` (`src/components/drawers/encounter/effects/`), taken out of the encounter
Effects drawer and used by both Effects drawers too, so the lists are the same everywhere:
the expanding details, the apply popover with `ApplyEffect`, shift+click to apply until
removed, and Remove with the presence dot where the drawer has targets. It takes the
groups and shows a tab for each when there are several (Effects, Custom; Conditions too in
the campaign drawer), with its count. A tab shows 10 entries per page with pagination, back
to the first page when the search or the tab changes. A tab hidden by a search stays
selected for when it shows again.
- `ApplyEffect` gets an optional `presetChoices` prop (from `effectChoicesFor`): those
  choices are filled in and not asked.
- Each effect is listed once.

`BonusEffects` emits `apply({ entry, application })`, and each drawer applies through its
context's existing path.

**10. Shared apply code.**
The encounter Effects drawer's `apply(entry, application)` and its Concentration code
(`concentrateOn`, `casterConcentration`, `casters`) move into a mixin,
`src/mixins/applyEffect.js`, that takes the target keys. Effects.vue and StatBonuses.vue both
use it. On the campaign side, the campaign Effects drawer's apply around
`apply_campaign_effect` moves into `src/mixins/applyCampaignEffect.js`. The campaign AC
drawer, the Edit drawer and Group Health use it, the last once per selected player. The
behavior stays the same, so the existing scratchpad checks for those drawers should keep
passing.

**11. Conditions on v2 (added after testing, user decision).**
`conditionServices` reads `/v2/conditions/{5e|5.5e}` and `/v2/conditions/{edition}/{url}`.
The calls, parameters and response shape (`meta.count`, `results`) stay, so the
`api_conditions` module and its callers keep working:
- the compendium list and the campaign resources compendium (paged, searched, sorted)
- `hk-condition-select` and `npcs/Defenses.vue` (`fetch_all_conditions`, the urls only)
- the admin XML and prerender paths (urls only)

What changes is the condition itself:
- `components/compendium/Condition.vue` shows it through `EffectDetails`: the description,
  each sub-effect described (`describeSubEffect`), and the Exhaustion table. The same text
  as in the Effects drawer.
- The page meta description is taken from `description` instead of the `effects` list.
- The condition page's header icon is `hki-<url>` instead of the lowercased name.
- *Alternative:* `hk-condition-select` and `Defenses` read the `api_effects` lists already
  fetched. Rejected for now: they render on the server too, where the boot fetch doesn't
  run, and the paged module call works on v2 unchanged.

## Risks / Trade-offs

- **[Risk] The API is down or slow at encounter start.**
  → The encounter waits for one request at most, then falls back to unresolved SRD
  definitions with a logged error (spec). Conditions keep their icon and name, but not
  their mechanics. That is the cost of API-only (user decision).
- **[Risk] Hydration.** The server renders without SRD definitions. The client renders
  without them too until the fetch commits, so there is no mismatch. Lists fill in after
  hydration.
- **[Risk] Removing the local files removes the reference copy of the data.**
  → The API project owns it now. The validator checks the live data or saved responses.
- **[Trade-off] Scratchpad checks that imported the local files** need the saved API data
  and `registerSrdDefinitions`. They are updated in the tasks.
- **[Trade-off] Effects that touch a value list everything they do.** Haste in the AC drawer
  applies all of Haste. The drawer is a shortcut to the regular apply, not a bonus editor.

## Migration Plan

- Deploy the app after the API serves `/v2/effects/*` with conditions. It already does.
- No data migration: instances keep `source: "srd"` and their `source_key`.
- Rollback: restore the three data files and the imports from git.
- After this, the app no longer reads the old `/conditions` endpoints. The API can retire
  them once no deployed app version uses them.
