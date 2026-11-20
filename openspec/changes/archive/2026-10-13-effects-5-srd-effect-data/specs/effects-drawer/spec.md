## MODIFIED Requirements

### Requirement: Effects are listed by source and campaign edition

Without a mode, the drawer SHALL list available effects in two groups, in this order: SRD
effects, custom effects. SRD conditions SHALL NOT be listed there; they are listed only in
conditions mode. The SRD groups SHALL come from the local SRD data of the encounter's
campaign edition (`"5e"` or `"5.5e"`): the SRD effects without `edition` and those with the
campaign edition. The entity's own edition SHALL NOT affect which SRD definitions are
listed. Custom effects SHALL be the signed-in user's custom effects and SHALL be listed for
every edition. When no user is signed in (demo) or the user has no custom effects, the
custom group SHALL be omitted. Entries within a group SHALL be sorted by name. Conditions
SHALL show their condition icon.

#### Scenario: 5e campaign lists 2014 definitions
- **WHEN** the drawer is opened without a mode in an encounter of a campaign with edition `"5e"`
- **THEN** the SRD effects group lists the effects with `edition: "5e"` (Concentration with the 2014 description) and the effects without `edition` (Armor Class Bonus), and no conditions group is shown

#### Scenario: 5.5e campaign lists 2024 definitions
- **WHEN** the drawer is opened in an encounter of a campaign with edition `"5.5e"`
- **THEN** the SRD groups list the 5.5e definitions, e.g. Concentration with the 2024 description, and in conditions mode Exhaustion with the 2024 description

#### Scenario: Other edition's effects are hidden
- **WHEN** the drawer is opened in a `"5e"` campaign
- **THEN** Burning (`edition: "5.5e"`) is not listed, and no `url` is listed twice

#### Scenario: Campaign without edition
- **WHEN** the campaign has no edition set
- **THEN** the drawer lists the 5e definitions

#### Scenario: Demo encounter uses 5.5e
- **WHEN** the drawer is opened in the demo encounter
- **THEN** the SRD groups list the 5.5e definitions and no custom group is shown

#### Scenario: Custom effects are edition-agnostic
- **WHEN** a signed-in user with custom effects opens the drawer in a `"5e"` and in a `"5.5e"` campaign
- **THEN** both show the same custom effects group

### Requirement: Application asks for the definition's choices

When an effect's definition has sub-effects whose value comes from a caster choice
(ability, damage type, skill, condition, creature type, a free option, or a number value) or a
roll whose damage type is chosen from a list, the application SHALL ask for each distinct
choice kind and SHALL NOT allow applying until every choice has a value. A sub-effect whose
`choice` lists several kinds SHALL add each of them. A kind used by several sub-effects SHALL
be asked once and shared by them. Ability, damage type, skill, condition and creature type
choices SHALL be picked from the corresponding fixed lists; a damage type choice limited by a
roll's or a sub-effect's list SHALL only offer those types; an option choice SHALL be free
text; a value choice SHALL be a number input that accepts negative numbers. The values SHALL
be stored in the instance's `choices` keyed by choice kind, as strings (a value choice of 2 is
stored as `"2"`). Effects without choices SHALL NOT show choice inputs and SHALL NOT carry
`choices`.

#### Scenario: Hex asks for an ability
- **WHEN** the DM applies an effect whose sub-effect has `choice: "ability"` and picks Wisdom
- **THEN** the instance has `choices: { ability: "wisdom" }`

#### Scenario: Missing choice blocks apply
- **WHEN** an effect requires a damage type choice and none is picked
- **THEN** the effect cannot be applied

#### Scenario: Conditions have no choices
- **WHEN** the DM applies Blinded
- **THEN** no choice inputs are shown and the instance has no `choices`

#### Scenario: A value is asked as a number
- **WHEN** the DM applies a custom "Armor Class Bonus" whose sub-effect has `choice: "value"` and enters 2
- **THEN** the instance has `choices: { value: "2" }`, and the effect can't be applied while the value is empty or not a number

#### Scenario: Two kinds on one sub-effect
- **WHEN** the DM applies Skill Bonus (`choice: ["skill", "value"]`), picks Stealth and enters 5
- **THEN** the application showed a skill input and a number input, and the instance has `choices: { skill: "stealth", value: "5" }`

#### Scenario: Shift+click asks for both kinds
- **WHEN** the DM shift+clicks the apply button of Damage Reduction
- **THEN** the application form opens instead of applying directly, because the effect needs a damage type and a value
