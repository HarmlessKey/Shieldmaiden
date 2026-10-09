import { applyDamageModifiers } from "src/utils/effectFunctions";
import { manualDefenseKey } from "src/utils/combatFunctions";

// Multiplier of a defense key
const DEFENSE_MULTIPLIERS = { v: 2, r: 0.5, i: 0 };

/**
 * Manual damage with the targets' damage modifiers: reduce / halve / negate offered as
 * checkboxes (off by default) before the damage is applied, and Absorb applied by itself.
 * For the actor panel's and the legacy actions panel's manual input.
 */
export const damageModifiersMixin = {
	methods: {
		/**
		 * The targets' toggles that apply to a damage type; without a type every toggle is offered
		 *
		 * @param {string[]} targets Target keys
		 * @param {string} damageType The manual damage type, if chosen
		 * @param {string} attackerKey The actor, for conditions on the attacker
		 * @returns {object[]} [{ key, toggle }]
		 */
		manualDamageToggles(targets = [], damageType, attackerKey) {
			const items = [];
			for (const key of targets) {
				const modifiers = this.$store.getters.damage_modifiers?.(key, attackerKey);
				for (const toggle of modifiers?.toggles || []) {
					if (damageType && toggle.damageTypes && !toggle.damageTypes.includes(damageType)) continue;
					if (damageType && toggle.exceptTypes?.includes(damageType)) continue;
					items.push({ key, toggle });
				}
			}
			return items;
		},
		/**
		 * Asks which toggles the targets use. Reductions are rolled for the checked ones.
		 * Resolves { [targetKey]: { [toggleId]: amount | true } }, or null when cancelled.
		 *
		 * @param {object[]} items manualDamageToggles' result
		 * @returns {Promise<object|null>}
		 */
		confirmDamageToggles(items = []) {
			if (!items.length) return Promise.resolve({});
			const entities = this.$store.getters.entities || {};
			return new Promise((resolve) => {
				this.$q
					.dialog({
						title: "Damage modifiers",
						message: "Switch on what the targets use. Reductions are rolled.",
						options: {
							type: "checkbox",
							model: [],
							items: items.map(({ key, toggle }, index) => ({
								label: `${(entities[key]?.name || "Target").capitalizeEach()}: ${toggle.text}${
									toggle.notes.length ? ` (${toggle.notes.join(", ")})` : ""
								}`,
								value: index,
							})),
						},
						// Quasar's dark dialogs default to amber
						color: "primary",
						cancel: { label: "Cancel", color: "neutral-5", unelevated: true, noCaps: true },
						persistent: true,
						ok: { label: "Apply", color: "primary", noCaps: true },
						dark: this.$store.getters.theme === "dark",
					})
					.onOk((selected = []) => {
						const active = {};
						for (const index of selected) {
							const { key, toggle } = items[index];
							active[key] = active[key] || {};
							active[key][toggle.id] = toggle.kind === "reduce" ? this.rollReduction(toggle) : true;
						}
						resolve(active);
					})
					.onCancel(() => resolve(null));
			});
		},
		/**
		 * The amount of a reduction: its dice and fixed value, or its value
		 */
		rollReduction(toggle) {
			if (!toggle.roll) return toggle.value || 0;
			let total = toggle.roll.fixed_val || 0;
			for (let i = 0; i < toggle.roll.dice_count; i++) total += Math.ceil(Math.random() * toggle.roll.dice_type);
			return total;
		},
		/**
		 * A target's manual damage after its damage modifiers: the DM's multiplier, the
		 * switched-on toggles, Absorb, then its defenses (or the DM's chosen defense)
		 *
		 * @param {object} manual { value, type, magical }
		 * @param {string} key The target
		 * @param {object} entity The target with its effects' defenses
		 * @param {number} multiplier The DM's multiplier for the target
		 * @param {string} defense The DM's chosen defense for the target
		 * @param {object} active Switched-on toggles of the target
		 * @param {string} attackerKey The actor
		 * @returns {object} { damage, healing, notes }
		 */
		manualDamageWithModifiers({ manual, key, entity, multiplier, defense, active = {}, attackerKey }) {
			const defenseKey = manualDefenseKey(manual, entity, defense);
			return applyDamageModifiers({
				parts: [{ damageType: manual.type, amount: manual.value, factor: multiplier || 1 }],
				modifiers: this.$store.getters.damage_modifiers?.(key, attackerKey) || {},
				active,
				defenseOf: () => (defenseKey ? DEFENSE_MULTIPLIERS[defenseKey] : 1),
			});
		},
	},
};
