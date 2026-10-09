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
	{
		url: "reaction-used",
		name: "Reaction Used",
		description:
			"The creature has used its reaction. It regains it at the start of its next turn.",
		cancelable: true,
		sub_effects: [
			{
				type: "special",
				description: "Has used its reaction until the start of its next turn.",
			},
		],
	},
	{
		url: "aid",
		name: "Aid",
		category: "spell",
		magical: true,
		spell_level: 2,
		description:
			"Each target's hit point maximum and current hit points increase by 5 for the duration (by 5 more for each slot level above 2nd).",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["max_hp"],
				value: 5,
				also_heal: true,
				description: "Hit point maximum and current hit points +5",
			},
		],
	},
	{
		url: "barkskin",
		name: "Barkskin",
		category: "spell",
		magical: true,
		spell_level: 2,
		description:
			"The target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16, regardless of what kind of armor it is wearing.",
		cancelable: true,
		sub_effects: [
			{
				type: "floor",
				sub_types: ["ac"],
				value: 16,
				description: "AC can't be less than 16",
			},
		],
	},
	{
		url: "false-life",
		name: "False Life",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"The caster gains 1d4 + 4 temporary hit points for the duration (5 more for each slot level above 1st).",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["temp_hp"],
				roll: { dice_count: 1, dice_type: 4, fixed_val: 4 },
				expires_with_effect: true,
				description: "Gains 1d4 + 4 temporary hit points",
			},
		],
	},
	{
		url: "fly",
		name: "Fly",
		category: "spell",
		magical: true,
		spell_level: 3,
		description:
			"The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["fly_speed"],
				value: 60,
				description: "Flying speed of 60 feet",
			},
		],
	},
	{
		url: "gauntlets-of-ogre-power",
		name: "Gauntlets of Ogre Power",
		category: "item",
		magical: true,
		description:
			"Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is already 19 or higher.",
		cancelable: true,
		sub_effects: [
			{
				type: "floor",
				sub_types: ["ability_score"],
				abilities: ["strength"],
				value: 19,
				description: "Strength score is 19 (no effect if it is already higher)",
			},
		],
	},
	{
		url: "haste",
		name: "Haste",
		category: "spell",
		magical: true,
		spell_level: 3,
		description:
			"The target's speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns (Attack with one weapon attack only, Dash, Disengage, Hide, or Use an Object). When the spell ends, the target can't move or take actions until after its next turn.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["speed"],
				multiplier: 2,
				description: "Speed doubled",
			},
			{
				type: "bonus",
				sub_types: ["ac"],
				value: 2,
				description: "+2 bonus to AC",
			},
			{
				type: "advantage",
				sub_types: ["save"],
				abilities: ["dexterity"],
				description: "Advantage on Dexterity saving throws",
			},
			{
				type: "grant_action",
				sub_types: ["extra_action"],
				allowed_actions: ["attack_one", "dash", "disengage", "hide", "utilize"],
				description:
					"An additional action on each turn: Attack (one weapon attack only), Dash, Disengage, Hide, or Use an Object",
			},
			{
				type: "restrict",
				sub_types: ["movement", "action"],
				trigger: "on_expire",
				description: "A wave of lethargy: can't move or take actions until after its next turn",
			},
		],
	},
	{
		url: "heroism",
		name: "Heroism",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"The target is immune to being frightened and gains temporary hit points equal to the caster's spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining temporary hit points from this spell.",
		cancelable: true,
		sub_effects: [
			{
				type: "defense",
				sub_types: ["i"],
				conditions: ["frightened"],
				description: "Immune to being frightened",
			},
			{
				type: "fixed",
				sub_types: ["temp_hp"],
				trigger: "start_turn_target",
				value: { formula: "caster.spellcasting_mod", min: 0 },
				expires_with_effect: true,
				description: "Temporary hit points equal to the caster's spellcasting ability modifier",
			},
		],
	},
	{
		url: "ioun-stone-strength",
		name: "Ioun Stone (Strength)",
		category: "item",
		magical: true,
		description:
			"Your Strength score increases by 2, to a maximum of 20, while this stone orbits your head.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ability_score"],
				abilities: ["strength"],
				value: 2,
				description: "Strength score +2",
			},
			{
				type: "cap",
				sub_types: ["ability_score"],
				abilities: ["strength"],
				value: 20,
				description: "Strength score to a maximum of 20",
			},
		],
	},
	{
		url: "longstrider",
		name: "Longstrider",
		category: "spell",
		magical: true,
		spell_level: 1,
		description: "The target's speed increases by 10 feet until the spell ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["speed"],
				value: 10,
				description: "Speed +10 feet",
			},
		],
	},
	{
		url: "mage-armor",
		name: "Mage Armor",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"A target who isn't wearing armor has a base AC of 13 + its Dexterity modifier. The spell ends if the target dons armor or if the caster dismisses it.",
		cancelable: true,
		sub_effects: [
			{
				type: "base",
				sub_types: ["ac"],
				value: { formula: "13 + dex_mod" },
				description: "Base AC 13 + Dexterity modifier",
			},
		],
	},
	{
		url: "robe-of-the-archmagi",
		name: "Robe of the Archmagi",
		category: "item",
		magical: true,
		description:
			"While wearing this robe and not wearing armor, your base AC is 15 + your Dexterity modifier, you have advantage on saving throws against spells and other magical effects, and your spell save DC and spell attack bonus each increase by 2.",
		cancelable: true,
		sub_effects: [
			{
				type: "base",
				sub_types: ["ac"],
				value: { formula: "15 + dex_mod" },
				description: "Base AC 15 + Dexterity modifier (when not wearing armor)",
			},
			{
				type: "advantage",
				sub_types: ["save"],
				source: { magical: true },
				description: "Advantage on saving throws against spells and other magical effects",
			},
			{
				type: "bonus",
				sub_types: ["spell_save_dc", "spell_attack"],
				value: 2,
				description: "Spell save DC and spell attack bonus +2",
			},
		],
	},
	{
		url: "shield-of-faith",
		name: "Shield of Faith",
		category: "spell",
		magical: true,
		spell_level: 1,
		description: "A shimmering field surrounds the target, granting it a +2 bonus to AC for the duration.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ac"],
				value: 2,
				description: "+2 bonus to AC",
			},
		],
	},
	{
		url: "slow",
		name: "Slow",
		category: "spell",
		magical: true,
		spell_level: 3,
		description:
			"An affected target's speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can't use reactions. On its turn it can use either an action or a bonus action, not both, and it can make only one melee or ranged attack. A spell with a casting time of 1 action may fail to take effect until its next turn. It repeats the Wisdom save at the end of each of its turns.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["speed"],
				multiplier: 0.5,
				description: "Speed halved",
			},
			{
				type: "bonus",
				sub_types: ["ac"],
				value: -2,
				description: "−2 penalty to AC",
			},
			{
				type: "bonus",
				sub_types: ["save"],
				abilities: ["dexterity"],
				value: -2,
				description: "−2 penalty to Dexterity saving throws",
			},
			{
				type: "restrict",
				sub_types: ["reaction"],
				description: "Can't use reactions",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description:
					"Action or bonus action, not both; only one melee or ranged attack; spells with a casting time of 1 action may be delayed",
			},
		],
	},
	{
		url: "bane",
		name: "Bane",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"Whenever a target that failed its Charisma saving throw makes an attack roll or a saving throw before the spell ends, it must roll a d4 and subtract the number rolled from the attack roll or saving throw.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "save"],
				roll: { dice_count: 1, dice_type: 4 },
				multiplier: -1,
				description: "Subtract 1d4 from attack rolls and saving throws",
			},
		],
	},
	{
		url: "bless",
		name: "Bless",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "save"],
				roll: { dice_count: 1, dice_type: 4 },
				description: "Add 1d4 to attack rolls and saving throws",
			},
		],
	},
	{
		url: "guidance",
		name: "Guidance",
		category: "spell",
		magical: true,
		spell_level: 0,
		description:
			"Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ability"],
				roll: { dice_count: 1, dice_type: 4 },
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "Add 1d4 to one ability check, then the spell ends",
			},
		],
	},
	{
		url: "resistance",
		name: "Resistance",
		category: "spell",
		magical: true,
		spell_level: 0,
		description:
			"Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the saving throw. The spell then ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["save"],
				roll: { dice_count: 1, dice_type: 4 },
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "Add 1d4 to one saving throw, then the spell ends",
			},
		],
	},
	{
		url: "guiding-bolt",
		name: "Guiding Bolt",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"The next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "The next attack roll against it has advantage",
			},
		],
	},
	{
		url: "divine-favor",
		name: "Divine Favor",
		category: "spell",
		magical: true,
		spell_level: 1,
		description:
			"Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["weapon"],
				roll: { dice_count: 1, dice_type: 4, damage_type: "radiant" },
				description: "Weapon attacks deal an extra 1d4 radiant damage on a hit",
			},
		],
	},
	{
		url: "magic-weapon",
		name: "Magic Weapon",
		category: "spell",
		magical: true,
		spell_level: 2,
		description:
			"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. At Higher Levels: when you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "damage"],
				attack_types: ["weapon"],
				value: 1,
				description: "+1 to attack and damage rolls with the weapon (+2 with a 4th-level slot, +3 with a 6th-level slot)",
			},
		],
	},
	{
		url: "dodge",
		name: "Dodge",
		category: "feature",
		description:
			"Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage. You lose this benefit if you are incapacitated or if your speed drops to 0.",
		cancelable: true,
		ends_when: {
			type: "has_condition",
			value: "incapacitated",
			description: "You lose this benefit if you are incapacitated.",
		},
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
				condition: { subject: "counterpart", type: "can_see", description: "If it can see the attacker" },
				description: "Attack rolls against it have disadvantage if it can see the attacker",
			},
			{
				type: "advantage",
				sub_types: ["save"],
				abilities: ["dexterity"],
				description: "Advantage on Dexterity saving throws",
			},
		],
	},
	{
		url: "help",
		name: "Help",
		category: "feature",
		description:
			"You aid a friendly creature in attacking a creature within 5 feet of you. If your ally attacks the target before your next turn, the first attack roll is made with advantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "Its first attack roll against the helped-against target has advantage",
			},
		],
	},
	{
		url: "stoneskin",
		name: "Stoneskin",
		category: "spell",
		magical: true,
		spell_level: 4,
		description:
			"This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.",
		cancelable: true,
		sub_effects: [
			{
				type: "defense",
				sub_types: ["r"],
				damage_types: ["bludgeoning", "piercing", "slashing"],
				bypass: ["magical"],
				description: "Resistance to nonmagical bludgeoning, piercing, and slashing damage",
			},
		],
	},
	{
		url: "protection-from-energy",
		name: "Protection from Energy",
		category: "spell",
		magical: true,
		spell_level: 3,
		description:
			"For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.",
		cancelable: true,
		sub_effects: [
			{
				type: "defense",
				sub_types: ["r"],
				choice: "damage_type",
				damage_types: ["acid", "cold", "fire", "lightning", "thunder"],
				description: "Resistance to the chosen damage type",
			},
		],
	},
	{
		url: "death-ward",
		name: "Death Ward",
		category: "spell",
		magical: true,
		spell_level: 4,
		description:
			"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["floor_at_1"],
				consume: { uses: 1, on: "trigger", scope: "effect" },
				description: "The first time it would drop to 0 hit points from damage, it drops to 1 hit point instead, and the spell ends",
			},
		],
	},
	{
		url: "uncanny-dodge",
		name: "Uncanny Dodge",
		category: "feature",
		description:
			"When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["halve_damage"],
				condition: { subject: "counterpart", type: "can_see", description: "If it can see the attacker" },
				description: "Reaction: halve the damage of an attack that hits it",
			},
		],
	},
	{
		url: "evasion",
		name: "Evasion",
		category: "feature",
		description:
			"You can nimbly dodge out of the way of certain area effects, such as a red dragon's fiery breath or an ice storm spell. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["evasion"],
				abilities: ["dexterity"],
				description: "Dexterity saves for half damage: no damage on a success, half on a failure",
			},
		],
	},
	{
		url: "reliable-talent",
		name: "Reliable Talent",
		category: "feature",
		description:
			"Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.",
		cancelable: true,
		sub_effects: [
			{
				type: "roll_floor",
				sub_types: ["skill"],
				applies_to: "die",
				value: 10,
				description: "A d20 roll of 9 or lower counts as a 10 on checks that add the proficiency bonus",
			},
		],
	},
	{
		url: "luck",
		name: "Lucky",
		category: "feature",
		description:
			"When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.",
		cancelable: true,
		sub_effects: [
			{
				type: "reroll",
				sub_types: ["attack", "ability", "save"],
				reroll_condition: "natural 1",
				keep: "new",
				description: "Reroll a 1 on the d20 for an attack roll, ability check, or saving throw, and use the new roll",
			},
		],
	},
	{
		url: "undead-fortitude",
		name: "Undead Fortitude",
		category: "monster_trait",
		description:
			"If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["floor_at_1"],
				except_damage_types: ["radiant"],
				save: {
					ability: "constitution",
					dc: { formula: "5 + damage_taken" },
				},
				description:
					"At 0 hit points, a Constitution save (DC 5 + the damage taken) to drop to 1 hit point instead, unless the damage is radiant or from a critical hit",
			},
		],
	},
	{
		url: "acid-absorption",
		name: "Acid Absorption",
		category: "monster_trait",
		description:
			"Whenever the golem is subjected to acid damage, it takes no damage and instead regains a number of hit points equal to the acid damage dealt.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["absorb"],
				damage_types: ["acid"],
				description: "Acid damage heals it instead",
			},
		],
	},
];
