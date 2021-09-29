<template>
	<div>
		<!-- Continue Campaign -->
		<hk-card v-if="active_campaign" class="banner">
			<div 
				slot="image"
				class="card-image"
				:style="[
				active_campaign.background
				? { backgroundImage: 'url(\'' + active_campaign.background + '\')' }
				: { backgroundImage: `url(${require('@/assets/_img/campaign-background.jpg')})` }
			]"/>
			<div class="card-body">
				<div>
					<div class="neutral-4 mb-1">CONTINUE</div>
					<h3 class="neutral-1">
						<b>{{ active_campaign.campaign }}</b><br/>
					</h3>
					<p class="neutral-3">Dive right back into your adventure.</p>
				</div>

				<router-link :to="`/encounters/${active_campaign.key}`" class="btn btn-sm">
					Continue <span class="d-none d-md-inline">campaign</span>
				</router-link>
			</div>
		</hk-card>
		<router-link v-else to="/campaigns" class="first">
			<h2>Create a campaign</h2>
		</router-link>

		<hk-card-deck>
			<hk-card header="Dungeon Master">
				<div class="card-body">
					<q-list dark class="mb-4">
						<q-item 
							v-for="({path, icon, label, caption}, index) in dm_tabs" 
							clickable v-ripple 
							:to="path"
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
				</div>
			</hk-card>
		
			<hk-card header="Player">
				<div class="card-body">
					<q-list dark>
						<q-item 
							v-for="({path, icon, label, caption}, index) in player_tabs" 
							clickable v-ripple 
							:to="path"
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
				</div>
			</hk-card>
		</hk-card-deck>


		<!-- PATREON -->
		<!-- <div class="mt-4">
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
		</div> -->
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
						path: "/content/campaigns",
						label: "Campaigns",
						icon: "fas fa-dungeon",
						caption: "Campaigns you're running"
					},
					{
						path: "/content/players",
						label: "Players",
						icon: "fas fa-users",
						caption: "Players in your campaign"
					},
					{
						path: "/content/npcs",
						label: "NPC's",
						icon: "fas fa-dragon",
						caption: "Your custom NPC's"
					},
					{
						path: "/content/reminders",
						label: "Reminders",
						icon: "fas fa-stopwatch",
						caption: "Your custom reminders"
					},
					{
						path: "/content/items",
						label: "Items",
						icon: "fas fa-staff",
						caption: "Your custom items"
					}
				],
				player_tabs: [
					{
						path: "/content/characters",
						label: "Characters",
						icon: "fas fa-helmet-battle",
						caption: "Characters you play"
					},
					{
						path: "/followed",
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
	.banner {
		.image {
			height: 100px;
			width: 100px;
			background-size: spread;
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
</style>