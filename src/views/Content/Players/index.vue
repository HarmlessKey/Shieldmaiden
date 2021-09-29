<template>
	<hk-card v-if="tier">
		<div slot="header" class="card-header">
			<span>
				Players ( 
				<span :class="{ 'green': true, 'red': content_count.players >= tier.benefits.players }">{{ Object.keys(players).length }}</span> 
					/ 
					<i v-if="tier.benefits.players == 'infinite'" class="far fa-infinity"></i> 
					<template v-else>{{ tier.benefits.players }}</template>	
					)
			</span>
			<router-link class="btn btn-sm" v-if="!overencumbered" :to="`${$route.path}/add-player`">
				<i class="fas fa-plus green"></i> New Player
			</router-link>
		</div>

		<div class="card-body">
			<p class="neutral-2">These are the players you can use in your campaigns.</p>
			<template v-if="players">
				<OutOfSlots
					v-if="content_count.players >= tier.benefits.players"
					type = 'players'
				/>
				<hk-table
					:columns="columns"
					:items="_players"
					:search="['character_name', 'campaign_name']"
				>
					<template slot="avatar" slot-scope="data">
						<div class="image" v-if="data.item" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }"></div>
						<img v-else class="image" src="@/assets/_img/styles/player.svg" />
					</template>

					<template slot="character_name" slot-scope="data">
						<router-link class="mx-2"  :to="`${$route.path}/${data.row.key}`">
							{{ data.item }}
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
					</template>

					<template slot="campaign_name" slot-scope="data">
						{{ data.item }}
					</template>

					<template slot="level" slot-scope="data">
						{{ data.item ? data.item : calculatedLevel(data.row.experience) }}
					</template>

					<div slot="actions" slot-scope="data" class="actions">
						<router-link class="btn btn-sm bg-neutral-5 mx-1" :to="`${$route.path}/${data.row.key}`">
							<i class="fas fa-pencil"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
						<a class="btn btn-sm bg-neutral-5" @click="confirmDelete($event, data.row.key, data.row)">
								<i class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
						</a>
					</div>
				</hk-table>

				<template v-if="slotsLeft > 0 && tier.benefits.players !== 'infinite'">
					<div 
						class="openSlot"
						v-for="index in slotsLeft"
						:key="'open-slot-' + index"
					>
						<span>Open player slot</span>
						<router-link v-if="!overencumbered" to="/players/add-player">
							<i class="fas fa-plus green"></i>
						</router-link>
					</div>
				</template>
				<template v-if="!tier || tier.name === 'Free'">
					<router-link class="openSlot none" to="/patreon">
						Support us on Patreon for more slots.
					</router-link>
				</template>
			</template>
			<router-link v-else-if="players === null && !overencumbered" class="btn btn-block mt-4" to="/players/add-player">
				Create your first player
			</router-link>
		</div>
	</hk-card>
</template>

<script>
	import _ from 'lodash';
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import { mapGetters } from 'vuex';
	import { db } from '@/firebase';
	import { experience } from '@/mixins/experience.js';

	export default {
		name: 'Players',
		mixins: [experience],
		metaInfo: {
			title: 'Players'
		},
		components: {
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					character_name: {
						label: 'Character Name',
						truncate: true,
						sortable: true,
					},
					campaign_name: {
						label: 'Campaign',
						sortable: true,
					},
					level: {
						label: 'Level',
						// center: true,
						// sortable: true,
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
				let vm = this;
				return _.chain(this.players)
				.filter(function(player, key) {
					player.key = key
					if (player.campaign_id) {
						if (vm.campaigns[player.campaign_id] !== undefined)
							player.campaign_name = vm.campaigns[player.campaign_id].campaign
						else
							player.campaign_id = undefined;
					}

					return player
				})
				.orderBy("character_name", 'asc')
				.value()
			},
			slotsLeft() {
				return this.tier.benefits.players - Object.keys(this.players).length
			}
		},
		methods: {
			confirmDelete(e, key, player) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deletePlayer(key, player);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + player.player_name + '?', 'Delete player', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deletePlayer(key, player)
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
			},
			deletePlayer(key, player) {
				//Remove from character control
				if(player.control) {
					db.ref(`character_control/${player.control}`).child(key).remove(); 
				}

				for(let campaign in this.campaigns) {
					//Remove player from campaigns
					db.ref('campaigns/' + this.userId + '/' + campaign + '/players').child(key).remove();

					//Go over all encounters of the campaign
					if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaign) > -1) {
						for(let enc in this.allEncounters[campaign]) {

							//Go over all entities in the encounter
							db.ref(`encounters/${this.userId}/${campaign}/${enc}/entities`).child(key).remove();

							// Remove companions from each encounter
							for (let comp_key in player.companions) {
								db.ref(`encounters/${this.userId}/${campaign}/${enc}/entities`).child(comp_key).remove();
							}
						}
					}
				}
				//Remove player
				db.ref('players/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		h2 {
			border-bottom: solid 1px $gray-light;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: $gray-light !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
	}

</style>