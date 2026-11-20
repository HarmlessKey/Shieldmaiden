## ADDED Requirements

### Requirement: The form builds Duplicates sub-effects

The effects form SHALL offer **Duplicates** as a sub-effect type. For it, the form SHALL show:
- **Duplicates**: the starting count (at least 1)
- **Check**: **Before the attack roll** (`targeted`) or **On a hit** (`hit`), and the die
- **Minimum roll**: one number, or a minimum per number of duplicates left
- **Duplicate AC**: an optional formula
- **Condition**, as for other sub-effects, with the other party as a subject

It SHALL NOT show Applies to, Value, Roll, Multiplier or Trigger for it, and switching to
Duplicates SHALL clear those fields. The type SHALL be documented in the effects docs with
both editions of Mirror Image as examples.

#### Scenario: Build 2014 Mirror Image
- **WHEN** an author adds a Duplicates sub-effect with 3 duplicates, Before the attack roll, d20, minimums 6/8/11 for 3/2/1 duplicates, Duplicate AC `10 + dex_mod`, and a condition that the other party isn't Blinded and has no Blindsight or Truesight
- **THEN** the saved definition validates and matches the 2014 Mirror Image example in the docs

#### Scenario: Fields of other types are cleared
- **WHEN** an author changes a Bonus sub-effect with a value to Duplicates
- **THEN** the sub-effect no longer has `sub_types` or `value`
