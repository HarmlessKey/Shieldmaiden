## Purpose

Lets an NPC's special abilities (traits) carry always-active effects, like a clay golem's Acid
Absorption or Magic Resistance, so the combat tracker applies them for every NPC and companion
without the DM adding them by hand. Covers the trait link data, the NPC form, how the tracker
treats trait effects, limited traits, display, and the schema and database rules.

## ADDED Requirements

### Requirement: Special abilities can carry trait links

The NPC schema SHALL allow an optional `effects` list on each special ability: a list of
effect links (`$defs/effect_link` of the effects schema) without `duration`, so with `effect`
(required), `choices`, `level` and `magical`. It SHALL be separate from the effects on the
ability's action-list entries; a special ability can have both. An NPC without trait links
SHALL validate and behave exactly as before.

#### Scenario: Golem's Acid Absorption
- **WHEN** a special ability has `effects: [{ effect: { source: "srd", source_key: "absorption", name: "Absorption" }, choices: { damage_type: "acid" } }]`
- **THEN** the NPC validates against the NPC schema

#### Scenario: Trait link with a duration
- **WHEN** a trait link has `duration: { type: "cancelled" }`
- **THEN** the NPC does not validate

### Requirement: The NPC form edits trait links

In the NPC form, every special ability SHALL show a **Trait effects** list, below its other
fields and outside its Actions list, styled like the action Effects list: one line per link
with the effect name and a summary of its fixed choices, level and magical, an edit and a
remove button, an **Add effect** button, and "No trait effects" when empty. Adding or editing
a link SHALL open a dialog with **Effect**, **Choices**, **Level** and **Magical** as in the
action link dialog, without When and Duration. Every choice of the selected definition SHALL be
required: a trait effect is always active, so nothing can be chosen when it's applied. Saving
the NPC SHALL store only set link fields, and no `effects` when the list is empty.

#### Scenario: Linking Absorption
- **WHEN** the user adds Absorption to a clay golem's Acid Absorption trait and sets its damage type to acid
- **THEN** the trait's list shows "Absorption · Damage Type: Acid", and the saved ability has `effects: [{ effect: <Absorption>, choices: { damage_type: "acid" } }]`

#### Scenario: Open choice blocks saving the link
- **WHEN** the user picks Damage Resistance and leaves its damage type empty
- **THEN** the dialog's Save button is disabled and the damage type shows that it's required

### Requirement: Trait effects are active in the combat tracker

For every NPC and companion in an encounter, the tracker SHALL treat each trait link of its
special abilities as an active effect of that creature, with the link's fixed choices and
level, the definition resolved in the campaign's edition like applied effects, and the
creature as its caster. Trait effects SHALL count everywhere applied effects count: effective
stats and defenses, damage modifiers, roll modifiers, triggers and their prompts, restrictions,
condition checks and drop to 1 hit point. Players SHALL NOT get trait effects in this step.

#### Scenario: Acid heals the golem
- **WHEN** a clay golem with a linked acid Absorption takes 10 acid damage
- **THEN** the damage is absorbed as for an applied Absorption, without the DM applying anything

#### Scenario: Magic Resistance
- **WHEN** a creature with a Magic Resistance trait link rolls a saving throw against a spell
- **THEN** the roll has Advantage from Magic Resistance

#### Scenario: Undead Fortitude names the ability
- **WHEN** a zombie with an Undead Fortitude trait link drops to 0 hit points
- **THEN** the drop to 1 prompt is shown and names "Undead Fortitude"

#### Scenario: Companion
- **WHEN** a companion's special ability links Evasion
- **THEN** Evasion works for the companion in the encounter

### Requirement: Trait effects are not stored, timed or removable

Trait effects SHALL NOT be written to the creature's stored effects in the encounter or the
campaign. They SHALL have no duration, SHALL NOT tick or expire, and SHALL NOT be removable in
the Effects drawer. Changing the NPC's trait links SHALL change its trait effects the next time
the encounter is loaded.

#### Scenario: Not in the stored effects
- **WHEN** an encounter with a clay golem starts
- **THEN** the golem's stored `effects` in the encounter contain no Absorption, and Absorption still works

#### Scenario: End of round
- **WHEN** rounds pass in combat
- **THEN** trait effects stay active and show no rounds left

### Requirement: Conditions on the effect switch trait effects off

A trait effect whose definition has a condition (`condition`, active only when) SHALL apply
only while that condition holds, as for applied effects.

#### Scenario: Evasion while Incapacitated
- **WHEN** a creature with an Evasion trait link is Incapacitated and fails a Dexterity save against an area effect
- **THEN** Evasion doesn't change the damage

### Requirement: Used-up trait effects count against the ability's limit

When a trait effect is used up (a sub-effect with `consume` that the engine would end for an
applied effect, like a single-use reaction), the tracker SHALL NOT remove anything; instead it
SHALL count one use on its special ability's limit (`limit` / `limit_type`, stored in the
creature's limited uses like the ability's other uses). While the ability's uses are spent the
trait effect SHALL be inactive, and it SHALL be active again when its uses are reset. A trait
effect whose ability has no limit SHALL NOT be used up.

#### Scenario: Three uses a day
- **WHEN** a trait with a 3/day limit links an effect that is used up when it's used, and it is used three times in an encounter
- **THEN** the ability's limited uses show 3 of 3 used and the trait effect no longer applies

#### Scenario: Uses reset
- **WHEN** the DM resets the ability's limited uses
- **THEN** the trait effect applies again

#### Scenario: No limit
- **WHEN** a trait without a limit links an effect with `consume`
- **THEN** using it doesn't count anything and the effect stays active

### Requirement: Trait effects are shown on the ability, not in the effects lists

Trait effects SHALL NOT appear in the creature's effects or conditions on the tracker card,
in the Effects drawer's list of applied effects, or on the public initiative (live view). In
the tracker, a special ability with trait links SHALL show an automated marker whose tooltip
names its linked effects. Prompts and notices from a trait effect SHALL name the special
ability.

#### Scenario: Golem in the tracker
- **WHEN** the DM looks at a clay golem in the tracker
- **THEN** its effects list is empty, and its Acid Absorption trait shows the automated marker with "Absorption (acid)" in its tooltip

### Requirement: Database rules accept trait links only

The database rules for user NPCs SHALL accept `effects` on special abilities as a list of
links, each requiring `effect` with `source` (`srd`, `custom` or `api`) and `source_key`, and
accepting `choices` (strings of at most 100 characters, keyed by a choice kind), `level` (1 to
99) and `magical` (a boolean). `duration` and any other key SHALL be rejected.

#### Scenario: Trait link written
- **WHEN** the form saves an NPC with the golem's Absorption trait link
- **THEN** the write is accepted

#### Scenario: Duration rejected
- **WHEN** a client writes a trait link with a `duration`
- **THEN** the write is rejected

### Requirement: The documentation describes trait effects as built

The How effects work page's "Traits" and "Trait effects" sections SHALL match what this change
builds: the Trait effects list and its fields, that every choice is fixed, that trait effects
work for NPCs and companions, that conditions switch them off, how limited traits count their
uses, and that they're shown on the ability, not in the effects list.

#### Scenario: Docs match the form
- **WHEN** a user reads "Trait effects" on the How effects work page
- **THEN** every field it lists is in the trait link dialog with the same label
