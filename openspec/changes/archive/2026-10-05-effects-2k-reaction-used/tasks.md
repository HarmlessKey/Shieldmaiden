## 1. Data and helpers

- [x] 1.1 `reaction-used` definition in `src/data/5e/effects.js` and `src/data/5.5e/effects.js` (design decision 5). Verify that `validate.mjs` passes, and in the scratchpad that it resolves in both editions and gives no stat or roll modifiers (`effectiveStats` / `rollModifiers` unchanged)
- [x] 1.2 `hasReactionUsed` and `reactionUsedApplies` (decision 1). Verify in the scratchpad against the scenarios of "Acting out of turn offers Reaction Used": opportunity attack, its own turn, legendary action, already used, before combat (no turn key), and an actor that isn't in the encounter

## 2. Store and hooks

- [x] 2.1 Store action `use_reaction` (decision 2). Verify in the scratchpad that the built instance matches the "Opportunity attack" scenario, and that it validates against `$defs/active_instance`. Check with `durationActions` that it expires at the holder's next `start_turn_target` ("Ends at the start of its next turn"), not before
- [x] 2.2 Hooks in `roll_action` (once, before the target loop), `actions/Manual.vue` and `legacy/actions/custom/Manual.vue` (decision 3). Verify by reading:
  - the "Player reaction with manual damage", "Shield out of turn" and "Several targets" scenarios
  - that `setHP`, effect-prompt rolls (`rollEffectParts`) and undo don't dispatch it ("Damage from an effect prompt")
- [x] 2.3 (Changed at the user's request after the first build) A prompt instead of applying directly (design decisions 2 and 2b):
  - `use_reaction` queues a `reaction_used` prompt
  - `apply_reaction_used` applies the instance (nothing when it's already used or the actor is gone)
  - `EffectTriggerNotifier` shows "<actor>: Reaction used?" with Apply / Dismiss, one open prompt per actor (freed on the toast's `destroyed`)
  - `effectToast` returns the toast

  Verify by reading against the "Acting out of turn offers Reaction Used" scenarios ("Opportunity attack", "Apply", "Dismiss", "One prompt at a time"). Verify in the scratchpad that `apply_reaction_used`'s instance still matches the "Apply" scenario, and that each Vue option appears once

- [x] 2.4 (At the user's request) No notice when Reaction Used ends: `remove_effect` skips the "ended" notice for `srd` / `reaction-used`. Verify by reading against the "Ends at the start of its next turn" scenario

## 3. Display

- [x] 3.1 The marker in `actor/Details.vue` (moved there from `actor/index.vue` at the user's request: the `target-details__filler`) and `actor/SelectActor.vue`, and the legacy warning in `legacy/actions/Actions.vue` (decision 4). Verify by reading against the "Reaction Used is shown where the actor is chosen" scenarios, and that each Vue option appears once

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors
- [x] 4.2 Run `openspec validate effects-2k-reaction-used --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app:
  - **Actor panel roll:** during an NPC's turn, select another NPC as the actor and roll an action → the prompt "<NPC>: Reaction used?" appears, and nothing is applied yet. Apply → it gets Reaction Used, and the "Reaction Used" tag shows in its details bar after its name, and the marker in the Select Actor list.
  - **Dismiss:** the same with Dismiss → no Reaction Used
  - **One prompt:** rolling more out-of-turn actions for that NPC while its prompt is open shows no second prompt. After closing it, the next out-of-turn action prompts again (unless Reaction Used was applied).
  - **Its next turn:** at the start of that NPC's next turn, Reaction Used ends, without a notice
  - **Manual damage:** during an NPC's turn, select a player as the actor and enter manual damage → the prompt appears for the player. Do the same from the "Out of turn damage/healing" drawer.
  - **Card spell:** casting a spell from the card of a creature that doesn't have the turn shows the prompt
  - **No prompt:** for its own turn's actions, legendary actions, before combat, or when it already has Reaction Used
  - **No reaction:** rolling Burning damage from a prompt shows no Reaction used prompt
  - **Legacy warning:** the drawer's done-by select shows "Reaction used" for an entity with the effect

  Record the outcome here
  - 2026-10-05: user tested the whole 4.3 list in the app; everything works. Changed during testing at the user's request:
    - a prompt instead of applying directly (2.3)
    - the tag moved to the details bar, with a 55px left margin on lg/xl
    - no notice when the reaction is regained (2.4)
- [x] 4.4 After archiving, mark 2k done in `.planning/effects-implementation-plan.md` (step 2k and the Suggested Order). Verify the plan shows it
