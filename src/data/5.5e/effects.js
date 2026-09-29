// Non-condition SRD effects for D&D 5.5e (2024), modeled against src/schemas/hk-effects-schema.json
export default [
	{
		key: "concentration",
		name: "Concentration",
		description:
			"Some spells and other effects require Concentration to remain active. Concentration ends if you start casting another spell or activate another effect that requires Concentration, take damage and fail a Constitution saving throw (DC 10 or half the damage taken, round down, whichever is higher, up to a maximum DC of 30), have the Incapacitated condition, or die.",
		cancelable: true,
		ends_when: {
			type: "has_condition",
			value: "incapacitated",
			description: "Concentration ends if you have the Incapacitated condition.",
		},
		sub_effects: [
			{
				type: "outcome",
				sub_types: ["break_concentration"],
				trigger: "damage_taken",
				save: {
					ability: "constitution",
					dc: { formula: "damage_taken / 2", min: 10, max: 30, round: "down" },
				},
				description:
					"Make a Constitution saving throw (DC 10 or half the damage taken, round down, whichever is higher, up to a maximum of DC 30) or lose Concentration.",
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
