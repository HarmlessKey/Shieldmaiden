# Rules Compendium — 5.5e (2024) Content

## Goal

The Rules cheat sheet (Actions, Bonus Actions, Reactions, Movement, Environment) currently
shows only 2014 SRD 5.1 text, regardless of which edition a campaign or the compendium is
set to. Add a 2024 SRD 5.2.1 version of this content, structured identically to the 2014
version, so `/compendium/rules/5.5e` and in-campaign cheat sheets for 5.5e campaigns show
2024 rules text instead of 2014 text.

This is the deferred follow-up explicitly flagged in `dnd-5.5e-support.md` (Phase 5, line
160-162 and "Out of scope", line 187): *"Rules reference content in
`src/utils/generalConstants.js` (cover, light, etc.) and `views/Compendium/Rules.vue` is
2014 text — updating to dual-edition is optional, follow-up."* This spec is that follow-up.

## Current state

- All rules-cheat-sheet content lives in one flat array: `rules` in
  [generalConstants.js:263](../src/utils/generalConstants.js#L263), ~40 entries grouped by
  `type`: `action`, `bonus_action`, `reaction`, `movement`, `environment`. Each entry is
  `{ type, name, url, caption, description, src }` (`src` = PHB page reference, `description`
  is markdown).
- [CheatSheet.vue](../src/components/campaign/resources/CheatSheet.vue) renders this array
  (tabs by type, search, accordion). It has no edition awareness at all — same content for
  every campaign/route.
- Three consumers:
  - `views/Compendium/Rules.vue` (`compendium` prop, the list view) — already edition-aware for
    everything *except* the cheat sheet content itself: it reads `$route.params.edition`, shows
    an edition label/badge, links to the correct SRD PDF (5.1 vs 5.2), and links to
    "Show Rules for {other edition}". Only the `<CheatSheet compendium />` body ignores edition.
  - `views/Compendium/view/Rule.vue` (the single-rule detail view) — **has a latent bug for
    this plan**: `rule()` computed does `rules.find(rule => rule.url === this.id)` with no
    edition filter at all. Today that's harmless because `url` values are globally unique
    (only one edition's worth of entries exists). Once 2024 duplicates share the same `url`
    as their 2014 counterpart (design decision 4 below), `.find()` will always resolve to
    whichever entry comes first in the array — silently showing 2014 content on
    `/compendium/rules/5.5e/attack`. Must be fixed alongside the data change, not left as-is.
  - `components/campaign/resources/index.vue` → `<CheatSheet />` (no `compendium` prop) —
    the in-campaign "Cheat Sheet" tab. No edition context is threaded in today.
- **Routes already exist for both editions** — no router changes needed. `src/router/routes.js`
  (~line 1024-1074) already defines `CompendiumRules` (`/compendium/rules`) /
  `CompendiumRules5.5e` (`/compendium/rules/5.5e`) for the list, and `Rule` / `Rule5.5e` for the
  detail view (`/compendium/rules/:id` and `/compendium/rules/5.5e/:id`) — all four already
  point at the same two components (`Rules.vue`, `Rule.vue`) and pass `$route.params.edition`
  through, matching the pattern used for monsters/spells/items/conditions.
- Precedent to follow is the **API content pattern**, not `EXHAUSTION_LEVELS`: monsters,
  spells, items and conditions are one flat list where each record has an optional `edition`
  field — 2014 records simply have no `edition` prop, 2024 records have `edition: "5.5e"`
  (per `dnd-5.5e-support.md` Phase 0: *"edition field... Backfill all existing records with
  edition: '2014'"* — client-side the equivalent absent-vs-`"5.5e"` convention is already used
  e.g. `data.row.edition || default_edition` in `Overview.vue:173,248`). `rules` should match
  this exactly: one array, 2014 entries unchanged (no `edition` key), 2024 entries duplicated
  in with `edition: "5.5e"` added.
- Edition source-of-truth pattern used elsewhere: `this.campaign.edition || default_edition`
  (e.g. `Overview.vue:385`, `Entities.vue:577`, `AddNpc.vue:268`), where `campaign` is a prop
  passed down from the page that loaded it.

## Design decisions

1. **One flat array, `edition` prop per entry — matches the API content pattern.** Keep
   `rules` a single array (not keyed by edition like `EXHAUSTION_LEVELS`). Duplicate every
   entry that needs 2024 content, add `edition: "5.5e"` to the duplicate, and leave 2014
   entries exactly as they are today (no `edition` prop — absence means 5e, same convention
   `monsters`/`spells`/`items`/`conditions` already use). Per-entry shape stays `{ type, name,
   url, caption, description, src, edition? }`.
2. **No new content type / API call.** This stays a local constant, not an HK-API-backed
   content type — same as today. No Phase 0 (API) work needed.
3. **Duplicate rather than share/dedupe, even for mechanically unchanged entries.** A 2024
   duplicate of e.g. "Attack" gets `edition: "5.5e"` and (at minimum) an updated `src` page
   number, even though `description` is copied verbatim — keeps the array a straightforward
   list to filter, with no separate merge/fallback logic needed at render time.
4. **`url` uniqueness is per edition, not global** — same rule the API uses for slugs
   (`dnd-5.5e-support.md`: *"Field `name` collisions are expected and fine; uniqueness is per
   edition"*). A 2014 and 2024 entry can reuse the same `url` (e.g. both "Attack" entries use
   `url: "attack"`) since `CheatSheet.vue` only ever renders one edition's entries at a time
   (see decision 5) — no collision within a rendered list. Renamed actions (Magic, Utilize)
   naturally get new slugs; whether to also rename slugs for reworded-but-not-renamed entries
   is a call to make per entry during implementation.
5. **CheatSheet.vue filters the array by the same edition source each caller already has**,
   using the absence-means-5e convention: `rules.filter(r => (r.edition || "5e") === edition)`.
   - `Rules.vue` (compendium): `$route.params.edition` (already computed as `editionLabel`/
     `resource`, just also drives the filter).
   - In-campaign `resources/index.vue` → `CheatSheet`: needs `campaign.edition` threaded down.
     Check whether `campaign` is already available as a prop/injection in that component tree
     (it is in sibling components like `Compendium.vue`); if not, add it the same way those
     siblings receive it.
   - `CheatSheet` gets a new `edition` prop (`"5e" | "5.5e"`, default `default_edition`) instead
     of importing `rules` directly and using it unfiltered; parent resolves the edition and
     passes it down, `CheatSheet` filters before building `types`/`sheet`.

## Content overview — known 2024 SRD 5.2.1 changes

This is a **planning-level overview** based on the publicly documented 2024 PHB revision, to
scope the work. **Exact wording must be transcribed from the official SRD 5.2.1 CC text**
during implementation (the PDF already linked in `Rules.vue:66`:
`https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.pdf`) rather than
reproduced from memory here — a couple of items below are flagged "verify exact text" where
the mechanical change is well-known but precise numbers/wording need confirming against the
source document. (Note: this environment couldn't auto-extract the PDF's text —
`pdftoppm`/poppler isn't installed — so extraction is a manual/implementation-time step.)

Status legend: **unchanged** = no edit needed beyond copying the entry and updating `src`.
**reworded** = mechanics/outcome are the same but the SRD prose changed enough that the
`description` text should be rewritten, not just copied. **new** / **renamed** = self
explanatory. **unverified** = don't assume either way — confirm against the SRD 5.2.1 text
before writing the entry; do not copy the 2014 description as a placeholder.

### Actions

| 2014 entry | 2024 status | Change |
| --- | --- | --- |
| Attack | unchanged | — |
| Cast a Spell | renamed → Magic | Action to cast a spell with a casting time of an action, use a magic item, or use a spellcasting class feature. |
| Dash | unchanged | — |
| Disengage | unchanged | — |
| Dodge | unchanged | — |
| Grapple | reworded | Moved under Attack as a "special melee attack" option; same contested-check mechanic (Athletics vs. Athletics/Acrobatics), but confirm the size-restriction wording still applies before copying it verbatim. |
| Help | reworded | Same net effect, but 2024 prose splits it into "Help with an Ability Check" vs. "Help with an Attack" — rewrite the description to match, don't just relabel. |
| Hide | reworked (biggest change) | Now requires being unseen (heavily obscured / three-quarters+ cover / otherwise hidden) *and* takes the **Invisible condition** on a successful Stealth check until you make noise, attack, or cast a spell with a verbal component. Interacts directly with the new/clarified **Search** action. |
| Influence | new | Charisma-based social action (Deception/Intimidation/Performance/Persuasion check to influence an NPC). |
| Ready | unchanged | — |
| Search | reworded | Wisdom (Perception or Investigation) check to find something; SRD now states it explicitly as the counterpart to Hide, so the description should reference that. |
| Shove | reworded | Moved under Attack as a "special melee attack" option; same contested-check mechanic, confirm wording before copying. |
| Study | new | Intelligence-based action (Arcana/History/Investigation/Nature/Religion check to recall lore). |
| Use an Object | renamed → Utilize | Same effect (interact with a second object), new name. |
| Use a Class Feature (action) | unchanged | — |

### Bonus Actions

| 2014 entry | 2024 status | Change |
| --- | --- | --- |
| Offhand Attack | reworded | Same restriction (no ability modifier to damage unless negative), but now framed as a property of the **Light** weapon mastery/property rather than a standalone "Two-Weapon Fighting" rule — rewrite description to reference the Light property, don't just relabel. |
| Cast a Spell (bonus action) | unchanged | — |
| Use a Class Feature (bonus action) | unchanged | — |

### Reactions

| 2014 entry | 2024 status | Change |
| --- | --- | --- |
| Opportunity Attack | unverified | Trigger is believed reworded to emphasize the creature must be one **you can see** leaving your reach (relevant given Hide's new Invisible-condition interaction), but confirm exact wording against SRD 5.2.1 before writing the description — don't assume the 2014 text still applies. |
| Readied Action | unchanged | — |
| Use a Class Feature (reaction) | unchanged | — |

### Movement

| 2014 entry | 2024 status | Change |
| --- | --- | --- |
| Move | unchanged | — |
| Stand Up | unchanged | — |
| Grapple Move | unchanged | — |
| High Jump / Long Jump | unverified | Formulas (3 + Str mod / Str score in feet, running-start requirement, standing-jump halving) are *believed* unchanged, but don't copy the 2014 numbers without confirming against SRD 5.2.1 wording first. |
| Climb / Swim / Crawl | unchanged | — |
| Drop Prone | unchanged | — |
| Difficult Terrain | unchanged | — |
| Improvise | unchanged | Not itself an official rule (DM-guidance entry). |

### Environment

| 2014 entry | 2024 status | Change |
| --- | --- | --- |
| Lightly Obscured / Heavily Obscured | unchanged | — |
| Bright Light / Dim Light / Darkness | unchanged | — |
| Blindsight / Darkvision / Truesight | unchanged | — |
| Half Cover / Three-Quarters Cover | unverified | +2 / +5 to AC and Dex saves is the 2014 rule; some community summaries suggest 2024 cover changed. Confirm against SRD 5.2.1 before assuming the 2014 numbers still hold — do not copy them as a placeholder. |
| Full Cover | unchanged | Can't be targeted directly. |

**Net new entries to add**: Influence, Study (both `action` type).
**Renames** (decide on `url` slug stability): Cast a Spell → Magic, Use an Object → Utilize.
**Entries needing the most editorial care**: Hide, Search, Opportunity Attack (all three
interlock around the reworked stealth/detection rules).

## Implementation phases

Deliberately ordered wiring-before-content: after Phase 1, 5e behaves exactly as it does
today and 5.5e routes/views render correctly but empty (no `edition: "5.5e"` entries exist
yet). That's a checkpoint — verify 5e is untouched and 5.5e fails empty (not broken) before
spending time writing 2024 rules text in Phase 2.

### Phase 1 — Component wiring (content-agnostic)
- `CheatSheet.vue`: add an `edition` prop (`String`, default `default_edition`); replace the
  direct `import { rules }` usage with a filtered computed:
  `rules.filter(r => (r.edition || "5e") === this.edition)`. With no `"5.5e"` entries yet,
  this computed simply returns `[]` for 5.5e — `CheatSheet.vue` already has an empty-state
  path (`<p v-if="query && !sheet.length">Nothing found</p>` covers the search case; confirm
  the no-search/no-results case also renders sanely, e.g. an empty tab body, not an error).
- `Rules.vue`: pass `:edition="$route.params.edition || default_edition"` (or equivalent
  matching `editionLabel`) into `<CheatSheet compendium :edition="..." />`.
- `resources/index.vue` (in-campaign): confirm/add a `campaign` prop on the way to
  `CheatSheet`, pass `:edition="campaign.edition || default_edition"`.
- **`Rule.vue` (detail view) — required fix, not optional**: update the `rule()` computed to
  filter by edition, not just `url`:
  `rules.find(r => r.url === this.id && (r.edition || "5e") === (this.$route.params.edition || "5e"))`.
  No route changes needed (routes already pass `$route.params.edition` through, per Current
  state above) — this is purely the lookup logic inside the existing component. With no
  `"5.5e"` entries yet, every `/compendium/rules/5.5e/<slug>` correctly falls into the
  existing "Rule not found" state ([Rule.vue:21-26](../src/views/Compendium/view/Rule.vue#L21)).
- **Checkpoint**: `/compendium/rules` (5e) shows the same content as before, unchanged.
  `/compendium/rules/5.5e` shows the Rules page shell (edition label, PDF link, edition
  toggle) with an empty cheat sheet. `/compendium/rules/5.5e/attack` shows "Rule not found".
  A 5.5e campaign's in-campaign Cheat Sheet tab is empty; a 5e (or no-edition) campaign's is
  unchanged.

### Phase 2 — Data
- Append a 2024 duplicate of every entry to `rules` in `generalConstants.js`, with
  `edition: "5.5e"` added; leave the existing 2014 entries untouched (no `edition` prop, same
  as today).
- Edit each 2024 duplicate per the table above: add Influence/Study as new entries (`edition:
  "5.5e"`, no 2014 counterpart), rename/reword Magic/Utilize/Hide/Search/Opportunity Attack,
  update `src` page refs to the 2024 PHB, spot-check Jump/Cover text against the actual SRD
  5.2.1 document.

### Phase 3 — Verification
- Compare `/compendium/rules` vs `/compendium/rules/5.5e` — confirm distinct content per
  edition, "Show Rules for {other edition}" toggle still works, PDF link still matches edition.
- Confirm a campaign with `edition: "2024"`/`"5.5e"` shows 2024 cheat-sheet text in the
  campaign resources panel; a legacy campaign with no `edition` still shows 2014 text
  (`default_edition` fallback).
- Search and tab-filter behavior in `CheatSheet.vue` unaffected (operates on whichever array
  is now selected).
- Detail routes resolve to the right edition's content: `/compendium/rules/attack` vs.
  `/compendium/rules/5.5e/attack` show different `src`/`description` where the entry differs.

## Out of scope

- Sourcing rules text from the HK API (stays a local constant, per Design decision 2).
- Conditions/exhaustion rules text — already dual-edition (`dnd-5.5e-support.md` Phase 3, done).
- Any full-text reproduction of SRD 5.2.1 content beyond this cheat-sheet's existing scope
  (e.g. full weapon mastery rules, full spellcasting rules) — only the categories already
  covered by the 2014 cheat sheet are in scope for 2024 parity.

## Open questions

1. Keep `url` slugs stable for renamed actions (Magic, Utilize) or rename them to match the
   new terms? Stable slugs avoid breaking any existing deep links into
   `/compendium/rules/.../<slug>`; renamed slugs read better long-term. Leaning toward keeping
   old slugs (low cost either way since these are internal anchors, not indexed externally).
2. Should "Grapple" and "Shove" keep their own top-level cheat-sheet entries (as today) even
   though 2024 frames them as options *within* Attack, or get a caption tweak noting that?
   Leaning toward keeping them as-is for cheat-sheet scanability — this is a quick-reference
   tool, not a rules-book transcription.
