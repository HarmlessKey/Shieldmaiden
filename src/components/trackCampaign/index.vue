<template>
<div v-if="campaign">
	<template v-if="!campaign.private">
		<!-- NOT LIVE -->
		<div class="track-wrapper" 
			:style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }" 
			v-if="!encounter || broadcasting['.value'] != $route.params.campid
		">
			<div class="turns">
				<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
				<span class="title truncate">{{ campaign.campaign }}</span>
				<span>
					<span class="live" :class="{ active: broadcasting['.value'] == $route.params.campid }">live</span>
				</span>
			</div>
			<div class="track">
				<div class="initiative">
					<h3>Campaign Players</h3>
					<q-scroll-area dark :thumb-style="{ width: '5px'}">
						<div>
							<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
						</div>
					</q-scroll-area>
				</div>
				<div class="side">
					<h3>Campaign wide meters</h3>
					<q-scroll-area dark :thumb-style="{ width: '5px'}">
						<div>
							<Meters :entities="campaign.players" :players="players" :campaign="true" :npcs="{}" />
						</div>
					</q-scroll-area>
				</div>
			</div>
		</div>

		<!-- LIVE -->
		<div class="track-wrapper" v-else-if="encounter && broadcasting['.value'] == $route.params.campid" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
			
			<!-- FINISHED -->
			<template  v-if="encounter.finished">
				<div class="turns">
					<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
					<span class="title truncate">Encounter Finished</span>
					<span>
						<span class="live" :class="{ active: broadcasting['.value'] == $route.params.campid }">live</span>
					</span>
				</div>
				<div class="track">
					<div class="initiative">
						<Rewards :encounter="encounter"/>
					</div>
					<div class="side">
						<Meters :entities="encounter.entities" :players="players" :npcs="npcs" />
					</div>
				</div>
			</template>

			<!-- ROLL FOR INITIATIVE -->
			<div class="track" v-else-if="encounter.round === 0">
				<div class="roll-for-initiative">
					<div>
						<span class="die spin" :style="{ backgroundImage: 'url(' + require('@/assets/_img/logo/logo-icon-no-shield-' + dieColor + '.svg') + ')' }"></span>
						<h2>Roll for initiative!</h2>
					</div>
				</div>
			</div>

			<!-- ACTIVE ENCOUNTER -->
			<template v-else>
				<Turns 
					:encounter="encounter" 
					:current="_non_hidden_targets[0]"
					:entities_len="Object.keys(_turnCount).length"
					:turn="turn"
					:campPlayers="campaign.players"
					:campCompanions="campaign.companions"
					:players="players"
					:npcs="npcs"
					:playerSettings="playerSettings"
					:npcSettings="npcSettings"
				/>
				<div class="track">
					<div class="initiative">
						<Initiative 
							:encounter="encounter" 
							:targets="_non_hidden_targets"
							:allEntities="_turnCount"
							:turn="turn"
							:campPlayers="campaign.players"
							:campCompanions="campaign.companions"
							:players="players"
							:npcs="npcs"
							:playerSettings="playerSettings"
							:npcSettings="npcSettings"
							@newRoll="pushRoll"
                    />
					</div>
					<div class="side">
						<div class="menu">
							<ul>
								<li @click="sideDisplay = 'damage'" :class="{ active: sideDisplay == 'damage'}" v-if="playerSettings.meters === undefined"><i class="fas fa-swords"></i></li>
								<li @click="sideDisplay = 'rolls'" :class="{ active: sideDisplay == 'rolls'}"><i class="fas fa-dice-d20"></i></li>
							</ul>
						</div>
						<q-scroll-area dark :thumb-style="{ width: '5px'}" class="during-encounter">
							<div>
								<Meters 
									v-if="sideDisplay === 'damage' && playerSettings.meters === undefined"
									:entities="encounter.entities" 
									:npcs="npcs" 
									:players="players"
								/>
								<Rolls 
									v-if="sideDisplay === 'rolls'"
									:entities="encounter.entities" 
									:npcs="npcs" 
									:players="players" 
									:rolls="rolls"
								/>
							</div>
						</q-scroll-area>
					</div>
				</div>
			</template>
		</div>
	</template>
	<div class="track-wrapper" v-else>
		<div class="top d-flex justify-content-between">
			<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
			Not found
			<span>
			</span>
		</div>
		<div class="container-fluid">
			<div class="container entities">
				<h2>Perception check failed</h2>
				<p>It seems we rolled a little low, this campaign can't be found.<br/>
					It is possible the campaign is set to private.</p>
			</div>
		</div>
	</div>
</div>
</template>

<script>
	import _ from 'lodash';
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';

	import Follow from '@/components/trackCampaign/Follow.vue';
	import Rewards from '@/components/trackCampaign/Rewards.vue';
	import Turns from '@/components/trackCampaign/Turns.vue';
	import Initiative from '@/components/trackCampaign/Initiative.vue';
	import Meters from '@/components/trackCampaign/Meters.vue';
	import Rolls from '@/components/trackCampaign/Rolls.vue';
	import CampaignOverview from '@/components/trackCampaign/CampaignOverview.vue';
	import ViewPlayers from '@/components/campaign/Players.vue';

	export default {
		name: 'app',
		mixins: [general],
		components: {
			Follow,
			Rewards,
			Turns,
			Initiative,
			Meters,
			Rolls,
			CampaignOverview,
			ViewPlayers
		},
		metaInfo: {
			title: 'Harmless Key'
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				userId: this.$route.params.userid,
				encounter: undefined,
				campaign: undefined,
				counter: 0,
				tier: undefined,
				rolls: [],
				setSideDisplay: undefined
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
				npcs: {
					source: db.ref(`npcs/${this.userId}`),
					asObject: true,
				},
				npcSettings: {
					source: db.ref(`settings/${this.userId}/track/npc`),
					asObject: true,
				},
				playerSettings: {
					source: db.ref(`settings/${this.userId}/track/player`),
					asObject: true,
				},
				broadcasting: {
					source: db.ref(`broadcast/${this.userId}/live`),
					asObject: true
				},
			}
		},
		beforeMount() {
			this.fetch_encounter()
		},
		computed: {
			sideDisplay: {
				get() {
					if(this.setSideDisplay) {
						return this.setSideDisplay;
					}
					return (this.playerSettings.meters === undefined) ? 'damage' : 'rolls';
				},
				set(newValue) {
					this.setSideDisplay = newValue;
				}
			},
			//All entities, without hidden entities
			_turnCount() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down && !entity.hidden;
				})
				.orderBy(function(entity) {
					return entity.name
				}, 'asc')
				.orderBy(function(entity){
					return Number(entity.initiative)
				} , 'desc')
				.value()
			},
			_allEntities: function() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down;
				})
				.orderBy(function(entity) {
					return entity.name
				}, 'asc')
				.orderBy(function(entity){
					return Number(entity.initiative)
				} , 'desc')
				.value()
			},
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._allEntities)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._allEntities[i])
			},
			_non_hidden: function() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down && !entity.hidden;
				})
				.orderBy(function(entity) {
					return entity.name
				}, 'asc')
				.orderBy(function(entity){
					return Number(entity.initiative)
				} , 'desc')
				.value()
			},
			_hidden_count: function() {
				return _.filter(this.encounter.entities, function(entity, key) {
					entity.key = key
					return entity.active && !entity.down && entity.hidden;
				}).length
			},
			_non_hidden_targets: function() {
				let t = this.turn
				let turns = Object.keys(this._non_hidden)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._non_hidden[i])
			},
			turn() {	
				let t = this.encounter.turn
				let hidden = 0
				for (let i = 0; i <= t; i++) {
					if (this._allEntities[i].hidden) {
						hidden++;
					}
				}
				// If more hidden then turn it's still turn 0
				if (t - hidden < 0) {
					return 0
				}
				return t - hidden
			},
			//Random die color
			dieColor() {
				let number = Math.ceil(Math.random() * 6)

				switch(number) {
					case 1: return 'blue';
					case 2: return 'cyan';
					case 3: return 'green';
					case 4: return 'orange';
					case 5: return 'red';
					case 6: return 'yellow';
				}
			}
		},
		methods: {
			fetch_encounter() {
				var track = db.ref(`broadcast/${this.userId}`);
				track.on('value' , (snapshot) => {
					let campId = this.$route.params.campid

					if(snapshot.val()) {
						let encId = snapshot.val().encounter

						let encounter = db.ref(`encounters/${this.userId}/${campId}/${encId}`)

						encounter.on('value' , (snapshot) => {
							let enc = snapshot.val();
							if(enc) {
								enc.key = encId;
							}
							this.encounter = enc
						});
					}
					//Get campaign for player curHP/tempHP/ACBonus/Dead/Stable/DeathSaves
					let fetchCampaign = db.ref(`campaigns/${this.userId}/${campId}`);

					fetchCampaign.on('value' , (snapshot) => {				
						this.campaign = snapshot.val();
					});
				});
			},
			pushRoll(roll) {
				if(roll) {
					this.rolls.unshift(roll);
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.track-wrapper {
		height: calc(100vh - 50px);
		background-size: cover;
		background-position: center bottom;
		background-color: #191919;
		width: 100vw;
		position: relative;

		.turns {
			grid-area: top;
			background: rgba(38, 38, 38, .9);
			text-transform: uppercase;
			height: 65px;
			padding: 20px 10px;
			display: grid;
			grid-template-columns: max-content auto max-content;

			.title {
				text-align: center;
				padding: 0 10px;
			}
		}

		.track {
			max-width: 1250px;
			margin: auto;
			padding-top: 30px;
			width: 100%;
			height: calc(100% - 65px);
			display: grid;
			grid-template-columns: 3fr 1fr;
			grid-template-rows: 1fr;
			grid-gap: 15px;
			grid-template-areas:
			"initiative side";

			.initiative {
				grid-area: initiative;
				padding-left: 15px;
				overflow: hidden;

				.q-scrollarea {
					height: calc(100% - 86px);

					> div {
						padding-right: 6px;
					}
				}
			}
			.side {
				grid-area: side;
				padding-right: 15px;
				overflow: hidden;

				.menu {
					height: 29px;
					border-bottom: solid 2px #000;
					position: relative;
					user-select: none;
					margin-bottom: 10px;

					ul {
						height: 29px;
						margin: 0;
						display: flex;
						justify-content: flex-start;
						padding: 0;

						li {
							cursor: pointer;
							height: 29px;
							padding: 0 10px;
							display: block;
							border-bottom: solid 2px #000;
							color: #fff;

							&.active {
								color: #2c97de;
								border-color: #2c97de;
							}
							&:first-child {
								padding-left: 3px;
							}
						}
					}
				}
				.q-scrollarea {
					height: calc(100% - 56px);

					> div {
						padding-right: 6px;
					}
					&.during-encounter {
						height: calc(100% - 50px);
					}
				}
			}
			.roll-for-initiative {
				height: calc(100vh - 50px);
				z-index: 99;
				width: 100%;
				left: 0;
				position: fixed;
				top: 50px;
				background: rgba(38, 38, 38, .5);
				text-align: center;

				> div {
					position: absolute;
					top: 40%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				.die {
					display: inline-block;
					width: 155px; 
					height: 155px;
					background-size: 155px 155px;
					background-position: center;
					background-repeat: no-repeat;
					margin-bottom: 30px;

					&.spin {
						margin-right: 10px;
						font-size: 40px;
						animation: spin 1.5s ease infinite;
					}
				}
				h2 {
					font-weight: bold;
					font-size: 50px;
					text-transform: none;
					color: #fff;
					text-shadow: 0 0 8px #000;
				}
			}
			h3 {
				margin-bottom: 30px !important;
				color: #fff;
				text-shadow: 0 0 8px #000;
			}
			h2.not-live {
				margin-top: 50px;
				text-align: center;
			}

			&::-webkit-scrollbar { 
				display: none; 
			}

			h2.padding {
				font-size:25px !important;
				line-height: 25px !important;
				text-align: center;
				padding-top: 20px;
				text-shadow: 0 0 8px #000;
				color: #fff;
			}
			.loader:before {
				width: 80px;
				height: 80px;
				margin-top: -85px;
				margin-left: -40px;
				border-width: 5px;
				animation-duration: 1.5s;
			}
			.container-fluid {
				background-color:rgba(0, 0, 0, 0.3);
				height: calc(100vh - 115px);
				overflow-y: scroll;
				padding-bottom: 110px;

				&::-webkit-scrollbar { 
					display: none; 
				}
				.lastRoll {
					background: rgba(0, 0, 0, .6);
					padding: 5px;
				}
			}
			
		}
	}
	.no-broadcast {
		padding-bottom: 110px !important;
	}
	@keyframes spin {
		0%, 30% { transform: rotate(0deg); }
		70%, 100% { transform: rotate(360deg); }
	}
	@media only screen and (max-width: 1000px) {
		.track-wrapper {
			.track {
				grid-template-columns: 2fr 1fr;
			}
		}
	}
	@media only screen and (max-width: 720px) { 
		.track-wrapper {
			.track {
				overflow: scroll;
				grid-template-columns: 1fr;
				grid-template-rows: auto;
				grid-template-areas:
				"initiative"
				"side";

				.initiative {
					padding: 0 15px;
					overflow: visible !important;

					.q-scrollarea {
						overflow: visible !important;
					}
				}
				.side {
					padding: 0 15px;
					overflow: visible !important;

					.q-scrollarea {
						overflow: visible !important;
					}
				}
			}
		}
	}
</style>
