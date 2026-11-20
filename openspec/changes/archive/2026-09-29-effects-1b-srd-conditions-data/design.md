## Context

- `src/data/5e/conditions.js` (20 entries) and `src/data/5.5e/conditions.js` (22 entries)
  predate schema v2: no identifier / `category`, `duration_type: "cancelled"` on every entry,
  `Exhaustion 1`–`Exhaustion 6` as separate entries, legacy spellings (`grant_advantage`,
  `grant_disadvantage`, `attacker_distance`, `special` / `incoming_crit_range`), and
  Incapacitated's rules copied into Paralyzed, Petrified, Stunned and Unconscious.
- Nothing imports either file (checked with grep across `src/`). The legacy tracker UI reads
  conditions from the `api_conditions` store and writes `entity.conditions`; it's untouched
  until step 2i. So this change is data + a script and can't regress the app.
- Apart from the identifier (decision 0), schema v2 already has everything needed:
  definition-level `category`, `stacking`,
  `level` (`$defs/level_track`), `ends_when`; sub-effect `min_level`, `scaling`
  (`by: "level"`), `multiplier`, `perspective`, `includes` / `apply_effect` with a required
  `effect` ref, `condition` checks with `subject`, `critical` + `incoming_crit_range`.
- HK API conditions are identified by `url` (the slug); their `_id`s are uuids. The
  `api_conditions` store already maps `url` → `_id` per edition. The display icon is
  `hki-<url>` in the legacy drawer, so identifying conditions by `url` gives icons for free.
- Schema v2 has a root `key` ("for SRD conditions this equals the HK API condition url").
  Only the two `effects.js` Concentration entries set it; no code reads it.
- Step 0 validated with a throwaway Ajv script in the scratchpad. The monster scan set the
  precedent of committing reusable scripts under `scripts/<name>/`.

## Goals / Non-Goals

**Goals:**
- Both conditions files are resolvable by `url` in 2a/2e with no special cases, and encode
  mechanics in the canonical v2 form so step 3 has one shape to automate.
- A committed, re-runnable validator for all SRD data files.

**Non-Goals:**
- Any code that reads these files (drawer, lookup helper, `includes` resolver, `hasCondition`
  — steps 2a/2e).
- Changing `EXHAUSTION_LEVELS`, the `api_conditions` store, or the legacy conditions UI.
- Reading condition text from the HK API (step 8a).
- A 2014 "Surprised" effect (catalogue §4 notes it needs `combat_state: "first_round"`); it
  isn't a 2014 condition either.

## Decisions

**0. `url` is the identifier for every SRD definition; `key` goes away.**
Rename the schema's root `key` to `url` (same type, description: "Unique, edition-neutral
identifier, equal to the HK API `url` for content the API serves. Referenced by active
instances as `source_key`."), change Concentration in both `effects.js` files from `key`
to `url`, and give conditions `url` only. The `condition_check.value` description ("a
condition/effect key") becomes "a condition/effect url".
`source_key` on `$defs/effect_ref` and `$defs/active_instance` keeps its name: it's the
instance's *reference* to a definition and now holds that definition's `url`. Renaming it
would ripple through plan 2b/2d/2e and the step-0 spec for no gain.
*Alternative*: `url` on conditions, `key` on effects — rejected by the user: two
identifier fields means the lookup helper and step 8b need per-file special cases.
*Alternative*: keep `key` and add `url` equal to it — rejected, two fields that must
always match.

**1. One entry shape for every condition.**
`{ url, name, category: "condition", description, cancelable: true, [stacking, level,
ends_when], sub_effects }`. `stacking` is omitted (defaults to `none`, the 2024 rule that
conditions don't stack) except on Exhaustion. `cancelable: true` stays as the UI hint
(plan 2d). Entries are kept in alphabetical order by `url`.

**2. Exhaustion encoding — catalogue §5.**
Both editions: `stacking: { mode: "level" }`, `level: { initial: 1, max: 6,
per_long_rest: -1, remove_at: 0 }`, sub-effect `outcome` / `death` with `min_level: 6`.
- 5.5e: `bonus` / `d20_test` with `scaling: { by: "level", per_unit_value: -2 }`; `bonus` /
  `speed` with `scaling: { by: "level", per_unit_value: -5 }`.
- 5e (cumulative rows): `disadvantage` / `ability` `min_level: 1`; `base` / `speed`
  `multiplier: 0.5` `min_level: 2`; `disadvantage` / `attack`, `save` `min_level: 3`;
  `base` / `max_hp` `multiplier: 0.5` `min_level: 4`; `fixed` / `speed` `value: 0`
  `min_level: 5`.
*Alternative*: keep six entries and swap them on level change — rejected by the plan; it
also breaks "one instance per condition".

**3. `includes` Incapacitated in both editions; Prone via `apply_effect` on Unconscious.**
Paralyzed, Petrified, Stunned and Unconscious get
`{ type: "includes", sub_types: ["descriptive"], effect: { source: "srd", source_key:
"incapacitated", name: "Incapacitated" } }` and drop the copied `restrict` rows. Only
rules beyond Incapacitated stay inline: 2014 still needs `restrict` / `speech` (and Speed 0
where the text says "can't move") on these four, because 2014 Incapacitated covers neither.
Plan 1b says Unconscious "also includes Prone". Both editions' text says the creature
*falls* Prone and (2024) "remains Prone" when the condition ends, while `includes` is
lifetime-linked (removed with Unconscious). So Prone is encoded as
`{ type: "apply_effect", trigger: "on_apply", effect: { source: "srd", source_key: "prone" } }`
— an independent Prone instance. This is a deliberate deviation from the plan wording,
recorded here; the plan's intent (Unconscious brings Prone) holds. The copied Prone
sub-effects are removed from Unconscious.
*Alternative*: `includes` Prone — rejected, it would make the holder stand up on waking.
`sub_types` on `includes` / `apply_effect`: the schema only requires `type` (and `effect`);
`sub_types` is omitted if validation allows it.

**4. 2024 Incapacitated breaks Concentration as a `restrict` / `concentration`.**
Concentration itself already ends through its own `ends_when: has_condition incapacitated`
(step 0), so a second trigger-style `outcome: break_concentration` on Incapacitated would
double-fire. `restrict` / `concentration` (the Rage encoding) is state-based, needs no
trigger, and also covers "can't start concentrating", with `description:
"Concentration is broken"`. Initiative: `disadvantage` / `initiative`. The 2014
Incapacitated keeps only `restrict` / `action`, `reaction` — its text doesn't mention
Concentration (the Concentration rule does, and its `ends_when` covers it).

**5. Grappled: definition-level `ends_when` on the grappler; 2024 attack penalty.**
Both editions: `ends_when: { subject: "caster", type: "has_condition", value:
"incapacitated", description: "Ends if the grappler is Incapacitated." }` — `caster` is the
entity that applied the instance (plan 2d `caster_key`). "Removed from reach" stays in the
description (no positions in the tracker). 2024 adds `disadvantage` / `attack` with
`condition: { subject: "counterpart", type: "is_caster", negate: true, description:
"Against any target other than the grappler" }`.

**6. 2024 Invisible.**
`advantage` / `initiative`; `special` / `descriptive` for Concealed; the attack modifiers
get `condition: { subject: "counterpart", type: "can_see", negate: true }` so they don't
apply against a creature that can see the holder. The 2014 entry is rewritten into the
canonical spelling but gets no new mechanics.

**7. Canonical v2 spellings throughout the rewrite.**
`grant_advantage` / `grant_disadvantage` → `advantage` / `disadvantage` +
`perspective: "against"`; `attacker_distance` → `distance` + `subject: "counterpart"`
(Prone "within 5 ft" `lte 5`, otherwise `gt 5`); `special` / `incoming_crit_range` →
`critical` / `incoming_crit_range` + the same distance check. Legacy spellings remain valid
in the schema for user custom effects; the SRD data just stops using them so step 3 only
has to handle one form for SRD content.

**8. Validator: `scripts/validate-effects-data/validate.mjs`.**
Node ESM, no new dependencies (Ajv 8 + ajv-formats are devDependencies; the schema is
draft-07). It imports the four data files, and for each edition:
1. validates every entry against the schema root;
2. rejects `key`, `duration_type`, `duration_value` and `cancel_trigger`;
3. checks `url` is present and unique across both files;
4. collects every `effect` ref on `includes` / `apply_effect` sub-effects (including nested
   `sub_effects`) with `source: "srd"` and checks its `source_key` is a `url` in that
   edition;
5. follows `includes` edges with a visited set and reports any cycle;
6. checks the conditions file `url`s equal the fixed 15-condition SRD set.
Prints `file › entry url › problem` lines and exits 1 on any problem, 0 otherwise. The data
files use `export default` in `.js` without `"type": "module"`. Node 24 imports them but
warns about reparsing as ESM, so the script reads each file and imports it from a `data:`
URL (the data files have no imports of their own). A `--data <dir>` option points it at
another data root holding `5e/` and `5.5e/`, used to test the failure path.
*Alternative*: an `npm run` script — deferred; a plain `node scripts/...` command matches
the scan script and avoids touching `package.json`.

**9. Descriptions.**
5e descriptions stay as they are (they already match SRD 5.1). 5.5e descriptions are
rewritten as short summaries of the SRD 5.2.1 Rules Glossary entries (CC-BY-4.0), with
Exhaustion describing the per-level rule rather than one level.

## Risks / Trade-offs

- [The 5.5e text is written from the SRD 5.2.1 glossary, not copied from the API] → the
  implementer checks each 5.5e description and mechanic against `/conditions/5.5e` of the
  HK API (read-only) as a reference; step 8a later reconciles text.
- [`restrict` / `concentration` on Incapacitated and Concentration's `ends_when` express
  the same rule twice] → both are state-based and idempotent (ending an already-ended
  Concentration is a no-op), and the spec for Concentration is unchanged.
- [Schema may reject a combination (e.g. `includes` without `sub_types`)] → add the minimal
  `sub_types` the schema accepts, or extend the schema in this change, and note it in
  tasks.
- [`apply_effect` on `on_apply` depends on the step-2 engine firing `on_apply`] → the
  trigger is already in the v2 vocabulary; 2g lists it. Until then Unconscious simply
  doesn't add Prone automatically, same as today.

- [Planning docs say `key` in many places] → plan and catalogue wording for the
  *definition* identifier is updated to `url` in this change; `source_key` wording stays.

## Migration Plan

Data + schema only. No Firestore data references these entries (the legacy tracker stores
API condition `url`s as the keys of `entity.conditions`, and those equal the new `url`s,
which makes the 2i conversion a direct mapping). User custom effects are unaffected: the
`userContent/effects` store attaches their Firebase push key as a runtime `key`
([effects.js:30](../../../src/store/modules/userContent/effects.js#L30)), and custom
instances reference that push key as `source_key` (`source: "custom"`). The schema root has
no `additionalProperties: false`, so a custom effect carrying `key` still validates.
Rollback is a revert of the data files and the schema.
