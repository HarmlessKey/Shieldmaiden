<template>
	<div class="content">
		<Crumble />

		<h1 v-if="campaign" class="mb-3 d-flex justify-content-between">
			{{ campaign.campaign }}
			<span 
				@click="setSlide({show: true, type: 'slides/Broadcast', data: { campaign_id: campaignId } })" 
				class="live" 
				:class="{'active': broadcast.live === campaignId }"
			>
					{{ broadcast.live === campaignId ? "" : "go" }} live
			</span>
		</h1>

		<OverEncumbered v-if="overencumbered" />

		<template v-else-if="tier">
			<div class="row q-col-gutter-md">
				<!-- SHOW ENCOUNTERS -->
				<div class="col-12 col-md-7">
					<hk-card>
						<div slot="header" class="card-header">
							<span>
								<span>
								<i class="fas fa-swords mr-1" />
								Encounters
								<span v-if="encounters">( 
									<span :class="{ 'green': true, 'red': Object.keys(encounters).length >= tier.benefits.encounters }">
										{{ Object.keys(encounters).length }}
									</span> / 
									<i v-if="tier.benefits.encounters == 'infinite'" class="far fa-infinity"></i>
									<template v-else>{{ tier.benefits.encounters }}</template>
								) </span>
							</span>
							</span>
							<a 
								v-if="Object.keys(encounters).length < tier.benefits.encounters || tier.benefits.encounters == 'infinite'" 
								@click="add = !add"
								class="btn btn-sm"
							>
								<i class="fas fa-plus green"></i>
								New encounter
							</a>
						</div>
				
						<div class="card-body">
							<OutOfSlots 
								v-if="tier && Object.keys(encounters).length >= tier.benefits.encounters"
								type='encounters'
							/>

							<div class="first-encounter" v-if="Object.keys(encounters).length === 0">
								<q-form @submit="addEncounter">
									<h2 class="mt-0">First encounter</h2>
										<q-input
											dark filled square
											label="Encounter title" 
											type="text" 
											autocomplete="off"
											v-model="newEncounter" 
											:rules="[ val => val && val.length > 0 || 'Enter a title']"
										/>
										
										<q-btn class="btn btn-lg bg-green btn-block mt-4 px-0 py-0" label="Create encounter" no-caps type="submit" />
								</q-form>
							</div>

							<!-- ACTIVE ENCOUNTERS -->
							<hk-table
								v-if="_active.length > 0"
								:items="_active"
								:columns="activeColumns"
							>
								<template slot="encounter" slot-scope="data">
									<router-link v-if="data.row.entities" :to="'/run-encounter/' + campaignId + '/' + data.row.key">
										{{ data.item }}
										<q-tooltip anchor="top middle" self="center middle">
											Run encounter
										</q-tooltip>
									</router-link>
									<template v-else>
										{{ data.item }}
									</template>
								</template>
								<template slot="entities" slot-scope="data">
									<router-link :to="'/encounters/' + campaignId + '/' + data.row.key">
										<span class="gray-light" v-if="data.row.entities">
											{{ Object.keys(data.row.entities).length }}
										</span>
										<template v-else><i class="fas fa-plus"></i> Add</template>
										<q-tooltip anchor="top middle" self="center middle">
											Edit
										</q-tooltip>
									</router-link>
								</template>

								<span slot="status" slot-scope="data" v-if="data.row.round > 0" class="red">In progress</span>
								<template slot="turn" slot-scope="data">{{ data.row.turn + 1 }}</template>

								<template slot="actions" slot-scope="data">
									<div class="actions">
										<router-link 
											v-if="data.row.entities" 
											class="btn btn-sm bg-neutral-5"
											:to="'/run-encounter/' + campaignId + '/' + data.row.key"
										>
											<i class="fas fa-play"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Run encounter
											</q-tooltip>
										</router-link>
										<a v-else class="disabled btn btn-sm bg-neutral-5">
											<i class="fas fa-play"></i>
										</a>
										<router-link class="mx-1 btn btn-sm bg-neutral-5" :to="'/encounters/' + campaignId + '/' + data.row.key">
											<i class="fas fa-pencil-alt"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Edit
											</q-tooltip>
										</router-link>
										<a class="btn btn-sm bg-neutral-5" @click="deleteEncounter($event, data.row.key,data.row.encounter)">
											<i class="fas fa-trash-alt"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Delete
											</q-tooltip>
										</a>
									</div>
								</template>
							</hk-table>
						</div>
					</hk-card>
					<hk-card  v-if="_finished != 0" header="Finished encounters">
						<div class="card-body">
							<!-- FINISHED ENCOUNTERS -->
							<hk-table
								:items="_finished"
								:columns="finishedColumns"
								:perPage="6"
								:currentPage="currentPage"
							>
								<template slot="encounter" slot-scope="data">
									<router-link class="gray-light" :to="'/run-encounter/' + campaignId + '/' + data.row.key">
										{{ data.item }}
										<q-tooltip anchor="top middle" self="center middle">
											Run encounter
										</q-tooltip>
									</router-link>
								</template>

								<template slot="actions" slot-scope="data">
									<div class="actions">
										<router-link class="btn btn-sm bg-neutral-5" :to="'/run-encounter/' + campaignId + '/' + data.row.key">
											<i class="fas fa-eye"></i>
											<q-tooltip anchor="top middle" self="center middle">
												View
											</q-tooltip>
										</router-link>
										<a class="btn btn-sm bg-neutral-5 ml-1" @click="reset(data.row.key, hard=false)">
											<i class="fas fa-trash-restore-alt"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Unfinish
											</q-tooltip>
										</a>
										<a class="btn btn-sm bg-neutral-5 mx-1" @click="reset(data.row.key)">
											<i class="fas fa-undo"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Reset
											</q-tooltip>
										</a>
										<a class="btn btn-sm bg-neutral-5" @click="deleteEncounter($event, data.row.key, data.row.encounter)">
											<i class="fas fa-trash-alt"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Delete
											</q-tooltip>
										</a>
									</div>
								</template>
							</hk-table>
					
							<div v-if="encounters === undefined" class="loader"><span>Loading encounters...</span></div>
						</div>
					</hk-card>
				</div>

				<!-- PLAYERS -->
				<div class="col-12 col-md-5">
					<Players :userId="user.uid" :campaignId="campaignId" />
				</div>
			</div>
		</template>

		<!-- New encounter dialog -->
		<q-dialog 
			v-if="add && (Object.keys(encounters).length < tier.benefits.encounters || tier.benefits.encounters == 'infinite')"
			v-model="add" 
			square
		>
			<div>
				<q-form @submit="addEncounter">
					<hk-card header="New encounter" class="mb-0">
						<div class="card-body">
							<q-input 
								dark filled square
								label="Encounter title"
								type="text" 
								autocomplete="off" 
								v-model="newEncounter"
								:rules="[ val => val && val.length > 0 || 'Enter a title']"
							/>

							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn v-close-popup class="mr-1" type="cancel">Cancel</q-btn>
								<q-btn color="primary" type="submit" label="Add encounter" />
							</div>
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import _ from "lodash";
	import OverEncumbered from "@/components/OverEncumbered.vue";
	import OutOfSlots from "@/components/OutOfSlots.vue";
	import Crumble from "@/components/crumble";
	import PlayerLink from "@/components/PlayerLink.vue";
	import Players from "@/components/campaign/Players.vue";

	import { mapGetters, mapActions } from "vuex";
	import { db } from "@/firebase";

	export default {
		name: "Encounters",
		metaInfo: {
			title: "Encounters"
		},
		components: {
			Crumble,
			PlayerLink,
			OverEncumbered,
			OutOfSlots,
			Players
		},
		data() {
			return {
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				newEncounter: "",
				copy: window.location.host + "/track-encounter/" + this.$store.getters.user.uid,
				add: false,
				currentPage: 1,
				collapsed: false,
				activeColumns: {
					encounter: {
						label: "Encounter",
						maxContent: true,
						sortable: true
					},
					entities: {
						label: "Entities",
						center: true
					},
					status: {
						label: "Status",
						truncate: true,
						hide: "sm"
					},
					round: {
						label: "Round",
						center: true,
						truncate: true,
						hide: "md"
					},
					turn: {
						label: "Turn",
						center: true,
						truncate: true,
						hide: "md"
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true
					}
				},
				finishedColumns: {
					encounter: {
						label: "Encounter",
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						maxContent: true,
						right: true
					}
				}
			}
		},
		mounted() {
			this.fetchEncounters({
				cid: this.campaignId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
			}),
			this.setCurHp();
			this.removeGhostPlayers();
			this.setActiveCampaign({ 
				campaign_id: this.campaignId 
			});
		},
		computed: {
			...mapGetters([
				"tier",
				"encounters",
				"overencumbered",
				"content_count",
				"campaign",
				"players",
				"playerInCampaign",
				"side_collapsed",
				"broadcast"
			]),
			_active: function() {
				return _.chain(this.encounters)
				.filter(function(encounter, key) {
					encounter.key = key
					return encounter.finished == false;
				})
				.orderBy(function(encounter){
					if (encounter.order == undefined) {
						encounter.order = 0
					}
					return parseInt(encounter.timestamp)
				} , 'asc')
				.value()
			},
			_finished: function() {
				return _.chain(this.encounters)
				.filter(function(encounter, key) {
					encounter.key = key
					return encounter.finished == true;
				})
				.orderBy(function(encounter){
					return parseInt(encounter.timestamp)
				} , 'asc')
				.value()
			},
			noCurHp() {
				//Checks if all players have their curHp set
				//If not, it is set on mounted
				let check = false;
				if(this.campaign) {
					for(var key in this.campaign.players) {
						if(this.campaign.players[key].curHp == undefined) {
							check = true;
						}
					}
				}
				return check;
			}
		},
		watch: {
			campaign() {
				this.checkAdvancement();
			}
		},
		methods: {
			...mapActions([
				'fetchEncounters',
				'fetchCampaign',
				'setActiveCampaign',
				"setSlide"
			]),
			addEncounter() {
				if ((Object.keys(this.encounters).length < this.tier.benefits.encounters || this.tier.benefits.encounters == 'infinite')) {
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId).push({
						encounter: this.newEncounter, 
						round: 0, 
						turn: 0, 
						finished: false,
						timestamp: Date.now()
					});
					this.newEncounter = '';
					this.$snotify.success('Encounter added.', 'Critical hit!', {
						position: "rightTop"
					});
					this.$validator.reset();
					this.add = false;
				}
			},
			deleteEncounter(e, key, encounter) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					db.ref('encounters/' + this.user.uid + '/' + this.campaignId).child(key).remove();
				} else {
					this.$snotify.error('Are you sure you want to delete "' + encounter + '"?', 'Delete encounter', {
						timeout: 5000,
						buttons: [
						{
							text: 'Yes', action: (toast) => { 
								db.ref('encounters/' + this.user.uid + '/' + this.campaignId).child(key).remove();
								this.$snotify.remove(toast.id); 
							}, bold: false 
						},
						{
							text: 'No', action: (toast) => { 
								this.$snotify.remove(toast.id); 
							}, 
							bold: false },
						]
					});
				}
			},
			reset(id, hard=true) {
				if (hard){
					for(let key in this.encounters[id].entities) {
						let entity = this.encounters[id].entities[key]

						//Remove values
						delete entity.tempHp
						delete entity.transformed
						delete entity.stabilized
						delete entity.down
						delete entity.ac_bonus
						delete entity.meters
						delete entity.hidden

						if(entity.entityType == 'npc') {
							entity.curHp = entity.maxHp
						}
						entity.initiative = 0;


						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/entities/${key}`).set(entity);

						//CLEAR LOG
						localStorage.removeItem(id);
					}
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/xp_awarded`).remove();
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/currency_awarded`).remove();
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/turn`).set(0);
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/round`).set(0);
				}

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/finished`).set(false);

			},
			setCurHp() {
				if(this.noCurHp) {
					//Stores player with curHp under campaign
					for(var key in this.campaign.players) {
						if(this.campaign.players[key].curHp === undefined) {
							db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).update({
								curHp: this.players[key].maxHp
							});
						}
					}
					this.noCurHp = false;
				}
			},
			checkAdvancement() {
				if(!this.campaign.advancement) {
					this.$snotify.warning('Are you using Experience or Milestone as advancment for this campaign?' ,'Set advancement', {
						timeout: 0,
						buttons: [
						{
							text: 'Experience', action: (toast) => { 
								db.ref(`campaigns/${this.user.uid}/${this.campaignId}/advancement`).set('experience'); 
								this.$snotify.remove(toast.id); 
							}, bold: false 
						},
						{
							text: 'Milestone', action: (toast) => { 
								db.ref(`campaigns/${this.user.uid}/${this.campaignId}/advancement`).set('milestone');
								this.$snotify.remove(toast.id); 
							}, 
							bold: false },
						]
					});
				}
			},
			removeGhostPlayers() {
				const players = Object.keys(this.players);
				for(let key in this.campaign.players) {
					if(!players.includes(key)) {
						// eslint-disable-next-line
						console.error('Ghost Player Removed: ', key);
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).remove();
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;
	
	.first-encounter {
		h2 {
			margin-top: 50px;
			text-transform: none;
			text-align: center;
			font-size: 30px;
		}
	}
	.loader {
		margin-top: 20px;
	}
	.live {
		cursor: pointer;
	}
	.copy {
		word-wrap: break-word;
	}
	.broadcast {
		cursor: pointer;
		margin: 20px 0;
		padding: 20px;

		&.bg-green {
			color:$neutral-1;
			animation: blink normal 3s infinite ease-in-out;
		}
		h3 {
			margin-bottom: 5px;
		}
	}
}

.actions {
	a.disabled {
		color: #494747 !important;
		cursor: default !important;
		&:hover {
			background-color: transparent;
		}
	}
}

</style>