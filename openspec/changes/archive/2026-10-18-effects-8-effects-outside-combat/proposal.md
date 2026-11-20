## Why

Effects can only be applied once combat runs. A DM can't set up creatures that start the
fight Invisible or under a pre-cast spell, surprise is still a self-removing reminder instead
of the SRD Surprised effect, and the effects players carry between encounters (a curse, Aid,
Exhaustion after a march) can't be seen or changed outside an encounter.

## What Changes

- **Set initiative screen:** clicking an entity in the Overview targets it like in the
  tracker (shift or ctrl for several). The Overview header shows the Targeted pane's actions
  for the targeted entities (Effects, Conditions, Reminders, Transform, Hide/Show, Edit,
  Untarget) through one shared header-actions component; out of turn damage isn't offered
  before combat. The targets carry over into combat.
- **Surprised is an effect:** "Set surprised" / "Remove surprised" (keybind S) applies and
  removes the SRD Surprised effect of the campaign's edition instead of the premade
  `surprised` reminder:
  - 5e: until the end of its first turn (`next_turn`, target, end)
  - 5.5e: Disadvantage on the Initiative roll, removed when combat starts
  - the avatar's surprised icon reads the effect; encounters saved with
    `reminders.surprised` are converted to the effect when loaded; the premade reminder is
    removed
- **The campaign's players:** on the run campaign screen each player shows its effect chips
  (details and Remove) and an Effects button that opens an Effects drawer for that player,
  with everything the encounter drawer offers: durations (including Concentration with a
  player as the caster, and turn-based durations that resolve in the next encounter),
  choices, levels, repeat saves and escapes. Effects are written to the campaign, so they
  carry into the next encounter.

## Capabilities

### New Capabilities

- `effects-outside-combat`: targeting and header actions on the set initiative screen,
  Surprised as an effect, and managing the campaign's player effects on the run campaign
  screen.

### Modified Capabilities

- `effects-drawer`: "Drawer opens for the targeted entities and from the Conditions option"
  also covers the set initiative screen's Overview header.

## Impact

- `src/components/combat/Targeted.vue` → a shared `TargetActions.vue` header component;
  `src/components/combat/initiative/index.vue` and `Overview.vue` (targeting, header,
  Surprised).
- `src/mixins/reminders.js` (premade `surprised` removed), `combat/entities/Avatar.vue`.
- `src/store/modules/runEncounter.js`: Surprised conversion on load, 5.5e Surprised removed
  at combat start.
- `src/components/campaign/Players.vue`, a new `drawers/campaign/Effects.vue` reusing the
  drawer's apply form, and campaign store actions to apply and remove player effects with
  Concentration (`src/store/modules/userContent/campaigns.js`).
- `src/docs/effects.md` and the effects plan. No schema or database rule changes: player
  effects already have their storage and rules.
