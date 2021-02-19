export const monsterMixin = {
	data() {
		return {
			monster_challenge_rating: {
				0:  { proficiency: 2,  xp: 10 },
				0.125:  { proficiency: 2,  xp: 25 },
				0.25:  { proficiency: 2,  xp: 50 },
				0.5:  { proficiency: 2,  xp: 100 },
				1:  { proficiency: 2,  xp: 200 },
				2:  { proficiency: 2,  xp: 450 },
				3:  { proficiency: 2,  xp: 700 },
				4:  { proficiency: 2,  xp: 1100 },
				5:  { proficiency: 3,  xp: 1800 },
				6:  { proficiency: 3,  xp: 2300 },
				7:  { proficiency: 3,  xp: 2900 },
				8:  { proficiency: 3,  xp: 3900 },
				9:  { proficiency: 4,  xp: 5000 },
				10:  { proficiency: 4,  xp: 5900 },
				11:  { proficiency: 4,  xp: 7200 },
				12:  { proficiency: 4,  xp: 8400 },
				13:  { proficiency: 5,  xp: 10000 },
				14:  { proficiency: 5,  xp: 11500 },
				15:  { proficiency: 5,  xp: 13000 },
				16:  { proficiency: 5,  xp: 15000 },
				17:  { proficiency: 6,  xp: 18000 },
				19:  { proficiency: 6,  xp: 22000 },
				20:  { proficiency: 6,  xp: 25000 },
				21:  { proficiency: 7,  xp: 33000 },
				22:  { proficiency: 7,  xp: 41000 },
				23:  { proficiency: 7,  xp: 50000 },
				24:  { proficiency: 7,  xp: 62000 },
				30:  { proficiency: 9,  xp: 155000 },
			},
			monster_sizes: [
				"Tiny",
				"Small",
				"Medium",
				"Large",
				"Huge",
				"Gargantuan"
			],
			monster_subtypes: {
				Fiend: [
					"Demon",
					"Devil",
					"Shapechanger",
				],
				Humanoid: [
					"Any race",
					"Dwarf",
					"Elf",
					"Gnoll",
					"Gnome",
					"Goblinoid",
					"Grimlock",
					"Human",
					"Shapechanger",
					"Kobold",
					"Lizardfolk",
					"Merfolk",
					"Orc",
					"Sahuagin"
				],
				Monstrosity: [
					"Shapechanger",
					"Titan"
				],
				Undead: [
					"Shapechanger"
				]
			},
			monster_types: [
				"Abberation",
				"Beast",
				"Celestial",
				"Construct",
				"Dragon",
				"Elemental",
				"Fey",
				"Fiend",
				"Giant",
				"Humanoid",
				"Monstrosity",
				"Ooze",
				"Plant",
				"Swarm of tiny beasts",
				"Undead"
			],
			monster_alignment: [
				"Any",
				"Unaligned",
				"Lawful Good",
				"Neutral Good",
				"Chaotic Good",
				"Lawful neutral",
				"Neutral",
				"Chaotic neutral",
				"Lawful evil",
				"Neutral evil",
				"Chaotic evil",
			],
			monster_senses: [
				"blindsight",
				"darkvision",
				"tremorsense",
				"truesight"
			]
		}
	},
	methods: {
		
	}
}
