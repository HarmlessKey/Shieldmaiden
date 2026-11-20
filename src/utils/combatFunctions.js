import { defenses } from "src/utils/generalConstants";

/**
 * The defense (v, r or i) of an entity against manual damage: the DM's choice, else the
 * entity's own for the damage type (magical or not)
 *
 * @returns {string|undefined}
 */
export function manualDefenseKey(manual, entity, defense) {
	if (defense !== undefined) return defense;
	let resistance;
	for (const [key, defense_type] of Object.entries(defenses)) {
		let resistances = entity[defense_type.value];
		resistances = resistances?.map((res) => {
			return manual.magical ? res : res.replace(/non_magical_/, "");
		});
		if (resistances?.includes(manual.type)) {
			resistance = key;
		}
	}
	return resistance;
}

/**
 * Calculates the manual damage after defenses and modifiers
 *
 * @param {number} value
 * @returns {number}
 */
export function calculateManualDamage(manual, entity, multiplier, defense) {
	multiplier = multiplier || 1;
	let value = manual.value * multiplier;

	defense = manualDefenseKey(manual, entity, defense);

	if (defense) {
		switch (defense) {
			case "v":
				value = value * 2;
				break;
			case "r":
				value = value * 0.5;
				break;
			case "i":
				value = value * 0;
				break;
		}
	}
	return Math.floor(value);
}
