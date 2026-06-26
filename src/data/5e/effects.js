// Non-condition SRD effects for D&D 5e (2014), modeled against src/schemas/hk-effects-schema.json
export default [
	{
		key: "concentration",
		name: "Concentration",
		description:
			"Maintaining a spell requires concentration. Concentration is broken if you cast another concentration spell, take damage and fail a Constitution saving throw (DC 10 or half the damage taken, whichever is higher), become incapacitated, or die.",
		cancelable: true,
		sub_effects: [
			{
				type: "special",
				sub_types: ["descriptive"],
				trigger: "damage_taken",
				description:
					"Make a Constitution saving throw (DC 10 or half the damage taken, whichever is higher) or lose concentration.",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				trigger: "on_zero_hp",
				description: "Concentration is automatically broken.",
			},
		],
	},
];
