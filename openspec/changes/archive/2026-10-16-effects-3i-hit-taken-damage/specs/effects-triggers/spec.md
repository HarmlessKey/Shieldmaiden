## MODIFIED Requirements

### Requirement: The DM is prompted for matching effects

For every collected instance, the tracker SHALL show one prompt per trigger firing. The
prompt SHALL name the holder, the effect and the trigger in words (e.g. "Goblin: Burning, at
the start of its turn"), and list the matching sub-effects' descriptions, including any
filter condition that couldn't be checked. It SHALL offer Details, which opens the effect's
detail view, and Dismiss. Prompts SHALL stay until dismissed. Firing triggers SHALL NOT
change any entity, effect or database value.

When `on_hit_taken` fires for an applied attack roll, the prompt SHALL leave out the `damage`
sub-effects that were rolled with that attack (see "Damage bonuses are added to hits"). An
instance with nothing left to list gets no prompt.

Manual damage (the Attack button) doesn't say whether it was a hit, so it SHALL NOT fire
`on_hit_taken`. Instead, after manual damage is applied, each target that holds damage that
would have been rolled with an attack by this actor (the same sub-effects, with `by: "caster"`
matching the actor, or caused by anyone) SHALL get a prompt for it: named like an
`on_hit_taken` prompt, listing each sub-effect with "if it was a hit with an attack roll" and
any filter that can't be checked, with Roll. Nothing else fires and no duration changes.

#### Scenario: Prompt content
- **WHEN** `start_turn_target` fires for a Goblin with a custom Burning effect whose sub-effect is described "Take 1d6 fire damage"
- **THEN** a prompt "Goblin: Burning, at the start of its turn" listing "Take 1d6 fire damage" is shown until dismissed

#### Scenario: Details
- **WHEN** the DM chooses Details on that prompt
- **THEN** the detail view of that Burning instance opens

#### Scenario: Nothing changes
- **WHEN** any trigger fires and prompts are shown
- **THEN** no HP, effect instance or database value is changed by the trigger itself

#### Scenario: Hex rolled with the attack
- **WHEN** the warlock's hit on the hexed goblin, with Hex's 1d6 necrotic in it, is applied
- **THEN** no prompt for Hex is shown

#### Scenario: Manual damage by the caster
- **WHEN** the warlock concentrating on Hex applies 7 manual damage to the hexed goblin with Attack
- **THEN** a prompt "Goblin: Hex, when it is hit" lists the 1d6 necrotic "if it was a hit with an attack roll", with Roll

#### Scenario: Damage the attack couldn't check
- **WHEN** a hit is applied on a creature with a custom effect dealing 1d6 to itself on hits with a natural 20 (`natural_roll: [20]`), and the roll was a natural 20
- **THEN** its prompt is shown with a Roll button, as before
