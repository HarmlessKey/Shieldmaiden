export const effects = {
	data() {
		return {
			effect_types: {
				bonus: {
					label: "Bonus",
					value: "bonus",
					info: "Add a bonus value to a stat. (Can be negative)",
					form_fields: { values: true },
				},
				set: {
					label: "Set",
					value: "set",
					info: "Set a stat to a set value. This set value allows later bonuses from other effects.",
					form_fields: { values: true },
				},
				fixed: {
					label: "Fixed",
					value: "fixed",
					info: "Set a stat to fixed value. This fixed value ignores all other bonuses.",
					form_fields: { values: true },
				},
				defenses: {
					label: "Defenses",
					value: "defenses",
					info: "Set Vulnerability, Resistance or Immunity.",
					form_fields: { damage_types: true },
				},
				advantage: {
					label: "Advantage",
					value: "advantage",
				},
				disadvantage: {
					label: "Disadvantage",
					value: "disadvantage",
				},
				special: {
					label: "Special",
					value: "special",
					info: "Special effects that don't fall into the other categories.",
				},
				// description: {
				// 	label: "Description",
				// 	info: "An effect that has a descriptive component.",
				// 	form_fields: { description: true },
				// },
			},
			effect_subtypes: {
				bonus: {
					AC: { label: "Armor Class", value: "AC" },
					maxHp: { label: "Maximum Hit Points", value: "maxHp" },
					attack: { label: "Attack Rolls", value: "attack" },
					damage: { label: "Damage Rolls", value: "damage", form_fields: { damage_types: true } },
					ability: { label: "Ability Checks", value: "ability", form_fields: { abilities: true } },
					skill: { label: "Skill Checks", value: "skill", form_fields: { skills: true } },
					save: { label: "Saving Throws", value: "save", form_fields: { abilities: true } },
				},
				set: {
					AC: { label: "Armor Class", value: "AC" },
					maxHp: { label: "Maximum Hit Points", value: "maxHp" },
				},
				fixed: {
					AC: { label: "Armor Class", value: "AC", form_fields: { minimum: true } },
					maxHp: { label: "Maximum Hit Points", value: "maxHp" },
					tempHp: { label: "Temporary Hit Points", value: "tempHp" },
				},
				defenses: {
					v: { label: "Vulnerable", value: "v" },
					r: { label: "Resistant", value: "r" },
					i: { label: "Immune", value: "i" },
				},
				advantage: {
					attack: { label: "Attack Rolls", value: "attack", form_fields: { attack: true } },
					ability: { label: "Ability Checks", value: "ability", form_fields: { abilities: true } },
					skill: { label: "Skill Checks", value: "skill", form_fields: { skills: true } },
					save: { label: "Saving Throws", value: "save", form_fields: { abilities: true } },
					death_save: { label: "Death Saving Throws", value: "death_save" },
				},
				disadvantage: {
					attack: { label: "Attack Rolls", value: "attack", form_fields: { attack: true } },
					ability: { label: "Ability Checks", value: "ability", form_fields: { abilities: true } },
					skill: { label: "Skill Checks", value: "skill", form_fields: { skills: true } },
					save: { label: "Saving Throws", value: "save", form_fields: { abilities: true } },
					death_save: { label: "Death Saving Throws", value: "death_save" },
				},
				special: {
					max_healing: { label: "Maximum Healing", value: "max_healing" },
					max_damage: {
						label: "Maximum Damage",
						value: "max_damage",
						form_fields: { damage_types: true },
					},
					death_ward: { label: "Death Ward", value: "death_ward" },
					description: {
						label: "Description",
						value: "description",
						form_fields: { description: true },
					},
				},
				// description: {}
			},
		};
	},
	methods: {},
};
