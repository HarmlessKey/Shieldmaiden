// Non-condition SRD effects for D&D 5e (2014, SRD 5.1) and 5.5e (2024, SRD 5.2.1), modeled
// against src/schemas/hk-effects-schema.json.
//
// Editions:
// - An entry without `edition` is used in campaigns of both editions. Only entries whose
//   mechanics and description hold under both editions' rules go without it: the basic
//   effects and Reaction Used.
// - Effects are generic: an item or spell that is only a plain bonus (Gauntlets of Ogre Power,
//   Shield of Faith) is not an entry of its own. It uses a basic effect with the number fixed
//   by its link (effects plan steps 6–7).
// - An entry that quotes or summarises one edition's rules text has `edition: "5e"` or
//   `edition: "5.5e"` and is only used in campaigns of that edition, even when the other
//   edition's mechanics are the same. The two versions of an effect share their `url`.
// - Within an edition (the entries without `edition`, that edition's entries and that
//   edition's conditions) a `url` occurs once. Check with
//   `node scripts/validate-effects-data/validate.mjs`.
//
// Order: shared entries first, then the edition-specific ones with the 5e version above the
// 5.5e version.

export default [
	// ---- Shared: tracker effects ----
	{
		url: "reaction-used",
		name: "Reaction Used",
		description: "The creature has used its Reaction. It regains it at the start of its next turn.",
		sub_effects: [
			{
				type: "special",
				description: "Has used its Reaction until the start of its next turn.",
			},
		],
	},

	// ---- Shared: basic effects, completed by choices when applied ----
	{
		url: "armor-class-bonus",
		name: "Armor Class Bonus",
		description: "A bonus to Armor Class. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ac"],
				choice: "value",
				description: "Bonus to Armor Class",
			},
		],
	},
	{
		url: "armor-class-minimum",
		name: "Armor Class Minimum",
		description:
			"Armor Class can't be lower than a number, chosen when the effect is applied. A higher Armor Class stays as it is.",
		sub_effects: [
			{
				type: "floor",
				sub_types: ["ac"],
				choice: "value",
				description: "Armor Class is at least the chosen number",
			},
		],
	},
	{
		url: "attack-roll-bonus",
		name: "Attack Roll Bonus",
		description: "A bonus to attack rolls. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack"],
				choice: "value",
				description: "Bonus to attack rolls",
			},
		],
	},
	{
		url: "damage-roll-bonus",
		name: "Damage Roll Bonus",
		description: "A bonus to damage rolls. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["damage"],
				choice: "value",
				description: "Bonus to damage rolls",
			},
		],
	},
	{
		url: "saving-throw-bonus",
		name: "Saving Throw Bonus",
		description:
			"A bonus to all saving throws. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["save"],
				choice: "value",
				description: "Bonus to saving throws",
			},
		],
	},
	{
		url: "ability-saving-throw-bonus",
		name: "Saving Throw Bonus (One Ability)",
		description:
			"A bonus to the saving throws of one ability. The ability and the number are chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["save"],
				choice: ["ability", "value"],
				description: "Bonus to saving throws with the chosen ability",
			},
		],
	},
	{
		url: "ability-check-bonus",
		name: "Ability Check Bonus",
		description:
			"A bonus to the ability checks of one ability. The ability and the number are chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ability"],
				choice: ["ability", "value"],
				description: "Bonus to ability checks with the chosen ability",
			},
		],
	},
	{
		url: "skill-bonus",
		name: "Skill Bonus",
		description:
			"A bonus to checks with one skill. The skill and the number are chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["skill"],
				choice: ["skill", "value"],
				description: "Bonus to checks with the chosen skill",
			},
		],
	},
	{
		url: "initiative-bonus",
		name: "Initiative Bonus",
		description: "A bonus to Initiative. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["initiative"],
				choice: "value",
				description: "Bonus to Initiative",
			},
		],
	},
	{
		url: "speed-bonus",
		name: "Speed Bonus",
		description:
			"A bonus to Speed in feet. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["speed"],
				choice: "value",
				description: "Bonus to Speed",
			},
		],
	},
	{
		url: "fly-speed",
		name: "Fly Speed",
		description: "A Fly Speed in feet, chosen when the effect is applied.",
		sub_effects: [
			{
				type: "fixed",
				sub_types: ["fly_speed"],
				choice: "value",
				description: "Fly Speed of the chosen number of feet",
			},
		],
	},
	{
		url: "ability-score-bonus",
		name: "Ability Score Bonus",
		description:
			"A bonus to one ability score. The ability and the number are chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ability_score"],
				choice: ["ability", "value"],
				description: "Bonus to the chosen ability score",
			},
		],
	},
	{
		url: "ability-score-minimum",
		name: "Ability Score Minimum",
		description:
			"One ability score can't be lower than a number. The ability and the number are chosen when the effect is applied; a higher score stays as it is.",
		sub_effects: [
			{
				type: "floor",
				sub_types: ["ability_score"],
				choice: ["ability", "value"],
				description: "The chosen ability score is at least the chosen number",
			},
		],
	},
	{
		url: "spell-save-dc-bonus",
		name: "Spell Save DC Bonus",
		description:
			"A bonus to the spell save DC. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["spell_save_dc"],
				choice: "value",
				description: "Bonus to the spell save DC",
			},
		],
	},
	{
		url: "spell-attack-bonus",
		name: "Spell Attack Bonus",
		description:
			"A bonus to the spell attack bonus. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["spell_attack"],
				choice: "value",
				description: "Bonus to spell attacks",
			},
		],
	},
	{
		url: "passive-perception-bonus",
		name: "Passive Perception Bonus",
		description:
			"A bonus to Passive Perception. The number is chosen when the effect is applied; a negative number is a penalty.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["passive_perception"],
				choice: "value",
				description: "Bonus to Passive Perception",
			},
		],
	},
	{
		url: "hit-point-maximum-bonus",
		name: "Hit Point Maximum Bonus",
		description:
			"A bonus to the Hit Point maximum. The number is chosen when the effect is applied. An increase also raises current Hit Points by the same amount; a negative number reduces the maximum.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["max_hp"],
				choice: "value",
				also_heal: true,
				description: "Bonus to the Hit Point maximum, and current Hit Points rise with it",
			},
		],
	},
	{
		url: "hit-point-maximum-reduction",
		name: "Hit Point Maximum Reduction",
		description:
			"The Hit Point maximum is reduced by an amount chosen when the effect is applied, often the damage taken from a draining attack.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["max_hp"],
				choice: "value",
				multiplier: -1,
				description: "Hit Point maximum reduced by the chosen amount",
			},
		],
	},
	{
		url: "no-healing",
		name: "No Healing",
		description: "Can't regain Hit Points.",
		sub_effects: [
			{
				type: "cap",
				sub_types: ["healing_received"],
				value: 0,
				description: "Can't regain Hit Points",
			},
		],
	},
	{
		url: "speed-halved",
		name: "Speed Halved",
		description: "Speed is halved.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["speed"],
				multiplier: 0.5,
				description: "Speed halved",
			},
		],
	},
	{
		url: "no-reactions",
		name: "No Reactions",
		description: "Can't take Reactions.",
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["reaction"],
				description: "Can't take Reactions",
			},
		],
	},
	{
		url: "damage-over-time",
		name: "Damage Over Time",
		description:
			"Takes damage at the start of each of its turns. The damage type and the amount are chosen when the effect is applied.",
		sub_effects: [
			{
				type: "damage",
				trigger: "start_turn_target",
				choice: ["damage_type", "value"],
				description: "Takes the chosen damage at the start of each of its turns",
			},
		],
	},
	{
		url: "magic-resistance",
		name: "Magic Resistance",
		description: "Advantage on saving throws against spells and other magical effects.",
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["save"],
				source: { magical: true },
				description: "Advantage on saving throws against spells and other magical effects",
			},
		],
	},
	{
		url: "advantage-on-saving-throws",
		name: "Advantage on Saving Throws",
		description: "Advantage on saving throws with one ability, chosen when the effect is applied.",
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["save"],
				choice: "ability",
				description: "Advantage on saving throws with the chosen ability",
			},
		],
	},
	{
		url: "disadvantage-on-saving-throws",
		name: "Disadvantage on Saving Throws",
		description: "Disadvantage on saving throws with one ability, chosen when the effect is applied.",
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["save"],
				choice: "ability",
				description: "Disadvantage on saving throws with the chosen ability",
			},
		],
	},
	{
		url: "advantage-on-ability-checks",
		name: "Advantage on Ability Checks",
		description: "Advantage on ability checks with one ability, chosen when the effect is applied.",
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["ability"],
				choice: "ability",
				description: "Advantage on ability checks with the chosen ability",
			},
		],
	},
	{
		url: "disadvantage-on-ability-checks",
		name: "Disadvantage on Ability Checks",
		description: "Disadvantage on ability checks with one ability, chosen when the effect is applied.",
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["ability"],
				choice: "ability",
				description: "Disadvantage on ability checks with the chosen ability",
			},
		],
	},
	{
		url: "advantage-on-attack-rolls",
		name: "Advantage on Attack Rolls",
		description: "Advantage on its attack rolls.",
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				description: "Advantage on attack rolls",
			},
		],
	},
	{
		url: "disadvantage-on-attack-rolls",
		name: "Disadvantage on Attack Rolls",
		description: "Disadvantage on its attack rolls.",
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack"],
				description: "Disadvantage on attack rolls",
			},
		],
	},
	{
		url: "attacks-against-have-advantage",
		name: "Attacks Against Have Advantage",
		description: "Attack rolls against it have Advantage.",
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["attack"],
				perspective: "against",
				description: "Attack rolls against it have Advantage",
			},
		],
	},
	{
		url: "attacks-against-have-disadvantage",
		name: "Attacks Against Have Disadvantage",
		description: "Attack rolls against it have Disadvantage.",
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["attack"],
				perspective: "against",
				description: "Attack rolls against it have Disadvantage",
			},
		],
	},
	{
		url: "damage-resistance",
		name: "Damage Resistance",
		description: "Resistance to one damage type, chosen when the effect is applied: that damage is halved.",
		sub_effects: [
			{
				type: "defense",
				sub_types: ["r"],
				choice: "damage_type",
				description: "Resistance to the chosen damage type",
			},
		],
	},
	{
		url: "damage-vulnerability",
		name: "Damage Vulnerability",
		description: "Vulnerability to one damage type, chosen when the effect is applied: that damage is doubled.",
		sub_effects: [
			{
				type: "defense",
				sub_types: ["v"],
				choice: "damage_type",
				description: "Vulnerability to the chosen damage type",
			},
		],
	},
	{
		url: "damage-immunity",
		name: "Damage Immunity",
		description: "Immunity to one damage type, chosen when the effect is applied: that damage is ignored.",
		sub_effects: [
			{
				type: "defense",
				sub_types: ["i"],
				choice: "damage_type",
				description: "Immunity to the chosen damage type",
			},
		],
	},
	{
		url: "damage-reduction",
		name: "Damage Reduction",
		description:
			"Damage of one type is reduced by a fixed amount. The damage type and the amount are chosen when the effect is applied.",
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["reduce_damage"],
				choice: ["damage_type", "value"],
				description: "Damage of the chosen type is reduced by the chosen amount",
			},
		],
	},
	{
		url: "absorption",
		name: "Absorption",
		description:
			"Whenever it is subjected to damage of one type, chosen when the effect is applied, it takes no damage and instead regains a number of Hit Points equal to the damage dealt.",
		sub_effects: [
			{
				type: "damage_modifier",
				sub_types: ["absorb"],
				choice: "damage_type",
				description: "Damage of the chosen type heals it instead",
			},
		],
	},

	// ---- Edition-specific ----
	{
		url: "concentration",
		edition: "5e",
		name: "Concentration",
		description:
			"Maintaining a spell requires concentration. Concentration is broken if you cast another spell that requires concentration, take damage and fail a Constitution saving throw (DC 10 or half the damage taken, whichever is higher), are incapacitated, or die.",
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
		url: "concentration",
		edition: "5.5e",
		name: "Concentration",
		description:
			"Some spells and other effects require Concentration to remain active. Concentration ends if you start casting another spell or activate another effect that requires Concentration, take damage and fail a Constitution saving throw (DC 10 or half the damage taken, round down, whichever is higher, up to a maximum DC of 30), have the Incapacitated condition, or die.",
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
		url: "burning",
		edition: "5.5e",
		name: "Burning",
		description:
			"A burning creature or object takes 1d4 Fire damage at the start of each of its turns. As an action, you can extinguish fire on yourself by giving yourself the Prone condition and rolling on the ground. The fire also goes out if it is doused, submerged, or smothered.",
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
		url: "surprised",
		edition: "5e",
		name: "Surprised",
		description:
			"If you're surprised, you can't move or take an action on your first turn of the combat, and you can't take a reaction until that turn ends. Apply it until the end of its next turn.",
		sub_effects: [
			{
				type: "restrict",
				sub_types: ["movement", "action", "reaction"],
				description: "Can't move or take an action on its first turn, and can't take a reaction until that turn ends",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				trigger: "start_turn_target",
				description: "Is surprised: can't move or take an action this turn, and can't take a reaction until it ends",
			},
		],
	},
	{
		url: "surprised",
		edition: "5.5e",
		name: "Surprised",
		description:
			"If a combatant is surprised when combat starts, it has Disadvantage on its Initiative roll.",
		sub_effects: [
			{
				type: "disadvantage",
				sub_types: ["initiative"],
				description: "Disadvantage on the Initiative roll",
			},
		],
	},
	{
		url: "alert",
		edition: "5.5e",
		name: "Alert",
		description:
			"Initiative Proficiency: when you roll Initiative, you can add your Proficiency Bonus to the roll. Initiative Swap: immediately after you roll Initiative, you can swap your Initiative with that of one willing ally in the same combat.",
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
		url: "enthrall",
		edition: "5.5e",
		name: "Enthrall",
		description:
			"A creature that fails its Wisdom saving throw has a −10 penalty to Wisdom (Perception) checks and Passive Perception until the spell ends.",
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
		edition: "5e",
		name: "False Life",
		description:
			"The caster gains 1d4 + 4 temporary hit points for the duration (5 more for each slot level above 1st).",
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
		url: "false-life",
		edition: "5.5e",
		name: "False Life",
		description: "You gain 2d4 + 4 Temporary Hit Points (5 more for each spell slot level above 1).",
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
		url: "haste",
		edition: "5e",
		name: "Haste",
		description:
			"The target's speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns (Attack with one weapon attack only, Dash, Disengage, Hide, or Use an Object). When the spell ends, the target can't move or take actions until after its next turn.",
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
		url: "haste",
		edition: "5.5e",
		name: "Haste",
		description:
			"The target's Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns (Attack with one weapon attack only, Dash, Disengage, Hide, or Utilize). When the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn.",
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
		edition: "5e",
		name: "Heroism",
		description:
			"The target is immune to being frightened and gains temporary hit points equal to the caster's spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining temporary hit points from this spell.",
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
		url: "heroism",
		edition: "5.5e",
		name: "Heroism",
		description:
			"The target is immune to the Frightened condition and gains Temporary Hit Points equal to the caster's spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining Temporary Hit Points from this spell.",
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
		url: "mage-armor",
		edition: "5e",
		name: "Mage Armor",
		description:
			"A target who isn't wearing armor has a base AC of 13 + its Dexterity modifier. The spell ends if the target dons armor or if the caster dismisses it.",
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
		url: "mage-armor",
		edition: "5.5e",
		name: "Mage Armor",
		description:
			"Until the spell ends, a target who isn't wearing armor has a base Armor Class of 13 plus its Dexterity modifier. The spell ends early if the target dons armor.",
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
		url: "slow",
		edition: "5e",
		name: "Slow",
		description:
			"An affected target's speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can't use reactions. On its turn it can use either an action or a bonus action, not both, and it can make only one melee or ranged attack. A spell with a casting time of 1 action may fail to take effect until its next turn. It repeats the Wisdom save at the end of each of its turns.",
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
		url: "slow",
		edition: "5.5e",
		name: "Slow",
		description:
			"An affected target's Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can't take Reactions. On its turns it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. Its spellcasting is also hampered (see the spell). It repeats the Wisdom save at the end of each of its turns.",
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
				description: "Action or Bonus Action, not both; only one attack with the Attack action; spellcasting hampered",
			},
		],
	},
	{
		url: "bane",
		edition: "5e",
		name: "Bane",
		description:
			"Whenever a target that failed its Charisma saving throw makes an attack roll or a saving throw before the spell ends, it must roll a d4 and subtract the number rolled from the attack roll or saving throw.",
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
		url: "bane",
		edition: "5.5e",
		name: "Bane",
		description:
			"Whenever a target that failed its Charisma saving throw makes an attack roll or a saving throw before the spell ends, the target must subtract 1d4 from the attack roll or save.",
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
		edition: "5e",
		name: "Bless",
		description:
			"Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",
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
		url: "bless",
		edition: "5.5e",
		name: "Bless",
		description:
			"Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save.",
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
		edition: "5e",
		name: "Guidance",
		description:
			"Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.",
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
		url: "guidance",
		edition: "5.5e",
		name: "Guidance",
		description:
			"You touch a willing creature and choose a skill. Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill.",
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
		edition: "5e",
		name: "Resistance",
		description:
			"Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the saving throw. The spell then ends.",
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
		url: "resistance",
		edition: "5.5e",
		name: "Resistance",
		description:
			"You touch a willing creature and choose a damage type: Acid, Bludgeoning, Cold, Fire, Lightning, Necrotic, Piercing, Poison, Radiant, Slashing, or Thunder. When the creature takes damage of the chosen type before the spell ends, the creature reduces the total damage taken by 1d4. A creature can benefit from this spell only once per turn.",
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
		edition: "5e",
		name: "Guiding Bolt",
		description:
			"The next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.",
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
		url: "guiding-bolt",
		edition: "5.5e",
		name: "Guiding Bolt",
		description: "The next attack roll made against the target before the end of your next turn has Advantage.",
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
		edition: "5e",
		name: "Divine Favor",
		description:
			"Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["weapon"],
				roll: { dice_count: 1, dice_type: 4, damage_type: "radiant", magical: true },
				description: "Weapon attacks deal an extra 1d4 radiant damage on a hit",
			},
		],
	},
	{
		url: "divine-favor",
		edition: "5.5e",
		name: "Divine Favor",
		description: "Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["weapon"],
				roll: { dice_count: 1, dice_type: 4, damage_type: "radiant", magical: true },
				description: "Weapon attacks deal an extra 1d4 Radiant damage on a hit",
			},
		],
	},
	{
		url: "magic-weapon",
		edition: "5e",
		name: "Magic Weapon",
		description:
			"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. At Higher Levels: when you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "damage"],
				attack_types: ["weapon"],
				value: 1,
				// The damage bonus is magical
				roll: { magical: true },
				description: "+1 to attack and damage rolls with the weapon (+2 with a 4th-level slot, +3 with a 6th-level slot)",
			},
		],
	},
	{
		url: "magic-weapon",
		edition: "5.5e",
		name: "Magic Weapon",
		description:
			"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. Using a Higher-Level Spell Slot: the bonus increases to +2 with a level 3–5 spell slot. The bonus increases to +3 with a level 6+ spell slot.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["attack", "damage"],
				attack_types: ["weapon"],
				value: 1,
				// The damage bonus is magical
				roll: { magical: true },
				description: "+1 to attack and damage rolls with the weapon (+2 with a level 3–5 slot, +3 with a level 6+ slot)",
			},
		],
	},
	{
		url: "dodge",
		edition: "5e",
		name: "Dodge",
		description:
			"Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage. You lose this benefit if you are incapacitated or if your speed drops to 0.",
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
		url: "dodge",
		edition: "5.5e",
		name: "Dodge",
		description:
			"Until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose these benefits if you have the Incapacitated condition or if your Speed is 0.",
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
		edition: "5e",
		name: "Help",
		description:
			"You aid a friendly creature in attacking a creature within 5 feet of you. If your ally attacks the target before your next turn, the first attack roll is made with advantage.",
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
		url: "help",
		edition: "5.5e",
		name: "Help",
		description:
			"Assist an Attack Roll: you momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn.",
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
		edition: "5e",
		name: "Stoneskin",
		description:
			"This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.",
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
		url: "stoneskin",
		edition: "5.5e",
		name: "Stoneskin",
		description:
			"Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slashing damage.",
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
		edition: "5e",
		name: "Protection from Energy",
		description:
			"For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.",
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
		url: "protection-from-energy",
		edition: "5.5e",
		name: "Protection from Energy",
		description:
			"For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder.",
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
		edition: "5e",
		name: "Death Ward",
		description:
			"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.",
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
		url: "death-ward",
		edition: "5.5e",
		name: "Death Ward",
		description:
			"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends.",
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
		edition: "5e",
		name: "Uncanny Dodge",
		description:
			"When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
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
		url: "uncanny-dodge",
		edition: "5.5e",
		name: "Uncanny Dodge",
		description:
			"When an attacker that you can see hits you with an attack roll, you can take a Reaction to halve the attack's damage against you (round down).",
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
		edition: "5e",
		name: "Evasion",
		description:
			"You can nimbly dodge out of the way of certain area effects, such as a red dragon's fiery breath or an ice storm spell. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.",
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
		url: "evasion",
		edition: "5.5e",
		name: "Evasion",
		description:
			"You can nimbly dodge out of the way of certain dangers. When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You can't use this feature if you have the Incapacitated condition.",
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
		edition: "5e",
		name: "Reliable Talent",
		description:
			"Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.",
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
		url: "reliable-talent",
		edition: "5.5e",
		name: "Reliable Talent",
		description:
			"Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10.",
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
		edition: "5e",
		name: "Lucky",
		description:
			"When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.",
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
		url: "luck",
		edition: "5.5e",
		name: "Luck",
		description: "When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.",
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
		edition: "5e",
		name: "Undead Fortitude",
		description:
			"If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.",
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
		url: "undead-fortitude",
		edition: "5.5e",
		name: "Undead Fortitude",
		description:
			"If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, the zombie drops to 1 Hit Point instead.",
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
		url: "hex",
		edition: "5.5e",
		name: "Hex",
		description:
			"You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.",
		sub_effects: [
			{
				type: "damage",
				trigger: "on_hit_taken",
				trigger_filter: { by: "caster" },
				roll: { dice_count: 1, dice_type: 6, damage_type: "necrotic" },
				description: "Takes an extra 1d6 Necrotic damage whenever the caster hits it with an attack roll",
			},
			{
				type: "disadvantage",
				sub_types: ["ability"],
				choice: "ability",
				description: "Disadvantage on ability checks with the chosen ability",
			},
		],
	},
	{
		url: "hunters-mark",
		edition: "5e",
		name: "Hunter's Mark",
		description:
			"You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.",
		sub_effects: [
			{
				type: "damage",
				trigger: "on_hit_taken",
				trigger_filter: { by: "caster", attack_types: ["weapon"] },
				roll: { dice_count: 1, dice_type: 6 },
				description: "Takes an extra 1d6 damage (of the weapon's type) whenever the caster hits it with a weapon attack",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "The caster has advantage on Wisdom (Perception) and Wisdom (Survival) checks to find it",
			},
		],
	},
	{
		url: "hunters-mark",
		edition: "5.5e",
		name: "Hunter's Mark",
		description:
			"You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.",
		sub_effects: [
			{
				type: "damage",
				trigger: "on_hit_taken",
				trigger_filter: { by: "caster" },
				roll: { dice_count: 1, dice_type: 6, damage_type: "force" },
				description: "Takes an extra 1d6 Force damage whenever the caster hits it with an attack roll",
			},
			{
				type: "special",
				sub_types: ["descriptive"],
				description: "The caster has Advantage on Wisdom (Perception or Survival) checks to find it",
			},
		],
	},
	{
		url: "warding-bond",
		edition: "5e",
		name: "Warding Bond",
		description:
			"This spell wards a willing creature you touch and creates a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 hit points or if you and the target become separated by more than 60 feet.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ac", "save"],
				value: 1,
				description: "+1 bonus to AC and saving throws",
			},
			{
				type: "defense",
				sub_types: ["r"],
				all_damage: true,
				description: "Resistance to all damage",
			},
			{
				type: "damage_modifier",
				sub_types: ["transfer"],
				copy: true,
				fraction: 1,
				to: "caster",
				description: "Each time it takes damage, the caster takes the same amount of damage",
			},
		],
	},
	{
		url: "warding-bond",
		edition: "5.5e",
		name: "Warding Bond",
		description:
			"You touch another creature that is willing and create a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet.",
		sub_effects: [
			{
				type: "bonus",
				sub_types: ["ac", "save"],
				value: 1,
				description: "+1 bonus to AC and saving throws",
			},
			{
				type: "defense",
				sub_types: ["r"],
				all_damage: true,
				description: "Resistance to all damage",
			},
			{
				type: "damage_modifier",
				sub_types: ["transfer"],
				copy: true,
				fraction: 1,
				to: "caster",
				description: "Each time it takes damage, the caster takes the same amount of damage",
			},
		],
	},
	{
		url: "rage",
		edition: "5e",
		name: "Rage",
		description:
			"While raging, you have advantage on Strength checks and Strength saving throws, you gain a bonus to the damage rolls of melee weapon attacks using Strength (your Rage Damage, chosen when the effect is applied), and you have resistance to bludgeoning, piercing, and slashing damage. You can't cast spells or concentrate on them while raging. Your rage ends early if you are knocked unconscious or if your turn ends and you haven't attacked a hostile creature or taken damage since your last turn.",
		ends_when: {
			type: "has_condition",
			value: "unconscious",
			description: "Rage ends early if you are knocked unconscious.",
		},
		sub_effects: [
			{
				type: "advantage",
				sub_types: ["ability", "save"],
				abilities: ["strength"],
				description: "Advantage on Strength checks and Strength saving throws",
			},
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["melee_weapon"],
				choice: "value",
				description: "Rage Damage bonus on melee weapon attacks using Strength",
			},
			{
				type: "defense",
				sub_types: ["r"],
				damage_types: ["bludgeoning", "piercing", "slashing"],
				description: "Resistance to bludgeoning, piercing, and slashing damage",
			},
			{
				type: "restrict",
				sub_types: ["spellcasting", "concentration"],
				description: "Can't cast spells or concentrate on them",
			},
		],
	},
	{
		url: "rage",
		edition: "5.5e",
		name: "Rage",
		description:
			"While active, your Rage gives you Resistance to Bludgeoning, Piercing, and Slashing damage; a bonus to the damage of attacks using Strength, with a weapon or an Unarmed Strike (your Rage Damage, chosen when the effect is applied); and Advantage on Strength checks and Strength saving throws. You can't maintain Concentration, and you can't cast spells. The Rage lasts until the end of your next turn, and it ends early if you don armor heavier than medium or have the Incapacitated condition. You extend it to the end of your next turn by making an attack roll against an enemy, forcing an enemy to make a saving throw, or taking a Bonus Action to extend it. It lasts up to 10 minutes.",
		ends_when: {
			any_of: [
				{ type: "has_condition", value: "incapacitated", description: "Rage ends if you have the Incapacitated condition." },
				{ type: "equipment", value: "heavy_armor", description: "Rage ends if you don Heavy armor." },
			],
		},
		sustain: {
			triggers: ["on_attack", "on_force_save"],
			manual_cost: "bonus_action",
			check: "end_turn_target",
			description:
				"Extended to the end of your next turn by an attack roll against an enemy, forcing an enemy to make a saving throw, or a Bonus Action",
		},
		sub_effects: [
			{
				type: "defense",
				sub_types: ["r"],
				damage_types: ["bludgeoning", "piercing", "slashing"],
				description: "Resistance to Bludgeoning, Piercing, and Slashing damage",
			},
			{
				type: "bonus",
				sub_types: ["damage"],
				attack_types: ["melee_weapon", "unarmed"],
				choice: "value",
				description: "Rage Damage bonus on attacks using Strength",
			},
			{
				type: "advantage",
				sub_types: ["ability", "save"],
				abilities: ["strength"],
				description: "Advantage on Strength checks and Strength saving throws",
			},
			{
				type: "restrict",
				sub_types: ["spellcasting", "concentration"],
				description: "Can't maintain Concentration or cast spells",
			},
		],
	},
];
