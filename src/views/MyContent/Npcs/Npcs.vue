<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="npcs" class="container">
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
						<th>#</th>
						<th>Name</th>
						<th></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(npc, index) in _npcs" :key="npc.key">
							<td class="img" v-if="npc.avatar != ''" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></td>
							<td class="img" v-else>
								<img src="@/assets/_img/styles/monster.svg" />
							</td>
							<td>{{ index + 1 }}</td>
							<td>{{ npc.name }}</td>
							<td class="text-right actions">
								<router-link class="mx-2" 
									:to="'/npcs/' + npc.key" 
									v-b-tooltip.hover title="Edit"><i class="fas fa-edit"></i>
								</router-link>
								<a v-b-tooltip.hover 
									title="Delete" 
									class="red"
									@click="confirmDelete(npc.key, npc.name)">
										<i class="fas fa-trash-alt"></i>
								</a>
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
				//REMEMBER TO DELETE FROM ALL CAMPAIGNS!!

				//Remove NPC
				db.ref('npcs/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="css" scoped>
	.container {
		padding-top:20px;
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