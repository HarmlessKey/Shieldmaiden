## Why

In the Effects drawer from step 2a of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
the green **+** on an entry applies the effect straight away as "until removed". Setting a
duration, repeat save or Concentration link means expanding the entry and pressing a
separate "Apply with options" button. In play the DM usually wants to set how long an
effect lasts, so the common case takes the most clicks, and the quick path is the one that
is easy to trigger by accident.

## What Changes

- **+ opens the application form in a popover** anchored to the button: duration, repeat
  save, choices, Exhaustion level, and the Concentration link from 2h1. **Apply** there
  applies to all targets and closes the popover; **Cancel** or clicking outside closes it
  without applying.
- **Shift+click on +** applies directly with "until removed", the old one-click behavior.
  - When the effect needs a choice (e.g. an ability for a Hex-like effect), shift+click
    opens the popover instead, since it can't be applied without that value.
  - For Exhaustion, shift+click applies the default level (current level + 1, capped at 6,
    or 1 when the target doesn't have it).
- **The inline "Apply with options" form is removed.** Expanding an entry only shows its
  details (description, sub-effects, the Exhaustion table).
- The + tooltip says "Apply (shift+click: until removed)".

Decisions recorded here instead of a design document (UI-only change in two components):
- The popover is a `q-menu` on the + button, holding the existing `ApplyEffect` form. The
  form's own selects open their own popups, which Quasar supports nested.
- A custom effect's full definition is loaded before the popover shows its form, as
  expanding does today.
- The Concentration link and `caster_name` added by 2h1 (`effects-2h1-duration-expiry`,
  still open) keep working unchanged, because the same form and apply path are used. This
  change can be archived before or after 2h1.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `effects-drawer`: adds a requirement for how the apply button behaves (popover by
  default, shift+click for a direct apply) and that the application form is only reached
  through it.

## Impact

- `src/components/drawers/encounter/Effects.vue`: the + button opens a `q-menu` with
  `ApplyEffect`; shift+click applies directly; the inline "Apply with options" button and
  form are removed from the expanded entry.
- `src/components/drawers/encounter/effects/ApplyEffect.vue`: unchanged apart from
  possible spacing for use inside a popover.
- No store, data, schema or rules changes.
