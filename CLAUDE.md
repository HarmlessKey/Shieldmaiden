# Shieldmaiden

D&D combat tracker web app built with Vue 2 + Quasar 1 + Firebase.

## Tech Stack

- **Framework**: Vue 2.7 + Quasar 1 (SSR mode)
- **Build**: Webpack 4 via `@quasar/app ~2.4.3`
- **Backend**: Firebase v8 (namespaced API — do NOT migrate to modular v10+ API)
- **State**: Vuex with modules in `src/store/modules/`
- **Node**: >= 24, npm >= 10.2.4

## Dev Commands

```bash
npm run ssr       # Start dev server (SSR mode)
npm run build     # quasar build -m ssr
npm run lint      # ESLint
```

## Key Constraints

- **Firebase v8 namespaced API** is used across 63+ files — do not switch to modular API
- Vue 2 / Quasar 1 ecosystem locks transitive deps (postcss 7, webpack 4, etc.)
- Many audit vulnerabilities are unfixable without framework migration — do not attempt to fix them
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
