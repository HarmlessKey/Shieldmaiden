export const skills = {
	data() {
		return {
			skillList: {
				'acrobatics': { value: 'acrobatics', skill: 'Acrobatics', ability: 'dexterity' },
				'animalHandling': { value: 'animalHandling', skill: 'Animal Handling', ability: 'wisdom' },
				'arcana': { value: 'arcana', skill: 'Arcana', ability: 'intelligence' },
				'athletics': { value: 'athletics', skill: 'Athletics', ability: 'strength' },
				'deception': { value: 'deception', skill: 'Deception', ability: 'charisma' },
				'history': { value: 'history', skill: 'History', ability: 'intelligence' },
				'insight': { value: 'insight', skill: 'Insight', ability: 'wisdom' },
				'intimidation': { value: 'intimidation', skill: 'Intimidation', ability: 'charisma' },
				'investigation': { value: 'investigation', skill: 'Investigation', ability: 'intelligence' },
				'medicine': { value: 'medicine', skill: 'Medicine', ability: 'wisdom' },
				'nature': { value: 'nature', skill: 'Nature', ability: 'intelligence' },
				'perception': { value: 'perception', skill: 'Perception', ability: 'wisdom' },
				'performance': { value: 'performance', skill: 'Performance', ability: 'charisma' },
				'persuasion': { value: 'persuasion', skill: 'Persuasion', ability: 'charisma' },
				'religion': { value: 'religion', skill: 'Religion', ability: 'intelligence' },
				'sleightOfHand': { value: 'sleightOfHand', skill: 'Sleight Of Hand', ability: 'dexterity' },
				'stealth': { value: 'stealth', skill: 'Stealth', ability: 'dexterity' },
				'survival': { value: 'survival', skill: 'Survival', ability: 'wisdom' },
			}
		}
	},
	methods: {
		calculateSkillModifier(abilityScore, proficiency, expertise) {
			let mod = (expertise) ? (abilityScore + proficiency + proficiency) : abilityScore + proficiency;

			if((mod) >= 0) {
				return '+' + parseInt(mod);
			} else {
				return parseInt(mod);
			}
		}
	}
}
