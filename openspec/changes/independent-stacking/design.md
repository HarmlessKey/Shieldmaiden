## Context

`effectFunctions.js` groups the instances of one entity by definition with the key
`${instance.source}:${instance.source_key}`, built inline in about ten places:
- `effectiveStats`: keeps the instance that changes a value most (per field)
- `rollModifiers`: keeps the instance with the most entries
- damage bonuses, `activeDefinitions` (damage modifiers) and other lookups: a `seen` set skips
  later instances

`apply_effect` (`runEncounter.js`) already stores a new instance each time a non-condition
effect is applied, so two Strength Drain hits are two instances with their own
`rolled_values`. Only the counting drops the second one.

## Goals / Non-Goals

**Goals:**
- Every instance of an `independent` definition counts, everywhere.
- No change for any other definition.

**Non-Goals:**
- `stacking.mode` `level` (outside Exhaustion's existing handling), `replace`, and
  `per_caster`. They stay as they are; the form keeps showing them.
- Applying: `apply_effect` already adds an instance, so nothing changes there.

## Decisions

### 1. One helper for the stacking key

`stackKey(instance, definition, effectKey)` returns `${source}:${source_key}`, or
`${source}:${source_key}#${effectKey}` when `definition.stacking?.mode === "independent"`.
Every place that builds the key inline uses it instead. With a unique key per instance, the
existing "keep one per key" code keeps all of them, so no grouping logic changes.

The definition is the resolved one (`definitionOf(instance)`), which every one of these places
already has before building the key.

Rejected: a flag that skips the grouping in each place. Ten places with their own skip would
drift; one key keeps the rule in one spot.

### 2. Labels

Two instances show as two lines with the same name ("Strength Drain: −3", "Strength Drain:
−2"). The rolled value in the line already tells them apart, so no numbering is added.

## Risks / Trade-offs

- [A place that groups by definition is missed] → The tasks list each one found with a grep
  for `source_key}` in `effectFunctions.js`, and the scratchpad test covers stats, roll
  modifiers and damage bonuses.
- [Custom definitions marked Independent in the form start counting every instance] → That's
  what the setting says in the form and docs; no current SRD definition uses it.

## Migration Plan

None. Ship the app, then add `strength-drain` with `stacking: { mode: "independent" }` to the
HK API.
