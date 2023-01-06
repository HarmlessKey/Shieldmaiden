<template>
	<div>
		<user-banner />
		<Tutorial v-if="!content_count.campaigns" />
		<!-- Continue Campaign -->
		<hk-card v-else class="banner">
			<div 
				slot="image"
				class="card-image"
				:class="{ 'no-campaign': !active_campaign }"
				:style="{ backgroundImage: 'url(\'' + getBackground(active_campaign) + '\'' }"
			>
			</div>
			<!-- Active campaign -->
			<div class="card-body" v-if="active_campaign">
				<div>
					<div class="neutral-4 mb-1">Continue</div>
					<h3 class="neutral-1">
						<strong>{{ active_campaign.name }}</strong><br/>
					</h3>
					<p class="neutral-3">Dive right back into your adventure.</p>
				</div>

				<router-link :to="`/content/campaigns/${active_campaign.key}`" class="btn btn-sm">
					Continue <span class="d-none d-md-inline">campaign</span>
				</router-link>
			</div>
			<!-- No active campaign -->
			<div v-else class="card-body">
				<div>
					<div class="neutral-4 mb-1">Campaigns</div>
					<h3 class="neutral-1">
						<strong>No active campaign</strong><br/>
					</h3>
					<p class="neutral-3">Start your first adventure.</p>
				</div>

				<router-link to="campaigns" class="btn btn-sm bg-green">
					Campaign overview
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
							v-for="({path, icon, label, caption, badge}, index) in player_tabs" 
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
							<q-item-section avatar v-if="badge"><q-badge>{{ badge }}</q-badge></q-item-section>
							<q-item-section side>
								<q-icon name="fas fa-chevron-right" />
							</q-item-section>
						</q-item>
					</q-list>
				</div>
			</hk-card>
		</hk-card-deck>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { general } from "src/mixins/general.js";
	import UserBanner from 'src/components/userContent/UserBanner';
	import Tutorial from "src/components/userContent/Tutorial.vue";

	export default {
		name: "UserContent",
		mixins: [general],
  	components: { 
			UserBanner,
			Tutorial
		},
		data() {
			return {
				campaigns: {},
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
			}
		},
		async mounted() {
			this.campaigns = await this.get_campaigns();
		},
		computed: {
			...mapGetters([
				"user",
				"tier",
				"userInfo",
				"content_count"
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
			},
			player_tabs() {
				const tabs = [
					{
						path: "/content/characters",
						label: "Characters",
						icon: "fas fa-helmet-battle",
						caption: "Characters you play"
					},
					{
						path: "/content/followed",
						label: "Following",
						icon: "fas fa-users",
						caption: "Other users you're following"
					}
				];

				if(this.userInfo && ((this.userInfo.contribute && this.userInfo.contribute.includes('character-builder')) || this.userInfo.admin)) {
					tabs.push({
						path: "/content/character-builder",
						label: "Character builder",
						icon: "fad fa-helmet-battle",
						caption: "Test our character builder",
						badge: "Alpha"
					});
				}
				return tabs;
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("campaigns", ["get_campaigns"]),
			getBackground(campaign) {
				if(campaign && campaign.background) return campaign.background;
				if(campaign && campaign.hk_background) return require(`src/assets/_img/atmosphere/banner/${campaign.hk_background}-banner.jpg`);
				return require('src/assets/_img/atmosphere/banner/campaign-background-banner.jpg');
			}
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
		margin-bottom: 3px;
		border-radius: $border-radius;
		border: solid 1px $neutral-5;

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
		font-family: "Fredericka the Great", cursive;
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
		.q-item {
			padding: 18px 20px;
			font-size: 16px;
			margin-bottom: 3px;
		}
	}
</style>