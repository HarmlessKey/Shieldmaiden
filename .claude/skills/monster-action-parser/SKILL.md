---
name: monster-action-parser
description: Convert one D&D 5e (2014) or 5.5e (2024) monster ability from its stat block text into Shieldmaiden / HK API v2 monster JSON (hk-npc-schema.json) - the action, bonus action, reaction, legendary action or special ability (trait) with its action_list entries, damage rolls, effect links per outcome (conditions, escapes, repeat saves, durations) and trait effects. Use when asked to convert, parse, backfill or add effects to a monster action, trait or legendary action for Shieldmaiden or the HK API.
---

# Monster action parser

You turn **one** monster ability (its name line and description) into **one** JSON object: the
ability as Shieldmaiden stores it. You follow the rules below exactly. When a rule doesn't cover
something, leave it out: the description stays on the ability, so nothing is lost.

## Before you start

Read both reference files. Do not convert without them.

- `references/effects-catalogue.md`: the only effect `url`s you may link, per edition, with their
  choices.
- `references/examples.md`: worked examples. Match their shapes exactly.

## Input

```
Edition: 5.5e
Group: actions
Name: Lightning Breath (Recharge 5–6)
Description: Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-foot-wide Line. ...
```

- **Edition**: `5e` or `5.5e`.
- **Group**: `special_abilities` (traits), `actions`, `bonus_actions`, `reactions` or
  `legendary_actions`.

If the edition or group is missing, ask for it.

## Output

Only the JSON object, in a ```json block, no other text. Leave out every field that doesn't
apply: no `null`, no empty strings, arrays or objects.

```json
{
  "name": "…",
  "legendary_cost": 1,
  "recharge": "5-6",
  "limit": 3,
  "limit_type": "day",
  "desc": "…",
  "reach": 5,
  "range": "80/320",
  "aoe_type": "cone",
  "aoe_size": 60,
  "action_list": [
    {
      "type": "melee_weapon | ranged_weapon | spell_attack | save | damage | healing | other",
      "attack_bonus": 5,
      "save_ability": "dexterity",
      "save_dc": 15,
      "rolls": [{ "damage_type": "fire", "dice_count": 2, "dice_type": 6, "fixed_val": 3, "miss_mod": 0 }],
      "effects": { "on_hit": [], "on_miss": [], "on_fail": [], "on_success": [], "always": [] }
    }
  ],
  "effects": []
}
```

`legendary_cost` only on legendary actions. The top-level `effects` (trait effects, a list)
only on special abilities. `effects` inside an entry is an object of outcome lists.

## Procedure

Work through the steps in order.

### 1. Name line

`name` is the name without the parenthetical. The parenthetical sets:

| Parenthetical | Fields |
|---|---|
| `(Recharge 5–6)` | `"recharge": "5-6"` (plain hyphen) |
| `(Recharge 6)` | `"recharge": "6"` |
| `(Recharges after a Short or Long Rest)` | `"recharge": "rest"` |
| `(3/Day)`, `(1/Day)` | `"limit": 3, "limit_type": "day"` |
| `(3/Day, or 4/Day in Lair)` | `"limit": 3, "limit_type": "day"` (the first number) |
| `(Costs 2 Actions)` | `"legendary_cost": 2` |

Every legendary action has `legendary_cost`: `1` when the name doesn't say otherwise.

### 2. Description

`desc` is the description, copied exactly, character for character.

### 3. Reach, range and area (on the ability, not on an entry)

| Text | Field |
|---|---|
| `reach 10 ft.` | `"reach": 10` (a number) |
| `range 80/320 ft.`, `range 60 ft.` | `"range": "80/320"`, `"range": "60"` (a string) |
| `reach 5 ft. or range 20/60 ft.` | both `reach` and `range` |
| one creature / a point "within 120 feet" | `"range": "120"` |
| `60-foot Cone`, `60-foot cone` | `"aoe_type": "cone", "aoe_size": 60` |
| `60-foot-long, 5-foot-wide Line` | `"aoe_type": "line", "aoe_size": 60` |
| `20-foot-radius Sphere` | `"aoe_type": "sphere", "aoe_size": 20` |
| `10-foot Cube` | `"aoe_type": "cube", "aoe_size": 10` |
| `10-foot-radius, 40-foot-high Cylinder` | `"aoe_type": "cylinder", "aoe_size": 10` |
| `5-foot Emanation` | `"aoe_type": "emanation", "aoe_size": 5` |
| each creature "within 10 feet of the dragon" (of itself) | `"aoe_type": "emanation", "aoe_size": 10` |

An area placed "on a point within 150 feet" gets both the area and `"range": "150"`.

### 4. Split into entries (`action_list`)

- **One entry per attack roll and one per saving throw**, in the order of the text (at most 5).
- Damage, healing and effects belong to the entry whose roll decides them.
- A save that comes after a hit is a **second entry**: "If the target is a creature, it must
  succeed on a DC 13 Constitution saving throw or …", "it is subjected to the following effect.
  Wisdom Saving Throw: DC 12. Failure: …".
- Nothing to roll at all (Multiattack, Spellcasting, a passive trait, a self-buff, a movement)
  → one entry `{ "type": "other" }`. Every ability has at least this entry.

### 5. Each entry's type and numbers

| Text | Entry |
|---|---|
| `Melee Attack Roll: +4`, `Melee Weapon Attack: +4 to hit` | `"type": "melee_weapon", "attack_bonus": 4` |
| `Ranged Attack Roll: +5`, `Ranged Weapon Attack: +5 to hit` | `"type": "ranged_weapon", "attack_bonus": 5` |
| `Melee or Ranged Attack Roll`, `Melee or Ranged Weapon Attack` | `"type": "melee_weapon"` |
| `Melee Spell Attack`, `Ranged Spell Attack` | `"type": "spell_attack"` |
| `Dexterity Saving Throw: DC 21`, `a DC 21 Dexterity saving throw` | `"type": "save", "save_ability": "dexterity", "save_dc": 21` |
| the target regains Hit Points (dice) | `"type": "healing"` |
| damage without an attack roll or a save | `"type": "damage"` |
| nothing to roll | `"type": "other"` |

`save_ability` is the full ability name in lowercase: `strength`, `dexterity`, `constitution`,
`intelligence`, `wisdom`, `charisma`.

### 6. Rolls

Each damage amount the entry deals right away is one roll:

| Text | Roll |
|---|---|
| `13 (2d8 + 4) Slashing damage` | `{ "damage_type": "slashing", "dice_count": 2, "dice_type": 8, "fixed_val": 4 }` |
| `7 (2d6) Poison damage` | `{ "damage_type": "poison", "dice_count": 2, "dice_type": 6 }` |
| `4 (1d6 − 1) Piercing damage` | `… "fixed_val": -1` |
| `1 Piercing damage` | `{ "damage_type": "piercing", "fixed_val": 1 }` |
| `… damage plus 7 (2d6) Fire damage` | a second roll in the same entry |
| regains `11 (2d8 + 2)` Hit Points | `{ "dice_count": 2, "dice_type": 8, "fixed_val": 2 }` (no `damage_type`) |

- `damage_type` in lowercase.
- On attack entries every roll has `"miss_mod": 0`.
- On save entries every roll has `"save_fail_mod"`: `0.5` when a success halves the damage
  ("Success: Half damage", "half as much damage on a successful one"), otherwise `0`.
- Healing and damage entries: no `miss_mod` or `save_fail_mod`.
- Roll `special` (a list), on the roll of the damage it is about:
  - "regains Hit Points equal to the damage dealt / to that amount" → `"siphon_full"`; half of
    it → `"siphon_half"`
  - "its Hit Point maximum decreases by an amount equal to the damage taken" with **no save
    deciding it** → `"drain"`. When a save decides it, it is a save entry with a
    `hit-point-maximum-reduction` link instead (step 7).
- **Not rolled**: extra damage under a condition ("if the target is Prone", "against a Bloodied
  target"), versatile alternatives ("or 8 (1d10 + 3) if used with two hands"), and
  damage at the start of later turns (that is a `damage-over-time` link).

### 7. Effect links (`effects` on an entry)

Find every condition or catalogue mechanic the entry applies to its target. Each becomes a
**link** in the outcome list where the text puts it:

| Entry type | Outcome lists |
|---|---|
| attacks (`melee_weapon`, `ranged_weapon`, `spell_attack`) | `on_hit` (after "Hit:"), `on_miss` (after "Miss:") |
| `save` | `on_fail` ("Failure:", "or be …", "on a failed save"), `on_success` ("Success:"), `always` ("Failure or Success:") |
| `other`, `damage`, `healing` | `always` |

A link:

```json
{
  "effect": { "source": "srd", "source_key": "grappled", "name": "Grappled" },
  "duration": { "type": "cancelled", "escape": { "dc": 13, "checks": [{ "ability": "strength", "skill": "athletics" }, { "ability": "dexterity", "skill": "acrobatics" }] } },
  "choices": { "damage_type": "fire", "value": "5" },
  "level": 1,
  "magical": true
}
```

- **effect**: a `url` from the catalogue that exists in the monster's edition, with its `name`.
  No match in the catalogue → no link.
- **duration**: every action link has one. Build it with the duration table below.
- **choices**: only the choice kinds the catalogue lists for that effect. Set a choice when the
  text gives it (`"damage_type": "fire"`, `"ability": "strength"`, `"value": "5"`); leave it out
  when it doesn't (an amount equal to the damage taken, a rolled amount like 1d4). Values are
  strings. No choices → no `choices` field.
- **level**: only for effects marked `(level)`: "gains 1 Exhaustion level" → `"level": 1`.
- **magical**: `true` on **every** link of the ability when its description contains the word
  "magic", "magical" or "magically", or when it has a `spell_attack` entry. Otherwise leave it
  out.
- Target qualifiers don't matter: "If the target is a Large or smaller creature, it has the
  Prone condition" is still an `on_hit` Prone link.

**Duration table** (combine rows when the text combines them):

| Text | `duration` |
|---|---|
| no duration given (Prone, Grappled, "until removed") | `{ "type": "cancelled" }` |
| `(escape DC 14)` | `{ "type": "cancelled", "escape": { "dc": 14, "checks": [{ "ability": "strength", "skill": "athletics" }, { "ability": "dexterity", "skill": "acrobatics" }] } }` |
| "can make a DC 15 Strength check" to break free | `{ "type": "cancelled", "escape": { "dc": 15, "checks": [{ "ability": "strength" }] } }` |
| `for 1 minute`, `for 24 hours`, `for 3 rounds` | `{ "type": "time", "value": 1, "unit": "minute" }` (`round`, `minute`, `hour`, `day`) |
| until the **start** of **its** (the target's) next turn | `{ "type": "next_turn", "anchor": "target", "edge": "start" }` |
| until the **end** of **its** next turn | `{ "type": "next_turn", "anchor": "target", "edge": "end" }` |
| until the start / end of **the monster's** next turn ("the vampire's next turn") | `{ "type": "next_turn", "anchor": "caster", "edge": "start" }` / `"end"` |
| until the end of the current turn, or only against one attack ("against that attack") | `{ "type": "end_of_turn" }` |
| until the monster's Concentration ends, also "until <the ability> ends" when the ability lasts until its Concentration ends | `{ "type": "concentration" }`; "up to 1 hour" adds `"value": 1, "unit": "hour"` |
| until it finishes a Long Rest | `{ "type": "rest" }` |
| until it finishes a Short or Long Rest | `{ "type": "rest", "rest_type": "short_or_long" }` |
| repeats the save at the end of each of its turns / at the end of its next turn, ending the effect on a success | add `"save": { "ability": "<entry's save ability>", "dc": <entry's DC>, "triggers": ["end_turn_target"] }` |
| repeats the save at the start of each of its turns | same, with `"triggers": ["start_turn_target"]` |
| a repeat save and no time limit | type `cancelled` plus the `save` |
| "until the end of its next turn, at which point it repeats the save" | type `cancelled` plus the `save`: the save decides |
| the save "succeeds automatically" after some time | type `time` with that time, plus the `save` |
| "First Failure: X … Second Failure: Y" (or "Failure: X … Second Failure: Y") | link X with the repeat `save` plus `"failures_to_escalate": 1, "escalate": { "effect": { Y } }`; when Y has its own duration add it as `escalate.duration` |
| the effect ends if the target takes damage | add `"cancel_triggers": [{ "trigger": "damage_taken" }]` |
| "While <Condition>, the target has the X condition", "Until this grapple ends, the target is X" | link X gets `{ "type": "cancelled", "ends_when": { "type": "has_condition", "value": "<the outer condition's url, e.g. grappled>", "negate": true } }` |
| "until it attacks or casts a spell" | add `"cancel_triggers": [{ "trigger": "on_attack" }, { "trigger": "on_cast" }]` |

A "while X" link copies only the `ends_when`: it gets no escape or save of its own, even when X
has them. A damage-over-time "until this grapple ends" uses the same `ends_when`.

**No link** (the description keeps these): pushes and pulls, swallowing, teleporting, total
cover, "immune to this effect for 24 hours" after a successful save, "can't take the Dash
action", "must move toward …", limits on which actions it can take, things that happen over hours
or days (a loss each day, a creature rising hours later), death when a score or maximum reaches
0, waking it with an action.

### 8. Trait effects (`special_abilities` only)

A trait whose mechanic is always on and has a catalogue effect gets the top-level `effects`
list, and its `action_list` is `[{ "type": "other" }]`:

```json
"effects": [{ "effect": { "source": "srd", "source_key": "absorption", "name": "Absorption" }, "choices": { "damage_type": "acid" } }]
```

- Magic Resistance → `magic-resistance`; Undead Fortitude → `undead-fortitude`; Evasion →
  `evasion`; "<Type> Absorption" → `absorption` with the damage type.
- The saves, healing and damage a trait effect describes are part of the effect: they get no
  entries of their own, and no roll specials.
- Trait links have no `duration` and no `magical`. Every choice the effect asks for must be
  set; if the text doesn't give it, don't link it.
- **No trait effect** when the trait only works sometimes: "while Bloodied", "if an ally is
  within 5 feet", "while it is underwater", "at the start of its turn, it can …".
- A trait that makes **other** creatures roll (an aura that forces a save, Death Burst, Stench)
  is not a trait effect: give it entries and outcome links like an action.

### 9. Check before answering

- [ ] `name` has no parenthetical; recharge, limit or legendary cost came from it; every
      legendary action has `legendary_cost`.
- [ ] `desc` is the exact description.
- [ ] `range` is a string, `reach` and `aoe_size` are numbers.
- [ ] One entry per attack roll and per save; nothing-to-roll abilities have
      `[{ "type": "other" }]`.
- [ ] Attack rolls have `miss_mod: 0`; save rolls have `save_fail_mod` 0.5 or 0.
- [ ] Every link's `source_key` is in the catalogue for this edition, under an outcome that
      fits its entry's type, and has a `duration` (trait effects: none).
- [ ] Choice values are strings, and only choice kinds the catalogue lists for that effect.
- [ ] `magical: true` on all links if and only if the description says magic/magical/magically
      or the ability has a spell attack.
- [ ] No empty arrays, objects or `null`s.
