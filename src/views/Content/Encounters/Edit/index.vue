<template>
	<div v-if="overencumbered" class='container-fluid'>
		<OverEncumbered/>
	</div>
	<div class="container-fluid" v-else-if="encounter">
		<div class="wrapper scrollable-content">
			<div class="top">
				<Crumble />
				<router-link :to="'/encounters/' + $route.params.campid">
					<i class="fas fa-arrow-left"></i> Back
				</router-link>
			</div>
				<div class="mt-2 encounter_actions">
					<q-tabs
						v-model="tab"
						dark
						inline-label
						dense
						align="left"
						:breakpoint="0"
						no-caps
					>
						<q-tab 
							v-for="({name, icon, label}, index) in tabs"
							:key="`tab-${index}`" 
							:name="name" 
							:icon="icon"
							:label="label"
						/>
					</q-tabs>
					<q-scroll-area dark :thumb-style="{ width: '5px'}"> 
						<q-tab-panels v-model="tab" class="bg-transparent">
							<q-tab-panel name="entities">
									<Entities />
							</q-tab-panel>
							<q-tab-panel name="general">
									<General />
							</q-tab-panel>
							<q-tab-panel name="loot">
									<Loot />
							</q-tab-panel>
							<q-tab-panel name="xp" v-if="campaign.advancement === 'experience'">
									<Xp />
							</q-tab-panel>
						</q-tab-panels>
					</q-scroll-area>
				</div>

				<!-- ENCOUNTER OVERVIEW -->
				<Overview />
		</div>
	</div>
</template>

<script>
	import Crumble from '@/components/crumble'
	import Loot from './Loot.vue'
	import Xp from './Xp.vue'
	import Entities from './Entities.vue'
	import Overview from './Overview.vue'
	import General from './General.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'EditEncounter',
		metaInfo: {
			title: 'Encounters'
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
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				tab: 'entities'
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
				'campaign',
				'overencumbered',
			]),
			tabs() {
				let tabs = {
					entities: { name: 'entities', label: 'Entities', icon: 'fas fa-helmet-battle' },
					general: { name: 'general', label: 'General' },
					loot: { name: 'loot', label: 'Loot', icon: 'fas fa-treasure-chest' }
				}
				if(this.campaign.advancement === 'experience') {
					tabs.xp = { name: 'xp', label: 'XP', icon: 'fas fa-sparkles' };
				}
				return tabs;
			}
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchEncounter',
				'fetchCampaign'
			])
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	height: calc(100vh - 50px);

	.wrapper {
		padding: 20px;
		grid-gap: 10px;
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 80px 1fr;
		height: 100%;
		grid-template-areas: 
		"top top"
		"actions overview";

		.top {
			grid-area: top;
		}
		.encounter_actions {
			grid-area: actions;
			overflow-y: hidden;

			.q-scrollarea {
				background:$gray-active !important;
				height: calc(100% - 30px) !important;
			}
		}
	}
	ul.nav {
		a.nav-link {
			&.active {
				background:$gray-active !important;
			}
		}
	}
	.faded {
		opacity: .3;
	}

	@media only screen and (max-width: 850px) {
		.wrapper {
			grid-template-columns: auto;
			grid-template-areas: 
			"top"
			"actions";
			overflow: visible !important;
		}
	}
	@media only screen and (max-width: 768px) {
		.wrapper {
			grid-template-rows: 30px 1fr;
		}
	}
}
</style>