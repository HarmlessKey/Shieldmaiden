## 1. Display helpers

- [x] 1.1 Add `describeDuration(instance, { casterName, holderName })` and `effectBadge(instance)` to `src/utils/effectFunctions.js` (design decision 1). Verify with a scratchpad script against every tooltip and badge scenario in `specs/effects-display/spec.md` ("Until removed", "7 rounds left", "1 round left", "Concentration, up to 1 hour", "Until the start of Goblin's next turn", "Until the end of its next turn", "Until the end of this turn", an unknown type, Exhaustion level badge, no badge for `cancelled`)

## 2. Chips

- [x] 2.1 In `src/components/combat/entities/effects/index.vue`, add the `effects` prop and the "no flag = all kinds" filtering, and build effect items from `entity_effects` (design decision 2). Verify by reading: the `conditions`-only and `reminders`-only callers produce exactly today's lists, and effect items come after reminders and conditions
- [x] 2.2 In `Effect.vue`, render effect items (condition icon or generic icon with initial, badge, tooltip lines for duration and caster) and open `drawers/encounter/effects/ActiveEffect` with `{ entityKey, effectKey }` on click. Legacy items keep their drawers (design decision 3). Verify with lint and by reading against the "Active effects are shown on combatants" and "Chips show a badge and a tooltip" scenarios
- [x] 2.3 In `src/components/drawers/encounter/Effects.vue`, pass `effects` to the target-list `<Effects>` (design decision 6). Verify the Conditions and TargetReminders drawers are unchanged

## 3. Detail view

- [x] 3.1 Extend `src/components/drawers/encounter/effects/EffectDetails.vue`: add " (from <name>)" to sub-effects with `from`, plus the optional `url` and `showExhaustionTable` (default true) props (design decision 5). Verify the 2a drawer's usage renders as before
- [x] 3.2 Create `src/components/drawers/encounter/effects/ActiveEffect.vue` (design decision 4): entity, name/icon, duration, applied round, caster (or "not in this encounter"), choices, repeat save, the interactive Exhaustion table (setting a level via `apply_effect`, "Remove" via `remove_effect`), `EffectDetails`, the Remove button hidden for `cancelable: false`, and the "no longer active" state. Verify with lint and by reading against the "Clicking an effect opens its detail view", "Effects can be removed from the detail view" and "Exhaustion level can be changed from the detail view" scenarios; each Vue option appears once

## 4. Close out

- [x] 4.1 Run `npm run lint` and verify no new errors in the changed files
- [x] 4.2 Run `openspec validate effects-2f-show-active-effects --strict` and verify it passes
- [x] 4.3 Ask the user to verify in the running app: effect chips on tracker rows and the entity card next to legacy chips (a condition icon for Prone, the generic icon plus letter for a custom effect or Concentration), the Exhaustion and timed badges, the tooltips (duration and caster), overflow into "+N"; the Effects drawer target list shows only effect chips while the Conditions/Reminders drawers are unchanged; the detail view for Paralyzed shows "from Incapacitated" lines, the repeat save and choices, Remove works and closes it, and the Exhaustion table changes the level and removes at the Remove row; a carried-over player effect shows its caster as "not in this encounter". Record the outcome here
  - 2026-09-29: user verified in the app: it works
- [x] 4.4 After archiving, mark step 2f done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-2f-show-active-effects, <date>)`. Verify the plan shows 2f as done
