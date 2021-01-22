<template>
	<div class="signed">
		<div class="container">
			<router-link to="/home">
				<img class="logo" src="@/assets/_img/logo/logo-main-icon-left.svg" alt="Harmless Key logo" />
			</router-link>
			
			<router-link 
				v-if="active_campaign"
				:to="`/encounters/${active_campaign.key}`" 
				class="mb-5"
			>
				<hk-card 
					:style="[
						active_campaign.background
						? { backgroundImage: 'url(\'' + active_campaign.background + '\')' }
						: { backgroundImage: `url(${require('@/assets/_img/campaign-background.jpg')})` }
					]"
				>
					<div slot="header" class="card-header truncate">
						{{ active_campaign.campaign }}
					</div>
					<div class="card-body" slot="default">
						Continue campaign
					</div>
					<div slot="footer" class="card-footer">
						<small class="date">
							<span class="gray-light">Started:</span> {{ makeDate(active_campaign.timestamp, true) }}
						</small>
					</div>
				</hk-card>
			</router-link>
			<router-link v-else to="/campaigns" class="first">
				<h2>Create a campaign</h2>
			</router-link>

			<div class="row q-col-gutter-lg">
				<div class="col-12 col-md-6">
					<h2>Dungeon Master</h2>					
					<q-list dark class="mb-4">
						<q-item 
							v-for="({name, icon, label}, index) in dm_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`dm-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" />
							</q-item-section>
							<q-item-section>{{ label }}</q-item-section>
						</q-item>
					</q-list>
				</div>
				
				<div class="col-12 col-md-6">
					<h2>Player</h2>					
					<q-list dark>
						<q-item 
							v-for="({name, icon, label}, index) in player_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`player-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" />
							</q-item-section>
							<q-item-section>{{ label }}</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>

			<!-- PATREON -->
			<div class="mt-4">
				<h4 
					v-if="tier && userInfo && userInfo.patron"
					class="text-center patreon-red"
				>
					<i class="patreon-red fas fa-heart"/> Thanks for your '{{ userInfo.patron.tier}}' support.
				</h4>
				<a v-else href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener" class="patreon-red"><i class="fab fa-patreon"></i> Support us on Patreon</a>
			</div>

			<div class="share bg-gray-dark">
				<a class="btn btn-lg btn-block bg-blue" @click="setSlide({ show: true, type: 'PlayerLink'})">
					<i class="fas fa-share-alt"></i> Share your encounters
				</a>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'SignedIn',
		mixins: [general],
		data() {
			return {
				dm_tabs: [
					{
						name: "campaigns",
						label: "Campaigns",
						icon: "fas fa-dungeon"
					},
					{
						name: "players",
						label: "Players",
						icon: "fas fa-users"
					},
					{
						name: "npcs",
						label: "NPC's",
						icon: "fas fa-dragon"
					},
					{
						name: "reminders",
						label: "Reminders",
						icon: "fas fa-stopwatch"
					},
					{
						name: "items",
						label: "Items",
						icon: "fas fa-staff"
					}
				],
				player_tabs: [
					{
						name: "characters",
						label: "Characters",
						icon: "fas fa-helmet-battle"
					},
					{
						name: "followed",
						label: "Following",
						icon: "fas fa-users"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'user',
				'tier',
				'voucher',
				'userInfo',
				'campaigns'
			]),
			active_campaign() {
				if(this.campaigns && this.userInfo) {
					if(this.userInfo && this.userInfo.active_campaign) {
						let campaign = this.campaigns[this.userInfo.active_campaign];
						campaign.key = this.userInfo.active_campaign;
						return campaign;
					} else {
						const campaignKey = Object.keys(this.campaigns)[0];
						let campaign = this.campaigns[campaignKey];
						campaign.key = campaignKey;
						return campaign;
					}
				}
				else {
					return undefined;
				}
			}
		},
		methods: {
			...mapActions([
				"setSlide"
			])
		}
	}
</script>

<style lang="scss" scoped>
	.signed {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		color: #fff;
		background-position: top center;
		background-color: #000;
		overflow: auto;
		height: calc(100vh - 50px);
		padding-bottom: 98px;

		&::-webkit-scrollbar {
			display: none;
		}

		.container {
			padding-top: 30px;

			.hk-card {
				background-position: top center;
				background-size: cover;
				box-shadow: 5px 5px 10px rgba(0, 0, 0, .5);
				color: #fff;
				cursor: pointer;

				.card-header {
					background-color: rgba(0, 0, 0, .5);
					text-align: center;
					text-transform: uppercase;
				}
				.card-body {
					padding: 0;
					text-align: center;
					font-family: 'Fredericka the Great', cursive;
					font-size: 40px;
					text-transform: uppercase;
					text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
				}
				.card-footer {
					padding: 0;

					.date {
						display: block;
						padding: 5px;
						width: 100%;
						text-align: center;
						background-color: rgba(0, 0, 0, .5);
					}
				}

				&:hover {
					color: #fff;
				}
			}

			.first {
				h2 {
					color: #fff;
					font-size: 30px !important;
					text-align: center;
				}
			}

			.q-item {
				background-color: rgba(0, 0, 0, .5);
				margin-bottom: 1px;
			}

			.logo {
				width: 100%;
				max-width: 300px;
				margin-bottom: 20px;
			}

			h2 {
				font-family: 'Fredericka the Great', cursive;
				margin-bottom: 10px;
			}
			h4 {
				font-size: 18px;
			}

			.share {
				position: fixed;
				bottom: 0;
				left: 0;
				width: 100%;
				padding: 20px 20px 20px 20px;
			}
			@media only screen and (max-width: 576px) {
				.hk-card {
					.card-body {
						font-size: 25px;
					}
				}
				.q-item {
					padding: 18px 20px;
					font-size: 16px;
				}
			}
		}
	}
</style>