# Effects — SRD 5.1 + 5.2 Catalogue and Unified Schema (v2)

Companion to [effects-schema.md](./effects-schema.md) (gap analysis, Gaps 1–34) and
[effects-implementation-plan.md](./effects-implementation-plan.md). This document records the
full sweep of both SRDs and how every effect shape found maps onto **one** schema:
[src/schemas/hk-effects-schema.json](../src/schemas/hk-effects-schema.json) (v2).

## 1. Scope and method (2026-09-29)

Sources in the repo root: `SRD-OGL_V5.1.pdf` (2014) and `SRD_CC_v5.2.pdf` (2024).

- **Read in full (5.2):** Rules Glossary (all conditions, actions, hazards, Concentration,
  Exhaustion, Bloodied, cover, senses), Gameplay Toolbox (contagions, curses, environment, fear
  and mental stress, all poisons and traps), every class and subclass feature, species, feats,
  weapon properties and mastery properties, all ~340 spells.
- **Filtered read (5.2):** every magic-item sentence with a mechanical keyword (414 sentences),
  every distinct monster trait/action name in both editions (515 names), with the unusual ones
  read in full.
- **Targeted diff (5.1):** 2014 conditions and Exhaustion table, combat rules (surprise,
  underwater, death saves, massive damage), diseases, madness, poisons, 2014 versions of class
  features and spells that differ from 2024 (Rage, Barkskin, Resistance, Contagion, Sanctuary…).
- **Pattern mining:** a 160-pattern regex sweep over both texts (counts per edition and section)
  to make sure nothing frequent was missed. Earlier API scans of the 2014 and 2024 monster corpora
  ([monster-actions-effect-scan.md](./monster-actions-effect-scan.md), plan §0c) are included.

**Out of scope for the Effect schema** (stay descriptive text or are handled elsewhere):
stat-block replacement (Wild Shape, Polymorph, Shapechange, True Polymorph), summons and
controlled creatures, teleportation and planar travel, illusions and divination, object and
terrain state (walls, fog, webs as terrain, item destruction, weapon penalties from Black Pudding),
economy/downtime, per-day and recharge usage (already action-level: `limit`, `recharge`).

**Validation:** v2 compiles under Ajv 8 strict mode, validates all 44 existing definitions in
`src/data/5e|5.5e/{conditions,effects}.js`, and validates 55 stress-test encodings of the hardest
SRD effects (41 definitions, 12 applications, 2 monster actions — examples in §5), and rejects
invalid input (unknown types, triggers, missing references).

## 2. The model: four shapes in one schema file

| Shape | `$ref` | Where it lives | Carries |
|---|---|---|---|
| **Effect definition** | root | `src/data/{edition}/*.js`, user custom effects, later the API | what the effect *does*: `sub_effects`, `aura`, `area`, `stacking`, `level`, intrinsic `condition` / `ends_when` / `sustain` |
| **Application** | `$defs/application` | Effects drawer, monster actions, spells, `apply_effect` | *how it's applied*: `duration`, save to resist, `choices`, initial `level`, concentration link |
| **Active instance** | `$defs/active_instance` | Firestore, on the entity (plan 2b/2d) | reference + runtime state: `caster_key`, `applied_round`, `rounds_remaining`, `level`, `charges`, save counters, `parent_id`, `concentration_id` |
| **Action effects** | `$defs/action_effects` | monster actions / spells (plan steps 6–7) | 2024 stat-block branches: `save`, `on_hit`, `on_miss`, `on_fail`, `on_success`, `always` |

**Edition handling:** one schema, two data sets. 5e and 5.5e definitions share `key`s and differ
only in content (e.g. `exhaustion` in both files, different `sub_effects`). The campaign edition
picks the file (plan §0).

### Key design decisions

1. **Durations never live on definitions** (plan 2c). All ending logic — time, next-turn
   anchors, save-ends, escape, cancel triggers, state-based ends, expiry side effects — is in
   `$defs/duration`, and the parts combine ("1 minute, or until it takes damage, repeat the save at
   the end of each turn").
2. **Perspective instead of more types.** `perspective: "against"` turns any roll modifier into
   "rolls made against the holder" (Sundering Blow +5, Elusive, Greater Magic Resistance).
   `grant_advantage` / `grant_disadvantage` stay as legacy spellings of advantage/disadvantage +
   `against`.
3. **One filter vocabulary.** Every "only if…" in the SRD is a `condition_set` of
   `condition_check`s with a `subject` (`self`, `counterpart`, `caster`, `trigger_source`), or a
   roll filter on the sub-effect (`abilities`, `skills`, `attack_types`, `damage_types`,
   `creature_types`, `source`, `context`). Checks the engine can't evaluate (line of sight,
   equipment, environment) carry a `description` and become DM prompts.
4. **Composition over copying.** `includes` (lifetime-linked sub-condition), `apply_effect`
   (independent triggered application) and `remove_effect` let conditions build on each other,
   so 2024 Incapacitated rules flow into Paralyzed, Stunned, Petrified and Unconscious.
5. **Values are amounts.** Everywhere a number appears it may be a number, dice, or a formula over
   documented variables (`pb`, `*_mod`, `level`, `class.rage_damage`, `damage_taken`,
   `caster.*`…), with `scaling`, `multiplier`, `min`/`max`.
6. **Engine tiers.** Every construct is valid data even if the engine only surfaces it. §3 marks
   each as **A** (automatable in plan step 3), **P** (prompt the DM at the right moment), or
   **D** (descriptive reminder). Automation can land incrementally without changing data.

## 3. Catalogue: effect shapes → schema

Counts are paragraph-level pattern hits (5.1 / 5.2) and read as "at least this common".

### 3.1 d20 rolls

| Effect shape | Schema | Examples | Tier |
|---|---|---|---|
| Advantage / Disadvantage on own rolls, filtered by roll kind and ability | `advantage` / `disadvantage` + `sub_types` (`attack`, `ability`, `skill`, `save`, `death_save`, `initiative`, `concentration_save`, `d20_test`) + `abilities` / `skills` / `attack_types` / `context` | Poisoned, Frightened, Enhance Ability, Magic Resistance (vs `source.magical`), Dwarven Resilience (vs `source.conditions: [poisoned]`), Heavy weapon under Str 13, Bestow Curse ability | A |
| Rolls against the holder have Adv/Disadv | same + `perspective: "against"` (or legacy `grant_*`) | Blinded, Restrained, Dodge, Blur, Reckless Attack, Foresight, Holy Aura, Boots of Speed (opportunity attacks) | A |
| Conditional on the other party | `condition` with `subject: "counterpart"` (`distance`, `can_see`, `is_caster`, `creature_type`, `sense`, `ally_adjacent`, `missing_hp`, `has_condition`) | Prone (within 5 ft), Grappled (except vs grappler), Pack Tactics, Precise Hunter, Grappler feat, Blur (ignored by Blindsight/Truesight), Protection from Evil and Good | A/P |
| Next roll only | any roll modifier + `consume: { uses: 1, on: "roll" }` | Guiding Bolt, Help, Vex, Sap, Vicious Mockery, Steady Aim, Staggering Blow, Stunning Strike success | A |
| Dice bonus/penalty on rolls | `bonus` + `roll` (negative `fixed_val` or dice) | Bless +1d4, Bane −1d4, Guidance, Bardic Inspiration (`consume` on `fail`), Ray of Enfeeblement −1d8 damage | A |
| Flat / formula bonus | `bonus` + `value` (number or formula) | Aura of Protection (`caster.cha_mod`, min 1), Cloak of Protection, Luckstone, Raise Dead −4, Enthrall −10 passive Perception, Alert (+`pb` initiative), Jack of All Trades (`half` proficiency) | A |
| Level-scaled penalty | `bonus` + `scaling: { by: "level" }` | 2024 Exhaustion −2/level on D20 Tests; 2014 Sight Rot −1/level | A |
| Reroll | `reroll` + `reroll_condition`, `keep`, `reroll_bonus`, `with_advantage` | Halfling Luck (natural 1), Indomitable (+Fighter level), Countercharm (with Advantage), Luck Blade, Heroic Inspiration, 2014 Great Weapon Fighting | P |
| Minimum die / total | `roll_floor` + `applies_to` | Reliable Talent (≤9 → 10), 2024 Great Weapon Fighting (1–2 → 3), Indomitable Might (total ≥ Str score), Glibness (15), Survivor death save 18–20 | A |
| Auto succeed / auto fail | `auto_success` / `auto_fail` (+ `perspective: "against"` for auto-miss) | Paralyzed/Stunned Str+Dex saves, Legendary Resistance, Greater Magic Resistance, Blight vs Plants, Ring of Evasion, Stroke of Luck | A/P |
| Crit rules | `critical` + `crit_range`, `incoming_crit_range`, `negate_incoming_crit`, `extra_crit_dice` | Improved/Superior Critical (19/18), Paralyzed/Unconscious within 5 ft, Adamantine Armor, 2014 Brutal Critical | A |
| Can't gain a benefit | `deny` + `advantage`, `condition_benefit` (+ `conditions`), `cover`, `hidden` | Elusive (no Advantage against), Faerie Fire / Shining Smite / Starry Wisp (can't benefit from Invisible), Mind Spike (not vs caster), Sacred Flame / Oathbow (ignore cover) | A/P |

### 3.2 Numeric values (AC, speed, HP, scores, DCs)

| Effect shape | Schema | Examples | Tier |
|---|---|---|---|
| Add to a value | `bonus` | Shield +5 AC, Shield of Faith +2, Haste +2 AC, Slow −2 AC/Dex saves, Longstrider +10, Ioun Stone +2 score, Innate Sorcery +1 spell DC, Robe of the Archmagi +2 DC/spell attack | A |
| Set a base others modify | `base` (formula) | Mage Armor 13+Dex, Unarmored Defense 10+Dex+Con/Wis, Draconic Resilience, 2014 Exhaustion speed/max HP halved (`multiplier: 0.5`) | A |
| Set and lock | `fixed` | Speed 0 "and can't increase", Wish stress Strength 3, Boots of Striding… (see floor) | A |
| Can't go below / above | `floor` / `cap` | Barkskin AC ≥17 (2024) / ≥16 (2014), Boots of Striding and Springing Speed ≥30, Ioun Stone max 20, Preserve Life heals up to half max HP | A |
| Multiply | any numeric + `multiplier` | Speed halved (Spirit Guardians, Slowing Breath, Torpor), doubled (Haste, Boots of Speed), HD healing ×2 / ×0.5 (Periapt of Wound Closure, Sewer Plague) | A |
| Max HP up/down | `bonus` + `max_hp` (+ `also_heal`) / negative; linked to damage with `{ formula: "last_damage" }` | Aid, Heroes' Feast, Harm, Life Drain, Draining Kiss, Rotting Fist (−3d6 per 24 h) | A |
| Temporary HP | `fixed` + `temp_hp` + `stacking`, `expires_with_effect`; recurring via `trigger` | False Life, Heroism (each start of turn), Polymorph (vanish on end), Wild Shape (Druid level), Dark One's Blessing (`on_kill`) | A |
| Ability score change | `bonus` / `fixed` + `ability_score` (+ `outcome` death at 0) | Shadow Strength Drain (until rest), Ioun Stones, Wish stress, Manuals (permanent — out of combat) | A |
| Size | `bonus` + `size` (±categories) | Enlarge/Reduce, Goliath Large Form | D |
| Senses | `sense` + `range` | Darkvision spell 150 ft, Feral Senses (Blindsight 30), True Seeing (Truesight 120), See Invisibility, Goggles of Night (+60) | D |
| Proficiency | `proficiency` + `proficiency_level` | Disciplined Survivor (all saves), Slippery Mind, Bracers of Archery, Jack of All Trades (`half`), Expertise | A |
| Use a different ability | `score_swap` + `from_ability` / `to_ability` | Martial Arts (Dex), Shillelagh / True Strike / Pact of the Blade (spellcasting), Primal Knowledge (Str for skills) | A |

### 3.3 Damage, healing and defenses

| Effect shape | Schema | Examples | Tier |
|---|---|---|---|
| Damage over time / on a turn edge | `damage` + `trigger` (`start_turn_target`, `end_turn_target`, `*_caster`) (+ `save`) | Burning hazard 1d4, Searing Smite, Ensnaring Strike, Acid Arrow / Vitriolic Sphere (end of next turn, then expire), Heat Aura, Fire Aura | A |
| On-hit riders | `damage` + `trigger: "on_hit"` + `target: "counterpart"` + `trigger_filter` + `frequency: "once_per_turn"` | Sneak Attack, Divine Strike, Hunter's Mark, Radiant Strikes, Divine Favor, Flame Tongue, Dragon Slayer (+`creature_types`) | A |
| Caster-linked damage on the holder | `damage` on the target + `trigger: "on_hit_taken"` + `trigger_filter.by: "caster"` | Hex, Bestow Curse (+1d8 necrotic) | A |
| Retaliation | `damage` + `trigger: "on_hit_taken"` / `damage_taken` + `target: "trigger_source"` + `trigger_filter.within` | Fire Shield, Barbed Hide, Azer, Corrosive Form, Storm's Thunder | A |
| Area damage while inside | `damage` + `on_enter_area` / `start_turn_in_area` / `end_turn_in_area` + `frequency: "once_per_turn"` + `save` | Spirit Guardians, Cloudkill, Moonbeam, Wall of Fire, Spike Growth (`on_move`), Web, Sleet Storm, Guardian of Faith | P |
| Save for half / none | `save.on_success: "half"` / `"negate"`; branches in `action_effects` | Every breath weapon and blast spell (5.1: 125, 5.2: 141 paragraphs) | A |
| Resistance / vulnerability / immunity | `defense` `r`/`v`/`i` + `damage_types` / `all_damage` / `except_damage_types` / `bypass` / `source` | Rage, Stoneskin, Superior Defense (all except Force), Petrified (all), Flesh Rot (vulnerable to all), 2014 "nonmagical attacks" (`bypass: ["magical"]`), Fiendish Resilience 2014 (`bypass: ["magical","silvered"]`), Shield of Missile Attraction (`attack_types: ["ranged_weapon"]`) | A |
| Condition and mechanic immunity | `defense` `i` + `conditions` / `mechanics` (+ `suppress_existing`) | Heroism, Mind Blank, Aura of Courage/Devotion, Calm Emotions (suppresses existing), Freedom of Movement (`speed_reduction`, magical Paralyzed/Restrained), Aura of Life (`max_hp_reduction`), Trance (`sleep`) | A |
| Reduce / halve / negate incoming | `damage_modifier` `reduce_damage` (amount), `halve_damage`, `negate_damage` (+ `source.spell_names`) | Deflect Attacks 1d10+Dex+level, Stone's Endurance, Resistance cantrip 1d4 once per turn, Ring of Warmth 2d8 cold, Uncanny Dodge (halve), Shield / Brooch vs Magic Missile | P |
| Evasion | `damage_modifier` `evasion` + `abilities: ["dexterity"]` | Evasion (Monk, Rogue, Ranger 2014) | A |
| Drop to 1 instead | `damage_modifier` `floor_at_1` + `trigger: "on_zero_hp"` + `consume` / `save` | Death Ward, Relentless Endurance, Undead Fortitude (DC `5 + damage_taken`), Relentless Rage (HP = 2×level), Gift of the Protectors | P |
| Damage threshold | `damage_modifier` `threshold` | Objects and structures, Rolling Stone | A |
| Heals instead | `damage_modifier` `absorb` + `damage_types` | Clay Golem Acid Absorption, Flesh Golem Lightning, Iron Golem Fire | A |
| Transfer / copy damage | `damage_modifier` `transfer` + `fraction`, `copy`, `to` | Warding Bond (copy to caster), Shield Guardian Bound (half to guardian), Cloaker Attach / Rug Damage Transfer (half to grappled) | A |
| Redirect a hit | `damage_modifier` `redirect_damage` + `charges` | Mirror Image, Redirect Attack (goblin), Arrow-Catching Shield | P |
| Bypass defenses (outgoing) | `damage_modifier` `bypass_resistance` / `bypass_immunity` + `direction: "outgoing"` | Boon of Irresistible Offense, Vorpal Sword (slashing), Overchannel self-damage | A |
| Change damage type (outgoing) | `damage_modifier` `convert_type` + `to_type` | Empowered Strikes (Force), Sacred Weapon (Radiant), Transmuted Spell, Pact of the Blade | P |
| Maximize | `special` `max_damage` / `max_healing` | Overchannel, Supreme Healing, Beacon of Hope (incoming healing) | A |
| Healing received / dealt | `bonus` + `healing` / `healing_received` (+ `multiplier`, `source`) | Disciple of Life (+2+slot level), Blessed Healer, Periapt of Wound Closure | A |
| Can't regain HP / temp HP | `restrict` `healing` / `temp_hp` | Chill Touch, Sword of Wounding, Swarm trait, Rotting Fist curse, Pale Tincture | A |
| Instant outcomes | `outcome` `death`, `unconscious`, `stable`, `destroyed`, `drop_to_1`, `break_concentration`, `removed`, `revert_form` (+ `condition` HP threshold) | Power Word Kill (≤100 HP), Divine Word bands, Mace of Disruption (≤25), Exhaustion 6, Knocking Out, Earthquake/Sleet Storm (lose Concentration), Banishment / Hurl Through Hell / Maze (`removed`), Moonbeam (`revert_form`) | A/P |

### 3.4 Action economy, movement and behavior

| Effect shape | Schema | Examples | Tier |
|---|---|---|---|
| Can't take actions etc. | `restrict` + `action`, `bonus_action`, `reaction`, `movement`, `speech`, `attack`, `opportunity_attack`, `magic_action`, `spellcasting`, `verbal_components`, `concentration` | Incapacitated, Confusion (no BA/reactions), Shocking Grasp / Addle (no OA), Rage (no spells or Concentration), Silence (no Verbal), Befuddlement, Gaseous Form | A |
| Partial caps | `restrict` + `limit` / `exclusive` | Slow (one attack; action XOR bonus), Daze / Abjure Foes / optional fear (one of move, action, BA), Slowing Breath | A |
| Can't end a condition, can't rest | `restrict` `stand_up`, `short_rest`, `long_rest` | Hideous Laughter (can't stand), Restless Touch (no Short Rest benefit), Rotting Fist (max HP not restored on Long Rest), Sewer Plague | P |
| Extra actions | `grant_action` + `extra_attack`, `extra_action`, `extra_bonus_action`, `extra_reaction`, `bonus_action_option`, `extra_turn` + `allowed_actions` | Haste, Action Surge, Extra Attack, Cunning Action, Expeditious Retreat, Scimitar of Speed, Reactive (marilith), Hydra Reactive Heads, Thief's Reflexes | D/P |
| Compelled behavior | `compel` + `move_away`, `move_toward`, `move_direction`, `dash`, `dodge`, `attack_nearest`, `drop_held`, `follow_command`, `no_move` | Turn Undead, Fear, Eyebite Panicked, Antipathy/Sympathy, Compulsion, Dissonant Whispers (reaction), Command, Bestow Curse (forced Dodge), Irresistible Dance, Berserk | P/D |
| Forced movement | `forced_movement` `push` / `pull` / `move` + `range` | Thunderwave, Push mastery, Repelling Blast, Gust of Wind, Telekinesis, harpoons | P |
| Movement modes | `fixed` / `bonus` on `fly_speed`, `swim_speed`, `climb_speed`, `burrow_speed`; `special` `hover`, `difficult_terrain` | Fly, Spider Climb, Alter Self, Freedom of Movement (ignore DT), Wind Walk | D |

### 3.5 Composition, triggers and timing

| Effect shape | Schema | Examples |
|---|---|---|
| A condition that includes others | `includes` + `effect` | 2024 Paralyzed/Petrified/Stunned (Incapacitated), Unconscious (Incapacitated + Prone), Turned (Frightened + Incapacitated), Hypnotic Pattern (Charmed + Incapacitated + Speed 0) |
| "X while Y in this way" | a small definition with two `includes` | Crawler Mucus (Paralyzed while Poisoned), Essence of Ether / Oil of Taggit (Unconscious while Poisoned), Malice (Blinded), crocodile (Restrained while Grappled) |
| Triggered application of another effect | `apply_effect` + `trigger` (+ `trigger_filter`, `target`, `duration`) | Slimy Doom (Stunned when damaged), Aversion to Fire, Holy Aura (blind the Fiend that hit you), Multiattack Defense, Studied Attacks (`on_miss`), Cackle Fever |
| Removal | `remove_effect` + `conditions` / `effects` + `count` | Lesser/Greater Restoration, Heal, Power Word Heal, Protection from Poison, Mindless Rage (on enter), Self-Restoration (end of turn), Lay On Hands (−5 pool per condition) |
| Trigger vocabulary | `$defs/trigger` | turn edges (target/caster), `combat_start`, `damage_taken`/`damage_dealt`, `on_attack`/`on_attacked`, `on_force_save`, hit/miss/crit (dealt and taken), `on_natural_20`/`on_natural_1`, save success/fail, `on_check`, `on_d20_fail`, `on_cast`, `on_targeted_by_spell`, `on_condition_applied`, `on_heal`, `on_bloodied`, `on_zero_hp`, `on_death`, `on_kill`, area enter/start/end, `on_move`, rests, `dawn`, `on_apply`, `on_expire` |
| Trigger filters and throttles | `trigger_filter` (`damage_types`, `attack_types`, `natural_roll`, `by`, `within`, `min_amount`, `source`) + `frequency` | Charm Person ends only when caster or allies deal damage; Fire Shield within 5 ft; Hydra 25+ damage; Vorpal on natural 20 |
| Keep-alive | definition `sustain` | 2014 Rage (attacked or took damage since last turn), 2024 Rage (attack, force a save, or Bonus Action) |
| Effect-wide suppression | definition `condition` / `aura.condition` | Aura of Protection and Fear Aura inactive while Incapacitated, Cloak of Displacement off while Speed 0, Evasion/Danger Sense not while Incapacitated |

### 3.6 Durations and ending (`$defs/duration`)

| Pattern | Fields | Examples |
|---|---|---|
| Rounds / minutes / hours / days | `type: "time"` + `value` + `unit` | 1 minute, 8 hours, 24 hours, 7 days (Contagion) |
| Concentration | `type: "concentration"` + max time; cascade via `concentration_id` | most spells |
| Next turn, either creature, either edge | `type: "next_turn"` + `anchor` + `edge` | "until the start of your next turn" (Dodge, Ray of Frost, Sap) vs "until the end of its next turn" (Color Spray 2024 anchors caster/end; Obscure anchors target/end) |
| End of the current turn | `type: "end_of_turn"` | Stinking Cloud Poisoned, Steady Aim Speed 0, Superior Hunter's Defense |
| Until rest / dawn | `type: "rest"` + `rest_type`; `type: "dawn"` | Contact Other Plane (Long Rest), Strength Drain (short or long), item properties |
| Ends early on events | `cancel_triggers` (+ `filter`) | Invisibility (attack, deal damage, cast), Sanctuary, Hypnotic Pattern, Knock Out / Sleep (damage), Charm Person (caster/allies damage) |
| Ends on state | `ends_when` | Grappled (grappler Incapacitated), Turn Undead (caster Incapacitated or dead), Warding Bond (60 ft), Polymorph (temp HP gone), Mage Armor (dons armor) |
| Someone shakes you awake | `ends_by_action` | Sleep, Hypnotic Pattern, Eyebite Asleep, Essence of Ether |
| Save ends | `save` (`triggers`, `advantage_on_triggers`, `costs_action`, `on_fail`, `successes_to_end`, `failures_to_escalate`, `escalate`, `auto_success_after`) | end-of-turn saves (most), on damage (Dominate, Hideous Laughter with Advantage), start of turn (Burnt Othur, Conjure Elemental), start of caster's turn (Prismatic violet), action to repeat (Irresistible Dance), damage on each failure (Phantasmal Killer, Weird), 3/3 counters (Flesh to Stone, 2014 Contagion lock-in, Burnt Othur), escalation (2024 Sleep, basilisk, brass dragon Sleep Breath), "after 1 minute it succeeds automatically" |
| Escape | `escape` (`dc`, `checks`, `by`, `cost`) | Grappled escape DC, Web, Entangle, Ensnaring Strike (holder or creature within reach), Net, Black Tentacles |
| Side effect on expiry | `on_expire` | Haste lethargy |
| Temporary immunity after a success | application `save.immune_on_success` | Frightful Presence, Stench, Fear Aura, Unnerving Gaze, Antipathy (1 minute), Imprisonment (24 h) |

### 3.7 Stacking, levels and resources

| Pattern | Fields | Examples |
|---|---|---|
| Doesn't stack with itself (default) | `stacking.mode: "none"` | 2024 rule for all conditions; Combining Magical Effects |
| Stacks into levels | `stacking.mode: "level"` + `level_track` + `min_level`/`max_level` + `scaling.by: "level"` | Exhaustion 2014 (cumulative rows) and 2024 (−2/−5 per level), Sight Rot (+1 per Long Rest, Blinded at 5), Raise Dead/Resurrection −4 shrinking per Long Rest |
| Most recent replaces | `stacking.mode: "replace"` | Hamstring Blow ("only one at a time — the most recent"), Hex/Hunter's Mark moved to a new target |
| Separate per caster | `stacking.per_caster` | Hunter's Mark from two rangers, Bane from two clerics (DM call) |
| Consumable uses / pools | `consume` + instance `charges` | Mirror Image (3 duplicates), Guardian of Faith (60 damage), Resistance 2014 (one save), Death Ward, Bardic Inspiration die |

### 3.8 Auras and areas

`aura` (radius, affects, include_self, condition, sub_effects) covers Aura of Protection /
Courage / Devotion / Life, Spirit Guardians, Holy Aura, Pass without Trace, Candle of
Invocation, Aura of Authority, Fear Aura, Fire/Heat Aura, Stench, Conjure Minor Elementals (extra
damage vs creatures inside), Antimagic Field (suppression). `area` adds the 2024 `emanation`
shape plus `wall` and `square`. The tracker has no positions: the DM marks who is inside;
enter/start/end-turn-in-area triggers become prompts on those entities.

## 4. Edition differences the schema must carry

Same `key`, different definitions per edition file:

| Key | 5e (2014) | 5.5e (2024) | Fields that differ |
|---|---|---|---|
| exhaustion | 6 cumulative rows (disadv checks → speed ½ → disadv attacks/saves → max HP ½ → speed 0 → death) | −2×level to D20 Tests, −5×level ft Speed, death at 6 | `min_level` rows vs `scaling.by: "level"` |
| incapacitated | can't take actions or reactions | + no Bonus Actions, can't speak, Concentration broken, Disadvantage on Initiative | `restrict` list, `outcome break_concentration`, `initiative` |
| paralyzed / stunned / petrified / unconscious | restate the Incapacitated rules inline, "can't move or speak" | `includes` Incapacitated (and Prone) | `includes` vs inline |
| grappled | Speed 0; ends if grappler Incapacitated | + Disadvantage on attacks vs anyone but the grappler | `condition is_caster negate` |
| invisible | impossible to see without magic; attack Adv/Disadv | + Advantage on Initiative, Concealed | `initiative`, descriptive |
| surprise | rule: can't move or act on first turn, no reaction until it ends (not a condition) | Disadvantage on Initiative | 2014 needs a `combat_state: "first_round"` effect; 2024 only `initiative` |
| rage | ends if not attacked/damaged since last turn; +damage on melee Str attacks | extend by attack / save / Bonus Action; ends on Incapacitated | `sustain` triggers, `ends_when` |
| barkskin | AC can't be less than 16 | AC 17 if lower | `floor` value |
| resistance (cantrip) | +1d4 to one save, then ends | reduce damage of chosen type by 1d4, once per turn | `bonus save consume` vs `damage_modifier reduce_damage frequency` |
| great weapon fighting | reroll 1–2 on damage dice | treat 1–2 as 3 | `reroll` vs `roll_floor` |
| sleep / color spray | HP-pool targeting | save-based; Sleep escalates Incapacitated → Unconscious | application `save` + `escalate` (HP pool is out of scope) |
| contagion | choose a disease; 3 fails lock it in for 7 days | 11d8 + Poisoned, Disadvantage on chosen-ability saves, 3/3 counter | `repeat_save.escalate.lock` vs choice |
| damage qualifiers | "from nonmagical attacks", magical/silvered/adamantine | qualifiers mostly removed | `bypass` |
| multiattack defense | +4 AC vs same attacker for the turn | attacker has Disadvantage on further attacks this turn | `apply_effect` on `trigger_source` vs self `bonus ac` with `condition is trigger_source` |

## 5. Worked examples (validated)

```js
// 2024 Exhaustion
{ key: "exhaustion", name: "Exhaustion", category: "condition",
  stacking: { mode: "level" }, level: { initial: 1, max: 6, per_long_rest: -1, remove_at: 0 },
  sub_effects: [
    { type: "bonus", sub_types: ["d20_test"], scaling: { by: "level", per_unit_value: -2 } },
    { type: "bonus", sub_types: ["speed"], scaling: { by: "level", per_unit_value: -5 } },
    { type: "outcome", sub_types: ["death"], min_level: 6 } ] }

// 2024 Rage
{ key: "rage", name: "Rage", category: "feature",
  ends_when: { any_of: [{ type: "has_condition", value: "incapacitated" }, { type: "equipment", value: "heavy_armor" }] },
  sustain: { triggers: ["on_attack", "on_force_save"], manual_cost: "bonus_action", check: "end_turn_target" },
  sub_effects: [
    { type: "defense", sub_types: ["r"], damage_types: ["bludgeoning", "piercing", "slashing"] },
    { type: "bonus", sub_types: ["damage"], abilities: ["strength"], value: { formula: "class.rage_damage" } },
    { type: "advantage", sub_types: ["ability", "save"], abilities: ["strength"] },
    { type: "restrict", sub_types: ["spellcasting", "concentration"] } ] }

// Hex (definition) + application with a choice
{ key: "hex", name: "Hex", category: "spell", magical: true, spell_level: 1,
  sub_effects: [
    { type: "damage", trigger: "on_hit_taken", trigger_filter: { by: "caster" }, roll: { dice_count: 1, dice_type: 6, damage_type: "necrotic" } },
    { type: "disadvantage", sub_types: ["ability"], choice: "ability" } ] }
{ effect: { source: "srd", source_key: "hex" }, duration: { type: "concentration", value: 1, unit: "hour" }, choices: { ability: "wisdom" } }

// Warding Bond
{ key: "warding-bond", name: "Warding Bond", sub_effects: [
    { type: "bonus", sub_types: ["ac", "save"], value: 1 },
    { type: "defense", sub_types: ["r"], all_damage: true },
    { type: "damage_modifier", sub_types: ["transfer"], copy: true, fraction: 1, to: "caster" } ] }

// Flesh to Stone (application)
{ effect: { source: "srd", source_key: "restrained" },
  save: { ability: "constitution", on_success: "partial", success_effects: [{ type: "fixed", sub_types: ["speed"], value: 0 }],
          auto_success_if: { type: "creature_type", value: "construct" } },
  duration: { type: "concentration", value: 1, unit: "minute",
    save: { ability: "constitution", successes_to_end: 3, failures_to_escalate: 3,
            escalate: { effect: { source: "srd", source_key: "petrified" }, duration: { type: "concentration", value: 1, unit: "minute" } } } } }

// 2024 brass dragon Sleep Breath (action_effects)
{ save: { ability: "constitution", dc: 18 },
  on_fail: [{ effect: { source: "srd", source_key: "incapacitated" },
    duration: { type: "next_turn", anchor: "target", edge: "end",
      save: { ability: "constitution", failures_to_escalate: 1,
        escalate: { effect: { source: "srd", source_key: "unconscious" },
                    duration: { type: "time", value: 10, unit: "minute", cancel_triggers: [{ trigger: "damage_taken" }], ends_by_action: "other" } } } } }] }
```

## 6. What changed from the §4 superset in effects-schema.md

The superset in effects-schema.md §4 and Gaps 1–34 are now expressed in the JSON schema. New in v2:

- **New sub-effect types:** `floor`, `cap`, `roll_floor`, `critical`, `compel`, `deny`, `sense`,
  `proficiency`, `includes`, `apply_effect`, `remove_effect` (`forced_movement` from Gap 23 is in).
- **New fields:** `perspective`, `choice`, `min_level`/`max_level`, `attack_types`,
  `all_damage`, `except_damage_types`, `bypass`, `mechanics`, `creature_types`, `source`,
  `context`, `consume`, `frequency`, `trigger_filter`, `save` (per sub-effect), `limit`,
  `exclusive`, `allowed_actions`, transfer fields (`fraction`, `copy`, `to`), `to_type`,
  `direction`, `suppress_existing`, `also_heal`, `expires_with_effect`.
- **Definition-level:** `key`, `category`, `tags`, `magical`, `spell_level`, `removed_by`,
  `stacking`, `level`, `condition`, `ends_when`, `sustain`, `aura`.
- **New `$defs`:** `amount`/`formula`, `time`, `effect_ref`, `trigger_filter`, `source_filter`,
  `condition_set` (all_of/any_of), `stacking`, `level_track`, `sustain`, `save_spec`,
  `repeat_save`, `escape`, `duration`, `application`, `active_instance`, `action_effects`,
  `consume`.
- **Subtypes:** `ability` now always means *ability checks*; changing a score uses the new
  `ability_score` (replaces the Gap 22 "disambiguate by parent type" rule). New subtypes for
  initiative, passive Perception, spell DC / spell attack, healing, senses, restrict targets,
  compel/deny targets, crit rules, damage-modifier kinds, outcomes.
- **Triggers:** canonical names follow the plan (`on_save_fail`, `on_save_success`,
  `on_zero_hp`); `failed_save`, `success_save`, `zero_hp` remain as accepted aliases.
- **Legacy kept valid:** definition-level `duration_type` / `duration_value` / `cancel_trigger`
  (deprecated, plan 2c), `grant_advantage`/`grant_disadvantage`, `attacker_*` condition types,
  `non_magical_*` damage types, `incoming_crit_range`, `action_removed`/`long_rest` durations.

## 7. Follow-ups

1. **Conditions data files (plan step 8, last):** add `key` to every condition; drop
   `duration_type`/`cancel_trigger` from definitions; rewrite the 5.5e conditions per plan
   §8b using `includes`, `level`, `initiative` and `break_concentration`; encode 2014
   Exhaustion with `min_level` rows (§5). Until then effects read and apply conditions
   through the existing `entity.conditions` / `set_condition` (plan "Working with
   conditions before step 8").
2. **Effects form (plan step 4):** first regenerate `src/utils/effectsConstants.js` from the
   v2 schema (labels + which fields each type shows — the form reads these, not the schema),
   then rework `hk-effects-form.vue` to edit the v2 fields progressively; types marked D in
   §3 need only `description`.
3. **Plan step 2d/2h:** the persisted instance is `$defs/active_instance` (duration as an
   object); see the updated plan.
4. **Engine (plan step 3):** implement tier A first (numeric bonuses, Adv/Disadv incl.
   `perspective`, defenses, DoT/on-hit damage, restrict), then P prompts, keeping D as reminders.
5. **Store the stress-test encodings** as SRD entries when the data files are migrated — they
   double as regression fixtures for the schema.
