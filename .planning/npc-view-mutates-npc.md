# Viewing an NPC in Edit NPC corrupts it (#362)

## Problem
On the Edit NPC page, clicking **View** opens the statblock drawer. Afterwards the NPC no longer
adheres to the NPC schema, so saving fails.

## Root cause
`EditNpc.vue` `viewNpc()` passes `this.npc` by reference to `drawers/ViewNpc` →
`compendium/Monster.vue`, which assigns it to `this.monster` and mutates it while rendering:

- `mixins/monster.js` `defensesDisplay()` writes capitalized values (`"Fire"`) back into the
  `damage_*` arrays. The schema enum expects `"fire"`, `"bludgeoning_nonmagic"`, etc.
- `Monster.vue` `spellsForLevel()` / `spellsForLimit()` set `spell.key` on every spell
  (`caster_spells` items have `additionalProperties: false`), and `spellsForLimit()` sets
  `spell.limit = Infinity` for at-will spells.
- `Monster.vue` `beforeMount` writes `proficiency` onto the passed `data`, which also triggers
  "Unsaved changes" in the deep watcher of `EditNpc.vue`.

The same spell helpers are copy-pasted in `combat/ViewEntity.vue` and
`combat/entities/Card/CardSpellcasting.vue`; `defensesDisplay` is shared with `ViewEntity.vue` and
`CardDetails.vue`.

Separately, `EditNpc.vue` `revertChanges()` calls `JSON.parse()` on an object (`npc_copy`) and throws.

## Fix
Render helpers return derived copies and never write to the source object.

1. `defensesDisplay`: `defenses.map(...)` instead of in-place assignment.
2. `Monster.vue`, `ViewEntity.vue`, `CardSpellcasting.vue`: `spellsForLevel` / `spellsForLimit` map
   to `{ ...spell, key }`; `(spell.limit || Infinity) == limit` replaces the `limit = Infinity` write.
3. `Monster.vue` `beforeMount`: `this.monster = { ...this.data, proficiency }`.
4. `EditNpc.vue` `revertChanges`: `JSON.parse(JSON.stringify(this.npc_copy))`.

No data migration: saves with the corrupted fields were rejected.

## Verification
- `npm run lint`
- Edit an NPC with a caster spell, an at-will and a 1/day innate spell, a resistance and an
  immunity. Click View: statblock is unchanged, spell popovers open, no "Unsaved changes" after
  closing, Save succeeds, Revert works.
- Combat tracker: entity card and ViewEntity still show spells and defenses.
