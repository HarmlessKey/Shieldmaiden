// Condition rules text for both editions.
// "2014" = D&D 5e (SRD 5.1), "2024" = D&D 5.5e (SRD 5.2.1)
const conditionData = [
	{
		value: "blinded",
		condition: "You can't see",
		name: "Blinded",
		effects: {
			2014: [
				"A blinded creature can't see and automatically fails any ability check that requires sight.",
				"Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
			],
			2024: [
				"Can't see. You can't see and automatically fail any ability check that requires sight.",
				"Attacks affected. Attack rolls against you have advantage, and your attack rolls have disadvantage.",
			],
		},
	},
	{
		value: "charmed",
		condition: "You are charmed",
		name: "Charmed",
		effects: {
			2014: [
				"A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
				"The charmer has advantage on any ability check to interact socially with the creature.",
			],
			2024: [
				"Can't harm the charmer. You can't attack the charmer or target the charmer with damaging abilities or magical effects.",
				"Social advantage. The charmer has advantage on any ability check to interact with you socially.",
			],
		},
	},
	{
		value: "deafened",
		condition: "You can't hear",
		name: "Deafened",
		effects: {
			2014: [
				"A deafened creature can't hear and automatically fails any ability check that requires hearing.",
			],
			2024: [
				"Can't hear. You can't hear and automatically fail any ability check that requires hearing.",
			],
		},
	},
	{
		value: "exhaustion",
		condition: "You are exhausted",
		name: "Exhaustion",
		effects: {
			2014: [
				"Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect's description.",
				"If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect's description.",
				"A creature suffers the effect of its current level of exhaustion as well as all lower levels. For example, a creature suffering level 2 exhaustion has its speed halved and has disadvantage on ability checks.",
				"An effect that removes exhaustion reduces its level as specified in the effect's description, with all exhaustion effects ending if a creature's exhaustion level is reduced below 1.  Finishing a long rest reduces a creature's exhaustion level by 1, provided that the creature has also ingested some food and drink.",
			],
			2024: [
				"Exhaustion levels. This condition is cumulative. Each time you receive it, you gain 1 exhaustion level. You die if your exhaustion level is 6.",
				"d20 tests affected. When you make a d20 test (an attack roll, ability check, or saving throw), the roll is reduced by 2 times your exhaustion level.",
				"Speed reduced. Your speed is reduced by a number of feet equal to 5 times your exhaustion level.",
				"Removing exhaustion levels. Finishing a long rest removes 1 of your exhaustion levels. When your exhaustion level reaches 0, the condition ends.",
			],
		},
	},
	{
		value: "frightened",
		condition: "You are frightened",
		name: "Frightened",
		effects: {
			2014: [
				"A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.",
				"The creature can't willingly move closer to the source of its fear.",
			],
			2024: [
				"Ability checks and attacks affected. You have disadvantage on ability checks and attack rolls while the source of fear is within line of sight.",
				"Can't approach. You can't willingly move closer to the source of fear.",
			],
		},
	},
	{
		value: "grappled",
		condition: "You are grappled",
		name: "Grappled",
		effects: {
			2014: [
				"A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
				"The condition ends if the grappler is incapacitated (see the condition).",
				"The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the thunder-wave spell.",
			],
			2024: [
				"Speed 0. Your speed is 0 and can't increase.",
				"Attacks affected. You have disadvantage on attack rolls against any target other than the grappler.",
				"Movable. The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.",
			],
		},
	},
	{
		value: "incapacitated",
		condition: "You can't take actions or reactions",
		name: "Incapacitated",
		effects: {
			2014: ["An incapacitated creature can't take actions or reactions."],
			2024: [
				"Inactive. You can't take any action, bonus action, or reaction.",
				"No concentration. Your concentration is broken.",
				"Speechless. You can't speak.",
				"Surprised. If you're incapacitated when you roll initiative, you have disadvantage on the roll.",
			],
		},
	},
	{
		value: "invisible",
		condition: "You can't be seen",
		name: "Invisible",
		effects: {
			2014: [
				"An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.",
				"Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
			],
			2024: [
				"Surprise. If you're invisible when you roll initiative, you have advantage on the roll.",
				"Concealed. You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed.",
				"Attacks affected. Attack rolls against you have disadvantage, and your attack rolls have advantage. If a creature can somehow see you, you don't gain this benefit against that creature.",
			],
		},
	},
	{
		value: "paralyzed",
		condition: "You are paralyzed",
		name: "Paralyzed",
		effects: {
			2014: [
				"A paralyzed creature is incapacitated (see the condition) and can't move or speak.",
				"The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.",
				"Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
			],
			2024: [
				"Incapacitated. You have the incapacitated condition.",
				"Speed 0. Your speed is 0 and can't increase.",
				"Saving throws affected. You automatically fail Strength and Dexterity saving throws.",
				"Attacks affected. Attack rolls against you have advantage.",
				"Automatic critical hits. Any attack roll that hits you is a critical hit if the attacker is within 5 feet of you.",
			],
		},
	},
	{
		value: "petrified",
		condition: "You are transformed into stone",
		name: "Petrified",
		effects: {
			2014: [
				"A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.",
				"The creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.",
				"Attack rolls against the creature have advantage.",
				"The creature automatically fails Strength and Dexterity saving throws.",
				"The creature has resistance to all damage.",
				"The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
			],
			2024: [
				"Turned to inanimate substance. You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.",
				"Incapacitated. You have the incapacitated condition.",
				"Speed 0. Your speed is 0 and can't increase.",
				"Attacks affected. Attack rolls against you have advantage.",
				"Saving throws affected. You automatically fail Strength and Dexterity saving throws.",
				"Resist damage. You have resistance to all damage.",
				"Poison immunity. You have immunity to the poisoned condition.",
			],
		},
	},
	{
		value: "poisoned",
		condition: "You are poisoned",
		name: "Poisoned",
		effects: {
			2014: ["A poisoned creature has disadvantage on attack rolls and ability checks."],
			2024: [
				"Ability checks and attacks affected. You have disadvantage on ability checks and attack rolls.",
			],
		},
	},
	{
		value: "prone",
		condition: "You are prone",
		name: "Prone",
		effects: {
			2014: [
				"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.",
				"The creature has disadvantage on attack rolls.",
				"An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.",
			],
			2024: [
				"Restricted movement. Your only movement options are to crawl or to spend an amount of movement equal to half your speed to right yourself and thereby end the condition.",
				"Attacks affected. You have disadvantage on attack rolls. An attack roll against you has advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has disadvantage.",
			],
		},
	},
	{
		value: "restrained",
		condition: "You are restrained",
		name: "Restrained",
		effects: {
			2014: [
				"A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
				"Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
				"The creature has disadvantage on Dexterity saving throws.",
			],
			2024: [
				"Speed 0. Your speed is 0 and can't increase.",
				"Attacks affected. Attack rolls against you have advantage, and your attack rolls have disadvantage.",
				"Saving throws affected. You have disadvantage on Dexterity saving throws.",
			],
		},
	},
	{
		value: "stunned",
		condition: "You are stunned",
		name: "Stunned",
		effects: {
			2014: [
				"A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.",
				"The creature automatically fails Strength and Dexterity saving throws.",
				"Attack rolls against the creature have advantage.",
			],
			2024: [
				"Incapacitated. You have the incapacitated condition.",
				"Saving throws affected. You automatically fail Strength and Dexterity saving throws.",
				"Attacks affected. Attack rolls against you have advantage.",
			],
		},
	},
	{
		value: "unconscious",
		condition: "You are unconscious",
		name: "Unconscious",
		effects: {
			2014: [
				"An unconscious creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings",
				"The creature drops whatever it's holding and falls prone.",
				"The creature automatically fails Strength and Dexterity saving throws.",
				"Attack rolls against the creature have advantage.",
				"Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
			],
			2024: [
				"Inert. You have the incapacitated and prone conditions, and you drop whatever you're holding. When this condition ends, you remain prone.",
				"Speed 0. Your speed is 0 and can't increase.",
				"Attacks affected. Attack rolls against you have advantage.",
				"Saving throws affected. You automatically fail Strength and Dexterity saving throws.",
				"Automatic critical hits. Any attack roll that hits you is a critical hit if the attacker is within 5 feet of you.",
				"Unaware. You're unaware of your surroundings.",
			],
		},
	},
];

// Per level effects of the exhaustion condition
const exhaustionLevelData = {
	2014: [
		"Disadvantage on ability checks",
		"Speed halved",
		"Disadvantage on attack rolls and saving throws",
		"Hit point maximum halved",
		"Speed reduced to 0",
		"Death",
	],
	2024: [
		"−2 to all d20 tests, speed −5 ft.",
		"−4 to all d20 tests, speed −10 ft.",
		"−6 to all d20 tests, speed −15 ft.",
		"−8 to all d20 tests, speed −20 ft.",
		"−10 to all d20 tests, speed −25 ft.",
		"Death",
	],
};

export const conditions = {
	computed: {
		/**
		 * Edition of the encounter that is being run ("2014" | "2024")
		 * Defaults to 2014 when no campaign edition is known.
		 */
		edition() {
			return this.$store.getters.edition || "2014";
		},
		conditionList() {
			return conditionData.map((condition) => ({
				...condition,
				effects: condition.effects[this.edition] || condition.effects["2014"],
			}));
		},
		exhaustionLevels() {
			return exhaustionLevelData[this.edition] || exhaustionLevelData["2014"];
		},
	},
	methods: {},
};
