export const effects = {
	data() {
		return {
			effect_types: {
				bonus: { 
					label: "Bonus",
					info: "Add a bonus value to a stat. (Can be negative)",
					form_fields: { values: true },
				},
				set: { 
					label: "Set",
					info: "Set a stat to a set value. This set value allows later bonusses from other effects.",
					form_fields: { values: true },
				},
				fixed: { 
					label: "Fixed",
					info: "Set a stat to fixed value. This fixed value ignores all other bonusses.",
					form_fields: { values: true },
				},
				defenses: {
					label: "Defenses",
					info: "Set Vulnerability, Resistance or Immunity.",
					form_fields: { damage_types: true },
				},
				advantage: {
					label: "Advantage"
				},
				disadvantage: {
					label: "Disadvantage"
				}, 
				special: {
					label: "Special",
					info: "Special effects that don't fall into the other categories."
				}
			},
			effect_subtypes: {
				bonus: {
					AC: { label: "Armor Class" },
					maxHp: { label: "Maximum Hit Points" },
					attack: { label: "Attack Rolls" },
					ability: { label: "Ability Checks", form_fields: { abilities: true } },
					save: { label: "Saving Throws", form_fields: { abilities: true } },
				},
				set: {
					AC: { label: "Armor Class" },
					maxHp: { label: "Maximum Hit Points" },
				},
				fixed: {
					AC: { label: "Armor Class", form_fields: { minimum: true } },
					maxHp: { label: "Maximum Hit Points" },
					tempHp: { label: "Temporary Hit Points" }
				},
				defenses: {
					v: { label: "Vulnerable" },
					r: { label: "Resistant" },
					i: { label: "Immune" }
				},
				advantage: {
					attack: { label: "Attack Rolls", form_fields: { attack: true }  },
					ability: { label: "Ability Checks", form_fields: { abilities: true } },
					save: { label: "Saving Throws", form_fields: { abilities: true } },
					death_save: { label: "Death Saving Throws" },
				},
				disadvantage: {
					attack: { label: "Attack Rolls", form_fields: { attack: true } },
					ability: { label: "Ability Checks", form_fields: { abilities: true } },
					save: { label: "Saving Throws", form_fields: { abilities: true } },
					death_save: { label: "Death Saving Throws" },
				},
				special: {
					max_healing: { label: "Maximum Healing"},
					max_damage: { label: "Maximum Damage", form_fields: { damage_types: true } },
					death_ward: { label: "Death Ward" },
				},
			}
		}
	},
	methods: {
		
	}
}
