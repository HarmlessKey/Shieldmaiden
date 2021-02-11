<template>
	<q-form @submit="store_monster()">
		<div class="monster-wrapper">
			<div>
				<Crumble :name="old_monster.name"/>
				<h2 class="monsterTitle d-flex justify-content-between" v-if="old_monster">
					<div>
						{{ old_monster.name }}
						<span v-if="unsaved_changes" class="red">
							<i class="fas fa-exclamation-triangle"></i> Unsaved changes
						</span>	
					</div>
					<a @click="setSlide({show: true, type: 'contribute/monster/ViewMonster', data: monster})">
						<i class="fas fa-eye" />
					</a>
				</h2>
			</div>
			
			<div v-if="canEdit()" class="mid">
				<div class="row q-col-gutter-md" v-if="(old_monster && monster)">
					<div class="col-12 col-md-4 old_monster d-none d-lg-block">
						<hk-card>
							<template v-if="!loading">
								<div class="card-header d-flex justify-content-between" slot="header">
									<a @click="preview('old')" :class="preview_monster ==='old' ? 'selected' : ''">Old monster</a>
									<a v-if="old_monster.name" :href="`https://www.dndbeyond.com/monsters/${toKebabCase(old_monster.name)}`" target="_blank"><q-icon class="mr-2" name="fas fa-eye-evil"/>DnD Beyond Link</a>
									<a @click="preview('new')" :class="preview_monster ==='new' ? 'selected' : ''">New monster</a>
								</div>
								<a 
									class="btn btn-block mb-3" 
									@click="parse_old_monster()">
										<i class="fas fa-wand-magic"></i>
										<span class="d-none d-md-inline ml-1">Parse to new monster</span>
								</a>
								<div class="monster-card" v-if="preview_monster === 'old'">
									<ViewMonster :data="old_monster" />
								</div>
							</template>
							<hk-loader v-else />
						</hk-card>
					</div>
					
					<div class="col-12 col-md-8 new">
						<EditNpc :monster="monster" />
					</div>
				</div>
			</div>
			<div class="save" v-if="canEdit()">
				<div class="d-flex justify-content-start">
					<div v-if="unsaved_changes" class="bg-red white unsaved_changes">
						<i class="fas fa-exclamation-triangle"></i> There are unsaved changes in the monster
					</div>	
					<a v-if="unsaved_changes" class="btn bg-gray" @click="cancel_changes()">Revert</a>
				</div>
				<div>
					<router-link :to="`/contribute/monsters/${id}`" class="btn bg-gray mr-2">Cancel</router-link>
					<q-btn label="Save" type="submit" color="primary"/>
				</div>
			</div>
		</div>
	</q-form>
</template>

<script>
import { db } from '@/firebase';
import Crumble from '@/components/crumble/Compendium.vue';
import ViewMonster from '@/components/ViewMonster.vue';
import EditNpc from './forms';
import { general } from '@/mixins/general.js';
import { abilities } from '@/mixins/abilities.js';
import { skills } from '@/mixins/skills.js';
import { languages } from '@/mixins/languages.js';
import { monsterMixin } from '@/mixins/monster.js';
import { mapGetters, mapActions } from 'vuex';
import { damage_types } from '@/mixins/damageTypes.js';

export default {
	name: 'MonsterEdit',
	components: {
		Crumble,
		ViewMonster,
		EditNpc
	},
	mixins: [
		general, 
		abilities, 
		skills, 
		monsterMixin, 
		damage_types,
		languages
	],
	metaInfo() {
		return {
			title: this.old_monster.name + ' | D&D 5th Edition',
			meta: [
				{ vmid: 'description', name: 'description', content: 'D&D 5th Edition Monster: ' + this.old_monster.name }
			]
		}
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			id: this.$route.params.id,
			loading: true,
			monster: {},
			unsaved_changes: false,
			fb_monster_json: {},
			preview_monster: 'old',
		}
	},
	computed: {
		...mapGetters([
			"userInfo"
		]),
	},
	firebase() {
		return {
			monster: {
				source: db.ref(`new_monsters/${this.id}`),
				asObject: true,
				readyCallback: () => {
					this.loading = false
					this.fb_monster_json = JSON.stringify(this.monster);
					this.unsaved_changes = false
				}
			},
			old_monster: {
				source: db.ref(`monsters/${this.id}`),
				asObject: true,
				readyCallback: () => this.loading = false
			}
		}
	},
	methods: {
		...mapActions([
			'setSlide'
		]),	
		canEdit() {
			return (this.old_monster.metadata && this.old_monster.metadata.tagged === this.userId) ||
				this.userInfo.admin;
		},
		preview(type) {
			this.preview_monster = type;
		},
		parse_old_monster() {			
			this.$set(this.monster, "name", this.old_monster.name);
			this.$set(this.monster, "size", this.old_monster.size.toLowerCase().capitalize());
			this.$set(this.monster, "type", this.old_monster.type.toLowerCase().capitalize());
			this.$set(this.monster, "subtype", this.old_monster.subtype.toLowerCase().capitalize());
			this.$set(this.monster, "alignment", this.old_monster.alignment.toLowerCase().capitalize());
			this.$set(this.monster, "challenge_rating", this.old_monster.challenge_rating);
			this.$set(this.monster, "armor_class", parseInt(this.old_monster.armor_class));
			this.$set(this.monster, "hit_points", parseInt(this.old_monster.hit_points));
			this.$set(this.monster, "hit_dice", this.old_monster.hit_dice);

			const proficiency = this.monster_challenge_rating[this.monster.challenge_rating].proficiency;

			// Abilities & Saving Throws
			this.$set(this.monster, "saving_throws", []);
			for(const ability of this.abilities) {
				this.$set(this.monster, ability, this.old_monster[ability]);

				if(this.old_monster[`${ability}_save`]) {
					this.monster.saving_throws.push(ability);
				}
			}

			// Skills
			this.$set(this.monster, "skills", []);
			this.$set(this.monster, "skills_expertise", []);
			for(const skill of Object.values(this.skillList)) {
				const modifier = this.old_monster[skill.value];

				// Save proficiency
				if(modifier) {
					this.monster.skills.push(skill.value).value;

					// Check for expertise
					// If the modifier in old_monster is higher than the ability_mod + proficiency
					// that means there is expertise
					if(modifier > proficiency + this.calcMod(this.monster[skill.ability])) {
						this.monster.skills_expertise.push(skill.value)
					}
				}
			}

			// Speed
			const speed = this.old_monster.speed.split(",");

			for(const index in speed) {
				const current_speed = speed[index].replace("ft.", "").trim();

				if(index == 0) {
					this.$set(this.monster, "walk_speed", parseInt(current_speed));
				} else {
					const other_speed = current_speed.split(" ");
					const type = `${other_speed[0]}_speed`;
					this.$set(this.monster, type, parseInt(other_speed[1]));
				}
			}

			// Languages
			const languages = this.old_monster.languages.split(",");

			this.$set(this.monster, "languages", []);
			for(const language of languages) {
				this.monster.languages.push(
					language.toLowerCase().trim().capitalize()
				);
			}

			// Senses
			const senses = (this.old_monster.senses) ? this.old_monster.senses.split(",") : undefined;
			
			if(senses) {
				this.$set(this.monster, "senses", {});
				for(const sense of senses) {
					for(const monster_sense of this.monster_senses) {
						if(sense.trim().includes(monster_sense)) {
							let new_sense = {};
							new_sense[monster_sense] = true;
							
							if(sense.match(/([0-9])+/g)) {
								new_sense.range = sense.match(/([0-9])+/g)[0];
							}
							this.$set(this.monster.senses, monster_sense, new_sense);
						}
					}
				}
			}

			// Defenses
			let defenses = {
				damage_resistances: this.old_monster.damage_resistances,
				damage_vulnerabilities: this.old_monster.damage_vulnerabilities,
				damage_immunities: this.old_monster.damage_immunities,
			}
			const condition_immunities = this.old_monster.condition_immunities.split(",");

			const resistances = [
				"damage_resistances",
				"damage_vulnerabilities",
				"damage_immunities",
			];

			for(const resistance_type of resistances) {
				this.$set(this.monster, resistance_type, []);

				for(const type of this.damage_types) {
					if(defenses[resistance_type].toLowerCase().search(type) > -1 && !this.monster[resistance_type].includes(type)) {
						this.monster[resistance_type].push(type);
					}
				}
			}

			this.$set(this.monster, "condition_immunities", []);
			for(const immunity of condition_immunities) {
				if(immunity) {
					this.monster.condition_immunities.push(
						immunity.trim().toLowerCase()
					);
				}
			}			

			for(const action_type of ["special_abilities", "actions", "legendary_actions", "reactions"]) {
				if(this.old_monster[action_type]) {
					this.$set(this.monster, action_type, []);

					for(const ability of this.old_monster[action_type]) {
						// Store a list of actions in the list
						// We will use only 1 action now, for damage or healing
						// But later we might want to add conditions and reminder
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
						if(ability.name.match(/\((.*?)\)/g)) {
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

						if(ability.damage_dice || ability.desc.toLowerCase().match(/(saving throw)/g)) {
							// Find the range
							const range = ability.desc.toLowerCase().match(/(range|reach).[0-9]+(\/[0-9]+)*/g);

							if(range) newAbility.range = range[0].split(" ")[1];

							// Check if it's a targeted action or saving throw
							if(ability.attack_bonus && ability.attack_bonus !== 0) {
								if(ability.desc.toLowerCase().match(/(melee weapon)/g)) newAbility.action_list[0].type = "melee_weapon";
								else if(ability.desc.toLowerCase().match(/(ranged weapon)/g)) newAbility.action_list[0].type = "ranged_weapon";
								else newAbility.action_list[0].type = "damage";

								newAbility.action_list[0].attack_bonus = ability.attack_bonus;
								fail_miss = "miss_mod";
							} else {
								newAbility.action_list[0].type = "save";
								fail_miss = "save_fail_mod";

								const save_dc = ability.desc.match(/(DC).([0-9]+)/g);
								if(save_dc) {
									newAbility.action_list[0].save_dc = save_dc[0].split(" ")[1];
								}

								// Find the ability
								for(const ab of this.abilities) {
									if(ability.desc.toLowerCase().search(ab) > -1) {
										newAbility.action_list[0].save_ability = ab;
									}
								}
							}

							// Create an array of damage types found in the description
							let damage_types = [];
							for(const type of this.damage_types) {
								const position = ability.desc.toLowerCase().search(type);
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
									const damage_type = (damage_types[index]) ? damage_types[index] : undefined;

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

						this.monster[action_type].push(newAbility);
					}
				}
			}
			if(this.monster.legendary_actions && this.monster.legendary_actions.length > 0) {
				this.monster.lengendary_count = 3;
			}
			
		},
		update() {
			this.$forceUpdate();
		},
	
		async store_monster() {
			console.log('saved')
			delete this.monster['.value'];
			delete this.monster['.key'];

			this.monster.changed = true;
			this.monster.checked = false;

			// Firebase can't be searched without case sensitivity
			this.monster.name = this.monster.name.toLowerCase();

			db.ref(`new_monsters/${this.id}`).set(this.monster);
			this.$snotify.success('Monster Saved.', 'Critical hit!', {
				position: "rightTop"
			});
			this.unsaved_changes = false;
			// Capitalize before stringyfy so changes found isn't triggered
			this.monster.name = this.monster.name.capitalizeEach();
			this.fb_monster_json = JSON.stringify(this.monster);
		},
		cancel_changes() {
			this.monster = JSON.parse(this.fb_monster_json);
			this.unsaved_changes = false;
		}
	},
	watch: {
		monster: {
			deep: true,
			handler() {
				// Emits validation on every change
				if (JSON.stringify(this.monster) !== this.fb_monster_json)
					this.unsaved_changes = true;
				else
					this.unsaved_changes = false;
				
				// Capitalize name
				if (this.monster.name)
					this.monster.name = this.monster.name.capitalizeEach();
			},
		}
	},
	beforeRouteLeave (to, from, next) {
		if (this.unsaved_changes) {
			this.$snotify.error('There are unsaved changes in the form.\n Would you like to continue?', 'Unsaved Changes', {
				buttons: [
				{ text: 'Leave', action: (toast) => { next(); this.$snotify.remove(toast.id); }, bold: false},
				{ text: 'Stay', action: (toast) => { next(false); this.$snotify.remove(toast.id); }, bold: true},
				]
			});
		} else {
			next()
		}
	}

}
</script>


<style lang="scss" scoped>
.monster-wrapper {
	display: grid;
	grid-template-rows: 105px 1fr 60px;
	height: calc(100vh - 50px) !important;
	padding: 20px 20px 0 20px;

	.mid {
		height: calc(100vh - 235px) !important;
		
		.old_monster, .new {
			height: calc(100vh - 220px) !important;
			overflow: auto;

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
	.save {
		display: flex;
		justify-content: space-between;
		padding: 10px 0;
		border-top: solid 1px #5c5757;

		.unsaved_changes {
			padding: 10px;
			height: 38px;
			margin-right: 10px;
		}
	}
}

</style>