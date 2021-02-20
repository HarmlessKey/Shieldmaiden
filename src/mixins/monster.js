import { abilities } from "./abilities";
import { skills } from "./skills";
import { general } from "./general";
import { damage_types } from "./damageTypes";

export const monsterMixin = {
	mixins: [abilities, skills, general, damage_types],
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
		/**
		 * Parse an old monster to the new format
		 * @param {object} monster The old monster object
		 * @returns {object} The new monster object
		 */
		parseMonster(monster) {
			let new_monster = {};
			new_monster.name = (monster.name) ? monster.name.toLowerCase() : "monster name"; // required
			new_monster.challenge_rating = (monster.challenge_rating) ? monster.challenge_rating : 1; // required
			if(monster.size) new_monster.size = monster.size.toLowerCase().capitalize();
			if(monster.type) new_monster.type = monster.type.toLowerCase().capitalize();
			if(monster.subtype) new_monster.subtype = monster.subtype.toLowerCase().capitalize();
			if(monster.alignment) new_monster.alignment = monster.alignment.toLowerCase().capitalize();
			if(monster.avatar) new_monster.avatar = monster.avatar;
			new_monster.armor_class = (monster.ac) ? parseInt(monster.ac) : 1; // required
			new_monster.hit_points = (monster.maxHp) ? parseInt(monster.maxHp) : 1; // required
			if(monster.hit_dice) new_monster.hit_dice = monster.hit_dice;

			const proficiency = this.monster_challenge_rating[monster.challenge_rating].proficiency;

			// Abilities & Saving Throws
			new_monster.saving_throws = [];
			for(const ability of this.abilities) {
				new_monster[ability] = monster[ability] || 10;

				if(monster[`${ability}_save`]) {
					new_monster.saving_throws.push(ability);
				}
			}
			if(new_monster.saving_throws.length === 0) delete new_monster.saving_throws;

			// Skills
			new_monster.skills = [];
			new_monster.skills_expertise = [];
			for(const skill of Object.values(this.skillList)) {
				const modifier = monster[skill.value];

				// Save proficiency
				if(modifier) {
					new_monster.skills.push(skill.value).value;

					// Check for expertise
					// If the modifier in old_monster is higher than the ability_mod + proficiency
					// that means there is expertise
					if(modifier > proficiency + this.calcMod(new_monster[skill.ability])) {
						new_monster.skills_expertise.push(skill.value)
					}
				}
			}
			if(new_monster.skills.length === 0) delete new_monster.skills;
			if(new_monster.skills_expertise.length === 0) delete new_monster.skills_expertise;

			// Speed
			const speed = (monster.speed) ? monster.speed.split(",") : null;
			
			if(speed) {
				for(const index in speed) {
					const current_speed = speed[index].replace("ft.", "").trim();

					if(index == 0) {
						new_monster.walk_speed = parseInt(current_speed);
					} else {
						const other_speed = current_speed.split(" ");
						const type = `${other_speed[0]}_speed`;
						new_monster[type] = parseInt(other_speed[1]);
					}
				}
			}

			// Languages
			const languages = (monster.languages) ? monster.languages.split(",") : null;
			
			if(languages) {
				new_monster.languages = [];
				for(const language of languages) {
					new_monster.languages.push(
						language.toLowerCase().trim().capitalize()
					);
				}
			}

			// Senses
			const senses = (monster.senses) ? monster.senses.split(",") : null;
			
			if(senses) {
				new_monster.senses = {};
				for(const sense of senses) {
					for(const monster_sense of this.monster_senses) {
						if(sense.trim().includes(monster_sense)) {
							let new_sense = {};
							new_sense[monster_sense] = true;
							
							if(sense.match(/([0-9])+/g)) {
								new_sense.range = sense.match(/([0-9])+/g)[0];
							}
							new_monster.senses[monster_sense] = new_sense;
						}
					}
				}
			}

			// Defenses
			let defenses = {
				damage_resistances: monster.damage_resistances,
				damage_vulnerabilities: monster.damage_vulnerabilities,
				damage_immunities: monster.damage_immunities,
			}
			const condition_immunities = (monster.condition_immunities) ? monster.condition_immunities.split(",") : null;

			const resistances = [
				"damage_resistances",
				"damage_vulnerabilities",
				"damage_immunities",
			];

			for(const resistance_type of resistances) {
				new_monster[resistance_type] = [];

				if(defenses[resistance_type]) {
					for(const type of this.damage_types) {
						if(defenses[resistance_type].toLowerCase().search(type) > -1 && !new_monster[resistance_type].includes(type)) {
							new_monster[resistance_type].push(type);
						}
					}
				}
				if(new_monster[resistance_type].length === 0) delete new_monster[resistance_type];
			}

			if(condition_immunities) {
				new_monster.condition_immunities = [];
				for(const immunity of condition_immunities) {
					if(immunity) {
						new_monster.condition_immunities.push(
							immunity.trim().toLowerCase()
						);
					}
				}			
			}


			// Abilities
			for(const action_type of ["special_abilities", "actions", "legendary_actions", "reactions"]) {
				if(monster[action_type]) {
					new_monster[action_type] = [];

					for(const ability of monster[action_type]) {
						// Store a list of actions in the list
						// We will use only 1 action now, for damage or healing
						// But later we might want to add conditions and reminders
						// These might be applied in a different way, so with a different action
						const newAbility = {
							name: ability.name,
							desc: ability.desc,
							action_list: [
								{
									type: "other",
								}
							]
						};
						let fail_miss = "";

						if(action_type === "legendary_actions") newAbility.legendary_cost = 1;

						// Find recharge, limit and legendary cost
						if(ability.name && ability.name.match(/\((.*?)\)/g)) {
							const type = ability.name.match(/\((.*?)\)/g)[0];

							if(type.toLowerCase().includes("recharge")){
								if(type.match(/[0-9]+(-[0-9]+)*/)) {
									newAbility.recharge = type.match(/[0-9]+(-[0-9]+)*/)[0];
								} else {
									newAbility.recharge = "rest";
								}
							}
							if(type.toLowerCase().includes("day")){
								newAbility.limit = type.match(/([0-9])+/g)[0];
								newAbility.limit_type = "day";
							}
							if(type.toLowerCase().includes("turn")){
								newAbility.limit = type.match(/([0-9])+/g)[0];
								newAbility.limit_type = "turn";
							}
							if(action_type === "legendary_actions" && type.toLowerCase().includes("costs")){
								newAbility.legendary_cost = type.match(/([0-9])+/g)[0];
							}
							newAbility.name = newAbility.name.replace(type, "").trim();
						}

						if(ability.damage_dice || (ability.desc && ability.desc.toLowerCase().match(/(saving throw)/g))) {
							// Find the range
							const reach = (ability.desc) ? ability.desc.toLowerCase().match(/(reach).[0-9]+(\/[0-9]+)*/g) : null;
							const range = (ability.desc) ? ability.desc.toLowerCase().match(/(range).[0-9]+(\/[0-9]+)*/g) : null;

							if(reach) newAbility.reach = reach[0].split(" ")[1];
							if(range) newAbility.range = range[0].split(" ")[1];

							// Check if it's a targeted action or saving throw
							if(ability.attack_bonus && ability.attack_bonus !== 0) {
								if(ability.desc && ability.desc.toLowerCase().match(/(melee weapon)/g)) newAbility.action_list[0].type = "melee_weapon";
								else if(ability.desc && ability.desc.toLowerCase().match(/(ranged weapon)/g)) newAbility.action_list[0].type = "ranged_weapon";
								else newAbility.action_list[0].type = "melee_weapon";

								newAbility.action_list[0].attack_bonus = ability.attack_bonus;
								fail_miss = "miss_mod";
							} else {
								newAbility.action_list[0].type = "save";
								fail_miss = "save_fail_mod";

								const save_dc = (ability.desc) ? ability.desc.match(/(DC).([0-9]+)/g) : null;
								if(save_dc) {
									newAbility.action_list[0].save_dc = save_dc[0].split(" ")[1];
								}

								// Find the ability
								for(const ab of this.abilities) {
									if(ability.desc && ability.desc.toLowerCase().search(ab) > -1) {
										newAbility.action_list[0].save_ability = ab;
									}
								}
							}

							// Create an array of damage types found in the description
							let damage_types = [];
							for(const type of this.damage_types) {
								const position = (ability.desc) ? ability.desc.toLowerCase().search(type) : -1;
								if(position > -1 && !damage_types.includes(type)) {
									// Make sure they're in the correct order
									if(damage_types[0] && position > ability.desc.toLowerCase().search(damage_types[0])) {
										damage_types.push(type);
									} else {
										damage_types.unshift(type);
									}
								}
							}

							newAbility.action_list[0].rolls = [];
							if(ability.damage_dice) {
								ability.damage_dice.split("+").forEach((damage, index) => {
									const input = damage.split("d");
									const damage_type = (damage_types[index]) ? damage_types[index] : "slashing";

									let newRoll = {
										dice_count: input[0],
										dice_type: input[1],
										damage_type
									};
									newRoll[fail_miss] = (fail_miss === "miss_mod") ? 0 : 0.5;

									newAbility.action_list[0].rolls.push(newRoll);
								})

								// Check if there is a damage bonus
								// Add it only once (to the first roll by default, this might be wrong in some cases)
								if(ability.damage_bonus && newAbility.action_list[0].rolls.length > 0) {
									newAbility.action_list[0].rolls[0].fixed_val = ability.damage_bonus;
								}
							}
						}
						new_monster[action_type].push(newAbility);
					}
				}
			}
			// Legendary action count
			if(new_monster.legendary_actions && new_monster.legendary_actions.length > 0) {
				new_monster.lengendary_count = 3;
			}
			return new_monster;
		}
	}
}
