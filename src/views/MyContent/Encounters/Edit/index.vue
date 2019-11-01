<template>
	<div v-if="overencumbered" class='container-fluid'>
		<OverEncumbered/>
	</div>
	<div id="hasSide" class="container-fluid" v-else-if="encounter">
		<Sidebar/>
		<div class="wrapper">
			<div class="top">
				<Crumble />
				<router-link :to="'/encounters/' + $route.params.campid"><i class="fas fa-arrow-left"></i> Back</router-link>
			</div>
				<div class="encounter_actions">
					<ul class="nav nav-tabs" id="myTab" role="tablist">
						<li class="nav-item">
							<a class="nav-link active" id="entities-tab" data-toggle="tab" href="#entities" role="tab" aria-controls="entities" aria-selected="false">
								<i class="fas fa-helmet-battle"></i> Entities
							</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">
								General
							</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" id="loot-tab" data-toggle="tab" href="#loot" role="tab" aria-controls="loot" aria-selected="false">
								<i class="fas fa-treasure-chest"></i> Loot
							</a>
						</li>
					</ul>
					<div class="scroll" v-bar>
						<div>
							<div class="tab-content">
								<div class="tab-pane fade show active" id="entities" role="tabpanel" aria-labelledby="entities-tab">
									<Entities />
								</div>
								<div class="tab-pane fade" id="general" role="tabpanel" aria-labelledby="general-tab">
									<General />
								</div>
								<div class="tab-pane fade" id="loot" role="tabpanel" aria-labelledby="loot-tab">
									<Loot />
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ENCOUNTER OVERVIEW -->
				<Overview />
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import Loot from './Loot.vue'
	import Entities from './Entities.vue'
	import Overview from './Overview.vue'
	import General from './General.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'EditCampaign',
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
			OverEncumbered,
			Loot,
			Entities,
			Overview,
			General
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser	
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
				'campaign',
				'overencumbered',
			])
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

			.scroll {
				background: #302f2f !important;
				height: calc(100% - 30px) !important;
				
				.tab-content {
					padding: 15px;
				}
			}
		}
	}
	ul.nav {
		a.nav-link {
			&.active {
				background: #302f2f !important;
			}
		}
	}
	.faded {
		opacity: .3;
	}

	@media only screen and (max-width: 850px) {
		.wrapper {
				grid-template-columns: 3fr 2fr;
		}
	}
	@media only screen and (max-width: 767px) {
		.wrapper {
			grid-template-columns: auto;
			grid-template-rows: 30px 1fr 1fr;
			grid-template-areas: 
			"top"
			"actions"
			"overview";
		}
	}
}

</style>