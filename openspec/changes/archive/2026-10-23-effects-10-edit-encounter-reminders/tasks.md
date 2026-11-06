## 1. Store

- [x] 1.1 `encounters/save_encounter_reminder` creates an id when none is given and returns the id (design 2). Remove the stale "Sets reminders on an entity" doc comment above it. Verify with a `check-edit-reminders-store` scratchpad check on a mock context:
  - the write lands at `/reminders` under the new id and the cached encounter gets it
  - a given id is kept
  - nothing is written without a user
- [x] 1.2 `encounters/delete_entity` removes the deleted entity's reminders from the encounter and the cache, leaving the encounter's own and other entities' reminders (design 4). Verify in the same scratchpad check:
  - removing the dragon drops its two reminders and keeps "Boss may flee" and a goblin's
  - an entity without reminders writes no reminder update
  - a ghost removal through `get_encounter` drops the ghost's reminder

## 2. Edit encounter screen

- [x] 2.1 New `src/components/encounters/Reminders.vue`, the list (design 1, 3, 6). Verify `npm run lint`. It shows:
  - the encounter's own reminders first, then per creature by name ("Unknown" for a missing key)
  - each one's title, trigger text, "every time", the effect or damage, and done
  - edit, re-arm (done only) and remove buttons
- [x] 2.2 The form in the same component (design 3). Verify `npm run lint` and a scratchpad check of the subject switch and the add/save payloads (`reminderFromTemplate` with round 0 turning `in_rounds` 2 into round 2; an edit keeping its id and dropping `repeat`). The form:
  - a For select: The encounter, or the encounter's creatures by name, players named from `campaign_players`
  - `ReminderForm` with the scope from For, the campaign's edition and no variables
  - switching For drops a trigger that doesn't fit and drops damage for a creature, and remounts the form
  - Add, then empty for the next one
  - edit loads a reminder with Save and Cancel
  - the list updates after each save (check the prop is the cached encounter, else update it locally)
- [x] 2.3 The Reminders tab in `src/components/encounters/index.vue`: bell icon, after Loot and before XP, not in the demo, passing `encounter`, `campaign` and `campaign_players`. Verify `npm run lint` and that the demo's `tabs` don't include it

## 3. Documentation and plan

- [x] 3.1 `src/docs/effects.md`, Encounter reminders: they can be prepared on the edit encounter screen's Reminders tab, for the encounter or a creature (For), and removing a creature there removes its reminders. Verify every label it names matches the tab
- [x] 3.2 An "As built" note on step 10 in `.planning/effects-implementation-plan.md`. Verify it matches the spec

## 4. Verification

- [x] 4.1 `npm run lint`, `openspec validate effects-10-edit-encounter-reminders --strict`, and the step 9 reminder scratchpad checks still pass
- [x] 4.2 Manual test by the user (no dev server or browser by Claude):
  - on the edit screen, add an encounter reminder and a creature reminder, edit one and remove one
  - remove a creature that has reminders
  - test-run the encounter: both reminders fire, and the tracker's drawer lists them
