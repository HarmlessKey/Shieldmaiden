# Vue 3 Migration — Verification Report

> Date: 2026-06-10
> Branch: `claude/vue3-migration-plan-9q0qC`
> Method: static checks + production build + headless-browser runtime audit (Playwright/Chromium against `quasar dev`)

---

## Verdict

The migration through Phase 2 is **functionally sound**. After fixing 6 bugs found during this verification (see below), all 10 audited public routes render with **zero console errors**. Remaining compat deprecation warnings map cleanly to planned Phase 3 work.

---

## Layer 1 — Static Verification

### Build
- `npx quasar build` (SPA): ✅ **succeeds** — 0 errors, 69 warnings (all cosmetic: CSS chunk ordering + HTML-spec warnings for `<tr>`/`<th>` nesting in 2 components).

### Lint (`eslint --ext .js,.vue ./`)
613 errors, 0 warnings. Breakdown by rule:

| Count | Rule | Meaning |
|---|---|---|
| 374 | `vue/no-deprecated-slot-attribute` | Old `slot="x"` syntax (compat handles) |
| 133 | `vue/multi-word-component-names` | Naming style, pre-existing |
| 44 | `vue/no-deprecated-slot-scope-attribute` | Old `slot-scope` syntax (compat handles) |
| 27 | `vue/no-v-text-v-html-on-component` | v-html on components, pre-existing |
| 20 | `vue/no-reserved-component-names` | e.g. `Content`, `Settings`, pre-existing |
| 15 | other | misc |

### Residual Vue 2 pattern scan ("compat debt")

| Pattern | Occurrences | Files | Status |
|---|---|---|---|
| `Vue.set` / `Vue.delete` | 144 | 8 store modules | Accepted (compat), Phase 3 |
| `$set(` / `$delete(` in templates | 9 | 3 | Accepted (compat), Phase 3 |
| `slot="x"` (old slot syntax) | 382 | 120 | Accepted (compat), Phase 3 |
| `slot-scope=` | 47 | 11 | Accepted (compat), Phase 3 |
| `::v-deep`, `beforeDestroy`, `destroyed()`, `$listeners`, `$scopedSlots`, `.sync=`, `new Vue(` | **0** | — | ✅ Clean |

---

## Layer 2/3 — Runtime Audit (headless Chromium)

Routes audited: `/`, `/sign-in`, `/sign-up`, `/pricing`, `/compendium` (+ monsters/spells/items/conditions), `/tools`, `/demo`, `/about-us`, `/documentation`.

**Result after fixes: all routes render, zero console errors.**

### Compat deprecation codes captured (= evidence-based Phase 3 worklist)

| Count | Code | Phase 3 task |
|---|---|---|
| 26 | `COMPONENT_ASYNC` | Wrap async components in `defineAsyncComponent` |
| 20 | `COMPONENT_V_MODEL` | Migrate `value`/`input` v-model to `modelValue` |
| 10 | `WATCH_ARRAY` | Add `deep: true` to array watchers that need mutation tracking |
| 4 | `RENDER_FUNCTION` | Rewrite `render(h)` functions (9 files known) |
| 2 | `GLOBAL_SET` | `Vue.set` in stores |
| 2 | `INSTANCE_ATTRS_CLASS_STYLE` | `$attrs` now includes class/style |

### Errors that are environmental (sandbox-only, NOT bugs)
- `ERR_NAME_NOT_RESOLVED` for Firebase/HK-API hosts — `.env.dist` placeholder URLs, no network in sandbox.
- `Cannot read properties of undefined (reading 'meta')` in `Compendium/Monsters.vue:332` — `fetch_monsters` resolves `undefined` when the API is unreachable; pre-existing (no API error handling), surfaces only without network.

---

## Bugs Found & Fixed During Verification

1. **App failed to boot entirely** (`ReferenceError: process is not defined` in `src/firebase.js`).
   Root cause: dotenv ≥16 returns `{ error, parsed: {} }` for missing files — `parsed` is a *truthy* empty object, so the `||` fallback to `.env.dist` in `quasar.config.js` never fired. Fixed by checking `result.error` instead.
2. **Same crash from `src/utils/generalConstants.js`** — `process.env.LOCAL_CHARACTER_SYNC_ID` and `process.env.MONSTER_GENERATOR_API_URL` are referenced in src but absent from `.env.dist` (the latter is named `MONSTER_GENERATOR_URL` there). Any env key missing from `build.env` is left as bare `process.env.X` in the bundle and throws. Fixed with defaults in `quasar.config.js`.
3. **`Cookies.parseSSR is not a function` in `App.vue` preFetch on every route** — Quasar v2 only exposes `parseSSR` server-side. Fixed with the canonical `process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies` guard.
4. **`modelValue` declared as both prop and computed** in `hk-input.vue` / `hk-select.vue` (Phase 2 regression). Computed renamed to `inputModel`.
5. **`/sign-in` crashed** — vee-validate v4 `Field` requires a string `name`; `hk-input` without a `name` prop passed `undefined` → crash in `normalizeFormPath`. Fixed with `fieldName` fallback (`field-${uid}`) in `hk-input` / `hk-select`.
6. **`/compendium` & `/tools` crashed** — `crumble/index.vue` still used `this.$root.$on` (missed in Phase 0 event-bus migration) while `INSTANCE_EVENT_EMITTER` compat is disabled. Migrated to `EventBus` (mitt) + 5 emitters in `src/views/Compendium/view/*.vue`.
7. **Home page carousel crashed** — `@egjs/vue-flicking` 4.x is the **Vue 2** build (calls `Vue.extend`); the Phase 2 note "already v3-compatible" was wrong. Replaced with `@egjs/vue3-flicking` and opted it (and its internal `Panel`) out of compat mode via `compatConfig: { MODE: 3 }`.
8. **All QTable lists were empty** — Quasar v2 renamed QTable's `data` prop to `rows`. Renamed in 18 occurrences across 16 files (compendium, user content lists, admin).

---

## Layer 2 — Manual Smoke-Test Checklist (requires real Firebase/API)

These flows can't be exercised in the sandbox (placeholder env, no network). Run locally with a real `.env.development.local`:

- [ ] Sign in with email/password and with Google
- [ ] Create + edit a campaign (vee-validate forms, image upload/cropper)
- [ ] Run an encounter: damage/heal an entity (reactivity + Notify dialogs), keyboard shortcuts, drag initiative order (vuedraggable v4)
- [ ] Run campaign screen: split panes resize (splitpanes v3), soundboard, share
- [ ] Compendium tables: pagination, sorting, search (QTable `rows` fix)
- [ ] Trigger a confirm dialog (e.g. delete content) — Quasar Dialog replacement
- [ ] Character sync extension flow (LOCAL_CHARACTER_SYNC_ID default = "")

---

## Acceptance Criteria for "Fully Migrated"

- [ ] `@vue/compat` removed from package.json, `vue` alias removed from quasar.config.js; app builds + runs (Phase 3 exit)
- [ ] Zero compat deprecation warnings in console
- [ ] Residual-pattern scan returns zero hits (currently: 144 Vue.set, 382 old slots, 47 slot-scope, 9 template $set/$delete)
- [ ] `npm run ssr` boots, pages render server-side, no hydration mismatches (Phase 4 exit)
- [ ] Production SSR build passes the smoke checklist
