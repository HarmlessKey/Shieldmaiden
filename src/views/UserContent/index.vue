<template>
	<div>
		<!-- Continue Campaign -->
		<hk-card class="banner">
			<div 
				slot="image"
				class="card-image"
				:class="{ 'no-campaign': !active_campaign }"
				:style="[
					active_campaign && active_campaign.background
					? { backgroundImage: 'url(\'' + active_campaign.background + '\')' }
					: { backgroundImage: `url(${require('@/assets/_img/atmosphere/campaign-background.webp')})` }
			]">
				<h2 v-if="!active_campaign">No campaigns yet</h2>
				<a 
					v-if="!active_campaign || !active_campaign.background" 
					class="white text-shadow-3 link" 
					target="_blank" rel="noopener"
					href="https://www.vecteezy.com/free-vector/fantasy-landscape">
					Image by Vecteezy
				</a>
			</div>
			<!-- Active campaign -->
			<div class="card-body" v-if="active_campaign">
				<div>
					<div class="neutral-4 mb-1">Continue</div>
					<h3 class="neutral-1">
						<b>{{ active_campaign.campaign }}</b><br/>
					</h3>
					<p class="neutral-3">Dive right back into your adventure.</p>
				</div>

				<router-link :to="`/encounters/${active_campaign.key}`" class="btn btn-sm">
					Continue <span class="d-none d-md-inline">campaign</span>
				</router-link>
			</div>
			<!-- No acive campaign -->
			<div v-else class="card-body">
				<div>
					<div class="neutral-4 mb-1">Campaigns</div>
					<h3 class="neutral-1">
						<b>No campaigns</b><br/>
					</h3>
					<p class="neutral-3">Start your first adventure.</p>
				</div>

				<router-link to="campaigns" class="btn btn-sm bg-green">
					Create <span class="d-none d-md-inline">campaign</span>
				</router-link>
			</div>
		</hk-card>

		<hk-card-deck>
			<hk-card header="Dungeon Master">
				<div class="card-body">
					<q-list :dark="$store.getters.theme === 'dark'" class="mb-4">
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
					<q-list :dark="$store.getters.theme === 'dark'">
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
			]),
			...mapGetters("campaigns", ["campaigns"]),
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
	.hk-card {
		.card-image.no-campaign {
			filter: grayscale(100%);
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
		border-top: solid 1px $neutral-4;
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