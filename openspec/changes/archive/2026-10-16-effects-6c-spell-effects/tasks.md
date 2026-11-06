## 1. Schemas and rules

- [x] 1.1 Add `scaling` to `$defs/effect_link` in `src/schemas/hk-effects-schema.json` (tiers `{ level 1–20, value number, effect_level integer ≥ 0 }`, `level` and one of the others required). Verify with a scratchpad Ajv script: the spec's scaled link validates, a tier without `level` fails
- [x] 1.2 Add `effects` (`$ref` action_effects) to spell actions in `src/schemas/hk-spell-schema.json`, and keep `scaling` out of NPC action and trait links in `src/schemas/hk-npc-schema.json` (design 1). Verify with the scratchpad script: Hold Person and Magic Weapon spell fixtures validate, an existing spell without effects validates, an NPC action link with `scaling` fails
- [x] 1.3 In `../firebase_rules/firebase-rules.json` add the `effects` block with `scaling` on spell actions and remove the `effects` block under spell rolls (design 5). Verify the file parses, a scratchpad check of the block's keys, and `check-constants.mjs` passes

## 2. Engine

- [x] 2.1 Add `scaledLink(link, { scaling, spellLevel, castLevel, casterLevel })` to `src/utils/effectFunctions.js` (design 2). Verify with a scratchpad script against the spec scenarios: Magic Weapon 2024 (`spell_level`), Magic Weapon 2014 (`spell_scale`), a `character_level` cantrip, `none`, and a tier with only `effect_level`
- [x] 2.2 Make `cleanEffectLink` keep and clean `scaling` (design 4). Verify with the clean scratchpad script: tiers parsed, incomplete tiers dropped, an empty list removed, and earlier cases unchanged

## 3. Spell form

- [x] 3.1 Add `saveDcOptional` to `ApplicationDuration.vue`: an empty repeat-save DC is valid, shows "Caster's spell save DC", and leaves `dc` out (design 3). Verify `npm run lint` and the duration form scratchpad check (round trip without a DC)
- [x] 3.2 Create `hk-effects-form/LinkScalingInput.vue` (tiers labelled by the spell's scaling type, Value, Level for leveled effects, Add tier / remove, one tier for `spell_scale`). Verify `npm run lint` passes
- [x] 3.3 Add a `spell` prop to `ActionEffects.vue` and `EffectLinkForm.vue`: Scaling field when the spell scales, Magical on and the Concentration duration for new links, `saveDcOptional` and the action's save ability as the default save, "scales" in the summary. Verify `npm run lint` passes
- [x] 3.4 Show `ActionEffects` under each action's rolls in `src/components/spells/Actions.vue`, and clean action effects before saving in `src/views/UserContent/Spells/EditSpell.vue`. Verify `npm run lint`, and a scratchpad check that a cleaned spell fixture validates against the spell schema

- [x] 3.5 Align the spell form's actions with the NPC form (design 3b): one-line header (name · type · save ability · counts) with the counts from a helper shared with `npcs/Actions.vue`, "Action type" label, Save ability only for saves, the NPC rolls header. Verify `npm run lint`, and a scratchpad check that the header for the spec's Hold Person action is "Paralyze · Save · WIS · 1 effect" and the NPC headers are unchanged
- [x] 3.6 Add a Spell duration button to the link dialog's Duration select: `spellDuration(spell)` in `src/utils/effectFunctions.js` converts the spell's duration (also used by `newLink()`), and `ApplicationDuration.vue` takes it as a preset that sets type, value and unit and keeps the End effect options. Verify `npm run lint`, and a scratchpad check of `spellDuration` against the spec's scenarios

- [x] 3.7 Duration by slot level (design 4b): `duration_scaling` in the effects schema (only with `duration`), rejected on NPC action and trait links, in the spell rules; `cleanEffectLink`, `cleanTraitEffects` and `scaledLink` handle it; `LinkDurationScaling.vue` in the link dialog, Save blocked on an incomplete tier, "longer at higher levels" in the summary; docs updated. Verify with scratchpad checks (schemas, rules keys, clean, `scaledLink` against the Hex and Bestow Curse scenarios), `npm run lint` and `openspec validate --strict`

## 4. Import

- [x] 4.1 Confirm the spell import validates links through the effects schema (`ImportUserContent.vue` registers it). Verify with a scratchpad check using the same Ajv setup: a spell with a link imports as valid, one with a link without `effect` lists the schema error

## 5. Documentation and plan

- [x] 5.1 Update "Spell effects" in `src/docs/effects.md` (Effects on spell actions, the caster's DC for saves, the Scaling field per scaling type, Magical and Concentration defaults, an empty repeat-save DC). Verify every field it lists is in the dialog with the same label
- [x] 5.2 Add an "As built" note to step 6c of `.planning/effects-implementation-plan.md`, and add to step 7 that applying a spell link fills in the caster's spell save DC for a repeat save without one and uses `scaledLink`. Verify it matches the spec

## 6. Verification

- [x] 6.1 Run `npm run lint`, `validate.mjs`, `check-constants.mjs` and all scratchpad checks; all pass. Leave testing in the browser and deploying the rules to the user
