import conditions_5e from "src/data/5e/conditions.js";
import conditions_55e from "src/data/5.5e/conditions.js";
import srd_effects from "src/data/effects.js";
import { action_outcomes, effect_types, effect_subtypes } from "src/utils/effectsConstants.js";
import { abilities, damage_types as DAMAGE_TYPES, skills } from "src/utils/generalConstants.js";
import { experience_table } from "src/utils/characterConstants.js";
import { manualBonuses, skillBonusKey } from "src/utils/entityFunctions.js";

// SRD effects without an edition are used in both editions
const srdEffectsOf = (edition) => srd_effects.filter((definition) => !definition.edition || definition.edition === edition);

const SRD_DEFINITIONS = {
	"5e": { conditions: conditions_5e, effects: srdEffectsOf("5e") },
	"5.5e": { conditions: conditions_55e, effects: srdEffectsOf("5.5e") },
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

// Urls of the SRD conditions (the same 15 in both editions)
const SRD_CONDITION_URLS = new Set(
	Object.values(SRD_DEFINITIONS).flatMap(({ conditions }) => conditions.map(({ url }) => url))
);

/**
 * Whether a definition reference is an SRD condition. Conditions are the definitions in the
 * SRD conditions lists; definitions have no category.
 *
 * @param {string} source "srd", "custom" or "api"
 * @param {string} url source_key of the definition
 * @returns {boolean}
 */
export function isSrdCondition(source, url) {
	return source === "srd" && SRD_CONDITION_URLS.has(url);
}

/**
 * Whether an effect key is a trait effect's (traitInstances), not an applied instance's
 *
 * @param {string} effectKey
 * @returns {boolean}
 */
export function isTraitKey(effectKey) {
	return typeof effectKey === "string" && effectKey.startsWith("trait:");
}

/**
 * The name an active effect is shown by in modifiers, notes and prompts: a trait effect by
 * its special ability ("Acid Absorption"), others by their definition or instance name
 *
 * @param {object} definition Resolved definition
 * @param {object} instance Active effect instance
 * @returns {string}
 */
export function effectLabel(definition, instance) {
	return instance?.trait?.ability_name || definition?.name || instance?.name || "";
}

/**
 * The always-active effects linked to an NPC's or companion's special abilities (trait
 * links, effects step 6b), as instances in the applied shape. They aren't stored: they're
 * built from the creature's special abilities, keyed "trait:<abilityIndex>:<linkIndex>". The
 * links of an ability whose limited uses are spent are left out. Players have none.
 *
 * @param {object} entity Tracker entity
 * @param {string} [holderKey] The entity's key, its trait effects' caster
 * @returns {object} { [effectKey]: instance } with instance.trait { ability_index, ability_name, link_index, limit }
 */
export function traitInstances(entity, holderKey) {
	const instances = {};
	if (!entity || entity.entityType === "player") return instances;

	(entity.special_abilities || []).forEach((ability, ability_index) => {
		const links = Array.isArray(ability?.effects) ? ability.effects : Object.values(ability?.effects || {});
		if (!links.length) return;
		const limit = parseInt(ability.limit) || undefined;
		const used = parseInt(entity.limited_uses?.special_abilities?.[ability_index]) || 0;
		if (limit && used >= limit) return;

		links.forEach((link, link_index) => {
			const effect = link?.effect;
			if (!effect?.source || !effect?.source_key) return;
			const instance = {
				name: effect.name || effect.source_key,
				source: effect.source,
				source_key: effect.source_key,
				caster_name: entity.name,
				trait: { ability_index, ability_name: ability.name, link_index, limit },
			};
			if (holderKey !== undefined) instance.caster_key = holderKey;
			if (link.choices && Object.keys(link.choices).length) instance.choices = { ...link.choices };
			if (link.level !== undefined) instance.level = link.level;
			if (link.magical) instance.magical = true;
			instances[`trait:${ability_index}:${link_index}`] = instance;
		});
	});
	return instances;
}

/**
 * The trait links of a special ability in words, for its automated marker: each effect with
 * its fixed choices ("Absorption (acid), Magic Resistance")
 *
 * @param {object} ability Special ability with `effects`
 * @returns {string} Empty without trait links
 */
export function traitEffectsLabel(ability) {
	const links = Array.isArray(ability?.effects) ? ability.effects : Object.values(ability?.effects || {});
	return links
		.filter((link) => link?.effect)
		.map((link) => {
			const name = link.effect.name || link.effect.source_key;
			const choices = Object.values(link.choices || {}).join(", ");
			return choices ? `${name} (${choices})` : name;
		})
		.join(", ");
}

/**
 * The effects that are active on an entity: its applied instances plus its trait effects.
 * The engine reads these; lists of a creature's effects (card, drawer, live view) read
 * entity.effects, which never holds trait effects.
 *
 * @param {object} entity Tracker entity
 * @param {string} [holderKey] The entity's key
 * @returns {[string, object][]} [effectKey, instance]
 */
export function effectEntries(entity, holderKey) {
	return [...Object.entries(entity?.effects || {}), ...Object.entries(traitInstances(entity, holderKey))];
}

/**
 * Copy of a definition with a sub_effects array.
 * Only the v2 shape is read: a definition without sub_effects gets none.
 *
 * @param {object} raw Effect definition
 * @returns {object} New object, the input is not modified
 */
export function normalizeDefinition(raw = {}) {
	const sub_effects = Array.isArray(raw.sub_effects)
		? raw.sub_effects.map((sub_effect) => ({ ...sub_effect }))
		: [];
	return { ...raw, sub_effects };
}

// Definition fields from before durations moved to the application (plan 2c)
const DEPRECATED_DEFINITION_FIELDS = ["duration_type", "duration_value", "cancel_trigger"];

// Keys whose values are numbers in the schema; numeric strings under them become numbers
const NUMERIC_KEYS = new Set([
	"value",
	"dc",
	"spell_level_max",
	"dice_count",
	"dice_type",
	"fixed_val",
	"min",
	"max",
	"multiplier",
	"min_level",
	"max_level",
	"initial",
	"per_long_rest",
	"per_short_rest",
	"per_dawn",
	"remove_at",
	"size",
	"width",
	"height",
	"radius",
	"within",
	"min_amount",
	"natural_roll",
	"uses",
	"count",
	"crit_range",
	"limit",
	"fraction",
	"range",
	"successes_to_end",
	"failures_to_escalate",
	"reroll_bonus",
]);

const isEmptyValue = (value) =>
	value === undefined ||
	value === null ||
	value === "" ||
	(Array.isArray(value) && !value.length) ||
	(typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length);

/**
 * Copy of a value without empty strings, null, undefined, empty arrays and empty objects (at
 * any depth), with numeric strings under numeric keys turned into numbers and strings trimmed.
 * 0 and false are kept.
 */
function cleanValue(value, numeric = false) {
	if (Array.isArray(value)) {
		return value.map((item) => cleanValue(item, numeric)).filter((item) => !isEmptyValue(item));
	}
	if (value && typeof value === "object") {
		const result = {};
		for (const [key, item] of Object.entries(value)) {
			const cleaned = cleanValue(item, NUMERIC_KEYS.has(key));
			if (!isEmptyValue(cleaned)) result[key] = cleaned;
		}
		return result;
	}
	if (numeric && typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
		return Number(value);
	}
	return typeof value === "string" ? value.trim() : value;
}

/**
 * Copy of an effect definition as the effects form saves it: without empty strings,
 * null, undefined, empty arrays and empty objects (at any depth), with numeric strings
 * under numeric keys turned into numbers, and without the deprecated duration fields.
 * 0 and false are kept.
 *
 * @param {object} effect Effect definition
 * @returns {object} New object, the input is not modified
 */
export function cleanEffectDefinition(effect = {}) {
	const cleaned = cleanValue(effect);
	DEPRECATED_DEFINITION_FIELDS.forEach((field) => delete cleaned[field]);
	return cleaned;
}

/**
 * Copy of an effect link as the NPC form saves it ($defs/effect_link): only its own fields,
 * without empty values, and without `magical: false`. Choices stay strings (a value choice is
 * a number written as a string); an unset choice is left out, so it's asked when applied.
 *
 * @param {object} link { effect, duration?, choices?, level?, magical? }
 * @returns {object|undefined} New object, or undefined when it has no effect
 */
export function cleanEffectLink(link = {}) {
	const effect = cleanValue(link.effect);
	if (!effect?.source || !effect?.source_key) return undefined;
	const cleaned = { effect };

	const duration = cleanValue(link.duration);
	// What ends an effect and what it does when it ends belong to its definition
	for (const field of ["ends_when", "on_expire", "ends_by_action", "rest_type"]) delete duration?.[field];
	if (!isEmptyValue(duration)) cleaned.duration = duration;

	const choices = {};
	for (const [kind, value] of Object.entries(link.choices || {})) {
		const text = value === undefined || value === null ? "" : String(value).trim();
		if (text !== "") choices[kind] = text;
	}
	if (Object.keys(choices).length) cleaned.choices = choices;

	const level = parseInt(link.level);
	if (level >= 1) cleaned.level = level;
	if (link.magical === true) cleaned.magical = true;

	// Spell links (effects 6c): tiers with a level and a value and/or an effect level
	const scaling = (Array.isArray(link.scaling) ? link.scaling : Object.values(link.scaling || {}))
		.map((tier) => {
			const cleanedTier = {};
			const tierLevel = parseInt(tier?.level);
			if (tierLevel >= 1) cleanedTier.level = tierLevel;
			const value = tier?.value === "" || tier?.value === null ? NaN : Number(tier?.value);
			if (Number.isFinite(value)) cleanedTier.value = value;
			const effectLevel = parseInt(tier?.effect_level);
			if (effectLevel >= 0) cleanedTier.effect_level = effectLevel;
			return cleanedTier;
		})
		.filter((tier) => tier.level && (tier.value !== undefined || tier.effect_level !== undefined));
	if (scaling.length) cleaned.scaling = scaling;

	// Spell links: the duration by slot level, only with a duration
	const durationScaling = (
		Array.isArray(link.duration_scaling) ? link.duration_scaling : Object.values(link.duration_scaling || {})
	)
		.map(cleanDurationTier)
		.filter(Boolean);
	if (durationScaling.length && cleaned.duration) cleaned.duration_scaling = durationScaling;
	return cleaned;
}

const DURATION_TIER_TYPES = ["time", "concentration", "cancelled"];
const DURATION_UNITS = ["round", "minute", "hour", "day"];

/**
 * Copy of a duration tier of a spell link ($defs/effect_link duration_scaling) with only its
 * own fields: a slot level 1–9 and a Time, Concentration or Until removed duration. Time needs
 * a value; Concentration's is optional; Until removed has none.
 *
 * @param {object} tier { level, duration: { type, value?, unit? } }
 * @returns {object|undefined} New tier, or undefined when it's incomplete
 */
export function cleanDurationTier(tier) {
	const level = Number(tier?.level);
	const type = tier?.duration?.type;
	if (!Number.isInteger(level) || level < 1 || level > 9 || !DURATION_TIER_TYPES.includes(type)) {
		return undefined;
	}
	const duration = { type };
	if (type !== "cancelled") {
		const raw = tier.duration.value;
		const value = raw === "" || raw === null || raw === undefined ? undefined : Number(raw);
		if (value !== undefined && !(Number.isInteger(value) && value > 0)) return undefined;
		if (value === undefined && type === "time") return undefined;
		if (value !== undefined) {
			duration.value = value;
			duration.unit = DURATION_UNITS.includes(tier.duration.unit) ? tier.duration.unit : "round";
		}
	}
	return { level, duration };
}

/**
 * Whether a spell link's duration tiers keep the link dialog from saving: a tier that
 * cleanDurationTier drops, or one whose slot level isn't above the spell's
 *
 * @param {object} link Effect link
 * @param {number} spellLevel The spell's level
 * @returns {boolean}
 */
export function durationScalingIncomplete(link = {}, spellLevel = 0) {
	if (!link.duration || !Array.isArray(link.duration_scaling)) return false;
	return link.duration_scaling.some((tier) => {
		const cleaned = cleanDurationTier(tier);
		return !cleaned || cleaned.level <= (parseInt(spellLevel) || 0);
	});
}

/**
 * The effect duration of a spell's duration (effects 6c), for the Spell duration button of a
 * spell link: Concentration up to the spell's duration, Time, or Until removed for a spell that
 * lasts until dispelled. Instantaneous, Special and Time without a duration have none.
 *
 * @param {object} spell { duration_type, duration, duration_scale }
 * @returns {object|undefined} $defs/duration { type, value?, unit? }
 */
export function spellDuration(spell = {}) {
	const type = (spell.duration_type || "").toLowerCase();
	const value = parseInt(spell.duration);
	const timed = value > 0 ? { value, unit: (spell.duration_scale || "round").toLowerCase() } : {};

	switch (type) {
		case "concentration":
			return { type: "concentration", ...timed };
		case "time":
			return timed.value ? { type: "time", ...timed } : undefined;
		case "until_dispelled":
		case "until_dispelled_or_triggered":
			return { type: "cancelled" };
		default:
			return undefined;
	}
}

/**
 * A spell link as it applies for one cast (effects 6c): its value choice and level after its
 * scaling tiers, read through the spell's scaling type, and without the tiers.
 * - spell_scale: one tier; per `level` slot levels above the spell's level, `value` is added to
 *   the value choice and `effect_level` to the level
 * - spell_level: from a slot of at least `level`, the value is `value` and the level
 *   `effect_level` (the highest tier reached)
 * - character_level: the same by the caster's level
 * - none / anything else: unchanged
 * The duration follows `duration_scaling` by slot level, whatever the scaling type: the highest
 * tier with a level of at most the slot replaces the duration's type, value and unit.
 *
 * @param {object} link Effect link with scaling
 * @param {object} cast
 * @param {string} cast.scaling The spell's scaling type
 * @param {number} cast.spellLevel The spell's level
 * @param {number} cast.castLevel The slot it's cast with
 * @param {number} cast.casterLevel The caster's level
 * @returns {object} New link without scaling and duration_scaling; choices.value stays a string
 */
export function scaledLink(link = {}, { scaling, spellLevel, castLevel, casterLevel } = {}) {
	const { scaling: tiers = [], duration_scaling: durationTiers = [], ...scaled } = link;
	if (link.choices) scaled.choices = { ...link.choices };

	if (link.duration && Array.isArray(durationTiers)) {
		const slot = castLevel ?? spellLevel;
		const tier = [...durationTiers]
			.sort((a, b) => a.level - b.level)
			.filter((tier) => slot >= tier.level)
			.pop();
		if (tier) {
			const { value, unit, ...rest } = link.duration;
			scaled.duration = { ...rest, ...tier.duration };
		}
	}
	if (!Array.isArray(tiers) || !tiers.length) return scaled;

	let value = scaled.choices?.value !== undefined ? Number(scaled.choices.value) : undefined;
	let level = scaled.level;

	if (scaling === "spell_scale") {
		const tier = tiers[0];
		const step = parseInt(tier.level);
		const steps = step > 0 ? Math.floor(((castLevel ?? spellLevel) - spellLevel) / step) : 0;
		if (steps > 0) {
			if (tier.value !== undefined) value = (value || 0) + steps * tier.value;
			if (tier.effect_level !== undefined) level = (level || 0) + steps * tier.effect_level;
		}
	} else if (scaling === "spell_level" || scaling === "character_level") {
		const reached = scaling === "spell_level" ? castLevel ?? spellLevel : casterLevel;
		const ordered = [...tiers].sort((a, b) => a.level - b.level);
		for (const tier of ordered) {
			if (!(reached >= tier.level)) continue;
			if (tier.value !== undefined) value = tier.value;
			if (tier.effect_level !== undefined) level = tier.effect_level;
		}
	}

	if (value !== undefined && Number.isFinite(value)) scaled.choices = { ...(scaled.choices || {}), value: String(value) };
	if (level !== undefined) scaled.level = level;
	return scaled;
}

/**
 * Copy of the trait links of a special ability as the NPC form saves them (effects 6b): every
 * link cleaned (cleanEffectLink) and without a duration, links without an effect left out.
 *
 * @param {object[]} links The ability's effects
 * @returns {object[]|undefined} New list, or undefined when no link is left
 */
export function cleanTraitEffects(links) {
	const list = (Array.isArray(links) ? links : Object.values(links || {}))
		.map((link) => {
			const cleaned = cleanEffectLink(link);
			if (cleaned) {
				delete cleaned.duration;
				delete cleaned.scaling;
				delete cleaned.duration_scaling;
			}
			return cleaned;
		})
		.filter(Boolean);
	return list.length ? list : undefined;
}

/**
 * Copy of the effects of an action-list entry ($defs/action_effects) as the NPC form saves
 * them: every link cleaned, links without an effect, empty outcome lists and unknown keys left
 * out.
 *
 * @param {object} effects { on_hit?: [], on_miss?: [], on_fail?: [], on_success?: [], always?: [] }
 * @returns {object|undefined} New object, or undefined when no outcome has a link
 */
export function cleanActionEffects(effects) {
	if (!effects || typeof effects !== "object") return undefined;
	const cleaned = {};
	for (const outcome of Object.keys(action_outcomes)) {
		const links = (Array.isArray(effects[outcome]) ? effects[outcome] : Object.values(effects[outcome] || {}))
			.map((link) => cleanEffectLink(link))
			.filter(Boolean);
		if (links.length) cleaned[outcome] = links;
	}
	return Object.keys(cleaned).length ? cleaned : undefined;
}

/**
 * Variables a formula can use ($defs/formula). Each can be prefixed with `caster.`, and
 * `class.<column>` reads a class table column.
 */
export const FORMULA_VARIABLES = Object.freeze([
	"pb",
	"str_mod",
	"dex_mod",
	"con_mod",
	"int_mod",
	"wis_mod",
	"cha_mod",
	"spellcasting_mod",
	"str",
	"dex",
	"con",
	"int",
	"wis",
	"cha",
	"speed",
	"max_hp",
	"level",
	"spell_save_dc",
	"spell_attack",
	"damage_taken",
	"last_damage",
]);

/**
 * Why a formula can't be used, for the effects form
 *
 * @param {string} formula Formula text
 * @returns {string|undefined} The problem, or undefined when the formula is valid
 */
export function formulaProblem(formula) {
	const text = String(formula ?? "").trim();
	if (!text) return "The formula is empty";

	const names = text.match(/[a-z_][a-z0-9_.]*/gi) || [];
	const unknown = names.filter((name) => {
		const bare = name.startsWith("caster.") ? name.slice("caster.".length) : name;
		return !FORMULA_VARIABLES.includes(bare) && !/^class\.[a-z_][a-z0-9_]*$/i.test(bare);
	});
	if (unknown.length) return `Unknown variable: ${unknown.join(", ")}`;

	const vars = Object.fromEntries(names.map((name) => [name, 1]));
	const { missing } = evaluateFormula(text, vars);
	return missing.length ? "The formula can't be read" : undefined;
}

// Sub-effect lists, whose items are named "Sub-effect <n>" in error messages
const SUB_EFFECT_LISTS = ["sub_effects", "success_effects", "fail_by_5_effects", "on_fail", "on_expire"];
const COMBINATOR_KEYWORDS = ["oneOf", "anyOf", "allOf", "if", "not"];

/**
 * Readable messages for Ajv errors of an effect definition: one line per failing field,
 * e.g. "Sub-effect 2 › Scaling › By: must be one of level, stacks, …".
 * Only the deepest errors are kept; branches of oneOf / anyOf are merged per field.
 *
 * @param {object[]} errors Ajv errors (allErrors)
 * @returns {string[]}
 */
export function schemaErrorMessages(errors = []) {
	const fieldName = (key) => {
		const text = String(key).replace(/_/g, " ");
		return text.charAt(0).toUpperCase() + text.slice(1);
	};
	const pathLabel = (path) => {
		const segments = path.split("/").slice(1);
		const labels = [];
		segments.forEach((segment, i) => {
			if (/^\d+$/.test(segment)) {
				const list = segments[i - 1];
				const n = Number(segment) + 1;
				if (SUB_EFFECT_LISTS.includes(list)) labels[labels.length - 1] = `Sub-effect ${n}`;
				else labels[labels.length - 1] = `${labels[labels.length - 1]} ${n}`;
			} else {
				labels.push(fieldName(segment));
			}
		});
		return labels.length ? labels.join(" › ") : "Effect";
	};

	const byPath = new Map();
	for (const error of errors) {
		const path = error.instancePath || "";
		if (!byPath.has(path)) byPath.set(path, []);
		byPath.get(path).push(error);
	}
	const paths = [...byPath.keys()];
	const deepest = paths.filter((path) => !paths.some((other) => other.startsWith(`${path}/`)));

	return deepest.map((path) => {
		const plain = byPath.get(path).filter((error) => !COMBINATOR_KEYWORDS.includes(error.keyword));
		let message;
		if (!plain.length) {
			message = "doesn't have a valid value";
		} else if (plain.every((error) => error.keyword === "required")) {
			const fields = [...new Set(plain.map((error) => fieldName(error.params.missingProperty)))];
			message = `needs ${fields.join(" or ")}`;
		} else if (plain.every((error) => error.keyword === "type")) {
			const types = [...new Set(plain.map((error) => error.params.type))];
			message = `must be a ${types.join(" or ")}`;
		} else {
			const parts = plain.map((error) => {
				if (error.keyword === "enum") return `must be one of ${error.params.allowedValues.join(", ")}`;
				if (error.keyword === "additionalProperties") {
					return `has an unknown field "${error.params.additionalProperty}"`;
				}
				return error.message;
			});
			message = [...new Set(parts)].join("; ");
		}
		return `${pathLabel(path)}: ${message}`;
	});
}

/**
 * Resolves a definition for runtime use: its own sub-effects followed by the sub-effects
 * of every definition it includes, recursively. Each definition is included once;
 * pulled-in sub-effects get `from` set to the definition they came from.
 *
 * @param {string} source "srd", "custom" or "api"
 * @param {string} sourceKey url or id of the definition
 * @param {function} lookup async ({ source, source_key }) => raw definition or undefined
 * @returns {Promise<object>} { name, description, sub_effects, unresolved }
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
			ends_when: definition.ends_when,
			condition: definition.condition,
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

// Filter fields an attack knows before its damage is rolled, and who may cause the hit
const HIT_TAKEN_FILTER_FIELDS = ["by", "attack_types"];
const HIT_TAKEN_BY = [undefined, "any", "caster", "counterpart"];

/**
 * Whether a sub-effect is damage its holder takes when hit that is rolled with the attack
 * (Hex, Hunter's Mark): `damage` on `on_hit_taken` to the holder itself, without a save or
 * frequency, and a filter of only who hit it (the caster or anyone) and attack types. Anything
 * else stays a prompt after the roll is applied.
 *
 * @param {object} sub_effect
 * @returns {boolean}
 */
export function hitTakenDamage(sub_effect = {}) {
	if (sub_effect.type !== "damage" || normalizeTrigger(sub_effect.trigger) !== "on_hit_taken") return false;
	if (sub_effect.target && sub_effect.target !== "self") return false;
	if (sub_effect.save || sub_effect.frequency) return false;
	const filter = sub_effect.trigger_filter || {};
	const other = Object.keys(filter).some((key) => !HIT_TAKEN_FILTER_FIELDS.includes(key) && !isEmptyValue(filter[key]));
	return !other && HIT_TAKEN_BY.includes(filter.by);
}

/**
 * Whether hit-taken damage applies to a hit by this attacker: by the instance's caster only, or
 * by anyone
 */
function hitTakenBy(sub_effect, instance, attackerKey) {
	return sub_effect.trigger_filter?.by !== "caster" || (!!attackerKey && instance.caster_key === attackerKey);
}

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
		for (const [key, instance] of effectEntries(entity, holderKey)) {
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
			if (isCountingDown(instance)) {
				return `Concentration, ${plural(instance.rounds_remaining, "round")} left`;
			}
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
	if (isCountingDown(instance)) return instance.rounds_remaining;
	return undefined;
}

/**
 * Chip items for the active effects of an entity (the tracker's chips and the live view's)
 *
 * @param {object[]} entries [{ key, instance, definition }]: effect key, instance, resolved definition
 * @param {string} entityKey Key of the entity that has the effects
 * @param {string} holderName Its name as shown, if any
 * @param {function} casterOf instance => { name, label } of the caster as shown, or undefined:
 *   name for the duration text, label for the "from" line
 * @returns {object[]} { type, key, effectKey, entityKey, icon, initial, title, value, duration, caster }
 */
export function effectChipItems(entries = [], { entityKey, holderName, casterOf = () => undefined } = {}) {
	return entries.map(({ key, instance, definition }) => {
		const name = definition?.name || instance.name || "";
		const title = name.charAt(0).toUpperCase() + name.slice(1);
		const isCondition = isSrdCondition(instance.source, instance.source_key);
		const caster = casterOf(instance);
		return {
			type: "effect",
			key: `effect:${key}`,
			effectKey: key,
			entityKey,
			icon: isCondition ? instance.source_key : undefined,
			initial: title.charAt(0),
			title,
			value: effectBadge(instance),
			duration: describeDuration(instance, { casterName: caster?.name, holderName }),
			caster: caster?.label,
		};
	});
}

/**
 * Whether an instance counts down rounds: a timed duration, or a Concentration duration's
 * "up to" time when it isn't linked to a Concentration that ends it
 *
 * @param {object} instance Active effect instance
 * @returns {boolean}
 */
export function isCountingDown(instance) {
	if (instance?.rounds_remaining === undefined) return false;
	const type = instance.duration?.type;
	return type === "time" || (type === "concentration" && !instance.concentration_id);
}

/**
 * The choice kinds of a sub-effect: `choice` is one kind or a list of kinds
 *
 * @param {object} sub_effect
 * @returns {string[]} e.g. ["skill", "value"], [] without a choice
 */
export function choiceKinds(sub_effect) {
	const choice = sub_effect?.choice;
	if (Array.isArray(choice)) return choice.filter(Boolean);
	return choice ? [choice] : [];
}

/**
 * Whether a sub-effect waits for a choice the instance doesn't have yet
 *
 * @param {object} sub_effect
 * @param {object} instance Active effect instance
 * @returns {boolean}
 */
export function missingChoice(sub_effect, instance) {
	return choiceKinds(sub_effect).some((kind) => instance?.choices?.[kind] === undefined);
}

// The sub-effect field each choice kind fills (option fills none)
const CHOICE_FIELDS = {
	ability: "abilities",
	damage_type: "damage_types",
	skill: "skills",
	condition: "conditions",
	creature_type: "creature_types",
	value: "value",
};

/**
 * Copy of a definition with some of its choices fixed: every sub-effect (nested lists
 * included) that asks for a fixed kind gets the field filled and no longer asks for it, and a
 * roll's damage type choice becomes its damage type. For links that fix a choice (a clay
 * golem's Absorption is acid, effects plan steps 6–7).
 *
 * @param {object} definition Effect definition
 * @param {object} choices Fixed choices by kind, e.g. { damage_type: "acid" }
 * @returns {object} New object, the input is not modified
 */
export function fixChoices(definition, choices = {}) {
	const fixed = Object.keys(choices).filter((kind) => choices[kind] !== undefined);
	const fix = (value) => {
		if (Array.isArray(value)) return value.map(fix);
		if (!value || typeof value !== "object") return value;
		const copy = {};
		for (const [key, item] of Object.entries(value)) copy[key] = fix(item);

		const kinds = choiceKinds(copy);
		if (kinds.length) {
			// Its text describes the open choice ("the chosen number"): the generated text
			// (describeSubEffect) describes the fixed values instead
			if (kinds.some((kind) => fixed.includes(kind))) delete copy.description;
			for (const kind of kinds.filter((kind) => fixed.includes(kind))) {
				const field = CHOICE_FIELDS[kind];
				if (field) copy[field] = field === "value" ? choices[kind] : [choices[kind]];
			}
			const open = kinds.filter((kind) => !fixed.includes(kind));
			if (open.length > 1) copy.choice = open;
			else if (open.length) copy.choice = open[0];
			else delete copy.choice;
		}
		// A roll whose damage type is chosen from a list
		if (Array.isArray(copy.damage_type_choice) && fixed.includes("damage_type")) {
			copy.damage_type = choices.damage_type;
			delete copy.damage_type_choice;
		}
		return copy;
	};
	return fix(definition);
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
			for (const kind of choiceKinds(sub_effect)) {
				// A damage type chosen from the sub-effect's own types (Protection from Energy)
				if (kind === "damage_type" && sub_effect.damage_types?.length) {
					addChoice(kind, sub_effect.damage_types);
				} else addChoice(kind);
			}
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
 * @param {string} casterKey Key of the chosen caster
 * @param {string} casterName Name of the caster, shown when it isn't in a later encounter
 * @param {string} turnKey Key of the entity that has the turn, for the same-turn rule
 * @param {object} concentrationFor { source, source_key, name } of the effect a Concentration instance is for
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
	turnKey,
	concentrationFor,
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
	if (turnKey) instance.applied_turn_key = turnKey;
	if (application.concentration_id) instance.concentration_id = application.concentration_id;
	if (concentrationFor?.source && concentrationFor.source_key) {
		instance.concentration_for = {
			source: concentrationFor.source,
			source_key: concentrationFor.source_key,
		};
		if (concentrationFor.name) instance.concentration_for.name = concentrationFor.name;
	}

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

	// Timed, or Concentration's "up to" time when nothing ends it with a Concentration
	const unlinkedConcentration = duration.type === "concentration" && !instance.concentration_id;
	if ((duration.type === "time" || unlinkedConcentration) && duration.value) {
		instance.rounds_remaining = durationToRounds(duration);
	}

	const choices = application.choices || {};
	if (Object.keys(choices).length) instance.choices = { ...choices };

	if (application.level) instance.level = application.level;

	return instance;
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
		if (!definition || !isSrdCondition("srd", url)) return [];
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

	return effectEntries(entity, entityKey).some(([, instance]) => {
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

	const subjectKey = conditionSubjectKey(set, ctx);
	const subject = (ctx.entities || {})[subjectKey];
	if (!subject) return false;

	const curHp = Number(subject.curHp);
	const maxHp = Number(subject.maxHp);
	let result;
	switch (set.type) {
		case "has_condition":
			result = hasCondition(subjectKey, set.value, ctx);
			break;
		case "has_effect":
			result = effectEntries(subject, subjectKey).some(([, i]) => i.source_key === set.value);
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
 * Entity a condition is about: the holder (self), the instance's caster, or the other party
 * of an attack (counterpart, only when the context knows it)
 */
function conditionSubjectKey(set, ctx = {}) {
	const subject = set.subject || "self";
	if (subject === "self") return ctx.holderKey;
	if (subject === "caster") return ctx.instance?.caster_key;
	if (subject === "counterpart") return ctx.counterpartKey;
	return undefined;
}

const EVALUABLE_CHECKS = ["has_condition", "has_effect", "bloodied", "hp_zero", "temp_hp_zero", "hp_threshold"];

/**
 * Distance to the other party as assumed from the attack type: a melee weapon attack is
 * within 5 feet, a ranged weapon attack beyond. Only comparisons with 5 feet can be decided.
 *
 * @returns {true|false|undefined} undefined when it can't be decided
 */
function assumedDistance({ comparator = "lte", value }, attackType) {
	if (value !== 5) return undefined;
	const table = {
		melee_weapon: { lte: true, lt: false, gt: false, gte: true },
		ranged_weapon: { lte: false, lt: false, gt: true, gte: true },
	}[attackType];
	return table?.[comparator];
}

/**
 * Three-valued state of a condition_set: true or false when the tracker can check it,
 * "unknown" when it can't (distance, sight, the other party of a roll, a missing caster).
 * negate flips true/false and leaves unknown. In arrays and all_of false wins, then unknown;
 * in any_of true wins, then unknown.
 *
 * In an attack the context knows the other party (counterpartKey) and the attack type:
 * conditions on the counterpart are checked, is_caster compares it with the instance's
 * caster, and distance is assumed from the attack type (pushed to ctx.assumptions).
 *
 * @param {object|array} set $defs/condition_set
 * @param {object} ctx { holderKey, instance, entities, definitionOf, counterpartKey, attackType, assumptions }
 * @returns {true|false|"unknown"}
 */
export function conditionState(set, ctx) {
	if (!set) return false;
	const combine = (items, every) => {
		const states = items.map((item) => conditionState(item, ctx));
		if (every) {
			if (states.includes(false)) return false;
			return states.includes("unknown") ? "unknown" : true;
		}
		if (states.includes(true)) return true;
		return states.includes("unknown") ? "unknown" : false;
	};
	if (Array.isArray(set)) return set.length ? combine(set, true) : false;
	if (Array.isArray(set.any_of)) return combine(set.any_of, false);
	if (Array.isArray(set.all_of)) return combine(set.all_of, true);

	const subject = set.subject || "self";
	const { instance = {}, entities = {} } = ctx;
	const subjectKey = conditionSubjectKey(set, ctx);
	if (!subjectKey || !entities[subjectKey]) return "unknown";

	// The other party of an attack
	if (subject === "counterpart") {
		if (set.type === "is_caster") {
			const result = !!instance.caster_key && subjectKey === instance.caster_key;
			return set.negate ? !result : result;
		}
		if (set.type === "distance") {
			const result = assumedDistance(set, ctx.attackType);
			if (result === undefined) return "unknown";
			const note =
				ctx.attackType === "melee_weapon" ? "melee: assumed within 5 ft" : "ranged: assumed beyond 5 ft";
			if (Array.isArray(ctx.assumptions) && !ctx.assumptions.includes(note)) ctx.assumptions.push(note);
			return set.negate ? !result : result;
		}
	}
	if (!["self", "caster", "counterpart"].includes(subject) || !EVALUABLE_CHECKS.includes(set.type)) {
		return "unknown";
	}
	if (set.type === "hp_threshold" && (!COMPARE[set.comparator || "lte"] || typeof set.value !== "number")) {
		return "unknown";
	}

	// Evaluable: evaluateConditionSet gives the plain result, negate included
	return evaluateConditionSet(set, ctx);
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
					isCountingDown(instance) &&
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
					// Applied during this same turn: the end of this turn isn't "next turn".
					// Instances saved before applied_turn_key assumed the caster had the turn.
					const turnKey = instance.applied_turn_key ?? instance.caster_key;
					const sameTurn = turnKey === entityKey && event.round === instance.applied_round;
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
	// No DC on a spell link: the caster's spell save DC is used when it's applied (effects 6c)
	if (dc === undefined || dc === null || dc === "") delete save.dc;
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
 * Form state of the duration fields of the Effects drawer and of effect links
 * (ApplicationDuration.vue), at its defaults
 *
 * @param {object} [defaultSave] { ability, dc } a new repeat save starts with
 * @returns {object} { type, value, unit, anchor, edge, hasSave, save, saveExtras, hasEscape, escape, cancelTriggers }
 */
export function durationFormDefaults({ defaultSave } = {}) {
	return {
		type: "cancelled",
		value: undefined,
		unit: "round",
		anchor: "caster",
		edge: "start",
		hasSave: false,
		save: { ability: defaultSave?.ability, dc: defaultSave?.dc, triggers: ["end_turn_target"] },
		saveExtras: {
			successes: 1,
			escalates: false,
			failures: 2,
			becomes: undefined,
			autoSuccess: false,
			autoValue: 1,
			autoUnit: "minute",
		},
		hasEscape: false,
		escape: { dc: undefined, checks: ["athletics", "acrobatics"], by: "self" },
		cancelTriggers: [],
	};
}

/**
 * $defs/duration from the duration form (durationFormDefaults): only the fields its type uses,
 * the repeat save and escape when they're on, and the events that end it early
 *
 * @param {object} form Duration form state
 * @param {object} [options]
 * @param {{ name: string, url: string }[]} [options.conditions] SRD conditions, for the name of the
 * condition a repeat save escalates to
 * @returns {object} Duration
 */
export function durationFromForm(form, { conditions = [] } = {}) {
	const { type, value, unit, anchor, edge } = form;
	const duration = { type };
	if (["time", "concentration"].includes(type) && value) {
		duration.value = value;
		duration.unit = unit;
	}
	if (type === "next_turn") {
		duration.anchor = anchor;
		duration.edge = edge;
	}
	if (form.hasSave) {
		const extras = form.saveExtras;
		const becomes = conditions.find(({ url }) => url === extras.becomes);
		duration.save = repeatSaveFromForm({
			...form.save,
			successes: extras.successes,
			escalate: extras.escalates
				? { failures: extras.failures, effect: { source: "srd", source_key: extras.becomes, name: becomes?.name } }
				: undefined,
			autoAfter: extras.autoSuccess ? { value: extras.autoValue, unit: extras.autoUnit } : undefined,
		});
	}
	if (form.hasEscape) duration.escape = escapeFromForm(form.escape);
	if (form.cancelTriggers?.length) duration.cancel_triggers = form.cancelTriggers.map((trigger) => ({ trigger }));
	return duration;
}

/**
 * The duration form state of a stored duration, the inverse of durationFromForm. Fields the
 * form doesn't have (ends_when, on_expire, filters on cancel triggers…) are left out.
 *
 * @param {object} duration $defs/duration
 * @param {object} [options]
 * @param {object} [options.defaultSave] { ability, dc } for a repeat save that isn't there yet
 * @returns {object} Duration form state
 */
export function durationToForm(duration, { defaultSave } = {}) {
	const form = durationFormDefaults({ defaultSave });
	if (!duration) return form;

	form.type = duration.type || "cancelled";
	if (typeof duration.value === "number") form.value = duration.value;
	for (const field of ["unit", "anchor", "edge"]) {
		if (duration[field]) form[field] = duration[field];
	}

	const save = duration.save;
	if (save) {
		form.hasSave = true;
		form.save = {
			ability: save.ability,
			dc: typeof save.dc === "number" ? save.dc : undefined,
			triggers: save.triggers?.length ? [...save.triggers] : ["end_turn_target"],
		};
		if (save.successes_to_end > 1) form.saveExtras.successes = save.successes_to_end;
		if (save.failures_to_escalate > 0 && save.escalate?.effect?.source_key) {
			form.saveExtras.escalates = true;
			form.saveExtras.failures = save.failures_to_escalate;
			form.saveExtras.becomes = save.escalate.effect.source_key;
		}
		if (save.auto_success_after?.value > 0) {
			form.saveExtras.autoSuccess = true;
			form.saveExtras.autoValue = save.auto_success_after.value;
			form.saveExtras.autoUnit = save.auto_success_after.unit || "round";
		}
	}

	const escape = duration.escape;
	if (escape) {
		form.hasEscape = true;
		const checks = (escape.checks || [])
			.map(({ skill }) => skill)
			.filter((skill) => ESCAPE_CHECKS[skill]);
		form.escape = {
			dc: typeof escape.dc === "number" ? escape.dc : undefined,
			checks: checks.length ? checks : ["athletics", "acrobatics"],
			by: escape.by || "self",
		};
	}

	form.cancelTriggers = (duration.cancel_triggers || []).map(({ trigger }) => trigger).filter(Boolean);
	return form;
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
	const onFailSubEffects = save.on_fail || [];
	const onFail = onFailSubEffects.map(describeSubEffect);
	if (save.failures_to_escalate && value >= save.failures_to_escalate && save.escalate) {
		if (save.escalate.lock) {
			const { save: _save, ...duration } = instance.duration; // eslint-disable-line no-unused-vars
			return { result: "lock", value, duration, onFail, onFailSubEffects };
		}
		if (save.escalate.effect) {
			return { result: "escalate", value, escalate: save.escalate, onFail, onFailSubEffects };
		}
	}
	return { result: "count", property: "save_failures", value, onFail, onFailSubEffects };
}

/**
 * What happens when an instance ends: its duration's on_expire and its definition's
 * on_expire-triggered sub-effects
 *
 * @returns {object[]} The sub-effects
 */
export function onExpireSubEffects({ instance = {}, definition }) {
	const own = instance.duration?.on_expire || [];
	const fromDefinition = (definition?.sub_effects || []).filter(
		(sub_effect) => normalizeTrigger(sub_effect.trigger) === "on_expire"
	);
	return [...own, ...fromDefinition];
}

/**
 * onExpireSubEffects in words
 *
 * @returns {string[]}
 */
export function onExpireLines({ instance = {}, definition }) {
	return onExpireSubEffects({ instance, definition }).map(describeSubEffect);
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
		turnKey: instance.applied_turn_key,
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
 * Whether an entity has used its reaction (a Reaction Used instance)
 *
 * @param {object} entity
 * @returns {boolean}
 */
export function hasReactionUsed(entity) {
	return Object.values(entity?.effects || {}).some(
		(instance) => instance?.source === "srd" && instance.source_key === "reaction-used"
	);
}

/**
 * Whether acting uses the actor's reaction: it acts while another entity has the turn,
 * it isn't a legendary action, and it hasn't used its reaction yet
 *
 * @param {string} actorKey Entity that acts
 * @param {string} turnKey Entity whose turn it is, undefined before combat
 * @param {string} category Category of a rolled action (legendary_actions is excluded), undefined for manual input
 * @param {object} entities Entities of the encounter
 * @returns {boolean}
 */
export function reactionUsedApplies({ actorKey, turnKey, category, entities = {} } = {}) {
	if (!actorKey || !turnKey || actorKey === turnKey) return false;
	if (category === "legendary_actions") return false;
	const actor = entities[actorKey];
	return !!actor && !hasReactionUsed(actor);
}

/**
 * What applying an effect does to its caster's Concentration
 *
 * @param {string} casterKey Chosen caster, undefined for none
 * @param {object} concentration The caster's Concentration { key, for }, undefined without one
 * @param {object} effect { source, source_key, name } of the applied effect
 * @param {boolean} enabled The "<caster> concentrates on it" option
 * @param {string} unknownChoice "link" or "replace", for a Concentration of unknown effect
 * @returns {object} { action: "none" } | { action: "start" } | { action: "share", key } |
 *   { action: "link", key } | { action: "replace", key, name, unknown }
 */
export function concentrationPlan({
	casterKey,
	concentration,
	effect = {},
	enabled = true,
	unknownChoice = "link",
} = {}) {
	if (!enabled || !casterKey) return { action: "none" };
	if (!concentration?.key) return { action: "start" };

	const current = concentration.for;
	if (!current?.source || !current.source_key) {
		return unknownChoice === "replace"
			? { action: "replace", key: concentration.key, unknown: true }
			: { action: "link", key: concentration.key };
	}
	if (current.source === effect.source && current.source_key === effect.source_key) {
		return { action: "share", key: concentration.key };
	}
	return { action: "replace", key: concentration.key, name: current.name };
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

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Splits a formula into numbers, variable names, operators and parentheses
 *
 * @returns {object[]|undefined} Tokens, or undefined when the formula has anything else
 */
function tokenizeFormula(formula) {
	const tokens = [];
	const pattern = /\s*(?:(\d+(?:\.\d+)?)|([a-z_][a-z0-9_.]*)|([-+*/()]))/iy;
	let index = 0;
	while (index < formula.length) {
		pattern.lastIndex = index;
		const match = pattern.exec(formula);
		if (!match) return formula.slice(index).trim() ? undefined : tokens;
		index = pattern.lastIndex;
		if (match[1] !== undefined) tokens.push({ number: Number(match[1]) });
		else if (match[2] !== undefined) tokens.push({ name: match[2] });
		else if (match[3] !== undefined) tokens.push({ op: match[3] });
	}
	return tokens;
}

/**
 * Evaluates a formula ($defs/formula) over known variables. Only numbers, variable names,
 * + - * / and parentheses are allowed; nothing is ever executed. A formula with a variable
 * that has no known value, or with anything else in it, is 0 and named in `missing`.
 *
 * @param {object|string} formula { formula, min, max, round } or the formula string
 * @param {object} vars Variable values by name, e.g. { wis_mod: 3, "caster.wis_mod": 1 }
 * @returns {{ value: number, missing: string[] }}
 */
export function evaluateFormula(formula, vars = {}) {
	const spec = typeof formula === "string" ? { formula } : formula || {};
	const text = String(spec.formula ?? "");
	const tokens = tokenizeFormula(text);
	if (!tokens?.length) return { value: 0, missing: [text] };

	const missing = [];
	let position = 0;
	const peek = () => tokens[position];
	const take = () => tokens[position++];

	const primary = () => {
		const token = take();
		if (!token) throw new Error("end");
		if (token.number !== undefined) return token.number;
		if (token.name !== undefined) {
			const value = hasOwn(vars, token.name) ? Number(vars[token.name]) : NaN;
			if (Number.isFinite(value)) return value;
			if (!missing.includes(token.name)) missing.push(token.name);
			return 0;
		}
		if (token.op === "(") {
			const value = expression();
			if (take()?.op !== ")") throw new Error("parenthesis");
			return value;
		}
		throw new Error("token");
	};
	const unary = () => {
		if (peek()?.op === "-") {
			take();
			return -unary();
		}
		if (peek()?.op === "+") {
			take();
			return unary();
		}
		return primary();
	};
	const term = () => {
		let value = unary();
		while (peek()?.op === "*" || peek()?.op === "/") {
			const op = take().op;
			const right = unary();
			value = op === "*" ? value * right : right === 0 ? 0 : value / right;
		}
		return value;
	};
	const expression = () => {
		let value = term();
		while (peek()?.op === "+" || peek()?.op === "-") {
			const op = take().op;
			const right = term();
			value = op === "+" ? value + right : value - right;
		}
		return value;
	};

	let value;
	try {
		value = expression();
		if (position < tokens.length) throw new Error("trailing");
	} catch (error) {
		return { value: 0, missing: [text] };
	}
	if (missing.length) return { value: 0, missing };

	value = spec.round === "up" ? Math.ceil(value) : Math.floor(value);
	if (typeof spec.min === "number") value = Math.max(value, spec.min);
	if (typeof spec.max === "number") value = Math.min(value, spec.max);
	return { value, missing };
}

/**
 * Value of an amount: a number, a numeric string, a formula string or a formula object
 *
 * @param {number|string|object} amount
 * @param {object} vars See evaluateFormula
 * @returns {{ value: number|undefined, missing: string[] }} value is undefined for anything else
 */
export function resolveAmount(amount, vars = {}) {
	if (typeof amount === "number") return { value: amount, missing: [] };
	if (typeof amount === "string") {
		if (amount.trim() !== "" && Number.isFinite(Number(amount))) {
			return { value: Number(amount), missing: [] };
		}
		return evaluateFormula(amount, vars);
	}
	if (amount && typeof amount === "object" && hasOwn(amount, "formula")) {
		return evaluateFormula(amount, vars);
	}
	return { value: undefined, missing: [] };
}

const OTHER_PARTY_TARGETS = ["trigger_source", "counterpart"];

/**
 * Formula variables by name: the holder's as `name`, the caster's as `caster.name`, plus
 * the instance's level and the event's amount (damage_taken)
 */
/**
 * A sub-effect with its value taken from the instance's choices, for a sub-effect whose value
 * is chosen when the effect is applied (choice: "value"). Choices are stored as strings
 * ("2"); resolveAmount reads numeric strings. Other sub-effects are returned as they are.
 *
 * @param {object} sub_effect
 * @param {object} instance Active effect instance
 * @returns {object} The same sub-effect, or a copy with the chosen value
 */
export function withChosenValue(sub_effect, instance) {
	if (!choiceKinds(sub_effect).includes("value")) return sub_effect;
	const chosen = instance?.choices?.value;
	const { value, ...rest } = sub_effect; // eslint-disable-line no-unused-vars
	return chosen === undefined || chosen === "" ? rest : { ...rest, value: chosen };
}

function flatFormulaVars({ vars = {}, instance = {}, event = {} }) {
	const flat = Object.create(null);
	for (const [name, value] of Object.entries(vars.self || {})) flat[name] = value;
	for (const [name, value] of Object.entries(vars.caster || {})) flat[`caster.${name}`] = value;
	if (instance.level !== undefined) flat.level = instance.level;
	if (event.amount !== undefined) flat.damage_taken = event.amount;
	return flat;
}

/**
 * The amount of a sub-effect as dice and a fixed value: its roll (with modifier formula) or
 * its value. Formulas get the instance's level as `level` (in flat). Notes say what was left
 * out.
 *
 * @returns {{ dice_count, dice_type, fixed_val, magical, notes: string[] }}
 */
function amountRoll(sub_effect, flat) {
	const notes = [];
	const addMissing = (missing) => {
		if (missing.length) notes.push(`${missing.join(", ")} not included`);
	};

	const roll = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : undefined;
	let dice_count = 0;
	let dice_type;
	let fixed_val = 0;
	if (roll) {
		dice_count = parseInt(roll.dice_count) || 0;
		dice_type = parseInt(roll.dice_type) || undefined;
		fixed_val = parseInt(roll.fixed_val) || 0;
		if (roll.modifier !== undefined) {
			const modifier = resolveAmount(roll.modifier, flat);
			fixed_val += modifier.value || 0;
			addMissing(modifier.missing);
		}
	} else if (sub_effect.value !== undefined) {
		const value = resolveAmount(sub_effect.value, flat);
		fixed_val = value.value || 0;
		addMissing(value.missing);
	} else {
		notes.push("amount not set");
	}

	return { dice_count, dice_type, fixed_val: Math.floor(fixed_val), magical: !!roll?.magical, notes };
}

/**
 * Hit points an instance heals when applied: its `bonus` `max_hp` sub-effects with
 * `also_heal` (Aid) that apply at its level
 *
 * @param {object} instance Active effect instance
 * @param {object} definition Its resolved definition
 * @param {object} vars { self, caster }: formula variables of the holder and the caster
 * @returns {number}
 */
export function alsoHealAmount({ instance = {}, definition, vars = {} }) {
	if (!definition || definition.unresolved) return 0;
	const flat = flatFormulaVars({ vars, instance });
	const level = parseInt(instance.level) || 1;
	let amount = 0;
	for (const original of definition.sub_effects || []) {
		const sub_effect = withChosenValue(original, instance);
		if (sub_effect.type !== "bonus" || !sub_effect.also_heal) continue;
		if (!sub_effect.sub_types?.includes("max_hp")) continue;
		if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
		if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
		const { fixed_val, dice_count } = amountRoll(sub_effect, flat);
		if (!dice_count) amount += fixed_val * (sub_effect.multiplier ?? 1);
	}
	return Math.max(0, Math.floor(amount));
}

/**
 * The temporary hit point grants of a prompt: its `fixed` `temp_hp` sub-effects that apply
 * at the instance's level, each as dice and a fixed value. Temporary hit points don't stack,
 * so the one that rolls highest is granted.
 *
 * @param {object[]} sub_effects Sub-effects of the prompt (others are ignored)
 * @param {object} instance Active effect instance (level, caster_key)
 * @param {object} event { amount } of the triggering event
 * @param {object} vars { self, caster }: formula variables of the holder and the caster
 * @returns {object[]} [{ dice_count, dice_type, fixed_val, notes, expires_with_effect }]
 */
export function tempHpParts({ sub_effects = [], instance = {}, event = {}, vars = {} }) {
	const flat = flatFormulaVars({ vars, instance, event });
	const level = parseInt(instance.level) || 1;
	return sub_effects
		.filter(
			(sub_effect) =>
				sub_effect?.type === "fixed" &&
				sub_effect.sub_types?.includes("temp_hp") &&
				(sub_effect.min_level === undefined || level >= sub_effect.min_level) &&
				(sub_effect.max_level === undefined || level <= sub_effect.max_level)
		)
		.map((sub_effect) => {
			const { dice_count, dice_type, fixed_val, notes } = amountRoll(withChosenValue(sub_effect, instance), flat);
			return {
				dice_count,
				dice_type,
				fixed_val,
				notes,
				expires_with_effect: !!sub_effect.expires_with_effect,
			};
		});
}

/**
 * Temporary hit points a holder loses when an instance that granted them ends: all of its
 * current temporary hit points, when they're no more than the instance granted. More came
 * from somewhere else and are kept.
 *
 * @param {object} instance The ending instance (temp_hp_granted)
 * @param {number} tempHp The holder's current temporary hit points
 * @returns {number} Temporary hit points to remove, 0 for none
 */
export function tempHpToLose({ instance = {}, tempHp } = {}) {
	const granted = parseInt(instance.temp_hp_granted) || 0;
	const current = parseInt(tempHp) || 0;
	return current > 0 && current <= granted ? current : 0;
}

/**
 * The damage and healing sub-effects of a prompt as action rolls, one per recipient and dealer.
 *
 * Recipient: self → holder, caster → the instance's caster, trigger_source / counterpart →
 * the other party of the event. Sub-effects whose recipient isn't in the encounter are left
 * out. Dealer: the holder when the recipient is the other party, else the caster when
 * present, else the holder. Each sub-effect becomes one action with one roll, in the shape
 * the dice mixin's rollAction reads.
 *
 * @param {object[]} sub_effects Sub-effects of the prompt (others than damage/healing are ignored)
 * @param {object} instance Active effect instance (caster_key, level, choices, save_dc)
 * @param {string} holderKey Entity that has the instance
 * @param {object} event { sourceKey, amount } of the triggering event
 * @param {object} entities Entities of the encounter
 * @param {object} vars { self, caster }: formula variables of the holder and the caster
 * @returns {object[]} [{ recipientKey, dealerKey, action_list, notes }]
 */
export function effectRollParts({
	sub_effects = [],
	instance = {},
	holderKey,
	event = {},
	entities = {},
	vars = {},
}) {
	const flat = flatFormulaVars({ vars, instance, event });
	const casterPresent = !!(instance.caster_key && entities[instance.caster_key]);
	const parts = new Map();

	for (const sub_effect of sub_effects) {
		if (!["damage", "healing"].includes(sub_effect?.type)) continue;

		const target = sub_effect.target || "self";
		const otherParty = OTHER_PARTY_TARGETS.includes(target);
		const recipientKey =
			target === "self" ? holderKey : target === "caster" ? instance.caster_key : otherParty ? event.sourceKey : undefined;
		if (!recipientKey || !entities[recipientKey]) continue;
		const dealerKey = otherParty ? holderKey : casterPresent ? instance.caster_key : holderKey;

		const { dice_count, dice_type, fixed_val, magical, notes } = amountRoll(
			withChosenValue(sub_effect, instance),
			flat
		);
		const addMissing = (missing) => {
			if (missing.length) notes.push(`${missing.join(", ")} not included`);
		};
		const roll = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : undefined;

		const healing = sub_effect.type === "healing";
		const rolled = { dice_count, dice_type, fixed_val, magical };
		if (!healing) {
			const chosen =
				(choiceKinds(sub_effect).includes("damage_type") || roll?.damage_type_choice?.length) &&
				instance.choices?.damage_type;
			rolled.damage_type = chosen || roll?.damage_type || sub_effect.damage_types?.[0];
		}

		const action = { type: healing ? "healing" : "damage", rolls: [rolled] };
		if (!healing && sub_effect.save) {
			const save = sub_effect.save;
			let save_dc = instance.save_dc;
			if (save.dc !== undefined) {
				const dc = resolveAmount(save.dc, flat);
				save_dc = dc.missing.length ? undefined : dc.value;
				addMissing(dc.missing);
			}
			action.type = "save";
			action.save_ability = save.ability || save.abilities?.[0];
			action.save_dc = save_dc;
			rolled.save_fail_mod = save.on_success === "half" ? 0.5 : 0;
		}

		const id = `${recipientKey}:${dealerKey}`;
		if (!parts.has(id)) parts.set(id, { recipientKey, dealerKey, action_list: [], notes: [] });
		const part = parts.get(id);
		part.action_list.push(action);
		for (const note of notes) if (!part.notes.includes(note)) part.notes.push(note);
	}
	return [...parts.values()];
}

// Same as calc_mod in generalFunctions (not imported: that module pulls in browser libraries)
const abilityModifier = (score) => (score ? Math.floor((score - 10) / 2) : 0);

/**
 * Level of a player from its experience, as the experience mixin's calculatedLevel
 */
function levelFromExperience(xp = 0) {
	for (const level in experience_table) {
		if (experience_table[level].xp > (xp || 0)) return level - 1;
	}
	return 20;
}

/**
 * Proficiency bonus of an entity: players by level (or experience), others their stored
 * proficiency
 *
 * @param {object} entity
 * @returns {number}
 */
export function proficiencyBonus(entity = {}) {
	if (entity.entityType === "player") {
		const level = entity.level ? entity.level : levelFromExperience(entity.experience);
		return experience_table[level]?.proficiency || 0;
	}
	return entity.proficiency || 0;
}

/**
 * Formula variables of an entity: ability scores and modifiers, pb and max_hp
 *
 * @param {object} entity
 * @returns {object|undefined} undefined without an entity
 */
export function formulaVars(entity) {
	if (!entity) return undefined;
	const vars = {
		pb: proficiencyBonus(entity),
		max_hp: parseInt(entity.maxHp) || 0,
	};
	for (const ability of abilities) {
		const short = ability.substring(0, 3);
		const score = parseInt(entity[ability]) || 10;
		vars[short] = score;
		vars[`${short}_mod`] = abilityModifier(score);
	}
	// Spellcasting ability modifier: NPCs from their (innate) spellcasting ability, players
	// from their spell save DC (8 + proficiency + modifier). Unknown otherwise.
	// Most casters (e.g. the 5e Archmage) use caster_ability; innate_ability is the fallback
	const casting = String(entity.caster_ability || entity.innate_ability || "").toLowerCase();
	if (abilities.includes(casting)) {
		vars.spellcasting_mod = abilityModifier(parseInt(entity[casting]) || 10);
	} else if (parseInt(entity.spell_save_dc)) {
		vars.spellcasting_mod = parseInt(entity.spell_save_dc) - 8 - vars.pb;
	}
	return vars;
}

const NUMERIC_TYPES = ["bonus", "base", "fixed", "floor", "cap"];
const SPEED_FIELDS = ["walk_speed", "fly_speed", "swim_speed", "climb_speed", "burrow_speed"];

/**
 * Fields of an entity a numeric sub-type changes
 */
function statFields(sub_type, sub_effect, instance, entity) {
	const has = (field) => entity[field] !== undefined && entity[field] !== null && entity[field] !== "";
	switch (sub_type) {
		case "ac":
			return entity.transformed ? ["ac", "transformedAc"] : ["ac"];
		case "speed":
			return ["speed", ...SPEED_FIELDS].filter(has);
		case "fly_speed":
		case "swim_speed":
		case "climb_speed":
		case "burrow_speed":
			return [sub_type];
		case "max_hp":
			return ["maxHp"];
		case "initiative":
			return ["initiative_modifier"];
		case "passive_perception":
			return ["passive_perception"];
		case "spell_save_dc":
			return ["caster_save_dc", "innate_save_dc"].filter(has);
		case "spell_attack":
			return ["caster_spell_attack", "innate_spell_attack"].filter(has);
		case "ability_score": {
			const chosen = choiceKinds(sub_effect).includes("ability") ? [instance.choices?.ability] : [];
			return [...(sub_effect.abilities || []), ...chosen].filter((ability) => abilities.includes(ability));
		}
		default:
			return [];
	}
}

/**
 * Passive Perception from an entity's (effective) Wisdom, as the entity card computes it
 */
export function passivePerceptionOf(entity) {
	const proficiency = proficiencyBonus(entity);
	let mod = abilityModifier(parseInt(entity.wisdom) || 10);
	if (entity.skills?.includes("perception")) {
		mod += entity.skills_expertise?.includes("perception") ? proficiency * 2 : proficiency;
	} else if (entity.skills_jack_of_all_trades) {
		mod += Math.floor(proficiency / 2);
	}
	return 10 + mod + (parseInt(entity.skill_modifiers?.perception) || 0);
}

const signed = (value) => (value < 0 ? `−${Math.abs(value)}` : `+${value}`);

/**
 * Combines modifier entries on a stored value: base → bonus → multiply → round down →
 * floor / cap → fixed
 */
function combineStat(stored, entries) {
	let value = stored;
	const bases = entries.filter((entry) => entry.kind === "base").map((entry) => entry.base(stored));
	if (bases.length) value = Math.max(...bases);
	for (const entry of entries) if (entry.kind === "bonus") value += entry.amount;
	for (const entry of entries) if (entry.kind === "multiply") value *= entry.amount;
	value = Math.floor(value);
	const floors = entries.filter((entry) => entry.kind === "floor").map((entry) => entry.amount);
	if (floors.length) value = Math.max(value, ...floors);
	const caps = entries.filter((entry) => entry.kind === "cap").map((entry) => entry.amount);
	if (caps.length) value = Math.min(value, ...caps);
	const fixed = entries.filter((entry) => entry.kind === "fixed").map((entry) => entry.amount);
	if (fixed.length) value = Math.min(...fixed);
	return value;
}

/**
 * Effective values of an entity from the numeric sub-effects of its active effects.
 * Stored values aren't changed; only fields whose value differs are returned.
 *
 * @param {object} entity Entity of the encounter (stored values)
 * @param {string} holderKey Its key
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {{ values: object, modifiers: object }} values by field; modifiers by field:
 *   [{ name, text, applied }]
 */
export function effectiveStats({ entity, holderKey, entities = {}, definitionOf = () => undefined }) {
	const values = {};
	const modifiers = {};
	if (!entity) return { values, modifiers };

	// Collect entries per field: { groupKey, effectKey, name, kind, amount | base, text }
	const byField = {};
	const addModifier = (field, modifier) => (modifiers[field] = modifiers[field] || []).push(modifier);
	const selfVars = formulaVars(entity);

	for (const [effectKey, instance] of effectEntries(entity, holderKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;

		const name = effectLabel(definition, instance);
		const groupKey = `${instance.source}:${instance.source_key}`;
		const level = parseInt(instance.level) || 1;
		const ctx = { holderKey, instance, entities, definitionOf };
		const definitionActive = !definition.condition || evaluateConditionSet(definition.condition, ctx);
		const flat = Object.create(null);
		for (const [key, value] of Object.entries(selfVars)) flat[key] = value;
		const casterVars = formulaVars(entities[instance.caster_key]);
		for (const [key, value] of Object.entries(casterVars || {})) flat[`caster.${key}`] = value;
		flat.level = level;

		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			if (!NUMERIC_TYPES.includes(sub_effect.type)) continue;
			const fields = [
				...new Set((sub_effect.sub_types || []).flatMap((sub_type) => statFields(sub_type, sub_effect, instance, entity))),
			];
			if (!fields.length) continue;
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;

			const notApplied = (text) =>
				fields.forEach((field) => addModifier(field, { name, text, applied: false, effectKey }));
			if (!definitionActive || (sub_effect.condition && !evaluateConditionSet(sub_effect.condition, ctx))) {
				notApplied(sub_effect.condition?.description || definition.condition?.description || "condition not met");
				continue;
			}

			// The amount: value (number, or formula with the instance's level), times a multiplier
			const hasValue = sub_effect.value !== undefined;
			let amount = 0;
			if (hasValue) {
				const resolved = resolveAmount(sub_effect.value, flat);
				if (resolved.missing.length || resolved.value === undefined) {
					notApplied(`${resolved.missing.join(", ") || "value"} not known`);
					continue;
				}
				amount = resolved.value;
			}
			const hasAmount = hasValue;
			const multiplier = typeof sub_effect.multiplier === "number" ? sub_effect.multiplier : undefined;

			let entry;
			if (sub_effect.type === "base") {
				if (hasAmount) {
					const base = amount * (multiplier ?? 1);
					entry = { kind: "base", base: () => base, text: `base ${base}` };
				} else if (multiplier !== undefined) {
					entry = { kind: "base", base: (stored) => stored * multiplier, text: `×${multiplier}` };
				}
			} else if (sub_effect.type === "bonus") {
				if (hasAmount) {
					const value = amount * (multiplier ?? 1);
					entry = { kind: "bonus", amount: value, text: signed(value) };
				} else if (multiplier !== undefined) {
					entry = { kind: "multiply", amount: multiplier, text: `×${multiplier}` };
				}
			} else if (hasAmount) {
				const text = { fixed: `set to ${amount}`, floor: `at least ${amount}`, cap: `at most ${amount}` }[sub_effect.type];
				entry = { kind: sub_effect.type, amount, text };
			}
			if (!entry) continue;

			for (const field of fields) {
				(byField[field] = byField[field] || []).push({ ...entry, groupKey, effectKey, name });
			}
		}
	}

	// Manual bonuses: bonus entries named after their label, never grouped
	for (const [key, list] of Object.entries(manualBonuses(entity))) {
		const fields = abilities.includes(key)
			? [key]
			: statFields(key, {}, {}, entity).filter((field) => !abilities.includes(field));
		for (const [bonusId, bonus] of Object.entries(list)) {
			for (const field of fields) {
				(byField[field] = byField[field] || []).push({
					kind: "bonus",
					amount: bonus.value,
					text: signed(bonus.value),
					groupKey: `bonus:${key}:${bonusId}`,
					bonusId,
					bonusKey: key,
					name: bonus.label,
				});
			}
		}
	}

	// Stored value per field; ability scores first so passive Perception can follow Wisdom
	const storedOf = (field, current) => {
		if (field === "ac") return parseInt(entity.ac ?? entity.armor_class) || 0;
		if (field === "initiative_modifier") {
			return entity.initiative_modifier !== undefined
				? parseInt(entity.initiative_modifier) || 0
				: abilityModifier(parseInt(current.dexterity) || 10);
		}
		if (field === "passive_perception") return passivePerceptionOf(current);
		if (abilities.includes(field)) return parseInt(entity[field]) || 10;
		return parseInt(entity[field]) || 0;
	};
	const order = Object.keys(byField).sort(
		(a, b) => (abilities.includes(b) ? 1 : 0) - (abilities.includes(a) ? 1 : 0)
	);

	for (const field of order) {
		const current = { ...entity, ...values };
		const stored = storedOf(field, current);
		let entries = byField[field];

		// The same definition more than once: only its strongest instance counts
		const groups = {};
		for (const entry of entries) (groups[entry.groupKey] = groups[entry.groupKey] || new Set()).add(entry.effectKey);
		for (const [groupKey, effectKeys] of Object.entries(groups)) {
			if (effectKeys.size < 2) continue;
			let best;
			let bestChange = -1;
			for (const effectKey of effectKeys) {
				const own = entries.filter((entry) => entry.effectKey === effectKey);
				const change = Math.abs(combineStat(stored, own) - stored);
				if (change > bestChange) {
					best = effectKey;
					bestChange = change;
				}
			}
			entries = entries.filter((entry) => entry.groupKey !== groupKey || entry.effectKey === best);
		}

		// A Speed the entity doesn't have is only gained through base or fixed
		const missing = entity[field] === undefined || entity[field] === null || entity[field] === "";
		if (missing && SPEED_FIELDS.includes(field)) {
			entries = entries.filter((entry) => entry.kind === "base" || entry.kind === "fixed");
			if (!entries.length) {
				delete modifiers[field];
				continue;
			}
		}

		for (const entry of entries) {
			addModifier(field, {
				name: entry.name,
				text: entry.text,
				applied: true,
				...(entry.effectKey !== undefined && { effectKey: entry.effectKey }),
				...(entry.bonusId !== undefined && { bonusId: entry.bonusId, bonusKey: entry.bonusKey }),
			});
		}

		// Speed as text (old NPC format): only fixed applies
		if (field === "speed" && typeof entity.speed === "string" && !Number.isFinite(Number(entity.speed))) {
			const fixed = entries.filter((entry) => entry.kind === "fixed");
			for (const modifier of modifiers[field]) {
				if (modifier.applied && !fixed.some((entry) => entry.text === modifier.text)) {
					modifier.applied = false;
					modifier.text = `${modifier.text} (not applied to this Speed)`;
				}
			}
			if (fixed.length) values.speed = `${Math.min(...fixed.map((entry) => entry.amount))} ft.`;
			continue;
		}

		const result = combineStat(stored, entries);
		if (result !== stored) values[field] = result;
	}
	return { values, modifiers };
}

/**
 * Copy of an entity with its effective values, the modifiers that explain them
 * (effect_modifiers) and the replaced stored values (stored)
 *
 * @param {object} entity
 * @param {{ values, modifiers }} stats Result of effectiveStats
 * @returns {object}
 */
// The entity's defense lists by sub-type (v / r / i)
const DEFENSE_LISTS = { v: "damage_vulnerabilities", r: "damage_resistances", i: "damage_immunities" };
const PHYSICAL_DAMAGE = ["bludgeoning", "piercing", "slashing"];
const PLAIN_DAMAGE_TYPES = DAMAGE_TYPES.filter((type) => !type.startsWith("non_magical_"));

/**
 * A creature's effective defenses: its own stat block defenses combined with its effects'
 * `defense` sub-effects. Per damage type immunity wins, and resistance and vulnerability
 * cancel. Condition immunities are its own plus effects' `defense` `i` `conditions`.
 *
 * @param {object} entity The creature (own lists: damage_resistances, …, condition_immunities)
 * @param {string} holderKey
 * @param {object} entities Entities of the encounter, for conditions
 * @param {function} definitionOf instance => resolved definition
 * @returns {{ damage_resistances: string[], damage_vulnerabilities: string[], damage_immunities: string[],
 *   condition_immunities: string[], sources: object, reminders: string[] }}
 *   sources: { "r:fire": ["Protection from Energy"], "ci:poisoned": ["Petrified"] } for effect defenses
 */
export function effectiveDefenses({ entity, holderKey, entities = {}, definitionOf = () => undefined } = {}) {
	const own = (field) => (Array.isArray(entity?.[field]) ? entity[field] : []);
	const result = { sources: {}, reminders: [] };
	// Per damage type the defenses it has: { fire: Set(["r", "v"]) }
	const byType = {};
	const addType = (type, kind) => (byType[type] = byType[type] || new Set()).add(kind);
	for (const [kind, field] of Object.entries(DEFENSE_LISTS)) {
		for (const type of own(field)) addType(type, kind);
	}
	const conditionImmunities = new Set(own("condition_immunities"));
	const addSource = (key, name) => {
		const list = (result.sources[key] = result.sources[key] || []);
		if (!list.includes(name)) list.push(name);
	};
	const reminder = (text) => {
		if (!result.reminders.includes(text)) result.reminders.push(text);
	};

	const seen = new Set();
	for (const [, instance] of effectEntries(entity, holderKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seen.has(groupKey)) continue;
		seen.add(groupKey);

		const name = effectLabel(definition, instance);
		const level = parseInt(instance.level) || 1;
		const ctx = { holderKey, instance, entities, definitionOf };
		const definitionState = definition.condition ? conditionState(definition.condition, ctx) : true;

		for (const sub_effect of definition.sub_effects || []) {
			if (sub_effect?.type !== "defense") continue;
			const kinds = (sub_effect.sub_types || []).filter((kind) => DEFENSE_LISTS[kind]);
			if (!kinds.length) continue;
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			if (definitionState === "unknown" || subState === "unknown" || sub_effect.context) {
				reminder(`${name}: ${sub_effect.description || describeSubEffect(sub_effect)}`);
				continue;
			}

			// Condition immunity
			if (kinds.includes("i")) {
				for (const condition of sub_effect.conditions || []) {
					conditionImmunities.add(condition);
					addSource(`ci:${condition}`, name);
				}
			}

			// Damage types: listed, all damage, or the chosen one
			let types = [];
			if (sub_effect.all_damage) {
				const except = sub_effect.except_damage_types || [];
				types = PLAIN_DAMAGE_TYPES.filter((type) => !except.includes(type));
			} else if (choiceKinds(sub_effect).includes("damage_type")) {
				const chosen = instance.choices?.damage_type;
				const allowed = sub_effect.damage_types?.length ? sub_effect.damage_types : PLAIN_DAMAGE_TYPES;
				if (allowed.includes(chosen)) types = [chosen];
			} else {
				types = sub_effect.damage_types || [];
			}
			// "From nonmagical attacks": the physical types become their nonmagical variants
			const bypass = sub_effect.bypass || [];
			if (bypass.length) {
				types = types.map((type) => (PHYSICAL_DAMAGE.includes(type) ? `non_magical_${type}` : type));
				if (bypass.some((b) => b !== "magical")) {
					reminder(`${name}: doesn't apply to ${bypass.filter((b) => b !== "magical").join(" or ")} weapons`);
				}
			}
			for (const type of types) {
				for (const kind of kinds) {
					addType(type, kind);
					addSource(`${kind}:${type}`, name);
				}
			}
		}
	}

	// Combine per type: immunity wins, resistance and vulnerability cancel
	for (const field of Object.values(DEFENSE_LISTS)) result[field] = [];
	for (const [type, kinds] of Object.entries(byType)) {
		if (kinds.has("i")) result.damage_immunities.push(type);
		else if (kinds.has("r") && kinds.has("v")) continue;
		else if (kinds.has("r")) result.damage_resistances.push(type);
		else if (kinds.has("v")) result.damage_vulnerabilities.push(type);
	}
	result.condition_immunities = [...conditionImmunities];
	return result;
}

export function effectiveEntity(entity, { values = {}, modifiers = {} } = {}, defenses) {
	const stored = {};
	for (const field of Object.keys(values)) stored[field] = entity[field];
	const effective = { ...entity, ...values, effect_modifiers: modifiers, stored };
	// Defenses (effectiveDefenses): the combined lists, the own lists kept in stored
	if (defenses) {
		for (const field of [...Object.values(DEFENSE_LISTS), "condition_immunities"]) {
			stored[field] = entity[field];
			effective[field] = defenses[field];
		}
		effective.defense_sources = defenses.sources;
		effective.defense_reminders = defenses.reminders;
	}
	return effective;
}

// Sub-types that apply to each part of a d20 roll
const ROLL_PART_SUB_TYPES = {
	check: ["ability", "d20_test"],
	skill: ["skill"],
	save: ["save", "d20_test"],
	initiative: ["initiative"],
	concentration: ["concentration_save"],
	attack: ["attack", "d20_test"],
};
const ROLL_TYPES = ["advantage", "disadvantage", "bonus", "auto_fail", "auto_success", "roll_floor", "reroll"];
// Legacy spelling of an "against" advantage/disadvantage
const GRANT_TYPES = { grant_advantage: "advantage", grant_disadvantage: "disadvantage" };

// The attack_types an attack action is
const ATTACK_TYPE_KINDS = {
	melee_weapon: ["melee", "weapon", "melee_weapon"],
	ranged_weapon: ["ranged", "weapon", "ranged_weapon"],
	spell_attack: ["spell"],
};
// attack_types the tracker can't decide from the action type
const UNDECIDED_ATTACK_TYPES = ["melee_spell", "ranged_spell", "unarmed", "thrown", "opportunity"];

/**
 * Whether a sub-effect's attack_types filter applies to an attack
 *
 * @param {string[]} attackTypes The sub-effect's attack_types (empty: every attack)
 * @param {string} attackType The action's type: melee_weapon, ranged_weapon or spell_attack
 * @returns {true|false|"unknown"}
 */
export function attackTypeState(attackTypes, attackType) {
	if (!attackTypes?.length) return true;
	const kinds = ATTACK_TYPE_KINDS[attackType];
	// Without an attack type (the bonuses drawer), every filter is shown as a condition
	if (!kinds) return "unknown";
	if (attackTypes.some((type) => kinds.includes(type))) return true;
	if (attackTypes.some((type) => UNDECIDED_ATTACK_TYPES.includes(type))) return "unknown";
	return false;
}

/**
 * The parts a d20 roll consists of: a skill check is also a check of its ability, initiative
 * is also a Dexterity check
 */
function rollParts(roll = {}) {
	// An attack's own roll, or the target's side of it (against)
	if (roll.kind === "attack") {
		return [{ kind: "attack", attackType: roll.attackType, against: roll.perspective === "against" }];
	}
	if (roll.kind === "skill") {
		const ability = skills[roll.skill]?.ability;
		return [{ kind: "skill", skill: roll.skill, ability }, ...(ability ? [{ kind: "check", ability }] : [])];
	}
	if (roll.kind === "initiative") {
		return [
			{ kind: "initiative", ability: "dexterity" },
			{ kind: "check", ability: "dexterity" },
		];
	}
	// A Concentration save is also a save of its ability (Constitution)
	if (roll.kind === "concentration") {
		const ability = roll.ability || "constitution";
		return [
			{ kind: "concentration", ability },
			{ kind: "save", ability },
		];
	}
	return [{ kind: roll.kind, ability: roll.ability }];
}

/**
 * Whether a roll sub-effect applies to a part of the roll (sub-type, abilities, skills)
 */
function rollPartMatches(sub_effect, part, choices = {}) {
	const sub_types = sub_effect.sub_types || [];
	// "Attacks against it" only apply to attack rolls, not d20 tests in general
	const partSubTypes = part.kind === "attack" && part.against ? ["attack"] : ROLL_PART_SUB_TYPES[part.kind];
	if (!sub_types.some((sub_type) => partSubTypes?.includes(sub_type))) return false;
	if (sub_effect.abilities?.length && !sub_effect.abilities.includes(part.ability)) return false;
	if (part.kind === "skill" && sub_effect.skills?.length && !sub_effect.skills.includes(part.skill)) return false;
	// A choice made when the effect was applied limits it (Enhance Ability, 2024 Guidance)
	const kinds = choiceKinds(sub_effect);
	if (kinds.includes("ability") && part.ability !== choices.ability) return false;
	if (kinds.includes("skill") && (part.kind !== "skill" || part.skill !== choices.skill)) return false;
	return true;
}

/**
 * Manual roll-bonus keys that apply to a part of a roll
 */
function rollPartBonusKeys(part) {
	switch (part.kind) {
		case "skill":
			return [skillBonusKey(part.skill)];
		case "check":
			return [`check_${part.ability}`, "check_all"];
		case "save":
			return [`save_${part.ability}`, "save_all"];
		case "concentration":
			return ["concentration_save"];
		case "attack":
			return part.against ? [] : ["attack"];
		default:
			return [];
	}
}

/**
 * The d20 modifiers of an entity's active effects and manual bonuses for one roll.
 *
 * Collects Advantage and Disadvantage, flat and dice bonuses, automatic failure and success,
 * single-use modifiers to end after the roll, and reminders for modifiers the tracker can't
 * check (a context, a condition with an unknown state, a source filter with an unknown source).
 *
 * @param {object} entity Entity that rolls (pass the effective entity for formula values)
 * @param {string} holderKey Its key
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @param {object} roll { kind: "check" | "skill" | "save" | "initiative", ability, skill, source: { magical } }
 * @returns {object} { advantage, disadvantage, flat, dice, autoFail, autoSuccess, reminders, consume, usedUp }
 */
export function rollModifiers({ entity, holderKey, entities = {}, definitionOf = () => undefined, roll = {} }) {
	const result = {
		advantage: [],
		disadvantage: [],
		flat: [],
		dice: [],
		autoFail: [],
		autoSuccess: [],
		reminders: [],
		consume: [],
		usedUp: [],
		lines: [],
		// Attacks: the attacker's lowest crit range, the target's incoming crits, distance assumptions
		critRange: undefined,
		critRangeNames: [],
		critOnHit: [],
		assumptions: [],
		// Minimum die or total (Reliable Talent) and rerolls to offer (Luck)
		floors: [],
		rerolls: [],
	};
	if (!entity) return result;
	const parts = rollParts(roll);
	const isAttack = roll.kind === "attack";
	const against = isAttack && roll.perspective === "against";
	const selfVars = formulaVars(entity);
	const add = (list, item) => {
		if (!list.includes(item)) list.push(item);
	};

	// Per instance its contributions, so the same definition twice counts once
	const contributions = [];
	for (const [effectKey, instance] of effectEntries(entity, holderKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;

		const name = effectLabel(definition, instance);
		const level = parseInt(instance.level) || 1;
		const ctx = {
			holderKey,
			instance,
			entities,
			definitionOf,
			counterpartKey: isAttack ? roll.counterpartKey : undefined,
			attackType: isAttack ? roll.attackType : undefined,
			assumptions: result.assumptions,
		};
		const flat = Object.create(null);
		for (const [key, value] of Object.entries(selfVars)) flat[key] = value;
		for (const [key, value] of Object.entries(formulaVars(entities[instance.caster_key]) || {})) {
			flat[`caster.${key}`] = value;
		}
		flat.level = level;
		const definitionState = definition.condition ? conditionState(definition.condition, ctx) : true;

		const entries = [];
		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			let type = sub_effect.type;
			const sub_types = sub_effect.sub_types || [];
			if (isAttack && type === "critical") {
				// The attacker's crit range, or a hit against the target being critical
				if (against ? !sub_types.includes("incoming_crit_range") : !sub_types.includes("crit_range")) continue;
				if (!against && !(sub_effect.crit_range >= 2)) continue;
			} else {
				// The target's side of an attack takes only "against" modifiers (or the legacy grant_*)
				if (against) {
					if (sub_effect.perspective !== "against" && !GRANT_TYPES[type]) continue;
					type = GRANT_TYPES[type] || type;
				} else if (sub_effect.perspective === "against") continue;
				if (!ROLL_TYPES.includes(type)) continue;
				if (!parts.some((part) => rollPartMatches(sub_effect, part, instance.choices))) continue;
			}
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;

			const reminder = (text) => {
				const detail = sub_effect.description || text || describeSubEffect(sub_effect);
				entries.push({ kind: "reminder", text: `${name}: ${detail}`, detail, name, effectKey });
			};

			// What the tracker can't check becomes a reminder; a condition that's false leaves it out
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			if (definitionState === "unknown" || subState === "unknown" || sub_effect.context) {
				reminder();
				continue;
			}
			// Weapon / melee / ranged / spell attacks only. Without an attack type (the bonuses
			// drawer), the filter is shown with the modifier.
			let attackTypesNote;
			if (isAttack && sub_effect.attack_types?.length) {
				if (!roll.attackType) {
					attackTypesNote = sub_effect.attack_types.join(", ").replace(/_/g, " ");
				} else {
					const typeState = attackTypeState(sub_effect.attack_types, roll.attackType);
					if (typeState === false) continue;
					if (typeState === "unknown") {
						reminder();
						continue;
					}
				}
			}
			if (sub_effect.source) {
				const filter = sub_effect.source;
				const checkable = Object.keys(filter).every((key) => key === "magical");
				const known = roll.source?.magical !== undefined;
				if (!checkable || !known) {
					reminder();
					continue;
				}
				if (Boolean(filter.magical) !== Boolean(roll.source.magical)) continue;
			}

			const entry = { name, effectKey, sub_effect, type, attackTypesNote };
			if (type === "bonus") {
				const rollSpec = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : undefined;
				let value = 0;
				if (sub_effect.value !== undefined) {
					const resolved = resolveAmount(sub_effect.value, flat);
					if (resolved.missing.length || resolved.value === undefined) {
						reminder(`${resolved.missing.join(", ") || "value"} not known`);
						continue;
					}
					value = resolved.value;
				}
				const dice_count = parseInt(rollSpec?.dice_count) || 0;
				const dice_type = parseInt(rollSpec?.dice_type) || 0;
				if (rollSpec && dice_count && dice_type) {
					const fixed = parseInt(rollSpec.fixed_val) || 0;
					const sign = sub_effect.multiplier < 0 || fixed < 0 ? -1 : 1;
					entry.dice = { name, dice_count, dice_type, sign };
					// A positive fixed value is added; a negative one only gives the dice their sign
					if (fixed > 0) value += fixed;
				} else if (rollSpec) {
					// A roll without dice (only a fixed value, or only `magical` for damage)
					value += parseInt(rollSpec.fixed_val) || 0;
				} else if (typeof sub_effect.multiplier === "number") {
					value *= sub_effect.multiplier;
				}
				entry.value = Math.floor(value);
			} else if (type === "roll_floor") {
				const resolved = resolveAmount(sub_effect.value, flat);
				if (resolved.missing.length || resolved.value === undefined) {
					reminder(`${resolved.missing.join(", ") || "value"} not known`);
					continue;
				}
				entry.value = Math.floor(resolved.value);
			} else if (type === "reroll" && sub_effect.reroll_bonus !== undefined) {
				const resolved = resolveAmount(sub_effect.reroll_bonus, flat);
				if (resolved.value !== undefined && !resolved.missing.length) entry.bonus = Math.floor(resolved.value);
			}
			entries.push(entry);
		}
		if (entries.length) contributions.push({ groupKey: `${instance.source}:${instance.source_key}`, effectKey, entries });
	}

	// The same definition more than once: only the instance with the most entries counts
	const kept = new Map();
	for (const contribution of contributions) {
		const current = kept.get(contribution.groupKey);
		if (!current || contribution.entries.length > current.entries.length) kept.set(contribution.groupKey, contribution);
	}

	// Per effect line, for the bonuses drawer: { name, text, effectKey, applied }
	const line = (entry, text, applied = true) =>
		result.lines.push({
			name: entry.name,
			text: entry.attackTypesNote ? `${text} (${entry.attackTypesNote})` : text,
			effectKey: entry.effectKey,
			applied,
		});

	for (const { entries } of kept.values()) {
		for (const entry of entries) {
			if (entry.kind === "reminder") {
				add(result.reminders, entry.text);
				line(entry, entry.detail, false);
				continue;
			}
			const { name, sub_effect } = entry;
			switch (entry.type) {
				case "critical":
					if (against) {
						add(result.critOnHit, name);
						line(entry, "hits are critical");
					} else {
						const range = sub_effect.crit_range;
						if (result.critRange === undefined || range < result.critRange) result.critRange = range;
						add(result.critRangeNames, name);
						line(entry, `critical on ${range}–20`);
					}
					break;
				case "advantage":
					add(result.advantage, name);
					line(entry, "Advantage");
					break;
				case "disadvantage":
					add(result.disadvantage, name);
					line(entry, "Disadvantage");
					break;
				case "auto_fail":
					add(result.autoFail, name);
					line(entry, "fails automatically");
					break;
				case "auto_success":
					add(result.autoSuccess, name);
					line(entry, "succeeds automatically");
					break;
				case "bonus":
					if (entry.value) {
						result.flat.push({ name, value: entry.value });
						line(entry, signedText(entry.value));
					}
					if (entry.dice?.dice_count && entry.dice.dice_type) {
						result.dice.push(entry.dice);
						line(entry, `${entry.dice.sign < 0 ? "−" : "+"}${entry.dice.dice_count}d${entry.dice.dice_type}`);
					}
					break;
				case "roll_floor": {
					const appliesTo = sub_effect.applies_to === "total" ? "total" : "die";
					result.floors.push({ name, value: entry.value, appliesTo });
					line(entry, appliesTo === "total" ? `total at least ${entry.value}` : `die at least ${entry.value}`);
					break;
				}
				case "reroll":
					// Offered when rolled; a single use is used up when the reroll is taken
					result.rerolls.push({
						name,
						holderKey,
						effectKey: entry.effectKey,
						condition: sub_effect.reroll_condition,
						keep: sub_effect.keep || "new",
						bonus: entry.bonus || 0,
						withAdvantage: !!sub_effect.with_advantage,
						consume: !!sub_effect.consume,
					});
					line(entry, sub_effect.reroll_condition ? `reroll on ${sub_effect.reroll_condition}` : "reroll");
					continue;
			}
			// Single-use: one use on the roll ends the effect; other forms are only reminded
			const consume = sub_effect.consume;
			if (consume) {
				if ((consume.on || "roll") === "roll" && (consume.uses || 1) === 1 && consume.scope !== "sub_effect") {
					if (!result.consume.some((c) => c.effectKey === entry.effectKey)) {
						result.consume.push({ holderKey, effectKey: entry.effectKey });
					}
				} else {
					add(result.usedUp, `${name}: may be used up`);
				}
			}
		}
	}

	// Manual roll bonuses
	const manual = manualBonuses(entity);
	const keys = [...new Set(parts.flatMap(rollPartBonusKeys))];
	for (const key of keys) {
		for (const [bonusId, bonus] of Object.entries(manual[key] || {})) {
			result.flat.push({ name: bonus.label, value: bonus.value, bonusId, bonusKey: key });
		}
	}
	return result;
}

/**
 * Whether a sub-effect is a Concentration save: an outcome that breaks Concentration and
 * comes with a save (Concentration's damage_taken sub-effect)
 */
export function isConcentrationSave(sub_effect) {
	return (
		sub_effect?.type === "outcome" &&
		!!sub_effect.save &&
		(sub_effect.sub_types || []).includes("break_concentration")
	);
}

/**
 * Ability and DC of a Concentration save for an amount of damage: the save's dc evaluated with
 * damage_taken (min, max and rounding included). Without an amount the DC is undefined.
 *
 * @param {object} sub_effect Concentration save sub-effect
 * @param {number} damage Damage of the event
 * @returns {{ ability: string, dc: number|undefined }}
 */
export function concentrationSaveDc(sub_effect, damage) {
	const save = sub_effect?.save || {};
	const ability = save.ability || save.abilities?.[0] || "constitution";
	const amount = parseInt(damage);
	if (!Number.isFinite(amount)) return { ability, dc: undefined };
	const resolved = resolveAmount(save.dc, { damage_taken: amount });
	return { ability, dc: resolved.missing.length ? undefined : resolved.value };
}

const signedText = (value) => (value < 0 ? `−${Math.abs(value)}` : `+${value}`);

/**
 * Turns roll modifiers into what a roll needs: the modifier with the flat bonuses, the
 * Advantage object (effects and the DM's choice; both cancel), bonus dice, an automatic
 * result, and note lines for the result and tooltips
 *
 * @param {object} modifiers Result of rollModifiers
 * @param {number} modifier The roll's own modifier
 * @param {object} advantage The DM's choice, e.g. { advantage: true }
 * @returns {object} { m, flat, advantage, bonus_dice, auto, consume, notes, changed }
 */
/**
 * The roll modifiers of an attack: the attacker's own (its attack and d20 test modifiers,
 * its crit range, manual attack bonuses) and the target's "attacks against it" (incoming
 * crits included). Each side checks its conditions with the other as counterpart.
 * Without a target (an area attack) only the attacker's count.
 *
 * @param {string} attackerKey
 * @param {string} targetKey
 * @param {string} attackType melee_weapon, ranged_weapon or spell_attack
 * @param {object} source { magical } of the attack, if known
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {object} rollModifiers' shape, merged: critRange (lowest), critOnHit, assumptions
 */
export function attackModifiers({ attackerKey, targetKey, attackType, source, entities = {}, definitionOf } = {}) {
	const side = (holderKey, counterpartKey, perspective) =>
		rollModifiers({
			entity: entities[holderKey],
			holderKey,
			entities,
			definitionOf,
			roll: { kind: "attack", attackType, perspective, counterpartKey, source },
		});
	const own = side(attackerKey, targetKey, "self");
	const theirs = targetKey && entities[targetKey] ? side(targetKey, attackerKey, "against") : undefined;
	if (!theirs) return own;

	const merged = {};
	for (const [key, value] of Object.entries(own)) {
		merged[key] = Array.isArray(value) ? [...new Set([...value, ...(theirs[key] || [])])] : value;
	}
	// Objects (flat, dice, consume, lines) can't be deduplicated by identity: concatenate
	for (const key of ["flat", "dice", "consume", "lines"]) merged[key] = [...own[key], ...theirs[key]];
	// Floors and rerolls are the attacker's own
	merged.floors = own.floors;
	merged.rerolls = own.rerolls;
	merged.critRange = own.critRange;
	return merged;
}

/**
 * The damage a sub-effect adds to a hit, from its roll and value
 *
 * @param {object} sub_effect With the chosen value
 * @param {object} instance For a chosen damage type
 * @param {string} name The effect's name
 * @param {object} vars Formula variables
 * @returns {object|null|undefined} { name, magical, damage_type, dice_count, dice_type, value };
 *   null when it adds nothing, undefined when its value can't be worked out
 */
function damageAmount(sub_effect, instance, name, vars) {
	const rollSpec = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : {};
	let value = 0;
	if (sub_effect.value !== undefined) {
		const resolved = resolveAmount(sub_effect.value, vars);
		if (resolved.missing.length || resolved.value === undefined) return undefined;
		value = resolved.value;
	}
	value += parseInt(rollSpec.fixed_val) || 0;
	const damage_type =
		rollSpec.damage_type ||
		(Array.isArray(rollSpec.damage_type_choice) ? instance.choices?.damage_type : undefined);
	const bonus = {
		name,
		// Definitions are generic: the roll says whether its damage is magical
		magical: !!rollSpec.magical,
		damage_type,
		dice_count: parseInt(rollSpec.dice_count) || 0,
		dice_type: parseInt(rollSpec.dice_type) || 0,
		value: Math.floor(value),
	};
	return bonus.value || (bonus.dice_count && bonus.dice_type) ? bonus : null;
}

/**
 * The extra damage of an attacker's hit: its effects' bonus sub-effects on damage (own
 * perspective, for this attack type), the target's hit-taken damage caused by this attacker
 * (Hex, Hunter's Mark: `from: "target"`, see hitTakenDamage) and its manual damage bonuses. A bonus with a damage
 * type (the roll's, or the chosen one) is damage of that type; without one, rollAction uses
 * the attack's first damage type. The same definition twice counts once.
 *
 * @param {string} attackerKey
 * @param {string} targetKey The other party, for conditions on the counterpart
 * @param {string} attackType melee_weapon, ranged_weapon or spell_attack; no damage bonuses without one
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {{ bonuses: object[], reminders: string[], assumptions: string[] }}
 *   bonuses: [{ name, damage_type, dice_count, dice_type, value }]
 */
export function damageBonuses({ attackerKey, targetKey, attackType, entities = {}, definitionOf = () => undefined } = {}) {
	const result = { bonuses: [], reminders: [], assumptions: [] };
	const attacker = entities[attackerKey];
	if (!attacker || !ATTACK_TYPE_KINDS[attackType]) return result;

	const selfVars = formulaVars(attacker);
	const seen = new Set();
	for (const [, instance] of effectEntries(attacker, attackerKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seen.has(groupKey)) continue;

		const name = effectLabel(definition, instance);
		const level = parseInt(instance.level) || 1;
		const ctx = {
			holderKey: attackerKey,
			instance,
			entities,
			definitionOf,
			counterpartKey: targetKey,
			attackType,
			assumptions: result.assumptions,
		};
		const flat = Object.create(null);
		for (const [key, value] of Object.entries(selfVars)) flat[key] = value;
		for (const [key, value] of Object.entries(formulaVars(entities[instance.caster_key]) || {})) {
			flat[`caster.${key}`] = value;
		}
		flat.level = level;
		const definitionState = definition.condition ? conditionState(definition.condition, ctx) : true;

		let found = false;
		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			if (sub_effect.type !== "bonus" || !(sub_effect.sub_types || []).includes("damage")) continue;
			if (sub_effect.perspective === "against") continue;
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;

			const reminder = () => {
				const text = `${name}: ${sub_effect.description || describeSubEffect(sub_effect)}`;
				if (!result.reminders.includes(text)) result.reminders.push(text);
			};
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			const typeState = attackTypeState(sub_effect.attack_types, attackType);
			if (typeState === false) continue;
			if (definitionState === "unknown" || subState === "unknown" || sub_effect.context || typeState === "unknown") {
				reminder();
				continue;
			}

			const bonus = damageAmount(sub_effect, instance, name, flat);
			if (bonus === undefined) {
				reminder();
				continue;
			}
			if (bonus) {
				result.bonuses.push(bonus);
				found = true;
			}
		}
		if (found) seen.add(groupKey);
	}

	// The target's damage when this attacker hits it (Hex, Hunter's Mark), rolled with the attack
	const target = entities[targetKey];
	const seenOnTarget = new Set();
	for (const [, instance] of target && targetKey !== attackerKey ? effectEntries(target, targetKey) : []) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seenOnTarget.has(groupKey)) continue;

		const name = effectLabel(definition, instance);
		const level = parseInt(instance.level) || 1;
		const ctx = {
			holderKey: targetKey,
			instance,
			entities,
			definitionOf,
			counterpartKey: attackerKey,
			attackType,
			assumptions: result.assumptions,
		};
		const flat = Object.create(null);
		for (const [key, value] of Object.entries(formulaVars(target))) flat[key] = value;
		for (const [key, value] of Object.entries(formulaVars(entities[instance.caster_key]) || {})) {
			flat[`caster.${key}`] = value;
		}
		flat.level = level;
		const definitionState = definition.condition ? conditionState(definition.condition, ctx) : true;

		let found = false;
		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			if (!hitTakenDamage(sub_effect) || !hitTakenBy(sub_effect, instance, attackerKey)) continue;
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;

			const reminder = () => {
				const text = `${name}: ${sub_effect.description || describeSubEffect(sub_effect)}`;
				if (!result.reminders.includes(text)) result.reminders.push(text);
			};
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			const typeState = attackTypeState(sub_effect.trigger_filter?.attack_types, attackType);
			if (typeState === false) continue;
			if (definitionState === "unknown" || subState === "unknown" || typeState === "unknown") {
				reminder();
				continue;
			}
			const bonus = damageAmount(sub_effect, instance, name, flat);
			if (bonus === undefined) {
				reminder();
				continue;
			}
			if (bonus) {
				result.bonuses.push({ ...bonus, from: "target" });
				found = true;
			}
		}
		if (found) seenOnTarget.add(groupKey);
	}

	// Manual damage bonuses: flat, of the attack's damage type
	for (const bonus of Object.values(manualBonuses(attacker).damage || {})) {
		if (bonus.value) result.bonuses.push({ name: bonus.label, value: bonus.value, dice_count: 0, dice_type: 0 });
	}
	return result;
}

/**
 * What a creature's effects stop it from doing: the `restrict` sub-effects of its active
 * definitions without a trigger, one entry per sub-type. A condition that's false leaves it
 * out, one that can't be checked makes it possible. With a counterpart (the target of an
 * attack) conditions on the other party are checked.
 *
 * @param {object} entity
 * @param {string} holderKey
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @param {string} counterpartKey The other party, when known
 * @returns {object[]} [{ kind, name, description, possible, againstKey }]; againstKey: the
 *   creature an "against the charmer" restriction is about (the instance's caster)
 */
export function restrictions({ entity, holderKey, entities = {}, definitionOf = () => undefined, counterpartKey } = {}) {
	const result = [];
	if (!entity) return result;
	const seen = new Set();
	for (const [, instance] of effectEntries(entity, holderKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seen.has(groupKey)) continue;
		seen.add(groupKey);

		const name = effectLabel(definition, instance);
		const level = parseInt(instance.level) || 1;
		const ctx = { holderKey, instance, entities, definitionOf, counterpartKey };
		const definitionState = definition.condition ? conditionState(definition.condition, ctx) : true;
		for (const sub_effect of definition.sub_effects || []) {
			if (sub_effect?.type !== "restrict" || sub_effect.trigger) continue;
			if (sub_effect.min_level !== undefined && level < sub_effect.min_level) continue;
			if (sub_effect.max_level !== undefined && level > sub_effect.max_level) continue;
			if (missingChoice(sub_effect, instance)) continue;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			const possible = definitionState === "unknown" || subState === "unknown";
			const condition = sub_effect.condition;
			const againstKey =
				condition?.subject === "counterpart" && condition.type === "is_caster" && !condition.negate
					? instance.caster_key
					: undefined;
			for (const kind of sub_effect.sub_types || []) {
				result.push({ kind, name, description: sub_effect.description, possible, againstKey });
			}
		}
	}
	return result;
}

// Roll categories (roll_action) each restriction kind applies to
const RESTRICTED_CATEGORIES = {
	action: ["actions", "bonus_actions", "legendary_actions", "special_abilities", "innate", "caster"],
	bonus_action: ["bonus_actions"],
	reaction: ["reactions"],
};

/**
 * The restrictions that apply to rolling an action or spell
 *
 * @param {object[]} own The actor's restrictions (restrictions(), without counterpart)
 * @param {object} perTarget { [targetKey]: restrictions() with that target as counterpart }
 * @param {string} category roll_action's category
 * @param {boolean} outOfTurn Another entity has the turn (a reaction)
 * @param {boolean} attack The action has a to-hit
 * @returns {object[]} The matching restrictions, with targetKey for attack restrictions
 */
export function rollRestrictions({ own = [], perTarget = {}, category, outOfTurn = false, attack = false } = {}) {
	const matches = own.filter(
		({ kind }) =>
			RESTRICTED_CATEGORIES[kind]?.includes(category) || (kind === "reaction" && outOfTurn)
	);
	if (attack) {
		for (const [targetKey, list] of Object.entries(perTarget)) {
			for (const restriction of list) {
				if (restriction.kind === "attack") matches.push({ ...restriction, targetKey });
			}
		}
	}
	return matches;
}

/**
 * The death outcome of an instance at its level (Exhaustion 6), if any
 *
 * @returns {object|undefined} The outcome sub-effect
 */
export function deathOutcome({ instance = {}, definition } = {}) {
	const level = parseInt(instance.level) || 1;
	return (definition?.sub_effects || []).find(
		(sub_effect) =>
			sub_effect?.type === "outcome" &&
			(sub_effect.sub_types || []).includes("death") &&
			!sub_effect.trigger &&
			(sub_effect.min_level === undefined || level >= sub_effect.min_level) &&
			(sub_effect.max_level === undefined || level <= sub_effect.max_level)
	);
}

/**
 * Whether a sub-effect breaks Concentration without a save (dropping to 0 hit points)
 */
export function isConcentrationBreak(sub_effect) {
	return (
		sub_effect?.type === "outcome" &&
		(sub_effect.sub_types || []).includes("break_concentration") &&
		!sub_effect.save
	);
}

// Damage modifier sub-types the tracker applies: toggles, drop to 1, Evasion and Absorb
const DAMAGE_TOGGLE_KINDS = { reduce_damage: "reduce", halve_damage: "halve", negate_damage: "negate" };
const APPLIED_DAMAGE_MODIFIERS = [...Object.keys(DAMAGE_TOGGLE_KINDS), "floor_at_1", "evasion", "absorb"];

/**
 * Active definitions of an entity, one per definition (the same definition twice counts once),
 * with what's needed to check their sub-effects
 */
function activeDefinitions({ entity, holderKey, entities, definitionOf, counterpartKey }) {
	const list = [];
	const seen = new Set();
	for (const [effectKey, instance] of effectEntries(entity, holderKey)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seen.has(groupKey)) continue;
		seen.add(groupKey);
		const ctx = { holderKey, instance, entities, definitionOf, counterpartKey };
		list.push({
			effectKey,
			instance,
			definition,
			ctx,
			name: effectLabel(definition, instance),
			level: parseInt(instance.level) || 1,
			definitionState: definition.condition ? conditionState(definition.condition, ctx) : true,
		});
	}
	return list;
}

/**
 * Whether a sub-effect is in play at an instance's level with its choices made
 */
function subEffectInPlay(sub_effect, { level, instance }) {
	if (sub_effect.min_level !== undefined && level < sub_effect.min_level) return false;
	if (sub_effect.max_level !== undefined && level > sub_effect.max_level) return false;
	if (missingChoice(sub_effect, instance)) return false;
	return true;
}

/**
 * The damage modifiers on the damage a creature takes (direction incoming): toggles for
 * reduce/halve/negate, drop to 1, Evasion and Absorb, and reminders for the rest.
 * A condition that's false leaves a modifier out; one that can't be checked is named in its
 * notes. A chosen damage type (choice: "damage_type") limits it to that type.
 *
 * @param {object} entity The creature taking the damage (effective entity for formula values)
 * @param {string} holderKey Its key
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @param {string} counterpartKey The attacker, when known
 * @returns {object} { toggles, evasion, absorb, dropToOne, reminders }
 */
export function damageModifiers({ entity, holderKey, entities = {}, definitionOf = () => undefined, counterpartKey } = {}) {
	const result = { toggles: [], evasion: [], absorb: [], dropToOne: [], reminders: [] };
	if (!entity) return result;
	const vars = formulaVars(entity);
	for (const active of activeDefinitions({ entity, holderKey, entities, definitionOf, counterpartKey })) {
		const { effectKey, instance, definition, ctx, name, definitionState } = active;
		(definition.sub_effects || []).forEach((original, index) => {
			const sub_effect = withChosenValue(original, instance);
			if (sub_effect?.type !== "damage_modifier" || sub_effect.trigger) return;
			if ((sub_effect.direction || "incoming") !== "incoming") return;
			if (!subEffectInPlay(sub_effect, active)) return;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) return;

			const notes = [];
			if (definitionState === "unknown") notes.push(definition.condition.description || "if its condition holds");
			if (subState === "unknown") notes.push(sub_effect.condition.description || "if its condition holds");
			const damageTypes =
				choiceKinds(sub_effect).includes("damage_type")
					? [instance.choices.damage_type]
					: sub_effect.all_damage
						? undefined
						: sub_effect.damage_types?.length
							? sub_effect.damage_types
							: undefined;
			const exceptTypes = sub_effect.except_damage_types?.length ? sub_effect.except_damage_types : undefined;
			const description = sub_effect.description || describeSubEffect(sub_effect);

			for (const sub_type of sub_effect.sub_types || []) {
				const kind = DAMAGE_TOGGLE_KINDS[sub_type];
				if (kind) {
					const toggle = { id: `${effectKey}:${index}:${kind}`, name, effectKey, kind, damageTypes, exceptTypes, notes };
					let amountText = "";
					if (kind === "reduce") {
						const rollSpec = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : undefined;
						if (rollSpec?.dice_count && rollSpec.dice_type) {
							toggle.roll = {
								dice_count: parseInt(rollSpec.dice_count),
								dice_type: parseInt(rollSpec.dice_type),
								fixed_val: parseInt(rollSpec.fixed_val) || 0,
							};
							amountText = `−${toggle.roll.dice_count}d${toggle.roll.dice_type}${toggle.roll.fixed_val ? `+${toggle.roll.fixed_val}` : ""}`;
						} else if (sub_effect.value !== undefined) {
							const flat = { ...vars, level: active.level };
							const resolved = resolveAmount(sub_effect.value, flat);
							if (resolved.value !== undefined && !resolved.missing.length) {
								toggle.value = Math.floor(resolved.value);
								amountText = `−${toggle.value}`;
							} else {
								notes.push(`${resolved.missing.join(", ") || "amount"} not known`);
							}
						}
					}
					const what = { reduce: amountText || "reduce", halve: "halve", negate: "negate" }[kind];
					const parts = [what];
					if (damageTypes) parts.push(damageTypes.join(" or "));
					if (exceptTypes) parts.push(`except ${exceptTypes.join(" or ")}`);
					let text = `${name}: ${parts.join(" ")}`;
					if (sub_effect.frequency && sub_effect.frequency !== "always") text += `, ${sub_effect.frequency.replace(/_/g, " ")}`;
					toggle.text = text;
					result.toggles.push(toggle);
				} else if (sub_type === "floor_at_1") {
					result.dropToOne.push({
						name,
						effectKey,
						damageTypes,
						exceptTypes,
						save: sub_effect.save,
						sub_effect,
						consume: sub_effect.consume,
						description,
						notes,
					});
				} else if (sub_type === "evasion") {
					result.evasion.push({ name, effectKey, abilities: sub_effect.abilities?.length ? sub_effect.abilities : ["dexterity"] });
				} else if (sub_type === "absorb") {
					result.absorb.push({ name, effectKey, damageTypes, exceptTypes });
				} else {
					const line = `${name}: ${description}`;
					if (!result.reminders.includes(line)) result.reminders.push(line);
				}
			}
		});
	}
	return result;
}

/**
 * Whether a damage type is one a modifier applies to (no damageTypes: any type)
 */
export function damageTypeMatches({ damageTypes, exceptTypes }, damageType) {
	if (damageTypes && !damageTypes.includes(damageType)) return false;
	if (exceptTypes && exceptTypes.includes(damageType)) return false;
	return true;
}

/**
 * The damage a creature takes after its damage modifiers, per damage part. In order: the
 * save/miss factor (Evasion changes it for Dexterity saves for half), reductions, halving,
 * negation, absorption, then defenses. Each part is rounded down.
 *
 * @param {object[]} parts [{ damageType, amount, factor, saveHalf, save }]: the rolled amount,
 *   the save/miss factor (1, 0.5, 0), whether a successful save halves it, and its own save
 * @param {object} modifiers Result of damageModifiers
 * @param {object} active { [toggleId]: rolled amount (reduce) or true (halve/negate) }
 * @param {object} save { ability, result: "save" | "fail" } of the target, if it saved
 * @param {function} defenseOf (damageType, part) => multiplier of the target's defenses
 * @returns {object} { parts, damage, healing, notes }; a part names what the toggles did to it
 *   (reduced, halved, negated) and whether it was absorbed
 */
export function applyDamageModifiers({ parts = [], modifiers = {}, active = {}, save, defenseOf = () => 1 } = {}) {
	const notes = [];
	const note = (text) => {
		if (!notes.includes(text)) notes.push(text);
	};
	const result = parts.map((part) => ({ ...part }));

	// Evasion: a Dexterity save for half takes nothing on a success and half on a failure.
	// A part can have its own save (several actions in one roll).
	for (const part of result) {
		let factor = part.factor === undefined ? 1 : part.factor;
		const partSave = part.save || save;
		const evasion =
			partSave?.result && (modifiers.evasion || []).find((entry) => entry.abilities.includes(partSave.ability));
		if (evasion && part.saveHalf) {
			factor = partSave.result === "save" ? 0 : 0.5;
			note(`${evasion.name}: ${partSave.result === "save" ? "no damage" : "half damage"}`);
		}
		part.amount = Math.floor((parseInt(part.amount) || 0) * factor);
	}

	for (const toggle of modifiers.toggles || []) {
		const value = active[toggle.id];
		if (value === undefined || value === false) continue;
		// A part without a damage type matches: the DM switched the toggle on
		const matching = result.filter((part) => !part.damageType || damageTypeMatches(toggle, part.damageType));
		if (!matching.length) continue;
		if (toggle.kind === "reduce") {
			// Subtracted from the matching parts in order, not below 0
			let left = Math.max(0, parseInt(value) || 0);
			for (const part of matching) {
				const used = Math.min(left, part.amount);
				part.amount -= used;
				part.reduced = (part.reduced || 0) + used;
				left -= used;
			}
			note(`${toggle.name}: −${Math.max(0, parseInt(value) || 0)}`);
		} else if (toggle.kind === "halve") {
			for (const part of matching) {
				part.amount = Math.floor(part.amount / 2);
				part.halved = true;
			}
			note(`${toggle.name}: halved`);
		} else if (toggle.kind === "negate") {
			for (const part of matching) {
				part.amount = 0;
				part.negated = true;
			}
			note(`${toggle.name}: no damage`);
		}
	}

	let healing = 0;
	for (const part of result) {
		const absorb = (modifiers.absorb || []).find((entry) => damageTypeMatches(entry, part.damageType));
		if (absorb && part.damageType && part.amount > 0) {
			healing += part.amount;
			part.absorbed = true;
			part.amount = 0;
			note(`${absorb.name}: heals instead`);
			continue;
		}
		part.amount = Math.floor(part.amount * defenseOf(part.damageType, part));
	}
	return {
		parts: result,
		damage: result.reduce((total, part) => total + part.amount, 0),
		healing,
		notes,
	};
}

/**
 * The "drop to 1 instead" that applies when damage would drop a creature to 0 hit points:
 * the first whose damage types match. With unknown damage types it applies, and the types are
 * named. An exception the data only describes (a critical hit) is left to the DM.
 *
 * @param {object[]} dropToOne damageModifiers().dropToOne
 * @param {string[]} damageTypes Damage types of the damage, if known
 * @param {number} damage The damage taken, for a save's DC
 * @returns {object|undefined} { entry, ability, dc, notes }
 */
export function dropToOneFor({ dropToOne = [], damageTypes, damage } = {}) {
	const known = Array.isArray(damageTypes) && damageTypes.length > 0;
	for (const entry of dropToOne) {
		const notes = [...(entry.notes || [])];
		if (known) {
			if (!damageTypes.some((type) => damageTypeMatches(entry, type))) continue;
		} else {
			if (entry.damageTypes) notes.push(`if the damage is ${entry.damageTypes.join(" or ")}`);
			if (entry.exceptTypes) notes.push(`unless the damage is ${entry.exceptTypes.join(" or ")}`);
		}
		if (!entry.save) return { entry, notes };
		const { ability, dc } = concentrationSaveDc(entry.sub_effect, damage);
		return { entry, ability, dc, notes };
	}
	return undefined;
}

// Extra-action kinds of grant_action
const EXTRA_ACTION_KINDS = [
	"extra_action",
	"extra_attack",
	"extra_bonus_action",
	"extra_reaction",
	"bonus_action_option",
	"extra_turn",
];

/**
 * A creature's extra actions (grant_action without a trigger), by the rules of restrictions:
 * [{ kind, name, description, allowedActions, possible }]
 */
export function extraActions({ entity, holderKey, entities = {}, definitionOf = () => undefined } = {}) {
	const result = [];
	if (!entity) return result;
	for (const active of activeDefinitions({ entity, holderKey, entities, definitionOf })) {
		const { definition, ctx, name, definitionState } = active;
		for (const sub_effect of definition.sub_effects || []) {
			if (sub_effect?.type !== "grant_action" || sub_effect.trigger) continue;
			if (!subEffectInPlay(sub_effect, active)) continue;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			for (const kind of sub_effect.sub_types || []) {
				if (!EXTRA_ACTION_KINDS.includes(kind)) continue;
				result.push({
					kind,
					name,
					description: sub_effect.description,
					allowedActions: sub_effect.allowed_actions || [],
					possible: definitionState === "unknown" || subState === "unknown",
				});
			}
		}
	}
	return result;
}

// Sub-effect types the tracker only reminds of
const REMINDER_TYPES = ["compel", "deny", "forced_movement", "sense", "proficiency", "score_swap"];

/**
 * Reminder lines for a creature's effects the tracker doesn't apply: compel, deny, forced
 * movement, senses, proficiencies, score swaps, restrictions with a limit or exclusive
 * choice, and damage modifiers it doesn't apply (and outgoing ones)
 *
 * @returns {string[]} "<effect>: <description>"
 */
export function effectReminders({ entity, holderKey, entities = {}, definitionOf = () => undefined } = {}) {
	const lines = [];
	if (!entity) return lines;
	const add = (line) => {
		if (!lines.includes(line)) lines.push(line);
	};
	for (const active of activeDefinitions({ entity, holderKey, entities, definitionOf })) {
		const { definition, ctx, name, definitionState } = active;
		for (const sub_effect of definition.sub_effects || []) {
			if (!sub_effect || sub_effect.trigger) continue;
			const type = sub_effect.type;
			const reminded =
				REMINDER_TYPES.includes(type) ||
				(type === "restrict" && (sub_effect.limit !== undefined || sub_effect.exclusive !== undefined)) ||
				(type === "damage_modifier" &&
					((sub_effect.direction || "incoming") !== "incoming" ||
						(sub_effect.sub_types || []).some((sub_type) => !APPLIED_DAMAGE_MODIFIERS.includes(sub_type))));
			if (!reminded) continue;
			if (!subEffectInPlay(sub_effect, active)) continue;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			add(`${name}: ${sub_effect.description || describeSubEffect(sub_effect)}`);
		}
	}
	return lines;
}

/**
 * The most hit points a creature can regain from one heal, from its `cap` on
 * `healing_received` (0: can't regain hit points, No Healing). A condition that's false leaves
 * a cap out; one that can't be checked is assumed to hold and named in `possible`.
 *
 * @returns {{ cap: number|undefined, names: string[], possible: string[] }} cap undefined: no cap
 */
export function healingReceivedCap({ entity, holderKey, entities = {}, definitionOf = () => undefined } = {}) {
	const result = { cap: undefined, names: [], possible: [] };
	if (!entity) return result;
	const vars = formulaVars(entity);
	for (const active of activeDefinitions({ entity, holderKey, entities, definitionOf })) {
		const { definition, instance, ctx, name, definitionState } = active;
		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			if (sub_effect?.type !== "cap" || sub_effect.trigger) continue;
			if (!(sub_effect.sub_types || []).includes("healing_received")) continue;
			if (!subEffectInPlay(sub_effect, active)) continue;
			const subState = sub_effect.condition ? conditionState(sub_effect.condition, ctx) : true;
			if (definitionState === false || subState === false) continue;
			const { value, missing } = resolveAmount(sub_effect.value, { ...vars, level: active.level });
			if (missing.length || value === undefined) continue;
			const cap = Math.max(0, Math.floor(value));
			result.cap = result.cap === undefined ? cap : Math.min(result.cap, cap);
			if (!result.names.includes(name)) result.names.push(name);
			if (definitionState === "unknown" || subState === "unknown") result.possible.push(name);
		}
	}
	return result;
}

/**
 * Lines for the bonuses drawer of an entity's own damage bonuses on attacks, whatever the
 * attack or target: [{ name, text, effectKey, applied }]. Filters and conditions are named
 * in the text; they're only checked when it attacks.
 *
 * @param {object} entity
 * @param {function} definitionOf instance => resolved definition
 */
export function damageBonusLines({ entity, definitionOf = () => undefined } = {}) {
	const lines = [];
	const seen = new Set();
	for (const [effectKey, instance] of effectEntries(entity)) {
		const definition = definitionOf(instance);
		if (!definition || definition.unresolved) continue;
		const groupKey = `${instance.source}:${instance.source_key}`;
		if (seen.has(groupKey)) continue;
		const name = effectLabel(definition, instance);
		for (const original of definition.sub_effects || []) {
			const sub_effect = withChosenValue(original, instance);
			if (sub_effect.type !== "bonus" || !(sub_effect.sub_types || []).includes("damage")) continue;
			if (sub_effect.perspective === "against") continue;
			const rollSpec = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : {};
			const parts = [];
			if (rollSpec.dice_count && rollSpec.dice_type) parts.push(`+${rollSpec.dice_count}d${rollSpec.dice_type}`);
			const value = typeof sub_effect.value === "number" ? sub_effect.value : parseInt(rollSpec.fixed_val) || 0;
			if (value) parts.push(signedText(value));
			if (typeof sub_effect.value === "object" || typeof sub_effect.value === "string") parts.push("+formula");
			const damageType = rollSpec.damage_type || (rollSpec.damage_type_choice ? instance.choices?.damage_type : undefined);
			let text = parts.join(" ") || describeSubEffect(sub_effect);
			if (damageType) text += ` ${damageType}`;
			if (sub_effect.attack_types?.length) text += ` (${sub_effect.attack_types.join(", ").replace(/_/g, " ")})`;
			if (sub_effect.condition || definition.condition) text += " (conditional)";
			lines.push({ name, text, effectKey, applied: true });
			seen.add(groupKey);
		}
	}
	return lines;
}

/**
 * Lines for the details bar of the damage other creatures take when this attacker hits them
 * (Hex, Hunter's Mark; see hitTakenDamage): instances with `by: "caster"` cast by the attacker
 * on any creature, and damage caused by anyone on the targeted creature. Filters and conditions
 * are named in the text; they're only checked when it attacks.
 *
 * @param {string} attackerKey
 * @param {string} targetKey The single targeted creature, if any
 * @param {object} entities Entities of the encounter
 * @param {function} definitionOf instance => resolved definition
 * @returns {object[]} [{ holderKey, name, text, targeted }], e.g. text "+1d6 necrotic"
 */
export function hitTakenDamageLines({ attackerKey, targetKey, entities = {}, definitionOf = () => undefined } = {}) {
	const lines = [];
	if (!attackerKey) return lines;
	for (const [holderKey, holder] of Object.entries(entities)) {
		if (holderKey === attackerKey) continue;
		const seen = new Set();
		for (const [, instance] of effectEntries(holder, holderKey)) {
			const definition = definitionOf(instance);
			if (!definition || definition.unresolved) continue;
			const groupKey = `${instance.source}:${instance.source_key}`;
			if (seen.has(groupKey)) continue;
			const name = effectLabel(definition, instance);
			for (const original of definition.sub_effects || []) {
				const sub_effect = withChosenValue(original, instance);
				if (!hitTakenDamage(sub_effect)) continue;
				const byCaster = sub_effect.trigger_filter?.by === "caster";
				if (byCaster ? instance.caster_key !== attackerKey : holderKey !== targetKey) continue;
				const rollSpec = sub_effect.roll && typeof sub_effect.roll === "object" ? sub_effect.roll : {};
				const parts = [];
				if (rollSpec.dice_count && rollSpec.dice_type) parts.push(`+${rollSpec.dice_count}d${rollSpec.dice_type}`);
				const value = typeof sub_effect.value === "number" ? sub_effect.value : parseInt(rollSpec.fixed_val) || 0;
				if (value) parts.push(signedText(value));
				if (typeof sub_effect.value === "object" || typeof sub_effect.value === "string") parts.push("+formula");
				const damageType = rollSpec.damage_type || (rollSpec.damage_type_choice ? instance.choices?.damage_type : undefined);
				let text = parts.join(" ") || describeSubEffect(sub_effect);
				if (damageType) text += ` ${damageType}`;
				const attackTypes = sub_effect.trigger_filter?.attack_types;
				if (attackTypes?.length) text += ` (${attackTypes.join(", ").replace(/_/g, " ")})`;
				if (sub_effect.condition || definition.condition) text += " (conditional)";
				lines.push({ holderKey, name, text, targeted: holderKey === targetKey });
				seen.add(groupKey);
			}
		}
	}
	return lines;
}

export function rollPlan(modifiers, { modifier = 0, advantage = {} } = {}) {
	const mods = modifiers || {};
	const flat = (mods.flat || []).reduce((total, { value }) => total + value, 0);
	const adv = { ...advantage };
	if (mods.advantage?.length) adv.advantage = true;
	if (mods.disadvantage?.length) adv.disadvantage = true;

	let auto;
	if (mods.autoFail?.length) auto = { result: "fail", names: mods.autoFail };
	else if (mods.autoSuccess?.length) auto = { result: "success", names: mods.autoSuccess };

	const before = [
		...(mods.advantage?.length ? [`Advantage: ${mods.advantage.join(", ")}`] : []),
		...(mods.disadvantage?.length ? [`Disadvantage: ${mods.disadvantage.join(", ")}`] : []),
		...(mods.flat || []).map(({ name, value }) => `${name}: ${signedText(value)}`),
	];
	const diceLines = (mods.dice || []).map(
		({ name, dice_count, dice_type, sign }) => `${name}: ${sign < 0 ? "−" : "+"}${dice_count}d${dice_type}`
	);
	const after = [
		...(mods.autoFail?.length ? [`Fails automatically: ${mods.autoFail.join(", ")}`] : []),
		...(mods.autoSuccess?.length ? [`Succeeds automatically: ${mods.autoSuccess.join(", ")}`] : []),
		...(mods.reminders || []),
		...(mods.usedUp || []),
		...(mods.assumptions || []),
	];
	// The highest floor of each kind (die, total), applied by rollD when the roll is lower
	const floor = {};
	for (const { name, value, appliesTo } of mods.floors || []) {
		if (!floor[appliesTo] || value > floor[appliesTo].value) floor[appliesTo] = { value, name };
	}
	const floorLines = Object.entries(floor).map(
		([appliesTo, { name, value }]) => `${name}: ${appliesTo === "total" ? "total" : "die"} at least ${value}`
	);
	const rerolls = mods.rerolls || [];
	const rerollLines = rerolls.map(({ name, condition }) => `${name}: reroll${condition ? ` on ${condition}` : ""}`);

	const notes = [...before, ...diceLines, ...after, ...floorLines, ...rerollLines];
	// For a roll's result the bonus dice are shown with their rolled values instead, and
	// floors and rerolls only when they apply to the rolled die (rollD)
	const roll_notes = [...before, ...after];
	const changed = !!(
		flat ||
		mods.dice?.length ||
		mods.advantage?.length ||
		mods.disadvantage?.length ||
		auto ||
		floorLines.length
	);
	return {
		m: (parseInt(modifier) || 0) + flat,
		flat,
		advantage: adv,
		bonus_dice: mods.dice || [],
		auto,
		consume: mods.consume || [],
		floor,
		rerolls,
		notes,
		roll_notes,
		changed,
	};
}
