## Why

A Shadow's Strength Drain lowers Strength again with every hit, so two hits are two
reductions. The tracker applies each hit as its own instance, but "the same definition counts
once" then keeps only the strongest one, so the second hit does nothing. The schema already
has `stacking.mode: "independent"` for this, but nothing reads it.

## What Changes

- An effect definition with `stacking.mode: "independent"` SHALL count every instance on an
  entity: in effective stats, d20 roll modifiers, damage bonuses and the other places that
  now count a definition once.
- Without it (no `stacking`, or `mode: "none"`), nothing changes: the same definition still
  counts once.
- The SRD `strength-drain` definition (to be added to the HK API) uses it.
- Docs: the Stacking setting says what Independent does in the tracker.
- Fix: the tracker's definition loader (`resolveDefinition`) kept `stacking`, so the engine
  sees the setting.
- Display: copies of the same effect from the same caster share one chip with a "×N" count,
  for every effect. The detail view lists the copies, each with its own Remove button.
  Without this, two Strength Drain hits are two identical chips you can't tell apart.

Not in this change: the other modes (`level` outside Exhaustion, `replace`) and
`per_caster`. Applying an effect already adds a new instance, so only the counting changes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `effects-stat-modifiers`: "Only applicable modifiers count" gets the independent exception.
  Roll modifiers and damage bonuses already follow this rule ("as for numeric modifiers"), so
  `effects-roll-modifiers` needs no delta.
- `effects-display`: "Effect chips are shown on combatants" no longer means one chip per
  instance, and a new requirement covers the shared chip and the copies in the detail view.
  "Chips show a badge and a tooltip" is left alone, because `effect-duplicates` modifies it.

## Impact

- `src/utils/effectFunctions.js`: one helper for the key that groups instances of the same
  definition, used everywhere `${source}:${source_key}` is built for that now
  (`effectiveStats`, `rollModifiers`, damage bonuses, `activeDefinitions` and the rest).
- `src/docs/effects.md`: the Stacking description, and the shared chip.
- `effectChipItems` in `effectFunctions.js`, `combat/entities/effects/Effect.vue` (the count)
  and `drawers/encounter/effects/ActiveEffect.vue` (the copies list).
- No schema, database rules or data migration: `stacking` is already in the schema, and no
  current definition sets `independent`.
