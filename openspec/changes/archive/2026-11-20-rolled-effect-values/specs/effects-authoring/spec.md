## ADDED Requirements

### Requirement: Admins can create an effect from pasted JSON

While custom effects are held back, an admin (a user whose user info has `admin`) SHALL have
a **Paste JSON** button in the header of Effects under My content. It SHALL open a dialog with
a text area for an effect definition as JSON and a **Create** button. Create SHALL:
- show "Not valid JSON" when the text can't be parsed, and save nothing
- clean the definition the way the form does before saving (only set fields)
- validate it against the effects schema, and on failure show the readable errors (as the
  form does) and save nothing
- save it as a new custom effect of the admin (slot limits apply), close the dialog and show
  it in the list

#### Scenario: Valid effect
- **WHEN** an admin pastes `{ "name": "Strength Drain", "sub_effects": [{ "type": "bonus", "sub_types": ["ability_score"], "abilities": ["strength"], "roll": { "dice_count": 1, "dice_type": 4 }, "multiplier": -1 }] }` and chooses Create
- **THEN** the effect is saved and listed under Effects

#### Scenario: Invalid JSON
- **WHEN** an admin pastes `{ name: "x" ` and chooses Create
- **THEN** the dialog shows "Not valid JSON" and nothing is saved

#### Scenario: Schema failure
- **WHEN** an admin pastes an effect with a sub-effect of type "boost"
- **THEN** the dialog lists the schema error for Sub-effect 1 › Type and nothing is saved

#### Scenario: Not for other users
- **WHEN** a user who isn't an admin opens Effects under My content
- **THEN** there is no Paste JSON button

## MODIFIED Requirements

### Requirement: Custom effects are held back until their release

Custom effects SHALL ship disabled behind one flag, `custom_effects_released` in
`src/utils/generalConstants.js` (decided after the effects feature was built: releasing them
with it was too much at once). While it is `false`, for users who aren't admins:
- Effects under My content SHALL keep its route and its sidebar link, and SHALL show a
  "Custom effects are coming soon" notice instead of the search, the list and the create
  buttons; its header SHALL have no New effect button. The user's custom effects SHALL NOT be
  loaded there.
- The form routes (`/content/effects/add-effect` and `/content/effects/<id>`) SHALL redirect
  to Effects under My content.
- The Effects drawers (tracker and run campaign screen) and the bonus drawers' effect lists
  SHALL NOT load the user's custom effects. For a signed-in user they SHALL show a Custom tab
  that says only "Coming soon", next to the other groups; it SHALL NOT be shown when a search
  leaves no other group, in conditions mode, or in the demo.
- The personal reminders' deprecation notice SHALL NOT point to Effects under My content.

Admins (user info `admin`) SHALL get custom effects for testing while the flag is `false`:
Effects under My content SHALL load and list their custom effects with search and delete, and
the Effects drawers and the bonus drawers SHALL load them in the Custom tab as if released.
Their names SHALL NOT link to the form, the form routes SHALL still redirect, and the header
SHALL have the Paste JSON button (Admins can create an effect from pasted JSON) instead of New
effect.

Setting the flag to `true` SHALL restore everything above for everyone. Releasing custom
effects (step 14 of `.planning/effects-implementation-plan.md`) removes the flag and this
gating.

#### Scenario: My content Effects before the release
- **WHEN** a user who isn't an admin opens Effects under My content
- **THEN** it shows the coming-soon notice, no list and no New effect button

#### Scenario: The form route before the release
- **WHEN** a user opens `/content/effects/add-effect`
- **THEN** they are sent to Effects under My content

#### Scenario: Custom tab before the release
- **WHEN** a signed-in DM who isn't an admin opens the Effects drawer in the tracker
- **THEN** it has an Effects tab with the SRD effects and a Custom tab that says "Coming soon"

#### Scenario: Search without results
- **WHEN** the DM searches for "zzz" in the Effects drawer
- **THEN** it says no effects match, without a Custom tab

#### Scenario: Admin before the release
- **WHEN** an admin opens Effects under My content
- **THEN** it lists their custom effects with delete and a Paste JSON button, without links to the form

#### Scenario: Admin applies a custom effect
- **WHEN** an admin opens the Effects drawer in the tracker
- **THEN** the Custom tab lists their custom effects, and they can be applied

### Requirement: Sub-effects show the fields of their type

Every sub-effect SHALL have a type, chosen from all schema sub-effect types, each with a
label and a description. The sub-type list SHALL offer only the sub-types allowed for that
type, and SHALL allow several. The other fields SHALL be shown only when the type uses them
and they matter for the chosen sub-types: roll fields and roll filters only for rolls, a
multiplier only for values it makes sense for, abilities, skills and attack types only for
the rolls or scores they narrow down. The roll SHALL also be shown for numeric types on
values, where it is rolled once when the effect is applied (effects-stat-modifiers). When it
has a roll, the multiplier SHALL be shown too, so the roll can be made a penalty. Changing the
type or the sub-types SHALL remove the values of fields that are no longer shown.

#### Scenario: Sub-types follow the type
- **WHEN** the user picks type "Defense"
- **THEN** the sub-type list offers Vulnerable, Resistant and Immune, and not Armor Class

#### Scenario: Fields follow the type
- **WHEN** the user picks type "Bonus" with sub-type "Saving throw"
- **THEN** the form shows value, roll, abilities and perspective, offers choice as an optional part, and doesn't show reroll or transfer fields

#### Scenario: Fields follow what it applies to
- **WHEN** the user picks type "Bonus" with Applies to "Armor Class"
- **THEN** the form shows the value and the roll (no multiplier, filters or perspective), and adding "Saving throws" to Applies to shows the multiplier, perspective, abilities, context and creature types

#### Scenario: Rolled penalty on an ability score
- **WHEN** the user picks type "Bonus" with Applies to "Ability score" and fills in a roll of 1d4
- **THEN** the form shows abilities, the roll and the multiplier, and setting the multiplier to −1 saves `{ type: "bonus", sub_types: ["ability_score"], abilities: [...], roll: { dice_count: 1, dice_type: 4 }, multiplier: -1 }`

#### Scenario: Changing type clears unused fields
- **WHEN** a "Damage modifier" sub-effect with `fraction: 0.5` and `to: "caster"` is changed to type "Bonus"
- **THEN** `fraction` and `to` are removed from the sub-effect
