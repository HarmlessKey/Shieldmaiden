# Effects Feature - Implementation Plan

Builds on [.planning/effects-schema.md](./effects-schema.md). Goal: replace the current
ad-hoc condition/reminder system with a unified "Effects" model that drives conditions,
monster/action abilities, and combat tracker behavior.

## 1. Finalize the Effects JSON Schema
- Reconcile `src/utils/effectsConstants.js` with the proposed superset in
  `effects-schema.md` (new effect_types: `grant_advantage`, `grant_disadvantage`,
  `reroll`, `grant_action`, `damage_modifier`, `score_swap`, `outcome`; new triggers
  and duration_types).
- Define the full effect object shape (fields: `type`, `sub_type(s)`, `duration_type`,
  `duration_value`, `cancelable`, `cancel_trigger`, `trigger`, `sub_effects`, `source`
  metadata placeholder for later steps).
- Decide on `condition` sub-schema for conditional sub-effects (e.g. "only if attacker
  within 5ft", "only vs sight-based") - flagged as open question in schema doc.
- Per 2b: remove `duration_type`/`duration_value` from `hk-effects-schema.json`'s
  top-level `required` and `properties` entirely - duration is never part of an effect
  definition, only of the active effect instance/application (see 2b/2c).

## 2. Apply and track effects in the combat tracker
Build this ahead of the form/monster-action work to validate the data model and
active-effects lifecycle end-to-end. Step 2 covers everything needed to apply effects,
show them, fire triggers, and tick durations. Applying the mechanical bonuses (stat
modifiers, DoT rolls, etc.) is step 3.

### 2a. Effects drawer
Create `src/components/drawers/encounter/Effects.vue` - the UI from which a DM applies
an effect to one or more targeted entities, modelled on the existing Reminders drawer:

- Lists available effects grouped by source:
  - **SRD non-condition effects** from `src/data/5e/effects.js` or
    `src/data/5.5e/effects.js` (e.g. Concentration). Selected by campaign `edition`
    (`"2014"` / `"2024"`) via the same `edition` getter from `feature/5.5-support`.
  - **Custom effects** from the user's Firebase Realtime Database
    (`src/store/modules/userContent/effects.js` / `src/services/effects.js` already
    exist for this). Custom effects are edition-agnostic and always shown.
- Conditions are explicitly out of scope here. They will use this same drawer component
  in a later step, passed a prop (e.g. `conditions` or `mode="conditions"`) that
  switches what is listed. The existing `Conditions.vue` drawer remains untouched until
  that later step.
- Each effect is expandable to show its `sub_effects` description.
- On apply: user picks `duration_type` (cancelled / time / concentration / trigger /
  next_turn / etc.) and `duration_value` if relevant, then confirms. Duration fields
  are captured here, never on the definition.
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
Conditions (Blinded, Stunned, etc.) have **no inherent duration** - how long they last
is always determined by whatever inflicts them (a spell, an action, the DM).
Reconsidered from the earlier "default in definition, override at application" idea:
conditions (Blinded, Stunned, etc.) have **no inherent duration** - how long they last
is always determined by whatever inflicts them (a spell, an action, the DM). "Burning"
isn't a thing that "normally lasts 1 minute" either - the spell that applies it defines
that. So `duration_type`/`duration_value` don't belong on the effect definition at all.

- `src/data/5e|5.5e/effects.js` and `src/schemas/hk-effects-schema.json`: drop
  `duration_type`/`duration_value` as definition fields. `cancelable` can stay on the
  definition as a hint (most conditions are cancelable; some outcome-type effects like
  "Exhaustion 6 -> death" are not).
- The active effect instance (2d below) always carries the resolved
  `duration_type`/`duration_value`, supplied at application time via the drawer (2a)
  or a monster/spell action (steps 5-6). No "default + override" concept needed.

### 2d. Active effect instance shape
An active effect instance, as **persisted** (Firestore), is a small reference to an
effect definition plus instance metadata - not a full copy:

- `source: "srd" | "custom"` + `source_key`: SRD effects (both editions) use
  `source: "srd"` with a shared edition-neutral key (e.g. `"blinded"`). The same
  `source_key` exists in both `src/data/5e/effects.js` and `src/data/5.5e/effects.js`;
  which file is used for resolution is determined at runtime by the campaign's `edition`
  prop, not by the persisted instance. `source: "custom"` is for user-authored effects.
  When SRD effects migrate to the API, `source: "srd"` continues to resolve against the
  correct edition's API data - the instance shape doesn't change.
- `name` is always denormalized onto the instance for display without a lookup.
- Persisted fields: `name`, `source`, `source_key`, `duration_type`, `duration_value`,
  `rounds_remaining`, `caster_key`, `applied_round`, and optionally `concentration_id`
  for concentration cascade linkage (2h).
- `caster_key`: the entity key of the entity that applied the effect. Required for
  `start_turn_caster` / `end_turn_caster` triggers and caster-relative duration expiry.
  Set to the currently active entity when applied from the drawer, or the attacking
  entity when applied via a monster action (step 6).
- `applied_round`: flat integer — round number when the effect was applied. No object
  needed; round is the only value required.
- `cancelable` is NOT persisted on the instance. It is an optional hint on the effect
  definition, resolved at runtime like `sub_effects`. The UI defaults to showing a
  remove button and only hides it if the resolved definition has `cancelable: false`.
- No `sub_effects` are persisted on the instance.
- **Edition switching**: if a campaign's edition is changed, the next encounter init
  re-resolves `sub_effects` from the new edition's data file. Applied instances in
  Firestore are untouched (they carry `source: "srd"` + `source_key` only), so they
  automatically reflect the new edition's mechanics. Note: some conditions differ
  meaningfully between editions (e.g. Incapacitated gains bonus-action and speech
  restrictions in 2024), so edition should be set at campaign creation rather than
  changed mid-campaign.

**At runtime**, `sub_effects` are resolved by snapshotting the referenced effect
definition into in-memory encounter state, mirroring how entities themselves are
already extended into the encounter on initialization:

- On encounter init (the existing loop that fetches each entity's full object and
  extends the encounter with it): for every active effect instance found on every
  entity, also fetch its effect definition (by `source`+`source_key`) and attach its
  `sub_effects` onto the in-memory instance. This is not written back to Firestore -
  only the small reference persists.
- When a new effect is applied mid-encounter (steps 6/7): fetch that one effect
  definition, persist the small reference on the entity, and merge the resolved
  `sub_effects` into runtime state the same way.
- Resolvers (7c) always read `sub_effects` from runtime state, so they don't need to
  care whether the source is `5e`/`5.5e`/`custom`/API-backed.
- A later edit to a definition (e.g. fixing "Blinded") is picked up on the *next*
  encounter init, not retroactively mid-encounter - a predictable boundary, consistent
  with how entity stat edits already don't retroactively affect a running encounter.

NPC "Aatrox" (entity key `npc_1`) is Blinded by a player, and is also Burning from a
prior hit. Stored at
`users/{uid}/campaigns/{campaignId}/encounters/{encounterId}` under
`entities.npc_1.effects`:

```json
{
	"eff_8f3a": {
		"name": "Blinded",
		"source": "srd",
		"source_key": "blinded",
		"duration_type": "cancelled",
		"caster_key": "player_1",
		"applied_round": 3
	},
	"eff_2b91": {
		"name": "Burning",
		"source": "srd",
		"source_key": "burning",
		"duration_type": "time",
		"duration_value": 10,
		"rounds_remaining": 7,
		"caster_key": "player_2",
		"applied_round": 1
	}
}
```

Player "Lyra" (entity key `player_1`) is concentrating on a spell that keeps `npc_1`
Blinded. Stored at `users/{uid}/campaigns/{campaignId}` under `players.player_1.effects`
(persists across encounters, same as `curHp`):

```json
{
	"eff_5c10": {
		"name": "Concentration",
		"source": "srd",
		"source_key": "concentration",
		"duration_type": "concentration",
		"caster_key": "player_1",
		"applied_round": 3
	}
}
```

`npc_1`'s "Blinded" instance (`eff_8f3a`) would then carry
`"source": { "entity_key": "player_1", "effect_id": "eff_5c10" }` so that cancelling
`eff_5c10` (Concentration ends) cascades to remove `eff_8f3a` - per the 2h cascade rule.

### 2e. Extend encounter init to resolve sub_effects
In the existing entity-init loop in `src/store/modules/encounters/runEncounter.js`
(the pass that fetches each entity's full object and merges it into encounter state),
add a second pass over each entity's `effects` map:

- For each active effect instance, look up its definition by `source` + `source_key`:
  - `"srd"`: find the matching entry in `src/data/{edition}/effects.js` or
    `src/data/{edition}/conditions.js` depending on `campaign.edition` and the
    effect's category. Both files are searched by `key`.
    Each entry needs a stable `key` field matching the `source_key` (e.g. `"blinded"`,
    `"burning"`) - add this to both data files if not already present.
  - `"custom"`: fetch from the user's Firebase Realtime Database via the effects
    service (`src/services/effects.js`).
  - Future: when SRD effects migrate to the API, replace the static file lookup with
    an edition-aware API call - the `source`+`source_key` reference on the instance
    doesn't change.
- Merge the definition's `sub_effects` array onto the in-memory instance. This resolved
  state is NOT written back to Firestore.
- When a new effect is applied mid-encounter (via the drawer), run the same single
  fetch+merge immediately after persisting the reference.

### 2f. Show active effects on combatant
Update `src/components/combat/entities/effects/index.vue` (and `Effect.vue` if it
exists) to render `entity.effects` from runtime state:

- Show each effect's `name`, remaining duration, and a remove button.
- Alongside (not replacing yet) the existing conditions and reminders display - in a
  later step (2i) the conditions/reminders sections will be removed once effects cover
  the same ground.
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
`caster_key` is also the anchor for duration expiry (2h): `duration_type: "next_turn"`
and `duration_type: "time"` use `caster_key` to identify whose turn tick to watch.

Triggers to implement, sourced from the schema and existing reminder logic:

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
| `on_ability_check` | Entity makes an ability check | Entity with the effect |
| `on_zero_hp` | Entity reaches 0 HP | Entity with the effect |
| `on_heal` | Entity receives healing | Entity with the effect |
| `combat_start` | Combat is initiated | All entities |
| `short_rest` | Entity takes a short rest | Entity with the effect |
| `long_rest` | Entity takes a long rest | Entity with the effect |

The existing reminder triggers (`damage_taken`, turn-change hooks in `runEncounter.js`)
are the starting point - extend rather than replace.

### 2h. Duration ticking and expiry
On each turn change (and on other relevant triggers), tick down durations and expire
effects whose time has run out:

- `duration_type: "time"` (rounds): decrement `rounds_remaining` on `end_turn_caster`
  (per RAW, timed durations typically expire at the end of the caster's turn). Uses
  `caster_key` to identify the right turn. When `rounds_remaining` reaches 0, remove
  the effect.
- `duration_type: "next_turn"`: expire on `start_turn_caster` the round after the
  effect was applied. Uses `caster_key` + `applied_round` to detect when "next turn"
  has passed.
- `duration_type: "trigger"` + `cancel_trigger`: expire automatically when the named
  trigger fires (e.g. Surprised expires at `end_turn_target`). No prompt needed.
- `duration_type: "save_ends"` + `save_trigger` + `save_ability` + `save_dc`: a
  prompted save-to-end mechanic. At the point defined by `save_trigger` (most commonly
  `start_turn_target`, e.g. "at the start of its turn, the creature can repeat the
  saving throw"), the dispatcher surfaces a prompt to the DM to roll a save for the
  affected entity. On success, the effect is removed; on failure it persists and the
  prompt fires again next time the trigger fires. Fields needed on the active instance:
  - `save_trigger` — which trigger prompts the save (e.g. `"start_turn_target"`).
  - `save_ability` — which ability the save is against (e.g. `"wisdom"`).
  - `save_dc` — the DC, set at application time (typically the caster's spell save DC,
    supplied by the monster action reference in step 6, or entered manually in the
    drawer in step 2a).
  This is not currently modelled in `hk-effects-schema.json` or `effectsConstants.js`.
  Add `"save_ends"` to the `duration_types` enum in both, and add `save_trigger`,
  `save_ability`, `save_dc` as optional definition-level fields (since the ability and
  trigger are intrinsic to the effect — Charmed "Wis save ends" is always Wis; only
  the DC varies and is set at application time).
- `duration_type: "concentration"`: no automatic expiry - removed manually or via
  cascade. When a Concentration effect instance is removed, cascade-remove every active
  effect on any entity whose `applied.effect_id` matches it.
- `duration_type: "cancelled"`: no automatic expiry - only removed manually.

### 2i. Conditions via the Effects drawer (deferred)
Conditions are not part of step 2. Once the Effects drawer (2a) is stable, extend it
with a prop (e.g. `conditions` boolean or `mode="conditions"`) that switches the listed
effects to SRD conditions from `src/data/5e|5.5e/conditions.js`. At that point:

- The existing `src/components/drawers/encounter/Conditions.vue` drawer is removed and
  replaced by `<Effects conditions />` opened from the same trigger point.
- `src/components/combat/Conditions.vue`, `src/mixins/conditions.js`, `entity.conditions`,
  and the `set_condition` Vuex action are removed. Conditions become effect instances
  written to `entity.effects`.
- `src/mixins/reminders.js`, `entity.reminders`, `Reminders.vue`, `TargetReminders.vue`:
  removed once mechanical triggers are covered by the effects engine. User-authored
  custom reminders (`src/views/UserContent/Reminders/`) stay as a freeform-note feature.
- Existing Firestore data with `entity.conditions` / `entity.reminders`: decide on a
  read-migration shim or one-time conversion script at that point.

## 3. Apply mechanical bonuses and resolve trigger actions
With the trigger system (2g) in place, implement actual mechanical resolution per
`effect_type`. This step touches `runEncounter.js`, `HpManipulations.js`, roll
components, and AC/HP display computeds.

- **`damage` / `healing`** (DoT/HoT sub-effects with a `trigger`): when the trigger
  fires (e.g. `start_turn_target` for a burning effect), execute the roll defined in
  `sub_effect.roll` and apply the result via `HpManipulations.js`. This is the most
  common case and the first priority.
- **`bonus` / `base` / `fixed`** on AC, speed, ability scores, save bonuses, attack
  bonuses: collect all active effects on an entity at the point of computation and
  apply modifiers. Requires identifying every place these values are currently computed
  (AC in entity display, speed in movement, etc.) and routing them through an
  effects-aware helper.
- **`advantage` / `disadvantage` / `grant_advantage` / `grant_disadvantage`**: on
  relevant roll UIs, check the entity's active effects for matching sub-types and
  auto-toggle the advantage/disadvantage state.
- **`defense` (vulnerability / resistance / immunity)**: apply in `HpManipulations.js`
  at damage-application time.
- **`auto_fail` / `auto_success`**: at save/check resolution, short-circuit based on
  active effects (e.g. Paralyzed auto-fails Str/Dex saves).
- **`restrict`**: disable relevant action buttons (attack, reaction, movement, speech)
  in the combat UI based on active effects.
- **`outcome`** (death, etc.): fire the appropriate combat outcome on trigger.
- **`reroll` / `damage_modifier` / `score_swap` / `grant_action`**: roll/action flow
  hooks, lower priority, implement last.

- Per 2c: remove the `duration_type`/`duration_value` fields from
  `hk-effects-form.vue` - the definition form no longer captures duration at all.
  Duration is captured in the Effects drawer (2a) and on monster/spell action effect
  references (steps 5-6).
- Rework `src/components/hk-components/hk-effects-form.vue` to support the full
  schema: new types/subtypes, conditional sub-effects, nested sub_effects arrays,
  trigger selection.
- Support array-of-effects editing (an "action" or "condition" has multiple effects).
- Add validation matching the schema (required fields per type/subtype).

## 5. SRD data files (done)
- `src/data/5e/conditions.js` and `src/data/5.5e/conditions.js` contain all SRD
  conditions (Blinded ... Unconscious, Exhaustion 1-6, plus 2024 Dying/Surprised).
- `src/data/5e/effects.js` and `src/data/5.5e/effects.js` contain non-condition SRD
  effects (Concentration to start; more added as needed).
All files are modeled against `hk-effects-schema.json` and used by steps 2 and 3.

- Extend the `action_list` sub-action shape in monster actions
  (`src/components/combat/actions/RollActions.vue`, monster docs in
  `src/store/modules/content/monsters.js`) to allow an `effects` array per sub-action -
  e.g. a damage roll sub-action plus a separate "apply Stunned" effect sub-action.
- Update monster/action edit forms (wherever actions are authored/edited) to use
  `hk-effects-form` for the new effects array.
- Migration plan for existing monster data (old `rolls`/`type` shape must keep working
  or be migrated).

## 7. Update action rolls to include effects
- Update `src/mixins/runEncounter.js` and `RollActions.vue` roll execution so that
  rolling an action also evaluates/applies its `effects` array - e.g. on-hit applies
  Stunned to the target with the action-defined duration.
- Decide UI for "this action also applies X - apply to target(s)?" confirmation step.
- Builds on the active-effects storage and trigger system from step 2.

## Suggested Order
1 + 5 (schema + SRD conditions data — done)
2a -> 2b -> 2d -> 2e -> 2f (drawer, Firebase writes, instance shape, init loop, display)
2g -> 2h (trigger system + duration ticking, builds on 2f)
2i (remove legacy conditions/reminders UI, once 2a-2h are stable)
3 (mechanical resolution: bonuses, DoT rolls, etc. - builds on 2g trigger bus)
4 (EffectsForm rework, once step 2 data shape is proven)
6 -> 7 (monster actions + action rolls, additive on top of step 3)

Each numbered step should get its own `.planning/<step-name>.md` spec before
implementation, per CLAUDE.md.

