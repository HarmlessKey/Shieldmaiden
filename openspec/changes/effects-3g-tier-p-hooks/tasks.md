## 1. Data

- [x] 1.1 Add the SRD test effects to both editions, following each edition's SRD text (spec effects-srd-data; design decision 7): Death Ward, Uncanny Dodge, Evasion, Reliable Talent, Lucky/Luck, Undead Fortitude, and Acid Absorption only where that SRD has it. Check 5.5e Evasion's Incapacitated condition against `conditionState`. Verify that `validate.mjs` passes.

## 2. Pure helpers

- [x] 2.1 `damageModifiers` and `applyDamageModifiers` (decisions 1 and 2). Verify in the scratchpad with the real SRD data:
  - 5.5e Resistance with and without a chosen type
  - reduce 7 fire by 3 → 4, not below 0, spread over two fire parts
  - halve then resist: 15 slashing → 7 → 3
  - negate
  - Evasion: Dex save success → 0, failure → half; a Con save is unchanged
  - Absorb: 10 acid → healing 10
  - Uncanny Dodge's can-see condition named in the notes
  - Warding Bond-style transfer → reminder only
- [x] 2.2 Drop to 1 selection (decision 3) as a pure helper. Verify in the scratchpad:
  - Death Ward matches any damage, with the effect consumed
  - Undead Fortitude matches slashing and not radiant. With an unknown damage type it applies and names "unless radiant".
  - its DC for 9 damage is 14

  Changed during apply: the critical hit exception isn't checked. The data has no field for it, only the description, so the prompt shows the description and the DM decides. See design decision 3.
- [x] 2.3 `roll_floor` and `reroll` in `rollModifiers` / `rollPlan` (decision 4). Verify in the scratchpad:
  - Reliable Talent on a skill roll gives a floor of 10, and nothing on a save
  - two floors → the highest
  - Luck on a save gives a reroll with condition "natural 1"
  - existing roll modifier suites (test-3c1, test-3c2, test-3b) still pass
- [x] 2.4 `extraActions` and `effectReminders` (decision 5). Verify in the scratchpad:
  - Haste → extra_action with its allowed actions
  - a `compel` sub-effect → a reminder line
  - Slow's restriction without `limit` → no reminder

## 3. Store and rolls

- [x] 3.1 Store getters `damage_modifiers`, `extra_actions` and `effect_reminders` (decisions 5 and 6). Verify by reading that they use effective entities, like `restrictions`.
- [x] 3.2 `rollD`: the floor with its note, and `natural` kept (decision 4). Verify with a scratchpad roll that a die of 7 with a floor of 10 gives throwsTotal 10 and the note. Verify that calls without extras are unchanged.
- [x] 3.3 `rollD` reroll offers: toast buttons, and keep new/higher/lower (decision 4). Verify by reading against "Rerolls are offered, not applied": natural 1 only on a 1, consume on use, no offers on the reroll itself.

  Also done:
  - Verified in the scratchpad (`test-3g-roll.mjs`).
  - Natural 1/20 checks (crit, auto hit/miss, roll triggers) use the rolled die (`natural`), not the floored `throwsTotal`.
  - Target saves in the roll dialog show the roll's notes, so floors and reroll offers appear there.
  - `natural` and `rerolls` aren't shared to the live view.
  - The roll dialog shows reroll offers as notes only. Rerolling a to-hit there could change a critical hit after the damage was rolled. The spec was corrected; it had wrongly said the to-hit die could be clicked.
- [x] 3.4 Drop to 1 in `isDamage`, the `drop_to_one` prompt in the store and notifier, and failure → 0 HP + `on_zero_hp` (decision 3). Verify by reading against "Drop to 1 instead of 0": no `on_zero_hp`, no massive-damage death or stable checks while held at 1.

## 4. Display

- [x] 4.1 Roll dialog: toggles per target with rolled reductions, Evasion, Absorb, reminders and reroll notes, through `applyDamageModifiers` in `totalValue` / `apply` (decision 2). Verify by reading against the damage-modifier scenarios, and that each Vue option appears once.
- [x] 4.2 Manual damage toggles and Absorb in `actions/Manual.vue` and `legacy/actions/custom/Manual.vue` (decision 2). Verify by reading against "Manual damage", and that each Vue option appears once.
- [x] 4.3 `AttackReminders.vue`: extra-action chips after the restrictions, and effect reminders in the reminders chip (decision 5). Verify by reading against the modified details bar requirement.

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify there are no new errors
- [x] 5.2 Run `openspec validate effects-3g-tier-p-hooks --strict` and verify it passes
- [ ] 5.3 Ask the user to verify in the running app:
  - **Resistance (5.5e, fire):** a fire attack shows the toggle, off by default. Switching it on rolls 1d4 and lowers the damage; switching it off restores it.
  - **Manual fire damage** (actor panel, top bar button, legacy panel): applying asks "Damage modifiers" with a checkbox per toggle, unchecked. Checking Resistance rolls 1d4, lowers the damage and names it in a toast. Cancel applies nothing and keeps the value. Without matching toggles nothing is asked.
  - **Uncanny Dodge:** halves the damage before resistance
  - **Evasion:** a Fireball's Dex save gives 0 on a success and half on a failure, with Evasion named
  - **Acid Absorption:** acid damage heals the golem
  - **Death Ward:** lethal damage leaves the player at 1 with a notice, and Death Ward ends
  - **Undead Fortitude:** lethal slashing holds the zombie at 1 and prompts the save (DC 5 + damage); a failure drops it to 0. Radiant damage drops it to 0 with no prompt.
  - **Reliable Talent:** a low skill die counts as 10, named in the toast
  - **Luck:** a natural 1 on a card save shows Reroll (Luck), which rolls again; no button without a 1. In the roll dialog, a natural 1 to-hit shows the note.
  - **Haste:** the details bar shows "Extra action" with the allowed actions

  Record the outcome here
- [ ] 5.4 After archiving, mark 3g done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order). Verify that the plan shows it.
