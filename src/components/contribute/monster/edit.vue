<template>
	<div class="content">
		<Crumble :name="(monster.changed) ? monster.name : old_monster.name"/>
		<h2 class="monsterTitle d-flex justify-content-between" v-if="old_monster">
			{{ (monster.changed) ? monster.name : old_monster.name }}
		</h2>
		
		<div class="monster-wrapper" v-if="canEdit()">
			<template v-if="(old_monster && monster)">
				
				<q-form @submit="store_monster()">
					<div class="row q-col-gutter-md">
						<div class="col-12 col-md-4" id="old_monster">

							<hk-card class="old_monster" >
								<template v-if="!loading">
									<div class="card-header d-flex justify-content-between" slot="header">
										<a @click="preview('old')" :class="preview_monster ==='old' ? 'selected' : ''">Old monster</a>
										<a @click="preview('new')" :class="preview_monster ==='new' ? 'selected' : ''">New monster</a>
									</div>
									<a 
										class="btn btn-block mb-3" 
										@click="parse_old_monster()">
											<i class="fas fa-wand-magic"></i>
											<span class="d-none d-md-inline ml-1">Parse to new monster</span>
									</a>
									<pre>{{ old_monster }}</pre>
									<div class="monster-card" v-if="preview_monster === 'old'">
										<ViewMonster :data="old_monster" />
									</div>
								</template>
								<hk-loader v-else />
							</hk-card>
						</div>
						<div class="col-12 col-md-8">
							<EditNpc :monster="monster" />
						</div>
					</div>
					<div class="save">
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
				</q-form>
			</template>
		</div>
	</div>
</template>

<script>
import { db } from '@/firebase';
import Crumble from '@/components/crumble/Compendium.vue';
import ViewMonster from '@/components/ViewMonster.vue';
import EditNpc from './forms/EditNpc.vue';
import { general } from '@/mixins/general.js';
import { abilities } from '@/mixins/abilities.js';
import { skills } from '@/mixins/skills.js';
import { monsterMixin } from '@/mixins/monster.js';
import { mapGetters } from 'vuex';

export default {
	name: 'MonsterEdit',
	components: {
		Crumble,
		ViewMonster,
		EditNpc
	},
	mixins: [general, abilities, skills, monsterMixin],
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

			// Defenses
			const damage_resistances = this.old_monster.damage_resistances.split(",");
			const damage_vulnerabilities = this.old_monster.damage_vulnerabilities.split(",");
			const damage_immunities = this.old_monster.damage_immunities.split(",");
			const condition_immunities = this.old_monster.condition_immunities.split(",");

			this.$set(this.monster, "damage_resistances", []);
			this.$set(this.monster, "damage_vulnerabilities", []);
			this.$set(this.monster, "damage_immunities", []);
			this.$set(this.monster, "condition_immunities", []);
			for(const resistance of damage_resistances) {
				this.monster.damage_resistances.push(
					resistance.trim().toLowerCase()
				);
			}
			for(const vulnerability of damage_vulnerabilities) {
				this.monster.damage_vulnerabilities.push(
					vulnerability.trim().toLowerCase()
				);
			}
			for(const immunity of damage_immunities) {
				this.monster.damage_immunities.push(
					immunity.trim().toLowerCase()
				);
			}
			for(const immunity of condition_immunities) {
				this.monster.condition_immunities.push(
					immunity.trim().toLowerCase()
				);
			}

			// Special abilities
			this.$set(this.monster, "special_abilities", []);
			for(const ability of this.old_monster.special_abilities) {
				delete ability.attack_bonus;
				this.monster.special_abilities.push(ability);
			}
			
			// Actions
			this.$set(this.monster, "actions", []);
			for(const ability of this.old_monster.actions) {
				const newAbility = {
					name: ability.name,
					desc: ability.desc
				};

				if(ability.damage_dice) {
					// Check if it's a targeted action or saving throw
					if(ability.attack_bonus !== 0) {
						newAbility.type = "targeted";
						newAbility.attack_bonus = ability.attack_bonus;
					} else {
						newAbility.type = "saving_throw";
						newAbility.save_ability = "";
					}

					newAbility.rolls = [];
					for(const damage in ability.damage_dice.split("+")) {
						const input = damage.split("d");
						newAbility.rolls.push({
							dice_count: input[0],
							dice_type: input[1],
							damage_type: ""
						})
					}
				}

				this.monster.actions.push(newAbility);
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

		
			db.ref(`new_monsters/${this.id}`).set(this.monster);
			this.$snotify.success('Monster Saved.', 'Critical hit!', {
				position: "rightTop"
			});
			this.unsaved_changes = false;
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
.content {
	padding:0 20px;

	.monster-wrapper {
		display: grid;
		height: calc(100vh - 174px) !important;
		grid-template-rows: auto 60px;
	
		.q-form {
			overflow-x: hidden;
			overflow-y: scroll;
	
			&::-webkit-scrollbar {
				display: none;
			}
			pre {
				overflow: auto;
			}
			.old_monster {
				position: -webkit-sticky;
				position: sticky;
				top: 0;
				.card-header a.selected {
					// font-weight: bold;
					color: white !important;
					cursor: default !important;
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
}

</style>