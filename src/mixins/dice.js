import { mapActions, mapGetters } from "vuex";

export const dice = {
	data() {
		return {
			animateTrigger: false,
			rolled: 0,
		};
	},
	computed: {
		...mapGetters(["broadcast"]),
		critSettings() {
			if (this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical;
			}
			return undefined; // Default = undefined = roll twice
		},
		dice_types() {
			return [
				{ value: 4, text: "d4", average: this.calcAverage(4) },
				{ value: 6, text: "d6", average: this.calcAverage(6) },
				{ value: 8, text: "d8", average: this.calcAverage(8) },
				{ value: 10, text: "d10", average: this.calcAverage(10) },
				{ value: 12, text: "d12", average: this.calcAverage(12) },
			];
		},
	},
	watch: {
		animateTrigger() {
			this.animateValue("roll", 0, this.rolled, 500);
			this.rolled = 0;
		},
	},
	methods: {
		...mapActions(["setRoll"]),
		...mapActions("campaigns", ["set_share"]),
		rollD(
			e,
			d = 20,
			n = 1,
			m = 0,
			title,
			entity_name = undefined,
			notify = false,
			advantage_disadvantage = {},
			share = null
		) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b;
			let throws = [];
			let ignored = undefined;

			//Check for advantage with advantage or disadvantage when a single d20 is rolled
			if (
				n === 1 &&
				d === 20 &&
				(e.shiftKey || e.ctrlKey || Object.keys(advantage_disadvantage).length > 0)
			) {
				if (e.shiftKey || e.ctrlKey) {
					const type = e.shiftKey ? "advantage" : "disadvantage";
					advantage_disadvantage[type] = true;
				}

				//Only roll with advantage/disadvantage if only 1 is present they cancel eachother out
				if (Object.keys(advantage_disadvantage).length === 1) {
					n = 2;
				}
			} else {
				advantage_disadvantage = {};
			}

			//Roll the dice
			for (var i = 0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d));
			}

			//Roll with advantage/disadvantage
			if (Object.keys(advantage_disadvantage).length === 1) {
				let ignoredRoll = throws[0] < throws[1] ? 0 : 1; //ignore the lowest roll

				//With disadvantage, ignore the highest roll
				if (advantage_disadvantage.disadvantage) {
					ignoredRoll = throws[0] > throws[1] ? 0 : 1;
				}

				ignored = throws[ignoredRoll];
				throws.splice(ignoredRoll, 1);
				n = 1;
			}

			let s = "";
			if (Math.sign(m) >= 0) {
				s = "+";
			}
			const sumThrows = throws.reduce(add);
			const sumTotal = sumThrows + parseInt(m);

			const showRoll = m !== 0 ? `${n}d${d}${s}${m}` : `${n}d${d}`;

			const roll = {
				title,
				roll: showRoll,
				n,
				d,
				s,
				m,
				mod: s + m,
				throws: throws,
				throwsTotal: sumThrows,
				total: sumTotal,
				advantage_disadvantage,
				ignored,
			};
			if (entity_name) roll.entity_name = entity_name;

			if (notify) {
				let advantage;
				if (ignored) {
					const type = Object.keys(advantage_disadvantage)[0].charAt(0).capitalize();
					const color = type === "A" ? "green" : "red";
					advantage = `<b class="${color}">${type}</b> <span class="neutral-2">${ignored}</span> `;
				}

				this.animateTrigger = !this.animateTrigger;
				this.$snotify.html(
					`<div class="snotifyToast__body roll">
						<div class="roll_title truncate">${entity_name ? `${entity_name}: ` : ``}${title}</div>
						<div class="rolled" id="roll">${roll.total}</div>
						<div class="roll_footer">${advantage ? advantage : ""}${sumThrows}${roll.mod}</div>
					</div> `,
					{
						timeout: 3000,
						closeOnClick: true,
					}
				);
				this.rolled = roll.total;
			}

			//Save the roll in the encounter "shares" object
			if (share && this.broadcast.live) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				let share_roll = { ...roll };

				// Remove unneeded properties
				delete share_roll.throws;
				delete share_roll.throwsTotal;
				delete share_roll.d;
				delete share_roll.mod;
				delete share_roll.ignored;
				if (!roll.ignored) {
					delete share_roll.advantage_disadvantage;
				} else {
					share_roll.advantage_disadvantage = Object.keys(advantage_disadvantage)[0].charAt(0);
				}

				let share_object = {
					key,
					type: "roll",
					notification: share_roll,
				};

				if (share.encounter_id) share_object.encounter_id = share.encounter_id;
				if (share.entity_key) share_object.entity_key = share.entity_key;

				// Share the roll
				this.set_share({ id: this.broadcast.live, share: share_object });
			}

			this.setRoll(roll);
			return roll;
		},
		rollD6(n = 1, m = 0) {
			return this.rollD(6, n, m);
		},
		rollD8(n = 1, m = 0) {
			return this.rollD(8, n, m);
		},
		rollD10(n = 1, m = 0) {
			return this.rollD(10, n, m);
		},
		rollD20(n = 1, m = 0) {
			return this.rollD(20, n, m);
		},
		rollD100(n = 1, m = 0) {
			return this.rollD(100, n, m);
		},
		/**
		 * Roll any spell or monster action
		 *
		 * @param {object} e Event, holds info for advantage/disadvantage
		 * @param {object} ability Full ability object
		 * @param {object} config Holds configuration options {type, cast_level, caster_level, toHitModifier, versatile}
		 *
		 * @returns {object}
		 */
		rollAction(e, ability, config = {}) {
			let returnRoll = {
				name: this.getAbilityName(ability, config),
				actions: [],
			};

			if (config.option !== undefined) {
				if (ability.options && ability.options.length) {
					returnRoll.name = `${ability.name} (${config.option})`;
				} else if (ability.versatile) {
					returnRoll.name =
						config.option === 0
							? `${ability.name} (${ability.versatile_one || "Option 1"})`
							: `${ability.name} (${ability.versatile_two || "Option 2"})`;
				}
			}

			// Check for advantage/disadvantage in the $event
			let advantage_object = e.advantage_disadvantage ? e.advantage_disadvantage : {};
			if (e.e.shiftKey) {
				advantage_object["advantage"] = true;
			}
			if (e.e.ctrlKey) {
				advantage_object["disadvantage"] = true;
			}

			const actions = ability.action_list; // All actions in the ability

			let i = 0;
			// LOOP OVER ALL ACTIONS
			for (let action of actions) {
				let type = action.type;
				let attack_bonus = action.attack_bonus || config.attack_bonus;
				let toHit = false;
				let crit = false;
				returnRoll.actions[i] = { type, rolls: [] };

				// If the action type is a spell attack, melee weapon or ranged weapon, roll to hit
				if (type === "melee_weapon" || type === "ranged_weapon" || type === "spell_attack") {
					returnRoll.actions[i].toHit = this.rollD(
						e.e,
						20,
						1,
						attack_bonus,
						`${ability.name} to hit`,
						undefined,
						false,
						advantage_object
					);
					if (returnRoll.actions[i].toHit.throwsTotal >= 20) {
						returnRoll.actions[i].crit = true;
						crit = true;
					}
					toHit = true;
				}
				// For a saving throw set the ability and DC for display
				if (type === "save") {
					returnRoll.actions[i].save_ability = action.save_ability;
					returnRoll.actions[i].save_dc = action.save_dc || 10;
				}

				for (const roll of action.rolls) {
					// Create editable Roll object with important props from roll object via anonymous function
					let editableRoll = (({ damage_type, dice_count, dice_type, fixed_val }) => ({
						damage_type,
						dice_count,
						dice_type,
						fixed_val,
					}))(roll);

					const missSave = toHit ? roll.miss_mod : roll.save_fail_mod; //what happens on miss/failed save
					const special =
						!roll.special || roll.length === 0
							? undefined
							: roll.special && Array.isArray(roll.special)
							? roll.special
							: [roll.special];
					let magical = !!roll.magical;

					// Check for options
					if (ability.options && config.option && roll.options && roll.options[config.option]) {
						const option = roll.options[config.option];
						if (option.ignore) {
							editableRoll = {};
						} else {
							editableRoll.damage_type = option.damage_type || editableRoll.damage_type;
							editableRoll.dice_type = option.dice_type || editableRoll.dice_type;
							editableRoll.dice_count = option.dice_count || editableRoll.dice_count;
							editableRoll.fixed_val = option.fixed_val || editableRoll.fixed_val;
							magical = option.magical;
						}
					}
					// Check for versatile. 1 is the alternative option
					// Changes only have to be made if the versatile roll is the alternative (1)
					else if (ability.versatile && config.option === 1) {
						editableRoll.damage_type = roll.versatile_damage_type || editableRoll.damage_type;
						editableRoll.dice_type = roll.versatile_dice_type || editableRoll.dice_type;
						editableRoll.dice_count = roll.versatile_dice_count || editableRoll.dice_count;
						editableRoll.fixed_val = roll.versatile_fixed_val || editableRoll.fixed_val;
						magical = roll.versatile_magical;
					}

					// Check if the action scales with the current roll
					const tiers = roll.scaling;
					if (roll.scaling) {
						editableRoll = this.__levelScaling__(tiers, editableRoll, ability, config);
					}

					// check crits
					editableRoll.dice_count = this.getDiceCount(crit, editableRoll.dice_count);

					// Roll the roll
					let rollResult = undefined;
					if (editableRoll.dice_type && editableRoll.dice_count) {
						rollResult = this.rollD(
							e.e,
							editableRoll.dice_type,
							editableRoll.dice_count,
							editableRoll.fixed_val,
							`${editableRoll.name}`
						);
						// When there is nothing to roll, but only a fixed value
						// still a roll must be created
					} else {
						rollResult = {
							title: editableRoll.name,
							roll: editableRoll.fixed_val,
							mod: editableRoll.fixed_val,
							throws: [],
							throwsTotal: 0,
							total: parseInt(editableRoll.fixed_val),
						};
					}

					// Double the rolled damage (without the modifier [throwsTotal])
					// simply add [throwsTotal] once more to the [total]
					// Only when it's a crit and crit settings are set to double
					if (crit && this.critSettings === "double") {
						rollResult.total = rollResult.total + rollResult.throwsTotal;
						const { n, d, m, s } = rollResult;
						rollResult.roll = m !== 0 ? `2x(${n}d${d})${s}${m}` : `2x(${n}d${d})`;
					}
					// Add the max damage output of the roll to the total when crit and setting is max
					if (crit && this.critSettings === "max") {
						const { n, d, m, s } = rollResult;
						rollResult.total = rollResult.total + n * d;
						rollResult.roll = m !== 0 ? `(${n}d${d}+${n * d})${s}${m}` : `(${n}d${d}+${n * d}) `;
					}

					// Push the rolled modifier to the array with all rolled modifiers
					returnRoll.actions[i].rolls.push({
						rollResult,
						damage_type: editableRoll.damage_type,
						missSave,
						magical,
						special,
					});
				}
				i++;
			}
			return returnRoll;
		},
		__levelScaling__(tiers, roll, ability, config) {
			// SPELL SCALE
			if (ability.scaling === "spell_scale") {
				const scale = tiers[0].level;
				const dice_count = tiers[0].dice_count;
				const fixed_val = tiers[0].fixed_val;

				// Calculate the increase based on spell level, on what level the spell is cast and the scale
				const increase = parseInt(Math.floor((config.cast_level - ability.level) / scale));

				// If there is an increase,
				if (increase) {
					roll.dice_count += increase * dice_count;
					if (roll.fixed_val) roll.fixed_val += fixed_val ? increase * fixed_val : 0;
				}
			}
			// CHARACTER LEVEL
			else if (ability.scaling === "character_level") {
				tiers.sort((a, b) => (parseInt(a.level) > parseInt(b.level) ? 1 : -1));

				for (let tier of tiers) {
					if (parseInt(config.caster_level) >= parseInt(tier.level)) {
						roll.dice_count = tier.dice_count;
						roll.fixed_val = tier.fixed_val || 0;
					}
				}
			}
			return roll;
		},
		getAbilityName(ability, config) {
			if (config.cast_level) {
				return `${ability.name} (${config.cast_level.toOrdinal()})`;
			}
			return ability.name;
		},
		animateValue(id, start, end, duration) {
			if (start === end) return;
			const range = end - start;
			let current = start;
			const increment = end > start ? 1 : -1;
			const stepTime = Math.abs(Math.floor(duration / range));
			const obj = document.getElementById(id);
			const timer = setInterval(function () {
				current += increment;
				obj.innerHTML = current;
				if (current == end) {
					clearInterval(timer);
				}
			}, stepTime);
		},
		calcAverage(value, amount = 1) {
			return Math.ceil(((value + 1) / 2) * amount);
		},
		getDiceCount(crit, dice_count) {
			// Crit and setting is roll damage twice
			if (crit && this.critSettings === undefined) {
				return dice_count * 2;
			}

			return dice_count;
		},
	},
};
