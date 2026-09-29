# Bug: Party members disappear from Campaign overview after editing one player's HP

## Symptom
On the DM's "Campaign overview" screen (`RunCampaign.vue`, the working screen with
Encounters + Players panels), editing one player's HP (or any field) via the
"Edit player" drawer causes every *other*, unedited party member to vanish from
the players list. Leaving the campaign and re-entering restores them. Repeating
the edit on the next player causes the same thing, one at a time.

## Root cause
`RunCampaign.vue` builds its local `players` object twice:

1. On `mounted()`, it loops over `campaign.players` and calls `players/get_player`
   for each id — this always produces the full, correct roster.
2. Via a `watch` on the computed `filtered_search_players`, which filters the
   Vuex `players` module's `players` getter (built from `state.players`, the
   lightweight *search index*) by `campaign_id`. Any change to `state.players`
   re-runs this watcher, which calls `updatePlayers()` and **replaces**
   `this.players` wholesale with only what `filtered_search_players` currently
   contains (`src/views/UserContent/Campaigns/RunCampaign.vue:386-390` and
   `:457-460`).

`state.players` (the search index) is only ever populated by
`players/get_players` (a full fetch) or incrementally by actions like
`edit_player`/`add_player`/`sync_player`, which each `Vue.set` just the one
touched entry (`src/store/modules/userContent/players.js` `SET_PLAYER`
mutation: if `state.players` was `undefined`, it does
`Vue.set(state, "players", { [id]: search_player })` — creating the state with
**only that one player**).

`RunCampaign.vue` never calls `get_players()`, so `state.players` starts out
`undefined`. The first time any player is edited (e.g. HP via
`drawers/EditPlayer.vue` → `players/edit_player`), `state.players` gets created
with just that one entry. The `players` getter and `filtered_search_players`
computed now resolve to an array containing only the edited player, the watcher
fires, and `updatePlayers()` overwrites `this.players` with just that one
player — every other party member disappears from the UI (though nothing is
deleted server-side, which is why leaving/re-entering — which re-runs the
correct `mounted()` loop — fixes it).

This is a regression from commit `b97013c1c` ("use search players to reactively
update player list in run campaign"), which added the watcher to react to
players being added/removed via the "Manage Players" dialog, without ensuring
`state.players` is fully hydrated first.

## Fix
In `RunCampaign.vue`, call `players/get_players` (full fetch of the user's
search index, same pattern already used in `AddPlayers.vue` and
`Players/index.vue`) during `mounted()`, before/alongside `get_campaign`. This
guarantees `state.players` holds the complete roster before any single-player
edit can mutate it, so `filtered_search_players` — and therefore
`updatePlayers()` — always reflects the full set of campaign players, not just
whichever one was last touched.

No changes needed to the `players` Vuex module or the `SET_PLAYER` mutation —
their per-entry-update behavior is correct once the full index is loaded.
