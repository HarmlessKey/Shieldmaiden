import { escapeHtml } from "src/mixins/dice.js";
import { rollRestrictions } from "src/utils/effectFunctions";

// What a restriction kind stops
const RESTRICTION_VERBS = {
	action: "take actions",
	bonus_action: "take bonus actions",
	reaction: "take reactions",
};

/**
 * Asking the DM to confirm when an actor's effects restrict what it's about to do (Stunned:
 * no actions, Slow: no reactions, Charmed: no attacks on the charmer). For rolled actions
 * and spells, and manual damage or healing.
 */
export const restrictionsMixin = {
	methods: {
		/**
		 * The actor's restrictions that apply: its actions, bonus actions or reactions (when
		 * another entity has the turn), and attacks on the targets
		 *
		 * @param {object} entity The actor
		 * @param {string[]} targets Target keys
		 * @param {string} category roll_action's category; "actions" for manual input
		 * @param {boolean} attack Whether it attacks the targets (a to-hit, or manual damage)
		 * @returns {object[]} rollRestrictions' matches
		 */
		actorRestrictions({ entity, targets = [], category, attack = false }) {
			const getters = this.$store.getters;
			if (!entity?.key || !getters.restrictions) return [];
			const turnKey = getters.round > 0 ? getters.turn_order?.[getters.turn] : undefined;
			const outOfTurn = !!turnKey && turnKey !== entity.key;
			const perTarget = {};
			if (attack) {
				for (const key of targets) perTarget[key] = getters.restrictions(entity.key, key);
			}
			return rollRestrictions({
				own: getters.restrictions(entity.key),
				perTarget,
				category,
				outOfTurn,
				attack,
			});
		},
		/**
		 * Resolves true when nothing restricts the actor or the DM confirms, false when the DM
		 * cancels
		 *
		 * @param {string} okLabel "Roll anyway" for rolls, "Apply anyway" for manual input
		 * @returns {Promise<boolean>}
		 */
		confirmRestrictions({ entity, targets, category, attack, okLabel = "Roll anyway" }) {
			const matches = this.actorRestrictions({ entity, targets, category, attack });
			if (!matches.length) return Promise.resolve(true);

			const actorName = (entity?.name || "It").capitalizeEach();
			const entities = this.$store.getters.entities || {};
			const lines = [
				...new Set(
					matches.map(({ kind, name, possible, targetKey }) => {
						const verb =
							kind === "attack"
								? `attack ${(entities[targetKey]?.name || "this target").capitalizeEach()}`
								: RESTRICTION_VERBS[kind];
						return `${name}: ${possible ? "may not" : "can't"} ${verb}`;
					})
				),
			];
			return new Promise((resolve) => {
				this.$q
					.dialog({
						title: `${actorName} is restricted`,
						message: `${lines.map(escapeHtml).join("<br />")}<br /><br />${okLabel}?`,
						html: true,
						// Quasar's dark dialogs default to amber
						color: "primary",
						cancel: { label: "Cancel", color: "neutral-5", unelevated: true, noCaps: true },
						persistent: true,
						ok: { label: okLabel, color: "primary", noCaps: true },
						dark: this.$store.getters.theme === "dark",
					})
					.onOk(() => resolve(true))
					.onCancel(() => resolve(false));
			});
		},
	},
};
