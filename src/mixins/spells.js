import { dice } from '@/mixins/dice.js';

export const spells = {
	mixins: [dice],
	data() {
		return {
		}
	},
	methods: {
		rollSpell(spell, castLevel, casterLevel, toHitModifier) {
			let returnRoll = {
				actions: []
			};
			const actions = spell.actions;
			const scaleType = spell.level_scaling;
			const spellLevel = spell.level;

			let i = 0;
			// LOOP OVER ALL ACTIONS
			for(let action of actions) {
				let type = action.type;
				returnRoll.actions[i] = { type, rolls: [] }

				//If the action type is a spell attack, melee weapon or ranged weapon, roll to hit
				if(type === 'Melee Weapon' || type === 'Ranged Weapon' || type === 'Spell Attack') {
					returnRoll.actions[i].toHit = this.rollD(20, 1, toHitModifier);
				}
				if(type === 'Spell Save') {
					returnRoll.actions[i].save = action.save;
				}

				for(let modifier of action.modifiers) {
					let dice_type = modifier.dice_type;
					let dice_count = modifier.dice_count;
					let fixed_val = (modifier.fixed_val) ? modifier.fixed_val : 0;
					let modifierRoll = undefined;
					let scaledRoll = undefined;

					let tiers = modifier.level_tiers;
					let scaledModifier = this.__levelScaling__(tiers, castLevel, spellLevel, casterLevel, scaleType);
					
					//Roll the scaledModifier
					if(scaledModifier) {
						scaledRoll = this.rollD(scaledModifier.dice_type, scaledModifier.dice_count, scaledModifier.fixed_val);
					}
					
					//Roll the modifier
					//If the modifier scales with character level, overwrite the modifierRoll with the scaledRoll
					if(scaleType === 'Character Level' && scaledModifier) {
						modifierRoll = scaledRoll;
						scaledRoll = undefined; //Only return the scaled modifierRoll
					} else {
						modifierRoll = this.rollD(dice_type, dice_count, fixed_val);
					}

					returnRoll.actions[i].rolls.push({
						modifierRoll,
						subtype: modifier.subtype,
						scaledRoll
					})
				}
				i++;
			}
			return returnRoll;
		},
		__levelScaling__(tiers, castLevel, spellLevel, casterLevel, scaleType) {
			let scaledModifier = undefined;

			//SPELL SCALE
			if(scaleType === 'Spell Scale') {
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
			if(scaleType === 'Character Level') {
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
		}
	}
}
