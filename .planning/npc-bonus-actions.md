# NPC Bonus Actions

## Goal

Add **Bonus Actions** as a fifth action category for NPCs, next to the existing
`special_abilities`, `actions`, `legendary_actions` and `reactions`. Includes:

1. A new `bonus_actions` array on the NPC data model (Firebase, validated by the NPC schema).
2. Full editor support in the NPC builder, including a **safe "Move to" control** that lets
   users move an existing action or special ability (or any other ability) to a different
   category — e.g. an action to a bonus action — without retyping or losing data.
3. A Bonus Actions section in the combat tracker (new UI and legacy UI), with the same
   roll / limited-use / recharge behavior as regular actions.
4. Bonus Actions rendered in monster/NPC stat blocks.

## Data model

`bonus_actions` is an array of ability objects with the exact same shape as `actions` /
`reactions` (name, recharge, limit, limit_type, desc, reach, range, aoe_type, aoe_size,
options, action_list). No `legendary_cost`, no counter equivalent to `legendary_count`.

Display/iteration order everywhere: `special_abilities`, `actions`, **`bonus_actions`**,
`legendary_actions`, `reactions` (bonus actions directly after actions, matching official
stat block layout).

The field is optional, so existing NPCs and API monsters (which have no `bonus_actions`)
remain valid — no migration needed.

## Safe move behavior (editor)

In the NPC editor each ability gets a "Move" button (next to Remove) that opens a popup
listing the other categories. Moving an ability:

- keeps every shared property (rolls, options, limits, recharge, description, etc.);
- when moving **to** `legendary_actions`: sets `legendary_cost: 1` if missing (schema
  requires it);
- when moving **out of** `legendary_actions`: removes `legendary_cost` (schema forbids it
  via `additionalProperties: false`);
- appends to the target category (creating the array if needed) and removes it from the
  source category.

It is safe because nothing is persisted until the user saves the NPC, and no ability data
is dropped other than the category-specific `legendary_cost` field.

## Files to change

| File | Change |
| --- | --- |
| `src/schemas/hk-npc-schema.json` | Add `bonus_actions` property definition (clone of `actions`). |
| `src/components/npcs/Actions.vue` | Add category to editor list; add Move-to-category control + `move()` method. |
| `src/components/compendium/Monster.vue` | Add `bonus_actions` ("Bonus Actions") to stat block categories. |
| `src/components/combat/actor/Actions.vue` | Add `bonus_actions` to `action_types` (initiative list actions dropdown). |
| `src/components/combat/entities/Card/CardActions.vue` | Add category to monster card actions (combat tracker stat block). |
| `src/components/combat/top/index.vue` | Add to turn-start limited-use/recharge categories. |
| `src/store/modules/runEncounter.js` | Copy `bonus_actions` onto combat entities. |
| `src/components/combat/legacy/Current.vue` | Add to turn-start limited-use categories (legacy UI). |
| `src/components/combat/legacy/actions/Roll.vue` | Add "Bonus" tab + tab fallback chain (legacy UI). |
| `src/components/combat/legacy/actions/Actions.vue` | Include `bonus_actions` when deciding to show the Actions tab. |
| `src/mixins/monster.js` | Include `bonus_actions` when parsing old/external monster data. |
| `src/components/userContent/ImportUserContent.vue` | Include `bonus_actions` in versatile→options conversion. |
| `src/views/Admin/MonsterUpdate.vue` | Add to allowed properties / action ability lists. |
| `src/components/npcs/GenerateMonster.vue` | Include `bonus_actions` in roll normalization of generated monsters. |

## Out of scope

- API (SRD) monster content — the content API does not serve `bonus_actions`; nothing to do.
- Players/companions — bonus actions for player characters already exist via
  `generalConstants.js` and are unrelated.
- No new limited-use counter analogous to `legendary_count`.
