# Test suite

Unit + integration tests for the **store** (`src/store`) and **service**
(`src/services`) layers, run with [Vitest](https://vitest.dev/) against the
**Firebase Local Emulator Suite** (Auth + Realtime Database + Storage).

No real Firebase credentials are involved — everything points at the local
emulator (`demo-shieldmaiden` project, permissive rules in `emulator/`).

## Running

```bash
npm test          # starts the emulators, runs the whole suite, tears them down
npm run test:run  # runs Vitest only (assumes emulators are already up)
npm run test:watch# emulators + Vitest in watch mode
npm run emulators # start the emulators manually (for the IDE)
```

`npm test` wraps Vitest in `firebase emulators:exec`, so a single command spins
up the emulators, runs the suite, and shuts them down. Java is required (the
emulators run on the JVM).

The suite also runs automatically on **`git commit`** via the Husky
`pre-commit` hook. Set `SKIP_TESTS=1 git commit …` to bypass it.

## Layout

```
test/
  setup/
    env.js            # loads .env.emulator + sets the emulator flag before src/firebase loads
    emulatorSetup.js  # wipes the DB before each test, goes offline after each file
  helpers/
    db.js             # seed / read / push / clearDatabase / waitFor against the emulator
    store.js          # makeStore() — builds a real Vuex store around a module under test
  services/           # one *.test.js per src/services file
  store/              # one *.test.js per src/store module
```

## How it works

`src/firebase.js` calls `useEmulator()` whenever
`VUE_APP_USE_FIREBASE_EMULATOR === "true"`. `test/setup/env.js` sets that flag
(via `.env.emulator`) **before** any test imports `src/firebase`, so every
`db.ref(...)` created at service/module import time is already wired to the
emulator. Tests then:

- **Service tests** — call service methods and assert the resulting DB state
  (seed with `helpers/db`, read it back).
- **Store tests** — build a real namespaced Vuex store with `makeStore()`,
  stubbing root getters (`user`, `tier`, …) and root actions, and assert
  mutations, getters and action orchestration. Actions that hit a service run
  against the emulator end-to-end.

Tests run serially (`fileParallelism: false`) because they share one emulator DB
and reset it between tests.

### Mocking notes (Vitest + CommonJS)

`vi.mock` only intercepts **ESM `import`**, not CommonJS `require()`. Several
services `require()` their HTTP client, so the tests use targeted techniques:

- **`subscription.js`** — pure logic, tested directly (no emulator, no mocks).
- **`services/api/*`** — `import axios`, so `vi.mock("axios")` works.
- **`patreon.js`** — `require("axios")`; the test `require`s axios too (same
  singleton) and `vi.spyOn`s `create`.
- **`monster_generator.js`** (CJS) / **`shieldmaiden_ai.js`** (ESM) — both
  `require("node-fetch")` and call the bare function. The tests inject a callable
  mock into the Node `require` cache before loading the service.

### Fire-and-forget writes

Some service methods don't `await`/return their full promise chain (e.g. a
secondary `search_*` write, or a Storage image delete). Tests assert those with
the `waitFor(...)` poll helper, and stub the Storage `Reference.delete` where an
un-awaited delete would otherwise leave an unhandled rejection.
