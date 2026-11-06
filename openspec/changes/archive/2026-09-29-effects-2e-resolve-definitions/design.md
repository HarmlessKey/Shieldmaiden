## Context

See proposal.md (Why). Requirements: `specs/effects-runtime-resolution/spec.md`.

Current state that shapes the approach:

- **Instances** (`entity.effects[effectKey]`) are plain `$defs/active_instance` objects.
  Since 2b, `add_entity` fills `entity.effects` with a *shallow* copy of the stored map,
  so the instance objects are the same objects as in `encounters/cached_encounters` (NPCs)
  or `campaigns/cached_campaigns` (players/companions). `apply_effect` passes the same
  `instance` object to the cache mutation and to `SET_EFFECT`.
- **Whole-object writes exist**: `encounters/reset_encounter` and the encounter builder
  call `edit_encounter` with the full cached encounter. The rules close each instance
  (`$other: false`), so any `sub_effects` / `description` / `cancelable` that leaked onto a
  cached instance would make those writes fail.
- **SRD data**: `src/data/{5e,5.5e}/{effects,conditions}.js` are module-level arrays
  imported by `effectFunctions.js`. `includes` is a sub-effect
  `{ type: "includes", effect: { source, source_key, name } }`, used at top level by
  Paralyzed, Petrified, Stunned and Unconscious. Unconscious's Prone comes through
  `apply_effect` on `on_apply`, which is an action for 2g/3, not something to resolve.
- **Custom effects**: `effects/get_effect({ uid, id })` fetches and caches the definition
  and returns `false` when it doesn't exist. Definitions saved by today's
  `hk-effects-form.vue` use `subeffects` and `subtype` (singular string), `duration_type`,
  and a lowercased `name`.
- **Init**: `init_Encounter` commits `CLEAR_ENTITIES`, awaits `add_entity` per key (demo
  and normal branches), then commits `INITIALIZED` in `finally`. The `edition` state is set
  before entities are added.

## Goals / Non-Goals

**Goals:**
- One async resolver used for init, apply, and later for 2h's `escalate` / `apply_effect`
  and steps 6–7.
- Pure resolution logic, testable in the scratchpad against the real SRD data.
- The stored and cached instance objects are never mutated by resolution.

**Non-Goals:**
- Showing resolved definitions (2f), acting on triggers or `apply_effect` sub-effects
  (2g/3), interpreting `choices`, `scaling` or `min_level` (step 3).
- A `hasCondition` helper, which comes with its first reader (2g/2h).
- Switching the drawer to the resolved map. The drawer keeps using `getSrdDefinitions` /
  `get_effect` for its list and details.
- The campaign edition-change warning mentioned in plan §2d. It stays a plan note for when
  effects become visible (2f/2i).
- Rewriting legacy custom effects in the database (step 4).

## Decisions

### 1. Pure helpers in `effectFunctions.js`
- `findSrdDefinition(edition, url)` searches the edition's effects, then its conditions
  (same edition normalisation as `getSrdDefinitions`) and returns the definition or
  `undefined`.
- `normalizeDefinition(raw)` returns a *new* object: `sub_effects` from `sub_effects`,
  else from legacy `subeffects`. Each legacy sub-effect with a string `subtype` and no
  `sub_types` gets `sub_types: [subtype]` (with `subtype` dropped in the copy). Missing
  arrays become `[]`. The input is never mutated.
- `resolveDefinition({ source, sourceKey, lookup })`: async. `lookup({ source,
  source_key })` resolves to a raw definition or `undefined`. It returns `{ name,
  description, category, cancelable, sub_effects, unresolved }`.
  - It keeps a `seen` set of `source:source_key`, starting with the root.
  - It walks the root's normalised top-level `sub_effects` in order. Each sub-effect is
    copied into the result, including the `includes` entries, so a later UI can show
    "includes Incapacitated".
  - For each `includes` whose key is not in `seen`: add the key, look up and resolve its
    target recursively with the same `seen`, then append the target's resolved
    sub-effects. The ones without a `from` get `from: { source, source_key, name }` of
    that target; ones already carrying a `from` from a deeper level keep it.
  - A failed include lookup contributes nothing.
  - A root that isn't found returns `{ name: undefined, sub_effects: [], unresolved:
    true }`.
  - Copies are shallow per sub-effect (`{ ...sub_effect, from }`), so the data files and
    cached custom effects are never modified.

*Alternative:* resolve `includes` lazily in each consumer. Rejected: every consumer (2f
display, 2g triggers, step 3 mechanics) would repeat the walk, cycle guard included.

### 2. Separate `effect_definitions` map in `runEncounter` (deviation from plan §2d/§2e)
- State: `effect_definitions: {}` in `getDefaultState`, keyed `"srd:prone"`,
  `"custom:-Nx12"`. Mutations `SET_EFFECT_DEFINITION({ id, definition })` and
  `CLEAR_EFFECT_DEFINITIONS`, the latter committed in `init_Encounter` next to
  `CLEAR_ENTITIES`.
- Getters:
  - `effect_definition: (state) => (instance) => state.effect_definitions[`${instance.source}:${instance.source_key}`]`
  - `entity_effects: (state, getters) => (key) => Object.entries(state.entities[key]?.effects || {}).map(([effectKey, instance]) => ({ key: effectKey, instance, definition: getters.effect_definition(instance) }))`
- Why not attach to the instance as the plan says: the instance objects are shared with the
  caches (Context). Attaching would leak into the whole-encounter writes and those would be
  rejected by the rules. Deep-copying instances on load and apply would work too, but
  every later write path (2h ticking `rounds_remaining`, save counters) would then have to
  remember to strip resolved fields. Keying by definition also resolves each definition
  once instead of once per instance.

### 3. Store action `resolve_effect_definitions`
- `resolve_effect_definitions({ state, commit, dispatch, rootGetters }, refs)`, where
  `refs` is an array of `{ source, source_key }`. It deduplicates by id, skips ids already in
  the map, and resolves the rest with `Promise.all`.
- The `lookup` it passes to `resolveDefinition`:
  - `srd` → `findSrdDefinition(state.edition, source_key)`
  - `custom` → `rootGetters.user` ? `dispatch("effects/get_effect", { uid, id: source_key }, { root: true })` : `undefined`. `false` and thrown errors become `undefined`, and errors are logged.
  - `api` or anything else → `undefined`
- Unresolved: if the result is `unresolved`, it commits `{ ...result, unresolved: true }`
  (with no `name`, so consumers fall back to `instance.name`) and warns once:
  `Effect definition ${id} could not be resolved`. It warns once because it only resolves
  ids not yet in the map, and the map is cleared per encounter.
- The call from `init_Encounter`: after both entity loops (demo and normal), collect the
  refs from all `state.entities[*].effects` and `await dispatch("resolve_effect_definitions",
  refs)` inside the `try`, before `finally` commits `INITIALIZED`.
- The call from `apply_effect`: after the successful commit on both the new-instance and
  the Exhaustion paths, `await dispatch("resolve_effect_definitions", [instance])`. A
  failure there is logged and doesn't undo the apply.

### 4. Concurrency
The drawer applies to several targets without awaiting, so two
`resolve_effect_definitions` calls for the same id can overlap. Both produce the same
result and the second commit overwrites the first with an equal value. The duplicate warning
this could cause for an unresolved id is avoided by checking the map again just before
committing and warning only if the id is still absent. No in-flight promise map is needed
at this scale.

### 5. Verification without running the app
- Scratchpad test importing `effectFunctions.js` (same data-URL loader as in 2a):
  - every SRD definition of both editions resolves, not unresolved
  - Paralyzed, Petrified, Stunned and Unconscious contain Incapacitated's sub-effects with
    `from.source_key === "incapacitated"`, and Unconscious does not contain Prone's
    sub-effects
  - diamond (included once), cycle (terminates), missing include, unknown root → unresolved
  - legacy custom normalisation
  - the data files deep-equal their snapshot taken before resolving (no mutation)
- `npm run lint`.
- The user checks in the app, with Vue devtools on the `runEncounter` state, that
  `effect_definitions` fills on init and on apply, that a deleted custom effect logs one
  warning, and that a reset or encounter edit still saves (nothing leaked into the
  instances).

## Risks / Trade-offs

- [Consumers must use the getter, not `instance.sub_effects`] → 2f/2g read through
  `entity_effects` / `effect_definition`. Plan §2d is updated to say so.
- [Custom-effect fetches on init add latency] → One cached fetch per distinct custom
  effect, in parallel. Encounters typically hold a handful.
- [Legacy custom sub-effect types (`damage`, `ac`…) may not match v2 semantics] →
  Normalisation only renames fields. Interpreting them is step 3/4's problem, and step 4
  migrates the form.
- [Edition changes mid-encounter aren't picked up] → Intended (spec). The same applies to
  entity stats today.

## Migration Plan

No data changes. Rollback is reverting the code; the new state and getters are unused
until 2f.

## Open Questions

None.
