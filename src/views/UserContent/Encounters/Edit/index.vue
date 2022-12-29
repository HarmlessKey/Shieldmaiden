<template>
	<hk-card v-if="overencumbered && !demo" header="You're over encumbered">
		<div class="card-body">
			<p>
				You can't edit an encounter when you are over encumbered, 
				please resolve this first.
			</p>

			<router-link to="/content/manage" class="btn btn-lg btn-block bg-neutral-9">
				Manage content
			</router-link>
		</div>
	</hk-card>
	<div v-else>
		<SignedIn v-if="user && demo" />
		<div v-if="demo" class="d-flex justify-between items-center mb-3">
			<h1 class="written mb-0">
				Encounter builder for D&D
			</h1>
			<button class="btn" :disabled="!validEncounter" @click="runEncounter">
				Run encounter
				<i class="fas fa-sword ml-2 rotate" aria-hidden="true" />
			</button>
		</div>
		<div class="wrapper">
			<hk-card>
				<template v-if="!loading">
					<div class="tabs">
						<q-tabs
							v-model="tab"
							dark
							inline-label
							align="justify"
							:breakpoint="0"
							no-caps
						>
							<q-route-tab
								exact replace
								label="Back"
								icon="fas fa-arrow-left"
								class="pl-0"
								name="back"
								:to="demo ? `/tools/encounter-builder` : `/content/campaigns/${$route.params.campid}`"
							/>
							<q-tab 
								v-for="({name, icon, label}, index) in tabs"
								:key="`tab-${index}`" 
								:name="name" 
								:icon="icon"
								:label="label"
							/>
						</q-tabs>
					</div>
					<q-tab-panels v-model="tab" class="bg-transparent">
						<q-tab-panel name="entities">
							<Entities 
								:encounter="encounter" 
								:campaign="campaign" 
								:campaign_players="campaign_players"
								:add-players="addPlayersTriggered"
							/>
						</q-tab-panel>
						<q-tab-panel name="general">
							<General :encounter="encounter" :campaign="campaign" />
						</q-tab-panel>
						<q-tab-panel name="loot">
							<Loot :encounter="encounter" :campaign="campaign" />
						</q-tab-panel>
						<q-tab-panel name="xp" v-if="campaign.advancement === 'experience'">
							<Xp :encounter="encounter" :campaign="campaign" />
						</q-tab-panel>
					</q-tab-panels>
				</template>
				<hk-loader v-else />
			</hk-card>

			<!-- ENCOUNTER OVERVIEW -->
			<Overview 
				v-if="!loading" 
				:encounter="encounter" 
				:campaign="campaign" 
				:campaign_players="campaign_players"
				@add-players="trigger"
			/>
			<hk-card v-else>
				<hk-loader />
			</hk-card>
		</div>
	</div>
</template>

<script>
	import Loot from "./Loot.vue";
	import Xp from "./Xp.vue";
	import Entities from "./Entities.vue";
	import Overview from "./Overview.vue";
	import General from "./General.vue";
	import { mapGetters, mapActions } from "vuex";
	import SignedIn from "src/components/userContent/SignedIn.vue";

	export default {
		name: "EditEncounter",
		components: {
			Loot,
			Xp,
			Entities,
			Overview,
			General,
			SignedIn,
		},
		data() {
			return {
				demo: this.$route.name === "ToolsBuildEncounter",
				user: this.$store.getters ? this.$store.getters.user : undefined,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				campaign: {},
				encounter: {},
				campaign_players: {},
				addPlayersTriggered: false,
				loading: true,
				tab: "entities"
			} 
		},
		computed: {
			...mapGetters([
				"overencumbered"
			]),
			...mapGetters("encounters", ["demo_encounter"]),
			tabs() {
				let tabs = {
					entities: { name: "entities", label: "Entities", icon: "fas fa-helmet-battle" },
					general: { name: "general", label: "General", icon: "fas fa-sliders-h" }
				}
				if(!this.demo) {
					tabs.loot = { name: "loot", label: "Loot", icon: "fas fa-treasure-chest" };
				}
				if(this.campaign.advancement === "experience") {
					tabs.xp = { name: "xp", label: "XP", icon: "fas fa-sparkles" };
				}
				return tabs;
			},
			validEncounter() {
				// A valid encounter has at least 1 player and 1 npc
				if(!this.encounter.entities) {
					return false;
				}
				return Object.values(this.encounter.entities).filter(entity => entity.entityType === "player").length 
					&& Object.values(this.encounter.entities).filter(entity => entity.entityType === "npc").length
			}
		},
		async	mounted() {
			if(!this.demo) {
				this.campaign = await this.get_campaign({
					uid: this.user.uid,
					id: this.campaignId
				})

				this.encounter = await this.get_encounter({
					uid: this.user.uid,
					campaignId: this.campaignId, 
					id: this.encounterId
				});

				for (const playerId in this.campaign.players) {
					this.campaign_players[playerId] = await this.get_player({ uid: this.user.uid, id: playerId })
				}
			} else {
				this.encounter = this.demo_encounter || {};
			}

			this.loading = false;
		},
		methods: {
			...mapActions("campaigns", ["get_campaign"]),
			...mapActions("encounters", ["get_encounter", "set_demo_encounter"]),
			...mapActions("players", ["get_player"]),
			// Triggered from Overview component, to execute addAllPlayers() in Entities component
			trigger() {
				this.addPlayersTriggered = true;
			},
			async runEncounter() {
				if(this.validEncounter) {
					await this.set_demo_encounter(this.encounter);
					this.$router.replace("/demo");
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

	.wrapper {
		grid-gap: 10px;
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 
		"actions overview";

		.tabs {
			background-color: $neutral-8;
			border-bottom: 1px solid $neutral-6;
		}
		.encounter_actions {
			grid-area: actions;
			overflow-y: hidden;

			.q-scrollarea {
				background: $neutral-6 !important;
				height: calc(100% - 30px) !important;
			}
		}
	}
	ul.nav {
		a.nav-link {
			&.active {
				background: $neutral-6 !important;
			}
		}
	}
	h1 {
		font-size: 20px;
	}
	.faded {
		opacity: .3;
	}
	.rotate {
		transform: rotate(45deg);
		vertical-align: -1px;
	}

	@media only screen and (max-width: 850px) {
		.wrapper {
			grid-template-columns: 1fr;
			grid-template-areas: 
			"actions";
			overflow: visible !important;
		}
	}

</style>