<template>
	<hk-card header="Update monsters & NPCs">
		<div class="card-body">
			<p>
				Updates monster values to their correct types. A lot of numbers were saved as strings, but now need to be changed to numbers.
			</p>

			<q-select
				dark filled square
				class="select"
				label="Reference"
				v-model="ref"
				:options="refs"
			/>
			<a class="btn bnt-large" @click="update()" :disabled="!ref || loading">
				<i class="fas fa-file-edit" />
				{{ ref ? `Update ${ref}` : "Select a reference" }}
			</a>
			<span v-if="loading" class="ml-3">
				<span class="loader" />
			</span>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import { monsterMixin } from "@/mixins/monster";
	import { skills} from "@/mixins/skills";

	export default {
		name: 'ExportDatabases',
		mixins: [monsterMixin, skills],
		components: {
			Crumble
		},
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					"monsters",
					"npcs",
				],
				allowed_properties: [
					"name",
					"source",
					"avatar",
					"size",
					"type",
					"subtype",
					"alignment",
					"walk_speed",
					"swim_speed",
					"fly_speed",
					"burrow_speed",
					"climb_speed",
					"languages",
					"challenge_rating",
					"proficiency",
					"friendly",
					"player_id",
					"armor_class",
					"hit_points",
					"hit_dice",
					"senses",
					"strength",
					"dexterity",
					"constitution",
					"intelligence",
					"wisdom",
					"charisma",
					"saving_throws",
					"skills",
					"skills_expertise",
					"skill_modifiers",
					"damage_vulnerabilities",
					"damage_resistances",
					"damage_immunities",
					"condition_immunities",
					"caster_ability",
					"caster_level",
					"caster_save_dc",
					"caster_spell_attack",
					"caster_spell_slots",
					"caster_spells",
					"innate_ability",
					"innate_save_dc",
					"innate_spell_attack",
					"innate_spells",
					"special_abilities",
					"actions",
					"legendary_count",
					"legendary_actions",
					"reactions"
				],
				abilities_allowed_properties: [
					"legendary_cost",
					"name",
					"recharge",
					"limit",
					"limit_type",
					"desc",
					"reach",
					"range",
					"aoe_type",
					"aoe_size",
					"versatile",
					"versatile_one",
					"versatile_two",
					"action_list"
				],
				action_abilities: [
					"special_abilities",
					"actions",
					"legendary_actions",
					"reactions"
				],
				conditions: [
					"blinded",
					"charmed",
					"deafened",
					"exhaustion",
					"frightened",
					"grappled",
					"incapacitated",
					"invisible",
					"paralyzed",
					"petrified",
					"poisoned",
					"prone",
					"restrained",
					"stunned",
					"unconscious"
				],
				monster_types: [
					"Aberration",
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
					"any",
					"any alignment",
					"unaligned",
					"lawful good",
					"neutral good",
					"chaotic good",
					"lawful neutral",
					"neutral",
					"chaotic neutral",
					"lawful evil",
					"neutral evil",
					"chaotic evil",
				],
				monster_sizes: [
					"Tiny",
					"Small",
					"Medium",
					"Large",
					"Huge",
					"Gargantuan"
				],
			}
		},
		methods: {
			update() {
				if(this.ref === "monsters") {
					this.updateMonsters();
				} else {
					this.updateNpcs();
				}
			},
			async updateMonsters() {
				this.loading = true;

				//Fetch the data
				const ref = db.ref("monsters");
				await ref.once('value', (snapshot) => {
					const results = snapshot.val();

					for(let key in results) {
						let entry = results[key];
						
						this.updateEntry({ key, entry });
					}
				}).then(() => {
					this.loading = false;
					console.log(`%cFINISHED.`, "color: #83b547;");
				});	
			},
			async updateNpcs() {
				this.loading = true;

				//Fetch the data
				const ref = db.ref("npcs");
				await ref.once('value', (snapshot) => {
					const users = snapshot.val();

					for(let uid in users) {
						const npcs = users[uid];
						console.group(`%cUser: ${uid}`, "color: #2c97de; font-weight: bold;")
						for(let key in npcs) {
							let entry = npcs[key];
							// if(!entry.old) {
							this.updateEntry({ uid, key, entry });
							// }
						}
						console.groupEnd();
						const count_ref = db.ref(`search_npcs/${uid}/metadata/count`);
						count_ref.set(Object.keys(npcs).length);
					}
				}).then(() => {

					this.loading = false;
					console.log(`%cFINISHED.`, "color: #83b547;");
				});	
			},
			async updateEntry({ uid, key, entry }) {
				const ref = (uid) ? db.ref(`npcs/${uid}/${key}`) : db.ref(`monsters/${key}`);
				// If a mosnter has old properties, parse it first
				if(entry.hasOwnProperty("ac") || entry.hasOwnProperty('old')) {
					entry = await this.parseMonster(entry);
				}

				// Remove not allowed properties
				for(const prop of Object.keys(entry)) {
					if(!this.allowed_properties.includes(prop)) {
						delete entry[prop];
					}
				}

				if(!entry.name) {
					entry.name = "nameless npc";
				}
				else {
					entry.name = entry.name.toLowerCase();
				}
				if(entry.lengendary_count) {
					entry.legendary_count = entry.lengendary_count;
					delete entry.lengendary_count;
				}
				if(!entry.size || !this.monster_sizes.includes(entry.type)) {
					entry.size = "Medium";
				}
				if(!entry.type || !this.monster_types.includes(entry.type)) {
					entry.type = "Beast";
				}
				if(entry.type === "Abberation") {
					entry.type = "Aberration";
				}

				if(entry.hit_dice && !entry.hit_dice.match(/^[0-9]+d[0-9]+$/)) {
					delete entry.hit_dice
				}

				if(entry.alignment && !this.monster_alignment.includes(entry.alignment.toLowerCase())) {
					entry.alignment = "Neutral";
				}

				entry.armor_class = (entry.armor_class !== undefined) ? parseInt(entry.armor_class) : 10;
				entry.hit_points = (entry.hit_points) ? parseInt(entry.hit_points) : 1;
				entry.challenge_rating = (entry.challenge_rating !== undefined && !isNaN(entry.challenge_rating)) ? Number(entry.challenge_rating) : 0;

				if(entry.proficiency !== undefined) {
					entry.proficiency = parseInt(entry.proficiency);
				}

				if(entry.avatar && entry.avatar.length > 2000) {
					entry.avatar = entry.avatar.substring(0, 2000);
				}

				entry.strength = (entry.strength) ? parseInt(entry.strength) : 10;
				entry.dexterity = (entry.dexterity) ? parseInt(entry.dexterity) : 10;
				entry.constitution = (entry.constitution) ? parseInt(entry.constitution) : 10;
				entry.intelligence = (entry.intelligence) ? parseInt(entry.intelligence) : 10;
				entry.wisdom = (entry.wisdom) ? parseInt(entry.wisdom) : 10;
				entry.charisma = (entry.charisma) ? parseInt(entry.charisma) : 10;

				entry.strength = (entry.strength > 99) ? 99 : entry.strength;
				entry.dexterity = (entry.dexterity > 99) ? 99 : entry.dexterity;
				entry.constitution = (entry.constitution > 99) ? 99 : entry.constitution;
				entry.intelligence = (entry.intelligence > 99) ? 99 : entry.intelligence;
				entry.wisdom = (entry.wisdom > 99) ? 99 : entry.wisdom;
				entry.charisma = (entry.charisma > 99) ? 99 : entry.charisma;

				if(entry.walk_speed !== undefined) {
					if(entry.walk_speed === "") {
						delete entry.walk_speed;
					} else {
						entry.walk_speed = parseInt(entry.walk_speed);
					}
				}
				if(entry.swim_speed !== undefined) {
					if(entry.swim_speed === "") {
						delete entry.swim_speed;
					} else {
						entry.swim_speed = parseInt(entry.swim_speed);
					}
				}
				if(entry.burrow_speed !== undefined) {
					if(entry.burrow_speed === "") {
						delete entry.burrow_speed;
					} else {
						entry.burrow_speed = parseInt(entry.burrow_speed);
					}
				}
				if(entry.fly_speed !== undefined) {
					if(entry.fly_speed === "") {
						delete entry.fly_speed;
					} else {
						entry.fly_speed = parseInt(entry.fly_speed);
					}
				}
				if(entry.climb_speed !== undefined) {
					if(entry.climb_speed === "") {
						delete entry.climb_speed;
					} else {
						entry.climb_speed = parseInt(entry.climb_speed);
					}
				}

				if(entry.skill_modifiers) {
					for(let skill in entry.skill_modifiers) {
						let mod = entry.skill_modifiers[skill];
						entry.skill_modifiers[skill] = (mod > 99) ? 99 : parseInt(mod);
						if(mod === 0) {
							delete entry.skill_modifiers[skill];
						}
					}
				}

				if(entry.senses) {
					if(entry.senses.blindsight && entry.senses.blindsight.range !== undefined) {
						if(entry.senses.blindsight === "") {
							delete entry.senses.blindsight;
						} else {
							entry.senses.blindsight.range = parseInt(entry.senses.blindsight.range);
						}
					}
					if(entry.senses.darkvision && entry.senses.darkvision.range !== undefined) {
						if(entry.senses.darkvision === "") {
							delete entry.senses.darkvision;
						} else {
							entry.senses.darkvision.range = parseInt(entry.senses.darkvision.range);
						}
					}
					if(entry.senses.tremorsense && entry.senses.tremorsense.range !== undefined) {
						if(entry.senses.tremorsense === "") {
							delete entry.senses.tremorsense;
						} else {
							entry.senses.tremorsense.range = parseInt(entry.senses.tremorsense.range);
						}
					}
					if(entry.senses.truesight && entry.senses.truesight.range !== undefined) {
						if(entry.senses.truesight === "") {
							delete entry.senses.truesight;
						} else {
							entry.senses.truesight.range = parseInt(entry.senses.truesight.range);
						}
					}
				}

				// Remove invalid conditions
				if(entry.condition_immunities !== undefined) {
					if(Array.isArray(entry.condition_immunities)) {
						entry.condition_immunities = entry.condition_immunities.filter(condition => {
							return this.conditions.includes(condition);
						});
					} else {
						delete entry.condition_immunities;
					}
				}

				if(entry.caster_level !== undefined) {
					if(entry.caster_level === "") {
						delete entry.caster_level;
					} else {
					entry.caster_level = (entry.caster_level < 1) ? 1 : parseInt(entry.caster_level);
					}
				}
				if(entry.caster_save_dc !== undefined) {
					if(entry.caster_save_dc === "") {
						delete entry.caster_save_dc;
					} else {
						entry.caster_save_dc = parseInt(entry.caster_save_dc);
					}
				}
				if(entry.caster_spell_attack !== undefined) {
					if(entry.caster_spell_attack === "") {
						delete entry.caster_spell_attack;
					} else {
						entry.caster_spell_attack = parseInt(entry.caster_spell_attack);
					}
				}
				if(entry.caster_spells) {
					for(const spell of Object.values(entry.caster_spells)) {
						spell.level = parseInt(spell.level);
					}
				}

				if(entry.innate_save_dc !== undefined) {
					if(entry.innate_save_dc === "") {
						delete entry.innate_save_dc;
					} else {
						entry.innate_save_dc = parseInt(entry.innate_save_dc);
					}
				}
				if(entry.innate_spell_attack !== undefined) {
					if(entry.innate_spell_attack === "") {
						delete entry.innate_spell_attack;
					} else {
						entry.innate_spell_attack = parseInt(entry.innate_spell_attack);
					}
				}
				if(entry.innate_spells) {
					for(const spell of Object.values(entry.innate_spells)) {
						spell.limit = parseInt(spell.limit);
					}
				}

				if(entry.legendary_count !== undefined) {
					if(entry.legendary_count === "") {
						delete entry.legendary_count;
					} else {
						entry.legendary_count = parseInt(entry.legendary_count);
					}
				}

				for(const type of this.action_abilities) {
					const abilities = entry[type];
					if(abilities) {
						for(const ability of abilities) {
							
							// Remove not allowed properties
							for(const prop of Object.keys(ability)) {
								if(!this.abilities_allowed_properties.includes(prop)) {
									delete ability[prop];
								}
							}

							if(ability.desc && ability.desc.length > 2000) {
								ability.desc = ability.desc.substring(0, 2000);
							}

							if(ability.legendary_cost !== undefined) {
								if(ability.legendary_cost === "") {
									delete ability.legendary_cost;
								} else {
									ability.legendary_cost = parseInt(ability.legendary_cost);
								}
							}
							if(type === "legendary_actions" && ability.legendary_cost === undefined) {
								ability.legendary_cost = 0;
							}

							if(ability.recharge === "") {
								delete ability.recharge;
							}
							if(ability.limit !== undefined) {
								if(ability.limit === "") {
									delete ability.limit;
								} else {
									ability.limit = parseInt(ability.limit);
								}
							}
							if(ability.reach !== undefined) {
								if(ability.reach === "") {
									delete ability.reach;
								} else {
									ability.reach = parseInt(ability.reach);
								}
							}
							if(ability.range === "") {
								delete ability.range;
							}
							if(ability.aoe_size !== undefined) {
								if(ability.aoe_size === "") {
									delete ability.aoe_size;
								} else {
									ability.aoe_size = parseInt(ability.aoe_size);
								}
							}

							if(ability.action_list) {
								for(const action of ability.action_list) {
									if(action.attack_bonus !== undefined) {
										if(action.attack_bonus === "") {
											delete action.attack_bonus;
										} else {
											action.attack_bonus = parseInt(action.attack_bonus);
											if(action.attack_bonus > 99) {
												action.attack_bonus = 99;
											}
										}
									}
									if(action.save_dc !== undefined) {
										if(action.save_dc === "") {
											delete action.save_dc;
										} else {
											action.save_dc = parseInt(action.save_dc);
										}
									}

									if(action.rolls) {
										for(const roll of action.rolls) {

											delete roll.fail_miss;

											if(roll.dice_count !== undefined) {
												if(roll.dice_count === "" || roll.dice_count === 0 || roll.dice_count === "0") {
													delete roll.dice_count;
													delete roll.dice_type;
												} else {
													roll.dice_count = parseInt(roll.dice_count);
												}
											}
											if(roll.dice_type !== undefined) {
												if(roll.dice_type === "") {
													delete roll.dice_type;
												} else {
													roll.dice_type = parseInt(roll.dice_type);
												}
											}
											if(roll.fixed_val !== undefined) {
												if(roll.fixed_val === "") {
													delete roll.fixed_val;
												} else {
													roll.fixed_val = parseInt(roll.fixed_val);
												}
											}
											if(roll.versatile_dice_count !== undefined) {
												if(roll.versatile_dice_count === "" || roll.versatile_dice_count === 0 || roll.versatile_dice_count === "0") {
													delete roll.versatile_dice_count;
													delete roll.versatile_dice_type;
												} else {
													roll.versatile_dice_count = parseInt(roll.versatile_dice_count);
												}
											}
											if(roll.versatile_dice_type !== undefined) {
												if(roll.versatile_dice_type === "") {
													delete roll.versatile_dice_type;
												} else {
													roll.versatile_dice_type = parseInt(roll.versatile_dice_type);
												}
											}
											if(roll.versatile_fixed_val !== undefined) {
												if(roll.versatile_fixed_val === "") {
													delete roll.versatile_fixed_val;
												} else {
													roll.versatile_fixed_val = parseInt(roll.versatile_fixed_val);
												}
											}
											if(roll.projectile_count !== undefined) {
												if(roll.projectile_count === "" || roll.projectile_count === 0 || roll.projectile_count === "0") {
													delete roll.projectile_count;
												} else {
													roll.projectile_count = parseInt(roll.projectile_count);
												}
											}
											if(roll.miss_mod !== undefined) {
												if(roll.miss_mod === "") {
													delete roll.miss_mod;
												} else {
													roll.miss_mod = parseInt(roll.miss_mod);
												}
											}
											if(roll.save_fail_mod !== undefined) {
												if(roll.save_fail_mod === "") {
													delete roll.save_fail_mod;
												} else {
													roll.save_fail_mod = parseInt(roll.save_fail_mod);
												}
											}
										}
									}
								}
							}
						}
					}
				}

				try {
					ref.set(entry);
					console.groupCollapsed(`%c${key} Successfully updated.`, "color: #83b547;");
					console.log(key, entry);
					console.groupEnd();
				} catch(error) {
					console.error(`Couldn't update monster`, key, entry.name, error, entry);
				}

				if (uid) {
					// Generate searchable NPC entry in search_npcs table
					const searchable_npcs_fields = ['name', 'challenge_rating', 'alignment', 'armor_class', 'hit_points', 'size', 'type']
					let searchable_entry = {}
					for (const field of searchable_npcs_fields) {
						if (entry.hasOwnProperty(field)) {
							searchable_entry[field] = entry[field]
						}
					}
					
					const search_ref = db.ref(`search_npcs/${uid}/results/${key}`);

					try {
						search_ref.set(searchable_entry)
						// console.groupCollapsed(`%c${key} Successfully updated search npcs.`, "color: #83b547;")
						// console.log(key, searchable_entry);
						// console.groupEnd();
					} catch(error) {
						console.error(`Couldn't update search_npc table`, key, entry.name, error, searchable_entry)
					}

				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.select {
		max-width: 400px;
		margin-bottom: 20px;
	}
</style>