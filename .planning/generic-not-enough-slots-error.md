# Generic NotEnoughSlotsError

## Problem
"Not enough slots" is thrown as a bare string in 7 Vuex modules (`campaigns`, `characters`, `encounters`, `items`, `npcs`, `players`, `reminders`) and *returned* as a string in `spells.add_spell`. The spells variant is a bug: callers treat the return value as the new spell's key.

## Solution
- New file `src/utils/errors.js` exporting `NotEnoughSlotsError extends Error` (message `"Not enough slots"`, `name = "NotEnoughSlotsError"`), so callers can use `instanceof` instead of string matching.
- Replace every `throw "Not enough slots"` with `throw new NotEnoughSlotsError()`.
- `spells.add_spell` throws the error instead of returning the string.

## User-facing handling
Callers used to show a generic "Couldn't save …" (or nothing at all, for campaigns and encounters). Each one now catches `NotEnoughSlotsError` and shows `NOT_ENOUGH_SLOTS_MESSAGE` (exported from `src/utils/errors.js`) with the title "No slots left":
- `EditNpc`, `EditSpell`, `EditReminder`, `EditItem`, `EditPlayer`, `CharacterBuilder`: before the generic error
- `Campaigns.vue`, `Encounters/index.vue`: new try/catch (previously unhandled); other errors are rethrown

## Out of scope
- `ImportUserContent` keeps its per-item `failed_imports` handling.
- Cleaning up the existing DB records stored under the key "Not enough slots" (caused by the old `return` instead of `throw` in `npcs.js` since 2023-04-14 and always in `spells.js`).
