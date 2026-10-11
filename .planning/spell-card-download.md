# Spell Card Download

## Goal

Let users download a shareable image (PNG) of their custom spells, matching the existing
"download an image of your custom NPC" feature (`src/components/compendium/Monster.vue` +
`downloadMonsterFile` in `src/utils/generalFunctions.js`), but with its own dedicated card
design instead of reusing the on-screen view component.

Key difference from the NPC flow: the NPC download captures the *visible* stat block
component itself (toggling a `download-mode` class on a clone). For spells we instead build
a **separate, generation-only component** that renders the exportable card layout. This
component is never part of the normal viewing UI — it only ever gets mounted off-screen,
at download time, purely so `html2canvas` has a real DOM node to rasterize.

## Scope of this change

- New component `src/components/spells/SpellCard.vue`: the export-only card design.
  **Placeholder styling only** — the user will redesign the visual layout themselves
  afterwards. This change just needs to lay out the right fields with sane defaults, using
  `src/components/contribute/spell/ViewSpell.vue` as the reference for which spell fields
  to show (name, level/school, cast time, range, components, duration, classes,
  description, higher levels).
- Color choice: a color picker (same palette/pattern as the existing color-label picker in
  `src/components/drawers/encounter/EditEntity.vue`, via the `colors` mixin's
  `shieldmaiden_colors` + `q-color`) lets the user pick an accent color for the card before
  downloading. No column/layout choice — spell cards are single-layout, unlike NPC stat
  blocks.
- Download entry point: a new `src/components/drawers/ViewSpell.vue` drawer (mirrors
  `src/components/drawers/ViewNpc.vue`), wrapping the existing
  `src/components/compendium/Spell.vue` preview with `allow-download="true"`.
  `src/views/UserContent/Spells/EditSpell.vue`'s preview ("eye") button switches from
  opening the `compendium/Spell` drawer directly to opening `drawers/ViewSpell`.
- `src/components/compendium/Spell.vue` gains:
  - an `allowDownload` prop (mirrors `Monster.vue`), default `false`.
  - a Download button + dialog (color picker + "Download PNG" button, `hk-dialog`, no
    layout choice) shown only when `allowDownload` is true.
  - an off-screen container (`position: fixed; left/top: -9999px; pointer-events: none`,
    not `display: none` — `html2canvas` needs real layout) that mounts `SpellCard` only
    while a download is in progress, feeds it `spell` + the chosen `color`, waits a tick,
    captures it, then unmounts it. It is not rendered at any other time.
- New `downloadSpellFile(element, options)` helper in `src/utils/generalFunctions.js`,
  parallel to `downloadMonsterFile` but PNG-only (no PDF, no layout param): wraps the
  element in the same padded/backgrounded wrapper + footer link, runs `html2canvas`,
  downloads a PNG blob. Kept as its own function rather than generalizing
  `downloadMonsterFile`, to avoid touching working NPC download code.

## Out of scope

- PDF export for spells (NPC download's PDF path is not mirrored here).
- Redesigning `SpellCard.vue`'s actual visuals — this change ships placeholders only.
- Download support for API/SRD spells — only custom (`userContent`) spells get the
  Download button, same restriction as NPCs (`allowDownload` only ever passed `true` from
  the custom-NPC drawer today).

## Files to change

| File | Change |
| --- | --- |
| `src/components/spells/SpellCard.vue` | New. Export-only placeholder card layout; props `spell`, `color`. |
| `src/components/drawers/ViewSpell.vue` | New. Mirrors `drawers/ViewNpc.vue`; wraps `compendium/Spell` with `allow-download`. |
| `src/components/compendium/Spell.vue` | Add `allowDownload` prop, Download button + color-picker dialog, off-screen `SpellCard` mount + `download()` method. |
| `src/utils/generalFunctions.js` | Add `downloadSpellFile()`. |
| `src/views/UserContent/Spells/EditSpell.vue` | Preview button opens `drawers/ViewSpell` instead of `compendium/Spell`. |
