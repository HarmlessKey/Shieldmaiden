## 1. Engine

- [x] 1.1 Add `stackKey(instance, definition, effectKey)` to `src/utils/effectFunctions.js` (definition key, plus `#effectKey` for `stacking.mode: "independent"`); verify with a scratchpad test that two instances of an independent definition get different keys and two of a normal one the same
- [x] 1.2 Replace every inline `${instance.source}:${instance.source_key}` grouping key in `effectFunctions.js` with `stackKey`; verify with a grep that none are left
- [x] 1.3 Scratchpad test for the spec scenarios: Strength 16 with two Strength Drain instances (rolled 3 and 2) is 11 with two tooltip lines; two independent −1d4 attack penalties give two dice in `rollModifiers`; two independent damage penalties both appear in the damage bonuses; two Bless instances still give one d4

- [x] 1.4 Keep `stacking` in `resolveDefinition`, so the tracker's loaded definitions have it; verify with the scratchpad test going through `resolveDefinition`

## 3. Shared chip

- [x] 3.1 `effectChipItems`: group by source, source_key and caster_key, with `count`, `effectKeys` (newest first), `effectKey` of the newest copy and the lowest badge; verify with a scratchpad test: two Strength Drains from one caster give one item with count 2, from two casters two items, timed copies with 7 and 3 rounds left give value 3, and a single instance is unchanged
- [x] 3.2 `Effect.vue`: "×N" in the bottom-left corner and "N copies" in the tooltip when `count` > 1; verify by reading the template and styles
- [x] 3.3 `ActiveEffect.vue`: list the copies (same grouping key, from the live entity), newest first, with applied round, rounds left, choices, rolled values and a Remove button each; choosing one shows its details; removing the shown copy moves to the newest remaining one or closes; verify by reading, in both the tracker and the campaign mode
- [x] 3.4 Docs: the shared chip in `src/docs/effects.md`; verify by reading

## 2. Docs and checks

- [x] 2.1 Update the Stacking section of `src/docs/effects.md`: Independent means every instance counts, with Strength Drain as the example; verify by reading the section
- [x] 2.2 Run `npm run lint`, the existing scratchpad tests t1–t8 and `openspec validate independent-stacking --strict`, and confirm all pass
