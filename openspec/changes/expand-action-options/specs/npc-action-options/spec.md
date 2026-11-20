# Spec Delta

## Purpose

Options of an NPC ability: named variants the DM picks when rolling it, each either changing
single rolls of the ability or bringing a whole action list of its own (a breath weapon's Fire
and Sleep Breath, an attack's Normal and Charge).

## ADDED Requirements

### Requirement: An option can have its own action list

The NPC schema SHALL allow an optional `option_actions` on abilities of the five groups (special
abilities, actions, bonus actions, reactions, legendary actions): an object whose keys are names
in the ability's `options`, other than the first, and whose values are action lists with the
same shape and limits as the ability's `action_list` (1 to 5 entries, each with its own type,
attack bonus or save ability and DC, rolls and action effects).

The first option SHALL be the ability's own `action_list` and SHALL NOT have a key in
`option_actions`. A key that is not one of the ability's options after the first SHALL make
the NPC invalid: the NPC import and the NPC form SHALL reject it (the schema checks the shape
of the lists, not their keys).

#### Scenario: Breath weapon with two options
- **WHEN** an ability has `options: ["Fire Breath", "Sleep Breath"]`, an `action_list` with a Dexterity save and 12d6 fire damage, and `option_actions: { "Sleep Breath": [{ type: "save", save_ability: "constitution", save_dc: 14, effects: { on_fail: [Unconscious link] } }] }`
- **THEN** it validates against the NPC schema, and the NPC import accepts it

#### Scenario: A list for the first option is rejected
- **WHEN** an imported ability has `options: ["Normal", "Charge"]` and `option_actions` with a key `"Normal"`
- **THEN** the import lists the NPC as invalid

#### Scenario: A list for an unknown option is rejected
- **WHEN** an imported ability has `options: ["Normal", "Charge"]` and `option_actions` with a key `"Pounce"`
- **THEN** the import lists the NPC as invalid

### Requirement: Rolling with an option rolls its own list

When an ability is rolled with an option that has its own action list, the tracker, the
compendium and the NPC form SHALL roll that list instead of the ability's `action_list`, entry
by entry as for the ability's own list, and the roll result SHALL be named "<ability> (<option>)".
The per-roll changes of `roll.options` SHALL NOT apply to an option's own list.

Effects linked in the option's list SHALL be listed and applied from the roll as effects linked
in an ability's own list are (effects-apply-from-rolls).

When an ability is rolled with the first option, or without an option, its `action_list` SHALL
be rolled, with the per-roll changes as today.

#### Scenario: Sleep Breath
- **WHEN** the DM rolls Breath Weapons with the Sleep Breath option
- **THEN** the result is named "Breath Weapons (Sleep Breath)", shows a DC 14 Constitution save with no damage, and lists the On a failed save Unconscious link

#### Scenario: Charge
- **WHEN** the DM rolls Gore with the Charge option, whose list has the attack with 2d6 + 3 and 2d6 piercing and an On a hit Prone link
- **THEN** the result shows the to-hit, both rolls and the Prone link, and rolling with Normal shows only the to-hit and 2d6 + 3

### Requirement: Options without their own list keep per-roll changes

An option without a key in `option_actions` SHALL roll the ability's `action_list` with the
per-roll changes it has in `roll.options` (ignore, damage type, dice count, dice type, fixed
value), as before this change. Existing NPCs, which have no `option_actions`, SHALL roll and
display exactly as before.

#### Scenario: Versatile longsword
- **WHEN** the DM rolls a longsword with `options: ["One-handed", "Two-handed"]` and a roll whose `options` give Two-handed a d10
- **THEN** rolling with Two-handed rolls the ability's attack with 1d10 damage

### Requirement: The NPC form edits an option's own actions

In the NPC form, each option after the first SHALL have an **Own actions** switch. When it is
on, the option SHALL show its own **Actions** list, edited with the same controls as the
ability's action list: add, edit and remove entries, their rolls and their effect links. When
it is off, the option SHALL keep the per-roll fields in the roll dialog as today.

Switching Own actions on for an option SHALL start its list as a copy of the ability's action
list, without the per-roll changes of other options. Switching it off SHALL ask for
confirmation and remove the option's list.

Renaming an option SHALL rename its key in `option_actions`. Removing an option SHALL remove
its list. When the NPC is saved, an option list SHALL contain only set fields, as an ability's
action list does.

#### Scenario: Copy to start from
- **WHEN** the user switches Own actions on for Charge on a Gore with one attack entry
- **THEN** Charge shows an Actions list with a copy of that attack entry, which the user can add a roll and a Prone link to

#### Scenario: Removing an option
- **WHEN** the user removes the Sleep Breath option
- **THEN** the saved NPC has no `option_actions` key for Sleep Breath

### Requirement: Roll buttons and captions consider every list

An ability SHALL get a roll button when its own `action_list` or any option's list has an entry
that is not of type other and has rolls (effects-action-links). The roll button's option menu
SHALL list every option, as it does today.

The tracker's action list and the entity card SHALL caption the ability's own `action_list`, as
in effects-action-links, followed by the names of the options that have their own list.

#### Scenario: Only the option rolls damage
- **WHEN** an ability's own list is an other entry with a link, and its Charge option's list has an attack with rolls
- **THEN** the ability has a roll button

### Requirement: Database rules and import check option lists

The database rules for user NPCs SHALL accept `option_actions` on abilities of the five groups,
with each list checked as the rules check an `action_list`, and SHALL reject other fields in it.
Importing NPCs SHALL validate `option_actions` against the NPC schema, with the existing error
list for invalid NPCs.

#### Scenario: Import of an invalid option list
- **WHEN** a user imports an NPC whose option list has an entry with six rolls of an unknown type
- **THEN** the import lists the NPC as invalid with the schema error, and does not save it
