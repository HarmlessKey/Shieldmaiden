## Context

The effects drawer (`Effects.vue`) builds one instance per target with `buildEffectInstance`,
and `apply_effect` in `runEncounter.js` saves each one. The caster is always `turnEntityKey`.
`ApplyEffect.vue` gets the caster's Concentration key and name as props, and offers "Ends with
<caster>'s Concentration" only when that Concentration exists. Today's building blocks:
- **Expiry:** `durationActions` ticks `time` durations at the end of the anchor's turn
  (`anchorKey`, with a fallback to the holder). `concentration` durations never tick.
- **Cascade:** `remove_effect` → `cascadeTargets` ends instances whose `concentration_id`
  is a removed Concentration's key and whose `caster_key` is its holder (2h1).
- **Temporary HP:** `grantEffectTempHp` (mixin `effectRolls`) sets them from a prompt. Nothing
  ties them to the instance afterwards.
- **Same-turn rule:** for `next_turn` / `edge: "end"`, `durationActions` skips the end of
  the turn in which the effect was applied, using
  `instance.caster_key === entityKey && event.round === instance.applied_round`. This
  assumes the caster had the turn (2h1 "Assumption for steps 6–7").

## Goals / Non-Goals

**Goals:**
- A caster select in the application form (all entities + None, default the active entity).
- Concentration on the caster from the application: start, share for the same effect, and
  replace a different one after a warning. Link to or replace a Concentration of unknown
  effect.
- The "up to" time counts down: on the caster's Concentration, or on an unlinked
  Concentration duration.
- `applied_turn_key` for the same-turn rule.
- Temporary HP with `expires_with_effect` are removed when their instance ends.

**Non-Goals:**
- Concentration for effects applied by monster actions or spells (steps 6–7), and the
  Concentration of spells cast without the drawer.
- Ending Concentration when the caster casts a Concentration spell outside the tracker.
- Changing a running instance's caster after it's applied.
- Undoing ticks when going back a turn (known issue, unchanged).
- Temporary HP from sources other than effect prompts.

## Decisions

### 1. Caster select lives in `ApplyEffect`, the logic in `Effects.vue`

- **`Effects.vue`** passes `casters` (every entity in `turn_order` order, then the rest)
  with `{ value: key, label: name }`, and `defaultCaster` (`turnEntityKey` or undefined).
- **`ApplyEffect`** shows a `q-select` "Caster" with a "None" option (`value: null`) and
  emits the chosen caster in the application as `caster_key`.
- **Concentration props:** the props `concentrationKey` / `casterName` are replaced by
  `casterConcentration(key)`, a function prop that returns
  `{ key, for: { source, source_key, name } | undefined }` for the chosen caster, or
  undefined. The form can then react to the select without the parent knowing the
  selection.
- **Shift+click** applies with `defaultCaster`.

*Alternative:* a caster select at the top of the drawer, shared by all applications.
Rejected: the caster belongs to one application, and the active entity is the right
default every time the form opens.

### 2. Concentration decision is a pure helper

`concentrationPlan({ casterConcentration, effect, option })` in `effectFunctions.js` returns:
- `{ action: "none" }` when the option is off or there is no caster
- `{ action: "start" }` when the caster has no Concentration
- `{ action: "share", key }` for the same `source` / `source_key`
- `{ action: "replace", key, name }` for a different effect
- `{ action: "link", key }` or `{ action: "replace", key }` for an unknown effect, per the DM's
  choice (default link)

`ApplyEffect` uses it for the warning, the link/replace radio and the apply button's label
("Replace and apply"). It emits the plan in the application as `concentration`. The plan is
tested in a scratchpad script. The form's options:
- duration `concentration` with a caster: the checkbox "<caster> concentrates on it" (on by
  default)
- another duration: the old "Ends with…" checkbox, off by default

### 3. `Effects.vue` applies in order: replace, start, targets

`apply(entry, application)`:
1. `replace`: `await remove_effect({ key: caster, effectKey: old, reason: "started concentrating on <name>" })`.
   The cascade and its notices are unchanged.
2. `start` / `replace`: build the caster's Concentration with `buildEffectInstance`, from the
   SRD Concentration definition of the edition, and apply it:
   - `casterKey` = `casterName` = the caster
   - `application.duration`: `{ type: "time", value, unit }` when an "up to" time is set,
     else `{ type: "cancelled" }`
   - `concentration_for`: the effect (`{ source, source_key, name }`)

   `await apply_effect(...)` returns its key.
3. Targets: `concentration_id` = the new key (`start` / `replace`) or the existing key
   (`share` / `link`, or the "Ends with" checkbox).

Each instance gets `caster_key` / `caster_name` from the select, and `applied_turn_key` =
`turnEntityKey`. `buildEffectInstance` takes `turnKey` and `concentrationFor` arguments.

*Why `time` for the caster's Concentration:* it reuses the existing countdown, badge and
expiry notice. Expiry then cascades through `remove_effect`. The instance is still
recognized as Concentration by `source_key: "concentration"`, so the cascade, `ends_when` and
the Concentration save prompt (3c1) all keep working.

*Alternative:* a store action that does all of it. Rejected for now: the drawer is the only
caller until steps 6–7, and `apply_effect` / `remove_effect` already carry the save,
resolution and cascade. Steps 6–7 can lift it into a store action.

### 4. Unlinked Concentration durations count down

- **`buildEffectInstance`** sets `rounds_remaining` for `concentration` with a `value` and no
  `concentration_id`.
- **`durationActions`** treats an instance as timed when `duration.type === "time"`, or when
  it is `"concentration"` with `rounds_remaining` and no `concentration_id`.
- **Linked instances** never get `rounds_remaining`, so they don't tick twice: their
  Concentration ends them.
- **Display:** `describeDuration` shows "Concentration, N rounds left" when
  `rounds_remaining` is set, and `effectBadge` shows the rounds for these too.

### 5. Same-turn rule uses `applied_turn_key`

`sameTurn = (instance.applied_turn_key ?? instance.caster_key) === entityKey && event.round === instance.applied_round`.
The fallback keeps the behaviour of instances saved before this change. Escalated instances
(`escalationInstance`) carry `applied_turn_key` over.

### 6. Temporary HP that end with their effect

- **Recording:** `grantEffectTempHp` records `temp_hp_granted` when the amount raised the
  temporary HP and a granted part's sub-effect has `expires_with_effect`. It uses
  `set_effect_prop` on `prompt.holderKey` / `prompt.effectKey`, which does nothing when the
  instance is gone. `tempHpParts` carries `expires_with_effect` per part.
- **Removing:** `remove_effect` does it after `DELETE_EFFECT` when `!skipExpire` (escalation
  passes `skipExpire`). A pure helper `tempHpToLose({ instance, tempHp })` returns
  `tempHp` when `0 < tempHp <= instance.temp_hp_granted`, else 0. When it returns more than
  0, `remove_effect`:
  - dispatches `set_hp({ key, pool: "temp", newHp: 0 })`
  - adds a prompt `{ kind: "temp_hp_lost", holderName, effectName, amount }`, which
    `EffectTriggerNotifier` shows as an info toast "<holder> loses <n> temporary hit points
    from <effect>"

  This works for removal by hand, expiry and the cascade, since they all go through
  `remove_effect`.
- **Data:** 5e False Life gets `expires_with_effect: true`. 5.5e False Life doesn't: its
  temporary HP last until they are used.

### 7. Storage

- **Schema:** `$defs/active_instance` gets `concentration_for` (an object with `source`,
  `source_key` and `name`, no additional properties), `applied_turn_key` (a string) and
  `temp_hp_granted` (an integer ≥ 0).
- **Rules:** the three `effects` blocks get the same fields. `concentration_for` has
  `hasChildren(['source','source_key'])`, typed children and `$other: false`. They are tested
  in the rules emulator (`rules-emu` in the scratchpad) next to the existing effects tests.

## Risks / Trade-offs

- **Removing temporary HP:** temp HP at or below the granted amount are assumed to be this
  effect's. They may come from another, smaller grant. Temporary HP don't stack, so a
  smaller grant only replaces them when the DM sets them by hand → accepted. The notice
  tells the DM what was removed.
- **Several Concentrations from before 2j:** a caster with several Concentration instances
  from earlier data: the first is used for the plan, as today's `casterConcentrationKey` does.
- **Replacing mid-apply:** the old Concentration is removed before the new one is saved.
  When saving the new one fails, the caster ends up without Concentration. That's the same
  failure mode as any other failed write (an error in the console). The DM can apply again.
- **A caster other than the active entity, for `next_turn` with `anchor: "caster"`:** the
  effect now expires on the chosen caster's turns. This is intended, and covered by the
  durations scenarios.

## Migration Plan

- No data migration. Instances without the new fields behave as before:
  - `applied_turn_key` falls back to `caster_key`
  - a Concentration without `concentration_for` is "unknown" (link or replace)
  - instances without `temp_hp_granted` remove nothing
- **Rules:** upload the updated `firebase-rules.json` to the develop database before testing,
  and to production before release. Clients without the new rules reject writes with the new
  fields, as in 3b and 3c1.

## Open Questions

- None blocking. Steps 6–7 (applying from monster actions and spells) will reuse
  `concentrationPlan` and may move the apply order into a store action.
