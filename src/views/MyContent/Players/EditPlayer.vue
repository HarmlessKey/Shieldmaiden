<template>
	<div>
		<div v-if="overencumbered">
			<OverEncumbered/>
		</div>
		
		<template v-else-if="player">
			<div id="players" class="container-fluid scrollable-content" v-if="($route.name == 'Edit Character' && player.control === $store.getters.getUser.uid) || $route.name != 'Edit Character'">

				<!-- GIVE OUT CONTROL -->
				<b-card header="Give out control" v-if="$route.name != 'AddPlayers' && $route.name != 'Edit Character'">
					<GiveCharacterControl :playerId="playerId" :control="player.control" />
				</b-card>
				
				<b-card-group deck>
					<b-card header="Basic Info">
						<b-row>
							<b-col md="2">
								<span class="img" v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></span>
								<span class="img" v-else>
									<img src="@/assets/_img/styles/player.svg" />
								</span>
							</b-col>
							<b-col md="10" class="mb-3">
								<b-row class="mb-2" v-if="$route.name != 'Edit Character'">
									<b-col sm="2">
										<label for="player_name" class="required">Player</label>
									</b-col>
									<b-col sm="10">
										<b-form-input autocomplete="off"  
											id="player_name" 
											type="text" 
											:class="{'input': true, 'error': errors.has('player_name') }" 
											v-model="player.player_name" 
											v-validate="'max:15|required'" 
											maxlength="15"
											data-vv-as="Name"
											name="player_name" 
											placeholder="Player Name"></b-form-input>
										<p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>
									</b-col>
								</b-row>

								<b-row class="mb-2">
									<b-col sm="2">
										<label for="character_name" class="required">Character</label>
									</b-col>
									<b-col sm="10">
										<b-form-input autocomplete="off"  
											id="character_name" 
											type="text" 
											:class="{'input': true, 'error': errors.has('character_name') }" 
											v-model="player.character_name" 
											v-validate="'max:35|required'" 
											maxlength="35"
											data-vv-as="Character Name"
											name="character_name" 
											placeholder="Character Name"></b-form-input>
										<p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>
									</b-col>
								</b-row>

								<b-row>
									<b-col sm="2">
										<label for="avatar">Avatar</label>
									</b-col>
									<b-col sm="10">
										<b-form-input autocomplete="off"  
											id="avatar" 
											type="text" 
											:class="{'input': true, 'error': errors.has('avatar') }"
											v-model="player.avatar"
											v-validate="'url'"
											data-vv-as="Avatar"
											name="avatar"
											placeholder="Image URL"></b-form-input>
										<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
									</b-col>
								</b-row>
							</b-col>
						</b-row>
					</b-card>
					<b-card header="Level & Base Stats">
						<b-row>
							<b-col md="6" class="mb-2">
								<label for="experience" class="experience">
									<span>XP</span>
									<span>
										<span class="gray-hover">level:</span> {{ player.level ? player.level : calculatedLevel(player.experience) }}
										<a class="ml-2" @click="setSlide({show: true, type: 'slides/xpTable'})"><i class="fas fa-info-circle"></i></a>
									</span>
								</label>
								<b-form-input autocomplete="off"  id="experience" 
									type="number" 
									min="0"
									max="355000"
									:class="{'input': true, 'error': errors.has('experience') }" 
									v-model="player.experience" 
									v-validate="'numeric|min_value:0|max_value:355000'" 
									data-vv-as="experience"
									name="experience" 
									placeholder="Experience" />
								<p class="validate red" v-if="errors.has('experience')">{{ errors.first('experience') }}</p>
							</b-col>
							<b-col md="6" class="mb-2">
								<label for="level">Level Override</label>
								<b-form-input autocomplete="off"  id="level" 
									type="number" 
									min="1"
									max="20"
									:class="{'input': true, 'error': errors.has('level') }" 
									v-model="player.level" 
									v-validate="'numeric|min_value:1|max_value:20'" 
									data-vv-as="Level Override"
									name="level" 
									placeholder="Level Override" />
								<p class="validate red" v-if="errors.has('level')">{{ errors.first('level') }}</p>
							</b-col>
							<b-col md="4" class="mb-2">
								<label for="maxHp" class="required">HP</label>
								<b-form-input autocomplete="off"  id="maxHp" 
									type="number" 
									min="1"
									:class="{'input': true, 'error': errors.has('maxHp') }" 
									v-model="player.maxHp" 
									v-validate="'numeric|required'" 
									data-vv-as="Maxium Hit Points"
									name="maxHp" 
									placeholder="Maximum Hit Points*" />
								<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
							</b-col>
							<b-col md="4" class="mb-2">
								<label for="ac" class="required">AC</label>
								<b-form-input autocomplete="off"  
									id="ac" 
									min="1"
									type="number" 
									:class="{'input': true, 'error': errors.has('ac') }" 
									v-model="player.ac" 
									v-validate="'numeric|required'" 
									data-vv-as="Armor Class"
									name="ac" 
									placeholder="Armor Class" />
								<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
							</b-col>
							<b-col md="4">
								<label for="save_dc">Spell Save DC</label>
								<b-form-input autocomplete="off"  
									id="save_dc" 
									min="0"
									type="number" 
									v-model="player.spell_save_dc" 
									name="save_dc" 
									placeholder="Save DC" />
							</b-col>
						</b-row>
					</b-card>
				</b-card-group>

				<b-card-group deck>
					<!-- ABILITY SCORES -->
					<b-card header="Ability Scores & Senses" class="ability-card">
						<div class="mb-2 d-flex justify-content-start">
								<div class="name">
									<label>Ability</label>
								</div>
								<div class="value">
									<label>Value</label>
								</div>
								<div class="save">
									<label class="ml-2">Save</label>
								</div>
						</div>
						<div class="mb-2 d-flex justify-content-start" v-for="(ability, index) in abilities" :key="index">
							<div class="name">
								<label :for="ability.ability">
									{{ ability.ability.substring(0,3).toUpperCase() }}
								</label>
							</div>
							<div class="value">
								<b-form-input autocomplete="off"  
									:id="ability.ability" 
									type="number" 
									v-model="player[ability.ability]" 
									:name="ability.ability" 
									:placeholder="ability.ability.substring(0,3).toUpperCase()"></b-form-input>
							</div>
							<div class="save">
								<b-form-checkbox
									class="ml-3 mt-2"
									v-model="player[`${ability.ability}-save-profficient`]">
										+{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}
									</b-form-checkbox>
							</div>
						</div>
						<!-- SENSES -->
						<h5 class="mt-5">Senses</h5>
						<b-row>
							<b-col md="4" class="mb-2">
								<label for="pper">Passive Perception</label>
								<b-form-input autocomplete="off"  id="pper" 
									type="number" 
									min="1"
									max="20"
									:class="{'input': true, 'error': errors.has('pper') }" 
									v-model="player.passive_perception" 
									v-validate="'numeric'" 
									data-vv-as="Passive Perception"
									name="pper" 
									placeholder="Perception" />
								<p class="validate red" v-if="errors.has('pper')">{{ errors.first('pper') }}</p>
							</b-col>
							<b-col md="4" class="mb-2">
								<label for="pinv">Passive Investigation</label>
								<b-form-input autocomplete="off"  id="pinv" 
									type="number" 
									min="1"
									max="20"
									:class="{'input': true, 'error': errors.has('pinv') }" 
									v-model="player.passive_investigation" 
									v-validate="'numeric'" 
									data-vv-as="Passive Investigation"
									name="pinv" 
									placeholder="Investigation" />
								<p class="validate red" v-if="errors.has('pinv')">{{ errors.first('pinv') }}</p>
							</b-col>
							<b-col md="4" class="mb-2">
								<label for="pins">Passive Insight</label>
								<b-form-input autocomplete="off"  id="pins" 
									type="number" 
									min="1"
									max="20"
									:class="{'input': true, 'error': errors.has('pins') }" 
									v-model="player.passive_insight" 
									v-validate="'numeric'" 
									data-vv-as="pins"
									name="pins" 
									placeholder="Insight" />
								<p class="validate red" v-if="errors.has('pins')">{{ errors.first('pins') }}</p>
							</b-col>
						</b-row>
					</b-card>

					<!-- SKILLS -->
					<b-card header="Skills">
						<p>Proficiency Bonus: +{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}</p>

						<div class="d-flex justify-content-start">
							<b-form-group label="Expertise" class="mr-2">
								<b-form-checkbox-group
									id="expertise"
									name="expertise"
									v-model="player.skills_expertise"
									stacked
								>
									<b-form-checkbox :value="key" v-for="(skill, key) in skillList" :key="key" :disabled="player.skills ? !player.skills.includes(key) : true">
										+{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}
									</b-form-checkbox>
								</b-form-checkbox-group>
							</b-form-group>
							<b-form-group label="Proficiency" class="skills">
								<b-form-checkbox-group
									id="skills"
									name="skills"
									v-model="player.skills"
									stacked
								>
									<b-form-checkbox :value="key" v-for="(skill, key) in skillList" :key="key">
										<div class="skill">
											<div class="gray-hover abillity">{{ skill.ability.substring(0,3) }}</div>
											<div>{{skill.skill  }}</div>
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
									</b-form-checkbox>
								</b-form-checkbox-group>
							</b-form-group>
						</div>
					</b-card>
				</b-card-group>

				<b-card header="Companion">
					<div v-if="!npcs">
						<p>You currently have no custom npcs created</p>
						<p>First create a custom NPC to use as a companion</p>
						<router-link class="btn bg-green" to="/npcs"><i class="fas fa-plus"></i>Add an NPC</router-link>
					</div>
					<div v-else>
						<div class="input-group mb-3">
							<input type="text" autocomplete="off" v-model="search" @keyup="searchNPC()" placeholder="Search NPC" class="form-control"/>
							<div class="input-group-append">
								<button class="btn" @click="searchNPC()"><i class="fas fa-search"></i></button>
							</div>
						</div>
						<ul class="entities">
							<p v-if="noResult" class="red">{{ noResult }}</p>
							<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
								<div class="d-flex justify-content-left">
									<a @click="setSlide({show: true, type: 'ViewEntity', data: npc})" class="mr-2" v-b-tooltip.hover title="Show Info">
										<i class="fas fa-info-circle"></i></a>
									{{ npc.name }}
								</div>
								<a class="gray-hover" v-if="notAdded(npc)"
									v-b-tooltip.hover title="Add Companion" 
									@click="add(npc)">
									<i class="fas fa-plus green"></i>
									<span class="d-none d-md-inline ml-1">Add</span>
								</a>
								<span v-else><small>Already added.</small></span>
							</li>
						</ul>
					</div>

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
							<router-link class="mx-2" 
								:to="'/npcs/' + data.row.key" 
								v-b-tooltip.hover title="Edit">{{ data.item }}
							</router-link>
						</template>

						<div slot="actions" slot-scope="data" class="actions">
							<router-link class="gray-hover mx-1" 
								:to="'/npcs/' + data.row.key" 
								v-b-tooltip.hover title="Edit">
								<i class="fas fa-pencil"></i>
							</router-link>
							<a v-b-tooltip.hover 
								title="Delete" 
								class="gray-hover"
								@click="confirmDelete(data.row.key)">
								<i class="fas fa-trash-alt"></i>
							</a>
						</div>
					</hk-table>
				</b-card>

	
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

	export default {
		name: 'Players',
		mixins: [experience, skills, general],
		metaInfo: {
			title: 'Players'
		},
		components: {
			OverEncumbered,
			GiveCharacterControl
		},
		data() {
			return {
				playerId: this.$route.params.id,
				search: '',
				searchResults: [],
				noResult: '',
				npcs: {},
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
				// 'npcs',
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
				if(this.$route.name == 'Edit Character') {
					let id = undefined
					let user = db.ref(`character_control/${this.$store.getters.getUser.uid}/${this.$route.params.id}`);
					user.on('value' , (snapshot) => {
						id = snapshot.val().user
					});
					return id;
				} else {
					return this.$store.getters.getUser.uid;
				}
			},
		},
		mounted() {
			let custom = db.ref(`npcs/${this.userId}`);
			custom.on('value', async (snapshot) => {
				this.npcs = snapshot.val();
			});
			this.loadingNpcs = false;
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			addPlayer() {
				if(Object.keys(this.players).length >= this.tier.benefits.players) {
					this.$snotify.error('You have too many players.', 'Error');
				} else {
					// THIS IS UGLY
					delete this.player['.value']
					delete this.player['.key']

					// UGLY ENDS HERE
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
				for (var i in this.npcs) {
					var m = this.npcs[i];
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

				this.$forceUpdate();
			},
			notAdded(npc) {
				let key = npc.key;
				for (let pI in this.players) {
					for (let i in this.players[pI].companions) {
						if (i == key)
							return false;
					}
				}
				for (let i in this.player.companions) {
					if (i == key)
						return false;
				}
				return true;
			},
			confirmDelete(index) {

				this.$delete(this.player.companions, index)
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
			fill: #b2b2b2;
			width: 20px;
			height: 20px;
		}
	}
	.img {
		display: block;
		width: 100px;
		height: 100px;
		background-size: cover;
		background-position: center top;
	}

	.ability-card {
		.card-body {
			// column-count: 2;
		}
		.name {
			width: 100px;
		}
		.value {
			width: 100px;
		}
		.checkbox {

		}
	}
}
</style>