## 1. Engine

- [x] 1.1 Add `hitTakenDamage(sub_effect)` to `src/utils/effectFunctions.js` (design 1). Verify with a scratchpad script: Hex, both Hunter's Marks and a filterless custom `on_hit_taken` damage are true; one with `target: "trigger_source"`, a `save`, a `frequency`, `natural_roll`, `within` or `by: "enemy"` is false, and so is a `damage` sub-effect on `start_turn_target`
- [x] 1.2 Make `damageBonuses` add the target's hit-taken damage (design 2). Verify with the scratchpad script against the spec's scenarios: Hex by its caster (1d6 necrotic "Hex"), Hex by someone else (none), 5e Hunter's Mark with a weapon attack (1d6 without a damage type) and with a spell attack (none), the trigger_source effect (none); and the attacker's Divine Favor bonus unchanged

## 2. Prompts

- [x] 2.1 Mark the `on_hit_taken` event of an applied attack roll with `fromAttackRoll` in `hk-single-roll.vue`, and leave the sub-effects `hitTakenDamage` accepts out of that prompt in `fire_trigger` (design 3). Verify with a scratchpad check of the filtering on Hex (no prompt) and the natural-20 custom effect (prompt kept), and `npm run lint`

- [x] 2.2 Add `prompt_hit_taken_damage` and dispatch it per target after manual damage in `Manual.vue` (design 5). Verify with a scratchpad check of the prompt built for Hex by its caster (one prompt, "if it was a hit with an attack roll", Roll data), none for another dealer, and `npm run lint`
- [x] 2.3 Add `hitTakenDamageLines` and show it in `AttackReminders.vue`: the targeted creature's lines in the Damage chip, the others as reminders (design 4). Verify with a scratchpad check of the lines for the Hexed-target and not-targeted scenarios, and `npm run lint`

## 3. Documentation and plan

- [x] 3.1 In `src/docs/effects.md`, describe that damage an effect deals when its holder is hit by the attacker (Hex, Hunter's Mark) is rolled with the attack, and which kinds stay a prompt. Verify it matches the spec
- [x] 3.2 Add step 3i to `.planning/effects-implementation-plan.md` (found while testing 6c, what it changes, decided: roll with the attack, separate change). Verify the heading and the Suggested Order line mention it

## 4. Verification

- [x] 4.1 Run `npm run lint`, `openspec validate effects-3i-hit-taken-damage --strict` and the scratchpad checks touching `damageBonuses` and triggers; all pass. Leave testing in the browser to the user
