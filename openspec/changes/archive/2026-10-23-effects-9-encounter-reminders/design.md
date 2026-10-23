## Context

See proposal.md (Why) and the specs for the behavior. Current state:
- **Storage:** reminders live on encounter entities (`encounters/<uid>/<campaign>/<encounter>/entities/<key>/reminders/<id>`, players included), shaped
  `{ title, notify, color, trigger: startTurn|endTurn|damage|timed, rounds, action: notify|remove, selectedVars }`.
  The Firebase rules validate that node; the encounter itself has a fixed set of children
  (`$other: false`).
- **Firing:** `remindersMixin.checkReminders` / `timedReminders`, called from components that
  watch the turn (`combat/top/index.vue`, `top/EncounterProgress.vue`, `mobile/Current.vue`,
  `legacy/Current.vue`, `legacy/Turns.vue`) and from `HpManipulations` on damage. Each caller
  has its own copy of the logic.
- **Effects' triggers:** `runEncounter/set_turn` dispatches `fire_turn_triggers` (combat start,
  end/start of turn) only when combat moves forward; `fire_trigger` is the single entry point
  for those and for `on_zero_hp` (from `HpManipulations` and the notifier). Prompts are queued
  with `ADD_EFFECT_PROMPTS` and shown by `EffectTriggerNotifier.vue`.
- **Personal reminders:** `reminders/<uid>/<id>` (no validation in the rules), edited with
  `ReminderForm.vue`, set from `TargetReminders.vue` with variables.
- **Precedent:** step 8's `convert_legacy_surprised` converts on load, removing the old data
  only after the new data is stored.

## Goals / Non-Goals

**Goals:**
- One place decides which reminders fire (a pure function), called from the store where the
  effects' triggers already fire, so every layout behaves the same.
- The reminder shape is final enough for step 10 (the edit encounter screen) to write the same
  data.

**Non-Goals:**
- HP triggers (damaged, bloodied, 0 HP of a player): out of scope by the user's choice.
- Setting reminders outside the tracker (step 10).
- Reminders in the player view or shared to players.

## Decisions

### 1. Data: `encounter.reminders`, keyed by id

```
reminders/<id> = {
  title, text?, color,
  entity_key?,                       // absent: about the encounter
  trigger: { type, round?, every?, from? },
  repeat: boolean,
  fired?: true,                      // once reminders after firing
  effect?: { source: "srd"|"custom", source_key, name },
  variables?: { <name>: <chosen value> },
  template_id?                       // the personal reminder it came from
}
```
Trigger types: `combat_start`, `round_start` (`round`), `every_rounds` (`every`, `from`),
`turn_start` / `turn_end` (`entity_key`, optional `round`), `defeated` (`entity_key`).
- **Why on the encounter, not on entities:** encounter reminders have no entity; one list is
  simpler to fire, list and reset; step 10 edits the encounter, not its entities' runtime data.
  Entity reminders keep `entity_key`, so they survive the entity's runtime data being reset.
- **`fired` instead of deleting once reminders:** the drawer lists done reminders to re-arm,
  and reset can re-arm them (spec: reset keeps reminders).
- **`text`, `variables` renamed from `notify` / `selectedVars`:** the conversion and the
  template mapping translate them; the old names stay readable in personal reminders.
- Alternative: keep reminders per entity and add an encounter list beside it. Rejected: two
  storage places and two firing paths, which is what we're removing.

### 2. Matching: a pure `remindersToFire` in `src/utils/reminderFunctions.js`

`remindersToFire(reminders, event)` with `event = { type: "combat_start" | "round_start" |
"turn_start" | "turn_end" | "defeated", round, entityKey }` returns the ids that fire (not
fired once reminders whose trigger matches; `every_rounds` matches `round >= from && (round -
from) % every === 0`). The same file holds `triggerText(reminder, names)` for the drawer and
prompt titles, `convertLegacyReminder(old, { round })`, and `reminderFromTemplate(template,
{ round })`. Pure, so a scratchpad check covers them, like `effectFunctions`.

### 3. Firing from the store: `fire_reminders`

`runEncounter/fire_reminders({ event })` runs `remindersToFire`, marks once reminders `fired`
(written to the database unless demo/test), and queues one prompt per reminder with
`ADD_EFFECT_PROMPTS` (`kind: "reminder"`). Called from:
- `fire_turn_triggers`: `combat_start` on combat start; `round_start` when the round went up
  (and for round 1 on combat start), before the incoming turn's start; `turn_end` for the
  outgoing and `turn_start` for the incoming entity, next to the effects' turn triggers
- `defeated`: `fire_trigger` for `on_zero_hp` when the entity is an NPC; `set_dead` (marking
  dead); `set_active` with `active: false`; `remove_entity` (before the entity is removed, so
  its name is known)
- Forward-only follows `set_turn`'s existing `forward` check, so going back fires nothing.
- An inactive entity has no turn in `turn_order`, so its turn reminders can't fire.

Alternative: keep firing in the components that watch the turn. Rejected: five copies, and
the defeat events don't happen in those components.

### 4. Prompt: a `reminder` kind in `EffectTriggerNotifier.vue`

Shown with `effectToast` (warning), a reminder icon (`fas fa-bell`) instead of the effect icon,
title from `triggerText`/entity name, body with variables filled in (the existing
`replaceReminderVariables` moves to `reminderFunctions.js`). Buttons: Dismiss (once), Keep /
Remove (repeating; Remove dispatches `remove_reminder`), and **Apply <name>** when the effect
resolves (`findSrdDefinition` for SRD, the custom effects store for custom).

### 5. Apply from a prompt: the Effects drawer opened for one effect

The Effects drawer's `data` accepts `{ keys, entry }` besides an array of keys: with `entry`
(the effect's `{ source, sourceKey, name }`) it opens straight on that effect's apply form
(`ApplyEffect`), for `keys`. For an encounter reminder the drawer shows a target choice above
the form: **Everyone in combat** (active entities, the default) or **Current targets**. The
apply flow itself is unchanged.

### 6. The Reminders drawer

`TargetReminders.vue` becomes the Reminders drawer for targets or the encounter (changed at
apply, user requests):
- **For:** decided by the button that opened it: the targets' Reminders option (entity keys,
  or the targeted entities), or the encounter Reminders button in `EncounterProgress.vue`
  (`data: { encounter: true }`). No toggle.
- **List on top:** the reminders it's for (the encounter's own, or per targeted entity), with
  the trigger in words, done ones marked, and edit, re-arm and remove
- **Form below:** the shared `ReminderForm.vue` (turn and defeat triggers for entities, round
  triggers for the encounter), passed through `reminderFromTemplate` so "in N rounds" becomes a
  round; it stays open for the next one

Reminders are quick notes, mostly added while preparing: the drawer offers no personal
reminders (templates) and no tabs. The premade reminders are retired, and Surprised became an
effect in step 8. `Reminder.vue` (opened from a chip or the list) shows one reminder with edit,
re-arm and remove.

### 7. Personal reminders as templates

`ReminderForm.vue` stores the new shape (`trigger` object, `repeat`, `effect`) for new and
edited personal reminders. Old ones aren't rewritten; `reminderFromTemplate` maps them when
set (spec table), and a `damage` template opens the form with the trigger empty. The tier
limit on personal reminders is unchanged.

### 8. Conversion on load: `convert_legacy_reminders`

After `convert_legacy_surprised` in `init_Encounter`: for each entity with `reminders`, convert
each with `convertLegacyReminder` (dropping `damage`, `concentration`, `reaction`), write the
new reminders to `encounter.reminders`, then delete the entity's `reminders` node. Demo
converts in memory, test doesn't convert, as in step 8. A failed write leaves the old data, so
the next load retries.

### 9. Reset

`encounters/reset_encounter` keeps `encounter.reminders` and deletes each reminder's `fired`;
it still deletes `entity.reminders` (legacy leftovers).

### 10. Firebase rules

New `reminders/$id` under `$encounterId`, validating the shape above (strings with lengths,
trigger type enum, numbers 1–999, `repeat`/`fired` booleans, `effect.source` enum,
`variables/$name` strings ≤ 100, `$other: false`). The entity `reminders` rule stays so the
conversion can read and delete old data. A `check-reminder-rules` scratchpad check validates
sample reminders against the rule regexes, like the effects rules checks.

## Risks / Trade-offs

- [Old app versions still write `entity.reminders` until users reload] → the conversion runs
  on every load and only acts when the node exists.
- [The `damage` drop is lossy] → the user chose it; the drawer and docs say "On damage taken"
  isn't a trigger any more, and personal templates aren't deleted.
- [Timed reminders become a fixed round] → equivalent for the active case (the entity's turns
  counted down once per round); differs only if the entity skipped turns, which the old
  countdown also handled by its own turns.
- [Prompts pile up when many reminders fire at once] → same behavior as effect prompts; each
  can be dismissed.
- [Removing `remindersMixin` from the legacy layout] → the store fires for every layout now; the
  mixin keeps only what the drawer still needs, or is deleted if nothing does.

## Migration Plan

1. Deploy the Firebase rules first (the new node is additive).
2. Ship the app; encounters convert on first load.
3. Rollback: the old app reads `entity.reminders`, which converted encounters no longer have;
   their reminders would be missing in the old app, but nothing else breaks.

## Open Questions

- Whether "Everyone in combat" for an encounter reminder's effect should leave out players
  (a sandstorm blinds everyone, a lair action may not). The drawer's target choice lets the DM
  untarget, so it can be settled while testing.
