<template>
	<div
		class="dm-screen"
		:class="{ small: container.width < sm }"
		:style="[
			background_image
				? { backgroundImage: 'url(\'' + background_image + '\')' }
				: { backgroundImage: '' },
		]"
	>
		<template v-if="!loading_campaign">
			<div class="dm-screen__header">
				<router-link to="/content/campaigns" class="btn btn-sm btn-clear">
					<hk-icon icon="fas fa-arrow-left" class="mr-1" />
					Leave
				</router-link>
				<div class="dm-screen__header-title written flex-grow truncate">
					{{ campaign.name }}
				</div>
				<div class="d-flex justify-content-end items-center gap-1">
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
					<template v-if="legacy_layout || (container.width < lg && container.width > sm)">
						<button
							class="btn btn-clear btn-sm"
							@click="
								setDrawer({
									show: true,
									type: 'campaign/share/index',
									data: { campaign: campaign },
									classes: 'p-0',
								})
							"
						>
							<hk-icon icon="fas fa-share-alt" />
						</button>
						<button
							class="btn btn-clear btn-sm"
							@click="
								setDrawer({
									show: true,
									type: 'campaign/soundBoard/index',
									classes: 'p-0',
								})
							"
						>
							<hk-icon icon="fas fa-music" />
						</button>
						<button
							class="btn btn-clear btn-sm"
							@click="
								setDrawer({
									show: true,
									type: 'campaign/resources/index',
									classes: 'p-0',
								})
							"
						>
							<hk-icon icon="fas fa-bars" />
						</button>
					</template>
				</div>
			</div>
			<template v-if="container.width >= sm">
				<Splitpanes v-if="legacy_layout" class="default-theme" :horizontal="container.width < md">
					<hk-pane min-size="30">
						<Encounters />
					</hk-pane>
					<hk-pane min-size="30">
						<Players
							:userId="user.uid"
							:campaignId="campaignId"
							:campaign="campaign"
							:players="players"
							:sync-characters="sync_characters"
							@add-player="open_player_dialog"
						/>
					</hk-pane>
				</Splitpanes>
				<Splitpanes v-else-if="container.width >= lg" class="default-theme">
					<Pane :size="paneSize('left')" min-size="20">
						<Splitpanes horizontal>
							<hk-pane>
								<SoundBoard />
							</hk-pane>
							<hk-pane v-if="!campaign.private" :size="100 - paneSize('left-top')" min-size="20">
								<Share :campaign="campaign" />
							</hk-pane>
						</Splitpanes>
					</Pane>
					<Pane :size="paneSize('mid')" min-size="20">
						<Splitpanes horizontal>
							<hk-pane :size="paneSize('mid-top')" min-size="20">
								<Encounters />
							</hk-pane>
							<hk-pane :size="100 - paneSize('mid-top')" min-size="20">
								<Players
									:userId="user.uid"
									:campaignId="campaignId"
									:campaign="campaign"
									:players="players"
									:sync-characters="sync_characters"
									@add-player="open_player_dialog"
								/>
							</hk-pane>
						</Splitpanes>
					</Pane>
					<hk-pane :size="paneSize('right')" min-size="20">
						<Resources />
					</hk-pane>
				</Splitpanes>
				<Splitpanes v-else class="default-theme" horizontal>
					<Pane size="60" min-size="20">
						<Splitpanes>
							<hk-pane size="50" min-size="20">
								<Encounters />
							</hk-pane>
							<hk-pane size="50" min-size="20" v-if="container.width >= md">
								<Players
									:userId="user.uid"
									:campaignId="campaignId"
									:campaign="campaign"
									:players="players"
									:sync-characters="sync_characters"
									@add-player="open_player_dialog"
								/>
							</hk-pane>
						</Splitpanes>
					</Pane>
					<hk-pane size="40" min-size="20" v-if="container.width < lg && container.height >= 780">
						<Players
							v-if="container.width < md"
							:userId="user.uid"
							:campaignId="campaignId"
							:campaign="campaign"
							:players="players"
							:sync-characters="sync_characters"
							@add-player="open_player_dialog"
						/>
						<Share v-else-if="!campaign.private" :campaign="campaign" />
					</hk-pane>
				</Splitpanes>
			</template>

			<div v-else class="mobile">
				<hk-select
					v-model="mobile_tab"
					:options="mobile_tabs"
					:filled="false"
					borderless
					map-options
					emit-value
					class="px-4 bg-neutral-9 tab-select"
				>
					<hk-icon slot="prepend" :icon="tab_icon" />
				</hk-select>
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
							:sync-characters="sync_characters"
							@add-player="open_player_dialog"
						/>
					</q-tab-panel>
					<q-tab-panel name="resources" class="p-0">
						<Resources />
					</q-tab-panel>
					<q-tab-panel name="share">
						<Share :campaign="campaign" />
					</q-tab-panel>
					<q-tab-panel name="media" class="p-0">
						<SoundBoard />
					</q-tab-panel>
				</q-tab-panels>
			</div>
		</template>
		<hk-loader v-else name="campaign" />
		<q-resize-observer @resize="setSize" />
		<!-- Edit campaign dialog -->
		<q-dialog v-if="!overencumbered" v-model="add_players_dialog">
			<AddPlayers :campaign="search_campaign" @campaign-players="updatePlayers" />
		</q-dialog>
	</div>
</template>

<script>
import Encounters from "../Encounters";
import Players from "src/components/campaign/Players.vue";
import SoundBoard from "src/components/campaign/soundBoard/index.vue";
import Share from "src/components/campaign/share";
import Resources from "src/components/campaign/resources";
import { getCharacterSyncStorage, extensionInstalled } from "src/utils/generalFunctions";
import AddPlayers from "src/components/campaign/AddPlayers";

import { mapGetters, mapActions } from "vuex";

export default {
	name: "RunCampaign",
	components: {
		Encounters,
		Players,
		SoundBoard,
		Share,
		Resources,
		AddPlayers,
	},
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			container: {
				width: 0,
				height: 0,
			},
			sync_characters: {},
			loading_campaign: true,
			campaign: {},
			players: {},
			search_campaign: {},
			add_players_dialog: false,
			mobile_tab: "encounters",
			mobile_tabs: [
				{
					label: "Encounters",
					value: "encounters",
					icon: "fas fa-swords",
				},
				{
					label: "Players",
					value: "players",
					icon: "fas fa-users",
				},
				{
					label: "Resources",
					value: "resources",
					icon: "fas fa-book",
				},
				{
					label: "Share",
					value: "share",
					icon: "fas fa-share-alt",
				},
				{
					label: "SoundBoard",
					value: "media",
					icon: "fas fa-image",
				},
			],
			sm: 576,
			md: 768,
			lg: 992,
			xl: 1200,
		};
	},
	async mounted() {
		this.sync_characters = await getCharacterSyncStorage();
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

			const properties = [
				"name",
				"background",
				"hk_background",
				"player_count",
				"advancement",
				"timestamp",
				"private",
			];

			this.search_campaign = { key: this.campaignId };
			for (const prop of properties) {
				if (this.campaign.hasOwnProperty(prop)) {
					this.search_campaign[prop] = this.campaign[prop];
				}
			}
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
		...mapGetters(["broadcast", "userSettings", "overencumbered"]),
		...mapGetters("players", { search_players: "players" }),
		filtered_search_players() {
			return this.search_players.filter((player) => {
				return player.campaign_id === this.campaignId;
			});
		},
		background_image() {
			return this.campaign.hk_background
				? require(`src/assets/_img/atmosphere/${this.campaign.hk_background}.jpg`)
				: this.campaign.background;
		},
		tab_icon() {
			return this.mobile_tabs.find((tab) => tab.value === this.mobile_tab).icon;
		},
		legacy_layout() {
			return this.userSettings?.general?.legacy_campaign_layout;
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("campaigns", ["get_campaign", "set_active_campaign"]),
		...mapActions("players", ["get_player"]),
		setSize(size) {
			this.container = size;
		},
		paneSize(pane) {
			switch (pane) {
				case "left":
					return 25;
				case "mid":
					return 45;
				case "right":
					return 30;
				case "left-top":
					return 60;
				case "mid-top":
					return 50;
			}
		},
		open_player_dialog() {
			this.add_players_dialog = true;
		},
		async updatePlayers(search_players) {
			const players = await Promise.all(
				search_players.map(async (p) => ({
					...(await this.get_player({ uid: this.user.uid, id: p.key })),
					key: p.key,
				}))
			);
			const campaignPlayers = players.reduce((a, p) => ({ ...a, [p.key]: p }), {});

			this.players = campaignPlayers;
		},
	},
	watch: {
		filtered_search_players(players) {
			this.updatePlayers(players);
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
	background-repeat: no-repeat;
	height: calc(100vh - 50px);
	padding: 5px;

	&.small {
		padding: 0;

		.dm-screen__header {
			margin: 0;
		}
		.mobile {
			background: $neutral-6-transparent;
			height: 100%;

			.tab-select {
				margin: 1px 0;
			}
			.q-tab-panels {
				height: 100%;
			}
		}
	}

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		height: 60px;
		padding: 10px;
		background-color: $neutral-8-transparent;
		margin-bottom: 5px;

		&-title {
			min-width: 0;
			font-size: 20px;
		}
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
