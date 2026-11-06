## Context

Step 9 (archived as `effects-9-encounter-reminders`) built the tracker side of reminders:
- **storage:** `encounter.reminders/<id>`, written by
  `encounters/save_encounter_reminder({ campaignId, encounterId, id, reminder })`. It writes
  `null` to remove and updates the cached encounter through `SET_ENCOUNTER_REMINDER`.
- **pure helpers:** `src/utils/reminderFunctions.js`.
- **the form:** `ReminderForm.vue`, with props `value`, `scope` (`encounter` / `entity`),
  `edition`, `variables`, `disabled` and `currentTurn`.
- **the tracker drawers:** `TargetReminders.vue` and `Reminder.vue`. Both read and write
  through the `runEncounter` store (`reminders`, `set_encounter_reminder`, …). That store
  only exists for a running encounter, so the edit screen can't reuse them.

The edit encounter screen (`src/components/encounters/index.vue`) loads `campaign` and
`encounter` with `campaigns/get_campaign` and `encounters/get_encounter`. It shows tabs, each
a component with `:encounter` and `:campaign` props: Entities, General (Atmosphere), Loot
(hidden in the demo) and XP. Entities are removed in `Overview.vue` through
`encounters/delete_entity`. `get_encounter` also calls `delete_entity` for ghost entities.

## Goals / Non-Goals

**Goals:**
- One reminder editor shared with the tracker: the same form, helpers, stored shape and
  rules.
- No reminders left behind for an entity that's gone from the encounter.

**Non-Goals:**
- Personal reminder templates or variables on the edit screen. Step 9 retired them from the
  tracker drawer.
- Choosing an offered effect's targets in advance. They are chosen when the prompt fires, as
  in step 9.
- Changes to the tracker's drawers, firing, prompts or the Firebase rules.
- Reminders in the demo builder.

## Decisions

**1. A tab component on the encounters store, not the tracker drawers.**
A new `src/components/encounters/Reminders.vue` takes `encounter` and `campaign` props like
the other tabs. It writes with `encounters/save_encounter_reminder`, passing a
`cleanReminder`ed reminder.
- *Alternative:* giving `TargetReminders.vue` a mode for the edit screen. Rejected: it is
  built on the running encounter's getters (`entities`, `targeted`, `round`, the
  `runEncounter` actions), and two data sources in one drawer make it harder to follow.
- The list markup is about 30 lines and is copied, not extracted. Extracting it is fine if it
  stays readable.

**2. New ids in the store.**
`save_encounter_reminder` creates the id when none is given (the same scheme as
`runEncounter/set_encounter_reminder`: `Date.now()` plus a random suffix) and returns it. The
tab then needs no id logic of its own.

**3. The For choice lives in the tab.**
The tab owns `subject`: `""` for the encounter, or an entity key. It passes
`scope = subject ? "entity" : "encounter"` to `ReminderForm`. When the subject changes:
- the tab drops a trigger whose type `triggerFits(type, !!subject)` rejects
- it drops `damage` when a creature is chosen
- it bumps the form's `key`, so `normalize()` sets the offer choice again

Adding goes through `reminderFromTemplate(form, { entityKey: subject || undefined, round })`,
where `round` is `encounter.round || 0`. That turns `in_rounds` into a fixed round and lets
the trigger decide `repeat`, exactly as the tracker drawer does. Saving an edit follows
`Reminder.vue`'s save:
1. `resolveTrigger(trigger, round)`
2. drop `repeat`
3. keep `entity_key` from the subject

Changing the subject of an existing reminder is allowed. It writes the same id with the new
`entity_key`.

The For list holds the encounter's entities (`encounter.entities`), sorted by name. Players'
entities have no `name` on the encounter, so their name comes from `campaign_players`, which
`index.vue` already loads (it is passed to the tab), as `Overview.vue` does. A reminder whose
`entity_key` isn't in the encounter is listed under "Unknown". That can't happen after
decision 4, but can in old data.

**4. Removing an entity's reminders happens in `delete_entity`.**
`encounters/delete_entity` already loads the encounter (`no_ghosts`). After deleting the
entity, it writes `null` for every reminder with that `entity_key`. It does this through
`save_encounter_reminder`, or one multi-path `updateEncounter` on `/reminders`. This covers:
- the edit screen's remove
- ghost removal in `get_encounter`
- the tracker's `remove_entity`, which already removed those reminders after they fired, so
  this finds nothing

Nothing fires, because firing is the tracker's.
- *Alternative:* removing them in `Overview.remove`. Rejected: ghosts would keep theirs.

**5. Not in the demo.**
`index.vue` adds the tab only when `!this.demo`, like Loot. `save_encounter_reminder`
already returns without a user.

**6. Reactivity of the list.**
`SET_ENCOUNTER_REMINDER` sets the reminder on the cached encounter with `Vue.set`. The tab
reads `encounter.reminders` from its prop. When `get_encounter` returns the cached object,
the list updates by itself. At apply, check that the prop is that object. If it isn't (a
fresh fetch before caching), the tab also sets or deletes the reminder on its prop after a
successful save.

## Risks / Trade-offs

- **[Risk]** A reminder about a creature added before combat with "in N rounds" counts from
  round 0. When the encounter was already running, it counts from the stored round.
  → This is the same rule as the tracker (`resolveTrigger` with the current round). The spec
  states it.
- **[Risk]** A test run marks reminders fired in memory only. A real run marks them in the
  database, and the tab then shows them as done.
  → Re-arm in the tab. Reset already clears `fired`.
- **[Trade-off]** The For select lists every entity, including players who may be swapped
  before combat. → Removing the entity removes its reminders (decision 4).

## Migration Plan

None: the stored shape and the rules are step 9's. Deploy with the app.
