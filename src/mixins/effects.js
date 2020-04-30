export const effects = {
	data() {
		return {
			effect_types: {
				bonus: { 
					label: "Bonus",
					info: "Add a bonus value to a stat."
				},
				set: { 
					label: "Set",
					info: "Set a stat to a set value. This set value allows later bonusses from other effects."
				},
				fixed: { 
					label: "Fixed",
					info: "Set a stat to fixed value. This fixed value ignores all other bonusses." 
				},
				defenses: {
					label: "Defenses",
					info: "Set Vulnerability, Resistance or Immunity."
				}
			},
			effect_subtypes: {
				bonus: [
					{ value: "AC", label: "Armor Class" },
					{ value: "maxHp", label: "Maximum Hit Points" },
				],
				set: [
					{ value: "AC", label: "Armor Class" },
					{ value: "maxHp", label: "Maximum Hit Points" },
				],
				fixed: [
					{ value: "AC", label: "Armor Class" },
					{ value: "maxHp", label: "Maximum Hit Points" },
					{ value: "tempHp", label: "Temporary Hit Points" }
				],
				defenses: [
					{ value: "v", label: "Vulnerable" },
					{ value: "r", label: "Resistant" },
					{ value: "i", label: "Immune" }
				]
			}
		}
	},
	methods: {
		
	}
}
