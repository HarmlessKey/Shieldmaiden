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

## File Editing Rules

- **Always use the `Edit` or `Write` tools** to modify files — never use Bash, `sed`, `awk`, `python`, or `node` for file editing
- If the `Edit` tool fails due to whitespace mismatches, investigate the exact characters with `cat -A` and adjust the match — do not fall back to shell scripts

## Vue Component Rules

- `computed`, `data`, `methods`, `watch`, `props` and all other component options can only appear **once** per Vue component — JavaScript silently discards the first when two keys share the same name. Always merge into a single block rather than adding a second one.

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

## Planning with OpenSpec
We use [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven development. Everything lives in `openspec/`:
- `openspec/specs/` — current source-of-truth specs per capability
- `openspec/changes/<change-name>/` — active change proposals (proposal, design, specs deltas, tasks)
- `openspec/changes/archive/` — completed changes
- `.planning/` is legacy — read it for historical context only, do not add new specs there

Workflow (skills / `/opsx:*` commands):
- `/opsx:explore` — think through an idea or problem before committing to a change
- `/opsx:propose` — create a change with all artifacts (proposal, design, specs, tasks)
- `/opsx:apply` — implement the tasks of an existing change
- `/opsx:archive` — archive a change once it is implemented

Rules:
- Always check `openspec/changes/` and `openspec/specs/` for an existing change or spec before investigating or implementing anything
- **When asked to develop a feature, always propose an OpenSpec change first** (`/opsx:propose`) and wait for the user to review it before implementing
- Never begin implementing a feature without an OpenSpec change present in `openspec/changes/`
- Small fixes or requests that are clearly not a feature (typos, one-line bug fixes, config tweaks, dependency bumps, docs) don't need a spec
- If you're uncertain whether something warrants a spec, ask the user whether to create one before starting
- When proposing a new change, first check `openspec/changes/` for un-archived changes that are already implemented (all tasks done, or merged into `develop`) and suggest archiving them (`/opsx:archive`)
- Before creating a PR, check whether the branch contains un-archived changes and nudge the user to archive them first — we don't publish open OpenSpec changes


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
