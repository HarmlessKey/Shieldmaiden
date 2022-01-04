<template>
	<div v-if="tier">
		<hk-card>
			<div slot="header" class="card-header">
				<span>
					NPC's ( 
					<span :class="{ 'green': true, 'red': npc_count >= tier.benefits.npcs }">{{ npc_count }}</span> 
					/ 
					<i v-if="tier.benefits.npcs == 'infinite'" class="far fa-infinity"></i>
					<template v-else>{{ tier.benefits.npcs }}</template>
					)
				</span>
				<a class="btn btn-sm bg-neutral-5"
					@click="import_dialog = true"
				>
					Bulk Import NPCs
				</a>
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
						v-if="npc_count >= tier.benefits.npcs"
						type="npcs"
					/>

					<q-input 
						:dark="$store.getters.theme !== 'light'" 
						v-model="search"
						borderless 
						filled square
						debounce="300" 
						clearable
						placeholder="Search"
						@change="searchNpcs"
						@clear="searchNpcs"
						:error="search !== undefined && !npcs.length"
						:error-message='`No NPCs found starting with "${search}"`'
					>
						<q-icon slot="prepend" name="search" />
						<q-btn slot="after" no-caps color="primary" label="Search" @click="searchNpcs" />
					</q-input>

					<q-table
						:data="npcs"
						:visible-columns="visibleColumns"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_npcs"
						separator="none"
						wrap-cells
						:pagination.sync="pagination"
						:rows-per-page-options="[0]"
						@request="load"
					>	
						<template v-slot:body-cell="props">
							<q-td v-if="props.col.name !== 'actions'">
								<div  class="truncate-cell">
									<div class="truncate">
										<router-link v-if="props.col.name === 'name'" :to="`${$route.path}/${props.key}`">
											{{ props.value }}
										</router-link>
										<template v-else>
											{{ props.value }}
										</template>
									</div>
								</div>
							</q-td>
							<q-td v-else class="text-right d-flex justify-content-between">
								<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a class="btn btn-sm bg-neutral-5 mx-2" @click="confirmDelete($event, props.key, props.row, props.rowIndex)">
									<i class="fas fa-trash-alt"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Delete
									</q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="downloadJSON(props.key)">
									<i class="fas fa-brackets-curly"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Export JSON
									</q-tooltip>
								</a>
							</q-td>
						</template>
						<div slot="pagination">
							1-{{npcs.length}} of {{(search && search.length) ? npcs.length : npc_count}}
						</div>
						<div slot="no-data" />
						<hk-loader slot="loading" name="monsters" />
					</q-table>
					<q-btn 
						v-if="!search && npcs.length < npc_count"
						slot="bottom-row"
						no-caps 
						color="primary" 
						label="Load more" 
						@click="load({ pagination }, true)"
					/>

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
							Support us on Patreon for more NPC slots.
						</router-link>
					</template>
				</template>
				<router-link v-else-if="npcs === null && !overencumbered" class="btn btn-block mt-4" to="/npcs/add-npc">
					Create your first NPC
				</router-link>
				<q-resize-observer @resize="setSize" />
			</div>
		</hk-card>

		<!-- Bulk import dialog -->
		<q-dialog v-model="import_dialog">
			<hk-card header="Import NPC from JSON" :minWidth="400">
				<div class="card-body">
					<ImportNPC @imported="imported"/>
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import OutOfSlots from "@/components/OutOfSlots.vue";
	import { mapActions, mapGetters } from "vuex";
	import { db } from "@/firebase";
	import { monsterMixin } from "@/mixins/monster";
	import ImportNPC from "@/components/ImportNPC.vue";

	export default {
		name: "Npcs",
		metaInfo: {
			title: "NPC's"
		},
		mixins: [monsterMixin],
		components: {
    OutOfSlots,
    ImportNPC
},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				import_dialog: false,
				loading_npcs: true,
				npcs: [],
				paginationSetter: undefined,
				search: "",
				card_width: 0
			}
		},
		computed: {
			...mapGetters([
				"tier",
				"allEncounters",
				"overencumbered",
			]),
			...mapGetters("players", ["players"]),
			...mapGetters("campaigns", ["campaigns"]),
			...mapGetters("npcs", ["npc_count"]),
			pagination: {
				get() {
					return (this.paginationSetter) ? this.paginationSetter : {
						sortBy: "name",
						rowsPerPage: 15,
						rowsNumber: this.npc_count
					};
				},
				set(newVal) {
					this.paginationSetter = newVal;
				}
			},
			columns() {
				return [
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: !this.search || this.search.length < 3,
						align: "left",
						format: val => val.capitalizeEach()
					},
					{
						name: "type",
						label: "Type",
						field: "type",
						align: "left",
						sortable: !this.search || this.search.length < 3
					},
					{
						name: "challenge_rating",
						label: "CR",
						field: "challenge_rating",
						align: "left",
						sortable: !this.search || this.search.length < 3,
						format: val => this.cr(val)
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				]
			},
			visibleColumns() {
				return (this.card_width > 600) ? 
					["name", "type", "challenge_rating", "actions"] : 
					(this.card_width > 450) ? 
					["name", "type", "actions"] :
					["name", "actions"];
			},
			slotsLeft() {
				return this.tier.benefits.npcs - this.npc_count;
			}
		},
		async mounted() {
			await this.fetchNpcs();
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("npcs", ["fetch_npcs", "delete_npc", "get_npc", "add_npc"]),
			async fetchNpcs(loadMore=false) {
				await this.fetch_npcs({
					startAfter: this.getStartAfterResult(loadMore),
					pageSize: this.pagination.rowsPerPage,
					query: this.search,
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(results => {
					this.npcs = (loadMore) ? this.npcs.concat(results) : results;
					this.loading_npcs = false;
				});
			},
			getStartAfterResult(loadMore) {
				if(this.npcs.length && loadMore) {
					return this.npcs.at(-1)[this.pagination.sortBy];
				} return undefined;
			},
			load(req, loadMore=false) {
				this.pagination = req.pagination;
				this.fetchNpcs(loadMore);
			},
			searchNpcs() {
				this.loading_npcs = true;
				this.fetchNpcs();
			},
			cr(val) {
				return (val == 0.125) ? "1/8" : 
					(val == 0.25) ? "1/4" :
					(val == 0.5) ? "1/2" :
					val;
			},
			async downloadJSON(id) {
				const npc = await this.get_npc({ uid: this.userId, id });
				var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(npc, null ,2)); 
				var downloadAnchorNode = document.createElement('a'); 
				downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", npc.name.trim() + ".json");
				document.body.appendChild(downloadAnchorNode);  // required for firefox 
				downloadAnchorNode.click(); 
				downloadAnchorNode.remove(); 
			},
			confirmDelete(e, key, npc, index) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteNpc(key, index);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + npc.name + '?', 'Delete NPC', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deleteNpc(key, index)
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
			async deleteNpc(key, index) {
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
				// Remove the NPC
				this.npcs.splice(index, 1);
				this.delete_npc(key);
			},
			async imported(npcs) {
				if (!(npcs instanceof Array)) {
					npcs = [npcs];
				}
				this.import_dialog = false;
				for (const npc of npcs) {
					await this.add_npc(npc);
				}
				this.$snotify.success(`Imported ${npcs.length} Monsters`, 'Critical hit!', {position: "rightTop"});
			},
			setSize(e) {
				this.card_width = e.width;
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>