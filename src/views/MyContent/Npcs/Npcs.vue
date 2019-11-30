<template>
	<div id="npcs" class="container-fluid" v-if="tier">
		<h1>Your NPC's</h1>
		<p>These are your custom NPC's that you can use in your campaigns.</p>

		<OverEncumbered v-if="overencumbered"/>
		<OutOfSlots 
			v-else-if="content_count.npcs >= tier.benefits.npcs"
			type = 'npcs'
		/>
	
		<template v-if="npcs">
			<h2 class="mt-3 d-flex justify-content-between">
				<span>
					NPC's ( 
					<span :class="{ 'green': true, 'red': content_count.npcs >= tier.benefits.npcs }">{{ Object.keys(npcs).length }}</span> 
					/ 
					<i v-if="tier.benefits.npcs == 'infinite'" class="far fa-infinity"></i>
					<template v-else>{{ tier.benefits.npcs }}</template>
					)
				</span>
				<router-link v-if="!overencumbered" to="/npcs/add-npc">
					<i class="fas fa-plus green"></i> New NPC
				</router-link>
			</h2>

			<HKtable
				:columns="columns"
				:items="_npcs"
				:perPage="20"
				:search="['name', 'type']"
			>
				<template slot="avatar" slot-scope="data">
					<div class="image" v-if="data.item" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }"></div>
					<img v-else class="image" src="@/assets/_img/styles/monster.svg" />
				</template>

				<template slot="name" slot-scope="data">
					<router-link class="mx-2" 
						:to="'/npcs/' + data.row.key" 
						v-b-tooltip.hover title="Edit">{{ data.item }}
					</router-link>
				</template>

				<div slot="actions" slot-scope="data" class="actions">
					<router-link class="gray-hover mx-1" 
						:to="'/npcs/' + data.row.key" 
						v-b-tooltip.hover title="Edit">
						<i class="fas fa-pencil"></i>
					</router-link>
					<a v-b-tooltip.hover 
						title="Delete" 
						class="gray-hover"
						@click="confirmDelete(data.row.key, data.row.name)">
						<i class="fas fa-trash-alt"></i>
					</a>
				</div>
			</HKtable>

			<template v-if="slotsLeft > 0 && tier.benefits.npcs !== 'infinite'">
				<div 
					class="openSlot"
					v-for="index in slotsLeft"
					:key="'open-slot-' + index"
				>
					<span>Open NPC slot</span>
					<router-link v-if="!overencumbered" to="/npcs/add-npc">
						<i class="fas fa-plus green"></i>
					</router-link>
				</div>
			</template>
			<template v-if="slotsLeft <= 0">
				<div class="openSlot none">
					<span class="red">No NPC slots left. </span>
					Delete NPC's to create new space, <router-link to="/patreon">or support us for more slots</router-link>.
				</div>
			</template>
		</template>
		<h3 v-else-if="npcs === null" class="mt-4">
			<router-link v-if="!overencumbered" to="/npcs/add-npc">
				<i class="fas fa-plus green"></i> Create your first NPC
			</router-link>
		</h3>
		<div v-else class="loader"><span>Loading NPC's...</span></div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import HKtable from '@/components/hk-components/hk-table.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Npcs',
		metaInfo: {
			title: 'NPC\'s'
		},
		components: {
			OverEncumbered,
			OutOfSlots,
			HKtable
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					name: {
						label: 'Name',
						truncate: true
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
                	}
				}
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'npcs',
				'campaigns',
				'allEncounters',
				'overencumbered',
				'content_count',
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
			slotsLeft() {
				return this.tier.benefits.npcs - Object.keys(this.npcs).length;
			}
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

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		h2 {
			border-bottom: solid 1px #b2b2b2;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: #b2b2b2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
		.openSlot {
			display: flex;
			justify-content: space-between;
			padding: 0 10px;
			width: 100%;
			height: 46px;
			line-height: 46px;
			border: dashed 1px #5c5757;
			margin-top: 1px;

			&.none {
				display: block;
				text-align: center;
			}
		}
	}
</style>