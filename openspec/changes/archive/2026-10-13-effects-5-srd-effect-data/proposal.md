## Why

The SRD effects live in two copies, `src/data/5e/effects.js` and `src/data/5.5e/effects.js`,
and most entries exist in both. Effects that have nothing to do with an edition (a +2 AC
bonus, a resistance, Reaction Used) have to be kept twice. There are also no ready-made
basic effects: a DM who wants to give a creature +1 AC or resistance to fire mid-combat has to
build a custom effect first. Step 4 made definitions generic and added choices (including a
value choice), so the SRD data can now offer a small set of basic effects that are completed
when they're applied. This is step 5 of the effects plan
([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
"5. SRD effect data files" and "Generic effects"; encodings from
[effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §5).

## What Changes

- **One SRD effects file with an `edition` prop**: `src/data/5e/effects.js` and
  `src/data/5.5e/effects.js` are merged into `src/data/effects.js`.
  - An entry that follows one edition's rules text (Haste, Bless, Concentration, Rage…) has
    `edition: "5e"` or `edition: "5.5e"` and is only used in campaigns of that edition. The
    two versions of the same effect keep sharing one `url`.
  - An entry without `edition` is used in both editions. It may not share its `url` with an
    edition-specific entry.
  - The schema gets an optional root `edition` property (`"5e"` | `"5.5e"`).
  - Conditions stay in `src/data/5e|5.5e/conditions.js`: they are all edition-specific.
  - Reaction Used becomes a single entry without `edition`.
- **Items and plain-bonus spells are basic effects** (added after review): Gauntlets of Ogre
  Power, Ioun Stone (Strength), Robe of the Archmagi, Aid, Barkskin, Fly, Longstrider and Shield
  of Faith are no longer SRD effects. They are a basic effect with the number fixed by the link
  to the spell or item (steps 6–7).
- **Removed urls break** (testing phase, user decision): stored instances of removed effects
  (`acid-absorption`, the items and spells above) become unresolved references. No aliases.
- **Basic effects without an edition**: a set of generic effects that take their details from
  choices when applied, so a DM can apply common bonuses in two clicks:
  - bonuses with a value choice: Armor Class, attack rolls, damage rolls, saving throws,
    initiative, Speed, spell save DC, spell attack, passive Perception, Hit Point maximum
  - bonuses with two choices: saving throws of one ability (ability + value), ability checks
    of one ability (ability + value), one skill (skill + value), an ability score (ability +
    value)
  - minimums and set values: Armor Class Minimum, Ability Score Minimum (ability + value), Fly
    Speed
  - Advantage and Disadvantage on the saves or checks of a chosen ability, and on attack rolls
  - defenses with a damage type choice: Damage Resistance, Damage Vulnerability, Damage
    Immunity, and Damage Reduction (damage type + value)
  - **Absorption** (damage type choice) replaces Acid Absorption
- **More than one choice per sub-effect**: a sub-effect's `choice` may be one kind or a list of
  kinds (`choice: ["skill", "value"]`). The engine, the application form in the drawer and the
  custom effect form handle both. A single string keeps working.
- **Fixing choices**: `fixChoices` fills a definition's choices with fixed values, for steps
  6–7 when a link fixes a choice (a clay golem's Absorption is acid).
- **New edition-specific SRD effects** from the catalogue: Hex, Hunter's Mark, Warding Bond and
  Rage, for each edition whose SRD has them. Rage's damage bonus is a value choice, since the
  definition can't know the barbarian's level.
- **Validation** (`scripts/validate-effects-data`) reads the merged file and checks each
  edition's set: the entries without `edition` plus that edition's entries. The constants
  check reads the same file.
- **User documentation** (`src/docs/effects.md`): basic effects, choices with two kinds, and
  the edition rule for SRD effects.

## Capabilities

### New Capabilities
- `effects-basic-effects`: the edition-neutral basic effects (bonuses, Advantage /
  Disadvantage, defenses, Absorption) and the choices each one asks for.

### Modified Capabilities
- `effects-srd-data`: SRD effects move to one file; entries carry `edition` when they follow
  one edition's rules and no `edition` when they apply to both; url uniqueness and reference
  checks are per edition set; Acid Absorption becomes Absorption; items and plain-bonus spells
  become basic effects; Surprised, Hex, Hunter's Mark, Warding Bond and Rage are added.
- `effects-runtime-resolution`: SRD lookup selects the entries without `edition` plus the
  campaign edition's entries; removed urls are unresolved.
- `effects-drawer`: the application form asks for every kind of a multi-kind choice, and
  the SRD effects list includes the edition-neutral entries.
- `effects-authoring`: the Choice field can hold more than one kind; the constants check
  reads the merged SRD effects file.

## Impact

- **Data**: new `src/data/effects.js`; `src/data/5e/effects.js` and
  `src/data/5.5e/effects.js` are removed.
- **Schema**: `src/schemas/hk-effects-schema.json` root `edition`; sub-effect `choice`
  becomes string or array of strings.
- **Engine**: `src/utils/effectFunctions.js` (`SRD_DEFINITIONS`, `getSrdDefinitions`,
  `findSrdDefinition`, `getRequiredChoices`, every `sub_effect.choice` check, `fixChoices`
  for steps 6–7).
- **UI**: `src/components/drawers/encounter/effects/ApplyEffect.vue` (choices),
  `src/components/hk-components/hk-effects-form/` (`SubEffect.vue`, `SubEffectField.vue`,
  `fieldControls.js`, `configurationSummaries.js`).
- **Scripts**: `scripts/validate-effects-data/validate.mjs`, `check-constants.mjs`.
- **Docs**: `src/docs/effects.md`.
- **Stored data**: no Firebase migration. Instances keep `source: "srd"` and their
  `source_key`; the HK API is not touched (step 8b will serve this file, edition-aware).
