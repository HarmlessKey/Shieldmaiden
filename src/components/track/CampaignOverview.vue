<template>
<div class="container">
	<b-row>
		<b-col md="8">
			<h3>Campaign Players</h3>
			<table class="table table-hover">
				<thead >
					<th></th>
					<th class="ac"><i class="fas fa-shield" v-b-tooltip.hover title="Armor Class"></i></th>
					<th class="name"></th>
					<th class="pp d-none d-md-table-cell"><i class="fas fa-eye" v-b-tooltip.hover title="Passive Perception"></i></th>
					<th class="pinv d-none d-md-table-cell"><i class="fas fa-search" v-b-tooltip.hover title="Passive Investigation"></i></th>
					<th class="pins d-none d-md-table-cell"><i class="fas fa-lightbulb-on" v-b-tooltip.hover title="Passive Insight"></i></th>
					<th class="hp"><i class="fas fa-heart" v-b-tooltip.hover title="Health"></i></th>
				</thead>
				<tbody name="table-row">
					<tr v-for="(player, key) in players" :key="key">
						<td class="img" v-if="campaignPlayers[key].avatar" :style="{ backgroundImage: 'url(\'' + campaignPlayers[key].avatar + '\')' }"></td>
						<td class="img" v-else>
							<img src="@/assets/_img/styles/player.svg" />
						</td>
						<td class="ac">
							<span :class="{ 
									'green': player.ac_bonus > 0, 
									'red': player.ac_bonus < 0 
								}" 
								v-b-tooltip.hover :title="'Armor Class + ' + player.ac_bonus" v-if="player.ac_bonus">
								{{ campaignPlayers[key].ac + player.ac_bonus}}
							</span>
							<span v-else class="ac">{{ campaignPlayers[key].ac }}</span>
						</td>
						<td class="name"  v-b-tooltip.hover :title="campaignPlayers[key].character_name"><span>{{ campaignPlayers[key].character_name }}</span></td>
						<td class="pp d-none d-md-table-cell">{{ campaignPlayers[key].passive_perception }}</td>
						<td class="pinv d-none d-md-table-cell">{{ campaignPlayers[key].passive_investigation }}</td>
						<td class="pins d-none d-md-table-cell">{{ campaignPlayers[key].passive_insight }}</td>
						<td>
							<span class="current" :class="{ 
								'red': percentage(player.curHp, campaignPlayers[key].maxHp) <= 33, 
								'orange': percentage(player.curHp, campaignPlayers[key].maxHp) > 33 && percentage(player.curHp, campaignPlayers[key].maxHp) <= 76, 
								'green': true
								}">{{ player.curHp }}</span>
								<span class="gray-hover">/</span>{{ campaignPlayers[key].maxHp }}
								<span v-if="player.tempHp" class="gray-hover">+{{ player.tempHp }}</span>
						</td>
					</tr>
				</tbody>
			</table>
		</b-col>
		<b-col md="4">
			<h3 class="d-flex justify-content-between">
				Campaign wide meters
				<!-- <span>
					<a>+</a>
					<a>-</a>
				</span> -->
			</h3>
			<Meters :entities="players" :campaign="true" />
		</b-col>
	</b-row>
</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'
	import Meters from '@/components/track/Meters.vue'

	export default {
		name: 'Players',
		props: ['players'],
		components: {
			Meters,
		},
		data() {
			return {
				userId: this.$route.params.userid,
			}
		},
		firebase() {
			return {
				campaignPlayers: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
			}
		},
		methods: {
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		color: #fff;
	}
	table {
		thead th {
			color: #fff;
			background: none;
			text-shadow: 0 0 3px  #000;
		}

		tr {
			td {
				background-color: rgba(38, 38, 38, .9);
			}
			th.ac, th.pp, th.pinv, th.pins, td.ac, td.pp, td.pinv, td.pins {
				text-align: center;
				width: 20px;
			}
			th.ac, td.ac, th.pins, td.pins {
				padding-right: 20px;
			}
			td.img {
				background-color: #000 !important;
			}
			td.name {
				// overflow: hidden;
				// white-space: nowrap;
				// text-overflow: ellipsis;
				// max-width:0;
			}
		}
	}
</style>