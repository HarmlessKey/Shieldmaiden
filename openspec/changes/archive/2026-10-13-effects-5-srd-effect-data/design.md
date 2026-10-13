## Context

See proposal.md for the why. Current state that shapes the approach:

- `src/utils/effectFunctions.js` imports `src/data/5e/effects.js` and `src/data/5.5e/effects.js`
  into `SRD_DEFINITIONS[edition] = { conditions, effects }`. Every SRD read goes through
  `getSrdDefinitions(edition)` (drawer, form reference pickers) or
  `findSrdDefinition(edition, url)` (encounter resolver `resolve_effect_definitions`, live
  view, Reaction Used, legacy conditions). Nothing else imports the data files except the two
  scripts in `scripts/validate-effects-data/`, which load them through a `data:` URL import.
- A comparison of the two effect files (33 shared urls): 2 are byte-identical (Gauntlets of
  Ogre Power, Ioun Stone (Strength)), 22 have the same mechanics with edition-specific text, 9
  differ in mechanics; Burning, Alert and Enthrall are 5.5e only.
- Choices: a sub-effect's `choice` is one kind. The engine checks it in about ten places, in
  three patterns: `sub_effect.choice && instance.choices?.[sub_effect.choice] === undefined`
  (skip until chosen), `sub_effect.choice === "<kind>"` (use the chosen value for one field),
  and `withChosenValue` (value choice). `getRequiredChoices` already returns one entry per
  kind, and `ApplyEffect.vue` and the drawer's shift+click read only that, so they work per
  kind already. The form (`SubEffect.vue`, `SubEffectField.vue`, `fieldControls.js`,
  `configurationSummaries.js`, `ChoiceInfo.vue`) treats `choice` as a string.
- The instance stores `choices` keyed by kind, so all sub-effects of one effect that use the
  same kind share one answer. Every basic effect has one sub-effect, so this is not a
  limitation for them.

## Goals / Non-Goals

**Goals:**
- One SRD effects file, with edition-specific entries marked and generic entries shared.
- Choice handling that accepts a string or a list everywhere, through one helper.
- "Fix a choice on a definition" (`fixChoices`), ready for step 6's links that fix a choice.

**Non-Goals:**
- `edition` on custom effects or in the custom effect form. The schema allows it on any
  definition, but custom effects stay edition-agnostic (drawer spec) and the form doesn't
  show it.
- Moving conditions into the shared file. They are all edition-specific.
- A separate "basic effects" group in the drawer. They're listed with the other SRD effects,
  sorted by name and found with the drawer's search (see Open Questions).
- Per-sub-effect answers for the same kind (two value choices with different numbers on one
  effect).
- Serving the file from the HK API (step 8b) or linking effects to actions (steps 6–7).

## Decisions

### One file, filtered by `edition`
`src/data/effects.js` exports the full list. `SRD_DEFINITIONS` is built once per edition at
module load: `effects.filter(d => !d.edition || d.edition === edition)`. `getSrdDefinitions`
and `findSrdDefinition` keep their signatures, so no caller changes. The `edition` prop stays
on the definition objects; it's harmless to the engine and the form never saves SRD data.

*Alternative:* keep per-edition files plus a shared file. Rejected (user decision): the
`edition` prop would be redundant in per-edition files, and step 8b serves one edition-aware
list anyway.

Ordering in the file: shared entries first (Reaction Used, the basic effects, the identical
items), then edition-specific pairs next to each other (5e above 5.5e), so the two versions of
an effect are read and fixed together.

### Which entries lose `edition`
An entry is shared only when its mechanics and description hold under both editions. That is
the basic effects, Absorption and Reaction Used (a tracker concept with neutral text).
Everything that quotes or summarises an edition's rules text keeps one entry per edition,
even when the mechanics are equal (Bless, Haste): the description differs, and the drawer
shows it.

### Items and plain-bonus spells are not entries (added after review)
An item or spell that is one plain bonus, minimum or set value is a basic effect with the
number fixed by its link (steps 6–7), the same way a clay golem's Absorption is Absorption
with acid fixed. Gauntlets of Ogre Power, Ioun Stone (Strength), Aid, Barkskin, Fly,
Longstrider and Shield of Faith are removed; four basic effects are added for them (Ability
Score Bonus, Ability Score Minimum, Armor Class Minimum, Fly Speed), and Hit Point Maximum
Bonus gets `also_heal` (Aid; a negative value heals nothing). Spells with several mechanics or
a formula (Haste, Bless, Mage Armor, False Life) stay entries. Robe of the Archmagi (base AC
formula, Advantage on saves against magic, +2 spell DC and attack) can't be one basic effect;
a DM applies the basic effects for it, and step 6b links them to the item.

### Removed urls break (user decision)
We're in a testing phase: stored instances of removed urls (`acid-absorption`, the items and
spells above) become unresolved references (name shown, no mechanics), as for any unresolved
reference. No aliases. *Alternative:* aliases that resolve a retired url to its basic effect
with fixed choices. Built first, then dropped: the item names and texts no longer matched the
effect, and nothing outside dev depends on them.

### `choice` is a string or an array
Schema: `choice` becomes `oneOf: [kind, { type: array, items: kind, minItems: 2, uniqueItems }]`.
A single kind stays a string (no data or Firebase migration, and the form saves a string for
one kind). One helper in `effectFunctions.js`, `choiceKinds(sub_effect)`, returns the kinds as
an array (`[]` for none). The three engine patterns become:
- skip until chosen: `missingChoice(sub_effect, instance)`: any kind without a value
- use the chosen field: `choiceKinds(sub_effect).includes("damage_type")`, etc.
- `withChosenValue`: checks `includes("value")`

Every existing `sub_effect.choice` comparison in `effectFunctions.js` and the form is
replaced; a grep for `\.choice\b` after the change should only hit the helper.

*Alternative:* a separate `value_choice: true` flag next to `choice`. Rejected: it only solves
value + one other kind, and the form would need a second control.

### Fixing choices on a definition
`fixChoices(definition, choices)` returns a copy where every sub-effect (nested included)
that asks for a fixed kind gets the field filled (`damage_type` → `damage_types: [type]`,
`ability` → `abilities`, `skill` → `skills`, `value` → `value`, `condition` → `conditions`,
`creature_type` → `creature_types`) and that kind removed from `choice`; a roll's
`damage_type_choice` becomes `damage_type`. The result asks for nothing that was fixed, so
`getRequiredChoices` and every engine check behave as for a hand-written definition.
`fixChoices` drops the authored text of a sub-effect whose choice it fixes ("the chosen
number"), so the generated text shows. Nothing calls it yet; step 6 uses it for links.

### Basic effect encodings
Each is one sub-effect, built with what the engine already supports (3b–3e):
- value bonuses: `{ type: "bonus", sub_types: [<subtype>], choice: "value" }`
- two-choice bonuses: `choice: ["ability", "value"]` on `save` / `ability`,
  `choice: ["skill", "value"]` on `skill`
- Advantage / Disadvantage: `type: "advantage" | "disadvantage"`, `sub_types: ["save"]` or
  `["ability"]` with `choice: "ability"`; `["attack"]` without a choice; the "attacks against"
  pair uses `perspective: "against"`
- defenses: `{ type: "defense", sub_types: ["r" | "v" | "i"], choice: "damage_type" }`
- `damage_modifier` `reduce_damage` with `choice: ["damage_type", "value"]`, and `absorb`
  with `choice: "damage_type"` (the step 4 docs example)

`reduce_damage` and `bonus` on `max_hp` must be checked against the engine during
implementation: if one of them doesn't read a chosen value or type yet, the fix goes in the
engine, not in the data.

### New edition-specific effects
Hex, Hunter's Mark, Warding Bond and Rage use the catalogue §5 encodings, minus origin fields
and `scaling`. Rage's `class.rage_damage` formula becomes `choice: "value"`: the definition
can't know the barbarian's level, and the link (step 6b, player features) will fix it later.
Each is added only for an edition whose SRD (5.1 / 5.2.1) contains it; that's checked against
the SRD text when the entry is written.

### Validation per edition set
`validate.mjs` loads `src/data/effects.js` and the two condition files, builds both edition
sets the same way the app does, and runs the existing checks per set (url uniqueness,
references, cycles). New check: `edition` is only on effects and is `"5e"` or `"5.5e"`.
`check-constants.mjs` reads the merged file and accepts array choices.

## Risks / Trade-offs

- [Two definitions with the same `url` in one file look like a duplicate] → the validator
  checks uniqueness per edition set, and a comment at the top of the file explains the rule.
- [A shared entry silently changes both editions] → only entries whose text is edition-neutral
  are shared; the rule is in the spec and in the file's header comment.
- [Missing one `.choice` comparison leaves a multi-kind sub-effect broken] → the grep check
  above, and a scratchpad script that runs the engine collectors over every basic effect with
  sample choices.
- [Shared choice answers across sub-effects] → accepted (Non-Goals); basic effects have one
  sub-effect each.
- [Dev encounters that hold a removed url] → accepted: they show the name with no mechanics;
  remove and re-apply the basic effect.

## Migration Plan

No data migration. Deploy is the app release. Rollback is reverting the commit: instances only
store `source_key` and string-or-array `choices` values, and an older build reads a
`choice` array as an unknown kind (the sub-effect is skipped) only for SRD definitions that
won't exist in that build anyway.

## Open Questions

- Whether the drawer should show basic effects in their own group at the top, for faster
  access. It needs a marker on those entries (e.g. a list of their urls), not a schema change,
  so it can be added after this change.
