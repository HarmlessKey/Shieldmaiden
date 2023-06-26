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
]);

export const effect_types = Object.freeze({
	bonus: {
		label: "Bonus",
		value: "bonus",
		description: "Add a bonus value",
		subtypes: ["ac", "max_hp", "attack", "damage", "ability", "skill", "save", "speed"],
		number_value: true,
	},
	base: {
		label: "Set base value",
		value: "base",
		description: "Set a value to a base value, other modifiers still apply",
		subtypes: ["ac", "max_hp", "damage", "ability", "speed"],
		number_value: true,
	},
	fixed: {
		label: "Fixed value",
		value: "fixed",
		description: "Set a value to a fixed value, other modifiers no longer apply",
		subtypes: ["ac", "max_hp", "temp_hp", "damage", "ability", "speed"],
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
		subtypes: ["attack", "ability", "skill", "save", "death_save"],
	},
	advantage: {
		label: "Disadvantage",
		value: "advantage",
		description: "The target has disadvantage on specific rolls",
		subtypes: ["attack", "ability", "skill", "save", "death_save"],
	},
	damage: {
		label: "Damage",
		value: "damage",
		description: "The target takes damage",
		subtypes: ["roll", "fixed_value"],
		trigger: true,
	},
	healing: {
		label: "Healing",
		value: "healing",
		description: "The target receives healing",
		subtypes: ["roll", "fixed_value"],
		trigger: true,
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
		subtypes: ["action", "reaction", "attack"],
	},
	special: {
		label: "Special",
		value: "special",
		subtypes: ["max_damage", "max_healing", "descriptive"],
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
	},
	attack: {
		label: "Attack",
		value: "attack",
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
	speed: {
		label: "Speed",
		value: "speed",
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
	action: {
		label: "Action",
		value: "action",
	},
	reaction: {
		label: "Reaction",
		value: "reaction",
	},
});

export default {
	triggers,
	duration_types,
	effect_types,
	effect_subtypes,
};
