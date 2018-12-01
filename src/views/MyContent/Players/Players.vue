<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="players" class="container">
			<h1>Your players</h1>
			<p>These are the players that you can use in your campaigns.</p>

			<router-link to="/players/add-player" 
				class="btn btn-block mb-3"
				v-b-modal.addModal>
				<i class="fas fa-plus-square"></i> Add player
			</router-link>

			
			<!-- <div class="row">
				<div class="col bg-gray" v-for="(player, index) in players" :key="index">
					<span class="img" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></span>
					<div class="info">
						<h3>{{ player.character_name }}</h3>
						<p>AC: {{ player.ac }} | HP: {{ player.maxhp }}</p>
						<router-link :to="'/players/'+player['.key']">Edit</router-link>
					</div>
					<a class="red" 
						v-b-tooltip.hover
						title="Delete"
						@click="deletePlayer(player['.key'], player.character_name)">
						<i class="fas fa-trash-alt"></i>
					</a>
				</div>
			</div> -->
			<template v-if="players">
				<h2 class="mt-3">Campaigns ( {{ Object.keys(players).length }} )</h2>
				<table class="table">
					<thead>
						<th></th>
						<th>#</th>
						<th>Player name</th>
						<th>Character name</th>
						<th></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(player, index) in _players" :key="player.key">
							<td class="img" v-if="player.avatar != '\'\''" :style="{ backgroundImage: 'url(' + player.avatar + ')' }"></td>
							<td class="img" v-else>
								<img src="@/assets/_img/styles/player.svg" />
							</td>
							<td>{{ index + 1 }}</td>
							<td>{{ player.player_name }}</td>
							<td>{{ player.character_name }}</td>
							<td class="text-right actions">
								<router-link class="mx-2" 
									:to="'/players/' + player.key" 
									v-b-tooltip.hover title="Edit"><i class="fas fa-edit"></i>
								</router-link>
								<a v-b-tooltip.hover 
									title="Delete" 
									class="red"
									@click="confirmDelete(player.key, player.player)">
										<i class="fas fa-trash-alt"></i>
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<div v-else="loading == true" class="loader"><span>Loading Players...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		components: {
			Sidebar
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				player_name: '',
				character_name: '',
				ac: '',
				maxhp: '',
				avatar: '',
				beyond: '',
				loading: true,
			}
		},
		computed: {
			...mapGetters([
				'players',
			]),
			_players: function() {
				// console.log('yo')
				return _.chain(this.players)
				.filter(function(player, key) {
					player.key = key
					return player
				})
				.orderBy("character_name", 'asc')
				.value()
			},
		},
		methods: {
			deletePlayer(key, player) {
				this.$snotify.error('Are you sure you want to delete ' + player + '?', 'Delete player', {
					timeout: false,
					buttons: [
						{
							text: 'Yes', action: (toast) => { 
							db.ref('players/' + this.userId).child(key).remove(); 
							this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{
							text: 'No', action: (toast) => { 
								this.$snotify.remove(toast.id); 
							}, 
							bold: true
						},
					]
				});
			}
		}
	}
</script>

<style lang="css" scoped>
.container {
	padding-top:20px;
}
.col {
	margin:10px;
	padding:10px;
	margin-bottom:10px;
	display: grid;
	grid-template-rows: auto;
	grid-template-columns:70px 1fr 10px;
	grid-gap: 10px;
	grid-template-areas: 
	"img info delete";
}
.info h3, .info p {
	margin-bottom:5px !important;
}
/* .img {
	width:70px;
	height:70px;
	display:block;
	background-size:cover;
	background-position:top center;
	grid-area: img;
	border:solid 1px #b2b2b2;
} */
.info {
	grid-area: info;
}
</style>