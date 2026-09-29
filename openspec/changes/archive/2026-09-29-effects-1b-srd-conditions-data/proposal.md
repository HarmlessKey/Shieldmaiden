## Why

Step 2a (Effects drawer) and 2e (encounter init) will read SRD conditions from
`src/data/5e/conditions.js` and `src/data/5.5e/conditions.js`, and apply them as effect
instances keyed by `source: "srd"` + `source_key`. The files aren't ready for that: entries
have no identifier, still carry definition-level durations, split Exhaustion into six entries,
copy Incapacitated's rules into four other conditions, and the 5.5e file was written before
the 2024 text was available and is wrong in places (Exhaustion, Incapacitated, Invisible,
Grappled, Stunned, plus two non-SRD entries). This is step 1b of
[.planning/effects-implementation-plan.md](../../../.planning/effects-implementation-plan.md),
with the target encodings in
[.planning/effects-srd-catalogue.md](../../../.planning/effects-srd-catalogue.md) §3.5,
§3.7, §4 and §5.

## What Changes

- **`url` is the identifier**: every condition in both files gets `url` = the condition
  slug (`"prone"`, `"exhaustion"`), the same unique identifier the HK API uses for
  conditions (their `_id`s are uuids and are not used). `url` is identical across editions
  and unique across `effects.js` and `conditions.js` of an edition. Every entry gets
  `category: "condition"`.
- **`key` → `url` for all SRD definitions** (**BREAKING** for the schema): the schema's
  root `key` property is renamed to `url`, and Concentration in both `effects.js` files
  switches from `key` to `url`, so every SRD definition — condition or effect — is
  identified the same way and step 8 can join on `url` for both. Active instances keep
  `source_key`, which holds the definition's `url`; the instance shape in plan 2d is
  unchanged.
- **No durations on definitions**: `duration_type` and `cancel_trigger` are removed from
  every condition (plan 2c).
- **Exhaustion is one leveled entry** per edition instead of six `Exhaustion N` entries:
  `stacking.mode: "level"` + a `level` track (1–6, −1 per Long Rest, removed at 0).
  2014 rows use `min_level`; 2024 uses `scaling.by: "level"` (−2 × level on D20 Tests,
  −5 × level ft Speed, death at 6). **BREAKING** for any reader of the old
  `Exhaustion N` entries — there are none today (nothing imports these files).
- **Composition**: Paralyzed, Petrified, Stunned and Unconscious `include` Incapacitated
  instead of restating it, so fixes to Incapacitated propagate. Unconscious also brings
  Prone.
- **5.5e corrections against SRD 5.2.1**: Exhaustion (above, no Disadvantage);
  Incapacitated breaks Concentration, gives Disadvantage on Initiative, no actions, Bonus
  Actions, Reactions or speech; Invisible gives Advantage on Initiative and is Concealed;
  Grappled gives Disadvantage on attacks against anyone but the grappler; Stunned drops the
  2014 "can't move / speaks falteringly" text; descriptions rewritten to the 2024 rules.
- **Removed from 5.5e**: `Dying` and `Surprised` (not SRD 5.2.1 conditions). **BREAKING**
  for the same (non-existent) readers.
- **Canonical v2 spellings** where the rewrite touches a sub-effect (`advantage` +
  `perspective: "against"` instead of `grant_advantage`, `distance` with
  `subject: "counterpart"` instead of `attacker_distance`).
- **Validation script** committed under `scripts/validate-effects-data/` that validates all
  four SRD data files against `hk-effects-schema.json` and checks the cross-file rules
  (unique `url`s, no duration fields, every `includes` / `apply_effect` reference resolves in
  the same edition, no include cycles). Later steps (2, 5) reuse it.

Names and descriptions stay local; condition text is not read from the HK API until step 8.
The per-level Exhaustion display text stays in `EXHAUSTION_LEVELS`.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `effects-srd-data`: the per-edition SRD definition requirement is renamed and extended
  to the conditions files, with `url` replacing `key` as the identifier (shared across
  editions, unique across both files, schema-valid, no durations),
  and new requirements cover the condition set per edition, Exhaustion leveling, `includes`
  composition, the 2024 condition rules, and the validation script.

## Impact

- `src/data/5e/conditions.js`, `src/data/5.5e/conditions.js` — rewritten.
- `src/data/5e/effects.js`, `src/data/5.5e/effects.js` — Concentration `key` → `url`.
- `src/schemas/hk-effects-schema.json` — root `key` renamed to `url` (description and the
  `condition_check.value` wording updated to match). Nothing else reads the root `key`.
- `scripts/validate-effects-data/` — new Node script (Ajv is already a devDependency).
- No runtime code changes: nothing imports the conditions files yet. The legacy conditions
  drawer keeps using the `api_conditions` store and `entity.conditions` until step 2i.
- Beyond the rename, no schema change expected (v2 already has `category`, `stacking`,
  `level`, `min_level`, `scaling`, `includes`, `perspective`); if validation shows a gap,
  the schema is extended in this change.
- `.planning/effects-implementation-plan.md` and `.planning/effects-srd-catalogue.md` —
  definition `key` wording changed to `url`; step 1b marked done after archive.
