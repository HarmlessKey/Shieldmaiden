<template>
	<div>
		<div class="group-actions">
			<div class="money" 
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
							<template v-if="coin < 1000">{{ coin }} </template>
							<template v-else>{{ coin | numeral('0.0a') }} </template>
							<img :src="require(`@/assets/_img/currency/${currencies[key].color}.svg`)" />
						</div>
					</template>
				</template>
				<span v-else class="text-italic gray-hover">No money</span>
			</div>
			<div class="actions">
				<template v-if="viewerIsUser">
					<a 
						v-b-tooltip.hover title="Edit Group Health"
						@click="setSlide({
							show: true,
							type: 'slides/party/health'
						})"><i class="fas fa-heart"></i></a>
					<a 
						v-if="campaign.advancement != 'milestone'"
						v-b-tooltip.hover title="Award Experience Points"
						@click="setSlide({
							show: true,
							type: 'slides/party/xp'
						})">XP</a>
					<a 
						v-b-tooltip.hover title="Party Inventory"
						@click="setSlide({
							show: true,
							type: 'slides/party/Inventory'
						})"><i class="fas fa-treasure-chest"></i></a>
				</template>
				<a 
					v-else-if="campaign.inventory.items"
					v-b-tooltip.hover title="Party Inventory"
					@click="setSlide({
						show: true,
						type: 'slides/party/ViewInventory'
					})">
						<i class="fas fa-treasure-chest mr-1"></i>
						{{ Object.keys(campaign.inventory.items).length }}
					</a>
			</div>
		</div>
		<div 
			v-if="players"
			class="players" 
			:class="{ xp: campaign.advancement != 'milestone' }"
			:style="{ 'grid-template-columns': templateColumns }"
		>
			<div class="header"></div>
			<div class="col header ac"><i class="fas fa-shield" v-b-tooltip.hover title="Armor Class"></i></div>
			<div class="col header name"></div>
			<div class="col header pp" v-if="settings.passive_perception == undefined">
				<i class="fas fa-eye" v-b-tooltip.hover title="Passive Perception"></i>
			</div>
			<div class="col header pinv" v-if="settings.passive_investigation == undefined">
				<i class="fas fa-search" v-b-tooltip.hover title="Passive Investigation"></i>
			</div>
			<div class="col header pins" v-if="settings.passive_insight == undefined">
				<i class="fas fa-lightbulb-on" v-b-tooltip.hover title="Passive Insight"></i>
			</div>
			<div class="col header save" v-if="settings.save_dc == undefined">
				<i class="fas fa-hand-holding-magic" v-b-tooltip.hover title="Save DC"></i>
			</div>
			<div class="col header health"><i class="fas fa-heart" v-b-tooltip.hover title="Health"></i></div>
			<div class="col header actions"><i class="far fa-ellipsis-h"></i></div>

			<template v-for="(player, key) in players">
				<div 
					v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"
					class="col image" 
					:key="'image-'+key"></div>
				<div v-else class="image" :key="'image-'+key">
					<img src="@/assets/_img/styles/player.svg" />
				</div>
				<div class="col ac" :key="'ac-'+key">
					<span :class="{ 
							'green': player.ac_bonus > 0, 
							'red': player.ac_bonus < 0 
						}" 
						v-b-tooltip.hover :title="'Armor Class + ' + player.ac_bonus" 
						v-if="player.ac_bonus">
						{{ player.ac + player.ac_bonus }}
					</span>
					<span v-else>{{ player.ac }}</span>
				</div>
				<div class="col name" :key="'name-'+key">{{ player.character_name }}</div>

				<div 
					class="col pp" 
					v-if="settings.passive_perception == undefined"
					:key="'pp-'+key"
				>
					{{ player.passive_perception }}
				</div>
				<div 
					class="col pinv" 
					v-if="settings.passive_investigation == undefined"
					:key="'pinv-'+key"
				>
					{{ player.passive_investigation }}
				</div>
				<div 
					class="col pins" 
					v-if="settings.passive_insight == undefined"
					:key="'pins-'+key"
				>
					{{ player.passive_insight }}
				</div>
				<div 
					class="col save" 
					v-if="settings.save_dc == undefined"
					:key="'save-'+key"
				>
					{{ player.spell_save_dc }}
				</div>

				<div class="col health" :key="'health-'+key">
					<span class="current" :class="{ 
						'red': percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) <= 33, 
						'orange': percentage(player.curHp, maxHp(player.maxHp, player.maxHpMod)) > 33 && percentage(player.curHp, player.maxHp) <= 76, 
						'green': true
					}">{{ player.curHp }}</span>
					<span class="gray-hover">/</span>
					<span :class="{ 
							'green': player.maxHpMod > 0, 
							'red': player.maxHpMod < 0 
						}" 
						v-b-tooltip.hover :title="'Max HP + ' + player.maxHpMod" v-if="player.maxHpMod">
						{{ maxHp(player.maxHp, player.maxHpMod) }}
					</span>
					<span v-else>{{ player.maxHp }}</span>
					<span v-if="player.tempHp > 0" class="gray-hover">+{{ player.tempHp }}</span>
				</div>
				<div class="col actions" :key="'actions-'+key">
					<a 	
						v-if="viewerIsUser"
						class="gray-hover" 
						v-b-tooltip.hover title="Edit player" 
						@click="setSlide({
							show: true,
							type: 'slides/EditPlayer',
							data: { key: key, location: 'overview',}
						})">
						<i class="fas fa-pencil"></i>
					</a>
				</div>

				<div class="xp-bar" :key="'xp-'+key" :style="{ 'grid-column': 'span ' + calcColspan }"  v-if="campaign.advancement != 'milestone'">
					<div class="level">{{ player.level ? player.level : calculatedLevel(player.experience) }}</div>
					<div class="progress">
						<div class="progress-bar bg-blue"
							role="progressbar" 
							:style="{ width: levelAdvancement(player.experience) + '%' }" aria-valuemin="0" aria-valuemax="100">
						</div>
					</div>
				</div>
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
				viewerId: this.$store.getters.getUser.uid,
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

				if(this.settings.passive_perception === undefined) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.passive_investigation === undefined) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.passive_insight === undefined) { 
					templateColumns = templateColumns.concat(' max-content');
				}
				if(this.settings.save_dc === undefined) {
					templateColumns = templateColumns.concat(' max-content');
				}

				templateColumns = templateColumns.concat(' max-content max-content');

				return templateColumns;
			},
			calcColspan() {
				let colspan = 8;

				if(this.settings.passive_perception !== undefined) { colspan--; }
				if(this.settings.passive_investigation !== undefined) { colspan--; }
				if(this.settings.passive_insight !== undefined) { colspan--; }
				if(this.settings.save_dc !== undefined) { colspan--; }

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
						if(snapshot.val()) {
							campaignPlayers[key].character_name = snapshot.val().character_name;
							campaignPlayers[key].avatar = snapshot.val().avatar;
							campaignPlayers[key].maxHp = snapshot.val().maxHp;
							campaignPlayers[key].ac = snapshot.val().ac;
							campaignPlayers[key].experience = snapshot.val().experience;
							campaignPlayers[key].passive_perception = snapshot.val().passive_perception;
							campaignPlayers[key].passive_investigation = snapshot.val().passive_investigation;
							campaignPlayers[key].passive_insight = snapshot.val().passive_insight;
							campaignPlayers[key].passive_insight = snapshot.val().passive_insight;
							campaignPlayers[key].save_dc = snapshot.val().save_dc;
						}
					});	
				}
				this.players = Object.values(campaignPlayers);
				this.loading = false;
			});

		},
		methods: {
			...mapActions([
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
					db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${key}`).update({
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
	.players {
		display: grid;
		grid-auto-rows: max-content;
		grid-row-gap: 1px;
		margin: 10px 0 30px 0;

		.image {
			width: 46px;
			height: 46px;
			background-size: cover;
			background-position: top center;
			background-color: black;
			border: solid 1px #b2b2b2;
		}
		.col {
			min-height: 35px;
			padding: 12px 10px;
			background-color: #262626;

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
			&.actions {
				display: flex;
				justify-content: flex-end;
				padding: 9px 12px;

				a {
					color: #b2b2b2 !important;
					width: 28px;
					height: 28px;
					display: block;
					line-height: 28px;
					text-align: center;
					border-radius: 50%;

					&:hover {
						text-decoration: none;
						background-color: #302f2f;
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
				.progress {
					margin-top: 6px;
					width: 100%;
					height: 3px;
					background-color: #232323 !important;
				}
			}
		}
	}
</style>