<template>
	<div v-if="tier">
		<hk-card>
			<div slot="header" class="card-header">
				<span>
					NPC's ( 
					<span :class="{ 'green': true, 'red': content_count.npcs >= tier.benefits.npcs }">{{ Object.keys(npcs).length }}</span> 
					/ 
					<i v-if="tier.benefits.npcs == 'infinite'" class="far fa-infinity"></i>
					<template v-else>{{ tier.benefits.npcs }}</template>
					)
				</span>
				<router-link class="btn btn-sm bg-neutral-5" v-if="!overencumbered" :to="`${$route.path}/add-npc`">
					<i class="fas fa-plus green"></i> New NPC
				</router-link>
			</div>

			<div class="card-body">
				<p class="neutral-2">
					These are your custom Non-Player Characters or monsters.
				</p> 
				<template v-if="npcs">
					<OutOfSlots 
						v-if="content_count.npcs >= tier.benefits.npcs"
						type = 'npcs'
					/>
					
					<a v-if="old_npcs.length > 0" class="btn btn-block bg-red mb-3" @click="old_dialog = true">
						<i class="fas fa-wand-magic"></i> Update {{ old_npcs.length }} old NPCs
					</a>

					<hk-table
						:columns="columns"
						:items="_npcs"
						:perPage="20"
						:search="['name', 'type']"
					>
						<template slot="avatar" slot-scope="data">
							<div class="image" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }">
								<i v-if="!data.item" class="hki-monster" />
							</div>
						</template>

						<template slot="name" slot-scope="data">
							<span v-if="data.row.old">
								<q-badge v-if="data.row.error" color="red" label="ERROR"/>
								<q-badge v-else color="red" label="Deprecated" />
								{{ data.item.capitalizeEach() }}
								<q-tooltip  v-if="data.row.error" anchor="top middle" self="center middle">
									Contact us on Discord
								</q-tooltip>
							</span>
							<router-link v-else class="mx-2" :to="`${$route.path}/${data.row.key}`">
								{{ data.item.capitalizeEach() }}
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
						</template>

						<div slot="actions" slot-scope="data" class="actions">
							<template v-if="data.row.old">
								<a class="btn btn-sm bg-neutral-5 mx-1" @click="parseNewNPC(data.row)">
									<i class="fas fa-wand-magic"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Parse to new format
									</q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5 mx-1" @click="setSlide({show: true, type: 'ViewOldMonster', data: data.row })">
									<i class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										View NPC
									</q-tooltip>
								</a>
							</template>
							<router-link v-else class="btn btn-sm bg-neutral-5 mx-1" :to="`${$route.path}/${data.row.key}`">
								<i class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
							<a class="btn btn-sm bg-neutral-5" @click="confirmDelete($event, data.row.key, data.row)">
								<i class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
							</a>
						</div>
					</hk-table>

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
					<template v-if="!tier || tier.name === 'Free'">
						<router-link class="openSlot none" to="/patreon">
							Support us on Patreon for more slots.
						</router-link>
					</template>
				</template>
				<router-link v-else-if="npcs === null && !overencumbered" class="btn btn-block mt-4" to="/npcs/add-npc">
					Create your first NPC
				</router-link>
			</div>
		</hk-card>
		
		<!-- PARSER DIALOG -->
		<q-dialog :dark="$store.getters.theme === 'dark'" v-model="old_dialog">
			<hk-card header="Deprecated NPC's">
				<template v-if="!parsing">
					<div class="card-body">
						<p>
							We have upgraded our NPC's. You still have <b class="red">{{ old_npcs.length }}</b>
							NPC's that are of the old format. For a better user experience, please upgrade them.
						</p>
						<p>Our parser does most of the work for you, but we do advise to double check your NPC's, especially the actions.</p>

						<a class="btn btn-block" @click="parseAll()">Parse all NPC's</a>
					</div>
					<div slot="footer" class="card-footer d-flex justify-content-end">
						<q-btn class="bg-neutral-8" v-close-popup>Later</q-btn>
					</div>
				</template>
				<template v-else>
					<h4 class="text-center mb-4">
						<hk-animated-integer :value="parsed_counter" :class="{ green: parsed_counter === parse_total}" />/{{parse_total}} parsed
					</h4>
					<q-linear-progress v-if="(parsed_counter + error_counter) !== parse_total" stripe rounded size="20px" :value="parsed_counter/parse_total" />
					<template v-else>
						<div class="card-body">
							<h2 class="text-center">
								<i class="fas fa-check green"/>
								Finished!
							</h2>
							<p>
								<template v-if="error_counter === 0">
									All 
								</template>
								<template v-else>
									Except for {{ error_counter }}, all 
								</template>
								your old monster have succesfully been updated. 
								Please make sure to double check them before use to correct any mistakes.
							</p>
						</div>
						<div slot="footer" class="card-footer d-flex justify-content-end">
							<q-btn class="bg-blue white" v-close-popup>Close</q-btn>
						</div>
					</template>
				</template>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import _ from 'lodash';
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import { mapActions, mapGetters } from 'vuex';
	import { db } from '@/firebase';
	import { monsterMixin } from '@/mixins/monster';

	export default {
		name: 'Npcs',
		metaInfo: {
			title: 'NPC\'s'
		},
		mixins: [monsterMixin],
		components: {
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				old_dialog: false,
				parsed_counter: 0,
				error_counter: 0,
				parse_total: 0,
				parsing: false,
				old_npcs_copy: undefined,
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
					name: {
						label: 'Name',
						truncate: true,
						sortable: true
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
				'players',
				'allEncounters',
				'overencumbered',
				'content_count',
			]),
			_npcs: function() {
				return _.chain(this.npcs)
				.filter(function(npc, key) {
					npc.key = key
					return npc
				})
				.orderBy("name", 'asc')
				.value()
			},
			old_npcs() {
				return this._npcs.filter(npc => {
					return npc.old && !npc.error
				});
			},
			slotsLeft() {
				return this.tier.benefits.npcs - Object.keys(this.npcs).length;
			}
		},
		mounted() {
			if(this.old_npcs.length > 0) {
				this.old_dialog = true;
			}
		},
		methods: {
			...mapActions([
				'fetchNpcs',
				'stopFetchNpcs',
				'setSlide'
			]),
			confirmDelete(e, key, npc) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteNpc(key);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + npc.name + '?', 'Delete NPC', {
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
				}

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
				// Remove NPC as companion from players
				for (let playerKey in this.players) {
					for (let companionKey in this.players[playerKey].companions) {
						if (companionKey === key) {
							db.ref(`players/${this.userId}/${playerKey}/companions/`).child(key).remove();
						}
					}
				}
				//Remove NPC
				db.ref('npcs/' + this.userId).child(key).remove(); 
			},
			* getNPC () {
				for (const npc of this.old_npcs_copy) {
					yield npc;
					
				}
			},
			async parseAll() {
				this.parsing = true;
				this.parse_total = this.old_npcs.length;

				this.stopFetchNpcs();
				this.old_npcs_copy = [...this.old_npcs];
				let npcGen = this.getNPC();

				for (const npc of npcGen) {

					const new_npc = this.parseMonster(npc);

					try {
						await db.ref(`npcs/${this.userId}/${npc.key}`).set(new_npc).then(() => {
							this.parsed_counter++;
						});
					} catch(error) {
						this.error_counter++;
						console.warn("An error occured in monster: ", npc.name);
						console.error(error);
						db.ref(`npcs/${this.userId}/${npc.key}/error`).set(true);
						this.$q.notify({
							message: `Error in ${npc.name}`,
							caption: 'There is an error in your mosnter, contact us on Discord to fix it.',
							color: "red",
							position: "top",
							progress: true,
							timeout: 2000
						});
					}
				}
				this.fetchNpcs();
			},
			parseNewNPC(npc) {
				const new_npc = this.parseMonster(npc);
				try {
					db.ref(`npcs/${this.userId}/${npc.key}`).set(new_npc);
				} catch(error) {
						console.warn("An error occured in monster: ", npc.name);
						db.ref(`npcs/${this.userId}/${npc.key}/error`).set(true);
						console.error(error);
						this.$q.notify({
							message: `Error in ${npc.name}`,
							caption: 'There is an error in your monster, contact us on Discord to fix it.',
							color: "red",
							position: "top",
							progress: true,
							timeout: 2000
						});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		h2 {
			border-bottom: solid 1px $neutral-4;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: $neutral-2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
	}
</style>