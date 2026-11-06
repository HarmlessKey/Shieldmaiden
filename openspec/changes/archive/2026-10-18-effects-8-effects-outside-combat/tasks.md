## 1. Set initiative screen

- [x] 1.1 Extract `TargetActions.vue` from `Targeted.vue`'s header (design 2) and use it in `Targeted.vue` with out of turn damage as before. Verify `npm run lint`, and a scratchpad check that the component's options list matches the old one with and without out of turn
- [x] 1.2 Targeting in `Overview.vue` (design 1): row click targets, shift/ctrl adds, targeted rows marked, row buttons don't target; the Overview header (and mobile Overview tab) shows `TargetActions` without out of turn. Verify `npm run lint`

## 2. Surprised

- [x] 2.1 Add `hasSurprised` to `effectFunctions.js`; `setSurprised` applies/removes the SRD Surprised effect per edition (design 3); `Avatar.vue` reads the effect; remove `premade.surprised`. Verify `npm run lint` and a scratchpad check of the 5e and 5.5e instances built and of `hasSurprised`
- [x] 2.2 5e Surprised ends at the end of the first turn: verify with a scratchpad check of `durationActions` for an instance applied in round 0 (`next_turn`, target, end) across the first turn and the next
- [x] 2.3 Remove 5.5e Surprised when combat starts, and convert `reminders.surprised` when an encounter loads (`convert_legacy_surprised`) in `src/store/modules/runEncounter.js` (design 3). Verify with a scratchpad check of both store actions on a mock context (5e and 5.5e)

## 3. Campaign players

- [x] 3.1 Add `apply_campaign_effect` and `remove_campaign_effect` to `src/store/modules/userContent/campaigns.js` (design 4). Verify with a scratchpad check on a mock context: Aid until removed written to the player, Bless with Mira concentrating (Concentration on Mira, linked), removing Mira's Concentration removes Lyra's Bless, an immune player is skipped with a notice, Exhaustion updates the level
- [x] 3.2 Add `campaign/PlayerEffects.vue` (chips, details, Remove) and `drawers/campaign/Effects.vue` (list, `ApplyEffect` with the campaign's players as casters), and show them in `campaign/Players.vue` for the DM. Verify `npm run lint`

- [x] 3.3 The campaign's players show their AC and max HP as their effects and manual bonuses change them (`effectiveStats`, with the SRD and custom definitions), marked and with a tooltip, in `campaign/Players.vue`. Verify `npm run lint` and a scratchpad check of the values for the spec's Shield of Faith, Aid and manual-bonus scenarios

- [x] 3.4 Pure hit point functions shared with the tracker (design 5): `damageResult`, `healingResult` and `hpAfterEffects` in `effectFunctions.js`; `HpManipulations.isDamage` / `isHealing`, the tracker's also-heal and `sync_effect_hp` use them. Verify with a scratchpad check of the functions (temp HP first, transformed pool, overkill, drop to 0, heal cap) and that the tracker's results are unchanged for the same inputs, and `npm run lint`
- [x] 3.5 The campaign's effect actions change hit points and give notices (spec "Effects change a player's hit points…"): `sync_campaign_player_hp`, also heal, keep within the maximum, immunities end conditions, lost temp HP, `applyNotices` / `removeNotices`, with `context` from the screen; the screens show the notices. Verify with a scratchpad check of the Aid, removing Aid and False Life scenarios on the mock campaigns store, and `npm run lint`
- [x] 3.6 Manual damage and healing for a player (spec "Manual damage and healing…"): `campaign_player_damage` / `campaign_player_heal` and the `campaign/PlayerHealth.vue` popover on the player's hit points. Verify with a scratchpad check of the temp HP, resistance, healing cap, death save reset, death and Concentration scenarios, and `npm run lint`

- [x] 3.7 `campaign/PlayerHealth.vue` uses the app's damage type select with colored icons (`hk-dmg-type-select`, as the forms use) and Magical with its icon; `PlayerHealth` in the Edit player drawer when opened from the run campaign screen (`context` in the drawer data), with the drawer's hit points re-read after damage or healing so Save doesn't undo them. Verify `npm run lint`
- [x] 3.8 Shared manual bonus editing: `withBonus` / `withoutBonus` in `entityFunctions.js` (used by the tracker's `set_bonus` / `remove_bonus`), and `BonusAddForm` / `ManualBonusRows` components used by `StatBonuses.vue`, the Edit player drawer (AC, max HP) and the Group Health drawer (max HP, for the selected players). Verify `npm run lint` and a scratchpad check of the helpers (add with a generated id, update, remove, legacy single values converted)
- [x] 3.9 AC bonuses drawer on the run campaign screen: `campaigns/save_campaign_bonuses` (writes `bonuses`, removes the old single values, a raised max HP heals by as much and HP stays within the maximum, as the tracker's `save_bonuses`), `drawers/campaign/Bonuses.vue` (stored and effective value, effect lines, `BonusAddForm` / `ManualBonusRows`), opened from the player's AC for the DM. Verify `npm run lint` and a scratchpad check of the action on the mock campaigns store (AC bonus written, legacy fields nulled, max HP bonus heals, removal clamps)

## 4. Documentation and plan

- [x] 4.1 Update `src/docs/effects.md`: applying effects before combat (targeting in the Overview, the header), Surprised as an effect per edition, and the campaign's player effects. Verify every label it names matches the screens
- [x] 4.2 Add an "As built" note to step 8 in `.planning/effects-implementation-plan.md`. Verify it matches the spec

## 5. Verification

- [x] 5.1 Run `npm run lint`, `validate.mjs`, `check-constants.mjs`, `openspec validate effects-8-effects-outside-combat --strict` and all scratchpad checks; all pass

## 6. Manual testing (user, in the browser)

- [x] 6.1 On the set initiative screen, click and shift+click entities in the Overview: they're targeted and marked; the row buttons don't change the targets
- [x] 6.2 The Overview header shows Conditions, Reminders, Effects, Transform (one target), Hide/Show, Edit and Untarget, no out of turn damage; their shortcuts work; the Targeted pane in combat is unchanged
- [x] 6.3 Apply Invisible to an NPC before combat; it's there when combat starts, and the targets carried over
- [x] 6.4 5e campaign: Set surprised gives Surprised (icon on the avatar, chip); its first turn is restricted; it ends at the end of that turn; Remove surprised and S work
- [x] 6.5 5.5e campaign: a surprised NPC's initiative roll has Disadvantage; Surprised is removed when combat starts
- [ ] 6.6 An old encounter with a surprised reminder loads with the Surprised effect instead
- [x] 6.7 Run campaign screen: players show their effects as chips; details and Remove work; Remove of a Concentration ends the linked effects on other players
- [x] 6.8 Apply Aid to a player from its Effects button; it shows in the next encounter
- [x] 6.9 Apply Bless with another player as the caster and Concentration; that player gets the Concentration; a Poisoned-immune player isn't poisoned and a notice shows
- [x] 6.10 Apply Armor Class Bonus or Hit Point Maximum Bonus to a player on the run campaign screen: its AC or max HP changes, is marked, and the tooltip names the effect
- [x] 6.11 Apply a Hit Point Maximum Bonus that also heals (Aid) to a damaged player on the run campaign screen: max and current HP both go up; remove it: HP goes back within the maximum
- [x] 6.12 Click a player's hit points on the run campaign screen: damage goes through temporary HP first and resistances from effects; healing stops at the maximum; a concentrating player gets the tracker's Concentration save prompt with the DC (Succeeded keeps it, Failed ends it and its linked effects; no Roll); dropping to 0 ends it
- [x] 6.13 The tracker's damage and healing still work as before (temporary HP, transformed, overkill, death saves)
- [x] 6.14 The damage and heal popover and the Edit player drawer (from the run campaign screen) use the colored damage type selection; damage in the Edit drawer followed by Save keeps the damage
- [x] 6.15 In the Edit player drawer, add, change and remove AC and max HP bonuses with labels: they apply at once and stay after closing the drawer or pressing Save; in Group Health, add a max HP bonus with a label for several players; the tracker's bonuses drawer still works
- [x] 6.16 Click a player's AC on the run campaign screen: the drawer shows its AC, Shield of Faith if applied, and its manual bonuses; adding, changing and removing a bonus updates the AC right away
- [x] 6.17 Edit player Override: a Cur HP above the maximum with bonuses and effects is saved as that maximum; one within it (also above the base max) is kept; raising only Max HP raises Cur HP with it
