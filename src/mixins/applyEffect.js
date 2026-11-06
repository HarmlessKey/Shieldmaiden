import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import { buildEffectInstance } from "src/utils/effectFunctions.js";

/**
 * Applying an effect to entities in the tracker, as the Effects drawer does (effects 12, moved
 * from drawers/encounter/Effects.vue for the bonuses drawer): the caster options and default
 * caster, the caster's Concentration, and applying with a Concentration plan.
 */
export const applyEffectMixin = {
	computed: {
		...mapGetters(["entities", "round", "turn", "turn_order", "actor"]),
		/**
		 * Key of the entity whose turn it is, ordered like RunEncounter's _active.
		 * Nobody has the turn before combat starts.
		 */
		turnEntityKey() {
			if (!this.round) return undefined;
			return this.turn_order[this.turn];
		},
		/**
		 * Key of the acting entity, the default caster: the actor selected out of turn,
		 * else the entity whose turn it is. The Environment acts without a caster.
		 */
		actorEntityKey() {
			if (!this.round) return undefined;
			if (this.actor) {
				return this.actor.key in this.entities ? this.actor.key : undefined;
			}
			return this.turnEntityKey;
		},
		/**
		 * Caster options: the entities in initiative order, then the rest
		 */
		casters() {
			const keys = _.uniq([...(this.turn_order || []), ...Object.keys(this.entities)]).filter(
				(key) => this.entities[key]
			);
			return keys.map((key) => ({
				label: (this.entities[key].name || key).capitalizeEach(),
				value: key,
			}));
		},
	},
	methods: {
		...mapActions(["apply_effect", "concentrate_on"]),
		/**
		 * A caster's active Concentration instance: { key, for }, or undefined
		 */
		casterConcentration(casterKey) {
			const effects = this.entities[casterKey]?.effects || {};
			const key = Object.keys(effects).find(
				(k) => effects[k].source === "srd" && effects[k].source_key === "concentration"
			);
			return key ? { key, for: effects[key].concentration_for } : undefined;
		},
		/**
		 * Carries out a Concentration plan for the caster (concentrationPlan) with the store's
		 * concentrate_on, shared with effects applied from rolls
		 *
		 * @returns {string|undefined} Key of the Concentration to link to, undefined when it failed
		 */
		concentrateOn({ entry, plan, casterKey, duration = {} }) {
			return this.concentrate_on({
				casterKey,
				plan,
				concentrationFor: { source: entry.source, source_key: entry.sourceKey, name: entry.name },
				duration,
				turnKey: this.turnEntityKey,
			});
		},
		/**
		 * Applies an effect to entities. The caster is the application's caster_key (the form's
		 * select; undefined for None), or the acting entity without the form.
		 * A Concentration plan is carried out first, so the instances can link to it.
		 *
		 * @param {object} entry { source, sourceKey, name }
		 * @param {object} definition The effect's definition
		 * @param {object} application The apply form's application
		 * @param {string[]} keys Entities to apply it to
		 */
		async applyEffectTo({ entry, definition, application, keys }) {
			const { caster_key, concentration: plan, ...rest } = application;
			const casterKey = Object.prototype.hasOwnProperty.call(application, "caster_key")
				? caster_key
				: this.actorEntityKey;

			let concentration_id = rest.concentration_id;
			if (casterKey && plan && plan.action !== "none") {
				concentration_id = await this.concentrateOn({
					entry,
					plan,
					casterKey,
					duration: rest.duration,
				});
				// The caster's Concentration couldn't be saved
				if (!concentration_id) return;
			}

			for (const key of keys) {
				const instance = buildEffectInstance({
					definition: { ...definition, name: entry.name },
					source: entry.source,
					sourceKey: entry.sourceKey,
					application: { ...rest, concentration_id },
					round: this.round,
					casterKey,
					casterName: this.entities[casterKey]?.name,
					turnKey: this.turnEntityKey,
				});
				this.apply_effect({ key, instance, definition });
			}
		},
	},
};
