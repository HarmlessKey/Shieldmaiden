<template>
	<div
		class="dm-screen"
		:style="[
			background_image ? { background: 'url(\'' + background_image + '\')' } : { background: '' },
		]"
	>
		<template v-if="!loading_campaign">
			<div class="dm-screen__header">
				{{ campaign.name }}
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
			<Splitpanes class="default-theme">
				<Pane>
					<Splitpanes horizontal>
						<hk-pane>
							<Encounters />
						</hk-pane>
						<hk-pane>
							<Media />
						</hk-pane>
					</Splitpanes>
				</Pane>
				<hk-pane>
					<Players
						:userId="user.uid"
						:campaignId="campaignId"
						:campaign="campaign"
						:players="players"
					/>
				</hk-pane>
				<Pane>
					<Splitpanes horizontal>
						<hk-pane>
							<Resources />
						</hk-pane>
						<hk-pane>
							<Share />
						</hk-pane>
					</Splitpanes>
				</Pane>
			</Splitpanes>
		</template>
		<hk-loader v-else name="campaign" />
	</div>
</template>

<script>
import Encounters from "../Encounters";
import Players from "src/components/campaign/Players.vue";
import Media from "src/components/campaign/Media.vue";
import Share from "src/components/campaign/Share.vue";
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
			loading_campaign: true,
			campaign: {},
			players: {},
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

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
		padding: 10px;
		background-color: $neutral-8-transparent;
		margin-bottom: 5px;
	}

	.splitpanes__pane {
		&::v-deep {
			.pane {
				&__header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					background-color: $neutral-8;
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
