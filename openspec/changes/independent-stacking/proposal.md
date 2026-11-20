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

Not in this change: the other modes (`level` outside Exhaustion, `replace`) and
`per_caster`. Applying an effect already adds a new instance, so only the counting changes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `effects-stat-modifiers`: "Only applicable modifiers count" gets the independent exception.
  Roll modifiers and damage bonuses already follow this rule ("as for numeric modifiers"), so
  `effects-roll-modifiers` needs no delta.

## Impact

- `src/utils/effectFunctions.js`: one helper for the key that groups instances of the same
  definition, used everywhere `${source}:${source_key}` is built for that now
  (`effectiveStats`, `rollModifiers`, damage bonuses, `activeDefinitions` and the rest).
- `src/docs/effects.md`: the Stacking description.
- No schema, database rules or data migration: `stacking` is already in the schema, and no
  current definition sets `independent`.
