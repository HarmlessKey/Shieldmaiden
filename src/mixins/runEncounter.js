import { dice } from "src/mixins/dice.js";
import { restrictionsMixin } from "src/mixins/restrictions.js";
import { mapActions, mapGetters } from "vuex";
import { findSrdDefinition, linkApplication } from "src/utils/effectFunctions";

// Action types with a to-hit roll
const ATTACK_ACTION_TYPES = ["melee_weapon", "ranged_weapon", "spell_attack"];

/**
 * A spell cast as its roll carries it (effects 7): the spell, the slot, the caster's level and
 * spell save DC
 *
 * @param {object} spell The rolled spell, with its key
 * @param {object} config rollAction's config: cast_level, caster_level, save_dc
 * @returns {object} { spell: { key, name, level, scaling }, castLevel, casterLevel, saveDc }
 */
export function spellCast(spell = {}, config = {}) {
	const toNumber = (value) => (Number.isFinite(parseInt(value)) ? parseInt(value) : undefined);
	return {
		spell: { key: spell.key, name: spell.name, level: toNumber(spell.level), scaling: spell.scaling },
		castLevel: toNumber(config.cast_level),
		casterLevel: toNumber(config.caster_level),
		saveDc: toNumber(config.save_dc),
	};
}

export const runEncounter = {
	mixins: [dice, restrictionsMixin],
	computed: {
		...mapGetters(["entities", "broadcast"]),
		_share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("action_rolls")) || false;
		},
	},
	methods: {
		...mapActions(["setActionRoll", "set_limitedUses"]),
		...mapActions("campaigns", ["set_share"]),
		/**
		 * Rolls an action or spell in run encounter
		 *
		 * @param {Event} e Event
		 * @param {number} action_index or spell_level used to track limited uses
		 * @param {object} action full action or spell
		 * @param {category} action actions | reactions | legendary_actions | special_abilities | innate | caster
		 * @param {object} entity the caster of the action
		 * @param {array|object} targets array of keys or object with { [key]: projectile_count }
		 * @param {string} option if an action/spell has options, this is the selected option
		 */
		roll_action(args) {
			// Restricted (Stunned, Slow's reactions, Charmed against the charmer): the DM confirms
			const { action, category, entity, targets } = args;
			const actionList = action.action_list || action.actions || [];
			this.confirmRestrictions({
				entity,
				targets: Array.isArray(targets) ? targets : Object.keys(targets || {}),
				category,
				attack: actionList.some(({ type }) => ATTACK_ACTION_TYPES.includes(type)),
			}).then((confirmed) => {
				if (confirmed) this.doRollAction(args);
			});
		},
		/**
		 * A spell's roll config: spell attack and save DC as changed by the caster's active
		 * effects, the caster's level, and the level it's cast at (innate spells at their
		 * assigned level, falling back to the lowest possible level)
		 */
		spellConfig({ action, action_index, category, entity }) {
			const caster = this.$store.getters.effective_entity?.(entity.key) || entity;
			return {
				attack_bonus: caster[`${category}_spell_attack`],
				caster_level: entity[`${category}_level`],
				save_dc: caster[`${category}_save_dc`],
				cast_level: category === "innate" ? (action.cast_level ?? action.level) : action_index,
			};
		},
		/**
		 * Casts a spell that only applies effects (applyOnlySpell, effects 7): like a roll it
		 * confirms restrictions, uses the reaction out of turn and the slot, then applies its
		 * linked effects to every target without a roll card. A link that leaves a choice open
		 * or has no duration makes it a roll, so the roll card asks for them.
		 *
		 * @param {number} action_index Spell level (caster) or spell key (innate), for limited uses
		 * @param {object} action The spell, with its key
		 * @param {string} category innate | caster
		 * @param {object} entity The caster
		 * @param {string[]} targets Keys of the targets
		 */
		async apply_spell({ e, action_index, action, category, entity, targets = [] }) {
			const confirmed = await this.confirmRestrictions({ entity, targets, category, attack: false });
			if (!confirmed) return;

			const config = this.spellConfig({ action, action_index, category, entity });
			const cast = spellCast(action, config);
			const edition = this.$store.getters.edition || "5.5e";
			const uid = this.$store.getters.user?.uid;
			const items = [];
			for (const spellAction of action.actions || []) {
				for (const link of spellAction?.effects?.always || []) {
					const effect = link.effect || {};
					let definition;
					if (effect.source === "srd") {
						definition =
							findSrdDefinition(edition, effect.source_key) ||
							findSrdDefinition(edition === "5e" ? "5.5e" : "5e", effect.source_key);
					} else if (effect.source === "custom" && uid) {
						definition = await this.$store
							.dispatch("effects/get_effect", { uid, id: effect.source_key })
							.catch(() => undefined);
					}
					const item = linkApplication(link, { cast, definition });
					// Something to ask: the roll card asks for it
					if (item.openChoices.length || !link.duration) {
						return this.doRollAction({ e, action_index, action, category, entity, targets });
					}
					items.push({ ...item, definition: definition || undefined });
				}
			}

			this.$store
				.dispatch("use_reaction", { actorKey: entity?.key, category })
				.catch((error) => console.error(error));
			if (action.limit || action.recharge || action_index) {
				this.set_limitedUses({ key: entity.key, index: action_index, category });
			}
			for (const targetKey of targets) {
				await this.$store.dispatch("apply_linked_effects", {
					targetKey,
					casterKey: entity.key,
					items,
					cast,
				});
			}
			const names = targets.map((key) => (this.entities[key]?.name || "").capitalizeEach()).join(", ");
			this.$q.notify({
				message: `${(action.name || "").capitalizeEach()} applied`,
				caption: names,
				color: "positive",
				position: "top",
				timeout: 1500,
			});
		},
		/**
		 * Rolls an action or spell (roll_action without the restriction check)
		 */
		doRollAction({ e, action_index, action, category, entity, targets, option = undefined }) {
			let roll;
			const is_spell = ["innate", "caster"].includes(category);
			const config = {
				type: is_spell ? "spell" : "monster_action",
				option,
				// For the attacker's and target's effects on attack rolls (rollAction)
				attackerKey: entity?.key,
				// Single-use modifiers used by earlier rolls of this action (projectiles, targets)
				consumed: [],
			};

			// Acting out of turn uses the actor's reaction (once, however many targets)
			this.$store
				.dispatch("use_reaction", { actorKey: entity?.key, category })
				.catch((error) => console.error(error));

			// Create projectile object if target = array
			if (Array.isArray(targets)) {
				targets = targets.reduce((acc, cur) => ({ ...acc, [cur]: 1 }), {});
			}

			if (is_spell) {
				action.action_list = action.actions;
				Object.assign(config, this.spellConfig({ action, action_index, category, entity }));
			}
			// The spell cast, for applying its linked effects: scaling, save DC, Concentration (effects 7)
			const cast = is_spell ? spellCast(action, config) : undefined;

			// Roll once for AOE
			if (action.aoe_type) {
				roll = this.rollAction(e, action, config);
				if (this._share) this.shareRoll(roll, entity, targets);
			}

			// Check for limited uses
			if (action.limit || action.recharge || (is_spell && action_index)) {
				this.set_limitedUses({
					key: entity.key,
					index: action_index,
					category,
				});
			}
			if (action.legendary_cost) {
				this.set_limitedUses({
					key: entity.key,
					index: "legendaries_used",
					category,
					cost: action.legendary_cost,
				});
			}

			for (const [key, projectiles] of Object.entries(targets)) {
				for (let i = 1; i <= projectiles; i++) {
					let newRoll = { ...roll };

					// Reroll for each target if it's not AOE
					if (!action.aoe_type || action.aoe_type === "none") {
						newRoll = this.rollAction(e, action, { ...config, targetKey: key });
						if (this._share) this.shareRoll(newRoll, entity, [key]);
					}

					// Set the target and current
					this.$set(newRoll, "target", this.entities[key]);
					this.$set(newRoll, "current", entity);
					if (cast) this.$set(newRoll, "cast", cast);

					this.setActionRoll(newRoll);
				}
			}
		},
		shareRoll(roll, entity, targets) {
			const key = Date.now() + Math.random().toString(36).substring(4);
			let share = {
				key,
				type: "action_roll",
				entity_key: entity.key,
				encounter_id: this.encounterId,
				notification: {
					title: roll.name,
					targets,
					actions: [],
				},
			};
			roll.actions.forEach((action, action_index) => {
				const type = action.type === "healing" ? "healing" : "damage";

				share.notification.actions[action_index] = {
					rolls: [],
					type,
				};
				// To hit
				if (action.toHit) {
					const toHit = action.toHit;
					share.notification.actions[action_index].toHit = {
						roll: toHit.roll,
						total: toHit.total,
					};
					if (toHit.ignored)
						share.notification.actions[action_index].toHit.advantage_disadvantage = this.advantage(
							toHit.advantage_disadvantage
						);
				}

				//Rolls
				action.rolls.forEach((item, roll_index) => {
					share.notification.actions[action_index].rolls[roll_index] = {
						damage_type: item.damage_type || null,
						roll: item.rollResult.roll,
						total: item.rollResult.total,
					};
				});
			});
			this.set_share({ id: this.broadcast.live, share });
		},
		advantage(input) {
			return Object.keys(input)[0].charAt(0);
		},
	},
};
