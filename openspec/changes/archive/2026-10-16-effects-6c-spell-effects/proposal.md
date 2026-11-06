## Why

Effects can be linked to NPC actions (step 6) and traits (step 6b), but not to spells: Bless,
Hold Person or Magic Weapon still have to be applied by hand from the Effects drawer, with
their duration and choices filled in every time. Linking was assumed under "steps 6–7" in the
plan but had no step of its own. This is step 6c of the effects plan
([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md), "6c. Spell
actions carry effects" and "Generic effects"; spell encodings in
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md)). As in step 6, the scope
is authoring and storage on the user's own spells; applying linked effects when a spell is cast
is step 7, and SRD spells from the HK API get their links in step 8d.

## What Changes

- **Spell actions carry effects**: every action of a custom spell (`actions[i]`) can have
  `effects` with the outcome lists of step 6 (`on_hit`, `on_miss`, `on_fail`, `on_success`,
  `always`). `on_fail` / `on_success` use the action's save ability and the caster's spell save
  DC; spells have no DC of their own.
- **Scaling on spell links** (user decision: follow the spell's scaling): a spell link can carry
  `scaling` tiers, read like the spell's own scaling type:
  - `spell_scale`: one step, a value increase per N slot levels above the spell's level
  - `spell_level`: tiers by slot level ("from a 3rd-level slot: value 2"), the 2024 Magic Weapon
  - `character_level`: tiers by caster level, for cantrips
  - none: no scaling.

  Scaling changes the link's fixed value choice and its level (for leveled effects); nothing
  else. Monster action and trait links don't offer it.
- **Spell form** (`src/components/spells/Actions.vue`): each spell action gets the **Effects**
  list of step 6, with a **Scaling** field in the link dialog when the spell scales. A new spell
  link starts **Magical**; for a Concentration spell its duration starts as Concentration with
  the spell's duration.
- **Spell form aligned with the NPC form** (user request): spell actions get the NPC form's
  one-line header ("Paralyze · Save · WIS · 1 effect"), the "Action type" label, the Save ability
  field only for saves, and the same rolls header.
- **Schemas and rules**: `effect_link` gains optional `scaling`; `hk-spell-schema.json` actions
  get `effects`; the NPC schema keeps scaling out of NPC links. The spell rules get the `effects`
  block on the action and lose the `effects` block that sits on each roll today.
- **Engine helper**: `scaledLink(link, { scaling, spellLevel, castLevel, casterLevel })` gives the
  link's choices and level for a cast, for step 7 to apply and for checks now.
- **Import** of spells validates the effects through the effects schema, as NPCs do.
- **User documentation** (`src/docs/effects.md`, "Spell effects") brought in line.

## Capabilities

### New Capabilities
- `effects-spell-links`: effect links on spell actions, link scaling following the spell's
  scaling type, the spell form's Effects lists and defaults, saving, the database rules and the
  import.

### Modified Capabilities
- `effects-action-links`: the effect link shape gains optional `scaling` (spell links only),
  so "a link SHALL NOT carry scaling" changes.

## Impact

- **Schemas**: `src/schemas/hk-effects-schema.json` (`$defs/effect_link.scaling`),
  `src/schemas/hk-spell-schema.json` (actions' `effects`), `src/schemas/hk-npc-schema.json` (NPC
  links without `scaling`).
- **UI**: `src/components/spells/Actions.vue`, `ActionEffects.vue` and `EffectLinkForm.vue`
  (spell mode with Scaling and defaults), a new link scaling editor next to them,
  `src/views/UserContent/Spells/EditSpell.vue` (cleaning links before saving).
- **Engine**: `src/utils/effectFunctions.js` (`scaledLink`, `cleanEffectLink` keeps `scaling`).
- **Import**: `src/components/userContent/ImportUserContent.vue` (already registers the effects
  schema; spell fixtures checked).
- **Rules**: `../firebase_rules/firebase-rules.json` (separate repository).
- **Docs**: `src/docs/effects.md`.
- **Not touched**: applying links when a spell is cast (step 7), SRD spells from the API (8d), roll
  scaling (`spell_level` scaling of rolls isn't applied by the dice code today; out of scope).
  No Firebase migration.
