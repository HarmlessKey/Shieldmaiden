## Why

Since 3b, effects change a creature's numbers. But the most frequent things conditions and
spells do still don't reach the dice:
- a Poisoned creature rolls its ability checks normally
- a Paralyzed creature rolls Strength saves instead of failing them
- Bless adds no 1d4 to saves, and Slow's −2 to Dexterity saves is ignored
- Haste gives no Advantage on Dexterity saves
- 2024 Exhaustion doesn't take 2 per level off D20 Tests
- a 2024 Invisible creature rolls initiative without Advantage

The DM has to remember each of these on every roll. The DM also can't record their own
roll bonuses: a +1 save item, a skill bonus, or a bonus on every check.

This is **3c1**, the first half of 3c in
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md).
It covers ability checks, skills, saving throws and initiative. 3c2 covers attack and damage
rolls. 3b is archived as `effects-3b-numeric-modifiers`. Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §3.1 (d20 rolls), and
the plan section "Manual bonuses for later values".

## What Changes

- **Modifiers on d20 rolls.** Checks, skills, saves and NPC initiative rolled in the DM's
  tracker take the roller's active effects into account:
  - **Advantage / Disadvantage** from `advantage` / `disadvantage` sub-effects on
    `ability` (checks), `skill`, `save`, `initiative` and `d20_test`, filtered by
    `abilities` / `skills`. Advantage and Disadvantage cancel each other, and they combine
    with the DM's own Shift/Ctrl choice the same way.
  - **Flat bonuses** (Slow −2, 2024 Exhaustion −2 per level, a value formula) and **dice
    bonuses** (Bless +1d4, Bane −1d4) from `bonus` sub-effects, added to the roll and shown
    in its result.
  - **Automatic failure or success** (`auto_fail` / `auto_success`, e.g. Paralyzed and
    Stunned on Strength and Dexterity saves): the roll isn't made, and the result says it
    failed or succeeded automatically and why.
  - **Initiative** counts as a Dexterity check, as the rules have it, plus its own
    `initiative` modifiers (2024 Invisible: Advantage; Incapacitated: Disadvantage).
  - **Single-use modifiers** (`consume` on the next roll, e.g. Guidance) end their effect
    after the roll they modified.
- **Reminders instead of guesses.** A modifier that depends on something the tracker can't
  check isn't applied. Examples: Frightened "while the source is in sight", Blinded "checks
  that rely on sight", Magic Resistance "against spells" when the source is unknown. It is
  listed with the roll ("Blinded: automatically fails checks that rely on sight"), so the DM
  can decide, and reroll with Advantage or Disadvantage as today.
- **Where.** The roll sites are:
  - the card's ability MOD and SAVE, and its skills
  - the Targeted panel's MOD and SAVE
  - target saves in the roll dialog
  - repeat saves and escape attempts
  - NPC initiative
  
  Their shown modifiers include the flat bonuses, and are marked with a tooltip, like 3b's
  values. A roll button with Advantage or Disadvantage from effects shows its colour.
- **Bug fix (found while planning):** target saves in the roll dialog compared only the dice
  with the DC, leaving out the save modifier. They now compare the total, which 3c1's
  modifiers need anyway.
- **Manual roll bonuses** (the 3b labelled-list pattern), saved in `bonuses`:
  - per skill (`skill_<skill>`)
  - per ability check (`check_<ability>`) and on all checks (`check_all`)
  - per save (`save_<ability>`) and on all saves (`save_all`)
  - on death saves (`death_save`) and Concentration saves (`concentration_save`)
  
  Skills include their ability's check bonuses. The tracker has no rolls for death and
  Concentration saves yet, so those two are only shown. They can be edited in the bonuses
  drawer, opened from:
  - an ability score: score, checks and saves of that ability
  - a new button by the card's skill list: all roll bonuses
  
  The database rules accept the new keys.

- **Concentration saves** (added during testing, at the user's request):
  - Concentration's damage prompt shows the actual DC: 10 or half the damage, at most 30
    in 5.5e.
  - It gets Roll / Succeeded / Failed, and Roll uses the roll modifiers: Constitution
    saves, `concentration_save` effects and the `concentration_save` manual bonus.
  - A failure ends Concentration and its linked effects.

Not in 3c1 (3c2 and later):
- attack and damage rolls, and "rolls against the holder" (`perspective: "against"`)
- critical-hit rules, rerolls and minimum rolls
- rolling death saves
- NPC group initiative modifiers, beyond 3b's effective Dexterity

## Capabilities

### New Capabilities
- `effects-roll-modifiers`: d20 modifiers from effects and manual bonuses on checks,
  skills, saves and initiative. It covers Advantage and Disadvantage, flat and dice bonuses,
  automatic results, single-use modifiers, reminders, the roll sites and how they show it,
  and the manual roll-bonus keys.

### Modified Capabilities
- `effects-stat-modifiers`: the manual-bonus value keys, the rules and the bonuses drawer
  extend to the roll-bonus keys (the "Manual bonuses are labelled lists" and "The bonuses
  drawer…" requirements).

## Impact

- `src/utils/effectFunctions.js`: pure `rollModifiers({ entity, holderKey, entities,
  definitionOf, roll })` and a three-valued condition check (`true` / `false` /
  `unknown`). Tested in the scratchpad.
- `src/utils/entityFunctions.js`: the roll-bonus keys in `BONUS_LABELS` and `skillBonusKey`.
- `src/mixins/dice.js` `rollD`: optional bonus dice and note lines in the result and its
  notification.
- `src/store/modules/runEncounter.js`: a `roll_modifiers(key, roll)` getter and
  `consume_roll_modifiers`.
- Roll sites: `hk-roll.vue` (an optional `modifiers` prop), `Card/CardDetails.vue`,
  `Card/CardSkills.vue`, `Targeted.vue`, `hk-single-roll.vue` (`rollSave`),
  `mixins/effectRolls.js`, `EffectTriggerNotifier.vue`, `effects/ActiveEffect.vue`,
  `initiative/NPCs.vue`.
- `drawers/encounter/StatBonuses.vue`: several values in one drawer, and adding a bonus for a
  chosen value.
- `firebase_rules/firebase-rules.json`: the `$stat` regex of the three `bonuses` blocks.
  Upload before release.
- Unchanged:
  - attack rolls (3c2)
  - the legacy `ViewEntity.vue`
  - the player live view
  - the effects schema
