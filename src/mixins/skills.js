export const skills = {
	data() {
		return {
			skillList: {
				'acrobatics': { skill: 'Acrobatics', ability: 'dexterity' },
				'animal Handling': { skill: 'Animal Handling', ability: 'wisdom' },
				'arcana': { skill: 'Arcana', ability: 'intelligence' },
				'athletics': { skill: 'Athletics', ability: 'strength' },
				'deception': { skill: 'Deception', ability: 'charisma' },
				'history': { skill: 'History', ability: 'intelligence' },
				'insight': { skill: 'Insight', ability: 'wisdom' },
				'intimidation': { skill: 'Intimidation', ability: 'charisma' },
				'investigation': { skill: 'Investigation', ability: 'intelligence' },
				'medicine': { skill: 'Medicine', ability: 'wisdom' },
				'nature': { skill: 'Nature', ability: 'intelligence' },
				'perception': { skill: 'Perception', ability: 'wisdom' },
				'performance': { skill: 'Performance', ability: 'charisma' },
				'persuasion': { skill: 'Persuasion', ability: 'charisma' },
				'religion': { skill: 'Religion', ability: 'intelligence' },
				'sleight of Hand': { skill: 'Sleight Of Hand', ability: 'dexterity' },
				'stealth': { skill: 'Stealth', ability: 'dexterity' },
				'survival': { skill: 'Survival', ability: 'wisdom' },
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
