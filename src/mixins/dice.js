import { mapActions, mapGetters } from "vuex";

export const dice = {
	data() {
		return {
			animateTrigger: false,
			rolled: 0
		}
	},
	computed: {
		...mapGetters([
			"broadcast"
		]),
		critSettings() {
			if(this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical;
			} return undefined; // Default = undefined = roll twice
		},
		dice_types() {		
			return [
				{ value: 4, text: "d4", average: this.calcAverage(4) },
				{ value: 6, text: "d6", average: this.calcAverage(6) },
				{ value: 8, text: "d8", average: this.calcAverage(8) },
				{ value: 10, text: "d10", average: this.calcAverage(10) },
				{ value: 12, text: "d12", average: this.calcAverage(12) },
			];
		} 
	},
	watch: {
		animateTrigger() {
			this.animateValue("roll", 0, this.rolled, 500);
			this.rolled = 0;
		}
	},
	methods: {
		...mapActions(["setRoll"]),
		...mapActions("campaigns", ["set_share"]),
		rollD(e, d=20, n=1, m=0, title, entity_name=undefined, notify=false, advantage_disadvantage={}, share=null) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b;
			let throws = [];
			let ignored = undefined;
			
			//Check for advantage with advantage or disadvantage when a single d20 is rolled
			if(n === 1 && d === 20 && (e.shiftKey || e.ctrlKey || Object.keys(advantage_disadvantage).length > 0)) {
				if(e.shiftKey || e.ctrlKey) {
					const type = (e.shiftKey) ? "advantage" : "disadvantage";
					advantage_disadvantage[type] = true;
				}

				//Only roll with advantage/disadvantage if only 1 is present they cancel eachother out
				if(Object.keys(advantage_disadvantage).length === 1) {
					n = 2;
				}
			} else {
				advantage_disadvantage = {};
			}
			
			//Roll the dice
			for (var i=0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d))
			}

			//Roll with advantage/disadvantage
			if(Object.keys(advantage_disadvantage).length === 1) {
				let ignoredRoll = (throws[0] < throws[1]) ? 0 : 1; //ignore the lowest roll
				
				//With disadvantage, ignore the highest roll
				if(advantage_disadvantage.disadvantage) {
					ignoredRoll = (throws[0] > throws[1]) ? 0 : 1;
				}

				ignored = throws[ignoredRoll];
				throws.splice(ignoredRoll, 1);
				n = 1;
			}

			let s = ''
			if (Math.sign(m) >= 0) {
				s = '+'
			}
			const sumThrows = throws.reduce(add);
			const sumTotal = sumThrows + parseInt(m);

			const showRoll = (m !== 0) ? `${n}d${d}${s}${m}` : `${n}d${d}`;

			const roll = {
				title,
				roll: showRoll,
				d,
				mod: s + m,
				throws: throws,
				throwsTotal: sumThrows,
				total: sumTotal,
				advantage_disadvantage,
				ignored
			}
			if(entity_name) roll.entity_name = entity_name;
			
			if(notify) {
				let advantage;
				if(ignored) {
					const type = Object.keys(advantage_disadvantage)[0].charAt(0).capitalize();
					const color = (type === "A") ? "green" : "red";
					advantage = `<b class="${color}">${type}</b> <span class="neutral-2">${ignored}</span> `;
				}

				this.animateTrigger = !this.animateTrigger;
				this.$snotify.html(
					`<div class="snotifyToast__body roll">
						<div class="roll_title truncate">${entity_name ? `${entity_name}: ` : ``}${title}</div>
						<div class="rolled" id="roll">${roll.total}</div>
						<div class="roll_footer">${advantage ? advantage : ''}${sumThrows}${roll.mod}</div>
					</div> `, {
					timeout: 3000,
					closeOnClick: true
				});
				this.rolled = roll.total;
			}
			
			//Save the roll in the encounter "shares" object
			if(share && this.broadcast.live) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				let share_roll = {...roll};

				// Remove unneeded properties
				delete share_roll.throws;
				delete share_roll.throwsTotal;
				delete share_roll.d;
				delete share_roll.mod;
				delete share_roll.ignored;
				if(!roll.ignored) {
					delete share_roll.advantage_disadvantage;
				} else {
					share_roll.advantage_disadvantage = Object.keys(advantage_disadvantage)[0].charAt(0);
				}
				
				let share_object = {
					key,
					type: "roll",
					notification: share_roll
				}

				if(share.encounter_id) share_object.encounter_id = share.encounter_id;
				if(share.entity_key) share_object.entity_key = share.entity_key;
				
				// Share the roll
				this.set_share({ id: this.broadcast.live, share: share_object })
			}

			this.setRoll(roll);
			return roll;
		},
		rollD6(n=1,m=0) {
			return this.rollD(6,n,m)
		},
		rollD8(n=1,m=0) {
			return this.rollD(8,n,m)
		},
		rollD10(n=1,m=0) {
			return this.rollD(10,n,m)
		},
		rollD20(n=1,m=0) {
			return this.rollD(20,n,m)
		},
		rollD100(n=1,m=0) {
			return this.rollD(100,n,m)
		},
		/**
		 * Roll any spell or monster action
		 * 
		 * @param {object} e Event, holds info for advantage/disadvantege
		 * @param {object} ability Full ability object
		 * @param {object} config Holds configuration options {type, castLevel, casterLevel, toHitModifier, versatile}
		 * 
		 * @returns {object}
		 */
		rollAction(e, ability, config={}) {
			let returnRoll = {
				name: ability.name,
				actions: []
			};

			if(config.versatile !== undefined) {
				returnRoll.name = (config.versatile === 0) ? 
					`${ability.name} (${ability.versatile_one || 'Option 1'})` : 
					`${ability.name} (${ability.versatile_two || 'Option 2'})`;
			}

			// Check for advantage/disadvantage in the $event
			let advantage_object = (e.advantage_disadvantage) ? e.advantage_disadvantage : {};
			if(e.e.shiftKey) {
				advantage_object["advantage"] = true;
			} 
			if(e.e.ctrlKey) {
				advantage_object["disadvantage"] = true;
			}

			const actions = ability.action_list; // All actions in the ability
			const scaleType = ability.level_scaling; // Only for spells
			const spellLevel = ability.level; // Only for spells

			let i = 0;
			// LOOP OVER ALL ACTIONS
			for(let action of actions) {
				let type = action.type;
				let attack_bonus = action.attack_bonus || config.toHitModifier;
				let toHit = false;
				let crit = false;
				returnRoll.actions[i] = { type, rolls: [] };

				// If the action type is a spell attack, melee weapon or ranged weapon, roll to hit
				if(type === 'melee_weapon' || type === 'ranged_weapon' || type === 'spell_attack') {
					returnRoll.actions[i].toHit = this.rollD(e.e, 20, 1, attack_bonus, `${ability.name} to hit`, undefined, false, advantage_object);
					if(returnRoll.actions[i].toHit.throwsTotal === 20) {
						returnRoll.actions[i].crit = true;
						crit = true;
					}
					toHit = true;
				}
				// For a saving throw set the ability and DC for display
				if(type === 'save') {
					returnRoll.actions[i].save_ability = action.save_ability;
					returnRoll.actions[i].save_dc = action.save_dc;
				}

				for(let modifier of action.rolls) {
					let damage_type = modifier.damage_type;
					let dice_type = modifier.dice_type;
					let dice_count = (crit && !this.critSettings) ? modifier.dice_count*2 : modifier.dice_count;
					let fixed_val = (modifier.fixed_val) ? modifier.fixed_val : 0;
					let modifierRoll = undefined;
					let scaledRoll = undefined;
					let scaledModifier = undefined;
					let missSave = (toHit) ? modifier.miss_mod : modifier.save_fail_mod; //what happens on miss/failed save
					const special = (!modifier.special || modifier.length === 0) ? undefined : (modifier.special && Array.isArray(modifier.special)) ? modifier.special : [modifier.special];

					// Check for versatile. 1 is the alternative option
					// Changes only have to be made if the versatile roll is the alternative (1)
					if(config.versatile === 1) {
						damage_type = (modifier.versatile_damage_type) ? modifier.versatile_damage_type : damage_type;
						dice_type = (modifier.versatile_dice_type) ? modifier.versatile_dice_type : dice_type;
						dice_count = (modifier.versatile_dice_count) ? modifier.versatile_dice_count : dice_count;
						fixed_val = (modifier.versatile_fixed_val) ? modifier.versatile_fixed_val : fixed_val;
					}

					// Check if the action scales with the current roll
					let tiers = modifier.level_tiers;
					if(tiers) {
						scaledModifier = this.__levelScaling__(tiers, config.castLevel, spellLevel, config.casterLevel, scaleType);
					
						// Roll the scaledModifier
						if(scaledModifier) {
							// Double the dice count when it's a crit and crit settings are set to roll twice
							if(crit && !this.critSettings) scaledModifier.dice_count = scaledModifier.dice_count*2;
							if(scaledModifier.dice_type && scaledModifier.dice_count) scaledRoll = this.rollD(e.e, scaledModifier.dice_type, scaledModifier.dice_count, scaledModifier.fixed_val);
							// When there is nothing to roll, but only a fixed value
							// still a roll must be created
							else scaledRoll = {
								title: ability.name,
								roll: fixed_val,
								mod: fixed_val,
								throws: [],
								throwsTotal: 0,
								total: parseInt(fixed_val)
							}
						}
					}
					
					// Roll the modifier
					// If the modifier scales with character level, overwrite the modifierRoll with the scaledRoll
					if(scaleType === 'character_level' && scaledModifier) {
						modifierRoll = scaledRoll;
						scaledRoll = undefined; //Only return the scaled modifierRoll
					} else {
						if(dice_type && dice_count) modifierRoll = this.rollD(e.e, dice_type, dice_count, fixed_val, `${ability.name}`);
						// When there is nothing to roll, but only a fixed value
						// still a roll must be created
						else modifierRoll = {
							title: ability.name,
							roll: fixed_val,
							mod: fixed_val,
							throws: [],
							throwsTotal: 0,
							total: parseInt(fixed_val)
						}
					}

					// Double the rolled damage (without the modifier [trhowsTotal])
					// simply add [trhowsTotal] once more to the [total]
					// Only when it's a crit and crit settings are set to doulbe
					if(crit && this.critSettings) {
						modifierRoll.total = modifierRoll.total + modifierRoll.throwsTotal;
					}

					// Push the rolled modifier to the array with all rolled modifiers
					returnRoll.actions[i].rolls.push({
						modifierRoll,
						damage_type,
						scaledRoll,
						missSave,
						special
					});
				}
				i++;
			}
			return returnRoll;
		},
		__levelScaling__(tiers, castLevel, spellLevel, casterLevel, scaleType) {
			let scaledModifier = undefined;

			// SPELL SCALE
			if(scaleType === 'spell_scale') {
				let scale = tiers[0].level;
				let dice_type = tiers[0].dice_type;
				let dice_count = tiers[0].dice_count;
				let fixed_val = tiers[0].fixed_val;

				// Calculate the increase based on spell level, on what level the spell is cast and the scale
				let increase = parseInt(Math.floor((castLevel - spellLevel) / scale));

				// If there is an increase, 
				if(increase) {
					scaledModifier = {};
					scaledModifier.dice_count = increase * dice_count;
					scaledModifier.dice_type = dice_type;

					// Check if there is a fixed value
					// If there is one, add it for every scale level
					// If the spell scales with 1 and is cast 3 levels higer, multiply the fixed value by 3
					scaledModifier.fixed_val = (fixed_val) ? increase * fixed_val : 0;
				}
			}
			// CHARACTER LEVEL
			if(scaleType === 'character_level') {
				tiers.sort((a, b) => (parseInt(a.level) > parseInt(b.level)) ? 1 : -1)

				for(let tier of tiers) {
					if(parseInt(casterLevel) >= parseInt(tier.level)) {
						scaledModifier = {
							dice_count: tier.dice_count,
							dice_type: tier.dice_type,
						};
						if(tier.fixed_val) {
							scaledModifier.fixed_val = tier.fixed_val;
						}
					}
				}
			}
			return scaledModifier;
		},
		animateValue(id, start, end, duration) {
			if (start === end) return;
			const range = end - start;
			let current = start;
			const increment = end > start? 1 : -1;
			const stepTime = Math.abs(Math.floor(duration / range));
			const obj = document.getElementById(id);
			const timer = setInterval(function() {
					current += increment;
					obj.innerHTML = current;
					if (current == end) {
							clearInterval(timer);
					}
			}, stepTime);
		},
		calcAverage(value, amount = 1) {
			return Math.ceil(((value + 1)/2)*amount);
		}
	}
}
