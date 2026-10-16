## Context

Custom NPCs are stored twice in the Realtime Database (Firebase v8 namespaced API):

- `npcs/<uid>/<id>` holds the full NPC.
- `search_npcs/<uid>/results/<id>` holds a compact copy (`name`, `challenge_rating`, `type`, `avatar`, `storage_avatar`, `groups`). It is produced by `convert_npc()` in the store, and every NPC list and picker reads from it.
- `search_npcs/<uid>/metadata/count` holds the count used for slot limits.

`search_npcs` is **derived data**: every field in it can be rebuilt from the full NPC.

Current behaviour that matters for this change:

- **`get_npc` caches `null`.** `get_npc({ uid, id })` reads `npcs/<uid>/<id>` once and caches the result in `cached_npcs`, including `null`. A comment explains that missing NPCs are never re-fetched. A cached `null` therefore isn't proof that the NPC is missing right now.
- **Nothing listens on these paths.** No component holds an `.on("value")` listener on `npcs/` or `search_npcs/`, so `once("value")` on those paths goes to the server whenever the client is connected.
- **Write order:**
  - `addNpc` writes `npcs/` first, then `search_npcs/` (the second write isn't awaited).
  - `editNpc` writes `search_npcs/` first, then `npcs/`.
  - `deleteNpc` fires two un-awaited `remove()` calls.
  - Any partial failure can leave a search entry without an NPC.
- **Entry points where a user picks a search NPC and the code crashes on `null`:**
  - `EditNpc.vue` `mounted`
  - `Entities.vue` `add` (encounter builder; `multi_add` calls it once per copy)
  - `CopyContent.vue` `copy` (the NPC picker)
  - `npcs.js` `delete_npc`
- **`CopyContent` is used for custom monsters in four places:**
  - the in-combat Add NPC drawer (`AddNpc.vue`)
  - the copy-monster dialog in Edit NPC
  - the create dialog in Edit NPC
  - the **Add companion** dialog in Edit Player (`EditPlayer.vue`, `content: ['custom']`)
- **`Npcs.vue` `viewNpc`** already ignores `null`.
- **Companion editing:** `EditNpc.vue` can open another user's NPC through `route.params.userid`.
- **Existing loading states:**
  - `EditNpc.vue` sets `loading` around `get_npc` and hides the editor while it's `true` (`v-if="!loading"`). On `null` it crashes and never resets.
  - `Entities.vue`, `CopyContent.vue`, `Npcs.vue` (delete) and `EditPlayer.vue` await `get_npc` with no loading state. Their only flags (`loading_npcs`, `loading_monsters`) cover fetching the whole list.

## Goals / Non-Goals

**Goals:**
- Never remove a search entry unless it is certain that the NPC record doesn't exist.
- Heal ghosts wherever they came from, the moment a user runs into one.
- Give the user a clear, friendly message instead of a crash or a silent failure.
- Keep visible feedback for as long as the NPC is being resolved, ghost check included, so the user can't trigger the same action twice.
- Stop the two write paths that can create new ghosts.

**Non-Goals:**
- A background or bulk scan of all users. Healing happens lazily, on use.
- Removing or changing anything outside `search_npcs/<uid>/results/<id>`. That includes `npcs/`, encounter entities that reference the NPC, and storage images.
- The reverse problem: an NPC without a search entry. It's invisible in lists but harmless.
- Custom spells (`spells/` and `search_spells/`). They have the same structure and could reuse this pattern in a follow-up.
- Changing `get_npc`'s `null` caching for all callers.

## Decisions

### 1. `resolve_npc`: one call per entry point, with the ghost check inside it

Entry points stop calling `get_npc` directly and call a new store action `resolve_npc({ uid, id })`. It returns one of:

- `{ status: "exists", npc }`
- `{ status: "ghost" }`
- `{ status: "unknown" }`

It never throws.

```
resolve_npc({ uid, id })
  npc = get_npc({ uid, id })            // unchanged: cache, then one server read if uncached
  if npc        → { status: "exists", npc }      // normal path, ends here
  else          → check_ghost_npc({ uid, id })   // only when get_npc returned null
```

`check_ghost_npc` is internal. It is dispatched only by `resolve_npc`, and only after `get_npc` returned `null`.

**What triggers it.** The check runs only when a user actively picks one of their own custom NPCs, and that NPC resolves to `null`. These are the user actions that lead to it:

| User action | Code calling `resolve_npc` |
|---|---|
| Opening an NPC in the editor (`/content/npcs/<id>`) | `EditNpc.vue` `mounted` |
| Adding a custom NPC in the encounter builder (both the add and the roll-HP add buttons, for any quantity) | `Entities.vue` `add` (custom branch) |
| Picking a custom NPC in the in-combat **Add NPC** drawer | `CopyContent.vue` `copy` |
| Picking a custom NPC in Edit NPC's copy-monster or create dialog | `CopyContent.vue` `copy` |
| Picking a custom NPC in Edit Player's **Add companion** dialog | `CopyContent.vue` `copy` |
| Deleting an NPC from the NPC list | `delete_npc`, called from `Npcs.vue` |

`CopyContent` only does this for `type === "monster"` with `copy_resource === "custom"`, and only when it fetches the NPC itself (not with `return-id`). Spell, item and SRD pickers are unaffected.

**What doesn't trigger it.** Every other `get_npc` caller keeps calling `get_npc` and never runs the check: encounter loading and running (`runEncounter.js`, `encounters.js`), the difficulty mixin, `encounters/Overview.vue`, export, and companion loading for players and campaigns. These load NPCs in the background, so a cleanup there would be a surprising side effect. `Npcs.vue` `viewNpc` keeps ignoring `null`.

**Cost.**

| Case | Extra server reads | Delay |
|---|---|---|
| NPC exists (cached or not) | 0, same as today | none |
| `get_npc` returned a stale cached `null`, but the server has the NPC | 1 | none: `exists` at safeguard 5 |
| Offline, another user's NPC, or a read error | 0–1 | none: `unknown` early |
| Real ghost | about 3, plus 2 local `.info/connected` checks and 1 remove | 1.5 s (safeguard 7) |

The delay is an awaited timer inside the action. Other database reads and listeners are not affected, and the UI doesn't block. Only the flow that hit the ghost waits, and it shows its loading state while it does (decision 5).

**Alternative considered:** putting the check inside `get_npc`. Rejected. `get_npc` has more than 15 callers, including the background loaders above, and removing search entries as a side effect of all of those would be surprising.

### 2. Every safeguard must pass before removing anything

Any failed step returns `unknown`, except step 5, which returns `exists`.

1. **The current user owns it.** `uid` must equal the signed-in user's `uid`. This rules out companion editing (`route.params.userid`) and every case where a user reads another user's data.
2. **The input is valid.** `id` must be a non-empty string that is a legal RTDB key.
3. **The database is connected.** `.info/connected` must be `true`, read with `once("value")`, which is answered locally. Offline clients never conclude anything.
4. **There is a fresh server read.** `npcs/<uid>/<id>` is read with `once("value")`. The Vuex cache isn't consulted.
   - Any thrown error aborts: permission denied, network failure, or a timeout.
   - The read is wrapped in a timeout (8 s), because v8 `once` can wait indefinitely while reconnecting.
5. **The result is exactly null.** `snapshot.exists()` must be `false`. Otherwise return `exists` with the value, after the same spell-cache handling as `get_npc`, and refresh the cache.
6. **The search entry still exists.** `search_npcs/<uid>/results/<id>` is read from the server. If it's already gone, return `ghost` without writing anything. Another tab, or an earlier copy in the same `multi_add`, may have healed it.
7. **A second read comes back empty.** After a 1.5 s delay, step 3 through step 5 run again. This covers an in-flight write from another tab or device, such as a tab still running the old bundle, which writes `search_npcs/` before `npcs/`.
8. **Only then remove.** `search_npcs/<uid>/results/<id>` is removed and the removal is awaited. If the removal fails, return `unknown`.

**Alternative considered:** using `Reference.get()` (v8.10). Rejected. Offline it can resolve from a local cache, and `once` with an explicit connectivity check is easier to reason about.

### 3. Remove only the search entry, and keep the store consistent

After a successful removal, the action:

- commits `REMOVE_NPC(id)` and `REMOVE_CACHED_NPC({ uid, id })`
- calls `get_npcs` first if `state.npcs` isn't loaded, because `update_npc_count` reads `Object.keys(state.npcs)`
- dispatches `update_npc_count`

`update_npc_count` recomputes the count from the list length. Ghosts left by the "Not enough slots" bug were never counted, and this brings the stored count in line with what the user sees either way.

Nothing else is written. A false positive therefore can't lose NPC data: the full record would still be in `npcs/`, and the search entry can be rebuilt from it with `convert_npc` by re-saving the NPC. That is why no tombstone or backup copy is kept (see Open Questions).

### 4. User-facing messages and behaviour per entry point

The texts are exported constants, next to `NOT_ENOUGH_SLOTS_MESSAGE` in `src/utils/errors.js`, so all entry points use the same wording:

- `ghost`: warning, title "Ghost NPC": *"You found a ghost in the machine! This NPC doesn't exist anymore and has been removed from your list."*
- `unknown`: error, title "Load failed": *"This NPC could not be loaded. Please try again later."*

Both are shown at the top right for `NOTIFY_DURATION.MEDIUM` (4 seconds), instead of snotify's default 2 seconds, so the message can be read without hovering (hover still pauses it). `NOTIFY_DURATION` (`SHORT` 2 s, `MEDIUM` 4 s, `LONG` 6 s, `VERY_LONG` 8 s) is a new constant in `src/utils/generalConstants.js`. Titles are kept short because the toast truncates them at about 16 characters.

| Entry point | `exists` | `ghost` | `unknown` |
|---|---|---|---|
| Edit NPC | Show the editor with the NPC | Warning, then `replace("/content/npcs")` | Error, then `replace("/content/npcs")`. Never show an empty editor for an id, because saving it would write a new NPC under that key. |
| Encounter builder | Add the entity | Warning, stop `multi_add` (no further copies), nothing added | Error, stop `multi_add`, nothing added |
| `CopyContent` (Add NPC drawer, copy and create dialogs, Add companion) | Emit `copy` as today | Warning, nothing emitted, the entry is removed from `searchResults` | Error, nothing emitted, the list is unchanged |
| Delete from the NPC list | Delete as today | Warning, and the row disappears (the search entry was removed) | Error, and the row stays |

`add()` in `Entities.vue` returns the status, and `multi_add` breaks out of its loop on anything other than `exists`. Without this, adding 4 copies of a ghost would show the warning 4 times.

### 5. The NPC loading state covers resolving, including the ghost check

The loading state each entry point shows while it fetches the NPC is started just before `resolve_npc` and cleared after it settles, in a `finally`. The normal path therefore shows exactly the loading it shows today. When a ghost check runs, the same state simply lasts until the check is done: there is no second spinner and no separate "checking" state.

| Entry point | Loading state | While resolving |
|---|---|---|
| Edit NPC | the existing `loading` | The editor stays hidden (`v-if="!loading"`, as now). `loading` is only cleared on `exists`; `ghost` and `unknown` navigate away. |
| Encounter builder | new `resolving_npcs` (object keyed by NPC id), set for the whole `multi_add` run | Both add buttons on that row are disabled and show a spinner icon |
| `CopyContent` | new `resolving_id` | All copy buttons are disabled to prevent a second pick, and the clicked one shows a spinner. `resolving` is also passed to the `action` slot scope, so custom slot buttons can use it |
| Delete from the NPC list | new `deleting_npcs` (object keyed by NPC id) | That row's delete buttons are disabled and show a spinner |

The Add companion dialog in Edit Player gets this through `CopyContent`, with no change in `EditPlayer.vue`.

**Alternative considered:** reusing `loading_npcs` in `Entities.vue` and `Npcs.vue`. Rejected. Those flags swap the whole table for a loader, which is too disruptive for a single row's action.

### 6. Prevent new ghosts with atomic multi-path writes

- **`deleteNpc`:** one `db.ref().update({ "npcs/<uid>/<id>": null, "search_npcs/<uid>/results/<id>": null })`, awaited. The image delete stays a separate, best-effort call.
- **`editNpc`:** both branches (with and without an image upload) write `npcs/<uid>/<id>` and `search_npcs/<uid>/results/<id>` in one `update()`. A path key in a multi-path update replaces that node, so the behaviour matches the current `set()` calls.
- **`addNpc`** is unchanged. It already writes `npcs/` first, so a failure there leaves an NPC without a search entry, not a ghost.

**Alternative considered:** only reordering the writes. Rejected. Ordering narrows the window but doesn't close it. Multi-path updates are atomic in RTDB and need no schema or rules change, assuming the security rules allow the user to write both paths, which they already do separately.

## Risks / Trade-offs

- **[Risk] False positive removes a real NPC from the list.**
  - **Mitigation:** the eight safeguards above, and only derived data is removed. The NPC record survives and its search entry can be regenerated.
- **[Risk] Security rules reject the multi-path update** if `npcs` and `search_npcs` are validated with conflicting rules.
  - **Mitigation:** the rules aren't in this repo. Before release, verify edit and delete against the real rules (see tasks).
  - **Fallback:** if they're rejected, keep separate writes, ordered `npcs/` before `search_npcs/` for edit, and `search_npcs/` before `npcs/` for delete.
- **[Trade-off] The ghost path takes about 2 s** (1.5 s delay plus round-trips). This only happens on the rare ghost path, it is covered by the loading state, and the normal path has no extra reads.
- **[Risk] An 8 s timeout on a slow connection gives `unknown`.** That's the safe outcome: nothing is removed, and the user can retry.
- **[Trade-off] Lazy healing:** ghosts nobody opens remain in the database. That's acceptable, because they only matter when used.

## Open Questions

- **Tombstone:** should removed entries also be copied to a sibling such as `search_npcs/<uid>/ghosts/<id>` (with `removed_at`) for auditing? This design says no, because the data is derived. Revisit if support needs a trail.
- **Logging:** should confirmed ghosts be reported anywhere besides the console (analytics, or a log in the DB) so we can see whether new ghosts still appear after the atomic writes?
