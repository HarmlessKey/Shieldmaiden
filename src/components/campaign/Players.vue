<template>
	<tag :is="cardView ? 'hk-card' : 'div'" :class="!cardView ? 'normal-view' : ''">
		<div slot="header" :class="cardView ? 'card-header' : 'top-menu'">
			<div 
				class="money" 
				:class="{ red: currency >= maxCurrencyAmount }"
				@click="
					viewerIsUser
					? setSlide({
						show: true,
						type: 'slides/party/Currency',
						data: { current: currency }
					}) : null
				">
				<template v-if="currency && Object.keys(currency).length">
					<template v-for="(coin, key) in money">
						<div v-if="coin" :key="key">
							<template v-if="key === 'pp' && coin >= 1000">{{ coin | numeral('0.0a') }} </template>
							<template v-else>{{ coin }} </template>
							<img :src="require(`src/assets/_img/currency/${currencies[key].color}.svg`)" :alt="currencies[key].name" />
						</div>
					</template>
				</template>
				<span v-else class="text-italic white">No money</span>
			</div>
			<div class="d-flex justify-content-end">
				<template v-if="viewerIsUser && page !== 'user'">
					<a 
						class="btn btn-sm mr-1"
						@click="setSlide({
							show: true,
							type: 'slides/party/health'
						})">
						<i aria-hidden="true" class="fas fa-heart"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Edit Group Health
						</q-tooltip>
					</a>
					<a 
						class="btn btn-sm mr-1"
						v-if="isXpAdvancement"
						@click="setSlide({
							show: true,
							type: 'slides/party/xp'
						})">
							XP
							<q-tooltip anchor="top middle" self="center middle">
								Award Experience Points
							</q-tooltip>
						</a>
					<a 
						class="btn btn-sm"
						@click="setSlide({
							show: true,
							type: 'slides/party/Inventory'
						})">
						<i aria-hidden="true" class="fas fa-treasure-chest"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Party Inventory
						</q-tooltip>
					</a>
				</template>
				<a 
					class="btn btn-sm bg-neutral-5"
					v-else-if="campaign.inventory && campaign.inventory.items"
					@click="setSlide({
						show: true,
						type: 'slides/party/ViewInventory'
					})">
						<i aria-hidden="true" class="fas fa-treasure-chest mr-1"></i>
						{{ Object.keys(campaign.inventory.items).length }}
						<q-tooltip anchor="top middle" self="center middle">
							Party Inventory
						</q-tooltip>
				</a>
			</div>
		</div>
		<div 
			v-if="!loading"
			class="players" 
			:class="{ xp: isXpAdvancement, large: is_large, 'card-body': cardView }"
			:style="{ 'grid-template-columns': templateColumns }"
		>
			<div class="header"></div>
			<div class="col header ac">
			</div>
			<div class="col header name"></div>
			<div class="col header text-center pp" v-if="userSettings.general && userSettings.general.passive_perception === undefined && !is_small">
				<i aria-hidden="true" class="fas fa-eye"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive perception
				</q-tooltip>
			</div>
			<div class="col header text-center pinv" v-if="userSettings.general && userSettings.general.passive_investigation === undefined && !is_small">
				<i aria-hidden="true" class="fas fa-search"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive investigation
				</q-tooltip>
			</div>
			<div class="col header text-center pins" v-if="userSettings.general && userSettings.general.passive_insight === undefined && !is_medium">
				<i aria-hidden="true" class="fas fa-lightbulb-on"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive insight
				</q-tooltip>
			</div>
			<div class="col header text-center save" v-if="userSettings.general && userSettings.general.save_dc === undefined && !is_medium">
				<i aria-hidden="true" class="fas fa-hand-holding-magic"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Save DC
				</q-tooltip>
			</div>
			<div class="col header text-center">
				<i aria-hidden="true" class="fas fa-heart"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Health
				</q-tooltip>
			</div>
			<div class="col header text-right" v-if="viewerIsUser"><i aria-hidden="true" class="far fa-ellipsis-h"></i></div>

			<template v-for="(player, key) in campaign.players">
				<template v-if="players[key] && player.curHp !== undefined"><!-- make sure incomplete players aren't displayed -->
					<div 
						class="image" 
						:key="'image-'+key" 
						:style="{ backgroundImage: 'url(\'' + players[key].avatar + '\')' }"
					>
						<div class="transformed" v-if="player.transformed">
							<i aria-hidden="true" class="fas fa-paw-claws green"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Transformed
							</q-tooltip>
						</div>
						<i aria-hidden="true" v-if="!players[key].avatar" class="hki-player" />
					</div>
					<div class="col ac" :key="'ac-'+key">
						<i aria-hidden="true" class="fas fa-shield" ></i>
						<span 
							v-if="player.ac_bonus"
							class="value" 
							:class="{ 
								'green': player.ac_bonus > 0, 
								'red': player.ac_bonus < 0 
							}">
								{{ (player.transformed ? player.transformed.ac : players[key].ac) + player.ac_bonus }}
								<q-tooltip anchor="top middle" self="center middle">
									Armor Class {{ player.ac_bonus }}
								</q-tooltip>
						</span>
						<span v-else class="value">{{ player.transformed ? player.transformed.ac : players[key].ac }}</span>
					</div>
					<div class="col name" :key="'name-'+key">
						{{ players[key].character_name }}
					</div>

					<div 
						class="col pp" 
						v-if="userSettings.general && userSettings.general.passive_perception === undefined && !is_small"
						:key="'pp-'+key"
					>
						{{ players[key].passive_perception }}
					</div>
					<div 
						class="col pinv" 
						v-if="userSettings.general && userSettings.general.passive_investigation === undefined && !is_small"
						:key="'pinv-'+key"
					>
						{{ players[key].passive_investigation }}
					</div>
					<div 
						class="col pins" 
						v-if="userSettings.general && userSettings.general.passive_insight === undefined && !is_medium"
						:key="'pins-'+key"
					>
						{{ players[key].passive_insight }}
					</div>
					<div 
						class="col save" 
						v-if="userSettings.general && userSettings.general.save_dc === undefined && !is_medium"
						:key="'save-'+key"
					>
						{{ players[key].spell_save_dc }}
					</div>

					<div class="col health" :key="'health-'+key">
						<template v-if="player.curHp <= 0">
							<div v-if="player.stable" class="green">
								<span><i aria-hidden="true" class="fas fa-fist-raised"></i> Stable</span>
							</div>
							<div v-else-if="player.dead" class="red">
								<span><i aria-hidden="true" class="fas fa-skull-crossbones"></i> Dead</span>
							</div>
							<div v-else class="saves d-flex justify-content-end">
								<div v-for="(check, index) in player.saves" :key="`save-${index}`" class="save">
									<span v-show="check === 'succes'" class="green"><i aria-hidden="true" class="fas fa-check"></i></span> 
									<span v-show="check === 'fail'" class="red"><i aria-hidden="true" class="fas fa-times"></i></span>
								</div>
							</div>
						</template>
						<template v-else>
							<span class="hit-points">
								<template v-if="player.transformed">
									<span class="current" :class="{ 
										'red': percentage(player.transformed.curHp, player.transformed.maxHp) <= 33, 
										'orange': percentage(player.transformed.curHp, player.transformed.maxHp) > 33 && percentage(player.transformed.curHp, player.transformed.maxHp) <= 76, 
										'green': percentage(player.transformed.curHp, player.transformed.maxHp) > 76
									}">{{ player.transformed.curHp }}</span>
									<span class="neutral-2 mx-1">/</span>
									<span>
										{{ player.transformed.maxHp }}
									</span>
								</template>
								<template v-else>
									<span class="current" :class="{ 
										'red': percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) <= 33, 
										'orange': percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) > 33 && percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) <= 76, 
										'green': percentage(player.curHp, maxHp(players[key].maxHp, player.maxHpMod)) > 76
									}">{{ player.curHp }}</span>
									<span class="neutral-2 mx-1">/</span>
									<span :class="{ 
											'green': player.maxHpMod > 0, 
											'red': player.maxHpMod < 0 
										}" 
										v-if="player.maxHpMod">
										{{ maxHp(players[key].maxHp, player.maxHpMod) }}
										<q-tooltip anchor="top middle" self="center middle">
											Max HP + {{ player.maxHpMod }}
										</q-tooltip>
									</span>
									<span v-else class="neutral-2">{{ players[key].maxHp }}</span>
								</template>
							</span>
							<span v-if="player.tempHp > 0" class="hit-points ml-1"> 
								+{{ player.tempHp }}
								<q-tooltip anchor="top middle" self="center middle">
									Temporary HP
								</q-tooltip>
							</span>
						</template>
					</div>
					<div class="col actions" :key="'actions-'+key" v-if="viewerIsUser">
						<a 	
							class="btn btn-sm bg-neutral-5" 
							@click="setSlide({
								show: true,
								type: 'slides/EditPlayer',
								data: { key, location: 'overview',}
							})">
							<i aria-hidden="true" class="fas fa-pencil"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Edit player
							</q-tooltip>
						</a>
					</div>
					<div class="xp-bar" :key="'xp-'+key" :style="{ 'grid-column': 'span ' + calcColspan }"  v-if="isXpAdvancement">
						<div class="level" :class="{red: isXpAdvancement && players[key].level}">
							{{ players[key].level ? players[key].level : calculatedLevel(players[key].experience) }}
							<q-tooltip anchor="top middle" self="center middle" v-if="players[key].level">
								Level is overwritten
							</q-tooltip>
						</div>
						<q-linear-progress size="3px" :value="levelAdvancement(players[key].experience)" color="primary" class="bg-neutral-3" />
					</div>
				</template>
			</template>
		</div>
		<hk-loader v-else name="players" />
		<div slot="footer" v-if="viewerIsUser && page !== 'user'">
			<button class="btn btn-block btn-square" @click="reset()">
				<i aria-hidden="true" class="fas fa-undo-alt"></i> Reset player health
			</button>
		</div>
		<q-resize-observer @resize="onResize" />
	</tag>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { experience } from "src/mixins/experience.js";
	import { currencyMixin } from "src/mixins/currency.js";

	export default {
		name: "Players",
		props: {
			userId: {
				type: String
			}, 
			campaignId: {
				type: String
			}, 
			campaign: {
				type: Object,
				required: true
			},
			players: {
				type: Object
			},
			cardView: {
				type: Boolean,
				default: false
			}
		},
		mixins: [experience, currencyMixin],
		data() {
			return {
				width: 0,
				is_small: false,
				is_medium: false,
				is_large: false,
				viewerId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				loading: false,
				isXpAdvancement: false
			}
		},
		computed: {
			...mapGetters(["userSettings"]),
			viewerIsUser() {
				//If the viewer is the user that runs the campaign
				//Edit functions are enabled
				return this.userId === this.viewerId;
			},
			page() {
				return this.$route.path.split("/")[1];
			},
			templateColumns() {
				let templateColumns = 'max-content max-content auto ';

				if(this.userSettings.general && this.userSettings.general.passive_perception === undefined && !this.is_small) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.userSettings.general && this.userSettings.general.passive_investigation === undefined && !this.is_small) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.userSettings.general && this.userSettings.general.passive_insight === undefined && !this.is_medium) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.userSettings.general && this.userSettings.general.save_dc === undefined && !this.is_medium) {
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.viewerIsUser) {
					templateColumns = templateColumns.concat(' max-content');
				}
				templateColumns = templateColumns.concat(' max-content');

				return templateColumns;
			},
			calcColspan() {
				let colspan = (this.viewerIsUser) ? 4 : 3;

				if(this.settings.passive_perception === undefined && !this.is_small) { colspan++; }
				if(this.settings.passive_investigation === undefined && !this.is_small) { colspan++; }
				if(this.settings.passive_insight === undefined && !this.is_medium) { colspan++; }
				if(this.settings.save_dc === undefined && !this.is_medium) { colspan++; }

				return colspan;
			},
			currency() {
				return (this.campaign.inventory && this.campaign.inventory.currency) ? this.campaign.inventory.currency : 0;
			},
			money() {
				const currency = (this.campaign.inventory && this.campaign.inventory.currency) ? this.campaign.inventory.currency : 0;
				return this.copperToPretty(currency);
			}
		},
		
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("campaigns", ["update_campaign_entity"]),
			onResize (size) {
				let width = size.width;
				let small = 400;
				let medium = 500;
				let large = 885;

				this.is_large = (width >= large) ? true : false;
				this.is_medium = (width <= medium) ? true : false;
				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = size.width;
			},
			percentage(current, max) {
				return Math.floor(current / max * 100);
			},
			maxHp(maxHp, maxHpMod) {
				return parseInt((maxHpMod) ? maxHp + maxHpMod : maxHp);
			},
			reset() {
				for(const [id, player] of Object.entries(this.players)) {
					if(!player.dead) {
						this.update_campaign_entity({
							uid: this.userId,
							campaignId: this.campaignId,
							type: "players",
							id,
							property: "curHp",
							value: player.maxHp
						});
						this.update_campaign_entity({
							uid: this.userId,
							campaignId: this.campaignId,
							type: "players",
							id,
							property: "tempHp",
							value: 0
						});
						this.update_campaign_entity({
							uid: this.userId,
							campaignId: this.campaignId,
							type: "players",
							id,
							property: "maxHpMod",
							value: 0
						});

						for(const property of ["transformed", "stable", "saves"]) {
							this.update_campaign_entity({
								uid: this.userId,
								campaignId: this.campaignId,
								type: "players",
								id,
								property,
								value: null
							});
						}
					}
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.normal-view {
		.top-menu {
			display: flex;
			justify-content: space-between;
			border-bottom: solid 2px $white;
			padding-bottom: 2px;
			margin-bottom: 23px;

			.money {
				text-shadow: 0 0 3px $black;
				border-radius: $border-radius-small;
				padding-left: 10px;
				color: $white;
			}
		}
		.players {
			.col.header {
				color: $white;
			}
		}
	}
	.money {
		display: flex;
		justify-content: flex-start;
		cursor: pointer;
		grid-area: money;
		font-size: 18px;
		line-height: 31px;

		div {
			margin-right: 10px;

			img {
				height: 14px;
			}
			&:last-child {
				margin: none;
			}
		}
	}
	.players {
		display: grid;
		grid-auto-rows: max-content;
		grid-row-gap: 1px;
		user-select: none;

		.image {
			width: 46px;
			height: 46px;
			background-size: cover;
			background-position: top center;
			background-color: $neutral-9;
			border: solid 1px $neutral-2;
			position: relative;
			font-size: 36px;
			text-align: center;
			color: $neutral-2;

			> i::before {
				vertical-align: 5px;
			}
			.transformed {
				right: 0;
				bottom: 0;
				position: absolute;
				background: $neutral-8;
				padding: 0 2px;
				border-left: solid 1px $neutral-2;
				border-top: solid 1px $neutral-2;
				font-size: 13px;
			}
		}
		.col {
			min-height: 35px;
			padding: 12px 10px;
			background-color: $neutral-8;
			line-height: 25px;

			&.header {
				padding: 0 12px 5px 12px;
				background: none;
				color: $neutral-3;
				min-height: 25px;

				&.actions {
					padding-top: 5px;
				}
			}
			&.ac {
				text-align: center;
				font-weight: bold;
				position: relative;
				padding: 0;
				width: 45px;
		
				i, .value {
					left: 5px;
					position: absolute;
					line-height: 49px;
					width: 100%;
					text-align: center;
				}
				i {
					font-size: 35px;
					color: $neutral-4;
				}
				.value {
					font-weight: bold;
					color: $white;
					margin-top: -1px;
				}
			}
			&.name {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			&.health {
				text-align: right;
				padding: 8px 10px;

				.current {
					font-weight: bold;
				}
				.hit-points {
					background-color: $neutral-5;
					border: solid 1px $neutral-4;
					border-radius: $border-radius-small;
					padding: 0 5px;
					line-height: 33px;
					height: 33px;
					display: inline-block;
				}
			}
			.saves {
				.save {
					margin-left: 4px;
				}
			}
			&.actions {
				display: flex;
				justify-content: flex-end;
				padding: 9px 12px 9px 0;
			}
		}
		&.xp {
			.image {
				width: 62px;
				height: 62px;
				grid-row: span 2;
				font-size: 49px;
			}
			.xp-bar {
				background: $neutral-8-transparent-8;
				display: flex;
				justify-content: space-between;
				height: 15px;
				width: 100%;
				font-size: 12px;
			
				.level {
					display: block;
					width: min-content;
					padding: 0 3px;
					line-height: 15px;
					text-align: center;
				}
				.q-linear-progress {
					margin-top: 6px;
					height: 3px;
				}
			}
		}

		&.large {
			font-size: 25px;

			.image {
				height: 61px;
				width: 61px;
				font-size: 49px;
			}
			.col {
				line-height: 30px;
				padding: 14px 15px;

				&.header {
					font-size: 18px;
				}

				&.ac {
					padding: 0;
					width: 54px;
			
					i, .value {
						line-height: 61px;
					}
					i {
						font-size: 45px;
					}
				}
				&.actions {
					padding: 14px 15px 14px 0;
				}
			}

			&.xp {
				.image {
					width: 84px;
					height: 84px;
					font-size: 67px;
				}
				.xp-bar {
					height: 23px;
					font-size: 18px;

					.q-linear-progress {
						margin-top: 9px;
						height: 5px;
					}
					.level {
						line-height: 22px;
					}
				}
			}
		}
	}
	[data-theme="light"] {
		.players .image {
			color: $neutral-8;
			background-color: $neutral-2;
		}
	}
</style>