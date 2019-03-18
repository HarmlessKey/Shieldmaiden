<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="npcs" class="container-fluid">
			<h1>Your NPC's</h1>
			<p>These are your custom NPC's that you can use in your campaigns.</p>

			<router-link to="/npcs/add-npc" 
				class="btn btn-block mb-3"
				v-b-modal.addModal>
				<i class="fas fa-plus-square"></i> Add NPC
			</router-link>
		
			<template v-if="npcs">
				<h2 class="mt-3">NPC's ( {{ Object.keys(npcs).length }} )</h2>
				<table class="table">
					<thead>
						<th></th>
						<th class="n">#</th>
						<th>Name</th>
						<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(npc, index) in _npcs" :key="npc.key">
							<td class="img" v-if="npc.avatar" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></td>
							<td class="img" v-else>
								<img src="@/assets/_img/styles/monster.svg" />
							</td>
							<td class="n">{{ index + 1 }}</td>
							<td>
								<router-link class="gray-light mx-2" 
									:to="'/npcs/' + npc.key" 
									v-b-tooltip.hover title="Edit">
									{{ npc.name }}
								</router-link>
							</td>
							<td>
								<div class="d-flex justify-content-end">
									<div class="d-flex justify-content-end actions">
										<router-link class="gray-hover mx-1" 
											:to="'/npcs/' + npc.key" 
											v-b-tooltip.hover title="Edit">
											<i class="fas fa-pencil"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="gray-hover"
											@click="confirmDelete(npc.key, npc.name)">
											<i class="fas fa-trash-alt"></i>
										</a>
									</div>
									<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<h2 v-else-if="npcs === null" class="mt-3 text-center"><i class="fas fa-arrow-up gray-hover"></i> Add your first NPC <i class="fas fa-arrow-up gray-hover"></i></h2>
			<div v-else class="loader"><span>Loading NPC's...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Npcs',
		metaInfo: {
			title: 'NPC\'s'
		},
		components: {
			Sidebar
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		computed: {
			...mapGetters([
				'npcs',
				'campaigns',
				'allEncounters',
			]),
			_npcs: function() {
				// console.log('yo')
				return _.chain(this.npcs)
				.filter(function(npc, key) {
					npc.key = key
					return npc
				})
				.orderBy("name", 'asc')
				.value()
			},
		},
		methods: {
			confirmDelete(key, npc) {
				this.$snotify.error('Are you sure you want to delete ' + npc + '?', 'Delete NPC', {
					timeout: false,
					buttons: [
						{
							text: 'Yes', action: (toast) => { 
							this.deleteNpc(key)
							this.$snotify.remove(toast.id); 
							}, 
							bold: false
						},
						{
							text: 'No', action: (toast) => { 
								this.$snotify.remove(toast.id); 
							}, 
							bold: true
						},
					]
				});
			},
			deleteNpc(key) {
				//Remove the NPC from all encounters
				for(let campaign in this.campaigns) {
					if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaign) > -1) {
						//Go over all encounters of the campaign
						for(let enc in this.allEncounters[campaign]) {
							var entities = this.allEncounters[campaign][enc].entities;

							//Go over all entites in the encounter
							for(let entityKey in entities) {
								let npcId = entities[entityKey].id;
								
								//If the entity has the same id, delete it
								if(npcId == key) {
									db.ref(`encounters/${this.userId}/${campaign}/${enc}/entities/${entityKey}`).remove();
								}
							}
						}
					}
				}
				//Remove NPC
				db.ref('npcs/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="css" scoped>
	.container-fluid {
		padding: 20px;
	}
	.col {
		margin:10px;
		padding:10px;
		margin-bottom:10px;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns:70px 1fr 10px;
		grid-gap: 10px;
		grid-template-areas: 
		"img info delete";
	}
	.info h3, .info p {
		margin-bottom:5px !important;
	}
	/* .img {
		width:70px;
		height:70px;
		display:block;
		background-size:cover;
		background-position:top center;
		grid-area: img;
		border:solid 1px #b2b2b2;
	} */
	.info {
		grid-area: info;
	}
</style>