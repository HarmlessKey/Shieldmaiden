<template>
	<div id="hasSide">
		<Sidebar/>
		
		<div id="players" class="container" v-if="player || $route.name == 'AddPlayers'">
			
			<b-card header="Basic Info">
				<b-row>
					<b-col sm="">
						<b-row class="mb-2">
							<b-col sm="2">
								<label for="player_name">Player *</label>
							</b-col>
							<b-col sm="10">
								<b-form-input 
									id="player_name" 
									type="text" 
									:class="{'input': true, 'error': errors.has('player_name') }" 
									v-model="player.player_name" 
									v-validate="'alpha_spaces|required'" 
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
								<b-form-input 
									id="character_name" 
									type="text" 
									:class="{'input': true, 'error': errors.has('character_name') }" 
									v-model="player.character_name" 
									v-validate="'alpha_spaces|required'" 
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
								<b-form-input 
									id="avatar" 
									type="text" 
									:class="{'input': true, 'error': errors.has('avatar') }"
									v-model="player.avatar"
									v-validate="'url'"
									name="avatar"
									placeholder="Image URL"></b-form-input>
								<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>
							</b-col>
						</b-row>
					</b-col>

					<b-col sm="3" v-if="player.avatar">
						<div class="img-container"><img :src="player.avatar" /></div>
					</b-col>
				</b-row>
			</b-card>

				<b-card header="Health & Armor Class">
					<b-row class="mb-2">
						<b-col sm="2">
							<label for="maxHp">HP</label>
						</b-col>
						<b-col sm="3">
							<b-form-input id="maxHp" type="number" :class="{'input': true, 'error': errors.has('maxHp') }" v-model="player.maxHp" v-validate="'numeric|required'" name="maxHp" placeholder="Maximum Hit Points*" />
							<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
						</b-col>
					</b-row>
					<b-row class="mb-2">
						<b-col sm="2">
							<label for="ac">AC *</label>
						</b-col>
						<b-col sm="3">
							<b-form-input 
								id="ac" 
								type="number" 
								:class="{'input': true, 'error': errors.has('ac') }" 
								v-model="player.ac" 
								v-validate="'numeric|required'" 
								name="ac" 
								placeholder="Armor Class" />
							<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
						</b-col>
					</b-row>
				</b-card>
				<b-card header="Ability Scores">
						<b-row class="mb-2" v-for="ability, index in abilities" :key="index">
							<b-col sm="2">
								<label :for="ability.ability">
									<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path :d="ability.icon"></path>
									</svg>
									{{ ability.ability.substring(0,3).toUpperCase() }}
								</label>
							</b-col>
							<b-col sm="8">
								<b-form-input 
									:id="ability.ability" 
									type="number" 
									v-model="player[ability.ability]" 
									:name="ability.ability" 
									:placeholder="ability.ability.substring(0,3).toUpperCase()"></b-form-input>
							</b-col>
						</b-row>
					</b-card>
			
			<router-link to="/players" class="btn bg-gray mr-2">Cancel</router-link>
			<button v-if="$route.name == 'AddPlayers'" class="btn" @click="addPlayer()"><i class="fas fa-plus"></i> Add Player</button>
			<button v-else class="btn" @click="editPlayer()"><i class="fas fa-check"></i> Save</button>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'Players',
		components: {
			Sidebar,
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				playerId: this.$route.params.id,
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
		methods: {
			addPlayer() {
				console.log(this.player)
				// THIS IS UGLY
				delete this.player['.value']
				delete this.player['.key']
				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('players/' + this.userId).push(this.player);
						this.$router.replace('/players')
					} else {
						//console.log('Not valid');
					}
				})
			},
			editPlayer() {
				// THIS IS UGLY
				delete this.player['.key']
				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`players/${this.userId}/${this.playerId}`).set(this.player);
						this.$router.replace('/players')
					} else {
						//console.log('Not valid');
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding-top:20px;

	.btn {
	margin-top:20px;
	}
	label {
		line-height: 37px;
		margin-bottom: 0;

		svg {
			fill: #b2b2b2;
			width: 20px;
			height: 20px;
		}
	}
	.img-container {
		width: 100%;

		img {
			width: 100%;
		}
	}
}



</style>