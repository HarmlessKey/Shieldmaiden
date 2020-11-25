<template>
	<div>
		<div v-if="overencumbered" class='content' style="display: block;">
			<OverEncumbered/>
		</div>
		<div class="content" v-else>
			<div class="info mb-3">
				<Crumble />

				<router-link to="/campaigns"><i class="fas fa-arrow-left"></i> Back</router-link>

				<h2 class="mt-3">Edit your campaign</h2>

				<q-input 
					dark filled square dense
					label="name"
					autocomplete="off"
					v-validate="'required'" 
					data-vv-as="Encounter Name" 
					type="text" 
					name="name" 
					v-model="campaign.campaign"
				/>
				<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

				<q-select 
					dark filled square dense
					label="Advancement"
					emit-value
					map-options
					class="my-2" 
					v-model="campaign.advancement" 
					:options="advancement_options" 
				/>

				<div class="background">
					<div 
						class="img pointer" 
						v-if="campaign.background" 
						:style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }"
						@click="image = true"
					>
					</div>
					<div class="img" v-else>
						<q-icon name="fas fa-image"/>
					</div>
					<div>
						<q-input 
							dark filled square
							autocomplete="off" 
							v-validate="'url'" type="text" 
							name="backbround" 
							data-vv-as="Background"
							v-model="campaign.background" 
							placeholder="Background URL"/>
						<p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>
					</div>
				</div>

				<div class="mt-3 gray-hover pointer" @click="setPrivate(!campaign.private)">
					<span :class="{ 'green': !campaign.private }">
						<i class="fas fa-eye"></i>
						Public
					</span>
					/
					<span :class="{ 'red': campaign.private }">
						<i class="fas fa-eye-slash"></i>
						Private
					</span>
				</div>

				<button class="btn mt-3" @click="edit()">Save</button>
			</div>
			
			<h2>Add players</h2>
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-6">
					<hk-card header="All Players">
						<ul class="entities hasImg" v-if="players && campaign">
							<li v-for="(player, key) in players" :key="key">
								<span v-if="player.avatar" class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></span>
								<span v-else class="img"><img src="@/assets/_img/styles/player.svg" /></span>

								{{ player.character_name }}
							
								<span v-if="inOtherCampaign(key)">
									<span class="d-none d-md-inline ml-1 gray-hover"><small>Different Campaign</small></span>
									<i class="ml-3 far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</span>

								<span v-else-if="checkPlayer(key) >= 0">
									<i class="fas fa-check"></i>
									<span class="d-none d-md-inline ml-1 gray-hover"><small>Added</small></span>
								</span>

								<div v-else class="actions bg-gray">
									<a class="gray-hover"
									@click="addPlayer(key)">
										<i class="fas fa-plus"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Add character
										</q-tooltip>
									</a>
								</div>
								
							</li>
						</ul>
						<div v-else class="loader"><span>Loading Players...</span></div>
					</hk-card>
				</div>

				<div class="col-12 col-md-6">
					<hk-card header="Players in Campaign">
						<template v-if="players && campaign">
							<ul class="entities hasImg" v-if="campaign.players">
								<li v-for="(player, key) in campaign.players" :key="key">		
									<span v-if="players[key].avatar" class="img" :style="{ backgroundImage: 'url(\''+ players[key].avatar + '\')' }"></span>
									<span v-else class="img"><img src="@/assets/_img/styles/player.svg" /></span>

									<div :class="{ 'red': inOtherCampaign(key) }">
										{{ players[key].character_name }}
										<span v-if="inOtherCampaign(key)" class="d-none d-md-inline ml-1 gray-hover">
											<small>Different Campaign</small>
										</span>
									</div>
									
									<div class="actions">
										<a class="gray-hover" @click="removePlayer(key)">
											<i class="fas fa-minus"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Remove character
											</q-tooltip>
										</a>
									</div>
									<i class="ml-3 far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</li>
							</ul>
						</template>
						<div v-else class="loader"><span>Loading Players...</span></div>
					</hk-card>
				</div>
			</div>
		</div>

		<q-dialog v-model="image">
			<img :src="campaign.background" />
		</q-dialog>
	</div>
</template>

<script>
	import Crumble from '@/components/crumble/MyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'EditCampaign',
		metaInfo: {
			title: 'Campaigns'
		},
		components: {
			Crumble,
			OverEncumbered,
		},
		data() {
			return {
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				newCampaign: '',
				image: false,
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
			this.fetchNpcs();
		},
		methods: {
			...mapActions([
				'fetchCampaign',
				'fetchNpcs',
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}`).update(
							this.campaign
						);
						this.$snotify.success('Name changed.', 'Critical hit!', {
							position: "rightTop"
						});
					}
				})
			},
			addPlayer(id) {
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
			border: solid 1px #b2b2b2;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
</style>