## 1. Drawer

- [x] 1.1 In `src/components/drawers/encounter/Effects.vue`, wrap the + button's action in a `q-menu` holding `ApplyEffect` (same props and `@apply` / `@cancel` as the inline form had, including 2h1's `concentration-key` / `caster-name`). Load a custom definition before showing the form. Apply closes the menu; Cancel and clicking outside close it. Verify with lint and by reading against the "Click opens the form", "Apply from the popover" and "Cancel" scenarios
- [x] 1.2 Shift+click on + applies directly with `{ duration: { type: "cancelled" } }`: effects with required choices open the popover instead, and Exhaustion applies the default level. Set the tooltip to "Apply (shift+click: until removed)". Verify against the three shift+click scenarios
- [x] 1.3 Remove the inline "Apply with options" button and form from the expanded entry, along with any state only they used (e.g. `applying`). Keep `EffectDetails`. Verify against "Expanding shows details only", and that each Vue option appears once

## 2. Close out

- [x] 2.1 Run `npm run lint` and verify no new errors
- [x] 2.2 Run `openspec validate effects-2a1-apply-popover --strict` and verify it passes
- [x] 2.3 Ask the user to verify in the running app: + opens the popover (a select inside it opens and works, Apply applies and closes, clicking outside cancels); shift+click applies until removed; shift+click on an effect with a choice opens the popover; shift+click on Exhaustion raises the level; expanding shows details only. Record the outcome here
  - Outcome (2026-09-30): verified by the user in the running app, all checks work
- [x] 2.4 After archiving, add a note to step 2a in `.planning/effects-implementation-plan.md`: "+ opens the application popover, shift+click applies until removed (archived as effects-2a1-apply-popover, <date>)". Verify the note is there
