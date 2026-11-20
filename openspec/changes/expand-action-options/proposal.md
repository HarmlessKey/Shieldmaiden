# Proposal

## Why

An NPC ability's options can only change single rolls: each option after the first can change a
roll's dice or damage type, or ignore the roll (`roll.options`). Every entry, save and effect
link still applies to every option. Many SRD abilities need more than that: a breath weapon whose
options have different saves and effects, or an attack that does more when the monster charges.
The monster action parser (step 11c, "SRD monsters", of `.planning/effects-implementation-plan.md`)
can't store these correctly, and the review denied them for it.

Examples from the review:
- **5e metallic dragon Breath Weapons**: Fire Breath is a Dexterity save with fire damage, and
  Sleep Breath is a Constitution save with no damage that applies Unconscious.
- **5.5e charge attacks** (Boar Gore, Wereboar Tusk and 11 more): "If … moved 20+ feet straight
  toward it immediately before the hit, the target takes an extra 7 (2d6) Piercing damage and
  has the Prone condition". A Normal option with the plain hit, and a Charge option with the
  extra damage and an On a hit Prone link.

## What Changes

- An option of an NPC ability can have **its own action list**: entries with their own type
  (attack, save, healing, damage, other), attack bonus or save, rolls and effect links. Rolling
  the ability with that option rolls that list instead of the ability's action list.
- The first option stays the ability's own `action_list`. Options without their own list work as
  today: per-roll changes (versatile weapons stay as they are).
- The NPC form lets a non-first option switch to **own actions** and edit them with the same
  entry and link editors as the ability's action list.
- The NPC schema (Shieldmaiden and HK API), the database rules and the NPC import accept and
  check the option lists.
- Not in this change: spells (they share the options mechanism, and the data shape is chosen so
  they can follow later), an area per option, and the monster parser skill and backfill (HK API,
  their own step once this is built).

No breaking change: existing NPCs have no option lists and roll as before.

## Capabilities

### New Capabilities
- `npc-action-options`: options of an NPC ability, by name, with per-roll changes or a whole
  action list of their own: storing them, editing them in the NPC form, and rolling with one.

### Modified Capabilities
- `effects-action-links`: "Abilities with several entries can be rolled" rolls the chosen
  option's own list when it has one, and the roll button considers every list.

## Impact

- `src/schemas/hk-npc-schema.json` (Shieldmaiden) and `schemas/hk-npc-schema.json` (HK API): a new
  `option_actions` on abilities of the five groups.
- `src/mixins/dice.js`: picks the list to roll from the chosen option.
- `src/components/npcs/Actions.vue`, `hk-action-roll-form.vue`, `hk-action-rolls-table.vue`: the
  option's own actions in the NPC form; renaming and removing an option keep its list in step.
- `src/components/hk-components/hk-action-rolls/hk-roll-action.vue`, `RollActions.vue`,
  `CardActions.vue`, `src/utils/generalFunctions.js` (`hasRolls`): roll buttons and captions.
- `firebase_rules/firebase-rules.json`: `option_actions` on the five ability groups of user NPCs.
- NPC import validation, and the docs page on NPC actions.
- Later, in HK API: the monster action parser skill writes option lists, and the `monsters_v2`
  backfill stores them.
