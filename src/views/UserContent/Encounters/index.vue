<template>
	<div>
		<h1 class="mb-3 d-flex justify-content-between">
			{{ campaign.name }}
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
					<template v-if="!loading_encounters">
						<hk-card>
							<div slot="header" class="card-header">
								<span>
									<span>
									<i class="fas fa-swords mr-1" />
									Encounters
									<span v-if="encounters">( 
										<span :class="{ 'green': true, 'red': encounter_count >= tier.benefits.encounters }">
											{{ encounter_count || 0 }}
										</span> / 
										<i v-if="tier.benefits.encounters == 'infinite'" class="far fa-infinity"></i>
										<template v-else>{{ tier.benefits.encounters }}</template>
									) </span>
								</span>
								</span>
								<a 
									v-if="encounter_count < tier.benefits.encounters || tier.benefits.encounters == 'infinite'" 
									@click="add = !add"
									class="btn btn-sm"
								>
									<i class="fas fa-plus green" />
									New encounter
								</a>
							</div>
					
							<div class="card-body">
								<OutOfSlots 
									v-if="tier && encounter_count >= tier.benefits.encounters"
									type='encounters'
								/>

								<div class="first-encounter" v-if="encounter_count === 0">
									<q-form @submit="addEncounter">
										<h2 class="mt-0">First encounter</h2>
											<q-input
												:dark="$store.getters.theme === 'dark'" filled square
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
								<template v-if="active_encounters">
									<q-input 
										:dark="$store.getters.theme !== 'light'" 
										v-model="search"
										borderless 
										filled square
										debounce="300" 
										clearable
										placeholder="Search encounter"
									>
										<q-icon slot="prepend" name="search" />
									</q-input>
									<q-table
										:data="active_encounters"
										:columns="columns"
										row-key="key"
										card-class="bg-none"
										flat
										:dark="$store.getters.theme !== 'light'"
										separator="none"
										:pagination="{ rowsPerPage: 15 }"
										:filter="search"
										wrap-cells
									>	
										<template v-slot:body-cell="props">
											<q-td v-if="props.col.name !== 'actions'">
												<div  class="truncate-cell">
													<div class="truncate">
														<router-link 
															v-if="props.col.name === 'name' && props.row.entity_count" 
															:to="`run-encounter${campaignId}/${props.key}`"
														>
															{{ props.value }}
														</router-link>
														<template v-else>
															{{ props.value }}
														</template>
													</div>
												</div>
											</q-td>
											<q-td v-else class="text-right d-flex justify-content-between">
												<router-link 
													v-if="props.row.entity_count" 
													class="btn btn-sm bg-neutral-5"
													:to="'/run-encounter/' + campaignId + '/' + props.key"
												>
													<i class="fas fa-play"></i>
													<q-tooltip anchor="top middle" self="center middle">
														Run encounter
													</q-tooltip>
												</router-link>
												<a v-else class="disabled btn btn-sm bg-neutral-5">
													<i class="fas fa-play"></i>
												</a>
												<router-link class="mx-1 btn btn-sm bg-neutral-5" :to="'/content/campaigns/' + campaignId + '/' + props.key">
													<i class="fas fa-pencil-alt"></i>
													<q-tooltip anchor="top middle" self="center middle">
														Edit
													</q-tooltip>
												</router-link>
												<a class="btn btn-sm bg-neutral-5" @click="deleteEncounter($event, props.key, props.row.name)">
													<i class="fas fa-trash-alt"></i>
													<q-tooltip anchor="top middle" self="center middle">
														Delete
													</q-tooltip>
												</a>
											</q-td>
										</template>
										<div slot="no-data" />
										<hk-loader slot="loading" name="NPCs" />
									</q-table>
								</template>
							</div>
						</hk-card>
						<hk-card  v-if="finished_encounters.length" header="Finished encounters">
							<div class="card-body">
								<!-- FINISHED ENCOUNTERS -->
								<hk-table
									:items="finished_encounters"
									:columns="finishedColumns"
									:perPage="6"
									:currentPage="currentPage"
								>
									<template slot="encounter" slot-scope="data">
										<router-link class="neutral-2" :to="'/run-encounter/' + campaignId + '/' + data.row.key">
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
					</template>
					<hk-card v-else>
						<hk-loader name="encounters" />
					</hk-card>
				</div>

				<!-- PLAYERS -->
				<div class="col-12 col-md-5">
					<Players v-if="!loading_campaign" :userId="user.uid" :campaignId="campaignId" card-view />
					<hk-card v-else>
						<hk-loader name="campaign" />
					</hk-card>
				</div>
			</div>
		</template>

		<!-- New encounter dialog -->
		<q-dialog 
			v-if="add && (encounter_count < tier.benefits.encounters || tier.benefits.encounters == 'infinite')"
			v-model="add" 
			square
		>
			<div>
				<q-form @submit="addEncounter">
					<hk-card header="New encounter" class="mb-0">
						<div class="card-body">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Encounter title"
								type="text" 
								autocomplete="off" 
								v-model="newEncounter"
								:rules="[ val => val && val.length > 0 || 'Enter a title']"
							/>
						</div>
						<div slot="footer" class="card-footer d-flex justify-content-end">
							<q-btn v-close-popup class="mr-1" no-caps type="cancel">Cancel</q-btn>
							<q-btn color="primary" type="submit" no-caps label="Add encounter" />
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>
	</div>
</template>

<script>
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
				encounters: {},
				loading_campaign: true,
				loading_encounters: true,
				campaign: {},
				newEncounter: "",
				add: false,
				currentPage: 1,
				search: undefined,
				columns: [
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: true,
						align: "left"
					},
					{
						name: "entities",
						label: "Entities",
						field: "entity_count",
						align: "left"
					},
					{
						name: "round",
						label: "Round",
						field: "round",
						align: "left"
					},
					{
						name: "turn",
						label: "Turn",
						field: "turn",
						align: "left"
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				]
			}
		},
		async mounted() {
			this.campaign = await this.get_campaign({
				uid: this.user.uid,
				id: this.campaignId
			});
			this.set_active_campaign(this.campaignId);
			this.loading_campaign = false;

			await this.get_campaign_encounters({ campaignId: this.campaignId });
			await this.get_campaign_encounters({ campaignId: this.campaignId, finished: true });
			this.loading_encounters = false;
		},
		computed: {
			...mapGetters([
				"tier",
				"overencumbered",
				"broadcast"
			]),
			...mapGetters("encounters", ["get_encounters", "get_encounter_count"]),
			encounter_count() {
				return this.get_encounter_count(this.campaignId);
			},
			active_encounters() {
				return this.get_encounters(this.campaignId, "active");
			},
			finished_encounters() {
				return this.get_encounters(this.campaignId, "finished");
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("encounters", [
				"get_campaign_encounters",
				"add_encounter",
				"delete_encounter"
			]),
			...mapActions("campaigns", [
				"get_campaign",
				"set_active_campaign"
			]),
			addEncounter() {
				if ((this.encounter_count < this.tier.benefits.encounters || this.tier.benefits.encounters == 'infinite')) {
					this.add_encounter({
						campaignId: this.campaignId, 
						encounter: {
							name: this.newEncounter, 
							round: 0, 
							turn: 0, 
							finished: false,
							timestamp: Date.now()
						}
					});
					this.newEncounter = "";
					this.$snotify.success('Encounter added.', 'Critical hit!', {
						position: "rightTop"
					});
					this.add = false;
				}
			},
			deleteEncounter(e, key, encounter) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.delete_encounter({ 
						campaignId: this.campaignId, 
						id: key, 
						finished: encounter.finished
					});
				} else {
					this.$snotify.error('Are you sure you want to delete "' + encounter + '"?', 'Delete encounter', {
						timeout: 5000,
						buttons: [
						{
							text: 'Yes', action: (toast) => { 
								this.delete_encounter({
									campaignId: this.campaignId, 
									id: key,
									finished: encounter.finished
								});
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