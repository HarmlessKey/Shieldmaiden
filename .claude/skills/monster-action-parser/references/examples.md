# Worked examples

Each example is an input and the exact output. Copy their shapes: field names, value types and
which fields are left out.

## 1. Attack with a condition on a hit (5.5e)

```text
Edition: 5.5e
Group: actions
Name: Bite
Description: Melee Attack Roll: +5, reach 5 ft. Hit: 8 (1d10 + 3) Piercing damage. If the target is a Large or smaller creature, it has the Prone condition.
```

```json
{
  "name": "Bite",
  "desc": "Melee Attack Roll: +5, reach 5 ft. Hit: 8 (1d10 + 3) Piercing damage. If the target is a Large or smaller creature, it has the Prone condition.",
  "reach": 5,
  "action_list": [
    {
      "type": "melee_weapon",
      "attack_bonus": 5,
      "rolls": [{ "damage_type": "piercing", "dice_count": 1, "dice_type": 10, "fixed_val": 3, "miss_mod": 0 }],
      "effects": {
        "on_hit": [{ "effect": { "source": "srd", "source_key": "prone", "name": "Prone" }, "duration": { "type": "cancelled" } }]
      }
    }
  ]
}
```

## 2. Attack, then a save (5e)

The save only follows the hit, so it is a second entry. Its roll-less entry has no `rolls`.

```text
Edition: 5e
Group: actions
Name: Bite
Description: Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 12 (2d8 + 3) piercing damage. If the target is a creature, it must succeed on a DC 15 Strength saving throw or be knocked prone.
```

```json
{
  "name": "Bite",
  "desc": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 12 (2d8 + 3) piercing damage. If the target is a creature, it must succeed on a DC 15 Strength saving throw or be knocked prone.",
  "reach": 5,
  "action_list": [
    {
      "type": "melee_weapon",
      "attack_bonus": 7,
      "rolls": [{ "damage_type": "piercing", "dice_count": 2, "dice_type": 8, "fixed_val": 3, "miss_mod": 0 }]
    },
    {
      "type": "save",
      "save_ability": "strength",
      "save_dc": 15,
      "effects": {
        "on_fail": [{ "effect": { "source": "srd", "source_key": "prone", "name": "Prone" }, "duration": { "type": "cancelled" } }]
      }
    }
  ]
}
```

## 3. Breath weapon: save for half, in a line (5.5e)

```text
Edition: 5.5e
Group: actions
Name: Lightning Breath (Recharge 5–6)
Description: Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-foot-wide Line. Failure: 60 (11d10) Lightning damage. Success: Half damage.
```

```json
{
  "name": "Lightning Breath",
  "recharge": "5-6",
  "desc": "Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-foot-wide Line. Failure: 60 (11d10) Lightning damage. Success: Half damage.",
  "aoe_type": "line",
  "aoe_size": 90,
  "action_list": [
    {
      "type": "save",
      "save_ability": "dexterity",
      "save_dc": 19,
      "rolls": [{ "damage_type": "lightning", "dice_count": 11, "dice_type": 10, "save_fail_mod": 0.5 }]
    }
  ]
}
```

## 4. Grapple, a condition while grappled, and damage every turn (5e)

The grapple gets the escape. Restrained and the damage last while the target is Grappled:
`ends_when`. The damage over time takes the average (7) as its value.

```text
Edition: 5e
Group: actions
Name: Chain
Description: Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the devil isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns.
```

```json
{
  "name": "Chain",
  "desc": "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the devil isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns.",
  "reach": 10,
  "action_list": [
    {
      "type": "melee_weapon",
      "attack_bonus": 8,
      "rolls": [{ "damage_type": "slashing", "dice_count": 2, "dice_type": 6, "fixed_val": 4, "miss_mod": 0 }],
      "effects": {
        "on_hit": [
          {
            "effect": { "source": "srd", "source_key": "grappled", "name": "Grappled" },
            "duration": {
              "type": "cancelled",
              "escape": {
                "dc": 14,
                "checks": [
                  { "ability": "strength", "skill": "athletics" },
                  { "ability": "dexterity", "skill": "acrobatics" }
                ]
              }
            }
          },
          {
            "effect": { "source": "srd", "source_key": "restrained", "name": "Restrained" },
            "duration": { "type": "cancelled", "ends_when": { "type": "has_condition", "value": "grappled", "negate": true } }
          },
          {
            "effect": { "source": "srd", "source_key": "damage-over-time", "name": "Damage Over Time" },
            "duration": { "type": "cancelled", "ends_when": { "type": "has_condition", "value": "grappled", "negate": true } },
            "choices": { "damage_type": "piercing", "value": "7" }
          }
        ]
      }
    }
  ]
}
```

## 5. Area save with a repeat save (5e)

"within 120 feet of the dragon" is an emanation around it. The 24-hour immunity is left to the
description.

```text
Edition: 5e
Group: actions
Name: Frightful Presence
Description: Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.
```

```json
{
  "name": "Frightful Presence",
  "desc": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.",
  "aoe_type": "emanation",
  "aoe_size": 120,
  "action_list": [
    {
      "type": "save",
      "save_ability": "wisdom",
      "save_dc": 16,
      "effects": {
        "on_fail": [
          {
            "effect": { "source": "srd", "source_key": "frightened", "name": "Frightened" },
            "duration": {
              "type": "time",
              "value": 1,
              "unit": "minute",
              "save": { "ability": "wisdom", "dc": 16, "triggers": ["end_turn_target"] }
            }
          }
        ]
      }
    }
  ]
}
```

## 6. Failure / Second Failure (5.5e)

The first failure's condition is the link, and the repeat save at the end of its next turn
decides what happens: a success ends it, a second failure escalates it. Unconscious has its own
duration and ends when the target takes damage, so that goes on `escalate.duration`. Waking it
with an action is left to the description.

```text
Edition: 5.5e
Group: actions
Name: Sleep Breath (Recharge 5–6)
Description: Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 10 minutes. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it.
```

```json
{
  "name": "Sleep Breath",
  "recharge": "5-6",
  "desc": "Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: The target has the Incapacitated condition until the end of its next turn, at which point it repeats the save. Second Failure: The target has the Unconscious condition for 10 minutes. This effect ends for the target if it takes damage or a creature within 5 feet of it takes an action to wake it.",
  "aoe_type": "cone",
  "aoe_size": 30,
  "action_list": [
    {
      "type": "save",
      "save_ability": "constitution",
      "save_dc": 14,
      "effects": {
        "on_fail": [
          {
            "effect": { "source": "srd", "source_key": "incapacitated", "name": "Incapacitated" },
            "duration": {
              "type": "cancelled",
              "save": {
                "ability": "constitution",
                "dc": 14,
                "triggers": ["end_turn_target"],
                "failures_to_escalate": 1,
                "escalate": {
                  "effect": { "source": "srd", "source_key": "unconscious", "name": "Unconscious" },
                  "duration": {
                    "type": "time",
                    "value": 10,
                    "unit": "minute",
                    "cancel_triggers": [{ "trigger": "damage_taken" }]
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
}
```

## 7. Hit Point maximum reduced on a failed save (5e)

A save decides the reduction, so it is a save entry with a Hit Point Maximum Reduction link.
Its value (the damage taken) isn't in the text: no `choices`.

```text
Edition: 5e
Group: actions
Name: Life Drain
Description: Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) necrotic damage. The target must succeed on a DC 13 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0.
```

```json
{
  "name": "Life Drain",
  "desc": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) necrotic damage. The target must succeed on a DC 13 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0.",
  "reach": 5,
  "action_list": [
    {
      "type": "melee_weapon",
      "attack_bonus": 4,
      "rolls": [{ "damage_type": "necrotic", "dice_count": 1, "dice_type": 6, "fixed_val": 2, "miss_mod": 0 }]
    },
    {
      "type": "save",
      "save_ability": "constitution",
      "save_dc": 13,
      "effects": {
        "on_fail": [
          {
            "effect": { "source": "srd", "source_key": "hit-point-maximum-reduction", "name": "Hit Point Maximum Reduction" },
            "duration": { "type": "rest" }
          }
        ]
      }
    }
  ]
}
```

## 8. Nothing to roll, an effect on itself (5e)

"magically" makes the link magical. The text ends it when the duergar attacks or casts a spell.

```text
Edition: 5e
Group: actions
Name: Invisibility (Recharges after a Short or Long Rest)
Description: The duergar magically turns invisible until it attacks, casts a spell, or uses its Enlarge, or until its concentration is broken, up to 1 hour (as if concentrating on a spell). Any equipment the duergar wears or carries is invisible with it.
```

```json
{
  "name": "Invisibility",
  "recharge": "rest",
  "desc": "The duergar magically turns invisible until it attacks, casts a spell, or uses its Enlarge, or until its concentration is broken, up to 1 hour (as if concentrating on a spell). Any equipment the duergar wears or carries is invisible with it.",
  "action_list": [
    {
      "type": "other",
      "effects": {
        "always": [
          {
            "effect": { "source": "srd", "source_key": "invisible", "name": "Invisible" },
            "duration": {
              "type": "concentration",
              "value": 1,
              "unit": "hour",
              "cancel_triggers": [{ "trigger": "on_attack" }, { "trigger": "on_cast" }]
            },
            "magical": true
          }
        ]
      }
    }
  ]
}
```

## 9. Legendary action with a cost (5e)

```text
Edition: 5e
Group: legendary_actions
Name: Disrupt Life (Costs 3 Actions)
Description: Each non-undead creature within 20 feet of the lich must make a DC 18 Constitution saving throw against this magic, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one.
```

```json
{
  "name": "Disrupt Life",
  "legendary_cost": 3,
  "desc": "Each non-undead creature within 20 feet of the lich must make a DC 18 Constitution saving throw against this magic, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one.",
  "aoe_type": "emanation",
  "aoe_size": 20,
  "action_list": [
    {
      "type": "save",
      "save_ability": "constitution",
      "save_dc": 18,
      "rolls": [{ "damage_type": "necrotic", "dice_count": 6, "dice_type": 6, "save_fail_mod": 0.5 }]
    }
  ]
}
```

## 10. Trait with a trait effect (5.5e)

```text
Edition: 5.5e
Group: special_abilities
Name: Magic Resistance
Description: The balor has Advantage on saving throws against spells and other magical effects.
```

```json
{
  "name": "Magic Resistance",
  "desc": "The balor has Advantage on saving throws against spells and other magical effects.",
  "action_list": [{ "type": "other" }],
  "effects": [{ "effect": { "source": "srd", "source_key": "magic-resistance", "name": "Magic Resistance" } }]
}
```

## 11. Trait without a trait effect (5.5e)

The Advantage depends on where the allies are, so it is not always on: no effects.

```text
Edition: 5.5e
Group: special_abilities
Name: Pack Tactics
Description: The wolf has Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.
```

```json
{
  "name": "Pack Tactics",
  "desc": "The wolf has Advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
  "action_list": [{ "type": "other" }]
}
```

## 12. Trait that makes others save (5e)

It deals damage to the creatures around it, so it has a save entry, not a trait effect.

```text
Edition: 5e
Group: special_abilities
Name: Death Burst
Description: When the mephit dies, it explodes in a burst of fire. Each creature within 5 feet of it must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one.
```

```json
{
  "name": "Death Burst",
  "desc": "When the mephit dies, it explodes in a burst of fire. Each creature within 5 feet of it must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one.",
  "aoe_type": "emanation",
  "aoe_size": 5,
  "action_list": [
    {
      "type": "save",
      "save_ability": "dexterity",
      "save_dc": 11,
      "rolls": [{ "damage_type": "fire", "dice_count": 2, "dice_type": 6, "save_fail_mod": 0.5 }]
    }
  ]
}
```

## 13. Healing (5.5e)

No damage type and no mod on a healing roll. "magically" only matters for links; there are none.

```text
Edition: 5.5e
Group: actions
Name: Healing Touch (4/Day)
Description: The solar touches another creature. The target magically regains 40 (8d8 + 4) Hit Points and is freed from any curse, disease, poison, blindness, or deafness.
```

```json
{
  "name": "Healing Touch",
  "limit": 4,
  "limit_type": "day",
  "desc": "The solar touches another creature. The target magically regains 40 (8d8 + 4) Hit Points and is freed from any curse, disease, poison, blindness, or deafness.",
  "action_list": [
    {
      "type": "healing",
      "rolls": [{ "dice_count": 8, "dice_type": 8, "fixed_val": 4 }]
    }
  ]
}
```

## 14. Multiattack (5.5e)

```text
Edition: 5.5e
Group: actions
Name: Multiattack
Description: The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Acid Arrow.
```

```json
{
  "name": "Multiattack",
  "desc": "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Acid Arrow.",
  "action_list": [{ "type": "other" }]
}
```
