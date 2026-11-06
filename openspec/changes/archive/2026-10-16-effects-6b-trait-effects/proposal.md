## Why

Some effects aren't applied with a duration: they're part of what a creature is, like a clay
golem's Acid Absorption, a zombie's Undead Fortitude or Magic Resistance. Today the DM applies
these by hand through the Effects drawer in every encounter, and they show up in the creature's
effects list as if something had been cast on it. Step 6 made effect links on NPC actions; this
step links always-active effects to the special abilities (traits) themselves. This is step 6b
of the effects plan ([effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
"6b. Trait effects" and "Generic effects").

## What Changes

- **Trait links on special abilities**: a `special_abilities` entry can carry `effects`, a list
  of effect links with the effect, its fixed choices and level, and no When or Duration. The
  golem's trait links the generic Absorption effect with acid fixed. This is separate from the
  effects of the ability's actions (step 6), so a trait can have both.
- **NPC form**: each special ability gets a **Trait effects** list (one line per link, like the
  action effects) with a dialog for Effect, Choices, Level and Magical, reusing step 6's link
  form without When and Duration.
- **Combat tracker**: trait effects of NPCs and companions work like applied effects: damage
  modifiers and defenses, roll modifiers, triggers and prompts, restrictions, drop to 1 hit
  point. They aren't stored on the creature in the encounter: the engine reads one list of the
  creature's applied effects plus its trait effects, built from its special abilities.
  - They have no duration, don't tick or expire, and can't be removed in the drawer.
  - A condition on the effect still switches them off (Evasion while Incapacitated).
- **Limited traits** (user decision): a trait effect that is used up (its sub-effect's
  `consume`, like a single-use reaction) counts a use on the ability's existing limit
  (`limit` / `limit_type`, the tracker's `limited_uses` counter). With a limit, the trait
  effect switches off while the uses are spent and comes back when they are reset; without a
  limit it isn't used up.
- **Companions too** (user decision): companions are NPCs, so their special abilities' trait
  effects work in the tracker the same way. Players are not part of this step.
- **Display**: trait effects aren't listed in the creature's effects or conditions on the card,
  in the drawer or in the live view. The special ability shows that it's automated (an icon
  with the linked effects in a tooltip). Prompts and notices name the ability ("Undead
  Fortitude"), as they already do.
- **Schema and rules**: `effects` on special abilities in `hk-npc-schema.json` and the NPC
  database rules, validated like step 6's links but without outcome lists and duration.
- **User documentation** (`src/docs/effects.md`, "Traits" and "Trait effects") brought in line.

## Capabilities

### New Capabilities
- `effects-trait-effects`: trait links on NPC special abilities, how the NPC form edits them,
  how the tracker treats them as always-active effects (switched off by conditions and spent
  limits), how they are shown, and how the schema and database rules check them.

### Modified Capabilities
- `effects-basic-effects`: two more basic effects, Advantage and Disadvantage on Skill Checks
  (skill choice), found missing while testing trait effects.

## Impact

- **Schemas**: `src/schemas/hk-npc-schema.json` (`effects` on special abilities, a list of
  `$defs/effect_link` without duration, from `hk-effects-schema.json`).
- **Engine**: `src/utils/effectFunctions.js` (one helper for applied plus trait instances,
  used by every loop over `entity.effects`), `src/store/modules/runEncounter.js` (definitions
  of trait links resolved at encounter start, getters, consuming a trait effect counts a
  limited use instead of removing it).
- **UI**: `src/components/npcs/Actions.vue` (Trait effects list on special abilities), the
  link list and form in `src/components/hk-components/hk-effects-form/`, the tracker's ability
  lists (automated marker), and the places that list a creature's effects (card, drawer, live
  view), which must not show trait effects.
- **Rules**: `../firebase_rules/firebase-rules.json` (separate repository).
- **Docs**: `src/docs/effects.md`.
- **Not touched**: players' features (later), applying action links from rolls (step 7), SRD
  monsters from the HK API (step 8c). No Firebase migration: `effects` on special abilities is
  optional.
