<template>
	<div>
		<table class="table table-hover" v-if="players && campaign">
			<thead>
				<th></th>
				<th class="ac"><i class="fas fa-shield" v-b-tooltip.hover title="Armor Class"></i></th>
				<th class="name"></th>
				<th class="pp"><i class="fas fa-eye" v-b-tooltip.hover title="Passive Perception"></i></th>
				<th class="pinv"><i class="fas fa-search" v-b-tooltip.hover title="Passive Investigation"></i></th>
				<th class="pins"><i class="fas fa-lightbulb-on" v-b-tooltip.hover title="Passive Insight"></i></th>
				<th class="hp"><i class="fas fa-heart" v-b-tooltip.hover title="Health"></i></th>
				<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
			</thead>
			<tbody
				name="table-row" 
				is="transition-group" 
				enter-active-class="animated flash" 
				leave-active-class="animated bounceOutLeft">
				<tr v-for="(player, key) in campaign.players" :key="key">
					<td class="img" v-if="players[key].avatar" :style="{ backgroundImage: 'url(\'' + players[key].avatar + '\')' }"></td>
					<td class="img" v-else>
						<img src="@/assets/_img/styles/player.svg" />
					</td>
					<td class="ac">
						<span :class="{ 
								'green': player.ac_bonus > 0, 
								'red': player.ac_bonus < 0 
							}" 
							v-b-tooltip.hover :title="'Armor Class + ' + player.ac_bonus" v-if="player.ac_bonus">
							{{ players[key].ac + player.ac_bonus}}
						</span>
						<span v-else class="ac">{{ players[key].ac }}</span>
					</td>
					<td class="name">{{ players[key].character_name }}</td>
					<td class="pp">{{ players[key].passive_perception }}</td>
					<td class="pinv">{{ players[key].passive_investigation }}</td>
					<td class="pins">{{ players[key].passive_insight }}</td>
					<td>
						<span class="current" :class="{ 
							'red': percentage(player.curHp, players[key].maxHp) <= 33, 
							'orange': percentage(player.curHp, players[key].maxHp) > 33 && percentage(player.curHp, players[key].maxHp) <= 76, 
							'green': true
							}">{{ player.curHp }}</span>
							<span class="gray-hover">/</span>{{ players[key].maxHp }}
							<span v-if="player.tempHp" class="gray-hover">+{{ player.tempHp }}</span>
					</td>

					<!-- ACTIONS -->
					<td>
							<div class="d-flex justify-content-end">
								<div class="d-flex justify-content-end actions">
									<a class="gray-hover" v-b-tooltip.hover title="Edit player" @click="edit(key)">
										<i class="fas fa-pencil"></i>
									</a>
								</div>
								<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
							</div>
						</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="loader"><span>Loading Players...</span></div>

		<button class="btn btn-block" @click="reset()"><i class="fas fa-undo-alt"></i> Reset Player Stats</button>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'playerInCampaign',
			]),
		},
		mounted() {
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'setSlide',
			]),
			edit(key) {
				this.setSlide({
					show: true,
					type: 'editPlayer',
					key: key,
					location: 'overview',
				})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			reset() {
				for(var key in this.campaign.players) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).set({
						curHp: this.players[key].maxHp
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	table {
		// font-size: 12px;

		tr {
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
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				max-width:0;
			}
		}
	}
</style>