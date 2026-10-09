## Context

- **Choosing the actor:** the actor panel (`combat/actor/index.vue`) acts as `actor || current`.
  `actor` is the store's selected actor (`set_actor`), set from the Select Actor list.
  `current` is the entity whose turn it is, and `out_of_turn` is true when they differ. The
  legacy actions panel (`combat/legacy/actions/Actions.vue`) is still used by the "Out of
  turn damage/healing" drawer and the mobile menu. It has its own done-by select (`doneBy`)
  and warns "Reaction used" when that entity has the premade `reaction` reminder.
- **Rolled actions and spells** all go through `roll_action` in `src/mixins/runEncounter.js`,
  with `entity` (the actor) and `category`. The categories are `actions`, `reactions`,
  `bonus_actions`, `legendary_actions`, `special_abilities`, `innate` and `caster`. The
  callers are `actions/RollActions.vue`, `actions/RollSpells.vue`,
  `entities/Card/CardActions.vue`, and the legacy `Roll.vue`, `Spellcasting.vue` and
  `custom/CustomRoll.vue`.
- **Manual damage/healing** calls `setHP(amount, target, actor, config)` in
  `actions/Manual.vue` and `legacy/actions/custom/Manual.vue`, once per target. `setHP` is
  also used by the roll dialog, effect prompts (3a) and undo, so it can't be the hook.
- **Turn:** the entity whose turn it is is `turn_order[turn]` when `round > 0`, as in the
  effects drawer (`turnEntityKey`).

## Goals / Non-Goals

**Goals:**
- A `reaction-used` definition in both editions.
- Offered with a prompt (Apply / Dismiss), once, when an entity rolls an action/spell or deals
  manual damage or healing out of turn. Legendary actions are excluded.
- Markers in the actor panel and the Select Actor list, and the legacy warning reading the
  effect.

**Non-Goals:**
- Retiring or converting the premade `reaction` reminder (3f).
- Blocking further reactions (`restrict`, 3e).
- Lair actions: they have no category of their own and are rolled for the creature whose
  turn it is (or by the DM at initiative 20). They aren't excluded beyond that.

## Decisions

### 1. Pure helpers in `effectFunctions.js`
- **`hasReactionUsed(entity)`:** whether the entity has an `srd` / `reaction-used` instance.
- **`reactionUsedApplies({ actorKey, turnKey, category, entities })`:** true when all of
  these hold:
  - `actorKey` and `turnKey` are set and differ
  - the actor is in `entities`
  - `category !== "legendary_actions"`
  - `!hasReactionUsed(actor)`

  It's tested in the scratchpad.

### 2. Store actions `use_reaction` and `apply_reaction_used`

Changed after the first build, at the user's request: the effect isn't applied directly; a
prompt offers it.

In `runEncounter.js`:
- **`use_reaction({ actorKey, category })`:**
  1. Compute `turnKey` from `encounter.round` / `turn` / `turn_order`, the same as the
     drawer.
  2. Check `reactionUsedApplies`.
  3. Queue an effect prompt:
     `{ kind: "reaction_used", id, holderKey: actorKey, holderName, turnKey, source: "srd", source_key: "reaction-used" }`.
     The source gives the toast its icon.
- **`apply_reaction_used({ actorKey, turnKey })`:**
  1. Do nothing when the actor is gone or `hasReactionUsed`. The DM may have applied it by
     hand, or Applied an earlier prompt, in the meantime.
  2. Build the instance with `buildEffectInstance`:
     - the definition from `findSrdDefinition(edition, "reaction-used")`
     - `casterKey` and `casterName` = the actor, `turnKey` from the prompt
     - duration `{ type: "next_turn", anchor: "target", edge: "start" }`
  3. Dispatch `apply_effect`.

All entry points share the same rule, and the store already has the encounter state.
`apply_effect` saves the instance, fires `on_apply`, and adds no prompt for a definition
without temporary HP.

*Alternatives:*
- Deciding in each component. Rejected, because there are five entry points.
- Applying directly and letting the DM remove it (the first build). Rejected by the user: an
  out-of-turn action isn't always a reaction, so the DM confirms it.

### 2b. The prompt

`EffectTriggerNotifier` shows `kind: "reaction_used"` as an `effectToast` (info):
- title "<actor>: Reaction used?"
- body "Acted outside its turn. Apply Reaction Used until the start of its next turn?"
- `timeout: 0`, with **Apply** (dispatch `apply_reaction_used`, close) and **Dismiss**
  (close)

**One prompt per entity:** the notifier keeps `openReactionPrompts`, keyed by actor and
holding the toast id. It isn't reactive, because it's not rendered. A new `reaction_used`
prompt for an actor that's already in it is skipped. The entry is removed when the toast is
destroyed (the toast's `destroyed` event), so it's also freed when the toast is closed any
other way. `effectToast` returns the snotify toast for this.

### 3. Hooks
- **`roll_action`:** dispatch `use_reaction({ actorKey: entity.key, category })` once,
  before the per-target loop. This covers every action and spell caller, including the card
  and the legacy panel.
- **`actions/Manual.vue`:** dispatch once after the target loop, with `this.actor.key`, when
  an amount was applied.
- **`legacy/actions/custom/Manual.vue`:** the same, with `this.current.key`.
- No category for manual input, so it is never excluded.
- `use_reaction` doesn't wait on the roll: it runs alongside it, and its failure doesn't
  block the roll (it's logged).

### 4. Display
- **`actor/Details.vue`:** a small "Reaction Used" tag (`fas fa-reply` icon, red background
  as the legacy warning) in `target-details__filler`, the space after the actor's name, when
  `hasReactionUsed(actor)`. At first it sat after the actions/spells dropdowns in
  `actor/index.vue`; it was moved at the user's request. It's a static marker. The effect
  can be removed from the entity's effect chips.
- **`actor/SelectActor.vue`:** each list item gets the same small marker next to
  `BasicEntity` when the entity has it.
- **Legacy `Actions.vue`:** the warning condition becomes "reminder **or**
  `hasReactionUsed(entitiesList[doneBy])`".

### 5. Data
The 5e and 5.5e `effects.js` get:
```js
{
	url: "reaction-used",
	name: "Reaction Used",
	description: "The creature has used its reaction. It regains it at the start of its next turn.",
	cancelable: true,
	sub_effects: [{ type: "special", description: "Has used its reaction until the start of its next turn." }],
}
```
The schema needs at least one sub-effect. A `special` sub-effect without a trigger is
ignored by stat and roll modifiers, and is only described.

## Risks / Trade-offs

- **An out-of-turn action that isn't a reaction** (the DM catching up on a missed turn, a
  lair action rolled for another creature) still shows the prompt. The DM dismisses it. When
  several entities act, several prompts can stack, one per entity.
- **Card rolls of a creature that doesn't have the turn** count as acting out of turn. This
  is intended: they are out-of-turn actions.
- **The legacy reminder and the effect can both exist** on an entity until 3f. The warning
  shows for either.

## Migration Plan

No data, schema or rules changes. The instance uses existing fields (`applied_turn_key` from
2j). Existing reminders are untouched.

## Open Questions

None.
