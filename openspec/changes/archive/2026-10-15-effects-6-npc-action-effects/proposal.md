## Why

Effects can be applied by hand in the tracker, but a monster's stat block can't say which
effects its actions cause: a bite that grapples (escape DC 14), a breath that poisons until
the target saves. Step 4 made definitions generic and step 5 added the basic effects and
`fixChoices`, so the missing piece is the **link**: an action names an effect, when it
applies, how long it lasts and which choices it fixes. This is step 6 of the effects plan
([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md), "6.
Monster actions carry effects" and "Generic effects"; monster patterns from
[monster-actions-effect-scan.md](../../../.planning/monster-actions-effect-scan.md) and
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md)). For now the scope is
authoring and storage on the user's own NPCs: applying linked effects when an action is rolled
is step 7, and SRD monsters from the HK API get their links in step 8c.

## What Changes

- **Effect link shape in the effects schema**: a new `$defs/effect_link` holds what a link
  stores: `effect` (required), `duration`, `choices`, `level` and `magical`. `$defs/action_effects`
  lists links in `on_hit`, `on_miss`, `on_fail`, `on_success` and `always`, and loses its own
  `save`: the action's save ability and DC are used. Scaling with a spell slot is not part of
  this step (spells come later; monsters don't upcast).
- **NPC schema**: every action-list entry of the five ability groups (special abilities /
  traits, actions, bonus actions, legendary actions, reactions) gets an optional `effects`
  object (`$defs/action_effects`). Existing NPCs without it are unchanged and keep working.
- **Several entries per ability** (hybrid): an `action_list` may hold more than one entry
  (`maxItems` goes from 1 to 5). Every entry has its own type, attack bonus or save, rolls and
  effects. Damage and an effect on the same outcome need one entry (a bite that deals damage
  and grapples on a hit). Different outcomes get their own entries (a bite that deals damage on
  a hit, plus a Constitution save entry that poisons on a failed save).
- **NPC form**: an expanded ability lists its entries under **Actions**, each a collapse item
  titled with its type and a summary, with **Add action** at the end of the label and a remove
  button on every entry but the first. Each entry has an **Effects** list next
  to its rolls. A link is added and edited in a dialog with:
  - **Effect**: SRD condition, SRD effect or custom effect (the existing effect picker).
  - **When**: the outcomes that fit the action type: On a hit / On a miss for attacks, On a
    failed save / On a successful save for save actions, and Always for every type.
  - **Duration**: the same duration fields as the Effects drawer, in one shared component (type,
    time, next turn, repeat save, escape), plus **Ends early when**, which the drawer gets
    too. What ends an effect otherwise, and what it does when it ends, stays on the definition.
  - **Choices**: one field per choice of the definition: fixed here, or left **Chosen when
    applied**. A value choice is a number.
  - **Level**: only for an effect with a level track.
  - **Magical**: a toggle.
- Links that don't fit the action type any more (an On a hit link after the type changes to
  a save) are kept and marked, so nothing is lost silently.
- **Rolling abilities with several entries** works in the tracker and the compendium: an
  ability gets a roll button when any entry has rolls (not only the first), and an entry
  without rolls (a save that only applies an effect) no longer breaks the roll. Captions and
  stat blocks keep showing the first entry only. Linked effects are still not applied (step 7).
- **Saving**: empty outcome lists and an empty `effects` object are not saved. Unset fields
  are not written.
- **Database rules** (`firebase_rules/firebase-rules.json`): the NPC `action_list` entries of
  all five groups accept a validated `effects` block; anything else under it is rejected.
- **Import**: the NPC import validates `effects` against the effects schema. Links to custom
  effects of another account resolve to nothing and show by their name, like any unresolved
  reference.
- **Constants check**: the duration type check covers the new rules blocks.
- **User documentation** (`src/docs/effects.md`, "Action effects"): brought in line with what is
  built: the dialog's labels, traits can link action effects too, and Scaling is for spell
  links only. The page's text about applying effects from rolls (step 7) stays.

## Capabilities

### New Capabilities
- `effects-action-links`: the effect link shape, NPC abilities with several action-list
  entries that each carry rolls and links, how the NPC form edits them, rolling such
  abilities, what is saved, and how the database rules and import check them.

### Modified Capabilities
- `effects-drawer`: the application form gets **Ends early when** (`duration.cancel_triggers`),
  and its duration fields become the component the link dialog shares.

## Impact

- **Schemas**: `src/schemas/hk-effects-schema.json` (`$defs/effect_link`, `$defs/action_effects`),
  `src/schemas/hk-npc-schema.json` (`$defs/action-list` items get `effects`).
- **UI**: `src/components/npcs/Actions.vue`, new link list and link dialog components (next to
  the effects form components in `src/components/hk-components/hk-effects-form/`), the
  choice inputs shared with `src/components/drawers/encounter/effects/ApplyEffect.vue`.
- **Rolling**: `src/mixins/dice.js` (`rollAction`, entries without rolls); the roll-button
  checks in `src/components/combat/actions/RollActions.vue`,
  `src/components/combat/actor/Actions.vue`,
  `src/components/combat/entities/Card/CardActions.vue`,
  `src/components/compendium/Monster.vue` and `src/components/npcs/Actions.vue`.
- **Engine helpers**: `src/utils/effectFunctions.js` (outcomes per action type, cleaning a
  link before saving); `getRequiredChoices` and `findSrdDefinition` are reused.
- **Import**: `src/components/userContent/ImportUserContent.vue` registers the effects schema
  so the NPC schema's reference resolves.
- **Rules**: `../firebase_rules/firebase-rules.json` (separate repository).
- **Scripts**: `scripts/validate-effects-data/check-constants.mjs` (rules check), plus a
  schema check for NPC fixtures.
- **Docs**: `src/docs/effects.md`.
- **Not touched**: applying linked effects from a roll (step 7), showing more than the first
  entry in captions and stat blocks, the HK API and SRD monsters (step 8c), trait effects on
  abilities (step 6b). No Firebase migration.
