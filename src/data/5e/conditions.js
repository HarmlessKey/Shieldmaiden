// Conditions from the D&D 5e (2014) SRD 5.1, modeled against src/schemas/hk-effects-schema.json
export default [
	{
		url: "blinded",
		name: "Blinded",
		category: "condition",
		description: "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "auto_fail",
				sub_types: ["ability"],
				context: "sight",
				description: "Ability checks that require sight",
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
		],
	},
	{
		url: "charmed",
		name: "Charmed",
		category: "condition",
		description: "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["attack"],
				description: "Can't attack the charmer or target the charmer with harmful abilities or magical effects",
			},
			{
				type: "advantage",
				sub_types: ["ability"],
				perspective: "against",
				context: "social",
				condition: {
					subject: "counterpart",
					type: "is_caster",
				},
				description: "The charmer has advantage on social interaction checks with this creature",
			},
		],
	},
	{
		url: "deafened",
		name: "Deafened",
		category: "condition",
		description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
		cancelable: true,
		sub_effects: [
			{
				type: "auto_fail",
				sub_types: ["ability"],
				context: "hearing",
				description: "Ability checks that require hearing",
			},
		],
	},
	{
		url: "exhaustion",
		name: "Exhaustion",
		category: "condition",
		description: "Exhaustion is measured in six levels, and its effects are cumulative. Level 1: disadvantage on ability checks. Level 2: speed halved. Level 3: disadvantage on attack rolls and saving throws. Level 4: hit point maximum halved. Level 5: speed reduced to 0. Level 6: death. Finishing a long rest reduces the exhaustion level by 1.",
		cancelable: true,
		stacking: { mode: "level" },
		level: { initial: 1, max: 6, per_long_rest: -1, remove_at: 0 },
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["ability"],
				min_level: 1,
			},
			{
				type: "base",
				sub_types: ["speed"],
				multiplier: 0.5,
				min_level: 2,
				description: "Speed halved",
			},
			{
				type: "disadvantage",
				sub_types: ["attack", "save"],
				min_level: 3,
			},
			{
				type: "base",
				sub_types: ["max_hp"],
				multiplier: 0.5,
				min_level: 4,
				description: "Hit point maximum halved",
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
				min_level: 5,
			},
			{
				type: "outcome",
				sub_types: ["death"],
				min_level: 6,
			},
		],
	},
	{
		url: "frightened",
		name: "Frightened",
		category: "condition",
		description: "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can't willingly move closer to the source of its fear.",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["ability", "attack"],
				condition: {
					subject: "caster",
					type: "line_of_sight",
					description: "While the source of its fear is within line of sight",
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
		url: "grappled",
		name: "Grappled",
		category: "condition",
		description: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated, or if an effect removes the grappled creature from the reach of the grappler.",
		cancelable: true,
		ends_when: {
			subject: "caster",
			type: "has_condition",
			value: "incapacitated",
			description: "Ends if the grappler is incapacitated.",
		},
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
		],
	},
	{
		url: "incapacitated",
		name: "Incapacitated",
		category: "condition",
		description: "An incapacitated creature can't take actions or reactions.",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "reaction"],
			},
		],
	},
	{
		url: "invisible",
		name: "Invisible",
		category: "condition",
		description: "An invisible creature is impossible to see without the aid of magic. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
			},
		],
	},
	{
		url: "paralyzed",
		name: "Paralyzed",
		category: "condition",
		description: "A paralyzed creature is incapacitated and can't move or speak. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		cancelable: true,
		sub_effects: [
			{
				type: "includes",
				effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" },
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "critical",
				sub_types: ["incoming_crit_range"],
				condition: {
					subject: "counterpart",
					type: "distance",
					comparator: "lte",
					value: 5,
				},
				description: "Any attack that hits is a critical hit if the attacker is within 5 feet",
			},
		],
	},
	{
		url: "petrified",
		name: "Petrified",
		category: "condition",
		description: "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance. Its weight increases by a factor of ten, and it ceases aging. The creature is incapacitated, can't move or speak, and is unaware of its surroundings. Attack rolls against the creature have advantage. The creature automatically fails Strength and Dexterity saving throws. The creature has resistance to all damage. The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
		cancelable: true,
		sub_effects: [
			{
				type: "includes",
				effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" },
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "defense",
				sub_types: ["r"],
				all_damage: true,
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
		url: "poisoned",
		name: "Poisoned",
		category: "condition",
		description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack", "ability"],
			},
		],
	},
	{
		url: "prone",
		name: "Prone",
		category: "condition",
		description: "A prone creature's only movement option is to crawl, unless it stands up. The creature has disadvantage on attack rolls. An attack roll against the creature has advantage if the attacker is within 5 feet of the creature, otherwise the attack roll has disadvantage.",
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
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
				condition: {
					subject: "counterpart",
					type: "distance",
					comparator: "lte",
					value: 5,
				},
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
				condition: {
					subject: "counterpart",
					type: "distance",
					comparator: "gt",
					value: 5,
				},
			},
		],
	},
	{
		url: "restrained",
		name: "Restrained",
		category: "condition",
		description: "A restrained creature's speed becomes 0. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.",
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
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "disadvantage",
				sub_types: ["save"],
				abilities: ["dexterity"],
			},
		],
	},
	{
		url: "stunned",
		name: "Stunned",
		category: "condition",
		description: "A stunned creature is incapacitated, can't move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "includes",
				effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" },
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Can speak only falteringly",
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
		],
	},
	{
		url: "unconscious",
		name: "Unconscious",
		category: "condition",
		description: "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings. The creature drops whatever it's holding and falls prone. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		cancelable: true,
		sub_effects: [
			{
				type: "includes",
				effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" },
			},
			{
				type: "apply_effect",
				trigger: "on_apply",
				effect: { source: "srd", source_key: "prone", name: "Prone" },
				description: "Falls prone, and stays prone when it wakes",
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Unaware of its surroundings; drops whatever it's holding",
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "critical",
				sub_types: ["incoming_crit_range"],
				condition: {
					subject: "counterpart",
					type: "distance",
					comparator: "lte",
					value: 5,
				},
				description: "Any attack that hits is a critical hit if the attacker is within 5 feet",
			},
		],
	},
];
