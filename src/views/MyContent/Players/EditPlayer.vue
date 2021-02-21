<template>
	<div>
		<div v-if="overencumbered">
			<OverEncumbered/>
		</div>
		
		<template v-else-if="player">
			<div id="players" class="container-fluid scrollable-content" v-if="($route.name == 'Edit Character' && player.control === $store.getters.user.uid) || $route.name != 'Edit Character'">

				<!-- GIVE OUT CONTROL -->
				<hk-card header="Give out control" v-if="$route.name != 'AddPlayers' && $route.name != 'Edit Character'">
					<GiveCharacterControl :playerId="playerId" :control="player.control" />
				</hk-card>

				<hk-card-deck class="mb-4">
					<hk-card header="Basic Info" >
						<q-input 
							v-if="$route.name != 'Edit Character'"
							dark filled square
							label="Player name"
							autocomplete="off"  
							type="text" 
							class="mb-2" 
							v-model="player.player_name" 
							v-validate="'max:15|required'" 
							maxlength="15"
							data-vv-as="Name"
							name="player_name" 
						/>
						<p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>
						
						<q-input 
							dark filled square
							label="Character name"
							autocomplete="off"  
							type="text" 
							class="mb-2" 
							v-model="player.character_name" 
							v-validate="'max:35|required'" 
							maxlength="35"
							data-vv-as="Character Name"
							name="character_name" 
						/>
						<p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>
	
						<div class="avatar">
							<div class="img" v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></div>
							<div class="img" v-else>
								<img src="@/assets/_img/styles/player.svg" />
							</div>
							<div>
								<q-input 
									dark filled square
									label="Avatar"
									autocomplete="off"  
									type="text" 
									v-model="player.avatar"
									v-validate="'url'"
									data-vv-as="Avatar"
									name="avatar"
									placeholder="Image URL"/>
								<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
							</div>
						</div>

					</hk-card>
					<hk-card header="Level & Base Stats">
						<div class="row q-col-gutter-md">
							<div class="col-12 col-md-6">
								<q-input 
									dark filled square
									label="Experience points"
									autocomplete="off" 
									type="number" 
									min="0"
									max="355000"
									v-model="player.experience" 
									v-validate="'numeric|min_value:0|max_value:355000'" 
									data-vv-as="experience"
									name="experience" 
									:disable="player.level > 0"
								>
									<template v-slot:append>
										<small><span class="gray-hover">level:</span> {{ player.level ? player.level : calculatedLevel(player.experience) }}</small>
										<q-icon name="info" class="ml-1 pointer" size="xs" @click="setSlide({show: true, type: 'slides/xpTable'})"/>
									</template>
								</q-input>				
								<p class="validate red" v-if="errors.has('experience')">{{ errors.first('experience') }}</p>
							</div>
							<div class="col-12 col-md-6">
								<q-input 
									dark filled square
									clearable
									label="Level override"
									autocomplete="off"
									type="number" 
									min="1"
									max="20"
									v-model="player.level" 
									v-validate="'numeric|min_value:1|max_value:20'" 
									data-vv-as="Level Override"
									name="level"
								/>
								<p class="validate red" v-if="errors.has('level')">{{ errors.first('level') }}</p>
							</div>
							<div class="col-12 col-md-4">
								<q-input 
									dark filled square
									label="Hit points"
									autocomplete="off"  id="maxHp" 
									type="number" 
									min="1"
									v-model="player.maxHp" 
									v-validate="'numeric|required'" 
									data-vv-as="Maxium Hit Points"
									name="maxHp" 
									placeholder="Maximum Hit Points*"
								>
									<q-icon slot="append" name="fas fa-heart" />
								</q-input>
								<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
							</div>
							<div class="col-12 col-md-4">
								<q-input 
									dark filled square
									label="Armor class"
									autocomplete="off"  
									id="ac" 
									min="1"
									type="number" 
									v-model="player.ac" 
									v-validate="'numeric|required'" 
									data-vv-as="Armor Class"
									name="ac" 
								>
									<q-icon slot="append" name="fas fa-shield" />
								</q-input>
								<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
							</div>
							<div class="col-12 col-md-4">
								<q-input 
									dark filled square
									label="Spell save DC"
									autocomplete="off"  
									id="save_dc" 
									min="0"
									type="number" 
									v-model="player.spell_save_dc" 
									name="save_dc" 
								/>
							</div>
						</div>
					</hk-card>
				</hk-card-deck>

				<!-- ABILITY SCORES -->
				<hk-card header="Ability Scores & Senses" class="ability-card">

					<h6 class="mb-2">Ability scores</h6>
					<div class="row q-col-gutter-md">
						<div v-for="(ability, index) in abilities" :key="index" class="col-6 col-md-2 mb-2">
							<q-input 
								dark filled square
								:label="ability.ability.capitalize()"
								autocomplete="off"  
								type="number" 
								v-model="player[ability.ability]" 
								:name="ability.ability"
							>
								<q-checkbox 
									slot="append"
									size="xs" 
									dark 
									v-model="player[`${ability.ability}-save-profficient`]" 
									:false-value="null" 
									indeterminate-value="something-else" 
								>
									<q-tooltip anchor="top middle" self="center middle">
										Saving throw proficiency
									</q-tooltip>
								</q-checkbox>
							</q-input>
						</div>
					</div>

					<!-- SENSES -->
					<h6 class="mt-3 mb-2">Senses</h6>
					<div class="row q-col-gutter-md">
						<div  class="col-12 col-md-4 mb-2">
							<q-input 
								dark filled square
								label="Passive perception"
								autocomplete="off" 
								type="number" 
								min="1"
								max="20"
								v-model="player.passive_perception" 
								v-validate="'numeric'" 
								data-vv-as="Passive Perception"
								name="pper" 
								placeholder="Perception" />
							<p class="validate red" v-if="errors.has('pper')">{{ errors.first('pper') }}</p>
						</div>
						<div  class="col-12 col-md-4 mb-2">
							<q-input 
								dark filled square
								label="Passive investigation"
								autocomplete="off"
								type="number" 
								min="1"
								max="20"
								v-model="player.passive_investigation" 
								v-validate="'numeric'" 
								data-vv-as="Passive Investigation"
								name="pinv" 
								placeholder="Investigation" />
							<p class="validate red" v-if="errors.has('pinv')">{{ errors.first('pinv') }}</p>
						</div>
						<div  class="col-12 col-md-4 mb-2">
							<q-input 
								dark filled square
								label="Passive insight"
								autocomplete="off"
								type="number" 
								min="1"
								max="20"
								v-model="player.passive_insight" 
								v-validate="'numeric'" 
								data-vv-as="pins"
								name="pins" 
								placeholder="Insight" />
							<p class="validate red" v-if="errors.has('pins')">{{ errors.first('pins') }}</p>
						</div>
					</div>
				</hk-card>

				<Defenses v-model="player" />

				<!-- SKILLS -->
				<hk-card header="Skills">
					<h5>
						Proficiency Bonus: 
						+<b class="blue">{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}</b>
					</h5>

					<div class="skills">
						<div v-for="(skill, key) in skillList" :key="key" class="d-flex justify-content-start">
							<q-checkbox 
								size="xs" 
								dark
								:val="key" 
								v-model="skills_expertise" 
								:false-value="null" indeterminate-value="something-else"
								:disable="player.skills ? !player.skills.includes(key) : true"
							>
								<template slot:label>
									+{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}
								</template>
								<q-tooltip anchor="top middle" self="center middle">
									Expertise
								</q-tooltip>
							</q-checkbox>

							<q-checkbox 
								size="xs" 
								dark
								:val="key" 
								v-model="skills" 
								:false-value="null" indeterminate-value="something-else"
							>
								<template slot:label>
									<div class="skill">
										<div class="gray-hover abillity">{{ skill.ability.substring(0,3) }}</div>
										{{ skill.skill  }}
										<div class="mod">
											{{ 
												calculateSkillModifier(
													calcMod(player[skill.ability]),
													player.skills ? (
													player.skills.includes(key) ? 
													returnProficiency(player.level ? player.level : calculatedLevel(player.experience))
													: 0) : 0,
													player.skills_expertise ? player.skills_expertise.includes(key) : false
												) 
											}}
										</div>
									</div>
								</template>
								<q-tooltip anchor="top middle" self="center middle">
									Proficiency
								</q-tooltip>
							</q-checkbox>
						</div>
					</div>
				</hk-card>

				<hk-card header="Companions">
					<template v-if="isOwner()">
						<div v-if="!npcs">
							<p>You currently have no custom npcs created</p>
							<p>First create a custom NPC to use as a companion</p>
							<router-link class="btn bg-green" to="/npcs"><i class="fas fa-plus"></i>Add an NPC</router-link>
						</div>
						<div v-else>
							<q-input 
								dark filled square dense
								label="Search NPC"
								type="text" 
								autocomplete="off" 
								v-model="search" @keyup="searchNPC()"
							>
								<q-icon slot="append" size="xs" name="fas fa-search" @click="searchNPC()"/>
							</q-input>

							<ul class="entities">
								<p v-if="noResult" class="red">{{ noResult }}</p>
								<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
									<div class="d-flex justify-content-left">
										<a @click="setSlide({show: true, type: 'ViewEntity', data: npc})" class="mr-2">
											<i class="fas fa-info-circle"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Show info
											</q-tooltip>
										</a>
										{{ npc.name }}
									</div>
									<a class="gray-hover" v-if="notAdded(npc)" @click="add(npc)">
										<i class="fas fa-plus green"></i>
										<span class="d-none d-md-inline ml-1">Add</span>
										<q-tooltip anchor="top middle" self="center middle">
											Add companion
										</q-tooltip>
									</a>
									<span v-else><small>Already added.</small></span>
								</li>
							</ul>
						</div>
					</template>

					<!--  Companions table -->
					<hk-table v-if="player.companions !== undefined"
						:columns="columns"
						:items="_companions"
					>
						<template slot="avatar" slot-scope="data">
							<div class="image" v-if="data.item" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }"></div>
							<img v-else class="image" src="@/assets/_img/styles/monster.svg" />
						</template>

						<template slot="name" slot-scope="data">
							<router-link class="mx-2" :to="`/companions/${userId}/${data.row.key}`">
									{{ data.item }}
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
							</router-link>
						</template>

						<div slot="actions" slot-scope="data" class="actions">
							<router-link class="gray-hover mx-1" :to="`/companions/${userId}/${data.row.key}`" >
								<i class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
							<a v-if="isOwner()"
								class="gray-hover"
								@click="confirmDelete(data.row.key)">
								<i class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
							</a>
						</div>
					</hk-table>
					<div v-else-if="!isOwner()">
						<p>You currently have no companions linked to your player character</p>
						<p>Ask your DM to link an NPC to you character</p>
						<!-- <router-link class="btn bg-green" to="/npcs"><i class="fas fa-plus"></i>Add an NPC</router-link> -->
					</div>
				</hk-card>

				<router-link :to="$route.meta.basePath" class="btn bg-gray mr-2 mt-3">Cancel</router-link>
				<button v-if="$route.name == 'AddPlayers'" class="btn mt-3" @click="addPlayer()"><i class="fas fa-plus"></i> Add Player</button>
				<button v-else class="btn mt-3" @click="editPlayer()"><i class="fas fa-check"></i> Save</button>
			</div>
		</template>
		<div class="container-fluid" v-else-if="$route.name == 'Edit Character'">
			<p class="red">You have no conrol over this character</p>
			<router-link :to="$route.meta.basePath" class="btn bg-gray mr-2 mt-3">Back</router-link>
		</div>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import { experience } from '@/mixins/experience.js';
	import { skills } from '@/mixins/skills.js';
	import { general } from '@/mixins/general.js';
	import Defenses from './Defenses';

	export default {
		name: 'Players',
		mixins: [experience, skills, general],
		metaInfo: {
			title: 'Players'
		},
		components: {
			OverEncumbered,
			GiveCharacterControl,
			Defenses
		},
		data() {
			return {
				playerId: this.$route.params.id,
				search: '',
				searchResults: [],
				noResult: '',
				companions_to_delete: [],
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					name: {
						label: 'Name',
						truncate: true
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
					}
				}
			}
		},
		firebase() {
			return {
				abilities: db.ref('abilities'),
				player: {
					source: db.ref(`players/${this.userId}/${this.playerId}`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
				'npcs',
			]),
			_companions: function() {
				let comps = [];
				if (Object.keys(this.npcs).length > 0) {
					for (let key in this.player.companions) {
						let npc = this.npcs[key];
						npc.key = key;
						comps.push(npc);
					}
				}
				return comps;
			},
			//User ID needs te be different if it is
			//an external controlled character
			userId() {
				if(!this.isOwner()) {
					let id = undefined
					let user = db.ref(`character_control/${this.$store.getters.user.uid}/${this.$route.params.id}`);
					user.on('value' , (snapshot) => {
						id = snapshot.val().user
					});
					return id;
				} else {
					return this.$store.getters.user.uid;
				}
			},
			skills: {
				get() {
					return this.player.skills ? this.player.skills : [];
				},
				set(newValue) {
					this.$set(this.player, 'skills', newValue);
				}
			},
			skills_expertise: {
				get() {
					return this.player.skills_expertise ? this.player.skills_expertise : [];
				},
				set(newValue) {
					this.$set(this.player, 'skills_expertise', newValue);
				}
			},
		},
		mounted() {
			if(this.$route.name === 'AddPlayers') {
				this.$set(this.player, "strength", 10);
				this.$set(this.player, "dexterity", 10);
				this.$set(this.player, "constitution", 10);
				this.$set(this.player, "intelligence", 10);
				this.$set(this.player, "wisdom", 10);
				this.$set(this.player, "charisma", 10);
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			isOwner() {
				if (this.$route.name == 'Edit Character')
					return false
				return true
			},
			addPlayer() {
				if(Object.keys(this.players).length >= this.tier.benefits.players) {
					this.$snotify.error('You have too many players.', 'Error');
				} else {
					delete this.player['.value'];
					delete this.player['.key'];

					this.$validator.validateAll().then((result) => {
						if (result) {
							db.ref('players/' + this.userId).push(this.player);
							this.$router.replace(this.$route.meta.basePath)
						}
					})
				}
			},
			editPlayer() {
				delete this.player['.key']

				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`players/${this.userId}/${this.playerId}`).update(this.player);

						// If player already in campaign, add companions to campaign
						// IN FUTURE migrate this to add / remove companion functions
						if (this.player.campaign_id !== undefined) {
							let vm = this;
							const player_data = this.player
							const camp_ref = db.ref(`campaigns/${this.userId}/${this.player.campaign_id}`);
							camp_ref.once('value').then(function(snapshot) {
								let campaign = snapshot.val();
								for (let comp_key in player_data.companions) {
									// Add player id to npc data
									db.ref(`npcs/${vm.userId}/${comp_key}`).update({'player_id': vm.playerId});
									// If companion not yet in campaign, add it with npc data curHP
									if (campaign.companions === undefined) {
										camp_ref.child('companions').child(comp_key).set({'curHp': vm.npcs[comp_key].maxHp})
									}
									else if (!Object.keys(campaign.companions).includes(comp_key)) {
										camp_ref.child('companions').child(comp_key).set({'curHp': vm.npcs[comp_key].maxHp})
									}
									else {
										// console.log('companion already added')
									}
								}
								// Remove companion from campaign object and remove entity from all encounters in campaign
								for (let comp_del_key of vm.companions_to_delete) {
									if (campaign.companions !== undefined && Object.keys(campaign.companions).includes(comp_del_key)) {
										camp_ref.child('companions').child(comp_del_key).remove();
									}
									// console.log(vm.userId);
									db.ref(`npcs/${vm.userId}/${comp_del_key}`).child('player_id').remove();
									const enc_ref = db.ref(`encounters/${vm.userId}/${player_data.campaign_id}`)
									enc_ref.once('value').then(function(snapshot) {
										const encounters = snapshot.val()
										for (let encounter_key in encounters) {
											if (Object.keys(encounters[encounter_key].entities).includes(comp_del_key)) {
												enc_ref.child(`${encounter_key}/entities/${comp_del_key}`).remove();
											}
										}
									})
								}
							})
						}
						this.$router.replace(this.$route.meta.basePath)
					} else {
						//console.log('Not valid');
					}
				});
			},
			showSlide(type) {
				this.setSlide({
					show: true,
					type,
				})
			},
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (const i in this.npcs) {
					const m = this.npcs[i];
					m.key = i;
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			add(npc) {
				if (this.player.companions === undefined) {
					this.$set(this.player, 'companions', {});
				}

				this.$set(this.player.companions, npc.key, true);

				this.searchResults = [];
				this.search = '';

				// If companion was deleted before saving, undelete it
				if (this.companions_to_delete.indexOf(npc.key) > -1) {
					this.companions_to_delete.splice(this.companions_to_delete.indexOf(npc.key), 1);
				}

				this.$forceUpdate();
			},
			notAdded(npc) {
				let key = npc.key;
				// Check for companion in player
				for (let i in this.player.companions) {
					if (i == key)
						return false;
				}
				// Check for companion in all other players (no own)
				for (let pI in this.players) {
					if (this.player['.key'] !== pI) {
						for (let i in this.players[pI].companions) {
							if (i == key)
								return false;
						}
					}
				}
				return true;
			},
			confirmDelete(index) {

				this.$delete(this.player.companions, index)
				this.companions_to_delete.push(index);
			},
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	label {
		line-height: 37px;
		margin-bottom: 0;

		&.experience {
			display: flex;
			justify-content: space-between;
		}

		svg {
			fill: $gray-light;
			width: 20px;
			height: 20px;
		}
	}
	.avatar {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;

		.img {
			border: solid 1px $gray-light;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
	.skills {
		columns: 3;

		.skill {
			width: 100%;
			display: grid;
			grid-template-columns: 45px 1fr min-content;

			.abillity {
				text-transform: uppercase;
				text-align: center;
			}
			.mod {
				margin-left: 8px;
			}
		}
	}
	@media only screen and (max-width: 1250px) { 
		.skills {
			columns: 2;
		}
	}
	@media only screen and (max-width: 890px) { 
		.skills {
			columns: 1;
		}
	}
}
</style>