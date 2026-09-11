## 1. Flag registry

- [x] 1.1 Create `src/utils/featureFlags.js` exporting `FEATURE_FLAGS` (id -> `{ label, default }`), with the first entry `monster_generator: { label: "AI Monster Generator", default: true }`
- [x] 1.2 Confirm the file has no Vue/Firebase import so it can be `require`d from `src-ssr/api/index.js` as-is

## 2. Client storage service

- [x] 2.1 Create `src/services/featureFlags.js` with a `FEATURE_FLAGS_REF = db.ref("feature_flags")` (mirror `src/services/promotions.js` style)
- [x] 2.2 Implement `getAllFlags()` — one `.once("value")` read, merge stored `{ id: { enabled } }` over `FEATURE_FLAGS` defaults so every registered id resolves to a boolean
- [x] 2.3 Implement `setFlagEnabled(id, enabled)` — `FEATURE_FLAGS_REF.child(id).child("enabled").set(enabled)`

## 3. Vuex module

- [x] 3.1 Create `src/store/modules/featureFlags.js`, namespaced, state `{ flags: {} }` (mirror `src/store/modules/contentReports.js` structure/style)
- [x] 3.2 Action `fetch_flags()` — calls `getAllFlags()`, commits result via `SET_FLAGS`
- [x] 3.3 Action `set_flag_enabled({ id, enabled })` — calls `setFlagEnabled`, commits optimistic update via `SET_FLAG`
- [x] 3.4 Getter `flags` (raw map, for the admin page) and `isFlagEnabled: (state) => (id) => state.flags[id] ?? FEATURE_FLAGS[id]?.default ?? true`
- [x] 3.5 Register the module in `src/store/index.js` as `feature_flags`

## 4. Wire into app boot

- [x] 4.1 In `src/store/modules/general.js`'s `initialize()` action, dispatch `feature_flags/fetch_flags` in both the authenticated (`Promise.all([...])`) and unauthenticated branch, so it's always fetched regardless of login state

## 5. Admin UI

- [x] 5.1 Create `src/views/Admin/FeatureFlags.vue` — list every entry from `FEATURE_FLAGS` with a `q-toggle` bound to `flags[id]`, calling `set_flag_enabled` on change (mirror the enable/disable interaction in `src/views/Admin/Promotions.vue`)
- [x] 5.2 Add a `feature-flags` child route under `/admin` in `src/router/routes.js`, matching the flat `vouchers`/`promotions` shape
- [x] 5.3 Add a nav entry to `src/views/Admin/index.vue`'s `items` list

## 6. Monster generator: client entry point

- [x] 6.1 In `src/views/UserContent/Npcs/EditNpc.vue`, map `feature_flags/isFlagEnabled` and wrap the "Generate from description" button with `v-if="isFlagEnabled('monster_generator')"`
- [x] 6.2 Fix dangling "OR" divider: wrap both the divider and the "Generate from description" button together in `EditNpc.vue`, found during manual QA
- [x] 6.3 Found during manual QA: the NPC list page (`src/views/UserContent/Npcs/Npcs.vue`) has its own "Generate" entry points (toolbar button + overflow-menu item) that also call the AI generator — gate both with `isFlagEnabled('monster_generator')`
- [x] 6.4 Found during manual QA: the generic content import page (`src/views/UserContent/ImportContent/index.vue`, `/content/import`) also has its own "Generate" button opening the same `GenerateMonster.vue` — gate it too. Confirmed via `grep -rln "GenerateMonster" src` that these are now all three (and only three) usage sites

## 7. Monster generator: server enforcement

- [x] 7.1 In `src-ssr/api/index.js`, `require` `FEATURE_FLAGS` from `src/utils/featureFlags.js` and add a small `isFlagEnabled(id)` helper using the existing `admin.database()` instance (fallback to registry default when no stored value or on read error)
- [x] 7.2 In `router.post("/ai/generate-monster", ...)`, check `isFlagEnabled("monster_generator")` right after token verification and before the credits lookup; if disabled, respond with a 4xx and a clear message, without calling `MonsterGenerator.generateMonster` or touching credits

## 8. Firebase rules (manual, outside this repo's tracked files)

- [x] 8.1 Verify/add a rule restricting writes on `feature_flags` to admin users, matching however `promotions`/`vouchers` already restrict admin-only writes
- [x] 8.2 Verify `feature_flags` is publicly readable (or readable by any authenticated user) so the client fetch and SSR read succeed for non-admins too

## 9. Manual verification

- [ ] 9.1 Run `npm run ssr`; confirm `/admin/feature-flags` lists `monster_generator` toggled on by default, and is unreachable when signed in as a non-admin
- [ ] 9.2 Toggle `monster_generator` off on the admin page; reload the New Monster dialog in `EditNpc.vue` and confirm "Generate from description" is gone
- [ ] 9.3 With the flag off, call `POST /ai/generate-monster` directly (e.g. via curl/Postman with a valid token) and confirm it's rejected without spending credits or calling the external API
- [ ] 9.4 Toggle the flag back on, reload, and confirm both the entry point and the endpoint work as before
- [ ] 9.5 Delete the `feature_flags/monster_generator` node entirely (simulating "never toggled") and confirm the feature behaves as enabled (registry default)
- [x] 9.6 Run `npm run lint` and fix any issues introduced

## 10. Wrap up

- [x] 10.1 Commit on `feature/feature-flags-admin` and push
- [x] 10.2 Open PR `feature/feature-flags-admin` -> `develop` (per Git Flow in CLAUDE.md) — https://github.com/HarmlessKey/Shieldmaiden/pull/360
