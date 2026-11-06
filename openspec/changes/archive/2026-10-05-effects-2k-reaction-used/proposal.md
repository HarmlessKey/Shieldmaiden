## Why

When a creature acts outside its turn (an opportunity attack, Shield, Hellish Rebuke), it has
used its reaction until its next turn. Today that's only a legacy reminder that the DM sets
by hand, so the tracker doesn't know a creature has spent its reaction. Step 2k of the
effects plan makes "Reaction Used" an effect. The tracker offers it, with a prompt, when an
entity acts out of turn, and shows it where the DM picks the actor.

## What Changes

- **A "Reaction Used" effect** in both editions' effect lists, a marker without mechanics. It
  ends at the start of the holder's next turn, when the reaction is regained. It can also be
  applied by hand from the effects drawer.
- **Offered with a prompt when an entity acts out of turn:** when combat has started and the
  acting entity isn't the one whose turn it is, a prompt "<actor>: Reaction used?" offers
  **Apply** and **Dismiss**. An out-of-turn action isn't always a reaction, so nothing is
  applied without the DM choosing Apply. One prompt per entity is open at a time. Acting is:
  - rolling an action or spell (actor panel, entity card, legacy actions panel)
  - manual damage or healing (actor panel and the legacy panel's manual input)

  Legendary actions don't count, because they don't use the reaction. The holder applies it
  to itself: its caster is the holder, not the entity whose turn it is. A creature that
  already has Reaction Used gets no prompt and no second one.
- **Shown where the actor is chosen:**
  - a "Reaction Used" tag in the actor panel's details bar, after the actor's name
  - a marker in the Select Actor list
  - the legacy panel's "Reaction used" warning also reads the effect

  An applied Reaction Used can be removed like any other effect.
- Not in this change: retiring the legacy premade "reaction" reminder (step 3f), and blocking
  reactions with `restrict` (step 3e).

## Capabilities

### New Capabilities
- `effects-reaction-used`: the Reaction Used effect, the prompt that offers it for
  out-of-turn actions, and where it's shown.

### Modified Capabilities
<!-- None: the effect definition, its duration, storage and display use the existing
     requirements of effects-srd-data, effects-durations, effects-instance-storage and
     effects-display unchanged. -->

## Impact

- **Data:** `src/data/5e/effects.js`, `src/data/5.5e/effects.js` (new `reaction-used`
  definition).
- **Code:**
  - `src/store/modules/runEncounter.js`: an action that queues the prompt for an
    out-of-turn actor, and one that applies Reaction Used
  - `src/components/combat/EffectTriggerNotifier.vue`: the prompt
  - `src/mixins/runEncounter.js` (`roll_action`)
  - `src/components/combat/actions/Manual.vue` and
    `src/components/combat/legacy/actions/custom/Manual.vue`
  - the actor panel: `actor/index.vue` and `actor/SelectActor.vue`
  - `combat/legacy/actions/Actions.vue` (warning)
  - `src/utils/effectFunctions.js`: a pure helper for the decision
- **No schema, rules or migration changes.** The instance uses existing fields.
