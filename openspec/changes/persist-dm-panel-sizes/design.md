## Context

`src/views/UserContent/Campaigns/RunCampaign.vue` renders the DM screen with the [`splitpanes`](https://github.com/antoniandre/splitpanes) library (registered globally in `src/boot/plugins.js`). The wide-layout (`container.width >= lg`) uses a nested splitter structure:

- Outer horizontal splitter with three panes: `left` (SoundBoard + Share), `mid` (Encounters + Players), `right` (Resources)
- Left vertical splitter: `left-top` (SoundBoard) + remainder (Share)
- Mid vertical splitter: `mid-top` (Encounters) + remainder (Players)

Pane sizes are produced by the `paneSize(name)` method, which currently returns hardcoded percentages (25/45/30, 60, 50). Splitpanes emits a `resized` event with `[{ size, min, max }, ...]` on drag release, but the new sizes are never persisted, so reloads reset everything.

Mobile/tablet/legacy layouts use either tabs or fixed-size splitters; this change does not touch them.

## Goals / Non-Goals

**Goals:**
- Restore the user's last-chosen pane sizes for the wide DM layout on reload, in the same browser.
- Keep the implementation small, contained to `RunCampaign.vue` and one small storage helper.
- Store sizes as percentages so they remain layout-relative across screen resolutions automatically.
- Degrade gracefully when storage is unavailable, missing, or corrupt — always fall back to the existing defaults.

**Non-Goals:**
- Persisting layout per campaign or per user account (server-side). One layout per browser is enough.
- Persisting sizes for the mobile/tablet/legacy layouts.
- Adding a "reset to defaults" UI button (can be a follow-up; clearing localStorage works for now).
- Syncing across devices.

## Decisions

### 1. Persist sizes as percentages, not pixels

Splitpanes already operates in percent space, and percentages are inherently relative — the same value produces the same proportional layout at any window width. Storing pixels would require recomputing on every resolution change and would defeat the goal of cross-resolution consistency.

**Alternative considered:** storing pixel widths + recomputing on mount. Rejected — more code, more edge cases, no benefit over percentages.

### 2. Storage: single `localStorage` key with a JSON object

Key: `dm-screen-panes`. Value shape:
```json
{ "left": 25, "left-top": 60, "mid": 45, "mid-top": 50, "right": 30 }
```

One key keeps reads/writes atomic and easy to clear. The five pane names match the existing `paneSize(name)` switch cases.

**Alternative considered:** one key per pane. Rejected — five reads on mount is noisier with no benefit.

**Alternative considered:** Vuex + persisted state plugin. Rejected — overkill for a single view's UI preference; introduces a state dependency for a purely local concern.

### 3. Read on mount, write on `resized`

- On `mounted()` (or before first render), read and validate the stored object; merge over defaults.
- Bind each pane's `:size` to a reactive `panes` data object instead of the current pure-function `paneSize`.
- Wire `@resized` on each `Splitpanes` instance to a handler that maps emitted sizes back to named keys (in template order) and writes the updated object to `localStorage`.

Writing on `resized` (drag-release) — not during drag — avoids thrashing storage.

### 4. Validation and fallback

Stored values must be:
- a plain object
- each key one of the five known pane names
- each value a finite number between `min-size` (20) and 80

Any failure (parse error, schema mismatch, out-of-range value) → discard the stored object and use defaults. This protects against tampering and against future changes to pane names.

### 5. Helper location

Add a tiny module `src/utils/dmScreenLayout.js` exporting `loadPaneSizes()` and `savePaneSizes(partial)`. Keeping it out of `generalFunctions.js` avoids bloating the shared utility file with view-specific concerns.

### 6. SSR safety

The project runs in SSR mode (`quasar build -m ssr`). `localStorage` is unavailable on the server. The helper must guard with `typeof window !== "undefined"` and return `null` / no-op on the server. The DM screen is an authenticated client-only route in practice, but the guard is cheap insurance.

## Risks / Trade-offs

- **[Risk]** A stored layout from a much wider screen could feel cramped on a smaller screen → **Mitigation:** percentages already adapt, and `min-size="20"` on every pane prevents truly broken layouts; defaults remain available by clearing storage.
- **[Risk]** Future structural changes to the splitter tree (adding/removing a pane) would mismatch stored data → **Mitigation:** validation rejects unknown keys; unknown values silently fall back. Naming the storage key with a version suffix (e.g. `dm-screen-panes-v1`) lets us bump on breaking changes.
- **[Trade-off]** Per-browser persistence means a DM using two machines won't get a synced layout. Acceptable given the scope and zero backend cost.
- **[Risk]** `localStorage` quota exceeded or disabled (private mode) → **Mitigation:** wrap writes in try/catch; silently no-op on failure (functionality degrades to current behavior).
