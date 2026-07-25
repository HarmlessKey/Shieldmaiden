# Shieldmaiden

D&D combat tracker web app built with Vue 3 + Quasar 2 + Firebase.

## Tech Stack

- **Framework**: Vue 3 + Quasar 2 (SSR mode), Options API (no Composition API rewrite)
- **Build**: Webpack 5 via `@quasar/app-webpack ^3`
- **Backend**: Firebase v8 (namespaced API — do NOT migrate to modular v10+ API)
- **State**: Vuex 4 with modules in `src/store/modules/`
- **Validation**: vee-validate v4 (`ValidationObserver`/`ValidationProvider` are global aliases for `Form`/`Field`)
- **Notifications**: Quasar Notify/Dialog via `src/utils/notify.js` (vue-snotify is gone)
- **Node**: >= 24, npm >= 10.2.4

## Migrating Vue 2 Code

Branches created before the Vue 3 migration contain Vue 2 syntax. When merging
such a branch (or writing code by example from an old branch), follow
**[VUE3_MIGRATION_GUIDE.md](./VUE3_MIGRATION_GUIDE.md)** — it covers the merge
procedure, per-pattern conversion cheat sheet (slots, $set/$delete, Quasar v2
renames, vee-validate v4, snotify), git conflict-resolution strategies, the
mandatory post-merge pattern sweep, and the runtime pitfalls that don't show
up as build errors.

## Dev Commands

```bash
npm run ssr       # Start dev server (SSR mode)
npm run build     # quasar build -m ssr
npm run lint      # ESLint
```

## File Editing Rules

- **Always use the `Edit` or `Write` tools** to modify files — never use Bash, `sed`, `awk`, `python`, or `node` for file editing
- If the `Edit` tool fails due to whitespace mismatches, investigate the exact characters with `cat -A` and adjust the match — do not fall back to shell scripts

## Vue Component Rules

- `computed`, `data`, `methods`, `watch`, `props` and all other component options can only appear **once** per Vue component — JavaScript silently discards the first when two keys share the same name. Always merge into a single block rather than adding a second one.

## Key Constraints

- **Firebase v8 namespaced API** is used across 63+ files — do not switch to modular API
- Custom v-model components use a **dual contract**: `value`+`input` AND `modelValue`+`update:modelValue` (see `hk-input.vue`) — preserve it when editing them
- On Quasar form components use `@update:model-value`/`:model-value`, never `@input`/`:value` (dead handlers, no error)
- Regenerate the lockfile with `npx -y npm@11 install --package-lock-only` after dependency changes — npm 10 on Linux drops `fsevents` and the Docker build's `npm ci` then fails
- `package.json` uses `overrides` to force-update transitive deps

## Project Structure

```
src/
  boot/           # Quasar boot files (plugins, firebase-auth, etc.)
  components/     # Vue components
  layouts/        # App layouts
  views/          # Page-level views
  store/          # Vuex store
    modules/
      userContent/  # User data (campaigns, encounters, players, etc.)
      content/      # API content (spells, monsters, items, conditions)
  services/       # Firebase service layer (one file per resource)
  utils/
    generalFunctions.js  # Shared utility functions
    generalConstants.js  # Shared constants
```

## Patterns

- Services in `src/services/` handle Firebase reads/writes
- Vuex modules dispatch to services and cache results in state
- Extension communication uses `window.postMessage` bridge (not `chrome.runtime` directly)
- Utility functions go in `src/utils/generalFunctions.js`

## Planning Artifacts
Feature specs live in `.planning/`. 
- Always check `.planning/` for an existing spec before investigating or implementing anything
- When writing a spec, always write it to `.planning/<feature-name>.md`
- Never begin implementation without a spec file present in `.planning/`


## Git Workflow

We use **Git Flow**. Follow these rules strictly:

### Branch Structure
- `main` — production releases only
- `develop` — integration branch
- `feature/*` — new features, branched from `develop`
- `release/*` — release preparation, branched from `develop`
- `hotfix/*` — urgent production fixes, branched from `main`

### Merging Rules
- **Features**: open a PR from `feature/*` → `develop`
- **Releases**: merge `release/*` → `main` AND `develop` (no PR required)
- **Hotfixes**: merge `hotfix/*` → `main` AND `develop` (no PR required)
- Never merge features directly to `main`

### Tags
- Tag every merge to `main` with the version number (e.g. `2.39.2`)

### Commits & PRs
- Do NOT add Claude as a co-author in commits or PR descriptions
