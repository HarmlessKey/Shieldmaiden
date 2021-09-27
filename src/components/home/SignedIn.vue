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

			<hk-card-deck>
				<hk-card header="Dungeon Master">
					<q-list dark class="mb-4">
						<q-item 
							v-for="({name, icon, label, caption}, index) in dm_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`dm-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" class="neutral-2" />
							</q-item-section>
							<q-item-section>
								<q-item-label>{{ label }}</q-item-label>
								<q-item-label caption>{{ caption }}</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-icon name="fas fa-chevron-right" />
							</q-item-section>
						</q-item>
					</q-list>
				</hk-card>
				
				<hk-card header="Player">
					<q-list dark>
						<q-item 
							v-for="({name, icon, label, caption}, index) in player_tabs" 
							clickable v-ripple 
							:to="`/${name}`"
							:key="`player-${index}`"
						>
							<q-item-section avatar>
								<q-icon :name="icon" class="neutral-2" />
							</q-item-section>
							<q-item-section>
								<q-item-label>{{ label }}</q-item-label>
								<q-item-label caption>{{ caption }}</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-icon name="fas fa-chevron-right" />
							</q-item-section>
						</q-item>
					</q-list>
				</hk-card>
			</hk-card-deck>

			<!-- PATREON -->
			<div class="mt-4">
				<h4 
					v-if="tier && userInfo && userInfo.patron"
					class="text-center patreon-red"
				>
					<i class="patreon-red fas fa-heart"/> Thanks for your '{{ userInfo.patron.tier}}' support.
				</h4>
				<a v-else href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener" class="patreon-red text-center"><i class="fab fa-patreon"></i> Support us on Patreon</a>
			</div>

			<div class="share d-flex justify-content-center">
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
						icon: "fas fa-dungeon",
						caption: "Campaigns you're running"
					},
					{
						name: "players",
						label: "Players",
						icon: "fas fa-users",
						caption: "Players in your campaign"
					},
					{
						name: "npcs",
						label: "NPC's",
						icon: "fas fa-dragon",
						caption: "Your custom NPC's"
					},
					{
						name: "reminders",
						label: "Reminders",
						icon: "fas fa-stopwatch",
						caption: "Your custom reminders"
					},
					{
						name: "items",
						label: "Items",
						icon: "fas fa-staff",
						caption: "Your custom items"
					}
				],
				player_tabs: [
					{
						name: "characters",
						label: "Characters",
						icon: "fas fa-helmet-battle",
						caption: "Characters you play"
					},
					{
						name: "followed",
						label: "Following",
						icon: "fas fa-users",
						caption: "Other users you're following"
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
						if (campaign !== undefined)
							campaign.key = this.userInfo.active_campaign;

						return campaign;
					} else {
						const campaignKey = Object.keys(this.campaigns)[0];
						let campaign = this.campaigns[campaignKey];
						if (campaign !== undefined)
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
		padding-top: 30px;
		background-image: url('../../assets/_img/styles/paper-bg.png');
		background-position: top center;
		background-color: $neutral-11;
		overflow: auto;
		height: calc(100vh - 50px);
		padding-bottom: 98px;

		&::-webkit-scrollbar {
			display: none;
		}

		.container {

			.hk-card {
				background-position: center;
				background-size: cover;
				color: $white;

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
					color:$white;
				}
			}

			.first {
				h2 {
					font-size: 30px !important;
					text-align: center;
				}
			}

			.q-item {
				background-color: $neutral-8;
				margin-bottom: 1px;

				.q-item__label--caption {
					color: $neutral-4;
				}
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
				padding: 20px 10px 20px 10px;
				backdrop-filter: blur(2px);
				border-top: solid 1px$gray-hover;
				background-color: rgba(0, 0, 0, .5);

				.btn {
					max-width: 500px;
				}
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
					margin-bottom: 3px;
				}
			}
		}
	}
</style>