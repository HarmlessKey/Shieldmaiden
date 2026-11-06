## Context

- **Live view** (`src/components/trackCampaign/live/`): `index.vue` receives the broadcast
  `encounter`, the `campaign` and the DM's `players`, and reads the DM's `npcs/<dmId>` and
  share settings from Firebase. The DM's uid is the route's `userid`.
  - `Initiative.vue`: AC through `displayAc` (`src/mixins/trackEncounter.js`, stored value +
    `manualBonusTotal`), its own effect icons through `effectDisplayItems` (SRD names only,
    no definitions), and a popup listing all effects.
  - `Health.vue`: hit points with manual max HP bonuses, also used by `Turns.vue`.
  - There's no run-encounter store here, so no resolved definitions and no effective
    entities.
- **Tracker** (`src/store/modules/runEncounter.js`): `add_entity` builds each entity from the
  encounter, campaign, player, NPC or monster (async, store-bound). `effective_entity` =
  `effectiveEntity(entity, effectiveStats({ entity, holderKey, entities, definitionOf }),
  effectiveDefenses(...))`. These are pure functions in `src/utils/effectFunctions.js`.
  `effectiveStats` includes the manual bonuses (`manualBonuses`).
- **Definitions:** `resolve_effect_definitions` uses the pure `resolveDefinition({ source,
  sourceKey, lookup })`. SRD lookups use `findSrdDefinition(edition, url)`, and custom ones
  the signed-in user's effects.
- **Chips** (`src/components/combat/entities/effects/`): `index.vue` builds chip items from
  the store (`entity_effects`, `entities`). `Effect.vue` renders a chip and opens the
  ActiveEffect drawer on click. `describeDuration` and `effectBadge` are pure.
- **`EffectModifiedValue.vue`** marks a value and lists `effect_modifiers[field]`, or the
  `notes` passed in. It's only clickable with a `bonus` prop and a tracker entity.

## Goals / Non-Goals

**Goals:**
- One calculation for the tracker and the live view: the live view calls the same pure
  functions (`effectiveStats`, `effectiveEntity`) on entities built the same way.
- One chip component, with the store as one source of chip data among others.
- The tracker's behavior and look don't change.

**Non-Goals:**
- Refactoring `add_entity`.
- Defenses, roll modifiers or restrictions on the live view. Only AC, maximum hit points and
  the health bar are shown.
- Real-time updates of custom definitions edited during a session. They're read once per
  view.

## Decisions

### 1. Chip items from a pure helper; the component takes entries as a prop

Move the chip item mapping out of `effects/index.vue` into a pure
`effectChipItems(entries, { entityKey, holderName, casterOf })` in `effectFunctions.js`.
Each entry is `{ key, instance, definition }`, and `casterOf(instance)` returns
`{ name, label }` of the caster to show (the name for the duration text, the label for the
"from" line), or undefined.

`index.vue` gets two props:
- `effectEntries`: when set, it's used instead of the store's `entity_effects`
- `readonly`: passed to `Effect.vue`, which then doesn't open a drawer on click

The tracker passes neither, so it works as now: the store entries, and the caster name with
"(not in this encounter)".

*Alternative:* a separate live-view chip component. Rejected: the user wants the same
component, and a copy would drift.

### 2. Definitions in the live view: a resolver in `live/index.vue`

`live/index.vue` resolves the definitions of the instances it shows, once per
`source:source_key`, into a reactive map:
- the same `resolveDefinition` as the tracker
- SRD lookups: `findSrdDefinition(campaign.edition || "5e", url)`
- custom lookups: the effects service's `getEffect(dmId, id)` (`effects/<dmId>/<id>`),
  not the `effects` store module. That module caches the signed-in user's own effects,
  and the DM's must not end up there.

A read that fails, or returns nothing, gives `unresolved`. `effectiveStats` already skips
unresolved definitions, and the chip shows the stored name. New instances (an effect
applied mid-fight) are resolved when they appear, through a watcher on the instance refs.

*Alternative:* store a copy of the definition on each instance. Rejected (user decision):
that changes the instance storage and the rules, and old instances lack it.

### 3. Stats for the calculation: a pure helper that mirrors `add_entity`

A pure `effectSubject({ entity, campaignEntry, player, npc, monster })` in
`src/utils/entityFunctions.js` returns the fields that `effectiveStats` reads, taken from
the same sources as `add_entity`:
- `entityType`, `ac`, `maxHp`, the speeds and `initiative_modifier`
- the transformed values (`transformed`, `transformedAc`, `transformedMaxHp`)
- the ability scores, `saving_throws`, the skills, `level` / `experience` / `proficiency`
- the spellcasting fields
- `effects` and `bonuses` (`manualBonuses`)

Where the sources are:
- **Players:** `players[key]` and `campaign.players[key]`
- **Companions:** `npcs[key]` and `campaign.companions[key]`
- **Custom NPCs:** `npcs[entity.id]`
- **SRD NPCs:** the monster from `api_monsters/fetch_monster` (`{ id, edition }`), fetched
  once per NPC. The cache is shared and not user-specific.

NPC `ac` and `maxHp` come from the encounter entity, as in `add_entity`.

`live/index.vue` builds a `subjects` map (all active entities, hidden ones too, since a
hidden caster's stats can still feed a formula). It then computes
`effectiveEntities[key] = effectiveEntity(subject, effectiveStats({ entity: subject,
holderKey: key, entities: subjects, definitionOf }))`, and passes it to `Initiative` and
`Turns`.

*Alternative:* make `add_entity` call `effectSubject`. That's a better long-term
single source, but it's a risky refactor of a large store action. It's left for later and
noted in the plan. A comment in both places names the other.

### 4. AC and hit points from the effective entity

- **AC:** `displayAc` takes the effective entity. Its value is `transformedAc` when
  transformed, else `ac`. The stored value is in `effective.stored`, or the field itself
  when unchanged.
- **Hit points:** `Health.vue` takes an `effective` prop. The maximum is
  `effective.transformedMaxHp` / `effective.maxHp`; the current and temporary hit points
  stay as stored. Turns passes the same prop.
- **Visibility first:** the existing share checks decide whether a value renders at all.
  The effective value only replaces the number inside them.

### 5. Marking and tooltips

The AC value and the maximum hit points use `EffectModifiedValue` with `notes`:
- **Effects shown for that entity** (the same check as the effects cell): the notes are
  `effect_modifiers[field]` as "Name: text" lines, the tracker's tooltip.
- **Effects hidden:** one note with the net change, "Armor Class +2" or "Hit point
  maximum +5". This replaces today's "Armor Class + N" tooltip.

`changed` is `effective[field] !== stored`. The old green/red bonus color on AC is replaced
by the tracker's marking. The AC shield's contrast filter has to stay readable with it,
which is checked in the running app.

### 6. Caster name on live chips

`casterName(instance)` for the live view returns the name as `Name.vue` would show it, only
when the caster is in the encounter and either a player or companion, or an NPC that
isn't hidden and whose name setting (`displayNPCField('name', npc)`) is true. Otherwise it
returns undefined, and the tooltip has no "from" line. The tracker's version keeps the
stored `caster_name` fallback.

### 7. Remove `effectDisplayItems`

Once `Initiative.vue` uses the chips, `effectDisplayItems` has no callers. Remove it, along
with the live view's own effect icons, popup and `conditionCount`. Chip overflow uses the
cell width through `availableSpace`, like the tracker.

## Risks / Trade-offs

- **[The rules don't allow reading `effects/<dmId>`]** → Custom effects show by name only,
  and don't change values. Task: check the rules in the `firebase_rules` repo, and add a
  read rule like the one for `npcs/<uid>` if needed. The user uploads the rules.
- **[`effectSubject` drifts from `add_entity`]** → Comments in both places, and a scratchpad
  check that compares the effective AC and max HP of a fixture with what the tracker's
  getter gives.
- **[SRD monster fetch on the public view]** → One request per SRD NPC, cached by the shared
  monster cache. Without the monster, ability-based formulas are missing: those values
  stay as stored and are listed as not applied, as in the tracker.
- **[Recalculating per render]** → `effectiveEntities` is one computed map in `index.vue`,
  so it's recalculated only when its inputs change.
- **[A marked value reveals that a hidden NPC has effects]** → Marking only happens when
  the value itself is visible, and the tooltip then only shows the net change. Showing the
  number has the same effect, and the DM chose to show it.

## Migration Plan

No data migration. If the rules need a read rule for `effects/<uid>`, the user uploads the
rules before or together with the release. Without it, the live view shows custom effects
by name only. Rollback: revert the commit; no stored data changes.
