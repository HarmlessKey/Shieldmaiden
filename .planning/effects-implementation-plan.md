# Effects Feature - Implementation Plan

Builds on [.planning/effects-schema.md](./effects-schema.md) and
[effects-srd-catalogue.md](./effects-srd-catalogue.md). Goal: a unified "Effects" model that
drives conditions, spell/feature/item/monster effects and combat tracker behavior, and
replaces the current ad-hoc condition/reminder system.

**Each step is implemented as an OpenSpec change and marked done only once that change is
archived** — see "Workflow per step" at the end of this plan.

**Local data first, API last.** Steps 1b–7 work only against local data: SRD effects and
SRD conditions — name, description and mechanics — come from
`src/data/{edition}/effects.js` and `src/data/{edition}/conditions.js`; custom effects come
from the user's Firebase Realtime Database. None of these steps reads from or changes the
HK API. Everything that touches the HK API (condition text, SRD effects served by the API,
backfilling effects onto SRD monsters) is collected in step 8.

## Conditions are effects
Conditions are SRD effect definitions like any other; they just live in their own data
file. From step 1b on:

- **`url`** — every SRD definition (condition or effect) is identified by `url`, the
  condition slug (`"prone"`, `"incapacitated"`) — the same unique identifier the HK API
  uses (the API's uuid `_id`s are not used). It is identical across editions, so step 8 can
  join on it, and unique across `effects.js` and `conditions.js` of an edition. Instances
  reference it as `source_key`.
- **Applying** — applying a condition writes an effect instance (`source: "srd"`,
  `source_key: "stunned"`), whether it comes from the drawer (2a), an action
  (`action_effects`, steps 6–7), an `apply_effect` sub-effect or a repeat-save `escalate`
  (2h). Its duration is handled by the effects engine like any other instance.
- **Reading** — condition checks such as `{ type: "has_condition", value: "incapacitated" }`
  (Concentration and Rage end when Incapacitated, Aura of Protection is inactive while
  Incapacitated, Grappler's Advantage vs a creature you grapple) go through one helper
  (`hasCondition(entity, url)`) that reads the entity's active effect instances. Until the
  legacy UI is replaced (2i) it also reads `entity.conditions`, so both paths agree.
- **Including** — `includes` references to a condition (Paralyzed includes Incapacitated,
  Turned includes Frightened + Incapacitated, Crawler Mucus includes Poisoned + Paralyzed)
  resolve against `conditions.js` and apply its mechanics.
- **Exhaustion** — one instance with a `level` (1–6); applying it again increments
  `level` instead of adding a second instance.

General rule for the resolver (2e): **an unresolved `effect_ref` is never an error** —
show its `name`, apply no mechanics, log it once.

## 0. 5.5e (2024) alignment — effects part (done — archived as effects-0-55e-alignment, 2026-09-29)
D&D 5.5e support shipped in 2.43.0 (#357, see [dnd-5.5e-support.md](./dnd-5.5e-support.md)).
Parts of this plan were written against the in-progress `feature/5.5-support` branch.

### What shipped that this plan must follow
- **Edition values are `"5e"` / `"5.5e"`**, not `"2014"` / `"2024"`. Campaign schema
  (`hk-campaign-schema.json`) enum is `["5e", "5.5e"]`; missing ⇒ `"5e"`
  (`default_edition` in `generalConstants.js`). In the tracker the value is read from the
  `runEncounter` store getter `edition` (set from `campaign.edition` on encounter init,
  `runEncounter.js` `SET_EDITION`). The demo encounter runs as 5.5e.
- **Effect resolution uses the campaign edition, not the entity's.** Entities now carry
  their own `edition` (NPCs, persisted in encounters since `acb744d3`) — that only decides
  which *content* (spells, stat block) the entity uses. Effects and conditions are table
  rules, so they resolve from the campaign edition's data files. Same rule the shipped
  conditions drawer already follows.
- **5.5e monsters are live** (330, `srd 5.2.1`, `/monsters/5.5e/...`), with
  `initiative_modifier`, `gear`, `bonus_actions`, and the 2024 structured action text
  (see 0a).

### 0a. What the 2024 monster corpus changes (scan of all 330 5.5e monsters)
Counts are distinct action/trait entries from the committed scan (2026-09-29, 1271 entries),
see the "5.5e (2024) corpus" section of
[monster-actions-effect-scan.md](./monster-actions-effect-scan.md).
2024 stat blocks are far more regular than 2014 ones, which directly helps steps 6/7:
- **Structured saves**: `"<Ability> Saving Throw: DC N, <targets>. Failure: ... Success:
  ... Failure or Success: ..."` (198 Failure / 113 Success / 24 Failure-or-Success
  blocks). An action's effect references split into `on_fail` / `on_success` / `always`
  instead of free-text guessing. 80 are "Success: Half damage".
- **"has the X condition"** phrasing applies a condition in 182 entries — reliable condition
  detection for step 6. Most common: Prone 53, Grappled 38, Restrained 34, Poisoned 26,
  Blinded 16, Incapacitated 15. The same phrase is also a state check in 31 entries
  ("unless the mephit has the Incapacitated condition", Pack Tactics), so step 6 must look
  at the clause before it.
- **Escape DC** inline on Grappled: `"Grappled condition (escape DC 14)"` (39).
- **Next-turn durations are anchored to different entities**: "until the start of the
  assassin's next turn" (owner/caster, 39: 25 start / 14 end) vs "until the end of its
  next turn" (target, 82: 46 start / 36 end) — `duration.anchor` / `edge` (2h).
- **Repeat saves happen at end of turn**: "repeats the save at the end of each of its
  turns" (14) plus "at the end of its next turn" (4), 0 at start of turn — default
  `save.triggers: ["end_turn_target"]`.
- **Escalating saves**: "First Failure: Restrained ... Second Failure: Petrified"
  (basilisk), brass dragon sleep breath (Incapacitated → Unconscious), death dog
  "Subsequent Failures" — 13. `repeat_save.escalate`.
- **Bloodied** (HP ≤ half max) is a 2024 keyword (18): "While Bloodied, the berserker has
  Advantage on attack rolls", "+damage if the target is Bloodied", reactions triggered on
  becoming Bloodied — `bloodied` condition check + `on_bloodied` trigger. Works for both
  editions.
- **Reactions** use `"Trigger: ... Response: ..."` (21) — maps to the trigger enum.
- Nested state: "While Grappled, the target has the Restrained condition" (crocodile) —
  linked via `parent_id` cascade (2d/2h).

### 0b. Step-0 work
Items 1 and 3 are done (archived as `effects-0-55e-alignment`; spec
`openspec/specs/effects-srd-data`). Item 2 is delivered by steps 2a and 2e.

1. Update Concentration in `src/data/5.5e/effects.js` to 2024 rules: save DC capped at 30,
   and Concentration ends when the holder is Incapacitated (a `has_condition` check, read
   through the helper in "Conditions are effects").
2. Read `"5e"` / `"5.5e"` from the `edition` getter in the Effects drawer (2a) and
   encounter init (2e) — done as part of those steps.
3. Re-run the monster scan (`monster-actions-effect-scan.md`) with a 5.5e section — input
   for step 6. The counts in 0a are the headline numbers.

## 1. Effects JSON Schema (done — v2, 2026-09-29)
`src/schemas/hk-effects-schema.json` v2 is the single schema for both editions, built from
a full sweep of SRD 5.1 and 5.2. Coverage, design decisions and examples:
[effects-srd-catalogue.md](./effects-srd-catalogue.md). It defines four shapes: the effect
definition (root), `$defs/application`, `$defs/active_instance` (what 2b/2d persist) and
`$defs/action_effects` (steps 6–7). Durations are not part of the definition (2c); the
conditional sub-schema is `$defs/condition_set`. Validated against all existing data
files plus 55 stress-test encodings. `src/utils/effectsConstants.js` is updated in step 4;
conditions data is migrated in step 1b.

## 1b. SRD conditions data files (done — archived as effects-1b-srd-conditions-data, 2026-09-29)
`src/data/5e/conditions.js` and `src/data/5.5e/conditions.js` become the tracker's source
for conditions — name, description and mechanics — and must validate against schema v2
(extend the `effects-srd-data` spec). Prerequisite for 2a, which lists them.

Both files:
- Add `url` (= condition slug = HK API `url`) to every entry. The schema's root `key` is
  renamed to `url`, and Concentration in `effects.js` switches from `key` to `url`.
- Drop `duration_type` / `cancel_trigger` from definitions (2c).
- Keep `name` and `description` locally; the tracker does not read condition text from
  the API until step 8. Icons are the existing `hki-<url>` icon-font classes.
- **Exhaustion** is one leveled entry, not six "Exhaustion N" entries — `stacking.mode:
  "level"` + `level_track`, 2014 rows via `min_level`, 2024 via `scaling.by: "level"`
  (catalogue §5). The per-level text stays in `EXHAUSTION_LEVELS`
  (`generalConstants.js`) for display.
- **Paralyzed, Petrified, Stunned, Unconscious** use `includes` (Incapacitated; Unconscious
  also Prone) instead of copying sub-effects, so fixes to Incapacitated propagate.
  *As built:* Unconscious brings Prone through `apply_effect` on `on_apply`, not
  `includes` — the creature falls Prone and (2024) remains Prone when Unconscious ends,
  while an `includes` Prone would be removed with it.

`src/data/5.5e/conditions.js` was authored before the 2024 text was available and is wrong
in places (checked against SRD 5.2.1):
- **Exhaustion**: each D20 Test is reduced by `2 × level`, Speed by `5 × level` ft, death
  at level 6, a Long Rest removes 1 level. No Disadvantage.
- **Incapacitated**: Concentration **is** broken (the file says the opposite), and the
  creature has Disadvantage on Initiative. Can't take actions, Bonus Actions, Reactions,
  can't speak.
- **Invisible**: Advantage on Initiative; "Concealed" — `special/descriptive`.
- **Grappled**: Disadvantage on attack rolls against any target *other than the
  grappler*; Speed 0.
- **Stunned** (2024) no longer has "can't move / speak falteringly" beyond Incapacitated.
- **Dying** and **Surprised** are not SRD 5.2.1 conditions — remove them.

## 2. Apply and track effects in the combat tracker
Build this ahead of the form/monster-action work to validate the data model and
active-effects lifecycle end-to-end. Step 2 covers everything needed to apply effects and
conditions, show them, fire triggers, tick durations, and replace the legacy conditions
UI. Applying the mechanical bonuses (stat modifiers, DoT rolls, etc.) is step 3.

### 2a. Effects drawer
Create `src/components/drawers/encounter/Effects.vue` - the UI from which a DM applies
an effect or condition to one or more targeted entities, modelled on the existing
Reminders drawer:

- Lists available effects grouped by source:
  - **SRD conditions** from `src/data/5e/conditions.js` or `src/data/5.5e/conditions.js`.
  - **SRD effects** from `src/data/5e/effects.js` or `src/data/5.5e/effects.js`
    (e.g. Concentration).
  - Both SRD groups are selected by campaign `edition` (`"5e"` / `"5.5e"`) via the
    `runEncounter` `edition` getter.
  - **Custom effects** from the user's Firebase Realtime Database
    (`src/store/modules/userContent/effects.js` / `src/services/effects.js` already
    exist for this). Custom effects are edition-agnostic and always shown.
- A `mode` prop (e.g. `mode="conditions"`) limits the list to conditions; 2i uses it to
  replace the old Conditions drawer. Until then the existing `Conditions.vue` drawer stays
  available alongside.
- Each effect is expandable to show its description and `sub_effects`.
- On apply: the user fills in the application (`$defs/application`): duration (type,
  value/unit, and the anchor/edge for next-turn durations), save DC where the effect has a
  repeat save, and any `choices` the definition asks for (Hex ability, Protection from
  Energy damage type). Duration is captured here, never on the definition. Exhaustion
  asks for / increments the level.
- Wires into the existing drawer system (`setDrawer` action,
  `src/components/drawers/encounter/` directory).

### 2b. Firebase write - apply and remove effects
Write active effect instances to Firestore, mirroring the HP storage split:

- **NPCs**: `users/{uid}/campaigns/{campaignId}/encounters/{encounterId}/entities/{entityId}/effects/{effectId}`
  via a new `set_entity_effect` action (analogous to `set_entity_prop` used for HP).
  Check whether Firebase Security Rules for the encounter path already allow writing
  arbitrary sub-keys on entities; add a rule for `/effects/**` if needed.
- **Players / companions**: `users/{uid}/campaigns/{campaignId}/{players|companions}/{entityId}/effects/{effectId}`
  via a new action in `campaigns.js` (analogous to `update_campaign_entity` used for HP).
- Remove: delete the effect key at the same path.
- Effect ID: generate a short unique key at apply-time (same pattern used for reminder
  keys or Firebase `.push()` keys).

### 2c. Duration is application-time, not part of the effect definition
How long an effect lasts is determined by whatever applies it (a spell, an action, the
DM). Conditions (Blinded, Stunned, etc.) have no inherent duration, and "Burning" isn't a
thing that "normally lasts 1 minute" — the spell that applies it defines that. So
durations don't belong on the effect definition at all.

- `src/data/5e|5.5e/effects.js`, `src/data/5e|5.5e/conditions.js` and the schema: no
  duration fields on definitions. `cancelable` can stay on the definition as a hint.
- The active effect instance (2d) always carries the resolved `duration` object,
  supplied at application time via the drawer (2a) or a monster/spell action (steps 6–7).
  No "default + override" concept needed. A condition applied from the drawer without a
  duration defaults to `type: "cancelled"` (until removed).

### 2d. Active effect instance shape
An active effect instance, as **persisted** (Firestore), is a small reference to an
effect definition plus instance metadata - not a full copy:

- `source: "srd" | "custom"` + `source_key`: SRD effects and conditions (both editions)
  use `source: "srd"` with the definition's shared edition-neutral `url` (e.g. `"concentration"`,
  `"prone"`). The same `source_key` exists in both editions' data files; which file is
  used for resolution is determined at runtime by the campaign's `edition`, not by the
  persisted instance. `source: "custom"` is for user-authored effects. When SRD data moves
  to the API (step 8), `source: "srd"` continues to resolve against the correct edition's
  data - the instance shape doesn't change.
- `name` is always denormalized onto the instance for display without a lookup.
- Persisted fields: `$defs/active_instance` in the v2 schema — `name`, `source`,
  `source_key`, `duration` (object: `type`, `value`, `unit`, `anchor`, `edge`,
  `cancel_triggers`, `ends_when`, `save`, `escape`, `on_expire`), `choices`,
  `rounds_remaining`, `caster_key`, `applied_round`, `save_dc`, `level` (Exhaustion),
  `charges`, `save_successes` / `save_failures`, and optionally `concentration_id`
  (cascade, 2h) and `parent_id` (instances that exist only while another does).
- `caster_key`: the entity key of the entity that applied the effect. Required for
  `start_turn_caster` / `end_turn_caster` triggers and caster-relative duration expiry.
  Set to the currently active entity when applied from the drawer, or the attacking
  entity when applied via a monster action (step 6).
- `applied_round`: flat integer — round number when the effect was applied.
- `cancelable` is NOT persisted on the instance. It is an optional hint on the effect
  definition, resolved at runtime like `sub_effects`. The UI defaults to showing a
  remove button and only hides it if the resolved definition has `cancelable: false`.
- No `sub_effects` are persisted on the instance.
- **Edition switching**: if a campaign's edition is changed, the next encounter init
  re-resolves `sub_effects` from the new edition's data files. Applied instances in
  Firestore are untouched (they carry `source` + `source_key` only), so they
  automatically reflect the new edition's mechanics. Some conditions differ meaningfully
  between editions (Incapacitated, Exhaustion), so edition should be set at campaign
  creation rather than changed mid-campaign; the shipped app already warns before
  changing an NPC's edition — consider the same warning on the campaign edition select
  once effects are live.

**At runtime**, `sub_effects` are resolved by snapshotting the referenced effect
definition into in-memory encounter state, mirroring how entities themselves are
already extended into the encounter on initialization:

- On encounter init (the existing loop that fetches each entity's full object and
  extends the encounter with it): for every active effect instance found on every
  entity, also fetch its effect definition (by `source`+`source_key`) and attach its
  `sub_effects` onto the in-memory instance. This is not written back to Firestore -
  only the small reference persists.
- When a new effect is applied mid-encounter: fetch that one effect definition, persist
  the small reference on the entity, and merge the resolved `sub_effects` into runtime
  state the same way.
- Resolvers always read `sub_effects` from runtime state, so they don't need to care
  whether the source is `5e`/`5.5e`/`custom`.
- A later edit to a definition is picked up on the *next* encounter init, not
  retroactively mid-encounter - consistent with how entity stat edits already don't
  retroactively affect a running encounter.

NPC "Aatrox" (entity key `npc_1`) is Hexed by a player, is Burning from a prior hit, and
was knocked Prone. Stored at `users/{uid}/campaigns/{campaignId}/encounters/{encounterId}`
under `entities.npc_1.effects`:

```json
{
	"eff_8f3a": {
		"name": "Hex",
		"source": "srd",
		"source_key": "hex",
		"duration": { "type": "concentration", "value": 1, "unit": "hour" },
		"choices": { "ability": "wisdom" },
		"caster_key": "player_1",
		"applied_round": 3,
		"concentration_id": "eff_5c10"
	},
	"eff_2b91": {
		"name": "Burning",
		"source": "custom",
		"source_key": "burning",
		"duration": { "type": "time", "value": 10, "unit": "round" },
		"rounds_remaining": 7,
		"caster_key": "player_2",
		"applied_round": 1
	},
	"eff_71d4": {
		"name": "Prone",
		"source": "srd",
		"source_key": "prone",
		"duration": { "type": "cancelled" },
		"caster_key": "player_2",
		"applied_round": 3
	}
}
```

Player "Lyra" (entity key `player_1`) is concentrating on Hex. Stored at
`users/{uid}/campaigns/{campaignId}` under `players.player_1.effects` (persists across
encounters, same as `curHp`):

```json
{
	"eff_5c10": {
		"name": "Concentration",
		"source": "srd",
		"source_key": "concentration",
		"duration": { "type": "concentration", "value": 1, "unit": "hour" },
		"caster_key": "player_1",
		"applied_round": 3
	}
}
```

`npc_1`'s Hex instance (`eff_8f3a`) carries `concentration_id: "eff_5c10"` (the caster is
`caster_key`), so cancelling `eff_5c10` (Concentration ends) cascades to remove
`eff_8f3a` - per the 2h cascade rule.

### 2e. Extend encounter init to resolve sub_effects
In the existing entity-init loop in `src/store/modules/runEncounter.js` (the pass that
fetches each entity's full object and merges it into encounter state), add a second pass
over each entity's `effects` map:

- For each active effect instance, look up its definition by `source` + `source_key`:
  - `"srd"`: find the entry whose `url` equals `source_key` in `src/data/{edition}/effects.js` or
    `src/data/{edition}/conditions.js`, using the `edition` getter (`"5e"` / `"5.5e"`).
    One lookup helper searches both files, so callers don't care which one holds it.
  - `"custom"`: fetch from the user's Firebase Realtime Database via the effects
    service (`src/services/effects.js`).
  - Step 8 swaps the static SRD lookup for API data where that applies - the
    `source`+`source_key` reference doesn't change.
- Resolve `includes` references recursively through the same lookup (with a cycle guard),
  so Paralyzed carries Incapacitated's mechanics.
- Merge the definition's `sub_effects` array onto the in-memory instance. This resolved
  state is NOT written back to Firestore.
- Unresolved references follow the general rule above: show the name, apply no
  mechanics.
- When a new effect is applied mid-encounter (via the drawer), run the same single
  fetch+merge immediately after persisting the reference.

### 2f. Show active effects on combatant
Update `src/components/combat/entities/effects/index.vue` (and `Effect.vue`) to render
`entity.effects` from runtime state:

- Show each effect's `name` (conditions with their `hki-<url>` icon, Exhaustion with its
  level), remaining duration, and a remove button.
- Alongside the legacy conditions and reminders display until 2i (conditions) and step 3
  (reminders) remove them.
- Clicking an effect opens a detail view or tooltip showing its description and
  `sub_effects`.

### 2g. Trigger system
Implement a central trigger dispatcher in `runEncounter.js` / Vuex that fires named
trigger events during combat. For each fired trigger, collect all active effects on all
entities whose `sub_effects` contain a matching `trigger` field, and queue them for
processing (step 3 handles the mechanical resolution; step 2g only fires the event and
surfaces a notification/prompt to the DM).

**Caster cross-linking in the trigger system:**
`start_turn_caster` and `end_turn_caster` fire relative to the entity that *applied*
the effect, not the entity that *has* the effect. There is no `casted_effects` list on
the caster — effects live only on the affected entity. Instead, on every turn change
the dispatcher scans all entities and all their effects, looking for `caster_key`
matches. This keeps the data model simple (one write on apply, one on remove) and
eliminates any risk of caster/target records getting out of sync.

The turn-change dispatch sequence:
1. **End of outgoing entity's turn**: scan ALL entities' effects for
   `caster_key === outgoingEntityKey` and fire `end_turn_caster` on matching effects.
   Then fire `end_turn_target` on the outgoing entity's own effects.
2. **Start of incoming entity's turn**: scan ALL entities' effects for
   `caster_key === incomingEntityKey` and fire `start_turn_caster` on matching effects.
   Then fire `start_turn_target` on the incoming entity's own effects.

With ~10 entities and a handful of effects each, this scan is trivially fast.
`caster_key` is also the anchor for duration expiry (2h): `duration.type: "next_turn"`
and `"time"` use `caster_key` to identify whose turn tick to watch.

Triggers to implement first, sourced from the schema and existing reminder logic. The
full v2 vocabulary (`$defs/trigger`) adds `on_apply`, `on_expire`, `damage_dealt`,
`on_attack`, `on_attacked`, `on_force_save`, `on_miss(_taken)`, `on_natural_20/1`,
`on_d20_fail`, `on_cast`, `on_targeted_by_spell`, `on_condition_applied`, `on_death`,
`on_kill`, area enter/start/end, `on_move` and `dawn` (catalogue §3.5).
`on_condition_applied` fires whenever a condition instance is written (2b).

| Trigger | When fired | Scope |
|---|---|---|
| `start_turn_target` | Start of the affected entity's own turn | Entity with the effect |
| `end_turn_target` | End of the affected entity's own turn | Entity with the effect |
| `start_turn_caster` | Start of the `caster_key` entity's turn | All entities with a matching `caster_key` |
| `end_turn_caster` | End of the `caster_key` entity's turn | All entities with a matching `caster_key` |
| `damage_taken` | Entity receives damage (reuse existing reminder hook) | Entity with the effect |
| `on_hit` | Entity's attack hits a target | Entity with the effect |
| `on_hit_taken` | Entity is hit by an attack | Entity with the effect |
| `on_crit` | Entity scores a critical hit | Entity with the effect |
| `on_crit_taken` | Entity is hit by a critical hit | Entity with the effect |
| `on_save_success` | Entity succeeds a saving throw | Entity with the effect |
| `on_save_fail` | Entity fails a saving throw | Entity with the effect |
| `on_check` | Entity makes an ability check | Entity with the effect |
| `on_zero_hp` | Entity reaches 0 HP | Entity with the effect |
| `on_bloodied` | Entity's HP drops to half its max or lower (from above half) — see 0a | Entity with the effect |
| `on_heal` | Entity receives healing | Entity with the effect |
| `combat_start` | Combat is initiated | All entities |
| `short_rest` | Entity takes a short rest | Entity with the effect |
| `long_rest` | Entity takes a long rest | Entity with the effect |

The existing reminder triggers (`damage_taken`, turn-change hooks in `runEncounter.js`)
are the starting point - extend rather than replace.

### 2h. Duration ticking and expiry
On each turn change (and on other relevant triggers), tick down durations and expire
effects whose time has run out. Every field below lives in the instance's `duration`
object (`$defs/duration`). Parts combine: a duration can have a `type` plus
`cancel_triggers`, `ends_when`, `save`, `escape` and `on_expire` at once.

- `type: "time"` (rounds): decrement `rounds_remaining` on `end_turn_caster` (per RAW,
  timed durations typically expire at the end of the caster's turn). Uses `caster_key`
  to identify the right turn. When `rounds_remaining` reaches 0, remove the effect.
- `type: "next_turn"`: expires at the next start or end of a turn, anchored to either the
  caster or the target. 2024 stat blocks use all combinations ("until the start of the
  assassin's next turn" vs "until the end of its [the target's] next turn"), so the
  duration carries `anchor: "caster" | "target"` and `edge: "start" | "end"` (default
  `caster` / `start`). The effect expires on the first matching `{edge}_turn_{anchor}`
  trigger *after* it was applied — if applied during the anchor's own turn, "next turn"
  skips the current one.
- `cancel_triggers` (with optional `filter`): expire automatically when a listed
  trigger fires (Invisibility spell: `on_attack`, `damage_dealt`, `on_cast`; Charm Person:
  `damage_taken` by `caster_or_allies`). No prompt needed. `ends_when` does the same for
  state (caster Incapacitated or dead, temporary HP gone, holder dons armor), with
  condition state read through `hasCondition`.
- `duration.save` (`$defs/repeat_save`): a prompted save-to-end mechanic. At each of
  `save.triggers` (default `end_turn_target`; also `damage_taken`, `start_turn_target`,
  `start_turn_caster`), the dispatcher surfaces a prompt to the DM to roll
  `save.ability` against the instance's `save_dc`. On success the effect is removed
  (or counted, see `successes_to_end`); on failure it persists and the prompt fires
  again next time.
  - The save ability comes from the source (Hold Person: Wisdom; Blindness/Deafness:
    Constitution), so it lives on the application, not the definition.
  - `on_fail` sub-effects each failed repeat (Phantasmal Killer, Weird: damage again),
    `advantage_on_triggers` (Hideous Laughter vs damage), `costs_action` (Irresistible
    Dance).
  - **Counters and escalation**: `successes_to_end` / `failures_to_escalate` with the
    instance's `save_successes` / `save_failures` (Flesh to Stone 3/3, 2014 Contagion
    lock-in), and `escalate: { effect, duration }` to replace the effect — a condition
    target (Petrified, Unconscious) is written as a new instance like any other effect.
  - `auto_success_after` for "After 1 minute, it succeeds automatically".
- `duration.escape`: action-based exit with DC and allowed checks (Grappled with escape
  DC, Web, Ensnaring Strike — optionally by a creature within reach).
- `duration.on_expire`: sub-effects when the duration ends (Haste lethargy).
- `type: "concentration"`: no automatic expiry - removed manually or via cascade. When a
  Concentration effect instance is removed, cascade-remove every active effect on any
  entity whose `concentration_id` matches it. The same cascade applies to `parent_id`.
- `type: "cancelled"`: no automatic expiry - only removed manually.

### 2i. Replace the legacy conditions UI
Once 2a–2h are stable, conditions run only through the effects model:

- The existing `src/components/drawers/encounter/Conditions.vue` (and `Condition.vue`)
  drawer is removed and replaced by `<Effects mode="conditions" />` opened from the same
  trigger point.
- `src/components/combat/Conditions.vue`, `entity.conditions` and the `set_condition`
  Vuex action are removed. `hasCondition` stops reading `entity.conditions`. The
  change's delta spec modifies the `effects-srd-data` requirement "Concentration ends when
  the holder is Incapacitated", which still says the check reads the conditions map.
- The player-facing live view (`src/components/trackCampaign/live/Initiative.vue`)
  renders condition instances from `entity.effects`, with names/icons from local data.
- Existing Firestore data with `entity.conditions`: decide on a read-migration shim or
  one-time conversion script (each condition → an instance with `type: "cancelled"`,
  Exhaustion → one instance with its `level`).
- Non-tracker uses of the `api_conditions` store (compendium, NPC condition immunities in
  `Defenses.vue`, `hk-condition-select`) are not tracker state and stay as they are.

## 3. Apply mechanical bonuses and resolve trigger actions
With the trigger system (2g) in place, implement actual mechanical resolution per
sub-effect `type`. This step touches `runEncounter.js`, `HpManipulations.js`, roll
components, and AC/HP display computeds. Conditions get their mechanics here like every
other effect.

- **`damage` / `healing`** (DoT/HoT sub-effects with a `trigger`): when the trigger
  fires (e.g. `start_turn_target` for a Burning effect), execute the roll defined in
  `sub_effect.roll` and apply the result via `HpManipulations.js`. This is the most
  common case and the first priority.
- **`bonus` / `base` / `fixed` / `floor` / `cap`** on AC, speed, ability scores, save
  bonuses, attack bonuses: collect all active effects on an entity at the point of
  computation and apply modifiers. Requires identifying every place these values are
  currently computed (AC in entity display, speed in movement, etc.) and routing them
  through an effects-aware helper. Covers Grappled/Restrained Speed 0 and 2024 Exhaustion
  (`2 × level` off D20 Tests, `5 × level` ft off Speed).
- **`advantage` / `disadvantage`** (incl. `perspective: "against"` and the legacy
  `grant_*` types): on relevant roll UIs, check active effects for matching sub-types and
  auto-toggle the advantage/disadvantage state (Blinded, Prone, Restrained, Poisoned…).
- **`defense` (vulnerability / resistance / immunity)**: apply in `HpManipulations.js`
  at damage-application time (Petrified resistance to all damage).
- **`auto_fail` / `auto_success`**: at save/check resolution, short-circuit based on
  active effects (e.g. Paralyzed/Stunned Str/Dex saves, Ring of Evasion, Legendary
  Resistance).
- **`restrict`**: disable relevant action buttons (attack, reaction, movement, speech)
  in the combat UI based on active effects (Incapacitated and everything that includes
  it).
- **`outcome`** (death, etc.): fire the appropriate combat outcome on trigger
  (Exhaustion level 6).
- **`reroll` / `damage_modifier` / `score_swap` / `grant_action`**: roll/action flow
  hooks, lower priority, implement last.
- v2 adds `roll_floor`, `critical`, `compel`, `deny`, `sense`, `proficiency`, `includes`,
  `apply_effect`, `remove_effect` and auras. The catalogue (§3) tags every shape A
  (automate here), P (prompt the DM) or D (reminder only) — implement tier A first.
- **Retire legacy reminders** once mechanical triggers are covered by the effects engine:
  `src/mixins/reminders.js`, `entity.reminders`, `Reminders.vue`, `TargetReminders.vue`
  are removed. User-authored custom reminders (`src/views/UserContent/Reminders/`) stay as
  a freeform-note feature. Existing `entity.reminders` in Firestore: shim or conversion
  script, as in 2i.

## 4. Effects form and constants
- Regenerate `src/utils/effectsConstants.js` from the v2 schema as the first task of this
  step: labels and descriptions for every sub-effect type, subtype, trigger and duration
  type, plus which fields each type shows (`value`/`roll`/`scaling`, `perspective`,
  filters, `effect` ref, `save`, `consume`…). The form reads these constants, not the
  schema, so they change together. Keep the constants in sync with the schema enums
  (a small check that every schema enum value has a constants entry is enough).
- Remove the `duration_type`/`duration_value` fields from `hk-effects-form.vue` - the
  definition form no longer captures duration at all (2c). Duration is captured in the
  Effects drawer (2a) and on monster/spell action effect references (steps 6–7).
- Rework `src/components/hk-components/hk-effects-form.vue` to support the full
  schema: new types/subtypes, conditional sub-effects, nested sub_effects arrays,
  trigger selection, and `includes` / `effect` refs that can pick SRD conditions.
- Support array-of-effects editing (an action or feature can have multiple effects).
- Add validation matching the schema (required fields per type/subtype).

## 5. SRD effect data files
- `src/data/5e/effects.js` and `src/data/5.5e/effects.js` contain non-condition SRD
  effects (Concentration to start). Add more as steps 3, 6 and 7 need them — the
  stress-test encodings from the catalogue (Hex, Bless, Haste, Warding Bond, Rage,
  Spirit Guardians…) are ready-made candidates and double as regression fixtures.
- `src/data/5e|5.5e/conditions.js` are done in 1b; fix mechanics there as step 3 exposes
  gaps.
- All files follow `hk-effects-schema.json` v2; every entry has a `url`, unique across
  both files of an edition.

## 6. Monster actions carry effects
- Extend the `action_list` sub-action shape in monster actions
  (`src/components/combat/actions/RollActions.vue`, monster docs in
  `src/store/modules/content/monsters.js`) to allow effects per sub-action - e.g. a
  damage roll sub-action plus a separate "apply Stunned" effect.
- Effect references per sub-action use `$defs/action_effects`, which mirrors the 2024
  save block: `save`, `on_fail`, `on_success`, `always` (plus `on_hit` / `on_miss` for
  attack rolls), each a list of `$defs/application`. Condition references are plain
  condition `url`s, resolved like any SRD effect. Grapples carry `duration.escape.dc`.
- Update monster/action edit forms (wherever actions are authored/edited) to use
  `hk-effects-form` for the new effects.
- Existing monster data (old `rolls`/`type` shape) must keep working unchanged.
- Develop and test against user NPCs (Firebase, user content) and local fixtures. Adding
  effects to SRD monsters served by the HK API is step 8.

## 7. Update action rolls to include effects
- Update `src/mixins/runEncounter.js` and `RollActions.vue` roll execution so that
  rolling an action also evaluates/applies its effects - e.g. on-hit writes a Stunned
  instance on the target, a failed save applies a spell effect with the action-defined
  duration.
- Decide UI for "this action also applies X - apply to target(s)?" confirmation step.
- Builds on the active-effects storage and trigger system from step 2.

## 8. HK API updates (last)
Everything above runs on local data. This step moves or aligns SRD data with the HK API.
The instance shape (`source: "srd"`, `source_key: <url>`) does not change, so no
Firestore migration is needed.

### 8a. Conditions
The HK API provides condition name, icon and rules text (`/conditions` and
`/conditions/5.5e`, all 15 conditions per edition as of 2026-09-29), but no structured
`sub_effects`. Decide one of:
- **Merge**: take display name/text from the API (`api_conditions/fetch_all_conditions`)
  and mechanics from `src/data/5e|5.5e/conditions.js`, joined on `url`; drop the
  local `name`/`description`.
- **Move**: add `sub_effects` (and `cancelable`, `includes`, Exhaustion leveling) to the
  API conditions and drop the local files.
Either way the 2e lookup helper is the only place that changes. The tracker, compendium
and `hk-condition-select` then share one source for condition text.

### 8b. SRD effects
Serve `src/data/5e|5.5e/effects.js` from the API (edition-aware), replacing the static
lookup in 2a/2e.

### 8c. SRD monsters
Backfill `$defs/action_effects` onto SRD monsters in the API. 5.5e monsters (330, all
with "Failure:/Success:" text, see 0a) are the best candidates for an automated backfill;
2014 monsters stay manual/heuristic.

## Suggested Order
0 (Concentration 2024 update, 5.5e monster re-scan — done, archived as effects-0-55e-alignment, 2026-09-29; 0b.2 is delivered by 2a/2e)
1 (schema v2 — done)
1b (SRD conditions data files: `url`s, fixes, Exhaustion leveling, includes — done, archived as effects-1b-srd-conditions-data, 2026-09-29)
2a -> 2b -> 2d -> 2e -> 2f (drawer incl. conditions, Firebase writes, instance shape, init loop, display)
2g -> 2h (trigger system + duration ticking, builds on 2f)
2i (replace legacy conditions UI, once 2a–2h are stable)
3 (mechanical resolution: bonuses, DoT rolls, condition mechanics; retire reminders - builds on 2g trigger bus)
4 (effectsConstants regeneration + EffectsForm rework, once step 2 data shape is proven)
5 (SRD effect data, grows alongside 3, 6 and 7)
6 -> 7 (monster actions + action rolls, additive on top of step 3)
8 (HK API updates: 8a conditions, 8b SRD effects, 8c SRD monster backfill)

## Workflow per step (from 2026-09-29)
Every remaining step (or sub-step, e.g. 2a) is handled as an OpenSpec change:

1. **Propose** — create the change with OpenSpec (`/opsx:propose`), named
   `effects-<step>-<short-name>` (e.g. `effects-2a-effects-drawer`). The proposal links
   back to this plan and the relevant sections of
   [effects-srd-catalogue.md](./effects-srd-catalogue.md). It lives in
   `openspec/changes/<change-name>/`.
2. **Implement** — work through its tasks (`/opsx:apply`).
3. **Archive** — once implemented and verified, archive the change (`/opsx:archive`).
4. **Mark done** — only after the change is archived, mark the step as done in this plan:
   add `(done — archived as <change-name>, <date>)` to the step heading and tick it in
   the Suggested Order.

A step is not done while its change is still open in `openspec/changes/`, even if the
code is merged. Steps completed before this workflow (step 1, schema v2) stay marked done
as they are.
