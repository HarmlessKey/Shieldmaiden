# Effects Feature - Implementation Plan

Builds on [.planning/effects-schema.md](./effects-schema.md) and
[effects-srd-catalogue.md](./effects-srd-catalogue.md). Goal: a unified "Effects" model that
drives spell/feature/item/monster effects and combat tracker behavior, and — as the final
step — replaces the current ad-hoc condition/reminder system.

**Each step is implemented as an OpenSpec change and marked done only once that change is
archived** — see "Workflow per step" at the end of this plan.

**Conditions come last.** Steps 0–7 implement effects fully without changing conditions:
the existing conditions drawer, `entity.conditions`, the `api_conditions` store and the HK
API stay exactly as they are. Step 8 moves conditions onto the effects model. No HK API
change is needed for any step (see 8a).

## Working with conditions before step 8
Effects touch conditions in three ways. All three work against the existing
`entity.conditions` map, because condition slugs (`"prone"`, `"incapacitated"`) are
identical across editions and equal to the keys effects use:

- **Reading** — condition checks such as `{ type: "has_condition", value: "incapacitated" }`
  (Rage ends when Incapacitated, Aura of Protection is inactive while Incapacitated,
  Grappler's Advantage vs a creature you grapple) read `entity.conditions`.
- **Applying** — an action or effect that applies a condition (`action_effects` with
  `source_key: "stunned"`, `apply_effect` of Frightened, repeat-save `escalate` to
  Unconscious) calls the existing `set_condition` action instead of writing an effect
  instance. Duration handling for such a condition is a reminder until step 8.
- **Including** — `includes` references to a condition (Turned includes Frightened +
  Incapacitated, Crawler Mucus includes Poisoned + Paralyzed) resolve to nothing: the
  engine shows the condition name on the effect and prompts the DM to set the condition
  through the existing drawer. No mechanics are applied for it by the effects engine.

General rule for the resolver (2e): **an unresolved `effect_ref` is never an error** —
show its `name`, apply no mechanics, log it once.

## 0. 5.5e (2024) alignment — effects part
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
  which *content* (spells, stat block) the entity uses. Effects are table rules, so they
  resolve from the campaign edition's data file. Same rule the shipped conditions drawer
  already follows.
- **5.5e monsters are live** (330, `srd 5.2.1`, `/monsters/5.5e/...`), with
  `initiative_modifier`, `gear`, `bonus_actions`, and the 2024 structured action text
  (see 0a).

### 0a. What the 2024 monster corpus changes (scan of all 330 5.5e monsters)
2024 stat blocks are far more regular than 2014 ones, which directly helps steps 6/7:
- **Structured saves**: `"<Ability> Saving Throw: DC N, <targets>. Failure: ... Success:
  ... Failure or Success: ..."` (198 Failure / 113 Success / 24 Failure-or-Success
  blocks). An action's effect references split into `on_fail` / `on_success` / `always`
  instead of free-text guessing. 80 are "Success: Half damage".
- **"has the X condition"** phrasing (180 hits) — reliable condition detection for step 6.
  Most common: Prone 59, Grappled 42, Incapacitated 40, Restrained 34, Poisoned 28.
- **Escape DC** inline on Grappled: `"Grappled condition (escape DC 14)"` (39).
- **Next-turn durations are anchored to different entities**: "until the start of the
  assassin's next turn" (owner/caster, 41) vs "until the end of its next turn" (target,
  31) — `duration.anchor` / `edge` (2h).
- **Repeat saves happen at end of turn**: "repeats the save at the end of each of its
  turns" (14), 0 at start of turn — default `save.triggers: ["end_turn_target"]`.
- **Escalating saves**: "First Failure: Restrained ... Second Failure: Petrified"
  (basilisk), brass dragon sleep breath (Incapacitated → Unconscious) — 12+.
  `repeat_save.escalate`.
- **Bloodied** (HP ≤ half max) is a 2024 keyword (18): "While Bloodied, the berserker has
  Advantage on attack rolls", "+damage if the target is Bloodied", reactions triggered on
  becoming Bloodied — `bloodied` condition check + `on_bloodied` trigger. Works for both
  editions.
- **Reactions** use `"Trigger: ... Response: ..."` (21) — maps to the trigger enum.
- Nested state: "While Grappled, the target has the Restrained condition" (crocodile) —
  linked via `parent_id` cascade (2d/2h).

### 0b. Remaining step-0 work
1. Update Concentration in `src/data/5.5e/effects.js` to 2024 rules: save DC capped at 30,
   and Concentration ends when the holder is Incapacitated (a `has_condition` check on
   `entity.conditions`, see "Working with conditions before step 8").
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
conditions data is migrated in step 8.

## 2. Apply and track effects in the combat tracker
Build this ahead of the form/monster-action work to validate the data model and
active-effects lifecycle end-to-end. Step 2 covers everything needed to apply effects,
show them, fire triggers, and tick durations. Applying the mechanical bonuses (stat
modifiers, DoT rolls, etc.) is step 3.

### 2a. Effects drawer
Create `src/components/drawers/encounter/Effects.vue` - the UI from which a DM applies
an effect to one or more targeted entities, modelled on the existing Reminders drawer:

- Lists available effects grouped by source:
  - **SRD effects** from `src/data/5e/effects.js` or `src/data/5.5e/effects.js`
    (e.g. Concentration). Selected by campaign `edition` (`"5e"` / `"5.5e"`) via the
    `runEncounter` `edition` getter.
  - **Custom effects** from the user's Firebase Realtime Database
    (`src/store/modules/userContent/effects.js` / `src/services/effects.js` already
    exist for this). Custom effects are edition-agnostic and always shown.
- Conditions are not listed; the existing `Conditions.vue` drawer stays the way to apply
  them until step 8. The drawer is built so a later prop (e.g. `mode="conditions"`) can
  switch what is listed.
- Each effect is expandable to show its `sub_effects` description.
- On apply: the user fills in the application (`$defs/application`): duration (type,
  value/unit, and the anchor/edge for next-turn durations), save DC where the effect has a
  repeat save, and any `choices` the definition asks for (Hex ability, Protection from
  Energy damage type). Duration is captured here, never on the definition.
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
DM). "Burning" isn't a thing that "normally lasts 1 minute" — the spell that applies it
defines that. So durations don't belong on the effect definition at all.

- `src/data/5e|5.5e/effects.js` and the schema: no duration fields on definitions.
  `cancelable` can stay on the definition as a hint.
- The active effect instance (2d) always carries the resolved `duration` object,
  supplied at application time via the drawer (2a) or a monster/spell action (steps 6–7).
  No "default + override" concept needed.

### 2d. Active effect instance shape
An active effect instance, as **persisted** (Firestore), is a small reference to an
effect definition plus instance metadata - not a full copy:

- `source: "srd" | "custom"` + `source_key`: SRD effects (both editions) use
  `source: "srd"` with a shared edition-neutral key (e.g. `"concentration"`). The same
  `source_key` exists in both `src/data/5e/effects.js` and `src/data/5.5e/effects.js`;
  which file is used for resolution is determined at runtime by the campaign's `edition`,
  not by the persisted instance. `source: "custom"` is for user-authored effects. When
  SRD effects migrate to the API, `source: "srd"` continues to resolve against the
  correct edition's data - the instance shape doesn't change.
- `name` is always denormalized onto the instance for display without a lookup.
- Persisted fields: `$defs/active_instance` in the v2 schema — `name`, `source`,
  `source_key`, `duration` (object: `type`, `value`, `unit`, `anchor`, `edge`,
  `cancel_triggers`, `ends_when`, `save`, `escape`, `on_expire`), `choices`,
  `rounds_remaining`, `caster_key`, `applied_round`, `save_dc`, `level`, `charges`,
  `save_successes` / `save_failures`, and optionally `concentration_id` (cascade, 2h) and
  `parent_id` (instances that exist only while another does).
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
  re-resolves `sub_effects` from the new edition's data file. Applied instances in
  Firestore are untouched (they carry `source` + `source_key` only), so they
  automatically reflect the new edition's mechanics. Edition should be set at campaign
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
  whether the source is `5e`/`5.5e`/`custom`/API-backed.
- A later edit to a definition is picked up on the *next* encounter init, not
  retroactively mid-encounter - consistent with how entity stat edits already don't
  retroactively affect a running encounter.

NPC "Aatrox" (entity key `npc_1`) is Hexed by a player, and is also Burning from a prior
hit. Stored at `users/{uid}/campaigns/{campaignId}/encounters/{encounterId}` under
`entities.npc_1.effects`:

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
  - `"srd"`: find the matching entry in `src/data/{edition}/effects.js`, searched by
    `key`, using the `edition` getter (`"5e"` / `"5.5e"`).
  - `"custom"`: fetch from the user's Firebase Realtime Database via the effects
    service (`src/services/effects.js`).
  - Future: when SRD effects migrate to the API, replace the static file lookup with
    an edition-aware API call - the `source`+`source_key` reference doesn't change.
- Merge the definition's `sub_effects` array onto the in-memory instance. This resolved
  state is NOT written back to Firestore.
- Unresolved references (including condition keys before step 8) follow the rule in
  "Working with conditions before step 8": show the name, apply no mechanics.
- When a new effect is applied mid-encounter (via the drawer), run the same single
  fetch+merge immediately after persisting the reference.

### 2f. Show active effects on combatant
Update `src/components/combat/entities/effects/index.vue` (and `Effect.vue`) to render
`entity.effects` from runtime state:

- Show each effect's `name`, remaining duration, and a remove button.
- Alongside the existing conditions and reminders display, which stays until step 8.
- Clicking an effect opens a detail view or tooltip showing its `sub_effects`
  descriptions.

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
  state (caster Incapacitated or dead, temporary HP gone, holder dons armor).
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
    lock-in), and `escalate: { effect, duration }` to replace the effect. When the
    escalation target is a condition (Petrified, Unconscious), it is applied with
    `set_condition` until step 8.
  - `auto_success_after` for "After 1 minute, it succeeds automatically".
- `duration.escape`: action-based exit with DC and allowed checks (Web, Ensnaring Strike
  — optionally by a creature within reach).
- `duration.on_expire`: sub-effects when the duration ends (Haste lethargy).
- `type: "concentration"`: no automatic expiry - removed manually or via cascade. When a
  Concentration effect instance is removed, cascade-remove every active effect on any
  entity whose `concentration_id` matches it. The same cascade applies to `parent_id`.
- `type: "cancelled"`: no automatic expiry - only removed manually.

## 3. Apply mechanical bonuses and resolve trigger actions
With the trigger system (2g) in place, implement actual mechanical resolution per
sub-effect `type`. This step touches `runEncounter.js`, `HpManipulations.js`, roll
components, and AC/HP display computeds.

- **`damage` / `healing`** (DoT/HoT sub-effects with a `trigger`): when the trigger
  fires (e.g. `start_turn_target` for a Burning effect), execute the roll defined in
  `sub_effect.roll` and apply the result via `HpManipulations.js`. This is the most
  common case and the first priority.
- **`bonus` / `base` / `fixed` / `floor` / `cap`** on AC, speed, ability scores, save
  bonuses, attack bonuses: collect all active effects on an entity at the point of
  computation and apply modifiers. Requires identifying every place these values are
  currently computed (AC in entity display, speed in movement, etc.) and routing them
  through an effects-aware helper.
- **`advantage` / `disadvantage`** (incl. `perspective: "against"` and the legacy
  `grant_*` types): on relevant roll UIs, check active effects for matching sub-types and
  auto-toggle the advantage/disadvantage state.
- **`defense` (vulnerability / resistance / immunity)**: apply in `HpManipulations.js`
  at damage-application time.
- **`auto_fail` / `auto_success`**: at save/check resolution, short-circuit based on
  active effects (e.g. Ring of Evasion, Legendary Resistance).
- **`restrict`**: disable relevant action buttons (attack, reaction, movement, speech)
  in the combat UI based on active effects.
- **`outcome`** (death, etc.): fire the appropriate combat outcome on trigger.
- **`reroll` / `damage_modifier` / `score_swap` / `grant_action`**: roll/action flow
  hooks, lower priority, implement last.
- v2 adds `roll_floor`, `critical`, `compel`, `deny`, `sense`, `proficiency`, `includes`,
  `apply_effect`, `remove_effect` and auras. The catalogue (§3) tags every shape A
  (automate here), P (prompt the DM) or D (reminder only) — implement tier A first.
- Condition references inside effects follow "Working with conditions before step 8":
  checks read `entity.conditions`, applications call `set_condition`, `includes` is shown
  but not applied.

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
  trigger selection.
- Support array-of-effects editing (an action or feature can have multiple effects).
- Add validation matching the schema (required fields per type/subtype).

## 5. SRD effect data files
- `src/data/5e/effects.js` and `src/data/5.5e/effects.js` contain non-condition SRD
  effects (Concentration to start). Add more as steps 3, 6 and 7 need them — the
  stress-test encodings from the catalogue (Hex, Bless, Haste, Warding Bond, Rage,
  Spirit Guardians…) are ready-made candidates and double as regression fixtures.
- All files follow `hk-effects-schema.json` v2; every entry has a `key`.
- The conditions files (`src/data/5e|5.5e/conditions.js`) are untouched until step 8.

## 6. Monster actions carry effects
- Extend the `action_list` sub-action shape in monster actions
  (`src/components/combat/actions/RollActions.vue`, monster docs in
  `src/store/modules/content/monsters.js`) to allow effects per sub-action - e.g. a
  damage roll sub-action plus a separate "apply Stunned" effect.
- Effect references per sub-action use `$defs/action_effects`, which mirrors the 2024
  save block: `save`, `on_fail`, `on_success`, `always` (plus `on_hit` / `on_miss` for
  attack rolls), each a list of `$defs/application`. Condition references in there are
  plain condition keys, applied via `set_condition` until step 8.
- Update monster/action edit forms (wherever actions are authored/edited) to use
  `hk-effects-form` for the new effects.
- Migration plan for existing monster data (old `rolls`/`type` shape must keep working
  or be migrated).
- 5.5e monsters (330, all with "Failure:/Success:" text) are the best candidates for an
  automated backfill; 2014 monsters stay manual/heuristic. Grapples carry
  `duration.escape.dc`.

## 7. Update action rolls to include effects
- Update `src/mixins/runEncounter.js` and `RollActions.vue` roll execution so that
  rolling an action also evaluates/applies its effects - e.g. on-hit applies Stunned to
  the target (via `set_condition` until step 8), a failed save applies a spell effect
  with the action-defined duration.
- Decide UI for "this action also applies X - apply to target(s)?" confirmation step.
- Builds on the active-effects storage and trigger system from step 2.

## 8. Conditions as effects (last)
Moves conditions onto the effects model. Everything above works without it.

### 8a. Decision: where SRD condition *mechanics* live (no API change)
The HK API provides condition name, icon and rules text (`/conditions` and
`/conditions/5.5e`, all 15 conditions per edition as of 2026-09-29), but no structured
`sub_effects`. Keep `src/data/5e|5.5e/conditions.js` as the source of **mechanical**
`sub_effects` only, keyed by `key` = the API condition `url`, and take display
name/icon/text from the API (already cached by `api_conditions/fetch_all_conditions`). The
runtime merge becomes: API entry (text) + local entry (`sub_effects`, `cancelable`)
joined on `url === key`. This needs no API change. If the API ever gains a `sub_effects`
field, drop the local files; the instance shape (`source: "srd"`, `source_key: <url>`)
doesn't change. The per-level Exhaustion text stays in `EXHAUSTION_LEVELS`
(`generalConstants.js`) for display.

### 8b. Fix and migrate the conditions data files
`src/data/5.5e/conditions.js` was authored before the 2024 text was available and is
wrong in places (checked against `/conditions/5.5e`):
- **Exhaustion** is one stacking condition, not six "Exhaustion N" entries with
  Disadvantage: each D20 Test is reduced by `2 × level`, Speed by `5 × level` ft, death at
  level 6, a Long Rest removes 1 level — `stacking.mode: "level"` + `level_track` +
  `scaling.by: "level"` (catalogue §5).
- **Incapacitated**: Concentration **is** broken (the file says the opposite), and the
  creature has Disadvantage on Initiative. Can't take actions, Bonus Actions, Reactions,
  can't speak.
- **Invisible**: Advantage on Initiative; "Concealed" — `special/descriptive`.
- **Grappled**: Disadvantage on attack rolls against any target *other than the
  grappler*; Speed 0.
- **Paralyzed, Petrified, Stunned, Unconscious** use `includes` (Incapacitated; Unconscious
  also Prone) instead of copying sub-effects, so fixes to Incapacitated propagate.
- **Stunned** (2024) no longer has "can't move / speak falteringly" beyond Incapacitated.
- **Dying** and **Surprised** are not SRD 5.2.1 conditions — remove them.

Both files:
- Add `key` (= API `url`) to every entry.
- Drop `duration_type` / `cancel_trigger` from definitions (2c).
- 2014 Exhaustion becomes one leveled entry with `min_level` rows (catalogue §5).

### 8c. Resolve conditions as effects
- Encounter init (2e) also searches `src/data/{edition}/conditions.js`, merging the API
  text per 8a. From here on, `includes` references to conditions apply their mechanics.
- **Exhaustion** instances carry a `level` (1–6). Applying Exhaustion to an entity that
  already has it increments `level` instead of adding a second instance.
- Condition references in actions, escalations and `apply_effect` switch from
  `set_condition` to writing effect instances.

### 8d. Replace the legacy conditions/reminders UI
Extend the Effects drawer (2a) with a prop (e.g. `mode="conditions"`) that lists SRD
conditions. Then:

- The existing `src/components/drawers/encounter/Conditions.vue` drawer is removed and
  replaced by `<Effects mode="conditions" />` opened from the same trigger point.
- `src/components/combat/Conditions.vue`, `entity.conditions` and the `set_condition`
  Vuex action are removed. Conditions become effect instances written to
  `entity.effects`; `has_condition` checks read effect instances.
- `src/mixins/reminders.js`, `entity.reminders`, `Reminders.vue`, `TargetReminders.vue`:
  removed once mechanical triggers are covered by the effects engine. User-authored
  custom reminders (`src/views/UserContent/Reminders/`) stay as a freeform-note feature.
- Existing Firestore data with `entity.conditions` / `entity.reminders`: decide on a
  read-migration shim or one-time conversion script.

## Suggested Order
0 (Concentration 2024 update, 5.5e monster re-scan)
1 (schema v2 — done)
2a -> 2b -> 2d -> 2e -> 2f (drawer, Firebase writes, instance shape, init loop, display)
2g -> 2h (trigger system + duration ticking, builds on 2f)
3 (mechanical resolution: bonuses, DoT rolls, etc. - builds on 2g trigger bus)
4 (effectsConstants regeneration + EffectsForm rework, once step 2 data shape is proven)
5 (SRD effect data, grows alongside 3, 6 and 7)
6 -> 7 (monster actions + action rolls, additive on top of step 3)
8 (conditions as effects: 8a -> 8b -> 8c -> 8d)

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
