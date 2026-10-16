# Generic NotEnoughSlotsError

## Problem
"Not enough slots" is thrown as a bare string in 7 Vuex modules (`campaigns`, `characters`, `encounters`, `items`, `npcs`, `players`, `reminders`) and *returned* as a string in `spells.add_spell`. The spells variant is a bug: callers treat the return value as the new spell's key.

## Solution
- New file `src/utils/errors.js` exporting `NotEnoughSlotsError extends Error` (message `"Not enough slots"`, `name = "NotEnoughSlotsError"`), so callers can use `instanceof` instead of string matching.
- Replace every `throw "Not enough slots"` with `throw new NotEnoughSlotsError()`.
- `spells.add_spell` throws the error instead of returning the string.

## Out of scope
No caller currently matches on the message, so no handler changes are needed.
