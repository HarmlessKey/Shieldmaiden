# Compendium Search: Enter + Debounce

## Problem

On the compendium overview pages (`/compendium/spells`, `/compendium/monsters`,
`/compendium/items`, `/compendium/conditions`) the search only runs when the user clicks the
search button:

1. **Enter doesn't search.** `Spells.vue` has no `@keyup.enter` handler at all. `Monsters.vue`,
   `Items.vue` and `Conditions.vue` do, but they're unreliable: the `q-input` carries
   `debounce="300"`, which delays the **model update**, not the search. Pressing Enter within
   300ms of the last keystroke fires the search with a stale `search` value — so the last
   characters typed are missing from the query.
2. **No search-as-you-type.** Typing a few letters and waiting does nothing; the request only
   goes out on an explicit click.

The Rules page (`Compendium/Rules.vue`) is out of scope — it renders `CheatSheet`, which
filters an already-loaded list client-side and is instant.

## Solution

Move the debounce out of the `q-input` (where it only delays `v-model`) and into JS, so the
component controls *when the search request fires* and can flush it on demand.

New mixin `src/mixins/debouncedSearch.js`:

- `watch: search` — schedules `runSearch()` after the debounce delay, resetting the timer on
  every keystroke.
- `searchNow()` — cancels the pending timer and searches immediately. Used for Enter and for
  the search button, so an explicit action never leaves a duplicate request queued behind it.
- Clears the timer on `beforeDestroy`.

Each view implements `runSearch()`, delegating to its existing filter method
(`filterSpells` / `filterMonsters` / `filter`), which already resets `pagination.page` and
rebuilds `query`.

Per view (Spells, Monsters, Items, Conditions):

- Drop `debounce="300"` from the `q-input` so `v-model` updates on every keystroke.
- `@keyup.enter="searchNow"`.
- Drop the `@clear` handlers — clearing sets the model to `null`, which the watcher already
  picks up.
- Point the search button at `searchNow`.

## Debounce delay

**300ms**, not 500ms. 300ms is the common search-as-you-type default: long enough that a
normal typing burst produces one request, short enough that the results feel like they follow
the keystrokes. It also matches the value already used on these inputs (and the other list
views in the app), so the perceived responsiveness doesn't change — only *what* is debounced.
The delay lives in one constant in the mixin, so it's a one-line change if we want to tune it.
