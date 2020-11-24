export const weapons = {
	data() {
		return {
			weaponList: [{
				category: "Simple melee weapons",
				weapons: [
					{ 
						value: "simple_melee", 
						label: "All simple melee"
					},
					{ 
						value: "club", 
						label: "Club",
						type: "simple_melee",
						damage: "1d4",
						damage_type: "bludgeoning",
						light: true
					},
					{ 
						value: "dagger", 
						label: "Dagger",
						type: "simple_melee",
						damage: "1d4",
						damage_type: "piercing",
						light: true,
						finesse: true,
						thrown: "20/60" 
					},
					{ 
						value: "greatclub",
						label: "Greatclub",
						type: "simple_melee",
						damage: "1d8",
						damage_type: "bludgeoning",
						two_handed: true
					},
					{ 
						value: "handaxe", 
						label: "Handaxe",
						type: "simple_melee",
						damage: "1d6",
						damage_type: "slashing",
						light: true,
						thrown: "20/60"
					},
					{ 
						value: "javelin", 
						label: "Javelin",
						type: "simple_melee",
						damage: "1d6",
						damage_type: "piercing",
						thrown: "30/120"
					},
					{ 
						value: "light_hammer", 
						label: "Light Hammer",
						type: "simple_melee",
						damage: "1d4",
						damage_type: "bludgeoning",
						light: true,
						thrown: "20/60"
					},
					{ 
						value: "mace", 
						label: "Mace",
						type: "simple_melee",
						damage: "1d6",
						damage_type: "bludgeoning"
					},
					{ 
						value: "quarterstaff", 
						label: "Quarterstaff",
						type: "simple_melee",
						damage: "1d6",
						damage_type: "bludgeoning",
						versatile: "1d8"
					},
					{ 
						value: "sickle", 
						label: "Sickle",
						type: "simple_melee",
						damage: "1d4",
						damage_type: "slashing",
						light: true
					},
					{ 
						value: "spear", 
						label: "Spear",
						type: "simple_melee",
						damage: "1d6",
						damage_type: "piercing",
						thrown: "20/60",
						versatile: "1d8"
					}
				]},
				{
				category: "Simple ranged weapons",
				weapons: [
					{ value: 
						"simple_ranged", 
						label: "All simple ranged"
					},
					{ 
						value: "light_crossbow",
						label: "Light Crossbow",
						type: "simple_ranged",
						damage: "1d8",
						damage_type: "piercing",
						range: "80/320",
						ammunition: true,
						loading: true,
						two_handed: true
					},
					{ 
						value: "dart", 
						label: "Dart",
						type: "simple_ranged",
						damage: "1d4",
						damage_type: "piercing",
						thrown: "20/60",
						finesse: true
					},
					{ 
						value: "shortbow", 
						label: "Shortbow",
						type: "simple_ranged",
						damage: "1d6",
						damage_type: "piercing",
						range: "30/120",
						ammunition: true
					},
					{ 
						value: "sling", 
						label: "Sling",
						type: "simple_ranged",
						damage: "1d4",
						damage_type: "bludgeoning",
						range: "30/120",
						ammunition: true,
					}
				]},
				{
				category: "Martial melee weapons",
				weapons: [
					{ value: "martial_melee", label: "All martial melee" },
					{ 
						value: "battleaxe", 
						label: "Battleaxe",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "slashing",
						versatile: "1d10"
					},
					{ 
						value: "flail", 
						label: "Flail",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "bludgeoning"
					},
					{ 
						value: "glaive", 
						label: "Glaive",
						type: "martial_melee",
						damage: "1d10",
						damage_type: "slashing",
						heavy: true,
						reach: true,
						two_handed: true
					},
					{ 
						value: "greataxe", 
						label: "Greataxe",
						type: "martial_melee",
						damage: "1d12",
						damage_type: "slashing",
						heavy: true,
						two_handed: true
					},
					{ 
						value: "greatsword",
						label: "Greatsword",
						type: "martial_melee",
						damage: "2d6",
						damage_type: "slashing",
						heavy: true,
						two_handed: true
					},
					{ 
						value: "halberd",
						label: "Halberd",
						type: "martial_melee",
						damage: "1d10",
						damage_type: "slashing",
						heavy: true,
						reach: true,
						two_handed: true
					},
					{ 
						value: "lance", 
						label: "Lance",
						type: "martial_melee",
						damage: "1d12",
						damage_type: "piercing",
						reach: true,
						special: true
					},
					{ 
						value: "longsword", 
						label: "Longsword",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "slashing",
						versatile: "1d10"
					},
					{ 
						value: "maul",
						label: "Maul",
						type: "martial_melee",
						damage: "2d6",
						damage_type: "bludgeoning",
						heavy: true,
						two_handed: true
					},
					{ 
						value: "morningstar", 
						label: "Morningstar",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "piercing"
					},
					{ 
						value: "pike", 
						label: "Pike",
						type: "martial_melee",
						damage: "1d10",
						damage_type: "piercing",
						heavy: true,
						reach: true,
						two_handed: true
					},
					{ 
						value: "rapier", 
						label: "Rapier",
						type: "martial_melee",
						damage: "2d6",
						damage_type: "piercing",
						heavy: true,
						two_handed: true
					},
					{ 
						value: "scimtar",
						label: "Scimtar",
						type: "martial_melee",
						damage: "1d6",
						damage_type: "slashing",
						finesse: true,
						light: true
					},
					{ 
						value: "shortsword", 
						label: "Shortsword",
						type: "martial_melee",
						damage: "1d6",
						damage_type: "slashing",
						finesse: true,
						light: true
					},
					{ 
						value: "trident", 
						label: "Trident",
						type: "martial_melee",
						damage: "1d6",
						damage_type: "piercing",
						thrown: "20/60",
						versatile: '1d8'
					},
					{ 
						value: "war_pick", 
						label: "War Pick",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "piercing",
					},
					{ 
						value: "warhammer",
						label: "Warhammer",
						type: "martial_melee",
						damage: "1d8",
						damage_type: "bludgeoning",
						verstatile: "1d10"
					},
					{ 
						value: "Whip",
						label: "whip",
						type: "martial_melee",
						damage: "1d4",
						damage_type: "slashing",
						finesse: true,
						reach: true
					}
				]},
				{
				category: "Martial ranged weapons",
				weapons: [
					{ value: "martial_ranged", label: "All martial ranged" },
					{ 
						value: "blowgun",
						label: "Blowgun",
						type: "martial_ranged",
						damage: "1",
						damage_type: "piercing",
						ammunition: true,
						loading: true,
						range: "25/100"
					},
					{ 
						value: "hand_crossbow", 
						label: "Hand Crossbow",
						type: "martial_ranged",
						damage: "1d6",
						damage_type: "piercing",
						ammunition: true,
						loading: true,
						light: true,
						range: "30/120"
					},
					{ 
						value: "heavy_crossbow", 
						label: "Heave Crossbow",
						type: "martial_ranged",
						damage: "1d10",
						damage_type: "piercing",
						ammunition: true,
						loading: true,
						heavy: true,
						range: "100/400",
						two_handed: true
					},
					{ 
						value: "longbow", 
						label: "Longbow",
						type: "martial_ranged",
						damage: "1d8",
						damage_type: "piercing",
						ammunition: true,
						heavy: true,
						range: "150/600",
						two_handed: true
					},
					{ 
						value: "net", 
						label: "Net",
						type: "martial_ranged",
						special: true,
						thrown: "5/15"
					}
				]
			}],
			armor_types: [
				{ 
					value: "light", 
					label: "Light armor",
					armor: [
						{
							type: "light",
							value: "padded",
							label: "Padded",
							cost: 500,
							armor_class: 11,
							dex_mod: true,
							stealth_disadvantage: true,
							weight: 8
						},
						{
							type: "light",
							value: "leather",
							label: "Leather",
							cost: 1000,
							armor_class: 11,
							dex_mod: true,
							weight: 10
						},
						{
							type: "light",
							value: "studded_leather",
							label: "Studded leather",
							cost: 4500,
							armor_class: 12,
							dex_mod: true,
							weight: 13
						}
					]
				},
				{ 
					value: "medium", 
					label: "Medium armor",
					armor: [
						{
							type: "medium",
							value: "hide",
							label: "Hide",
							cost: 1000,
							armor_class: 12,
							dex_mod: true,
							dex_max: 2,
							weigth: 12
						},
						{
							type: "medium",
							value: "chain_shirt",
							label: "Chain shirt",
							cost: 5000,
							armor_class: 13,
							dex_mod: true,
							dex_max: 2,
							weigth: 20
						},
						{
							type: "medium",
							value: "scale_mail",
							label: "Scale mail",
							cost: 5000,
							armor_class: 14,
							dex_mod: true,
							dex_max: 2,
							stealth_disadvantage: true,
							weigth: 45
						},
						{
							type: "medium",
							value: "breastplate",
							label: "Breastplate",
							cost: 40000,
							armor_class: 14,
							dex_mod: true,
							dex_max: 2,
							weigth: 20
						},
						{
							type: "medium",
							value: "half_plate",
							label: "Half plate",
							cost: 75000,
							armor_class: 15,
							dex_mod: true,
							dex_max: 2,
							stealth_disadvantage: true,
							weigth: 40
						},
					]
				},
				{ 
					value: "heavy", 
					label: "Heavy armor",
					armor: [
						{
							type: "heavy",
							value: "ring_mail",
							label: "Ring mail",
							cost: 3000,
							armor_class: 14,
							stealth_disadvantage: true,
							weigth: 40
						},
						{
							type: "heavy",
							value: "chain_mail",
							label: "Chain mail",
							cost: 7500,
							armor_class: 16,
							strength_required: 13,
							stealth_disadvantage: true,
							weigth: 55
						},
						{
							type: "heavy",
							value: "splint",
							label: "Splint",
							cost: 20000,
							armor_class: 17,
							strength_required: 15,
							stealth_disadvantage: true,
							weigth: 60
						},
						{
							type: "heavy",
							value: "plate",
							label: "Plate",
							cost: 150000,
							armor_class: 18,
							strength_required: 15,
							stealth_disadvantage: true,
							weigth: 65
						},
					]
				},
				{ 
					value: "shield", 
					label: "Shield",
					armor: [
						{
							type: "shield",
							value: "shield",
							label: "Shield",
							cost: 1000,
							armor_class_mod: 2,
							weight: 2
						}
					]
				}
			]
		}
	},
	methods: {
		displayWeapon(key) {
			//Returns 1 single weapon, based on the key
			let weaponList = JSON.parse(JSON.stringify(this.weaponList));
			for(const category of weaponList) {
				for(const weapon of category.weapons) {
					if(weapon.value === key) {
						return weapon;
					}
				}
			}
		}
	}
}
