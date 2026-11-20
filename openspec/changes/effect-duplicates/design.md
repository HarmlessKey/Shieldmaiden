## Context

See proposal.md for the motivation. What the code does today:

- **Instances**: `buildEffectInstance` (`effectFunctions.js`) builds the stored instance. The
  schema and the DB rules already allow `charges` (a number), but nothing sets or reads it.
- **Saving one field**: `persist_effect` (`runEncounter.js`) writes one property of an
  instance. Exhaustion's level is changed from `ActiveEffect.vue` (`setLevel`) through
  `apply_effect`. `remove_effect` with `reason: "used"` ends an effect that's used up
  (`consume_roll_modifiers`).
- **Attacks**: `hk-single-roll.vue` decides `hitOrMiss[index]` per attack in `checkHitOrMiss`
  against `displayStats(effectiveTarget()).ac`, with a Hit/Miss toggle per attack. It fires
  the hit triggers (`fireRollTriggers`), offers linked effects per outcome (`linksToApply`),
  and builds the damage per action, which goes through `applyDamageModifiers`.
- **Conditions**: `evaluateConditionSet` and the three-valued check used for attack modifiers
  evaluate `has_condition`, `has_effect` and HP checks, with `subject: "counterpart"` as the
  other party in an attack. `sense` isn't evaluated, so it's always unknown.
- **Senses**: NPCs have `senses.blindsight` / `senses.truesight` (`{ <sense>: true, range }`)
  in their stat block. Sense sub-effects (`type: "sense"`, `sub_types: ["truesight"]`) are
  only shown as reminders.

## Goals / Non-Goals

**Goals:**
- Mirror Image (both editions) works from data, without code that knows its name.
- Attacks resolved in the roll dialog handle duplicates without the DM tracking them.
- The DM can always override: the outcome per attack, the sight exception, the count.

**Non-Goals:**
- Attacks the dialog doesn't resolve (player attacks entered by hand, damage without an attack
  roll). The DM lowers the count in the detail view.
- Using `charges` for other consumables (Guardian of Faith's damage pool, uses of a reaction).
  The field is shared, but only Duplicates sub-effects read it in this change.
- Line of sight and whether the attacker can see the holder in other ways (darkness,
  invisibility). Only Blinded and the senses are checked; the rest is the DM's toggle.
- Blindsight range. A sense is assumed to reach the target.
- The HK API itself. This change writes the two definitions as JSON; adding them to the API
  is done in that repo.

## Decisions

### 1. Schema shape of the Duplicates sub-effect

```json
{
  "type": "duplicates",
  "count": 3,
  "check": {
    "when": "targeted",
    "dice_type": 20,
    "min_roll": [{ "duplicates": 3, "min": 6 }, { "duplicates": 2, "min": 8 }, { "duplicates": 1, "min": 11 }]
  },
  "ac": { "formula": "10 + dex_mod" },
  "condition": [
    { "subject": "counterpart", "type": "has_condition", "value": "blinded", "negate": true },
    { "subject": "counterpart", "type": "sense", "value": "blindsight", "negate": true },
    { "subject": "counterpart", "type": "sense", "value": "truesight", "negate": true }
  ]
}
```

- `count`: integer ≥ 1. `check.when`: `targeted` | `hit`. `check.dice_type`: one of the die
  sizes the schema already uses. `check.min_roll`: integer, or an array of
  `{ duplicates: integer ≥ 1, min: integer }`. `ac`: `$defs/formula`.
- The schema uses an `if type = duplicates` branch: `count` and `check` are required, and
  `sub_types`, `value`, `roll`, `trigger` are not allowed.
- **Why an array for the table:** an object keyed by `"3"`, `"2"`, `"1"` would be turned into
  an array by Firebase when a custom definition is saved.
- **Why `condition` and not a new "ignored by" field:** the existing condition set with the
  counterpart subject already says "the attacker isn't Blinded", and the form already builds
  it. When `min_roll` has no row for the duplicates left, the closest lower row is used, and
  without any the check fails.

Rejected: a `trigger: "on_attacked"` with an `outcome` sub-effect. Triggers become prompts
after the roll, but the duplicate check has to change the roll's result before damage is
applied.

### 2. The count lives in `instance.charges`

`buildEffectInstance` sets `charges` to the `count` of the first Duplicates sub-effect in the
definition's own `sub_effects` (not `includes`). It needs the definition, which it already
receives. The DB rules and the instance schema need no change.

A helper `duplicatesOf(instance, definition)` returns `{ sub_effect, left, max }` or null, and
`targetDuplicates(entity, entityKey, definitionOf)` picks the instance with the most left.

### 3. The check runs in the roll dialog, as a pure helper

`duplicateCheck({ sub_effect, left, attack, ac, random })` returns
`{ dice, min, outcome: "duplicate_hit" | "duplicate_miss" | "creature", rolled }`:
- `targeted`: rolls one die. On the minimum, compares the attack total with the duplicate AC
  (natural 20 and 1 as in `checkHitOrMiss`), or hits without an `ac`.
- `hit`: only called for an attack that hits the creature. Rolls `left` dice, and any die at
  the minimum is a duplicate hit.

`hk-single-roll.vue` keeps a `duplicates[index]` next to `hitOrMiss[index]`, filled in
`checkHitOrMiss` in action order with a running `left`. The duplicate AC is evaluated with
the target's formula variables. The outcome toggle sets `duplicates[index].outcome`, and the
running count is recomputed for the following attacks when the DM changes one.

An action whose outcome isn't `creature` is treated as not hitting the creature:
- its `hitOrMiss` is `"miss"` for the creature (so no damage, no hit triggers)
- its linked effects (hit and miss) are left out of `linksToApply`
- the damage lines are shown struck through with "hits a duplicate"

On Apply, the dialog dispatches `use_duplicates({ key, effectKey, count })` with the number of
duplicate hits.

Rejected: rolling in the damage prompt (`damageModifiers.js`). By then the hit is already
decided and linked effects may have been applied.

### 4. Sight exception through `sense` conditions

`sense` becomes evaluable for an entity: true when its stat block's `senses[value]` is set
(`senses.blindsight.blindsight === true`, or any truthy entry), or when one of its active
effects has a `sense` sub-effect with `value` in its `sub_types` and no unmet `condition`. A
player without `senses` only has the effect ones. It's added to `EVALUABLE_CHECKS`, so it
also works for other attack modifiers that test the other party's senses.

When the condition fails, `duplicates[index]` is `{ skipped: "the attacker has Truesight" }`
with a "Check anyway" button. The reason text comes from the first failing check.

### 5. `use_duplicates` and the detail view

`use_duplicates({ key, effectKey, count })` and `set_duplicates({ key, effectKey, value })` in
`runEncounter.js` clamp to `0..max`, write `charges` with `persist_effect` (and commit it), and
call `remove_effect` with `reason: "used"` at 0. Demo and test mode follow `persist_effect`'s
existing rules.

`ActiveEffect.vue` shows "Duplicates: N of 3" with − and + buttons for an instance with a
Duplicates sub-effect.

### 6. Chips

The chip's badge value becomes: Exhaustion level, else duplicates left, else rounds left. The
tooltip adds "N duplicates left".

### 7. Definitions

Two SRD definitions with `url: "mirror-image"` (2014 with `edition: "5e"`, 2024 with
`edition: "5.5e"`), written as JSON for the API repo and copied as admin paste-test effects.

## Risks / Trade-offs

- [Attacks resolved outside the dialog don't lower the count] → The count is visible on the
  chip and can be changed in the detail view.
- [A Blindsight with a short range is assumed to reach] → The DM uses "Check anyway".
- [`charges` will later be used by other consumables] → Only Duplicates read it now. A future
  consumer has to say which sub-effect owns it; one instance with two consumables isn't
  supported.
- [A custom definition edited after applying] → `max` comes from the current definition, and
  the count is clamped to it when changed.

## Migration Plan

No migration. No definition uses the new type, and `charges` is already allowed by the rules.
Ship the app, then add the SRD definitions to the API.
