## Why

Building a custom effect from scratch takes time, and many are a variation on one that
exists: an SRD effect with other numbers, a homebrew version of a condition, or one of the
user's own effects. The NPC, spell and item forms already let a user start from a copy; the
effects form doesn't (plan step 12b, `.planning/effects-implementation-plan.md`).

## What Changes

- **Copy in the effects form, as for NPCs and spells.**
  - A new effect opens a "How do you want to do this?" dialog: **Copy existing effect** or
    **Create from scratch**.
  - While creating (not when editing a saved effect), the form's header has a **Copy**
    button that opens the same search in a dialog.
- **What can be copied (decided at proposal):**
  - **Custom**: the user's own custom effects.
  - **SRD**: the SRD effects and the SRD conditions of an edition, with the edition toggle
    the monster and spell copies have. A copied condition becomes a custom effect: it is
    not a condition afterwards (no condition icon, not in the Conditions option).
- **The SRD search runs over the lists the app already fetched** (step 12), with the same
  name matching as the other effect lists (case and accents), paged like the other copy
  searches. No request per search (decided at proposal).
- **The copy:**
  - fills the form with the whole definition: name, description, sub-effects, stacking,
    level, effect-wide condition, ends when, sustain and aura
  - keeps the name, as NPC and spell copies do (decided at proposal)
  - drops what makes it the original: its `url`, and its `edition`, since a custom effect is
    used in every edition
  - keeps references to other effects (`includes`, `apply_effect`, `remove_effect`), so they
    still resolve
  - leaves the original untouched, and is new until saved (unsaved changes, Save adds it)
- **Docs:** `src/docs/effects.md` says an effect can be started from a copy.
- **Cleanup:** the edit screen maps two `api_effects` actions that no longer exist.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `effects-authoring`: the effects form can start from a copy of a custom effect, an SRD
  effect or an SRD condition.

## Impact

- `src/components/CopyContent.vue`: a `type="effect"`, with the user's custom effects and the
  fetched SRD effects and conditions (searched and paged in the browser).
- `src/views/UserContent/Effects/EditEffect.vue`: the create dialog, the Copy button and the
  copy handler.
- `src/utils/effectFunctions.js`: a pure helper that turns a definition into a copy.
- `src/docs/effects.md`.
- No API, database rules or schema changes. Tier limits are unchanged: the effects list
  already stops a user at their limit from adding one.
