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
					@click="bulk_import_dialog = true"
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
						placeholder="Search">
						<q-icon slot="append" name="search" />
					</q-input>

					<q-table
						:data="npcs"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_npcs"
						separator="none"
						wrap-cells
						:rows-per-page-options="[0]"
						@request="request"
					>	
						<template v-slot:header="props">
							<q-tr :props="props">
								<q-th
									v-for="col in props.cols"
									:key="col.name"
									:props="props"
								>
									{{ col.label }}
								</q-th>
							</q-tr>
						</template>

						<!-- Body -->
						<template v-slot:body="props">
							<q-tr :props="props">
								<q-td
									v-for="col in props.cols"
									:key="col.name"
									:props="props"
								>
									<div class="truncate-cell">
										<div class="truncate">
											<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.key}`">
												{{ col.value }}
											</router-link>
											<div v-else-if="col.name === 'actions'">
												<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
													<i class="fas fa-pencil"></i>
													<q-tooltip anchor="top middle" self="center middle">
														Edit
													</q-tooltip>
												</router-link>
												<a class="btn btn-sm bg-neutral-5 mx-2" @click="confirmDelete($event, props.key, props.row, props.index)">
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
											</div>
											<template v-else>{{ col.value }}</template>
										</div>
									</div>
								</q-td>
							</q-tr>
						</template>
							<div slot="pagination">
								1-{{npcs.length}} of {{(search && search.length >= 3) ? npcs.length : npc_count}}
							</div>
						<div slot="no-data" />
						<hk-loader slot="loading" name="monsters" />
					</q-table>
					<q-btn 
						v-if="npcs.length < npc_count"
						slot="bottom-row"
						no-caps 
						color="primary" 
						label="Load more" 
						@click="request({ pagination }, true)"
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
			</div>
		</hk-card>

		<!-- Bulk import dialog -->
		<q-dialog v-model="bulk_import_dialog">
			<hk-card header="Import NPC from JSON" :minWidth="400">
				<div class="card-body">
					<q-file 
						:dark="$store.getters.theme === 'dark'" 
						filled square 
						accept=".json"
						v-model="json_file" 
						@input="loadJSON()"
					>
						<template v-slot:prepend>
							<q-icon name="attach_file" />
						</template>
					</q-file>

					<h4 class="my-3">
						OR
					</h4>
					<ValidationObserver  v-slot="{ handleSubmit }">

						<q-form @submit="handleSubmit(parseJSON)">
							<ValidationProvider rules="json" name="JSON" v-slot="{ errors, invalid, validated}">
								<q-input
									:dark="$store.getters.theme === 'dark'" 
									filled square 
									type="textarea"
									label="JSON Input"
									v-model="json_input"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>

							</ValidationProvider>
							<q-btn class="btn btn-sm my-2" color="primary" no-caps type="submit" :disabled="!json_input">
								Parse Input
							</q-btn>
						</q-form>
					</ValidationObserver>
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

	export default {
		name: "Npcs",
		metaInfo: {
			title: "NPC's"
		},
		mixins: [monsterMixin],
		components: {
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				bulk_import_dialog: false,
				json_file: undefined,
				json_input: undefined,
				loading_npcs: true,
				npcs: [],
				paginationSetter: undefined,
				search: ""
			}
		},
		computed: {
			...mapGetters([
				"tier",
				"campaigns",
				"players",
				"allEncounters",
				"overencumbered",
			]),
			...mapGetters("npcs", ["npc_count"]),
			pagination: {
				get() {
					return (this.paginationSetter) ? this.paginationSetter : {
						sortBy: "name",
						descending: false,
						page: 1,
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
			slotsLeft() {
				return this.tier.benefits.npcs - this.npc_count;
			}
		},
		async mounted() {
			await this.fetchNpcs();
		},
		watch: {
			search(newVal) {
				if(!newVal || newVal.length >= 3) {
					this.fetchNpcs();
				}
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("npcs", ["fetch_npcs", "delete_npc", "get_npc"]),
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
			request(req, loadMore=false) {
				this.pagination = req.pagination;
				this.fetchNpcs(loadMore);
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
			deleteNpc(key, index) {
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
				//Remove NPC from database and store
				console.log(index)
				this.delete_npc(key);
			},
			loadJSON() {
				const fr = new FileReader();

				fr.onload = e => {
					const result = JSON.parse(e.target.result)
					// const formatted = JSON.stringify(result, null, 2)
					// console.log(formatted)
					delete result.key

					console.log(result)
					
					this.import_dialog = false
					this.json_file = undefined

				}

				fr.readAsText(this.json_file)
			},
			parseJSON() {

				let input = JSON.parse(this.json_input)
				delete input.key
				
				this.npc = input

				this.import_dialog = false
				this.json_input = ""
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>