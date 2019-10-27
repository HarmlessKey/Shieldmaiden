<template>
	<div>
		<div class="group-actions">
			<div class="money" 
				@click="setSlide({
					show: true,
					type: 'slides/Currency',
					data: { current: currency['.value'] }
				})">
				<template v-if="currency['.value']">
					<template v-for="(coin, key) in money">
						<div v-if="coin" :key="key">
							{{ coin }}
							<img :src="require(`@/assets/_img/currency/${currencies[key].color}.svg`)" />
						</div>
					</template>
				</template>
				<span v-else class="text-italic gray-hover">No money</span>
			</div>
			<div class="actions">
				<a 
					class="" 
					v-b-tooltip.hover title="Edit Group Health"
					@click="setSlide({
						show: true,
						type: 'slides/InventoryParty'
					})"><i class="fas fa-heart"></i></a>
				<a
					v-if="campaign.advancement != 'milestone'"
					class="" 
					v-b-tooltip.hover title="Award Experience Points"
					@click="setSlide({
						show: true,
						type: 'slides/xpParty'
					})">XP</a>
				<a 
					class="" 
					v-b-tooltip.hover title="Party Inventory"
					@click="setSlide({
						show: true,
						type: 'slides/InventoryParty'
					})"><i class="fas fa-treasure-chest"></i></a>
			</div>
		</div>
		<table class="table table-hover" :class="{experience: campaign.advancement != 'milestone'}" v-if="players && campaign">
			<thead>
				<th></th>
				<th class="ac"><i class="fas fa-shield" v-b-tooltip.hover title="Armor Class"></i></th>
				<th class="name"></th>
				<th class="pp d-none d-md-table-cell" v-if="settings.passive_perception == undefined">
					<i class="fas fa-eye" v-b-tooltip.hover title="Passive Perception"></i>
				</th>
				<th class="pinv d-none d-md-table-cell" v-if="settings.passive_investigation == undefined">
					<i class="fas fa-search" v-b-tooltip.hover title="Passive Investigation"></i>
				</th>
				<th class="pins d-none d-md-table-cell" v-if="settings.passive_insight == undefined">
					<i class="fas fa-lightbulb-on" v-b-tooltip.hover title="Passive Insight"></i>
				</th>
				<th class="save d-none d-md-table-cell" v-if="settings.save_dc == undefined">
					<i class="fas fa-hand-holding-magic" v-b-tooltip.hover title="Save DC"></i>
				</th>
				<th class="hp"><i class="fas fa-heart" v-b-tooltip.hover title="Health"></i></th>
				<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
			</thead>
			<tbody
				name="table-row" 
				is="transition-group" 
				enter-active-class="animated flash" 
				leave-active-class="animated bounceOutLeft">
				<template v-for="(player, key) in campaign.players">
					<tr :key="key">
						<td :rowspan="campaign.advancement != 'milestone' ? 2 : 1" class="img" v-if="players[key].avatar" :style="{ backgroundImage: 'url(\'' + players[key].avatar + '\')' }"></td>
						<td :rowspan="campaign.advancement != 'milestone' ? 2 : 1" class="img" v-else>
							<img src="@/assets/_img/styles/player.svg" />
						</td>
						<td class="ac">
							<span :class="{ 
									'green': player.ac_bonus > 0, 
									'red': player.ac_bonus < 0 
								}" 
								v-b-tooltip.hover :title="'Armor Class + ' + player.ac_bonus" v-if="player.ac_bonus">
								{{ players[key].ac + player.ac_bonus }}
							</span>
							<span v-else class="ac">{{ players[key].ac }}</span>
						</td>
						<td class="name"  v-b-tooltip.hover :title="players[key].character_name"><span>{{ players[key].character_name }}</span></td>
						<td class="pp d-none d-md-table-cell" v-if="settings.passive_perception == undefined">
							{{ players[key].passive_perception }}
						</td>
						<td class="pinv d-none d-md-table-cell" v-if="settings.passive_investigation == undefined">
							{{ players[key].passive_investigation }}
						</td>
						<td class="pins d-none d-md-table-cell" v-if="settings.passive_insight == undefined">
							{{ players[key].passive_insight }}
						</td>
						<td class="save d-none d-md-table-cell" v-if="settings.save_dc == undefined">
							{{ players[key].spell_save_dc }}
						</td>
						<td>
							<span class="current" :class="{ 
								'red': percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) <= 33, 
								'orange': percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) > 33 && percentage(player.curHp, players[key].maxHp) <= 76, 
								'green': true
								}">{{ player.curHp }}</span>
								<span class="gray-hover">/</span>
								<span :class="{ 
										'green': player.maxHpMod > 0, 
										'red': player.maxHpMod < 0 
									}" 
									v-b-tooltip.hover :title="'Max HP + ' + player.maxHpMod" v-if="player.maxHpMod">
									{{ maxHp(players[key].maxHp, player.maxHpMod) }}
								</span>
								<span v-else>{{ players[key].maxHp }}</span>
								<span v-if="player.tempHp" class="gray-hover">+{{ player.tempHp }}</span>
						</td>

						<!-- ACTIONS -->
						<td class="align-middle p-0">
							<div class="d-flex justify-content-end">
								<div class="d-flex justify-content-end actions">
									<a class="gray-hover" v-b-tooltip.hover title="Edit player" 
										@click="setSlide({
											show: true,
											type: 'slides/EditPlayer',
											data: { key: key, location: 'overview',}
										})">
										<i class="fas fa-pencil"></i>
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
										<a class="gray-hover dropdown-item" v-b-tooltip.hover title="Edit player" 
											@click="setSlide({
												show: true,
												type: 'slides/EditPlayer',
												data: { key: key, location: 'overview',}
											})">
											<i class="fas fa-pencil"></i> Edit player
										</a>
									</div>
								</span>
							</div>
						</td>
					</tr>
					<tr :key="'xp-' + key" v-if="campaign.advancement != 'milestone'" class="xpbar">
						<td :colspan="calcColspan">
							<div>
								<div class="level">{{ players[key].level ? players[key].level : calculatedLevel(players[key].experience) }}</div>
								<div class="progress">
									<div class="progress-bar bg-blue"
										role="progressbar" 
										:style="{ width: levelAdvancement(players[key].experience) + '%' }" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
		<div v-else class="loader"><span>Loading Players...</span></div>

		<button class="btn btn-block" @click="reset()"><i class="fas fa-undo-alt"></i> Reset Player Health</button>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'
	import { experience } from '@/mixins/experience.js'
	import { currencyMixin } from '@/mixins/currency.js'

	export default {
		name: 'Players',
		mixins: [experience, currencyMixin],
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.user.uid}/general`),
					asObject: true
				},
				currency: {
					source: db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/currency`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'playerInCampaign',
			]),
			calcColspan() {
				let colspan = 8;

				if(this.settings.passive_perception === false) { colspan--; }
				if(this.settings.passive_investigation === false) { colspan--; }
				if(this.settings.passive_insight === false) { colspan--; }
				if(this.settings.save_dc === false) { colspan--; }
				
				return colspan;
			},
			money() {
				return this.copperToPretty(this.currency['.value']);
			}
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
			percentage(current, max) {
				var percentage = Math.floor(current / max * 100)
				return percentage
			},
			maxHp(maxHp, maxHpMod) {
				return maxHp + maxHpMod;
			},
			reset() {
				for(var key in this.campaign.players) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).update({
						curHp: this.players[key].maxHp,
						tempHp: 0,
						maxHpMod: 0
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.group-actions {
		border-bottom: solid 1px #b2b2b2;
		padding-bottom: 5px;
		display: grid;
		grid-template-columns: auto max-content;
		grid-template-areas: "money actions";

		.money {
			display: flex;
			justify-content: flex-start;
			cursor: pointer;
			grid-area: money;
			line-height: 15px;

			div {
				margin-right: 10px;
				font-size: 16px;

				img {
					height: 12px;
				}

				&:last-child {
					margin: none;
				}
			}
		}
		.actions {
			display: flex;
			justify-content: flex-end;
			grid-area: actions;

			a {
				margin-left: 10px;
				color: #fff !important;

				&:hover {
					color: #2c97de !important;
				}
			}
		}
	}
	table {
		// font-size: 12px;

		tr {
			th.ac, th.pp, th.pinv, th.pins, td.ac, td.pp, td.pinv, td.pins, th.save {
				text-align: center;
				width: 20px;
			}
			th.ac, td.ac {
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
		&.experience {
			tr td.img {
				width: 62px;

				img {
					width: 54px;
					height: 54px;
				}
			}
			tr.xpbar {
				td {
					background: none;
					padding: 0;

					div {
						display: flex;
						justify-content: space-between;
						height: 15px;
						width: 100%;
					
						.level {
							display: block;
							width: 25px;
							line-height: 15px;
							text-align: center;
						}
						.progress {
							margin-top: 6px;
							width: 100%;
							height: 3px;
							background-color: #232323 !important;
						}
					}
				}
			}
		}
	}
</style>