## Why

A user's NPC list (`search_npcs/<uid>/results`) can contain entries whose full NPC record (`npcs/<uid>/<id>`) no longer exists. These "ghost" NPCs show up in the list and in every NPC picker, but selecting one crashes the flow. `get_npc` resolves to `null`, and the callers dereference it straight away:

- **Edit NPC** (`EditNpc.vue` `mounted`) throws on `npc.name`, so the editor stays in its loading state.
- **Add to encounter** (`Entities.vue` `add`) throws on `npc_data.old`, so nothing is added and there's no feedback.
- **NPC picker** (`CopyContent.vue` `copy`) throws on `delete result._id`. This picker is used by the in-combat Add NPC drawer, Edit NPC's copy-monster and create dialogs, and Edit Player's Add companion dialog.
- **Delete from the NPC list** (`npcs.js` `delete_npc`) throws on `npc.player_id`, so the user can't even remove the ghost.

The "Not enough slots" bug (fixed in PR #364) left 2 known ghosts in production. Ghosts can also come from any write that updates one of the two paths but not the other. `deleteNpc` fires two independent, un-awaited removes, and `editNpc` writes the search entry before the NPC. So we need a long-term fix that heals ghosts wherever they come from, not a one-off DB cleanup.

## What Changes

- **`resolve_npc`:** entry points where a user picks one of their custom NPCs call a new `resolve_npc` action instead of `get_npc`. It returns the NPC exactly as today when it exists. Only when the fetch returns `null` does it run the ghost check, so the normal path has no extra reads or delay. Background NPC loading (encounters, difficulty, export, companions) keeps using `get_npc` and never runs the check.
- **Ghost check:** a strict check confirms an NPC is really gone before acting on it. The user must own it, the database must be connected, there must be a fresh server read (not the Vuex cache), any error aborts, and a second read after a short delay must also come back empty. If anything is uncertain, the result is "unknown" and nothing is removed.
- **Cleanup:** when an NPC is confirmed as a ghost, only its `search_npcs/<uid>/results/<id>` entry is removed. The store's NPC list, cache and NPC count are updated to match. The `npcs/` tree and image storage are never touched.
- **Warning:** the user sees *"You found a ghost in the machine! This NPC doesn't exist anymore and has been removed from your list."* in these places:
  - opening a ghost in Edit NPC, which then returns to the NPC list
  - adding a ghost to an encounter in the encounter builder
  - adding several copies of a ghost, where the warning shows once and the remaining copies are skipped
  - selecting a ghost in the NPC picker (`CopyContent`): the in-combat Add NPC drawer, Edit NPC's copy-monster and create dialogs, and Edit Player's **Add companion** dialog
  - deleting a ghost from the NPC list, which then succeeds instead of throwing
- **Unknown outcome:** if the check can't confirm a ghost, the user gets a neutral "This NPC could not be loaded" error and nothing is removed. Edit NPC navigates back to the list instead of showing an empty editor.
- **Loading state:** each entry point shows its NPC loading state for the whole resolve, so a ghost check just extends the existing loading and there's no separate state for it.
  - **Edit NPC** keeps its existing `loading`.
  - The **encounter builder**, the **NPC picker** and **delete** get a per-row or per-item state. It disables the buttons and shows a spinner, which also prevents double clicks.
- **Prevent new ghosts:** `deleteNpc` and `editNpc` write `npcs/` and `search_npcs/` in one atomic multi-path update, so a half-finished write can no longer leave a search entry behind.
- **Notification durations:** snotify shows every notification for 2 seconds by default, which was too short to read the ghost warning. A shared `NOTIFY_DURATION` scale (`SHORT` 2 s, `MEDIUM` 4 s, `LONG` 6 s, `VERY_LONG` 8 s) is added, and the ghost and "could not be loaded" notifications use `MEDIUM`. Existing hard-coded timeouts elsewhere in the app aren't changed.

## Capabilities

### New Capabilities
- `npc-search-integrity`: keeps a user's NPC search index consistent with their NPC records. This covers the strict ghost check, safe removal of dangling search entries, the user-facing warning in each entry point, and atomic writes that keep the two paths in sync.
- `notification-duration`: a shared scale for how long notifications are shown, guidance for which step to pick, and migrating hard-coded timeouts when they are touched.

### Modified Capabilities
<!-- None. No existing OpenSpec capability covers NPC storage. -->

## Impact

- **Code:**
  - `src/services/npcs.js`: new server-read and search-entry removal methods; atomic `editNpc` and `deleteNpc`.
  - `src/store/modules/userContent/npcs.js`: new `resolve_npc` and internal `check_ghost_npc` actions; `delete_npc` handles ghosts.
  - Entry points: `EditNpc.vue`, `Entities.vue`, `CopyContent.vue`, `Npcs.vue`.
  - `EditPlayer.vue` and `AddNpc.vue` are covered through `CopyContent` and don't change.
  - The warning text goes in a shared constant, with `notifyUnresolvedNpc` in `src/utils/errors.js`.
  - `src/utils/generalConstants.js`: new `NOTIFY_DURATION`.
- **Data:** each confirmed ghost loses its `search_npcs/<uid>/results/<id>` entry. Nothing in `npcs/`, `encounters/` or storage is changed.
- **APIs and dependencies:** none. Uses Firebase v8 namespaced API (`once("value")`, `.info/connected`, multi-path `update`).
- **Risk:**
  - A false positive would hide a real NPC from the user's list.
  - The NPC itself would survive, because only the search entry is removed. The design adds several independent safeguards against this.
  - Atomic writes change the write path for every NPC edit and delete, so they need regression testing.
