import { dice } from "src/mixins/dice.js";
import { mapActions, mapGetters } from "vuex";

export const runEncounter = {
	mixins: [dice],
	computed: {
		...mapGetters(["entities", "broadcast"]),
		_share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("action_rolls")) || false;
		},
	},
	methods: {
		...mapActions(["setActionRoll", "set_limitedUses"]),
		...mapActions("campaigns", ["set_share"]),
		roll_action({ e, action_index, action, category, entity, targets, versatile = undefined }) {
			let roll;
			const config = {
				type: "monster_action",
				versatile,
			};

			// Roll once for AOE
			if (action.aoe_type) {
				roll = this.rollAction(e, action, config);
				if (this._share) this.shareRoll(roll, entity, targets);
			}

			// Check for limited uses
			if (action.limit || action.recharge) {
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

			for (const key of targets) {
				let newRoll = { ...roll };

				// Reroll for each target if it's not AOE
				if (!action.aoe_type) {
					newRoll = this.rollAction(e, action, config);
					if (this._share) this.shareRoll(newRoll, entity, [key]);
				}

				// Set the target and current
				this.$set(newRoll, "target", this.entities[key]);
				this.$set(newRoll, "current", entity);

				this.setActionRoll(newRoll);
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
						roll: item.modifierRoll.roll,
						total: item.modifierRoll.total,
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
