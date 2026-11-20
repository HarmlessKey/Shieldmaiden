## 1. Identifier and validator

- [x] 1.1 Rename the root `key` property to `url` in `src/schemas/hk-effects-schema.json` and update its description and the `condition_check.value` description (design decision 0). Leave `source_key` on `effect_ref` / `active_instance` as is. Verify with `grep` that the schema has no root `key` property and `source_key` is unchanged
- [x] 1.2 Change Concentration from `key: "concentration"` to `url: "concentration"` in `src/data/5e/effects.js` and `src/data/5.5e/effects.js`. Verify no `key:` remains in either file
- [x] 1.3 Create `scripts/validate-effects-data/validate.mjs` per design decision 8 (schema validation with Ajv; no `key` or duration fields; unique `url`s per edition across both files; `srd` refs on `includes` / `apply_effect` resolve to a `url` in the same edition; no `includes` cycles; conditions `url`s equal the 15-condition SRD set). Verify: `node scripts/validate-effects-data/validate.mjs` passes both `effects.js` files and reports the expected failures on the current, unmigrated conditions files (missing `url`s, duration fields, `Dying` / `Surprised`, `Exhaustion N`) and exits 1
- [x] 1.4 Check the failure path with a throwaway copy in the scratchpad that references a missing `url`. Verify the output names file, entry and missing `url` and the exit code is non-zero

## 2. 5e conditions

- [x] 2.1 Rewrite `src/data/5e/conditions.js` to the entry shape of design decision 1: add `url` and `category: "condition"`, drop `duration_type`, sort by `url`, convert legacy spellings per decision 7. Verify the 14 non-Exhaustion entries validate and descriptions are unchanged
- [x] 2.2 Replace `Exhaustion 1`–`6` with one `exhaustion` entry using the 2014 `min_level` rows and level track of decision 2. Verify by reading the entry against the "Level 3 is cumulative" and "Level 6 is death" scenarios
- [x] 2.3 Make Paralyzed, Petrified, Stunned and Unconscious `include` Incapacitated and Unconscious `apply_effect` Prone on `on_apply` (decision 3), keeping only rules beyond 2014 Incapacitated inline (speech, Speed 0, saves, attacks against, crits, Petrified defenses). Verify no copied `restrict` / `action`, `reaction` rows remain on these four
- [x] 2.4 Add the Grappled `ends_when` on the grappler (decision 5). Verify the validator passes for all 5e files

## 3. 5.5e conditions

- [x] 3.1 Rewrite `src/data/5.5e/conditions.js` to the entry shape of decision 1 with 2024 descriptions (decision 9), remove `Dying` and `Surprised`, convert legacy spellings. Check each entry against the HK API `/conditions/5.5e` text (read-only) and confirm every `url` matches the API's. Verify exactly the 15 SRD `url`s remain
- [x] 3.2 Replace `Exhaustion 1`–`6` with one `exhaustion` entry scaled by level (decision 2): −2 × level D20 Tests, −5 × level ft Speed, death at 6, no Disadvantage. Verify against the "Level 3 penalties" scenario
- [x] 3.3 Rewrite Incapacitated per decision 4 (no actions / Bonus Actions / Reactions, no speech, `restrict` / `concentration` "Concentration is broken", Disadvantage on Initiative). Verify the description no longer says Concentration is "broken only as normal"
- [x] 3.4 Make Paralyzed, Petrified, Stunned and Unconscious `include` Incapacitated, Unconscious `apply_effect` Prone on `on_apply`; drop the 2014 "can't move / speak falteringly" rules from Stunned. Verify against the "Paralyzed carries Incapacitated" and "2024 Stunned has no extra movement rule" scenarios
- [x] 3.5 Update Grappled (decision 5: `ends_when` on the grappler, Disadvantage on attacks vs anyone but the grappler) and Invisible (decision 6: Advantage on Initiative, Concealed, attack modifiers not vs a creature that can see it). Verify the validator passes for all 5.5e files

## 4. Close out

- [x] 4.1 Run `node scripts/validate-effects-data/validate.mjs` on the final data and verify it exits 0 with no problems. If the schema needed more than the `key` → `url` rename, record it in `design.md`
- [x] 4.2 Run `npm run lint` and verify no new errors in the changed files
- [x] 4.3 Update `.planning/effects-implementation-plan.md` ("Conditions are effects", 1b, 2e, step 5) and `.planning/effects-srd-catalogue.md` (§2, §5, §7) so the definition identifier reads `url` instead of `key`, keeping `source_key` wording. Verify `grep -n "key" ` on both files shows no remaining reference to a definition `key`
- [x] 4.4 Run `openspec validate effects-1b-srd-conditions-data --strict` and verify it passes
- [x] 4.5 After archiving, mark step 1b done in `.planning/effects-implementation-plan.md` (heading and Suggested Order) as `(done — archived as effects-1b-srd-conditions-data, <date>)`, and note the Unconscious → Prone `apply_effect` deviation in step 1b. Verify the plan shows 1b as done
