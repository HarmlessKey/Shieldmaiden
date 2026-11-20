## Why

Effects already say what they do to a creature's numbers, but the tracker ignores it:
- a Grappled or Restrained creature still shows its full Speed
- 2024 Exhaustion 3 doesn't take 15 ft off Speed
- 2014 Exhaustion doesn't halve Speed or the hit point maximum
- Shield of Faith doesn't raise AC, so the roll dialog judges hits against the wrong AC

The DM has to do this arithmetic by hand every turn. Numeric modifiers (`bonus`, `base`,
`fixed`, `floor`, `cap`, `multiplier`) are the second-largest tier-A group in the catalogue,
after damage and healing (3a).

This is **3b** of step 3 in
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
(3a is archived as `effects-3a-damage-over-time`). Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §3.2 (numeric values)
and §3.7 (stacking, levels), and the `sub_effect` / `sub_type` / `scaling` / `formula` defs in
`src/schemas/hk-effects-schema.json`.

## What Changes

- **Effective values**: in the DM's combat tracker, these values of an entity are computed
  from its stored value plus its active effects' numeric sub-effects:
  - Armor Class
  - Speed: walk and the fly / swim / climb / burrow modes
  - maximum hit points
  - initiative modifier
  - passive Perception
  - spell save DC and spell attack bonus (caster and innate)
  - the six ability scores
  
  Stored values are never changed by this: when an effect ends, the value is back.
- **How modifiers combine** (per value):
  1. `base` replaces the stored value; with several, the highest wins. A `base` without a
     value multiplies the stored value (2014 Exhaustion: Speed halved).
  2. `bonus` values are added. A value can be a number, a formula (3a's evaluator) or
     level-scaled (2024 Exhaustion −5 ft per level).
  3. A sub-effect with only a `multiplier` multiplies the result (Haste doubles Speed). The
     result is rounded down.
  4. `floor` sets a minimum and `cap` a maximum (Barkskin AC 16 or 17).
  5. `fixed` sets the final value (Speed 0), and wins over everything else.
  
  Only sub-effects that apply count:
  - within `min_level` / `max_level` of the instance's level
  - with a satisfied `condition`
  - resolving `choice` through the instance's choices
  
  The same effect on one creature twice counts once, using its strongest instance.
- **Where they show and are used**:
  - the entity card (stats, scores, modifiers, saves, skills, passive Perception,
    spellcasting)
  - the targeted panel and target rows
  - the health bar
  - hit or miss against AC in the roll dialog
  - saves rolled in the roll dialog
  - repeat-save and escape rolls
  - NPC spell rolls (DC and attack bonus)
  - NPC initiative rolls
  - 3a's formula variables
  
  A value changed by effects is marked, and its tooltip lists which effects changed it
  and how.
- **Maximum hit points**:
  - Healing stops at the effective maximum, and Bloodied and instant death use it.
  - When the effective maximum drops below current HP, current HP drops to it (saved).
  - A `max_hp` bonus with `also_heal` raises current HP by the same amount when the effect
    is applied (Aid).
  - A transformed creature's separate hit point pool is not changed.
- **Temporary hit points**: a `fixed` `temp_hp` sub-effect grants temporary HP through a
  **Grant temp HP** button, like 3a's Roll:
  - on the prompt of its trigger (Heroism at the start of each turn)
  - or, without a trigger, on a prompt shown when the effect is applied (False Life)
  
  The amount is rolled or evaluated, and the creature keeps the higher of its current and
  the new temporary HP.
- **Initiative**: the effective initiative modifier is used when initiative is rolled for
  NPCs, and when it is auto-rolled in test mode.

- **Manual bonuses become labelled lists** (added during apply, at the user's request). Today
  the DM's manual bonuses are single numbers (`ac_bonus`, `maxHpMod`). They become
  `bonuses.<value>.<id> = { value, label }` for every value above:
  - Old numbers are read as a "Manual" bonus when an encounter loads, and are replaced by the
    new format the first time that entity's bonuses change.
  - Manual bonuses count like effect bonuses, so the marker and tooltip show both.
  - Clicking a value on the card opens a **bonuses drawer**: the stored value, effect
    modifiers (read-only), manual bonuses (add, edit, remove) and the result. The AC and HP
    quick edits and the entity edit drawer link to it.
  - Raising maximum HP bonuses raises current HP; lowering them only clamps current HP.
  - The campaign overview, party health drawer, player edit drawer, live view, encounter
    reset and exports use the new format. The database rules get a `bonuses` block, which
    must be uploaded to production before release.
  - **BREAKING** for other clients that write `ac_bonus` / `maxHpMod`: they keep working,
    but the tracker prefers `bonuses` once it exists.

Not in 3b:
- **Player live view**: keeps its stored AC and HP.
- **Stored stat blocks**: an NPC action's stored attack bonus and damage don't follow
  changed ability scores.
- **Roll modifiers** (3c): `attack`, `damage`, `save`, `ability`, `skill`, `d20_test`
  bonuses, and Advantage.
- **Temp HP loss**: temporary HP isn't removed when its effect ends
  (`expires_with_effect` is shown as text).
- **Descriptive-only values**: `size`, `reach`, `jump` and senses.

## Capabilities

### New Capabilities
- `effects-stat-modifiers`: effective values from numeric sub-effects: which values, how
  modifiers combine and when they apply, where effective values are shown and used,
  maximum and current hit points, temporary HP grants, and the initiative roll.

### Modified Capabilities
- `effects-damage-healing`: formulas get a `spellcasting_mod` variable (added during apply,
  found while testing Heroism).

## Impact

- `src/utils/effectFunctions.js`, pure helpers tested in the scratchpad:
  - `effectiveStats` (per-value computation and breakdown) and `effectiveEntity` (a copy
    with the effective values)
  - `proficiencyBonus` (moved from the component mixins, using `experience_table`)
  - `tempHpParts` (temp HP sub-effects of a prompt)
- `src/store/modules/runEncounter.js`:
  - `effective_entity(key)` getter
  - `sync_effect_hp` after `apply_effect` / `remove_effect` / level changes
  - `also_heal` on apply
  - the `on_apply` temp HP prompt
  - effective initiative in test mode
- `src/mixins/HpManipulations.js`: healing clamp, overkill death and Bloodied use the
  effective maximum.
- Readers switched to the effective entity:
  - `CardDetails.vue`, `CardSkills.vue`, `CardSpellcasting.vue`
  - `Targeted.vue`, `TargetEntity.vue`, `HealthBar.vue`, `actor/Details.vue`
  - `hk-single-roll.vue` (AC and saves)
  - `initiative/NPCs.vue`
  - `src/mixins/runEncounter.js` (spell DC and attack)
  - `src/mixins/effectRolls.js`
  - `EffectTriggerNotifier.vue` (the Grant temp HP button)
- Manual bonuses:
  - pure helpers in `src/utils/entityFunctions.js` (`manualBonuses`, `manualBonusTotal`,
    `hpAfterMaxHpChange`)
  - `effectiveStats` counts manual bonuses
  - `runEncounter.js`: load conversion, unbaked `maxHp`, and `set_bonus` / `remove_bonus` /
    `set_manual_bonus`
  - new `drawers/encounter/StatBonuses.vue`
  - quick edits, `EditEntity.vue`, `HealthBar.vue`, `hk-single-roll.vue` (drain)
  - `campaign/Players.vue`, `drawers/party/health.vue`, `drawers/EditPlayer.vue`
  - `trackCampaign/live/Health.vue`, `mixins/trackEncounter.js`
  - `userContent/encounters.js` (reset), `userContent/players.js`, `ExportUserContent.vue`
  - `firebase_rules/firebase-rules.json`: `bonuses` blocks on campaign players and
    companions, and on encounter entities
- Unchanged:
  - quick edits' base-value fields, which write stored values
  - the legacy `ViewEntity.vue`
  - the effects schema
