## 1. Service layer (`src/services/npcs.js`)

- [x] 1.1 Add `isConnected()`: read `.info/connected` with `once("value")` and return `snapshot.val() === true`
- [x] 1.2 Add `getNpcFromServer(uid, id, timeout = 8000)`: `once("value")` on `npcs/<uid>/<id>`, raced against a timeout that rejects. Return the snapshot so callers can use `exists()`
- [x] 1.3 Add `searchNpcExists(uid, id)`: server read of `search_npcs/<uid>/results/<id>`, returning `snapshot.exists()`
- [x] 1.4 Add `removeSearchNpc(uid, id)`: awaited `remove()` of `search_npcs/<uid>/results/<id>` only
- [x] 1.5 Rewrite `deleteNpc` as one awaited `db.ref().update({ "npcs/<uid>/<id>": null, "search_npcs/<uid>/results/<id>": null })`. Keep the storage image delete as a separate best-effort call
- [x] 1.6 Rewrite both branches of `editNpc` (with and without a blob) to write `npcs/<uid>/<id>` and `search_npcs/<uid>/results/<id>` in one `db.ref().update()`. Keep the image upload and delete behaviour as it is now

## 2. Shared messages (`src/utils/errors.js`)

- [x] 2.1 Export `GHOST_NPC_MESSAGE` ("You found a ghost in the machine! This NPC doesn't exist anymore and has been removed from your list.") and `NPC_UNAVAILABLE_MESSAGE` ("This NPC could not be loaded. Please try again later.")
- [x] 2.2 Add `NOTIFY_DURATION` (`SHORT` 2000, `MEDIUM` 4000, `LONG` 6000, `VERY_LONG` 8000) to `src/utils/generalConstants.js`, and use `NOTIFY_DURATION.MEDIUM` with short titles ("Ghost NPC" and "Load failed") in `notifyUnresolvedNpc`

## 3. Store (`src/store/modules/userContent/npcs.js`)

- [x] 3.1 Add the internal `check_ghost_npc({ uid, id })` action, implementing safeguards 1–8 from design.md in order. It returns `{ status: "exists", npc }`, `{ status: "ghost" }` or `{ status: "unknown" }`, and never throws
- [x] 3.2 On `exists`: run the NPC through the same spell-cache handling as `get_npc` (`cacheNpcSpell`), then `SET_CACHED_NPC`, and return it
- [x] 3.3 On `ghost` after a successful removal: ensure `state.npcs` is loaded (`get_npcs`), then `REMOVE_NPC`, `REMOVE_CACHED_NPC` and `update_npc_count`
- [x] 3.4 Log confirmed ghosts and unknown results with `console.warn`, including `uid`, `id` and the reason
- [x] 3.5 Add `resolve_npc({ uid, id })`:
  - call `get_npc`
  - return `{ status: "exists", npc }` when it's non-null, without further reads
  - otherwise return the result of `check_ghost_npc`
  - catch errors from `get_npc` and return `{ status: "unknown" }`
- [x] 3.6 `delete_npc`: use `resolve_npc` instead of `get_npc`.
  - On `ghost`, return the status without deleting anything else.
  - On `unknown`, throw or return so the view can show the error.
  - Never dereference a `null` NPC.

## 4. Entry points and loading state

Each entry point starts its loading state just before `resolve_npc` and clears it in a `finally`, as described in design decision 5.

- [x] 4.1 `EditNpc.vue` `mounted`:
  - replace `get_npc` with `resolve_npc`, inside the existing `loading = true` block
  - `exists`: continue as today and set `loading = false`
  - `ghost`: show the warning and `$router.replace("/content/npcs")`
  - `unknown`: show the unavailable error and `$router.replace("/content/npcs")`
  - never clear `loading` for an unresolved id
- [x] 4.2 `Entities.vue`:
  - in `add` (custom branch), replace `get_npc` with `resolve_npc` and return the status
  - show the warning or error and skip `add_npc_encounter` on `ghost` or `unknown`
  - in `multi_add`, `break` on anything other than `exists`
- [x] 4.3 `Entities.vue`:
  - add `resolving_npcs: {}` to the existing `data`
  - set `resolving_npcs[id]` (via `$set`) for the whole `multi_add` run and clear it in `finally`
  - disable both add buttons for that row while it's set and swap their icon for a spinner
  - apply this to both NPC tables, the one around line 183 and the one around line 333
- [x] 4.4 `CopyContent.vue` `copy` (`type === "monster"`, `copy_resource === "custom"`, not `returnId`):
  - replace `get_npc` with `resolve_npc`
  - on `ghost`, show the warning, remove the id from `searchResults` and don't emit
  - on `unknown`, show the error and don't emit
- [x] 4.5 `CopyContent.vue`:
  - add `resolving_id: null` to the existing `data`, set it for the duration of `copy` and clear it in `finally`
  - while it's set, disable all copy buttons and show a spinner on the clicked one
  - expose `resolving` in the `action` slot scope
- [x] 4.6 `Npcs.vue` `deleteNpc`:
  - add `deleting_npcs: {}` to the existing `data`
  - set it for the key while `delete_npc` runs and clear it in `finally`
  - disable that row's delete buttons and show a spinner while it's set
  - show the ghost warning when `delete_npc` reports `ghost`, and the error on `unknown`
- [x] 4.7 Leave `Npcs.vue` `viewNpc`, `EditPlayer.vue`, `AddNpc.vue` and all background `get_npc` callers unchanged. Check that none of them were switched to `resolve_npc`

## 5. Verification

- [x] 5.1 Run `npm run lint` and fix any issues introduced
- [x] 5.2 On a test account, create a ghost by deleting `npcs/<uid>/<id>` in the Firebase console while keeping its search entry. Then verify each entry point:
  - Edit NPC
  - encounter builder, with both add buttons and a quantity above 1
  - in-combat Add NPC drawer
  - Edit NPC copy-monster and create dialogs
  - Edit Player **Add companion**
  - delete from the NPC list

  For each, check the loading state lasts for the whole check, the warning shows once, the search entry is removed, and the count is updated
- [x] 5.3 Open existing NPCs at every entry point and confirm the loading state and timing are unchanged, and that no extra reads happen (DevTools network/WebSocket frames)
- [x] 5.4 With DevTools set to offline, open a ghost and confirm the "could not be loaded" error, that the loading state clears or Edit NPC navigates away, and that the search entry is **not** removed
- [x] 5.5 Open a real NPC whose `null` is in the Vuex cache (create it in another tab after a failed lookup) and confirm it loads without the 1.5 s delay and nothing is removed
- [x] 5.6 Open another user's companion through the edit-companion route with a missing NPC and confirm nothing is removed
- [x] 5.7 Run an encounter that references a ghost NPC and confirm no ghost check runs and nothing is removed
- [x] 5.8 Regression-test editing (with and without an image upload) and deleting NPCs against the production security rules, so the multi-path updates are accepted
- [x] 5.9 Confirm the 2 known production ghosts (`UfKEEPhkIjgNlN70NAAbBaLbI3h2` and `rmhyfWXSycRZXf7zfYSlcvpJ2rd2`, key `Not enough slots`) would be classified as ghosts. Test this with a copy of the data, not production

## 6. Wrap up

- [x] 6.1 Create `feature/clean-dangling-search-npcs` from `develop`, commit and push
- [x] 6.2 Open a PR `feature/clean-dangling-search-npcs` → `develop` (#365)
