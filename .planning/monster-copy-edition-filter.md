# Monster & Spell Copy — Edition Filter

## Goal

When copying an SRD monster or spell (creating/copying an NPC or spell, adding a spell to
an NPC, or adding an NPC to a live encounter), let the user filter the SRD search by
edition (5e / 5.5e). Contexts that already have an edition of their own (a campaign, an
NPC being edited) should default the filter to that edition, but the user can still
change it.

This is the remaining piece of Phase 4 ("Compendium browsing & encounter pickers") from
`dnd-5.5e-support.md` for the one picker that spec didn't cover: `CopyContent.vue`.

## Current state (verified in code)

- **`src/components/CopyContent.vue`** is the shared "copy from Custom / SRD / Homebrew"
  picker (monster, item, spell). Its SRD tab calls `fetch_monsters` /
  `fetch_api_items` / `fetch_api_spells` with no `edition` — it always hits the 5e (2014)
  endpoint. It has **no edition control today**.
- It's used in these monster/spell-copy contexts:
  - **`src/views/UserContent/Npcs/EditNpc.vue`** (both the toolbar "Copy" dialog and the
    "Generate/Copy/Create from scratch" create dialog) — no campaign context, standalone
    NPC creation/monster-creator tool. `type="monster"`.
  - **`src/components/drawers/encounter/AddNpc.vue`** — the "Add entity" drawer used to add
    an NPC to a **running** encounter (Copy NPC dialog). This has campaign context
    (`campaignId`, and already calls `get_campaign` in `mounted()`) but the result is only
    used locally to build the player list — it isn't kept on `this`, and isn't passed to
    `CopyContent`. `type="monster"`.
  - **`src/views/UserContent/Spells/EditSpell.vue`** (same "Copy" dialog + create-dialog
    pattern as `EditNpc.vue`) — no campaign or NPC context. `type="spell"`.
  - **`src/components/npcs/SpellCasting.vue`** — the "Add spells"/"Add innate spells"
    picker inside the NPC editor. This has NPC context: the NPC being edited already has
    its own `npc.edition` (set via `hk-edition-select` in `npcs/BasicInfo.vue`, and already
    read elsewhere in this file to branch innate-spell cast-level UI). `type="spell"`.
- **This is distinct from `src/components/encounters/Entities.vue`**, the "build encounter
  roster" screen (adding NPCs to an encounter *before* running it). That component does
  **not** use `CopyContent` — it has its own SRD table/pagination and **already implements
  edition filtering end-to-end**: `edition` data initialized from `campaign.edition ||
  default_edition`, a `q-btn-toggle` (`editionOptions`) in its filter dialog, an `apiEdition`
  computed (`edition === "5.5e" ? "5.5e" : undefined`) passed to `fetch_monsters`/
  `fetch_monster`, and a watcher that re-searches on edition change. **No changes needed
  here** — it's the reference pattern for everything below, and confirms the user's
  "I believe this uses the same component" is true for the live-encounter drawer but not
  for the pre-encounter build screen.
- The plumbing this feature needs already exists end-to-end and just isn't wired into
  `CopyContent`:
  - `editions` / `default_edition` in `src/utils/generalConstants.js` (`"5e"` / `"5.5e"`).
  - `api_monsters/fetch_monsters`, `api_monsters/fetch_monster`, and the equivalent
    `api_items`/`api_spells` actions all already accept `edition` and route to the `5.5e/`
    path prefix when it's `"5.5e"` (`src/services/api/monsters.js` etc.).
  - `campaign.edition` already exists and is populated for every campaign (schema +
    create/edit forms + the one-time prompt in `RunCampaign.vue` for legacy campaigns).
  - The NPC schema already has an optional `edition` field, and `BasicInfo.vue` already
    renders `hk-edition-select` for it — so a copied SRD monster's `edition` will already
    show up correctly in the NPC editor once `CopyContent`'s result carries it (the API
    monster payload includes `edition`, and `CopyContent.copy()`'s cleanup only strips
    `_id`/`key`/`url`/`meta`/`release_date`, so it survives the copy untouched).
  - Same story for spells: the spell schema already has an optional `edition` field, and
    `spells/BasicInfo.vue` already renders `hk-edition-select` for it — a copied SRD
    spell's `edition` survives the copy the same way.
- No other picker fetches `fetch_api_spells` — `EditSpell.vue` and `SpellCasting.vue` (via
  `CopyContent`) are the only two spell-copy paths. (`views/Compendium/Spells.vue` and
  `campaign/resources/Compendium.vue` are browse-only views, not copy flows — out of scope,
  same as `Entities.vue`.)

## Scope

Monster and spell copying, matching the request. `hk-filter`/`CopyContent` also handle
item copying, and the underlying service already supports `edition` there too, but
there's no requirement driving it yet — leave item untouched.

## Design decisions

1. **Edition control lives in `CopyContent.vue` itself**, not inside `hk-filter.vue`.
   Edition changes which API path is hit (`/monsters` vs `/monsters/5.5e`), not a query
   filter merged into the request — same reason `Entities.vue` keeps its edition toggle
   next to `hk-filter`, not inside it.
2. **Always visible on the SRD tab** (not tucked behind the advanced-filter toggle) —
   mirrors `Entities.vue`, where edition is a primary, coarse filter shown up front.
3. **Control is a `q-btn-toggle`**, not `hk-edition-select` — matches `Entities.vue`'s
   `editionOptions` (`editions.map(e => ({ label: e.label.replace("D&D ", ""), value: e.value }))`,
   i.e. "5e (2014)" / "5.5e (2024)"). `hk-edition-select` remains the right control for a
   single-field form (NPC/spell `BasicInfo.vue`), but a toggle reads better as a coarse
   pre-search filter people flip between, consistent with the existing `custom_content`
   resource toggle right above it.
4. **New prop `initialEdition`** on `CopyContent` (default: `default_edition`, i.e. `"5e"`).
   Callers with an edition of their own (a campaign, or the NPC being edited in
   `SpellCasting.vue`) pass it in; callers without one (standalone NPC/spell editors) get
   the global default. The prop only seeds initial state — the user can always change it,
   per the parent spec's "default filter, never a hard restriction" rule.
5. **Changing edition resets the search** (query stays, but `page`/`totalPages`/
   `searchResults` reset and `fetchApiContent()` re-runs) — same treatment
   `changeCopyResource` already gives resource switches.
6. `type === 'monster'` or `type === 'spell'` shows the edition control (see Scope); `item`
   does not.
7. **Each result row shows its own edition** as a small badge next to the name
   (`result.edition`, e.g. "5.5e"), so it's unambiguous which version is about to be
   copied — not just monster/spell-SRD-specific, shown whenever a result carries the
   field (custom NPCs/spells can have one too, from a prior SRD copy or manual edit).

## Implementation

### `src/components/CopyContent.vue`

- Add prop `initialEdition: { type: String, default: default_edition }` (import
  `editions`, `default_edition` from `src/utils/generalConstants`).
- Add `data.edition`, initialized from `initialEdition`.
- Add `editionOptions` computed (the `Entities.vue` label-stripping map) and `apiEdition`
  computed, same translation `Entities.vue` uses: `this.edition === "5.5e" ? "5.5e" : undefined`.
- Template: when `(type === 'monster' || type === 'spell') && copy_resource === 'srd'`,
  render a `q-btn-toggle` (`v-model="edition"`, `:options="editionOptions"`) above the
  search input, styled like the existing resource `q-btn-toggle`.
- `fetchApiContent()`: pass `edition: this.apiEdition` into the `fetch_monsters` /
  `fetch_api_spells` call (alongside the existing `pageNumber`/`pageSize`/`query`).
- Watch `edition`: when `copy_resource === 'srd'`, reset `page`/`totalPages`/
  `searchResults`/`noResult` and re-run `fetchApiContent()` (reuse the same reset block
  from `changeCopyResource`, factor into a small helper if that reads cleaner).
- Result row: add `<q-badge v-if="result.edition">{{ result.edition }}</q-badge>` next to
  the name, so custom/SRD/homebrew results all show which edition they are.
- **Bug fix found during implementation**: `copy()` fetched SRD results by ID with no
  edition (`fetch_monster(id)` / `fetch_api_spell(id)` / `fetch_api_item(id)`). Once the
  SRD search can return 5.5e results, clicking one to copy would still hit the 5e-only
  endpoint for the by-ID lookup and 404. Fixed by passing `{ id, edition: this.apiEdition }`
  to all three — they already accept that shape (`fetch_monster`'s JSDoc documents it).

### `src/components/drawers/encounter/AddNpc.vue`

- In `mounted()`, keep the fetched campaign on `this.campaign = campaign` (currently the
  `.then` callback only extracts `players`).
- Import `default_edition` from `src/utils/generalConstants`.
- Pass `:initial-edition="campaign.edition || default_edition"` to the `<CopyContent
  type="monster" ...>` in the Copy NPC dialog. In `demo` mode (no campaign fetched),
  `this.campaign` stays `{}`/undefined, so this falls back to `default_edition`.

### `src/components/npcs/SpellCasting.vue`

- Pass `:initial-edition="npc.edition || default_edition"` to the `<CopyContent
  type="spell" ...>` in the Add/Add innate spells dialog (import `default_edition` from
  `src/utils/generalConstants`). Since the NPC's own edition already drives other UI in
  this file (the cast-level popup, `is55e`), this only needs the one new prop binding.

### `src/views/UserContent/Npcs/EditNpc.vue` / `src/views/UserContent/Spells/EditSpell.vue`

- No changes — both `<CopyContent type="monster" />` / `<CopyContent type="spell" />`
  usages get the new edition select automatically, defaulting to `default_edition` (no
  campaign or NPC to prefill from).

## Out of scope

- Item edition filtering in `CopyContent` (the service already supports it; no current
  requirement).
- Any change to `src/components/encounters/Entities.vue` — already correct.
- Backfilling `edition` onto custom/homebrew NPCs or spells, or filtering the *Custom* tab
  by edition — this spec is SRD-only, matching the parent spec's Phase 4 scope
  (custom-content edition prefiltering was Phase 1/4 for NPC lists elsewhere, not this
  picker).
