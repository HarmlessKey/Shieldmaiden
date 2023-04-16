<template>
	<div v-if="!loading">
		<h2 class="d-flex justify-content-between items-center">
			Damage meters
			<button class="btn bg-red mb-2">
				Reset all
				<i class="fas fa-undo ml-1" aria-hidden="true" />
			</button>
		</h2>
		<q-tabs v-model="current_tab" outside-arrows>
			<q-tab v-for="tab in tabs" :key="tab" :name="tab" :label="tab" />
		</q-tabs>
		<q-tab-panels v-model="current_tab" class="bg-transparent">
			<q-tab-panel v-for="tab in tabs" :key="`panel-${tab}`" :name="tab">
				<template v-for="type in types">
					<h3 :key="`header-${type}`">
						<i
							class="mr-1 fas"
							:class="type === 'damage' ? 'fa-swords' : 'fa-heart'"
							aria-hidden="true"
						/>
						{{ type.capitalize() }} {{ tab.toLowerCase() }}
					</h3>
					<ul class="meters" :key="`list-${type}`">
						<li
							v-for="(player, i) in meters(`${type}${tab === 'Taken' ? tab : ''}`)"
							class="meters__player"
							:key="`li-${type}-${i}`"
						>
							<div
								class="meters__player-avatar"
								:style="{
									backgroundImage: player.avatar ? 'url(\'' + player.avatar + '\')' : '',
								}"
							>
								<i v-if="!player.avatar" class="hki-player" aria-hidden="true" />
							</div>
							<div class="meters__player-name">{{ player.name }}</div>
							<div class="meters__player-value">{{ player.value }}</div>
						</li>
					</ul>
				</template>
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import _ from "lodash";

export default {
	name: "EditDamageMeters",
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			loading: true,
			campaign: {},
			players: {},
			current_tab: "Done",
			tabs: ["Done", "Taken"],
			types: ["damage", "healing"],
		};
	},
	computed: {},
	async mounted() {
		this.campaign = await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		});
		for (const id in this.campaign.players) {
			this.players[id] = await this.get_player({ uid: this.user.uid, id });
		}
		this.loading = false;
	},
	methods: {
		...mapActions("campaigns", ["get_campaign", "update_campaign_entity"]),
		...mapActions("players", ["get_player"]),
		meters(type) {
			const players = this.campaign.players
				? Object.entries(this.campaign.players).map(([key, player]) => ({
						avatar: this.players[key].storage_avatar || this.players[key].avatar,
						name: this.players[key].character_name,
						value: player.meters ? player.meters[type] || 0 : 0,
				  }))
				: [];
			return _.orderBy(players, ["value", "name"], ["desc", "asc"]);
		},
	},
	resetAll() {},
};
</script>

<style lang="scss" scoped>
.meters {
	list-style: none;
	padding: 0;

	&__player {
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 5px;
		background-color: $neutral-9;
		margin-bottom: 1px;
		padding-right: 5px;

		&-avatar {
			height: 35px;
			width: 35px;
			background-size: cover;
			background-position: center top;
			border: solid 1px $neutral-4;
		}
		&-name {
			flex-grow: 1;
		}
		&-value {
			text-align: right;
		}
	}
}
</style>
