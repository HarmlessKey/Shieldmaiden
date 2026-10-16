## MODIFIED Requirements

### Requirement: Damage bonuses are added to hits

The attacker's `bonus` sub-effects on `damage` SHALL add to the damage of its attack actions,
for attacks they apply to (`attack_types`). They are rolled with the attack:
- **With a damage type** (the roll's `damage_type`, or the instance's chosen damage type),
  the bonus is a separate damage roll of that type, so defenses apply per type. Divine
  Favor's 1d4 radiant is an example.
- **Without a damage type**, its dice and value are damage of the attack's first damage type.
  Magic Weapon's +1 is an example.

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
attack's own dice. The bonuses count only for a hit: a miss that deals damage (half damage on
a miss) gets no damage bonuses. The roll dialog SHALL show each bonus with its effect.

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

### Requirement: The actor's attack modifiers are shown in the details bar

For every actor, player or NPC, the actor panel's details bar SHALL show, after its name,
what its effects do to its attacks, as compact reminders on one line. A player's attacks
aren't rolled in the tracker, so this is how the DM knows them. For NPCs it previews what
their rolls apply. The actor's Reaction Used tag (effects-reaction-used) SHALL always come
first, in red, followed by its restrictions (effects-restrictions). Then its extra actions
(`grant_action`): one chip per kind ("Extra action", "Extra attack", "Extra bonus action",
"Extra reaction", "Bonus action option", "Extra turn"). The tooltip names the effect, its
description and the allowed actions. Then:
- **Advantage or Disadvantage**, as a green A or a red D with their sources (both when they
  cancel)
- **To-hit bonuses**: flat and dice, from effects and manual `attack` bonuses
- **Critical hits**: its crit range, and hits that are critical against the target
- **Damage bonuses** on hits, including the extra damage the targeted creature takes when this
  actor hits it (its hit-taken damage, see "Damage bonuses are added to hits"), named after
  the effect and the target ("Hex: +1d6 necrotic (against Goblin)")
- **The number of reminders**: what the tracker can't check, single-use modifiers, and the
  actor's effects the tracker only reminds of. These are `compel`, `deny`,
  `forced_movement`, `sense`, `proficiency`, `score_swap`, restrictions with `limit` or
  `exclusive`, and damage modifiers that aren't applied (effects-damage-modifiers). They also
  include the hit-taken damage of other creatures that this actor cast ("Hex on Goblin: +1d6
  necrotic when you hit it"), so the DM is reminded while that creature isn't targeted.

Each reminder SHALL list its sources in a tooltip, with filters such as "(weapon)". When
exactly one other creature is targeted, that target's "attacks against it" modifiers are
included and named. Melee or ranged isn't known, so distance-based modifiers stay
reminders. Nothing SHALL be shown when it hasn't used its reaction, has no restrictions, no
extra actions and no reminders, and no effect or manual bonus changes its attacks. What
doesn't fit on the line is cut off.

#### Scenario: Blessed player against a Blinded target
- **WHEN** it is a blessed player's turn and a Blinded goblin is the only target
- **THEN** the details bar shows a green A (Blinded, against the goblin) and "To hit +1d4" (Bless)

#### Scenario: NPC with Reaction Used
- **WHEN** a poisoned goblin with Reaction Used is the actor
- **THEN** the details bar shows the red Reaction Used tag first, then a red D (Poisoned)

#### Scenario: Restrictions come after Reaction Used
- **WHEN** a Stunned goblin with Reaction Used is the actor
- **THEN** the details bar shows Reaction Used, then its restriction chips, then the attack reminders

#### Scenario: Hasted creature
- **WHEN** a creature with Haste is the actor
- **THEN** the details bar shows "Extra action", with Haste and its allowed actions in the tooltip

#### Scenario: Effect reminders
- **WHEN** an actor has an effect with a `compel` sub-effect
- **THEN** the reminders chip counts it, and its tooltip names the effect and its description

#### Scenario: No target
- **WHEN** no creature is targeted
- **THEN** only the player's own modifiers are shown, with the hit-taken damage of creatures it cast effects on as reminders

#### Scenario: Nothing to show
- **WHEN** a player without attack modifiers or restrictions has the turn
- **THEN** no reminders are shown

#### Scenario: Hexed target
- **WHEN** the warlock concentrating on Hex has the turn and the hexed goblin is the only target
- **THEN** the Damage chip shows "+1d6 necrotic", with "Hex: +1d6 necrotic (against Goblin)" in its tooltip

#### Scenario: Hexed creature not targeted
- **WHEN** the warlock has the turn and the hexed goblin isn't targeted
- **THEN** the reminders chip counts "Hex on Goblin: +1d6 necrotic when you hit it"
