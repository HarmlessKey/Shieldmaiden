## ADDED Requirements

### Requirement: How the effect ends is configured in one End effect select

The application form SHALL have an **End effect** select (multiple) instead of separate
toggles, with these options, each with a short description:
- **Repeat save to end**: the repeat save of "Application captures an optional repeat save"
- **Escape**: the escape of "Application captures an optional escape"
- **Ends early when**: events of the holder that end the effect early

Every selected option SHALL get a tab, and the tab SHALL show that option's fields. Selecting
an option SHALL open its tab. Removing an option from the select SHALL remove its tab and leave
its values out of the application. The form SHALL show no add (+) buttons for these options.
The same End effect select SHALL be part of the duration fields the link dialog of NPC actions
uses, with the same labels.

**Ends early when** SHALL offer only events the tracker fires for the holder: it takes damage
(`damage_taken`), it deals damage (`damage_dealt`), it hits with an attack (`on_hit`), it
regains hit points (`on_heal`) and it becomes Bloodied (`on_bloodied`). At least one event is
required while the option is selected. The events SHALL be stored as
`duration.cancel_triggers` (`[{ trigger }]`); without the option the instance SHALL have no
`cancel_triggers`.

#### Scenario: Sleep until it takes damage
- **WHEN** the DM applies Unconscious with duration 1 minute, selects Ends early when in End effect and picks Takes damage in its tab
- **THEN** the instance has `duration: { type: "time", value: 1, unit: "minute", cancel_triggers: [{ trigger: "damage_taken" }] }`, and the effect ends when the holder takes damage

#### Scenario: Two ways to end it
- **WHEN** the DM selects Repeat save to end and Escape in End effect
- **THEN** the form shows a Repeat save tab and an Escape tab, each with its own fields, and the Escape tab is open

#### Scenario: Option removed
- **WHEN** the DM fills in an escape and then removes Escape from End effect
- **THEN** the Escape tab is gone and the instance has no `duration.escape`

#### Scenario: Ends early without an event
- **WHEN** Ends early when is selected but no event is picked
- **THEN** the form can't be applied until an event is picked or the option is removed
