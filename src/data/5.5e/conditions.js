// Conditions from the D&D 5.5e (2024) SRD 5.2.1, modeled against src/schemas/hk-effects-schema.json
export default [
	{
		url: "blinded",
		name: "Blinded",
		category: "condition",
		description: "You can't see and automatically fail any ability check that requires sight. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
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
		description: "You can't attack the charmer or target the charmer with damaging abilities or magical effects. The charmer has Advantage on any ability check to interact with you socially.",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["attack"],
				description: "Can't attack the charmer or target the charmer with damaging abilities or magical effects",
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
				description: "The charmer has Advantage on ability checks to interact with you socially",
			},
		],
	},
	{
		url: "deafened",
		name: "Deafened",
		category: "condition",
		description: "You can't hear and automatically fail any ability check that requires hearing.",
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
		description: "This condition is cumulative: each time you receive it, you gain 1 Exhaustion level. When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level, and your Speed is reduced by 5 times your Exhaustion level in feet. You die if your Exhaustion level is 6. Finishing a Long Rest removes 1 level; when your Exhaustion level reaches 0, the condition ends.",
		cancelable: true,
		stacking: { mode: "level" },
		level: { initial: 1, max: 6, per_long_rest: -1, remove_at: 0 },
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["d20_test"],
				scaling: { by: "level", per_unit_value: -2 },
				description: "D20 Tests reduced by 2 × Exhaustion level",
			},
			{
				type: "bonus",
				sub_types: ["speed"],
				scaling: { by: "level", per_unit_value: -5 },
				description: "Speed reduced by 5 × Exhaustion level feet",
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
		description: "You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight. You can't willingly move closer to the source of fear.",
		cancelable: true,
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["ability", "attack"],
				condition: {
					subject: "caster",
					type: "line_of_sight",
					description: "While the source of fear is within line of sight",
				},
			},
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can't willingly move closer to the source of fear",
			},
		],
	},
	{
		url: "grappled",
		name: "Grappled",
		category: "condition",
		description: "Your Speed is 0 and can't increase. You have Disadvantage on attack rolls against any target other than the grappler. The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it. The condition ends if the grappler has the Incapacitated condition or you leave its reach.",
		cancelable: true,
		ends_when: {
			subject: "caster",
			type: "has_condition",
			value: "incapacitated",
			description: "Ends if the grappler has the Incapacitated condition.",
		},
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				condition: {
					subject: "counterpart",
					type: "is_caster",
					negate: true,
					description: "Against any target other than the grappler",
				},
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "The grappler can drag or carry you, at 1 extra foot per foot moved unless you are Tiny or two or more sizes smaller",
			},
		],
	},
	{
		url: "incapacitated",
		name: "Incapacitated",
		category: "condition",
		description: "You can't take any action, Bonus Action, or Reaction. Your Concentration is broken. You can't speak. If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll.",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["action", "bonus_action", "reaction"],
			},
			{
				type: "restrict",
				sub_types: ["concentration"],
				description: "Concentration is broken",
			},
			{
				type: "restrict",
				sub_types: ["speech"],
			},
			{
				type: "disadvantage",
				sub_types: ["initiative"],
			},
		],
	},
	{
		url: "invisible",
		name: "Invisible",
		category: "condition",
		description: "If you're Invisible when you roll Initiative, you have Advantage on the roll. You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you; any equipment you are wearing or carrying is also concealed. Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["initiative"],
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Concealed: not affected by effects that require their target to be seen, unless the effect's creator can see you",
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				condition: {
					subject: "counterpart",
					type: "can_see",
					negate: true,
				},
			},
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
				condition: {
					subject: "counterpart",
					type: "can_see",
					negate: true,
				},
			},
		],
	},
	{
		url: "paralyzed",
		name: "Paralyzed",
		category: "condition",
		description: "You have the Incapacitated condition. Your Speed is 0 and can't increase. You automatically fail Strength and Dexterity saving throws. Attack rolls against you have Advantage. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.",
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
				description: "Any attack roll that hits is a Critical Hit if the attacker is within 5 feet",
			},
		],
	},
	{
		url: "petrified",
		name: "Petrified",
		category: "condition",
		description: "You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging. You have the Incapacitated condition. Your Speed is 0 and can't increase. Attack rolls against you have Advantage. You automatically fail Strength and Dexterity saving throws. You have Resistance to all damage and Immunity to the Poisoned condition.",
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
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
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
				description: "Immunity to the Poisoned condition",
			},
		],
	},
	{
		url: "poisoned",
		name: "Poisoned",
		category: "condition",
		description: "You have Disadvantage on attack rolls and ability checks.",
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
		description: "Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself. You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["movement"],
				description: "Can only crawl, or spend half your Speed to right yourself (not possible at Speed 0)",
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
		description: "Your Speed is 0 and can't increase. Attack rolls against you have Advantage, and your attack rolls have Disadvantage. You have Disadvantage on Dexterity saving throws.",
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
		description: "You have the Incapacitated condition. You automatically fail Strength and Dexterity saving throws. Attack rolls against you have Advantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "includes",
				effect: { source: "srd", source_key: "incapacitated", name: "Incapacitated" },
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
		description: "You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone. Your Speed is 0 and can't increase. Attack rolls against you have Advantage. You automatically fail Strength and Dexterity saving throws. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you. You're unaware of your surroundings.",
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
				description: "You have the Prone condition, and remain Prone when this condition ends",
			},
			{
				type: "fixed",
				sub_types: ["speed"],
				value: 0,
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "Unaware of your surroundings; you drop whatever you're holding",
			},
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
			},
			{
				type: "auto_fail",
				sub_types: ["save"],
				abilities: ["strength", "dexterity"],
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
				description: "Any attack roll that hits is a Critical Hit if the attacker is within 5 feet",
			},
		],
	},
];
