<template>
	<div>
		<div class="group-actions" ref="players">
			<div 
				class="money" 
				:class="{ red: currency['.value'] >= maxCurrencyAmount }"
				@click="
					viewerIsUser
					? setSlide({
						show: true,
						type: 'slides/party/Currency',
						data: { current: currency['.value'] }
					}) : null
				">
				<template v-if="currency['.value']">
					<template v-for="(coin, key) in money">
						<div v-if="coin" :key="key">
							<template v-if="key === 'pp' && coin >= 1000">{{ coin | numeral('0.0a') }} </template>
							<template v-else>{{ coin }} </template>
							<img :src="require(`@/assets/_img/currency/${currencies[key].color}.svg`)" />
						</div>
					</template>
				</template>
				<span v-else class="text-italic gray-hover">No money</span>
			</div>
			<div class="actions">
				<template v-if="viewerIsUser">
					<a 
						@click="setSlide({
							show: true,
							type: 'slides/party/health'
						})">
						<i class="fas fa-heart"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Edit Group Health
						</q-tooltip>
					</a>
					<a 
						v-if="isXpAdvancement()"
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
						@click="setSlide({
							show: true,
							type: 'slides/party/Inventory'
						})">
						<i class="fas fa-treasure-chest"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Party Inventory
						</q-tooltip>
					</a>
				</template>
				<a 
					v-else-if="campaign.inventory && campaign.inventory.items"
					@click="setSlide({
						show: true,
						type: 'slides/party/ViewInventory'
					})">
						<i class="fas fa-treasure-chest mr-1"></i>
						{{ Object.keys(campaign.inventory.items).length }}
						<q-tooltip anchor="top middle" self="center middle">
							Party Inventory
						</q-tooltip>
				</a>
			</div>
		</div>
		<div 
			v-if="players"
			class="players" 
			:class="{ xp: isXpAdvancement() }"
			:style="{ 'grid-template-columns': templateColumns }"
		>
			<div class="header"></div>
			<div class="col header ac">
				<i class="fas fa-shield"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Armor class
				</q-tooltip>
			</div>
			<div class="col header name"></div>
			<div class="col header pp" v-if="settings.passive_perception === undefined && !is_small">
				<i class="fas fa-eye"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive perception
				</q-tooltip>
			</div>
			<div class="col header pinv" v-if="settings.passive_investigation === undefined && !is_small">
				<i class="fas fa-search"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive investigation
				</q-tooltip>
			</div>
			<div class="col header pins" v-if="settings.passive_insight === undefined && !is_medium">
				<i class="fas fa-lightbulb-on"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Passive insight
				</q-tooltip>
			</div>
			<div class="col header save" v-if="settings.save_dc === undefined && !is_medium">
				<i class="fas fa-hand-holding-magic"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Save DC
				</q-tooltip>
			</div>
			<div class="col header health">
				<i class="fas fa-heart"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Health
				</q-tooltip>
			</div>
			<div class="col header actions" v-if="viewerIsUser"><i class="far fa-ellipsis-h"></i></div>

			<template v-for="(player, key) in players">
				<template v-if="player.curHp !== undefined"><!-- make sure incomplete players aren't displayed -->
					<div 
						class="image" 
						:key="'image-'+key" 
						:style="[
							player.avatar ? { backgroundImage: 'url(\'' + player.avatar + '\')' } : 
							{ backgroundImage: `url(${require('@/assets/_img/styles/player.svg')})`}
						]
					">
						<div class="transformed" v-if="player.transformed">
							<i class="fas fa-paw-claws green"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Transformed
							</q-tooltip>
						</div>
						<!-- <div v-if="player.avatar" :style="[player.avatar ? { backgroundImage: 'url(\'' + player.avatar + '\')' } : '@/assets/_img/styles/player.svg']"></div> -->
						<!-- <img v-else src="@/assets/_img/styles/player.svg" />	 -->
					</div>
					<div class="col ac" :key="'ac-'+key">
						<span :class="{ 
								'green': player.ac_bonus > 0, 
								'red': player.ac_bonus < 0 
							}" 
							v-if="player.ac_bonus">
							{{ (player.transformed ? player.transformed.ac : player.ac) + player.ac_bonus }}
							<q-tooltip anchor="top middle" self="center middle">
								Armor Class {{ player.ac_bonus }}
							</q-tooltip>
						</span>
						<span v-else>{{ player.transformed ? player.transformed.ac : player.ac }}</span>
					</div>
					<div class="col name" :key="'name-'+key">{{ player.character_name }}</div>

					<div 
						class="col pp" 
						v-if="settings.passive_perception === undefined && !is_small"
						:key="'pp-'+key"
					>
						{{ player.passive_perception }}
					</div>
					<div 
						class="col pinv" 
						v-if="settings.passive_investigation === undefined && !is_small"
						:key="'pinv-'+key"
					>
						{{ player.passive_investigation }}
					</div>
					<div 
						class="col pins" 
						v-if="settings.passive_insight === undefined && !is_medium"
						:key="'pins-'+key"
					>
						{{ player.passive_insight }}
					</div>
					<div 
						class="col save" 
						v-if="settings.save_dc === undefined && !is_medium"
						:key="'save-'+key"
					>
						{{ player.spell_save_dc }}
					</div>

					<div class="col health" :key="'health-'+key">
						<template v-if="player.curHp <= 0">
							<div v-if="player.stable" class="green">
								<span><i class="fas fa-fist-raised"></i> Stable</span>
							</div>
							<div v-else-if="player.dead" class="red">
								<span><i class="fas fa-skull-crossbones"></i> Dead</span>
							</div>
							<div v-else class="saves d-flex justify-content-end">
								<div v-for="(check, index) in player.saves" :key="`save-${index}`" class="save">
									<span v-show="check === 'succes'" class="green"><i class="fas fa-check"></i></span> 
									<span v-show="check === 'fail'" class="red"><i class="fas fa-times"></i></span>
								</div>
							</div>
						</template>
						<template v-else>
							<template v-if="player.transformed">
								<span class="current" :class="{ 
									'red': percentage(player.transformed.curHp, player.transformed.maxHp) <= 33, 
									'orange': percentage(player.transformed.curHp, player.transformed.maxHp) > 33 && percentage(player.transformed.curHp, player.transformed.maxHp) <= 76, 
									'green': percentage(player.transformed.curHp, player.transformed.maxHp) > 76
								}">{{ player.transformed.curHp }}</span>
								<span class="gray-hover">/</span>
								<span>
									{{ player.transformed.maxHp }}
								</span>
							</template>
							<template v-else>
								<span class="current" :class="{ 
									'red': percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) <= 33, 
									'orange': percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) > 33 && percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) <= 76, 
									'green': percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) > 76
								}">{{ player.curHp }}</span>
								<span class="gray-hover">/</span>
								<span :class="{ 
										'green': player.maxHpMod > 0, 
										'red': player.maxHpMod < 0 
									}" 
									v-if="player.maxHpMod">
									{{ maxHp(player.maxHp, player.maxHpMod) }}
									<q-tooltip anchor="top middle" self="center middle">
										Max HP + {{ player.maxHpMod }}
									</q-tooltip>
								</span>
								<span v-else>{{ player.maxHp }}</span>
							</template>
							<span v-if="player.tempHp > 0" class="gray-hover">+{{ player.tempHp }}</span>
						</template>
					</div>
					<div class="col actions" :key="'actions-'+key" v-if="viewerIsUser">
						<a 	
							class="gray-hover" 
							@click="setSlide({
								show: true,
								type: 'slides/EditPlayer',
								data: { key: player['.key'], location: 'overview',}
							})">
							<i class="fas fa-pencil"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Edit player
							</q-tooltip>
						</a>
					</div>
					<div class="xp-bar" :key="'xp-'+key" :style="{ 'grid-column': 'span ' + calcColspan }"  v-if="isXpAdvancement()">
						<div class="level" :class="{red: isXpAdvancement() && player.level}">
							{{ player.level ? player.level : calculatedLevel(player.experience) }}
							<q-tooltip anchor="top middle" self="center middle" v-if="player.level">
								Level is overwritten
							</q-tooltip>
						</div>
						<q-linear-progress size="3px" :value="levelAdvancement(player.experience)" color="primary" class="bg-gray-active" />
					</div>
				</template>
			</template>
		</div>

		<button class="btn btn-block" @click="reset()" v-if="viewerIsUser"><i class="fas fa-undo-alt"></i> Reset Player Health</button>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import { experience } from '@/mixins/experience.js';
	import { currencyMixin } from '@/mixins/currency.js';

	export default {
		name: 'Players',
		props: ['userId', 'campaignId'],
		mixins: [experience, currencyMixin],
		data() {
			return {
				width: 0,
				is_small: false,
				is_medium: false,
				viewerId: this.$store.getters.user.uid,
				players: undefined,
				loading: true
			}
		},
		firebase() {
			return {
				campaign:  {
					source: db.ref(`campaigns/${this.userId}/${this.campaignId}`),
					asObject: true
				},
				settings: {
					source: db.ref(`settings/${this.userId}/general`),
					asObject: true
				},
				currency: {
					source: db.ref(`campaigns/${this.userId}/${this.campaignId}/inventory/currency`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'playerInCampaign',
			]),
			viewerIsUser() {
				//If the viewer is the user that runs the campaign
				//Edit functions are enabled
				return this.userId === this.viewerId;
			},
			templateColumns() {
				let templateColumns = 'max-content 40px auto ';

				if(this.settings.passive_perception === undefined && !this.is_small) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.passive_investigation === undefined && !this.is_small) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.passive_insight === undefined && !this.is_medium) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.save_dc === undefined && !this.is_medium) {
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
			money() {
				return this.copperToPretty(this.currency['.value']);
			}
		},
		mounted() {
			const getPlayers = db.ref(`campaigns/${this.userId}/${this.campaignId}/players`);
			getPlayers.on('value', async (snapshot) => {
				let campaignPlayers = snapshot.val();

				for(let key in campaignPlayers) {	
					campaignPlayers[key]['.key'] = key;

					//Get full player
					const fullPlayer = db.ref(`players/${this.userId}/${key}`)
					await fullPlayer.on('value', (snapshot) => {
						//Create the player Object
						if(snapshot.val()) {
							campaignPlayers[key].character_name = snapshot.val().character_name;
							campaignPlayers[key].avatar = snapshot.val().avatar;
							campaignPlayers[key].level = snapshot.val().level;
							campaignPlayers[key].maxHp = parseInt(snapshot.val().maxHp);
							campaignPlayers[key].ac = parseInt(snapshot.val().ac);
							campaignPlayers[key].experience = snapshot.val().experience;
							campaignPlayers[key].passive_perception = snapshot.val().passive_perception;
							campaignPlayers[key].passive_investigation = snapshot.val().passive_investigation;
							campaignPlayers[key].passive_insight = snapshot.val().passive_insight;
							campaignPlayers[key].passive_insight = snapshot.val().passive_insight;
							campaignPlayers[key].spell_save_dc = snapshot.val().spell_save_dc;
						}
						//The player doesn't exist so remove it from the campaign
						else if(this.viewerIsUser) {
							// eslint-disable-next-line
							console.error('Ghost Player Removed: ', key);
							db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}`).remove();
						}
					});	
				}
				this.players = Object.values(campaignPlayers);
				this.loading = false;
			});
			this.$nextTick(function() {
				window.addEventListener('resize', this.setSize);
				//Init
				this.setSize();
			});
		},
		methods: {
			...mapActions([
				'setSlide',
			]),
			getWindowWidth() {
				this.width = this.$refs.players.clientWidth;
			},
			setSize() {
				let width = this.$refs.players.clientWidth
				let small = 400;
				let medium = 500;

				this.is_medium = (width <= medium) ? true : false;
				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = this.$refs.players.clientWidth;
			},
			percentage(current, max) {
				var percentage = Math.floor(current / max * 100)
				return percentage
			},
			maxHp(maxHp, maxHpMod) {
				return parseInt((maxHpMod) ? maxHp + maxHpMod : maxHp);
			},
			reset() {
				for(var i in this.players) {
					let player = this.players[i];
					let key = this.players[i]['.key'];

					if(!player.dead) {
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}`).update({
							curHp: this.players[i].maxHp,
							tempHp: 0,
							maxHpMod: 0
						});
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}/transformed`).remove();
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}/stable`).remove();
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}/saves`).remove();
					}
				}
			},
			isXpAdvancement(){
				return this.campaign.advancement != 'milestone'
			}
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.setSize);
		}
	}
</script>

<style lang="scss" scoped>
	.group-actions {
		border-bottom: solid 2px $gray-light;
		height: 35px;
		line-height: 35px;
		display: grid;
		grid-template-columns: auto max-content;
		grid-template-areas: "money actions";
		user-select: none;

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
				color:$white !important;

				&:hover {
					color: $blue !important;
				}
			}
		}
	}
	.players {
		display: grid;
		grid-auto-rows: max-content;
		grid-row-gap: 1px;
		margin: 10px 0 30px 0;
		user-select: none;

		.image {
			width: 46px;
			height: 46px;
			background-size: cover;
			background-position: top center;
			background-color: black;
			border: solid 1px $gray-light;
			position: relative;

			.transformed {
				right: 0;
				bottom: 0;
				position: absolute;
				background:$black;
				padding: 0 2px;
				border-left: solid 1px $gray-light;
				border-top: solid 1px $gray-light;
			}
		}
		.col {
			min-height: 35px;
			padding: 12px 10px;
			background-color:$gray;

			&.header {
				background: none;
			}
			&.ac {
				text-align: center;
				font-weight: bold;
			}
			&.name {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.saves {
				.save {
					margin-left: 4px;
				}
			}
			&.actions {
				display: flex;
				justify-content: flex-end;
				padding: 9px 12px;

				a {
					color: $gray-light !important;
					width: 28px;
					height: 28px;
					display: block;
					line-height: 28px;
					text-align: center;
					border-radius: 50%;

					&:hover {
						text-decoration: none;
						background-color:$gray-active;
					}
				}
			}
		}
		&.xp {
			.image {
				width: 62px;
				height: 62px;
				grid-row: span 2;
			}
			.xp-bar {
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
				.q-linear-progress {
					margin-top: 6px;
					height: 3px;
				}
			}
		}
	}
</style>