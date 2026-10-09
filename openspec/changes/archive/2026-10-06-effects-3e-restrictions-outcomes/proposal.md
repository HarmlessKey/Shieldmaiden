## Why

Conditions and effects say what a creature can't do (no actions or reactions while
Incapacitated, no attacks on the charmer, no movement while Prone or Frightened, no speech
while Paralyzed). Some also have a fixed outcome: Exhaustion level 6 is death, and dropping
to 0 hit points breaks Concentration. The tracker shows none of this. A Stunned goblin's
attacks roll like any other, and Concentration stays up at 0 HP until the DM removes it.
Step 3e of the effects plan makes `restrict` and `outcome` sub-effects visible and acted on.

## What Changes

- **Restriction warnings on rolls:** rolling an action or spell for an actor that's
  restricted asks the DM to confirm, naming the effect ("Goblin is Stunned: can't take
  actions. Roll anyway?"). The restrictions that count:
  - `action` (actions, bonus actions, legendary actions, spells)
  - `bonus_action`
  - `reaction` (reactions, and any out-of-turn action)
  - `attack` against a target, checked with that target as the other party (Charmed:
    attacking the charmer)
- **Restriction chips in the details bar:** every active restriction shows as a chip
  ("Can't take actions", "Can't move", "Can't speak", "Can't attack Lyra"). They come after
  Reaction Used and before the attack reminders, including what can't be enforced
  (movement, speech, Concentration), with the effect in the tooltip.
- **Outcomes:**
  - `death` (Exhaustion level 6): when a creature reaches it, a prompt "<creature>:
    Exhaustion 6 — dies" offers **Mark dead** (players and companions: dead; NPCs: 0 HP) and
    Dismiss
  - `break_concentration` without a save, on its trigger (0 HP): the Concentration ends by
    itself, with a notice. Its linked effects end through the cascade.
- **SRD data fix:** Charmed's attack restriction gets the condition that the other party is
  the charmer (the instance's caster), in both editions. As it stands it would restrict every
  attack.
- Not in this change:
  - restrictions from on-expire sub-effects (Haste's lethargy is still a prompt line)
  - `limit` (Slow's one attack) and `compel` / `deny`
  - other outcomes (unconscious, drop to 1, removed): they stay reminders

  Manual damage and healing are checked like rolls ("Apply anyway"). This was added at the
  user's request; at first only rolls were checked.

## Capabilities

### New Capabilities
- `effects-restrictions`: `restrict` sub-effects (chips and roll confirmations) and
  `outcome` sub-effects (death prompt, automatic Concentration break).

### Modified Capabilities
- `effects-roll-modifiers`: "The actor's attack modifiers are shown in the details bar".
  Restriction chips are part of that bar, after Reaction Used, and the "nothing shown" rule
  counts them.
- `effects-srd-data`: Charmed's attack restriction applies only against the charmer (a new
  requirement).

## Impact

- **Code:**
  - `src/utils/effectFunctions.js`: a pure `restrictions` helper and the death outcome check
  - `src/mixins/runEncounter.js` (`roll_action`): confirm before rolling
  - `src/components/combat/actor/AttackReminders.vue`: restriction chips
  - `src/store/modules/runEncounter.js`: the death prompt on applying or levelling
    Exhaustion, and `fire_trigger` ending Concentration for a save-less
    `break_concentration`
  - `src/components/combat/EffectTriggerNotifier.vue`: the death prompt
- **Data:** Charmed in `src/data/5e/conditions.js` and `src/data/5.5e/conditions.js`.
- **No schema, rules or migration changes.**
