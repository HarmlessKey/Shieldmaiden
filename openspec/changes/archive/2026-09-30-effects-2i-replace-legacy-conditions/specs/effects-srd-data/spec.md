## MODIFIED Requirements

### Requirement: Concentration ends when the holder is Incapacitated

The Concentration definition in both editions SHALL declare a definition-level end
condition that is true when the holder has the `incapacitated` condition. This check SHALL
be answered from the holder's effect instances: an instance of the SRD `incapacitated`
condition, or an effect that includes it.

#### Scenario: Holder becomes Incapacitated
- **WHEN** the holder of Concentration has an instance of the SRD `incapacitated` condition
- **THEN** the definition's end condition evaluates true, meaning Concentration ends

#### Scenario: Holder has a condition that includes Incapacitated
- **WHEN** the holder of Concentration has an instance of Paralyzed, which includes Incapacitated
- **THEN** the definition's end condition evaluates true

#### Scenario: Holder is not Incapacitated
- **WHEN** the holder of Concentration has no `incapacitated` instance and no effect that includes it (other conditions such as `prone` may be present)
- **THEN** the definition's end condition evaluates false
