export const aoe_types = Object.freeze([
	{ label: "None", value: "none" },
	{ label: "Cone", value: "cone" },
	{ label: "Cube", value: "cube" },
	{ label: "Cylinder", value: "cylinder" },
	{ label: "Line", value: "line" },
	{ label: "Sphere", value: "sphere" },
	{ label: "Square", value: "square" },
	{ label: "Square Feet", value: "square feet" },
]);

export const attack_types = Object.freeze({
	melee_weapon: {
		label: "Melee weapon",
		value: "melee_weapon",
		hint: "A melee weapon attack",
	},
	ranged_weapon: {
		label: "Ranged weapon",
		value: "ranged_weapon",
		hint: "A ranged weapon attack",
	},
	spell_attack: {
		label: "Spell attack",
		value: "spell_attack",
		hint: "A spell attack that has to hit",
	},
	save: {
		label: "Save",
		value: "save",
		hint: "An attack that requires a saving throw",
	},
	damage: {
		label: "Damage",
		value: "damage",
		hint: "Damage without a to hit or saving throw",
	},
	healing: {
		label: "Healing",
		value: "healing",
		hint: "Restores hit points to a target",
	},
	other: {
		label: "Other",
		value: "other",
		hint: "An action without damage or healing",
	},
});
