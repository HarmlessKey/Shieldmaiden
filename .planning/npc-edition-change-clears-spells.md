# NPC Edition Change Clears Spells

## Problem

Custom monsters (NPCs) have an edition field (`hk-edition-select` in `npcs/BasicInfo.vue`).
The spells on an NPC (`caster_spells` / `innate_spells`) reference content of a specific
edition, and the spellcasting UI itself differs per edition — in 5.5e the `caster` category is
dropped entirely and only `innate` (labelled "Spellcasting") remains.

Switching edition today silently keeps the old spell lists, which leaves the NPC pointing at
spells of the wrong edition, and in the 5e → 5.5e direction leaves `caster_spells` behind in
a section the form no longer shows.

## Solution

In `src/components/npcs/BasicInfo.vue`, intercept the edition select instead of binding it
straight to `npc.edition`:

- `hk-edition-select` becomes `:value` + `@input="setEdition"`.
- `setEdition(edition)` — if the edition actually changes **and** the NPC has spells
  (`caster_spells` or `innate_spells` with at least one entry), store the new edition as
  pending and open a confirm dialog. Otherwise set it straight away, so NPCs without spells
  keep the current one-click behaviour.
- Confirm dialog (`hk-dialog`, persistent, no close icon) warns that changing the edition will
  clear all spells from this spellcaster, with **Cancel** and **OK**.
- **OK** → applies the pending edition and deletes `caster_spells` and `innate_spells`.
- **Cancel** → closes and drops the pending edition. The select is controlled by
  `npc.edition`, which was never touched, so it falls back to the old edition on its own.

## Scope of the clearing

Only the two spell lists are removed — that's what the warning promises. The edition-agnostic
spellcasting config (`*_ability`, `caster_level`, `*_save_dc`, `*_spell_attack`,
`caster_spell_slots`) is kept, so a user who re-picks their spells doesn't have to re-enter
the DC and attack bonus.
