## 1. Data and helpers

- [x] 1.1 Charmed's attack restriction condition in both editions (design decision 6). Verify that `validate.mjs` passes
- [x] 1.2 `restrictions`, `deathOutcome`, `isConcentrationBreak` (decisions 1, 4 and 5). Verify in the scratchpad with the real SRD data:
  - 5.5e Incapacitated's kinds
  - Stunned (named Stunned)
  - Haste ignored (triggered)
  - Charmed with the charmer as counterpart (applies), another counterpart (not), and no counterpart (possible, caster named)
  - Frightened `movement` with its description
  - Exhaustion 5 → no death, 6 → death
  - both Concentration outcomes: save → not a break, no save → break

## 2. Store and rolls

- [x] 2.1 Store getter `restrictions`, and the confirmation in `roll_action` with `doRollAction` (decision 2). Verify by reading against "Restricted rolls are confirmed": Stunned, slowed out of turn, Charmed against the charmer and someone else, and Cancel spending nothing and showing no Reaction Used prompt. Verify the kind/category matching in the scratchpad with a small pure function if it's split out.
- [x] 2.2 The death prompt: `apply_effect` (new instance and level change) and `EffectTriggerNotifier` (Mark dead / Dismiss) (decision 4). Verify by reading against "Death outcomes are offered with a prompt"
- [x] 2.3 `fire_trigger`: save-less `break_concentration` ends the Concentration with the reason (decision 5). Verify by reading against "Concentration breaks by itself on its trigger", and that the Concentration save prompt (3c1) is unchanged

- [x] 2.4 (Added at the user's request) Manual damage and healing are confirmed too: a shared `restrictions` mixin used by `roll_action` and both Manual components, with "Apply anyway", and the attack check for damage only. Verify by reading against the manual scenarios of "Restricted rolls are confirmed", and that each Vue option appears once.

- [x] 2.5 (Found during testing) Mark dead also sets players and companions to 0 HP (and 0 temp HP) before `set_dead`. Dead in the tracker always meant 0 HP, as with death saves and revive to 1, so the health bar kept showing. It fires `on_zero_hp` so Concentration breaks. Verify by reading the dead-player views (`DeathSaves`, `TargetEntity`), which key on `curHp === 0`. The targets overview (`TargetEntity`) also showed the health bar and HP for any dead player. It now shows a red "Dead" label in their place.

- [x] 2.6 (Found during testing) Damage that drops a concentrating creature to 0 HP showed the Concentration save prompt as well as the break notice. The damage event now carries `dropsToZero`, and `fire_trigger` asks for no Concentration save when it's set.

## 3. Display

- [x] 3.1 Restriction chips in `AttackReminders.vue`, after Reaction Used (decision 3). Verify by reading against "Restrictions are shown in the details bar" and the modified details bar requirement. Each Vue option appears once.

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors
- [x] 4.2 Run `openspec validate effects-3e-restrictions-outcomes --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app:
  - **Stunned goblin:** the details bar shows its action/reaction/speech chips. Rolling its Scimitar asks to confirm (naming Stunned). Cancel rolls nothing; Roll anyway rolls.
  - **Slow:** an out-of-turn attack of a slowed creature asks about its reaction
  - **Charmed (charmer Lyra):** an attack on Lyra asks to confirm, and an attack on someone else doesn't. The chip reads "Can't attack Lyra".
  - **Frightened / Prone:** "Can't move" chip with the effect in the tooltip
  - **Exhaustion 6 on a player:** the prompt "… — dies", and Mark dead puts the player at 0 HP and marks them dead: no health bar or HP, the dead view instead. If they were concentrating, Concentration ends. On an NPC, Mark dead sets 0 HP.
  - **Concentration at 0 HP:** a concentrating player dropping to 0 HP loses Concentration (notice), and a linked Bless ends
  - **No restrictions:** normal rolls aren't asked about
  - **Manual:** manual damage by a Stunned goblin asks "Apply anyway" (from the actor panel, the top bar button and the legacy drawer). Cancel keeps the value. Manual damage to the charmer asks; healing doesn't.

  Record the outcome here

  **Outcome (2026-10-06):** the user tested every item and found no further issues. Testing found four issues, all fixed:
  - manual damage and healing are confirmed too (2.4)
  - Mark dead sets 0 HP (2.5)
  - the targets overview shows dead players as "Dead" (2.5)
  - no Concentration save prompt when damage drops the holder to 0 HP (2.6)
- [x] 4.4 After archiving, mark 3e done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order). Verify the plan shows it
