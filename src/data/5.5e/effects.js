// Non-condition SRD effects for D&D 5.5e (2024), modeled against src/schemas/hk-effects-schema.json
export default [
	{
		url: "concentration",
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
	{
		url: "reaction-used",
		name: "Reaction Used",
		description:
			"The creature has used its Reaction. It regains it at the start of its next turn.",
		cancelable: true,
		sub_effects: [
			{
				type: "special",
				description: "Has used its Reaction until the start of its next turn.",
			},
		],
	},
	{
		url: "burning",
		name: "Burning",
		category: "hazard",
		description:
			"A burning creature or object takes 1d4 Fire damage at the start of each of its turns. As an action, you can extinguish fire on yourself by giving yourself the Prone condition and rolling on the ground. The fire also goes out if it is doused, submerged, or smothered.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage",
				trigger: "start_turn_target",
				roll: { dice_count: 1, dice_type: 4, damage_type: "fire" },
				description: "Takes 1d4 Fire damage at the start of each of its turns.",
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
			"Each target's Hit Point maximum and current Hit Points increase by 5 for the duration (by 5 more for each spell slot level above 2).",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["max_hp"],
				value: 5,
				also_heal: true,
				description: "Hit Point maximum and current Hit Points +5",
			},
		],
	},
	{
		url: "alert",
		name: "Alert",
		category: "feature",
		description:
			"Initiative Proficiency: when you roll Initiative, you can add your Proficiency Bonus to the roll. Initiative Swap: immediately after you roll Initiative, you can swap your Initiative with that of one willing ally in the same combat.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["initiative"],
				value: { formula: "pb" },
				description: "Add your Proficiency Bonus to Initiative",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "After rolling Initiative, you can swap it with that of one willing ally",
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
			"The target's skin assumes a bark-like appearance, and the target has an Armor Class of 17 if its AC is lower than that.",
		cancelable: true,
		sub_effects: [
			{
				type: "floor",
				sub_types: ["ac"],
				value: 17,
				description: "AC 17 if its AC is lower",
			},
		],
	},
	{
		url: "enthrall",
		name: "Enthrall",
		category: "spell",
		magical: true,
		spell_level: 2,
		description:
			"A creature that fails its Wisdom saving throw has a −10 penalty to Wisdom (Perception) checks and Passive Perception until the spell ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["passive_perception"],
				value: -10,
				description: "−10 penalty to Passive Perception",
			},
			{
				type: "bonus",
				sub_types: ["skill"],
				skills: ["perception"],
				value: -10,
				description: "−10 penalty to Wisdom (Perception) checks",
			},
		],
	},
	{
		url: "false-life",
		name: "False Life",
		category: "spell",
		magical: true,
		spell_level: 1,
		description: "You gain 2d4 + 4 Temporary Hit Points (5 more for each spell slot level above 1).",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["temp_hp"],
				roll: { dice_count: 2, dice_type: 4, fixed_val: 4 },
				description: "Gains 2d4 + 4 Temporary Hit Points",
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
			"The target gains a Fly Speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft unless it can stop the fall.",
		cancelable: true,
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["fly_speed"],
				value: 60,
				description: "Fly Speed of 60 feet",
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
			"The target's Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns (Attack with one weapon attack only, Dash, Disengage, Hide, or Utilize). When the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn.",
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
				description: "+2 bonus to Armor Class",
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
					"An additional action on each turn: Attack (one weapon attack only), Dash, Disengage, Hide, or Utilize",
			},
			{
				type: "restrict",
				sub_types: ["movement", "action"],
				trigger: "on_expire",
				description: "A wave of lethargy: Incapacitated with a Speed of 0 until the end of its next turn",
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
			"The target is immune to the Frightened condition and gains Temporary Hit Points equal to the caster's spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining Temporary Hit Points from this spell.",
		cancelable: true,
		sub_effects: [
			{
				type: "defense",
				sub_types: ["i"],
				conditions: ["frightened"],
				description: "Immune to the Frightened condition",
			},
			{
				type: "fixed",
				sub_types: ["temp_hp"],
				trigger: "start_turn_target",
				value: { formula: "caster.spellcasting_mod", min: 0 },
				expires_with_effect: true,
				description: "Temporary Hit Points equal to the caster's spellcasting ability modifier",
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
		description: "The target's Speed increases by 10 feet until the spell ends.",
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
			"Until the spell ends, a target who isn't wearing armor has a base Armor Class of 13 plus its Dexterity modifier. The spell ends early if the target dons armor.",
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
			"While wearing this robe and no armor, your base Armor Class is 15 plus your Dexterity modifier, you have Advantage on saving throws against spells and other magical effects, and your spell save DC and spell attack bonus each increase by 2.",
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
		description: "A shimmering field surrounds the target, granting it a +2 bonus to Armor Class for the duration.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ac"],
				value: 2,
				description: "+2 bonus to Armor Class",
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
			"An affected target's Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can't take Reactions. On its turns it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. Its spellcasting is also hampered (see the spell). It repeats the Wisdom save at the end of each of its turns.",
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
				description: "Can't take Reactions",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description:
					"Action or Bonus Action, not both; only one attack with the Attack action; spellcasting hampered",
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
			"Whenever a target that failed its Charisma saving throw makes an attack roll or a saving throw before the spell ends, the target must subtract 1d4 from the attack roll or save.",
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
			"Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save.",
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
			"You touch a willing creature and choose a skill. Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["skill"],
				choice: "skill",
				roll: { dice_count: 1, dice_type: 4 },
				description: "Add 1d4 to ability checks using the chosen skill",
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
			"You touch a willing creature and choose a damage type: Acid, Bludgeoning, Cold, Fire, Lightning, Necrotic, Piercing, Poison, Radiant, Slashing, or Thunder. When the creature takes damage of the chosen type before the spell ends, the creature reduces the total damage taken by 1d4. A creature can benefit from this spell only once per turn.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["reduce_damage"],
				choice: "damage_type",
				roll: { dice_count: 1, dice_type: 4 },
				frequency: "once_per_turn",
				description: "Reduce damage of the chosen type by 1d4, once per turn",
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
			"The next attack roll made against the target before the end of your next turn has Advantage.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "The next attack roll against it has Advantage",
			},
		],
	},
	{
		url: "divine-favor",
		name: "Divine Favor",
		category: "spell",
		magical: true,
		spell_level: 1,
		description: "Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["weapon"],
				roll: { dice_count: 1, dice_type: 4, damage_type: "radiant" },
				description: "Weapon attacks deal an extra 1d4 Radiant damage on a hit",
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
			"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. Using a Higher-Level Spell Slot: the bonus increases to +2 with a level 3–5 spell slot. The bonus increases to +3 with a level 6+ spell slot.",
		cancelable: true,
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "damage"],
				attack_types: ["weapon"],
				value: 1,
				description: "+1 to attack and damage rolls with the weapon (+2 with a level 3–5 slot, +3 with a level 6+ slot)",
			},
		],
	},
	{
		url: "dodge",
		name: "Dodge",
		category: "feature",
		description:
			"Until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose these benefits if you have the Incapacitated condition or if your Speed is 0.",
		cancelable: true,
		ends_when: {
			type: "has_condition",
			value: "incapacitated",
			description: "You lose these benefits if you have the Incapacitated condition.",
		},
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
				condition: { subject: "counterpart", type: "can_see", description: "If it can see the attacker" },
				description: "Attack rolls against it have Disadvantage if it can see the attacker",
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
			"Assist an Attack Roll: you momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn.",
		cancelable: true,
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				consume: { uses: 1, on: "roll", scope: "effect" },
				description: "Its next attack roll against the distracted enemy has Advantage",
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
			"Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slashing damage.",
		cancelable: true,
		sub_effects: [
			{
				type: "defense",
				sub_types: ["r"],
				damage_types: ["bludgeoning", "piercing", "slashing"],
				description: "Resistance to Bludgeoning, Piercing, and Slashing damage",
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
			"For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder.",
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
			"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["floor_at_1"],
				consume: { uses: 1, on: "trigger", scope: "effect" },
				description: "The first time it would drop to 0 Hit Points, it drops to 1 Hit Point instead, and the spell ends",
			},
		],
	},
	{
		url: "uncanny-dodge",
		name: "Uncanny Dodge",
		category: "feature",
		description:
			"When an attacker that you can see hits you with an attack roll, you can take a Reaction to halve the attack's damage against you (round down).",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["halve_damage"],
				condition: { subject: "counterpart", type: "can_see", description: "If it can see the attacker" },
				description: "Reaction: halve the damage of an attack roll that hits it",
			},
		],
	},
	{
		url: "evasion",
		name: "Evasion",
		category: "feature",
		description:
			"You can nimbly dodge out of the way of certain dangers. When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You can't use this feature if you have the Incapacitated condition.",
		cancelable: true,
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["evasion"],
				abilities: ["dexterity"],
				condition: {
					type: "has_condition",
					value: "incapacitated",
					negate: true,
					description: "Not while Incapacitated",
				},
				description: "Dexterity saves for half damage: no damage on a success, half on a failure",
			},
		],
	},
	{
		url: "reliable-talent",
		name: "Reliable Talent",
		category: "feature",
		description:
			"Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10.",
		cancelable: true,
		sub_effects: [
			{
				type: "roll_floor",
				sub_types: ["skill"],
				applies_to: "die",
				value: 10,
				description: "A d20 roll of 9 or lower counts as a 10 on checks with a skill or tool proficiency",
			},
		],
	},
	{
		url: "luck",
		name: "Luck",
		category: "feature",
		description: "When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.",
		cancelable: true,
		sub_effects: [
			{
				type: "reroll",
				sub_types: ["d20_test"],
				reroll_condition: "natural 1",
				keep: "new",
				description: "Reroll a 1 on the d20 of a D20 Test, and use the new roll",
			},
		],
	},
	{
		url: "undead-fortitude",
		name: "Undead Fortitude",
		category: "monster_trait",
		description:
			"If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, the zombie drops to 1 Hit Point instead.",
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
					"At 0 Hit Points, a Constitution save (DC 5 plus the damage taken) to drop to 1 Hit Point instead, unless the damage is Radiant or from a Critical Hit",
			},
		],
	},
	{
		url: "acid-absorption",
		name: "Acid Absorption",
		category: "monster_trait",
		description:
			"Whenever the golem is subjected to Acid damage, it takes no damage and instead regains a number of Hit Points equal to the Acid damage dealt.",
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
