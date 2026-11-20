# Monster action parser: skill tooling and benchmark

Tooling for the `monster-action-parser` skill (`.claude/skills/monster-action-parser`), which
turns one monster ability's stat block text into the JSON that `/v2/monsters` stores
(`src/schemas/hk-npc-schema.json`). Spec: `.planning/monster-action-parser-skill.md`.

The scripts need `ajv` and `ajv-formats` (in the app's dependencies, so `npm install` first).

## Benchmark

`benchmark/cases.json` holds 29 abilities with their expected JSON, chosen for variety:

| | Cases |
|---|---|
| Groups | actions, bonus actions, reactions, legendary actions, special abilities |
| Editions | 5e (2014 wording) and 5.5e (2024 wording) |
| Entries | melee, ranged, attack then save, save only, save for half, healing, nothing to roll |
| Name line | recharge, N/Day, legendary cost, a parenthetical that sets nothing |
| Links | conditions, escape DC, Strength check escape, repeat saves (time, no limit, automatic success), next turn of the target and of the monster, end of turn, concentration, Long and Short Rest, conditions while another lasts (`ends_when`), First/Second Failure escalation, fixed and open choices, levels, magical |
| Traits | trait effects with and without a choice, a conditional trait without one, a trait that forces a save |
| Rolls | two damage types, siphon and drain specials, extra damage that isn't rolled |

Each case has `id`, `monster`, `edition`, `group`, `name` (the name line as printed), `desc`,
`tests` (what it covers) and `expected` (the ability without `desc`; the checker adds it).

**The skill must not contain these descriptions.** `check.mjs --self` fails when the skill
quotes more than 40% of a case's description (stat block boilerplate like "ending the effect on
itself on a success" is fine). Don't turn a case into a worked example; add a new case when
you add an example of the same pattern.

## Scripts

```bash
node scripts/monster-action-skill/check.mjs --self
```

Validates every expected answer and every worked example of the skill against the NPC schema
(with the effects schema) and the semantic checks, and runs the leak check.

```bash
node scripts/monster-action-skill/run.mjs
```

Runs every case through Claude Code headless (`claude -p --model claude-haiku-5-5`) in a
temporary workspace that only holds a copy of the skill, writes the replies and answers to
`benchmark/results/<model>/` and scores them. Options: `--model`, `--only b04,b05`,
`--concurrency`, `--out`, `--claude <bin>`, `--dry-run` (print the prompts). Needs the Claude
Code CLI, logged in.

```bash
node scripts/monster-action-skill/check.mjs --results scripts/monster-action-skill/benchmark/results/claude-haiku-5-5 --verbose
```

Scores a results folder again: one `<case id>.json` per case, from any model or tool. An answer
passes when it validates, passes the semantic checks (urls in the catalogue for the edition,
outcomes that fit the entry type, durations on action links, choices the effect has) and equals
the expected answer after normalizing (name case, whitespace, roll mod defaults, link order).
The field accuracy is the share of matching JSON leaves, for partial credit.

```bash
node scripts/monster-action-skill/build-catalogue.mjs
```

Regenerates the skill's `references/effects-catalogue.md` from `/v2/effects/<edition>` (or
`--from <dir>` with saved `5e.json` and `5.5e.json` responses). Run it when the API's effects
change, then `check.mjs --self`.
