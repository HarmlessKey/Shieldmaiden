import { mapActions } from 'vuex';

export const dice = {
	data() {
		return {
			animateTrigger: false,
			rolled: 0
		}
	},
	watch: {
		animateTrigger() {
			this.animateValue("roll", 0, this.rolled, 500);
			this.rolled = 0;
		}
	},
	methods: {
		...mapActions([
			'setRoll'
		]),
		rollD(e, d=20, n=1, m=0, title, notify=false, advantage_disadvantage={}) {
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
				mod: s + m,
				throws: throws,
				throwsTotal: sumThrows,
				total: sumTotal,
				advantage_disadvantage,
				ignored
			}
			
			if(notify) {
				let advantage;
				if(ignored) {
					const type = Object.keys(advantage_disadvantage)[0].charAt(0).capitalize();
					const color = (type === "A") ? "green" : "red";
					advantage = `<b class="${color}">${type}</b> <span class="gray-hover">${ignored}</span> `;
				}

				this.animateTrigger = !this.animateTrigger;
				this.$snotify.html(
					`<div class="snotifyToast__body roll">
						<div class="roll_title">${title}</div>
						<div class="rolled" id="roll">${roll.total}</div>
						<div class="roll_title">${advantage ? advantage : ''}${sumThrows}${roll.mod}</div>
					</div> `, {
					timeout: 3000,
					closeOnClick: true
				});
				this.rolled = roll.total;
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
		rollAction(e, ability, castLevel, casterLevel, toHitModifier) {
			let returnRoll = {
				name: ability.name,
				actions: [],
				damageTypes: []
			};
			let advantage_object = (e.advantage_disadvantage) ? e.advantage_disadvantage : {};
			if(e.e.shiftKey) {
				advantage_object["advantage"] = true;
			} 
			if(e.e.ctrlKey) {
				advantage_object["disadvantage"] = true;
			}

			const actions = ability.action_list;
			const scaleType = ability.level_scaling;
			const spellLevel = ability.level;

			let i = 0;
			// LOOP OVER ALL ACTIONS
			for(let action of actions) {
				let type = action.type;
				let attack_bonus = action.attack_bonus || toHitModifier;
				let toHit = false;
				returnRoll.actions[i] = { type, rolls: [] };

				//If the action type is a spell attack, melee weapon or ranged weapon, roll to hit
				if(type === 'melee_weapon' || type === 'ranged_weapon' || type === 'spell_attack') {
					returnRoll.actions[i].toHit = this.rollD(e.e, 20, 1, attack_bonus, `${ability.name} to hit`, false, advantage_object);
					toHit = true;
				}
				if(type === 'save') {
					returnRoll.actions[i].save_ability = action.save_ability;
					returnRoll.actions[i].save_dc = action.save_dc;
				}

				for(let modifier of action.rolls) {
					let damage_type = modifier.damage_type;
					let dice_type = modifier.dice_type;
					let dice_count = modifier.dice_count;
					let fixed_val = (modifier.fixed_val) ? modifier.fixed_val : 0;
					let modifierRoll = undefined;
					let scaledRoll = undefined;
					let scaledModifier = undefined;
					let missSave = (toHit) ? modifier.miss_mod : modifier.save_fail_mod; //what happens on miss/failed save

					//Create a list with al damage types for this action
					//Only if it is not a healing spell
					if(type !== 'healing' && damage_type) {
						if(!returnRoll.damageTypes.includes(damage_type)) {
							returnRoll.damageTypes.push(damage_type);
						}
					}

					//Check if the action scales with the current roll
					let tiers = modifier.level_tiers;
					if(tiers) {
						scaledModifier = this.__levelScaling__(tiers, castLevel, spellLevel, casterLevel, scaleType);
					
						//Roll the scaledModifier
						if(scaledModifier) {
							scaledRoll = this.rollD(e.e, scaledModifier.dice_type, scaledModifier.dice_count, scaledModifier.fixed_val);
						}
					}
					
					//Roll the modifier
					//If the modifier scales with character level, overwrite the modifierRoll with the scaledRoll
					if(scaleType === 'character_level' && scaledModifier) {
						modifierRoll = scaledRoll;
						scaledRoll = undefined; //Only return the scaled modifierRoll
					} else {
						modifierRoll = this.rollD(e.e, dice_type, dice_count, fixed_val, `${ability.name}`);
					}

					//Push the rolled modifier to the array with all rolled modifiers
					returnRoll.actions[i].rolls.push({
						modifierRoll,
						damage_type: modifier.damage_type,
						scaledRoll,
						missSave
					});
				}
				i++;
			}
			return returnRoll;
		},
		__levelScaling__(tiers, castLevel, spellLevel, casterLevel, scaleType) {
			let scaledModifier = undefined;

			//SPELL SCALE
			if(scaleType === 'spell_scale') {
				let scale = tiers[0].level;
				let dice_type = tiers[0].dice_type;
				let dice_count = tiers[0].dice_count;
				let fixed_val = tiers[0].fixed_val;

				//Calculate the increase based on spell level, on what level the spell is cast and the scale
				let increase = parseInt(Math.floor((castLevel - spellLevel) / scale));

				//If there is an increase, 
				if(increase) {
					scaledModifier = {};
					scaledModifier.dice_count = increase * dice_count;
					scaledModifier.dice_type = dice_type;

					//Check if there is a fixed value
					//If there is one, add it for every scale level
					//If the spell scales with 1 and is cast 3 levels higer, multiply the fixed value by 3
					scaledModifier.fixed_val = (fixed_val) ? increase * fixed_val : 0;
				}
			}
			//CHARACTER LEVEL
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
		}
	}
}
