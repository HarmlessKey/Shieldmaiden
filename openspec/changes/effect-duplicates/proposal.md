## Why

Mirror Image can't be run by the tracker. Its duplicates are a count that goes down during the
fight, and attacks against the holder can hit a duplicate instead. The schema has had
`charges` on instances for this ("Mirror Image duplicates"), but nothing reads or writes it,
there's no sub-effect type for the duplicate check, and the attack roll dialog always resolves
an attack against the creature itself. Today the DM tracks the duplicates by hand and has to
remember to cancel the damage.

## What Changes

- New sub-effect type **Duplicates** (`type: "duplicates"`), generic so both editions and
  homebrew decoys are data:
  - `count`: how many duplicates the effect starts with
  - `check`: when to roll and what to roll. Either before the hit (`when: "targeted"`, a d20
    with a minimum per number of duplicates left), or on a hit (`when: "hit"`, a d6 per
    duplicate, one success is enough)
  - `ac`: the duplicate's AC as a formula (2014: 10 + Dex modifier). Without it, a duplicate
    the attack goes to is hit
  - `condition`: the existing condition field says who it works against (not Blinded, no
    Blindsight, no Truesight)
- Applying an effect with a Duplicates sub-effect stores the starting count in
  `instance.charges`.
- In the attack roll dialog, an attack against a holder with duplicates rolls the duplicate
  check, shows the dice and the result, and lets the DM flip it. When a duplicate is hit, the
  creature takes no damage, its on-hit effects and triggers don't happen, and on Apply one
  duplicate is destroyed. Several attacks in one dialog use the count left after the earlier
  ones.
- At 0 duplicates the effect ends.
- The chip's badge shows the duplicates left, and the detail view lets the DM change the count
  for attacks the dialog doesn't see.
- The tracker checks the attacker's Blinded condition and Blindsight/Truesight (stat block
  senses and Sense sub-effects).
- Form, docs and schema support the new type. Mirror Image definitions for both editions are
  written for the HK API, and admin paste-test effects are provided.

## Capabilities

### New Capabilities
- `effects-duplicates`: the Duplicates sub-effect: the stored count, the duplicate check in
  attacks, the sight exceptions, the count going down and ending the effect, and changing the
  count by hand.

### Modified Capabilities
- `effects-display`: the chip badge shows duplicates left (instead of rounds left) for an
  effect with duplicates, and the tooltip lists them.
- `effects-authoring`: the form offers the Duplicates type and shows its fields.

## Impact

- `src/schemas/hk-effects-schema.json`: `duplicates` in the sub-effect `type` enum, and its
  fields (`count`, `check`, `ac`). `charges` on instances and in the DB rules already exists.
- `src/utils/effectFunctions.js`: helpers for the duplicates of an instance, the check, and the
  attacker's senses; `buildEffectInstance` sets `charges`; `sense` becomes evaluable for the
  other party in an attack.
- `src/components/hk-components/hk-rolls/hk-single-roll.vue`: the duplicate check per attack,
  and skipping damage, linked effects and hit triggers when a duplicate is hit.
- `src/store/modules/runEncounter.js`: an action to lower or set `charges`, ending the effect
  at 0 (persisted like a level change).
- Effect chips and the detail view; `effectsConstants.js`, `fieldControls.js` and the form;
  `src/docs/effects.md`.
- HK API: two SRD definitions (`mirror-image`, 5e and 5.5e). That's a separate repo; this
  change only writes the JSON.
- No migration: no existing definition uses the new type.
