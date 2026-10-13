import {
	stacking_modes,
	triggers,
	trigger_by,
	frequencies,
	targets,
	choice_kinds,
	save_on_success,
	consume_on,
	consume_scopes,
	aura_affects,
	sustain_costs,
	condition_check_types,
	condition_subjects,
	comparators,
	attack_types,
	check_values,
	sizes,
} from "src/utils/effectsConstants";
import { choiceKinds, describeSubEffect } from "src/utils/effectFunctions";

const label = (entries, value) => entries[value]?.label || String(value).replace(/_/g, " ");
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text);
const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
const list = (items, word = "and") =>
	items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} ${word} ${items[items.length - 1]}`;
const words = (value) => String(value).replace(/[_-]/g, " ");
const amount = (value) => {
	if (typeof value === "number") return `${value}`;
	if (value?.formula) return value.formula;
	if (value?.dice_count && value?.dice_type) {
		return `${value.dice_count}d${value.dice_type}${value.fixed_val ? `+${value.fixed_val}` : ""}`;
	}
	return undefined;
};

/**
 * A condition set in words: "the holder has the Incapacitated condition or …"
 *
 * @param {object|object[]} set $defs/condition_set
 * @returns {string}
 */
export function describeConditionSet(set) {
	if (Array.isArray(set) || set?.all_of || set?.any_of) {
		const items = Array.isArray(set) ? set : set.all_of || set.any_of;
		const parts = items.map(describeConditionSet).filter(Boolean);
		return list(parts, set?.any_of ? "or" : "and");
	}
	if (!set?.type) return "";
	if (set.description) return lower(set.description);

	const type = condition_check_types[set.type];
	const subject = lower(label(condition_subjects, set.subject || "self"));
	const has = set.negate ? "doesn't have" : "has";
	const is = set.negate ? "isn't" : "is";
	const hasValue = set.value !== undefined && set.value !== "";
	const name = hasValue ? words(set.value).replace(/\b\w/g, (c) => c.toUpperCase()) : "…";

	switch (type?.input) {
		case "condition":
			return `${subject} ${has} the ${name} condition`;
		case "effect":
			return `${subject} ${has} the ${name} effect`;
		case "creature_type":
			return `${subject} ${is} ${hasValue ? `a ${words(set.value)}` : "a creature of that type"}`;
		case "size":
			return `${subject} ${is} ${hasValue ? label(sizes, set.value) : "that size"}`;
		case "number": {
			const comparator = lower(label(comparators, set.comparator || "eq"));
			const value = hasValue ? set.value : "…";
			const check = `the ${lower(type.label)} of ${subject} is ${comparator} ${value}`;
			return set.negate ? `not ${check}` : check;
		}
		default: {
			const values = check_values[type?.input];
			const value = hasValue ? ` ${values ? lower(label(values, set.value)) : words(set.value)}` : "";
			const check = `${lower(type?.label || words(set.type))}${value}`;
			return `${subject}: ${set.negate ? `not ${check}` : check}`;
		}
	}
}

/**
 * Effect-level configuration summaries ({ text, incomplete })
 */
const EFFECT_SUMMARIES = {
	stacking(stacking) {
		const mode = stacking.mode || "none";
		const texts = {
			none: "This effect doesn't stack: the stronger or longer instance is kept.",
			level: "Applying this effect again raises its level.",
			replace: "Applying this effect again replaces the old instance.",
			independent: "Every instance of this effect applies separately.",
		};
		let text = texts[mode] || `${label(stacking_modes, mode)}.`;
		if (stacking.per_caster) text += " Instances from different casters count as different effects.";
		return { text };
	},
	level(level) {
		const parts = [`Starts at level ${level.initial ?? 1}`];
		if (level.max !== undefined) parts.push(`goes up to level ${level.max}`);
		const changes = [
			[level.per_long_rest, "after a Long Rest"],
			[level.per_short_rest, "after a Short Rest"],
			[level.per_dawn, "at dawn"],
		]
			.filter(([change]) => change)
			.map(([change, when]) => `${change > 0 ? `+${change}` : change} ${when}`);
		let text = `${list(parts)}.`;
		if (changes.length) text += ` Changes ${list(changes)}.`;
		if (level.remove_at !== undefined) text += ` Ends at level ${level.remove_at}.`;
		return { text };
	},
	condition(set) {
		const description = describeConditionSet(set);
		return description
			? { text: `This effect does nothing unless ${description}.` }
			: { text: "No check set up yet.", incomplete: true };
	},
	ends_when(set) {
		const description = describeConditionSet(set);
		return description
			? { text: `This effect ends as soon as ${description}.` }
			: { text: "No check set up yet.", incomplete: true };
	},
	sustain(sustain) {
		const kept = (sustain.triggers || []).map((t) => lower(label(triggers, t)));
		if (!kept.length) return { text: "Choose what keeps this effect going.", incomplete: true };
		const check = lower(label(triggers, sustain.check || "end_turn_target"));
		let text = `Checked at the ${check}: it ends unless the holder ${list(kept, "or")} since the last check.`;
		if (sustain.manual_cost) text += ` It can also be kept going with a ${label(sustain_costs, sustain.manual_cost)}.`;
		if (sustain.description) text += ` ${sustain.description}`;
		return { text };
	},
	aura(aura) {
		const subs = (aura.sub_effects || []).filter((s) => s?.type).map((s) => describeSubEffect(s));
		if (!aura.radius || !subs.length) {
			return { text: "Set a radius and at least one sub-effect.", incomplete: true };
		}
		const affects = lower(label(aura_affects, aura.affects || "chosen"));
		let text = `A ${aura.radius}-foot aura that gives ${affects}${aura.include_self ? " and the holder" : ""}: ${list(subs)}.`;
		const condition = aura.condition && describeConditionSet(aura.condition);
		if (condition) text += ` Works only while ${condition}.`;
		return { text };
	},
};

/**
 * A trigger filter in words: ", only when caused by an enemy, with fire damage"
 */
function describeTriggerFilter(filter = {}) {
	const parts = [];
	if (filter.by && filter.by !== "any") parts.push(`caused by ${lower(label(trigger_by, filter.by))}`);
	if (filter.within) parts.push(`within ${filter.within} feet`);
	if (filter.min_amount) parts.push(`of at least ${filter.min_amount}`);
	if (filter.damage_types?.length) parts.push(`with ${list(filter.damage_types.map(words), "or")} damage`);
	if (filter.attack_types?.length) {
		parts.push(`with ${list(filter.attack_types.map((t) => lower(label(attack_types, t))), "or")} attacks`);
	}
	if (filter.natural_roll?.length) parts.push(`on a natural ${list(filter.natural_roll.map(String), "or")}`);
	if (filter.source) parts.push(describeSource(filter.source));
	return parts.filter(Boolean).join(", ");
}

/**
 * A source filter in words: "from a magical spell of level 3 or lower"
 */
function describeSource(source = {}) {
	const parts = [];
	if (source.magical === true) parts.push("magical");
	if (source.magical === false) parts.push("nonmagical");
	if (source.spell === true) parts.push("from a spell");
	if (source.spell === false) parts.push("not from a spell");
	if (source.spell_names?.length) parts.push(`from ${list(source.spell_names.map(words), "or")}`);
	if (source.spell_schools?.length) parts.push(`from ${list(source.spell_schools, "or")} spells`);
	if (source.spell_level_max !== undefined) parts.push(`of spell level ${source.spell_level_max} or lower`);
	if (source.creature_types?.length) parts.push(`from ${list(source.creature_types, "or")} creatures`);
	if (source.conditions?.length) parts.push(`from effects that apply ${list(source.conditions.map(words), "or")}`);
	if (source.is_caster === true) parts.push("from the caster");
	if (source.is_caster === false) parts.push("not from the caster");
	return parts.join(", ");
}

/**
 * Sub-effect configuration summaries ({ text, incomplete })
 */
const SUB_EFFECT_SUMMARIES = {
	trigger(sub_effect) {
		if (!sub_effect.trigger) return { text: "Choose when this part happens.", incomplete: true };
		let text = `Happens when the holder ${lower(label(triggers, sub_effect.trigger))}`;
		if (sub_effect.trigger.startsWith("start_turn") || sub_effect.trigger.startsWith("end_turn")) {
			text = `Happens at the ${lower(label(triggers, sub_effect.trigger))}`;
		}
		const filter = describeTriggerFilter(sub_effect.trigger_filter);
		if (filter) text += `, only ${filter}`;
		if (sub_effect.frequency && sub_effect.frequency !== "always") {
			text += `, ${lower(label(frequencies, sub_effect.frequency))}`;
		}
		return { text: `${text}.` };
	},
	target(sub_effect) {
		return { text: `This part goes to ${lower(label(targets, sub_effect.target || "self"))}.` };
	},
	choice(sub_effect) {
		const kinds = choiceKinds(sub_effect);
		if (!kinds.length) return { text: "Choose what is picked when the effect is applied.", incomplete: true };
		const names = kinds.map((kind) => lower(label(choice_kinds, kind)));
		const verb = kinds.length > 1 ? "are" : "is";
		return { text: `The ${list(names)} ${verb} chosen when the effect is applied.` };
	},
	save(sub_effect) {
		const save = sub_effect.save || {};
		const abilities = save.ability ? [save.ability] : save.abilities || [];
		const dc = amount(save.dc);
		let text = abilities.length
			? `${capitalize(list(abilities, "or"))} save${dc ? ` (DC ${dc})` : ", DC set when applied"}`
			: `A save${dc ? ` (DC ${dc})` : ""}, ability not set`;
		text += `. On a success: ${lower(label(save_on_success, save.on_success || "negate"))}.`;
		if (save.success_effects?.length) text += ` ${save.success_effects.length} other effect(s) on a success.`;
		if (save.fail_by_5_effects?.length) text += ` ${save.fail_by_5_effects.length} extra effect(s) when failed by 5 or more.`;
		const conditions = [
			[save.advantage_if, "Advantage when"],
			[save.auto_fail_if, "Fails automatically when"],
			[save.auto_success_if, "Succeeds automatically when"],
		]
			.filter(([set]) => set && describeConditionSet(set))
			.map(([set, prefix]) => `${prefix} ${describeConditionSet(set)}.`);
		if (conditions.length) text += ` ${conditions.join(" ")}`;
		if (save.immune_on_success?.value) {
			text += ` Immune for ${amount(save.immune_on_success.value)} ${save.immune_on_success.unit}(s) after a success.`;
		}
		return { text, incomplete: !abilities.length };
	},
	condition(sub_effect) {
		const description = describeConditionSet(sub_effect.condition);
		return description
			? { text: `Only works while ${description}.` }
			: { text: "No check set up yet.", incomplete: true };
	},
	consume(sub_effect) {
		const consume = sub_effect.consume || {};
		const uses = consume.uses || 1;
		const on = lower(label(consume_on, consume.on || "roll"));
		const scope = lower(label(consume_scopes, consume.scope || "effect"));
		return { text: `Used up after ${uses === 1 ? on : `${uses} × ${on}`}, which removes ${scope}.` };
	},
	levels(sub_effect) {
		const { min_level: min, max_level: max } = sub_effect;
		if (min === undefined && max === undefined) return { text: "Set a level range.", incomplete: true };
		if (max === undefined) return { text: `Active from level ${min}.` };
		if (min === undefined) return { text: `Active up to level ${max}.` };
		return { text: `Active from level ${min} up to level ${max}.` };
	},
	source(sub_effect) {
		const description = describeSource(sub_effect.source);
		return description
			? { text: `Only for rolls or damage that are: ${description}.` }
			: { text: "No source set up yet.", incomplete: true };
	},
	id(sub_effect) {
		return sub_effect.id
			? { text: `Other parts and formulas can refer to this one as "${sub_effect.id}".` }
			: { text: "Set an id.", incomplete: true };
	},
};

/**
 * The settings of a configuration in words, for its list item
 *
 * @param {"effect"|"sub_effect"} level Where the configuration is
 * @param {string} key Configuration key
 * @param {object} target The effect or sub-effect
 * @returns {{ text: string, incomplete?: boolean }}
 */
export function summarizeConfiguration(level, key, target = {}) {
	if (level === "effect") {
		const summary = EFFECT_SUMMARIES[key];
		return summary ? summary(target[key] || {}) : { text: "" };
	}
	const summary = SUB_EFFECT_SUMMARIES[key];
	return summary ? summary(target) : { text: "" };
}
