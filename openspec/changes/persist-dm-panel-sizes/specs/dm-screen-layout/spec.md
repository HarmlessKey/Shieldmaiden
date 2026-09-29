## ADDED Requirements

### Requirement: Persist DM screen pane sizes across reloads

The system SHALL persist the user's adjusted pane sizes for the wide-layout DM screen (`RunCampaign.vue`, `container.width >= lg`) in the browser's `localStorage` and restore them on subsequent visits in the same browser.

#### Scenario: User resizes a pane and reloads
- **WHEN** the user drags a splitter to resize any of the named panes (`left`, `left-top`, `mid`, `mid-top`, `right`) and then reloads the page
- **THEN** the DM screen restores the panes to the most recently dragged sizes instead of the hardcoded defaults

#### Scenario: First visit with no stored layout
- **WHEN** the user opens the DM screen for the first time on this browser, with no entry in `localStorage`
- **THEN** the panes render at the existing hardcoded default sizes (left=25, mid=45, right=30, left-top=60, mid-top=50)

#### Scenario: User on a different screen resolution
- **WHEN** the user opens the DM screen on a browser at a different window width than when the layout was saved
- **THEN** the panes restore to the same relative proportions (percentages), preserving the visual aspect ratio of the saved layout

### Requirement: Persist sizes as relative percentages

The system SHALL store pane sizes as numeric percentages of their parent splitter (matching the `splitpanes` library's native unit) rather than absolute pixel values.

#### Scenario: Sizes round-trip as percentages
- **WHEN** the user drags a pane to a given proportion of the splitter and the value is persisted
- **THEN** the stored value is a finite number in the range `[20, 80]` representing percent

### Requirement: Save on drag release, not during drag

The system SHALL write the updated layout to storage in response to the splitter's drag-release event (the `splitpanes` `resized` event), not on every pixel of movement during the drag.

#### Scenario: Drag in progress
- **WHEN** the user is actively dragging a splitter
- **THEN** no write to `localStorage` occurs

#### Scenario: Drag released
- **WHEN** the user releases the splitter after a drag
- **THEN** exactly one write to `localStorage` occurs, containing the updated sizes for the affected panes

### Requirement: Graceful fallback on missing or invalid storage

The system SHALL fall back to the hardcoded default sizes when the stored layout is missing, malformed, or contains values that fail validation, and SHALL NOT raise an error visible to the user.

#### Scenario: Stored value is not valid JSON
- **WHEN** `localStorage` contains an unparseable string under the layout key
- **THEN** the DM screen renders with default sizes and the invalid entry is ignored (or overwritten on the next resize)

#### Scenario: Stored value contains out-of-range numbers
- **WHEN** a stored pane size is not a finite number in the range `[20, 80]`
- **THEN** that pane uses its default size; other valid stored sizes are still applied

#### Scenario: Stored value contains unknown pane keys
- **WHEN** the stored object contains keys not in the known pane set
- **THEN** the unknown keys are ignored and known keys are still applied

#### Scenario: localStorage is unavailable
- **WHEN** `localStorage` is disabled, full, or otherwise throws on read or write (e.g. SSR, private mode, quota exceeded)
- **THEN** the DM screen still renders at default sizes and resize interactions continue to work without error

### Requirement: Scope limited to the wide DM layout

The system SHALL persist sizes only for the wide DM layout (the three-column nested-splitter layout used when `container.width >= lg`). Mobile, tablet, and legacy layouts SHALL continue to use their existing hardcoded sizes unchanged.

#### Scenario: Mobile layout
- **WHEN** the user opens the DM screen on a viewport below the `sm` breakpoint
- **THEN** the mobile tabbed layout renders unchanged and no layout values are read from or written to storage on its behalf

#### Scenario: Legacy layout opt-in
- **WHEN** the user has the `legacy_campaign_layout` setting enabled
- **THEN** the legacy two-pane splitter renders unchanged and no layout values are read from or written to storage on its behalf
