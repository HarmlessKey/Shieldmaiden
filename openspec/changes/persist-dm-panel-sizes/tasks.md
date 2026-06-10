## 1. Storage helper

- [x] 1.1 Create `src/utils/dmScreenLayout.js` with `DEFAULT_PANE_SIZES`, `STORAGE_KEY = "dm-screen-panes-v1"`, and known-pane allowlist (`left`, `left-top`, `mid`, `mid-top`, `right`)
- [x] 1.2 Implement `loadPaneSizes()` — SSR-guard (`typeof window`), try/catch around `JSON.parse`, validate each key is allowlisted and each value is a finite number in `[20, 80]`, drop bad entries, return `{ ...DEFAULT_PANE_SIZES, ...validStored }`
- [x] 1.3 Implement `savePaneSizes(partial)` — SSR-guard, merge with currently stored object, validate, wrap `setItem` in try/catch so quota/disabled storage is a silent no-op

## 2. Wire helper into `RunCampaign.vue`

- [x] 2.1 Import `loadPaneSizes` and `savePaneSizes` from `src/utils/dmScreenLayout.js`
- [x] 2.2 Add reactive `panes` to `data()` initialized via `loadPaneSizes()`
- [x] 2.3 Replace each `:size="paneSize('<name>')"` binding on the wide layout (`container.width >= lg`) with `:size="panes.<name>"`, and `100 - paneSize('left-top')` / `100 - paneSize('mid-top')` with `100 - panes['left-top']` / `100 - panes['mid-top']`
- [x] 2.4 Keep the existing `paneSize` method as the source of `DEFAULT_PANE_SIZES` (or delete it once defaults live in the helper) — pick one and remove the dead path
- [x] 2.5 Leave mobile, tablet, and legacy splitter blocks (`container.width < lg`, `legacy_layout`) untouched

## 3. Resize handlers

- [x] 3.1 Add `onOuterResized(sizes)` — maps splitpanes' emitted array to `{ left, mid, right }` in template order and calls `savePaneSizes` + updates local `panes`
- [x] 3.2 Add `onLeftResized(sizes)` — maps to `{ "left-top": sizes[0].size }`
- [x] 3.3 Add `onMidResized(sizes)` — maps to `{ "mid-top": sizes[0].size }`
- [x] 3.4 Bind `@resized` on the three corresponding `<Splitpanes>` elements in the wide layout

## 4. Manual verification

- [ ] 4.1 Run `npm run ssr` and open a campaign at >= `lg` width; drag each splitter, reload, confirm sizes are restored
- [ ] 4.2 Resize the browser window to a different width and reload; confirm proportions (not pixels) are preserved
- [ ] 4.3 In DevTools, set `localStorage["dm-screen-panes-v1"]` to invalid JSON, an out-of-range value, and an unknown key; reload and confirm graceful fallback to defaults for the bad entries
- [ ] 4.4 Confirm mobile (narrow viewport) and `legacy_campaign_layout` enabled both still render with their existing hardcoded sizes and write nothing to storage
- [x] 4.5 Run `npm run lint` and fix any issues introduced

## 5. Wrap up

- [ ] 5.1 Commit on `feature/persist-dm-panel-sizes` and push
- [ ] 5.2 Open PR `feature/persist-dm-panel-sizes` → `develop` (per Git Flow in CLAUDE.md)
