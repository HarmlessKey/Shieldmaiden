# Test suite

Unit + integration tests for the **store** (`src/store`) and **service**
(`src/services`) layers, run with [Jest](https://jestjs.io/) against the
**Firebase Local Emulator Suite** (Auth + Realtime Database + Storage).

No real Firebase credentials are involved — everything points at the local
emulator (`demo-shieldmaiden` project, permissive rules in `emulator/`).

## Running

```bash
npm test          # starts the emulators, runs the whole suite, tears them down
npm run test:run  # runs Jest only (assumes emulators are already up)
npm run emulators # start the emulators manually (for watch mode / the IDE)
```

`npm test` wraps Jest in `firebase emulators:exec`, so a single command spins
up the emulators, runs the suite, and shuts them down. Java is required (the
emulators run on the JVM).

The suite also runs automatically on **`git commit`** via the Husky
`pre-commit` hook. Set `SKIP_TESTS=1 git commit …` to bypass it.

## Layout

```
test/
  setup/
    env.js        # loads .env.emulator + sets the emulator flag before src/firebase loads
    jestSetup.js  # wipes the DB before each test, goes offline after each file
  helpers/
    db.js         # seed / read / push / clearDatabase / waitFor against the emulator
    store.js      # makeStore() — builds a real Vuex store around a module under test
  services/       # one *.test.js per src/services file
  store/          # one *.test.js per src/store module
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

Tests run serially (`maxWorkers: 1`) because they share one emulator DB and
reset it between tests.

### Pure-logic / HTTP services

A few services don't touch Firebase: `subscription.js` is pure logic (tested
directly), and `monster_generator.js`, `patreon.js`, `shieldmaiden_ai.js` and
`services/api/*` call the HTTP API (tested with `axios` mocked).
