## 1. Concentration definitions

- [x] 1.1 Rewrite Concentration in `src/data/5.5e/effects.js` per design decisions 1, 2 and 4: 2024 `description` (another Concentration spell, damage save with DC max 30, Incapacitated, death); `ends_when` `has_condition: "incapacitated"`; `damage_taken` sub-effect `outcome/break_concentration` with `save: { ability: "constitution", dc: { formula: "damage_taken / 2", min: 10, max: 30, round: "down" } }`; `on_zero_hp` sub-effect `outcome/break_concentration`. Verify by reading the file against the spec scenarios (DC 10 at 13 damage, 22 at 45, 30 at 80)
- [x] 1.2 Apply the same structure to Concentration in `src/data/5e/effects.js` without `max` on the DC and with 2014 wording (decision 3). Verify the DC formula yields 40 at 80 damage and that both files use `key: "concentration"`
- [x] 1.3 Validate both files against `src/schemas/hk-effects-schema.json` with a throwaway Ajv script in the scratchpad (Ajv is already a devDependency). Verify: zero errors, no `duration_type` / `duration_value` / `cancel_trigger`. If `outcome` + `save` fails validation, switch to `special/descriptive` + `save`, re-validate, and note the fallback in `design.md`
- [x] 1.4 Run `npm run lint` and verify no new errors in the two data files

## 2. 5.5e monster effect scan

- [x] 2.1 Create `scripts/monster-effect-scan/scan.mjs` (Node ESM, built-in `fetch`, no new dependencies) that fetches every monster from `https://api.harmlesskey.com/monsters/5.5e`, scans all action-list fields, and prints markdown tables for the categories in design decision 5. Verify it runs with `node scripts/monster-effect-scan/scan.mjs` and reports 330 monsters
- [x] 2.2 Spot-check at least 3 hits per category against the source monster text and tighten regexes with false positives. Verify the headline counts are close to plan §0a (198 Failure / 113 Success / 24 Failure-or-Success, 180 "has the X condition", 39 escape DCs, 41/31 next-turn anchors, 14 end-of-turn repeat saves, 18 Bloodied, 21 Trigger/Response) or explain any difference
- [x] 2.3 Add a `## 5.5e (2024) corpus` section to `.planning/monster-actions-effect-scan.md` with the run date, API source, monster/entry counts, the tables, and a methodology note naming the committed script. Leave the 2014 section unchanged. Verify the document renders and the 2014 section diff is empty
- [x] 2.4 If counts differ from plan §0a, update the numbers in `.planning/effects-implementation-plan.md` §0a. Verify §0a matches the new report

## 3. Close out

- [x] 3.1 Run `openspec validate effects-0-55e-alignment --strict` and verify it passes
- [x] 3.2 After archiving, mark step 0 done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-0-55e-alignment, <date>)`, noting that 0b.2 is delivered by steps 2a/2e. Verify the plan shows step 0 as done
