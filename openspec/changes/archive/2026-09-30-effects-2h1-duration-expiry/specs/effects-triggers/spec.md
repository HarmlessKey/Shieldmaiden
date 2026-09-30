## MODIFIED Requirements

### Requirement: Caster-anchored triggers fall back to the holder when the caster is absent

When an instance's `caster_key` doesn't match an entity in the running encounter, or the
instance has no `caster_key` (applied before combat, or kept in the carried-over review),
its `start_turn_caster` and `end_turn_caster` sub-effects SHALL fire at the start and end of
its holder's own turn, together with that holder's `start_turn_target` / `end_turn_target`.
An instance whose caster is present SHALL NOT fire caster-scoped sub-effects on the holder's
turn.

#### Scenario: Carried-over effect
- **WHEN** a player's effect has `caster_key` of an NPC from an earlier encounter and an `end_turn_caster` sub-effect, and the player's turn ends
- **THEN** that sub-effect is collected for the player's end of turn

#### Scenario: No caster
- **WHEN** an effect without `caster_key` has a `start_turn_caster` sub-effect and its holder's turn starts
- **THEN** that sub-effect is collected for the holder's start of turn

#### Scenario: Caster present
- **WHEN** the caster of an `end_turn_caster` effect is in the encounter and the holder's turn ends
- **THEN** that sub-effect is not collected for the holder's end of turn
