export const skills = {
	data() {
		return {
			skillList: {
				'acrobatics': { skill: 'Acrobatics', value: "acrobatics", ability: 'dexterity' },
				'animal Handling': { skill: 'Animal Handling', value: "animal Handling", ability: 'wisdom' },
				'arcana': { skill: 'Arcana', value: "arcana", ability: 'intelligence' },
				'athletics': { skill: 'Athletics', value: "athletics", ability: 'strength' },
				'deception': { skill: 'Deception', value: "deception", ability: 'charisma' },
				'history': { skill: 'History', value: "history", ability: 'intelligence' },
				'insight': { skill: 'Insight', value: "insight", ability: 'wisdom' },
				'intimidation': { skill: 'Intimidation', value: "intimidation", ability: 'charisma' },
				'investigation': { skill: 'Investigation', value: "investigation", ability: 'intelligence' },
				'medicine': { skill: 'Medicine', value: "medicine", ability: 'wisdom' },
				'nature': { skill: 'Nature', value: "nature", ability: 'intelligence' },
				'perception': { skill: 'Perception', value: "perception", ability: 'wisdom' },
				'performance': { skill: 'Performance', value: "performance", ability: 'charisma' },
				'persuasion': { skill: 'Persuasion', value: "persuasion", ability: 'charisma' },
				'religion': { skill: 'Religion', value: "religion",ability: 'intelligence' },
				'sleight of Hand': { skill: 'Sleight Of Hand', value: "sleight of Hand", ability: 'dexterity' },
				'stealth': { skill: 'Stealth',  value: "stealth", ability: 'dexterity' },
				'survival': { skill: 'Survival',  value: "survival", ability: 'wisdom' },
			}
		}
	},
	methods: {
		calculateSkillModifier(abilityScore, proficiency, expertise) {
			let mod = (expertise) ? (abilityScore + proficiency + proficiency) : abilityScore + proficiency;
			return parseInt(mod);
		}
	}
}
