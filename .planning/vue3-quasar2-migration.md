# Vue 3 + Quasar 2 + Vite Migration — Investigation & Task Plan

> Status: **INVESTIGATION COMPLETE — ready for implementation**
> Branch: `claude/vue3-quasar2-migration-rt4fb0` (contains this spec + the Firebase emulator suite, merged from `origin/claude/firebase-emulator-investigation-ownbts`)
> Date: 2026-07-04
> Audience: this doc is written so a junior developer can execute the migration task-by-task without re-deriving context.

---

## 1. TL;DR

- **A previous migration attempt already exists and is ~60% done.** Branch `origin/claude/vue3-migration-plan-9q0qC` (last commit 2026-06-10) has the app booting on Vue 3 (`@vue/compat`) + Quasar 2 + Vuex 4 + Vue Router 4 in SPA mode, with all Vue-2-only dependencies replaced and a headless-browser audit showing zero console errors on 10 public routes. **Do not redo this work — salvage it** (Phase B below). It is 106 commits behind `develop`, so the first real job is merging `develop` back in.
- The prior attempt targeted **`@quasar/app-webpack`**. We now decide to land on **`@quasar/app-vite` v2** instead (Phase C) — that's where the dev-server speedup comes from. The component-level work from the prior branch carries over unchanged; only the build config, `src-ssr/`, and ~70 `require()` calls are webpack-specific.
- **Testability**: branch `origin/claude/store-services-test-suite-amw97f` contains a complete Vitest suite (65 test files) for all Vuex modules and Firebase services, running against the **Firebase Local Emulator Suite** with zero real credentials. The store/service layer is framework-agnostic, so this suite runs on Vue 2 *and* Vue 3 — it is the primary "did we break data behavior" regression gate. Merge it first (Phase A).
- The Firebase emulator setup (Auth + RTDB + Storage, `demo-shieldmaiden` project) is already merged into this branch and documented in `.planning/firebase-emulator-local-dev.md`.
- Rough total effort: **4–7 weeks** of focused work for one developer, split into 5 phases, each independently shippable/verifiable.

---

## 2. Current State (measured on `develop` @ 2.42.0, 2026-07-04)

### Stack

| Dependency | Today | Target (proven on prior branch) |
|---|---|---|
| `vue` | ~2.7.16 | `^3.3` + `@vue/compat` `^3.3` (bridge), plain `vue@^3` at the end |
| `quasar` | ^1.0.0 | `^2.14` |
| `@quasar/app` | ~2.4.3 (webpack 4) | **`@quasar/app-vite` `^2`** (prior branch used `@quasar/app-webpack@^3`; we go Vite) |
| `vuex` | ^3.0.1 | `^4.1` (keep Vuex; Pinia is explicitly out of scope) |
| `vue-router` | bundled by Quasar v1 CLI | `^4.2` |
| `firebase` | ^8.0.0 (v8 namespaced) | **unchanged** — per CLAUDE.md, do NOT move to modular v9+ |
| `firebase-admin` | ^13.4.0 | unchanged |
| Node | >= 24 | unchanged |

### Scale

- **361 `.vue` files**, 86 `.js` files in `src/`
- 17 Vuex store modules (plus a second, apparently **unused** store in `src/store/store.js` — see Pitfall 17)
- 17 mixins, 7 boot files, SSR mode with an Express API in `src-ssr/api/`, PWA enabled
- Docker deploy: builds `dist/ssr`, runs `pm2-runtime index.js`

### Vue 2 pattern counts (re-measured today — some numbers in the old plan were wrong, see Pitfall 7)

| Pattern | Count | Notes |
|---|---|---|
| `this.$set` / `Vue.set` | 415 calls | Removed in Vue 3; compat shims them |
| `this.$delete` / `Vue.delete` | 106 calls | Same |
| Real template filters (`{{ x \| numeral }}` etc.) | **~44** (16 files use `\| numeral`, 1 local `filters:` block) | The old plan said 381 — that over-counted vee-validate rule strings like `rules="required\|max:20"`. Filters have **zero** compat support and must go first. |
| Old slot syntax `slot="x"` | ~330 | Compat shims; must be `v-slot` before compat removal |
| `slot-scope=` | 48 | Same |
| `v-model=` (all, incl. native inputs) | ~594 | Only component v-model (value/input contract) needs work; runtime audit flagged ~20 hot spots |
| `.sync` modifier | 7 | → `v-model:propName` |
| `::v-deep` / `/deep/` / `>>>` | 37 files | → `:deep()` |
| Event bus / `$root.$on` | 7 call sites | → `mitt` (prior branch already introduced `mitt` as `EventBus`) |
| `$listeners` | 5 files | merged into `$attrs` in Vue 3 |
| `beforeDestroy`/`destroyed` | 6+2 files | → `beforeUnmount`/`unmounted` |
| `mapGetters/mapActions/mapState/mapMutations` | 768 | Fine under Vuex 4 Options API — no change required |
| `require()` inside `src/` | **70 calls in 38 files** (30 are dynamic ``require(`...${x}...`)``) | Works under webpack, **breaks under Vite** — see Task C2 |
| `<q-table :data="...">` | 18 tables | Quasar 2 renamed the prop to `rows` |

---

## 3. Existing assets (three branches) — what they contain and how stale they are

### 3a. `origin/claude/vue3-migration-plan-9q0qC` — the prior migration attempt (SALVAGE THIS)

- Based on `main` @ 2.39.2 (2026-01-30). **106 commits behind `develop`**; `develop` has since changed **65 files in `src/`** (+2694/−1374) — mostly NPC views, player display/campaign refactor (#341), custom-resource filtering (#345).
- Phases 0–2.5 of its plan are **complete and verified** (see its `.planning/IMPLEMENTATION_PROGRESS.md` and `.planning/VERIFICATION_REPORT.md` on that branch):
  - Filters removed, event bus → `mitt`, `vue-cookies` → Quasar `Cookies`
  - Vue 3 + compat + Quasar 2 + Vuex 4 + Vue Router 4 + `@quasar/app-webpack@3` boot
  - All Vue-2-only libs replaced (matrix in §5)
  - `.sync`, `::v-deep`, lifecycle renames, `$listeners`, `$scopedSlots`, `.native` all done
  - vee-validate v3→v4 across 48 template files; vue-snotify → Quasar Notify/Dialog across 46 files
  - Headless-browser audit of 10 public routes: **zero console errors**; production SPA build passes
- **Not done on that branch**: old slot syntax (330+48), residual `Vue.set/delete` in 8 store modules (144), component v-model contract (~20 flagged), async components (26), compat removal, **SSR re-enablement**, PWA verification.
- Key reference docs on that branch (read them before starting Phase B):
  - `VUE3_MIGRATION_PLAN.md` — dependency & pattern audit
  - `.planning/PHASE2_CHANGELOG.md` — exact transforms applied per file
  - `.planning/VERIFICATION_REPORT.md` — the 8 runtime bugs found & fixed (reproduced in §7 Pitfalls)

### 3b. `origin/claude/firebase-emulator-investigation-ownbts` — emulators (ALREADY MERGED into this branch)

- Firebase Local Emulator Suite: Auth (9099) + RTDB (9000) + Storage (9199) + UI (4000), project `demo-shieldmaiden`, permissive local rules in `emulator/`.
- `src/firebase.js` calls `useEmulator()` when `VUE_APP_USE_FIREBASE_EMULATOR === "true"`; env selection is hardened in `env.js` (emulator env can never leak into a production build).
- `npm run emulators` / `npm run ssr:emulator`. Full findings: `.planning/firebase-emulator-local-dev.md`.

### 3c. `origin/claude/store-services-test-suite-amw97f` — the regression safety net

- Based on 2.41.2 (20 commits behind `develop`); already includes the emulator branch.
- **Vitest** (note: already Vite-ecosystem tooling) + emulator-backed integration tests:
  - `test/services/` — one file per `src/services/*` (21 files): real reads/writes against the emulator
  - `test/store/` — one file per Vuex module (18 files): real namespaced stores via `makeStore()` helper, actions hit the emulator end-to-end
  - `npm test` wraps Vitest in `firebase emulators:exec` (start → run → teardown in one command)
  - Husky pre-commit hook runs the suite (`SKIP_TESTS=1 git commit` to skip)
- **Why this matters for the migration**: services and store modules are plain JS with no Vue imports — the exact same tests must pass on Vue 2 (baseline) and after the Vue 3 / Vuex 4 swap. Only the small `test/helpers/store.js` (`new Vuex.Store(...)`) needs a Vuex 4 tweak (`createStore(...)`).

---

## 4. Decisions made (and why)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Target `@quasar/app-vite` v2, not `@quasar/app-webpack` v3.** | The stated goal of this migration includes dev-server speed. app-vite v2 supports SSR + PWA + boot files + preFetch (everything we use). The prior branch's webpack choice was "lowest diff"; all its *component* work transfers 1:1. The webpack-specific delta is contained: `quasar.config.js`, `src-ssr/` layout, 70 `require()` calls, eslint-webpack-plugin. |
| D2 | **Use `@vue/compat` (migration build) as the bridge, remove it at the end.** | Already proven on the prior branch: app boots and runs with compat shims while old patterns are burned down incrementally. Never ship compat to production — it is a dev bridge only. |
| D3 | **Keep Firebase v8 namespaced API.** | Hard constraint from CLAUDE.md (63+ files). The v8 SDK is framework-agnostic and already emulator-wired. The modular v9+ migration is a separate future project. |
| D4 | **Salvage the prior branch by merging `develop` into it — do not replay from scratch.** | The prior branch changed 211 files with months of mechanical work (filters, snotify, vee-validate 4). `develop` changed 65 src files since, mostly concentrated in NPC/campaign views. Merging and resolving ~65 conflicts (with `PHASE2_CHANGELOG.md` as the transform reference) is days of work; replaying is weeks. |
| D5 | **Keep Vuex 4 — no Pinia, no Composition-API rewrite, mixins stay.** | Options API, mixins, and `mapGetters/...` (768 uses) all work fine in Vue 3. Converting 361 components + 17 mixins to Composition API is an endless refactor that adds zero user value to this migration. It can happen incrementally afterwards. |
| D6 | **Adopt the store/services Vitest suite as the primary migration gate; add a scripted route-smoke audit for the component layer.** | We will never hand-write component tests for 361 files before migrating. The realistic gates are: (1) data layer behaves identically (Vitest+emulators), (2) every route renders with zero console errors (Playwright script), (3) a short manual checklist for auth/upload flows the sandbox can't reach. |
| D7 | **Drop `vuefire` entirely** (don't upgrade it). | `Vue.use(VueFire)` is registered in `src/boot/plugins.js` but **no component uses `firebase:` bindings or `$rtdbBind`** — grep confirms zero usages. All Firebase access goes through services/Vuex. Dead weight. |
| D8 | **Drop `vuejs-logger`, `vue-cookies`, `vue-numeral-filter`, `vue2-flip-countdown` (replacements in §5).** | All Vue-2-only and either unused, trivially replaced by Quasar built-ins, or replaced by direct `numeral` calls. Already done on the prior branch. |
| D9 | **Keep SSR mode** (it's the production deployment) but stabilize SPA-mode first, SSR last (Phase E). | Matches the prior plan; SSR adds hydration + server-bundle variables that are easier to debug once the client app is clean. |
| D10 | **Delete `src/store/store.js` if verification confirms it's unused** rather than migrating it. | No imports of it anywhere in `src/` or `src-ssr/` (grep today). Verify with a build after deletion. |
| D11 | **Git flow**: do the work on `feature/vue3-quasar2-migration` off `develop`, PR into `develop`, release via `release/3.0.0` (this is a major). Keep the branch continuously rebased/merged with `develop` — the staleness of the first attempt is what created Phase B. | Repo convention (CLAUDE.md). |

---

## 5. Dependency replacement matrix

Verified working versions from the prior branch's `package.json` — pin these, they are known-good together.

| Package (today) | Action | Replacement / version | Scope of change |
|---|---|---|---|
| `vue` ~2.7.16 | upgrade | `vue@^3.3` + `@vue/compat@^3.3` (alias `vue` → `@vue/compat` during bridge) | global |
| `quasar` ^1 | upgrade | `quasar@^2.14` | QTable `data`→`rows` (18), slot syntax, see Quasar upgrade guide |
| `@quasar/app` ~2.4.3 | replace | `@quasar/app-vite@^2` | `quasar.config.js` rewrite, `src-ssr/` rewrite |
| `vuex` ^3 | upgrade | `vuex@^4.1` | `new Vuex.Store` → `createStore` in `src/store/index.js` (done on prior branch) |
| (router bundled) | add | `vue-router@^4.2` | `src/router/index.js` rewrite (done); catch-all route needs `/:catchAll(.*)*` syntax |
| `vee-validate` ^3.4 | upgrade | `vee-validate@^4.13` + `@vee-validate/rules@^4.13` | complete API rewrite — **already done** across 48 files on prior branch |
| `vue-snotify` | replace | Quasar `Notify` + `Dialog` plugins | done on prior branch (46 files + utility wrapper) |
| `vue-shortkey` | replace | small custom directive (done on prior branch) | 2 files |
| `vue-croppa` | replace | `vue-advanced-cropper@^2.8` | 1 file (image upload/crop) |
| `vuedraggable` ^2 | upgrade | `vuedraggable@^4.1` (`item` slot API change) | 2 files (initiative order drag) |
| `splitpanes` ^2 | upgrade | `splitpanes@^3.1` | DM screen panes |
| `@egjs/vue-flicking` 4.x | replace | `@egjs/vue3-flicking@^4.15` | home carousel — **the 4.x package is the Vue 2 build**, see Pitfall 5 |
| `@gtm-support/vue2-gtm` | replace | `@gtm-support/vue-gtm@^2.2` | 1 boot file |
| `vue-numeral-filter` | replace | direct `numeral@^2` calls (filters are gone in Vue 3) | 16 files |
| `vue-cookies` | replace | Quasar `Cookies` plugin (already in framework plugins list) | done on prior branch |
| `vuefire` ^1 | **remove** | — (unused, see D7) | boot file only |
| `vuejs-logger` | **remove** | `console` wrappers | trivial |
| `vue2-flip-countdown` | **remove** | (feature dropped on prior branch; re-add `vue3-flip-countdown` only if the countdown is actually still wanted) | 1 component |
| `vue-qr` ^4 | keep | supports Vue 3 | — |
| `babel-eslint`, `eslint-plugin-vue@7` | replace | `@babel/eslint-parser`, `eslint-plugin-vue@^9` | `.eslintrc.js` |
| `eslint-webpack-plugin`, `workbox-webpack-plugin` | **remove** | app-vite handles PWA/workbox itself; lint via CLI/husky (or `vite-plugin-checker`) | config only |
| `mitt` | add | `mitt@^3` event bus (already introduced on prior branch) | 6 files |
| Framework-agnostic (keep as-is) | — | `firebase@8`, `firebase-admin`, `axios`, `lodash`, `marked`, `sanitize-html`, `jspdf`, `html2canvas`, `@octokit/rest`, `ajv`, `animate.css` | — |

Also check the `overrides` block in `package.json` after the CLI swap — most entries exist to patch webpack-4-era transitive deps and become unnecessary (or even harmful if they pin something app-vite needs). Prune it once `npm ls` is clean.

---

## 6. Task list

Effort labels: **S** ≤ ½ day, **M** 1–2 days, **L** 3–5 days, **XL** > 1 week.
Every task ends with its own verification step — do not start the next task with the current one red.

### Phase A — Safety net first (still on Vue 2) — ~1 week

**A1. [DONE] Merge the Firebase emulator branch.** Already merged into `claude/vue3-quasar2-migration-rt4fb0` (this branch). `npm run emulators`, `npm run ssr:emulator` exist; read `.planning/firebase-emulator-local-dev.md`.

**A2. Merge `origin/claude/store-services-test-suite-amw97f` and get `npm test` green on Vue 2. (M)**
- `git merge origin/claude/store-services-test-suite-amw97f` — expect conflicts in `package.json` (scripts/devDeps), `package-lock.json` (see Pitfall 16: don't hand-merge the lock, take one side and `npm install`), possibly `.gitignore`/husky.
- The suite is 20 commits behind `develop`. Services/store modules changed since (esp. `npcs`, `players`, `campaigns` from PRs #341/#345) may make some tests fail **legitimately** — fix the *tests* to match current behavior, and get sign-off if behavior looks accidentally changed.
- Requires Java (emulators are JVM) and first-run download of emulator JARs — see §9 environment prerequisites.
- ✅ Verify: `npm test` green locally; record runtime.

**A3. Add a scripted route smoke-audit (Playwright). (M)**
- Reproduce the prior branch's "Phase 2.5" audit as a committed script (e.g. `test/smoke/routes.spec.js`): boot `quasar dev` against the emulators, visit `/`, `/sign-in`, `/sign-up`, `/pricing`, `/compendium` (+ monsters/spells/items/conditions), `/tools`, `/demo`, `/about-us`, `/documentation`, assert **zero console errors** per route.
- Nice-to-have: seed the emulator (auth user + minimal campaign/encounter) via `test/helpers/db.js` and add authenticated routes (`/content/campaigns`, run-encounter) to the audit.
- ✅ Verify: script green on Vue 2 — this is your baseline. Any route that errors *before* migration is out of scope.

**A4. Commit a pattern-scan script as the migration progress meter. (S)**
- `scripts/vue2-pattern-scan.sh` with the greps from §2 (`$set`, `$delete`, filters, `slot=`, `slot-scope`, `.sync`, `::v-deep`, `$listeners`, `require(` in src, `q-table :data`). Output counts per pattern.
- ✅ Verify: numbers match §2 (±drift from A2 merge).

### Phase B — Salvage the prior migration branch — ~1 week

**B1. Create the working branch and merge current work. (M–L)**
```bash
git checkout -b feature/vue3-quasar2-migration origin/claude/vue3-migration-plan-9q0qC
git merge develop           # the big one: ~65 src files conflict-prone
git merge claude/vue3-quasar2-migration-rt4fb0   # emulators + this spec + test suite (after A2)
```
- Conflict strategy for `src/**`: **take `develop`'s content as the base truth** (it has 5 months of features), then re-apply the migration transforms to those files using `.planning/PHASE2_CHANGELOG.md` (on the prior branch) as the recipe. The transforms are mechanical: filter→function call, `$set`→assignment, snotify→Notify, vee-validate v4 template shape, `::v-deep`→`:deep()`, QTable `data`→`rows`, `<template v-for>` key placement.
- `package.json`/lock: take the prior branch's dependency set, bump `version` to current, re-add emulator/test scripts, then `npm install` to regenerate the lock (Pitfall 16).
- List the danger files up front: `git diff --name-only $(git merge-base develop origin/claude/vue3-migration-plan-9q0qC)..develop -- src/`
- ✅ Verify: `npx quasar build` (SPA) passes; A3 smoke script passes; A4 scan shows no *increase* vs the prior branch's residuals.

**B2. Re-scan for Vue 2 patterns introduced by the 106 new develop commits. (S–M)**
- New code written Feb–Jun 2026 (NPC views, campaign refactor) freely uses `$set`, filters, old slots. Run the A4 scan; fix anything in the "hard error" class (filters, `$root.$on`, `.sync`, `$listeners`) immediately; log the compat-shimmed classes ($set, old slots) into Phase D's counts.
- ✅ Verify: scan output committed to the PR description; smoke audit still green.

**B3. Port the test-suite helper to Vuex 4 and make the suite the migration gate. (S)**
- `test/helpers/store.js`: `new Vuex.Store(...)` → `createStore(...)` from `vuex@4`. Everything else in the suite is framework-free.
- ✅ Verify: **`npm test` green on the Vue 3 branch** — this is the single most important signal that the data layer survived the framework swap. Diff any failure against the Vue 2 baseline from A2 to decide "test drift" vs "migration bug".

### Phase C — Webpack → Vite (`@quasar/app-vite` v2) — ~1–2 weeks

**C1. Swap the CLI and rewrite `quasar.config.js`. (L)**
- `npm rm @quasar/app-webpack @quasar/babel-preset-app webpack workbox-webpack-plugin eslint-webpack-plugin autoprefixer postcss` (app-vite brings its own postcss); `npm i -D @quasar/app-vite@^2`.
- Rewrite `quasar.config.js` (keep the prior branch's dotenv handling — Pitfalls 1 & 2):
  - keep: `boot`, `css`, `extras`, `framework.plugins` (`AppFullscreen, Notify, Cookies, Meta, Dialog`), `preFetch: true`, `build.vueRouterMode: "history"`, `build.env` fed by `env.js` (emulator-aware selection, already in this branch).
  - drop: `supportTS`, `transpile`/`transpileDependencies` (esbuild replaces Babel), `chainWebpack`, `scssLoaderOptions`, `vueCompiler`.
  - add compat aliasing the Vite way:
    ```js
    build: {
      viteVuePluginOptions: {
        template: { compilerOptions: { compatConfig: { MODE: 2 } } },
      },
      extendViteConf(viteConf) {
        viteConf.resolve.alias = { ...viteConf.resolve.alias, vue: "@vue/compat" };
      },
    }
    ```
- ✅ Verify: `quasar dev` (SPA) boots; note cold-start and HMR times vs webpack for the PR description (this is the payoff metric).

**C2. Eliminate `require()` from `src/` — 70 calls, 38 files. (L)**
- Static asset requires (`require("assets/_img/...")` — e.g. `soundBoard/Board.vue` has ~30): convert to ES imports or, in data/computed contexts, `new URL("../assets/...", import.meta.url).href`.
- Dynamic requires (30 call sites, e.g. ``require(`src/assets/_img/${type}.webp`)``): convert to `import.meta.glob("../assets/_img/**/*.webp", { eager: true, query: "?url", import: "default" })` lookup maps. Keep the glob narrow per component so the bundle doesn't inhale the whole asset tree.
- `src/services/monster_generator.js` / `shieldmaiden_ai.js` / `patreon.js` use CJS `require("node-fetch")`/`require("axios")`: convert to top-level ESM imports. `node-fetch` should only ever execute server-side — confirm these services aren't pulled into the client bundle, otherwise switch them to `axios`/native `fetch`.
- ⚠ The emulator test suite mocks these via the Node require cache (see `test/README.md`) — converting to ESM means switching those mocks to `vi.mock`. Update the affected tests in the same commit.
- ✅ Verify: `quasar build` passes; soundboard, weather demo, tools pages, backgrounds render images correctly (smoke script + eyeballs).

**C3. Port `src-ssr/` to the app-vite structure. (L)**
- Old layout (`src-ssr/index.js`, `extension.js`, `api/`) is Quasar-v1-CLI-specific. app-vite v2 uses `src-ssr/server.js` + `src-ssr/middlewares/*` (each middleware registered in `quasar.config.js → ssr.middlewares`).
- Move the Express API routes (`src-ssr/api/index.js`: `/api/ai/generate-monster`, Patreon routes, helmet/cors/morgan setup from `extension.js`/`index.js`) into a `middlewares/api.js`. Keep the emulator-conditional `firebase-admin` init from this branch (service-account file must stay optional — Pitfall from the emulator doc).
- Docker: app-vite SSR also outputs `dist/ssr` with an `index.js` entry and its own `package.json`; `pm2-runtime index.js` keeps working. Confirm the runtime-stage `npm install` still installs the right prod deps.
- ✅ Verify: this task only ports structure — full SSR sign-off happens in Phase E. Gate here: `quasar dev -m ssr` boots and serves `/`, and `/api/*` routes respond (use the emulator + `.env.emulator`).

**C4. PWA under app-vite. (S–M)**
- `pwa: { workboxMode: "GenerateSW", extendGenerateSWOptions(cfg) { cfg.skipWaiting = true; cfg.clientsClaim = true; } }`, manifest moves to `src-pwa/manifest.json` (copy the existing manifest object from old `quasar.conf.js`, incl. shortcuts/icons).
- ✅ Verify: `quasar build -m ssr` (ssr.pwa = true) emits a service worker; Lighthouse installability check.

**C5. Lint toolchain. (S–M)**
- `eslint-plugin-vue@^9` + `@babel/eslint-parser` (done on prior branch), drop eslint-webpack-plugin (gone with webpack). Run lint from CLI/husky only, or add `vite-plugin-checker` if in-dev-server lint is wanted.
- Expect a wall of `vue/no-deprecated-slot-attribute` (that's the Phase D worklist, not a regression). Configure those rules to `warn` until D1 lands, then flip to `error` to lock the door.
- ✅ Verify: `npm run lint` runs; error classes documented.

### Phase D — Burn down compat debt, remove `@vue/compat` — ~1–2 weeks

Use the compat runtime warnings as the authoritative worklist (the smoke script from A3 can collect them per route). Counts from the prior verification + today's scan:

**D1. Old slot syntax → `v-slot`. (L — biggest remaining chunk: ~330 `slot=` + 48 `slot-scope`, ~120 files)**
- `<template slot="header">` → `<template #header>`; `<div slot="x" slot-scope="{ y }">` → `<template #x="{ y }">…</template>`. Mostly on Quasar components (QTable/QSelect/QInput slots) and `hk-*` wrappers.
- Mechanical but high-volume: do it folder-by-folder, run the smoke script per folder batch. eslint `vue/no-deprecated-slot-attribute` pinpoints every site.

**D2. Component v-model contract. (M)** ~20 runtime-flagged sites: components still emitting `input`/receiving `value`. `hk-input`/`hk-select` were already migrated to `modelValue` — align remaining custom components, and check every `v-model` on `hk-*`/third-party components. (Native `<input v-model>` is untouched — don't churn all 594.)

**D3. Residual `Vue.set`/`Vue.delete` in 8 store modules (144 calls) + 9 template `$set`/`$delete`. (M)** Replace with plain assignment / `delete`. **The store test suite (B3) is the gate here** — run it after each module.

**D4. Async components → `defineAsyncComponent`. (S–M)** 26 warnings; `component: () => import(...)` in router routes is fine as-is — only object-literal/functional async component definitions in `components:` options need wrapping.

**D5. Array watchers. (S)** 10 `WATCH_ARRAY` warnings — add `deep: true` where mutation (not replacement) must trigger.

**D6. Transition class rename check. (S)** `v-enter` → `v-enter-from` etc. — grep custom SCSS for `-enter`/`-leave` class selectors (58 files use transitions; most rely on animate.css and are unaffected).

**D7. Compat ratchet & removal. (M)**
- In the compat boot file, turn flags off group by group (`configureCompat({ FEATURE: false })`) until everything is `MODE: 3`-clean; then delete `src/boot/compat.js`, the `vue → @vue/compat` alias, the `compatConfig` compiler option, and `@vue/compat` itself.
- ✅ Phase D exit: zero compat warnings in the smoke run; A4 scan reports 0 for every "critical" pattern; `npm test` green; `quasar build` passes on plain `vue@3`.

### Phase E — SSR, PWA, release — ~1 week

**E1. SSR sign-off. (L)**
- `npm run ssr:emulator` — verify all smoke routes render **server-side** (curl the HTML, check content present pre-hydration) with no hydration-mismatch warnings in the browser console.
- Re-check the 15 `preFetch` hooks — especially `App.vue`'s cookie/auth preFetch (`Cookies.parseSSR` guard — Pitfall 3) and track-campaign public pages.
- Check `ssr.middlewares` order (helmet/cors before render), and that the v8 client SDK still works in the server bundle (see the SSR notes in `.planning/firebase-emulator-local-dev.md` — `src/firebase.js` executes in Node during SSR). If Vite SSR externalization mangles firebase v8, add `ssr: { noExternal: ["firebase"] }` in `extendViteConf` (Risk R2).
**E2. Manual smoke checklist against the emulator + one real dev environment. (M)** From the prior verification report: email+Google sign-in, create/edit campaign (vee-validate forms, image upload via new cropper), run an encounter (damage/heal reactivity, keyboard shortcuts, drag initiative — vuedraggable v4), run-campaign screen (splitpanes v3, soundboard), compendium tables (pagination/sort/search), delete-confirm dialogs, character-sync extension flow (`window.postMessage` bridge).
**E3. Docker/deploy. (S)** Build the Docker image, run it, hit `/` and `/api` routes. Node 24 base is already compatible.
**E4. Release per git flow. (S)** PR `feature/vue3-quasar2-migration` → `develop`; then `release/3.0.0` → `main` + `develop`, tag `3.0.0` (major bump — framework swap).
**E5. Post-migration cleanup. (S–M)** Update **CLAUDE.md** (it currently hard-states Vue 2/Quasar 1/webpack constraints and "unfixable audit vulnerabilities" — most become fixable); prune `package.json` `overrides`; re-run `npm audit` and fix what's now fixable; delete `src/store/store.js` if D10 verification confirmed.

---

## 7. Pitfalls (learned the hard way — read before touching anything)

Numbered so tasks/risks can reference them. 1–10 were **actual bugs hit on the prior attempt** (`.planning/VERIFICATION_REPORT.md` on that branch).

1. **dotenv ≥16 returns `{ error, parsed: {} }` for missing files.** `parsed` is a *truthy* empty object, so `dotenv.config().parsed || fallback` never falls back — the app boots with zero env and crashes in `src/firebase.js`. Check `result.error`, not `result.parsed`.
2. **Every env key referenced in `src/` must exist in `build.env`** (with at least `""`). A missing key leaves a bare `process.env.X` in the client bundle → `ReferenceError: process is not defined` at runtime. Known offenders: `LOCAL_CHARACTER_SYNC_ID`, `MONSTER_GENERATOR_API_URL` (`.env.dist` spells it `MONSTER_GENERATOR_URL`!), `MONSTER_GENERATOR_API_KEY`.
3. **`Cookies.parseSSR` exists only server-side in Quasar 2.** `App.vue` preFetch needs `process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies`.
4. **vee-validate v4 `Field` requires a string `name`.** `hk-input`/`hk-select` without a `name` prop crashed sign-in; they now generate a `field-${uid}` fallback — keep that behavior when touching those components.
5. **`@egjs/vue-flicking` 4.x is the Vue 2 build** (calls `Vue.extend`) even though it "supports Vue 3" per its README. Use `@egjs/vue3-flicking`, and opt it + its `Panel` out of compat (`compatConfig: { MODE: 3 }`).
6. **Quasar 2 renamed QTable `data` → `rows`** (18 tables here) — tables silently render empty, no error. Also watch: `pagination.sync` → `v-model:pagination`, `@request` signature, QDialog/QMenu `value` → `model-value`. Full list: Quasar "Upgrade guide from v1".
7. **The old plan's "381 template filters" was wrong** — it counted vee-validate rule strings (`rules="required|max:20"`). Real filters ≈ 44 (mostly `| numeral`). Don't "fix" rule strings; they are plain strings and stay as-is under vee-validate 4's `:rules` unless the field migrated to function rules.
8. **Vue 3 requires `:key` on `<template v-for>`, not on its children** — hard compile error in 22 files (already fixed on the prior branch; new develop code may reintroduce it).
9. **Event-bus stragglers**: `$root.$on` hid in `crumble/index.vue` and crashed `/compendium` + `/tools` at runtime. Grep for `$root.$on|$root.$emit|$on(|$off(|$once(` after every merge from develop.
10. **`modelValue` declared as both prop and computed** in wrapper inputs = silent breakage. When migrating a component's v-model, rename the internal computed (`inputModel` convention).
11. **Module-level Firebase refs are created at import time** (`const ref = db.ref("users")` in stores/services). Emulator wiring MUST stay inside `src/firebase.js` (before any consumer import) — never move `useEmulator()` into a boot file.
12. **Emulator suite needs Java (JVM) and a first-run JAR download from `storage.googleapis.com`.** In restricted sandboxes/CI the download can be blocked (this investigation's sandbox: HTTP 403 "host not permitted" from the network policy). Fix: allow `storage.googleapis.com` + `firebase-public.firebaseio.com` in the environment's network policy, or pre-seed `~/.cache/firebase/emulators/` in the environment setup script.
13. **Pin emulator hosts to `127.0.0.1`, not `localhost`** — on dual-stack machines `localhost` resolves to `::1` while the emulators bind IPv4 only (`auth/network-request-failed` on sign-in). Already handled in `src/firebase.js` / `.env.emulator`.
14. **`require()` does not exist under Vite** (70 calls in `src/`, 30 dynamic). Webpack tolerated them; Vite build fails or leaves them for runtime crashes. See Task C2 — including the test mocks that piggyback on the Node require cache.
15. **`@vue/compat` has NO support for template filters** — they're hard template-compile errors, not warnings. Remove filters *before* the vue package swap on any newly-merged code.
16. **Never hand-merge `package-lock.json`.** Resolve `package.json` semantically, then delete the conflicted lock and regenerate with `npm install`. Verify with `git status` clean after a second `npm install`.
17. **There are two Vuex stores.** `src/store/index.js` is the app store; `src/store/store.js` (imports `auth`, different module set) has **no importers** in today's `src/`/`src-ssr/` — likely dead. Verify & delete (D10) instead of migrating it.
18. **Husky pre-commit runs the full emulator test suite** after A2 — commits get slow. `SKIP_TESTS=1 git commit …` for WIP; never skip on the final push of a task.
19. **SSR dev-server rebuilds re-evaluate `src/firebase.js` while `firebase.apps` survives** — `useEmulator()` on an already-used instance throws; the existing try/catch is load-bearing, keep it.
20. **eslint-plugin-vue 9 will flood you with slot-syntax errors on day one** — that's the D1 worklist, not new breakage. Downgrade those rules to `warn` until D1, then re-arm to `error`.

---

## 8. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | The `develop` merge into the prior branch (B1) produces subtle semantic conflicts — develop features silently lose migration transforms, or vice versa | High | High | Take develop as content-truth, re-apply transforms from `PHASE2_CHANGELOG.md`; A3 smoke + A4 scan + `npm test` after the merge; review the 65-file conflict list explicitly |
| R2 | Firebase v8 (CJS-heavy, 2021-era package) misbehaves under Vite SSR externalization / dep-optimizer | Medium | High | Test `quasar dev`/`build -m ssr` early in C3, not at the end; known dials: `ssr.noExternal: ["firebase"]`, `optimizeDeps.include`; fallback decision point: if unfixable, `@quasar/app-webpack@3` (prior branch config) remains a proven landing zone — Vite is the goal, not a hostage |
| R3 | SSR hydration mismatches after Quasar 1→2 (markup differences in Q-components) | Medium | Medium | Phase E dedicated pass; compare SSR HTML vs client render per route; Quasar 2 hydration warnings are explicit in dev |
| R4 | Vue 3 reactivity semantics change behavior silently (array index writes, `watch` on arrays, object property adds) beyond what compat warns about | Medium | Medium | Store suite (B3) covers the data layer; D5 handles watchers; manual checklist E2 covers the reactive-heavy encounter runner |
| R5 | No component-level unit tests exist at all — component regressions ride only on smoke + manual checks | High | Medium | Accepted for this migration (D6). Smoke script asserts zero console errors on all routes incl. seeded authenticated ones; E2 manual checklist for interaction flows; post-migration, Vitest + @vue/test-utils becomes cheap to add (same runner as the store suite) |
| R6 | Quasar 1→2 API renames beyond QTable lurking in 361 components | Medium | Medium | Compat/runtime warnings + eslint + smoke audit; budget slack in D1 while touching every slot-using file anyway |
| R7 | PWA/service-worker regression breaks offline/update flow for existing installed users | Low | Medium | C4 + E1; `skipWaiting/clientsClaim` preserved; test an install-upgrade cycle from the live SW to the new one on staging |
| R8 | The migration branch goes stale *again* while other features land on develop | High | High | This killed attempt #1. Merge `develop` into the feature branch **weekly** (it's cheap now that transforms are documented); phase gates are independently green so the branch is always near-shippable |
| R9 | Emulator suite can't run in CI/sandbox (Java/network policy) → the safety net silently stops being exercised | Medium | Medium | Pitfall 12 fixes; add a CI job (or at minimum a documented local ritual) that runs `npm test` + smoke on every migration PR |
| R10 | Third-party replacements behave differently (cropper, draggable v4 `item` slot, splitpanes 3, vue3-flicking) | Medium | Low–Medium | Each is isolated to 1–2 files; E2 checklist exercises all of them explicitly |

---

## 9. Environment prerequisites (dev machine, CI, and Claude sandboxes)

- **Node ≥ 24, npm ≥ 10** (unchanged).
- **Java 21+** on PATH — the RTDB emulator is a JVM app (Auth/Storage emulators are Node).
- **First `firebase emulators:start` downloads JARs** from `storage.googleapis.com` into `~/.cache/firebase/emulators/`. Restricted environments must allow that host (plus `firebase-public.firebaseio.com` for the CLI) or pre-seed the cache. *Verified in this sandbox: everything else works, but the JAR download was blocked by the network policy (HTTP 403 "host not permitted") — configure the Claude Code environment's network policy accordingly before relying on emulator-backed tests here.*
- **No real Firebase credentials needed** for emulator work: `.env.emulator` ships demo values; `env.js` auto-selects it in dev when no `.env.development.local` exists.
- `npm run emulators` (standalone), `npm test` (emulators + Vitest, after A2), `npm run ssr:emulator` (dev server against emulators).

## 10. Definition of done

- [ ] `vue@^3` (no `@vue/compat`, no alias), `quasar@^2`, `@quasar/app-vite@^2`, `vuex@4`, `vue-router@4` in `package.json`; zero Vue-2-only packages left
- [ ] `scripts/vue2-pattern-scan.sh` reports **0** for: filters, `$set/$delete`, `slot=`/`slot-scope`, `.sync`, `::v-deep`, `$listeners`, `$root.$on`, `require(` in `src/`, `q-table :data`
- [ ] `npm test` (store + services vs emulators) green, and matches the Vue 2 baseline results from A2
- [ ] Route smoke audit: all routes (public + seeded authenticated) render with zero console errors, zero compat/deprecation warnings
- [ ] `quasar dev -m ssr` and `quasar build -m ssr` succeed; SSR HTML renders content; no hydration warnings; `/api/*` routes work
- [ ] PWA service worker generated and installable
- [ ] Docker image builds and serves
- [ ] E2 manual checklist signed off against a real dev Firebase project
- [ ] Dev-server cold-start + HMR timings recorded before/after (the Vite payoff, for the release notes)
- [ ] CLAUDE.md updated to the new stack; `overrides` pruned; `npm audit` re-triaged
