# Spell Card Batch PDF Download

## Goal

From the custom spells overview (`src/views/UserContent/Spells/Spells.vue`), let a user
select multiple spells and download them as a single **A4 PDF** with the spell cards laid
out in a print grid — instead of one PNG per spell.

**Merged with the single-spell download dialog**: rather than duplicating the
preview/color-picker/editable-description UI between `compendium/Spell.vue` (single
spell) and a batch-only dialog, both now share one component,
`src/components/spells/SpellCardDownload.vue`. It takes a `spells` array of any length —
`compendium/Spell.vue` passes a 1-element array, `Spells.vue` passes the selected rows'
full data. The Previous/Next nav only renders when there's more than one card, and the
download step branches on count: a single card with no backside stays a plain PNG
(unchanged from the original single-spell behavior); a batch, or a single card with its
backside included, becomes the A4 grid PDF. The component itself never fetches spell
data — it only knows how to preview/edit/download whatever full spell objects it's
given; each caller is responsible for loading them (trivial for `Spell.vue`, which
already has the full doc in memory; `Spells.vue` fetches on demand when "Download (N)"
is clicked, since the table only holds lightweight summary rows).

## UI changes

### `Spells.vue` — selection

- `q-table` gets `selection="multiple"` + `:selected.sync="selected_spells"`. Since the
  table already overrides the `body` slot, the standard Quasar 1 pattern applies: leave
  `columns` untouched (Quasar auto-adds the header "select all" checkbox), and add one
  extra `<q-td auto-width><q-checkbox v-model="props.selected" /></q-td>` as the first
  cell in the custom body row — not tied to `props.cols`.
- When `selected_spells.length > 0`, a "Download (N)" button appears (next to the existing
  Export button in `ContentHeader`'s `actions-left` slot) that opens the new batch dialog.

### Shared component: `src/components/spells/SpellCardDownload.vue`

A dialog (`hk-dialog`, `v-model` open state, prop `spells`: an array of *full* spell
docs the caller already has loaded — no `key` required to be a real database id, since
an unsaved spell being previewed from the creator has none; list position is used
instead of a key wherever one is needed internally).

Behavior:
- **Live card preview, one spell at a time.** A Previous/Next pair (hidden entirely when
  `spells.length === 1`, matching the original single-spell dialog's plain single-card
  view) navigates a `current_index` through `working_spells`; the visible `SpellCard` for
  the current spell is `editable` (textarea-for-description), so overflowing
  descriptions can be trimmed per-card before download. Edits are kept in a
  `descriptions_by_index` map (index into the `spells` prop, not a spell id) so
  navigating away and back preserves them; the off-screen render used for the actual
  capture reads from the same map via the `working_spells` computed, so edits are
  reflected in the output.
- A single color picker (`spell_card_colors` swatch UI) — one color for the whole
  selection, no per-card choice, single spell or batch alike.
- An "Include backside" `q-checkbox`, off by default.
- Footer button label/icon and the dialog header adapt to the situation ("Download PNG"
  / image icon for a lone card with no backside, "Download PDF" / pdf icon otherwise;
  header names the one spell, or reads "Download spell cards" for a batch).

## PDF generation

### Grid layout

Card size stays 2.5in × 3.5in (63.5mm × 88.9mm, matching `SpellCard.vue`'s fixed size).
A4 portrait (210mm × 297mm) fits a **3×3 grid (9 cards/page)** with a 2mm gap between
cards, grid centered on the page (auto-computed margins) — verified to fit both axes
with margin to spare (width: 3×63.5 + 2×2 = 194.5mm ≤ 210mm; height: 3×88.9 + 2×2 =
270.7mm ≤ 297mm).

### Page order

- Selected spells are chunked into groups of 9 (`_.chunk`, lodash is already a
  dependency), each chunk = one PDF page's worth, in selection order. More than 9 selected
  spells simply produces more chunks — `downloadCardsPdf` already adds a new PDF page per
  entry in `pageGroups`, so pagination beyond one sheet needs no special-casing.
- If "include backside" is checked, front and back chunks are **interleaved per sheet**:
  fronts for cards 1-9 (page 1), backs for cards 1-9 (page 2), fronts for cards 10-18
  (page 3), backs for cards 10-18 (page 4), etc. — not all fronts followed by all backs.
- Backs are **not mirrored** for double-sided alignment — out of scope, plain reading of
  the request ("a 2nd page ... with a backside for each spellcard").

### Capture + assembly

- Reuses the existing off-screen-render pattern from `compendium/Spell.vue`: while
  generating, mount one `SpellCard` per (spell × side) off-screen
  (`position: fixed; top/left: -9999px`), each captured individually via a new small
  helper in `generalFunctions.js`:
  `captureElementAsDataUrl(element, options)` — a bare `html2canvas` + `toDataURL("image/png")`
  wrapper, no padding/footer wrapper (unlike `downloadMonsterFile`/`downloadSpellFile`,
  which wrap the element for a single styled download and aren't reused here since the
  grid needs raw, edge-to-edge card captures).
- New `downloadCardsPdf(pageGroups, options)` in `generalFunctions.js`: takes an array of
  arrays of PNG data-URLs (one inner array per PDF page) and lays each out on its own A4
  page with `jsPDF` using the grid math above, then saves the PDF. Generic over the grid
  size/gap via `options` so it isn't spell-card-specific, in case another content type
  wants the same grid-PDF treatment later.

## Files to change

| File | Change |
| --- | --- |
| `src/views/UserContent/Spells/Spells.vue` | Add table row selection + "Download (N)" trigger that fetches full spell docs for the selection, then opens `SpellCardDownload`. |
| `src/components/spells/SpellCardDownload.vue` | New. Replaces both the old inline dialog in `compendium/Spell.vue` and the batch-only `SpellCardBatchDownload.vue` (deleted). One-at-a-time editable card preview with prev/next nav, single color picker, backside checkbox; branches to a single PNG or a grid PDF depending on card count/backside. |
| `src/components/compendium/Spell.vue` | Inline download dialog/state/methods removed; renders `<SpellCardDownload :spells="[spell]" />` instead. |
| `src/utils/generalFunctions.js` | Add `captureElementAsDataUrl()` and `downloadCardsPdf()`; simplify `downloadSpellFile()` to capture the card at its own defined size (no forced width/wrapper/duplicate footer). |

## Out of scope

- Per-card color choice (single color for the whole selection, single spell or batch
  alike, as requested).
- Mirrored/duplex-aligned backside layout.
