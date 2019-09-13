<template>
	<div v-if="overencumbered" class='container-fluid'>
		<OverEncumbered/>
	</div>
	<div id="hasSide" v-else-if="encounter">
		<Sidebar/>
		<div class="wrapper">
			<div class="top">
				<Crumble />
				<router-link :to="'/encounters/' + $route.params.campid"><i class="fas fa-arrow-left"></i> Back</router-link>
			</div>
			<div class="grid">
				<div class="encounter_actions">
					<div>
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
						<div class="content">
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
				<div class="encounter_overview" v-if="encounter">
					<h3>Encounter overview</h3>
					<Overview />
				</div>
			</div>
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
.wrapper {
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 100px 1fr;
	height: calc(100vh - 50px);

	.top {
		padding: 20px;
	}

	.grid {
		padding: 20px;
		display: grid;
		grid-template-columns: 1fr 400px;
		grid-gap: 10px;
		overflow: hidden;

		

		.encounter_actions {
			.content {
				padding: 15px;
				background: #302f2f !important;

				.tab-content {
					height: calc(100vh - 245px);
					overflow-y: scroll;

					&::-webkit-scrollbar {
						display: none;
					}
				}
			}
		}
		.encounter_overview {
			h3 {
				margin-bottom: 16px;
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

</style>