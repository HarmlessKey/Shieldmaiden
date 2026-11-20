## Context

See proposal.md for the motivation. Current state that shapes the approach:

- **Effect links** (step 6): `$defs/effect_link` (`effect`, `duration`, `choices`, `level`,
  `magical`) and the link UI: `ActionEffects.vue` (one-line `hk-table` list + dialog) and
  `EffectLinkForm.vue` (When, Effect, Choices, Level, Duration, Magical; resolves the
  definition in the NPC's edition; `choiceField` for the choice inputs).
- **Tracker entities** get their NPC's `special_abilities` (and the other ability groups) when
  the encounter loads (`runEncounter.js`, `case "npc": case "companion":`), for NPCs and
  companions alike. Applied effects are `entity.effects`: on the encounter for NPCs, on the
  campaign for players and companions.
- **Definitions** are resolved once at encounter start from every loaded instance's
  `{ source, source_key }` (`resolve_effect_definitions`) and read through the
  `effect_definition` getter (`definitionOf`).
- **The engine reads `entity.effects` directly** in about fifteen places in
  `effectFunctions.js` (`activeDefinitions`, `hasCondition`, `matchTriggers`,
  `durationActions`, `effectiveStats`, `effectiveDefenses`, `rollModifiers`,
  `attackModifiers`, `damageBonuses`, `restrictions`, `damageModifiers`, drop to 1…) and in a
  few store actions and getters. Display code (card chips, the drawer's applied list, the
  live view) also reads `entity.effects`.
- **Consuming** goes through `remove_effect` (`consume_roll_modifiers`, drop to 1's single-use
  path…). `remove_effect` already skips a key it doesn't find in `entity.effects`.
- **Limited uses**: `set_limitedUses({ key, category, index })` counts uses in
  `entity.limited_uses[category][index]` (stored on the encounter), and the card shows them
  with `LimitedUseCounter` against the ability's `limit`.

## Goals / Non-Goals

**Goals:**
- Trait effects that every engine path sees, without storing them or touching display code
  that lists applied effects.
- One place that knows how trait instances are built and one place that handles using them up.

**Non-Goals:**
- Player features (Evasion on a rogue): later, when there's a place on the character.
- Trait links with open choices, durations, repeat saves or escapes.
- Applying action links from rolls (step 7), SRD monsters from the API (step 8c).

## Decisions

### 1. Trait links are `effect_link`s without duration, on `special_abilities[i].effects`

`hk-npc-schema.json` gets `effects` on the special ability item (not on the shared
`action-list`): an array of `allOf: [{ $ref: effect_link }, { not: { required: ["duration"] } }]`.
Reusing `effect_link` keeps one link shape for actions, traits and later spells.
`ability.effects` was kept free for this in step 6, so `action_list[i].effects` (action links)
and `ability.effects` (trait links) never mix.

- *Alternative*: a separate `$defs/trait_link`. Rejected: it would copy four of five fields.

### 2. Trait instances are derived, keyed `trait:<abilityIndex>:<linkIndex>`

`traitInstances(entity, holderKey)` in `effectFunctions.js` builds, for each trait link, an
instance in the applied shape: `{ name, source, source_key, choices, level, caster_key:
holderKey, caster_name: entity.name, trait: { ability_index, ability_name, link_index } }`.
Tracker entities don't store their own key (the store keys them), so the holder's key is
passed in, as the engine functions already do with `holderKey` / `entityKey`. It leaves out
links of an ability whose limited uses are spent (`limited_uses.special_abilities[i] >=
limit`). Only NPCs and companions get them (`entityType !== "player"`).

`effectEntries(entity, holderKey)` returns `[effectKey, instance]` for `entity.effects` plus
`traitInstances(entity, holderKey)`. Every engine loop over `entity.effects` (the list in Context, and the
store getters that feed it: `entity_effects` is display-only and stays as is) switches to
`effectEntries`. Display code keeps reading `entity.effects`, which is how trait effects stay
out of the card, the drawer list and the live view without any change there.

- Instances carry no `duration`: duration ticking and expiry (`durationActions`) skip trait
  keys explicitly, so they never tick, expire or get "rounds left".
- A trait instance's `trait` field lets prompts and notices name the ability: wherever the
  effect's name is shown for a prompt, `instance.trait?.ability_name` is used first.
- *Alternative*: write trait instances into `entity.effects` at encounter load. Rejected: they'd
  be persisted, shown everywhere, removable in the drawer, and go stale when the NPC changes.

### 3. Definitions of trait links are resolved at encounter start

The refs collected before `resolve_effect_definitions` include every trait link's `effect` of
every NPC and companion, so `definitionOf` finds them like any applied effect's definition, in
the campaign's edition. A companion or NPC added during the encounter resolves its trait links
when it's added (the add actions already dispatch `resolve_effect_definitions` for effects).

### 4. Using up a trait effect counts a limited use

`remove_effect` checks the key first: for a `trait:` key it doesn't touch `entity.effects`;
when the ability has a `limit` it dispatches `set_limitedUses({ key, category:
"special_abilities", index: ability_index })` and announces the use like a consumed effect
("used"); without a limit it does nothing. Because `traitInstances` leaves out spent
abilities, the effect is inactive until the uses are reset with the existing counter.
`set_effect_prop` (charges, save counters) ignores `trait:` keys, so a trait's `consume.uses >
1` counts one use per consumption on the ability rather than charges on an instance.

- *Alternative*: per-instance charges stored somewhere new. Rejected (user decision): reuse the
  ability's limit and its existing counter and storage.

### 5. NPC form: a Trait effects list on special abilities

`ActionEffects.vue` gets a `trait` mode instead of a second list component: the value is the
special ability, links live in `value.effects` (an array, no outcome lists), the table has no
When column, and the dialog uses `EffectLinkForm` with `trait` set. In `trait` mode
`EffectLinkForm` hides When and Duration, and makes every choice required (`rules="required"`,
no "Chosen when applied" placeholder). `Actions.vue` shows the list for `special_abilities`
only, after the Actions list, under a **Trait effects** label. `cleanEffectLink` already drops
empty fields; a `cleanTraitEffects(list)` helper drops duration and empty lists, called by
`EditNpc.vue` next to `cleanActionEffects`.

### 6. Automated marker in the tracker

Where the tracker lists a creature's special abilities (`CardActions.vue` and the actor's
`RollActions.vue`), an ability with trait links shows a small `fa-sparkles` icon with a
tooltip naming the linked effects and their fixed choices ("Absorption (acid)"), using the
summary helper from the link list.

### 7. Rules

`special_abilities/$abilityIndex/effects/$linkIndex` with `effect` (source, source_key,
name), `choices/$choice` (kind regex, string ≤100), `level` (1–99), `magical` (boolean) and
`$other: false`. No `duration` key, so it's rejected. The constants check only checks
`duration` regexes, so it needs no change.

## Risks / Trade-offs

- [Missing a loop over `entity.effects`] → A task greps every `.effects` read in the engine and
  store and lists each as switched or display-only; a scratchpad check runs the main collectors
  (defenses, damage modifiers, roll modifiers, conditions) on an entity with only trait links.
- [Prompts that write back to the instance] (repeat saves, escapes, Concentration) → trait
  instances have no duration, save or escape, so those paths don't arise; `set_effect_prop` and
  `remove_effect` guard `trait:` keys anyway.
- [Stale trait effects] → derived from `special_abilities` on the loaded entity; NPC edits
  apply on the next encounter load, as other stat block edits do.
- [Players' features stay manual] → accepted; noted in the plan for a later step.

## Migration Plan

No migration: `effects` on special abilities is optional. Deploy the rules with the app,
otherwise saving an NPC with trait links is rejected. The SRD definitions used as traits
(Absorption, Undead Fortitude, Evasion, Uncanny Dodge, Reliable Talent, Magic Resistance) stay;
instances applied by hand in old encounters keep working.
