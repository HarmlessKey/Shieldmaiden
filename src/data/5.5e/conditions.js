// Conditions from the D&D 5.5e (2024) SRD 5.2, modeled against src/schemas/hk-effects-schema.json
export default [
	{
		name: "Blinded",
		description: "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "auto_fail",
				sub_types: ["ability"],
				description: "Ability checks that require sight",
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
		],
	},
	{
		name: "Charmed",
		description: "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["attack"],
				description: "Can't attack the charmer or target the charmer with harmful abilities or magical effects",
			},
			{
				type: "grant_advantage",
				sub_types: ["ability", "skill"],
				description: "The charmer has advantage on social interaction checks with this creature",
			},
		],
	},
	{
		name: "Deafened",
		description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "auto_fail",
				sub_types: ["ability"],
				description: "Ability checks that require hearing",
			},
		],
	},
	{
		name: "Exhaustion 1",
		description: "Disadvantage on D20 Tests. Speed decreases by 5 feet.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["d20_test"],
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				value: -5,
			},
		],
	},
	{
		name: "Exhaustion 2",
		description: "Disadvantage on D20 Tests. Speed decreases by 10 feet.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["d20_test"],
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				value: -10,
			},
		],
	},
	{
		name: "Exhaustion 3",
		description: "Disadvantage on D20 Tests. Speed decreases by 15 feet.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["d20_test"],
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				value: -15,
			},
		],
	},
	{
		name: "Exhaustion 4",
		description: "Disadvantage on D20 Tests. Speed decreases by 20 feet.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["d20_test"],
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				value: -20,
			},
		],
	},
	{
		name: "Exhaustion 5",
		description: "Disadvantage on D20 Tests. Speed decreases by 25 feet.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["d20_test"],
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				value: -25,
			},
		],
	},
	{
		name: "Exhaustion 6",
		description: "Death.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "outcome",
				sub_types: ["death"],
			},
		],
	},
	{
		name: "Frightened",
		description: "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can't willingly move closer to the source of its fear.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["ability", "attack"],
				condition: {
					type: "line_of_sight",
					value: true,
				},
			},
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can't willingly move closer to the source of its fear",
			},
		],
	},
	{
		name: "Grappled",
		description: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated or if the creature is removed from the grappler's reach.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
		],
	},
	{
		name: "Incapacitated",
		description: "An incapacitated creature can't take any action, Bonus Action, or Reaction. It can't speak, and Concentration is broken only as normal (taking damage, etc.).",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
		],
	},
	{
		name: "Invisible",
		description: "An invisible creature is impossible to see without the aid of magic or a special sense. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
			},
			{
				type: "grant_disadvantage",
				sub_types: ["attack"],
			},
		],
	},
	{
		name: "Paralyzed",
		description: "A paralyzed creature is incapacitated and can't move or speak. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
			{
				type: "special",
				sub_types: ["incoming_crit_range"],
				condition: {
					type: "attacker_distance",
					comparator: "lte",
					value: 5,
				},
			},
		],
	},
	{
		name: "Petrified",
		description: "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance. Its weight increases by a factor of ten, and it ceases aging. The creature is incapacitated, can't move or speak, and is unaware of its surroundings. Attack rolls against the creature have advantage. The creature automatically fails Strength and Dexterity saving throws. The creature has resistance to all damage. The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
			{
				type: "defense",
				sub_types: ["r"],
				description: "Resistance to all damage",
			},
			{
				type: "defense",
				sub_types: ["i"],
				conditions: ["poisoned"],
				description: "Immune to poison and disease",
			},
		],
	},
	{
		name: "Poisoned",
		description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack", "ability"],
			},
		],
	},
	{
		name: "Prone",
		description: "A prone creature's only movement option is to crawl, unless it stands up. The creature has disadvantage on attack rolls. An attack roll against the creature has advantage if the attacker is within 5 feet of the creature, otherwise the attack roll has disadvantage.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can only crawl, unless it stands up",
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
				condition: {
					type: "attacker_distance",
					comparator: "lte",
					value: 5,
				},
			},
			{
				type: "grant_disadvantage",
				sub_types: ["attack"],
				condition: {
					type: "attacker_distance",
					comparator: "gte",
					value: 10,
				},
			},
		],
	},
	{
		name: "Restrained",
		description: "A restrained creature's speed becomes 0. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
			{
				type: "disadvantage",
				sub_types: ["save"],
				abilities: ["dexterity"],
			},
		],
	},
	{
		name: "Stunned",
		description: "A stunned creature is incapacitated, can't move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
		],
	},
	{
		name: "Unconscious",
		description: "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings. The creature drops whatever it's holding and falls prone. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		duration_type: "cancelled",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Drops whatever it's holding and falls prone",
			},
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can only crawl, unless it stands up (Prone)",
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				description: "Prone",
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
			},
			{
				type: "special",
				sub_types: ["incoming_crit_range"],
				condition: {
					type: "attacker_distance",
					comparator: "lte",
					value: 5,
				},
			},
		],
	},
	{
		name: "Dying",
		description: "A creature with 0 Hit Points and no Death Saves yet is Dying. A Dying creature is incapacitated and can't move or speak. It falls Prone and must make Death Saving Throws.",
		duration_type: "trigger",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action"],
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Falls prone and must make Death Saving Throws",
			},
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can only crawl, unless it stands up (Prone)",
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				description: "Prone",
			},
			{
				type: "grant_advantage",
				sub_types: ["attack"],
				condition: {
					type: "attacker_distance",
					comparator: "lte",
					value: 5,
				},
			},
			{
				type: "grant_disadvantage",
				sub_types: ["attack"],
				condition: {
					type: "attacker_distance",
					comparator: "gte",
					value: 10,
				},
			},
		],
	},
	{
		name: "Surprised",
		description: "A surprised creature can't move or take an action or a reaction on its first turn of combat, and it can't take a Reaction until that turn ends.",
		duration_type: "trigger",
		cancel_trigger: "end_turn_target",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction", "bonus_action", "movement"],
				description: "Can't move or take an action, bonus action, or reaction on its first turn of combat",
			},
		],
	},
];
