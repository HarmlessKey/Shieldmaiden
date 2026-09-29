# Campaign Compendium Resource — Edition Support

## Goal

`src/components/campaign/resources/Compendium.vue` (the in-app compendium search: monsters,
items, spells, conditions) doesn't filter by edition at all today — it always hits the 5e
(2014) API endpoints. It's used in two places with different needs:

1. **Inside a campaign** (`campaign/resources/index.vue`, itself used by `RunCampaign.vue`
   and the campaign header drawer `components/drawers/Compendium.vue` → wait, see below):
   should search/show content for that campaign's `edition`, no user control needed (matches
   the existing pattern for `CheatSheet.vue`, which already takes an `edition` prop from this
   same parent).
2. **Standalone, from the app header** (`components/header/index.vue` opens
   `components/drawers/Compendium.vue`, which renders `campaign/resources/Compendium.vue`
   directly with no campaign context): needs a user-facing 5e/5.5e toggle. The choice made
   here should be remembered in the Vuex store, and should be updated automatically whenever
   the user visits a campaign (so the drawer reflects "the edition I was last working in").

This is the piece of Phase 4 in `dnd-5.5e-support.md` ("the campaign compendium resource...:
initialize the edition filter from the campaign's edition setting") plus the header-drawer
toggle/store requirement, which that spec didn't cover.

## Current state (verified in code)

- `campaign/resources/Compendium.vue`: four search tabs (monsters/items/spells/conditions),
  each calling `fetch_monsters` / `fetch_api_items` / `fetch_api_spells` / `fetch_conditions`
  with only `{ query: { search } }` — no `edition`. Selecting a result renders one of
  `compendium/{Monster,Spell,Condition,Item}.vue` with just `:id`.
- `compendium/Monster.vue` and `compendium/Spell.vue` already accept an `edition` **prop**
  (used when fetching by `:id`; no prop ⇒ `undefined` ⇒ services default to the 5e path).
- `compendium/Item.vue` and `compendium/Condition.vue` do **not** accept an `edition` prop —
  they only have an internal `edition` **computed** that reads `$route.params.edition`
  (`"5.5e"` or else `"5e"`). Fine for their standalone routed views (which pass `:data`, not
  `:id`, so this only feeds a `ReportIssue` fallback), but means passing an edition from
  `Compendium.vue` would currently be silently ignored for items/conditions.
- `campaign/resources/index.vue` already receives a `campaign` prop and passes
  `:edition="campaign.edition || default_edition"` to `CheatSheet`, but calls `<Compendium />`
  with no edition — the prop plumbing stops one component short.
- The API services (`monsters.js`, `items.js`, `spells.js`, `conditions.js`) all take the same
  `edition` param shape: `undefined`/`"5e"` → the 2014 (root) path, `"5.5e"` → the `.../5.5e`
  path. Matches the `apiEdition` translation already used in `CopyContent.vue` and
  `encounters/Entities.vue`: `edition === "5.5e" ? "5.5e" : undefined`.
- No Vuex state exists yet for a standalone/global "which edition am I browsing" preference.
  `store/modules/general.js` (not namespaced — same module `theme`, `side_collapsed` etc. live
  in) is the natural home; `RunCampaign.vue` already dispatches root-level actions from here
  (`setDrawer`) alongside its namespaced `campaigns/*` ones.
- `RunCampaign.vue` `mounted()` fetches the campaign and (for campaigns predating edition
  support) prompts once and persists the answer via `set_campaign_prop`. This is the one place
  "visiting a campaign" resolves an edition value.
- Known pre-existing gap (from `dnd-5.5e-support.md` Phase 3): the HK API may still have no
  5.5e condition content, so a 5.5e condition search can legitimately return empty. Not
  something to work around here — same as the encounter condition drawer.

## Design decisions

1. **New prop `edition` on `Compendium.vue`.** When passed (campaign context), it's a fixed
   filter — no toggle shown, matches `CheatSheet`'s existing `edition` prop pattern exactly.
2. **New root-level Vuex state `compendium_edition`** in `store/modules/general.js`, default
   `default_edition`. Getter `compendium_edition`, action `set_compendium_edition(edition)`,
   mutation `SET_COMPENDIUM_EDITION`. Session-only (no localStorage/user-settings
   persistence) — matches the scope of "kept in a store", nothing in the request asks for
   cross-session persistence, and it gets re-seeded on every campaign visit anyway (see next
   point).
3. **When `edition` prop is absent** (header-drawer usage), `Compendium.vue` reads/writes
   `compendium_edition` from the store directly and renders a `q-btn-toggle` (same
   `editionOptions` label-stripping map `CopyContent.vue`/`Entities.vue` already use) so the
   user can flip between 5e/5.5e.
4. **`RunCampaign.vue` updates the store on every campaign visit**: once the campaign is
   loaded in `mounted()`, dispatch `set_compendium_edition(campaign.edition || default_edition)`
   (and again from `setEdition()`, the legacy-campaign prompt handler, so the store stays in
   sync the moment the user answers it). This is a plain root dispatch, no new wiring needed.
5. **Effective edition computed as `this.edition || this.compendium_edition`** inside
   `Compendium.vue` — covers both the fixed-prop and store-driven cases with one code path for
   the actual API calls and for the child detail components.
6. **Changing the effective edition resets the current search** (clear `show`/`searchResults`/
   `noResult`, re-run `searchType()` if a query is active) — same treatment
   `CopyContent.vue` gives edition/resource changes, since a stale monster id from the other
   edition would otherwise dead-end into a 404 when clicked.
7. **Fix required in `compendium/Item.vue` / `compendium/Condition.vue`**: add an `edition`
   prop to both (currently only `Monster.vue`/`Spell.vue` have one), read through a new
   `resolvedEdition` computed (`this.edition || <existing route-based fallback>`) rather than
   replacing the `edition` computed outright — keeps the standalone routed views (which pass
   `:data`, no `:id`/`:edition`, and rely on the route-based fallback for their `ReportIssue`
   edition) working unchanged, while letting `Compendium.vue` (which passes `:id` + `:edition`)
   actually get the right record.

## Implementation

### `src/store/modules/general.js`
- Import `default_edition` from `src/utils/generalConstants`.
- State: `compendium_edition: default_edition`.
- Getter: `compendium_edition: (state) => state.compendium_edition`.
- Action: `set_compendium_edition({ commit }, edition) { commit("SET_COMPENDIUM_EDITION", edition); }`.
- Mutation: `SET_COMPENDIUM_EDITION(state, payload) { Vue.set(state, "compendium_edition", payload); }`.

### `src/components/compendium/Item.vue`, `src/components/compendium/Condition.vue`
- Add prop `edition: { type: String, default: undefined }`.
- Rename the existing route-based computed to `resolvedEdition`, falling back to the prop
  first: `resolvedEdition() { return this.edition || (this.$route.params.edition === "5.5e" ? "5.5e" : "5e"); }`.
- Use `this.resolvedEdition` everywhere the old `this.edition` was used internally (the
  `fetch_api_item`/`fetch_condition` call in `beforeMount`, and the template's
  `item.edition || resolvedEdition` / `condition` exhaustion-levels lookup).

### `src/components/campaign/resources/index.vue`
- Pass `:edition="campaign.edition || default_edition"` to `<Compendium />` (mirrors the
  existing `CheatSheet` binding two lines above it).

### `src/components/campaign/resources/Compendium.vue`
- Import `editions`, `default_edition` from `src/utils/generalConstants`; `mapGetters`,
  `mapActions` already imported (extend the existing `mapActions` import, add root
  `mapGetters`/a second `mapActions` for `compendium_edition`/`set_compendium_edition`).
- Prop `edition: { type: String, default: null }`.
- Computed:
  - `activeEdition()`: `this.edition || this.compendium_edition`.
  - `apiEdition()`: `this.activeEdition === "5.5e" ? "5.5e" : undefined`.
  - `showEditionToggle()`: `!this.edition`.
  - `editionOptions()`: `editions.map((e) => ({ label: e.label.replace("D&D ", ""), value: e.value }))`.
  - `editionModel` (get/set): reads `compendium_edition`, setter dispatches
    `set_compendium_edition`.
- Template: `q-btn-toggle` (`v-model="editionModel"`, `:options="editionOptions"`,
  `v-if="current && showEditionToggle"`) placed after the search input, before results —
  same position/style as `CopyContent.vue`'s.
- `searchType()`: pass `edition: this.apiEdition` into every `fetch_*` call.
- New `watch: { activeEdition() {...} }`: clear `show`/`searchResults`/`noResult`; if
  `this.search` is non-empty, re-run `searchType()`.
- Pass `:edition="activeEdition"` to `ViewMonster`/`Spell`/`Condition`/`Item` alongside the
  existing `:id="show"`.

## Out of scope

- Persisting `compendium_edition` beyond the current session (no localStorage/user-settings
  write) — visiting a campaign already re-seeds it, and nothing in the request asks for it to
  survive a reload with no campaign visited.
- Edition badges on `Compendium.vue` search result rows (not requested; `CopyContent.vue` has
  this for its own reasons — a copy/paste destination where knowing the source edition before
  committing matters more than it does for read-only browsing here).
- Any change to `compendium/Monster.vue` / `compendium/Spell.vue` — already accept the prop
  this feature needs.
- The routed standalone compendium (`views/Compendium/*`) — already edition-aware per Phase 4,
  untouched here.
