## Purpose

How the DM's combat tracker records that a creature has used its reaction: a "Reaction Used"
effect that the tracker offers to apply when an entity acts outside its turn, that ends at the start
of the entity's next turn, and that is shown where the DM chooses who acts.

## ADDED Requirements

### Requirement: Reaction Used is an effect in both editions

The 5e and 5.5e effect lists SHALL each contain a definition with `url: "reaction-used"` and
`name: "Reaction Used"`, without a `category`. It is cancelable. Its description SHALL say
that the creature has used its reaction and regains it at the start of its next turn. It
SHALL have a single `special` sub-effect with that description and no trigger, so it changes
no values or rolls. It SHALL pass the SRD data validation, and it is listed in the effects
drawer like the other effects, so the DM can also apply it by hand.

#### Scenario: Both editions
- **WHEN** the 5e and 5.5e effect lists are read
- **THEN** each has `reaction-used` named "Reaction Used", and the SRD data validation passes

#### Scenario: No mechanics
- **WHEN** a creature with Reaction Used makes a save, or its AC is shown
- **THEN** nothing changes because of Reaction Used

### Requirement: Acting out of turn offers Reaction Used

When an entity acts while another entity has the turn, the tracker SHALL show a prompt
"<actor>: Reaction used?" saying that it acted outside its turn. The prompt has the buttons
**Apply** and **Dismiss** and stays until one is chosen. Acting is:
- rolling an action or spell for it, from the actor panel, its entity card or the legacy
  actions panel
- manual damage or healing done by it, from the actor panel or the legacy actions panel

**Apply** SHALL apply Reaction Used to the acting entity. The instance is:
- `source: "srd"`, `source_key: "reaction-used"`, `name: "Reaction Used"`
- with `caster_key` and `caster_name` of the acting entity itself
- with `applied_turn_key` of the entity whose turn it was when it acted
- with `duration: { type: "next_turn", anchor: "target", edge: "start" }`, so it ends at the
  start of the acting entity's next turn. Unlike other automatic ends (effects-durations),
  regaining the reaction SHALL NOT be announced with a notice.

Apply SHALL do nothing when the entity has Reaction Used by then, or has left the encounter.
**Dismiss** closes the prompt without applying anything. Nothing SHALL be applied without the
DM choosing Apply.

The prompt SHALL be shown once per action, however many targets the action has. While a
prompt for an entity is open, further out-of-turn actions of that entity SHALL NOT show
another one. No prompt SHALL be shown when:
- combat hasn't started (no entity has the turn)
- the acting entity has the turn
- the action is a legendary action
- the acting entity already has Reaction Used

Rolls that don't come from acting are never counted: damage and healing rolled from effect
prompts, undo, and the roll dialog applying a rolled action's damage.

#### Scenario: Opportunity attack
- **WHEN** it is `npc_1`'s turn in round 2, and the DM selects `npc_2` as the actor and rolls its Scimitar against `player_1`
- **THEN** a prompt "Goblin 2: Reaction used?" with Apply and Dismiss is shown, and `npc_2` doesn't have Reaction Used yet

#### Scenario: Apply
- **WHEN** the DM chooses Apply on that prompt
- **THEN** `npc_2` gets Reaction Used `{ source: "srd", source_key: "reaction-used", caster_key: "npc_2", applied_turn_key: "npc_1", applied_round: 2, duration: { type: "next_turn", anchor: "target", edge: "start" } }`

#### Scenario: Dismiss
- **WHEN** the DM chooses Dismiss on that prompt, because it wasn't a reaction
- **THEN** `npc_2` gets no Reaction Used

#### Scenario: One prompt at a time
- **WHEN** the DM rolls two more out-of-turn actions for `npc_2` while its prompt is open
- **THEN** no second prompt is shown for `npc_2`

#### Scenario: Ends at the start of its next turn
- **WHEN** Reaction Used was applied to `npc_2` and `npc_2`'s turn starts after that
- **THEN** Reaction Used is removed, without a notice

#### Scenario: Player reaction with manual damage
- **WHEN** during `npc_1`'s turn the DM selects `player_1` as the actor and enters 8 manual damage to `npc_1`
- **THEN** the Reaction used prompt is shown for `player_1`

#### Scenario: Shield out of turn
- **WHEN** during `npc_1`'s turn the DM casts a spell for `npc_2` from its card
- **THEN** the Reaction used prompt is shown for `npc_2`

#### Scenario: Its own turn
- **WHEN** `npc_1` rolls an action during its own turn
- **THEN** no prompt is shown

#### Scenario: Legendary action
- **WHEN** during `player_1`'s turn the DM rolls a legendary action for the dragon
- **THEN** no prompt is shown for the dragon

#### Scenario: Several targets
- **WHEN** an out-of-turn action is rolled against three targets
- **THEN** one prompt is shown, and Apply gives the actor one Reaction Used instance

#### Scenario: Already used
- **WHEN** an entity that already has Reaction Used acts out of turn again
- **THEN** no prompt is shown, and it keeps its single Reaction Used instance

#### Scenario: Before combat
- **WHEN** no entity has the turn and the DM rolls an action
- **THEN** no prompt is shown

#### Scenario: Damage from an effect prompt
- **WHEN** at the start of `npc_1`'s turn the DM rolls Burning's damage from the prompt, with another creature as the dealer
- **THEN** no prompt is shown

### Requirement: Reaction Used is shown where the actor is chosen

The actor panel SHALL show a "Reaction Used" tag in the actor's details bar, after its
name, when the actor has Reaction Used. It is shown the same way for every kind of entity.
The Select Actor list SHALL mark the entities that have Reaction Used.
The legacy actions panel's "Reaction used" warning SHALL show when the chosen entity has the
Reaction Used effect, as well as for the legacy reminder.

#### Scenario: Actor panel
- **WHEN** the DM selects `npc_2` as the actor and it has Reaction Used
- **THEN** a "Reaction Used" tag is shown in its details bar, after its name

#### Scenario: Select Actor list
- **WHEN** the DM opens the Select Actor list and `npc_2` has Reaction Used
- **THEN** `npc_2` is marked in the list, and entities without it aren't

#### Scenario: Legacy warning
- **WHEN** the DM picks `npc_2` in the legacy actions panel's done-by select and it has the Reaction Used effect
- **THEN** the "Reaction used" warning is shown
