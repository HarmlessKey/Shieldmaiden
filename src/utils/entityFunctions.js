/**
 * Return display stats of an entity.
 * Pass the effective entity (store getter effective_entity): its AC already holds the
 * effect modifiers and manual bonuses.
 *
 * @param {object} entity
 */
export function displayStats(entity) {
	if (!entity) return {};

	const initiative = entity.initiative_modifier;

	const stats = {
		speed: entity.speed || entity.walk_speed,
		initiative_modifier: initiative > 0 ? `+${initiative}` : initiative,
	};
	if (entity.transformed) {
		stats.ac = entity.transformedAc;
		stats.maxHpMod = entity.transformedMaxHpMod;
		stats.maxHp = entity.transformedMaxHp;
		stats.curHp = entity.transformedCurHp;
	} else {
		stats.ac = entity.ac || entity.armor_class || 0;
		stats.maxHp = entity.maxHp || entity.hit_points;
		stats.curHp = entity.curHp;
	}
	return stats;
}

import { abilities, skills } from "src/utils/generalConstants.js";

/**
 * Manual bonus key of a skill: "skill_" + the skill in lower case with spaces as underscores
 *
 * @param {string} skill Skill value, e.g. "animal Handling"
 * @returns {string} e.g. "skill_animal_handling"
 */
export function skillBonusKey(skill) {
	return `skill_${String(skill).toLowerCase().replace(/ /g, "_")}`;
}

const upperFirst = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Manual roll bonuses: per skill, checks and saves per ability and all, death and Concentration
// saves, and attacks (to hit) and their damage
const ROLL_BONUS_LABELS = {
	attack: "Attacks",
	damage: "Damage",
	...Object.fromEntries(Object.values(skills).map(({ value, skill }) => [skillBonusKey(value), skill])),
	...Object.fromEntries(abilities.map((ability) => [`check_${ability}`, `${upperFirst(ability)} checks`])),
	check_all: "All ability checks",
	...Object.fromEntries(abilities.map((ability) => [`save_${ability}`, `${upperFirst(ability)} saves`])),
	save_all: "All saving throws",
	death_save: "Death saves",
	concentration_save: "Concentration saves",
};

/**
 * Values that can have manual bonuses, keyed like effect sub-types (ability scores by
 * ability name), with their names
 */
export const BONUS_LABELS = Object.freeze({
	ac: "Armor Class",
	max_hp: "Hit Point Maximum",
	speed: "Speed",
	fly_speed: "Fly Speed",
	swim_speed: "Swim Speed",
	climb_speed: "Climb Speed",
	burrow_speed: "Burrow Speed",
	initiative: "Initiative",
	passive_perception: "Passive Perception",
	spell_save_dc: "Spell Save DC",
	spell_attack: "Spell Attack",
	strength: "Strength",
	dexterity: "Dexterity",
	constitution: "Constitution",
	intelligence: "Intelligence",
	wisdom: "Wisdom",
	charisma: "Charisma",
	...ROLL_BONUS_LABELS,
});
export const BONUS_VALUES = Object.freeze(Object.keys(BONUS_LABELS));

// Id of the bonus labelled "Manual": old single-value bonuses and single-value inputs
export const MANUAL_BONUS_ID = "manual";

/**
 * Manual bonuses of saved entity data: its `bonuses`, and for values without them the old
 * single-value `ac_bonus` / `maxHpMod` as a bonus labelled "Manual"
 *
 * @param {object} data Entity data (encounter entity, or campaign player / companion)
 * @returns {object} { <value>: { <id>: { value, label } } }, only values with bonuses
 */
export function manualBonuses(data = {}) {
	const bonuses = {};
	for (const [key, list] of Object.entries(data?.bonuses || {})) {
		if (!BONUS_VALUES.includes(key) || !list || typeof list !== "object") continue;
		const entries = {};
		for (const [id, bonus] of Object.entries(list)) {
			const value = parseInt(bonus?.value);
			if (Number.isFinite(value)) entries[id] = { value, label: bonus.label || "Manual" };
		}
		if (Object.keys(entries).length) bonuses[key] = entries;
	}
	for (const [key, field] of [
		["ac", "ac_bonus"],
		["max_hp", "maxHpMod"],
	]) {
		const value = parseInt(data?.[field]);
		if (!bonuses[key] && value) bonuses[key] = { [MANUAL_BONUS_ID]: { value, label: "Manual" } };
	}
	return bonuses;
}

/**
 * Total of the manual bonuses of one value
 *
 * @param {object} data Entity data, see manualBonuses
 * @param {string} key Value key, e.g. "ac" or "max_hp"
 * @returns {number}
 */
export function manualBonusTotal(data, key) {
	return Object.values(manualBonuses(data)[key] || {}).reduce((total, bonus) => total + bonus.value, 0);
}

/**
 * Manual bonuses of saved entity data with the "Manual" bonus of one value set; 0 or empty
 * removes it. Old single-value bonuses are converted. Values without bonuses are left out.
 *
 * @param {object} data Entity data, see manualBonuses
 * @param {string} key Value key, e.g. "ac"
 * @param {number} amount
 * @returns {object} New bonuses object, for saving as `bonuses` (empty: save null)
 */
export function withManualBonus(data, key, amount) {
	const bonuses = JSON.parse(JSON.stringify(manualBonuses(data)));
	const list = bonuses[key] || {};
	const value = parseInt(amount);
	if (value) list[MANUAL_BONUS_ID] = { value, label: "Manual" };
	else delete list[MANUAL_BONUS_ID];
	if (Object.keys(list).length) bonuses[key] = list;
	else delete bonuses[key];
	return bonuses;
}

/**
 * Current hit points after the maximum changed: a higher maximum raises them by the same
 * amount, a lower one only lowers them to the new maximum
 *
 * @param {number} curHp
 * @param {number} oldMax
 * @param {number} newMax
 * @returns {number}
 */
export function hpAfterMaxHpChange(curHp, oldMax, newMax) {
	curHp = parseInt(curHp) || 0;
	newMax = Math.max(0, parseInt(newMax) || 0);
	const delta = newMax - (parseInt(oldMax) || 0);
	return delta > 0 ? Math.min(curHp + delta, newMax) : Math.min(curHp, newMax);
}
