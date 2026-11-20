## Why

Effects can grant resistance, vulnerability or immunity to damage, and immunity to
conditions. Petrified resists all damage and can't be Poisoned; Heroism can't be Frightened.
The tracker ignores these today. Damage is halved only when the creature's own stat block
says so or the DM toggles the defense by hand. Nothing stops an immune creature from being
given a condition, not even a monster's own condition immunities. Step 3d of the effects plan
applies effect defenses wherever damage is dealt and conditions are applied.

## What Changes

- **Effect damage defenses:** `defense` sub-effects with `r` / `v` / `i` add to a creature's
  resistances, vulnerabilities and immunities while the effect is active:
  - `damage_types`, `all_damage` (with `except_damage_types`), and a chosen damage type
  - `bypass: ["magical"]` for "from nonmagical attacks"
  - conditions checked as for other modifiers

  They combine with the creature's own: immunity wins, and resistance and vulnerability to
  the same type cancel. The roll dialog, manual damage and its defense buttons use the result,
  and the DM can still override per roll.
- **Condition immunity:** a creature immune to a condition, from its own condition
  immunities or an effect's `defense` `i` with `conditions`, isn't given that condition.
  Applying it skips that creature with a notice ("Goblin is immune to Poisoned"). A creature
  that gains the immunity while it has the condition loses it, with the notice "immune to
  Frightened".
- **Shown on the card:** defenses from effects are listed with the creature's own and
  marked, with a tooltip naming the effect.
- **SRD test effects:** Stoneskin (both editions) and Protection from Energy (chosen damage
  type).
- Not in this change:
  - `damage_modifier` (2024 Resistance's 1d4 reduction, Heavy Armor Master): 3g
  - immunity to conditions that another condition includes (Stunned includes Incapacitated):
    only the condition itself is blocked
  - "except silvered or adamantine": applied as nonmagical, with a reminder
  - mechanics immunities (`mechanics`)
  - the player live view

## Capabilities

### New Capabilities
- `effects-defenses`: damage defenses and condition immunities from effects, how they
  combine with the creature's own, where they apply, and how they're shown.

### Modified Capabilities
<!-- None: the roll dialog and manual damage keep their existing defense handling, now fed
     the effective defenses. -->

## Impact

- **Code:**
  - `src/utils/effectFunctions.js`: new pure `effectiveDefenses`; `effectiveEntity` merges
    the lists
  - `src/store/modules/runEncounter.js`: `effective_entity`; `apply_effect` skips immune
    targets and ends conditions a new immunity covers
  - `src/components/hk-components/hk-rolls/hk-single-roll.vue`: defenses of the effective
    target
  - `src/components/combat/actions/Manual.vue`,
    `src/components/combat/entities/multipliers/Defenses.vue` and
    `src/utils/combatFunctions.js` callers: the effective entity
  - `src/components/combat/entities/Card/CardDetails.vue`: the marked lists
  - legacy `custom/Manual.vue`: the effective entity
- **Data:** `src/data/5e/effects.js`, `src/data/5.5e/effects.js`.
- **No schema, rules or migration changes.**
