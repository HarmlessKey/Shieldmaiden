# Design

## Context

Today an ability has `options: string[]`. The first option is the ability as stored; every other
option can change single rolls through `roll.options[<option>]` (`ignore`, `damage_type`,
`dice_count`, `dice_type`, `fixed_val`). The NPC form edits these per roll in the roll dialog
(`hk-action-roll-form`). `hk-roll-action` offers a menu with one roll per option and passes the
option's name, and `dice.js` rolls `ability.action_list` and applies a roll's changes when the
chosen option has them. Versatile weapons were converted to this shape (`convertVersatileToOptions`).
Spells use the same `options` and `roll.options`.

The effects feature links effects to action-list entries (effects-action-links) and applies them
from the roll result (effects-apply-from-rolls), which reads the entries `dice.js` rolled.

## Goals / Non-Goals

**Goals:**
- An option can replace the whole action list: other entries, types, saves, rolls and links.
- Existing NPCs and the per-roll changes keep working without a migration.
- One place decides which list is rolled, so the roll result and applying effects follow it.

**Non-Goals:**
- Spells. The same `option_actions` shape fits them, but spell options, slot scaling and the spell
  form are left for later.
- An area, range or reach per option. An ability keeps one area; for breath weapons with options,
  that is the first option's area, as the parser already does.
- Conditional extra damage that isn't a named option (Goblin Boss "with Advantage"): its own
  proposal.
- The monster action parser skill and the `monsters_v2` backfill (HK API).

## Decisions

### D1. `option_actions`, a map from option name to action list

`option_actions: { "<option>": [entries] }` next to `options`.

- **Not** turning `options` into objects (`[{ name, action_list }]`). That breaks every stored
  NPC and spell with `options: string[]`, the chips select that edits them, and the database
  rules, and it needs a migration.
- **Not** tagging entries with the options they belong to. The charge case differs inside one
  entry (the same attack with an extra roll and a Prone link), so tags would still need
  per-entry overrides, and breath weapons need a different save, not more entries.

Keying by name matches `roll.options`, which is keyed by name too, so the form already keeps
names in step when they change.

### D2. An own list replaces the action list, it doesn't add to it

Rolling an option with a list rolls that list only. The Charge option repeats the attack entry.
That duplication is the price of a model the DM can read: what you see in the option is what is
rolled. Merging or appending was rejected: it can't express a different save.

### D3. No per-roll changes on an own list

`roll.options` only applies to the ability's own `action_list`. An own list holds its final
values, so there is one way to vary a roll, not two.

### D4. The first option is the ability's list

The first option has no key in `option_actions`. This keeps the stored ability readable by
everything that only knows `action_list` (stat blocks, captions, exports, the API, the skeleton
check of the monster parser), which see the default variant.

### D5. Keys are checked in code, the shape in the schema

JSON Schema can't relate the keys of `option_actions` to the values of `options`. The schema
checks that every value is an action list (`$ref` to the action-list definition). The NPC import
and the NPC form check the keys: each is an option, not the first. The database rules check the
shape like an `action_list`, not the keys.

### D6. One switch in the form, starting from a copy

Each option after the first gets an **Own actions** switch. On copies the ability's action list
(without other options' roll changes) so the DM edits the difference, and shows the entries with
the existing entry and link editors. Off asks for confirmation and drops the list. A copy, not a
live reference: later edits to the base attack don't reach the option.

### D7. Rolling

`dice.js` picks `ability.option_actions?.[config.option] || ability.action_list` once, where it now
reads `ability.action_list`, and skips the `roll.options` changes when it picked an own list.
`hasRolls` looks at every list. The caption stays the ability's own list, followed by the names
of options with their own list.

## Risks / Trade-offs

- [The base attack is edited and a Charge copy isn't] → the form shows the option's entries
  under the option, so the difference is visible; no syncing, by design (D6).
- [Old app versions in other tabs roll the base list for every option] → acceptable: they roll
  what they did before this change, and nothing is lost on save as long as the form keeps
  unknown keys. Check that saving from an old form doesn't drop `option_actions`.
- [Five copies of the action-list rules in `firebase-rules.json`] → add `option_actions` next to
  each, with `$option` children that reuse the same child rules.

## Migration Plan

None: no stored NPC has `option_actions`. Deploy order: database rules first, then the app. Roll
back by reverting the app; the rules accepting an unused field are harmless.

## Open Questions

- Option names the parser writes for charge attacks ("Normal" and "Charge", or the name the
  text gives). Decided in the parser skill step; it doesn't change this design.
