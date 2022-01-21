<template>
	<div v-if="tier">
		<hk-card>
			<ContentHeader type="npcs">
				<a slot="actions-left" class="btn btn-sm bg-neutral-5" @click="exportAll()">
					Export NPCs
				</a>
				<a slot="actions-right" class="btn btn-sm bg-neutral-5 mx-2" @click="import_dialog = true">
					Import NPCs
				</a>
			</ContentHeader>
			
			<div class="card-body" v-if="!loading_npcs">
				<p class="neutral-2">
					These are your custom Non-Player Characters and monsters.
				</p> 
				<template v-if="npcs.length">
					<q-input 
						:dark="$store.getters.theme !== 'light'" 
						v-model="search"
						borderless 
						filled square
						debounce="300" 
						clearable
						placeholder="Search NPCs"
					>
						<q-icon slot="prepend" name="search" />
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
						:pagination="{ rowsPerPage: 15 }"
						:filter="search"
						wrap-cells
					>	
						<template v-slot:body-cell="props">
							<q-td 
								v-if="props.col.name === 'avatar'" 
								class="avatar"
								:style="props.value ? `background-image: url('${props.value}')` : ''"
							>
								<i v-if="!props.value" class="hki-monster" />
							</q-td>
							<q-td v-else-if="props.col.name !== 'actions'">
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
									<i class="fas fa-pencil" />
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a class="btn btn-sm bg-neutral-5 mx-2" @click="exportNPC(props.key)">
									<i class="fas fa-arrow-alt-down" />
									<q-tooltip anchor="top middle" self="center middle">
										Download
									</q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="confirmDelete($event, props.key, props.row)">
									<i class="fas fa-trash-alt" />
									<q-tooltip anchor="top middle" self="center middle">
										Delete
									</q-tooltip>
								</a>
							</q-td>
						</template>
						<div slot="no-data" />
						<hk-loader slot="loading" name="NPCs" />
					</q-table>
				</template>

				<router-link v-if="!npcs.length && !overencumbered" class="btn btn-lg bg-neutral-5" to="/content/npcs/add-npc">
					<i class="fas fa-plus green mr-1" /> Create your first NPC
				</router-link>
				<router-link v-else-if="tier.name === 'Free'" class="btn bg-neutral-8 btn-block" to="/patreon">
					Get more NPC slots
				</router-link>
				<q-resize-observer @resize="setSize" />
			</div>
			<hk-loader v-else name="NPCs" />
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
	import { mapActions, mapGetters } from "vuex";
	import { monsterMixin } from "@/mixins/monster";
	import ImportNPC from "@/components/ImportNPC.vue";
	import ContentHeader from "@/components/userContent/ContentHeader";

	export default {
		name: "Npcs",
		metaInfo: {
			title: "NPCs"
		},
		mixins: [monsterMixin],
		components: {
    ImportNPC,
		ContentHeader
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				import_dialog: false,
				loading_npcs: true,
				search: "",
				card_width: 0,
				columns: [
					{
						name: "avatar",
						label: "",
						field: "avatar",
						align: "left"
					},
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: true,
						align: "left",
						format: val => val.capitalizeEach()
					},
					{
						name: "type",
						label: "Type",
						field: "type",
						align: "left",
						sortable: true
					},
					{
						name: "challenge_rating",
						label: "CR",
						field: "challenge_rating",
						align: "left",
						sortable: true,
						format: val => this.cr(val)
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				"tier",
				"overencumbered",
			]),
			...mapGetters("npcs", ["npcs"]),
			...mapGetters("players", ["players"]),
			...mapGetters("campaigns", ["campaigns"]),
			visibleColumns() {
				return (this.card_width > 600) ? 
					["avatar", "name", "type", "challenge_rating", "actions"] : 
					(this.card_width > 450) ? 
					["avatar", "name", "type", "actions"] :
					["avatar", "name", "actions"];
			}
		},
		async mounted() {
			await this.get_npcs();
			this.loading_npcs = false;
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("npcs", ["get_npcs", "delete_npc", "get_npc", "get_full_npcs"]),
			cr(val) {
				return (val == 0.125) ? "1/8" : 
					(val == 0.25) ? "1/4" :
					(val == 0.5) ? "1/2" :
					val;
			},
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
			},
			async exportAll() {
				const all_npcs = await this.get_full_npcs();
				const json_export = Object.values(all_npcs);
				this.downloadJSON(json_export);
			},
			async exportNPC(id) {
				const npc = await this.get_npc({ uid: this.userId, id });
				this.downloadJSON(npc);
			},
			async downloadJSON(data) {
				let filename = "export.json"
				if (data instanceof Array) {
					filename = "harmlesskey_npcs.json";
				}
				else {
					filename = data.name.trim() + ".json";
				}

				var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null ,2)); 
				var downloadAnchorNode = document.createElement('a'); 
				downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", filename);
				document.body.appendChild(downloadAnchorNode);  // required for firefox 
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
			},
		}
	}
</script>