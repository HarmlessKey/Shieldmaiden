## ADDED Requirements

### Requirement: A chosen damage type filters a damage trigger

When a sub-effect with a `damage_taken` or `damage_dealt` trigger asks for a `damage_type`
choice, the chosen types SHALL be its trigger filter's damage types: it SHALL fire only for
damage of one of those types.

#### Scenario: Fire stops the troll limb
- **WHEN** a troll limb with Regeneration (damage types acid and fire) takes fire damage
- **THEN** a prompt for Regeneration's damage-taken sub-effect is shown

#### Scenario: Slashing doesn't
- **WHEN** the same limb takes slashing damage
- **THEN** no prompt for Regeneration is shown

### Requirement: Prompts apply triggered effects with Apply

A prompt that lists an `apply_effect` sub-effect SHALL offer **Apply** for it, as damage and
healing sub-effects offer Roll. Apply SHALL apply the sub-effect's effect to the sub-effect's
recipient (`target`, the holder by default) with the sub-effect's duration, the instance's
caster as its caster, and the applying turn recorded as for any applied effect. It SHALL be
shown once per sub-effect, and SHALL be gone after it was used. Nothing SHALL be applied
without the DM choosing Apply.

#### Scenario: Suppressing Regeneration
- **WHEN** the DM chooses Apply on the prompt "Troll Limb: Regeneration, when it takes damage"
- **THEN** the limb gets Regeneration Suppressed until the end of its next turn

#### Scenario: Damage on its own turn
- **WHEN** the limb takes fire damage during its own turn and the DM chooses Apply
- **THEN** Regeneration Suppressed lasts until the end of the limb's following turn, by the same-turn rule of next-turn durations

### Requirement: A prompt says when a sub-effect doesn't function

When a sub-effect in a prompt has a condition the tracker can check and that doesn't hold, the
prompt SHALL still list it, with "doesn't function" and the condition's description (for
Regeneration: "has 0 Hit Points" or "Regeneration Suppressed"), and SHALL NOT offer Roll or
Apply for it.

#### Scenario: Suppressed at the start of its turn
- **WHEN** the troll limb's turn starts while it has Regeneration Suppressed
- **THEN** the prompt "Troll Limb: Regeneration, at the start of its turn" says it doesn't function because of Regeneration Suppressed, and has no Roll

#### Scenario: At 0 Hit Points
- **WHEN** an oni with Regeneration starts its turn with 0 Hit Points
- **THEN** the prompt says Regeneration doesn't function because it has 0 Hit Points, and has no Roll

#### Scenario: Healing at the start of its turn
- **WHEN** an oni with Regeneration (value 10) and 30 Hit Points starts its turn
- **THEN** the prompt offers Roll, which opens the roll dialog with 10 healing for the oni
