## Context

- **Data:** `restrict` sub-effects are in Incapacitated (and the conditions that include it),
  Charmed, Frightened, Prone, Paralyzed/Petrified/Unconscious (speech), Slow (reaction) and
  Haste (on expiry). `outcome`: Exhaustion `death` (`min_level: 6`) and Concentration's two
  `break_concentration` (with a save on `damage_taken`, already prompted since 3c1; without a
  save on `on_zero_hp`, today only a prompt line).
- **Rolls:** all action and spell rolls go through `roll_action` (`src/mixins/runEncounter.js`)
  with `entity`, `category` and the targets.
- **Details bar:** `actor/AttackReminders.vue` shows Reaction Used and the attack chips.
- **Conditions and the other party:** `conditionState` evaluates a counterpart when given
  `counterpartKey` (3c2). `is_caster` compares it with the instance's caster.
- **Death:** players and companions have `set_dead({ key })`. NPCs at 0 HP count as dead in
  the actor panel. `set_hp({ key, newHp: 0 })` sets HP.

## Goals / Non-Goals

**Goals:** restriction collection, chips, confirmations on rolls, the death prompt, the
automatic save-less Concentration break, and Charmed's data.

**Non-Goals:** see the proposal (triggered restrictions, `limit`, `compel` / `deny`, other
outcomes, manual damage).

## Decisions

### 1. Pure `restrictions`

`restrictions({ entity, holderKey, entities, definitionOf, counterpartKey })` returns
`[{ kind, name, description, possible, counterpartKey }]`. It covers the active definitions'
`restrict` sub-effects without a `trigger`, one entry per sub-type and effect.
- **Same rules as `rollModifiers`:** the same-definition rule, level limits, choices and
  `conditionState` (with `counterpartKey` when given).
- **A condition's state:**
  - false: the entry is left out
  - unknown: `possible: true`
  - true: included
- **`counterpartKey`:** a restriction whose condition is on the counterpart and holds keeps
  it, for "Can't attack <name>".
- **Without a counterpart** (the details bar), a counterpart condition is unknown, so it's
  possible. When the instance's caster is known and the condition is `is_caster`, the chip
  names the caster ("Can't attack Lyra"). That's the charmer, and naming it is more useful
  than "possible".

### 2. Roll confirmation in `roll_action`

Before anything else (limited uses, rolls, Reaction Used):
1. **Turn:** `turnKey` from the store getters (as in `use_reaction`). Out of turn means
   `turnKey` is set and isn't the actor.
2. **Restrictions:** `restrictions` for the actor, plus one call per target with the target as
   `counterpartKey`, for `attack` only. The latter applies when the action has a to-hit
   action type.
3. **Matching:** the kind → category map from the spec (`action`: all categories except
   reactions; `bonus_action`: bonus actions; `reaction`: reactions, or out of turn).
   Matches are grouped into a message ("Goblin is Stunned: can't take actions.").
4. **Confirm:** with matches, `this.$q.dialog({ title: "Restricted", message, cancel: true, ok: "Roll anyway", persistent: true })`.
   OK runs the original roll body; cancel returns.

The body of `roll_action` moves into `doRollAction` (same arguments), so the confirmation
wraps it without duplicating anything.

Added at the user's request: the check and dialog live in a shared
`src/mixins/restrictions.js` (`actorRestrictions`, `confirmRestrictions` → a Promise of
true/false, with an OK label). `roll_action` uses it, and so do the actor panel's
`actions/Manual.vue` (`applyManual`, also reached from the top bar's apply button) and the
legacy `custom/Manual.vue` (`setManual`). Manual input passes `category: "actions"`, with
`attack` for damage only, and "Apply anyway". Cancel returns before anything is applied or
cleared. The store getter `restrictions(key, counterpartKey)`
wraps the helper with effective entities.

### 3. Chips

`AttackReminders.vue` adds the restriction chips right after Reaction Used, from
`$store.getters.restrictions(actor.key)`. They're grouped by kind, with the effect names and
descriptions in the tooltip. A possible restriction's text starts with "May not". Plain
style, like the other chips (not red, which is reserved for Reaction Used).

### 4. Death prompt

`deathOutcome({ instance, definition })` is a pure helper. It returns the outcome sub-effect
when an `outcome` with `death` applies at the instance's level (`min_level` / `max_level`).
- **Store:** `apply_effect` checks it after a new instance and after an Exhaustion level
  change. It queues `{ kind: "death", holderKey, holderName, effectName, level }`.
- **Notifier:** shows "<holder>: <effect> <level> — dies" with **Mark dead** and Dismiss.
  - all: temp HP and HP to 0 (`set_hp`), then `fire_trigger` `on_zero_hp` so Concentration
    breaks
  - players/companions: also `set_dead({ key })`. The tracker's dead view keys on
    `curHp === 0` (found during testing: with only `set_dead`, the health bar stayed).

### 5. Save-less `break_concentration`

`fire_trigger` already separates Concentration saves (`isConcentrationSave`). A new
`isConcentrationBreak(sub_effect)` (an `outcome` with `break_concentration` and no `save`)
splits these off:
- for each match, `remove_effect({ key: holderKey, effectKey, reason })`
- the reason is the trigger label, lower-cased ("when it drops to 0 hit points" → "dropped
  to 0 hit points"; a small map for `on_zero_hp`, falling back to the label)

The rest of the trigger's sub-effects keep their prompt.

### 6. Charmed data

Add `condition: { subject: "counterpart", type: "is_caster", description: "Against the charmer" }`
to both editions' Charmed `restrict` `attack` sub-effect. `validate.mjs` checks the shape.

## Risks / Trade-offs

- **Confirmations can annoy** at a busy table (a Stunned creature's legendary action). They
  only appear when a restriction applies, and one click goes through.
- **Out of turn always checks reactions:** a slowed creature's legendary action (out of turn,
  not a reaction) also asks. This is rare, and the text names Slow's reaction restriction.
- **NPC death** is just 0 HP, matching how the tracker shows dead NPCs today.

## Migration Plan

None. Data change only for Charmed. No schema or rules changes.

## Open Questions

None.
