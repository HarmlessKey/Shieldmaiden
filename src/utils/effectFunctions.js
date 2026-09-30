import conditions_5e from "src/data/5e/conditions.js";
import effects_5e from "src/data/5e/effects.js";
import conditions_55e from "src/data/5.5e/conditions.js";
import effects_55e from "src/data/5.5e/effects.js";
import { effect_types, effect_subtypes } from "src/utils/effectsConstants.js";

const SRD_DEFINITIONS = {
	"5e": { conditions: conditions_5e, effects: effects_5e },
	"5.5e": { conditions: conditions_55e, effects: effects_55e },
};

const ROUNDS_PER_UNIT = { round: 1, minute: 10, hour: 600, day: 14400 };

const byName = (a, b) => a.name.localeCompare(b.name);

/**
 * SRD condition and effect definitions of a rules edition.
 * Effects are table rules, so pass the campaign edition, not the entity's.
 *
 * @param {string} edition "5e" or "5.5e", anything else falls back to "5e"
 * @returns {{ conditions: object[], effects: object[] }} sorted by name
 */
export function getSrdDefinitions(edition) {
	const definitions = SRD_DEFINITIONS[edition === "5.5e" ? "5.5e" : "5e"];
	return {
		conditions: [...definitions.conditions].sort(byName),
		effects: [...definitions.effects].sort(byName),
	};
}

/**
 * Finds an SRD definition by url in the effects and conditions of an edition
 *
 * @param {string} edition "5e" or "5.5e", anything else falls back to "5e"
 * @param {string} url Definition url, e.g. "prone"
 * @returns {object|undefined}
 */
export function findSrdDefinition(edition, url) {
	const definitions = SRD_DEFINITIONS[edition === "5.5e" ? "5.5e" : "5e"];
	return (
		definitions.effects.find((definition) => definition.url === url) ||
		definitions.conditions.find((definition) => definition.url === url)
	);
}

/**
 * Copy of a definition with sub_effects in the v2 shape.
 * Custom effects saved by the legacy form use subeffects / subtype.
 *
 * @param {object} raw Effect definition
 * @returns {object} New object, the input is not modified
 */
export function normalizeDefinition(raw = {}) {
	const source_sub_effects = Array.isArray(raw.sub_effects)
		? raw.sub_effects
		: Array.isArray(raw.subeffects)
		? raw.subeffects
		: [];

	const sub_effects = source_sub_effects.map((sub_effect) => {
		if (typeof sub_effect?.subtype !== "string" || sub_effect.sub_types) return { ...sub_effect };
		const { subtype, ...rest } = sub_effect;
		return { ...rest, sub_types: [subtype] };
	});

	const { subeffects, ...definition } = raw; // eslint-disable-line no-unused-vars
	return { ...definition, sub_effects };
}

/**
 * Resolves a definition for runtime use: its own sub-effects followed by the sub-effects
 * of every definition it includes, recursively. Each definition is included once;
 * pulled-in sub-effects get `from` set to the definition they came from.
 *
 * @param {string} source "srd", "custom" or "api"
 * @param {string} sourceKey url or id of the definition
 * @param {function} lookup async ({ source, source_key }) => raw definition or undefined
 * @returns {Promise<object>} { name, description, category, cancelable, sub_effects, unresolved }
 */
export async function resolveDefinition({ source, sourceKey, lookup }) {
	const seen = new Set([`${source}:${sourceKey}`]);

	const resolve = async (ref) => {
		let raw;
		try {
			raw = await lookup(ref);
		} catch (error) {
			raw = undefined;
		}
		if (!raw) return undefined;

		const definition = normalizeDefinition(raw);
		const sub_effects = [];

		for (const sub_effect of definition.sub_effects) {
			sub_effects.push(sub_effect);
			if (sub_effect.type !== "includes" || !sub_effect.effect) continue;

			const { source: inc_source, source_key: inc_key } = sub_effect.effect;
			const id = `${inc_source}:${inc_key}`;
			if (seen.has(id)) continue;
			seen.add(id);

			const included = await resolve({ source: inc_source, source_key: inc_key });
			if (!included) continue;

			const from = { source: inc_source, source_key: inc_key, name: included.name };
			for (const included_sub_effect of included.sub_effects) {
				sub_effects.push(
					included_sub_effect.from ? included_sub_effect : { ...included_sub_effect, from }
				);
			}
		}

		return {
			name: definition.name,
			description: definition.description,
			category: definition.category,
			cancelable: definition.cancelable,
			ends_when: definition.ends_when,
			sub_effects,
		};
	};

	const resolved = await resolve({ source, source_key: sourceKey });
	return resolved
		? { ...resolved, unresolved: false }
		: { name: undefined, sub_effects: [], unresolved: true };
}

// "auto_fail" -> "Auto Fail", like lodash startCase for the keys used in effects
const startCase = (value = "") =>
	String(value)
		.replace(/[_-]+/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

/**
 * Human-readable line for a sub-effect: its description, or its type and subtypes when it
 * has none. Sub-effects pulled in through includes name the definition they came from.
 *
 * @param {object} sub_effect
 * @returns {string}
 */
export function describeSubEffect(sub_effect) {
	const from = sub_effect.from?.name ? ` (from ${sub_effect.from.name})` : "";
	if (sub_effect.type === "includes" && sub_effect.effect) {
		return `Includes ${sub_effect.effect.name || startCase(sub_effect.effect.source_key)}${from}`;
	}
	if (sub_effect.description) return `${sub_effect.description}${from}`;

	const type = effect_types[sub_effect.type]?.label || startCase(sub_effect.type);
	const sub_types = (sub_effect.sub_types || [])
		.map((sub_type) => effect_subtypes[sub_type]?.label || startCase(sub_type))
		.join(", ");
	const against = sub_effect.perspective === "against" ? " (against)" : "";
	return sub_types ? `${type}: ${sub_types}${against}${from}` : `${type}${against}${from}`;
}

const TRIGGER_ALIASES = {
	failed_save: "on_save_fail",
	success_save: "on_save_success",
	zero_hp: "on_zero_hp",
};

/**
 * Current name of a trigger, mapping the legacy spellings
 *
 * @param {string} trigger
 * @returns {string}
 */
export function normalizeTrigger(trigger) {
	return TRIGGER_ALIASES[trigger] || trigger;
}

/**
 * Trigger names in words, used in prompts: "Goblin: Burning, at the start of its turn"
 */
export const TRIGGER_LABELS = Object.freeze({
	start_turn_target: "at the start of its turn",
	end_turn_target: "at the end of its turn",
	start_turn_caster: "at the start of the caster's turn",
	end_turn_caster: "at the end of the caster's turn",
	combat_start: "when combat starts",
	damage_taken: "when it takes damage",
	damage_dealt: "when it deals damage",
	on_hit: "when it hits",
	on_hit_taken: "when it is hit",
	on_crit: "when it scores a critical hit",
	on_crit_taken: "when it takes a critical hit",
	on_save_success: "when it succeeds on a save",
	on_save_fail: "when it fails a save",
	on_check: "when it makes an ability check",
	on_zero_hp: "when it drops to 0 hit points",
	on_bloodied: "when it becomes Bloodied",
	on_heal: "when it is healed",
	short_rest: "on a short rest",
	long_rest: "on a long rest",
	on_apply: "when applied",
	on_condition_applied: "when it gains a condition",
});

const CASTER_TRIGGERS = ["start_turn_caster", "end_turn_caster"];
const CASTER_FALLBACK = {
	start_turn_target: "start_turn_caster",
	end_turn_target: "end_turn_caster",
};
const BY_LABELS = {
	caster_or_allies: "if caused by the caster or its allies",
	enemy: "if caused by an enemy",
	ally: "if caused by an ally",
};

/**
 * Checks a sub-effect's trigger_filter against what an event knows
 *
 * @returns {{ pass: boolean, unchecked: string[] }}
 */
function checkFilter(filter = {}, event = {}, instance = {}) {
	const unchecked = [];
	let pass = true;
	const test = (known, ok, label) => {
		if (!known) unchecked.push(label);
		else if (!ok) pass = false;
	};

	if (filter.by && filter.by !== "any") {
		if (filter.by === "caster") {
			test(event.sourceKey !== undefined, event.sourceKey === instance.caster_key, "if caused by the caster");
		} else if (filter.by === "counterpart") {
			test(event.sourceKey !== undefined, true, "if caused by the other creature");
		} else {
			unchecked.push(BY_LABELS[filter.by] || `if caused by: ${filter.by}`);
		}
	}
	if (filter.damage_types?.length) {
		test(
			Array.isArray(event.damageTypes),
			event.damageTypes?.some((type) => filter.damage_types.includes(type)),
			`if the damage is ${filter.damage_types.join(" or ")}`
		);
	}
	if (filter.attack_types?.length) {
		test(
			Array.isArray(event.attackTypes),
			event.attackTypes?.some((type) => filter.attack_types.includes(type)),
			`if it is a ${filter.attack_types.map((type) => type.replace(/_/g, " ")).join(" or ")} attack`
		);
	}
	if (filter.natural_roll?.length) {
		test(
			event.naturalRoll !== undefined,
			filter.natural_roll.includes(event.naturalRoll),
			`on a natural ${filter.natural_roll.join(" or ")}`
		);
	}
	if (filter.min_amount !== undefined) {
		test(
			event.amount !== undefined,
			event.amount >= filter.min_amount,
			`if the amount is ${filter.min_amount} or more`
		);
	}
	if (filter.within !== undefined) unchecked.push(`within ${filter.within} ft`);
	if (filter.source) unchecked.push("depending on the source");

	return { pass, unchecked };
}

/**
 * Active effect instances that listen for a trigger.
 *
 * Holder-scoped triggers look at the instances of entityKey. start/end_turn_caster look at
 * instances on any entity whose caster_key is entityKey; combat_start looks at every
 * instance. When an instance's caster isn't in the encounter, its caster-anchored
 * sub-effects fire on the holder's own start/end of turn instead.
 *
 * @param {string} trigger Trigger that fired
 * @param {string} entityKey Entity the trigger fired for
 * @param {object} entities Entities of the encounter, keyed by entity key
 * @param {function} definitionOf instance => resolved definition
 * @param {object} event What is known about the event: sourceKey, amount, damageTypes, attackTypes, naturalRoll
 * @param {string} effectKey Only look at this instance of entityKey (on_apply)
 * @returns {object[]} [{ holderKey, effectKey, instance, definition, matches: [{ sub_effect, unchecked }] }]
 */
export function matchTriggers({ trigger, entityKey, entities = {}, definitionOf, event = {}, effectKey }) {
	trigger = normalizeTrigger(trigger);
	const results = [];

	for (const [holderKey, entity] of Object.entries(entities)) {
		for (const [key, instance] of Object.entries(entity?.effects || {})) {
			if (effectKey !== undefined && (holderKey !== entityKey || key !== effectKey)) continue;

			const listens = [];
			if (trigger === "combat_start") {
				listens.push(trigger);
			} else if (CASTER_TRIGGERS.includes(trigger)) {
				if (instance.caster_key === entityKey) listens.push(trigger);
			} else if (holderKey === entityKey) {
				listens.push(trigger);
				// Caster isn't in the encounter: its turn triggers fall back to the holder's turn
				const fallback = CASTER_FALLBACK[trigger];
				if (fallback && (!instance.caster_key || !entities[instance.caster_key])) {
					listens.push(fallback);
				}
			}
			if (!listens.length) continue;

			const definition = definitionOf(instance);
			if (!definition || definition.unresolved) continue;

			const matches = [];
			for (const sub_effect of definition.sub_effects || []) {
				if (!listens.includes(normalizeTrigger(sub_effect.trigger))) continue;
				const { pass, unchecked } = checkFilter(sub_effect.trigger_filter, event, instance);
				if (pass) matches.push({ sub_effect, unchecked });
			}
			if (matches.length) results.push({ holderKey, effectKey: key, instance, definition, matches });
		}
	}
	return results;
}

const DURATION_LABELS = {
	instant: "Instantaneous",
	rest: "Until a rest",
	long_rest: "Until a long rest",
	dawn: "Until dawn",
	trigger: "Until triggered",
	save_ends: "Until saved",
	special: "Special",
	action_removed: "Until removed with an action",
};

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * Duration of an active effect instance in words
 *
 * @param {object} instance Active effect instance
 * @param {string} casterName Name of the caster, if known
 * @param {string} holderName Name of the entity that has the effect, if known
 * @returns {string} e.g. "7 rounds left", "Until the start of Goblin's next turn"
 */
export function describeDuration(instance, { casterName, holderName } = {}) {
	const duration = instance?.duration || { type: "cancelled" };
	const { type, value, unit = "round" } = duration;

	switch (type) {
		case "cancelled":
			return "Until removed";
		case "time":
			if (instance.rounds_remaining !== undefined) {
				return `${plural(instance.rounds_remaining, "round")} left`;
			}
			return value ? plural(value, unit) : "Timed";
		case "concentration":
			return value ? `Concentration, up to ${plural(value, unit)}` : "Concentration";
		case "next_turn": {
			const edge = duration.edge || "start";
			const anchor = duration.anchor || "caster";
			const whose =
				anchor === "target"
					? holderName
						? `${holderName}'s`
						: "its"
					: casterName
					? `${casterName}'s`
					: "the caster's";
			return `Until the ${edge} of ${whose} next turn`;
		}
		case "end_of_turn":
			return "Until the end of this turn";
		default:
			return DURATION_LABELS[type] || String(type || "").replace(/_/g, " ");
	}
}

/**
 * Badge value for an effect chip: Exhaustion level or rounds left of a timed effect
 *
 * @param {object} instance Active effect instance
 * @returns {number|undefined}
 */
export function effectBadge(instance) {
	if (instance?.source === "srd" && instance.source_key === "exhaustion") return instance.level;
	if (instance?.duration?.type === "time") return instance.rounds_remaining;
	return undefined;
}

/**
 * Choices the caster has to make when applying a definition.
 * Collected from `choice` on sub-effects and `damage_type_choice` on rolls.
 *
 * @param {object} definition Effect definition
 * @returns {{ kind: string, options?: string[] }[]} One entry per choice kind
 */
export function getRequiredChoices(definition) {
	const choices = {};

	const addChoice = (kind, options) => {
		if (!choices[kind]) {
			choices[kind] = { kind };
		}
		if (options) {
			const current = choices[kind].options;
			choices[kind].options = current ? current.filter((o) => options.includes(o)) : [...options];
		}
	};

	const walk = (sub_effects) => {
		if (!Array.isArray(sub_effects)) return;
		for (const sub_effect of sub_effects) {
			if (!sub_effect || typeof sub_effect !== "object") continue;
			if (sub_effect.choice) addChoice(sub_effect.choice);
			if (Array.isArray(sub_effect.roll?.damage_type_choice)) {
				addChoice("damage_type", sub_effect.roll.damage_type_choice);
			}
			walk(sub_effect.sub_effects);
		}
	};
	walk(definition?.sub_effects);

	return Object.values(choices);
}

/**
 * Number of rounds in a time duration
 *
 * @param {{ value: number, unit?: string }} duration
 * @returns {number}
 */
export function durationToRounds({ value, unit = "round" }) {
	return value * (ROUNDS_PER_UNIT[unit] || 1);
}

/**
 * Short key for an effect instance, unique among the existing keys
 *
 * @param {string[]} existingKeys Keys already used on the entity
 * @returns {string} e.g. "eff_8f3a"
 */
export function generateEffectKey(existingKeys = []) {
	let key;
	do {
		key = `eff_${Math.random().toString(36).slice(2, 6).padEnd(4, "0")}`;
	} while (existingKeys.includes(key));
	return key;
}

/**
 * Builds an active effect instance ($defs/active_instance) from an application.
 * Only a reference to the definition is kept, never its sub_effects.
 *
 * @param {object} definition Resolved effect definition
 * @param {string} source "srd" or "custom"
 * @param {string} sourceKey url of the SRD definition or id of the custom effect
 * @param {object} application $defs/application: duration (with an optional save that holds the dc), choices, level
 * @param {number} round Current round
 * @param {string} casterKey Key of the entity that has the turn
 * @param {string} casterName Name of that entity, shown when it isn't in a later encounter
 * @returns {object} Active effect instance without undefined or empty fields
 */
export function buildEffectInstance({
	definition,
	source,
	sourceKey,
	application = {},
	round,
	casterKey,
	casterName,
}) {
	const instance = {
		name: definition.name,
		source,
		source_key: sourceKey,
		applied_round: round || 0,
	};
	if (casterKey) {
		instance.caster_key = casterKey;
		if (casterName) instance.caster_name = casterName;
	}
	if (application.concentration_id) instance.concentration_id = application.concentration_id;

	const { save, ...duration } = application.duration || { type: "cancelled" };
	for (const prop of Object.keys(duration)) {
		if (duration[prop] === undefined || duration[prop] === null || duration[prop] === "") {
			delete duration[prop];
		}
	}
	if (!duration.type) duration.type = "cancelled";

	if (save?.ability) {
		const { dc, ...repeat_save } = save;
		duration.save = repeat_save;
		if (dc) instance.save_dc = dc;
	}
	instance.duration = duration;

	if (duration.type === "time" && duration.value) {
		instance.rounds_remaining = durationToRounds(duration);
	}

	const choices = application.choices || {};
	if (Object.keys(choices).length) instance.choices = { ...choices };

	if (application.level) instance.level = application.level;

	return instance;
}

/**
 * Display items for the effect instances of an entity, for views without the tracker store
 * (the player-facing live view). SRD names come from the local data of the edition.
 *
 * @param {object} effects Effect instances keyed by effect key
 * @param {string} edition Campaign edition
 * @returns {{ key: string, name: string, icon: string|undefined, level: number|undefined }[]}
 */
export function effectDisplayItems(effects = {}, edition) {
	return Object.entries(effects || {}).map(([key, instance]) => {
		const definition =
			instance.source === "srd" ? findSrdDefinition(edition, instance.source_key) : undefined;
		const isCondition = definition?.category === "condition";
		const isExhaustion = isCondition && instance.source_key === "exhaustion";
		const name = definition?.name || instance.name || "";
		return {
			key,
			name: name.charAt(0).toUpperCase() + name.slice(1),
			icon: isCondition ? instance.source_key : undefined,
			level: isExhaustion ? instance.level || 1 : undefined,
		};
	});
}

/**
 * Instances for an entity's legacy conditions map ({ poisoned: true, exhaustion: 2 }).
 * Conditions the entity already has as an instance and unknown keys are skipped.
 *
 * @param {object} conditions Legacy conditions map
 * @param {object} effects Existing effect instances of the entity
 * @param {string} edition Campaign edition
 * @param {number} round Current round
 * @returns {object[]} Until-removed SRD condition instances
 */
export function legacyConditionInstances({ conditions = {}, effects = {}, edition, round } = {}) {
	const existing = Object.values(effects || {});
	return Object.entries(conditions || {}).flatMap(([url, value]) => {
		const definition = findSrdDefinition(edition, url);
		if (definition?.category !== "condition") return [];
		if (existing.some((instance) => instance.source === "srd" && instance.source_key === url)) {
			return [];
		}
		const application = { duration: { type: "cancelled" } };
		if (url === "exhaustion") application.level = Math.max(1, Number(value) || 1);
		return [buildEffectInstance({ definition, source: "srd", sourceKey: url, application, round })];
	});
}

/**
 * Whether an entity has a condition: an instance of that SRD condition or an effect that
 * includes it (Stunned includes Incapacitated)
 *
 * @param {string} entityKey
 * @param {string} url Condition url, e.g. "incapacitated"
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {boolean}
 */
export function hasCondition(entityKey, url, { entities = {}, definitionOf = () => undefined } = {}) {
	const entity = entities[entityKey];
	if (!entity) return false;

	return Object.values(entity.effects || {}).some((instance) => {
		if (instance.source === "srd" && instance.source_key === url) return true;
		const definition = definitionOf(instance);
		return (definition?.sub_effects || []).some(
			(sub_effect) =>
				(sub_effect.type === "includes" && sub_effect.effect?.source_key === url) ||
				sub_effect.from?.source_key === url
		);
	});
}

const COMPARE = {
	lt: (a, b) => a < b,
	lte: (a, b) => a <= b,
	eq: (a, b) => a === b,
	neq: (a, b) => a !== b,
	gte: (a, b) => a >= b,
	gt: (a, b) => a > b,
};

/**
 * Evaluates a condition_set (ends_when) for an effect instance.
 * Checks that can't be evaluated in the tracker count as not holding, also when negated.
 *
 * @param {object|array} set $defs/condition_set
 * @param {string} holderKey Entity that has the instance
 * @param {object} instance Active effect instance
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {boolean}
 */
export function evaluateConditionSet(set, ctx) {
	if (!set) return false;
	if (Array.isArray(set)) return set.length > 0 && set.every((item) => evaluateConditionSet(item, ctx));
	if (Array.isArray(set.any_of)) return set.any_of.some((item) => evaluateConditionSet(item, ctx));
	if (Array.isArray(set.all_of)) return set.all_of.every((item) => evaluateConditionSet(item, ctx));

	const { holderKey, instance = {}, entities = {} } = ctx;
	const subjectKey = !set.subject || set.subject === "self" ? holderKey : set.subject === "caster" ? instance.caster_key : undefined;
	const subject = entities[subjectKey];
	if (!subject) return false;

	const curHp = Number(subject.curHp);
	const maxHp = Number(subject.maxHp);
	let result;
	switch (set.type) {
		case "has_condition":
			result = hasCondition(subjectKey, set.value, ctx);
			break;
		case "has_effect":
			result = Object.values(subject.effects || {}).some((i) => i.source_key === set.value);
			break;
		case "bloodied":
			result = curHp > 0 && curHp <= maxHp / 2;
			break;
		case "hp_zero":
			result = curHp <= 0;
			break;
		case "temp_hp_zero":
			result = !subject.tempHp;
			break;
		case "hp_threshold": {
			const compare = COMPARE[set.comparator || "lte"];
			if (!compare || typeof set.value !== "number") return false;
			result = compare(curHp, set.value);
			break;
		}
		default:
			return false;
	}
	return set.negate ? !result : result;
}

/**
 * Entity whose turns time an instance: the holder for "target", the caster for "caster".
 * A caster that isn't in the encounter, or no caster, falls back to the holder.
 */
export function anchorKey(instance, holderKey, entities = {}, anchor = "caster") {
	if (anchor === "target") return holderKey;
	return instance.caster_key && entities[instance.caster_key] ? instance.caster_key : holderKey;
}

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * What a trigger does to durations: ticks, expiries and possible cancels.
 * Turn timing is only processed on start/end_turn_target, which fire once per turn.
 *
 * @param {string} trigger Trigger that fired
 * @param {string} entityKey Entity it fired for
 * @param {object} entities Entities of the encounter
 * @param {object} event What is known about the event; for turn triggers `round` is the round of that turn
 * @param {number} round Current round of the encounter, for repeat saves that succeed automatically
 * @returns {object[]} { kind: "tick", holderKey, effectKey, value } | { kind: "expire", holderKey, effectKey, reason } | { kind: "maybe", holderKey, effectKey, unchecked } | { kind: "save", holderKey, effectKey, advantage } | { kind: "save_auto", holderKey, effectKey }
 */
export function durationActions({ trigger, entityKey, entities = {}, event = {}, round }) {
	trigger = normalizeTrigger(trigger);
	const actions = [];
	// Repeat saves come last, so an expiry on the same trigger wins
	const saves = [];

	for (const [holderKey, entity] of Object.entries(entities)) {
		for (const [effectKey, instance] of Object.entries(entity?.effects || {})) {
			const duration = instance.duration || { type: "cancelled" };

			// Repeat saves at their triggers
			const save = duration.save;
			if (save?.ability) {
				const triggers = (save.triggers?.length ? save.triggers : ["end_turn_target"]).map(
					normalizeTrigger
				);
				const matches = CASTER_TRIGGERS.includes(trigger)
					? anchorKey(instance, holderKey, entities, "caster") === entityKey
					: holderKey === entityKey;
				if (triggers.includes(trigger) && matches) {
					const autoAfter = save.auto_success_after;
					const auto =
						autoAfter?.value &&
						round !== undefined &&
						round - (instance.applied_round || 0) >= durationToRounds(autoAfter);
					saves.push(
						auto
							? { kind: "save_auto", holderKey, effectKey }
							: {
									kind: "save",
									holderKey,
									effectKey,
									advantage: (save.advantage_on_triggers || []).map(normalizeTrigger).includes(trigger),
							  }
					);
				}
			}

			const names = {
				casterName: entities[instance.caster_key]?.name,
				holderName: entity.name,
			};

			if (trigger === "end_turn_target") {
				if (
					duration.type === "time" &&
					instance.rounds_remaining !== undefined &&
					anchorKey(instance, holderKey, entities, "caster") === entityKey
				) {
					const value = instance.rounds_remaining - 1;
					if (value <= 0) {
						const passed = duration.value ? plural(duration.value, duration.unit || "round") : "its time";
						actions.push({ kind: "expire", holderKey, effectKey, reason: `${passed} passed` });
					} else {
						actions.push({ kind: "tick", holderKey, effectKey, value });
					}
					continue;
				}
				if (
					duration.type === "next_turn" &&
					(duration.edge || "start") === "end" &&
					anchorKey(instance, holderKey, entities, duration.anchor || "caster") === entityKey
				) {
					// Applied during this same turn: the end of this turn isn't "next turn"
					const sameTurn =
						instance.caster_key === entityKey && event.round === instance.applied_round;
					if (!sameTurn) {
						actions.push({
							kind: "expire",
							holderKey,
							effectKey,
							reason: lowerFirst(describeDuration(instance, names)),
						});
					}
					continue;
				}
				if (duration.type === "end_of_turn") {
					actions.push({ kind: "expire", holderKey, effectKey, reason: "the turn ended" });
					continue;
				}
			}

			if (
				trigger === "start_turn_target" &&
				duration.type === "next_turn" &&
				(duration.edge || "start") === "start" &&
				anchorKey(instance, holderKey, entities, duration.anchor || "caster") === entityKey
			) {
				actions.push({
					kind: "expire",
					holderKey,
					effectKey,
					reason: lowerFirst(describeDuration(instance, names)),
				});
				continue;
			}

			// Cancel triggers, for the holder's own events
			if (holderKey === entityKey && Array.isArray(duration.cancel_triggers)) {
				for (const entry of duration.cancel_triggers) {
					if (normalizeTrigger(entry.trigger) !== trigger) continue;
					const { pass, unchecked } = checkFilter(entry.filter, event, instance);
					if (!pass) continue;
					const label = TRIGGER_LABELS[trigger] || trigger.replace(/_/g, " ");
					actions.push(
						unchecked.length
							? { kind: "maybe", holderKey, effectKey, unchecked, reason: label }
							: { kind: "expire", holderKey, effectKey, reason: label }
					);
					break;
				}
			}
		}
	}
	return [...actions, ...saves];
}

const ESCAPE_CHECKS = {
	athletics: { ability: "strength", skill: "athletics" },
	acrobatics: { ability: "dexterity", skill: "acrobatics" },
};

/**
 * $defs/repeat_save from the drawer's form. Extras at their defaults are left out.
 *
 * @param {string} ability
 * @param {number} dc
 * @param {string[]} triggers
 * @param {number} successes Successes needed to end (default 1)
 * @param {object} escalate { failures, effect: { source, source_key, name } } or undefined
 * @param {object} autoAfter { value, unit } or undefined
 * @returns {object} Save with dc (buildEffectInstance moves the dc to save_dc)
 */
export function repeatSaveFromForm({ ability, dc, triggers, successes, escalate, autoAfter }) {
	const save = { ability, dc, triggers: [...(triggers || ["end_turn_target"])] };
	if (successes > 1) save.successes_to_end = successes;
	if (escalate?.failures > 0 && escalate.effect?.source_key) {
		save.failures_to_escalate = escalate.failures;
		save.escalate = { effect: { ...escalate.effect } };
	}
	if (autoAfter?.value > 0) save.auto_success_after = { value: autoAfter.value, unit: autoAfter.unit || "round" };
	return save;
}

/**
 * $defs/escape from the drawer's form
 *
 * @param {number} dc
 * @param {string[]} checks "athletics" and/or "acrobatics"
 * @param {string} by "self" (default, left out), "self_or_within_reach" or "any"
 */
export function escapeFromForm({ dc, checks, by }) {
	const escape = { dc, checks: (checks || []).map((check) => ({ ...ESCAPE_CHECKS[check] })).filter((c) => c.ability) };
	if (by && by !== "self") escape.by = by;
	return escape;
}

/**
 * Outcome of a repeat save for an instance
 *
 * @param {object} instance Active effect instance with duration.save
 * @param {boolean} success Whether the save succeeded
 * @returns {object} { result: "end" } | { result: "count", property, value } |
 *   { result: "escalate", value, escalate } | { result: "lock", value, duration }, plus onFail lines on a failure
 */
export function resolveRepeatSave(instance, success) {
	const save = instance.duration?.save || {};

	if (success) {
		const value = (instance.save_successes || 0) + 1;
		if (value >= (save.successes_to_end || 1)) return { result: "end" };
		return { result: "count", property: "save_successes", value };
	}

	const value = (instance.save_failures || 0) + 1;
	const onFail = (save.on_fail || []).map(describeSubEffect);
	if (save.failures_to_escalate && value >= save.failures_to_escalate && save.escalate) {
		if (save.escalate.lock) {
			const { save: _save, ...duration } = instance.duration; // eslint-disable-line no-unused-vars
			return { result: "lock", value, duration, onFail };
		}
		if (save.escalate.effect) return { result: "escalate", value, escalate: save.escalate, onFail };
	}
	return { result: "count", property: "save_failures", value, onFail };
}

/**
 * What happens when an instance ends: its duration's on_expire and its definition's
 * on_expire-triggered sub-effects
 *
 * @returns {string[]}
 */
export function onExpireLines({ instance = {}, definition }) {
	const own = instance.duration?.on_expire || [];
	const fromDefinition = (definition?.sub_effects || []).filter(
		(sub_effect) => normalizeTrigger(sub_effect.trigger) === "on_expire"
	);
	return [...own, ...fromDefinition].map(describeSubEffect);
}

/**
 * The instance that replaces an escalated one: the escalation's effect, with its duration or
 * the old duration without the repeat save, keeping caster and Concentration link
 *
 * @param {object} instance The instance that escalates
 * @param {object} definition Resolved definition of the escalation's effect
 * @param {number} round Current round
 * @returns {object} Active effect instance
 */
export function escalationInstance({ instance, definition = {}, round }) {
	const { effect, duration } = instance.duration.save.escalate;
	const { save: _save, ...oldDuration } = instance.duration; // eslint-disable-line no-unused-vars
	return buildEffectInstance({
		definition: { name: definition.name || effect.name || startCase(effect.source_key) },
		source: effect.source,
		sourceKey: effect.source_key,
		application: {
			duration: duration || oldDuration,
			concentration_id: instance.concentration_id,
		},
		round,
		casterKey: instance.caster_key,
		casterName: instance.caster_name,
	});
}

/**
 * Instances whose end condition holds: the duration's ends_when or the definition's
 *
 * @returns {object[]} [{ kind: "expire", holderKey, effectKey, reason }]
 */
export function endsWhenExpiries({ entities = {}, definitionOf = () => undefined }) {
	const actions = [];
	for (const [holderKey, entity] of Object.entries(entities)) {
		for (const [effectKey, instance] of Object.entries(entity?.effects || {})) {
			const definition = definitionOf(instance);
			const sets = [instance.duration?.ends_when, definition?.ends_when].filter(Boolean);
			const met = sets.find((set) =>
				evaluateConditionSet(set, { holderKey, instance, entities, definitionOf })
			);
			if (met) {
				actions.push({
					kind: "expire",
					holderKey,
					effectKey,
					reason: met.description
						? lowerFirst(met.description).replace(/\.$/, "")
						: "end condition met",
				});
			}
		}
	}
	return actions;
}

/**
 * Instances that end together with a removed instance: effects linked to it as
 * Concentration (concentration_id + caster_key) and children on the same holder (parent_id)
 *
 * @returns {object[]} [{ holderKey, effectKey }]
 */
export function cascadeTargets({ holderKey, effectKey, instance = {}, entities = {} }) {
	const targets = [];
	const isConcentration = instance.source === "srd" && instance.source_key === "concentration";

	for (const [key, entity] of Object.entries(entities)) {
		for (const [k, linked] of Object.entries(entity?.effects || {})) {
			if (key === holderKey && k === effectKey) continue;
			const concentrationLink =
				isConcentration && linked.concentration_id === effectKey && linked.caster_key === holderKey;
			const parentLink = key === holderKey && linked.parent_id === effectKey;
			if (concentrationLink || parentLink) targets.push({ holderKey: key, effectKey: k });
		}
	}
	return targets;
}

/**
 * Carried-over player and companion effects that need the DM's review: a duration other than
 * "until removed" and a caster that isn't in the encounter or a dangling Concentration link
 *
 * @returns {object[]} [{ holderKey, effectKey, instance }]
 */
export function carriedOverReview({ entities = {} }) {
	const review = [];
	for (const [holderKey, entity] of Object.entries(entities)) {
		if (!["player", "companion"].includes(entity?.entityType)) continue;
		for (const [effectKey, instance] of Object.entries(entity.effects || {})) {
			if (!instance.duration?.type || instance.duration.type === "cancelled") continue;
			const casterMissing = instance.caster_key && !entities[instance.caster_key];
			const linkDangling =
				instance.concentration_id &&
				!entities[instance.caster_key]?.effects?.[instance.concentration_id];
			if (casterMissing || linkDangling) review.push({ holderKey, effectKey, instance });
		}
	}
	return review;
}
