## ADDED Requirements

### Requirement: Charmed's attack restriction is against the charmer

In both editions, Charmed's `restrict` sub-effect on `attack` SHALL have the condition
`{ subject: "counterpart", type: "is_caster" }` (described as "Against the charmer"), so it
restricts only attacks on the instance's caster, the charmer. Applied without a caster, the
condition can't be checked, and the restriction is a possible one.

#### Scenario: Both editions
- **WHEN** the 5e and 5.5e Charmed definitions are read
- **THEN** their attack restriction has the `is_caster` condition on the counterpart, and the SRD data validation passes
