## Why

Step 0 of the [effects implementation plan](../../../.planning/effects-implementation-plan.md#0-55e-2024-alignment--effects-part)
aligns the effects work with the D&D 5.5e support that shipped in 2.43.0. Two pieces are
still open before step 2 can start: the only SRD effect we ship (Concentration) still
encodes 2014-style rules in its 5.5e data file, and the monster effect scan that feeds
step 6 covers only the 325 2014 monsters, not the 330 5.5e ones.

## What Changes

- **Concentration (5.5e)** in `src/data/5.5e/effects.js` is re-encoded against the v2
  schema and the SRD 5.2.1 Rules Glossary:
  - the damage-taken save becomes a structured `save` (Constitution, DC
    `max(10, floor(damage_taken / 2))`, **capped at 30**) instead of free text only;
  - Concentration ends when the holder has the Incapacitated condition, expressed as a
    definition-level `ends_when: { type: "has_condition", value: "incapacitated" }`
    that reads the existing `entity.conditions` map (see "Working with conditions
    before step 8" in the plan);
  - the description text matches the 2024 wording.
- **Concentration (5e)** in `src/data/5e/effects.js` gets the same structured save
  (no DC cap — 2014 has none) and the same Incapacitated `ends_when`, since the 2014
  rules also end Concentration when incapacitated. Keeps both files shaped alike.
- **Monster effect scan** (`.planning/monster-actions-effect-scan.md`) gains a 5.5e
  section built from `/monsters/5.5e`, using the 2024 structured phrasing listed in plan
  §0a (Saving Throw / Failure / Success blocks, "has the X condition", escape DCs,
  next-turn anchors, repeat saves, escalation, Bloodied, Trigger/Response reactions).
  The scan script is committed so the report can be re-run.
- **Deferred**: plan item 0b.2 (reading `"5e"` / `"5.5e"` from the `runEncounter`
  `edition` getter in the Effects drawer and encounter init) is delivered by steps 2a
  and 2e, not this change.

No runtime code reads `src/data/*/effects.js` yet, so there is no user-visible behavior
change; the data is consumed from step 2 onward.

## Capabilities

### New Capabilities
- `effects-srd-data`: the SRD effect definitions shipped per edition in
  `src/data/{5e,5.5e}/effects.js` — starting with the Concentration definition, its
  save and its end conditions.

### Modified Capabilities
<!-- none: openspec/specs/ is empty -->

## Impact

- `src/data/5.5e/effects.js`, `src/data/5e/effects.js` — Concentration entries rewritten.
- `.planning/monster-actions-effect-scan.md` — new 5.5e section; 2014 section unchanged.
- `scripts/` — new monster effect scan script (Node, reads the public HK API).
- `.planning/effects-implementation-plan.md` — step 0 marked done once archived.
- No schema change, no Firebase/HK API change, no UI change.
