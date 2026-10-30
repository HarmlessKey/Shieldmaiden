# Monster action parser skill, with a benchmark

Idea, 2026-10-30. Supports step 11c of [effects-implementation-plan.md](./effects-implementation-plan.md)
(backfill effect links onto the SRD monsters of the HK API). The API now has `/v2/monsters`
(`HarmlessKey_API`, change `add-monsters-v2-effects`), which stores abilities in the shape of
`src/schemas/hk-npc-schema.json`: up to 5 `action_list` entries per ability, outcome effects on
each entry (`$defs/action_effects`) and trait effects on special abilities.

Writing those blobs by hand for ~650 monsters is too slow. A skill turns one ability's stat
block text into its complete JSON. It has to run on Haiku, so it must be explicit: a fixed
procedure, phrase-to-field tables and worked examples, not judgment calls.

## Deliverables

1. **Skill** `.claude/skills/monster-action-parser/`
   - `SKILL.md`: input and output contract, the procedure, the field rules, a checklist.
   - `references/effects-catalogue.md`: the SRD effect and condition `url`s per edition, with
     name, choices and when to use them (generated, see 3).
   - `references/examples.md`: worked examples, input text and the exact JSON.
2. **Benchmark** `scripts/monster-action-skill/benchmark/cases.json`: 10–30 abilities
   (stat block text and the complete expected JSON), chosen for variety: every ability group,
   both editions, attacks, saves, multi-entry abilities, healing, no-roll abilities, traits with
   and without trait effects, and many kinds of links (conditions, escapes, repeat saves, every
   next-turn anchor, time, concentration, rest, nested conditions, escalation, choices, levels,
   magical, damage over time, roll specials).
   **No benchmark description may appear in the skill** (checked by `check.mjs`).
3. **Scripts** in `scripts/monster-action-skill/`:
   - `build-catalogue.mjs`: writes `references/effects-catalogue.md` from `/v2/effects/<edition>`
     (or saved responses, `--from`, like `scripts/validate-effects-data`). The skill can't drift
     from the API's urls.
   - `check.mjs`: validates the expected answers (`--self`) or scores a results folder
     (`--results <dir>`) against them. Per case: NPC schema validity (with the effects schema),
     semantic checks (urls exist in the edition, outcomes fit the entry type, choices belong to
     the definition, trait links without duration) and a normalized deep compare. Prints the
     differing paths, a pass count and a field accuracy. Also checks that no benchmark
     description is quoted in the skill.
   - `run.mjs`: runs every case through Claude Code headless (`claude -p --model <model>`,
     default `claude-haiku-5-5`) in a temporary workspace that only holds a copy of the skill,
     so the model can't read the benchmark. Writes one JSON per case, then runs the check.
   - `README.md`: how to run them.

## Input and output

Input per ability: edition (`5e` or `5.5e`), group (`special_abilities`, `actions`,
`bonus_actions`, `reactions`, `legendary_actions`), the name line as printed (with its
parenthetical) and the description. Output: one JSON object, the ability as stored in
`/v2/monsters` and accepted by `hk-npc-schema.json`.

## Conventions (the skill follows these; the benchmark is written with them)

### Ability fields
- `name` without the parenthetical. `desc` copied exactly.
- Parenthetical: `(Recharge 5–6)` → `recharge: "5-6"`, `(Recharge 6)` → `"6"`, `(Recharges after
  a Short or Long Rest)` → `"rest"`; `(N/Day)` → `limit: N, limit_type: "day"` (first number when
  it says "or M/Day in Lair"); `(Costs N Actions)` → `legendary_cost: N`. Every legendary action
  has `legendary_cost`, 1 by default.
- `reach` from "reach N ft."; `range` from "range N ft." / "range N/M ft." (`"N"`, `"N/M"`), or
  "within N feet" that places one target or the point of an area.
- Areas: `N-foot Cone` → `cone`, `N-foot-long … Line` → `line`, `N-foot-radius Sphere` →
  `sphere`, `N-foot Cube` → `cube`, `N-foot-radius … Cylinder` → `cylinder`, `N-foot Emanation`
  and "each creature within N feet of <the monster>" → `emanation`; the size is N.
- Every ability has an `action_list` with 1–5 entries. An ability with nothing to roll and
  nothing to apply has `[{ "type": "other" }]` (Multiattack, Spellcasting, passive traits).

### Action-list entries
- One entry per attack roll or saving throw, in text order. Damage and effects of the same
  outcome go on that entry. A save that follows a hit ("If the target is a creature, it must
  succeed on…", "it is subjected to the following effect") is a second entry.
- Types: Melee (Weapon) Attack → `melee_weapon`, Ranged (Weapon) Attack → `ranged_weapon`,
  Melee or Ranged → `melee_weapon` with `reach` and `range`, Melee/Ranged Spell Attack →
  `spell_attack`, a saving throw → `save`, regaining Hit Points → `healing`, damage without an
  attack or save → `damage`, nothing to roll → `other`.
- `attack_bonus` from "+N"; `save_ability` the full lowercase ability; `save_dc` the DC.
- Rolls: "N (XdY + Z) Type damage" → `dice_count X, dice_type Y, fixed_val Z` (no `fixed_val`
  without a modifier, negative for "− Z"); a flat "1 Piercing damage" → `fixed_val: 1` only.
  `damage_type` lowercase. Attack rolls carry `miss_mod: 0`; save rolls `save_fail_mod: 0.5`
  with half damage on a success, otherwise `0`. Healing rolls have no `damage_type` and no mod.
  Not rolled: conditional extra damage ("if the attack roll had Advantage"), versatile
  alternatives, and damage at the start of later turns (that is a link).
- Roll `special`: "regains Hit Points equal to the damage dealt" → `siphon_full` (half →
  `siphon_half`); "Hit Point maximum decreases by an amount equal to the damage taken" with no
  save of its own → `drain`. Both on the roll of that damage. When the reduction depends on a
  save, it is a save entry with a Hit Point Maximum Reduction link instead.

### Effect links
- Only definitions from the catalogue, by `url`, for the monster's edition:
  `{ "source": "srd", "source_key": <url>, "name": <name> }`. Mechanics without a catalogue
  effect are left to `desc` (pushes, pulls, swallowing, "can't take the Dash action", immunity
  after a successful save).
- Outcomes: attacks `on_hit` / `on_miss`; saves `on_fail` (Failure, "or be …"), `on_success`
  (Success), `always` (Failure or Success); other, damage and healing `always`.
- Every action link has a `duration`:
  - none stated → `{ "type": "cancelled" }`
  - "(escape DC N)" → `cancelled` with `escape: { dc: N, checks: [Strength (Athletics),
    Dexterity (Acrobatics)] }`; "DC N Strength check" → `checks: [{ "ability": "strength" }]`
  - "for N minutes/hours/rounds" → `{ type: "time", value: N, unit }`
  - "until the start/end of its next turn" → `next_turn`, anchor `target`, edge `start`/`end`;
    "of the <monster>'s next turn" → anchor `caster`
  - "until the end of the current turn", "against that attack" → `end_of_turn`
  - "until <the monster>'s Concentration ends" → `concentration` (with value and unit when "up
    to N")
  - "until it finishes a Long Rest" → `{ type: "rest" }`; "Short or Long Rest" → add
    `rest_type: "short_or_long"`
  - repeat save "at the end of each of its turns" → `save: { ability, dc, triggers:
    ["end_turn_target"] }` (the entry's save unless another is named; start of its turns →
    `start_turn_target`); with no time limit the type is `cancelled`; "after 1 minute, it
    succeeds automatically" → `time` 1 minute
  - First Failure X / Second Failure Y → X with `save.failures_to_escalate: 1` and
    `save.escalate.effect` Y (and `escalate.duration` when Y has its own)
  - "While <Condition>, the target has the X condition" / "until this grapple ends" → X with
    `cancelled` and `ends_when: { type: "has_condition", value: <condition>, negate: true }`
  - "until it attacks / casts a spell" → `cancel_triggers` `on_attack` / `on_cast`
- `choices`: set every choice the text fixes (damage type, ability, a number as a string);
  leave out what it doesn't (an amount equal to damage taken, a rolled amount).
- `level` for leveled effects ("gains 1 Exhaustion level" → `level: 1`).
- `magical: true` on every link of an ability whose description contains "magic", "magical" or
  "magically", or that has a `spell_attack` entry. Never on trait links.

### Trait effects
- Only on `special_abilities`, for always-on mechanics with a catalogue effect (Magic
  Resistance, Undead Fortitude, Evasion, Absorption, damage resistance…): `{ effect, choices? }`,
  no duration, every choice fixed. A trait that only applies sometimes ("while in sunlight",
  "while Bloodied", "if an ally is within 5 feet") gets none.
- A trait that forces a save (auras, Death Burst, Stench) is modeled with `action_list`
  entries and outcome links, not trait effects.

## Found while specifying (not changed here)

- An NPC ability gets a roll button only when an entry has rolls (`hasRolls`). Abilities whose
  only content is linked effects (a save that just applies Paralyzed, Parry, Duergar
  Invisibility) can't apply their links from the tracker; spells have `applyOnlySpell` for
  this, NPC abilities don't. Fixed in
  [npc-linked-effects-without-rolls.md](./npc-linked-effects-without-rolls.md).
- The link dialog doesn't offer `ends_when` or `rest_type` and `cleanEffectLink` drops them, so
  editing a copied SRD monster in the NPC form loses "while Grappled" and "Short or Long Rest".
  The engine evaluates `duration.ends_when` (`endsWhenExpiries`).
- The catalogue reference was generated from the last local SRD data (`src/data` before
  effects 12, the same data seeded into the API). Re-run `build-catalogue.mjs` against the API
  before a backfill run.

## Verification

- `node scripts/monster-action-skill/check.mjs --self`: every expected answer validates against
  the NPC schema and the semantic checks, and no benchmark description is in the skill.
- `node scripts/monster-action-skill/run.mjs` (needs the Claude Code CLI): Haiku's pass rate.
