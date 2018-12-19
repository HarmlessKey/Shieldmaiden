<template>
	<div id="hasSide">
		<Sidebar/>
		
		<div id="players" class="container" v-if="player || $route.name == 'AddPlayers'">
			
			<h1>Basic info</h1>
			<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('player_name') }" v-model="player.player_name" v-validate="'alpha_spaces|required'" name="player_name" placeholder="Player Name*" />
			<p class="validate red" v-if="errors.has('player_name')">{{ errors.first('player_name') }}</p>

			<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('character_name') }" v-model="player.character_name" v-validate="'alpha_spaces|required'" name="character_name" placeholder="Character Name*" />
			<p class="validate red" v-if="errors.has('character_name')">{{ errors.first('character_name') }}</p>

			<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('avatar') }" v-model="player.avatar" v-validate="'url'" name="avatar" placeholder="Image URL" />
			<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>

			<h2 class="mt-4">Stats</h2>
			<input type="number" class="form-control" :class="{'input': true, 'error': errors.has('maxHp') }" v-model="player.maxHp" v-validate="'numeric|required'" name="maxHp" placeholder="Maximum Hit Points*" />
			<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>

			<input type="number" class="form-control" :class="{'input': true, 'error': errors.has('ac') }" v-model="player.ac" v-validate="'numeric|required'" name="ac" placeholder="Armor Class*" />
			<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

			<h2 class="my-4">Ability Scores</h2>
			<div class="abilities">
				<span class="ability str">
					<span class="abilityName">STR</span>
					<input type="number" class="form-control" v-model="player.strength" name="strength" placeholder="STR" />
				</span>
				<span class="ability dex">
					<span class="abilityName">DEX</span>
					<input type="number" class="form-control" v-model="player.dexterity" name="dexterity" placeholder="DEX" />
				</span>
				<span class="ability con">
					<span class="abilityName">CON</span>
					<input type="number" class="form-control" v-model="player.constitution" name="constitution" placeholder="CON" />
				</span>
				<span class="ability int">
					<span class="abilityName">INT</span>
					<input type="number" class="form-control" v-model="player.intelligence" name="intelligence" placeholder="INT" />
				</span>
				<span class="ability wis">
					<span class="abilityName">WIS</span>
					<input type="number" class="form-control" v-model="player.wisdom" name="wisdom" placeholder="WIS" />
				</span>
				<span class="ability cha">
					<span class="abilityName">CHA</span>
					<input type="number" class="form-control" v-model="player.charisma" name="charisma" placeholder="CHA" />
				</span>
			</div>
			
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
	input {
		margin-top: 15px;
	}

	.abilities {
		margin-top: 30px;
		display: grid;
		grid-template-columns: 70px 70px 70px 70px 70px 70px;
		grid-template-rows: auto;
		grid-gap: 10px;
		grid-template-areas: 
		"str dex con int wis cha";

		input {
			margin-top: 0;
			padding-right: 0;
			width: 70px;
		}

		.ability {
			width: 70px;
			height: 44px;
			text-align:center;
			font-size:20px;
			position:relative;
			cursor:pointer;
		
		}
		.ability .abilityName {
			position: absolute;
			top: -20px;
			left: 50%;
			transform: translateX(-50%);
			font-size:12px;
			text-align: center;
		}
	}
}



</style>