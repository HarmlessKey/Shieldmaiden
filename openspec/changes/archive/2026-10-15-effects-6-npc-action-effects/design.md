## Context

See proposal.md for the motivation. Current state that shapes the approach:

- **NPC actions**: each ability in `special_abilities`, `actions`, `bonus_actions`,
  `legendary_actions` and `reactions` has an `action_list` with at most one entry
  (`maxItems: 1` in `hk-npc-schema.json`): `type`, `attack_bonus` or `save_ability` /
  `save_dc`, and `rolls`. Captions and roll-button checks in `RollActions.vue`,
  `combat/actor/Actions.vue`, `CardActions.vue`, `compendium/Monster.vue` and
  `npcs/Actions.vue` read `action_list[0]` only.
- **Rolling already handles several entries**: `rollAction` in `src/mixins/dice.js` loops over
  every entry and returns one `actions[i]` per entry; `hk-single-roll.vue`, `shareRoll` and the
  log loop over `roll.actions` (spells with several actions use this). The one gap:
  `for (const roll of action.rolls)` (dice.js ~421) throws for an entry without rolls.
- **The form already loops** over `ability.action_list` (`Actions.vue` ~426) and the roll
  dialog carries `action_index`; it just has no way to add or remove an entry.
- **Effects schema**: `$defs/action_effects` (`save`, `on_hit`, `on_miss`, `on_fail`,
  `on_success`, `always`, lists of `$defs/application`) was written for this step but is not
  used anywhere yet. `$defs/application` is also the shape the drawer builds (with `save`
  holding the save to avoid the effect, and `concentration_id`).
- **Reusable form parts** (step 4): `EffectRefPicker` (SRD conditions, SRD effects of both
  editions, the user's custom effects; falls back to SRD only without an account),
  `DurationEditor` (with repeat save, escape, cancel triggers), `OptionalBlock`.
- **Choices** (step 5): `getRequiredChoices(definition)` lists what the drawer asks;
  `fixChoices` will turn fixed link choices into a definition in step 7. `ApplyEffect.vue`
  renders the choice inputs (labels, condition options, the value as a number stored as a
  string).
- **NPC form**: `src/components/npcs/Actions.vue` (950 lines) edits the five groups in place
  on the `npc` object, with a dialog for rolls. `EditNpc.vue` saves through the `npcs` store;
  it is also used without an account (Monster creator), where saving is offered after signing
  up.
- **Rules**: `firebase_rules/firebase-rules.json` (separate repository) validates the five
  groups separately, each `action_list/$listIndex` ending with `"$other": { ".validate": false }`.
  The 2b instance blocks show the style for effect data. `check-constants.mjs` checks the
  duration type regex of every `duration` under an `effects` key.

## Goals / Non-Goals

**Goals:**
- A link shape that steps 6b (traits) and 7 (rolls, spells) can extend without changing what
  this step stores.
- Authoring links in the NPC form for all five groups, stored on the user's NPC, accepted by
  the rules and the import.
- Several entries per ability (hybrid: rolls and links in any entry), which roll correctly.

**Non-Goals:**
- Applying links from a roll, the "apply to target(s)?" step and fixed choices skipping the
  drawer's questions (step 7).
- Scaling on links (spells, later), dice or roll-derived amounts on a link (step 7).
- Showing links, or entries after the first, in captions and stat blocks (the tracker's action
  list and card, the compendium).
- Trait effects on abilities (always-on, step 6b), SRD monster backfill (step 8c).

## Decisions

### 1. A separate `$defs/effect_link`, not `$defs/application`

`action_effects` lists switch from `application` to a new `effect_link`: `effect`, `duration`,
`choices`, `level`, `magical`, `additionalProperties: false`. `action_effects.save` is
removed.

- `application` is what the drawer applies: it has `save` (a save to avoid the effect) and
  `concentration_id`, which are runtime details. On an action they would duplicate or
  contradict the action's own save. Keeping them out of the stored link means the rules, the
  import and the form agree on one closed shape.
- `magical` goes on the link, not on `application`: it's an origin property (step 4 moved it
  off the definition), and step 7 copies it into the instance when it applies the link.
- Step 7 can add `scaling` to `effect_link` for spells, and 6b can reuse `effect_link`
  without duration for traits.
- *Alternative*: keep `application` and restrict it per use with `allOf`/`not`. Rejected:
  harder to read, and draft-07 can't close an object through `allOf`.

### 2. Links live on each action-list entry, and an ability can have several entries

`action_list[i].effects`, next to that entry's `rolls`. The effects belong to the sub-action
that has the attack or the save, so `on_hit` / `on_fail` always refer to that entry's own
attack or save. This keeps `ability.effects` free for step 6b's always-on trait links. All
five groups get it (user decision), special abilities included.

Hybrid (user decision): rolls and links can be in any entry. A bite that deals damage and
grapples on a hit is one entry. A bite that deals damage on a hit and poisons on a failed save
is two entries: attack + rolls, then save + rolls and/or an `on_fail` link. `maxItems` goes
from 1 to 5, enough for any SRD stat block (the most is an attack plus two saves), and small
enough to keep the form readable. The rules have no list limit and don't get one.

- *Alternative*: one entry per ability with links whose outcome carries its own save
  (`action_effects.save`). Rejected: it hides a second save inside the effects, needs a save
  editor in the link dialog, and `rollAction` would need to learn a new kind of save, while
  separate entries already roll today.

### 2b. Rolling several entries

`rollAction` already rolls every entry. Changes:
- dice.js: treat a missing `rolls` as `[]`, so an entry without rolls yields
  `{ type, rolls: [] }` (plus its to-hit or save DC) and adds no damage. Check that
  `hk-single-roll.vue`'s totals and save handling accept an action with no rolls.
- A shared `hasRolls(ability)` helper (in `src/utils/generalFunctions.js`): some entry is not
  of type other and has rolls. It replaces the `action_list[0]` checks that decide whether an
  ability gets a roll button: `RollActions.vue` (filter), `combat/actor/Actions.vue`,
  `CardActions.vue` (the roll button only), `compendium/Monster.vue` and `npcs/Actions.vue`.
  Captions that print the first entry's to-hit, save DC and rolls are left alone (user
  decision: no display of extra entries yet).
- Damage on a save entry keeps today's `save_fail_mod` behavior per roll; nothing new is
  decided per entry in this step.

### 3. The NPC schema references the effects schema by `$id`

`hk-npc-schema.json` refers to
`https://harmlesskey.com/schemas/hk-effects-schema.json#/$defs/action_effects` instead of
copying it, so the two can't drift. `ImportUserContent.vue` adds the effects schema to its
Ajv instance (`ajv.addSchema`) before compiling the NPC schema. The import page's "Copy
schema" shows the NPC schema; a note that `effects` follows the effects schema is enough
there.

### 4. Outcomes per action type are one constant

`ACTION_OUTCOMES` (label per outcome) and `outcomesFor(type)` in
`src/utils/effectsConstants.js`, next to the other effects labels:
attacks (`melee_weapon`, `ranged_weapon`, `spell_attack`) → `on_hit`, `on_miss`, `always`;
`save` → `on_fail`, `on_success`, `always`; everything else → `always`. Step 7 reads the
same constant to decide which links fire. Links under an outcome that doesn't fit are kept
and flagged (the spec), never moved: moving `on_hit` to `always` would change meaning.

### 5. Components

New, in `src/components/hk-components/hk-effects-form/` next to the parts they reuse:
- **`ActionEffects.vue`**: the list for one action-list entry. Props: the entry (edited in
  place, like the rest of `Actions.vue`), the NPC edition. Shows the links of all outcome
  lists in outcome order with name, outcome, summary, warning, edit and remove. Opens the
  dialog; on save writes the link into the right outcome list (moving it when the outcome
  changed), creating the list and `effects` with `$set` when needed.
- **`EffectLinkForm.vue`**: the dialog body. Works on a copy of the link plus its outcome; the
  dialog in `ActionEffects.vue` (q-dialog + ValidationObserver, like the roll dialog) commits
  it. Uses `EffectRefPicker`, a When select from `outcomesFor`, `ApplicationDuration` (decision
  10), choice fields, Level and a Magical toggle.

`Actions.vue` adds `<ActionEffects>` under the rolls card for every action-list entry, also
for type `other` (which has no rolls card). The entries are listed under an **Actions** label
with **Add action** at the end of the line (hidden at 5; pushes `{ type: "save" }` and opens
it). Each entry is a `q-expansion-item` like the abilities (one open per ability, `group`),
wrapped in its own `ValidationObserver` for the header's error icon. Its header is one line
(`actionHeader`: "Save · DC15 CON · 1 roll, 2 effects"), with a remove button from the second
entry on. The roll dialog already works per `action_index`. Its existing `$forceUpdate()` pattern is followed
so the unsaved changes indicator in `EditNpc.vue` reacts.

### 6. Choice fields shared with the drawer

The label and option logic in `ApplyEffect.vue` (`choiceLabel`, `choiceOptions`: abilities,
damage types, skills, creature types, SRD conditions; free text for `option`; number for
`value`) moves to a helper in `fieldControls.js` (`choiceField(choice, { conditions })`) that
both use. `ApplyEffect.vue` keeps its behavior. The link form adds a first option **Chosen
when applied** (`undefined`) to each select, and for `value` and `option` an empty input
means chosen when applied. A value is stored as `String(Number(x))`, like the drawer.

### 7. Resolving the definition in the form

`EffectLinkForm` resolves the picked reference to get its choices and level track:
- `srd` → `findSrdDefinition(npc.edition || default_edition, source_key)`, falling back to the
  other edition so an edition-only effect still shows its choices
- `custom` → `get_effect({ uid, id })` from the `effects` store (signed-in only)
- not found → the "definition not found" state from the spec: stored choices are shown read
  only, and Level shows only when the link already has one

Condition choice options come from the conditions of the NPC's edition.

### 8. Cleaning before save

`cleanEffectLink(link)` and `cleanActionEffects(effects)` in `effectFunctions.js` drop unset
fields, empty `choices`, `magical: false`, empty outcome lists and an empty `effects`.
`EditNpc.vue` runs `cleanActionEffects` over every action-list entry of the five groups just
before `add_npc` / `edit_npc`, so the stored NPC always matches the schema and rules no
matter how the form left it. The duration is cleaned with the same recursive walker as
`cleanEffectDefinition` (extract it rather than writing a second one), so numeric strings in
a duration become numbers. `choices` are cleaned separately and stay strings: the walker turns
numeric strings under keys like `value` into numbers, and a stored `choices.value` must stay
a string (schema and rules).

### 9. Rules

One `effects` block, copied into the `action_list/$listIndex` of each of the five groups:

```
"effects": {
  "$outcome": {
    ".validate": "$outcome.matches(/^(on_hit|on_miss|on_fail|on_success|always)$/)",
    "$linkIndex": {
      ".validate": "newData.hasChildren(['effect'])",
      "effect": {
        ".validate": "newData.hasChildren(['source', 'source_key'])",
        "source": …srd|custom|api…, "source_key": …≤100…, "name": …≤200…,
        "$other": { ".validate": false }
      },
      "duration": { same as the 2b instance block },
      "choices": { "$choice": { string ≤100 } },
      "level": { number 1–99 },
      "magical": { boolean },
      "$other": { ".validate": false }
    }
  }
}
```

The duration block copies the 2b instance block (type regex, value, unit, anchor, edge, save
with `ability`); its other children (escape, cancel triggers, ends when, on expire) are not
validated in detail, as in 2b. `check-constants.mjs` already finds every `duration` under an
`effects` key, so the five new blocks are checked without code changes; a task confirms it
reports them.

### 10. One duration component for the drawer and the link (revised after review)

The first version used the custom effect form's `DurationEditor`, which shows all of
`$defs/duration`. Compared with the drawer, that added fields the tracker ignores (ends by
action, rest type), duration types the drawer doesn't offer, and fields that describe the
effect rather than how long it lasts (ends when, effects when it ends), which definitions
already carry (`ends_when`, sub-effects with the `on_expire` trigger). User decision: the link
gets the drawer's duration fields, plus cancel triggers in both (option 3a).

- **`ApplicationDuration.vue`** (in `hk-effects-form/`): the drawer's duration fields moved out
  of `ApplyEffect.vue`, with the same labels and checks: type, value and unit, edge and anchor,
  Repeat save to end (with successes, escalation, automatic success), Escape, and the new
  **Ends early when** (since the second review: picked in the End effect select below). It keeps its own form state, emits the built duration (`input`, using
  `repeatSaveFromForm` / `escapeFromForm`) and whether it's valid (`valid`). A new
  `durationToForm` helper (next to them in `effectFunctions.js`) reads a stored duration back
  into the form state, so a link opens with its values.
  - `optional`: the duration can be left empty, which emits `undefined` (see "Optional
    duration" below).
  - `defaultSave`: the ability and DC a new repeat save starts with (the save sub-action's).
  - a slot after the type fields, where the drawer keeps its Concentration options.
- **Ends early when** offers the holder events the tracker fires (2g): `damage_taken`,
  `damage_dealt`, `on_hit`, `on_heal`, `on_bloodied`, labelled from `triggers` in
  `effectsConstants.js`. `on_attack` and `on_cast` aren't fired, so they aren't offered (the
  engine already ends instances on `duration.cancel_triggers`).
- The link dialog's Save button also needs the duration's `valid`: `EffectLinkForm` passes it
  up with `.sync`, since these fields don't use vee-validate (as in the drawer).
- **End effect select** (second review): the repeat save, escape and early-end toggles are one
  multiple select, **End effect**, with a description per option, in the spirit of the effects
  form's configurations and without add (+) buttons. Every selected option is a `q-tab`; its
  `q-tab-panel` holds the option's fields. Selecting an option opens its tab; removing one
  clears its values (`hasSave` / `hasEscape` off, `cancelTriggers` emptied). A stored duration
  opens with its options selected (from `durationToForm`). Ends early when needs an event while
  selected.
- **Optional duration** (second review): in `optional` mode the duration select starts empty
  (`null`), is clearable, has no "No duration" option, and says "Without a duration, it's asked
  when the effect is applied." as its hint. The End effect select is hidden without a duration.
  The drawer isn't optional and keeps Until removed as its default.
- `cleanEffectLink` drops `ends_when`, `on_expire`, `ends_by_action` and `rest_type` from a
  link's duration. The schema keeps them in `$defs/duration` (instances may still carry them),
  so this is enforced by the form and the cleaner, not by the schema or rules.

## Risks / Trade-offs

- [Rules copied five times] → The constants check covers the duration regex; a task diffs
  the five blocks to confirm they are identical.
- [External validators can't resolve the `$id` reference from "Copy schema"] → Only affects
  hand-checking an import file outside Shieldmaiden; the import itself resolves it. Noted in
  the schema dialog.
- [Custom effect links point at the author's ids] → Imported or shared NPCs keep the link and
  show its stored name; the resolver already treats unresolved references as names only.
- [Links stored now, applied only in step 7] → Users can author links that do nothing yet.
  Acceptable in the testing phase; the docs keep describing step 7's behavior as the plan
  decided.
- [Captions show the first entry only] → A bite's second (save) entry is invisible in the
  tracker's action list and card until display is done; the roll result does show it. Accepted
  by the user for this step.
- [Code that reads `action_list[0]` for behavior, not display] → The design lists the
  roll-button checks found by searching for `action_list[0]` / `action_list?.[0]`; the task
  repeats the search and confirms every remaining one is display only.
- [`Actions.vue` is large and mutates in place] → The list is a separate component and the
  dialog works on a copy, so the only in-place writes are add, replace and remove of a link.

## Migration Plan

No data migration: `effects` is optional and absent on every stored NPC. Deploy the rules
before (or with) the app, otherwise saving an NPC with links is rejected. Rollback: older app
versions ignore `effects` on action-list entries; older rules reject writes that contain it,
so remove links before rolling the rules back.
