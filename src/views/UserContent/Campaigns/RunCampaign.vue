<template>
	<div class="dm-screen">
		<template v-if="!loading_campaign">
			<div class="dm-screen__header">
				{{ campaign.name }}
				<div
					@click="
						setSlide({
							show: true,
							type: 'slides/Broadcast',
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
					<Encounters />
				</Pane>
				<Pane>
					<Players
						v-if="!loading_campaign"
						:userId="user.uid"
						:campaignId="campaignId"
						:campaign="campaign"
						:players="players"
					/>
				</Pane>
			</Splitpanes>
		</template>
		<hk-loader v-else name="campaign" />
	</div>
</template>

<script>
import Players from "src/components/campaign/Players.vue";
import Encounters from "../Encounters";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "RunCampaign",
	components: {
		Players,
		Encounters,
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
	},
	methods: {
		...mapActions(["setSlide"]),
		...mapActions("campaigns", ["get_campaign", "set_active_campaign"]),
		...mapActions("players", ["get_player"]),
	},
};
</script>

<style lang="scss" scoped>
.dm-screen {
	height: calc(100vh - 115px);
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
}
</style>
