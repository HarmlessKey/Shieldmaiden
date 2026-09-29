## Context

- `src/data/5e/effects.js` and `src/data/5.5e/effects.js` each hold one entry,
  Concentration, written before schema v2: two `special/descriptive` sub-effects
  (`damage_taken`, `on_zero_hp`) with the save only in free text. The 5.5e file has no
  DC cap and no Incapacitated end.
- Schema v2 (`src/schemas/hk-effects-schema.json`) already has everything needed, so no
  schema change: definition-level `ends_when` (`$defs/condition_set`), `condition_check`
  type `has_condition`, sub-effect `save` (`$defs/save_spec`) whose `dc` is an `amount`
  that may be a `formula` with `min` / `max` / `round`, and the `damage_taken` formula
  variable.
- Nothing reads these files at runtime yet (first consumer: plan step 2a/2e), so the
  change is data-only and can't regress the app.
- `.planning/monster-actions-effect-scan.md` was produced by an ad-hoc regex scan whose
  script was never committed (see its methodology note). It covers `/monsters` (2014)
  only. The 5.5e corpus is at `/monsters/5.5e` (330 monsters, SRD 5.2.1).

## Goals / Non-Goals

**Goals:**
- Concentration definitions in both editions encode the rules structurally so steps 2h/3
  can automate the damage save and the Incapacitated end.
- A reproducible 5.5e scan section that gives step 6 counts and examples for the 2024
  structured phrasing.

**Non-Goals:**
- Reading the `edition` getter in the drawer / encounter init (plan 0b.2 → steps 2a, 2e).
- Any engine code that evaluates `ends_when` or rolls saves (steps 2h, 3).
- Adding more SRD effects (step 5) or touching `conditions.js` (step 8).
- Re-running or changing the 2014 section of the scan.

## Decisions

**1. Save as a structured `save` on the `damage_taken` sub-effect.**
Keep `type: "special"`, `sub_types: ["descriptive"]`, `trigger: "damage_taken"` and add

```js
save: {
	ability: "constitution",
	dc: { formula: "damage_taken / 2", min: 10, max: 30, round: "down" },
}
```

(5e: same without `max`). `save_spec.on_success` defaults to `negate`, which reads as
"nothing happens on a success". The consequence of a failure is `outcome:
break_concentration`; to make failure explicit, the sub-effect becomes
`type: "outcome"`, `sub_types: ["break_concentration"]` with the `save` attached, so the
outcome only applies on a failed save — the same pattern the catalogue uses for
"save or suffer X" sub-effects. The `description` stays for display. If schema
validation rejects this combination, fall back to `special/descriptive` + `save`, and
record the fallback in tasks.
*Alternative*: keep free text only — rejected, step 3 would have to parse text.

**2. Incapacitated end as definition-level `ends_when`.**
`ends_when: { type: "has_condition", value: "incapacitated", description:
"Concentration ends if you have the Incapacitated condition." }`. The schema already
describes definition-level `ends_when` as intrinsic state-based ends (Rage example) that
OR with the application's `duration.ends_when`. `subject` defaults to `self` (the
holder), which is what we want. Before step 8 the check reads `entity.conditions`, per
the plan's "Working with conditions before step 8".
*Alternative*: an `on_condition_applied` trigger sub-effect with
`outcome: break_concentration` — rejected; `ends_when` is state-based, so it also covers
an entity that is already Incapacitated when Concentration is applied.

**3. Apply the Incapacitated end to 5e too.**
The 2014 PHB also ends Concentration when incapacitated, and the current 5e description
already says so. Keeping both definitions structurally identical (differing only in the
DC `max` and wording) avoids edition-specific branches later. This goes slightly beyond
plan 0b.1, which only names 5.5e.

**4. Keep the `on_zero_hp` sub-effect.**
Setting Unconscious at 0 HP is manual in the tracker today, so `ends_when` alone would
miss a holder that drops to 0 HP without the DM setting a condition. Encode it as
`outcome` / `break_concentration`, trigger `on_zero_hp`.

**5. Scan script committed under `scripts/monster-effect-scan/`.**
A single Node ESM script (`scan.mjs`, built-in `fetch`, no new dependencies) that pulls
the list + each monster from `https://api.harmlesskey.com/monsters/5.5e`, runs regexes
over `actions`, `bonus_actions`, `reactions`, `legendary_actions`,
`special_abilities` (and any other action-list fields present), and prints markdown
tables. The report is pasted into a new `## 5.5e (2024) corpus` section of the existing
scan document, with sections: named conditions ("has the X condition"), Saving Throw
blocks (Failure / Success / Failure or Success / "Success: Half damage"), escape DCs,
next-turn duration anchors (owner vs target, start vs end), repeat-save timing,
escalating saves (First/Second Failure), Bloodied (conditions and triggers),
Trigger/Response reactions, nested state, and the mechanical patterns from the 2014
section for comparison. Plan §0a headline numbers are updated if the scan differs.
*Alternative*: scratchpad-only script like the original scan — rejected, that's why the
original can't be re-run.

## Risks / Trade-offs

- [Regex counts are approximate] → state in the methodology note that counts are "at
  least"; spot-check a sample per category against the source text.
- [The `outcome` + `save` pairing may not match how step 3 ends up resolving saves] →
  data is not consumed yet; step 3/4 may revise it, and the catalogue stays the
  reference.
- [Live API data can change between runs] → record the run date, monster count and API
  source in the report header.
