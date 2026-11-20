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

### 3. Copies share a chip

`effectChipItems` groups its entries by `source:source_key:caster_key` (an empty caster key
for none), keeping the order of the first copy. A group of one is the chip it is now. A
larger group gets `count`, `effectKeys` (newest first) and `effectKey` = the newest copy;
"newest" is the highest Firebase push key, which sorts by creation time. Its `value` is the
lowest badge of its copies, so a timed group shows the copy that ends first.

The grouping is for every effect, not only Independent ones: two copies of a non-stacking
effect from one caster are just as confusing as two chips, and the engine already picks the
copy that counts. It isn't the same key as `stackKey`, which groups across casters.

`Effect.vue` shows `×{{ count }}` in the empty bottom-left corner (the badge is top-left, the
initial bottom-right) and "N copies" in the tooltip.

### 4. The detail view finds the copies itself

`ActiveEffect.vue` keeps getting `{ entityKey, effectKey }` (or the campaign form). It finds
the other copies from the entity's live `effects` with the same grouping key, so they stay
right when a copy is added or removed while the drawer is open. A local `selectedKey`
(starting at `data.effectKey`) decides which copy the details show; Remove on a copy removes
that key, and when the shown one is gone it moves to the newest remaining copy, or closes when
none remain. Each copy's line shows its applied round, rounds left, choices and rolled values
(the rolled values via the existing tooltip text, e.g. "Strength −3").

Rejected: passing the group's keys in the drawer data. They'd be stale as soon as a copy is
added or removed.

## Risks / Trade-offs

- [`effect-duplicates` also changes the chip requirements] → It modifies "Chips show a badge
  and a tooltip"; this change modifies "Effect chips are shown on combatants" and adds a new
  requirement, so archiving them in either order keeps both.
- [The live view groups too] → It uses `effectChipItems`, so players see "×2" as well. Its
  chips are read-only, so only the chip changes there.

- [A place that groups by definition is missed] → The tasks list each one found with a grep
  for `source_key}` in `effectFunctions.js`, and the scratchpad test covers stats, roll
  modifiers and damage bonuses.
- [Custom definitions marked Independent in the form start counting every instance] → That's
  what the setting says in the form and docs; no current SRD definition uses it.

## Migration Plan

None. Ship the app, then add `strength-drain` with `stacking: { mode: "independent" }` to the
HK API.
