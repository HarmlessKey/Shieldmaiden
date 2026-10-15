## Purpose

Lets an NPC's actions name the effects they cause: which effect, on which outcome of the
action, for how long, with which choices fixed and whether it is magical. Covers the link
shape, how the NPC form edits links, what is saved, and how the database rules and the NPC
import check them. Applying linked effects from a roll is not part of this capability.

## ADDED Requirements

### Requirement: An effect link stores the effect and how it is applied

The effects schema SHALL define an effect link with these fields, and no others:
- `effect` (required): a reference `{ source, source_key, name }` to an SRD condition, an SRD
  effect or a custom effect
- `duration`: a duration as applied in the tracker (type, value and unit, anchor and edge,
  repeat save, escape, cancel triggers, ends when, effects when it ends)
- `choices`: fixed choices by kind (`ability`, `damage_type`, `skill`, `condition`,
  `creature_type`, `option`, `value`), each a string; a value choice is a number written as a
  string
- `level`: the levels it applies, an integer of at least 1, for an effect with a level track
- `magical`: a boolean

A link SHALL NOT carry a save of its own, a concentration id or scaling.

#### Scenario: A grapple link
- **WHEN** a link is `{ effect: { source: "srd", source_key: "grappled", name: "Grappled" }, duration: { type: "cancelled", escape: { dc: 14 } } }`
- **THEN** it validates against the effect link schema

#### Scenario: A link with a save is rejected
- **WHEN** a link has `save: { ability: "constitution", dc: 13 }`
- **THEN** it does not validate against the effect link schema

### Requirement: Action effects group links by outcome

The effects schema's action effects SHALL have the outcome lists `on_hit`, `on_miss`,
`on_fail`, `on_success` and `always`, each a list of effect links, and no other properties.
The action's own save ability and DC SHALL be the save that `on_fail` and `on_success` refer
to; action effects SHALL NOT have a `save` of their own.

#### Scenario: Outcome lists only
- **WHEN** action effects are `{ on_fail: [<link>], save: { ability: "wisdom" } }`
- **THEN** they do not validate, because `save` is not allowed

### Requirement: Every NPC ability with an action type can carry action effects

The NPC schema SHALL allow an optional `effects` (action effects) on each action-list entry of
special abilities (traits), actions, bonus actions, legendary actions and reactions. An NPC
without `effects` SHALL validate and behave exactly as before.

#### Scenario: Existing NPC unchanged
- **WHEN** an NPC saved before this change (rolls only, no `effects`) is opened, saved, imported or used in an encounter
- **THEN** it validates and works as before

#### Scenario: Trait with an effect
- **WHEN** a special ability with a save action-list entry has `effects: { on_fail: [<Poisoned link>] }`
- **THEN** the NPC validates against the NPC schema

### Requirement: An ability can have several action-list entries

An ability's `action_list` SHALL hold 1 to 5 entries. Each entry SHALL have its own type,
attack bonus or save ability and DC, rolls and effects, and its `on_hit` / `on_miss` links
SHALL refer to its own attack and its `on_fail` / `on_success` links to its own save. Rolls
and effects on the same outcome SHALL fit in one entry; an ability only needs a second entry
for a second attack or save.

#### Scenario: Damage and grapple on a hit
- **WHEN** a bite has one melee weapon entry with a piercing roll and an On a hit Grappled link
- **THEN** the NPC validates, and the bite needs no second entry

#### Scenario: Damage on a hit, poison on a failed save
- **WHEN** a bite has a melee weapon entry with a piercing roll, and a second save entry (Constitution, DC 11) with a poison roll and an On a failed save Poisoned link
- **THEN** the NPC validates against the NPC schema

#### Scenario: Too many entries
- **WHEN** an ability has 6 action-list entries
- **THEN** it does not validate against the NPC schema

### Requirement: The NPC form edits several entries per ability

In the NPC form, an expanded ability SHALL list its action-list entries under an **Actions**
label, with an **Add action** button at the end of that line. Each entry SHALL be a collapse
item, like the abilities themselves, with a header of one line (no subtitle): the action type,
then the to hit (`+4 to hit`) or the save (`DC15 CON`), then the number of rolls and linked
effects (`1 roll, 2 effects`), separated by ` · `; parts without a value are left out. Expanding it SHALL
show its type, attack bonus or save fields, rolls and Effects list. **Add action** SHALL add an
entry (type save by default), opened, while the ability has fewer than 5. Every entry except
the first SHALL have a remove button in its header. Removing an entry SHALL remove its rolls and
links with it.

#### Scenario: Collapsed entries
- **WHEN** the user expands a bite with a melee attack (+4 to hit, a piercing roll, an On a hit Grappled link) and a Constitution DC 15 save with a poison roll and two links
- **THEN** its Actions list shows two collapsed items, "Melee weapon · +4 to hit · 1 roll, 1 effect" and "Save · DC15 CON · 1 roll, 2 effects", and expanding one shows its inputs, rolls and effects

#### Scenario: Adding a save entry
- **WHEN** the user clicks Add action on a bite with one attack entry
- **THEN** a second entry of type save appears below the first, opened, with its own rolls and Effects list

#### Scenario: First entry stays
- **WHEN** an ability has one entry
- **THEN** that entry has no remove button

### Requirement: The NPC form lists an ability's linked effects

In the NPC form, every action-list entry of the abilities in the five groups SHALL show an
**Effects** list next to its rolls, also for type other. Like the rolls table, the list SHALL
show each link on one line: its effect name, its outcome ("On a hit", "On a miss", "On a failed
save", "On a successful save", "Always"), and a short summary of its duration and fixed choices
(cut off when it doesn't fit, in full in a tooltip). Each link SHALL have an edit and a remove button,
and the list SHALL have an **Add effect** button. Without links the list SHALL show that the
ability has no effects.

#### Scenario: Ability with two links
- **WHEN** a bite has an On a hit Grappled link (escape DC 14) and an On a hit Restrained link
- **THEN** its Effects list shows both, each with "On a hit", and the grapple's escape DC in its summary

#### Scenario: Removing a link
- **WHEN** the user removes a link
- **THEN** it disappears from the list, and the NPC's unsaved changes indicator shows

### Requirement: The link dialog edits every link field

Adding or editing a link SHALL open a dialog with, in this order (When first, so the effect is
followed directly by its choices and level):
- **When** (required): only the outcomes that fit the entry's action type (see the next
  requirement)
- **Effect** (required): the SRD conditions, SRD effects and the user's custom effects, as in
  the custom effect form's effect picker; without an account only SRD definitions are offered
- **Choices**: one field per choice the selected definition asks for (the choices the Effects
  drawer asks when applying it), without a subtitle. Each field is clearable and empty by
  default; an empty field shows "Chosen when applied" as its placeholder and leaves the choice
  to be made when the effect is applied. A value choice SHALL be a number, a condition choice
  one of the SRD conditions
- **Level**: only when the selected definition has a level track; at least 1
- **Duration**: the same duration fields as the Effects drawer's application form, and no
  others (see the next requirement); without a duration the effect's duration is asked when
  it is applied
- **Magical**: a toggle, off by default

Cancel SHALL leave the NPC unchanged. Save SHALL be disabled while the effect or the outcome
is missing or a field is invalid.

#### Scenario: Fixing a damage type
- **WHEN** the user links the SRD Absorption effect to a clay golem trait and sets its damage type choice to acid
- **THEN** the saved link has `choices: { damage_type: "acid" }`

#### Scenario: Leaving a choice open
- **WHEN** the user links Damage Resistance and leaves its damage type empty (it shows "Chosen when applied"), or clears it
- **THEN** the saved link has no `choices`

#### Scenario: Changing the effect
- **WHEN** the user picks a different effect in the dialog
- **THEN** the Choices and Level fields follow the new definition, and fixed choices of kinds the new definition doesn't ask for are dropped

#### Scenario: Level only for leveled effects
- **WHEN** the selected effect is Exhaustion
- **THEN** the dialog shows Level; for Grappled it doesn't

### Requirement: A link's duration uses the drawer's duration fields

The link dialog and the Effects drawer's application form SHALL use the same duration fields,
with the same labels:
- the duration type: Until removed, Time, Concentration, Until next turn, Until the end of
  this turn
- a value and unit for Time (required, a positive integer) and Concentration (optional)
- start or end, and the caster's or the target's next turn, for Until next turn
- **End effect**: the select with a tab per selected option (Repeat save to end, Escape, Ends
  early when), as described for the Effects drawer

In the link dialog the duration is optional: the duration select is empty for a new link and
can be cleared, and while it's empty the dialog says "Without a duration, it's asked when the
effect is applied." and shows no End effect select. For a save sub-action, a new repeat save
starts with the sub-action's save ability and DC. An existing link opens with its stored
duration in these fields; a stored duration type outside the list above is kept and shown by
its label. Ends when, effects when it ends, ends by action and rest type SHALL NOT be offered:
what an effect does when it ends and what ends it belong to its definition.

#### Scenario: Grapple with an escape DC
- **WHEN** the user links Grappled with duration Until removed, selects Escape in End effect and sets DC 14
- **THEN** the saved link has `duration: { type: "cancelled", escape: { dc: 14, checks: [{ ability: "strength", skill: "athletics" }, { ability: "dexterity", skill: "acrobatics" }] } }`

#### Scenario: Poison with a repeat save
- **WHEN** a Constitution DC 11 save sub-action links Poisoned for 1 minute and the user selects Repeat save to end in End effect
- **THEN** the repeat save starts as Constitution DC 11 at the end of the target's turn, and the saved link has `duration.save: { ability: "constitution", dc: 11, triggers: ["end_turn_target"] }`

#### Scenario: Editing a stored link
- **WHEN** the user edits a link stored with a 1 minute duration, a repeat save and an escape
- **THEN** the dialog shows Time 1 minute and End effect with Repeat save to end and Escape selected, their tabs holding the stored values, and saving without changes keeps the same duration

#### Scenario: Clearing the duration
- **WHEN** the user clears the duration select of a link that had a duration
- **THEN** the End effect select disappears, the dialog says "Without a duration, it's asked when the effect is applied." and the saved link has no `duration`

#### Scenario: Invalid duration blocks saving
- **WHEN** the duration is Time without a value, or a repeat save has no DC
- **THEN** the dialog's Save button is disabled

### Requirement: Outcomes follow the action type

The When options SHALL depend on the entry's action type:
- melee weapon, ranged weapon and spell attack: On a hit, On a miss, Always
- save: On a failed save, On a successful save, Always
- damage, healing and other: Always

A link stored under an outcome that doesn't fit the current action type (the type was changed
after linking) SHALL be kept, listed with a warning that it doesn't fit the action type, and
editable so the user can pick a fitting outcome.

#### Scenario: Save action
- **WHEN** the user adds an effect to an action of type save
- **THEN** When offers On a failed save, On a successful save and Always

#### Scenario: Type changed after linking
- **WHEN** an attack with an On a hit link is changed to type save
- **THEN** the link stays in the list with a warning, and saving the NPC keeps it

### Requirement: The definition is read in the NPC's edition

The Choices and Level fields SHALL be based on the SRD definition of the NPC's edition (5e
when the NPC has none) or on the user's custom effect. When the definition can't be found (a
custom effect that was deleted, an SRD effect of the other edition only), the dialog SHALL
show the link's stored name and choices and still allow changing the outcome, duration,
magical and level.

#### Scenario: Deleted custom effect
- **WHEN** a link refers to a custom effect that no longer exists
- **THEN** the list shows the link by its stored name, and the dialog can still edit its other fields

### Requirement: Saved NPCs contain only set link fields

When the NPC is saved:
- a link SHALL contain only fields that are set: no empty `choices`, no undefined duration
  fields, no `magical: false`, and no duration fields the dialog doesn't offer (`ends_when`,
  `on_expire`, `ends_by_action`, `rest_type`)
- an outcome list without links SHALL be left out, and `effects` without any outcome list
  SHALL be left out
- the NPC SHALL validate against the NPC schema

#### Scenario: Last link removed
- **WHEN** the user removes the only link of an ability and saves
- **THEN** the saved action-list entry has no `effects`

### Requirement: Database rules accept valid action effects only

The database rules for user NPCs SHALL accept `effects` on the action-list entries of all
five ability groups, with the outcome lists `on_hit`, `on_miss`, `on_fail`, `on_success` and
`always`. Each link SHALL require `effect` with `source` (`srd`, `custom` or `api`) and
`source_key`, and SHALL accept `duration` (a duration type from the effects schema), `choices`
(strings of at most 100 characters), `level` (a number from 1 to 99) and `magical` (a boolean).
Any other key under `effects`, under an outcome list's link or under `effect` SHALL be rejected.
The constants check SHALL verify the duration types of these rules against the schema, like
the other `effects` blocks.

#### Scenario: Valid link written
- **WHEN** the form saves an NPC with an On a failed save Poisoned link with a 1 minute duration
- **THEN** the write is accepted

#### Scenario: Unknown key rejected
- **WHEN** a client writes a link with `save` or an outcome list named `on_crit`
- **THEN** the write is rejected

### Requirement: NPC import checks action effects

Importing NPCs SHALL validate action effects against the effects schema's link shape, with the
existing error list for invalid NPCs. An imported link to a custom effect that doesn't exist
in the importing account SHALL be kept and SHALL show by its stored name.

#### Scenario: Invalid link in an import
- **WHEN** an imported NPC has a link without `effect`
- **THEN** the NPC is listed as invalid with the schema error

### Requirement: Abilities with several entries can be rolled

Rolling an ability in the tracker, the compendium and the NPC form SHALL roll every entry of
its `action_list`: an attack entry rolls to hit and its rolls, a save entry shows its save
ability and DC and rolls its rolls. The roll result SHALL show each entry, as it already does
for spells with several actions. An entry without rolls, or of type other, SHALL add no damage
and SHALL NOT make the roll fail. An ability SHALL get a roll button when any of its entries is
not of type other and has rolls, not only the first.

Captions and stat blocks (the tracker's action list and card, the compendium) SHALL keep
showing the first entry only in this step.

#### Scenario: Bite with a poison save
- **WHEN** the DM rolls the bite with an attack entry and a Constitution save entry against a target
- **THEN** the result shows the to-hit and piercing damage of the first entry and the save DC and poison damage of the second

#### Scenario: Save entry with only an effect
- **WHEN** an ability's second entry is a save with an On a failed save Poisoned link and no rolls
- **THEN** rolling the ability shows the first entry's result and does not throw an error

#### Scenario: Rolls only in a later entry
- **WHEN** an ability's first entry is of type other and its second entry is an attack with rolls
- **THEN** the ability has a roll button

### Requirement: The roll result shows linked effects, without applying them

Rolling an action in the tracker SHALL NOT apply its linked effects. The roll result SHALL
list, under each rolled action, the effects linked to it on an outcome that fits its type, one
line each: the effect name, its outcome ("On a hit"…), and whether it applies with the result
chosen in the roll: **Applies** (Always, or the chosen hit, miss, failed or successful save
matches), **Doesn't apply** (dimmed), or "Hit or miss?" / "Fail or save?" while that result
isn't chosen. Applying them from the roll result is step 7. With several actions in one roll, the actions SHALL be
separated by space and a divider. The monster stat blocks SHALL NOT show linked effects in this
step.

#### Scenario: Rolling an action with a link
- **WHEN** the DM rolls a bite that has an On a hit Grappled link, and the attack hits
- **THEN** the roll and damage work as before, the result shows "Grappled · On a hit · Applies", and no effect is applied

#### Scenario: Save not chosen yet
- **WHEN** the DM rolls a poison save action with an On a failed save Poisoned link against a target and hasn't chosen Fail or Save
- **THEN** the result shows "Poisoned · On a failed save · Fail or save?", and choosing Save changes it to "Doesn't apply"

### Requirement: The documentation describes action links as built

The How effects work page already describes the finished effects feature, including later
steps. Its "Action effects" section SHALL match what this change builds: the fields of a link
with the dialog's labels (Effect, When, Duration, Choices, Level, Magical), that an ability
can have several actions (damage on a hit plus a save that poisons), that traits
(special abilities) with an action type can link effects too, and that Scaling applies to
spell links only, not to monster actions. Text about applying linked effects from rolls
(step 7) stays.

#### Scenario: Docs match the dialog
- **WHEN** a user reads "Action effects" on the How effects work page
- **THEN** every field it lists for a monster action link is in the link dialog with the same label
