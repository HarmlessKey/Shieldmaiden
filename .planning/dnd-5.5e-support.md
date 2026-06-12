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

Condition *names* are identical across editions (the tracker stores flags by name, so
combat data needs no change). Only the rules text and the exhaustion effect table differ.

- `src/mixins/conditions.js`: restructure each entry to hold both texts —
  `effects` (2014, as-is) plus `effects_2024`. Export a helper
  `conditionEffects(condition, edition)`.
  2024 text changes (SRD 5.2): grappled (disadvantage vs. others, movable), incapacitated
  (no actions/bonus actions/reactions, concentration broken, disadvantage on initiative),
  invisible (concealed wording), exhaustion (below), plus minor rewording elsewhere.
- **Exhaustion 2024**: still levels 1–6, so the existing level tracking
  (`runEncounter.js` `set_condition` with `level`) is untouched. The per-level effects
  table in `src/components/drawers/encounter/Condition.vue` becomes edition-aware:
  - 2014: current 6-row table (disadvantage on checks, speed halved, …, death).
  - 2024: per level — d20 Tests −2 × level, Speed −5 ft × level; death at level 6.
- `drawers/encounter/Condition.vue` and `drawers/encounter/Conditions.vue` read the
  campaign edition from the store; no edition on the campaign ⇒ 2014 text (legacy
  default, until the user answers the RunCampaign prompt).
- `src/components/combat/Conditions.vue` reads `db.ref("conditions")` (Firebase RTDB) only
  for icon/name display — names match across editions, so **no RTDB change** (verify
  during implementation).
- Compendium `views/Compendium/Conditions.vue` + `compendium/Condition.vue`: list both
  editions from the API with an edition badge (Phase 4 filter applies).
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
