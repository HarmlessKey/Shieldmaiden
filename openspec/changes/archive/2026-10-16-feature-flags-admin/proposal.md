## Why

We currently have no way to turn a feature off without shipping a code change. The AI monster generator (`GenerateMonster.vue` -> `POST /ai/generate-monster` -> the external `MONSTER_GENERATOR_API_URL` service) is the first case where we want a fast kill switch — e.g. if the external generator API goes down, gets too expensive, or starts producing bad output, we want to disable it in seconds from an admin page rather than cutting a release.

## What Changes

- Add a small, general-purpose feature flag system: a fixed registry of named boolean flags, defined in code, with their on/off state stored in Firebase and managed from a new `/admin/feature-flags` page.
- Flags are **not real-time**: toggling a flag updates the stored value immediately, but already-open tabs are not pushed an update. The new value is picked up the next time a page is loaded/reloaded (client re-fetches once on boot; SSR re-reads on every render). No redeploy is required, and no live socket/listener is added.
- Add the first flag, `monster_generator`, defaulting to **enabled**, and wire it to gate the AI monster generator end-to-end:
  - Client: hide the "Generate from description" entry point in the New Monster dialog (`EditNpc.vue`) when the flag is off.
  - Server: reject `POST /ai/generate-monster` (in `src-ssr/api/index.js`) with a clear error when the flag is off, so the kill switch is authoritative even if a request bypasses the UI.

## Capabilities

### New Capabilities
- `feature-flags`: a fixed registry of named boolean flags; Firebase-backed storage; a Vuex module that fetches the current values once per app load (client boot / each SSR render, not live-reactive); an admin page to toggle them; a server-side helper to check a flag's state from Express API routes. Includes the `monster_generator` flag and its enforcement on both the client entry point and the `/ai/generate-monster` endpoint as the first concrete use of the system.

### Modified Capabilities
<!-- None — no existing OpenSpec capability covers admin tooling or the monster generator today. -->

## Impact

- **Code**:
  - New: `src/utils/featureFlags.js` (flag registry + defaults, shared by client and server), `src/services/featureFlags.js` (Firebase read/write), `src/store/modules/featureFlags.js` (Vuex module), `src/views/Admin/FeatureFlags.vue` (admin UI).
  - Modified: `src/store/index.js` (register module), `src/store/modules/general.js` (fetch flags during `initialize`), `src/router/routes.js` (new admin route), `src/views/Admin/index.vue` (nav entry), `src/views/UserContent/Npcs/EditNpc.vue` (hide entry point when disabled), `src-ssr/api/index.js` (enforce flag in `/ai/generate-monster`).
- **APIs**: `POST /ai/generate-monster` gains a new failure mode (403-style rejection) when the flag is off. No new public endpoints — the admin page writes to Firebase directly via the client SDK, same as `Promotions`/`Vouchers`.
- **Data**: new Firebase Realtime Database path `feature_flags/<flag_id>` (`{ enabled: boolean }`). Write access must be restricted to admins in the existing Firebase security rules (same restriction already relied on by `promotions`/`vouchers`, managed outside this repo).
- **Dependencies**: none added.
- **Risk**: low. Worst case for a stale/misread flag is the monster generator staying in its last-known state for one page load longer than expected; nothing destructive, easily reversible by re-toggling.
