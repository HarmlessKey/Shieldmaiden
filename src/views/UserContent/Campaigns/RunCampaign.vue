<template>
	<div
		class="dm-screen"
		:class="{ small: container_width < sm }"
		:style="[
			background_image ? { background: 'url(\'' + background_image + '\')' } : { background: '' },
		]"
	>
		<template v-if="!loading_campaign">
			<div class="dm-screen__header">
				{{ campaign.name }} {{ container_width }}
				<div
					@click="
						setDrawer({
							show: true,
							type: 'drawers/Broadcast',
							data: { campaign_id: campaignId, private: campaign.private },
						})
					"
					class="live pointer"
					:class="{
						active: broadcast.live === campaignId,
						disabled: campaign.private,
					}"
				>
					{{ broadcast.live === campaignId ? "" : "go" }} live
					<q-tooltip v-if="campaign.private" anchor="center left" self="center right">
						Private campaign
					</q-tooltip>
				</div>
			</div>
			<Splitpanes v-if="container_width >= sm" class="default-theme">
				<Pane :size="paneSize('left')" min-size="20">
					<Splitpanes horizontal>
						<hk-pane :size="paneSize('left-top')">
							<Encounters />
						</hk-pane>
						<hk-pane :size="paneSize('left-bottom')">
							<Media v-if="container_width > md" />
							<Players
								v-else
								:userId="user.uid"
								:campaignId="campaignId"
								:campaign="campaign"
								:players="players"
							/>
						</hk-pane>
					</Splitpanes>
				</Pane>
				<hk-pane v-if="container_width > md" :size="paneSize('mid')" min-size="20">
					<Players
						:userId="user.uid"
						:campaignId="campaignId"
						:campaign="campaign"
						:players="players"
					/>
				</hk-pane>
				<Pane v-if="container_width > lg" :size="paneSize('right')" min-size="20">
					<Splitpanes horizontal>
						<hk-pane min-size="20">
							<Resources />
						</hk-pane>
						<hk-pane v-if="!campaign.private" size="60" min-size="20">
							<Share />
						</hk-pane>
					</Splitpanes>
				</Pane>
			</Splitpanes>

			<div v-else class="mobile">
				<hk-select
					v-model="mobile_tab"
					:options="mobile_tabs"
					:filled="false"
					borderless
					map-options
					emit-value
					class="px-2"
				/>
				<q-tab-panels v-model="mobile_tab" class="bg-transparent" animated swipeable infinite>
					<q-tab-panel name="encounters">
						<Encounters />
					</q-tab-panel>
					<q-tab-panel name="players">
						<Players
							:userId="user.uid"
							:campaignId="campaignId"
							:campaign="campaign"
							:players="players"
						/>
					</q-tab-panel>
					<q-tab-panel name="resources" class="p-0">
						<Resources />
					</q-tab-panel>
					<q-tab-panel name="share">
						<Share />
					</q-tab-panel>
					<q-tab-panel name="media" class="p-0">
						<Media />
					</q-tab-panel>
				</q-tab-panels>
			</div>
		</template>
		<hk-loader v-else name="campaign" />
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import Encounters from "../Encounters";
import Players from "src/components/campaign/Players.vue";
import Media from "src/components/campaign/Media.vue";
import Share from "src/components/campaign/share";
import Resources from "src/components/campaign/resources";

import { mapGetters, mapActions } from "vuex";

export default {
	name: "RunCampaign",
	components: {
		Encounters,
		Players,
		Media,
		Share,
		Resources,
	},
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			container_width: 0,
			loading_campaign: true,
			campaign: {},
			players: {},
			mobile_tab: "encounters",
			mobile_tabs: [
				{
					label: "Encounters",
					value: "encounters",
				},
				{
					label: "Players",
					value: "players",
				},
				{
					label: "Resources",
					value: "resources",
				},
				{
					label: "Share",
					value: "share",
				},
				{
					label: "Media",
					value: "media",
				},
			],
			sm: 576,
			md: 768,
			lg: 992,
			xl: 1200,
		};
	},
	async mounted() {
		await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		}).then(async (campaign) => {
			this.campaign = campaign;

			const campaignPlayers = {};
			for (const playerId in campaign.players) {
				const player = await this.get_player({ uid: this.user.uid, id: playerId });
				if (player) {
					campaignPlayers[playerId] = player;
				}
			}
			this.players = campaignPlayers;
			this.loading_campaign = false;
		});
		this.set_active_campaign(this.campaignId);
	},
	provide() {
		const provided_campaign = {};

		Object.defineProperty(provided_campaign, "campaign", {
			enumerable: true,
			get: () => this.campaign,
		});
		return {
			provided_campaign,
		};
	},
	computed: {
		...mapGetters(["broadcast"]),
		background_image() {
			return this.campaign.hk_background
				? require(`src/assets/_img/atmosphere/${this.campaign.hk_background}.jpg`)
				: this.campaign.background;
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("campaigns", ["get_campaign", "set_active_campaign"]),
		...mapActions("players", ["get_player"]),
		setSize(size) {
			this.container_width = size.width;
		},
		paneSize(pane) {
			switch (pane) {
				case "left":
					return this.container_width > this.md ? "30" : "50";
				case "mid":
					return this.container_width > this.md ? "40" : "50";
				case "right":
					return this.container_width > this.md ? "30" : "50";
				case "left-top":
					return this.container_width > this.md ? "70" : "50";
				case "left-top":
					return this.container_width > this.md ? "30" : "50";
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.dm-screen {
	display: flex;
	flex-direction: column;
	background-size: cover;
	background-position: center bottom;
	height: calc(100vh - 50px);
	padding: 5px;

	&.small {
		padding: 0;

		.dm-screen__header {
			margin: 0;
		}
		.mobile {
			background: $neutral-8-transparent;
			height: 100%;
		}
	}

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
		padding: 10px;
		background-color: $neutral-8-transparent;
		margin-bottom: 5px;
	}

	.splitpanes__pane,
	.q-tab-panel {
		padding: 0;
		&::v-deep {
			.pane {
				&__header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					background-color: $neutral-8;
					min-height: 51px;
					padding: 10px;
					position: sticky;
					top: 0;
					z-index: 10;
				}
				&__content {
					padding: 10px;
				}
			}
		}
	}
}
</style>
