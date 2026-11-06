## Context

See proposal.md — Why. Requirements are in `specs/effects-drawer/spec.md`.

Current state that shapes the approach:

- **Drawers** are opened with the `setDrawer({ show, type, data })` action; `type` is a
  path under `src/components/` (e.g. `drawers/encounter/Conditions`) and `data` is passed as
  the drawer's `data` prop. Conditions/TargetReminders use `data` (array of entity keys)
  when present and fall back to the `targeted` getter. `mobile/Menu.vue` currently passes
  an entity object as `data` for Conditions — the new drawer must accept keys only.
- **Legacy conditions** live in `entity.conditions` (`{ prone: true, exhaustion: 3 }`)
  and are written by `runEncounter/set_condition`. They are untouched here.
- **Edition**: `runEncounter` `edition` getter, set from `campaign.edition || "5e"` on
  init; the demo branch sets `"2024"` (a leftover from before 5.5e shipped).
- **SRD data**: `src/data/{5e,5.5e}/{conditions,effects}.js` each `export default` an array
  of definitions keyed by `url` (effects-srd-data spec). Nothing imports them yet.
- **Custom effects**: `effects` Vuex module — `get_effects` returns the `search_effects`
  results (name only, keys are Firebase push ids) and `get_effect({ uid, id })` fetches and
  caches the full definition. Custom definitions were authored with the old form and may
  carry legacy fields (`duration_type`); the drawer ignores them.
- **Instance shape**: `$defs/active_instance` / `$defs/duration` / `$defs/repeat_save` in
  `src/schemas/hk-effects-schema.json`. Choices come from sub-effect `choice`
  (`ability | damage_type | skill | condition | creature_type | option`) and roll
  `damage_type_choice` (array of allowed types).
- **Turn/round**: `round` / `turn` getters read `encounter.round` / `encounter.turn`. The
  turn entity is `_active[turn]` in `RunEncounter.vue` (active, not down, ordered by name
  then initiative in the user's `initOrder`); the store's `active` getter is never set and
  `actor` is the manually selected out-of-turn actor, so neither is used. The drawer
  computes `caster_key` with the same ordering, and only when `round > 0`.
- There is an existing combat component also named `Effects`
  (`src/components/combat/entities/effects`) that renders conditions/reminders on an
  entity; the drawer imports it for the target list like the Conditions drawer does.

## Goals / Non-Goals

**Goals:**
- One drawer component usable now (all groups) and in 2i (`mode="conditions"`).
- A single, pure "build active instance" path that 2b (persistence), steps 6–7 (actions)
  and 2h (`escalate`, `apply_effect`) can reuse.
- Every instance the drawer creates is schema-valid, checked by a script.

**Non-Goals:**
- Persisting instances, Firebase rules (2b); reading persisted instances and resolving
  `sub_effects`/`includes` into state (2e); rendering `entity.effects` on combatants (2f).
- `hasCondition` helper — belongs with the first reader (2e/2h).
- Concentration linking (`concentration_id`) and `parent_id` in the form; cascade is 2h.
- Durations `rest`, `dawn`, `trigger`, `save_ends`, `special`, `cancel_triggers`,
  `ends_when`, `escape`, `on_expire` in the form. They stay valid schema values that
  actions (6–7) can set; the drawer offers the common DM cases only.
- Tutorial steps, player live view, legacy drawer changes.

## Decisions

### 1. Pure helpers in `src/utils/effectFunctions.js`
New module (next to `entityFunctions.js`, `spellFunctions.js`) with no Vue/Vuex imports:

- `getSrdDefinitions(edition)` → `{ conditions, effects }` from the four data files;
  `edition === "5.5e"` selects 5.5e, anything else 5e (same normalisation as
  `api_conditions/conditions_by_edition`). Sorted by `name`.
- `getRequiredChoices(definition)` → list of `{ kind, options? }`, walking `sub_effects`
  recursively (including nested `sub_effects`, `duration.on_expire` is not on definitions)
  and collecting `choice` values and `roll.damage_type_choice` lists. One entry per kind;
  multiple `damage_type_choice` lists are intersected.
- `durationToRounds({ value, unit })` → `round: v`, `minute: 10v`, `hour: 600v`,
  `day: 14400v`.
- `buildEffectInstance({ definition, source, sourceKey, application, round, casterKey })`
  → plain object matching `$defs/active_instance`; omits undefined/empty fields so
  Firebase (2b) never receives `undefined`.
- `generateEffectKey(existingKeys)` → `"eff_" + 4 random base36 chars`, regenerated on
  collision with the entity's existing keys. Short and readable in the database, like the
  plan's examples.

*Alternative:* put helpers in `generalFunctions.js` (CLAUDE.md default). Rejected: it is
already large and these are domain-specific; `effectFunctions.js` follows the existing
`*Functions.js` split. They are still importable from anywhere.

### 2. Store: `apply_effect` / `remove_effect` in `runEncounter`
- `apply_effect({ key, instance })` → if the target already has an instance with the same
  `source`+`source_key` and it is an SRD condition: Exhaustion updates `level`, others are a
  no-op; otherwise generates a key and commits `SET_EFFECT({ key, effectKey, instance })`.
  Returns the effect key.
- `update_effect` is folded into `SET_EFFECT` (same key → replace), used for the
  Exhaustion level change.
- `remove_effect({ key, source, source_key })` → commits `DELETE_EFFECT` for every matching
  instance. Keyed by definition, not instance, because that is what the drawer offers;
  2f's per-instance remove button can pass `effectKey` as an alternative argument.
- Both actions carry a `// 2b: persist here` comment at the point where
  `set_entity_effect` / the campaign action will be dispatched, mirroring
  `set_condition`'s `if (!state.demo && !state.test)` guard.
- `add_entity` sets `entity.effects = {}` next to `conditions`/`reminders`. It does not
  read `db_entity.effects` — that is 2e, and nothing writes it yet.

The "already has" rule lives in the action, not the drawer, so steps 6–7 get it for free.
The action decides by `category === "condition"` of the definition, which the drawer
passes along (`{ key, instance, definition }`); the definition is not stored.

*Alternative:* the drawer computes everything and the store only sets. Rejected: the
dedupe/level rule is domain behavior every caller needs.

### 3. Component split
- `drawers/encounter/Effects.vue` — targets, group list (`q-list` of
  `q-expansion-item`s, like Conditions.vue), per-entry presence indicator
  (all / some / none, from `entity.effects`) with apply (+) and remove (−) buttons.
- `drawers/encounter/effects/ApplyEffect.vue` — the application form shown inline in the
  expanded entry after pressing apply (duration, repeat save, choices, Exhaustion level),
  with Apply / Cancel. Emits the `application` object. Keeping it separate keeps the drawer
  readable and makes the form reusable for step 7's "apply to targets?" confirmation.
- `drawers/encounter/effects/EffectDetails.vue` — description, sub-effect descriptions and
  the Exhaustion table (`EXHAUSTION_LEVELS[edition]`).

Quick path: for an effect with no choices, pressing + on an entry that is not expanded
applies immediately with the default duration (`cancelled`) — the same one-click flow the
legacy Conditions drawer has. Expanding the entry exposes the full form. Exhaustion always
opens the level picker (defaulting as in the spec).

### 4. Form inputs
- Duration type select: Until removed, Rounds/time, Concentration, Until next turn, Until
  end of this turn. `time`/`concentration` show value + unit (`round|minute|hour|day`,
  default `round`; concentration value optional). `next_turn` shows anchor (Caster /
  Target) and edge (Start / End) toggles.
- Repeat save: a toggle revealing ability select (`abilities`), DC (positive integer) and
  trigger multi-select (`end_turn_target` default, `start_turn_target`, `damage_taken`).
  Stored as `duration.save = { ability, triggers }` and `save_dc` on the instance —
  the DC is instance-level per `$defs/active_instance`.
- Choice inputs: `abilities`, `damage_types` (or the roll's allowed list), `skills` from
  `generalConstants.js`; `condition` from the edition's SRD condition list; `creature_type`
  from the existing monster type list if one exists in constants, otherwise a free text
  input; `option` free text.
- Validation with the existing `ValidationObserver`/`ValidationProvider` pattern used in
  TargetReminders.

### 5. Entry points and hotkey
`Targeted.vue` gets an `effects` option after `reminders`, icon `fa-sparkles`, hotkey
`f` (`c`, `m`, `t`, `h`, `e` are taken). `TargetMenu.vue` and `mobile/Menu.vue` get an
"Effects" item next to Conditions, passing `data: [entity.key]` / keys only. The
implementation checks the hotkey handler for other bindings of `f` before settling on it.

### 6. Demo edition
`init_Encounter` demo branch commits `SET_EDITION("5.5e")` instead of `"2024"`. Readers
that normalise with `=== "5.5e" ? "5.5e" : "5e"` currently show 5e text in the demo; after
the fix they show 5.5e, matching the comment "The demo runs on the latest edition".

### 7. Verification without running the app
Per CLAUDE.md, no dev server. A throwaway script in the scratchpad imports
`effectFunctions.js` and the data files, builds instances for each spec scenario and
validates them with Ajv against `$defs/active_instance` (reusing the loading approach of
`scripts/validate-effects-data/`). Plus `npm run lint`. The DM verifies the drawer in the
running app.

## Risks / Trade-offs

- [Applied effects vanish on reload until 2b] → Accepted by scope; 2b is next in order.
  The drawer is behind a new menu option, so the legacy flow is unaffected.
- [Nothing displays `entity.effects` on combatants until 2f] → The drawer's own presence
  indicator and target list show what is applied; enough to exercise 2a.
- [Custom effect definitions in the old shape may have no `sub_effects` / odd fields] →
  Choice derivation tolerates missing arrays; details view falls back to "no details".
- [Hotkey `f` may collide with a global shortcut] → Checked during implementation; pick
  another free key if so.
- [SRD data files are bundled into the tracker chunk] → A few KB of JS; acceptable.
- [Demo edition change alters legacy Conditions drawer text in the demo to 5.5e] →
  Intended; it was the documented behavior.

## Migration Plan

No data migration — nothing is persisted. Rollback is reverting the commit.

## Open Questions

- Exact icon for the Effects option (`fa-sparkles` vs another Font Awesome Pro icon) —
  cosmetic, decided during implementation.
