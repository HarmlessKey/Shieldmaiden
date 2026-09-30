## Why

Since 2b, entities load their saved effect instances when an encounter opens. But an
instance is only a reference (`source` + `source_key`) plus instance data: the tracker
knows a target is Paralyzed, not what Paralyzed does. Step 2e of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
resolves each instance's definition when the encounter starts and whenever an effect is
applied. That includes flattening `includes`, so Paralyzed carries Incapacitated's
mechanics. This is what 2f (display), 2g (triggers) and step 3 (mechanics) read from.
The same change finishes the runtime half of 2d. Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §2 (definition vs
instance) and §3.7 (`includes`).

## What Changes

- **One lookup for SRD definitions**: find an SRD definition by `url` across the effects
  and conditions data of the campaign edition (`"5e"` / `"5.5e"`), so callers don't care
  which file holds it.
- **Custom definitions** are read through the existing `effects/get_effect` store action
  (cached per session). Legacy custom effects saved by the current form store
  `subeffects` / `subtype`. They are read as `sub_effects` / `sub_types`, without
  rewriting anything in the database.
- **`includes` flattening**: an `includes` sub-effect pulls in the referenced
  definition's sub-effects recursively. Each definition is included at most once, a cycle
  guard stops loops, and pulled-in sub-effects are tagged with the definition they came
  from.
- **Resolved definitions live in encounter state, separate from the instances**: a map
  keyed by `source:source_key` holding `name`, `description`, `category`, `cancelable`,
  the flattened `sub_effects` and an `unresolved` flag. A getter pairs an entity's
  instance with its resolved definition.
  - The plan said to "attach `sub_effects` onto the in-memory instance". This is changed
    on purpose: since 2b the instance objects are shared with the cached encounter and
    campaign. Some paths (encounter edit and reset) write the cached encounter back
    whole, and the database rules reject `sub_effects` on an instance.
  - Resolving per definition also means ten Prone instances resolve once.
- **When resolution runs**:
  - On encounter init, after all entities are added, every distinct definition used by any
    entity is resolved once.
  - `apply_effect` makes sure the applied definition is resolved after the write succeeds.
  - The map is cleared when a new encounter starts, so a changed campaign edition or an
    edited custom effect is picked up on the next init and not mid-encounter.
- **Unresolved references**, such as a deleted custom effect, an unknown `url`, `source:
  "api"` before step 8, or the demo without a user, are never errors. The instance keeps its
  stored `name`, resolves to no sub-effects with `unresolved: true`, and a warning is logged
  once per definition per encounter.

## Capabilities

### New Capabilities
- `effects-runtime-resolution`: how active effect instances are paired with their
  definitions at runtime. It covers the lookup per source and campaign edition, `includes`
  flattening, legacy custom effects, when resolution happens, where the result lives, and
  how unresolved references behave.

### Modified Capabilities
<!-- none: effects-instance-storage and effects-drawer requirements are unchanged -->

## Impact

- `src/utils/effectFunctions.js`: `findSrdDefinition`, `normalizeDefinition` (legacy
  custom shape), `resolveDefinition` (async, lookup injected, includes and cycle guard).
  All are pure and tested in the scratchpad.
- `src/store/modules/runEncounter.js`: `effect_definitions` state plus mutation, the
  `resolve_effect_definitions` action (called at the end of `init_Encounter` and from
  `apply_effect`), and the `effect_definition` / `entity_effects` getters.
  `effect_definitions` is cleared through the existing default state.
- Reads the `effects` store module (`get_effect`); no service, rules or database changes.
- No visible UI change in this step: the drawer keeps its own definition list, and 2f
  starts reading the resolved state. It can be verified through Vue devtools and the
  scratchpad tests.
- `.planning/effects-implementation-plan.md`: §2d and §2e marked done after archive, with
  the "separate map" deviation noted in §2d.
