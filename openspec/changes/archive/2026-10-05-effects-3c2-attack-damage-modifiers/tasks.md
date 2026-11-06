## 1. Pure helpers

- [x] 1.1 `conditionState` / `evaluateConditionSet` with the counterpart subject, `is_caster`, and the assumed distance with assumptions (design decision 2). Verify in the scratchpad:
  - 5.5e Grappled against the grappler and against another target
  - Prone, melee and ranged
  - Paralyzed's incoming crit, melee and ranged
  - spell attacks → unknown
  - `can_see` → unknown
  - outside attacks: unchanged (`test-3c1.mjs` still passes)
  - `test-3c2.mjs` covers all of these. `test-3c1.mjs` passes apart from its rules cross-check, which waits for the new keys (task 3.1).
- [x] 1.2 `rollModifiers` for attack rolls: the attack part, the against perspective and the legacy `grant_*`, `attackTypeState`, manual `attack` keys, `critRange` / `critOnHit`. Then `attackModifiers` (decision 1). Verify in the scratchpad against the scenarios of:
  - "Attack rolls use the attacker's and the target's modifiers", including Guiding Bolt's consume entry and "Weapon-only modifier on a spell attack"
  - "Critical hits from effects": Paralyzed melee/ranged, Improved Critical as a custom definition
  - an area attack without a target
- [x] 1.3 `damageBonuses` (decision 4) and the `attack` / `damage` entries in `BONUS_LABELS` (`entityFunctions.js`). Verify in the scratchpad: Divine Favor (typed, weapon only), Magic Weapon (untyped), manual `damage`, a chosen damage type, and "Not for saves" (no attack type → none)

## 2. Rolling

- [x] 2.1 The store getter `attack_modifiers`. `roll_action` passes `attackerKey` / `targetKey`. `rollAction` uses the plan for the to-hit, crits (`crit` / `critOnHit`), consumes per to-hit, and appends the damage bonuses (decision 3). Verify in the scratchpad with the real dice mixin (as in `test-rollaction.mjs`, with stubbed getters):
  - Advantage merged with Shift
  - Bless dice in the total
  - natural 19 with crit range 19
  - critOnHit gives critical damage
  - (Added at the user's request) effect crits and damage bonuses follow the Critical Hits setting of the run encounter settings: Roll, Double, Max + Roll and Disabled, for both an incoming crit and a crit range. Verified in `test-3c2-roll.mjs`.
  - Guiding Bolt consumed once in a two-attack multiattack
  - the Divine Favor and Magic Weapon entries with `missSave: 0`
  - calls without an attacker unchanged
- [x] 2.2 Roll dialog (decision 5): hit and crit rules, crit naming, `on_crit` firing, to-hit notes and named damage entries. Verify by reading against the "Critical hits from effects" and "Damage bonuses are added to hits" scenarios, and that each Vue option appears once

## 3. Manual bonuses

- [x] 3.1 Rules: `attack|damage` in the three `$stat` regexes in `firebase_rules/firebase-rules.json`. Verify in the rules emulator: both keys accepted for players, companions and NPCs, and `attack_melee` rejected. The earlier emulator suites still pass.
- [x] 3.2 `StatBonuses.vue`: Attacks and Damage in the roll bonuses drawer, without stored or effective values, with the entity's own effect lines (decision 6). Verify by reading against "Attack bonuses in the drawer", and that each Vue option appears once

- [x] 3.3 (Added at the user's request) `actor/AttackReminders.vue`, in the details bar's filler (`actor/Details.vue`) for every actor. It replaces 2k's separate Reaction Used tag, which is now its first chip, in red, with the 55px left margin on lg/xl. First version: players only, in the dropdowns' place. Moved and widened at the user's request.
  - Advantage/Disadvantage, to-hit bonuses, crit, damage bonuses and the reminder count, as chips with tooltips
  - the single target's "against" modifiers are included

  Verify in the scratchpad (`test-3c2.mjs`, the attack modifiers without attack type, with and without a target), and by reading against "The actor's attack modifiers are shown in the details bar". Each Vue option appears once.

## 4. SRD test effects

- [x] 4.1 Guiding Bolt, Divine Favor, Magic Weapon, Dodge and Help in both editions' `effects.js` (decision 7). Verify that `validate.mjs` passes, and in the scratchpad that each resolves and gives the expected attack/damage modifiers
  - Found while verifying: `resolveDefinition` dropped the definition's `magical`, so the store's definitions never had it. That also meant 3c1's repeat saves against a magical effect never counted as magical. `magical` is now kept, and checked in `test-3c2.mjs`.

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify no new errors
- [x] 5.2 Run `openspec validate effects-3c2-attack-damage-modifiers --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app (upload the rules to the develop database first):
  - **Poisoned goblin attacks:** Disadvantage, naming Poisoned. Against a Blinded target: Advantage. Poisoned against Restrained: a normal roll.
  - **Prone target:** melee → Advantage with the "assumed within 5 ft" note. Ranged → Disadvantage. Spell attack → reminders.
  - **Paralyzed target, melee hit:** critical (named), with damage per your Critical Hits setting (try Roll and Max + Roll), and `on_crit` fires. Ranged: not critical. A melee miss: no damage.
  - **Bless on the attacker:** "Bless +1d4: n" in the to-hit
  - **Guiding Bolt on a target:** the first attack against it has Advantage and Guiding Bolt ends ("used"). The second attack of the multiattack is normal.
  - **Divine Favor:** a weapon hit adds a separate radiant roll, critical on a crit per the setting. A spell attack doesn't.
  - **Magic Weapon:** +1 to hit and +1 damage on weapon attacks only
  - **Dodge:** attacks against show the reminder. Dexterity saves have Advantage.
  - **5.5e Grappled goblin:** Disadvantage against others, not against its grappler
  - **Manual bonuses:** `attack` +1 and `damage` +2 in the roll bonuses drawer change the NPC's attacks, named in the result
  - **No attacker:** DoT rolls from effect prompts and area spells behave as before
  - **Details bar:** a blessed player with a Blinded goblin targeted shows a green A and a "To hit +1d4" chip after its name, with sources in the tooltips. A poisoned NPC with Reaction Used shows the red Reaction Used chip first, then a red D. Magic Weapon and Divine Favor show to-hit and damage chips, and the reminder count lists Prone's distance rules. Without effects, nothing is shown.

  Record the outcome here
  - 2026-10-05: user tested the whole 5.3 list in the app; no issues left. Changed during testing at the user's request:
    - crits follow the Critical Hits setting (unchanged code, verified and specced)
    - bonus dice inline in the to-hit line, the name cut off when short of space, single rolls capped at 300px, a 10px gap
    - attack reminders for every actor in the details bar, with Reaction Used first in red, and a green A / red D
    - the bonuses drawer's add form at the top

- [x] 5.4 After archiving, mark 3c2 (and so step 3c) done in `.planning/effects-implementation-plan.md` (step 3 notes and the Suggested Order). Verify the plan shows it
