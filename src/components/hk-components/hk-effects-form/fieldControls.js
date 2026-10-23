import {
	effect_types,
	common_sub_effect_fields,
	choice_kinds,
	perspectives,
	attack_types,
	bypass_sources,
	mechanics,
	reroll_keep,
	roll_floor_applies_to,
	temp_hp_stacking,
	exclusive_actions,
	transfer_to,
	damage_directions,
	proficiency_levels,
	suggestions,
	roll_sub_types,
} from "src/utils/effectsConstants";
import { startCase } from "lodash";
import { abilities, creature_types, damage_types, skills } from "src/utils/generalConstants";
import { choiceKinds, getSrdDefinitions } from "src/utils/effectFunctions";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const startCaseOption = (value) => ({ label: startCase(value), value });

/**
 * Label and options of a choice asked when an effect is applied (the Effects drawer) or fixed
 * on a link (the NPC form).
 *
 * @param {{ kind: string, options?: string[] }} choice From getRequiredChoices
 * @param {object} [context]
 * @param {{ name: string, url: string }[]} [context.conditions] SRD conditions of the edition
 * @returns {{ label: string, options?: { label, value }[] }} No options for a free text or
 * number choice (option, value)
 */
export function choiceField({ kind, options } = {}, { conditions = [] } = {}) {
	const label = startCase(kind);
	switch (kind) {
		case "ability":
			return { label, options: abilities.map(startCaseOption) };
		case "damage_type":
			return {
				label,
				options: (options || damage_types.filter((type) => !type.startsWith("non_magical"))).map(startCaseOption),
			};
		case "skill":
			return { label, options: skillOptions };
		case "condition":
			return { label, options: conditions.map(({ name, url }) => ({ label: name, value: url })) };
		case "creature_type":
			return { label, options: creature_types.map(startCaseOption) };
		default:
			return { label };
	}
}

/**
 * Options for a select from a keyed constants object
 *
 * @param {object} entries Keyed constants ({ [value]: { value, label, description? } })
 * @returns {{ label: string, value: string, description?: string }[]}
 */
export function toOptions(entries) {
	return Object.values(entries).map(({ label, value, description }) => ({ label, value, description }));
}

/**
 * Options from a plain list of values, labelled by the value ("melee_weapon" → "Melee weapon")
 */
export function listOptions(values) {
	return values.map((value) => ({ label: capitalize(String(value).replace(/_/g, " ")), value }));
}

export const abilityOptions = listOptions(abilities);
export const creatureTypeOptions = listOptions(creature_types);
export const skillOptions = Object.values(skills).map(({ skill, value }) => ({ label: skill, value }));

/**
 * SRD conditions of both editions, one option per url (5.5e name first)
 */
export function srdConditionOptions() {
	const byUrl = new Map();
	for (const edition of ["5.5e", "5e"]) {
		for (const { url, name } of getSrdDefinitions(edition).conditions) {
			if (!byUrl.has(url)) byUrl.set(url, { label: name, value: url });
		}
	}
	return [...byUrl.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Options for an effect reference: SRD conditions, SRD effects (one per url over both
 * editions, with a hint when only one edition has it) and the user's custom effects.
 *
 * @param {object} options
 * @param {{ key: string, name: string }[]} options.custom The user's custom effects
 * @param {string} [options.excludeKey] Custom effect that can't be referenced (the one being edited)
 * @returns {{ label, value, group, hint?, ref: { source, source_key, name } }[]} value is "<source>:<key>"
 */
export function effectRefOptions({ custom = [], excludeKey } = {}) {
	const srd = new Map();
	for (const edition of ["5.5e", "5e"]) {
		const { conditions, effects } = getSrdDefinitions(edition);
		const add = (definition, group) => {
			const entry = srd.get(definition.url);
			if (entry) entry.editions.push(edition);
			else srd.set(definition.url, { name: definition.name, url: definition.url, group, editions: [edition] });
		};
		conditions.forEach((definition) => add(definition, "Conditions"));
		effects.forEach((definition) => add(definition, "SRD effects"));
	}

	const srdOptions = [...srd.values()]
		.sort((a, b) => (a.group === b.group ? a.name.localeCompare(b.name) : a.group === "Conditions" ? -1 : 1))
		.map(({ name, url, group, editions }) => ({
			label: name,
			value: `srd:${url}`,
			group,
			hint: editions.length === 1 ? `${editions[0]} only` : undefined,
			ref: { source: "srd", source_key: url, name },
		}));

	const customOptions = custom
		.filter(({ key }) => key && key !== excludeKey)
		.map(({ key, name }) => {
			const label = capitalize(String(name || key));
			return { label, value: `custom:${key}`, group: "My effects", ref: { source: "custom", source_key: key, name: label } };
		})
		.sort((a, b) => a.label.localeCompare(b.label));

	return [...srdOptions, ...customOptions];
}

/**
 * Effect-level configurations, picked in the form's Configuration select.
 * keys: the definition fields the configuration owns
 * initial: the value it starts with when selected
 */
export const effect_configurations = Object.freeze([
	{
		key: "stacking",
		label: "Stacking",
		description: "What happens when the effect is applied to a creature that already has it",
		keys: ["stacking"],
		initial: () => ({}),
	},
	{
		key: "level",
		label: "Level track",
		description:
			"The effect has a level that changes over time, like Exhaustion: a starting level, a maximum, and how rests change it",
		keys: ["level"],
		initial: () => ({}),
	},
	{
		key: "condition",
		label: "Active only when",
		description:
			"The effect stays applied but does nothing while this isn't true (Aura of Protection does nothing while its holder is Incapacitated)",
		keys: ["condition"],
		initial: () => ({}),
	},
	{
		key: "ends_when",
		label: "Ends when",
		description: "The effect ends as soon as this is true (Rage ends when its holder is Incapacitated)",
		keys: ["ends_when"],
		initial: () => ({}),
	},
	{
		key: "sustain",
		label: "Sustain",
		description:
			"The effect ends unless something keeps it going, checked each turn (Rage ends unless its holder attacked or took damage)",
		keys: ["sustain"],
		initial: () => ({}),
	},
	{
		key: "aura",
		label: "Aura",
		description:
			"Sub-effects the holder gives to creatures near it, while they're inside (Spirit Guardians, Aura of Protection)",
		keys: ["aura"],
		initial: () => ({ sub_effects: [] }),
	},
]);

/**
 * Sub-effect configurations, picked in each sub-effect's Configuration select.
 * keys: the sub-effect fields the configuration owns
 * initial: the value of keys[0] when selected; without one, nothing is set until it's filled in
 */
export const sub_effect_configurations = Object.freeze([
	{
		key: "trigger",
		label: "Trigger",
		description: "Happens when something occurs (the start of a turn, taking damage) instead of all the time",
		keys: ["trigger", "trigger_filter", "frequency"],
	},
	{
		key: "target",
		label: "Target",
		description: "Who gets this part: the holder, the caster, or the other creature of the trigger",
		keys: ["target"],
	},
	{
		key: "choice",
		label: "Choice",
		description:
			"Values picked when the effect is applied, like a damage type or a skill and a number, so one effect fits many cases",
		keys: ["choice"],
	},
	{
		key: "save",
		label: "Save",
		description: "The recipient makes a saving throw each time this part happens",
		keys: ["save"],
		initial: () => ({}),
	},
	{
		key: "condition",
		label: "Condition",
		description: "This part only works while something is true (an attack within 5 feet, a Bloodied target)",
		keys: ["condition"],
		initial: () => ({}),
	},
	{
		key: "consume",
		label: "Used up",
		description: "The effect or this part ends once it's used, like Guiding Bolt's next attack",
		keys: ["consume"],
		initial: () => ({}),
	},
	{
		key: "levels",
		label: "Level range",
		description: "Only active at some levels of an effect with a level track (the rows of 2014 Exhaustion)",
		keys: ["min_level", "max_level"],
	},
	{
		key: "source",
		label: "Source filter",
		description: "Only for rolls or damage from certain sources (spells, a creature type)",
		keys: ["source"],
		initial: () => ({}),
	},
	{
		key: "id",
		label: "Id",
		description: "A name that formulas and other parts can use to refer to this part",
		keys: ["id"],
	},
]);

// Field rules: a type lists the fields it can use, and these narrow them down to the ones
// that matter for the chosen sub-types (Applies to). A Bonus on Armor Class only needs a value.

// Types whose sub-types are values or rolls (Bonus, Set base value…)
const VALUE_TYPES = ["bonus", "base", "fixed", "floor", "cap"];
// Types whose sub-types are all rolls (Advantage, Reroll…)
const ROLL_TYPES = [
	"advantage",
	"disadvantage",
	"reroll",
	"roll_floor",
	"auto_fail",
	"auto_success",
	"score_swap",
];
// Rolls a value type can change (initiative counts as a value: the initiative modifier)
const ROLLS = roll_sub_types.filter((sub_type) => sub_type !== "initiative");
// Values a multiplier makes sense for (Speed halved, hit point maximum halved)
const MULTIPLIED = [
	"max_hp",
	"speed",
	"fly_speed",
	"climb_speed",
	"swim_speed",
	"burrow_speed",
	"reach",
	"jump",
	"healing",
	"healing_received",
];

const hasSubType = (sub_effect, list) => (sub_effect.sub_types || []).some((sub_type) => list.includes(sub_type));
// For these types, the test decides; other types always show the field
const forTypes = (types, test) => (sub_effect) => !types.includes(sub_effect.type) || test(sub_effect);
const allOf = (...tests) => (sub_effect) => tests.every((test) => test(sub_effect));

const RULES = {
	// Dice on a roll (Bless), temporary hit points (False Life), extra critical dice
	roll: allOf(
		forTypes(VALUE_TYPES, (s) => hasSubType(s, [...ROLLS, "temp_hp"])),
		forTypes(["critical"], (s) => hasSubType(s, ["extra_crit_dice"]))
	),
	// Speed halved, or a negative multiplier for a penalty on rolls (Bane)
	multiplier: forTypes(VALUE_TYPES, (s) => hasSubType(s, [...MULTIPLIED, ...ROLLS])),
	perspective: forTypes(VALUE_TYPES, (s) => hasSubType(s, ROLLS)),
	context: forTypes(VALUE_TYPES, (s) => hasSubType(s, ROLLS)),
	creature_types: forTypes(VALUE_TYPES, (s) => hasSubType(s, ROLLS)),
	damage_types: forTypes(VALUE_TYPES, (s) => hasSubType(s, ["damage"])),
	attack_types: forTypes([...VALUE_TYPES, ...ROLL_TYPES], (s) => hasSubType(s, ["attack", "damage"])),
	abilities: allOf(
		forTypes(VALUE_TYPES, (s) => hasSubType(s, ["ability_score", "save", "ability", "d20_test"])),
		forTypes(ROLL_TYPES, (s) => hasSubType(s, ["save", "ability", "d20_test"]))
	),
	skills: forTypes([...VALUE_TYPES, ...ROLL_TYPES, "proficiency"], (s) => hasSubType(s, ["skill"])),
	// A damage type choice picks one type, so "all damage" and its exceptions don't apply
	all_damage: (s) => !choiceKinds(s).includes("damage_type"),
	// "Except damage types" narrows "All damage types" on a defense (damage modifiers use it on its own)
	except_damage_types: allOf(
		(s) => !choiceKinds(s).includes("damage_type"),
		forTypes(["defense"], (s) => !!s.all_damage)
	),
	// Conditions and other immunities only exist as immunities, not as resistance or vulnerability
	conditions: forTypes(["defense"], (s) => hasSubType(s, ["i"])),
	mechanics: forTypes(["defense"], (s) => hasSubType(s, ["i"])),
	suppress_existing: forTypes(["defense"], (s) => hasSubType(s, ["i"])),
};

/**
 * Controls for the type-specific sub-effect fields.
 * control: how the field is edited (see SubEffectField.vue)
 * when: shown only when this returns true for the sub-effect
 */
export const sub_effect_fields = Object.freeze({
	value: {
		label: "Value",
		control: "amount",
		modes: ["number", "formula"],
		hint: "A formula can use level, the effect's own level",
	},
	roll: { label: "Roll", control: "roll" },
	multiplier: { label: "Multiplier", control: "number", hint: "0.5 halves, 2 doubles" },
	perspective: { label: "Whose rolls", control: "select", options: perspectives },
	abilities: { label: "Abilities", control: "abilities" },
	skills: { label: "Skills", control: "skills" },
	context: { label: "Context", control: "suggest", suggestions: suggestions.context, hint: "e.g. sight, hearing" },
	attack_types: { label: "Attack types", control: "select", options: attack_types, multiple: true },
	damage_types: { label: "Damage types", control: "damage_types" },
	all_damage: { label: "All damage types", control: "toggle" },
	except_damage_types: { label: "Except damage types", control: "damage_types" },
	bypass: { label: "Doesn't apply to damage that is", control: "select", options: bypass_sources, multiple: true },
	conditions: { label: "Conditions", control: "conditions" },
	mechanics: { label: "Other immunities", control: "select", options: mechanics, multiple: true },
	creature_types: { label: "Creature types", control: "creature_types" },
	effect: { label: "Effect", control: "effect" },
	effects: { label: "Effects", control: "effects" },
	count: { label: "How many", control: "number", integer: true, min: 1 },
	duration: { label: "Duration of the applied effect", control: "duration" },
	suppress_existing: { label: "Suppress existing instances", control: "toggle" },
	reroll_condition: { label: "When the reroll is allowed", control: "text", hint: "e.g. natural 1" },
	keep: { label: "Keep", control: "select", options: reroll_keep },
	reroll_bonus: { label: "Bonus on the reroll", control: "amount" },
	with_advantage: { label: "Reroll with Advantage", control: "toggle" },
	applies_to: { label: "Minimum of", control: "select", options: roll_floor_applies_to },
	crit_range: { label: "Lowest natural roll that crits", control: "number", integer: true, min: 2, max: 20 },
	stacking: {
		label: "With existing temporary hit points",
		control: "select",
		options: temp_hp_stacking,
		when: (sub_effect) => (sub_effect.sub_types || []).includes("temp_hp"),
	},
	expires_with_effect: {
		label: "Temporary hit points end with the effect",
		control: "toggle",
		when: (sub_effect) => (sub_effect.sub_types || []).includes("temp_hp"),
	},
	also_heal: {
		label: "Also raise current hit points",
		control: "toggle",
		when: (sub_effect) => (sub_effect.sub_types || []).includes("max_hp"),
	},
	limit: { label: "Limit per turn", control: "number", integer: true, min: 1 },
	exclusive: { label: "Only one of these per turn", control: "select", options: exclusive_actions, multiple: true },
	allowed_actions: { label: "Actions", control: "list", suggestions: suggestions.allowed_actions },
	fraction: { label: "Share of the damage", control: "number", hint: "0.5 = half" },
	copy: { label: "Copy the damage instead of moving it", control: "toggle" },
	to: { label: "To", control: "select", options: transfer_to },
	to_type: { label: "New damage types", control: "damage_types" },
	direction: { label: "Damage", control: "select", options: damage_directions },
	range: { label: "Range (feet)", control: "number", min: 0 },
	proficiency_level: { label: "Proficiency", control: "select", options: proficiency_levels },
	from_ability: { label: "Instead of", control: "ability" },
	to_ability: {
		label: "Use",
		control: "suggest",
		suggestions: [...abilities, ...suggestions.to_ability],
	},
});

/**
 * Whether a type-specific field is shown for a sub-effect
 */
export function showsField(sub_effect, field) {
	const type = effect_types[sub_effect.type];
	if (!type || !type.fields.includes(field)) return false;
	const when = sub_effect_fields[field]?.when;
	if (when && !when(sub_effect)) return false;
	const rule = RULES[field];
	return rule ? rule(sub_effect) : true;
}

/**
 * The fields the sub-effect's choices fill, except those that stay editable (a damage type
 * choice uses the listed damage types as its options)
 *
 * @param {object} sub_effect
 * @returns {string[]} e.g. ["skills", "value"] for choice: ["skill", "value"]
 */
export function choiceLockedFields(sub_effect) {
	return choiceKinds(sub_effect)
		.filter((kind) => kind !== "damage_type")
		.map((kind) => choice_kinds[kind]?.field)
		.filter(Boolean);
}

/**
 * The choice value for a list of picked kinds: one kind as a string, more as a list, none as
 * undefined (no choice)
 *
 * @param {string[]|string} kinds
 * @returns {string|string[]|undefined}
 */
export function choiceValue(kinds) {
	const list = [kinds].flat().filter(Boolean);
	if (list.length > 1) return list;
	return list[0];
}

/**
 * Whether a shown field is locked: read-only and empty, because something else fills it.
 * The fields a choice fills, and Damage types while All damage types is checked.
 */
export function isLocked(sub_effect, field) {
	if (choiceLockedFields(sub_effect).includes(field)) return true;
	return field === "damage_types" && !!sub_effect.all_damage;
}

/**
 * What to remove from a sub-effect so it only has fields its type uses: keys that aren't
 * common or shown for its type, sub-types the type doesn't allow, and locked fields (see
 * isLocked).
 *
 * @param {object} sub_effect
 * @returns {{ keys: string[], sub_types: string[]|undefined }} sub_types is the kept list when it changes
 */
export function fieldsToClear(sub_effect) {
	const type = effect_types[sub_effect.type];
	const keys = Object.keys(sub_effect).filter((key) => {
		if (key === "sub_types") return false;
		if (common_sub_effect_fields.includes(key)) return false;
		return !showsField(sub_effect, key);
	});

	for (const key of Object.keys(sub_effect)) {
		if (!keys.includes(key) && isLocked(sub_effect, key)) keys.push(key);
	}

	let sub_types;
	if (Array.isArray(sub_effect.sub_types)) {
		const allowed = type ? type.sub_types : [];
		const kept = sub_effect.sub_types.filter((sub_type) => allowed.includes(sub_type));
		if (kept.length !== sub_effect.sub_types.length) sub_types = kept;
	}
	return { keys, sub_types };
}
