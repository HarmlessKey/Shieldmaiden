## Why

Effects carry a duration since 2a, and triggers fire since 2g, but nothing ever ends by
itself. A "10 rounds" effect stays at 10 forever, "until the start of the goblin's next
turn" never ends, and Concentration ending leaves the spell's effects on its targets. The
DM has to remember and remove everything by hand. Step 2h of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md)
ticks durations and expires effects. It is split in two. This change (**2h1**) covers
timing, cancel triggers, state-based ends, the Concentration / parent cascade, and the
open missing-caster points from 2b. **2h2** follows with repeat saves (counters,
escalation, `on_fail`), `escape` and `on_expire`. Background:
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §4 (durations) and
`$defs/duration` in `src/schemas/hk-effects-schema.json`.

## What Changes

- **Timed effects tick**: a `time` instance's `rounds_remaining` goes down by 1 at the end
  of its caster's turn (saved like other instance changes). At 0 the effect is removed.
- **`next_turn`** expires at the first `{edge}` of its anchor's turn after it was applied,
  where the anchor is the caster or the holder. If it was applied during the anchor's own
  turn, the end of that same turn doesn't count.
- **`end_of_turn`** expires when the current turn ends.
- **`cancel_triggers`** end an instance when a listed trigger fires for its holder, with
  its filter. If the filter can't be checked from the event, the DM is prompted instead of
  the effect being removed.
- **`ends_when`** (on the instance's duration, or on the definition, such as
  Concentration's "holder is Incapacitated") is evaluated after every trigger. When it
  holds, the effect ends.
  - Supported checks: `has_condition`, `has_effect`, `bloodied`, `hp_zero`, `temp_hp_zero`
    and `hp_threshold`, for the holder or the caster, with `negate` and `all_of` / `any_of`.
  - Other checks never end an effect automatically.
- **`hasCondition(entity, url)`** checks the entity's effect instances, including
  conditions pulled in through `includes` (Stunned counts as Incapacitated), and the
  legacy `entity.conditions`.
- **Cascade**:
  - Removing an instance, whether by hand, by expiry or by cascade, also removes every
    instance linked to it: through `concentration_id` (on any entity, where the link
    points to that caster's Concentration) and through `parent_id` (on the same holder).
  - This repeats down the chain.
- **Concentration link in the drawer**: when the entity whose turn it is has an active
  Concentration, the application form offers "Ends with <caster>'s Concentration". It is
  on by default for a `concentration` duration and sets `concentration_id`.
- **Missing caster** (plan §2h, points 1–3):
  - *Fallback anchor*: when the caster isn't in the encounter, or the instance has no
    caster, caster-anchored timing uses the holder's turns. The 2g trigger fallback is
    extended to the no-caster case too.
  - *`caster_name`* is stored on new instances. Chips and the detail view show "from
    Goblin (not in this encounter)".
  - *Review on encounter start*: when carried-over player/companion effects have a
    duration other than "until removed" and a missing caster or a dangling Concentration
    link, a notice offers **Review**. It opens a drawer listing them, with Keep (clears
    the dangling references, so it isn't asked again) or Remove for each.
- **Notices**: every automatic end shows a short notice, e.g. "Goblin: Bless ended (10
  rounds passed)", through the 2g notifier queue.
- **Going back a turn** undoes nothing: rounds aren't added back and expired effects stay
  removed.
- **Firebase rules**: the `effects` blocks accept `caster_name`. The rules need to be
  uploaded again.

## Capabilities

### New Capabilities
- `effects-durations`: ticking and expiry per duration type, cancel triggers, state-based
  ends and `hasCondition`, the cascade, the missing-caster anchor and the carried-over
  review, and the notices shown for automatic ends.

### Modified Capabilities
- `effects-drawer`: an instance also records `caster_name`, and the application can link
  the effect to the caster's Concentration.
- `effects-display`: an absent caster is shown by its stored name ("from Goblin (not in
  this encounter)").
- `effects-instance-storage`: the database rules accept `caster_name`.
- `effects-triggers`: the caster-anchored fallback also applies when an instance has no
  caster.

## Impact

- `src/utils/effectFunctions.js`: pure `hasCondition`, `evaluateConditionSet`,
  `durationActions` (ticks, expiries and cancels per trigger) and `cascadeTargets`. Also
  `buildEffectInstance` adds `caster_name`. All are tested in the scratchpad.
- `src/store/modules/runEncounter.js`: `fire_trigger` runs the duration processing, and
  `remove_effect` cascades and accepts a reason for the notice. `set_effect_prop` covers
  `rounds_remaining` and clearing references. After init, carried-over effects are
  collected for review. Prompts get a `kind: "notice"`.
- `src/components/combat/EffectTriggerNotifier.vue`: notices (auto-dismiss) and the Review
  notice.
- New `src/components/drawers/encounter/effects/CarriedOver.vue`.
- `ApplyEffect.vue` / `Effects.vue` (Concentration link), and the chips / `ActiveEffect.vue`
  (caster name).
- `src/schemas/hk-effects-schema.json`: `caster_name` on `$defs/active_instance`.
- `firebase_rules/firebase-rules.json`: `caster_name` in the three `effects` blocks
  (**re-upload**).
- `.planning/effects-implementation-plan.md`: §2h split into 2h1 / 2h2, and 2h1 marked done
  after archive.
