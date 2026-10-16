## 1. Data and rules

- [x] 1.1 Add `magical` (boolean) to `$defs/active_instance` and `spell` to `concentration_for.source` in `src/schemas/hk-effects-schema.json`; add a `concentration_sources` export to `src/utils/effectsConstants.js` and map it in `check-constants.mjs`. Verify `node scripts/validate-effects-data/validate.mjs` and `check-constants.mjs` pass, and a scratchpad Ajv check: an instance with `magical: true` and a spell `concentration_for` validates, `magical: "yes"` doesn't
- [x] 1.2 In `../firebase_rules/firebase-rules.json`, accept `magical` (boolean) and `concentration_for.source` `spell` in the three instance blocks (encounter entities, campaign players, campaign companions). Verify the file parses and a scratchpad check of the three blocks' keys and regexes

## 2. Engine

- [x] 2.1 Add `linkApplication(link, { cast, definition })` to `src/utils/effectFunctions.js` (design 2). Verify with a scratchpad script against the spec: Magic Weapon at 4th (value "2"), Hex at 3rd (8 hours), Hold Person's repeat save DC 15, a fixed choice, an open choice listed, no duration → undefined, `magical` carried
- [x] 2.2 Saves wait for the hit in `linkedEffects` of `hk-single-roll.vue` (design 6), with the logic in a pure helper in `effectFunctions.js`. Verify with the scratchpad script: claws missed → "Attack missed", not chosen → "Hit or miss?", hit + fail → applies

## 3. Applying

- [x] 3.1 Add `cast` to spell rolls in `src/mixins/runEncounter.js` (design 1). Verify `npm run lint` and a scratchpad check that a spell roll config builds the expected `cast`
- [x] 3.2 Move the drawer's `concentrateOn` into a store action `concentrate_on` and add `apply_linked_effects` (design 4, 5) in `src/store/modules/runEncounter.js`; the drawer uses `concentrate_on`. Verify with a scratchpad check of the store actions (mock context): Magic Weapon's two effects share one new Concentration for the spell, a second card shares it, Bless is replaced, a Bestow Curse Time tier starts none, an immune target is skipped
- [x] 3.3 In `hk-single-roll.vue`: checkboxes on lines that apply, inline open choices and duration (design 3), Apply disabled with a note while a choice is missing, applying with the roll's buttons, and a single Apply for rolls without damage or healing. Verify `npm run lint`
- [x] 3.4 Repeat saves of a magical instance roll as saves against magic in `EffectTriggerNotifier.vue` (design 7; the detail view only rolls escapes). Verify `npm run lint` and a scratchpad check that `rollModifiers` gives Magic Resistance's Advantage for `source: { magical: true }`

- [x] 3.5 Spells that only apply effects get an Apply button (design 5b): `applyOnlySpell` in `effectFunctions.js`, `apply_spell` (with a shared `spellConfig`) in `mixins/runEncounter.js`, the button in `RollSpells.vue`. Verify `npm run lint` and a scratchpad check of `applyOnlySpell` (Aid and Bless yes; a save action, a roll, an on_fail link, no links → no)

## 4. Captions

- [x] 4.1 Add `captionEntries(ability)` to `src/utils/generalFunctions.js` and show every entry in `RollActions.vue` and `CardActions.vue` (design 8). Verify `npm run lint` and a scratchpad check of `captionEntries` for the bite with an attack and a save entry, and for an entry of type other without rolls

## 5. Documentation and plan

- [x] 5.1 Update `src/docs/effects.md`: applying linked effects from the roll (checkboxes, inline fields, Apply), spells (scaling, DC, Concentration for the spell), saves after a hit, magical saves; and remove "not applied yet" wording. Verify every label it names matches the roll card
- [x] 5.2 Add an "As built" note to step 7 in `.planning/effects-implementation-plan.md`. Verify it matches the spec

## 6. Verification

- [x] 6.1 Run `npm run lint`, `validate.mjs`, `check-constants.mjs`, `openspec validate effects-7-apply-linked-effects --strict` and all scratchpad checks; all pass. Leave testing in the browser and deploying the rules to the user

## 7. Manual testing (user, in the browser, after the rules are deployed)

- [x] 7.1 A bite with an On a hit Grappled link that hits: applying gives Grappled with the biter as the caster; unchecking Grappled applies only the damage
- [x] 7.2 Hold Person against a goblin that fails: the card shows one Apply button; applying gives Paralyzed with a repeat save at the caster's spell save DC and starts a Concentration for Hold Person
- [x] 7.3 Magic Weapon cast with a 4th-level slot: the Attack Roll Bonus has value 2, and both linked effects share one Concentration for Magic Weapon
- [x] 7.4 An area spell with an On a failed save link against three targets: applying each card only gives the effect to the targets that failed
- [x] 7.5 The ghoul's claws (attack, then a save with Paralyzed): on a miss the line shows "Attack missed" and nothing is applied; on a hit and a failed save Paralyzed is applied
- [x] 7.6 A link with an open choice (Protection from Energy): the select shows under its line, Apply is disabled with a note until it's chosen, and the chosen type is applied
- [x] 7.7 A link without a duration: the duration field starts at Until removed, and the chosen duration is applied
- [x] 7.8 Hex cast with a 3rd-level slot lasts up to 8 hours; Bestow Curse with a Time tier cast at 5th level starts no Concentration
- [x] 7.9 Casting Hold Person while concentrating on Bless ends Bless's Concentration with a notice, and Bless ends on its targets
- [x] 7.10 A creature with Magic Resistance gets Advantage on the repeat save of a Paralyzed applied by Hold Person
- [x] 7.11 A target immune to the linked condition: the damage is applied, the condition is skipped with the immunity notice
- [x] 7.12 The tracker's action list and the entity card show both actions of a bite with a poison save, separated by " · "
- [x] 7.13 A custom Aid (one action of type other, an Always link) has an Apply button instead of the roll button; with three allies targeted, Apply uses the slot and gives all three Aid without a roll card; a Concentration spell like Bless shares one Concentration across the targets
