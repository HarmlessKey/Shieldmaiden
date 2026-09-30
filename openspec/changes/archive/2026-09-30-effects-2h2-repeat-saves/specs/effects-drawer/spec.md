## MODIFIED Requirements

### Requirement: Application captures an optional repeat save

The DM SHALL be able to add a repeat save to an application: the save ability, the DC
(a positive integer) and when the save is repeated (default: end of the target's turn;
also start of the target's turn and when it takes damage). With a repeat save, the DM
SHALL also be able to set:
- the number of successes needed to end the effect (a positive integer, default 1)
- an escalation: after a number of failures (a positive integer), the effect becomes an SRD
  condition of the campaign edition
- a time after which the save succeeds automatically (a positive integer with a unit of
  rounds, minutes or hours)

The save ability and DC SHALL be entered at application time and not read from the
definition. Without a repeat save the instance SHALL carry no save fields. Extras left at
their defaults SHALL NOT be stored.

#### Scenario: Hold-Person-style save
- **WHEN** the DM applies Paralyzed with a Wisdom repeat save DC 15 at the end of the target's turn
- **THEN** the instance has `duration.save: { ability: "wisdom", triggers: ["end_turn_target"] }` and `save_dc: 15`

#### Scenario: No repeat save
- **WHEN** the DM applies Prone without a repeat save
- **THEN** the instance has neither `duration.save` nor `save_dc`

#### Scenario: Flesh-to-Stone-style save
- **WHEN** the DM applies Restrained with a Constitution save DC 15, 3 successes needed, and "after 3 failures it becomes Petrified"
- **THEN** the instance has `duration.save: { ability: "constitution", triggers: ["end_turn_target"], successes_to_end: 3, failures_to_escalate: 3, escalate: { effect: { source: "srd", source_key: "petrified", name: "Petrified" } } }`

#### Scenario: Automatic success
- **WHEN** the DM sets "succeeds automatically after 1 minute"
- **THEN** the instance's save has `auto_success_after: { value: 1, unit: "minute" }`

## ADDED Requirements

### Requirement: Application captures an optional escape

The DM SHALL be able to add an escape to an application: the escape DC (a positive integer),
the allowed checks (Strength (Athletics) and/or Dexterity (Acrobatics), both by default),
and who may attempt it (the holder, the holder or a creature within reach, or anyone;
default the holder). The escape SHALL be stored as `duration.escape`. Without it, the
instance SHALL carry no escape.

#### Scenario: Grappled with escape DC
- **WHEN** the DM applies Grappled with escape DC 14 and the default checks
- **THEN** the instance has `duration.escape: { dc: 14, checks: [{ ability: "strength", skill: "athletics" }, { ability: "dexterity", skill: "acrobatics" }] }`

#### Scenario: No escape
- **WHEN** the DM applies Prone without an escape
- **THEN** the instance has no `duration.escape`
