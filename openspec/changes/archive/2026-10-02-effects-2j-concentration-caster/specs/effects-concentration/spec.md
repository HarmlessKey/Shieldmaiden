## Purpose

How the DM's combat tracker keeps a caster's Concentration in step with the effects it
sustains: Concentration is started on the caster when an effect with a Concentration
duration is applied, shared by more targets of the same effect, limited to one at a time,
and ended when its "up to" time runs out.

## ADDED Requirements

### Requirement: Applying a Concentration effect starts the caster's Concentration

When the DM applies an effect with duration type `concentration` and a caster is chosen, the
application form SHALL offer the option "<caster> concentrates on it", on by default. When
it is on and the caster has no Concentration instance, applying SHALL:
- first apply an SRD Concentration instance to the caster, with `caster_key` and
  `caster_name` set to the caster itself, and `concentration_for` set to the applied effect
  (`source`, `source_key` and `name`)
- give that Concentration the effect's "up to" time as a `time` duration, or "until
  removed" when no "up to" time is set
- give every created instance a `concentration_id` with the key of that Concentration

The Concentration SHALL be applied like any other instance: it is saved, resolved, and
announced by no prompt of its own. When the option is off, or no caster is chosen, no
Concentration is applied and the instances get no `concentration_id`.

#### Scenario: Bless on three creatures
- **WHEN** Lyra (`player_1`) is chosen as the caster, has no Concentration, and the DM applies Bless with duration Concentration, up to 1 minute, to three creatures
- **THEN** Lyra gets one Concentration instance with `duration: { type: "time", value: 1, unit: "minute" }`, `rounds_remaining: 10` and `concentration_for: { source: "srd", source_key: "bless", name: "Bless" }`, and the three Bless instances have `concentration_id` set to its key

#### Scenario: No up-to time
- **WHEN** the DM applies a custom Hex effect with duration Concentration and no "up to" time
- **THEN** the caster's Concentration has `duration: { type: "cancelled" }`, and Hex is linked to it

#### Scenario: Option off
- **WHEN** the DM turns the option off before applying
- **THEN** the caster gets no Concentration and the applied instances have no `concentration_id`

#### Scenario: Caster concentrating on itself
- **WHEN** Lyra is the caster and the only target of Fly with duration Concentration
- **THEN** Lyra has both a Concentration and a Fly instance, and Fly is linked to the Concentration

### Requirement: The same effect shares the caster's Concentration

When the option is on and the caster's Concentration has `concentration_for` with the same
`source` and `source_key` as the applied effect, no new Concentration SHALL be applied. The
created instances SHALL be linked to the existing Concentration, and its duration SHALL NOT
change.

#### Scenario: A fourth Bless target
- **WHEN** Lyra concentrates on Bless (`concentration_for.source_key: "bless"`) and the DM applies Bless with duration Concentration to one more creature, with Lyra as the caster
- **THEN** the new Bless instance is linked to Lyra's existing Concentration and Lyra still has one Concentration

### Requirement: A caster concentrates on one effect at a time

When the option is on and the caster's Concentration is for a different effect, the
application form SHALL warn "<caster> is concentrating on <effect>. Applying ends it and the
effects linked to it." and its apply button SHALL read "Replace and apply". Applying SHALL
first remove the old Concentration with the reason "started concentrating on <new effect>".
Its linked effects then end through the existing cascade, each with its notice. A new
Concentration is applied as for a caster without Concentration.

When the caster's Concentration has no `concentration_for` (applied by hand, or before this
change), the form SHALL let the DM choose between "Link to <caster>'s current
Concentration" (the default) and "Replace it". Linking SHALL set `concentration_id` to the
existing Concentration without changing it. Replacing SHALL work as for a different effect.

#### Scenario: Hex replaces Bless
- **WHEN** Lyra concentrates on Bless, linked to three creatures, and the DM applies Hex with duration Concentration with Lyra as the caster and chooses "Replace and apply"
- **THEN** Lyra's Bless Concentration ends with the notice "started concentrating on Hex", the three Bless instances end through the cascade, and Lyra gets a new Concentration for Hex linked to the Hex instance

#### Scenario: Concentration applied by hand
- **WHEN** Lyra has a Concentration instance without `concentration_for` and the DM applies Bless with duration Concentration with Lyra as the caster
- **THEN** the form offers "Link to Lyra's current Concentration" (selected) and "Replace it", and applying with the default links Bless to the existing Concentration

### Requirement: Concentration ends when its up-to time runs out

A Concentration started by applying an effect with an "up to" time SHALL count down like any
`time` duration: one round at the end of each of the caster's turns. When it reaches zero it
SHALL be removed with the reason "<time> passed", and its linked effects end through the
cascade.

#### Scenario: Bless runs out
- **WHEN** Lyra's Concentration for Bless was started with up to 1 minute and Lyra's turn ends ten times
- **THEN** the Concentration ends with "1 minute passed", and every Bless instance linked to it ends with it
