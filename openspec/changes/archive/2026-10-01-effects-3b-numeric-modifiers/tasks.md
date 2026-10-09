## 1. Pure helpers

- [x] 1.1 Add `proficiencyBonus(entity)` and `formulaVars(entity)` to `src/utils/effectFunctions.js`, and let `effectRolls` delegate to them (design decision 2). Verify in the scratchpad that `proficiencyBonus` matches `effectProficiency` for players by level and by experience, and for NPCs, and that 3a's `test-dot.mjs` and `test-rollaction.mjs` still pass
- [x] 1.2 Add `effectiveStats` and `effectiveEntity` (design decision 1). Verify with a scratchpad script covering every scenario of these requirements, run against the real 5e / 5.5e Exhaustion, Grappled and Restrained definitions:
  - "Numeric sub-effects change effective values"
  - "Modifiers combine in a fixed order"
  - "Only applicable modifiers count"
  
  Also check:
  - an unknown formula variable → listed as not applied
  - an unresolved definition → nothing
  - a transformed entity's `transformedAc`
  - caster and innate spellcasting fields
  - passive Perception following effective Wisdom
- [x] 1.3 Extract the shared amount helper from `effectRollParts` and add `tempHpParts` (design decision 5). Verify that `test-dot.mjs` passes unchanged and that `tempHpParts` covers dice, value, formula and level scaling

## 2. Store

- [x] 2.1 Add the `effective_entity(key)` getter. Verify by reading that it returns `undefined` for unknown keys, and a copy (the stored entity isn't mutated)
- [x] 2.2 Add `sync_effect_hp` and call it from `apply_effect`, `remove_effect` (including cascade holders), `set_effect_prop` on `level`, and the end of `init_Encounter`. Add `also_heal` in `apply_effect` (design decision 4). Verify with a scratchpad run of the clamp and `also_heal` arithmetic against "Hit points follow the effective maximum", and by reading that the transformed pool is untouched
- [x] 2.3 Queue the `temp_hp` prompt in `apply_effect` for trigger-less `temp_hp` sub-effects. Move the test-mode initiative roll after definition resolution, using the effective modifier. Verify by reading against "Temporary hit points are granted from a prompt" and "NPC initiative"
  - As built: the test-mode roll was not moved. Test mode never loads effects, so the effective modifier always equals the stored one there (design decision 3 updated)

## 3. Readers

- [x] 3.1 `Card/index.vue` passes the effective entity. Add `EffectModifiedValue.vue` and use it in `CardDetails` (stats, scores), `CardSpellcasting`, `TargetEntity` and `actor/Details`. Verify by reading that quick edits still get the stored entity, and that each Vue option appears once per touched component
- [x] 3.2 `displayStats` readers (`TargetEntity`, `HealthBar`, `actor/Details`), `Targeted.vue` (shared `displayStats`, effective saves and modifiers), and `hk-single-roll` (`checkHitOrMiss` and `rollSave` by key). Verify by reading against "Effective values are used by the tracker's rolls"
- [x] 3.3 `HpManipulations` uses the effective maximum. Verify by reading that the transformed pool and undo paths are unchanged
- [x] 3.4 `mixins/runEncounter.js roll_action` (spell DC and attack), `initiative/NPCs.vue` (modifier), and the `effectRolls` callers (`EffectTriggerNotifier`, `ActiveEffect`) pass effective entities. Verify by reading
- [x] 3.5 `EffectTriggerNotifier.vue`: the Grant temp HP button on trigger prompts and the new `temp_hp` prompt kind, with `effectRolls.grantEffectTempHp`. Verify by reading that prompts without temp HP are unchanged

- [x] 3.6 (Added on the user's request) SRD definitions in `src/data/5e/effects.js` and `src/data/5.5e/effects.js` that cover every 3b modifier, for testing and for later use (plan step 5):
  - Aid, Barkskin, False Life, Fly, Haste, Heroism, Longstrider, Mage Armor, Shield of Faith, Slow (spells)
  - Gauntlets of Ogre Power, Ioun Stone (Strength), Robe of the Archmagi (items)
  - 5.5e only: Alert (feat) and Enthrall
  
  Verify that `node scripts/validate-effects-data/validate.mjs` passes, and that a scratchpad run (`test-3b-data.mjs`) puts each through `effectiveStats` / `tempHpParts` / `alsoHealAmount` with the expected values in both editions

## 5. Manual bonuses (added during apply, at the user's request)

- [x] 5.1 Pure helpers `manualBonuses`, `manualBonusTotal`, `hpAfterMaxHpChange`, `BONUS_VALUES`, `BONUS_LABELS` in `entityFunctions.js`. `effectiveStats` counts manual bonuses and adds `effectKey` / `bonusId` to modifiers. `displayStats` stops adding `ac_bonus`. Verify in the scratchpad against "Old single-value bonuses are converted", "Manual bonuses count like effect bonuses" and "Changing maximum hit point bonuses adjusts current hit points", and that `test-3b.mjs` still passes
- [x] 5.2 Store: `add_entity` conversion with unbaked `maxHp` (players, companions, NPCs; demo data), and `save_bonuses` / `set_bonus` / `remove_bonus` / `set_manual_bonus` with current-HP adjustment. `edit_entity_prop` keeps the transformed `maxHpMod` and uses the effective maximum for the `curHp` / `maxHp` clamps. Verify by reading that nothing is written on load, and that the first change writes `bonuses` and clears the old fields
- [x] 5.3 Rules: the `bonuses` blocks in `firebase_rules/firebase-rules.json`. Verify with the rules emulator script in the scratchpad (valid bonus accepted; missing label, unknown value key and a 51-character label rejected)
- [x] 5.4 `StatBonuses.vue` drawer, clickable card values (`EffectModifiedValue` `bonus` prop), the quick-edit buttons and `EditEntity.vue` (single: buttons; several: Manual bonus). Verify by reading against "The bonuses drawer shows and edits a value's bonuses", and that each Vue option appears once
- [x] 5.5 `HealthBar.vue` (the modifier part from the effective maximum) and `hk-single-roll.vue` drain (a −damage `max_hp` bonus labelled with the roll name). Verify by reading
- [x] 5.6 Outside the tracker: `campaign/Players.vue` (display and "Manual bonuses" reset), `drawers/party/health.vue`, `drawers/EditPlayer.vue`, `trackCampaign/live/Health.vue`, `mixins/trackEncounter.js`, `userContent/encounters.js` (reset, `numberValues`), `userContent/players.js`, `ExportUserContent.vue`. Verify by reading against "Screens outside the tracker use manual bonuses", and with a final grep that no reader treats `ac_bonus` / `maxHpMod` as the only source

- [x] 5.7 (Found while testing Heroism from an Archmage) Add the `spellcasting_mod` formula variable to `formulaVars`: an NPC's spellcasting or innate ability modifier, or a player's spell save DC − 8 − proficiency (players now load `spell_save_dc`). Heroism uses `caster.spellcasting_mod`. A temp HP grant whose amount is incomplete warns which variable was missing, and why when it's the caster. Verify with `test-3b-data.mjs`: Archmage Int 20 → 5, innate Cha caster → 3, player DC 15 at level 5 → 4, no spell DC or no caster → 0 with a note

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors
- [x] 4.2 Run `openspec validate effects-3b-numeric-modifiers --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app:
  - Grappled on an NPC with walk and fly Speed: the card shows both as 0, marked, with the tooltip. Removing it restores them.
  - 5.5e Exhaustion level 3 on a player: Speed −15
  - 5e Exhaustion level 4 on a full-HP player: max HP halved and current HP clamped. Healing stops at the new max.
  - Shield of Faith (+2 AC): the card and target row show the new AC, the AC quick edit shows the stored AC, and an attack equal to the old AC misses in the roll dialog
  - Mage Armor (base 13 + Dex), Barkskin (at least 16 / 17), Haste (+2 AC, Speed ×2), Slow (−2 AC, Speed ×½), Longstrider (+10), Fly (gains fly 60)
  - Aid on a wounded player: max +5 and current +5. Removing it keeps current HP within the old max.
  - Gauntlets of Ogre Power (Strength at least 19) and Ioun Stone (Strength +2, max 20): the card's score, modifier, saves and skills follow, and a save rolled from the card uses it
  - Robe of the Archmagi on an NPC spellcaster: the card shows DC and attack +2, and its spell rolls use them
  - 5.5e Alert (initiative +PB) on an NPC: its initiative roll uses it. Enthrall: passive Perception −10.
  - False Life on apply: Grant temp HP rolls 1d4 + 4 (5e) / 2d4 + 4 (5.5e) and keeps the higher value. Heroism from a caster in the encounter: Grant temp HP at the start of the holder's turn.
  - Haste removed: the end prompt shows the lethargy
  - the player live view still shows stored AC
  - Manual bonuses (upload the rules with the `bonuses` blocks to the develop database first):
    - a player with an old AC bonus or Max HP Mod: the card shows it as "Manual" in the tooltip, and nothing is written on load
    - click AC on the card: the drawer lists the stored value, effect modifiers (with a link) and manual bonuses. Add "Cover" +2: the AC, the tooltip and the campaign data (`bonuses`, with `ac_bonus` gone) follow.
    - edit and remove a manual bonus in the drawer. Speed, initiative, scores, passive Perception and spell DC/attack open the drawer too.
    - Max HP bonus +5 at 20/30 → 25/35. Remove it at 33/35 → 30/30.
    - AC and HP quick edits: the bonus fields are buttons that open the drawer. Transformed: the HP quick edit keeps its Max HP Mod field.
    - Edit entity with several targets: Manual AC bonus 1 sets "Manual" on each, and 0 removes it
    - a draining attack: the target gets a negative Max HP bonus named after the attack
    - campaign overview: AC and max HP include the manual bonuses, with tooltips. The rest dialog's "Manual bonuses" reset clears them.
    - party health drawer and player edit drawer: the fields set "Manual" and keep other bonuses
    - live view: AC and max HP include the manual bonuses
    - encounter reset clears NPC bonuses

  Record the outcome here
  - 2026-10-01 (in progress): Heroism applied by a 5e Archmage grants 5 temporary HP from the start-of-turn prompt (after 5.7). False Life on apply grants temp HP. Removing an effect doesn't remove its temp HP (by design, open follow-up).
  - 2026-10-01: user tested all the SRD test effects; their numeric bonuses apply correctly. Save, check and advantage parts (Slow's Dex save penalty, Enthrall's Perception check penalty, Haste's advantage) are not applied yet, as expected: they are 3c.
  - 2026-10-01: user confirmed the manual bonuses were tested as well (drawer, conversion, HP adjustment, outside screens), no issues
- [x] 4.4 After archiving, mark 3b done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order) as `(done — archived as effects-3b-numeric-modifiers, <date>)`. Verify the plan shows 3b done
