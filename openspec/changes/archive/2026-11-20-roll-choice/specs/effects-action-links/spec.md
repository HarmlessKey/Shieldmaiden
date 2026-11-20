## MODIFIED Requirements

### Requirement: An effect link stores the effect and how it is applied

The effects schema SHALL define an effect link with these fields, and no others:
- `effect` (required): a reference `{ source, source_key, name }` to an SRD condition, an SRD
  effect or a custom effect
- `duration`: a duration as applied in the tracker (type, value and unit, anchor and edge,
  repeat save, escape, cancel triggers, ends when, effects when it ends)
- `choices`: fixed choices by kind (`ability`, `damage_type`, `skill`, `condition`,
  `creature_type`, `option`, `value`, `roll`); a value choice is a number written as a string,
  a roll choice `{ dice_count, dice_type, fixed_val }` like a reminder's damage, every other
  choice a string
- `level`: the levels it applies, an integer of at least 1, for an effect with a level track
- `magical`: a boolean
- `scaling`: tiers that change the value choice and level with the slot or caster level, for
  links on spells only (see effects-spell-links)
- `duration_scaling`: tiers that change the duration with the slot level, for links on spells
  only, and only together with `duration` (see effects-spell-links)

A link SHALL NOT carry a save of its own or a concentration id. Links on NPC actions and traits
SHALL NOT carry `scaling` or `duration_scaling`.

#### Scenario: A grapple link
- **WHEN** a link is `{ effect: { source: "srd", source_key: "grappled", name: "Grappled" }, duration: { type: "cancelled", escape: { dc: 14 } } }`
- **THEN** it validates against the effect link schema

#### Scenario: A link with a fixed roll
- **WHEN** a young gold dragon's Weakening Breath links Weakening Breath with `choices: { roll: { dice_count: 1, dice_type: 6 } }`
- **THEN** it validates against the effect link schema, and the same link with `choices: { roll: "1d6" }` or `choices: { roll: { dice_count: 1 } }` does not

#### Scenario: A link with a save is rejected
- **WHEN** a link has `save: { ability: "constitution", dc: 13 }`
- **THEN** it does not validate against the effect link schema

#### Scenario: A scaled link
- **WHEN** a link has `scaling: [{ level: 3, value: 2 }]`
- **THEN** it validates against the effect link schema, and an NPC action carrying it does not validate against the NPC schema

#### Scenario: A link with duration scaling
- **WHEN** a link has `duration: { type: "time", value: 1, unit: "hour" }` and `duration_scaling: [{ level: 3, duration: { type: "time", value: 8, unit: "hour" } }]`
- **THEN** it validates against the effect link schema, the same tiers without `duration` don't, and an NPC action carrying them does not validate against the NPC schema

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
  to be made when the effect is applied. A value choice SHALL be a number, a roll choice
  Dice, Die and Fixed value (dice need both a count and a die), a condition choice one of the
  SRD conditions
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

#### Scenario: Fixing a roll
- **WHEN** the user links Weakening Breath to an adult gold dragon's breath and enters Dice 1 and Die d10 as its roll
- **THEN** the saved link has `choices: { roll: { dice_count: 1, dice_type: 10 } }`, and applying it from the dragon's roll doesn't ask for the roll; with Dice set and no Die, Save stays disabled

#### Scenario: Leaving a choice open
- **WHEN** the user links Damage Resistance and leaves its damage type empty (it shows "Chosen when applied"), or clears it
- **THEN** the saved link has no `choices`

#### Scenario: Changing the effect
- **WHEN** the user picks a different effect in the dialog
- **THEN** the Choices and Level fields follow the new definition, and fixed choices of kinds the new definition doesn't ask for are dropped

#### Scenario: Level only for leveled effects
- **WHEN** the selected effect is Exhaustion
- **THEN** the dialog shows Level; for Grappled it doesn't
