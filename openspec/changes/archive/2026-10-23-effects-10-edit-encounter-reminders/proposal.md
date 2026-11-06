## Why

Step 9 put reminders on the encounter ("Round 3: the boss may flee"), but they can only be
set in the tracker, while most of them are prepared together with the encounter. Step 10 of
the [effects implementation plan](../../../.planning/effects-implementation-plan.md) lets the
DM set them while building the encounter, on the edit encounter screen.

## What Changes

- The edit encounter screen gets a **Reminders** tab next to Entities, Atmosphere, Loot and
  XP. It lists the encounter's reminders on top: the encounter's own first, then those about
  a creature, grouped by creature. Each shows its trigger in words and what it offers, with
  edit, re-arm (when done) and remove. Below the list is a form to add one.
- The form is step 9's reminder form, with a **For** choice: **The encounter** or one of the
  encounter's creatures (decided at proposal). The triggers and the offers follow that choice
  as in the tracker: damage only for the encounter. Effects to offer come from the SRD of the
  campaign's edition and the user's custom effects. Targets are chosen when the prompt fires,
  as in step 9.
- Editing a reminder loads it into the same form, which then saves it instead of adding it.
- "Start of its turn in N rounds" counts from the encounter's current round, 0 before combat.
- Reminders set here are stored the same way as the tracker's (`encounter.reminders/<id>`),
  so the tracker and test runs fire them and list them in their drawer.
- Removing a creature from the encounter on the edit screen also removes its reminders. This
  also applies to entities removed as ghosts when an encounter loads.
- The demo encounter builder doesn't show the tab (decided at proposal).
- `src/docs/effects.md`: the encounter reminders section says they can be prepared on the
  edit encounter screen.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `encounter-reminders`: reminders can be set, edited, re-armed and removed on the edit
  encounter screen, for the encounter or for one of its creatures. Removing an entity from the
  encounter outside combat removes its reminders.

## Impact

- `src/components/encounters/index.vue`: the Reminders tab, not in the demo.
- A new `src/components/encounters/Reminders.vue`: the list and the form.
- `src/components/ReminderForm.vue`: used as is. The **For** choice belongs to the tab.
- `src/store/modules/userContent/encounters.js`:
  - an id for new reminders in `save_encounter_reminder`
  - removing the entity's reminders in `delete_entity`
  - the stale "Sets reminders on an entity" doc comment removed
- `src/utils/reminderFunctions.js`: reused (`cleanReminder`, `reminderFromTemplate`,
  `triggerText`, `damageText`, `reminderColor`, `fillVariables`).
- The Firebase rules don't change: the shape is step 9's.
- `src/docs/effects.md`.
