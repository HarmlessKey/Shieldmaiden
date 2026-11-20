## Context

- `hk-single-roll.vue` lists each rolled action's linked effects (`linkedEffects`) with
  Applies / Doesn't apply / pending, from `hitOrMiss[index]` and `savingThrowResult[index]`.
  `apply(multiplier)` applies the damage (`setHP`), fires the roll triggers and the special
  events, and removes the card.
- `runEncounter.js` (mixin) `doRollAction` rolls an action or spell: for a spell it sets
  `action.action_list = action.actions` and `config.cast_level`, `caster_level` and `save_dc`
  (from the effective caster). An area roll is rolled once and copied to a card per target.
  `dice.rollAction` copies each action's `effects` onto the rolled action.
- The Effects drawer (`drawers/encounter/Effects.vue`) builds instances with
  `buildEffectInstance` and applies them with the store's `apply_effect` (immunity check,
  persistence, `on_apply` triggers). Concentration goes through `concentrationPlan` and the
  drawer's own `concentrateOn` (start, share, link or replace).
- `scaledLink(link, { scaling, spellLevel, castLevel, casterLevel })` (6c) returns the link for
  one cast, including Duration by slot level. `fixChoices` and `getRequiredChoices` know a
  definition's choices.
- Repeat saves are rolled in `EffectTriggerNotifier.vue` and `ActiveEffect.vue` without a
  source, so "against magic" modifiers can't apply.

## Goals / Non-Goals

**Goals:** apply the linked effects that apply with the roll, using the link and the cast, with
Concentration for spells, magical repeat saves, saves that wait for a hit, and captions that
show every action.

**Non-Goals:**
- Casting a Concentration spell without linked effects doesn't start Concentration.
- The damage of a save action after a missed attack is still applied as the DM chooses. Only
  its effects wait for the hit.
- Player attacks aren't rolled in the tracker, so their spells' links aren't applied (manual
  damage stays manual).
- `frequency` and `spell_level` roll scaling in `dice.js` (separate findings).
- Showing linked effects in stat blocks.

## Decisions

### 1. The roll knows the cast

`doRollAction` adds `cast` to every roll of a spell:
`{ spell: { key, name, level, scaling }, castLevel, casterLevel, saveDc }`. The spell is the
`action` it rolls (it carries `key` from the spell list). The caster is `roll.current`, already
set on each card. Monster actions have no `cast`.

### 2. `linkApplication(link, { cast, definition })`, a pure function

It turns a link into what gets applied:
`{ source, sourceKey, name, application: { duration, choices, level }, magical, openChoices }`.
- with `cast`: `scaledLink(link, { scaling, spellLevel, castLevel, casterLevel })` first
- a repeat save without a DC gets `cast.saveDc`
- `openChoices`: the definition's required choices (`getRequiredChoices`) that the link doesn't
  fix
- the duration is the link's, or undefined when it has none (the card asks)

It's testable without the component. The component merges the card's inline answers (choices,
duration) into `application` before building the instance.

### 3. Inline fields in the roll card

Card state `linkForms`, keyed `<action>:<outcome>:<link>`:
`{ checked: true, choices: {}, duration }`. Under a line that applies and is checked:
- a select per open choice (`choiceField`, the same options as the link form)
- for a link without a duration, `ApplicationDuration` (dense) starting at Until removed.
  The End effect select is part of it.

`linkMissing` says what a checked line still needs: an open choice left empty, or an
incomplete duration. While any line misses something, the Apply buttons are disabled, and a red
note under the line names it ("Choose a damage type for Protection from Energy, or uncheck it to
apply the roll"). A disabled button can't show a tooltip.

### 4. Applying: a store action used by the roll card and the drawer

`apply_linked_effects({ targetKey, casterKey, items, cast })`, where `items` is
`[{ source, sourceKey, name, definition, application, magical }]`:
- a Concentration duration → the plan below, then each instance links to that Concentration
- `buildEffectInstance` with the caster, round and turn; `magical: true` added when set
- `apply_effect` for each, so immunity, persistence and `on_apply` work as from the drawer

The drawer's `concentrateOn` moves into a store action, `concentrate_on({ casterKey, plan,
concentrationFor, duration })`, which both use. The drawer keeps its form and plans.

`apply(multiplier)` in the card calls it after `setHP` and `fireRollTriggers`, with the lines
that apply and are checked. The Missed button applies `on_miss` and `always` lines too.
A roll without damage or healing rolls (`!roll.actions.some((a) => a.rolls.length)`) shows a
single Apply button that calls `apply(1)`.

### 5. Concentration for a spell

For an item from a spell cast whose (scaled) duration is Concentration:
`concentrationPlan({ casterKey, concentration, effect: { source: "spell", source_key:
cast.spell.key, name: cast.spell.name }, unknownChoice: "link" })`. Same spell → share,
another → replace (its cascade ends the linked effects), unknown origin → link, none → start
(up to the duration's time). The plan is made once per apply, so Magic Weapon's two effects
share one new Concentration. A second card for the same cast finds the Concentration for the
spell and shares it. For a monster action, the effect itself is the `concentration_for`,
as in the drawer.

The alternative, the first effect as `concentration_for`, would make a spell's second effect
replace the first one's Concentration.

### 5b. Spells that only apply effects (user request at apply)

`applyOnlySpell(spell)` in `effectFunctions.js`: the spell has actions, none has rolls or is
an attack or save, and every link is on `always` (at least one). `RollSpells.vue` shows an
Apply button for it instead of `hk-roll-action`. Apply goes to a new mixin method
`apply_spell` in `mixins/runEncounter.js`, next to `roll_action`. It confirms restrictions, uses
the reaction and the slot, and builds the cast with the same config as `doRollAction` (shared in
a `spellConfig` helper). It builds the items with `linkApplication` and dispatches
`apply_linked_effects` once per target, so Concentration is shared across targets. When an item
has open choices, or its link has no duration, it calls `doRollAction` instead, and the roll card
asks for them.

### 6. Saves wait for the hit

In `linkedEffects`, an action of type save looks back to the nearest earlier action in the
same roll with a to-hit. A miss → `applies: false` with the label "Attack missed". Not chosen
→ pending "Hit or miss?". Otherwise it's its own result, as now.

### 7. Magical

The effects schema's `active_instance` gets `magical` (boolean), and the rules' three instance
blocks (encounter entities, campaign players, campaign companions) accept it.
`concentration_for.source` adds `spell` in the schema and rules. `check-constants.mjs` maps it
to a new `concentration_sources` export (the effect sources plus `spell`). The repeat-save
roll in `EffectTriggerNotifier.vue` passes `roll.source = { magical: true }` for a magical
instance. The detail view (`ActiveEffect.vue`) only rolls escapes, which are checks, so it
doesn't change.

### 8. Captions show every action

`RollActions.vue` and `CardActions.vue` loop over every entry of `action_list` in the caption
(skipping type other without rolls) with the markup they have now for the first one: the
to-hit, the rolls with their damage type icons, and the save ability and DC. Entries are
separated by " · ". Reach, range and area stay once, after the entries. The entries to show
come from one helper, `captionEntries(ability)`, in `generalFunctions.js`, next to
`actionCounts`.

## Risks / Trade-offs

- [Replacing Concentration without asking] The drawer asks before replacing; the roll replaces
  by itself, because casting a Concentration spell ends the previous one by the rules. A notice
  says which Concentration ended.
- [Data] `magical` and `concentration_for.source: "spell"` need the rules deployed with the
  app, otherwise applying a magical or spell effect is rejected.
- [Card size] Inline fields make a card taller; they only show for checked lines that apply and
  miss something.
