## MODIFIED Requirements

### Requirement: Damage bonuses are added to hits

The attacker's `bonus` sub-effects on `damage` SHALL add to the damage of its attack actions,
for attacks they apply to (`attack_types`). They are rolled with the attack:
- **With a damage type** (the roll's `damage_type`, or the instance's chosen damage type),
  the bonus is a separate damage roll of that type, so defenses apply per type. Divine
  Favor's 1d4 radiant is an example.
- **Without a damage type**, its dice and value are damage of the attack's first damage type.
  Magic Weapon's +1 is an example.

A damage bonus SHALL take its sign the way roll bonuses do (Flat and dice bonuses are added):
- Its dice are subtracted when it has a negative `multiplier`, or a negative `fixed_val`
  alongside dice. A negative `fixed_val` then only gives the dice their sign; a positive one
  is added.
- Without dice, its value and `fixed_val` are added, and a negative `multiplier` multiplies
  that amount.

A damage bonus that comes out negative SHALL be a penalty. It lowers the hit's damage of its
damage type, or of the attack's first damage type when it has none. A penalty SHALL be
subtracted from the damage of its type in the same hit before damage modifiers and defenses,
so resistance halves what's left. It SHALL NOT get a roll line of its own: the line of the
damage it lowers SHALL show the subtraction with the effect's name, its dice and roll, and
whether it was limited. A penalty SHALL be limited to the damage of its type in
the same hit, so that type's damage SHALL NOT go below 0. When the hit has no damage of the
penalty's type, the penalty SHALL NOT be rolled or shown. Manual damage bonuses below 0 SHALL
be penalties too.

The target's effects SHALL add damage the same way when the target takes extra damage from
being hit by this attacker: a `damage` sub-effect with `trigger: "on_hit_taken"` that damages
the target itself (no `target`, or `self`), whose `trigger_filter.by` is `caster` with the
attacker as the instance's caster, or `any`, `counterpart` or none, and whose filter's
`attack_types` (if any) include the attack. Hex's 1d6 necrotic and Hunter's Mark's 1d6 are
examples. A sub-effect with a `save`, a `frequency`, a `condition` that can't be checked, or
another filter field (`natural_roll`, `damage_types`, `min_amount`, `within`, `source`, or
`by` an ally or enemy) is not rolled with the attack; it stays a prompt.

The manual `damage` bonuses of the attacker SHALL add as flat damage of the first damage
type. On a critical hit, damage bonus dice SHALL follow the Critical Hits setting like the
attack's own dice. This includes penalty dice. The bonuses count only for a hit: a miss that
deals damage (half damage on a miss) gets no damage bonuses. The roll dialog SHALL show each
bonus with its effect.

#### Scenario: Divine Favor
- **WHEN** a creature with Divine Favor hits with a weapon attack dealing 1d8+3 slashing
- **THEN** the hit deals 1d8+3 slashing and a separate 1d4 radiant, shown as "Divine Favor"

#### Scenario: Magic Weapon
- **WHEN** a creature with Magic Weapon hits with a weapon attack dealing 1d8+3 slashing
- **THEN** its to-hit is 1 higher, and the hit deals 1d8+3 slashing plus 1 slashing shown as "Magic Weapon"

#### Scenario: Critical with Divine Favor
- **WHEN** that Divine Favor hit is a critical hit
- **THEN** both the 1d8 and the 1d4 are handled by the Critical Hits setting: rolled twice with Roll, and no extra with Disabled

#### Scenario: Not for saves
- **WHEN** a creature with Divine Favor casts a spell that calls for a saving throw
- **THEN** no radiant damage is added

#### Scenario: Penalty dice
- **WHEN** a creature with an effect `{ type: "bonus", sub_types: ["damage"], roll: { dice_count: 1, dice_type: 4 }, multiplier: -1 }` hits with a weapon attack dealing 1d8+3 slashing, rolling 7 on the d8 and 2 on the d4
- **THEN** the slashing line shows (10 − 2 <effect> (1d4: 2)) = 8, there's no separate line for the effect, and the hit deals 8 slashing

#### Scenario: Negative fixed value gives the sign
- **WHEN** the effect's roll is `{ dice_count: 1, dice_type: 4, fixed_val: -1 }` without a multiplier
- **THEN** 1d4 is subtracted from the hit's damage, and the −1 isn't added on top

#### Scenario: Flat penalty
- **WHEN** a creature with a `bonus` `damage` sub-effect with `value: -2` hits for 6 piercing
- **THEN** the hit deals 4 piercing

#### Scenario: Penalty doesn't go below 0
- **WHEN** a creature with a −1d4 damage penalty hits for 2 slashing and the d4 rolls 4
- **THEN** the slashing line shows − 2 for the penalty (1d4: 4, limited) and the hit deals 0 slashing

#### Scenario: Penalty before resistance
- **WHEN** a hit for 10 slashing with a −2 penalty hits a creature resistant to slashing
- **THEN** the creature takes 4 slashing: (10 − 2) / 2

#### Scenario: Odd penalty before resistance
- **WHEN** a hit for 12 bludgeoning with a −3 penalty hits a creature resistant to bludgeoning
- **THEN** the creature takes 4 bludgeoning: (12 − 3) / 2, rounded down

#### Scenario: Penalty of a type the hit doesn't have
- **WHEN** a penalty with damage type radiant applies to a hit that deals only slashing
- **THEN** no radiant penalty is rolled or shown, and the slashing damage isn't lowered

#### Scenario: Penalty on a critical hit
- **WHEN** the hit with a −1d4 penalty is a critical hit with the Critical Hits setting on Roll
- **THEN** the penalty rolls 2d4

#### Scenario: Hex
- **WHEN** a warlock concentrating on Hex hits the hexed goblin with an Eldritch Blast dealing 1d10 force
- **THEN** the hit deals 1d10 force and a separate 1d6 necrotic, shown as "Hex"

#### Scenario: Someone else hits the hexed target
- **WHEN** a fighter who isn't Hex's caster hits the hexed goblin
- **THEN** no necrotic damage is added

#### Scenario: Hunter's Mark (5e) without a damage type
- **WHEN** the ranger who cast the 5e Hunter's Mark hits the marked creature with a weapon attack dealing 1d8+3 piercing
- **THEN** the hit deals 1d8+3 piercing and a separate 1d6 piercing, shown as "Hunter's Mark"

#### Scenario: Hunter's Mark (5e) with a spell attack
- **WHEN** that ranger hits the marked creature with a spell attack
- **THEN** no damage from Hunter's Mark is added

#### Scenario: Missing the hexed target
- **WHEN** the warlock misses the hexed goblin
- **THEN** no necrotic damage is rolled for the miss

#### Scenario: Damage to the attacker stays a prompt
- **WHEN** a creature with an effect that deals 2d8 fire to a creature that hits it in melee (`target: "trigger_source"`) is hit
- **THEN** the attack's damage has no fire roll from it, and its prompt is shown after the roll is applied
