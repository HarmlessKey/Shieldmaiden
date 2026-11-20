# demo-encounter Specification

## Purpose

The public demo lets visitors without an account try Shieldmaiden: choose an edition, then run a
premade encounter or build their own and run it in the combat tracker.

## Requirements

### Requirement: Start modal on the demo

Opening `/demo` SHALL show a start modal over the demo encounter builder, with:
- an edition select with 5e and 5.5e, set to 5.5e
- a **Run the premade encounter** choice
- a **Build your own encounter** choice

The modal SHALL not be shown again after a choice in the same visit (for example when returning
from the demo tracker to the builder); reloading the page SHALL show it again. The modal SHALL
only close on one of the two choices: Escape or clicking outside it SHALL not close it.

#### Scenario: Opening the demo
- **WHEN** a visitor opens `/demo`
- **THEN** the start modal is shown with 5.5e selected and both choices

#### Scenario: Dismissing without a choice
- **WHEN** a visitor presses Escape or clicks outside the start modal
- **THEN** the modal stays open

#### Scenario: Returning to the builder
- **WHEN** a visitor chose **Build your own encounter**, ran the encounter and goes back to the builder
- **THEN** the builder is shown without the start modal

### Requirement: Run the premade encounter

**Run the premade encounter** SHALL open the demo tracker (`/demo/run-encounter`) with the
premade encounter in the selected edition.

#### Scenario: Premade in 5e
- **WHEN** a visitor selects 5e and chooses **Run the premade encounter**
- **THEN** the demo tracker opens the premade encounter, and its effects and rules are those of 5e

### Requirement: Build your own encounter

**Build your own encounter** SHALL close the modal on the demo encounter builder with its monster
search on the selected edition. The encounter built there SHALL run in the demo tracker in the
selected edition.

#### Scenario: Building in 5e
- **WHEN** a visitor selects 5e and chooses **Build your own encounter**
- **THEN** the builder's monster search shows 5e monsters, and the built encounter runs with 5e effects and rules

### Requirement: Demo edition

The demo tracker SHALL run in the edition chosen in the start modal. Opening the demo tracker
without a choice in the visit (a direct link or a reload of `/demo/run-encounter`) SHALL run the
premade encounter on 5.5e. Resetting the demo SHALL keep the edition.

#### Scenario: Direct link
- **WHEN** a visitor opens `/demo/run-encounter` from the home page
- **THEN** the premade encounter runs on 5.5e, without the start modal

#### Scenario: Reset keeps the edition
- **WHEN** a visitor runs the premade encounter in 5e and resets the demo
- **THEN** it starts again in 5e

### Requirement: Premade starting effects per edition

The premade encounter SHALL start with these effects, all lasting from the start of combat:
- both editions: the Barbarian has Rage for 10 rounds
- 5.5e: the Warlock concentrates on Hex for up to 10 minutes; Orc (1) has Hex from the Warlock,
  ending with that Concentration
- 5e: the Warlock concentrates on Bane for up to 1 minute; Orc (1), Orc (2) and the Ogre each
  have Bane from the Warlock, ending with that Concentration

The premade's creatures SHALL be the same in both editions.

#### Scenario: 5.5e premade
- **WHEN** the premade encounter starts on 5.5e
- **THEN** the Barbarian has Rage, the Warlock has Concentration on Hex, and Orc (1) has Hex

#### Scenario: 5e premade
- **WHEN** the premade encounter starts on 5e
- **THEN** the Barbarian has Rage, the Warlock has Concentration on Bane, and both Orcs and the Ogre have Bane

#### Scenario: Ending the 5e Concentration
- **WHEN** the Warlock's Concentration on Bane ends in the 5e premade
- **THEN** Bane ends on both Orcs and the Ogre
