# effects-apply-from-rolls Specification

## Purpose

Applies the effects linked to monster actions and spells from the tracker's roll result: which
linked effects apply with the chosen result, applying them with the roll (with the link's
choices, duration, caster and Magical, and inline fields for what the link leaves open), spell
casts that scale their links and concentrate on the spell, spells that only apply effects
without a roll, and magical repeat saves.

## Requirements

### Requirement: The roll result shows which linked effects apply

The roll result SHALL list, under each rolled action, the effects linked to it on an outcome
that fits its type, one line each: the effect name, its outcome ("On a hit"…), and whether it
applies with the result chosen in the roll: **Applies** (Always, or the chosen hit, miss,
failed or successful save matches), **Doesn't apply** (dimmed), or "Hit or miss?" / "Fail or
save?" while that result isn't chosen. With several actions in one roll, the actions SHALL be
separated by space and a divider.

In an ability with several actions, a save action that follows an attack action SHALL wait
for that attack's hit: when the attack missed, the save action's effects show "Attack missed"
and don't apply; while the hit isn't chosen, they show "Hit or miss?".

#### Scenario: Rolling an action with a link
- **WHEN** the DM rolls a bite that has an On a hit Grappled link, and the attack hits
- **THEN** the result shows "Grappled · On a hit · Applies"

#### Scenario: Save not chosen yet
- **WHEN** the DM rolls a poison save action with an On a failed save Poisoned link against a target and hasn't chosen Fail or Save
- **THEN** the result shows "Poisoned · On a failed save · Fail or save?", and choosing Save changes it to "Doesn't apply"

#### Scenario: Ghoul's claws miss
- **WHEN** the ghoul's claws (an attack, then a Constitution save with an On a failed save Paralyzed link) miss and the save shows Fail
- **THEN** Paralyzed shows "Attack missed" and isn't applied

#### Scenario: Ghoul's claws hit
- **WHEN** the claws hit and the save fails
- **THEN** Paralyzed shows "Applies"

### Requirement: Applying the roll applies its linked effects

Each linked effect line that applies SHALL have a checkbox, checked by default. The roll's
Apply buttons (Full, Half, Double, and Missed) SHALL, after applying the damage or healing,
apply every checked effect that applies to the card's target, once. A roll without damage or
healing rolls SHALL show a single **Apply** button instead of Full, Half and Double. Effects
that don't apply, or are waiting for a result, SHALL NOT be applied. An area roll SHALL apply
the effects on each target's card to that target only. Applying SHALL use the same storage,
immunity checks and triggers as the Effects drawer (an immune target is skipped with its
notice).

#### Scenario: Grapple on a hit
- **WHEN** the DM applies a bite that hit, with its Grappled line checked
- **THEN** the target takes the damage and gets Grappled, with the biting creature as the caster

#### Scenario: Unchecked
- **WHEN** the DM unchecks Grappled and applies the roll
- **THEN** only the damage is applied

#### Scenario: Save-only action
- **WHEN** Hold Person is rolled against a goblin, which fails its save
- **THEN** the card shows one Apply button, and applying it gives the goblin Paralyzed

#### Scenario: Area spell
- **WHEN** an area spell with an On a failed save Restrained link is rolled against three targets, two of which fail
- **THEN** applying each card gives Restrained to the two that failed and not to the third

#### Scenario: Immune target
- **WHEN** a Paralyzed link applies to a creature immune to Paralyzed
- **THEN** the damage is applied, Paralyzed is skipped, and the immunity notice is shown

### Requirement: Applied effects use the link

An effect applied from a roll SHALL be built from its link: the effect, the link's fixed
choices, its level (or none), its duration, and `magical` when the link has it. The caster
SHALL be the creature that rolled. A link that leaves a choice open SHALL show a select per
open choice under its line, and the Apply buttons SHALL be disabled, with a note under the
line naming the missing choice, while a checked effect misses one. A link without a duration
SHALL show a duration field under its line, starting at Until removed. Fields are only shown
for checked lines that apply.

#### Scenario: Fixed choice
- **WHEN** a clay golem's slam links Absorption with `choices: { damage_type: "acid" }` and applies
- **THEN** the applied instance has `choices: { damage_type: "acid" }` and no select is shown

#### Scenario: Open choice
- **WHEN** a link to Protection from Energy leaves its damage type open and applies
- **THEN** a Damage type select is shown under its line, and Apply is disabled until it's chosen

#### Scenario: No duration on the link
- **WHEN** a link without a duration applies
- **THEN** a duration field starting at Until removed is shown, and the effect is applied with the chosen duration

### Requirement: Spell casts scale their links

An effect linked to a spell action SHALL be applied as the spell is cast: its value choice,
level and duration follow the link's scaling and duration tiers for the slot it's cast with
and the caster's level (see effects-spell-links). A repeat save without a DC SHALL get the
caster's spell save DC as changed by its effects. Innate spells use the level they're cast at.

#### Scenario: Magic Weapon at 4th level
- **WHEN** a spell_level Magic Weapon with an Attack Roll Bonus link (value 1, tiers 2 from 3rd, 3 from 6th) is cast with a 4th-level slot
- **THEN** the applied Attack Roll Bonus has the value choice 2

#### Scenario: Hex at 3rd level
- **WHEN** Hex with duration tiers is cast with a 3rd-level slot
- **THEN** the applied Hex lasts up to 8 hours

#### Scenario: Hold Person's repeat save
- **WHEN** Hold Person's Paralyzed link has a repeat save without a DC and the caster's spell save DC is 15
- **THEN** the applied Paralyzed has `save_dc: 15`

### Requirement: Concentration spells concentrate on the spell

When an effect from a spell cast is applied with a Concentration duration, the caster's
Concentration SHALL be for the spell (`concentration_for: { source: "spell", source_key:
<the spell's key>, name: <the spell's name> }`), and every effect applied from that spell SHALL
link to it:
- without a Concentration, one is started, up to the duration's time
- with a Concentration for the same spell, it is shared
- with a Concentration for anything else, it is replaced: it ends with the reason "started
  concentrating on <spell>", and its linked effects end through the existing cascade
- with a Concentration of unknown origin, the new effects link to it

A tier that changes the duration to one without Concentration SHALL start no Concentration.
Effects from non-spell actions follow the Effects drawer's Concentration rules.

#### Scenario: Magic Weapon's two effects
- **WHEN** Magic Weapon links Attack Roll Bonus and Damage Roll Bonus with a Concentration duration and is applied
- **THEN** the caster gets one Concentration for Magic Weapon, and both effects are linked to it

#### Scenario: Hold Person on two targets
- **WHEN** Hold Person, upcast, is applied to two targets from two cards
- **THEN** the second target's Paralyzed shares the caster's Concentration for Hold Person

#### Scenario: Casting another Concentration spell
- **WHEN** a caster concentrating on Bless applies Hold Person's Paralyzed
- **THEN** Bless's Concentration ends with "started concentrating on Hold Person" and its effects end, and a Concentration for Hold Person starts

#### Scenario: Bestow Curse at 5th level
- **WHEN** Bestow Curse with a Time tier of 8 hours from 5th level is cast with a 5th-level slot
- **THEN** the curse lasts 8 hours and the caster's Concentration doesn't change

### Requirement: Spells that only apply effects are applied without a roll

A spell whose actions have no rolls, are not attacks or saves, and only link effects on
**Always** (Aid, Bless, Mage Armor) SHALL get an **Apply** button in the actor's spell list
instead of the roll button. Applying SHALL work like casting it: it needs a target, uses the
slot (or the innate spell's use), confirms restrictions and uses the reaction out of turn like a
roll, and applies the spell's linked effects to every targeted creature as the roll card would
(the cast's scaling, the caster's spell save DC, Concentration for the spell), without a roll
card. When a link leaves a choice open or has no duration, it SHALL fall back to the roll card,
which asks for them. Spells with any roll, attack or save, or a link on another outcome, keep the
roll button.

#### Scenario: Aid
- **WHEN** the caster selects three allies and clicks Apply on Aid, a spell with one action of type other and an Always link
- **THEN** no roll card opens, the slot is used, and the three allies get Aid with the caster as the caster

#### Scenario: Bless needs Concentration
- **WHEN** Bless (Always link, Concentration duration) is applied to three allies
- **THEN** the caster gets one Concentration for Bless, linked to the three Bless instances

#### Scenario: An open choice falls back to the roll card
- **WHEN** an Always-only spell's link leaves a choice open, and the DM clicks Apply
- **THEN** the roll card opens with the choice under the effect, as for a roll

#### Scenario: A spell with a save keeps the roll button
- **WHEN** a spell has a save action, or any roll
- **THEN** it has the roll button, not Apply

### Requirement: Magical effects make magical saves

An applied instance SHALL store `magical: true` when its link is magical. The repeat saves of
a magical instance, rolled from its save prompt, SHALL be rolled as saves against magic, so
roll modifiers that only count against magic (Magic Resistance) apply; without `magical` the
source stays unknown.

#### Scenario: Magic Resistance against Hold Person
- **WHEN** a creature with Magic Resistance rolls the repeat save of a Paralyzed applied by Hold Person (magical link)
- **THEN** the save has Advantage from Magic Resistance
