<template>
	<div>
		<!-- PLAYERS -->
		<hk-card no-margin :min-width="320">
			<div slot="header" class="card-header">
				Players
				<a @click="players_dialog = true" class="btn btn-sm">
					<i class="fas fa-plus green mr-1" /> Add players
				</a>
			</div>
			<div class="card-body">
				<template v-if="players && campaign">
					<ul class="entities hasImg" v-if="campaign.players">
						<li v-for="(player, key) in campaign.players" :key="key">	
							<span class="img" :style="{ backgroundImage: 'url(\''+ players[key].avatar + '\')' }">
								<i v-if="!players[key].avatar" class="hki-player" />
							</span>

							<div :class="{ 'red': inOtherCampaign(key) }">
								{{ players[key].character_name }}
								<span v-if="inOtherCampaign(key)" class="d-none d-md-inline ml-1 neutral-2">
									<small>Different Campaign</small>
								</span>
							</div>
							
							<div class="actions">
								<a class="neutral-2" @click="removePlayer(key)">
									<i class="fas fa-trash-alt"></i>
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
					
				</template>
				<hk-loader v-else name="players" />

			</div>
			<div slot="footer" class="card-footer">
				<q-btn label="Close" v-close-popup />
			</div>
		</hk-card>

		<q-dialog v-model="players_dialog">
			<hk-card header="All Players" :min-width="300">
				<div slot="header" class="card-header">
					Add players
					<q-btn icon="close" flat dense v-close-popup />
				</div>

				<div class="card-body">
					<ul class="entities hasImg" v-if="players && campaign">
						<li v-for="(player, key) in players" :key="key">
							<span class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }">
								<i v-if="!player.avatar" class="hki-player" />
							</span>

							{{ player.character_name }}
						
							<span v-if="inOtherCampaign(key)">
								<span class="d-none d-md-inline ml-1 neutral-3 pr-2"><small>Different Campaign</small></span>
							</span>

							<span v-else-if="checkPlayer(key) >= 0">
								<i class="fas fa-check pr-2 neutral-2"></i>
							</span>

							<div v-else class="actions">
								<a @click="addPlayer(key)">
									<i class="fas fa-plus green"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Add character
									</q-tooltip>
								</a>
							</div>
						</li>
					</ul>
					<div v-else class="loader"><span>Loading Players...</span></div>
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import { db } from "@/firebase";

	export default {
		name: "AddPlayers",
		props: ["campaignId"],
		data() {
			return {
				user: this.$store.getters.user,
				newCampaign: '',
				image: false,
				players_dialog: false,
				advancement_options: [
					{
						value: "experience",
						label: "Experience"
					},
					{
						value: "milestone",
						label: "Milestone"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'campaign',
				'players',
				'npcs',
				'playerInCampaign',
				'allEncounters',
				'overencumbered'
			]),

		},
		mounted() {
			this.fetchCampaign({
				cid: this.campaignId, 
			});
		},
		methods: {
			...mapActions([
				'fetchCampaign'
			]),
			addPlayer(id) {
				// Make sure the player has XP if advancement is experience
				if(this.campaign.advancement === "experience" && this.players[id].experience === undefined) {
					db.ref(`players/${this.user.uid}/${id}/experience`).set(0);
				}

				// Set the current HP
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players`).child(id).set({
					curHp: this.players[id].maxHp
				});
				db.ref(`players/${this.user.uid}/${id}`).update({campaign_id: this.campaignId});
				if (this.players[id].companions !== undefined) {
					for (let key in this.players[id].companions) {
						
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/companions`).child(key).set({
							curHp: this.npcs[key].maxHp,
						})
					}
				}
			},
			removePlayer(playerId) {
				// Get companions of player
				let companions = this.players[playerId].companions;

				//First remove player from all encounters
				for(let encounterId in this.allEncounters[this.campaignId]) {
					//Remove player from encouner
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${encounterId}/entities`).child(playerId).remove();
					if (companions !== undefined) {					
						for (let companionId of Object.keys(companions)) {
							db.ref(`encounters/${this.user.uid}/${this.campaignId}/${encounterId}/entities`).child(companionId).remove();
						}
					}
				}

				//Then remove from campaign
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players`).child(playerId).remove();
				if (companions !== undefined) {
					for (let companionId of Object.keys(companions)) {
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/companions`).child(companionId).remove();
					}
				}
				if (this.players[playerId].campaign_id == this.campaignId) {
					db.ref(`players/${this.user.uid}/${playerId}/campaign_id`).remove();
				}
			},
			checkPlayer(playerId) {
				if (this.campaign.players === undefined)
					return -1

				return (Object.keys(this.campaign.players).indexOf(playerId));
			},
			inOtherCampaign(playerId) {
				if (this.campaigns[this.players[playerId].campaign_id] === undefined) {
					this.players[playerId].campaign_id = undefined;
				}
				return (this.players[playerId].campaign_id !== undefined && this.players[playerId].campaign_id !== this.campaignId)
			},
			setPrivate(value) {
				//Has to be removed on false
				if(value === false) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/private`).remove();
				} else {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/private`).set(value);
				}
			}
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