# Firebase Local Emulator Suite for local/sandbox dev — findings & plan

**Status: IMPLEMENTED.** Verified end-to-end against the emulator suite
(Auth + RTDB + Storage) with no real credentials — see §9 checklist, all done.

Goal: let the app run fully offline (sandboxes, git worktrees, CI) against the
Firebase Local Emulator Suite with permissive local-only rules, no real
credentials, while production/acceptance/dev keep using real Firebase untouched.

---

## 1. Current Firebase architecture

There are **two separate Firebase surfaces** in this repo, and both must be
pointed at the emulator for offline dev to work.

### 1a. Client SDK — `src/firebase.js` (v8 namespaced, runs in browser AND in Node during SSR)

```js
// src/firebase.js (current, complete)
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const config = {
	apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
	authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
};

if (!firebase.apps.length) {
	firebase.initializeApp(config);
}

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
const functions = firebase.functions();

export { firebase, auth, db, storage, functions };
```

- 60+ files import from `src/firebase` (services, Vuex modules, views,
  mixins, boot files). Many create **module-level refs at import time**
  (e.g. `const users_ref = db.ref("users")` in `src/store/modules/user.js:11`,
  `const STORAGE_REF = storage.ref("npcs")` in `src/services/npcs.js:5`).
  Because they all import `src/firebase` first, any `useEmulator()` call placed
  inside `src/firebase.js` (before the exports are consumed) runs before any
  ref is created — this is the correct and only safe wiring point.
- **SSR**: the `firebase-auth` boot file is client-only
  (`quasar.conf.js:27` — `{ path: "firebase-auth", server: false }`), but the
  module itself is part of the server bundle: `src/store/store.js:3` imports
  `auth`, and `App.vue`'s `preFetch` (src/App.vue:65) decodes the
  `access_token` cookie and dispatches `setUserInfo` / `initialize`, which read
  RTDB **on the server** through the v8 client SDK. So `src/firebase.js`
  executes in both browser and Node, and the emulator switch must work in both.

### 1b. Admin SDK — `src-ssr/api/index.js` (firebase-admin 13.6.0)

```js
// src-ssr/api/index.js:11-25 (current)
const serviceAccountFilePath = path.resolve(process.cwd(), "firebaseServiceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFilePath, "utf8"));

process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
		});
	} catch (e) { console.error(e); }
}
```

⚠️ **Blocker for offline dev**: `src-ssr/extension.js` is loaded by the dev
server too (`quasar dev -m ssr`), and it `require("./api")` at startup. The
service-account file is read **synchronously at module load, outside the
try/catch** — if `firebaseServiceAccountKey.json` (gitignored) is absent, the
dev server crashes on boot. This must become conditional.

Admin SDK usage is confined to the `/api/ai/generate-monster` route:
`admin.auth().verifyIdToken()` plus RTDB reads/writes under `tiers`,
`users/{uid}`, `new_patrons`. The other `/api` routes (Patreon, via
`src/services/patreon.js`) don't touch Firebase at all.

### 1c. Versions (from package-lock.json)

| Package | package.json | Locked |
|---|---|---|
| `firebase` (client v8) | `^8.0.0` | **8.10.1** |
| `firebase-admin` | `^13.4.0` | **13.6.0** |

`useEmulator()` availability in the v8 client SDK vs the pinned 8.10.1:

| API | Added in | Available at 8.10.1 |
|---|---|---|
| `firebase.auth().useEmulator(url, { disableWarnings })` | 8.0.0 (option 8.2.x) | ✅ |
| `firebase.database().useEmulator(host, port)` | 8.0.0 | ✅ |
| `firebase.storage().useEmulator(host, port)` | 8.6.0 | ✅ |
| `firebase.functions().useEmulator(host, port)` | 8.4.0 | ✅ (not needed, see §3) |

firebase-admin 13.x auto-detects the standard env vars
`FIREBASE_DATABASE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` — no code-level
`useEmulator` exists or is needed on the admin side; with those set,
`verifyIdToken` also accepts (unsigned) emulator ID tokens.

---

## 2. Env vars consumed (Firebase-relevant)

All loaded from `.env.${NODE_ENV}.local` (gitignored; `.env.dist` is the
tracked template) via dotenv in three places:

1. `quasar.conf.js:52` — `build.env: require("dotenv").config({ path: \`.env.${NODE_ENV}.local\` }).parsed`
   → injected by webpack DefinePlugin into **both** client and server bundles
   (build-time string replacement of `process.env.VUE_APP_*`).
2. `src-ssr/extension.js:14` — runtime dotenv for the dev+prod express layer
   (this is what `src-ssr/api/index.js` reads at runtime).
3. `src-ssr/index.js:18` — runtime dotenv for the production server.

| Env var | Consumed at | Needed for emulator? | Dummy value that works |
|---|---|---|---|
| `VUE_APP_FIREBASE_API_KEY` | client config | Yes — `auth()` requires a non-empty string; the Auth emulator never validates it | `demo-api-key` |
| `VUE_APP_FIREBASE_AUTH_DOMAIN` | client config | Effectively unused with Auth emulator (only used for hosted redirect flows) | `localhost` |
| `VUE_APP_FIREBASE_DATABASE_URL` | client config + admin init | **Yes — strictly required.** v8 `database()` throws without it; it also supplies the emulator *namespace* (subdomain), for both client and admin | `https://demo-shieldmaiden-default-rtdb.firebaseio.com` |
| `VUE_APP_FIREBASE_PROJECT_ID` | client config | Yes — used by Auth/Storage emulator routing; must match the `--project` the emulator runs under | `demo-shieldmaiden` |
| `VUE_APP_FIREBASE_STORAGE_BUCKET` | client config | Yes — `storage.ref()` is called at import time (`src/services/npcs.js:5`, `players.js:6`) and throws without a bucket | `demo-shieldmaiden.appspot.com` |
| `VUE_APP_FIREBASE_MESSAGING_SENDER_ID` | client config | No — FCM is never used in app code | `000000000000` (or omit) |
| `firebaseServiceAccountKey.json` (file, not env var) | `src-ssr/api/index.js:11` | **No — must be skipped in emulator mode** (admin SDK needs no credential against emulators) | n/a |

Non-Firebase env vars that still matter for a working offline app (out of
emulator scope, listed for completeness): `VUE_APP_HK_API_ROOT` (external
compendium API — see §7), `VUE_APP_PATREON_CLIENT_ID/SECRET`,
`MONSTER_GENERATOR_URL/API_KEY` (external services; features degrade offline).

**Strictly required for RTDB to connect**: only `databaseURL`. Everything else
above is required only because other products initialize eagerly in
`src/firebase.js` / service modules.

### Why startup currently fails without credentials

If `.env.${NODE_ENV}.local` is missing, `dotenv.config().parsed` is
`undefined`, so every `VUE_APP_*` is `undefined` at build time →
`firebase.database()` throws "Can't determine Firebase Database URL", and the
SSR API layer crashes reading the service-account file. Both failure modes are
removed by the plan below.

---

## 3. Firebase products actually used → what to emulate

| Product | Used? | Where | Emulate? |
|---|---|---|---|
| **Realtime Database** | Heavy — primary datastore | all services, Vuex modules, presence (`.info/connected`, `onDisconnect`, `ServerValue.TIMESTAMP`, `serverTimeOffset` in `src/services/serverUtils.js`) | ✅ yes (port 9000) |
| **Auth** | Heavy | email/password (`SignIn.vue`, `SignUp.vue`), Google `signInWithPopup`/`signInWithRedirect`, `onAuthStateChanged` boot, ID-token cookie for SSR | ✅ yes (port 9099) |
| **Storage** | Moderate | NPC & player avatar uploads (`src/services/npcs.js`, `src/services/players.js` — `storage.ref("npcs"/"players")`, `.put(blob)`, delete) | ✅ yes (port 9199) |
| **Cloud Functions** | One callable | `functions.httpsCallable("updateUsersEndpoint")` in `src/utils/exports/UserDataExport.js` (admin-only export tool) | ❌ no — the function's **source is not in this repo**, so there is nothing to emulate. `firebase.functions()` initializes harmlessly without an emulator; the one admin tool will fail offline (acceptable) |
| Firestore / Analytics / Messaging | Not used | — | ❌ no |

---

## 4. Auth dependency in write paths → Auth emulator is required, not optional

Even with fully open RTDB rules, the app cannot function without a signed-in
user, because **uids come from the Auth SDK, not from rules**:

- Data paths are built from uid everywhere: `users/${uid}`, `campaigns/${uid}`,
  `encounters/${uid}`, `status/${uid}`, `broadcast/${uid}`, `settings/${uid}`, …
- `src/boot/firebase-auth.js` drives the whole session: `onAuthStateChanged` →
  presence writes + sets the `access_token` cookie from `user.getIdToken(true)`.
- `src/store/store.js:24` reads `auth.currentUser`.
- SSR `preFetch` (App.vue:65) `jwt_decode`s that cookie to get
  `user_id` and prefetches the user's data server-side. Note: `jwt-decode`
  does **not** verify signatures, so the Auth emulator's unsigned
  (`alg: "none"`) ID tokens decode fine here.
- `src-ssr/api/index.js:48` uses `admin.auth().verifyIdToken(idToken)` — works
  against emulator tokens when `FIREBASE_AUTH_EMULATOR_HOST` is set.

Conclusion: run the **Auth emulator** and sign up a throwaway user (email/
password works fully offline; the emulator also fakes Google popup/redirect
sign-in with synthetic accounts). No stubbing needed in app code.

---

## 5. RTDB namespacing (prd / acc / dev)

The environment split is done **entirely via `VUE_APP_FIREBASE_DATABASE_URL`**
in the per-env `.env.*.local` files — there are no hardcoded namespaces or
environment-dependent root paths in code (the only env branching is cosmetic:
`VUE_APP_ENV_NAME` toggles a header banner and noindex meta).

In v8, `db.useEmulator(host, port)` keeps the **namespace parsed from the
configured `databaseURL` subdomain**. The emulator auto-creates namespaces on
first access and applies the single rules file from `firebase.json` to every
namespace. So setting
`VUE_APP_FIREBASE_DATABASE_URL=https://demo-shieldmaiden-default-rtdb.firebaseio.com`
gives the emulator namespace `demo-shieldmaiden-default-rtdb` consistently for
client and admin (admin derives `http://<emulator-host>/?ns=<same>` from the
same var). No code changes needed for namespacing.

The `demo-` project-id prefix is deliberate: Firebase CLI treats `demo-*`
projects as emulator-only — no login, no possibility of touching a real
project.

---

## 6. Proposed design

### 6a. Files to add (all new, nothing existing is touched except the three wiring points)

```
firebase.emulator.json          # emulator-only config (NOT named firebase.json — see guardrail)
emulator/database.rules.json    # open RTDB rules, local only
emulator/storage.rules          # open Storage rules, local only
.env.emulator                   # tracked, contains ONLY dummy/demo values (no secrets)
```

**Guardrail — keeping permissive rules local-only**: the config is named
`firebase.emulator.json` (not `firebase.json`) and there is no `.firebaserc`.
A stray `firebase deploy` in the repo root therefore finds no config/project
and fails; the open rules can only ever be loaded via the explicit
`emulators:start --config firebase.emulator.json --project demo-shieldmaiden`
invocation, and `demo-*` projects cannot deploy at all. Real prd/acc/dev rules
(managed outside this repo) are untouched.

```jsonc
// firebase.emulator.json (proposed)
{
	"database": { "rules": "emulator/database.rules.json" },
	"storage": { "rules": "emulator/storage.rules" },
	"emulators": {
		"auth":     { "port": 9099 },
		"database": { "port": 9000 },
		"storage":  { "port": 9199 },
		"ui":       { "enabled": true, "port": 4000 },
		"singleProjectMode": true
	}
}
```

```json
// emulator/database.rules.json (proposed — iteration 1: fully open)
{ "rules": { ".read": true, ".write": true } }
```

```
// emulator/storage.rules (proposed — iteration 1: fully open)
rules_version = '2';
service firebase.storage {
	match /b/{bucket}/o {
		match /{allPaths=**} {
			allow read, write: if true;
		}
	}
}
```

```bash
# .env.emulator (proposed — tracked; dummy values only)
NODE_ENV=development
VUE_APP_ENV_NAME=develop

# Emulator switch (client+SSR bundle flag, and runtime flag for the express/admin layer)
VUE_APP_USE_FIREBASE_EMULATOR=true
USE_FIREBASE_EMULATOR=true

# Dummy Firebase config — demo- prefix = emulator-only project
VUE_APP_FIREBASE_API_KEY=demo-api-key
VUE_APP_FIREBASE_AUTH_DOMAIN=localhost
VUE_APP_FIREBASE_DATABASE_URL=https://demo-shieldmaiden-default-rtdb.firebaseio.com
VUE_APP_FIREBASE_PROJECT_ID=demo-shieldmaiden
VUE_APP_FIREBASE_STORAGE_BUCKET=demo-shieldmaiden.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000

# firebase-admin auto-detects these and skips real credentials
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# External (non-Firebase) services — left pointing at real endpoints; degrade offline
VUE_APP_HK_API_ROOT=https://api.harmlesskey.com
```

### 6b. Wiring point 1 — `src/firebase.js` (covers browser + SSR render, single place)

```js
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
const functions = firebase.functions();

// Webpack DefinePlugin inlines this at build time in BOTH client and server
// bundles, so the whole block is dead-code-eliminated in real builds.
if (process.env.VUE_APP_USE_FIREBASE_EMULATOR === "true") {
	// useEmulator throws if the database instance has already performed an
	// operation (can happen on SSR dev-server rebuilds, where firebase.apps
	// survives in the Node process while modules re-evaluate).
	try {
		auth.useEmulator("http://localhost:9099", { disableWarnings: true });
		db.useEmulator("localhost", 9000);
		storage.useEmulator("localhost", 9199);
	} catch (e) {
		// already wired from a previous evaluation — safe to ignore
	}
}
```

This sits before any consumer module creates refs (see §1a), so it is the
single conditional needed for the entire client-SDK surface, on both server
and client.

### 6c. Wiring point 2 — `src-ssr/api/index.js` (admin SDK + the crash fix)

```js
const USE_EMULATOR = process.env.USE_FIREBASE_EMULATOR === "true";

if (!admin.apps.length) {
	if (USE_EMULATOR) {
		// FIREBASE_*_EMULATOR_HOST (from .env.emulator) make admin target the
		// emulators with no credential; databaseURL supplies the namespace.
		admin.initializeApp({
			projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
			databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
		});
	} else {
		// existing service-account path, with the sync read MOVED INSIDE the
		// branch so emulator mode never needs firebaseServiceAccountKey.json
		const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFilePath, "utf8"));
		process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
		});
	}
}
```

### 6d. Wiring point 3 — env-file selection (flag flow through Quasar)

The flag must reach three dotenv call sites. Proposal: select `.env.emulator`
when `USE_FIREBASE_EMULATOR=true` is set in the shell, **or** as automatic
fallback when `.env.${NODE_ENV}.local` doesn't exist (the sandbox/worktree
case — zero setup):

```js
// shared helper, e.g. env.js in repo root (used by quasar.conf.js,
// src-ssr/extension.js, src-ssr/index.js)
const fs = require("fs");
const path = require("path");

module.exports = function resolveEnvFile(baseDir) {
	const local = path.resolve(baseDir, `.env.${process.env.NODE_ENV}.local`);
	if (process.env.USE_FIREBASE_EMULATOR === "true" || !fs.existsSync(local)) {
		return path.resolve(baseDir, ".env.emulator");
	}
	return local;
};
```

- `quasar.conf.js` → `env: require("dotenv").config({ path: resolveEnvFile(__dirname) }).parsed`
  → DefinePlugin injects `VUE_APP_USE_FIREBASE_EMULATOR` into client **and**
  server bundles (this is how the flag reaches `src/firebase.js` in both).
- `src-ssr/extension.js` / `src-ssr/index.js` → same helper → runtime
  `process.env` for the express/admin layer (`USE_FIREBASE_EMULATOR`,
  `FIREBASE_*_EMULATOR_HOST`).

Developers with a real `.env.development.local` are unaffected; sandboxes with
no env file get the emulator automatically.

### 6e. npm scripts + tooling

```jsonc
// package.json additions (proposed)
"scripts": {
	"emulators": "firebase emulators:start --config firebase.emulator.json --project demo-shieldmaiden",
	"ssr:emulator": "USE_FIREBASE_EMULATOR=true quasar dev -m ssr"
},
"devDependencies": {
	"firebase-tools": "^14.x"   // or rely on npx firebase-tools
}
```

Prerequisite: the RTDB and Storage emulators need a **Java JRE (11+)** in the
sandbox image; the Auth emulator is pure Node. `firebase-tools` v14 needs
Node 20+ (repo already requires Node ≥ 24).

Dev loop: terminal 1 `npm run emulators`, terminal 2 `npm run ssr` (or
`ssr:emulator` to force). Sign up a throwaway user via the app's own sign-up
form (or the emulator UI at :4000) and work normally.

### 6f. Designed-for-later (explicitly NOT in iteration 1)

- **Seed data**: `firebase emulators:start --import ./emulator/seed
  --export-on-exit` slots straight into the `emulators` script later; the
  `emulator/` dir is where seed exports would live.
- **Realistic rules**: replace `emulator/database.rules.json` contents with a
  copy of the real ruleset when desired; no other changes needed.

---

## 7. Blockers & fidelity gaps

1. **`firebaseServiceAccountKey.json` crash** (§1b) — dev SSR currently cannot
   boot without this secret file; fixed by wiring point 2. This is the only
   *blocking* code change besides the emulator wiring itself.
2. **Compendium content is not Firebase**: spells/monsters/items/conditions
   come from the external HK API (`VUE_APP_HK_API_ROOT`, `src/services/api/*`).
   The emulator does not cover this; a fully offline sandbox will have an
   empty compendium unless the network policy allows that host. Out of scope
   here, but worth knowing the app is not 100% offline after this work.
3. **Cloud Functions callable** `updateUsersEndpoint` (admin export tool) has
   no source in this repo → not emulatable → fails offline. Low impact.
4. **External integrations** (Patreon OAuth, AI monster generator at
   `MONSTER_GENERATOR_URL`, D&D Beyond character sync) keep needing network;
   they fail gracefully per-feature.
5. **v8 `useEmulator` re-entry quirk** on SSR dev-server rebuilds — handled
   with the try/catch in §6b.
6. **`src/services/patreon.js:3` hardcodes `dotenv.config({ path: ".env.production.local" })`**
   — a pre-existing oddity; harmless for the emulator plan (it only reads
   Patreon vars) but worth cleaning up separately.
7. **Google sign-in fidelity**: the Auth emulator fakes the Google
   popup/redirect with synthetic accounts — fine for dev, but it never tests
   real OAuth config.
8. **Java dependency** in sandbox images (§6e).

## 8. Could not be determined without the real env var values

- The actual prd/acc/dev `databaseURL` namespaces / project IDs — irrelevant to
  the emulator design (we substitute `demo-*` values), but it means I could not
  verify whether acc/dev share data shapes with prd. Seed data (later
  iteration) will need a real export from one of them.
- Whether `VUE_APP_FIREBASE_AUTH_DOMAIN` is a custom domain with special
  redirect handling in production (only affects real Google sign-in, not the
  emulator path).
- Whether a dev instance of the HK content API exists that sandboxes could be
  allowed to reach.

---

## 9. Implementation checklist (next iteration, after review)

1. Add `firebase.emulator.json`, `emulator/database.rules.json`,
   `emulator/storage.rules`, `.env.emulator` (ensure `.gitignore`'s `.env*`
   pattern gets a `!.env.emulator` exception).
2. Add the `resolveEnvFile` helper; use it in `quasar.conf.js`,
   `src-ssr/extension.js`, `src-ssr/index.js`.
3. Add the conditional `useEmulator()` block to `src/firebase.js`.
4. Make the admin init in `src-ssr/api/index.js` conditional (move the
   service-account read inside the non-emulator branch).
5. Add `emulators` / `ssr:emulator` npm scripts + `firebase-tools` devDependency.
6. Verify: `npm run emulators` + `npm run ssr` with no `.env.*.local` present →
   app boots, sign-up works, campaign/encounter CRUD works, avatar upload
   works, SSR-rendered authenticated pages work; then verify a real
   `.env.development.local` still routes to real Firebase untouched.
