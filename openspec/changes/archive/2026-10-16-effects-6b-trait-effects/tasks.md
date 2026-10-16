## 1. Schema and rules

- [x] 1.1 Add `effects` to the special ability item in `src/schemas/hk-npc-schema.json`: an array of `effect_link` (by `$id` reference) without `duration` (design 1). Verify with a scratchpad Ajv script (effects schema added): the golem's Absorption link validates, a link with `duration` fails, an NPC without trait links validates, and an ability with both `effects` and action-list `effects` validates
- [x] 1.2 Add the trait link block to `special_abilities/$abilityIndex/effects/$linkIndex` in `../firebase_rules/firebase-rules.json` (design 7). Verify the file parses and a scratchpad check confirms `duration` and unknown keys fall under `$other: false`; run `check-constants.mjs` and verify it passes

## 2. Engine

- [x] 2.1 Add `traitInstances(entity, holderKey)` and `effectEntries(entity, holderKey)` to `src/utils/effectFunctions.js` (design 2: `trait:<ability>:<link>` keys, fixed choices and level, caster = holder, `trait` field, spent limited abilities left out, players none). Verify with a scratchpad script: a golem gets one Absorption instance with `choices.damage_type: "acid"`, a player gets none, a 3/day trait with 3 uses spent gets none
- [x] 2.2 Switch every engine loop over `entity.effects` in `effectFunctions.js` to `effectEntries` (activeDefinitions, hasCondition / condition checks, matchTriggers, effectiveStats, effectiveDefenses, rollModifiers, attackModifiers, damageBonuses, restrictions, damageModifiers, drop to 1 and the others found by searching `.effects`), and make `durationActions` skip `trait:` keys. Verify with a scratchpad script on an entity with only trait links: Absorption acid absorbs in `damageModifiers`, Magic Resistance gives Advantage in `rollModifiers` against a magical source, Evasion is off while Incapacitated, and `durationActions` returns nothing for trait keys; and list every remaining `.effects` read in the engine as display-only
- [x] 2.3 (As built: trait definitions are resolved in `add_entity`, which the encounter load and mid-encounter adds both use; an `effect_instance` getter finds applied or trait instances; the public initiative's `effectSubject` gets the NPC's special abilities and limited uses so effective values match.) In `src/store/modules/runEncounter.js`: include trait link refs in the definitions resolved at encounter start and when an NPC or companion is added (design 3); switch the store's engine-facing reads of `entity.effects` (fire_trigger, drop to 1, restriction and modifier getters…) to `effectEntries`; leave the display getters (`entity_effects`) on `entity.effects`. Verify `npm run lint` and a search that lists each remaining `.effects` read in the store as display or persistence
- [x] 2.4 Make `remove_effect` count a limited use for `trait:` keys when the ability has a limit (and announce it as used), and do nothing otherwise; make `set_effect_prop` ignore `trait:` keys (design 4). Verify with a scratchpad script of the key routing, and by reading the consume paths (`consume_roll_modifiers`, drop to 1's single-use path) that they reach `remove_effect`
- [x] 2.5 (As built: one `effectLabel(definition, instance)` helper names trait effects by their ability in the engine's modifiers and notes and in trigger prompts.) Make prompts and notices from a trait effect name the special ability (`instance.trait.ability_name`) where they show the effect's name. Verify by reading the prompt builders (EffectTriggerNotifier, drop to 1, trigger prompts) and a scratchpad check of the name used for a trait instance

## 3. NPC form

- [x] 3.1 Add a `trait` mode to `EffectLinkForm.vue`: no When and Duration, every choice required (no "Chosen when applied" placeholder). Verify `npm run lint` passes
- [x] 3.2 Add a `trait` mode to `ActionEffects.vue`: links in `value.effects` as an array, no When column, "No trait effects" when empty, dialog in trait mode. Verify `npm run lint` passes
- [x] 3.3 Show the Trait effects list for `special_abilities` in `src/components/npcs/Actions.vue`, after the Actions list under a **Trait effects** label. Verify `npm run lint` and that `Actions.vue` keeps one block per component option
- [x] 3.4 Add `cleanTraitEffects(list)` to `effectFunctions.js` (links cleaned with `cleanEffectLink`, `duration` dropped, empty list → undefined) and call it from `EditNpc.vue` for every special ability before saving. Verify with a scratchpad script that the result validates against the NPC schema

## 4. Tracker display

- [x] 4.1 Show the automated marker (icon + tooltip naming the linked effects and fixed choices) on special abilities with trait links in `CardActions.vue` and `RollActions.vue` (design 6). Verify `npm run lint` passes
- [x] 4.2 Confirm trait effects stay out of the card's effect chips, the drawer's applied list and the live view: they read `entity.effects`, which never holds trait instances. Verify by reading each place and a search for `effectEntries` in display code (none)

## 5. Documentation and plan

- [x] 5.1 Update "Traits" and "Trait effects" in `src/docs/effects.md` (fields and labels, all choices fixed, NPCs and companions, conditions switch them off, limited traits count uses, shown on the ability not in the effects list). Verify every field it lists is in the trait link dialog with the same label
- [x] 5.2 Add an "As built" note to step 6b of `.planning/effects-implementation-plan.md`, record the two open questions as decided (limited uses on the ability's limit; companions yes, players later) and move "players' features" to a later step. Verify it matches the spec

## 5b. Found while testing

- [x] 5b.1 Add the basic effects Advantage on Skill Checks and Disadvantage on Skill Checks (skill choice) to `src/data/effects.js`, next to the ability-check ones, and list them in the docs' basic effects. Verify `validate.mjs` passes and a scratchpad check: a trait linking Advantage on Skill Checks with Arcana gives Advantage on an Arcana check and not on a History check

## 6. Verification

- [x] 6.1 Run `npm run lint`, `node scripts/validate-effects-data/validate.mjs`, `check-constants.mjs` and the scratchpad checks; all pass. Leave testing in the browser and deploying the rules to the user
