## Context

- **Defense lists:** a creature's own defenses are lists on the entity: `damage_resistances`,
  `damage_vulnerabilities` and `damage_immunities` (damage types, with `non_magical_*` for
  "from nonmagical attacks"), and `condition_immunities`. `generalConstants.defenses` maps
  `v` / `r` / `i` to these lists.
- **Readers:**
  - the roll dialog's `resistances` computed (`hk-single-roll.vue`), from the `roll.target`
    snapshot, with per-roll overrides through `setDefense`
  - manual damage: `calculateManualDamage(manual, entity, multiplier, defense)`, called from
    `actions/Manual.vue` with the raw entity
  - `multipliers/Defenses.vue`: the manual defense buttons
  - the card (`CardDetails.vue` `full_entity`)
- **Effective values (3b):** `effectiveStats` → `effectiveEntity` adds `values`,
  `effect_modifiers` and `stored` to a copy. The store's `effective_entity(key)` wraps it.
- **Conditions** are applied through `apply_effect`, which already skips an SRD condition the
  target has. The drawer, the Conditions option, escalations and later steps all call it.

## Goals / Non-Goals

**Goals:**
- Effect `defense` sub-effects on damage, combined with the creature's own.
- Condition immunity that blocks applying, and ends a condition when an immunity is gained.
- Every damage path and the card use the effective defenses.

**Non-Goals:** see the proposal. Above all, `damage_modifier` (3g) and immunity through
included conditions.

## Decisions

### 1. Pure `effectiveDefenses`

`effectiveDefenses({ entity, holderKey, entities, definitionOf })` returns:
```js
{
  damage_resistances: [...], damage_vulnerabilities: [...], damage_immunities: [...],
  condition_immunities: [...],
  sources: { "r:fire": ["Protection from Energy"], "ci:poisoned": ["Petrified"], ... },
  reminders: ["Stoneskin: except silvered weapons"],
}
```
1. **Collect** the effect contributions per `kind:type` from active definitions. The
   same-definition rule, level limits, choices and `conditionState` (unknown → reminder,
   not applied) work as in `rollModifiers`.
   - `all_damage` expands to the plain damage types (`damage_types` without `non_magical_*`),
     minus `except_damage_types`
   - `bypass` maps bludgeoning, piercing and slashing to `non_magical_*`. With
     `silvered`/`adamantine` too, it adds a reminder.
   - `choice: "damage_type"` reads `instance.choices.damage_type`
2. **Combine** with the entity's own lists, per type key: `i` wins, `r` and `v` together
   cancel (the type is in neither list), else the one present.
   - Keys are compared as written, so `non_magical_slashing` and `slashing` stay separate.
     The dialog's existing check already reads both.
3. **Condition immunities:** the entity's own, plus effect `defense` `i` `conditions`.

### 2. In `effectiveEntity`

`effective_entity` calls `effectiveDefenses` and puts its four lists on the copy. It keeps
the originals in `stored` and the sources in `defense_sources`. Every reader that switches to
the effective entity gets the effect defenses. The stored entity is untouched.

### 3. Readers
- **`hk-single-roll.vue`:** `resistances` reads the effective target's defense lists,
  taken once when the dialog opens (`targetDefenses` in `data`). The DM's `setDefense`
  overrides are written into that computed's result, so it must not recompute on later
  store changes. Defenses gained after the roll opened therefore don't count; the DM can
  toggle them.
- **`actions/Manual.vue` and legacy `custom/Manual.vue`:** pass
  `effective_entity(key) || entity` to `calculateManualDamage`.
- **`multipliers/Defenses.vue`:** compute `defense` from the effective entity.
- **`CardDetails.vue`:** the lists come from the effective entity. An entry whose
  `defense_sources` has a source is wrapped in the 3b marker style (blue, tooltip with the
  effect names). The card only uses the effective entity when the entity is in the running
  encounter (`in_encounter`). Elsewhere it's unchanged.

### 4. Condition immunity in `apply_effect`
- **Before adding** an SRD condition: when `effective_entity(key).condition_immunities`
  includes its url, return without adding. Queue a notice prompt with
  `text: "<Name> is immune to <Condition>"` and `source` / `source_key` for the icon (as in
  2j).
- **After adding any instance:** compare the holder's SRD condition instances with its new
  `condition_immunities`. Remove each covered one with
  `remove_effect({ reason: "immune to <Condition>" })`. The instance that grants the
  immunity is never one of them, since it isn't a condition the creature is immune to.
- Exhaustion is a leveled condition: immunity blocks it like any other.

### 5. SRD test effects
- **Stoneskin:**
  - 5e: `defense` `r`, `damage_types` bludgeoning, piercing, slashing, `bypass: ["magical"]`
  - 5.5e: `defense` `r` to the three types, without bypass (2024: "Bludgeoning, Piercing,
    and Slashing damage")
- **Protection from Energy** (both editions): `defense` `r`, `choice: "damage_type"` and
  `damage_types: [acid, cold, fire, lightning, thunder]`.
  - `getRequiredChoices` today takes damage type options only from a roll's
    `damage_type_choice`. It's extended: a `damage_type` choice on a sub-effect with
    `damage_types` offers those as its options (intersected like other options).
  - In `effectiveDefenses`, a sub-effect with a damage type choice applies to the chosen
    type only (when it's one of its `damage_types`).

## Risks / Trade-offs

- **Resistance and vulnerability cancel per exact key**: a resistance to `non_magical_fire`
  doesn't exist, so in practice it only matters for physical types.
- **Ending conditions on immunity** is automatic and announced. The DM can re-apply after
  removing the immunity effect.
- **Monster condition immunities now block applying**, which is a behaviour change for
  existing tables. It follows the rules, and the notice explains it.

## Migration Plan

None. Data, schema and rules are unchanged.

## Open Questions

None.
