## 1. Pure helpers

- [x] 1.1 `effectiveDefenses` (design decision 1). Verify in the scratchpad with the real 5e/5.5e Petrified and Heroism:
  - `all_damage` with `except_damage_types`
  - `bypass: ["magical"]` → `non_magical_*`, and silvered → reminder
  - a chosen damage type
  - the combine rules: immunity wins, resistance + vulnerability cancel
  - an unknown condition → not applied, reminder
  - the same definition twice
  - condition immunities, own and from effects
  - `sources`
- [x] 1.2 `getRequiredChoices`: a `damage_type` choice offers the sub-effect's `damage_types` (decision 5). Verify in the scratchpad that existing choices (Hex-style rolls, Guidance skills) are unchanged

## 2. Effective entity and damage

- [x] 2.1 `effectiveEntity` / `effective_entity` add the four lists, `stored` and `defense_sources` (decision 2). Verify in the scratchpad that a Petrified entity's effective lists hold every type and its stored lists are unchanged
- [x] 2.2 Readers
  - Fixed during testing: the roll dialog's defense snapshot is taken in `data()`, where the `roll` computed doesn't exist yet. It always came out empty and fell back to the raw target, so Petrified's resistance wasn't seen (found with a 5.5e goblin vs a Petrified player). It now reads the `value` prop.
  - Fixed during testing: the manual damage amount in the top bar's target (`top/Target.vue`, "Do N damage") and in the Targeted panel (`Targeted.vue` `calculateAmount`) used the raw entity, so it disagreed with the defense buttons. Both use the effective entity now, and the top bar's amount is a computed. (decision 3): the roll dialog's `resistances` from the effective target, both Manual components, `multipliers/Defenses.vue`. Verify by reading against "Damage uses the effective defenses" ("Petrified target in the roll dialog", "Manual damage", "DM override"), and with `calculateManualDamage` in the scratchpad on an effective entity. Each Vue option appears once.

## 3. Condition immunity

- [x] 3.1 `apply_effect` (decision 4): skip immune targets with a notice, and end covered conditions after an apply. Verify by reading against "Immune creatures aren't given the condition" and "Gaining an immunity ends the condition". Also check in the scratchpad (the lists come from `effectiveDefenses`) that a skeleton's own immunity and Heroism's are found.

## 4. Display and data

- [x] 4.1 `CardDetails.vue`: effective lists with marked effect entries (decision 3). Verify by reading against "Effect defenses are shown on the card". Each Vue option appears once.
- [x] 4.2 Stoneskin and Protection from Energy in both editions (decision 5). Verify that `validate.mjs` passes, and in the scratchpad that each resolves and gives the expected defenses

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-3d-defenses --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app:
  - **Petrified:** a goblin's slashing hit on a Petrified player shows R active and applies half. Turning R off applies full damage.
  - **Manual damage:** 10 fire to a creature with Protection from Energy (fire) gives 5, and its R button is active
  - **5e Stoneskin:** nonmagical slashing halved, magical slashing not
  - **Combine:** a fire-vulnerable creature with Protection from Energy (fire) takes normal fire damage
  - **Monster immunity:** Poisoned on a skeleton and a goblin poisons only the goblin, with the notice "Skeleton is immune to Poisoned"
  - **Effect immunity:** Frightened on a creature with Heroism isn't applied. Heroism on a Frightened creature ends Frightened ("immune to Frightened").
  - **Card:** a Petrified goblin's card lists all damage resistances (marked, tooltip "Petrified") and Poisoned under condition immunities

  Record the outcome here
  - 2026-10-05: user tested the whole 5.3 list in the app; no issues left. Fixed during testing (see 2.2): the roll dialog's defense snapshot, and the manual damage amount in the top bar and Targeted panel.

- [x] 5.4 After archiving, mark 3d done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order). Verify the plan shows it
