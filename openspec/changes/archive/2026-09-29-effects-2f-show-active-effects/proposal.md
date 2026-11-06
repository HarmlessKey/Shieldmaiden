## Why

Effects can now be applied, saved and resolved (2a, 2b, 2e), but the only place to see
them is the Effects drawer's presence dots. A DM running combat can't tell from the
tracker that a goblin is Prone or how many rounds a player's Burning has left, and can't
click an effect to read what it does. Step 2f of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
shows active effect instances on combatants, next to the legacy conditions and reminders,
and adds a detail view to read and remove them. It is the first consumer of the resolved
definitions from 2e and of the definition's `cancelable` hint (plan §2c/§2d). Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §2 (instance vs
definition) and §4 (durations).

## What Changes

- **Effect chips on combatants**: the shared entity-effects row
  (`src/components/combat/entities/effects/index.vue` + `Effect.vue`) also renders
  `entity.effects`. It is used in the tracker's target list, the entity card and the drawer
  target lists.
  - Each effect instance is a chip. SRD conditions show their `hki-<url>` icon, and other
    effects a generic effect icon with the name's initial.
  - A small badge shows Exhaustion's level or the rounds left of a timed effect.
  - A tooltip gives the name, the duration in words ("7 rounds left", "Until removed",
    "Until the end of Goblin's next turn", "Concentration, up to 1 hour") and the caster.
  - Effect chips come after the legacy reminders and conditions and use the same
    overflow/collapse behavior.
- **Filter props**: the row gets an `effects` flag next to the existing `conditions` /
  `reminders` flags. With no flag it shows all three kinds (tracker, entity card). The
  legacy Conditions drawer (`conditions`) and Reminders drawer (`reminders`) are
  unchanged. The Effects drawer's target list switches to `effects`.
- **Detail view**: clicking an effect chip opens a new drawer
  `drawers/encounter/effects/ActiveEffect.vue` for that entity and instance. It shows:
  - the name and icon
  - the duration and rounds left, the caster (by name, or "not in this encounter"), and
    the choices and repeat save (ability, DC, when)
  - the resolved description and sub-effects, marking the ones pulled in through
    `includes` with their source ("from Incapacitated")
  - for Exhaustion, the per-level table, where clicking a level sets it
  - a **Remove** button, hidden when the resolved definition has `cancelable: false`
  - for an unresolved definition, the stored name and "No details available"
- **Remove and level change** reuse `remove_effect` (by `effectKey`) and `apply_effect`
  (Exhaustion level) from 2a/2b, so they are saved like drawer actions. Setting Exhaustion
  to 0 from the table removes it.
- **Custom effect names** are stored lowercased by the legacy custom-effects form. They
  are displayed capitalised; nothing stored changes.

## Capabilities

### New Capabilities
- `effects-display`: how active effect instances appear on combatants (chips, icons,
  badges, tooltips, ordering, filtering) and what the detail view shows and allows
  (remove, Exhaustion level, cancelable, unresolved definitions).

### Modified Capabilities
<!-- none: effects-drawer / effects-instance-storage / effects-runtime-resolution behavior is unchanged; the drawer target list's filter is presentation covered by effects-display -->

## Impact

- `src/components/combat/entities/effects/index.vue`, `Effect.vue`: new `effects` flag
  and effect-instance items.
- New `src/components/drawers/encounter/effects/ActiveEffect.vue`. It reuses
  `EffectDetails.vue` from 2a, extended to label `from` sub-effects.
- `src/components/drawers/encounter/Effects.vue`: target-list `<Effects … effects />`.
- New pure helpers in `src/utils/effectFunctions.js`: `describeDuration` and
  `effectBadge`, tested in the scratchpad.
- Reads the `runEncounter` getters `entity_effects` / `effect_definition` (2e), plus
  `entities`, `edition` and `round`. No store, service, rules or data changes.
- Out of scope: the player-facing live view (2i), triggers and duration ticking (2g/2h),
  the campaign edition-change warning (still open, see plan §2d), and replacing the legacy
  condition chips (2i).
