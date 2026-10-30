# NPC abilities with linked effects but no rolls

Follow-up of effects step 7 ([effects-implementation-plan.md](./effects-implementation-plan.md),
"7. Update action rolls to include effects"), found while specifying the monster action parser
([monster-action-parser-skill.md](./monster-action-parser-skill.md), "Found while specifying").
Needed before the 11c backfill fills `/v2/monsters` with these abilities.

## Problem

An NPC ability only gets a roll button when one of its `action_list` entries is not of type
`other` and has rolls (`hasRolls` in `src/utils/generalFunctions.js`). Step 7 applies linked
effects (`action_list[i].effects`) from the roll card, so an ability whose entries carry links but
no rolls can't apply them from the tracker at all. Common in the SRD (benchmark cases in
`scripts/monster-action-skill/benchmark/cases.json`):

| Ability | Entries | Links |
| --- | --- | --- |
| Chuul Paralyzing Tentacles, Basilisk Petrifying Gaze, Mummy Dreadful Glare, Harpy Luring Song, Copper Dragon Slowing Breath, Sphinx Weight of Years | `save`, no rolls | `on_fail` |
| Ghast Stench (special ability) | `save`, no rolls | `on_fail` |
| Giant Spider Web | `ranged_weapon` (+5), no rolls | `on_hit` Restrained with an escape |
| Knight Parry (reaction) | `other` | `always` Armor Class Bonus 2, end of turn |
| Duergar Invisibility | `other` | `always` Invisible, Concentration up to 1 hour, magical |

Spells already have the second case: `applyOnlySpell` (`src/utils/effectFunctions.js`) gives
spells whose links are all Always an **Apply** button in `RollSpells.vue` (`apply_spell` in
`src/mixins/runEncounter.js`).

## Decisions

- **Two kinds, mutually exclusive.** Only links on an outcome that fits the entry's type count
  (`outcomesFor`, as the roll card lists them); links left on an outcome that no longer fits
  are ignored, as in the roll card.
  - **Roll button** (`rollableAbility`): `hasRolls`, or the ability has a link and an attack
    (`melee_weapon`, `ranged_weapon`, `spell_attack`) or `save` entry. The roll card already
    works without dice: an attack rolls to hit with Hit / Miss, a save shows its ability and
    DC with Fail / Save (and the target's save roll), and the single **Apply** (or **Missed**)
    applies the links for the chosen result.
  - **Apply button** (`applyOnlyAbility`): the ability has a link, no entry has dice (type
    other, or no rolls) and none is an attack or save. Then every link that fits is Always.
- **Attacks and saves need a link.** A new NPC ability starts as `[{ type: "melee_weapon" }]`
  (actions) or `[{ type: "save" }]` (legendary actions), so many custom NPCs have attack or
  save entries with nothing in them. Those keep having no roll button.
- **Tracker only.** The compendium (`compendium/Monster.vue`) and the NPC form
  (`npcs/Actions.vue`) keep `hasRolls`: they roll without a target, so there's nothing to
  apply the links to.
- **Apply works like the spell Apply.** One method for both, `apply_action` (was
  `apply_spell`): confirm restrictions (**Apply anyway**), use the reaction out of turn, spend
  the use (limited use, recharge, legendary action cost; for spells the slot or innate use),
  then apply the ability's Always links to every targeted creature with the creature as the
  caster, without a roll card. A link that leaves a choice open or has no duration falls back
  to the roll card, which asks for them. Concentration follows the per-effect rule of monster
  actions (`apply_linked_effects` without a cast), as from the roll card.
- **Targets as for spells.** Apply needs a target; a self-buff (Parry, Invisibility) targets the
  creature itself, as a spell with range Self does. The tracker already shows "Targeted self".
- **Spending what a use costs** moves to one mixin method, `spendUse`, shared by
  `doRollAction` and `apply_action` (same conditions as before).

## Changes

- `src/utils/effectFunctions.js`: `rollableAbility(ability)` and `applyOnlyAbility(ability)`,
  next to `applyOnlySpell`; both count links per entry with `outcomesFor`.
- `src/mixins/runEncounter.js`: `apply_spell` → `apply_action` for spells and NPC abilities;
  `spendUse`; `linkDefinition` (SRD in the campaign's edition or the other, or the user's
  custom effect), from `apply_spell`.
- `src/components/combat/actions/RollActions.vue` (actor panel and legacy panel): roll button
  for `rollableAbility`, **Apply** (blue, like the roll icon) for `applyOnlyAbility`, before the
  limited-use controls; `rolls-only` keeps both kinds.
- `src/components/combat/actor/Actions.vue`: an action type is listed when it has an ability of
  either kind.
- `src/components/combat/entities/Card/CardActions.vue` (rollable cards): the same roll button
  and Apply.
- `src/components/combat/actions/RollSpells.vue`: calls `apply_action`.
- `src/docs/effects.md`, "From actions and spells": NPC abilities without rolls.
- `.planning/monster-action-parser-skill.md`: the finding points here.

## Not changed

- `hasRolls` itself, the compendium and the NPC form (see Decisions).
- The roll card (`hk-single-roll.vue`): it already handles rolls without dice.
- Captions: `captionEntries` already shows an attack without rolls ("+5 to hit") and a save
  without rolls ("CON 13"); an apply-only ability has no caption, like an apply-only spell.

## Verify

- `npm run lint`
- Static checks (node scripts outside the repo, 2026-10-30, all passing):
  - the helpers against the 29 benchmark cases and edge cases: the save and attack cases are
    rollable, Parry and Invisibility are apply-only, every ability with dice keeps its roll
    button, entries without links (Multiattack, empty new abilities, an attack bonus alone)
    get neither, never both; `applyOnlySpell` unchanged
  - `apply_action` and `spendUse` with a stubbed component: restrictions with Apply anyway, the
    reaction, the recharge and legendary cost spent, one apply per target with the creature as
    the caster, the fallback to the roll card without a duration, Aid with its slot and cast
  - `rollAction` on Web, Paralyzing Tentacles and Stench: a to-hit or save DC, no dice, links
  - the changed templates compile (`vue/compiler-sfc`)
- Manual (user), in an encounter with SRD-shaped NPCs:
  - Chuul Paralyzing Tentacles on a target: roll card with CON 13, Fail → Poisoned and
    Paralyzed apply with the single Apply.
  - Giant Spider Web: roll to hit, Hit → Restrained with its escape; Miss → **Missed**, nothing
    applied; the recharge is spent.
  - Knight Parry on the knight itself, out of turn: Apply gives it Armor Class Bonus 2 until
    the end of the turn and uses its reaction; no roll card.
  - Duergar Invisibility: Apply starts the duergar's Concentration and Invisible linked to it;
    the recharge is spent.
  - An Always link without a duration: Apply opens the roll card with the duration field.
  - Aid / Bless still apply from the spell list as before.
