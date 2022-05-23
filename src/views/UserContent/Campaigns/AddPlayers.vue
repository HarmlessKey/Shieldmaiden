<template>
	<div>
		<!-- PLAYERS -->
		<hk-card no-margin :min-width="320">
			<div slot="header" class="card-header">
				Players
				<a @click="players_dialog = true" class="btn btn-sm">
					<i aria-hidden="true" class="fas fa-plus green mr-1" /> Add players
				</a>
			</div>
			<div class="card-body">
				<ul class="entities hasImg" v-if="campaign_players.length">
					<li v-for="player in campaign_players" :key="player.key">	
						<span class="img" :style="{ backgroundImage: 'url(\''+ player.avatar + '\')' }">
							<i aria-hidden="true" v-if="!player.avatar" class="hki-player" />
						</span>

						<div :class="{ 'red': inOtherCampaign(player.campaign_id) }">
							{{ player.character_name }}
							<span v-if="inOtherCampaign(player.campaign_id)" class="d-none d-md-inline ml-1 neutral-2">
								<small>Different Campaign</small>
							</span>
						</div>
						
						<div class="actions items-center pr-0">
							<a class="btn btn-sm bg-neutral-5" @click="removePlayer(player)">
								<i aria-hidden="true" class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center right">
									Remove from campaign
								</q-tooltip>
							</a>
						</div>
					</li>
				</ul>
				<div v-else>
					<p>
						There are no players in this campaign yet.
					</p>
					<a @click="players_dialog = true" class="btn btn-block">Add players</a>
				</div>
			</div>
			<div slot="footer" class="card-footer">
				<q-btn label="Close" no-caps v-close-popup />
			</div>
		</hk-card>

		<q-dialog v-model="players_dialog">
			<hk-card header="All Players" :min-width="300">
				<div slot="header" class="card-header">
					Add players
					<q-btn icon="close" no-caps flat dense v-close-popup />
				</div>

				<div class="card-body">
					<ul class="entities hasImg">
						<li v-for="player in players" :key="player.key">
							<span class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }">
								<i aria-hidden="true" v-if="!player.avatar" class="hki-player" />
							</span>

							{{ player.character_name }}
						
							<span v-if="inOtherCampaign(player.campaign_id)">
								<span class="d-none d-md-inline ml-1 neutral-3 pr-2"><small>Different Campaign</small></span>
							</span>

							<span v-else-if="checkPlayer(player.campaign_id)">
								<i aria-hidden="true" class="fas fa-check pr-2 neutral-2"></i>
							</span>

							<div v-else class="actions items-center pr-0">
								<a @click="addPlayer(player.key)" class="btn btn-sm bg-neutral-5">
									<i aria-hidden="true" class="fas fa-plus green"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Add character
									</q-tooltip>
								</a>
							</div>
						</li>
					</ul>
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "AddPlayers",
		props: {
			campaign: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				user: this.$store.getters.user,
				image: false,
				players_dialog: false,
			}
		},
		computed: {
			...mapGetters("players", ["players"]),
			campaign_players() {
				return this.players.filter(player => {
					return player.campaign_id === this.campaign.key;
				});
			}
		},
		async mounted() {
			await this.get_players();

			// Check if the campaign_player count matches the player_count of the campaign
			// update if it doesn't match
			if(this.campaign_players.length !== this.campaign.player_count) {
				this.update_player_count({ id: this.campaign.key, new_count: this.campaign_players.length });
			}
		},
		methods: {
			...mapActions("campaigns", [
				"campaigns", 
				"get_campaign", 
				"add_player", 
				"delete_player", 
				"update_player_count"
			]),
			...mapActions("players", ["get_players"]),
			addPlayer(id) {
				// Set the current HP
				this.add_player({
					playerId: id,
					campaign: this.campaign
				});
			},
			async removePlayer(player) {
				await this.delete_player({
					id: this.campaign.key,
					player
				});
			},
			checkPlayer(campaign_id) {
				return (campaign_id === this.campaign.key);
			},
			inOtherCampaign(campaign_id) {
				return (campaign_id && campaign_id !== this.campaign.key)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.background {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;
		font-size: 35px;
		text-align: center;

		.img {
			border: solid 1px $neutral-3;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
</style>