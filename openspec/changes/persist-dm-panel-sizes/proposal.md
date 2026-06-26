## Why

On the DM screen (`RunCampaign.vue`), the splitter panels (Encounters, Players, SoundBoard, Share, Resources) can be resized by dragging, but the sizes reset to hardcoded defaults on every reload. DMs lose their preferred layout between sessions, which is a recurring papercut during long campaigns.

## What Changes

- Persist user-adjusted pane sizes for the DM screen splitters across page reloads.
- Store sizes as **percentages** (the format splitpanes already emits/consumes), so they remain layout-relative and adapt automatically across different screen resolutions.
- Persist per device (browser `localStorage`) — not per user account — to keep the change scoped and avoid Firebase writes.
- Persist sizes only for the current responsive breakpoint layout (`container.width >= lg` — the three-column layout with nested splitters). Other breakpoints (mobile/tablet/legacy) continue to use the existing hardcoded defaults to keep the scope tight.
- Fall back to existing defaults when no saved sizes exist or stored values are invalid/corrupt.

## Capabilities

### New Capabilities
- `dm-screen-layout`: persistence of resizable panel layout on the campaign DM screen, including read/write to browser storage, validation of stored values, and graceful fallback to defaults.

### Modified Capabilities
<!-- None — no existing OpenSpec capability covers this. -->

## Impact

- **Code**: `src/views/UserContent/Campaigns/RunCampaign.vue` (template bindings, `paneSize` method, new resize handlers, mount hook). One small new utility for storage read/write (likely in `src/utils/generalFunctions.js` or a new `src/utils/dmScreenLayout.js`).
- **APIs**: none. No backend changes.
- **Dependencies**: none added. Uses existing `splitpanes` `resized` event and browser `localStorage`.
- **Storage**: a single `localStorage` key (e.g. `dm-screen-panes`) holding a small JSON object of percentages.
- **Risk**: low — purely client-side, easy to clear by removing the key.
