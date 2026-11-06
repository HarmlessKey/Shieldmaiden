## Context

- **Rolling:** `roll_action` (`src/mixins/runEncounter.js`) rolls every NPC/companion action
  and spell. For a non-area action it calls `rollAction` (`src/mixins/dice.js`) once per
  target, then sets `roll.target` / `roll.current`. An area action is rolled once.
- **To-hit:** `rollAction` rolls it with `rollD` for `melee_weapon` / `ranged_weapon` /
  `spell_attack`, with the DM's Shift/Ctrl advantage. A natural 20 sets `crit`, which doubles
  (or maximizes) the damage dice, as set in the user settings.
- **The roll dialog** (`hk-single-roll.vue`):
  - `checkHitOrMiss`: a natural 20 hits, a natural 1 misses, else the total is compared
    with the target's effective AC
  - shows the crit for a natural 20
  - applies damage on a hit (`missSave` multiplies the damage on a miss)
  - `fireRollTriggers` fires `on_hit` / `on_crit`
- **3c1:**
  - `rollModifiers({ entity, holderKey, entities, definitionOf, roll })` collects
    Advantage/Disadvantage, flat and dice bonuses, auto results, reminders and single-use
    modifiers. It skips `perspective: "against"`.
  - `rollPlan` turns them into `{ m, advantage, bonus_dice, roll_notes, consume, auto }`.
  - `rollD`'s `extras` rolls the bonus dice and shows the notes.
  - `conditionState` evaluates `self` / `caster` subjects. `counterpart` is "unknown".
- **The SRD conditions** already carry everything attacks need:
  - "against" modifiers (Blinded, Restrained, Paralyzed…)
  - `distance` conditions on the counterpart (Prone, incoming crits)
  - `is_caster` (5.5e Grappled)
  - `can_see` (5.5e Invisible)

## Goals / Non-Goals

**Goals:**
- Attack to-hit with the attacker's and the target's modifiers.
- Counterpart conditions in attacks, with the assumed melee/ranged distance.
- Effect crits (crit range, incoming crit).
- Damage bonuses on hits.
- Manual `attack` / `damage` bonuses.
- SRD test effects.

**Non-Goals:**
- Players' attacks (manual).
- Modified to-hit values in action lists and on cards.
- `reroll`, `roll_floor`, `extra_crit_dice`, `negate_incoming_crit` (3g).
- Damage defenses (3d).
- Consumption on hit/miss (stays a reminder).
- `auto_fail` / `auto_success` on attacks: no SRD data uses them. If present, they're
  reminders.

## Decisions

### 1. Attack rolls in `rollModifiers`

The roll is `{ kind: "attack", attackType, perspective, counterpartKey, source }`. With
`perspective: "against"`, `rollModifiers` is called on the **target**:
- **`rollParts`:** an attack gives one part `{ kind: "attack", attackType }`.
- **`ROLL_PART_SUB_TYPES.attack`:** `["attack", "d20_test"]` for the attacker's own roll,
  and only `["attack"]` for against. Exhaustion's 2024 `d20_test` penalty is the holder's own.
- **Perspective filter:**
  - the attacker's roll keeps today's rule (skip `against` and `grant_*`)
  - the against roll keeps only `perspective: "against"` and the legacy `grant_advantage` /
    `grant_disadvantage`, read as `advantage` / `disadvantage`
- **`attack_types`:** a new `attackTypeState(sub_effect.attack_types, attackType)` returns
  true, false or `"unknown"`, using the table in the spec. Unknown becomes a reminder, false
  leaves the sub-effect out.
- **Manual bonuses:** `rollPartBonusKeys` adds `attack` for the attacker's attack part only.
- **The condition context** gets `counterpartKey` and `attackType` (decision 2).
- **Crits:** for attack rolls, `rollModifiers` also collects `critical` sub-effects into
  `critRange` (attacker, `crit_range`, lowest) and `critOnHit` (target, sub-type
  `incoming_crit_range`, whatever its perspective field). Each gets names, plus `lines`.
  These go through the same `attack_types` and condition checks. Unknown ones are reminders.

A new pure **`attackModifiers({ attackerKey, targetKey, attackType, source, entities, definitionOf })`**
merges the two `rollModifiers` results:
- concatenates the lists and the consume entries
- takes the lowest `critRange`
- collects `critOnHit` from the target
- collects `assumptions` (decision 2)

Without a `targetKey` (area attacks), only the attacker's are used. The store getter
`attack_modifiers` wraps it with the store's entities and `effect_definition`.

### 2. Counterpart conditions and assumed distance

`conditionState(set, ctx)` accepts `subject: "counterpart"` when `ctx.counterpartKey` is set:
- **Entity checks:** `has_condition`, `has_effect`, `bloodied`, `hp_zero`, `temp_hp_zero`
  and `hp_threshold` reuse `evaluateConditionSet` with the counterpart as subject.
  `evaluateConditionSet` gets the same subject resolution.
- **`is_caster`:** `counterpartKey === instance.caster_key`. `negate` is applied as usual.
- **`distance`:** only with `ctx.attackType` `melee_weapon` (5 ft) or `ranged_weapon` (more
  than 5 ft), and `value` 5:

  | | `lte 5` | `lt 5` | `gt 5` | `gte 5` |
  |---|---|---|---|---|
  | melee | true | false | false | true |
  | ranged | false | false | true | true |

  When this decides a state, `ctx.assumptions` gets "melee: assumed within 5 ft" or "ranged:
  assumed beyond 5 ft". `attackModifiers` adds them to the roll notes once.
- **Anything else** stays `"unknown"`.

Outside attacks nothing changes: there is no `counterpartKey`.

### 3. `rollAction` with attack modifiers

`roll_action` passes `config.attackerKey` (the entity) and, for single-target rolls,
`config.targetKey`. Area actions pass only the attacker. Other `rollAction` callers (DoT
rolls from 3a, the monster creator) pass neither, and nothing changes for them.

For each to-hit action:
1. Get `attack_modifiers({ attackerKey, targetKey, attackType: action.type, source })` from
   the store.
2. Run `rollPlan(modifiers, { modifier: attack_bonus, advantage: advantage_object })`.
3. Roll the to-hit with `rollD(e.e, 20, 1, plan.m, …, plan.advantage, null, { bonus_dice, notes })`.
4. Store `action.toHit.notes = plan.roll_notes` for the dialog.
5. **Crit:**
   - `crit = natural >= (critRange ?? 20)` sets `action.crit`, the existing flag
   - `critOnHit.length` sets `action.critOnHit = names`
   - the damage is critical when either holds. It goes through the existing Critical Hits
     setting (`critSettings`, run encounter settings): `getDiceCount` rolls the dice twice
     for Roll, the double/max branches add the rolled or maximum dice, and Disabled adds
     nothing. Damage bonus rolls use the same rules.
6. **Consume:** dispatch `consume_roll_modifiers(plan.consume)` right after the to-hit. The
   next to-hit of the same `rollAction` (multiattack) gets fresh modifiers, so Guiding Bolt is
   used once.
7. **Damage bonuses:** append them to `action.rolls` as entries
   `{ rollResult, damage_type, missSave: 0, magical, name }` (decision 4). They're rolled the
   same way, crit included.

### 4. Damage bonuses: `damageBonuses`

A pure **`damageBonuses({ attackerKey, attackType, entities, definitionOf })`** returns
`[{ name, damage_type, dice_count, dice_type, value }]` from:
- the attacker's `bonus` sub-effects on `damage` (own perspective, `attack_types` true;
  unknown ones and conditions as in `rollModifiers` become reminders)
- the manual `damage` bonuses

The damage type is `sub_effect.roll.damage_type`, or `instance.choices.damage_type` when the
roll has `damage_type_choice`. Without one, `rollAction` uses the action's first damage
roll's type.

`missSave: 0` means a miss deals none of it, so "half damage on a miss" never includes a
bonus. Separate entries keep each bonus named in the dialog, and let 3d apply defenses per
damage type. `damage_modifier` (2024 Resistance) is 3d/3g and isn't touched.

### 5. Roll dialog
- **`checkHitOrMiss`:** `action.crit` (a natural crit in range) hits. A natural 1 misses.
  Otherwise the total is compared with AC.
- **A hit is critical** when `action.crit`, or `action.critOnHit` and it hits. The crit
  display uses that instead of `throwsTotal === 20`, and names the effect ("Critical:
  Paralyzed").
- **`fireRollTriggers`** fires `on_crit` / `on_crit_taken` for critical hits by that rule.
- **The to-hit block** shows `toHit.notes`: bonus dice, Advantage sources, reminders and
  assumptions.
- **Damage rolls with a `name`** show it.

### 6. Manual keys, drawer, rules
- **Keys:** `BONUS_LABELS` gets `attack: "Attacks"` and `damage: "Damage"` as roll keys.
- **`StatBonuses.vue`:** the roll bonuses button's drawer lists both. Neither has a stored or
  effective value. The effect lines come from the entity's own attack modifiers
  (`roll_modifiers(key, { kind: "attack" })` without an attack type or target). Lines with
  an `attack_types` filter are labelled with it, such as "(weapon)".
- **Rules:** add `attack|damage` to the `$stat` regex in the three `bonuses` blocks, and
  test it in the emulator.

### 7. SRD test effects (both editions, unless noted)
- **Guiding Bolt** (spell): `advantage` on `attack`, `perspective: "against"`,
  `consume: { on: "roll" }`. It is applied to the target by the DM.
- **Divine Favor** (spell): `bonus` on `damage`, `attack_types: ["weapon"]`, `roll: 1d4 radiant`.
- **Magic Weapon** (spell): `bonus` +1 on `attack` and `damage`, `attack_types: ["weapon"]`.
  Higher slots are in the description.
- **Dodge** (feature): `disadvantage` on `attack`, `perspective: "against"`, with
  `condition: { subject: "counterpart", type: "can_see" }`, so it's a reminder. Also
  `advantage` on Dexterity `save`s.
- **Help** (feature): `advantage` on `attack`, `consume: { on: "roll" }`. The restriction to
  the target is in the description.

## Risks / Trade-offs

- **The melee/ranged assumption** is wrong for reach weapons and point-blank shots. The note
  in the result makes it visible.
- **Incoming crits are rolled before hit/miss is known.** The damage dice are rolled as
  critical up front, per the Critical Hits setting. A missed attack with "half damage on a
  miss" would then use critical damage. This is rare (no SRD monster attack has both). The dialog's miss handling applies
  as usual.
- **Spell attacks don't know melee/ranged.** Prone, melee-only crits and `melee_spell` /
  `ranged_spell` filters are reminders for them.
- **Consumption at roll time:** Guiding Bolt is used even if the DM dismisses the roll. This
  matches 3c1's single-use rule.

## Migration Plan

No data migration. The rules need the two new keys uploaded before release (develop first,
for testing). Existing rolls without an attacker key behave as before.

## Open Questions

None.
