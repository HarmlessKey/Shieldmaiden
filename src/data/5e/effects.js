// Non-condition SRD effects for D&D 5e (2014), modeled against src/schemas/hk-effects-schema.json
export default [
	{
		url: "concentration",
		name: "Concentration",
		description:
			"Maintaining a spell requires concentration. Concentration is broken if you cast another spell that requires concentration, take damage and fail a Constitution saving throw (DC 10 or half the damage taken, whichever is higher), are incapacitated, or die.",
		cancelable: true,
		ends_when: {
			type: "has_condition",
			value: "incapacitated",
			description: "Concentration ends if you are incapacitated.",
		},
		sub_effects: [
			{
				type: "outcome",
				sub_types: ["break_concentration"],
				trigger: "damage_taken",
				save: {
					ability: "constitution",
					dc: { formula: "damage_taken / 2", min: 10, round: "down" },
				},
				description:
					"Make a Constitution saving throw (DC 10 or half the damage taken, whichever is higher) or lose concentration.",
			},
			{
				type: "outcome",
				sub_types: ["break_concentration"],
				trigger: "on_zero_hp",
				description: "Concentration is automatically broken.",
			},
		],
	},
];
