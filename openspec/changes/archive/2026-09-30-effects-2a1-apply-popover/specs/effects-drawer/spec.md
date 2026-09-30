## ADDED Requirements

### Requirement: The apply button opens the application form, shift+click applies directly

Each listed effect SHALL have an apply button. Clicking it SHALL open the application form
(duration, repeat save, choices, Exhaustion level and, when offered, the Concentration
link) in a popover next to the button. Applying from the popover SHALL apply the effect to
all targets and close the popover. Cancelling, or clicking outside the popover, SHALL close
it without applying anything.

Shift+clicking the apply button SHALL apply the effect directly to all targets with
duration "until removed", without opening the form. When the effect needs a choice, a
shift+click SHALL open the popover instead. For Exhaustion, a shift+click SHALL apply the
default level (the targets' highest current level plus one, capped at 6, or 1).

The application form SHALL only be reachable through the apply button. Expanding an entry
SHALL show its details only.

#### Scenario: Click opens the form
- **WHEN** the DM clicks the apply button of Prone with two targets
- **THEN** a popover with the application form opens and nothing is applied yet

#### Scenario: Apply from the popover
- **WHEN** the DM sets a duration of 2 rounds in the popover and chooses Apply
- **THEN** both targets get a Prone instance with that duration and the popover closes

#### Scenario: Cancel
- **WHEN** the DM opens the popover and clicks outside it
- **THEN** the popover closes and no effect is applied

#### Scenario: Shift+click applies until removed
- **WHEN** the DM shift+clicks the apply button of Prone
- **THEN** Prone is applied to the targets with `duration: { type: "cancelled" }` and no popover opens

#### Scenario: Shift+click on an effect that needs a choice
- **WHEN** the DM shift+clicks the apply button of an effect whose sub-effect has `choice: "ability"`
- **THEN** the popover opens so the ability can be chosen, and nothing is applied yet

#### Scenario: Shift+click on Exhaustion
- **WHEN** the DM shift+clicks the apply button of Exhaustion for a target at level 2
- **THEN** that target's Exhaustion becomes level 3 without a popover

#### Scenario: Expanding shows details only
- **WHEN** the DM expands an entry
- **THEN** its description and sub-effects are shown, and there is no application form or "Apply with options" button
