## Context

See proposal.md for the motivation. What the code does today:

- **Effective values**: `effectiveStats` (`effectFunctions.js`) reads only `sub_effect.value`
  for numeric sub-effects. A `roll` is ignored, and `withChosenValue` puts a chosen value in
  `value`. `alsoHealAmount` skips sub-effects with dice.
- **Applying**: every apply path builds instances with `buildEffectInstance` and saves them
  with `apply_effect` (`runEncounter.js`), or the campaign player/companion apply in
  `userContent/campaigns.js`. Both already compute also-heal and notices after building. The
  definition is resolved with `getters.effect_definition(instance)` /
  `resolve_effect_definitions`.
- **Precedent**: temporary HP use `amountRoll` (dice, `fixed_val`, `modifier` formula) and
  store their result on the instance as `temp_hp_granted`.
- **Roll bonuses**: `rollModifiers` gives the dice a sign from `multiplier < 0 ||
  fixed_val < 0`, and adds a positive `fixed_val`.
- **Damage bonuses**: `damageAmount` adds `fixed_val` (of any sign) to `value` and ignores
  `multiplier`. `dice.js` rolls each bonus as its own roll (`rollD`, with `value` as its
  modifier). `applyDamageModifiers` takes the parts per damage type. Both the roll dialog
  (`hk-single-roll.vue`) and the damage prompt (`damageModifiers.js` mixin) call it.

## Goals / Non-Goals

**Goals:**
- One roll per sub-effect per instance, made when the effect is applied and stored on the
  instance.
- `multiplier` and `fixed_val` mean the same thing for d20 roll bonuses and damage bonuses.
- Damage penalties lower damage, never below 0 per damage type.

**Non-Goals:**
- Letting the DM edit or re-roll a stored total after applying. They can remove the effect
  and apply it again.
- Stacking the same definition (a second Strength Drain from the same Shadow). The existing
  "same definition counts once" rule still applies. See Risks.
- Rolled values on d20 roll bonuses (Bless keeps rolling per roll) and on `temp_hp` (keeps
  its prompt).
- Rolls inside `success_effects`, `on_fail`, `on_expire` and included definitions. Only the
  definition's own `sub_effects` are rolled.

## Decisions

### 1. Store totals in `instance.rolled_values`, keyed per sub-effect

`rolled_values: { [subKey]: number }`, where `subKey` is the sub-effect's `id` when it has
one, otherwise `sub_<index>` in `definition.sub_effects`.
- **Why a map:** one definition can roll several values (Strength and maximum HP), so a
  single number like `temp_hp_granted` isn't enough.
- **Why the `sub_` prefix:** Firebase turns an object with keys `0, 1, …` into an array.
  The prefix also keeps the keys valid for the rules regex.
- **Why `id` first:** an id survives reordering the definition's sub-effects. Index keys
  can point at the wrong sub-effect after a custom definition is edited. That's acceptable:
  it's the same risk `choices` already has, and the result is still a number in range.

Rejected: reusing `choices.value`. It's a single string, it means "chosen by the DM", and it
would clash with `choice: "value"`.

The stored number is the **raw total** of dice, `fixed_val` and `modifier`, before the
multiplier. `effectiveStats` treats it as `value`, so the existing "a multiplier on a
sub-effect with a value multiplies that value" rule gives the sign. Tooltips can show
"−3 (1d4)" from the raw total and the multiplier.

### 2. Roll in a pure helper, called from the two apply actions

`rollEffectValues({ definition, instance, vars, random = Math.random })` returns
`{ rolled_values, rolls: [{ subKey, sub_effect, dice_count, dice_type, throws, total, notes }] }`
for each own sub-effect that:
- is `bonus` / `base` / `fixed` / `floor` / `cap`
- has a stat sub-type (non-empty `statFields`), and not `temp_hp`
- has a roll with dice, and no `choice` including `"value"`
- passes `min_level` / `max_level` for the instance's level

It reuses `amountRoll` for dice, `fixed_val` and the `modifier` formula (`flatFormulaVars`
with the holder and the caster). `random` makes it testable in the scratchpad.

It's called in `apply_effect` (`runEncounter.js`) and in the campaign apply
(`campaigns.js`), on new instances only, before they're persisted. The definition is
resolved first, the same way also-heal already gets it. Both paths then add a notice from the
`rolls` ("Strength Drain: 1d4 = 3, Strength −3").

Rejected: rolling in `buildEffectInstance`. It's synchronous, has no entity variables, and is
also used for escalation and legacy conditions. Rolling in the drawer
(`applyEffect.js`) would miss effect links, the bonus drawers and campaign applies.

Escalation (`escalationInstance`) goes through `apply_effect` as a new instance, so it rolls
its own values. A level change on an existing instance doesn't roll again.

### 3. `effectiveStats` and `alsoHealAmount` read the stored total

In `effectiveStats`, a sub-effect whose roll has dice uses
`instance.rolled_values?.[subKey]` as its value. Without a stored total, it adds a
not-applied modifier "not rolled" and is skipped. `choice: "value"` keeps priority because
`withChosenValue` runs first, and a sub-effect with a choice is never rolled (decision 2).
`alsoHealAmount` does the same, times the multiplier. Trait instances
(`traitInstances`) are never applied, so they have no `rolled_values` and show "not rolled".

### 4. One sign rule for roll and damage bonuses

A shared `signedRoll(sub_effect)` gives `{ dice_count, dice_type, sign, flat }`:
- With dice: `sign = multiplier < 0 || fixed_val < 0 ? -1 : 1`, and `flat` is the positive
  `fixed_val` only.
- Without dice: `flat = (value + fixed_val) * (multiplier ?? 1)`.

`rollModifiers` already works this way, so it switches to the helper with no change in
behaviour. `damageAmount` uses it and returns `sign` on the bonus. `dice.js` rolls the dice
and negates the dice total when `sign < 0`, adds `flat`, and labels the line with "−". Crit
doubling and max use the same code, so penalty dice follow the Critical Hits setting.

Note on `value` with dice: today `damageAmount` adds `value` to the dice roll as a modifier.
That stays: `flat` also includes `value` when there are dice.

Rejected: reading only `multiplier` for damage and dropping the `fixed_val` sign. The
proposal asks for the d20 and damage rules to match, and Bane-style data already uses both
forms.

### 5. Penalties are subtracted per damage type, before defenses

`dice.js` doesn't roll a penalty whose damage type isn't among the hit's own rolls. In
`applyDamageModifiers`, a negative part is first subtracted from the positive parts of its
type in the same hit (`group`: the action), in order and never below 0. The positive part
lists it in `penalties` ([{ name, amount }]); the penalty part ends at 0 with `subtracted`,
and `penalty` when it was limited. The factor, toggles, absorption and defenses then work on
what's left, so a resisted 12 − 2 is (12 − 2) / 2 = 5, and odd amounts round once.

The dialog shows the damage line as "(12 − 2) / 2 = 5": all penalties as one number, with
each effect's dice, rolls and "limited" in its tooltip ("Bane −2 (1d4: 4, limited)"; copies of
one effect together, "Weak Grip −5 (2d4: 3 + 2)"). The penalty has no roll line of its own:
next to the damage line it was a second number that didn't count. Totals still add up the
parts.

Both callers (`hk-single-roll.vue`, `damageModifiers.js`) get this for free, and manual
negative damage bonuses go through the same path.

Rejected:
- Folding the penalty in without saying so (the first version). The DM saw the main roll
  change and the penalty line at 0, which read as the penalty doing nothing.
- Keeping penalties as negative parts that are halved on their own (the second version). The
  total matched for even amounts, but the line read "−1", and odd amounts were rounded twice
  (12 − 3 resisted gave 5 instead of 4).

### 6. Form: the Roll field for value sub-types

In `fieldControls.js`, `RULES.roll` also allows `VALUE_TYPES` whose sub-types are any of the
stat sub-types (the ones `statFields` maps: `ac`, `speed` and the Speeds, `max_hp`,
`initiative`, `passive_perception`, `spell_save_dc`, `spell_attack`, `ability_score`).
`RULES.multiplier` also shows for these when the sub-effect has a roll. The existing clearing
of unshown fields keeps working.

### 7. Schema and rules

- `$defs/active_instance.rolled_values`: an object with
  `propertyNames: { pattern: "^(sub_[0-9]+|[A-Za-z0-9_-]{1,100})$" }` and number values.
- The `roll` description on sub-effects: "On a value sub-type, rolled once when applied
  (stored in rolled_values)". The `multiplier` description: "−1 makes a roll a penalty".
- The same in `HarmlessKey_API/schemas/hk-effects-schema.json`.
- `firebase_rules/firebase-rules.json`: `rolled_values` in the three `effects` blocks, with
  `$sub` matching the pattern and `newData.isNumber()`.

### 8. Admins test custom effects before the release

`customEffectsEnabled(userInfo)` (`custom_effects_released || userInfo.admin`) replaces the
flag where custom effects are loaded or the Coming soon tab is added. The Effects page lists
an admin's effects, without links to the form. The form routes keep their guard on the flag
alone, so the full form stays hidden. A `PasteEffect` dialog parses, cleans and validates the
JSON with the same validator as the form (moved to `src/utils/effectValidator.js`) and saves
with `add_effect`.

Rejected: opening the full form for admins. It's larger to test, and pasting JSON is what's
needed to try definitions the form may not build yet.

## Risks / Trade-offs

- [Strength Drain from the same Shadow stacks in the rules, but the same definition counts
  once] → Each instance still stores its own roll, and the one that changes the value most
  counts. Stacking is a separate change to the "Only applicable modifiers count" rule.
- [Index keys go stale when a custom definition's sub-effects are reordered] → `id` is
  preferred when set. The value is still a plain number, so nothing crashes. Removing the
  effect and applying it again fixes it.
- [Rolls happen without showing dice to the DM] → The notice shows the roll and the result,
  and the tooltip keeps the dice.
- [Penalties folded before defenses change totals for existing manual negative damage
  bonuses] → That's the intended fix (no negative damage), and it only affects data that was
  already producing wrong totals.
- [The sign of `fixed_val` with dice is unusual] → It's documented in `effects.md` and the
  schema description. The form steers authors to `multiplier: -1`.

## Migration Plan

No data migration. Existing instances have no `rolled_values`, and existing definitions with
a roll on a value sub-type were ignored before, so they now show "not rolled" until they're
applied again. Deploy the database rules before the app, so new instances with
`rolled_values` can be written. Rollback: the old app ignores `rolled_values`, and the rules
can stay.
