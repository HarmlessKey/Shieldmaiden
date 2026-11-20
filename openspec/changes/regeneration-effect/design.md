# Design

## Context

What exists:
- `healing` sub-effects on `start_turn_target` give a prompt with **Roll**, which opens the roll
  dialog for the DM to apply (effects-damage-healing, as damage over time does).
- `damage_taken` fires with the damage types; `trigger_filter.damage_types` narrows it
  (effects-triggers). Triggers never change anything by themselves: they only prompt.
- `apply_effect` sub-effects exist in the schema, but the tracker does nothing with a triggered
  one yet.
- Sub-effect conditions `hp_zero` and `has_effect` can be checked by the engine.
- A choice kind fills a field of the sub-effect (`fixChoices`: `damage_type` →
  `damage_types: [type]`). Every choice is a single string, in the schema, the database rules
  and the instances.
- Trait effects are derived from the NPC each time the encounter loads and are **not stored**
  (effects-trait-effects), so they can't hold state like "suppressed until".

## Goals / Non-Goals

**Goals:**
- One Regeneration effect that covers the oni, the troll limb and the vampire texts (with
  their out-of-scope parts left in the description), as a trait link or applied from the drawer.
- Reuse the existing durations, conditions and prompts instead of new state.

**Non-Goals:** see the proposal's out of scope (rolled amounts, sources like holy water,
environments, regenerating at 0 Hit Points).

## Decisions

### D1. Suppression is a short applied effect, Regeneration checks for it

On damage of a chosen type, Regeneration's `apply_effect` sub-effect applies **Regeneration
Suppressed** until the end of the holder's next turn. Regeneration's healing has a condition
"has no Regeneration Suppressed" (`has_effect`, negated).

- The duration rules already do "next turn" right, including the same-turn rule (damage taken
  on its own turn lasts through its following turn).
- The marker shows in the Effects drawer, so the DM sees why it didn't heal and can remove it.
- It works the same for Regeneration as a trait (not stored) and applied from the drawer.

Alternatives: a per-trait "suppressed until" field on the entity (new state, and trait effects
have no stored instance to put it on); a new `suppress` sub-effect type that switches a sibling
off for a turn (new engine concept for one effect).

### D2. The DM applies the suppression with Apply

Triggers don't change state (effects-triggers). The damage prompt gets **Apply**, as damage and
healing get Roll. This is generic: every triggered `apply_effect` gets it.

Alternative: apply it automatically. Faster, but breaks the rule that the DM applies everything
a trigger does, and nothing else in the tracker does it.

### D3. Several damage types are a list

A `damage_type` choice marked multiple holds `["acid", "fire"]`. The schema (links and
instances) allows a string or a list of strings for `damage_type`; the database rules on the
`firebase_rules` `effects` branch accept a list of short strings there (10 places that now check
`isString()`).

Alternative: a comma-separated string (`"acid,fire"`). No schema or rules change, but every
reader has to split it, and it looks like one odd damage type to anything that doesn't.

### D4. Optional and multiple are marked on the definition

A definition gets `choice_settings`, e.g. `{ damage_type: { optional: true, multiple: true } }`.
Without it, choices are required and single, as today. When an optional choice isn't set, the
sub-effects that ask for it are left out of the resolved definition, so they never fire.

Alternative: mark it on the sub-effect. A choice kind is one value per link though, shared by
every sub-effect that asks for it, so the definition is the right place.

### D5. A chosen damage type on a damage trigger fills the trigger filter

For a sub-effect with a `damage_taken` or `damage_dealt` trigger, `fixChoices` fills
`trigger_filter.damage_types` with the chosen types (not `damage_types`, which means "this
sub-effect's damage types" for modifiers).

### D6. Fixed amount now, rolled later

The healing reads the `value` choice ("10"). Once the rolled-amounts work lets a value hold a
roll, Regeneration gets it without a definition change, because it already reads `value`.

### D7. At least 1 Hit Point is a condition

The healing's condition also holds "doesn't have 0 Hit Points" (`hp_zero`, negated), checked
when the turn starts. The prompt shows that it doesn't function, instead of hiding it, so the DM
knows the trait was considered.

### D8. One definition for both editions

The mechanics are the same in 5e and 5.5e, so both are one entry without `edition` (as
Reaction Used is).

## Risks / Trade-offs

- [The DM dismisses the damage prompt without Apply] → Regeneration heals next turn. The
  start-of-turn prompt still needs Roll, so the DM sees it and can skip it.
- [Older app versions read a list-valued choice] → they show it as text and ignore it in
  filters; only Regeneration uses a list in this change.
- [`choice_settings` in custom effects] → the effects form doesn't edit it in this change;
  custom effects keep required, single choices.

## Migration Plan

1. Database rules (`firebase_rules`, `effects` branch): accept a list for `damage_type`.
2. HK API: publish the two definitions (Harm), after `scripts/validate-effects-data` passes on
   the JSON.
3. App: schema, engine, prompts, forms.

Nothing stored changes. Rollback: revert the app; the definitions and rules are harmless
without it (an old app shows the healing prompt with Roll and ignores the condition it can't
read).
