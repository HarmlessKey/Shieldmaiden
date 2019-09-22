<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="players" class="container-fluid" v-if="tier">
			<h1>Your players</h1>
			<p>These are the players that you can use in your campaigns.</p>

			<OverEncumbered v-if="overencumbered"/>
			<OutOfSlots 
				v-else-if="content_count.players >= tier.benefits.players"
				type = 'players'
			/>
			<router-link v-else to="/players/add-player" 
				class="btn btn-block mb-3"
				v-b-modal.addModal>
				<i class="fas fa-plus-square"></i> Add player
			</router-link>

			<template v-if="players">
				<h2 class="mt-3">Players ( 
					<span :class="{ 'green': true, 'red': content_count.players >= tier.benefits.players }">{{ Object.keys(players).length }}</span> 
						/ 
						<i v-if="tier.benefits.players == 'infinite'" class="far fa-infinity"></i> 
						<template v-else>{{ tier.benefits.players }}</template>	
						)</h2>
				<table class="table mb-5">
					<thead>
						<th></th>
						<th class="n">#</th>
						<th>Character name</th>
						<th class="d-none d-md-table-cell">Player name</th>
						<th>Level</th>
						<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(player, index) in _players" :key="player.key">
							<td class="img" v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></td>
							<td class="img" v-else>
								<img src="@/assets/_img/styles/player.svg" />
							</td>
							<td class="n">{{ index + 1 }}</td>
							<td>
								<router-link class="mx-2" 
									:to="'/players/' + player.key" 
									v-b-tooltip.hover title="Edit">{{ player.character_name }}
								</router-link>
							</td>
							<td class="d-none d-md-table-cell">{{ player.player_name }}</td>
							<td>{{ player.level }}</td>
							<!-- Actions -->
							<td class="align-middle p-0">
								<div class="d-flex justify-content-end">
									<div class="d-flex justify-content-end actions">
										<router-link class="gray-hover mx-1" 
											:to="'/players/' + player.key" 
											v-b-tooltip.hover title="Edit">
											<i class="fas fa-pencil"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="gray-hover"
											@click="confirmDelete(player.key, player.player, player.control)">
												<i class="fas fa-trash-alt"></i>
										</a>
									</div>
									<span class="dropleft d-sm-none actions-dropdown">
										<a class="options"
											id="options"
											data-toggle="dropdown" 
											aria-haspopup="true" 
											aria-expanded="false">
											<i class="far fa-ellipsis-v"></i>
										</a>
										<div class="dropdown-menu" aria-labelledby="options">	
											<router-link class="gray-hover mx-1 dropdown-item" 
												:to="'/players/' + player.key" 
												v-b-tooltip.hover title="Edit">
													<i class="fas fa-pencil"></i> Edit player
											</router-link>
											<a v-b-tooltip.hover 
												title="Delete" 
												class="gray-hover dropdown-item"
												@click="confirmDelete(player.key, player.player, player.control)">
													<i class="fas fa-trash-alt"></i> Delete player
											</a>
										</div>
									</span>
								</div>
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
			<div v-else class="loader"><span>Loading Players...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Players'
		},
		components: {
			Sidebar,
			OverEncumbered,
			OutOfSlots,
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'campaigns',
				'allEncounters',
				'overencumbered',
				'content_count',
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
			confirmDelete(key, player, control) {
				this.$snotify.error('Are you sure you want to delete ' + player + '?', 'Delete player', {
					timeout: false,
					buttons: [
						{
							text: 'Yes', action: (toast) => { 
							this.deletePlayer(key, control)
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
			deletePlayer(key, control) {
				//Remove from character control
				if(control) {
					db.ref(`character_control/${control}`).child(key).remove(); 
				}

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
	.info {
		grid-area: info;
	}
</style>