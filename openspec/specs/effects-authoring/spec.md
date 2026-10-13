# effects-authoring Specification

## Purpose

The custom effect form lets a user build effect definitions that use the full effects
schema. It also keeps the form's constants in sync with the schema, the SRD data and the
database rules.

## Requirements

### Requirement: The form edits every definition field except duration

The custom effect form SHALL edit these definition fields: `name` (required, at most 100
characters), `description`, `stacking`, `level`, `condition`, `ends_when`,
`sustain`, `aura` and `sub_effects`. It SHALL NOT offer `duration_type`,
`duration_value`, `cancel_trigger` or `url`, and a saved custom effect SHALL NOT contain them.

#### Scenario: No duration on the definition
- **WHEN** the user creates a custom effect
- **THEN** the form has no duration fields, and the saved effect has no `duration_type`, `duration_value` or `cancel_trigger`

### Requirement: Definitions are generic

An effect definition SHALL describe what the effect does, not where it comes from or how it
grows with its source. The effects schema SHALL NOT have `category`, `spell_level`,
`magical`, `tags`, `removed_by`, `area` (the action's or spell's), `cancelable` (every effect
can be removed by the DM) or
`scaling` on a definition or sub-effect, nor `tags` in a
source filter, and the form SHALL NOT offer them. Formulas SHALL NOT use the variables
`spell_level`, `char_level` or `class_level`. A definition becomes a spell effect, feature
or trait when it is linked to a spell, action or ability, and scaling with a spell slot or
caster is set on that link.

#### Scenario: No origin fields
- **WHEN** the user creates a custom effect
- **THEN** the form has no category, spell level, magical, tags, removed by, "can be removed" or scaling fields

#### Scenario: No spell or character level in formulas
- **WHEN** the user enters the formula `spell_level * 2`, `char_level` or `caster.class_level`
- **THEN** the field shows an unknown variable error and the effect can't be saved

#### Scenario: Origin fields are reported in SRD data
- **WHEN** an SRD definition has `category`, `spell_level`, `magical`, `tags`, `removed_by`, `area` or `cancelable`, or one of its sub-effects has `scaling`
- **THEN** the SRD data validation command reports it

#### Scenario: Definition-level blocks
- **WHEN** the user adds a level track with `initial: 1`, `max: 6`, `per_long_rest: -1` and `remove_at: 0`, and an `ends_when` check "has condition: incapacitated"
- **THEN** the saved effect has `level: { initial: 1, max: 6, per_long_rest: -1, remove_at: 0 }` and `ends_when: { type: "has_condition", value: "incapacitated" }`

### Requirement: Sub-effects show the fields of their type

Every sub-effect SHALL have a type, chosen from all schema sub-effect types, each with a
label and a description. The sub-type list SHALL offer only the sub-types allowed for that
type, and SHALL allow several. The other fields SHALL be shown only when the type uses them
and they matter for the chosen sub-types: roll fields and roll filters only for rolls, a
multiplier only for values it makes sense for, abilities, skills and attack types only for
the rolls or scores they narrow down. Changing the type or the sub-types SHALL remove the
values of fields that are no longer shown.

#### Scenario: Sub-types follow the type
- **WHEN** the user picks type "Defense"
- **THEN** the sub-type list offers Vulnerable, Resistant and Immune, and not Armor Class

#### Scenario: Fields follow the type
- **WHEN** the user picks type "Bonus" with sub-type "Saving throw"
- **THEN** the form shows value, roll, abilities and perspective, offers choice as an optional part, and doesn't show reroll or transfer fields

#### Scenario: Fields follow what it applies to
- **WHEN** the user picks type "Bonus" with Applies to "Armor Class"
- **THEN** the form shows only the value (no roll, multiplier, filters or perspective), and adding "Saving throws" to Applies to shows the roll, multiplier, perspective, abilities, context and creature types

#### Scenario: Changing type clears unused fields
- **WHEN** a "Damage modifier" sub-effect with `fraction: 0.5` and `to: "caster"` is changed to type "Bonus"
- **THEN** `fraction` and `to` are removed from the sub-effect

### Requirement: Amounts can be a number, a roll or a formula

Fields the schema types as an amount (save DC, escape DC, repeat-save DC, reroll bonus,
time value, duration value) SHALL accept a number, a dice roll (count, die, fixed value,
damage type, modifier formula) or a formula (formula, min, max, rounding). A sub-effect's
`value` SHALL accept a number or a formula. Formulas SHALL be checked with the tracker's
formula evaluator, and the form SHALL show an error for a formula it would reject.

#### Scenario: Formula value
- **WHEN** the user sets a bonus value to the formula `caster.cha_mod` with min 1
- **THEN** the saved sub-effect has `value: { formula: "caster.cha_mod", min: 1 }`

#### Scenario: Unsafe formula
- **WHEN** the user enters the formula `constructor`
- **THEN** the field shows an error and the effect can't be saved

### Requirement: Effect references pick SRD and custom definitions

The `effect` field of `includes` and `apply_effect`, the `effects` list of `remove_effect`
and the repeat-save `escalate.effect` SHALL be picked from a list. The list SHALL hold the
SRD conditions, the SRD effects and the user's other custom effects. Each SRD `url` from
either edition SHALL appear once. A pick SHALL be saved as `{ source, source_key, name }`.
The effect being edited SHALL NOT be offered.

#### Scenario: Including a condition
- **WHEN** the user adds an "Includes" sub-effect and picks Incapacitated
- **THEN** the sub-effect is saved as `{ type: "includes", effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" } }`

#### Scenario: Applying another custom effect
- **WHEN** the user picks their custom effect "Burning" (id `-Nx12`) for an "Apply effect" sub-effect
- **THEN** the sub-effect's `effect` is `{ source: "custom", source_key: "-Nx12", name: "Burning" }`

#### Scenario: No self reference
- **WHEN** the user edits custom effect `-Nx12`
- **THEN** `-Nx12` isn't offered as a reference

### Requirement: Nested sub-effect lists use the same editor

Sub-effect lists inside an effect SHALL be edited with the same sub-effect editor as the
top-level list, at any depth: `aura.sub_effects`, `save.success_effects`,
`save.fail_by_5_effects`, repeat-save `on_fail` and duration `on_expire`. Durations
inside a sub-effect (`apply_effect`'s `duration` and repeat-save `escalate.duration`) SHALL
be edited with a duration editor that offers every schema duration type and its fields.

#### Scenario: Aura sub-effects
- **WHEN** the user adds an aura with radius 10 and a "Bonus" sub-effect on saving throws inside it
- **THEN** the saved effect has `aura: { radius: 10, sub_effects: [{ type: "bonus", sub_types: ["save"], … }] }`

#### Scenario: Nested duration
- **WHEN** an "Apply effect" sub-effect with trigger "On hit" picks Incapacitated and sets its duration to "next turn", anchor target, edge end
- **THEN** the sub-effect's `duration` is saved as `{ type: "next_turn", anchor: "target", edge: "end" }`

#### Scenario: On-expire sub-effects
- **WHEN** that nested duration gets an `on_expire` sub-effect "Restrict → Movement"
- **THEN** it's edited with the same sub-effect editor and saved as `on_expire: [{ type: "restrict", sub_types: ["movement"] }]`

### Requirement: Condition sets can be built and nested

Every condition field (`condition`, `ends_when`, `aura.condition`, a sub-effect's
`condition`, the save's `advantage_if`, `auto_fail_if` and `auto_success_if`, and a
duration's `ends_when`) SHALL be edited as a set. A set is one check, or an "all of" or
"any of" group of sets, nested to any depth. A check SHALL offer every schema check type,
subject, comparator, `negate` and `description`.

#### Scenario: Any-of group
- **WHEN** the user builds "any of: has condition incapacitated, has condition unconscious"
- **THEN** it's saved as `{ any_of: [{ type: "has_condition", value: "incapacitated" }, { type: "has_condition", value: "unconscious" }] }`

#### Scenario: Single check
- **WHEN** the set has one check and no group
- **THEN** it's saved as that check object, not as an array

### Requirement: Choices are marked as chosen when applied

A sub-effect SHALL let the user set `choice` to ability, damage type, skill, condition,
creature type, option or value. Only choices whose field the sub-effect shows SHALL be offered
(Value only for a sub-effect with a value; option always). A field that the choice fills SHALL
be shown as "chosen when applied", and its fixed value removed. For a damage-type choice, the
damage types the user lists SHALL be the options offered when the effect is applied. With no
types listed, every type SHALL be offered.

#### Scenario: Generic absorption
- **WHEN** the user builds a "Damage modifier → Absorb" sub-effect with choice "damage type" and no damage types
- **THEN** the saved sub-effect has `choice: "damage_type"` and no `damage_types`, and applying the effect from the drawer asks for any damage type

#### Scenario: Limited damage type choice
- **WHEN** the choice is "damage type" and the listed damage types are acid, cold, fire, lightning and thunder
- **THEN** applying the effect asks for one of those five types

#### Scenario: Generic value
- **WHEN** the user builds a "Bonus → Armor Class" sub-effect with choice "Value"
- **THEN** the Value field shows "Chosen when the effect is applied", the saved sub-effect has `choice: "value"` and no `value`, and applying the effect asks for a number

#### Scenario: Fields say they can be variable
- **WHEN** a sub-effect shows a field a choice can fill (Value, Damage types, Abilities, Skills, Conditions or Creature types)
- **THEN** the field has an info icon whose popover explains that it can be made variable with Choice and gives an example; once the choice is set, the popover says the value is chosen when the effect is applied

#### Scenario: No value to choose
- **WHEN** the sub-effect is a "Defense → Resistant"
- **THEN** Value isn't offered as a choice

### Requirement: Simple effects stay short

Optional parts SHALL be shown in a **Configuration** list, one for the effect and one per
sub-effect.
- **Effect configurations**: stacking, level track, active only when, ends when, sustain
  and aura. The effect's Configuration list SHALL come after the sub-effects.
- **Sub-effect configurations**: trigger, target, choice, save, condition, used up, level
  range, source filter and id. Each sub-effect's list SHALL come after its type fields.

An **Add** menu SHALL offer the configurations that aren't in the list yet, each with its
name and a short explanation of what it does. Adding one SHALL put it in the list and open
its edit dialog. Each configuration in the list SHALL be an accordion item with its name on
the left and **Edit** and **Remove** on the right, in the order of the options:
- Expanding the item SHALL show its settings in words, e.g. "This effect doesn't stack: the
  stronger or longer instance is kept."
- **Edit** SHALL open a dialog with the configuration's explanation and its inputs.
- **Remove** SHALL remove the item and the configuration's values.
- An item whose required settings are missing SHALL show a warning icon.

A configuration that has values SHALL be in the list when an effect is opened.

#### Scenario: Short form
- **WHEN** the user creates an effect with one "Bonus → Armor Class" sub-effect
- **THEN** only name, description, that sub-effect's type, sub-types and value, and two empty Configuration lists with an Add menu are shown

#### Scenario: Options explain themselves
- **WHEN** the user opens the effect's Add menu
- **THEN** "Level track" is explained as a level that changes over time, like Exhaustion, and "Sustain" as an effect that ends unless something keeps it going

#### Scenario: Adding opens the dialog
- **WHEN** the user adds "Save" to a sub-effect
- **THEN** a "Save" item is added to that sub-effect's list and its edit dialog opens with the save's inputs

#### Scenario: Settings in words
- **WHEN** the user expands a "Stacking" item without settings
- **THEN** it says "This effect doesn't stack: the stronger or longer instance is kept."

#### Scenario: Removing removes the values
- **WHEN** the user removes "Aura" from an effect with an aura
- **THEN** the Aura item and the effect's `aura` are removed

#### Scenario: Unfinished configuration
- **WHEN** a sub-effect has a "Trigger" item without a trigger chosen
- **THEN** the item shows a warning icon, and its summary says to choose when the part happens

#### Scenario: Opened effect shows its parts
- **WHEN** the user opens a saved effect whose sub-effect has a save
- **THEN** that sub-effect's Configuration list has a "Save" item, and Edit shows its fields

### Requirement: Effects are validated against the schema before saving

The form SHALL enforce the required fields of each part: name, a type per sub-effect, at
least one sub-effect, the `effect` of `includes` and `apply_effect`, `effects` or
`conditions` on `remove_effect`, an ability on a repeat save, radius and sub-effects of an
aura, triggers of a sustain, and value and unit of a time.
Before saving, the whole effect SHALL be validated against the effects schema. When that
fails, the effect SHALL NOT be saved and the errors SHALL be shown with the field they
belong to.

#### Scenario: Missing reference
- **WHEN** the user saves an "Includes" sub-effect without picking an effect
- **THEN** the field shows "required" and nothing is saved

#### Scenario: Schema failure
- **WHEN** the effect fails schema validation on a field the form didn't catch
- **THEN** nothing is saved and the error names the field (e.g. "Sub-effect 2 › Consume › On")

### Requirement: Saved effects contain only set fields

A saved custom effect SHALL use the v2 shape (`sub_effects`, `sub_types`). Empty strings,
empty arrays, empty objects and unset optional fields SHALL be left out, and numbers SHALL
be saved as numbers. Opening a saved effect and saving it unchanged SHALL produce the same
stored effect.

#### Scenario: Clean output
- **WHEN** the user adds and then clears a sub-effect's skills
- **THEN** the saved sub-effect has no `skills` key

#### Scenario: Round trip
- **WHEN** the user opens a saved effect and changes nothing
- **THEN** the form reports no unsaved changes, and saving writes the same effect

### Requirement: Constants stay in sync with the schema, the SRD data and the database rules

A check SHALL fail and name each problem when:
- a value of a schema enum the form offers has no constants entry, or a constants entry
  isn't in the schema
- a type/sub-type pair used in the SRD effect or condition data of either edition isn't
  allowed by the constants
- the duration types accepted by the `effects` blocks in the database rules differ from the
  schema's `duration.type` enum

When the rules file isn't available, the check SHALL skip the rules part with a warning.

#### Scenario: New schema enum value
- **WHEN** a trigger is added to the schema without a constants entry
- **THEN** the check fails and names the trigger

#### Scenario: Rules regex out of date
- **WHEN** the schema has a duration type that a rules regex doesn't accept
- **THEN** the check fails and names the rules path and the missing type

#### Scenario: Rules file missing
- **WHEN** the rules repo isn't next to this repo
- **THEN** the check warns that the rules part was skipped, and still checks the rest

### Requirement: The effects form is documented

A documentation page SHALL explain how to build an effect with the form, at
`/documentation/effects`. It SHALL discuss every input of the form except the obvious ones
(name, description): every sub-effect type and its fields, every configuration of an effect
and of a sub-effect, condition checks, formulas, and the durations of applied effects. It
SHALL use the labels the form shows, and SHALL say what the tracker applies automatically and
what it only shows as a reminder. It SHALL describe the effects feature as it will be when the
effects plan is finished: applying effects (the Effects drawer, the set initiative screen,
action and spell rolls), trait effects, linking effects to actions, spells and special
abilities, and encounter reminders. Parts built in later steps SHALL be brought in line with
what is built when those steps are done. The text SHALL live in one markdown file in the repository
and SHALL be rendered by the server, so the page works without a network request for its
content. The custom effect form and the Documentation page SHALL link to it.

#### Scenario: Linked from the form
- **WHEN** the user is editing a custom effect
- **THEN** the form shows a "How effects work" link that opens `/documentation/effects`

#### Scenario: Every input is explained
- **WHEN** a field or configuration label of the form is looked up on the page
- **THEN** the page explains it, except name and description

#### Scenario: Rendered with the page
- **WHEN** `/documentation/effects` is requested
- **THEN** the server's response already contains the documentation text
