## Context

See proposal.md for why. Copying content today:
- `EditNpc.vue`, `EditSpell.vue` and `EditItem.vue` open a create dialog for new content
  ("Copy existing … / Create from scratch") and show a Copy button while the content is new.
  Both use `components/CopyContent.vue`.
- `CopyContent` (`type` monster, spell or item):
  - a Custom / SRD toggle (Custom only shown when the user has custom content)
  - a name search; Custom filters the store's list in the browser, SRD calls the API paged
    (5 per page, `fetch_*` actions)
  - an edition toggle for SRD monsters and spells
  - on copy it fetches the full object, deletes `_id`, `key`, `url`, `meta`,
    `release_date` and version keys, and emits `copy({ result, id, resource })`. SRD results
    are identified by `_id`.
- `EditEffect.vue` has no create dialog or Copy. It maps `api_effects/fetch_effects` and
  `fetch_effect`, which don't exist in the step 12 module (dead).
- SRD definitions come from the `api_effects` module (step 12):
  `fetch_srd_definitions({ edition })`, the `srd_loaded` / `srd_failed` getters, and the
  registered lists read through `getSrdDefinitions(edition)`. They have no `_id` (dropped),
  only `url`. They are store state, shared with every screen.
- The user's custom effects: `effects/get_effects` and the `effects/effects` getter (list
  with `key` and `name`), `effects/get_effect({ uid, id })` for a full, cached definition.
- `cleanEffectDefinition` returns a new, cleaned deep copy of a definition.

## Goals / Non-Goals

**Goals:**
- The effects form copies the way the NPC and spell forms do, through `CopyContent`.
- A copy can never change the SRD lists or a cached custom effect.
- The copy logic is a pure helper with a scratchpad check.

**Non-Goals:**
- Copying from the API's `name` filter (decided at proposal: the fetched lists).
- A name suffix on copies (decided at proposal: the name is kept).
- Copying an effect link or an NPC's effects; only definitions.
- Changes to the other content types' copying.

## Decisions

**1. `CopyContent` gets `type="effect"`.** Reusing the component keeps the dialog, toggles
and list identical to the other forms.
- **Custom**: `custom_content` is the `effects/effects` getter, loaded with
  `effects/get_effects` on mount like the others. The search filters it as for the others.
- **SRD**: a branch in `fetchApiContent` for effects. It awaits
  `api_effects/fetch_srd_definitions({ edition })`, takes that edition's effects and
  conditions, filters them with `matchesName`, sorts by name, and pages them in the browser
  with the same `pageSize`, `page` and `totalPages`. It shows "couldn't be loaded" when
  `srd_failed(edition)`. An empty search lists the first page, as the API branch does.
- **The edition toggle** (`showEditionSelect`) also shows for effects. The effect branch uses
  `"5e"` / `"5.5e"` directly; the monster and spell branch keeps passing no edition for 5e.
- **SRD ids:** an SRD result is identified by `result._id || result.url`, in the copy button
  and in `disabledSrd`, so effects (no `_id`) work and the others are unchanged.
- **Copy:** for effects the result is `copyableEffect(definition)` (decision 2): the custom
  one from `effects/get_effect`, the SRD one found by `url` in the edition's lists. The
  existing deletions then find nothing left to delete.
- *Alternative:* a separate copy component for effects. Rejected: it would duplicate the
  toggles, search and paging, and drift from the others.

**2. `copyableEffect(definition)` in `effectFunctions.js`.** Returns
`cleanEffectDefinition(definition)` (a new deep copy) without `url`, `_id`, `key`, `edition`,
`is_condition` and `meta`. Everything else stays, including `includes` / `apply_effect` /
`remove_effect` references. Because it copies first, the SRD lists in the store and the
cached custom effect are never touched, even by `CopyContent`'s own `delete`s.
- *Why not delete on the result as for monsters:* the SRD definition is shared store state
  and the custom one is the store's cache; deleting `url` on them would break resolution
  everywhere.

**3. `EditEffect.vue` copies like `EditSpell.vue`.**
- `create_dialog` opens on mount when there's no `effectId`: "Copy existing effect" shows
  `CopyContent type="effect"`, "Create from scratch" closes it; the footer offers Create from
  scratch while copying.
- A Copy button in the card header, next to How effects work, only while `effectId` is
  unset, opens `copy_dialog` with the same `CopyContent`.
- `copy({ result })` closes both dialogs and sets `this.effect = cleanEffectDefinition(result)`.
  `effect_copy` stays the empty new effect, so the form shows unsaved changes, and Save takes
  the existing add path (`effectId` unset).
- The dead `api_effects` action mapping is removed.

**4. A copied condition is a custom effect.** Its `source` is `custom` once applied, so
`isSrdCondition` is false and it gets no condition icon or Conditions-mode listing. Nothing
extra is needed.

## Risks / Trade-offs

- **[Risk] Shared state mutated by a copy.** → `copyableEffect` copies before anything is
  removed (decision 2), checked in the scratchpad: the registry's definition still has its
  `url` and `edition` after copying.
- **[Trade-off] Same name as the original.** A copied "Bless" and the SRD Bless have the same
  name. They show in different tabs (Effects / Custom) of the effect lists, and the DM can
  rename it (decided at proposal).
- **[Trade-off] The SRD search needs the fetched lists.** If they couldn't be loaded, the SRD
  tab says so; Custom still works. The fetch is retried when the tab opens.
- **[Risk] Changes to `CopyContent` affect monsters, spells and items.** → The effect branch
  is separate; the shared change is only the SRD id fallback (`_id || url`), which is
  `_id` for them as before.
