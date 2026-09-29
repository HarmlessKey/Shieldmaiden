# Monster Actions — Effect Scan Report

Source: https://api.harmlesskey.com/monsters (325 monsters)
Total action/trait entries scanned (actions, bonus_actions, reactions, legendary_actions, special_abilities): 1430

Purpose: catalog every distinct 'effect' referenced in monster action/trait descriptions, as input for checking compatibility with `src/schemas/hk-effects-schema.json` and [effects-schema.md](effects-schema.md).

## 1. Named SRD Conditions Referenced

These map directly onto existing named conditions in the effects model.

| Condition | Occurrences | Distinct actions | Example (monster / action) |
|---|---|---|---|
| blinded | 19 | 19 | behir / Swallow |
| charmed | 17 | 17 | aboleth / Enslave |
| deafened | 10 | 10 | bat / Echolocation |
| frightened | 43 | 43 | adult black dragon / Frightful Presence |
| grappled | 43 | 43 | ankheg / Bite |
| incapacitated | 36 | 36 | assassin / Sneak Attack |
| invisible | 7 | 7 | duergar / Invisibility |
| paralyzed | 21 | 21 | adult silver dragon / Breath Weapons |
| petrified | 5 | 5 | basilisk / Petrifying Gaze |
| poisoned | 26 | 26 | chuul / Tentacles |
| prone | 74 | 74 | adult black dragon / Wing Attack |
| restrained | 41 | 41 | basilisk / Petrifying Gaze |
| stunned | 7 | 7 | death dog / Two-Headed |
| unconscious | 16 | 16 | ancient brass dragon / Breath Weapons |
| surprised | 6 | 6 | assassin / Assassinate |

*Note: `exhaustion` — 0 occurrences in monster action text (exhaustion is a PC-facing mechanic, not commonly inflicted by monster actions in this dataset).*

## 2. Mechanical Effect Patterns (not tied to a single named condition)

| Pattern | Occurrences | Distinct actions | Example (monster / action) |
|---|---|---|---|
| grant_advantage_disadvantage_to_others | 2 | 2 | berserker / Reckless — "attack rolls against it have advantage" |
| advantage_self | 60 | 60 | adult blue dracolich / Magic Resistance — "the dracolich has advantage on saving throw" |
| disadvantage_self | 12 | 12 | cloaker / Light Sensitivity — "the cloaker has disadvantage on attack roll" |
| temp_immunity_granted | 2 | 2 | ghast / Stench — "immune to the ghast's stench for 24" |
| regain_hp_self | 12 | 12 | aboleth / Psychic Drain — "regains hit points equal to" |
| temporary_hit_points_gain | 10 | 10 | swarm of poisonous snakes / Swarm — "gain hit points or gain temporary hit points" |
| speed_reduced_halved | 6 | 6 | adult copper dragon / Breath Weapons — "speed is halved" |
| cant_take_reactions | 3 | 3 | aboleth / Enslave — "can't take reactions" |
| cant_regain_hit_points | 17 | 17 | aboleth / Tentacle — "can't regain hit points" |
| ability_score_reduction | 1 | 1 | shadow / Strength Drain — "strength score is reduced" |
| swallowed | 9 | 9 | behir / Swallow — "swallowed" |
| knocked_prone | 64 | 64 | adult black dragon / Wing Attack — "knocked prone" |
| pushed_forced_movement | 2 | 2 | dragon turtle / Tail — "pushed up to 10 feet" |
| pulled_forced_movement | 2 | 2 | merrow / Harpoon — "pulled up to 20 feet" |
| frightful_presence | 44 | 44 | adult black dragon / Multiattack — "frightful presence" |
| legendary_resistance | 5 | 5 | ancient brass dragon / Change Shape — "legendary resistance" |
| disease_infection | 2 | 2 | aboleth / Tentacle — "become diseased" |
| curse_effect | 13 | 13 | lamia / Intoxicating Touch — "curse" |
| lycanthropy | 5 | 5 | wereboar / Tusks — "lycanthrop" |
| shapechanger_polymorph | 21 | 21 | ancient brass dragon / Change Shape — "polymorph" |
| life_energy_drain | 8 | 8 | night hag / Nightmare Haunting — "hit point maximum is reduced" |
| teleport | 8 | 8 | blink dog / Teleport — "teleports" |
| aoe_save_half_damage | 80 | 80 | adult black dragon / Acid Breath — "half as much damage on a successful one" |
| ongoing_fire_ignite_damage | 5 | 5 | chain devil / Chain — "takes 7 (2d6) piercing damage at the start of each of its turns" |
| grapple_escape_dc | 31 | 31 | ankheg / Bite — "escape dc 13" |
| auto_fail_save | 1 | 1 | sprite / Heart Sight — "automatically fail the saving throw" |
| creature_type_exception_clause | 4 | 4 | ghoul / Claws — "target is a creature other than an elf" |
| touch_hit_retaliation_damage | 6 | 6 | azer / Heated Body — "creature that touches the azer or hits it with a melee attack" |

## 3. Structured (non-text) metadata fields present on actions

These aren't found via description scanning — they're explicit JSON fields on the action object, relevant to duration/trigger/scaling modeling.

- `recharge` (e.g. "5-6"): 77 actions — recharge-based limited-use abilities (breath weapons, etc.)
- `limit` + `limit_type` (e.g. 3/day): 41 actions — daily/rest-based limited-use abilities
- `aoe_type` + `aoe_size` (cone/line/sphere/cube + feet): 52 actions — maps to the schema's proposed `area` block
- `legendary_cost`: 96 actions — legendary action point cost

AOE shapes seen: `{'line': 23, 'cone': 25, 'cylinder': 2, 'sphere': 2}`

## 4. Full unique effect list (flat)

Combined, de-duplicated list of every effect/mechanic category identified above:

- blinded
- charmed
- deafened
- frightened
- grappled
- incapacitated
- invisible
- paralyzed
- petrified
- poisoned
- prone
- restrained
- stunned
- unconscious
- surprised
- grant_advantage_disadvantage_to_others
- advantage_self
- disadvantage_self
- temp_immunity_granted
- regain_hp_self
- temporary_hit_points_gain
- speed_reduced_halved
- cant_take_reactions
- cant_regain_hit_points
- ability_score_reduction
- swallowed
- knocked_prone
- pushed_forced_movement
- pulled_forced_movement
- frightful_presence
- legendary_resistance
- disease_infection
- curse_effect
- lycanthropy
- shapechanger_polymorph
- life_energy_drain
- teleport
- aoe_save_half_damage
- ongoing_fire_ignite_damage
- grapple_escape_dc
- auto_fail_save
- creature_type_exception_clause
- touch_hit_retaliation_damage
- recharge_limited_use
- daily_rest_limited_use
- area_of_effect_metadata
- legendary_action_cost

## Methodology note

This was produced by regex/keyword scanning of `desc` text across 1430 action/trait entries pulled
from `GET /monsters` + `GET /monsters/{slug}` for all 325 monsters. Regex matching is precision-first
but not exhaustive — phrasing variance in freeform monster text means some occurrences of a given
mechanic may be undercounted (e.g. only 1 `ability_score_reduction` hit was matched by the strict
pattern used, but Strength/Constitution drain appears in more monsters than that under looser
phrasing). Counts should be read as "at least this many," not exact totals. Full raw monster data and
per-category hit lists (monster + action name for every match) were generated during this scan but
were not persisted to the repo; re-run against the live API if a full re-scan or export is needed.

## 5.5e (2024) corpus

- Run date: 2026-09-29
- Source: https://api.harmlesskey.com/monsters/5.5e (SRD 5.2.1) — 330 monsters listed, 330 fetched
- Action/trait entries scanned: 1271 (actions 758, special_abilities 331, legendary_actions 82,
  bonus_actions 76, reactions 24)
- Script: [`scripts/monster-effect-scan/scan.mjs`](../scripts/monster-effect-scan/scan.mjs)

"Occurrences" counts regex matches; "Distinct entries" counts action/trait entries with at least
one match. The example column shows the first hit.

### What changed from the 2014 corpus

- **Saves are structured.** 198 entries carry an `<Ability> Saving Throw: DC N` block; outcomes
  sit under `Failure:` / `Success:` / `Failure or Success:` labels instead of free text, so an
  action's effects split cleanly into on-fail / on-success / always.
- **Conditions are applied with one phrase**, "has the X condition" (182 entries). The same
  phrase is also used as a state check (31 entries, mostly Pack Tactics' "the ally doesn't have
  the Incapacitated condition"), so step 6 must look at the clause before it.
- **Next-turn durations name their anchor.** "its next turn" / "the target's next turn" (target,
  82) vs "the assassin's next turn" (the monster that applied it, 39).
- **Repeat saves are end-of-turn.** 18 at the end of the target's turn, 0 at the start.
- **New 2024 keywords**: Bloodied (18 entries), First/Second Failure escalation (13), Trigger /
  Response reactions (21 of the 24 reaction entries).
- **Gone or moved**: Frightful Presence survives only as a legendary-action name on 4 dragons;
  Legendary Resistance is an entry name (32), never mentioned in text; the words "disease" and
  "lycanthropy" no longer appear (the death dog's 2014 disease is now an escalating Poisoned
  effect); 2014's "knocked prone" is now "has the Prone condition".

### Named conditions — "has the X condition"

State checks (the phrase inside an `unless` / `while` / `if` / `doesn't` / `that` clause) are
counted separately and left out of the per-condition rows.

| Condition | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| **any condition — applied** | 228 | 182 | aboleth / Tentacle — "has the Grappled condition" |
| **any condition — state check** | 31 | 31 | assassin / Evasion — "has the Incapacitated condition" |
| blinded (applied) | 16 | 16 | animated rug of smothering / Smother — "has the Blinded and Restrained conditions" |
| charmed (applied) | 6 | 6 | aboleth / Dominate Mind — "has the Charmed condition" |
| deafened (applied) | 5 | 5 | adult bronze dragon / Thunderclap — "has the Deafened condition" |
| exhaustion | 0 | 0 | — |
| frightened (applied) | 14 | 14 | chain devil / Unnerving Gaze — "has the Frightened condition" |
| grappled (applied) | 38 | 38 | aboleth / Tentacle — "has the Grappled condition" |
| incapacitated (applied) | 15 | 15 | adult brass dragon / Sleep Breath — "has the Incapacitated condition" |
| invisible (applied) | 2 | 2 | invisible stalker / Invisibility — "has the Invisible condition" |
| paralyzed (applied) | 14 | 14 | chuul / Paralyzing Tentacles — "has the Paralyzed condition" |
| petrified (applied) | 4 | 4 | basilisk / Petrifying Gaze — "has the Petrified condition" |
| poisoned (applied) | 27 | 26 | assassin / Shortsword — "has the Poisoned condition" |
| prone (applied) | 53 | 53 | air elemental / Whirlwind — "has the Prone condition" |
| restrained (applied) | 38 | 34 | animated rug of smothering / Smother — "has the Blinded and Restrained conditions" |
| stunned (applied) | 2 | 2 | otyugh / Tentacle Slam — "has the Stunned condition" |
| unconscious (applied) | 7 | 7 | adult brass dragon / Sleep Breath — "has the Unconscious condition" |

### Named conditions — any mention

Includes references that don't apply the condition ("if the target is Grappled by the ankheg",
"While swallowed, the target isn't Grappled").

| Condition | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| blinded | 17 | 17 | animated rug of smothering / Smother — "Blinded" |
| charmed | 13 | 10 | aboleth / Consume Memories — "Charmed" |
| deafened | 6 | 5 | adult bronze dragon / Thunderclap — "Deafened" |
| exhaustion | 5 | 3 | sphinx of lore / Weight Of Years — "Exhaustion" |
| frightened | 15 | 15 | chain devil / Unnerving Gaze — "Frightened" |
| grappled | 73 | 59 | aboleth / Tentacle — "Grappled" |
| incapacitated | 43 | 43 | adult brass dragon / Sleep Breath — "Incapacitated" |
| invisible | 2 | 2 | invisible stalker / Invisibility — "Invisible" |
| paralyzed | 14 | 14 | chuul / Paralyzing Tentacles — "Paralyzed" |
| petrified | 4 | 4 | basilisk / Petrifying Gaze — "Petrified" |
| poisoned | 41 | 26 | assassin / Shortsword — "Poisoned" |
| prone | 65 | 59 | air elemental / Whirlwind — "Prone" |
| restrained | 53 | 37 | animated rug of smothering / Smother — "Restrained" |
| stunned | 2 | 2 | otyugh / Tentacle Slam — "Stunned" |
| unconscious | 7 | 7 | adult brass dragon / Sleep Breath — "Unconscious" |

### Saving Throw blocks

| Pattern | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| `<Ability> Saving Throw: DC N` | 200 | 198 | aboleth / Mucus Cloud — "Constitution Saving Throw: DC 14" |
| any `Failure:` (incl. First/Second Failure) | 212 | 198 | aboleth / Mucus Cloud — "Failure:" |
| `Failure:` (plain) | 191 | 189 | aboleth / Mucus Cloud — "Failure:" |
| any `Success:` (incl. Failure or Success) | 121 | 113 | aboleth / Consume Memories — "Success:" |
| `Success:` (plain) | 97 | 97 | aboleth / Consume Memories — "Success:" |
| `Failure or Success:` | 24 | 24 | aboleth / Consume Memories — "Failure or Success:" |
| `Success: Half damage` | 80 | 80 | aboleth / Consume Memories — "Success: Half damage" |

### Escalating saves

| Pattern | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| second failure | 12 | 12 | adult brass dragon / Sleep Breath — "Second Failure:" |
| first failure | 9 | 9 | basilisk / Petrifying Gaze — "First Failure:" |
| fails the save by N or more | 0 | 0 | — |

13 distinct entries escalate. The four brass dragons' Sleep Breath open with a plain `Failure:`
followed by `Second Failure:`; the death dog's Bite pairs `First Failure:` with `Subsequent
Failures:` (repeated every 24 hours).

### Escape DCs

| Pattern | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| `escape DC N` | 39 | 39 | aboleth / Tentacle — "escape DC 14" |

### Next-turn duration anchors

"its" and "the target's" are the target; "the <monster>'s" is the monster that applied the effect
(owner). Maps to `duration.anchor` / `edge` (plan 2h).

| Anchor | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| start of target's next turn | 46 | 46 | adult black dragon / Cloud Of Insects — "until the start of its next turn" |
| end of target's next turn | 36 | 36 | adult black dragon / Cloud Of Insects — "until the end of its next turn" |
| start of owner's next turn | 25 | 25 | assassin / Shortsword — "until the start of the assassin's next turn" |
| end of owner's next turn | 14 | 14 | chain devil / Conjure Infernal Chain — "until the end of the devil's next turn" |

### Repeat-save timing

| Timing | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| end of each of its turns | 14 | 14 | chuul / Paralyzing Tentacles — "repeats the save at the end of each of its turns" |
| end of its next turn | 4 | 4 | basilisk / Petrifying Gaze — "repeats the save at the end of its next turn" |
| repeats the save (other phrasing: "at which point", on damage, every 24 hours) | 13 | 13 | aboleth / Dominate Mind — "repeats the save" |

### Bloodied

| Use | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| self condition (while / if Bloodied) | 13 | 12 | berserker / Bloodied Frenzy — "While Bloodied, the berserker has Advantage on attack rolls and saving throws" |
| self, checked at start/end of turn | 3 | 3 | clay golem / Berserk — "Whenever the golem starts its turn Bloodied, roll 1d6" |
| target condition (target is Bloodied) | 3 | 3 | gnoll warrior / Rampage — "Immediately after dealing damage to a creature that is already Bloodied, the gnoll move…" |
| trigger (becomes Bloodied) | 2 | 2 | black pudding / Split — "Trigger: While the pudding is Large or Medium and has 10+ Hit Points, it becomes Bloodi…" |

18 distinct entries in total; the self-condition rows include seven swarms' "less damage if the
swarm is Bloodied".

### Trigger / Response reactions

| Pattern | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| `Trigger: ... Response: ...` | 21 | 21 | bandit captain / Parry — "Trigger: The bandit is hit by a melee attack roll while holding a weapon. Response:" |

### Nested state

| Outer → inner | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| grappled → restrained | 4 | 4 | crocodile / Bite — "While Grappled, the target has the Restrained condition" |
| poisoned → paralyzed | 2 | 2 | chuul / Paralyzing Tentacles — "While Poisoned, the target has the Paralyzed condition" |
| poisoned → unconscious | 2 | 2 | homunculus / Bite — "While Poisoned, the target has the Unconscious condition" |
| charmed → incapacitated | 1 | 1 | harpy / Luring Song — "While Charmed, the target has the Incapacitated condition" |

### Mechanical patterns (compare with the 2014 section)

Adapted to 2024 wording. These rows also scan the entry name, since 2024 stat blocks name
traits like Legendary Resistance without repeating them in the text.

| Pattern | Occurrences | Distinct entries | Example (monster / entry) — match |
|---|---|---|---|
| has_advantage_on (holder or target) | 59 | 59 | balor / Magic Resistance — "has Advantage on" |
| has_disadvantage_on (holder or target) | 20 | 20 | adult black dragon / Cloud Of Insects — "has Disadvantage on" |
| attacks_against_holder_adv_disadv | 1 | 1 | steam mephit / Blurred Form — "Attack rolls against the mephit are made with Disadvantage" |
| temp_immunity_granted | 16 | 15 | chain devil / Unnerving Gaze — "immune to this devil's Unnerving Gaze for 24 hours" |
| regain_hp | 22 | 22 | aboleth / Mucus Cloud — "regain Hit Points" |
| temporary_hit_points | 9 | 9 | swarm of crawling claws / Swarm — "Temporary Hit Points" |
| speed_reduced | 14 | 14 | adult brass dragon / Scorching Sands — "Speed is halved" |
| cant_take_reactions | 6 | 6 | balor / Lightning Blade — "can't take Reactions" |
| cant_regain_hp | 13 | 13 | aboleth / Mucus Cloud — "can't regain Hit Points" |
| hp_max_reduced | 12 | 12 | clay golem / Slam — "Hit Point maximum decreases" |
| ability_score_reduction | 1 | 1 | shadow / Draining Swipe — "Strength score decreases" |
| swallowed | 42 | 8 | behir / Swallow — "swallow" |
| pushed | 11 | 11 | air elemental / Whirlwind — "pushed up to 20 feet" |
| pulled | 3 | 3 | balor / Flame Whip — "pulls the target up to 25 feet" |
| frightful_presence | 4 | 4 | adult black dragon / Frightful Presence — "frightful presence" |
| legendary_resistance | 32 | 32 | aboleth / Legendary Resistance — "legendary resistance" |
| disease | 0 | 0 | — |
| curse | 33 | 15 | aboleth / Mucus Cloud — "curse" |
| lycanthropy | 0 | 0 | — |
| shape_change | 34 | 20 | clay golem / Immutable Form — "shape-shift" |
| teleport | 21 | 15 | balor / Teleport — "teleport" |
| ongoing_damage_start_of_turn | 5 | 5 | animated rug of smothering / Smother — "takes 10 (2d6 + 3) Bludgeoning damage at the start of each of its turns" |
| auto_fail_save | 1 | 1 | sprite / Heart Sight — "automatically fail" |
| creature_type_exception | 0 | 0 | — |
| touch_hit_retaliation | 1 | 1 | black pudding / Corrosive Form — "hits the pudding with a melee attack" |

### Methodology note (5.5e)

Produced by [`scripts/monster-effect-scan/scan.mjs`](../scripts/monster-effect-scan/scan.mjs),
which fetches `GET /monsters/5.5e` and `GET /monsters/5.5e/{slug}` for every monster and
regex-scans the `desc` of every array field whose entries have one (currently actions,
bonus_actions, reactions, legendary_actions, special_abilities). Curly apostrophes and
non-breaking spaces are normalized first. Regenerate the tables with
`node scripts/monster-effect-scan/scan.mjs`; list every hit for one category with
`--hits <key>` (`--keys` lists the keys) and cache the API data with `--cache <file>`.

At least three hits per category were checked against the source text. Counts are still
regex-based and should be read as "at least this many": some text still carries PDF line-break
hyphens (death dog "Hit Point max- imum"), which the patterns miss. The live API can change between runs,
so compare the run date and monster count above before relying on the numbers.
