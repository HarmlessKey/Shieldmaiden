## Purpose

Which trigger events the combat tracker fires and when, how the active effects that listen
for a trigger are found, and how the DM is prompted about them, so effects can react to
turns, damage, rolls, checks and being applied.

## ADDED Requirements

### Requirement: Matching effects are found per trigger

When a trigger fires for an entity, the tracker SHALL collect every active effect instance
whose resolved definition has at least one sub-effect with that `trigger`. The legacy
spellings `failed_save`, `success_save` and `zero_hp` SHALL count as `on_save_fail`,
`on_save_success` and `on_zero_hp`. For holder-scoped triggers, only the instances on that
entity SHALL be collected. For `start_turn_caster` and `end_turn_caster`, the instances on
any entity whose `caster_key` is that entity SHALL be collected. For `combat_start`, the
instances on every entity SHALL be collected. Instances with an unresolved definition SHALL
be ignored.

#### Scenario: Holder-scoped trigger
- **WHEN** `start_turn_target` fires for `npc_1`, which has a custom Burning effect with a `start_turn_target` damage sub-effect, and `npc_2` has the same effect
- **THEN** only `npc_1`'s Burning instance is collected

#### Scenario: Caster-scoped trigger
- **WHEN** `end_turn_caster` fires for `player_1`, and `npc_1` and `npc_2` each have an instance with `caster_key: "player_1"` whose definition has an `end_turn_caster` sub-effect
- **THEN** both instances are collected

#### Scenario: Legacy spelling
- **WHEN** `on_save_fail` fires for an entity whose custom effect has a sub-effect with `trigger: "failed_save"`
- **THEN** that instance is collected

#### Scenario: No listeners
- **WHEN** `start_turn_target` fires for an entity that only has Prone
- **THEN** nothing is collected and no prompt is shown

### Requirement: Caster-anchored triggers fall back to the holder when the caster is absent

When an instance's `caster_key` doesn't match an entity in the running encounter, its
`start_turn_caster` and `end_turn_caster` sub-effects SHALL fire at the start and end of
its holder's own turn, together with that holder's `start_turn_target` / `end_turn_target`.
An instance whose caster is present SHALL NOT fire caster-scoped sub-effects on the
holder's turn.

#### Scenario: Carried-over effect
- **WHEN** a player's effect has `caster_key` of an NPC from an earlier encounter and an `end_turn_caster` sub-effect, and the player's turn ends
- **THEN** that sub-effect is collected for the player's end of turn

#### Scenario: Caster present
- **WHEN** the caster of an `end_turn_caster` effect is in the encounter and the holder's turn ends
- **THEN** that sub-effect is not collected for the holder's end of turn

### Requirement: Trigger filters are applied when the event allows

A sub-effect's `trigger_filter` SHALL be applied using what the event knows. `by` checks
who caused the event (`caster`: the instance's caster; `counterpart`: the other party of
the event; `any`: always). `damage_types` checks the damage types of the event,
`natural_roll` the natural d20 roll, and `min_amount` the damage or healing amount. A
filter field the event has no information for SHALL NOT exclude the sub-effect. Its
condition SHALL be named in the prompt so the DM can judge it.

#### Scenario: Hex fires only for the caster's hits
- **WHEN** `on_hit_taken` fires for `npc_1`, hit by `player_2`, and `npc_1`'s Hex instance (`caster_key: "player_1"`) has a sub-effect with `trigger: "on_hit_taken"` and `trigger_filter: { by: "caster" }`
- **THEN** that sub-effect is not collected

#### Scenario: Damage type filter
- **WHEN** `damage_taken` fires with only fire damage for an entity whose effect listens with `trigger_filter: { damage_types: ["cold"] }`
- **THEN** that sub-effect is not collected

#### Scenario: Unknown filter information
- **WHEN** a sub-effect's filter has `within: 5` and the event has no distance
- **THEN** the sub-effect is collected and the prompt mentions "within 5 ft"

### Requirement: Turn triggers fire when combat moves forward

When the encounter's turn advances (the next turn, including into a new round), the tracker
SHALL fire, in this order: `end_turn_caster` and then `end_turn_target` for the entity whose
turn ended, then `start_turn_caster` and then `start_turn_target` for the entity whose turn
starts. When the encounter starts (from round 0 to round 1), it SHALL fire `combat_start`
for all entities and then `start_turn_caster` and `start_turn_target` for the first entity,
with no end-of-turn triggers. Going back a turn SHALL NOT fire any trigger. The turn order
SHALL be the tracker's initiative order.

#### Scenario: Next turn
- **WHEN** the DM moves from `player_1`'s turn to `npc_1`'s turn
- **THEN** `end_turn_caster` and `end_turn_target` fire for `player_1`, then `start_turn_caster` and `start_turn_target` for `npc_1`

#### Scenario: Start encounter
- **WHEN** the DM starts the encounter
- **THEN** `combat_start` fires for all entities and the start-of-turn triggers fire for the first entity in initiative order

#### Scenario: Previous turn
- **WHEN** the DM goes back to the previous turn
- **THEN** no trigger fires

### Requirement: HP changes fire their triggers

When damage is applied to an entity, the tracker SHALL fire `damage_taken` for the target and
`damage_dealt` for the entity that dealt it, with the amount and damage types. It SHALL also
fire `on_zero_hp` for the target when its HP goes from above 0 to 0, and `on_bloodied` when
its HP goes from above half its maximum to half or lower. When healing is applied, it SHALL
fire `on_heal` for the target with the amount. No trigger SHALL fire for an amount of 0 or
for undoing a roll.

#### Scenario: Damage to half
- **WHEN** an NPC with 20/20 HP takes 12 damage from `player_1`
- **THEN** `damage_taken` fires for the NPC, `damage_dealt` for `player_1`, and `on_bloodied` for the NPC; `on_zero_hp` does not fire

#### Scenario: Drop to zero
- **WHEN** a player with 5 HP takes 9 damage
- **THEN** `damage_taken` and `on_zero_hp` fire for the player

#### Scenario: Already bloodied
- **WHEN** an NPC at 8/20 HP takes 3 more damage
- **THEN** `on_bloodied` does not fire again

### Requirement: Roll outcomes fire their triggers

When the DM applies an action roll from the roll dialog, the tracker SHALL fire, for each
action of the roll:
- `on_hit` for the attacker and `on_hit_taken` for the target when it hit
- additionally `on_crit` and `on_crit_taken` when the hit was a natural 20
- `on_save_success` or `on_save_fail` for the target of a save action, according to its
  save result

Actions without a hit or save result SHALL fire none of these.

#### Scenario: Critical hit
- **WHEN** the DM applies a melee attack that rolled a natural 20 against `npc_1`
- **THEN** `on_hit` and `on_crit` fire for the attacker and `on_hit_taken` and `on_crit_taken` for `npc_1`

#### Scenario: Failed save
- **WHEN** the DM applies a save action where the target failed its save
- **THEN** `on_save_fail` fires for the target

#### Scenario: Miss
- **WHEN** the DM applies an attack marked as a miss
- **THEN** none of the hit, crit or save triggers fire

### Requirement: Ability checks fire their trigger

Rolling an ability check or a skill check from an entity's card, or an ability check for a
targeted entity from the targeted panel, SHALL fire `on_check` for that entity. Saving
throws rolled from the card or the targeted panel SHALL NOT fire `on_check`. The tracker has
no rest action, so `short_rest` and `long_rest` SHALL NOT be fired in this capability;
effects that listen for them are not prompted until a rest feature exists.

#### Scenario: Skill check
- **WHEN** the DM rolls Perception from an NPC's card
- **THEN** `on_check` fires for that NPC

#### Scenario: Check from the targeted panel
- **WHEN** two entities are targeted and the DM rolls a Strength check for one of them from the targeted panel
- **THEN** `on_check` fires for that entity only

#### Scenario: Saving throw from the card
- **WHEN** the DM rolls a Wisdom save from an NPC's card
- **THEN** `on_check` does not fire

### Requirement: Applying an effect fires its apply triggers

When an effect instance is created on an entity (not when the same condition is re-applied
as a no-op, and not on an Exhaustion level change), the tracker SHALL fire `on_apply` for
that instance only. When the created instance is an SRD condition, it SHALL also fire
`on_condition_applied` for the holder across all its effects.

#### Scenario: Unconscious prompts Prone
- **WHEN** the DM applies Unconscious to an NPC
- **THEN** a prompt for Unconscious's `on_apply` sub-effect (apply Prone) is shown

#### Scenario: Re-applied condition
- **WHEN** the DM applies Prone to an NPC that is already Prone
- **THEN** no apply trigger fires

### Requirement: The DM is prompted for matching effects

For every collected instance, the tracker SHALL show one prompt per trigger firing. The
prompt SHALL name the holder, the effect and the trigger in words (e.g. "Goblin: Burning, at
the start of its turn"), and list the matching sub-effects' descriptions, including any
filter condition that couldn't be checked. It SHALL offer Details, which opens the effect's
detail view, and Dismiss. Prompts SHALL stay until dismissed. Firing triggers SHALL NOT
change any entity, effect or database value.

#### Scenario: Prompt content
- **WHEN** `start_turn_target` fires for a Goblin with a custom Burning effect whose sub-effect is described "Take 1d6 fire damage"
- **THEN** a prompt "Goblin: Burning, at the start of its turn" listing "Take 1d6 fire damage" is shown until dismissed

#### Scenario: Details
- **WHEN** the DM chooses Details on that prompt
- **THEN** the detail view of that Burning instance opens

#### Scenario: Nothing changes
- **WHEN** any trigger fires and prompts are shown
- **THEN** no HP, effect instance or database value is changed by the trigger itself
