## ADDED Requirements

### Requirement: SRD ships Regeneration

The SRD effect list SHALL contain one definition without `edition` (used in both editions)
with `url: "regeneration"` and `name: "Regeneration"`. Its description SHALL say that the
holder regains the chosen number of Hit Points at the start of each of its turns if it has at
least 1 Hit Point, and that taking damage of a chosen type stops it on the holder's next turn.

It SHALL ask for a `value` choice (the Hit Points, required) and a `damage_type` choice that is
optional and takes several types. It SHALL have two sub-effects:
- a `healing` sub-effect with `trigger: "start_turn_target"`, its amount from the `value`
  choice, and a condition that holds when the holder doesn't have 0 Hit Points and has no
  Regeneration Suppressed
- an `apply_effect` sub-effect with `trigger: "damage_taken"`, filtered on the chosen damage
  types, that applies Regeneration Suppressed with the duration "until the end of its next
  turn" (`next_turn`, anchor `target`, edge `end`)

#### Scenario: Regeneration resolves in both editions
- **WHEN** an instance with `source: "srd"` and `source_key: "regeneration"` is resolved for a `"5e"` and for a `"5.5e"` campaign
- **THEN** both find the same definition, with a start-of-turn healing sub-effect and a damage-taken apply_effect sub-effect

#### Scenario: Regeneration validates
- **WHEN** the SRD data validation command is run
- **THEN** Regeneration passes with no errors, and its reference to Regeneration Suppressed resolves in both editions

### Requirement: SRD ships Regeneration Suppressed

The SRD effect list SHALL contain one definition without `edition` with
`url: "regeneration-suppressed"` and `name: "Regeneration Suppressed"`. Its description SHALL
say that the holder's Regeneration doesn't function on its next turn. It SHALL have one
`special` sub-effect with that description and no other mechanics: Regeneration checks for it.

#### Scenario: A marker without mechanics
- **WHEN** Regeneration Suppressed is resolved
- **THEN** it has one special sub-effect, and holding it changes no stat, roll or defense
