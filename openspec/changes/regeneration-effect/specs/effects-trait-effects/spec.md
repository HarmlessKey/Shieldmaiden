## MODIFIED Requirements

### Requirement: The NPC form edits trait links

In the NPC form, every special ability SHALL show a **Trait effects** list, below its other
fields and outside its Actions list, styled like the action Effects list: one line per link
with the effect name and a summary of its fixed choices, level and magical, an edit and a
remove button, an **Add effect** button, and "No trait effects" when empty. Adding or editing
a link SHALL open a dialog with **Effect**, **Choices**, **Level** and **Magical** as in the
action link dialog, without When and Duration. Every choice of the selected definition SHALL be
required, except a choice the definition marks optional: a trait effect is always active, so
nothing can be chosen when it's applied. Saving the NPC SHALL store only set link fields, and
no `effects` when the list is empty.

#### Scenario: Linking Absorption
- **WHEN** the user adds Absorption to a clay golem's Acid Absorption trait and sets its damage type to acid
- **THEN** the trait's list shows "Absorption · Damage Type: Acid", and the saved ability has `effects: [{ effect: <Absorption>, choices: { damage_type: "acid" } }]`

#### Scenario: Open choice blocks saving the link
- **WHEN** the user picks Damage Resistance and leaves its damage type empty
- **THEN** the dialog's Save button is disabled and the damage type shows that it's required

#### Scenario: Optional choice left empty
- **WHEN** the user adds Regeneration to an oni's trait, sets the value to 10 and leaves the damage types empty
- **THEN** the link can be saved, and the saved ability has `effects: [{ effect: <Regeneration>, choices: { value: "10" } }]`
