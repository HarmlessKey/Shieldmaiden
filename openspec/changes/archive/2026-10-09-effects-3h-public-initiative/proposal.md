## Why

Players follow combat on the public initiative (the track campaign live view), but it
doesn't match what the DM sees. It shows effects with its own simple icons, and its AC and
hit points ignore effects: a Hasted creature shows AC 15 to the players and AC 17 to the
DM, and Aid's extra hit points are missing. Step 3 made effects change values in the
tracker. This change (step 3h of the effects plan) brings the same effects and values to
the public initiative.

## What Changes

- **Effects shown with the tracker's chips**: the public initiative uses the tracker's
  effect chip component instead of its own icons. The same icon or initial, badge
  (Exhaustion level, rounds left) and overflow ("+N" menu). The tooltip shows the name and
  the duration, and the caster only when players can see who it is. Clicking a chip doesn't
  open the DM's detail drawer. The chip component is split so it works without the
  tracker's store: it can take the effects and their definitions as input.
- **Values calculated by effects**: AC (also when transformed), maximum hit points and the
  health bar on the public initiative and the current-turn bar use the same calculation as
  the tracker: stored values, manual bonuses and effects.
  - A value changed by effects or manual bonuses is marked like in the tracker.
  - Its tooltip lists the effects and bonuses ("Haste: +2") when that creature's effects
    are visible to players. Otherwise it only shows the net change ("Armor Class +2").
- **Definitions on the public initiative**: SRD effects come from the local data of the
  campaign's edition. Custom effects are read from the DM's custom effects, the way the
  view already reads the DM's NPCs. An effect whose definition can't be read shows by its
  stored name and changes no values.
- **Stats for formulas**: values that depend on ability scores or level (Mage Armor's
  13 + Dexterity modifier) need the creature's stats. The public initiative gets them from
  the player, the DM's NPC, or the SRD monster.
- **Share settings stay**: a hidden AC or hidden hit points stay hidden, whatever effects
  do. Effects follow the "Conditions and effects" setting, as now.
- **Possibly the database rules**: if the rules don't let players read the DM's custom
  effects, that read needs to be allowed (in the separate `firebase_rules` repo).
- Not in this change:
  - the campaign overview outside an encounter (keeps manual bonuses only)
  - a detail view for players when they click an effect
  - roll modifiers (Advantage, bonuses on saves): the public initiative doesn't show rolls

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `effects-player-view`: effects are shown with the tracker's chips, values are calculated
  by effects, and tooltips follow the effect visibility.
- `effects-stat-modifiers`: the public initiative shows effective values instead of stored
  values plus manual bonuses ("Effective values are shown and marked", "Screens outside
  the tracker use manual bonuses").
- `effects-runtime-resolution`: the public initiative resolves definitions too, with
  custom effects read from the DM's custom effects instead of the signed-in user's.

## Impact

- `src/components/trackCampaign/live/`: `index.vue` (the effective values per creature, and
  the definitions and stats they need), `Initiative.vue` (AC and the effect chips),
  `Health.vue` and `Turns.vue` (effective maximum hit points)
- `src/components/combat/entities/effects/` (`index.vue`, `Effect.vue`): usable without the
  tracker's store, and read-only. The tracker's use doesn't change.
- `src/components/combat/entities/EffectModifiedValue.vue`: a tooltip that only shows the net
  change
- `src/mixins/trackEncounter.js` (`displayAc`), `src/utils/effectFunctions.js` (a pure helper
  for chip items, and the removal of `effectDisplayItems` once the live view no longer uses
  it), `src/utils/entityFunctions.js` (a pure helper that builds the stats the calculation
  reads)
- Reads `effects/<dmId>` and the monster API from the public initiative. The Firebase rules
  (separate repo, uploaded by the user) may need a read rule for `effects/<uid>`.
