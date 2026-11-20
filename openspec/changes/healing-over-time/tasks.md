# Tasks

Verification is static (the validation command and throwaway scripts in the scratchpad);
running the app is left to Harm. Nothing is written to the HK API: Harm publishes the definition.

## 1. Definition

- [ ] 1.1 Write the Healing Over Time definition as JSON: `url: "healing-over-time"`, `name: "Healing Over Time"`, no `edition`, a description that the creature regains the chosen Hit Points at the start of each of its turns and that the amount is chosen when the effect is applied, and one `healing` sub-effect with `trigger: "start_turn_target"` and `choice: "roll"`, shaped like Damage Over Time; verify `scripts/validate-effects-data` passes on it together with the current API data
- [ ] 1.2 Check that the existing engine heals with it: a throwaway script that fixes `choices: { roll: { fixed_val: 10 } }` and `{ roll: { dice_count: 2, dice_type: 6 } }` on the definition and resolves its start-of-turn amount gives 10 and 2d6 healing, as the same script gives for Damage Over Time; if it doesn't, stop and report before changing engine code

## 2. Documentation

- [ ] 2.1 Add Healing Over Time next to Damage Over Time in `src/docs/effects.md` (How effects work): it asks for a roll, rolled at the start of each of the creature's turns, and fits a monster's Regeneration; verify the docs page text and `npm run lint`
- [ ] 2.2 Run `openspec validate healing-over-time` and verify it passes

## Workflow follow-up

- Harm publishes the definition to the HK API and tries an oni with a Regeneration trait link in the tracker.
- HK API, its own step: rebuild the parser skill's catalogue (`pnpm skill:catalogue`), add a Regeneration rule and benchmark case (Healing Over Time with the amount as a fixed roll), and re-parse the oni, troll, troll limb and vampire traits.
- Archive this change once implemented (`/opsx:archive`).
