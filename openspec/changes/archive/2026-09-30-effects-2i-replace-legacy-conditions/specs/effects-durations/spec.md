## REMOVED Requirements

### Requirement: End conditions end an effect
**Reason**: It also counted the legacy conditions map, which is removed.
**Migration**: Replaced by "End conditions are evaluated against effect instances", which keeps the evaluator and its other scenarios.

## ADDED Requirements

### Requirement: End conditions are evaluated against effect instances

After every trigger fires, the tracker SHALL evaluate, for every instance in the encounter,
its duration's `ends_when` and its resolved definition's `ends_when`. It SHALL remove the
instance when either holds. The evaluator SHALL support `has_condition`, `has_effect`,
`bloodied`, `hp_zero`, `temp_hp_zero` and `hp_threshold` (with `comparator`), with
`subject` `self` (the holder, the default) or `caster`, and `negate`, lists (all must
hold), `all_of` and `any_of`. A check it can't evaluate SHALL count as not holding. An entity
has a condition when it has an instance of that SRD condition, or when one of its effects
includes that condition. Nothing else SHALL count as having a condition.

#### Scenario: Concentration ends when Stunned
- **WHEN** a player has Concentration (whose definition ends when the holder has the Incapacitated condition) and the DM applies Stunned to the player
- **THEN** Concentration is removed, because Stunned includes Incapacitated

#### Scenario: Incapacitated set from the Conditions option
- **WHEN** a player has Concentration and the DM applies Incapacitated through the Conditions option
- **THEN** Concentration is removed

#### Scenario: Unsupported check
- **WHEN** an effect ends when `{ type: "distance", subject: "caster", comparator: "gt", value: 60 }`
- **THEN** the effect is never removed automatically by that check
