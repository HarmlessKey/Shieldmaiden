<template>
	<div class="content">
		<Crumble />
		<h3>Export a database</h3>
		<p>
			Updates monster values to their correct types. A lot of numbers were saved as strings, but now need to be changed to numbers.<br/>
			Below are all values that must be integers.
		</p>
		<ul>
			<li>armor_class</li>
			<li>hit_points</li>
			<li>challenge_rating</li>
			<li>proficiency</li>

			<li>strength</li>
			<li>dexterity</li>
			<li>constitution</li>
			<li>intelligence</li>
			<li>wisdom</li>
			<li>charisma</li>

			<li>walk_speed</li>
			<li>swim_speed</li>
			<li>burrow_speed</li>
			<li>fly_speed</li>
			<li>climb_speed</li>

			<li>senses.blindsight.range</li>
			<li>senses.darkvision.range</li>
			<li>senses.tremorsense.range</li>
			<li>senses.truesight.range</li>

			<li>caster_level</li>
			<li>caster_save_dc</li>
			<li>caster_spell_attack</li>
			<li>caster_spell_slots[]</li>
			<li>caster_spells[].level</li>

			<li>innate_save_dc</li>
			<li>innate_spell_attack</li>
			<li>innate_spells[].limit</li>

			<li>legendary_count</li>

			<li>special_abilities[].limit</li>
			<li>special_abilities[].reach</li>
			<li>special_abilities[].aoe_size</li>
			<li>special_abilities[].action_list[].attack_bonus</li>
			<li>special_abilities[].action_list[].save_dc</li>
			<li>special_abilities[].action_list[].rolls[].dice_count</li>
			<li>special_abilities[].action_list[].rolls[].dice_type</li>
			<li>special_abilities[].action_list[].rolls[].fixed_val</li>
			<li>special_abilities[].action_list[].rolls[].versatile_dice_count</li>
			<li>special_abilities[].action_list[].rolls[].versatile_dice_type</li>
			<li>special_abilities[].action_list[].rolls[].versatile_fixed_val</li>
			<li>special_abilities[].action_list[].rolls[].projectile_count</li>
			<li>special_abilities[].action_list[].rolls[].miss_mod</li>
			<li>special_abilities[].action_list[].rolls[].save_fail_mod</li>

			<li>actions[].limit</li>
			<li>actions[].reach</li>
			<li>actions[].aoe_size</li>
			<li>actions[].action_list[].attack_bonus</li>
			<li>actions[].action_list[].save_dc</li>
			<li>actions[].action_list[].rolls[].dice_count</li>
			<li>actions[].action_list[].rolls[].dice_type</li>
			<li>actions[].action_list[].rolls[].fixed_val</li>
			<li>actions[].action_list[].rolls[].versatile_dice_count</li>
			<li>actions[].action_list[].rolls[].versatile_dice_type</li>
			<li>actions[].action_list[].rolls[].versatile_fixed_val</li>
			<li>actions[].action_list[].rolls[].projectile_count</li>
			<li>actions[].action_list[].rolls[].miss_mod</li>
			<li>actions[].action_list[].rolls[].save_fail_mod</li>

			<li>legendary_actions[].legendary_cost</li>
			<li>legendary_actions[].limit</li>
			<li>legendary_actions[].reach</li>
			<li>legendary_actions[].aoe_size</li>
			<li>legendary_actions[].action_list[].attack_bonus</li>
			<li>legendary_actions[].action_list[].save_dc</li>
			<li>legendary_actions[].action_list[].rolls[].dice_count</li>
			<li>legendary_actions[].action_list[].rolls[].dice_type</li>
			<li>legendary_actions[].action_list[].rolls[].fixed_val</li>
			<li>legendary_actions[].action_list[].rolls[].versatile_dice_count</li>
			<li>legendary_actions[].action_list[].rolls[].versatile_dice_type</li>
			<li>legendary_actions[].action_list[].rolls[].versatile_fixed_val</li>
			<li>legendary_actions[].action_list[].rolls[].projectile_count</li>
			<li>legendary_actions[].action_list[].rolls[].miss_mod</li>
			<li>legendary_actions[].action_list[].rolls[].save_fail_mod</li>

			<li>reactions[].limit</li>
			<li>reactions[].reach</li>
			<li>reactions[].aoe_size</li>
			<li>reactions[].action_list[].attack_bonus</li>
			<li>reactions[].action_list[].save_dc</li>
			<li>reactions[].action_list[].rolls[].dice_count</li>
			<li>reactions[].action_list[].rolls[].dice_type</li>
			<li>reactions[].action_list[].rolls[].fixed_val</li>
			<li>reactions[].action_list[].rolls[].versatile_dice_count</li>
			<li>reactions[].action_list[].rolls[].versatile_dice_type</li>
			<li>reactions[].action_list[].rolls[].versatile_fixed_val</li>
			<li>reactions[].action_list[].rolls[].projectile_count</li>
			<li>reactions[].action_list[].rolls[].miss_mod</li>
			<li>reactions[].action_list[].rolls[].save_fail_mod</li>
		</ul>

		<p>Some properties need to be removed</p>
		<ul>
			<li>checked</li>
			<li>changed</li>
			<li>metadata</li>
		</ul>
		<q-select
			dark filled square
			class="select"
			label="Reference"
			v-model="ref"
			:options="refs"
		/>
		<a class="btn bnt-large" @click="updateMonsters()" :disabled="!ref || loading">
			<i class="fas fa-file-edit" />
			{{ ref ? `Update ${ref}` : "Select a reference" }}
		</a>
		<span v-if="loading" class="ml-3">
			<span class="loader" />
		</span>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';

	export default {
		name: 'ExportDatabases',
		components: {
			Crumble
		},
		metaInfo: {
			title: 'Admin | Export'
		},
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					"monsters",
					"npcs",
				],
				abilities: [
					"special_abilities",
					"actions",
					"legendary_actions",
					"reactions"
				]
			}
		},
		methods: {	
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
				});	
			},
			updateEntry({ uid, key, entry }) {
				const ref = (uid) ? db.ref(`npcs/${uid}/${key}`) : db.ref(`monsters/${key}`);

				delete entry.metadata;
				delete entry.checked;
				delete entry.changed;

				entry.armor_class = parseInt(entry.armor_class);
				entry.hit_points = parseInt(entry.hit_points);
				entry.challenge_rating = Number(entry.challenge_rating);

				if(entry.proficiency !== undefined) {
					entry.proficiency = parseInt(entry.proficiency);
				}

				entry.strength = parseInt(entry.strength);
				entry.dexterity = parseInt(entry.dexterity);
				entry.constitution = parseInt(entry.constitution);
				entry.intelligence = parseInt(entry.intelligence);
				entry.wisdom = parseInt(entry.wisdom);
				entry.charisma = parseInt(entry.charisma);

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

				if(entry.caster_level !== undefined) {
					if(entry.caster_level === "") {
						delete entry.caster_level;
					} else {
					entry.caster_level = parseInt(entry.caster_level);
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

				for(const type of this.abilities) {
					const abilities = entry[type];
					if(abilities) {
						for(const ability of abilities) {
							if(ability.legendary_cost !== undefined) {
								if(ability.legendary_cost === "") {
									delete ability.legendary_cost;
								} else {
									ability.legendary_cost = parseInt(ability.legendary_cost);
								}
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
											if(roll.dice_count !== undefined) {
												if(roll.dice_count === "") {
													delete roll.dice_count;
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
												if(roll.versatile_dice_count === "") {
													delete roll.versatile_dice_count;
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
												if(roll.projectile_count === "") {
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
					console.log(`%c${entry.name} Successfully updated.`, "color: #83b547;")
				} catch(error) {
					console.error(`Couldn't update monster`, key, entry.name, error, entry);
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