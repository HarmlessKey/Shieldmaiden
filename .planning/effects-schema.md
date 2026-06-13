# Effects System — Gap Analysis & Schema Proposal

Source model reviewed: `src/utils/effectsConstants.js`
Reference: D&D 5e (2014 SRD 5.1) and D&D 5.5e (2024 SRD 5.2) Conditions appendices, spell/feature mechanics.

> Note: This document was produced from domain knowledge of the SRD (OGL/CC-licensed open rules
> content), not a verbatim PDF extraction (PDF text extraction tooling was unavailable in this
> environment). Mechanical summaries below are paraphrased, not quoted.

---

## 1. Conditions broken down into the existing effect_type/subtype model

Format per condition: `name | duration_type | cancelable | trigger | sub-effects (type / sub_types)`

Differences between 2014 and 2024 are called out per condition. The 2024 SRD reorganized several
conditions to be defined more consistently (e.g. most "auto-fail/auto-success on Str/Dex saves"
language became unified, Exhaustion was reworked, Prone's attack rules changed).

### Blinded
- duration_type: cancelled (until effect/spell ends)
- cancelable: yes
- sub-effects:
  - `auto_fail` / `ability` (sight-based ability checks) — **2024 adds explicit subtype needed: "checks requiring sight"**
  - `disadvantage` / `attack`
  - `advantage` (granted to attackers) / `attack` — this is a "grants advantage to others" case, see Gap #1

### Charmed
- duration_type: cancelled / trigger (often save-ends)
- cancelable: yes
- sub-effects:
  - `auto_fail` / `descriptive` — "can't attack the charmer or target them with harmful abilities/spells"
  - `advantage` / `ability` or `skill` — charmer has advantage on social checks against the target (a "grant advantage to other creature" case)

### Deafened
- duration_type: cancelled
- cancelable: yes
- sub-effects:
  - `auto_fail` / `ability` — checks/effects requiring hearing

### Exhaustion (2014: levels 1-6, cumulative)
- duration_type: cancelled (removed by long rest reducing level, or special means)
- cancelable: yes (level-based reduction)
- Level 1: `disadvantage` / `ability`, `skill`, `save` (all ability checks)
- Level 2: `base` / `speed` (speed halved)
- Level 3: `disadvantage` / `attack`, `save`
- Level 4: `base` / `max_hp` (hp maximum halved)
- Level 5: `base` / `speed` (speed reduced to 0)
- Level 6: death (special — see Gap #11 "death" effect_type)

### Exhaustion (2024: reworked — single stacking penalty model)
- duration_type: cancelled
- cancelable: yes
- Each level of exhaustion (1-6):
  - `disadvantage` / `roll` (2024 generalizes to "all d20 Tests" — see Gap #2, generic d20 roll subtype)
  - `bonus` / `speed` with a per-level numeric penalty (-5 ft per level) — needs **variable-by-stack** support, see Gap #12
  - At level 6: death

### Frightened
- duration_type: cancelled / trigger (often "while source of fear is in line of sight")
- cancelable: yes
- sub-effects:
  - `disadvantage` / `ability`, `skill` (specifically while source of fear is visible — conditional trigger)
  - `restrict` / `action` — "can't willingly move closer to the source of its fear" (movement restriction — see Gap #5)

### Grappled
- duration_type: cancelled / trigger (escape or grappler incapacitated)
- cancelable: yes
- sub-effects:
  - `fixed` / `speed` (speed becomes 0)
  - `special` / `descriptive` — ends if grappler is incapacitated or moved out of reach

### Incapacitated (2024 expanded definition vs 2014)
- duration_type: cancelled
- cancelable: yes
- sub-effects:
  - `restrict` / `action`, `reaction` (2024 also explicitly restricts bonus actions and speaking — see Gap #4 "bonus_action" subtype)
  - 2024 also: can't take reactions, and Concentration is unaffected unless otherwise stated (note for documentation only)

### Invisible
- duration_type: cancelled / time
- cancelable: yes
- sub-effects:
  - `advantage` / `attack` (target's attacks made with advantage — invisible attacker)
  - `disadvantage` / `attack` (attacks against the target have disadvantage)
  - `special` / `descriptive` — heavily affects detection/Perception, not easily modeled numerically

### Paralyzed
- duration_type: cancelled / trigger
- cancelable: yes
- sub-effects:
  - `restrict` / `action`, `reaction` — incapacitated (implies all of Incapacitated)
  - `fixed` / `speed` (speed 0)
  - `auto_fail` / `save` (Str and Dex saving throws)
  - `advantage` / `attack` (attacks against the target have advantage)
  - `special` / `crit` — any hit that connects is a critical hit if attacker is within 5ft (auto_success on crit subtype already exists, but this is "any hit becomes a crit" — see Gap #6)

### Petrified
- duration_type: cancelled
- cancelable: yes
- sub-effects:
  - `restrict` / `action`, `reaction` — incapacitated
  - `fixed` / `speed` (speed 0)
  - `auto_fail` / `save` (Str and Dex)
  - `advantage` / `attack` (attacks against target have advantage)
  - `defense` / `r` — resistance to all damage
  - `defense` / `i` — immune to poison and disease (condition immunity already supported via `i` + `conditions`)
  - `special` / `descriptive` — weight increases x10, target stops aging

### Poisoned
- duration_type: cancelled / trigger
- cancelable: yes
- sub-effects:
  - `disadvantage` / `attack`, `ability` (skill checks)

### Prone
- duration_type: cancelled / trigger (stand up uses movement)
- cancelable: yes
- sub-effects:
  - `disadvantage` / `attack` (target's attack rolls)
  - 2014: `advantage` / `attack` for melee attackers within 5ft, `disadvantage` / `attack` for ranged attackers — **conditional-on-attacker-position, see Gap #7**
  - 2024 simplification: attacker has advantage if within 5 feet, otherwise disadvantage (same dual-condition issue)
  - `restrict` / `action` — movement only via crawling unless standing (special movement restriction)

### Restrained
- duration_type: cancelled / trigger
- cancelable: yes
- sub-effects:
  - `fixed` / `speed` (speed 0)
  - `disadvantage` / `attack` (own attack rolls)
  - `advantage` / `attack` (attacks against target have advantage)
  - `disadvantage` / `save` (Dex saving throws)

### Stunned
- duration_type: cancelled / trigger
- cancelable: yes
- sub-effects:
  - `restrict` / `action`, `reaction` — incapacitated
  - `auto_fail` / `save` (Str and Dex)
  - `advantage` / `attack` (attacks against target have advantage)

### Unconscious
- duration_type: cancelled / trigger
- cancelable: yes
- sub-effects:
  - `restrict` / `action`, `reaction` — incapacitated
  - `fixed` / `speed` (speed 0)
  - `special` / `descriptive` — drops what it's holding, falls prone
  - `auto_fail` / `save` (Str and Dex)
  - `advantage` / `attack` (attacks against target have advantage)
  - `special` / `crit` — melee crit within 5ft (same as Paralyzed)

### New/notable 2024 condition: "Dying" (replaces some "0 HP" handling)
- 2024 SRD formalizes a "Dying" condition for creatures at 0 HP that aren't already dead/stable
- sub-effects:
  - `restrict` / `action`, `reaction`, `bonus_action` (incapacitated)
  - `fixed` / `speed` (0)
  - `special` / `descriptive` — must make death saving throws, falls prone

### New/notable 2024 condition: "Surprised"
- duration_type: trigger (until end of creature's first turn)
- sub-effects:
  - `restrict` / `action`, `reaction`, `bonus_action` — can't move or take actions/reactions on first turn of combat
  - (existing model already mostly covers via `restrict`)

---

## 2. Gaps — additional effect_types and effect_subtypes needed

### Gap 1: "Grant" effect type — granting advantage/disadvantage/bonus TO OTHER creatures against the target
**Problem:** Current `advantage`/`disadvantage` effect_types apply to the target's own rolls. Many
effects instead grant advantage/disadvantage to **other creatures** acting against/with the target
(e.g. Blinded grants advantage to attackers; Charmed grants advantage to the charmer's social
checks; Pack Tactics-like effects; Faerie Fire grants advantage to all attackers).

**Proposal:** Add a `granted` flag (boolean) on `advantage`/`disadvantage` effect entries, OR add new
effect_types:
- `grant_advantage` — "Other creatures gain advantage against/with the target"
- `grant_disadvantage` — "Other creatures gain disadvantage against/with the target"
  - subtypes: `attack` (attacks against target), `ability`, `skill`, `save`

**Examples:**
- *Faerie Fire* (spell) — affected creatures can't benefit from invisibility, and attack rolls
  against them have advantage if the attacker can see them.
- *Charmed* condition — the charmer has advantage on social ability checks with the target.
- *Pack Tactics* (Monster feature, e.g. wolves) — advantage on attack roll if an ally is within 5
  feet of the target.

### Gap 2: Generic "d20 test" / "all rolls" subtype
**Problem:** Effects like 2024 Exhaustion ("disadvantage on all d20 Tests") and *Bane*/*Bless*
(bonus to attack rolls and saving throws) apply broadly across attack/ability/skill/save/death_save
categories at once. Currently each subtype must be listed individually.

**Proposal:** Add subtype `d20_test` (meaning: applies to ALL d20 rolls — attacks, ability checks,
skill checks, saving throws, death saves) to `advantage`, `disadvantage`, and `bonus` effect_types.

**Examples:**
- *Bless* — bonus (1d4) to attack rolls and saving throws (two specific subtypes, but...)
- 2024 *Exhaustion* — disadvantage on all d20 Tests (single `d20_test` subtype)
- *Guidance* — bonus (1d4) to one ability check (could stay specific, but generic helps catch-all effects like *Heroes' Feast* immunity to fright + advantage on Wisdom saves... actually that's specific; better example: *Aid*-like "advantage on all saving throws" effects)

### Gap 3: Reroll mechanics
**Problem:** Many features let you reroll a die (and take new or higher result): *Great Weapon
Fighting*, *Halfling Luck*, *Bless*-adjacent "reroll a 1 or 2", *Lucky* feat, *Portent* (Wizard).
No existing effect_type captures "reroll".

**Proposal:** New effect_type `reroll`:
- description: "Reroll specified dice under given conditions and use new or better result"
- subtypes: `attack`, `damage`, `ability`, `skill`, `save`, `death_save`
- fields: `reroll_condition` (e.g. "result is 1 or 2", "result is 1"), `keep` (`new` | `higher` | `lower`)

**Examples:**
- *Great Weapon Fighting* — reroll a 1 or 2 on a damage die, must use new roll.
- *Halfling Luck* — reroll a 1 on a d20, must use new roll.
- *Lucky* (feat) — reroll any d20 (attack/ability/save), choose which to use.

### Gap 4: Bonus action restriction subtype
**Problem:** `restrict` effect_type currently only has `action`, `reaction`, `attack` subtypes. Many
conditions/effects restrict bonus actions specifically (Incapacitated in 2024, Dying, certain
spells like *Hold Person* implications, *Haste* — "can't use the extra action for anything but
Attack/Dash/Disengage/Hide/Use an Object" — a more granular restriction).

**Proposal:** Add subtype `bonus_action` to `restrict`. Also consider subtype `movement` (see Gap 5)
and `speech` / `communication` (Incapacitated 2024 explicitly: "can't speak").

**Examples:**
- *Incapacitated* (2024) — can't take actions, bonus actions, or reactions; can't speak.
- *Dying* (2024) — same restrictions as Incapacitated.
- *Command* (spell, "Grovel"/"Halt") — restricts specific actions for one round.

### Gap 5: Movement-type restrictions and movement-type grants
**Problem:** `restrict`/`action` doesn't capture "can't move", "can't move closer to X", or granting
new movement modes (fly, climb, burrow, swim speeds), which are extremely common in spells
(*Fly*, *Spider Climb*, *Levitate*, *Freedom of Movement*) and conditions (Frightened's "can't move
closer to source of fear", Restrained's speed-0).

**Proposal:**
- Add subtype `movement` to `restrict` — "target cannot move" or "cannot move closer to X" (with a
  `descriptive` qualifier field for conditional restrictions).
- Add new effect_subtypes for movement types under `bonus`/`base`/`fixed`: `fly_speed`,
  `climb_speed`, `swim_speed`, `burrow_speed` (in addition to existing generic `speed` which is
  treated as walking speed).
- Add subtype `difficult_terrain` under `special` — "target treats an area as difficult terrain" or
  "target ignores difficult terrain".

**Examples:**
- *Fly* (spell) — grants a flying speed equal to current speed (`fixed`/`fly_speed`).
- *Spider Climb* — grants climbing speed equal to walking speed, can move on vertical surfaces
  (`fixed`/`climb_speed` + `special`/`descriptive`).
- *Freedom of Movement* — target's speed isn't reduced and ignores difficult terrain
  (`special`/`difficult_terrain` + immunity interactions with Restrained/Grappled — see Gap 9).
- *Frightened* — can't willingly move closer to the source of fear (`restrict`/`movement` with
  conditional descriptor).

### Gap 6: "Auto-crit" / critical hit modifiers
**Problem:** Paralyzed/Unconscious turn any hit within 5ft into a critical hit. The existing
`auto_success`/`crit` subtype is closer to "this roll automatically counts as a crit for the
roller", but the *target's condition* causing incoming attacks to crit is different — it's a
property applied to the attacker's roll based on the target's state.

**Proposal:** Add effect_type `crit_modifier` (or extend `special`):
- New subtype under `special`: `incoming_crit_range` — "any hit against this target that lands
  within range X is treated as a critical hit" (fields: `range`).
- Alternatively, extend `auto_success`/`crit` to allow a `condition` field describing "attacker
  within 5ft of target".

**Examples:**
- *Paralyzed* — any hit against the target is a critical hit if the attacker is within 5 feet.
- *Unconscious* — same as Paralyzed.
- *Assassinate* (Rogue feature) — attacks against a surprised creature are automatically critical
  hits (different trigger, same mechanical category).

### Gap 7: Conditional effects based on attacker/caster position or state
**Problem:** Prone's attack-roll modifiers depend on the *attacker's* distance from the target
(melee within 5ft = advantage; otherwise/ranged = disadvantage). The current schema has no way to
express "this effect applies only if [condition about the other creature]".

**Proposal:** Add an optional `condition` object to any sub-effect entry:
```js
condition: {
  type: "attacker_distance" | "attacker_has_condition" | "target_has_condition" | "line_of_sight",
  value: <some descriptor>,
}
```
This is schema-level (applies to the data instance, not the constants file), but the constants
file should define a `conditions_meta` list of allowed `condition.type` values so the UI can offer
them.

**Examples:**
- *Prone* — advantage to melee attackers within 5ft, disadvantage to all other attacks.
- *Spirit Guardians* (spell) — only affects creatures that fail a save AND are within the aura.
- *Sentinel* (feat) — reaction attack triggers only when an adjacent creature attacks someone else.

### Gap 8: Area-of-effect / multi-target descriptors
**Problem:** Many spells affect an area (line, cone, sphere, cube) and apply effects to all
creatures within, often with a save for half/no effect. The schema currently models single-target
effect bundles; AoE shape/size isn't represented.

**Proposal:** Add a top-level `area` object to the effect definition (not a new effect_type, but a
metadata block):
```js
area: {
  shape: "sphere" | "cone" | "cube" | "line" | "cylinder",
  size: <number>, // feet
  origin: "caster" | "point" | "target",
}
```

**Examples:**
- *Fireball* — 20-ft-radius sphere, Dex save for half damage.
- *Spirit Guardians* — 15-ft-radius aura centered on caster.
- *Wall of Fire* — line/wall shape with two-sided damage.

### Gap 9: Damage negation / halving (distinct from resistance)
**Problem:** `defense`/`r` (resistant) halves damage from a *damage type*, which is a passive
trait. But many *spell effects* halve or negate **incoming damage from a specific triggering
event** regardless of type (e.g. *Heroism* doesn't, but *Shield* blocks Magic Missile entirely;
*Absorb Elements*; *Halt*; or "half damage on a successful save" which is a save-dependent
modifier on the damage roll itself, not a standing resistance).

**Proposal:** Add subtypes to `special` (or a new effect_type `damage_modifier`):
- `halve_damage` — "halve the incoming damage from [trigger]" (fields: `damage_types` filter,
  optional)
- `negate_damage` — "negate/prevent incoming damage entirely from [trigger]" (fields:
  `damage_types`, `max_amount` optional)
- `redirect_damage` — "redirect damage to another target/source" (e.g. *Hellish Rebuke* isn't this,
  but *Compelled Duel* / certain Paladin auras are)

**Examples:**
- *Evasion* (Rogue) — on a successful Dex save against an effect that deals half damage on success,
  take no damage instead, and only half on a failed save.
- *Absorb Elements* — next melee hit deals no damage from the chosen type and you gain a bonus
  to your next damage roll instead.
- *Heavy Armor Master* (feat) — reduce non-magical bludgeoning/piercing/slashing damage by 3.
  (this is closer to a flat damage reduction — see also `fixed`/`max_damage` style but as a
  reduction, not a cap)

### Gap 10: Ability score swap / score-as-another-score
**Problem:** Some features let you use one ability score in place of another for specific rolls
(e.g. *Tavern Brawler* lets you add Strength to unarmed strike damage even if not your primary;
more clearly, *Drunken Master*-like or *Battle Master*... the clean canonical example is **Wisdom
(or another score) used instead of another for specific checks**, common in subclass features and
in 2024's "Weapon Mastery"/"unarmed strike" rules where Strength **or** Dexterity can be used).

**Proposal:** Add effect_type `score_swap` (or subtype `ability_substitute` under `special`):
- description: "Use ability score A in place of ability score B for specified roll types"
- fields: `source_ability`, `target_ability`, `applies_to` (attack/damage/save/skill)

**Examples:**
- 2024 *Unarmed Strikes/Light weapons* with Finesse — can use Strength or Dexterity.
- *Drunken Master* (Monk) — Constitution saving throw substitutions in some printings.
- *Tavern Brawler* (feat) — add ability modifier used for the attack roll to damage too.

### Gap 11: Death / instant-defeat effects
**Problem:** Exhaustion level 6 causes death. *Power Word Kill*, *Disintegrate* (reduce to ash if it
drops to 0), Massive Damage rule (2024: instant death if damage from a single source exceeds
current HP maximum after dropping to 0... actually the rule is: if damage reduces you to 0 and
remaining damage ≥ your HP max, you die instantly) are not representable — there's no "death" or
"instant defeat" outcome in the model.

**Proposal:** Add effect_type `outcome`:
- description: "A definitive state change applied to the target (death, petrification trigger,
  etc.)"
- subtypes: `death`, `unconscious`, `stable`, `destroyed` (for objects)
- trigger: true (often tied to a `damage_taken` or `failed_save` trigger)

**Examples:**
- *Exhaustion 6* — death.
- *Power Word Kill* — instant death if target has ≤100 HP.
- Massive Damage rule (2024) — instant death when excess damage at 0 HP ≥ HP maximum.

### Gap 12: Stacking / leveled effects (variable magnitude by stack count)
**Problem:** Exhaustion (both editions) and similar stacking conditions (e.g. some homebrew/poison
stacking, *Bardic Inspiration* uses aren't stacks but...) need a magnitude that scales with a
"level" or "stack count" tracked per-instance, not a fixed numeric value.

**Proposal:** Add a `scaling` field to any numeric effect (`bonus`, `base`, `fixed`, `damage`,
`healing`):
```js
scaling: {
  by: "stacks" | "caster_level" | "spell_level" | "char_level",
  per_unit_value: <number>,
}
```

**Examples:**
- *Exhaustion* (2024) — -5 ft speed per level of exhaustion; disadvantage on d20 tests is
  non-scaling but speed loss is.
- *Eldritch Blast* + *Agonizing Blast* — extra beams scale with character level (handled at the
  "attack count" level, see Gap 13).
- *Sneak Attack* — extra damage dice scale with character level.

### Gap 13: Extra attacks / additional actions granted
**Problem:** *Extra Attack*, *Haste* (extra action), *Action Surge*, *Hunter's Mark*-like "bonus
damage on hit" are not the same as a numeric bonus — they grant additional instances of an action
or attack.

**Proposal:** Add effect_type `grant_action`:
- description: "Grants the target additional actions, attacks, or bonus actions"
- subtypes: `extra_attack`, `extra_action`, `extra_bonus_action`, `extra_reaction`
- fields: `count`, `restrictions` (descriptive)

**Examples:**
- *Extra Attack* (Fighter/etc.) — attack action lets you attack twice.
- *Haste* — extra action limited to Attack/Dash/Disengage/Hide/Use an Object.
- *Action Surge* — one additional action on your turn.

### Gap 14: On-hit / on-crit triggered extra damage (riders)
**Problem:** Effects like *Hunter's Mark*, *Hex*, *Sneak Attack*, *Smite* spells add extra damage
when a specific trigger (hit with weapon attack) occurs — distinct from the existing `damage`
effect_type which is tied to start/end-of-turn-style triggers, not "on hit".

**Proposal:** Add trigger value `on_hit` (and `on_crit`) to `triggers`, usable by the `damage`
effect_type's existing `trigger: true` flag.

**Examples:**
- *Hunter's Mark* — extra 1d6 damage when you hit the marked target with a weapon attack.
- *Sneak Attack* — extra damage dice once per turn on a hit meeting criteria.
- *Divine Smite* — extra radiant damage on a melee weapon hit, doubled on a crit (needs `on_crit`).

### Gap 15: Concentration-check failure consequences
**Problem:** `duration_types` has `concentration`, but there's no representation of "target/caster
must make a Constitution saving throw when damaged or it loses concentration" — this is a rule
about the *caster*, not the target, and ties damage-taken to a save with a specific DC formula
(10 or half damage, whichever is higher).

**Proposal:** This is largely a game-engine rule (apply to all concentration spells uniformly)
rather than a per-effect data field, but to allow exceptions (e.g. features that grant advantage on
concentration saves, like *War Caster*), add subtype `concentration` to `advantage`/`disadvantage`
under the `save` category, or a dedicated subtype `concentration_save`.

**Examples:**
- *War Caster* (feat) — advantage on Constitution saving throws to maintain concentration.
- *Resilient (Con)* — proficiency in Constitution saves, indirectly aiding concentration checks.

### Gap 16: Temporary HP variants — "regain" and "max temp HP cap" behaviors
**Problem:** `temp_hp` exists under `fixed`, but several spells set temp HP with special
interactions: *False Life* (temp HP that doesn't stack, takes the higher value), *Heroes' Feast*
(also grants immunity to fear and advantage on Wisdom saves alongside temp HP — multi-effect
bundle, fine), *Vampiric Touch* (temp HP gained from damage dealt — a derived/conditional gain).

**Proposal:** Add a `stacking` field to `temp_hp` fixed effects:
- `stacking: "highest" | "replace" | "add"` (5e default is "highest doesn't stack, take better
  value" for most temp HP sources)

**Examples:**
- *False Life* — gain temporary hit points equal to 1d4+4 (replace-with-higher).
- *Armor of Agathys* — temp HP at cast, separate damage-on-hit rider (multi sub-effect).
- *Heroes' Feast* — temp HP + condition immunities + save bonus, bundled.

### Gap 17: Damage type immunity granted to self vs imposed on target (clarify direction)
**Problem:** `defense`/`i` with `select: ["damage_types", "conditions"]` is good, but doesn't
distinguish whether the immunity is granted by a beneficial effect (caster buffing target) vs
imposed by a condition (Petrified granting poison immunity as a side effect of the condition
itself). This is more a documentation/UI clarity point than a structural gap — flagging for
schema notes but no new field strictly required beyond clear effect naming.

**Examples:**
- *Petrified* — immune to poison/disease (condition-driven).
- *Protection from Energy* (spell) — resistance to one damage type (buff-driven).
- *Heroes' Feast* — immunity to being frightened and to poison (buff-driven condition immunity).

### Gap 18: Range/reach modifications
**Problem:** Effects like *Reach* weapon properties, *Polymorph* changing reach, *Enlarge/Reduce*
(also affects damage dice and Strength checks/saves) aren't covered. Enlarge/Reduce is a good
multi-faceted example: +/-1 size category, advantage on Str checks/saves (if enlarged), +/-1d4 to
damage, and weight doubles/halves.

**Proposal:** Add subtype `reach` to `bonus`/`base`/`fixed` (numeric, feet). Add subtype `size` to
`special`/`descriptive` for size-category changes (covers most narrative consequences without
needing hard mechanical modeling beyond the explicit numeric pieces, which use existing types:
`bonus`/`damage`, `advantage`/`ability` (Str checks/saves)).

**Examples:**
- *Enlarge/Reduce* — +1d4 damage with Str-based weapons & advantage on Str checks/saves (Enlarge);
  reverse for Reduce; reach +/-5ft.
- *Polymorph* — wholesale stat-block replacement (likely out of scope for per-effect modeling;
  flag as "special/descriptive" catch-all).

---

## 3. New triggers and duration_types needed

### New `triggers`:
| label | value | rationale |
|---|---|---|
| On hit (target hits with an attack) | `on_hit` | Hunter's Mark, Sneak Attack, Smite spells (Gap 14) |
| On critical hit | `on_crit` | Divine Smite extra die, Brutal Critical interactions |
| On being hit (target is hit by an attack) | `on_hit_taken` | Riposte-like reactions, Shield spell trigger |
| On failed saving throw | `failed_save` | Massive Damage / outcome effects (Gap 11), many "on a failed save, X happens" riders |
| On successful saving throw | `success_save` | Evasion-like halved/negated damage (Gap 9) |
| Start of combat / on initiative roll | `combat_start` | Surprised condition (2024), Alert feat |
| On reduced to 0 HP | `zero_hp` | Dying condition (2024), Relentless Endurance, Massive Damage |
| On long rest | `long_rest` | Exhaustion reduction, recharge-based features |
| On short rest | `short_rest` | Recharge-based features (Warlock spell slots, etc.) |

### New `duration_types`:
| label | value | rationale |
|---|---|---|
| Until end of next turn (caster or target) | `next_turn` | Many spells specify "until the end of its next turn" rather than full round-based duration — distinct from generic "time in rounds" since it's relative to whichever turn comes first |
| Instantaneous | `instant` | Effects with no lingering duration (most damage/healing effects) — useful to explicitly mark "no duration tracking needed" rather than defaulting to `time` with 0 |
| Until removed by specific action (e.g. stand up, escape) | `action_removed` | Prone (stand up), Grappled (escape), Restrained — distinguishes from generic `trigger` which implies an external event; here the *target itself* takes an action to end it |
| Permanent / until long rest | `long_rest` | Exhaustion levels (reduced 1 per long rest in 2024, fully removed in 2014 with a long rest... actually 2014 also reduces by 1 per long rest with food/drink) |

---

## 4. Proposed extended effect_types / effect_subtypes (superset)

```js
export const triggers = Object.freeze([
	{
		label: "Start of targets turn",
		value: "start_turn_target",
	},
	{
		label: "End of targets turn",
		value: "end_turn_target",
	},
	{
		label: "Start of casters turn",
		value: "start_turn_caster",
	},
	{
		label: "End of casters turn",
		value: "end_turn_caster",
	},
	{
		label: "On damage taken",
		value: "damage_taken",
	},
	{
		label: "On hit (target lands an attack)",
		value: "on_hit",
	},
	{
		label: "On critical hit",
		value: "on_crit",
	},
	{
		label: "On being hit by an attack",
		value: "on_hit_taken",
	},
	{
		label: "On failed saving throw",
		value: "failed_save",
	},
	{
		label: "On successful saving throw",
		value: "success_save",
	},
	{
		label: "On combat start / surprise round",
		value: "combat_start",
	},
	{
		label: "On reduced to 0 hit points",
		value: "zero_hp",
	},
	{
		label: "On long rest",
		value: "long_rest",
	},
	{
		label: "On short rest",
		value: "short_rest",
	},
]);

export const duration_types = Object.freeze([
	{
		label: "Time in rounds",
		value: "time",
	},
	{
		label: "Until cancelled",
		value: "cancelled",
	},
	{
		label: "Until trigger",
		value: "trigger",
	},
	{
		label: "Concentration break",
		value: "concentration",
	},
	{
		label: "Until end of next turn",
		value: "next_turn",
	},
	{
		label: "Instantaneous",
		value: "instant",
	},
	{
		label: "Until removed by target's action",
		value: "action_removed",
	},
	{
		label: "Until long rest",
		value: "long_rest",
	},
]);

export const effect_types = Object.freeze({
	bonus: {
		label: "Bonus",
		value: "bonus",
		description: "Add a bonus value",
		subtypes: [
			"ac", "max_hp", "attack", "damage", "ability", "skill", "save", "speed",
			"fly_speed", "climb_speed", "swim_speed", "burrow_speed", "reach", "d20_test",
		],
		number_value: true,
		scaling: true,
	},
	base: {
		label: "Set base value",
		value: "base",
		description: "Set a value to a base value, other modifiers still apply",
		subtypes: [
			"ac", "max_hp", "damage", "ability", "speed",
			"fly_speed", "climb_speed", "swim_speed", "burrow_speed",
		],
		number_value: true,
		scaling: true,
	},
	fixed: {
		label: "Fixed value",
		value: "fixed",
		description: "Set a value to a fixed value, other modifiers no longer apply",
		subtypes: [
			"ac", "max_hp", "temp_hp", "damage", "ability", "speed",
			"fly_speed", "climb_speed", "swim_speed", "burrow_speed", "reach",
		],
		number_value: true,
	},
	defense: {
		label: "Defenses",
		value: "defense",
		description:
			"The target is vulnerable, resistant, or immune to specific damage types or conditions",
		subtypes: ["v", "r", "i"],
	},
	advantage: {
		label: "Advantage",
		value: "advantage",
		description: "The target has advantage on specific rolls",
		subtypes: ["attack", "ability", "skill", "save", "death_save", "d20_test", "concentration_save"],
	},
	disadvantage: {
		label: "Disadvantage",
		value: "disadvantage",
		description: "The target has disadvantage on specific rolls",
		subtypes: ["attack", "ability", "skill", "save", "death_save", "d20_test", "concentration_save"],
	},
	grant_advantage: {
		label: "Grant advantage (to others)",
		value: "grant_advantage",
		description:
			"Other creatures gain advantage on rolls made against or involving the target",
		subtypes: ["attack", "ability", "skill", "save"],
	},
	grant_disadvantage: {
		label: "Grant disadvantage (to others)",
		value: "grant_disadvantage",
		description:
			"Other creatures gain disadvantage on rolls made against or involving the target",
		subtypes: ["attack", "ability", "skill", "save"],
	},
	reroll: {
		label: "Reroll",
		value: "reroll",
		description: "Reroll specified dice under given conditions and use new or better result",
		subtypes: ["attack", "damage", "ability", "skill", "save", "death_save"],
		reroll_condition: true,
		keep: ["new", "higher", "lower"],
	},
	damage: {
		label: "Damage",
		value: "damage",
		description: "The target takes damage",
		subtypes: ["roll", "fixed_value"],
		trigger: true,
		scaling: true,
	},
	healing: {
		label: "Healing",
		value: "healing",
		description: "The target receives healing",
		subtypes: ["roll", "fixed_value"],
		trigger: true,
		scaling: true,
	},
	auto_fail: {
		label: "Auto fail",
		value: "auto_fail",
		description: "The target automatically fails specific checks",
		subtypes: ["save", "skill", "ability"],
	},
	auto_success: {
		label: "Auto success",
		value: "auto_success",
		description: "The target automatically passes specific checks",
		subtypes: ["save", "skill", "ability", "crit"],
	},
	restrict: {
		label: "Restrict",
		value: "restrict",
		description: "The target is restricted in performing specific actions",
		subtypes: ["action", "reaction", "bonus_action", "attack", "movement", "speech"],
		condition: true,
	},
	grant_action: {
		label: "Grant action",
		value: "grant_action",
		description: "Grants the target additional actions, attacks, or bonus actions",
		subtypes: ["extra_attack", "extra_action", "extra_bonus_action", "extra_reaction"],
	},
	damage_modifier: {
		label: "Damage modifier",
		value: "damage_modifier",
		description: "Halve, negate, or redirect incoming damage from a triggering event",
		subtypes: ["halve_damage", "negate_damage", "redirect_damage"],
		trigger: true,
	},
	score_swap: {
		label: "Ability score substitution",
		value: "score_swap",
		description: "Use one ability score in place of another for specified rolls",
		subtypes: ["attack", "damage", "save", "skill"],
	},
	outcome: {
		label: "Outcome",
		value: "outcome",
		description: "A definitive state change applied to the target",
		subtypes: ["death", "unconscious", "stable", "destroyed"],
		trigger: true,
	},
	special: {
		label: "Special",
		value: "special",
		subtypes: [
			"max_damage", "max_healing", "descriptive",
			"incoming_crit_range", "difficult_terrain", "size",
		],
	},
});

export const effect_subtypes = Object.freeze({
	ac: {
		label: "Armor class",
		value: "ac",
	},
	max_hp: {
		label: "Hit Point Maximum",
		value: "max_hp",
	},
	temp_hp: {
		label: "Temporary Hit Point",
		value: "temp_hp",
		stacking: ["highest", "replace", "add"],
	},
	attack: {
		label: "Attack",
		value: "attack",
	},
	damage: {
		label: "Damage",
		value: "damage",
	},
	ability: {
		label: "Ability",
		value: "ability",
		select: ["abilities"],
	},
	skill: {
		label: "Skill",
		value: "skill",
		select: ["skills"],
	},
	save: {
		label: "Saving throw",
		value: "save",
		select: ["abilities"],
	},
	concentration_save: {
		label: "Concentration saving throw",
		value: "concentration_save",
	},
	d20_test: {
		label: "All d20 tests",
		value: "d20_test",
	},
	speed: {
		label: "Speed (walking)",
		value: "speed",
	},
	fly_speed: {
		label: "Fly speed",
		value: "fly_speed",
	},
	climb_speed: {
		label: "Climb speed",
		value: "climb_speed",
	},
	swim_speed: {
		label: "Swim speed",
		value: "swim_speed",
	},
	burrow_speed: {
		label: "Burrow speed",
		value: "burrow_speed",
	},
	reach: {
		label: "Reach",
		value: "reach",
	},
	v: {
		label: "Vulnerable",
		value: "v",
		select: ["damage_types"],
	},
	r: {
		label: "Resistant",
		value: "r",
		select: ["damage_types"],
	},
	i: {
		label: "Immune",
		value: "i",
		select: ["damage_types", "conditions"],
	},
	death_save: {
		label: "Death save",
		value: "death_save",
	},
	max_damage: {
		label: "Maximum damage",
		value: "max_damage",
	},
	max_healing: {
		label: "Maximum healing",
		value: "max_healing",
	},
	descriptive: {
		label: "Descriptive",
		value: "descriptive",
	},
	roll: {
		label: "Roll",
		value: "roll",
	},
	fixed_value: {
		label: "Fixed value",
		value: "fixed_value",
	},
	crit: {
		label: "Crit",
		value: "crit",
	},
	incoming_crit_range: {
		label: "Incoming attacks treated as critical hits",
		value: "incoming_crit_range",
	},
	action: {
		label: "Action",
		value: "action",
	},
	reaction: {
		label: "Reaction",
		value: "reaction",
	},
	bonus_action: {
		label: "Bonus action",
		value: "bonus_action",
	},
	movement: {
		label: "Movement",
		value: "movement",
	},
	speech: {
		label: "Speech / communication",
		value: "speech",
	},
	difficult_terrain: {
		label: "Difficult terrain interaction",
		value: "difficult_terrain",
	},
	size: {
		label: "Size category",
		value: "size",
	},
	extra_attack: {
		label: "Extra attack",
		value: "extra_attack",
	},
	extra_action: {
		label: "Extra action",
		value: "extra_action",
	},
	extra_bonus_action: {
		label: "Extra bonus action",
		value: "extra_bonus_action",
	},
	extra_reaction: {
		label: "Extra reaction",
		value: "extra_reaction",
	},
	halve_damage: {
		label: "Halve incoming damage",
		value: "halve_damage",
		select: ["damage_types"],
	},
	negate_damage: {
		label: "Negate incoming damage",
		value: "negate_damage",
		select: ["damage_types"],
	},
	redirect_damage: {
		label: "Redirect incoming damage",
		value: "redirect_damage",
	},
	death: {
		label: "Death",
		value: "death",
	},
	unconscious: {
		label: "Unconscious",
		value: "unconscious",
	},
	stable: {
		label: "Stable",
		value: "stable",
	},
	destroyed: {
		label: "Destroyed",
		value: "destroyed",
	},
});

export default {
	triggers,
	duration_types,
	effect_types,
	effect_subtypes,
};
```

---

## 5. Summary of open design questions for follow-up

1. **Conditional sub-effects (Gap 7)** — need a lightweight `condition` schema attached to
   individual sub-effects (e.g. "only if attacker within 5ft", "only while caster maintains
   concentration", "only while target can see source"). This is likely the highest-impact
   structural addition since it affects Prone, Frightened, Charmed, and many spells.
2. **Area-of-effect metadata (Gap 8)** — needed for any spell-driven effect application (vs. purely
   condition-driven), likely belongs on the "effect application" / spell record rather than the
   effect-type constants themselves.
3. **Scaling (Gap 12)** — decide whether scaling-by-level is modeled generically (a `scaling` field
   on any numeric effect) or handled entirely at the "spell/feature definition" layer (precomputed
   per character level when the effect is applied).
4. **Stacking instances of the same condition** (e.g. multiple Exhaustion levels, multiple
   instances of Bane from different casters) — needs a data-model decision independent of the
   constants file: do stacks merge, replace, or coexist?
5. **Grant_advantage / grant_disadvantage (Gap 1)** targeting "other creatures" implies the effects
   engine needs to evaluate effects on a target when *other* creatures act, not just when the
   target itself acts. This is an architectural consideration beyond just constants.
