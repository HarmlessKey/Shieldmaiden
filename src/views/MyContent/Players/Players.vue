<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="players" class="container-fluid">
			<h1>Your players</h1>
			<p>These are the players that you can use in your campaigns.</p>

			<router-link to="/players/add-player" 
				class="btn btn-block mb-3"
				v-b-modal.addModal>
				<i class="fas fa-plus-square"></i> Add player
			</router-link>

			<template v-if="players">
				<h2 class="mt-3">Players ( {{ Object.keys(players).length }} )</h2>
				<table class="table">
					<thead>
						<th></th>
						<th class="n">#</th>
						<th>Character name</th>
						<th class="d-none d-md-table-cell">Player name</th>
						<th>Level</th>
						<th></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(player, index) in _players" :key="player.key">
							<td class="img" v-if="player.avatar != ''" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></td>
							<td class="img" v-else>
								<img src="@/assets/_img/styles/player.svg" />
							</td>
							<td class="n">{{ index + 1 }}</td>
							<td>
								<router-link class="mx-2 gray-light" 
									:to="'/players/' + player.key" 
									v-b-tooltip.hover title="Edit">{{ player.character_name }}
								</router-link>
							</td>
							<td class="d-none d-md-table-cell">{{ player.player_name }}</td>
							<td>{{ player.level }}</td>
							<td class="text-right actions">
								<router-link class="gray-hover mx-2" 
									:to="'/players/' + player.key" 
									v-b-tooltip.hover title="Edit">
									<i class="fas fa-hammer-war blue"></i>
									<span class="d-none d-md-inline ml-1">Edit</span>
								</router-link>
								<a v-b-tooltip.hover 
									title="Delete" 
									class="gray-hover"
									@click="confirmDelete(player.key, player.player)">
										<i class="fas fa-trash-alt red"></i>
										<span class="d-none d-md-inline ml-1">Delete</span>
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<h2 v-else-if="players === null" class="mt-4 px-2 d-flex justify-content-between">
				<i class="fas fa-arrow-up gray-hover"></i> 
				Add your first player 
				<i class="fas fa-arrow-up gray-hover"></i>
			</h2>
			<div v-else="loading" class="loader"><span>Loading Players...</span></div>
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
		metaInfo: {
			title: 'Players'
		},
		components: {
			Sidebar
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		computed: {
			...mapGetters([
				'players',
				'campaigns',
				'allEncounters',
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
			confirmDelete(key, player) {
				this.$snotify.error('Are you sure you want to delete ' + player + '?', 'Delete player', {
					timeout: false,
					buttons: [
						{
							text: 'Yes', action: (toast) => { 
							this.deletePlayer(key)
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
			},
			deletePlayer(key) {
				for(let campaign in this.campaigns) {
					//Remove player from campaigns
					db.ref('campaigns/' + this.userId + '/' + campaign + '/players').child(key).remove();

					//Go over all encounters of the campaign
					if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaign) > -1) {
						for(let enc in this.allEncounters[campaign]) {

							//Go over all entities in the encounter
							db.ref(`encounters/${this.userId}/${campaign}/${enc}/entities`).child(key).remove();
						}
					}
				}
				//Remove player
				db.ref('players/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="css" scoped>
	.container-fluid {
		padding: 20px;
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