## Context

- `damageBonuses({ attackerKey, targetKey, attackType, entities, definitionOf })`
  (`effectFunctions.js`, 3c2) collects the attacker's `bonus` sub-effects on `damage`.
  `dice.js` turns each into its own named damage roll on a hit (crits follow the setting, the
  attack's first damage type when it has none). The `attack_modifiers` getter passes it the
  target, and the details bar's attack reminders use the same getter.
- Hex and Hunter's Mark (both editions) are held by the target: a `damage` sub-effect with
  `trigger: "on_hit_taken"` and `trigger_filter.by: "caster"` (5e Hunter's Mark adds
  `attack_types: ["weapon"]`, and has no damage type).
- `hk-single-roll.vue`'s `fireRollTriggers` fires `on_hit_taken` for the target when a hit
  is applied. `fire_trigger` (`runEncounter.js`) matches it through `matchTriggers` and
  `checkFilter`, and queues a prompt whose Roll button rolls the damage (3a).

## Goals / Non-Goals

**Goals:** the target's hit-taken damage caused by the attacker is rolled with the attack, and
isn't prompted for again afterwards.

**Non-Goals:**
- `frequency` ("once per turn") tracking: such damage keeps the prompt.
- `on_crit_taken` or other triggers: only `on_hit_taken`.
- Damage to someone other than the hit creature (Fire Shield-like `trigger_source`): keeps the
  prompt.

## Decisions

### 1. One helper decides what is rolled with the attack

`hitTakenDamage(sub_effect)` returns whether a sub-effect is rolled with the attack, from the
sub-effect alone:
- `type: "damage"`, `trigger` (normalized) `on_hit_taken`
- `target` absent or `self`
- no `save` and no `frequency`
- `trigger_filter` with only `by` (`caster`, `any`, `counterpart` or absent) and
  `attack_types`

Both `damageBonuses` and `fire_trigger` use it, so they agree on which sub-effects go where.
The decision doesn't depend on the event, so an event that knows more after the roll (the
natural roll) can't move a sub-effect from the attack to the prompt or back.

Alternative: compare `checkFilter`'s `unchecked` list in both places. That was rejected
because the event knows different things before and after the roll.

### 2. `damageBonuses` reads the target's effects

After the attacker's own effects, loop over `effectEntries(target, targetKey)`. For each
resolved instance, take the sub-effects where `hitTakenDamage` is true, then check:
- `by: "caster"`: the instance's `caster_key` is the attacker
- `attack_types`: through `attackTypeState` (the same check the attacker's bonuses use); a
  false state skips it, an unknown state makes it a reminder
- the level range and a missing choice, as for the attacker's bonuses
- the definition's and the sub-effect's `condition`, through `conditionState` with the target
  as holder and the attacker as counterpart; unknown makes it a reminder

The bonus is `{ name, magical, damage_type, dice_count, dice_type, value }`, built the way the
attacker's are (value formulas with the target's variables and `caster.*`, `fixed_val`, a
chosen damage type). It is marked `from: "target"`, which doesn't change how `dice.js` rolls it.
The same definition on the target counts once, separately from the attacker's.

### 3. The prompt leaves them out

`fireRollTriggers` adds `fromAttackRoll: true` to the `on_hit_taken` event. In `fire_trigger`,
when the trigger is `on_hit_taken` and `event.fromAttackRoll` is set, sub-effects where
`hitTakenDamage` is true are dropped from `others` before a prompt is built. An instance left
with nothing gets no prompt, through the existing `if (!others.length) continue`.

A sub-effect that `damageBonuses` skipped for a reason other than the helper (a condition that
was false, or an attack type that doesn't match) also didn't match in `matchTriggers`, so it
isn't lost. One case is different: a condition that is unknown before the roll. It shows as a
reminder in the attack, and isn't prompted for afterwards. That's accepted: it's the same
reminder the attacker's bonuses give.

### 4. Details bar reminder (user request at apply)

`hitTakenDamageLines({ attackerKey, targetKey, entities, definitionOf })` lists, for every
creature, the instances with sub-effects `hitTakenDamage` accepts that apply to hits by the
attacker: either `by: "caster"` with the attacker as the instance's caster, or caused by
anyone, but only on the targeted creature. Each line is `{ holderKey, name, text, targeted }`,
with the text like "+1d6 necrotic" and the attack-type filter in brackets ("(weapon)").
`AttackReminders.vue` adds the targeted lines to the Damage chip ("Hex: +1d6 necrotic (against
Goblin)"). The other lines become reminders ("Hex on Goblin: +1d6 necrotic when you hit it").
The bar doesn't know the attack type, so this can't go through `damageBonuses`, which needs one.

### 5. Prompt after manual damage (user request at apply)

The Attack button can't tell a hit from a failed save, so it doesn't fire `on_hit_taken`. That
would also end "ends when hit" effects. A new store action
`prompt_hit_taken_damage({ attackerKey, targetKey })` uses `matchTriggers` for `on_hit_taken`
with `{ sourceKey: attackerKey }` (attack types unknown, so their filter is listed as
unchecked), keeps only the sub-effects `hitTakenDamage` accepts, and queues one prompt per
instance in the trigger-prompt shape (lines, `sub_effects` for Roll, event). Each line adds
"if it was a hit with an attack roll". It runs no duration actions. `Manual.vue` dispatches it
per target after damage is applied.

## Risks / Trade-offs

- Rolling with the attack happens before the hit is known. `dice.js` already only adds damage
  bonuses to hits, so a miss gets none.
- Custom effects that relied on the prompt for on-hit-taken damage now get the damage in the
  roll. That is the intended behaviour, and the roll dialog shows the bonus with its name.
