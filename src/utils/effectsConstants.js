/**
 * Labels and form metadata for the effects schema (src/schemas/hk-effects-schema.json).
 *
 * Every enum the effects form offers has a keyed object here: { [value]: { value, label,
 * description?, legacy? } }. Legacy aliases are kept so old data can still be labelled,
 * but the form doesn't offer them. Abilities, damage types, creature types and skills
 * come from generalConstants.js.
 *
 * Keep in sync with the schema: node scripts/validate-effects-data/check-constants.mjs
 */

/**
 * Freezes a map of entries and adds each entry's key as its value
 *
 * @param {object} entries { [value]: { label, ... } }
 * @returns {object} { [value]: { value, label, ... } }
 */
function keyed(entries) {
	return Object.freeze(
		Object.fromEntries(
			Object.entries(entries).map(([value, entry]) => [value, Object.freeze({ value, ...entry })])
		)
	);
}

// Sub-type groups, shared by several sub-effect types
const STAT_SUB_TYPES = [
	"ac",
	"max_hp",
	"temp_hp",
	"speed",
	"fly_speed",
	"climb_speed",
	"swim_speed",
	"burrow_speed",
	"reach",
	"size",
	"initiative",
	"passive_perception",
	"spell_save_dc",
	"spell_attack",
	"jump",
	"healing",
	"healing_received",
	"ability_score",
];
const ROLL_SUB_TYPES = [
	"attack",
	"damage",
	"ability",
	"skill",
	"save",
	"concentration_save",
	"d20_test",
	"death_save",
	"initiative",
];
const ROLL_FILTER_FIELDS = ["abilities", "skills", "context", "attack_types", "creature_types"];

// Sub-types that are rolls (the rest of Bonus' sub-types are values), for the form's field rules
export const roll_sub_types = Object.freeze([...ROLL_SUB_TYPES]);

/**
 * Sub-effect fields every type can use. The form shows them always (type, sub_types,
 * description) or as optional parts.
 */
export const common_sub_effect_fields = Object.freeze([
	"id",
	"type",
	"sub_types",
	"description",
	"trigger",
	"trigger_filter",
	"frequency",
	"target",
	"save",
	"condition",
	"consume",
	"min_level",
	"max_level",
	"source",
	"choice",
]);

/**
 * Sub-effect types.
 * sub_types: the sub-types the type allows ([] = none)
 * fields: the type-specific fields the form shows
 * required: required type-specific fields; a nested array means "one of these"
 */
export const effect_types = keyed({
	bonus: {
		label: "Bonus",
		description: "Add to a value or a roll (Bless, Shield of Faith, Aid)",
		sub_types: [...STAT_SUB_TYPES, ...ROLL_SUB_TYPES.filter((s) => s !== "initiative")],
		fields: [
			"value",
			"roll",
			"multiplier",
			"perspective",
			"damage_types",
			"also_heal",
			"stacking",
			"expires_with_effect",
			...ROLL_FILTER_FIELDS,
		],
	},
	base: {
		label: "Set base value",
		description: "Set a base value that other modifiers still change (Mage Armor, Unarmored Defense)",
		sub_types: STAT_SUB_TYPES,
		fields: ["value", "roll", "multiplier", "abilities"],
	},
	fixed: {
		label: "Fixed value",
		description: "Set a value and ignore other modifiers (Speed 0, temporary hit points)",
		sub_types: STAT_SUB_TYPES,
		fields: ["value", "roll", "multiplier", "abilities", "stacking", "expires_with_effect"],
	},
	floor: {
		label: "Minimum value",
		description: "The value can't go below this (Barkskin: AC 16)",
		sub_types: STAT_SUB_TYPES,
		fields: ["value", "abilities"],
	},
	cap: {
		label: "Maximum value",
		description: "The value can't go above this",
		sub_types: STAT_SUB_TYPES,
		fields: ["value", "abilities"],
	},
	defense: {
		label: "Defense",
		description: "Vulnerability, resistance or immunity to damage types or conditions",
		sub_types: ["v", "r", "i"],
		fields: [
			"damage_types",
			"all_damage",
			"except_damage_types",
			"bypass",
			"conditions",
			"mechanics",
			"suppress_existing",
		],
	},
	advantage: {
		label: "Advantage",
		description: "Advantage on rolls, or on rolls made against the holder",
		sub_types: ROLL_SUB_TYPES,
		fields: ["perspective", ...ROLL_FILTER_FIELDS],
	},
	disadvantage: {
		label: "Disadvantage",
		description: "Disadvantage on rolls, or on rolls made against the holder",
		sub_types: ROLL_SUB_TYPES,
		fields: ["perspective", ...ROLL_FILTER_FIELDS],
	},
	grant_advantage: {
		label: "Grant advantage",
		description: "Legacy: Advantage against the holder",
		legacy: true,
		sub_types: ROLL_SUB_TYPES,
		fields: ROLL_FILTER_FIELDS,
	},
	grant_disadvantage: {
		label: "Grant disadvantage",
		description: "Legacy: Disadvantage against the holder",
		legacy: true,
		sub_types: ROLL_SUB_TYPES,
		fields: ROLL_FILTER_FIELDS,
	},
	reroll: {
		label: "Reroll",
		description: "Reroll a roll (Lucky, Indomitable, Halfling Luck)",
		sub_types: ROLL_SUB_TYPES,
		fields: [
			"perspective",
			"reroll_condition",
			"keep",
			"reroll_bonus",
			"with_advantage",
			...ROLL_FILTER_FIELDS,
		],
	},
	roll_floor: {
		label: "Minimum roll",
		description: "A minimum die or total (Reliable Talent: 10)",
		sub_types: ROLL_SUB_TYPES,
		fields: ["value", "applies_to", ...ROLL_FILTER_FIELDS],
	},
	critical: {
		label: "Critical hits",
		description: "Critical hit range and rules (Improved Critical, Paralyzed)",
		sub_types: ["crit", "crit_range", "incoming_crit_range", "negate_incoming_crit", "extra_crit_dice"],
		fields: ["perspective", "crit_range", "roll", "attack_types", "creature_types"],
	},
	damage: {
		label: "Damage",
		description: "The recipient takes damage, usually on a trigger",
		sub_types: [],
		fields: ["value", "roll", "multiplier"],
	},
	healing: {
		label: "Healing",
		description: "The recipient regains hit points, usually on a trigger",
		sub_types: [],
		fields: ["value", "roll", "multiplier"],
	},
	damage_modifier: {
		label: "Damage modifier",
		description: "Change damage taken or dealt (halve, reduce, absorb, transfer, Evasion)",
		sub_types: [
			"halve_damage",
			"negate_damage",
			"redirect_damage",
			"floor_at_1",
			"reduce_damage",
			"threshold",
			"absorb",
			"transfer",
			"bypass_resistance",
			"bypass_immunity",
			"convert_type",
			"evasion",
		],
		fields: [
			"value",
			"roll",
			"multiplier",
			"direction",
			"damage_types",
			"all_damage",
			"except_damage_types",
			"attack_types",
			"abilities",
			"fraction",
			"copy",
			"to",
			"to_type",
		],
	},
	auto_fail: {
		label: "Auto fail",
		description: "Rolls fail automatically (Paralyzed: Strength and Dexterity saves)",
		sub_types: ROLL_SUB_TYPES,
		fields: ["perspective", ...ROLL_FILTER_FIELDS],
	},
	auto_success: {
		label: "Auto success",
		description: "Rolls succeed automatically, or attacks against the holder hit",
		sub_types: [...ROLL_SUB_TYPES, "crit"],
		fields: ["perspective", ...ROLL_FILTER_FIELDS],
	},
	restrict: {
		label: "Restrict",
		description: "The holder can't do something, or only a limited number of times",
		sub_types: [
			"action",
			"bonus_action",
			"reaction",
			"movement",
			"attack",
			"speech",
			"spellcasting",
			"verbal_components",
			"concentration",
			"opportunity_attack",
			"magic_action",
			"stand_up",
			"short_rest",
			"long_rest",
			"teleport",
			"target_choice",
			"lie",
		],
		fields: ["limit", "exclusive", "context", "attack_types"],
	},
	compel: {
		label: "Compel",
		description: "Forced behavior (must move away, must Dash, must follow a command)",
		sub_types: [
			"move_away",
			"move_toward",
			"move_direction",
			"dash",
			"dodge",
			"attack_nearest",
			"drop_held",
			"follow_command",
			"no_move",
		],
		fields: ["allowed_actions", "range", "context"],
	},
	deny: {
		label: "Deny",
		description: "The holder can't gain a benefit (no Advantage, no cover, can't hide)",
		sub_types: ["advantage", "disadvantage", "condition_benefit", "cover", "hidden"],
		fields: ["perspective", "conditions", "context", "attack_types"],
	},
	grant_action: {
		label: "Grant action",
		description: "Extra actions, attacks or turns (Haste, Action Surge)",
		sub_types: [
			"extra_attack",
			"extra_action",
			"extra_bonus_action",
			"extra_reaction",
			"bonus_action_option",
			"extra_turn",
		],
		fields: ["value", "allowed_actions"],
	},
	forced_movement: {
		label: "Forced movement",
		description: "Push, pull or move the recipient",
		sub_types: ["push", "pull", "move"],
		fields: ["range"],
	},
	sense: {
		label: "Sense",
		description: "Grant a sense (Darkvision, Blindsight, See Invisibility)",
		sub_types: ["darkvision", "blindsight", "tremorsense", "truesight", "see_invisible", "telepathy"],
		fields: ["range"],
	},
	proficiency: {
		label: "Proficiency",
		description: "Proficiency or Expertise with weapons, armor, tools, skills or saves",
		sub_types: ["weapon", "armor", "tool", "skill", "save"],
		fields: ["proficiency_level", "skills", "abilities"],
	},
	score_swap: {
		label: "Use another ability",
		description: "Use one ability in place of another for rolls",
		sub_types: ROLL_SUB_TYPES,
		fields: ["from_ability", "to_ability", "skills"],
	},
	includes: {
		label: "Includes",
		description: "The holder also has another condition or effect while this lasts",
		sub_types: [],
		fields: ["effect"],
		required: ["effect"],
	},
	apply_effect: {
		label: "Apply effect",
		description: "Apply another effect, usually on a trigger",
		sub_types: [],
		fields: ["effect", "duration"],
		required: ["effect"],
	},
	remove_effect: {
		label: "Remove effect",
		description: "Remove effects or conditions (Lesser Restoration)",
		sub_types: [],
		fields: ["effects", "conditions", "count"],
		required: [["effects", "conditions"]],
	},
	outcome: {
		label: "Outcome",
		description: "Something happens: death, unconscious, drop to 1 HP, lose Concentration",
		sub_types: [
			"death",
			"unconscious",
			"stable",
			"destroyed",
			"drop_to_1",
			"break_concentration",
			"removed",
			"revert_form",
		],
		fields: [],
	},
	special: {
		label: "Special",
		description: "A rule the tracker shows to the DM but doesn't apply",
		sub_types: ["max_damage", "max_healing", "descriptive", "difficult_terrain", "hover", "breathing"],
		fields: [],
	},
});

export const effect_subtypes = keyed({
	// Values
	ac: { label: "Armor Class" },
	max_hp: { label: "Hit Point Maximum" },
	temp_hp: { label: "Temporary Hit Points" },
	speed: { label: "Speed" },
	fly_speed: { label: "Fly Speed" },
	climb_speed: { label: "Climb Speed" },
	swim_speed: { label: "Swim Speed" },
	burrow_speed: { label: "Burrow Speed" },
	reach: { label: "Reach" },
	size: { label: "Size" },
	initiative: { label: "Initiative" },
	passive_perception: { label: "Passive Perception" },
	spell_save_dc: { label: "Spell save DC" },
	spell_attack: { label: "Spell attack" },
	jump: { label: "Jump distance" },
	healing: { label: "Healing done" },
	healing_received: { label: "Healing received" },
	ability_score: { label: "Ability score" },

	// Rolls
	attack: { label: "Attack rolls" },
	damage: { label: "Damage rolls" },
	ability: { label: "Ability checks" },
	skill: { label: "Skill checks" },
	save: { label: "Saving throws" },
	concentration_save: { label: "Concentration saves" },
	d20_test: { label: "D20 Tests" },
	death_save: { label: "Death saves" },

	// Defenses
	v: { label: "Vulnerable" },
	r: { label: "Resistant" },
	i: { label: "Immune" },

	// Legacy damage sub-types of the old form
	roll: { label: "Roll", legacy: true },
	fixed_value: { label: "Fixed value", legacy: true },

	// Critical hits
	crit: { label: "Critical hit" },
	crit_range: { label: "Critical range" },
	incoming_crit_range: { label: "Critical range against the holder" },
	negate_incoming_crit: { label: "Critical hits become normal hits" },
	extra_crit_dice: { label: "Extra critical dice" },

	// Restrictions
	action: { label: "Actions" },
	bonus_action: { label: "Bonus Actions" },
	reaction: { label: "Reactions" },
	movement: { label: "Movement" },
	speech: { label: "Speech" },
	spellcasting: { label: "Spellcasting" },
	verbal_components: { label: "Verbal components" },
	concentration: { label: "Concentration" },
	opportunity_attack: { label: "Opportunity Attacks" },
	magic_action: { label: "Magic action" },
	stand_up: { label: "Standing up" },
	short_rest: { label: "Short Rest" },
	long_rest: { label: "Long Rest" },
	teleport: { label: "Teleporting" },
	target_choice: { label: "Choosing targets" },
	lie: { label: "Lying" },

	// Compelled behavior
	move_away: { label: "Move away" },
	move_toward: { label: "Move toward" },
	move_direction: { label: "Move in a direction" },
	dash: { label: "Dash" },
	dodge: { label: "Dodge" },
	attack_nearest: { label: "Attack the nearest creature" },
	drop_held: { label: "Drop what it holds" },
	follow_command: { label: "Follow a command" },
	no_move: { label: "Don't move" },

	// Denied benefits
	advantage: { label: "Advantage" },
	disadvantage: { label: "Disadvantage" },
	condition_benefit: { label: "Benefit of a condition" },
	cover: { label: "Cover" },
	hidden: { label: "Being hidden" },

	// Extra actions
	extra_attack: { label: "Extra attack" },
	extra_action: { label: "Extra action" },
	extra_bonus_action: { label: "Extra Bonus Action" },
	extra_reaction: { label: "Extra Reaction" },
	bonus_action_option: { label: "Bonus Action option" },
	extra_turn: { label: "Extra turn" },

	// Damage modifiers
	halve_damage: { label: "Halve damage" },
	negate_damage: { label: "Negate damage" },
	redirect_damage: { label: "Redirect damage" },
	floor_at_1: { label: "Drop to 1 instead of 0" },
	reduce_damage: { label: "Reduce damage" },
	threshold: { label: "Damage threshold" },
	absorb: { label: "Absorb" },
	transfer: { label: "Transfer" },
	bypass_resistance: { label: "Ignore resistance" },
	bypass_immunity: { label: "Ignore immunity" },
	convert_type: { label: "Change damage type" },
	evasion: { label: "Evasion" },

	// Forced movement
	push: { label: "Push" },
	pull: { label: "Pull" },
	move: { label: "Move" },

	// Senses
	darkvision: { label: "Darkvision" },
	blindsight: { label: "Blindsight" },
	tremorsense: { label: "Tremorsense" },
	truesight: { label: "Truesight" },
	see_invisible: { label: "See Invisible" },
	telepathy: { label: "Telepathy" },

	// Proficiencies
	weapon: { label: "Weapons" },
	armor: { label: "Armor" },
	tool: { label: "Tools" },

	// Outcomes
	death: { label: "Death" },
	unconscious: { label: "Unconscious" },
	stable: { label: "Stable" },
	destroyed: { label: "Destroyed" },
	drop_to_1: { label: "Drop to 1 hit point" },
	break_concentration: { label: "Lose Concentration" },
	removed: { label: "Removed from combat" },
	revert_form: { label: "Revert form" },

	// Special
	max_damage: { label: "Maximum damage" },
	max_healing: { label: "Maximum healing" },
	descriptive: { label: "Descriptive" },
	difficult_terrain: { label: "Difficult terrain" },
	hover: { label: "Hover" },
	breathing: { label: "Breathing" },
});

export const sizes = keyed({
	tiny: { label: "Tiny" },
	small: { label: "Small" },
	medium: { label: "Medium" },
	large: { label: "Large" },
	huge: { label: "Huge" },
	gargantuan: { label: "Gargantuan" },
});

export const attack_types = keyed({
	melee: { label: "Melee" },
	ranged: { label: "Ranged" },
	weapon: { label: "Weapon" },
	spell: { label: "Spell" },
	unarmed: { label: "Unarmed" },
	melee_weapon: { label: "Melee weapon" },
	ranged_weapon: { label: "Ranged weapon" },
	melee_spell: { label: "Melee spell" },
	ranged_spell: { label: "Ranged spell" },
	opportunity: { label: "Opportunity Attack" },
	thrown: { label: "Thrown" },
});

export const time_units = keyed({
	round: { label: "Rounds" },
	minute: { label: "Minutes" },
	hour: { label: "Hours" },
	day: { label: "Days" },
});

// Durations a spell link's duration tier can have ($defs/effect_link duration_scaling, effects 6c)
export const duration_tier_types = keyed({
	time: { label: "Time" },
	concentration: { label: "Concentration" },
	cancelled: { label: "Until removed" },
});

export const rounding = keyed({
	down: { label: "Round down" },
	up: { label: "Round up" },
});

export const effect_sources = keyed({
	srd: { label: "SRD" },
	custom: { label: "Custom" },
	api: { label: "API" },
});

// What a Concentration is for: an effect, or a spell whose cast applied effects (effects step 7)
export const concentration_sources = keyed({
	...effect_sources,
	spell: { label: "Spell" },
});

export const triggers = keyed({
	on_apply: { label: "When applied" },
	on_expire: { label: "When it ends" },
	start_turn_target: { label: "Start of the holder's turn" },
	end_turn_target: { label: "End of the holder's turn" },
	start_turn_caster: { label: "Start of the caster's turn" },
	end_turn_caster: { label: "End of the caster's turn" },
	combat_start: { label: "Combat starts" },
	damage_taken: { label: "Takes damage" },
	damage_dealt: { label: "Deals damage" },
	on_attack: { label: "Makes an attack" },
	on_attacked: { label: "Is attacked" },
	on_force_save: { label: "Forces a saving throw" },
	on_hit: { label: "Hits with an attack" },
	on_hit_taken: { label: "Is hit by an attack" },
	on_miss: { label: "Misses with an attack" },
	on_miss_taken: { label: "Is missed by an attack" },
	on_crit: { label: "Scores a critical hit" },
	on_crit_taken: { label: "Takes a critical hit" },
	on_natural_20: { label: "Rolls a natural 20" },
	on_natural_1: { label: "Rolls a natural 1" },
	on_save_success: { label: "Succeeds on a saving throw" },
	on_save_fail: { label: "Fails a saving throw" },
	on_check: { label: "Makes an ability check" },
	on_d20_fail: { label: "Fails a D20 Test" },
	on_cast: { label: "Casts a spell" },
	on_targeted_by_spell: { label: "Is targeted by a spell" },
	on_condition_applied: { label: "Gets a condition" },
	on_heal: { label: "Regains hit points" },
	on_bloodied: { label: "Becomes Bloodied" },
	on_zero_hp: { label: "Drops to 0 hit points" },
	on_death: { label: "Dies" },
	on_kill: { label: "Kills a creature" },
	on_enter_area: { label: "Enters the area" },
	start_turn_in_area: { label: "Starts its turn in the area" },
	end_turn_in_area: { label: "Ends its turn in the area" },
	on_move: { label: "Moves" },
	short_rest: { label: "Short Rest" },
	long_rest: { label: "Long Rest" },
	dawn: { label: "Dawn" },
	failed_save: { label: "Fails a saving throw", legacy: true },
	success_save: { label: "Succeeds on a saving throw", legacy: true },
	zero_hp: { label: "Drops to 0 hit points", legacy: true },
});

export const trigger_by = keyed({
	any: { label: "Anyone" },
	caster: { label: "The caster" },
	caster_or_allies: { label: "The caster or its allies" },
	counterpart: { label: "The other party" },
	enemy: { label: "An enemy" },
	ally: { label: "An ally" },
});

export const condition_subjects = keyed({
	self: { label: "The holder" },
	counterpart: { label: "The other party", description: "The attacker or the target of the roll" },
	caster: { label: "The caster" },
	trigger_source: { label: "The trigger source" },
});

/**
 * Condition check types.
 * input: what the check's value is ("number", "condition", "effect", "creature_type",
 * "size", one of the value lists in check_values, or "none")
 */
export const condition_check_types = keyed({
	distance: { label: "Distance", input: "number", description: "Feet" },
	can_see: { label: "Can see", input: "none" },
	line_of_sight: { label: "Line of sight", input: "none" },
	has_condition: { label: "Has condition", input: "condition" },
	has_effect: { label: "Has effect", input: "effect" },
	creature_type: { label: "Creature type", input: "creature_type" },
	size: { label: "Size", input: "size" },
	bloodied: { label: "Bloodied", input: "none" },
	hp_threshold: { label: "Hit points", input: "number" },
	missing_hp: { label: "Missing hit points", input: "none" },
	hp_zero: { label: "At 0 hit points", input: "none" },
	temp_hp_zero: { label: "No temporary hit points", input: "none" },
	sense: { label: "Has sense", input: "sense" },
	ally_adjacent: { label: "Ally within 5 feet", input: "none" },
	is_caster: { label: "Is the caster", input: "none" },
	relationship: { label: "Relationship", input: "relationship" },
	equipment: { label: "Equipment", input: "equipment" },
	environment: { label: "Environment", input: "environment" },
	combat_state: { label: "Combat state", input: "combat_state" },
	movement: { label: "Movement", input: "number", description: "Feet moved this turn" },
	roll_state: { label: "Roll state", input: "roll_state" },
	attacker_distance: { label: "Attacker distance", input: "number", legacy: true },
	attacker_has_condition: { label: "Attacker has condition", input: "condition", legacy: true },
	target_has_condition: { label: "Target has condition", input: "condition", legacy: true },
	target_creature_type: { label: "Target creature type", input: "creature_type", legacy: true },
});

/**
 * Suggested values for condition checks whose value is a descriptor (schema prose,
 * not an enum). The form also accepts other values.
 */
export const check_values = Object.freeze({
	sense: keyed({
		darkvision: { label: "Darkvision" },
		blindsight: { label: "Blindsight" },
		tremorsense: { label: "Tremorsense" },
		truesight: { label: "Truesight" },
	}),
	relationship: keyed({
		ally: { label: "Ally" },
		enemy: { label: "Enemy" },
	}),
	equipment: keyed({
		armor: { label: "Wears armor" },
		heavy_armor: { label: "Wears heavy armor" },
		shield: { label: "Holds a shield" },
		no_armor: { label: "Wears no armor" },
	}),
	environment: keyed({
		sunlight: { label: "Sunlight" },
		bright_light: { label: "Bright light" },
		dim_light: { label: "Dim light" },
		darkness: { label: "Darkness" },
		underwater: { label: "Underwater" },
		running_water: { label: "Running water" },
	}),
	combat_state: keyed({
		first_round: { label: "First round" },
		not_acted: { label: "Hasn't acted yet" },
		surprised: { label: "Surprised" },
	}),
	roll_state: keyed({
		advantage: { label: "Has Advantage" },
		disadvantage: { label: "Has Disadvantage" },
	}),
});

export const comparators = keyed({
	lt: { label: "Less than" },
	lte: { label: "At most" },
	eq: { label: "Equal to" },
	neq: { label: "Not equal to" },
	gte: { label: "At least" },
	gt: { label: "More than" },
});

export const stacking_modes = keyed({
	none: { label: "Doesn't stack", description: "The stronger or longer instance is kept" },
	level: { label: "Adds a level", description: "Applying it again raises the level (Exhaustion)" },
	replace: { label: "Replaces", description: "A new instance replaces the old one" },
	independent: { label: "Independent", description: "Every instance applies separately" },
});

export const sustain_costs = keyed({
	action: { label: "Action" },
	bonus_action: { label: "Bonus Action" },
});

export const aura_affects = keyed({
	allies: { label: "Allies" },
	enemies: { label: "Enemies" },
	all: { label: "Everyone" },
	chosen: { label: "Chosen creatures" },
});

export const save_on_success = keyed({
	negate: { label: "No effect" },
	half: { label: "Half damage" },
	partial: { label: "Other effects", description: "Apply the success effects instead" },
});

export const escape_by = keyed({
	self: { label: "The holder" },
	self_or_within_reach: { label: "The holder or a creature within reach" },
	any: { label: "Anyone" },
});

export const escape_costs = keyed({
	action: { label: "Action" },
	bonus_action: { label: "Bonus Action" },
	movement: { label: "Movement" },
});

/**
 * Duration types.
 * fields: the duration fields the type uses
 */
export const duration_types = keyed({
	instant: { label: "Instantaneous", fields: [] },
	time: { label: "Time", fields: ["value", "unit"] },
	cancelled: { label: "Until removed", fields: [] },
	concentration: {
		label: "Concentration",
		description: "Ends when the caster's Concentration ends, up to the time",
		fields: ["value", "unit"],
	},
	next_turn: { label: "Until a next turn", fields: ["anchor", "edge"] },
	end_of_turn: { label: "Until the end of this turn", fields: [] },
	rest: { label: "Until a rest", fields: ["rest_type"] },
	dawn: { label: "Until dawn", fields: [] },
	trigger: { label: "Until a trigger", fields: [] },
	save_ends: { label: "Until saved", fields: [] },
	special: { label: "Special", fields: [] },
	action_removed: { label: "Until removed with an action", legacy: true, fields: [] },
	long_rest: { label: "Until a Long Rest", legacy: true, fields: [] },
});

export const duration_anchors = keyed({
	caster: { label: "The caster's turn" },
	target: { label: "The holder's turn" },
});

export const turn_edges = keyed({
	start: { label: "Start" },
	end: { label: "End" },
});

export const rest_types = keyed({
	short: { label: "Short Rest" },
	long: { label: "Long Rest" },
	short_or_long: { label: "Short or Long Rest" },
});

export const ends_by_action = keyed({
	self: { label: "The holder" },
	other: { label: "Another creature" },
	self_or_other: { label: "The holder or another creature" },
});

export const consume_on = keyed({
	roll: { label: "A roll" },
	hit: { label: "A hit" },
	miss: { label: "A miss" },
	trigger: { label: "The trigger" },
	fail: { label: "A failed roll" },
});

export const consume_scopes = keyed({
	effect: { label: "The whole effect" },
	sub_effect: { label: "Only this part" },
});

export const perspectives = keyed({
	self: { label: "The holder's own rolls" },
	against: { label: "Rolls against the holder" },
});

/**
 * Choices made when an effect is applied.
 * field: the sub-effect field the choice fills
 */
export const choice_kinds = keyed({
	ability: { label: "Ability", field: "abilities" },
	damage_type: { label: "Damage type", field: "damage_types" },
	skill: { label: "Skill", field: "skills" },
	condition: { label: "Condition", field: "conditions" },
	creature_type: { label: "Creature type", field: "creature_types" },
	option: { label: "Option" },
	value: { label: "Value", field: "value" },
});

/**
 * Outcomes of an action-list entry that linked effects apply on ($defs/action_effects), in
 * display order. types: the entry's action types the outcome fits (none = every type).
 */
export const action_outcomes = keyed({
	on_hit: { label: "On a hit", types: ["melee_weapon", "ranged_weapon", "spell_attack"] },
	on_miss: { label: "On a miss", types: ["melee_weapon", "ranged_weapon", "spell_attack"] },
	on_fail: { label: "On a failed save", types: ["save"] },
	on_success: { label: "On a successful save", types: ["save"] },
	always: { label: "Always" },
});

/**
 * The outcomes that fit an action type
 *
 * @param {string} type Action type of the entry ("melee_weapon", "save", "other"…)
 * @returns {string[]} e.g. ["on_hit", "on_miss", "always"]
 */
export function outcomesFor(type) {
	return Object.values(action_outcomes)
		.filter(({ types }) => !types || types.includes(type))
		.map(({ value }) => value);
}

export const bypass_sources = keyed({
	magical: { label: "Magical" },
	silvered: { label: "Silvered" },
	adamantine: { label: "Adamantine" },
});

export const mechanics = keyed({
	speed_reduction: { label: "Speed reduction" },
	max_hp_reduction: { label: "Hit point maximum reduction" },
	forced_movement: { label: "Forced movement" },
	sleep: { label: "Magical sleep" },
	possession: { label: "Possession" },
	aging: { label: "Magical aging" },
	divination: { label: "Divination" },
	shape_change: { label: "Shape change" },
	crit: { label: "Critical hits" },
});

export const reroll_keep = keyed({
	new: { label: "The new roll" },
	higher: { label: "The higher roll" },
	lower: { label: "The lower roll" },
	choice: { label: "Either roll" },
});

export const roll_floor_applies_to = keyed({
	die: { label: "The die" },
	total: { label: "The total" },
});

export const temp_hp_stacking = keyed({
	highest: { label: "Keep the highest" },
	replace: { label: "Replace" },
	add: { label: "Add" },
});

export const exclusive_actions = keyed({
	move: { label: "Move" },
	action: { label: "Action" },
	bonus_action: { label: "Bonus Action" },
	reaction: { label: "Reaction" },
});

export const transfer_to = keyed({
	caster: { label: "The caster" },
	counterpart: { label: "The other party" },
	linked: { label: "A linked creature" },
});

export const damage_directions = keyed({
	incoming: { label: "Damage taken" },
	outgoing: { label: "Damage dealt" },
});

export const proficiency_levels = keyed({
	half: { label: "Half proficiency" },
	proficient: { label: "Proficient" },
	expertise: { label: "Expertise" },
});

export const frequencies = keyed({
	always: { label: "Every time" },
	once_per_turn: { label: "Once per turn" },
	once_per_round: { label: "Once per round" },
	once_per_effect: { label: "Once" },
});

export const targets = keyed({
	self: { label: "The holder" },
	trigger_source: { label: "The trigger source" },
	counterpart: { label: "The other party" },
	caster: { label: "The caster" },
});

/**
 * Suggestions for free-text fields (schema prose, not enums). The form also accepts
 * other values.
 */
export const suggestions = Object.freeze({
	context: ["sight", "hearing", "smell", "social", "find_target", "climb", "escape_grapple", "perceive_holder"],
	allowed_actions: [
		"attack",
		"attack_one",
		"dash",
		"disengage",
		"dodge",
		"help",
		"hide",
		"influence",
		"magic",
		"ready",
		"search",
		"study",
		"utilize",
	],
	to_ability: ["spellcasting"],
});

export default {
	common_sub_effect_fields,
	effect_types,
	effect_subtypes,
	sizes,
	attack_types,
	time_units,
	rounding,
	effect_sources,
	triggers,
	trigger_by,
	condition_subjects,
	condition_check_types,
	check_values,
	comparators,
	stacking_modes,
	sustain_costs,
	aura_affects,
	save_on_success,
	escape_by,
	escape_costs,
	duration_types,
	duration_anchors,
	turn_edges,
	rest_types,
	ends_by_action,
	consume_on,
	consume_scopes,
	perspectives,
	choice_kinds,
	action_outcomes,
	bypass_sources,
	mechanics,
	reroll_keep,
	roll_floor_applies_to,
	temp_hp_stacking,
	exclusive_actions,
	transfer_to,
	damage_directions,
	proficiency_levels,
	frequencies,
	targets,
	suggestions,
};
