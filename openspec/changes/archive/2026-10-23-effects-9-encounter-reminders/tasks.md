## 1. Data and pure functions

- [x] 1.1 Firebase rules (`firebase_rules/firebase-rules.json`): an encounter-level `reminders/$id` node with the design 1 shape (design 10); the entity `reminders` rule stays. Verify with a `check-reminder-rules` scratchpad check of sample reminders (each trigger type, effect, variables, a bad type and an extra field rejected) against the rule regexes
- [x] 1.2 `src/utils/reminderFunctions.js` (design 2): `remindersToFire`, `triggerText`, `fillVariables` (moved from `remindersMixin.replaceReminderVariables`), `convertLegacyReminder`, `reminderFromTemplate`. Verify with a `check-reminder-functions` scratchpad check: combat start, round 3, every 2 from 1 (rounds 1, 3, 5 only), turn start/end with and without a round, defeated, fired once reminders skipped, repeating kept; legacy start/end/notify/remove, timed 3 rounds left in round 2 → round 5, damage / concentration / reaction dropped; old templates mapped and a damage template without a trigger

## 2. Store

- [x] 2.1 `runEncounter`: reminders state from `encounter.reminders`, and `set_encounter_reminder` / `remove_encounter_reminder` / `rearm_encounter_reminder` writing to the encounter (demo and test in memory only); `encounters/save_encounter_reminder` for the writes. Verify `npm run lint` and a scratchpad check on a mock context (set, edit, re-arm, remove; nothing written in demo)
- [x] 2.2 `fire_reminders` (design 3): marks once reminders fired and queues `kind: "reminder"` prompts; called from `fire_turn_triggers` (combat start, round start, turn end/start), from `fire_trigger` on `on_zero_hp` for NPCs, and from `set_dead`, `set_active` (inactive) and `remove_entity`. Verify with a scratchpad check on a mock context: a round 3 reminder fires once as round 3 starts and not again after going back and forward; a turn reminder fires for its entity only; defeat fires on 0 HP for an NPC and on removal; prompts carry the entity's name
- [x] 2.3 `convert_legacy_reminders` after `convert_legacy_surprised` in `init_Encounter` (design 8), and `reset_encounter` keeping reminders and clearing `fired` (design 9). Verify with a scratchpad check: an encounter with start/end/timed/damage/concentration reminders on an NPC and a player converts as the spec says and the entity `reminders` are removed; demo converts in memory, test doesn't; reset clears `fired` and keeps the reminders

## 3. Tracker UI

- [x] 3.1 The reminder prompt in `EffectTriggerNotifier.vue` (design 4): title, filled-in text, Dismiss or Keep/Remove, Apply <effect> when its effect resolves (else named without the button). Verify `npm run lint`
- [x] 3.2 The Effects drawer opened for one effect (design 5): `data: { keys, entry }` opens that effect's apply form; for an encounter reminder, the Everyone in combat / Current targets choice. Verify `npm run lint`, and that the drawer opened with an array of keys works as before
- [x] 3.3 `ReminderForm.vue` with the new triggers (round triggers for the encounter, turn/defeat for entities), repeat and an optional effect (SRD and custom); personal reminders (`views/UserContent/Reminders`) save the new shape and old ones still open. Verify `npm run lint`
- [x] 3.4 The Reminders drawer (`TargetReminders.vue`, design 6): for the targets or the encounter (decided by the button that opens it), the added reminders on top with trigger text, done marks, edit, re-arm and remove, and the form below to add one (one reminder per targeted entity); no personal reminders or tabs (user request at apply); `Reminder.vue` for one reminder. Verify `npm run lint`
- [x] 3.5 Reminder chips (`combat/Reminders.vue` and the entity effects row) from the encounter's reminders about the entity that aren't done, opening `Reminder.vue`. Verify `npm run lint`

## 4. Retire the old reminders

- [x] 4.1 Remove the `remindersMixin` turn, timer and damage checks from `combat/top/index.vue`, `top/EncounterProgress.vue`, `mobile/Current.vue`, `legacy/Current.vue`, `legacy/Turns.vue` and `mixins/HpManipulations.js`; remove the premade "Concentrating" and "Reaction used" and anything else in `mixins/reminders.js` no longer used (or the file); the legacy actions panel's "Reaction used" warning only checks the effect; `set_targetReminder` and the entity `reminders` writes go. Verify `npm run lint` and a grep that nothing reads `entity.reminders` except the conversion and reset

## 5. Documentation and plan

- [x] 5.1 A reminders section in `src/docs/` (or the effects page): triggers, once/repeating, the prompt and its effect, the drawer, personal reminders, what happened to old reminders ("On damage taken" isn't a trigger any more). Verify every label it names matches the screens
- [x] 5.2 An "As built" note on step 9 in `.planning/effects-implementation-plan.md`. Verify it matches the spec

## 6. Verification

- [x] 6.1 Run `npm run lint`, `validate.mjs`, `check-constants.mjs`, `openspec validate effects-9-encounter-reminders --strict` and all scratchpad checks; all pass

## 7. Manual testing (user, in the browser)

- [x] 7.1 The encounter Reminders button sits between the progress bar and the turn buttons (also before combat) and opens the drawer for the encounter, without a choice; the targets' Reminders option opens it for the targets. From the encounter button, set "Start of round 3: the boss may flee" (once); it fires as round 3 starts, then shows as done; re-arm works
- [x] 7.2 Set a repeating "every 2 rounds from round 1" reminder: it fires in rounds 1, 3 and 5; Remove in its prompt removes it
- [x] 7.3 Target two goblins, open Reminders and add one at the start of their turn: both are listed above the form, each goblin gets a chip and its own prompt at its turn; clicking a chip opens the reminder; the form is empty again for the next one
- [x] 7.4 A reminder at the end of a turn in round 2 fires only in round 2
- [x] 7.5 A "Defeated" reminder on an NPC fires when it drops to 0 HP, and on another NPC when it's removed from the encounter
- [x] 7.6 "Round 5: sandstorm" with Blinded: Apply Blinded opens the apply form with everyone in combat; applying blinds them
- [x] 7.7 Going back a turn or round fires nothing, and a fired once reminder doesn't fire again when moving forward
- [ ] 7.8 An encounter with old reminders (start of turn, timed, damage, Concentrating) loads with them converted and the damage and Concentrating ones gone
- [x] 7.9 Under My content, Reminders shows the deprecation notice (with the Effects link), view and delete buttons and no New reminder button; an old personal reminder (start of own turn, notify, a variable) opens in the form with every field disabled (no color picker, no variable buttons) and no save button; /content/reminders/add-reminder shows only the notice; the tracker's drawer doesn't offer personal reminders
- [x] 7.10 Reset the encounter: its reminders remain and fire again
- [x] 7.11 The legacy layout and mobile view show the reminder prompts too, and the old reminder notifications don't appear anywhere
- [x] 7.12 Removing an NPC with reminders from the encounter fires its "defeated" reminder and removes its other reminders; setting an NPC inactive on the set initiative screen fires nothing
- [x] 7.13 A reminder with the timer trigger ("start of its turn in 3 rounds") set in round 2 fires at the start of its turn in round 5; editing a reminder from its chip saves the changes
- [x] 7.14 A reminder with damage (dice, die, fixed value, damage type): the list shows it; the prompt names it; a creature's reminder doesn't offer Damage in its form; on the encounter, only Damage targets, which opens one roll for each target (no targets: a message); switching the form between effect and damage keeps only one
- [x] 7.15 The reminder form's color is set like an NPC's color label (the field with the palette picker); chips and the drawer's list show it; a converted old reminder keeps its old color; a personal reminder under My content shows its color
- [x] 7.16 The form has no Once / Every time choice: "Start of round 2" fires once; "Every N rounds" with 1 from round 2 fires every round from 2; a turn reminder without a round fires every turn (Keep / Remove); editing a reminder's trigger changes whether it repeats
- [x] 7.17 "Burning ground": Every N rounds, 1, At turn 4, damage 1d10 fire: it comes up as the 4th turn of each round starts (before that creature's own reminders), listed as "Every round, turn 4", titled "Round N, turn 4: …"; with only 3 creatures left it comes up at the 3rd turn; Damage targets rolls it for the targets
