## Why

Reminders are tied to one entity and to four fixed triggers (start or end of its turn, damage,
a round countdown), and they live apart from the effects' trigger bus. A DM can't say "round 3:
the boss changes tactics" or "every 2 rounds: the lair acts", and a reminder can't do anything
but show text. Effects now cover what the premade reminders did (Concentration, Reaction Used,
Surprised), so reminders can become what their name says: notes for the DM that come up at
the right moment in the encounter. Plan step 9 ([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
"9. Encounter reminders on triggers"). Step 10 (setting them from the edit encounter screen)
builds on it.

## What Changes

- **One reminder system on the encounter.** Reminders are stored on the encounter, each with a
  title, text, color, a trigger, once or repeating, and optionally an effect to offer. A
  reminder can be about the encounter ("round 3") or about one entity (its turn, its defeat).
- **Triggers:**
  - encounter rounds: when combat starts, at the start of round N, every N rounds (from round M)
  - entity turns: the start or end of a chosen entity's turn, optionally only in round N
  - entity defeated or removed: an NPC drops to 0 hit points, a player is marked dead, or the
    entity is set inactive or removed from the encounter
- **Prompt when it fires:** the tracker shows a reminder prompt like the effect prompts, with
  the title and text (variables filled in). A one-shot reminder is done after it fires; a
  repeating one has Keep and Remove. A reminder with an effect offers **Apply <effect>**, which
  opens the Effects drawer's apply form for that effect, for the reminder's entity or the
  targets the DM picks (everyone, or the current targets).
- **Setting reminders in the tracker:** two buttons open the Reminders drawer, for the targeted
  entities (the targets' option, as now) or for the encounter (a button in the encounter
  progress bar). The drawer lists those reminders on top, to edit, re-arm or remove, with a form
  below to add one. Entity reminders show as chips on the entity, as now.
- **Personal reminders** under My content keep working with the new form (new triggers, repeat,
  an optional effect; old ones open in the new shape). The tracker doesn't offer them: reminders
  are quick notes added in the drawer itself (changed at apply, user request).
- **Legacy entity reminders convert on load**, as Surprised did in step 8:
  - start/end of turn: the entity's turn trigger; "remove on trigger" becomes once, "notify"
    becomes repeating
  - timed (N rounds left): the start of the entity's turn in the round it would have ended
  - **BREAKING:** reminders with the "damage" trigger are dropped, and so are the premade
    "Concentrating" and "Reaction used" reminders (effects cover them)
- **Retired:** the premade "Concentrating" and "Reaction used" reminders, the
  `remindersMixin` turn and damage checks, and the timed countdown.
- **Reset** keeps an encounter's reminders and clears what fired, so prepared reminders run
  again; it no longer deletes entity reminders.

## Capabilities

### New Capabilities
- `encounter-reminders`: reminders stored on the encounter, their triggers and repeat, the
  reminder prompt with its effect, setting and managing them in the tracker's Reminders drawer,
  the reminder form (also for personal reminders), and the conversion of legacy entity
  reminders.

### Modified Capabilities
- `effects-display`: reminder chips come from the encounter's reminders for that entity (not
  from `entity.reminders`).
- `effects-reaction-used`: the legacy actions panel's "Reaction used" warning no longer checks a
  legacy reminder (retired).
- `effects-instance-storage`: resetting an encounter keeps its reminders and clears their fired
  state instead of removing entity reminders.

## Impact

- **Store:** `src/store/modules/runEncounter.js` (reminders state, load and conversion,
  `fire_reminders` from `fire_turn_triggers`, round changes and defeat/removal, reset),
  `src/store/modules/userContent/encounters.js` (encounter reminder writes),
  `src/store/modules/userContent/reminders.js` (template shape).
- **Pure helpers:** reminder matching and legacy conversion in a new `src/utils/reminderFunctions.js`.
- **UI:** `components/drawers/encounter/reminders/TargetReminders.vue` and `Reminder.vue`,
  `components/combat/Reminders.vue` (chips), `components/ReminderForm.vue`,
  `views/UserContent/Reminders/`, `components/combat/EffectTriggerNotifier.vue` (reminder
  prompt), `components/drawers/encounter/Effects.vue` (opened for one effect).
- **Removed:** `remindersMixin` checks in `combat/top/index.vue`, `top/EncounterProgress.vue`,
  `mobile/Current.vue`, `legacy/Current.vue`, `legacy/Turns.vue` and `mixins/HpManipulations.js`;
  the premade list in `mixins/reminders.js`.
- **Firebase rules** (`firebase_rules/firebase-rules.json`): an encounter-level `reminders`
  node; the entity `reminders` node stays only so old data can be read and cleared.
- **Docs:** a reminders section in `src/docs/`, and the plan's step 9 note.
- No changes to effects or their instances.
