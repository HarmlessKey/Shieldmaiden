## Why

Effects already change checks, saves and initiative (3c1), but not attacks. A Blinded
goblin's attacks are rolled normally, Bless isn't added to an attack, hits on a Paralyzed
target aren't critical, and Guiding Bolt's Advantage has to be remembered. Step 3c2 of the
effects plan brings the roll modifiers to attack and damage rolls. An attack has two parties,
the attacker and the target, so "attacks against it" modifiers and conditions on the other
party can finally be checked.

## What Changes

- **Attack rolls use roll modifiers** from both sides:
  - the attacker's own (Poisoned, Bless, Invisible)
  - the target's "against" modifiers (Blinded, Restrained, Guiding Bolt, Dodge)

  Advantage and Disadvantage, flat and dice bonuses and single-use modifiers work as for
  saves. The result names each source.
- **The other party is known in an attack.** Conditions on the counterpart are evaluated,
  such as 5.5e Grappled ("against any target other than the grappler").
- **Distance is assumed from the attack type:** a melee attack is within 5 feet, a ranged
  attack beyond 5 feet. Prone and the "within 5 feet" auto-crits then apply, and the result
  notes the assumption. Other distances stay reminders.
- **Critical hits from effects:**
  - a hit on a target with an incoming-crit effect is critical (Paralyzed, Unconscious, within
    5 feet)
  - the attacker's crit range applies (`critical` with `crit_range`, Improved Critical 19–20)
  - the roll dialog uses these instead of only a natural 20
- **Damage bonuses on hits:** the attacker's `bonus` sub-effects on `damage` (with
  `attack_types` filters) add to the attack's damage. With a damage type they're a separate
  damage roll, so defenses apply per type (Divine Favor 1d4 radiant). Without one they add
  to the first damage roll (Magic Weapon +1).
- **Manual `attack` and `damage` bonuses:** labelled lists like the other manual bonuses,
  edited in the roll bonuses drawer. The database rules accept the two new keys.
- **SRD test effects:** Guiding Bolt, Divine Favor, Magic Weapon, Dodge and Help.
- Not in this change:
  - rolling players' attacks (they're entered as manual damage). Every actor's attack
    modifiers are shown as reminders in the actor's details bar instead, with Reaction Used
    first (added at the user's request).
  - showing modified to-hit values in action lists, since they depend on the target
  - `reroll` / `roll_floor` (3g)
  - damage defenses (3d)
  - consumption on hit or miss: still a reminder, as in 3c1

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `effects-roll-modifiers`:
  - new requirements for attack rolls, assumed distance, critical hits, damage bonuses and
    the manual attack/damage bonuses
  - "Modifiers the tracker can't check are reminders": the other party is checkable in
    attacks
  - "Manual roll bonuses": the `attack` and `damage` keys
- `effects-stat-modifiers`:
  - "Manual bonuses are labelled lists": the new keys
  - "The bonuses drawer shows and edits a value's bonuses": attack and damage in the roll
    bonuses drawer

## Impact

- **Code:**
  - `src/utils/effectFunctions.js`: `rollModifiers` gets attack parts, the against
    perspective and the counterpart, `conditionState` the counterpart and the assumed
    distance, plus new pure `attackPlan` / `damageBonuses` helpers
  - `src/utils/entityFunctions.js`: bonus keys
  - `src/store/modules/runEncounter.js`: an `attack_modifiers` getter
  - `src/mixins/dice.js` (`rollAction`) and `src/mixins/runEncounter.js` (`roll_action`
    passes the attacker and target)
  - `src/components/hk-components/hk-rolls/hk-single-roll.vue`: crits, hit, notes
  - `src/components/drawers/encounter/StatBonuses.vue`
- **Data:** `src/data/5e/effects.js`, `src/data/5.5e/effects.js`.
- **Database rules:** the `$stat` regex of the three `bonuses` blocks in
  `firebase_rules/firebase-rules.json`. It must be uploaded before release.
