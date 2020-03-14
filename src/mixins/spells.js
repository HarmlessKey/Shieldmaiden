export const spells = {
	data() {
		return {
		}
	},
	methods: {
		rollSpell(spell, castLevel) {
			const actions = spell.actions;
			const levelScaling = spell.level_scaling;
			const spellLevel = spell.level;

			// LOOP OVER ALL ACTIONS
			for(let action of actions) {
				console.log(action);
				for(let modifier of action.modifiers) {
					let tiers = modifier.level_tiers;
					let scaledModifier = this.__levelScaling__(modifier, tiers, castLevel, spellLevel, levelScaling);

					console.log('Scaled: ', scaledModifier);
				}
			}
		},
		__levelScaling__(modifier, tiers, castLevel, spellLevel, levelScaling) {
			let scaledModifier = [{
				dice_count: modifier.dice_count,
				dice_type: modifier.dice_type
			}];


			//CHECK SCALING TYPE
			if(levelScaling === 'Spell Scale') {
				let scale = tiers[0].level;
				let dice_type = tiers[0].dice_type;
				let dice_count = tiers[0].dice_count;
				let fixed_val = tiers[0].fixed_val;

				let increase = parseInt(Math.floor((castLevel - spellLevel) / scale) * dice_count);

				//Check if there is a fixed value
				//If there is one, add it for every scale level
				//If the spell scales with 1 and is cast 3 levels higer, multiply the fixed value by 3
				if(fixed_val) {
					fixed_val = parseInt(Math.floor((castLevel - spellLevel) / scale) * fixed_val);
				}

				//Check if the scaled dice type === modifier dice type
				//If so the dice can be added to the same modifier and returned as one
				if(modifier.dice_type === dice_type) {
					scaledModifier[0].dice_count = (parseInt(modifier.dice_count) + increase);
					scaledModifier[0].fixed_val = fixed_val;
				} 
				//If the dice types differ, push the increase as a separate entry to the array
				else if(increase) {
					scaledModifier.push({
						dice_type,
						increase,
						fixed_val
					});
				}
			}
			return scaledModifier;
		}
	}
}
