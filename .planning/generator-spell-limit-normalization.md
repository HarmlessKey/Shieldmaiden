# Generator: normalize invalid spell limit (-1 → 0)

## Problem
The AI monster generator (external service called via `src/services/monster_generator.js` →
`src-ssr/api/index.js` `/ai/generate-monster`) occasionally returns `innate_spells` entries with
`limit: -1`, most often for cantrip-like spells that should be usable at will. Per the app's
existing convention, `limit === 0` means "at will" / unlimited (see
`src/components/combat/entities/Card/CardSpellcasting.vue` and
`src/components/npcs/RollSpells.vue`, both of which treat `0` as `Infinity`). A `limit` of `-1`
is schema-valid (`src/schemas/hk-npc-schema.json` allows `minimum: -1`) but semantically wrong
and not handled by the `0 → Infinity` display logic, so these spells render with a bogus limit
instead of "at will".

## Fix
In `src/components/npcs/GenerateMonster.vue`, `generate()`, extend the existing inline
normalization block (already fixes up `hit_dice` and `roll.miss_mod` on the raw generator
response) to also coerce any spell with `limit === -1` to `limit = 0`, for every spell in
`monster.innate_spells` (the only spell collection with a `limit` field — `caster_spells` only
has `level`).

This is a small, targeted fix living alongside the other post-generation sanitization already
in that method — no new shared utility needed.

## Out of scope
- No change to the external generator service itself.
- No change to `caster_spells` (no `limit` field there).
- No change to schema validation bounds.
