## 1. Engine

- [ ] 1.1 Add `stackKey(instance, definition, effectKey)` to `src/utils/effectFunctions.js` (definition key, plus `#effectKey` for `stacking.mode: "independent"`); verify with a scratchpad test that two instances of an independent definition get different keys and two of a normal one the same
- [ ] 1.2 Replace every inline `${instance.source}:${instance.source_key}` grouping key in `effectFunctions.js` with `stackKey`; verify with a grep that none are left
- [ ] 1.3 Scratchpad test for the spec scenarios: Strength 16 with two Strength Drain instances (rolled 3 and 2) is 11 with two tooltip lines; two independent −1d4 attack penalties give two dice in `rollModifiers`; two independent damage penalties both appear in the damage bonuses; two Bless instances still give one d4

## 2. Docs and checks

- [ ] 2.1 Update the Stacking section of `src/docs/effects.md`: Independent means every instance counts, with Strength Drain as the example; verify by reading the section
- [ ] 2.2 Run `npm run lint`, the existing scratchpad tests t1–t8 and `openspec validate independent-stacking --strict`, and confirm all pass
