export const spell_levels = Object.freeze([
	{ value: 0, label: "Cantrip" },
	{ value: 1, label: "1st" },
	{ value: 2, label: "2nd" },
	{ value: 3, label: "3rd" },
	{ value: 4, label: "4th" },
	{ value: 5, label: "5th" },
	{ value: 5, label: "6th" },
	{ value: 7, label: "7th" },
	{ value: 8, label: "8th" },
	{ value: 9, label: "9th" },
]);

export const spell_schools = Object.freeze([
	{ label: "Abjuration", value: "abjuration" },
	{ label: "Conjuration", value: "conjuration" },
	{ label: "Divination", value: "divination" },
	{ label: "Enchantment", value: "enchantment" },
	{ label: "Evocation", value: "evocation" },
	{ label: "Illusion", value: "illusion" },
	{ label: "Necromancy", value: "necromancy" },
	{ label: "Transmutation", value: "transmutation" },
]);

export const spell_components = Object.freeze([
	{ label: "Verbal", value: "verbal" },
	{ label: "Somatic", value: "somatic" },
	{ label: "Material", value: "material" },
]);

export const spell_cast_time_types = Object.freeze([
	{ label: "Action", value: "action" },
	{ label: "Bonus Action", value: "bonus_action" },
	{ label: "Reaction", value: "reaction" },
	{ label: "Minute", value: "minute" },
	{ label: "Hour", value: "hour" },
	{ label: "No Action", value: "no_action" },
	{ label: "Special", value: "special" },
]);

export const spell_range_types = Object.freeze([
	{ label: "Self", value: "self" },
	{ label: "Touch", value: "touch" },
	{ label: "Ranged", value: "ranged" },
	{ label: "Sight", value: "sight" },
	{ label: "Unlimited", value: "unlimited" },
	{ label: "Special", value: "special" },
]);

export const spell_duration_types = Object.freeze([
	{ label: "Concentration", value: "concentration" },
	{ label: "Instantaneous", value: "instantaneous" },
	{ label: "Special", value: "special" },
	{ label: "Time", value: "time" },
	{ label: "Until Dispelled", value: "until_dispelled" },
	{ label: "Until Dispelled or Triggered", value: "until_dispelled_or_triggered" },
]);

export const spell_duration_types_time = Object.freeze(["concentration", "time"]);

export const spell_duration_times = Object.freeze([
	{ label: "Round", value: "round" },
	{ label: "Minute", value: "minute" },
	{ label: "Hour", value: "hour" },
	{ label: "Day", value: "day" },
]);

export const level_scaling = Object.freeze([
	{ label: "None", value: "none" },
	{ label: "Character Level", value: "character_level" },
	{ label: "Spell Scale", value: "spell_scale" },
	{ label: "Spell Level", value: "spell_level" },
]);

// Card accent colors for the spell card download. `base` and `light` are lifted
// directly from the fills used in the matching `logo-icon-no-shield-<color>.svg` brand
// asset (base = the icon's darkest/richest fill, light = its lightest fill), so the
// card colors read as the same brand color as the logo. `lighter` extends past `light`
// towards white, `dark`/`darker`/`darkest` extend past `base` towards black, since the
// icon's own palette doesn't get dark enough to use as text on the off-white card body.
export const spell_card_colors = Object.freeze([
	{
		label: "Cyan",
		value: "cyan",
		lighter: "#f2fdfd",
		light: "#e0fbfb",
		base: "#3fa3ad",
		dark: "#1f6b72",
		darker: "#164f54",
		darkest: "#0d3336",
	},
	{
		label: "Blue",
		value: "blue",
		lighter: "#f6f7ff",
		light: "#ecefff",
		base: "#5c6ca7",
		dark: "#3c466d",
		darker: "#29314b",
		darkest: "#171b2a",
	},
	{
		label: "Yellow",
		value: "yellow",
		lighter: "#fffaf0",
		light: "#fff4e0",
		base: "#bd8b00",
		dark: "#7b5a00",
		darker: "#553f00",
		darkest: "#2f2300",
	},
	{
		label: "Red",
		value: "red",
		lighter: "#fff1f7",
		light: "#ffe2ef",
		base: "#d42758",
		dark: "#8a1939",
		darker: "#5f1228",
		darkest: "#350a16",
	},
	{
		label: "Orange",
		value: "orange",
		lighter: "#fffaf6",
		light: "#fff4ed",
		base: "#d1774a",
		dark: "#884d30",
		darker: "#5e3621",
		darkest: "#341e13",
	},
	{
		label: "Green",
		value: "green",
		lighter: "#f7fff6",
		light: "#efffec",
		base: "#6b8a6b",
		dark: "#465a46",
		darker: "#303e30",
		darkest: "#1b231b",
	},
	// Grayscale, high-contrast variant for printing: lighter is pure white, darkest is
	// pure black, base sits at 20% black (light gray) so it stays visibly distinct
	// from white without wasting ink on a heavy fill.
	{
		label: "Print",
		value: "print",
		lighter: "#ffffff",
		light: "#e6e6e6",
		base: "#cccccc",
		dark: "#999999",
		darker: "#4d4d4d",
		darkest: "#000000",
	},
]);

export default {
	spell_levels,
	spell_schools,
	spell_components,
	spell_cast_time_types,
	spell_range_types,
	spell_duration_types,
	spell_duration_types_time,
	spell_duration_times,
	level_scaling,
	spell_card_colors,
};
