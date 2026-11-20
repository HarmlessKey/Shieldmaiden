## MODIFIED Requirements

### Requirement: Only applicable modifiers count

A numeric sub-effect SHALL count only when:
- the instance's level is at least its `min_level` and at most its `max_level` (when set)
- its `condition`, and its definition's `condition`, evaluate true with the effect
  condition checks. A check that can't be evaluated counts as false, and the sub-effect is
  listed as not applied.
- with `choice`, the instance has that choice

When the same definition (the same `source` and `source_key`) is on one entity more than
once, its sub-effects SHALL count for one instance only: the one whose contributions change
the value most. A definition with `stacking.mode: "independent"` is the exception: every
instance of it SHALL count, each with its own choices, level and rolled values. This applies
everywhere the tracker counts a definition once: effective values, d20 roll modifiers,
damage bonuses, damage modifiers and restrictions.

#### Scenario: Exhaustion rows by level
- **WHEN** a player has 5e Exhaustion at level 1
- **THEN** its Speed isn't halved, and it is halved from level 2

#### Scenario: Same effect twice
- **WHEN** an entity has two instances of a custom effect with `bonus` `ac` 2
- **THEN** its effective AC is 2 higher, not 4

#### Scenario: Different effects stack
- **WHEN** an entity has two different custom effects, each with `bonus` `ac` 2
- **THEN** its effective AC is 4 higher

#### Scenario: Strength Drain twice
- **WHEN** a fighter with Strength 16 is hit twice by a Shadow, and the two Strength Drain instances (`stacking.mode: "independent"`) rolled 3 and 2
- **THEN** its effective Strength is 11, and the tooltip lists both reductions

#### Scenario: Independent roll penalty
- **WHEN** an entity has two instances of a custom effect with `stacking.mode: "independent"` and a −1d4 bonus on attack rolls
- **THEN** its attack rolls subtract two separate d4s

#### Scenario: Doesn't stack is unchanged
- **WHEN** an entity has two Bless instances from different clerics (no `stacking`)
- **THEN** its attack rolls add one d4
