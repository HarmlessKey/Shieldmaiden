import { db } from "src/firebase";
import { mapActions, mapGetters } from "vuex";
import { remindersMixin } from "src/mixins/reminders";
import { dropToOneFor } from "src/utils/effectFunctions";

export const setHP = {
	mixins: [remindersMixin],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
		};
	},
	firebase() {
		return {
			settings: {
				source: db.ref(`settings/${this.userId}/encounter`),
				asObject: true,
			},
		};
	},
	computed: {
		...mapGetters(["encounter", "demo", "test"]),
	},
	methods: {
		...mapActions([
			"set_save",
			"set_stable",
			"set_hp",
			"set_dead",
			"set_log",
			"set_meters",
			"fire_trigger",
		]),
		...mapActions("campaigns", ["update_damage_meters"]),

		/**
		 * Modifies the HP of a target and logs changes if needed
		 * @param {object} amounts Object with total healing and damage done values
		 * @param {object} target Full object of the target entity for whom HP will be modified
		 * @param {Object} current Full object of the entity that performs the action
		 * @param {object} config Hold options: crit, log, notify, undo, actions, defenses
		 *
		 * The config holds the actions array with all damage/healing actions from 1 ability/roll
		 * and an object with the defenses of the target
		 * This is for logging purposes, it holds information about damage types
		 */
		async setHP(amounts, target, current, config) {
			for (let [type, amount] of Object.entries(amounts)) {
				const int_amount = parseInt(amount);

				if (type === "damage") {
					await this.isDamage(int_amount, target, current, config);
				} else {
					await this.isHealing(int_amount, target, current, config);
				}
			}
		},

		/**
		 * Maximum of the main hit point pool, as changed by active effects (Aid, Exhaustion)
		 */
		effectiveMaxHp(target) {
			const effective = target?.key && this.$store.getters.effective_entity?.(target.key);
			return parseInt(effective ? effective.maxHp : target.maxHp);
		},
		/**
		 * The target's "drop to 1 instead" for this damage, if one applies: its damage types come
		 * from the config's actions (unknown for untyped damage)
		 *
		 * @returns {object|undefined} dropToOneFor's result
		 */
		dropToOneMatch(target, amount, config = {}) {
			const modifiers = target?.key && this.$store.getters.damage_modifiers?.(target.key);
			if (!modifiers?.dropToOne?.length) return undefined;
			const damageTypes = (config.actions || [])
				.flatMap((action) => (action.rolls || []).map((roll) => roll.damage_type))
				.filter(Boolean);
			return dropToOneFor({ dropToOne: modifiers.dropToOne, damageTypes, damage: amount });
		},
		async isDamage(amount, target, current, config) {
			var maxHp = this.effectiveMaxHp(target);
			var curHp = parseInt(target.curHp);
			var tempHp = parseInt(target.tempHp);
			var transCurHp = parseInt(target.transformedCurHp);
			var type = "damage";
			var over = 0;
			var rest_amount = amount;

			//Death saves at 0 hp, if automate is on
			if (
				curHp == 0 &&
				this.settings.automate !== false &&
				(target.entityType === "player" || target.entityType === "companion")
			) {
				var n = parseInt(Object.keys(target.saves).length);
				this.set_save({
					key: target.key,
					check: "fail",
					index: n,
				});
				if (config.crit) {
					n = parseInt(Object.keys(target.saves).length);

					this.set_save({
						key: target.key,
						check: "fail",
						index: n,
					});
				}
			}

			//First check if there is tempHp and put damage in there first.
			if (tempHp) {
				let newTemp = parseInt(tempHp - amount);

				//Adjust the rest amount
				rest_amount = newTemp < 0 ? -newTemp : 0;

				//Set the new HP
				this.set_hp({
					key: target.key,
					pool: "temp",
					newHp: newTemp,
				});
			}
			//Then check if the target is transformed and put rest damage in the transformation
			if (target.transformed == true) {
				var newTrans = parseInt(transCurHp - rest_amount);

				//Adjust the rest amount
				rest_amount = newTrans < 0 ? -newTrans : 0;

				//Set the new HP
				this.set_hp({
					key: target.key,
					pool: "transformed",
					newHp: newTrans,
				});
			}
			//If there is damage left after taking it from the tempHp and/or the transformation
			let heldAtOne;
			if (rest_amount > 0) {
				var newhp = parseInt(curHp - rest_amount);

				// Drop to 1 instead of 0 (Death Ward, Undead Fortitude): no death checks then
				if (curHp > 0 && newhp <= 0 && !config.undo) {
					heldAtOne = this.dropToOneMatch(target, amount, config);
					if (heldAtOne) newhp = 1;
				}

				if (newhp <= 0 && target.entityType !== "npc") {
					this.set_stable({
						key: target.key,
						action: "unset",
					});
				}

				//When there is an overkill
				if (newhp < 0) {
					newhp = 0;

					if (tempHp) {
						over = parseInt(rest_amount) + parseInt(tempHp) - parseInt(curHp); //overkill
						amount = parseInt(curHp) + parseInt(tempHp);
					} else {
						over = parseInt(rest_amount) - parseInt(curHp); //overkill
						amount = parseInt(curHp);
					}
					//Character dies if the overkill is >= maxHp
					if (
						over >= maxHp &&
						(target.entityType === "player" || target.entityType === "companion")
					) {
						this.set_dead({ key: target.key });
					}
				}
				this.set_hp({
					key: target.key,
					newHp: newhp,
				});
			}
			if (heldAtOne) {
				this.$store.dispatch("drop_to_one", { key: target.key, match: heldAtOne, damage: amount });
			}
			//Check if a reminder is triggered on damage taken
			if (amount > 0) {
				this.checkReminders(target, "damage");
			}

			// Effect triggers, on the main HP pool
			if (amount > 0 && !config.undo) {
				const after = newhp !== undefined ? newhp : curHp;
				const dropsToZero = curHp > 0 && after === 0;
				const event = {
					sourceKey: current?.key,
					amount,
					dropsToZero,
					damageTypes: (config.actions || [])
						.flatMap((action) => (action.rolls || []).map((roll) => roll.damage_type))
						.filter(Boolean),
				};
				this.fire_trigger({ trigger: "damage_taken", entityKey: target.key, event });
				if (current?.key) {
					this.fire_trigger({
						trigger: "damage_dealt",
						entityKey: current.key,
						event: { ...event, sourceKey: target.key },
					});
				}
				if (dropsToZero) {
					this.fire_trigger({ trigger: "on_zero_hp", entityKey: target.key, event });
				}
				if (curHp > maxHp / 2 && after <= maxHp / 2) {
					this.fire_trigger({ trigger: "on_bloodied", entityKey: target.key, event });
				}
			}

			//Notification
			if (config.notify) {
				this.$q.notify({
					message: "Damage done",
					caption: current.name + " did " + amount + " " + type + " to " + target.name,
					icon: "fas fa-swords",
					type: "negative",
					position: "top",
					timeout: 1000,
				});
			}

			//Add to log
			if (config.log) {
				this.addLog(type, config.crit, target, current, amount, over, config);
			}

			//Add to damagemeters
			//undo holds the value of ovherhealing, if there was any
			if (config.undo) {
				amount = -amount;
				over = config.undo !== true ? -config.undo : 0;
			}

			if (!config.undo) {
				await this.set_meters({ key: current.key, type: "damage", amount }); //Damage done
				await this.set_meters({ key: current.key, type: "overkill", amount: over }); //Over damage done
				await this.set_meters({ key: target.key, type: "damageTaken", amount }); //Damage taken
				await this.set_meters({ key: target.key, type: "overkillTaken", amount: over }); //Over damage taken

				// Campaign wide damage meters (no need to go through store)
				// Damage done by players
				if (["player", "companion"].includes(current.entityType)) {
					await this.damageMeters(current.key, "damage", amount, current.entityType); //Damage done
					await this.damageMeters(current.key, "overkill", over, current.entityType); //Over damage done
				}

				// Damage taken by players
				if (["player", "companion"].includes(target.entityType)) {
					await this.damageMeters(target.key, "damageTaken", amount, target.entityType); //damage taken
					await this.damageMeters(target.key, "overkillTaken", over, target.entityType); //Over damage taken
				}
			}
			//To undo, run same function with opposite types
			else {
				await this.set_meters({ key: current.key, type: "healing", amount }); //Undo damage done
				await this.set_meters({ key: current.key, type: "overhealing", amount: over }); //Undo Over damage done
				await this.set_meters({ key: target.key, type: "healingTaken", amount }); //Undo damage taken
				await this.set_meters({ key: target.key, type: "overhealingTaken", amount: over }); //Undo Over damage taken

				// Campaign wide damage meters (no need to go through store)
				// Undo damage done by players
				if (["player", "companion"].includes(current.entityType)) {
					await this.damageMeters(current.key, "healing", amount, current.entityType); //Undo Damage done
					await this.damageMeters(current.key, "overhealing", over, current.entityType); //Undo Over damage done
				}
				if (["player", "companion"].includes(target.entityType)) {
					await this.damageMeters(target.key, "healingTaken", amount, target.entityType); //Undo damage taken
					await this.damageMeters(target.key, "overhealingTaken", over, target.entityType); //Undo Over damage taken
				}
			}
		},
		async isHealing(amount, target, current, config) {
			let maxHp;
			let curHp;
			let pool;
			if (target.transformed == true) {
				maxHp = parseInt(target.transformedMaxHp);
				curHp = parseInt(target.transformedCurHp);
				pool = "transformed";
			} else {
				maxHp = this.effectiveMaxHp(target);
				curHp = parseInt(target.curHp);
				pool = "";
			}
			// Effects that limit healing (No Healing: can't regain hit points)
			if (!config.undo) {
				const limit = target?.key && this.$store.getters.healing_received_cap?.(target.key);
				if (limit?.cap !== undefined && amount > limit.cap) {
					this.$q.notify({
						message: limit.cap ? "Healing limited" : "Can't regain hit points",
						caption: `${target.name}: ${limit.names.join(", ")}${limit.possible.length ? " (if its condition holds)" : ""}`,
						icon: "fas fa-heart-broken",
						type: "warning",
						position: "top",
					});
					amount = limit.cap;
				}
			}
			let newhp = parseInt(curHp + amount);
			let type = "healing";
			let over = 0;

			//If the target is a player and the curHp was 0, saves need to be reset
			if ((target.entityType === "player" || target.entityType === "companion") && curHp === 0) {
				this.set_save({
					key: target.key,
					check: "reset",
				});
				this.set_dead({
					key: target.key,
					action: "unset",
				});
			}

			if (newhp > maxHp) {
				newhp = maxHp;
				over = amount - maxHp + curHp; //overhealing
				amount = maxHp - curHp;
			}

			//Heal the target
			this.set_hp({
				key: target.key,
				pool: pool,
				newHp: newhp,
			});

			// Effect trigger
			if (amount > 0 && !config.undo) {
				this.fire_trigger({
					trigger: "on_heal",
					entityKey: target.key,
					event: { sourceKey: current?.key, amount },
				});
			}

			//Notification
			if (config.notify) {
				this.$q.notify({
					message: "Healing done!",
					caption: current.name + " did " + amount + " " + type + " to " + target.name,
					icon: "fas fa-heart",
					type: "positive",
					position: "top",
					timeout: 1000,
					classes: "inEncounter",
				});
			}
			//Add to log
			if (config.log) {
				this.addLog(type, false, target, current, amount, over, config);
			}

			//Add to damagemeters
			//undo holds the value of overdamage, if there was any
			if (config.undo) {
				amount = -amount;
				over = config.undo !== true ? -config.undo : 0;
			}

			// Update the healing meters

			if (!config.undo) {
				// Meters for the encounter
				await this.set_meters({ key: current.key, type: "healing", amount }); //Healing done
				await this.set_meters({ key: current.key, type: "overhealing", amount: over }); //Over healing done
				await this.set_meters({ key: target.key, type: "healingTaken", amount }); //Healing taken
				await this.set_meters({ key: target.key, type: "overhealingTaken", amount: over }); //Over healing taken

				// Campaign wide healing meters (no need to go through store)
				// Healing done by players
				if (["player", "companion"].includes(current.entityType)) {
					await this.damageMeters(current.key, "healing", amount, current.entityType); //Healing done
					await this.damageMeters(current.key, "overhealing", over, current.entityType); //Over healing done
				}

				// Healing taken by players
				if (["player", "companion"].includes(target.entityType)) {
					await this.damageMeters(target.key, "healingTaken", amount, target.entityType); //Healing taken
					await this.damageMeters(target.key, "overhealingTaken", over, target.entityType); //Over healing taken
				}
			}
			// To undo, run same function with opposite types
			else {
				await this.set_meters({ key: current.key, type: "damage", amount }); //Undo Healing done
				await this.set_meters({ key: current.key, type: "overkill", amount: over }); //Undo Over Healing done
				await this.set_meters({ key: target.key, type: "damageTaken", amount }); //Undo Healing taken
				await this.set_meters({ key: target.key, type: "overkillTaken", amount: over }); //Undo Over Healing taken

				// Campaign wide healing meters (no need to go through store)
				// Undo healing done by players
				if (["player", "companion"].includes(current.entityType)) {
					await this.damageMeters(current.key, "damage", amount, current.entityType); //Undo Healing done
					await this.damageMeters(current.key, "overkill", over, current.entityType); //Undo Over healing done
				}

				// Undo healing taken by players
				if (["player", "companion"].includes(target.entityType)) {
					await this.damageMeters(target.key, "damageTaken", amount, target.entityType); //Undo Healing taken
					await this.damageMeters(target.key, "overkillTaken", over, target.entityType); //Undo overhealing taken
				}
			}
		},
		addLog(type, crit, target, current, amount, over, config) {
			const d = new Date();
			const time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

			if (localStorage.getItem(this.encounterId)) {
				this.log = JSON.parse(localStorage.getItem(this.encounterId));
			} else {
				this.log = [];
			}

			const newLog = {
				round: this.encounter.round,
				turn: this.encounter.turn + 1,
				by: current.key,
				by_name: current.name,
				target: target.key,
				target_name: target.name,
				time: time,
				type: type,
				crit: crit,
				damageType: this.damageType,
				amount: amount,
				over: over,
				actions: config.actions,
				defenses: config.defenses,
				ability: config.ability,
				multiplier: config.multiplier,
			};

			this.set_log({
				action: "set",
				value: newLog,
			});
		},
		async damageMeters(key, type, amount, entityType) {
			if (!this.demo && !this.test) {
				await this.update_damage_meters({
					campaignId: this.campaignId,
					entityType,
					id: key,
					property: type,
					value: amount,
				});
			}
		},
	},
};
