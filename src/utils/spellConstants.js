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
};
