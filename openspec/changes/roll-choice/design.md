## Context

Choices are made when an effect is applied and stored as strings in `instance.choices`, keyed
by kind. `withChosenValue(sub_effect, instance)` swaps a chosen value into a sub-effect before
it's used, and every place that reads a value goes through it. Links on NPC actions, traits
and spells fix choices with `fixChoices(definition, choices)`, which fills the field a kind
stands for (`CHOICE_FIELDS`) and drops the open choice.

A sub-effect's dice live in `roll` (`dice_count`, `dice_type`, `fixed_val`, `modifier`,
`damage_type`, `damage_type_choice`, `magical`). They're used in three places:
- `rollEffectValues` rolls stat sub-effects once when applied (`rolled_values`)
- `effectRollParts` / `amountRoll` build damage and healing rolls when they trigger
- `rollModifiers` and `damageBonuses` turn them into bonus dice on rolls

## Goals / Non-Goals

**Goals:**
- One choice kind, `roll`, that works in all three places the same way `value` does.
- Links can fix it, so one definition serves monsters with different dice.
- The form stops offering a Roll field that's ignored (Value choice).

**Non-Goals:**
- A list of allowed dice per sub-effect (1d4/1d6/1d10 only). Links fix the dice per monster;
  a DM applying by hand can type anything.
- Spell `scaling` tiers for a roll choice. Scaling still changes only the value choice and
  level.
- Changing the HK API data. Collapsing Weakening Breath and Giggling Magic into one definition
  each is a follow-up for the API.

## Decisions

### 1. Store the roll like every other roll, check it in one place

`choices.roll` is `{ dice_count, dice_type, fixed_val }`, the shape of a reminder's damage and
a sub-effect's Roll, and it's entered the same way: Dice, Die (select) and Fixed value
(`ChosenRollInput`). `chosenRoll(choice)` in `effectFunctions.js` returns the cleaned roll or
`undefined`: dice need a count of 1 to 99 and a die of 2 to 100 together, the fixed value is a
whole number, and a fixed value alone is a roll too. A fixed value of 0 next to dice is
dropped. The application form, the roll dialog and the link dialog use it to validate
(`validChoice`) and to store (`storedChoice`); the link dialog also uses per-field rules, so
Save stays disabled for half a die. `chosenRollText` shows it as "2d6+1" in summaries and the
detail view. Every other choice stays a string.

Rejected: dice notation as text ("2d6+1"). It kept choices all strings, but it's typed
differently from every other roll in the app and stored in a different shape from reminder
damage.

### 2. `withChosenRoll` next to `withChosenValue`

`withChosenRoll(sub_effect, instance)` returns the sub-effect with `roll` replaced by
`{ ...roll, ...chosen }` without `modifier` (the chosen roll is the whole roll), keeping
`damage_type`, `damage_type_choice` and `magical`. A fixed value alone becomes the sub-effect's
`value`, and `amountRoll` uses the value when the roll has no amount of its own. Without a
valid chosen roll the sub-effect gets no roll amount and no `value`, so it does nothing, as an
unchosen value does. Every place that calls `withChosenValue` also calls `withChosenRoll`; they're combined
in one `withChoices(sub_effect, instance)` so no caller can miss one. `rollEffectValues`
stops skipping sub-effects with a roll choice and rolls the chosen dice.

### 3. Fixed by links through `fixChoices`

A special case in `fixChoices`: the fixed roll goes through `withChosenRoll`, so its dice are
merged into the existing `roll` object (keeping its damage type) instead of replacing the
field. A linked Weakening Breath with `choices: { roll: { dice_count: 1, dice_type: 6 } }`
resolves to a sub-effect with a 1d6 roll and no open choice, so the application doesn't ask.
The link cleanup (`cleanEffectLink`) keeps a valid roll object and drops an invalid one,
instead of turning it into text like the other choices.

### 4. Form: Roll and Value exclude each other

`choice_kinds.roll = { label: "Roll", field: "roll" }`. The choice options already filter by
the fields the sub-effect shows, so Roll appears only where Roll does. Picking Roll removes
Value and vice versa. With a Roll choice the Roll field stays (it's the default) and gets the
"default when applied" label, and its modifier is removed; with a Value choice the Roll's dice,
fixed value and modifier are hidden and cleared (`rollKeysToClear`). A Damage, Damage modifier
or Critical sub-effect keeps the Roll for its damage type and magical; any other type hides the
Roll field. With a Roll choice the Value field is hidden and cleared. This answers the open
question from `rolled-effect-values` about Chosen Drain.

### 5. Rules

The link blocks' `$choice` regex in `firebase-rules.json` gets `roll`, in all seven places
(the action links of the five NPC ability groups, trait links on special abilities, and spell
links). There and in the three instance `choices` blocks, `roll` is an object: `dice_count`
(1 to 99, with `dice_type`), `dice_type` (2 to 100, with `dice_count`), `fixed_val` (−999 to
999), whole numbers, nothing else, and dice or a fixed value. Every other choice stays a string
of at most 100 characters.

## Risks / Trade-offs

- [Half a die (a count without a die)] → Not a roll: the inputs show the error, applying and
  Save are blocked, and the schema and rules reject it.
- [A sub-effect with a chosen roll and a `modifier` formula (caster's Wisdom)] → The chosen
  roll replaces it. A DM who wants the modifier adds it to the fixed value. Documented.
- [`rolled-effect-values` isn't archived yet] → This change adds a separate requirement to
  `effects-stat-modifiers` and modifies none of the requirements that change touches, so they
  can be archived in either order.

## Migration Plan

Deploy the database rules before the app, so links with a fixed roll can be saved. Existing
data has no roll choices, so nothing else changes.
