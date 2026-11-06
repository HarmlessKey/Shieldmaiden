## Purpose

Lets a custom spell's actions name the effects they cause, like Hold Person's Paralyzed or
Magic Weapon's attack and damage bonus, with how they grow when the spell is cast with a higher
slot or by a higher-level caster. Covers spell links, link scaling, the spell form, saving, the
database rules and the import. Applying linked effects when a spell is cast is not part of this
capability.

## ADDED Requirements

### Requirement: Spell actions can carry action effects

The spell schema SHALL allow an optional `effects` (action effects: `on_hit`, `on_miss`,
`on_fail`, `on_success`, `always`, each a list of effect links) on each spell action. The
outcomes SHALL refer to the action's own attack or save: `on_fail` / `on_success` use the
action's save ability and the caster's spell save DC. A spell without `effects` SHALL validate
and behave exactly as before.

#### Scenario: Hold Person
- **WHEN** a spell action of type save (Wisdom) has `effects: { on_fail: [{ effect: <Paralyzed>, duration: { type: "concentration", value: 1, unit: "minute", save: { ability: "wisdom", triggers: ["end_turn_target"] } } }] }`
- **THEN** the spell validates against the spell schema

#### Scenario: Existing spell unchanged
- **WHEN** a spell saved before this change is opened, saved, imported or cast
- **THEN** it validates and works as before

### Requirement: Spell links scale with the spell's scaling type

A link on a spell action SHALL accept `scaling`: a list of tiers, each with `level` (1 to 20)
and at least one of `value` (a number) and `effect_level` (a whole number). The tiers SHALL be
read like the spell's own `scaling`:
- `spell_scale`: one tier; for every `level` slot levels above the spell's level, the link's
  value choice grows by `value` and its level by `effect_level`
- `spell_level`: from a slot of at least `level`, the value choice is `value` and the level is
  `effect_level` (the highest tier reached wins)
- `character_level`: the same, by the caster's level instead of the slot
- `none` (or no scaling on the spell): tiers are ignored

Scaling SHALL change only the link's value choice and its level; a tier without the value or
level part leaves that part unchanged. Links on monster actions and traits SHALL NOT carry
`scaling`.

#### Scenario: Magic Weapon (2024)
- **WHEN** a `spell_level` spell of level 2 links Attack Roll Bonus with `choices: { value: "1" }` and tiers `[{ level: 3, value: 2 }, { level: 6, value: 3 }]`
- **THEN** cast with a 2nd-level slot the value is 1, with a 4th-level slot 2, and with a 7th-level slot 3

#### Scenario: Magic Weapon (2014)
- **WHEN** a `spell_scale` spell of level 2 links Attack Roll Bonus with value 1 and the tier `[{ level: 2, value: 1 }]`
- **THEN** cast with a 4th-level slot the value is 2, and with a 6th-level slot 3

#### Scenario: A cantrip by caster level
- **WHEN** a `character_level` cantrip links an effect with value 1 and tiers `[{ level: 5, value: 2 }, { level: 11, value: 3 }]`
- **THEN** for a 12th-level caster the value is 3

#### Scenario: Scaling on an NPC link is rejected
- **WHEN** an NPC action link has `scaling`
- **THEN** the NPC does not validate against the NPC schema

### Requirement: Spell links can last longer with a higher slot

A link on a spell action that has a `duration` SHALL accept `duration_scaling`: a list of
tiers, each with `level` (a slot level, 1 to 9) and `duration` with `type` (Time,
Concentration or Until removed), and `value` (a whole number of at least 1) and `unit` for
Time, or optionally for Concentration. Cast with a slot of at least a tier's `level`, the
highest such tier SHALL replace the link duration's type, value and unit. The duration's other
parts (repeat save, escape, ends early) SHALL stay. Duration scaling SHALL NOT depend on the
spell's scaling type. Links on monster actions and traits SHALL NOT carry `duration_scaling`.

In the link dialog, a spell link with a duration SHALL show **Duration by slot level**: tiers
with a **From slot level** and the duration's type, value and unit, an Add tier button and a
remove button per tier. A tier without a slot level, or with Time and no value, SHALL keep the
dialog from saving. A slot level that isn't above the spell's level, or is above 9, SHALL be
an error. Without a link duration the tiers are hidden and are not saved.

#### Scenario: Hex (2024)
- **WHEN** a level 1 spell links an effect with `duration: { type: "concentration", value: 1, unit: "hour" }` and tiers `[{ level: 2, duration: { type: "concentration", value: 4, unit: "hour" } }, { level: 3, duration: { type: "concentration", value: 8, unit: "hour" } }, { level: 5, duration: { type: "concentration", value: 24, unit: "hour" } }]`
- **THEN** cast with a 1st-level slot it lasts up to 1 hour, with a 4th-level slot up to 8 hours, and with a 6th-level slot up to 24 hours

#### Scenario: Bestow Curse drops Concentration
- **WHEN** a level 3 spell links a curse with a Concentration duration of 1 minute and a repeat save, and tiers `[{ level: 4, duration: { type: "concentration", value: 10, unit: "minute" } }, { level: 5, duration: { type: "time", value: 8, unit: "hour" } }, { level: 9, duration: { type: "cancelled" } }]`
- **THEN** cast with a 5th-level slot the duration is Time, 8 hours, with the repeat save; with a 9th-level slot it lasts until removed

#### Scenario: Spell without scaling
- **WHEN** the spell's scaling is none and a link has duration tiers
- **THEN** the dialog shows Duration by slot level, and the tiers apply by slot level

#### Scenario: No duration
- **WHEN** the link's duration is cleared
- **THEN** Duration by slot level is hidden, and the saved link has no `duration_scaling`

### Requirement: The spell form edits spell links

In the spell form, every spell action SHALL show the **Effects** list of NPC actions (one line
per link, the dialog with When, Effect, Choices, Level, Duration and Magical) below its rolls.
When the spell scales, the link dialog SHALL also show **Scaling**: tiers labelled after the
spell's scaling type (per slot levels above the spell's level, from slot level, or from caster
level), each with a level and a value and, for an effect with a level track, a level. A new
spell link SHALL start with **Magical** on, and for a spell with a Concentration duration with a
Concentration duration of the spell's duration. A new repeat save on a save action SHALL start
with the action's save ability. On a spell link the repeat save's **DC** MAY be left empty: it
then shows "Caster's spell save DC" and the caster's spell save DC is used when the effect is
applied. Saving the spell SHALL store only set link fields and no empty lists.

#### Scenario: Adding Hold Person's effect
- **WHEN** the user adds an effect to Hold Person's Wisdom save action
- **THEN** the dialog offers When On a failed save, On a successful save and Always, Magical is on, and the duration starts as Concentration, 1 minute

#### Scenario: Repeat save without a DC
- **WHEN** the user selects Repeat save to end on Hold Person's Paralyzed link and leaves the DC empty
- **THEN** the dialog can be saved, and the link's `duration.save` has the ability and triggers and no `dc`

#### Scenario: No scaling field for a spell that doesn't scale
- **WHEN** the spell's scaling is none
- **THEN** the link dialog has no Scaling field

### Requirement: The link dialog can use the spell's duration

When the spell's duration fits an effect duration, the Duration select of a spell link SHALL
have a **Spell duration** button that sets the link's duration to the spell's, converted as:
Concentration → Concentration up to the spell's duration and unit (no value when the spell has
none), Time → Time with the spell's duration and unit, Until dispelled and Until dispelled or
triggered → Until removed. Instantaneous, Special, and Time without a duration have no fitting
duration and SHALL show no button. The button SHALL keep the selected End effect options and
their values. A new Concentration spell link SHALL start with this same duration.

#### Scenario: Using Magic Weapon's duration
- **WHEN** the user clicks Spell duration on a link of a spell with duration type Concentration, duration 1 and scale hour
- **THEN** the link's duration is `{ type: "concentration", value: 1, unit: "hour" }`

#### Scenario: Keeping the repeat save
- **WHEN** the link has a repeat save and the user clicks Spell duration on a spell with duration type Time, 1 minute
- **THEN** the duration is Time, 1 minute, and still has the repeat save

#### Scenario: Until dispelled
- **WHEN** the spell's duration type is Until dispelled
- **THEN** Spell duration sets the duration to Until removed

#### Scenario: No fitting duration
- **WHEN** the spell's duration type is Instantaneous
- **THEN** the Duration select has no Spell duration button

### Requirement: Spell actions look like NPC actions in the form

The spell form's actions SHALL match the NPC form's actions where they share fields:
- each action's collapse header SHALL be one line (no subtitle): the action name, the action
  type, the save ability abbreviated for a save (`WIS`; spells have no DC of their own), and
  the number of rolls and linked effects (`1 roll, 2 effects`), separated by ` · `, parts without
  a value left out
- the type field SHALL be labelled **Action type**, and the **Save ability** field SHALL only be
  shown for an action of type save
- the rolls SHALL have the same header as the NPC form's rolls (a label line with the add button
  at its end)

Fields that only spells have (the action name) stay.

#### Scenario: Hold Person's header
- **WHEN** Hold Person's action "Paralyze" is a Wisdom save with no rolls and one linked effect
- **THEN** its collapsed header reads "Paralyze · Save · WIS · 1 effect"

#### Scenario: Save ability only for saves
- **WHEN** an action's type is Spell attack
- **THEN** the form shows no Save ability field

### Requirement: Database rules accept spell links

The database rules for user spells SHALL accept `effects` on spell actions with the outcome
lists and link fields of NPC action links plus `scaling` (tiers with `level` 1–20, `value` and
`effect_level` numbers, nothing else) and `duration_scaling` (tiers with `level` 1–9 and a
`duration` with `type` time, concentration or cancelled, `value` 1–9999 and `unit`, nothing
else). Any other key SHALL be rejected. The `effects` key on a
spell action's rolls SHALL no longer be accepted.

#### Scenario: Spell link written
- **WHEN** the form saves Magic Weapon with a scaled Attack Roll Bonus link
- **THEN** the write is accepted

#### Scenario: Effects on a roll rejected
- **WHEN** a client writes `effects` under a spell action's roll
- **THEN** the write is rejected

### Requirement: Spell import checks spell links

Importing spells SHALL validate their actions' effects against the effects schema's link shape,
with the existing error list for invalid spells.

#### Scenario: Invalid spell link
- **WHEN** an imported spell has a link without `effect`
- **THEN** the spell is listed as invalid with the schema error

### Requirement: The documentation describes spell links as built

The How effects work page's "Spell effects" section SHALL match what this change builds: the
Effects list on spell actions, the caster's spell save DC for save outcomes, the Scaling field
and how it follows the spell's scaling type, Duration by slot level, and the Magical and
Concentration defaults.
Text about applying linked effects when a spell is cast (step 7) stays.

#### Scenario: Docs match the dialog
- **WHEN** a user reads "Spell effects" on the How effects work page
- **THEN** every field it lists for a spell link is in the link dialog with the same label
