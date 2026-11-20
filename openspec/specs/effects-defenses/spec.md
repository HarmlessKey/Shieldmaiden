# effects-defenses Specification

## Purpose

How effects change what a creature resists, is vulnerable to and is immune to in the DM's
combat tracker: damage defenses from `defense` sub-effects combined with the creature's own,
used wherever damage is dealt, and condition immunities that keep conditions from being
applied.

## Requirements

### Requirement: Effects grant damage defenses

While an effect is active, each of its `defense` sub-effects with sub-type `r` (resistance),
`v` (vulnerability) or `i` (immunity) SHALL give its holder that defense to:
- every type in `damage_types`
- with `all_damage`, every damage type except those in `except_damage_types`
- with `choice: "damage_type"`, the type chosen when the effect was applied

With `bypass: ["magical"]` it SHALL only apply to nonmagical bludgeoning, piercing and
slashing damage, as the stat blocks' "from nonmagical attacks". `bypass` with `silvered` or
`adamantine` SHALL be applied the same way, with a reminder, because the tracker doesn't know
the weapon. Level limits, choices that weren't made, `condition`s (checked as for other
modifiers; unknown ones make it a reminder that isn't applied) and the same definition twice
SHALL be handled as for other effect modifiers.

#### Scenario: Petrified
- **WHEN** a creature is Petrified
- **THEN** it has resistance to every damage type

#### Scenario: Stoneskin
- **WHEN** a creature has 5e Stoneskin (resistance to nonmagical bludgeoning, piercing and slashing)
- **THEN** a nonmagical slashing hit is halved and a magical slashing hit isn't

#### Scenario: Protection from Energy
- **WHEN** Protection from Energy is applied with fire chosen
- **THEN** the creature has resistance to fire only

### Requirement: Defenses combine with the creature's own

A creature's effective defense to a damage type SHALL combine its own stat block defenses
(`damage_resistances`, `damage_vulnerabilities`, `damage_immunities`) with its effects':
- immunity from any source wins
- resistance and vulnerability to the same type cancel, and the damage is normal
- otherwise the resistance or vulnerability applies

The creature's stored stat block SHALL NOT change.

#### Scenario: Effect resistance and own vulnerability
- **WHEN** a creature vulnerable to fire gains an effect with fire resistance
- **THEN** fire damage to it is normal

#### Scenario: Immunity wins
- **WHEN** a creature immune to poison damage is Petrified
- **THEN** poison damage to it is 0

### Requirement: Damage uses the effective defenses

The DM's damage SHALL use the target's effective defenses:
- **The roll dialog:** the defense buttons of each damage roll and the applied damage
- **Manual damage:** the computed amount and the target's defense buttons, in the actor
  panel and the legacy actions panel

The DM's choice of a defense button for a roll SHALL still override the effective defense,
as before.

#### Scenario: Petrified target in the roll dialog
- **WHEN** a goblin's 7 slashing damage hits a Petrified player
- **THEN** the R button of that damage roll is active, and 3 damage is applied

#### Scenario: Manual damage
- **WHEN** the DM enters 10 manual fire damage to a creature with Protection from Energy (fire)
- **THEN** its R defense is active and 5 damage is applied

#### Scenario: DM override
- **WHEN** the DM turns off the R button of that roll
- **THEN** the full damage is applied

### Requirement: Immune creatures aren't given the condition

A creature SHALL be immune to an SRD condition when its own `condition_immunities` list it,
or an active effect has a `defense` sub-effect with sub-type `i` and the condition in
`conditions`. Applying that condition to it SHALL NOT add it, however it's applied (the
effects drawer, the Conditions option, an escalating repeat save). A notice SHALL say
"<creature> is immune to <condition>". Other targets of the same application still get it.
Immunity to a condition doesn't block another condition that includes it.

#### Scenario: Monster immunity
- **WHEN** the DM applies Poisoned to a skeleton (immune to Poisoned) and a goblin
- **THEN** only the goblin is Poisoned, and the notice "Skeleton is immune to Poisoned" is shown

#### Scenario: Effect immunity
- **WHEN** the DM applies Frightened to a creature with Heroism
- **THEN** it isn't Frightened, and the notice says it is immune to Frightened

### Requirement: Gaining an immunity ends the condition

When a creature gains an immunity to a condition it has, from an effect applied to it, that
condition SHALL end with the notice reason "immune to <condition>".

#### Scenario: Heroism on a Frightened creature
- **WHEN** Heroism is applied to a Frightened creature
- **THEN** Frightened ends, with the notice "immune to Frightened"

#### Scenario: Petrified and Poisoned
- **WHEN** a Poisoned creature becomes Petrified
- **THEN** Poisoned ends

### Requirement: Effect defenses are shown on the card

The entity card's damage vulnerabilities, resistances and immunities, and its condition
immunities, SHALL list the effective defenses. Ones that come from effects SHALL be marked
like other values changed by effects, with a tooltip naming the effect. A type whose
resistance and vulnerability cancel is listed in neither.

#### Scenario: Petrified on the card
- **WHEN** the DM opens the card of a Petrified goblin
- **THEN** its damage resistances list every type, marked, with the tooltip "Petrified", and its condition immunities include Poisoned
