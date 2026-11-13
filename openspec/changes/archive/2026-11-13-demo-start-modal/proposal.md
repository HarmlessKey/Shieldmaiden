## Why

The demo always runs on 5.5e, and `/demo` drops visitors straight into the demo encounter builder,
so they don't learn that there's a ready-made encounter to try, and 5e players can't see the
tracker in their edition. A short start dialog lets visitors pick their edition and how they want
to start.

## What Changes

- Opening `/demo` shows a start modal before the demo encounter builder, with:
  - an edition select (5e / 5.5e), defaulting to 5.5e
  - two choices: **Run the premade encounter** and **Build your own encounter**
- **Run the premade encounter** goes to `/demo/run-encounter` and runs the premade demo in the
  chosen edition.
- **Build your own encounter** closes the modal on the demo encounter builder; the builder's
  monster search starts on the chosen edition, and the encounter built there runs in that
  edition.
- The demo tracker runs in the chosen edition instead of always 5.5e. Opening
  `/demo/run-encounter` directly (home page links, a reload) without choosing keeps running on
  5.5e.
- The premade encounter's starting effects follow the edition:
  - 5.5e: Rage on the Barbarian; the Warlock concentrates on Hex on Orc (1) (as today)
  - 5e: Rage on the Barbarian; the Warlock concentrates on Bane on Orc (1), Orc (2) and the Ogre
    (Hex isn't in the 5e SRD)
- Resetting the demo keeps the chosen edition.

Not changing: the premade encounter's creatures (two Orcs and an Ogre, 5e stat blocks; the 5.5e
SRD has no Orc), the demo builder's other behavior, and the non-demo builder and tracker.

## Capabilities

### New Capabilities
- `demo-encounter`: the public demo: the start modal on `/demo`, the edition the demo runs in,
  and the premade encounter's starting effects per edition.

### Modified Capabilities

## Impact

- `src/router/routes.js` / `src/layouts/demo.vue`: show the start modal on the demo builder route
- New start modal component (edition select, two choices)
- `src/store/modules/userContent/encounters.js`: keep the chosen demo edition next to
  `demo_encounter`
- `src/store/modules/runEncounter.js`: `init_Encounter` uses the chosen demo edition instead of
  the hardcoded `"5.5e"`; the premade `demoEncounter` gets per-edition starting effects
- `src/components/encounters/Entities.vue`: in the demo, the monster search starts on the chosen
  edition
- No database or API changes; nothing is stored for the demo
