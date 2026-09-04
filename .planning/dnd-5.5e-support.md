# D&D 5.5e (2024 Rules) Support

## Goal

Support D&D 5.5e (the 2024 revision, SRD 5.2.1) alongside the existing 5e (2014, SRD 5.1)
support. NPC **bonus actions** — the most visible 5.5e stat block change — are already done
(see `npc-bonus-actions.md`). This spec covers the rest.

## Design decisions

1. **The tracker stays system-agnostic.** Both editions track the same things (HP, AC,
   initiative, conditions by name, exhaustion levels 1–6, action economy incl. bonus
   actions). No edition branching in combat logic.
2. **Content coexists.** 2024 monsters/spells/items/conditions are added *next to* the 2014
   content, distinguished by an `edition` field. Both remain searchable at all times —
   content is mechanically cross-compatible.
3. **Campaigns get an edition setting** used to *prefilter* content pickers (NPCs, spells,
   conditions text). It is a default filter, never a hard restriction — users can always
   clear it and pull content from the other edition.
4. **All stat blocks render in the 2024 layout**, regardless of the monster's edition. The
   compendium stat block (`src/components/compendium/Monster.vue`) is already mostly there
   (Initiative line, MOD/SAVE ability table); the remaining gaps are listed in Phase 2.
5. **Condition rules text is edition-aware** (the only place where rules *content* differs);
   the campaign edition decides which text is shown in the tracker.

---

## Phase 0 — HK API requirements (external dependency)

Work in the HK API repo, but the frontend contract is defined here:

- **`edition` field** on monsters, spells, items and conditions: `"2014" | "2024"`.
  Backfill all existing records with `edition: "2014"`.
- **Query param** `edition=` on all list endpoints. Omitted ⇒ both editions returned
  (backwards compatible: current clients see no change).
- **SRD 5.2.1 content import**:
  - Monsters (~330) with the 2024 stat block fields: `bonus_actions`, optional
    `initiative` (flat bonus override — some 2024 monsters add PB to initiative),
    optional `gear` (free-text description string).
  - Spells — many 2024 spells share names with 2014 ones (`fireball` exists in both).
  - Conditions with 2024 text (exhaustion, grappled, incapacitated, invisible etc.
    all changed).
  - Items — SRD 5.2 item list, including the `mastery` property on weapons (display
    only; no tracker mechanics).
- **Slug/URL strategy (decided)**: 2024 content lives under a `5.5e/` path prefix —
  `/5.5e/goblin`, `/5.5e/fireball` — while 2014 content keeps its existing slugs
  (`/goblin`, `/fireball`). Existing links never break; the `url` field of 2024
  records carries the `5.5e/` prefix.
- Field `name` collisions are expected and fine; uniqueness is per edition.

## Phase 1 — Data model & schemas (this repo)

### Campaign edition

- `src/schemas/hk-campaign-schema.json`: add optional `edition` property,
  enum `["2014", "2024"]`. Missing ⇒ treated as 2014 everywhere (legacy default).
- Campaign create form (`src/views/UserContent/Campaigns/Campaigns.vue`) and
  `EditCampaign.vue`: edition select, modeled exactly on the existing `advancement`
  setting. **New campaigns default to `"2024"` (5.5e).**
- **Unspecified-campaign prompt**: when a campaign without an `edition` is loaded
  (RunCampaign), ask the user once which version the campaign uses (5e / 5.5e) and
  persist the answer on the campaign. Until answered, behave as 2014.
- Expose via the campaigns Vuex getter so pickers and the condition drawer can read it.

### NPC fields

- `src/schemas/hk-npc-schema.json`: add optional
  - `edition`: `"2014" | "2024"` (used for prefiltering custom NPC lists),
  - `initiative`: integer (flat initiative bonus override; absent ⇒ Dex mod),
  - `gear`: string (free-text description, like the 2024 stat block "Gear" line).
- NPC editor:
  - `src/components/npcs/BasicInfo.vue` — edition select + gear input (chips/list).
  - `src/components/npcs/AbilityScores.vue` — optional initiative bonus override field.
- Propagate through the same paths the bonus-actions feature touched:
  `src/components/userContent/ImportUserContent.vue` (import/validation),
  `src/components/npcs/GenerateMonster.vue` (AI generation prompt/schema),
  `src/views/Admin/MonsterUpdate.vue`, `src/mixins/monster.js`.

## Phase 2 — Stat block: finish the 2024 layout

All in `src/components/compendium/Monster.vue` (reused by `drawers/ViewNpc.vue`):

- **Initiative**: use `monster.initiative` override when present, else current Dex-mod
  computation (`Monster.vue:26-30`).
- **Gear** line in the stats section (after Skills, before Senses) when `gear` is set
  (plain text, rendered as-is).
- **Immunities merged**: 2024 blocks show one `Immunities` line combining
  `damage_immunities` + `condition_immunities` (damage types first, then conditions).
  Keep Vulnerabilities and Resistances as separate lines.
- **CR line**: render as `CR 5 (XP 1,800; PB +3)` (current: "Challenge Rating 5 (1,800
  XP; PB +3)") — cosmetic, matches 2024 print style.
- **Spellcasting**: keep the current prepared-caster rendering (works for both editions);
  innate spellcasting already groups by At Will / X-per-day, which matches the 2024
  presentation closely enough. No structural change.
- Audit other stat block renderings for drift: `src/components/trackCampaign/` (player
  shared view) and the combat monster card
  (`src/components/combat/entities/Card/CardActions.vue`) — these show condensed views and
  likely only need the bonus-actions ordering they already have, but verify Gear/Initiative
  don't need to surface there.

## Phase 3 — Conditions & exhaustion

**Status: implemented, superseding the original plan below.** Condition *slugs* are
identical across editions (`entity.conditions[slug]`, e.g. `"poisoned"`), and this slug
is identical to the API condition's `url` field — so combat data needs no migration.

Original plan was to keep rules text in `src/mixins/conditions.js` (a hardcoded local
array keyed by `2014`/`2024`). That has been superseded: the encounter condition drawer
(`src/components/drawers/encounter/Condition.vue` and `Conditions.vue`) now fetches
condition definitions from the HK API instead, matching the pattern already used for
monsters/spells/items/compendium-conditions:
- `store/modules/content/conditions.js` gained `fetch_all_conditions({ edition })` /
  getter `conditions_by_edition(edition)` — fetches the full (non-paginated) condition
  list for an edition (`"5e"` / `"5.5e"`, matching `campaign.edition`) and caches it.
- The drawers map API results (`url`, `name`, `condition`, `effects`) to the shape the
  templates use, matching on `condition.url === entity.conditions` key.
- **Known gap**: the HK API has no 5.5e condition content yet (`/conditions/5.5e`
  returns 0 results as of 2026-07-10). Until the API is backfilled, 5.5e campaigns will
  show an empty condition list in the drawer. No client-side fallback was added
  (deliberate choice — proceed without fallback, revisit once the API has content).
- **Exhaustion per-level table**: the API only returns a flat `effects` array, no
  per-level breakdown. The 6-row table (2014/2024 text) was moved out of the mixin into
  `EXHAUSTION_LEVELS` in `src/utils/generalConstants.js` (keyed `"5e"`/`"5.5e"`), used
  only by `drawers/encounter/Condition.vue`.
- `src/mixins/conditions.js` has been **deleted**. Its last two consumers were
  migrated onto the `api_conditions` store: `src/components/npcs/Defenses.vue`
  (condition-immunity picker options) and `trackCampaign/live/Initiative.vue`
  (icon/name lookup by slug). Both only needed name/icon lookup, not edition-aware
  rules text, so they fetch/read `conditions_by_edition("5e")` unconditionally
  rather than tracking a live campaign edition.
- `src/components/combat/Conditions.vue` reads `db.ref("conditions")` (Firebase RTDB) only
  for icon/name display — names match across editions, so **no RTDB change** (verify
  during implementation).
- Compendium `views/Compendium/Conditions.vue` + `compendium/Condition.vue`: already
  list per-edition from the API with an edition badge (done, `ee832b8a`).
- Surprise: already not a condition (commented out in the mixin); 2024's
  "surprise = disadvantage on initiative" needs no tracker support. Nothing to do.

## Phase 4 — Compendium browsing & encounter pickers

- Compendium list views (`src/views/Compendium/{Monsters,Spells,Items,Conditions}.vue`):
  - edition filter (All / 2014 / 2024) wired to the `edition` query param,
  - edition badge on result rows and on detail views (`Source` line already exists;
    add edition next to it).
- **Encounter add-NPC flow** (`src/components/encounters/Entities.vue`) and the campaign
  compendium resource (`src/components/campaign/resources/Compendium.vue`): initialize the
  edition filter from the campaign's `edition` setting; user can change or clear it.
- Spell pickers in the NPC editor (`src/components/npcs/SpellCasting.vue`): same prefilter.
- Detail routes: 2024 content resolves under the `5.5e/` slug prefix
  (`/compendium/monsters/5.5e/goblin`); 2014 slugs are unchanged so existing links keep
  working.

## Phase 5 — Tracker verification pass

No mechanical changes expected; verify the agnostic claim holds:

- Conditions drawer shows correct edition text in a live encounter (Phase 3).
- Monster cards / actor action dropdowns handle 2024 monsters (bonus actions already
  covered; check `gear`/`initiative` are ignored gracefully where not rendered).
- Rules reference content in `src/utils/generalConstants.js` (cover, light, etc.) and
  `views/Compendium/Rules.vue` is 2014 text — updating to dual-edition is **optional,
  follow-up**, not part of this feature.

---

## Suggested implementation order & branches

| Step | Branch | Depends on |
| --- | --- | --- |
| API: edition field + backfill | (HK API repo) | — |
| API: SRD 5.2.1 content import | (HK API repo) | edition field |
| Campaign + NPC schema/editor fields | `feature/edition-fields` | — |
| Stat block 2024 completion | `feature/statblock-2024` | NPC fields (gear/initiative) |
| Conditions & exhaustion | `feature/conditions-2024` | campaign edition field |
| Compendium filters & pickers | `feature/compendium-edition-filter` | API edition param |

Phases 1–3 are not blocked by the API work; only Phase 4 needs the API's `edition`
param and content live.

## Out of scope

- Player-character 2024 options (weapon mastery mechanics, 2024 classes/species in the
  character builder).
- Migrating existing user NPCs to 2024 (they simply have no `edition`; everything keeps
  working).
- Lair actions rework / habitat & treasure stat block entries (not in SRD 5.2.1).
- Rules compendium 2024 text (flagged as optional follow-up in Phase 5).

## Decisions (previously open questions)

1. **Default when campaign has no `edition`**: behave as **2014**. When such a campaign
   is loaded to run, prompt the user once to pick 5e / 5.5e and persist it.
2. **Slug strategy**: 2024 content under the `5.5e/` path prefix (`/5.5e/goblin`,
   `/5.5e/fireball`); 2014 slugs unchanged.
3. **New campaigns default to 5.5e (`"2024"`)** in the create form.

## Addendum — innate spell cast level (roll-time)

2024 stat blocks assign innate spells an explicit casting level (e.g. "3/Day each:
*misty step*, cast at 3rd level"), stored per-spell as optional `level` on
`npc.innate_spells[key]` (added by the NPC editor, `src/components/npcs/SpellCasting.vue`).
Combat rolls did not yet honor it — innate spells always rolled at their own base spell
level (`src/mixins/runEncounter.js`, comment "Innate spells are cast at the lowest
possible level").

- `src/schemas/hk-npc-schema.json`: `innate_spells` item gains an optional `level`
  property (mirrors `caster_spells.level`, but not `required` — legacy/2014 entries
  have no level).
- `src/components/combat/actions/RollSpells.vue` (`fetchSpells`): for `type === "innate"`,
  carry the stored override as `spell.cast_level` (distinct from `spell.level`, the
  spell's own base level used for upcast-scaling math) when present.
- `src/mixins/runEncounter.js` (`roll_action`): `config.cast_level` uses
  `action.cast_level ?? action.level` for innate — falls back to the existing base-level
  behavior when no override is set.
- `RollSpells.vue` template (innate `hk-roll-action`): pass `:cast-level` (and
  `:caster-level`, matching the caster branch) so projectile/damage scaling in
  `hk-roll-action.vue` also reflects the override.
- No change when `level` is absent — existing NPCs/spells behave exactly as before.
