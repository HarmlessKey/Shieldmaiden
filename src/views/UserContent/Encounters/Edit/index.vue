<template>
	<div v-if="overencumbered">
		<OverEncumbered/>
	</div>
	<div v-else>
		<div class="wrapper">
			<hk-card>
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
							:to="'/content/campaigns/' + $route.params.campid"
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
						<Entities :encounter="encounter" :campaign="campaign" />
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
			</hk-card>

			<!-- ENCOUNTER OVERVIEW -->
			<Overview :encounter="encounter" :campaign="campaign" />
		</div>
	</div>
</template>

<script>
	import Crumble from "@/components/crumble";
	import Loot from "./Loot.vue";
	import Xp from "./Xp.vue";
	import Entities from "./Entities.vue";
	import Overview from "./Overview.vue";
	import General from "./General.vue";
	import OverEncumbered from "@/components/OverEncumbered.vue";
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "EditEncounter",
		metaInfo: {
			title: "Encounters"
		},
		components: {
			Crumble,
			OverEncumbered,
			Loot,
			Xp,
			Entities,
			Overview,
			General
		},
		data() {
			return {
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				campaign: {},
				encounter: {},
				tab: "entities"
			} 
		},
		computed: {
			...mapGetters([
				"overencumbered"
			]),
			tabs() {
				let tabs = {
					entities: { name: "entities", label: "Entities", icon: "fas fa-helmet-battle" },
					general: { name: "general", label: "General" },
					loot: { name: "loot", label: "Loot", icon: "fas fa-treasure-chest" }
				}
				if(this.campaign.advancement === "experience") {
					tabs.xp = { name: "xp", label: "XP", icon: "fas fa-sparkles" };
				}
				return tabs;
			}
		},
		async	mounted() {
			await this.get_campaign({
				uid: this.user.uid,
				id: this.campaignId
			}).then((campaign) => {
				this.campaign = campaign;
			});

			await this.get_encounter({
				uid: this.user.uid,
				campaignId: this.campaignId, 
				id: this.encounterId
			}).then(encounter => {
				this.encounter = encounter;
			});
		},
		methods: {
			...mapActions("campaigns", ["get_campaign"]),
			...mapActions("encounters", ["get_encounter"]),
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
	.faded {
		opacity: .3;
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