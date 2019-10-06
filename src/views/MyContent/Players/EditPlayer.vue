<template>
	<div id="hasSide">
		<Sidebar/>
		<div v-if="overencumbered" class='container'>
			<OverEncumbered/>
		</div>
		
		<template v-else-if="player">
			<div id="players" class="container-fluid" v-if="($route.name == 'Edit Character' && player.control == $store.getters.getUser.uid) || $route.name != 'Edit Character'">

				<!-- GIVE OUT CONTROL -->
				<b-card header="Give out control" v-if="$route.name != 'AddPlayers' && $route.name != 'Edit Character'">
					<p>Give control over this character to another user. Let your players change their base stats themselves, so it is less work for you.<br/> You can always revert this and you also keep control yourself.</p>
					
					<div v-if="controlUser">
						<a @click="removeControl()" v-b-tooltip.hover title="Remove Control">
							<i class="fas fa-times red"></i>
						</a> 
						Control given to <span class="green">{{ controlUser.username }}</span> ({{ controlUser.email }}).
					</div>
					<div v-else>
						<label>Enter the full username or email.</label>
						<b-form inline>
							<b-form-input type="text" autocomplete="off"  class="mr-2 mt-2" v-model="findUser" placeholder="username or email" />

							<a class="btn mt-2" variant="primary" @click="find_user()">Find user</a>
						</b-form>
						
						<p v-if="foundUser === false && findUser != ''" class="red">User {{ findUser }} not found</p>
						<div v-else-if="foundUser && findUser != ''">
							<hr>
							<p> 
								Username: {{ foundUser.username }}<br/>
								Email: {{ foundUser.email }}
							</p>
							<button class="btn btn-block mt-4 bg-green" @click="confirmGiveControl()">
								Give control to {{ foundUser.username }}
							</button>
						</div>
					</div>
				</b-card>
				
				<b-card header="Basic Info">
					<b-row>
						<b-col sm="2">
							<span class="img" v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></span>
							<span class="img" v-else>
								<img src="@/assets/_img/styles/player.svg" />
							</span>
						</b-col>
						<b-col sm="10" class="mb-3">
							<b-row class="mb-2" v-if="$route.name != 'Edit Character'">
								<b-col sm="2">
									<label for="player_name">Player *</label>
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
									<label for="character_name">Character *</label>
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

				<b-card-group deck>
					<!-- LEVEL & XP -->
					<b-card header="Level & Experience">
						<b-row>
							<b-col md="8" class="mb-2">
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
							<b-col md="4" class="mb-2">
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
						</b-row>
					</b-card>

					<!-- HEALTH & AC -->
					<b-card header="Health & Armor Class">
						<b-row>
							<b-col md="4" class="mb-2">
								<label for="maxHp">HP *</label>
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
								<label for="ac">AC *</label>
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

				<b-row>
					<!-- ABILITY SCORES -->
					<b-col sm="6">
						<b-card header="Ability Scores">
							<b-row class="mb-2" v-for="(ability, index) in abilities" :key="index">
								<b-col class="col-3">
									<label :for="ability.ability">
										{{ ability.ability.substring(0,3).toUpperCase() }}
									</label>
								</b-col>
								<b-col class="col-9">
									<b-form-input autocomplete="off"  
										:id="ability.ability" 
										type="number" 
										v-model="player[ability.ability]" 
										:name="ability.ability" 
										:placeholder="ability.ability.substring(0,3).toUpperCase()"></b-form-input>
								</b-col>
							</b-row>
						</b-card>
					</b-col>

					<!-- SKILLS -->
					<b-col sm="6">
						<b-card header="Skills">
							<p>Proficiency Bonus: +{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}</p>

							<b-form-group label="Select skill proficiencies">
								<b-form-checkbox-group
									id="skills"
									name="skills"
									v-model="player.skills"
									stacked
								>
									<b-form-checkbox :value="key" v-for="(skill, key) in skillList" :key="key">
										<span class="skill">
											{{skill.skill  }}
											<span>
												<span class="gray-hover mr-3">{{ skill.ability.substring(0,3) }}</span>
												{{ 
													calculateSkillModifier(
														calcMod(player[skill.ability]),
														player.skills ? (
														player.skills.includes(key) ? 
														returnProficiency(player.level ? player.level : calculatedLevel(player.experience))
														: 0) : 0
													) 
												}}
											</span>
										</span>
									</b-form-checkbox>
								</b-form-checkbox-group>
							</b-form-group>
						</b-card>
					</b-col>
				</b-row>

				<!-- SENSES -->
				<b-card header="Senses">
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
				
				<router-link to="/players" class="btn bg-gray mr-2 mt-3">Cancel</router-link>
				<button v-if="$route.name == 'AddPlayers'" class="btn mt-3" @click="addPlayer()"><i class="fas fa-plus"></i> Add Player</button>
				<button v-else class="btn mt-3" @click="editPlayer()"><i class="fas fa-check"></i> Save</button>
			</div>
		</template>
		<div class="container-fluid" v-else-if="$route.name == 'Edit Character'">
			<p class="red">You have no conrol over this character</p>
			<router-link to="/players" class="btn bg-gray mr-2 mt-3">Back</router-link>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'
	import { experience } from '@/mixins/experience.js'
	import { skills } from '@/mixins/skills.js'
	import { general } from '@/mixins/general.js'

	export default {
		name: 'Players',
		mixins: [experience, skills, general],
		metaInfo: {
			title: 'Players'
		},
		components: {
			Sidebar,
			OverEncumbered,
		},
		data() {
			return {
				playerId: this.$route.params.id,
				controlUser: undefined,
				findUser: undefined,
				foundUser: undefined,
			}
		},
		firebase() {
			return {
				abilities: db.ref('abilities'),
				users: db.ref(`users`),
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
			]),
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
		beforeMount() {
			this.fetch_control()
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			fetch_control() {
				let playr = db.ref(`players/${this.userId}/${this.playerId}/control`);
				playr.on('value' , (snapshot) => {
					let key = snapshot.val()

					if(key) {
						let user = db.ref(`users/${key}`)

						user.on('value' , (snapshot) => {
							this.controlUser = {
								email : snapshot.val().email,
								username: snapshot.val().username,
							}
						});
					}
				});
			},
			find_user() {
				for (var i in this.users) {
					var user = this.users[i]
					if(user.username) {
						if (user.username.toLowerCase() == this.findUser.toLowerCase() || user.email.toLowerCase() == this.findUser.toLowerCase()) {
							this.foundUser = user
							return
						} else {
							this.foundUser = false;
						}
					} else {
						this.foundUser = false;
					}
				}
			},
			confirmGiveControl() {
				this.$snotify.success('Are you sure you want to give "' + this.foundUser.username + '" control over this character?', 'Give out control', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.giveControl(); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			giveControl() {
				db.ref(`players/${this.userId}/${this.playerId}/control`).set(this.foundUser['.key']);
				db.ref(`character_control/${this.foundUser['.key']}/${this.playerId}`).set({
					user: this.userId,
				});
			},
			removeControl() {
				db.ref(`character_control/${this.player.control}/${this.playerId}`).remove();
				db.ref(`players/${this.userId}/${this.playerId}/control`).remove();
				this.controlUser = undefined
			},
			addPlayer() {
				if(Object.keys(this.players).length >= this.tier.benefits.players) {
					this.$snotify.error('You have too many player.', 'Error');
				} else {
					// THIS IS UGLY
					delete this.player['.value']
					delete this.player['.key']

					// UGLY ENDS HERE
					this.$validator.validateAll().then((result) => {
						if (result) {
							db.ref('players/' + this.userId).push(this.player);
							this.$router.replace('/players')
						}
					})
				}
			},
			editPlayer() {
				delete this.player['.key']

				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`players/${this.userId}/${this.playerId}`).update(this.player);
						this.$router.replace('/players')
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
	.skill {
		min-width: 250px;
		display: flex;
		justify-content: space-between;
	}
}
</style>