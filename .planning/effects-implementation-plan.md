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

### 2a. Effects drawer (done — archived as effects-2a-effects-drawer, 2026-09-29)
*As built:* spec `openspec/specs/effects-drawer`. Helpers in `src/utils/effectFunctions.js`
(`getSrdDefinitions`, `getRequiredChoices`, `buildEffectInstance`, `generateEffectKey`);
`runEncounter` `apply_effect` / `remove_effect` keep instances in memory only. The drawer
opens from an Effects option (hotkey `f`) next to Conditions. `caster_key` is the entity
whose turn it is (computed like `RunEncounter._active[turn]`, only when round > 0), not
the `actor` getter. The demo encounter's edition is now `"5.5e"` (was `"2024"`). Follow-up:
"+ opens the application popover, shift+click applies until removed (archived as
effects-2a1-apply-popover, 2026-09-30)".

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

### 2b. Firebase write - apply and remove effects (done — archived as effects-2b-persist-effects, 2026-09-29)
*As built:* spec `openspec/specs/effects-instance-storage`. Writes happen before the
tracker updates. A failed write is logged and leaves that target unchanged. Stored
instances are loaded raw in `add_entity` (2e adds resolution there). Encounter reset
clears NPC effects. Rules blocks are live on the **develop** database only: upload them
to production before releasing.

Write active effect instances to the Realtime Database, mirroring the HP storage split:

- **NPCs**: `encounters/{uid}/{campaignId}/{encounterId}/entities/{entityId}/effects/{effectId}`
  via a new `set_entity_effect` action (analogous to `set_entity_prop` used for HP).
  Encounter entities have no `$other` rule, so writes pass today; an `effects` rule block
  validates them.
- **Players / companions**: `campaigns/{uid}/{campaignId}/{players|companions}/{entityId}/effects/{effectId}`
  via a new action in `campaigns.js` (analogous to `update_campaign_entity` used for HP).
  These nodes end in `$other: false`, so the `effects` rule block is required.
- Remove: delete the effect key at the same path.
- The writes go inside the `runEncounter` `apply_effect` / `remove_effect` actions from 2a,
  at their `// 2b: persist here` markers (already behind the `!demo && !test` guard). The
  effect key is generated there with `generateEffectKey`.
- Effect ID: generate a short unique key at apply-time (same pattern used for reminder
  keys or Firebase `.push()` keys).

### 2c. Duration is application-time, not part of the effect definition (done — delivered by 1b, 2a and 2b, 2026-09-29)
*As built:* a design rule, not a change of its own. 1b removed duration fields from the
SRD definitions (the `effects-srd-data` spec forbids them and the validator checks it).
2a captures the duration in the drawer, defaulting to `cancelled`, and 2b saves it on the
instance. Still open, in other steps: `hk-effects-form.vue` still asks for
`duration_type` / `duration_value` (removed in step 4), and the legacy `duration_type`,
`duration_value` and `cancel_trigger` properties remain on the schema root until the form
stops writing them. `cancelable` is used from 2f.
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

### 2d. Active effect instance shape (done — archived as effects-2e-resolve-definitions, 2026-09-29)
*As built:* the instance shape was built in 2a and saved in 2b. The runtime half was
delivered with 2e, but **not** by attaching `sub_effects` onto the in-memory instance as
described below. Instance objects are shared with the cached encounter and campaign, and
whole-encounter writes (reset, encounter builder) would carry resolved fields into the
database, where the rules reject them. Resolved definitions live in
`runEncounter.effect_definitions`, keyed `source:source_key`, and are read through the
`entity_effects(key)` / `effect_definition(instance)` getters. Spec:
`openspec/specs/effects-runtime-resolution`. The campaign edition-change warning below is
still open (consider it with 2f/2i).
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
was knocked Prone. Stored at `encounters/{uid}/{campaignId}/{encounterId}`
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
`campaigns/{uid}/{campaignId}` under `players.player_1.effects` (persists across
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

### 2e. Extend encounter init to resolve sub_effects (done — archived as effects-2e-resolve-definitions, 2026-09-29)
*As built:* `findSrdDefinition`, `normalizeDefinition` (legacy custom `subeffects` /
`subtype`) and `resolveDefinition` (`includes` flattening with `from` tags, each
definition included once) are in `src/utils/effectFunctions.js`. The
`resolve_effect_definitions` action runs at the end of `init_Encounter` and after each
successful `apply_effect`. Unresolved definitions log one warning per encounter. See 2d
for where the result lives.
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

### 2f. Show active effects on combatant (done — archived as effects-2f-show-active-effects, 2026-09-29)
*As built:* spec `openspec/specs/effects-display`. Effect chips come after the legacy
chips in `combat/entities/effects` (new `effects` flag; no flag shows all kinds). The chip
list computed was renamed `effects` → `items` because of the prop. The badge shows the
Exhaustion level or `rounds_remaining`, and the tooltip uses `describeDuration`. Clicking a
chip opens `drawers/encounter/effects/ActiveEffect.vue`, which shows the duration, caster,
choices, repeat save and details (with "from" labels), the Exhaustion level table, and
Remove (hidden for `cancelable: false`). The player live view stays for 2i.
Update `src/components/combat/entities/effects/index.vue` (and `Effect.vue`) to render
`entity.effects` from runtime state:

- Show each effect's `name` (conditions with their `hki-<url>` icon, Exhaustion with its
  level), remaining duration, and a remove button.
- Alongside the legacy conditions and reminders display until 2i (conditions) and step 3
  (reminders) remove them.
- Clicking an effect opens a detail view or tooltip showing its description and
  `sub_effects`.

### 2g. Trigger system (done — archived as effects-2g-trigger-dispatcher, 2026-09-30)
*As built:* spec `openspec/specs/effects-triggers`. `runEncounter/fire_trigger` uses
`matchTriggers` (in `effectFunctions.js`) and queues prompts that
`EffectTriggerNotifier.vue` (mounted in `RunEncounter.vue`) shows with Details / Dismiss.
Nothing is automated.
- Turn triggers fire from `set_turn` only when combat moves forward (`turn_order` getter,
  `turn_entity` for the outgoing entity).
- HP triggers fire from `HpManipulations`, and hit/crit/save triggers from
  `hk-single-roll` apply.
- `on_check` fires from `hk-roll` checks on the card, the targeted panel and the legacy
  `ViewEntity`.
- `on_apply` and `on_condition_applied` fire from `apply_effect`.
- **Not built:** `short_rest` / `long_rest` (no rest feature exists; `TargetMenu.vue` turned
  out to be unused), and save/check *modifiers*, which are step 3, not triggers.
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

**Caster not in the encounter (raised in 2b, decided and built in 2g):** the fallback
below is implemented in `matchTriggers`. Player and companion
effects live on the campaign and carry over between encounters, but their `caster_key`
may point to an entity that isn't in the current encounter. NPC keys are new in every
encounter, so an NPC caster is never found again. Player keys are stable, so a player
caster is found when present. With the caster absent, `start_turn_caster` /
`end_turn_caster` never fire for that effect. Rule: when `caster_key` doesn't
match an entity in the running encounter, the dispatcher fires caster-anchored triggers
on the target's own turn instead (`start_turn_caster` → `start_turn_target`,
`end_turn_caster` → `end_turn_target`). The duration side is in 2h.

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

### 2h. Duration ticking and expiry (split into 2h1 and 2h2)
**2h1 — timing, cancel triggers, end conditions, cascade, missing caster (done — archived as
effects-2h1-duration-expiry, 2026-09-30).** Spec `openspec/specs/effects-durations`.
- `durationActions` / `endsWhenExpiries` / `cascadeTargets` / `carriedOverReview` /
  `hasCondition` / `evaluateConditionSet` live in `effectFunctions.js`. `fire_trigger`
  applies them. Ticks use `set_effect_prop`, and ends go through `remove_effect` with a
  `reason`, which saves, announces and cascades.
- Automatic ends are removed right away, with a short notice. Hand removals only announce
  their cascade.
- The drawer offers "Ends with <caster>'s Concentration", which sets `concentration_id`.
- **Assumption for steps 6–7:** `caster_key` means "the entity whose turn it was when the
  effect was applied". The same-turn skip for `next_turn` / `edge: "end"` relies on it.
  An out-of-turn applier (a reaction) needs a separate `applied_turn` field.
  - Resolved in 2j: `applied_turn_key` stores the entity whose turn it was, and the caster
    is chosen in the drawer.
- **Known issue (2026-09-30): going back a turn desyncs timed durations.**
  `rounds_remaining` is ticked at the end of the anchor's turn and saved, and going back
  a turn undoes nothing (by design, spec "Going back a turn undoes nothing"). After going
  back and forward again, a timed effect has been ticked twice for the same turn. Expired
  or cascaded effects stay removed.
  - Options considered:
    - *Derive* the remaining rounds from `applied_round`. Rejected for now: it needs an
      `applied_turn` field (schema + rules), breaks on turn-order changes, and breaks
      carry-over between encounters, where round numbers restart.
    - *Undo the tick* on previous turn: re-opening an entity's turn gives +1 round to the
      timed effects anchored to it, capped at the full duration. A small follow-up change
      if it matters in play.
- Not in 2h1: `ends_when` checks that need distance, sight or senses, and expiry for
  `rest` / `dawn` / `trigger` / `special`.

**2h2 — repeat saves, escape, on_expire (done — archived as effects-2h2-repeat-saves,
2026-09-30).** The `duration.save` bullets below (prompts,
`on_fail`, `advantage_on_triggers`, `costs_action`, counters and `escalate`,
`auto_success_after`), `duration.escape`, `duration.on_expire`, and expiry for
`save_ends`. Spec `openspec/specs/effects-durations` (and `effects-drawer` for the form).
- `resolveRepeatSave` / `escalationInstance` / `onExpireLines` live in `effectFunctions.js`.
  The store actions are `resolve_repeat_save` and `escape_effect`. Rolls use the
  `effectRolls` mixin.

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

**Caster not in the encounter (raised in 2b; triggers decided in 2g; points 1–3 done in
2h1).** All three points below are built. The fallback also covers an instance with no
caster at all. Keep in the review clears `caster_key` / `concentration_id`, so the effect
runs on its holder's turns and isn't reviewed again. Without its
caster, a carried-over timed effect would never tick down, a caster-anchored
`next_turn` would never expire, and the `concentration_id` cascade breaks when the
Concentration instance lived on an NPC of an earlier encounter. Built:
1. **Fallback anchor**: if `caster_key` isn't in the running encounter, treat
   caster-anchored timing as target-anchored. `time` ticks on `end_turn_target`, and
   `next_turn` with `anchor: "caster"` expires on the target's `{edge}` turn. No effect
   gets stuck.
2. **Review on encounter init**: list carried-over instances whose duration is not
   `cancelled` and whose caster is absent (including a `concentration_id` that points to
   no loaded instance), and let the DM keep or remove each one. This matches the table:
   the DM decides whether Bless is still running.
3. **Denormalize the caster's name**: store `caster_name` on the instance at apply time,
   so the UI can show "from Goblin (not in this encounter)" without a lookup. This needs
   `caster_name` in `$defs/active_instance`, in the Firebase rules `effects` blocks, and
   in `buildEffectInstance`.

### 2i. Replace the legacy conditions UI (done — archived as effects-2i-replace-legacy-conditions, 2026-09-30)
Once 2a–2h are stable, conditions run only through the effects model:

**As built.** Specs: `effects-drawer`, `effects-display`, `effects-instance-storage` and the
new `effects-player-view`.
- Legacy maps are converted when an encounter loads (`convert_legacy_conditions`).
- The Conditions option opens the Effects drawer in conditions mode, and the Effects option
  no longer lists conditions.
- The live view shows all effects under the "Conditions and effects" setting.
- The database rules still accept a `conditions` node, which can go in a later cleanup.

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

### 2j. Concentration on the caster, and choosing the caster (done — archived as effects-2j-concentration-caster, 2026-10-02)
Found while testing 3c1 (2026-10-02). The change also takes in the temporary HP follow-up
below.

**As built.** New main spec `effects-concentration`; `effects-drawer`, `effects-durations`,
`effects-stat-modifiers` and `effects-instance-storage` updated.
- Caster select in the application form (every entity + None, default the active entity).
- Concentration on the caster: start, share for the same effect, replace a different one
  after a warning, link to or replace a Concentration of unknown effect
  (`concentration_for`). Its "up to" time counts down as a `time` duration.
- Unlinked Concentration durations count down their own "up to" time.
- `applied_turn_key` for the same-turn rule (falls back to `caster_key`). This resolves 2h1's
  "Assumption for steps 6–7".
- Temporary HP with `expires_with_effect` (Heroism, 2014 False Life) are removed when their
  effect ends (`temp_hp_granted`).
- Added on request: effect notifications show a small condition or effect icon instead of
  snotify's large icon, and titles are no longer truncated.
- New instance fields are in the schema and the database rules. **The rules must be
  uploaded to production before release.**

**Today:**
- An effect applied with duration **Concentration** has no expiry. Its "up to" time is
  stored but never counted down.
- It can be linked to its caster's Concentration ("Ends with <caster>'s Concentration",
  `concentration_id`), but only when the caster already has a Concentration instance.
- Nothing is applied to the caster. The DM has to apply Concentration to the caster first,
  then the spell effect, or the Concentration isn't tracked.

**To do:**
1. **Concentration on the caster.** When an effect is applied with a `concentration`
   duration and a caster in the encounter:
   - when the caster has no Concentration instance, apply one to the caster automatically,
     with the same "up to" time
   - link the target's instance to it (`concentration_id`)
   
   Applying one spell to several targets (Bless on three creatures) shares one Concentration
   instance on the caster.
2. **One Concentration at a time.** When the caster already concentrates on a *different*
   spell, starting a new one ends the old Concentration first, after the DM confirms. Its
   linked effects end through the existing cascade (2h1), with a notice.
   - Telling "the same casting" from "a new spell" needs something to compare. For example,
     store the spell/effect the Concentration is for on the Concentration instance (a
     `concentration_for` / `source_key` field: schema `$defs/active_instance` + rules), or
     ask the DM.
3. **"Up to" time limit.** The caster's Concentration instance counts down like a `time`
   duration (on `end_turn_caster`, holder fallback as in 2h1). When it runs out,
   Concentration ends and the cascade removes the linked effects.
4. **Choose the caster in the drawer.** Today the caster is whoever's turn it is
   (`turnEntityKey`, 2a), which is wrong for spells applied out of turn (reactions, pre-cast
   buffs before combat, the DM catching up). The drawer gets a caster select that defaults
   to the active entity, and includes "none". This also fixes formulas that read the caster
   (`caster.spellcasting_mod`, Heroism), and 2h1's same-turn rule for `next_turn`
   durations, which assumes the applier is the active entity (see 2h1 "Assumption for
   steps 6–7").

Related follow-up (done in 2j):
- **Temporary HP that ends with its effect** (`expires_with_effect`: 2014 False Life,
  Heroism). Before 2j they stayed when the effect ended (3b non-goal). Solved by storing
  the granted amount on the instance.

### 2k. Reaction Used as an effect (done — archived as effects-2k-reaction-used, 2026-10-05; spec `openspec/specs/effects-reaction-used`)
Raised while testing 2j (2026-10-02).

Decided in the proposal:
- Legendary actions are excluded.
- Not applied directly (changed after the first build, 2026-10-05): a prompt
  "<actor>: Reaction used?" offers Apply / Dismiss, one open prompt per entity. A
  "Reaction Used" tag is shown in the actor's details bar (after its name) and in the Select
  Actor list.
- Regaining the reaction at the start of its next turn isn't announced (no notice).
- Still open, unchanged: points 4 (retire the premade reaction reminder, now in step 9) and the
  optional `restrict` on reactions (3e).

**Today:** "Reaction used" is only a legacy premade reminder. It is in `src/mixins/reminders.js`
(`premade.reaction`), removed at the start of the entity's turn. The legacy
`combat/legacy/actions/Actions.vue` warns "Reaction used" when the chosen actor has that
reminder. It isn't an effect, and nothing applies it automatically.

**To do:**
1. **A "Reaction Used" effect definition.** A tracker effect rather than an SRD condition,
   in both editions' `src/data/*/effects.js`. Its duration is `next_turn` with
   `anchor: "target"` and `edge: "start"`, so it ends at the start of the holder's next turn,
   when the reaction is regained. It has no mechanical sub-effects; it's a marker.
   - Optionally, a `restrict` on reactions once 3e exists.
2. **Applied automatically for actions out of turn.** When an entity is the selected actor
   (the current actor) of an action while it isn't its turn, the tracker applies Reaction
   Used to it. The actions are:
   - rolling an action (`rollAction`, monster actions)
   - rolling a spell
   - manual damage or healing ("done by")

   This covers reactions such as an opportunity attack, Shield or Hellish Rebuke.
   - **Applied by the target:** the instance's caster is always the entity itself
     (`caster_key` = holder), never the entity whose turn it is. Its timing is the holder's
     own turns, and it is listed as self-applied.
   - Not applied when the entity already has Reaction Used (one instance), or on its own turn.
   - Before combat (no one has the turn), nothing is applied.
   - **To decide in the proposal:**
     - whether the DM gets a notice or undo (an out-of-turn roll isn't always a reaction:
       legendary actions, lair actions, the DM catching up on a missed turn)
     - whether legendary actions are excluded. They're taken outside the creature's turn but
       don't use its reaction, so they probably should be.
3. **Show it where the actor is chosen.** The "Reaction used" warning reads the effect
   instead of the reminder, and the action/roll UI marks an actor that has already used its
   reaction.
4. **Retire the premade reaction reminder** (with step 9, formerly 3f), converting existing reminders like
   the legacy conditions (2i) if needed.

Find during the proposal: where the current (non-legacy) tracker sets the actor of a roll
or of manual damage/healing (`setActionRoll` / `roll.current`, the `doneBy` of
`setHP`), and `turnEntityKey` for "not its turn".

## 3. Apply mechanical bonuses and resolve trigger actions (split into 3a–3g)
Each sub-step is its own OpenSpec change:
- **3a — damage and healing sub-effects** (done — archived as effects-3a-damage-over-time,
  2026-09-30; spec `openspec/specs/effects-damage-healing`): a Roll button on trigger, repeat-save `on_fail` and `on_expire` prompts. It
  rolls the sub-effect (dice, value or formula, level scaling, chosen damage type) and opens
  it in the existing roll dialog against the recipient (`self` / `caster` /
  `trigger_source`), so defenses, save for half, the log, meters and HP triggers are reused.
  Adds a safe formula evaluator and the 5.5e Burning hazard.
- **3b — numeric modifiers** (done — archived as effects-3b-numeric-modifiers, 2026-10-01;
  specs `openspec/specs/effects-stat-modifiers`, and `spellcasting_mod` in
  `effects-damage-healing`):
  `bonus` / `base` / `fixed` / `floor` / `cap` / `multiplier` on AC, all Speeds, max HP
  (derived, with current-HP clamping and `also_heal`), initiative, passive Perception, spell
  DC/attack and ability scores, through one pure `effectiveStats` and an `effective_entity`
  getter. Values changed by effects are marked with a tooltip. Temp HP is granted from a
  prompt button. DM tracker only; the player live view keeps stored values.
  - *Added during apply:* the DM's manual bonuses became labelled lists,
    `bonuses.<value>.<id> = { value, label }`, for every value above. Old `ac_bonus` /
    `maxHpMod` are read as a "Manual" bonus and replaced on the first change. The values
    show in the same tooltip as effects, and a bonuses drawer opens from the card. See
    "Manual bonuses for later values" below.
- **3c — roll modifiers** (done: 3c1 and 3c2 archived): `advantage` / `disadvantage` (incl. `against`), dice and flat
  roll bonuses (Bless), the 2024 Exhaustion penalty, and `auto_fail` / `auto_success` at
  the roll sites.
  - Give the flat roll bonuses the same manual treatment as 3b: skills first, then saving
    throws, ability checks, attack and damage rolls, death saves and Concentration saves.
    See "Manual bonuses for later values".
  - **Split into 3c1 and 3c2:**
    - **3c1 — checks, skills, saves and initiative** (done — archived as
      effects-3c1-check-save-modifiers, 2026-10-02; main spec `effects-roll-modifiers`).
      Advantage/Disadvantage, flat and dice bonuses, auto-fail/success, single-use modifiers,
      and reminders for what the tracker can't check. Manual `skill_*`, `check_*`, `save_*`,
      `death_save` and `concentration_save` bonuses. Also fixes roll-dialog saves comparing
      the dice instead of the total. Added during testing: Concentration saves rolled from
      the damage prompt with the evaluated DC, and the SRD Bless, Bane, Guidance and
      Resistance effects.
    - **3c2 — attack and damage rolls** (done — archived as
      effects-3c2-attack-damage-modifiers, 2026-10-05; specs `effects-roll-modifiers`,
      `effects-stat-modifiers`).

      As built:
      - Attack to-hits use the attacker's and the target's modifiers. In an attack the
        other party is known (counterpart conditions, 5.5e Grappled's `is_caster`).
      - Melee/ranged assumes the distance (Prone, incoming crits).
      - Effect crits (crit range, incoming crit) follow the Critical Hits setting.
      - Damage bonuses on hits are separate named damage rolls.
      - Single-use modifiers are used once per action.
      - Manual `attack` / `damage` bonuses.
      - Fixed: `resolveDefinition` dropped `magical`, which 3c1's magical saves needed.

      Added during testing:
      - bonus dice inline in the roll dialog's to-hit line, and roll cards capped at 300px
      - attack reminders for every actor in the details bar (Reaction Used first, red; a
        green A / red D; to hit, crit, damage, reminder count)
      - the bonuses drawer's add form at the top

      Decided at proposal:
      - melee attacks count as within 5 ft, ranged as beyond
      - effect crits: crit range and incoming crits
      - manual `attack` / `damage` bonuses only
      - SRD test effects: Guiding Bolt, Divine Favor, Magic Weapon, Dodge and Help

      Scope:
      - the attacker's modifiers and "against" modifiers (Blinded, Dodge, Prone)
      - damage bonuses and next-attack effects (Guiding Bolt)
      - manual `attack` / `damage` bonuses
- **3d — defenses** (done — archived as effects-3d-defenses, 2026-10-05; spec
  `openspec/specs/effects-defenses`): `defense` r/v/i on damage, and condition immunity.

  As built:
  - `effectiveDefenses` (on the effective entity) combines the creature's own defenses with
    its effects'
  - the roll dialog, manual damage (actor panel, top bar, Targeted panel, legacy panel) and
    the card use them
  - `apply_effect` skips immune targets and ends conditions a new immunity covers
  - the drawer's damage-type choice offers an effect's own types (Protection from Energy)

  Fixed during testing: the roll dialog's defense snapshot (taken in `data()` before the
  `roll` computed existed), and the manual damage amounts that used the raw entity.

  Not done, for later:
  - immunity through included conditions
  - `mechanics` immunities
  - `damage_modifier` (3g)

  Decided:
  - an immune target is skipped with a notice, and its own `condition_immunities` count too
  - gaining an immunity ends the condition, with a notice
  - resistance and vulnerability to the same type cancel; immunity wins
  - test effects: Stoneskin and Protection from Energy
- **3e — `restrict` and `outcome`**: action disabling, Exhaustion 6. **Done** — archived as
  `openspec/changes/archive/2026-10-06-effects-3e-restrictions-outcomes`. New spec
  `effects-restrictions`. Decided:
  - restricted rolls ask the DM to confirm (Roll anyway / Cancel)
  - manual damage and healing are confirmed too (Apply anyway)
  - restrictions show as chips in the details bar after Reaction Used
  - death (Exhaustion 6) is a prompt with Mark dead, which sets 0 HP (and dead for players)
  - Concentration breaks by itself at 0 HP, without a save prompt
  - Charmed's attack restriction gets an `is_caster` condition (data fix)
  - the targets overview shows dead players as "Dead" instead of a health bar

  Not done, for later: triggered restrictions (Haste's lethargy), `limit` (Slow's one
  attack), `compel` / `deny`, and the other outcomes (still reminders).
- **3f — moved to step 9** (2026-10-06): retiring the legacy reminders that effects
  replace is part of the encounter reminders rework.
- **3g — tier-P hooks**: `reroll`, `damage_modifier`, `score_swap`, `grant_action`, and the
  rest. **Done** — archived as
  `openspec/changes/archive/2026-10-09-effects-3g-tier-p-hooks`. New spec
  `effects-damage-modifiers`. Decided:
  - reduce / halve / negate are per-target toggles in the roll dialog and manual damage,
    off by default
  - drop to 1 (Death Ward, Undead Fortitude) is automatic with a notice; one with a save
    holds at 1 and prompts for it
  - Evasion and Absorb are automatic
  - roll floors are applied automatically
  - rerolls are offered (a toast button, or a note in the roll dialog), never applied by
    themselves
  - extra actions are chips in the details bar
  - the rest (`compel`, `deny`, `sense`…) are counted in the reminders chip
  - test effects: Death Ward, Uncanny Dodge, Evasion, Reliable Talent, Lucky/Luck, Undead
    Fortitude, Acid Absorption

  Fixed during testing: the roll dialog showed toggles for every damage type, a switched-on
  toggle was ignored for damage without a type, the result line didn't show the
  reduction, the prompts were amber in dark mode, and roll floors didn't mark the card.

  Not done, for later:
  - `frequency` ("once per turn") isn't tracked
  - Reliable Talent's proficiency requirement (the floor applies to every skill)
  - rerolls don't mark values on the card
  - trait-like test effects move to special abilities (6b, "Generic effects")

### Manual bonuses for later values
Every value that effects can add a flat bonus to should also accept manual bonuses from the
DM. That way the DM's bonuses and the effects' bonuses add up in one place, show in the
same tooltip, and can be edited in the same bonuses drawer. Since 3b this covers:
- AC
- the Speeds
- max HP
- initiative
- passive Perception
- spell save DC and spell attack
- the six ability scores

**Next candidates.** These come mostly with 3c, as each gets effect bonuses:
- **Skills**: a bonus per skill (Guidance-like, or a +1 skill item). This is the most
  requested.
- **Saving throws** per ability (Cloak of Protection: all saves) and **ability checks** per
  ability.
- **Attack rolls** and **damage rolls**. Possibly per attack type (melee, ranged, spell),
  matching the `attack_types` filter.
- **Death saves** and **Concentration saves**.

**What adding a value takes** (the 3b pattern):
- Add its key to `BONUS_LABELS` in `src/utils/entityFunctions.js` (this also extends
  `BONUS_VALUES`).
- Add it to the `$stat` regex of the three `bonuses` rules blocks in `firebase-rules.json`
  (campaign companions, campaign players, encounter entities), and upload the rules.
- Map it in `effectiveStats` (`statFields`) to the field or modifier it changes.
- Map it in the `StatBonuses.vue` drawer (`field` and the stored value).
- Make it clickable where it's shown (the card's skill list, saves and so on).

**Keys.** Use snake_case keys with a prefix, so they stay valid Firebase keys and simple to
match in the rules:
- `skill_<skill>`: `skill_athletics`, `skill_animal_handling`, `skill_sleight_of_hand`. The
  skill names in the data contain spaces and capitals ("animal Handling"), so they need
  converting.
- `save_<ability>`, `check_<ability>`
- `attack`, `damage` (or `attack_melee`…)
- `death_save`, `concentration_save`

A bonus on every save or every check could use `save_all` / `check_all`.

**Open question for 3c.** Roll bonuses have no stored value the way AC does: the drawer's
"Stored" line would be the computed modifier (for example the skill modifier from ability,
proficiency and `skill_modifiers`). Decide whether NPCs' existing stat-block
`skill_modifiers` stay stat-block data (likely), or show as a read-only line in the drawer.

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
- **Roll sites for save/check modifiers** (found in 2g): ability checks, saves and skills
  are rolled through `hk-roll` in `Card/CardDetails.vue`, `Card/CardSkills.vue`,
  `Targeted.vue` (MOD/SAVE per targeted entity) and the legacy `ViewEntity.vue`. Target
  saves against a DC are rolled in `hk-single-roll.vue`. These are the places where
  `auto_fail`, `advantage` / `disadvantage` on `save` / `d20_test` and the 2024 Exhaustion
  penalty have to change the roll. In 2g they are intentionally not triggers (they are
  always-on modifiers, not events).
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
- **Legacy reminders: not retired here** (decided 2026-10-06; the former 3f is now part of
  step 9). The reminders system stays and step 9 reworks it. Until then everything keeps
  working:
  - `src/mixins/reminders.js`
  - `entity.reminders`
  - `Reminders.vue` and `TargetReminders.vue`
  - user-authored reminders (`src/views/UserContent/Reminders/`)
  - the premade reminders that duplicate an effect, such as "Reaction used"

## Generic effects (direction for steps 4–7)
Decided 2026-10-09. Effect definitions should be generic building blocks. The details
(damage type, ability, amount…) are set when the effect is linked to an action or spell, or
applied by hand in an encounter. They shouldn't be baked into a separate definition.
- **One definition per mechanic, not per creature or spell.** There should be one
  "Absorption" effect, not "Acid Absorption". When it's linked to a monster's action or
  applied by hand, acid is chosen. The same goes for damage resistance or reduction (the
  Resistance spell, Stoneskin) and similar effects with one parameter.
- **Choices are set at two moments:**
  - **When linking** to an action, spell or trait (steps 6–7): the author can fix a choice.
    A clay golem's Absorption is acid.
  - **When applying**: a choice the link leaves open is asked when the effect is applied,
    in the drawer or from the roll. The Resistance spell lets the caster pick the damage
    type, so the spell doesn't define it; it's chosen when the spell's effect is applied.
  - An unset choice is always asked. A fixed one is not.
- **Already in place:** `$defs/application.choices`, `active_instance.choices`, and
  sub-effects that read a choice with `choice` (5.5e Resistance's `choice: "damage_type"`).
  `damageModifiers` already narrows a toggle to the chosen type. What's missing:
  - the schema can't mark a choice as fixed by the link vs. open until applied
  - the definitions are still one per case (`Acid Absorption`, and Stoneskin with fixed
    types)
  - forms where an action or spell link sets or leaves open the choices
- **Where it lands:**
  - 4 (form): define choices on a generic definition.
  - 5 (SRD data): collapse per-case definitions into generic ones with choices. Keep the
    existing `url`s working (alias or migrate the instances in Firestore).
  - 6–7 (actions): set or leave open the choices on each link, and ask for the open ones
    when the effect is applied.

## 4. Effects form and constants
- Regenerate `src/utils/effectsConstants.js` from the v2 schema as the first task of this
  step: labels and descriptions for every sub-effect type, subtype, trigger and duration
  type, plus which fields each type shows (`value`/`roll`/`scaling`, `perspective`,
  filters, `effect` ref, `save`, `consume`…). The form reads these constants, not the
  schema, so they change together. Keep the constants in sync with the schema enums
  (a small check that every schema enum value has a constants entry is enough). The same
  check should cover the Firebase rules: the `effects` blocks in `firebase-rules.json`
  (encounter entities, campaign players and companions, added in 2b) copy the
  `$defs/duration.type` enum into a regex.
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

## 6b. Trait effects: effects on NPC special abilities
Decided 2026-10-09. Some effects aren't applied with a duration. They're part of what a
creature is, like a clay golem's Acid Absorption, Undead Fortitude or Magic Resistance.
In 3g the DM applies these through the Effects drawer, so they show up in the creature's
effects and conditions as if they were cast on it. They belong on the ability instead.
- **Data:** a `special_abilities` entry can carry `effects`, a list of effect links (the
  effect and its choices, no duration). They follow "Generic effects": the golem's
  Absorption is linked with acid fixed. Extend `hk-npc-schema.json` and the NPC form
  (with step 6's action effects).
- **Combat tracker:** trait effects work like applied effects (triggers, damage modifiers,
  roll modifiers, restrictions, drop to 1), but they aren't stored in `entity.effects`.
  - The engine loops over `entity.effects` in many places (`effectFunctions.js`:
    `activeDefinitions`, the trigger, modifier and defense collectors). Route them all
    through one helper that yields the applied instances plus the trait instances. Derive
    the trait instances from the NPC's abilities: `source: "trait"`, keyed by the ability.
  - They have no duration, don't tick, don't expire and can't be removed in the drawer.
    A `condition` on the effect still switches them off (Evasion while Incapacitated).
- **Display:** not in the effects or conditions list on the card, the drawer or the live
  view. The special ability shows that it's automated. Prompts and toasts name the ability
  ("Undead Fortitude"), as they already do.
- **Open questions:**
  - Where per-encounter use state lives for traits that are consumed or limited
    (Legendary Resistance 3/day). Maybe reuse the ability's `limit` / `limit_type` counters
    instead of `consume`.
  - Player and companion features (Evasion, Uncanny Dodge, Reliable Talent, Lucky) are the
    same kind of always-on effect. Decide whether they get trait effects too, and where
    they're stored on the character.
- **Cleanup:** the 3g test effects that are really traits (Acid Absorption, Undead
  Fortitude, Evasion, Uncanny Dodge, Reliable Talent, Lucky) move to trait links when this
  lands. They become generic definitions under "Generic effects" (step 5).
- **8c:** the SRD monster backfill adds trait effects as well as action effects.

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

## 9. Encounter reminders on triggers (separate feature, after the effects)
Idea, 2026-10-06. Build it once the effects work above is done. Turn reminders into actual
reminders: the DM sets them on an encounter trigger, not on an entity, and the tracker
shows them when the trigger fires. Examples:
- "Round 3: the boss changes tactics, and may flee"
- "Round 5: a sandstorm starts. Blind everyone."

Ideas to work out when it's proposed:
- **Triggers:** reuse the 2g trigger bus (round start, turn start/end, `combat_start`), and
  add encounter-level ones such as "round N" or "every N rounds". Entity triggers such as
  "boss bloodied" are optional.
- **Display:** a prompt when the trigger fires, like the effect prompts. A prompt could
  offer to apply an effect to chosen or all entities (the sandstorm's Blinded).
- **Storage:** reminders belong to the encounter, not to `entity.reminders`.
- **Legacy reminders (the former 3f):**
  - Retire the premade reminders that effects now cover: "Reaction used" (2k point 4), and
    any that duplicate a condition or effect.
  - The remaining entity reminders (`entity.reminders`, `src/mixins/reminders.js`,
    `Reminders.vue`, `TargetReminders.vue`) and the user-authored reminders
    (`src/views/UserContent/Reminders/`) become this feature or move into it.
  - Existing `entity.reminders` in Firestore need a shim or a conversion script, as in 2i.

## Suggested Order
0 (Concentration 2024 update, 5.5e monster re-scan — done, archived as effects-0-55e-alignment, 2026-09-29; 0b.2 is delivered by 2a/2e)
1 (schema v2 — done)
1b (SRD conditions data files: `url`s, fixes, Exhaustion leveling, includes — done, archived as effects-1b-srd-conditions-data, 2026-09-29)
2a (done — archived as effects-2a-effects-drawer, 2026-09-29) -> 2b (done — archived as effects-2b-persist-effects, 2026-09-29) -> 2c (done — delivered by 1b, 2a and 2b, 2026-09-29) -> 2d (done — archived as effects-2e-resolve-definitions, 2026-09-29) -> 2e (done — archived as effects-2e-resolve-definitions, 2026-09-29) -> 2f (done — archived as effects-2f-show-active-effects, 2026-09-29) (drawer incl. conditions, Firebase writes, duration rule, instance shape, init loop, display)
2g (done — archived as effects-2g-trigger-dispatcher, 2026-09-30) -> 2h1 (done — archived as effects-2h1-duration-expiry, 2026-09-30) -> 2h2 (done — archived as effects-2h2-repeat-saves, 2026-09-30) (trigger system + duration ticking, builds on 2f)
2i (done — archived as effects-2i-replace-legacy-conditions, 2026-09-30)
3 (mechanical resolution: bonuses, DoT rolls, condition mechanics - builds on 2g trigger bus; retiring reminders moved to 9): 3a (done — archived as effects-3a-damage-over-time, 2026-09-30) -> 3b (done — archived as effects-3b-numeric-modifiers, 2026-10-01) -> 3c1 (done — archived as effects-3c1-check-save-modifiers, 2026-10-02) -> 2j (done — archived as effects-2j-concentration-caster, 2026-10-02, incl. temp HP expiry) -> 2k (done — archived as effects-2k-reaction-used, 2026-10-05) -> 3c2 (done — archived as effects-3c2-attack-damage-modifiers, 2026-10-05) -> 3d (done — archived as effects-3d-defenses, 2026-10-05) -> 3e (done — archived as effects-3e-restrictions-outcomes, 2026-10-06) -> 3g (done — archived as effects-3g-tier-p-hooks, 2026-10-09) (3f moved to 9)
4 (effectsConstants regeneration + EffectsForm rework, once step 2 data shape is proven; 4–7 follow "Generic effects")
5 (SRD effect data, grows alongside 3, 6 and 7)
6 -> 6b -> 7 (monster actions, trait effects on special abilities, action rolls; additive on top of step 3)
8 (HK API updates: 8a conditions, 8b SRD effects, 8c SRD monster backfill)
9 (encounter reminders on triggers, incl. the former 3f: a separate feature, after the effects are done)

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
