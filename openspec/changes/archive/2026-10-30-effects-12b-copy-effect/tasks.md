## 1. The copy helper

- [x] 1.1 `copyableEffect(definition)` in `src/utils/effectFunctions.js` (design 2). Verify with a `check-copy-effect` scratchpad check over the saved API data (`srd-fixture.mjs`):
  - the copy of 5.5e Bless has its name, description and sub-effects, and no `url`, `edition`, `_id`, `key`, `is_condition` or `meta`
  - the registered 5.5e Bless still has its `url` and `edition` afterwards, and changing the copy's sub-effects doesn't change it
  - the copy of 5.5e Paralyzed keeps its `includes` reference to `incapacitated`
  - a custom definition with `key` and legacy empty fields comes out cleaned and without `key`

## 2. CopyContent for effects

- [x] 2.1 `CopyContent.vue` `type="effect"` (design 1): the Custom list from `effects/effects` (loaded with `get_effects`), the SRD branch over the fetched lists (effects and conditions, `matchesName`, sorted, paged in the browser, the "couldn't be loaded" message), the edition toggle, the SRD id `_id || url`, and the copy through `copyableEffect`. The monster, spell and item branches are unchanged. Verify `npm run lint`

## 3. The effects form

- [x] 3.1 `EditEffect.vue` (design 3): the create dialog for a new effect, the Copy button in the header while the effect is new, the copy dialog, `copy({ result })`, and the dead `api_effects` mapping removed. Verify `npm run lint`

## 4. Documentation and plan

- [x] 4.1 `src/docs/effects.md`: a new effect can start from a copy of a custom effect, an SRD effect or an SRD condition, which becomes a custom effect. Verify every label it names matches the screens
- [x] 4.2 `.planning/effects-implementation-plan.md`: an "As built" note on step 12b. Verify it matches the spec

## 5. Verification

- [x] 5.1 `npm run lint`, `openspec validate effects-12b-copy-effect --strict`, and all scratchpad checks (except the obsolete `check-action-info`) pass
- [x] 5.2 Manual test by the user (no dev server or browser by Claude):
  - a new effect opens the create dialog; Create from scratch closes it
  - copy 5.5e Bless from the SRD tab (search "bless"), change it and save: a new custom effect, the SRD Bless unchanged in the Effects drawer
  - copy the 5e condition Grappled and save: listed under Custom without a condition icon
  - copy one of your custom effects: saving adds a second one
  - the Copy button while creating; no Copy on a saved effect
  - the NPC and spell copy dialogs still work (SRD tab, edition toggle, copy)
