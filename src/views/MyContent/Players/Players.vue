<template>
	<div class="content" v-if="tier">
		<h1>Your players</h1>
		<p>These are the players that you can use in your campaigns.</p>

		<OverEncumbered v-if="overencumbered"/>
		<OutOfSlots 
			v-else-if="content_count.players >= tier.benefits.players"
			type = 'players'
		/>
		<template v-if="players">
			<h2 class="mt-3 d-flex justify-content-between">
				<span>
					Players ( 
					<span :class="{ 'green': true, 'red': content_count.players >= tier.benefits.players }">{{ Object.keys(players).length }}</span> 
						/ 
						<i v-if="tier.benefits.players == 'infinite'" class="far fa-infinity"></i> 
						<template v-else>{{ tier.benefits.players }}</template>	
						)
				</span>
				<router-link v-if="!overencumbered" to="/players/add-player">
					<i class="fas fa-plus green"></i> New Player
				</router-link>
			</h2>


			<hk-table
				:columns="columns"
				:items="_players"
				:search="['character_name']"
			>
				<template slot="avatar" slot-scope="data">
					<div class="image" v-if="data.item" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }"></div>
					<img v-else class="image" src="@/assets/_img/styles/player.svg" />
				</template>

				<template slot="character_name" slot-scope="data">
					<router-link class="mx-2" 
						:to="'/players/' + data.row.key" 
						v-b-tooltip.hover title="Edit">{{ data.item }}
					</router-link>
				</template>

				<template slot="level" slot-scope="data">
					{{ data.item ? data.item : calculatedLevel(data.row.experience) }}
				</template>

				<div slot="actions" slot-scope="data" class="actions">
					<router-link class="gray-hover mx-1" 
						:to="'/players/' + data.row.key" 
						v-b-tooltip.hover title="Edit">
						<i class="fas fa-pencil"></i>
					</router-link>
					<a v-b-tooltip.hover 
						title="Delete" 
						class="gray-hover"
						@click="confirmDelete(data.row.key, data.row.player, data.row.control)">
							<i class="fas fa-trash-alt"></i>
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
			<template v-if="slotsLeft <= 0">
				<div class="openSlot none">
					<span class="red">No player slots left. </span>
					Delete players to create new space, <router-link to="/patreon">or support us for more slots</router-link>.
				</div>
			</template>
		</template>
		<h3 v-else-if="players === null" class="mt-4">
			<router-link v-if="!overencumbered" to="/players/add-player">
				<i class="fas fa-plus green"></i> Create your first player
			</router-link>
		</h3>
	</div>
</template>

<script>
	import _ from 'lodash';
	import OverEncumbered from '@/components/OverEncumbered.vue';
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
			OverEncumbered,
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
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
					level: {
						label: 'Level',
						// center: true,
						sortable: true,
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
				return _.chain(this.players)
				.filter(function(player, key) {
					player.key = key
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

<style lang="scss" scoped>
	.container-fluid {
		h2 {
			border-bottom: solid 1px #b2b2b2;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: #b2b2b2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
		.openSlot {
			display: flex;
			justify-content: space-between;
			padding: 0 10px;
			width: 100%;
			height: 46px;
			line-height: 46px;
			border: dashed 1px #5c5757;
			margin-top: 1px;

			&.none {
				display: block;
				text-align: center;
			}
		}
	}

</style>