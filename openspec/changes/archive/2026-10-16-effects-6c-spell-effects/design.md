## Context

See proposal.md for the motivation. Current state that shapes the approach:

- **Custom spells** (`hk-spell-schema.json`): `level`, `scaling` (`none`, `spell_scale`,
  `spell_level`, `character_level`), `duration_type` (`concentration`, `time`, …), `duration` +
  `duration_scale`, and `actions[i]` = `{ name, type, save_ability, rolls }`. Spell actions have
  no save DC: the caster's spell save DC is used when cast.
- **Roll scaling**: each roll has `scaling` tiers `{ level, dice_count, fixed_val }`, read through
  the spell's `scaling` (`__levelScaling__` in `dice.js`: `spell_scale` steps above the spell's
  level, `character_level` tiers; `spell_level` is described in `spellScalingDescription` but
  not applied to rolls). The editor is `hk-action-roll-scaling.vue` (dice-specific, with `+`
  buttons).
- **Spell form** (`src/components/spells/Actions.vue`, used by `EditSpell.vue`): actions are
  already collapse items with name, type, save ability and a rolls table.
- **Links** (steps 6/6b): `$defs/effect_link`, `ActionEffects.vue` (one-line list, with a `trait`
  mode) and `EffectLinkForm.vue` (When, Effect, Choices, Level, Duration via
  `ApplicationDuration`, Magical); `cleanEffectLink` / `cleanActionEffects`.
- **Rolling**: spells already roll through `rollAction` with `action_list = spell.actions`, so
  step 6's roll result lists their linked effects once actions carry `effects`.
- **Rules**: `spells/$uid/$spellId/actions/$actionIndex/rolls/$rollIndex/effects` exists (the
  NPC-style block, on the roll); the action itself has `$other: false`.

## Goals / Non-Goals

**Goals:**
- Spell links stored and edited like NPC action links, with scaling and spell defaults.
- One `scaledLink` function step 7 can call with the cast's slot and caster level.

**Non-Goals:**
- Applying links when casting (step 7), SRD spells (8d), fixing `spell_level` roll scaling.
- Scaling of anything but the value choice and level (no dice on links).

## Decisions

### 1. `effect_link.scaling`, tiers read through the spell's scaling type

`$defs/effect_link` gets `scaling`: an array of `{ level (1–20), value (number), effect_level
(integer ≥ 0) }`, at least `level` and one of the other two. The tier meaning comes from the
spell, not the link (user decision), so a spell's rolls and links scale the same way:
`spell_scale` → one step tier (increase per `level` slot levels above the spell's level);
`spell_level` → tiers by slot; `character_level` → tiers by caster level; `none` → ignored.
`value` replaces (tiers) or adds to (step) the link's fixed value choice; `effect_level` the same
for `level`.

- *Alternative*: a scaling mode on each link. Rejected: a spell has one scaling and its rolls
  already follow it; two modes on one spell would confuse.
- NPC links: `hk-npc-schema.json` adds `{ not: { required: ["scaling"] } }` next to the trait
  links' `duration` rule, for both action links and trait links. The NPC rules already reject it
  (`$other: false`).

### 2. `scaledLink(link, { scaling, spellLevel, castLevel, casterLevel })`

In `effectFunctions.js`. Returns a copy of the link with `choices.value` (string, as stored)
and `level` for the cast, and without `scaling`. A missing value choice or level isn't created
by a tier that only has the other part. Step 7 calls it when applying; 6c uses it in a
scratchpad check of the spec scenarios.

### 3. Spell mode in the link UI

`ActionEffects.vue` and `EffectLinkForm.vue` get a `spell` prop (`{ level, scaling,
duration_type, duration, duration_scale }`):
- **Scaling** field in the dialog when `spell.scaling` isn't none: a new
  `LinkScalingInput.vue` next to the link form, a list of tiers with the level label from the
  scaling type ("Every … slot levels" for `spell_scale` with one tier only; "From slot level";
  "From caster level"), Value, and Level when the definition has a level track. Tiers are added
  with an **Add tier** button in the field's label row and removed per tier, like the rolls'
  scaling editor (not reused: it's dice-specific).
- **Defaults** for a new link: `magical: true`; for `duration_type: "concentration"` a duration
  `{ type: "concentration", value: duration, unit: duration_scale }`.
- **Repeat save DC optional**: `ApplicationDuration` gets a `saveDcOptional` prop. With it, an
  empty DC is valid, shows the hint "Caster's spell save DC", and `durationFromForm` leaves `dc`
  out. `defaultSave` for a spell's save action is `{ ability: action.save_ability }`.
- The list summary shows "scales" when a link has scaling.

`spells/Actions.vue` adds `<ActionEffects :value="action" :spell="spell" :edition="spell.edition">`
under each action's rolls table.

### 3b. Spell actions aligned with NPC actions (user request)

`spells/Actions.vue` follows `npcs/Actions.vue`:
- **Header**: one line from a method like the NPC form's `actionHeader`: name, type label
  (`attack_types`), save ability abbreviation for saves, then "N rolls, N effects". The count
  part is shared with the NPC form: a small helper (`actionCounts(action)`) used by both, so the
  two headers can't drift.
- **Fields**: "Action type" label; the Save ability select only for type save (`v-if`, not
  `:disable`), like the NPC form.
- **Rolls header**: the NPC form's rolls header markup (label line, add button at the end).
- The action name field, the remove button and the rest of the spell form stay as they are.

### 4. Saving and import

`cleanEffectLink` keeps `scaling` (cleaned: tiers without `level` or without value/effect level
dropped, numbers parsed, an empty list removed). `EditSpell.vue` runs `cleanActionEffects` over
each action before saving, like `EditNpc.vue`. `ImportUserContent.vue` already adds the effects
schema to Ajv, so spells resolve their reference; a scratchpad check covers a spell fixture.

### 4b. Duration by slot level (user request, added during apply)

Spells like Hex, Hunter's Mark, Bestow Curse and the Dominate spells last longer with a higher
slot, and Bestow Curse drops Concentration at 5th level. `scaling` can't express that (it only
changes the value and level, read through the spell's scaling type, and Hex's scaling is
`none`). So a separate `effect_link.duration_scaling`:
`[{ level: <slot 1–9>, duration: { type: time | concentration | cancelled, value?, unit? } }]`,
allowed only with `duration` (a draft-07 `dependencies`), always read by slot level.
- A tier replaces only the type, value and unit; the repeat save, escape and early ends of the
  link's duration stay, like the Spell duration button.
- `scaledLink` picks the highest tier with `level <= castLevel` and drops `duration_scaling`;
  it does this whatever the spell's scaling type is.
- `cleanEffectLink` drops tiers without a level or type, a Time or Concentration value that
  isn't a positive whole number, the tiers when there's no duration, and an empty list.
  `cleanTraitEffects` deletes it, and the NPC schema rejects it like `scaling`.
- `LinkDurationScaling.vue` edits the tiers under the link's duration (only with a duration):
  From slot level, a Duration select (Time, Concentration, Until removed), value and unit for
  Time and Concentration. `ActionEffects` blocks Save on an incomplete tier, like
  `scalingIncomplete`, and the summary says "longer at higher levels".

### 5. Rules

On `spells/…/actions/$actionIndex`: the NPC action `effects` block (outcomes, links with effect,
duration, choices, level, magical) plus `scaling/$tierIndex` with `level` (1–20), `value`
(number −99..999), `effect_level` (0–99) and `$other: false`, and
`duration_scaling/$tierIndex` with `level` (1–9) and `duration` (`type`
time|concentration|cancelled, `value` 1–9999, `unit`), each with `$other: false`. The `effects` block under
`rolls/$rollIndex` is removed. `check-constants.mjs` finds the new duration regex under
`effects` automatically.

## Risks / Trade-offs

- [The roll-level `effects` rule is removed] → No spell stores effects there (nothing wrote it);
  removing it only tightens the rules.
- [Repeat save without a DC until step 7] → The drawer and engine expect a DC on applied repeat
  saves; step 7 must fill in the caster's spell save DC when applying a spell link. Noted in the
  plan's step 7.
- [`spell_level` roll scaling isn't applied by the dice code] → Links will follow `spell_level`
  in step 7 while rolls don't; noted as a separate fix, not part of 6c.

## Migration Plan

No migration: `effects` on spell actions and `scaling` on links are optional. Deploy the rules
with the app, otherwise saving a spell with links is rejected.
