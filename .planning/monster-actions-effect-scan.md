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
