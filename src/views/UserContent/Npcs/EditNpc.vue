<template>
	<div v-if="!loading">
		<ValidationObserver  v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveNpc)" greedy>
				<div>
					<div class="top">
						<q-icon v-if="!valid" name="error" color="red" size="sm" class="mr-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
						<q-btn v-if="!npcId" class="mx-1" color="neutral-5" no-caps @click="copy_dialog = true">
							<i class="fas fa-copy mr-2"></i>
							Copy
						</q-btn>
						<q-btn v-if="!npcId" color="neutral-5" no-caps @click="import_dialog = true">
							<i class="fas fa-file-upload mr-2"></i>
							Import
						</q-btn>
					</div>

					<div class="form">
						<BasicInfo v-model="npc" />

						<Senses v-model="npc" />

						<AbilityScores v-model="npc" />

						<Skills v-model="npc" />

						<Defenses v-model="npc" />

						<SpellCasting v-model="npc" />

						<Actions v-model="npc" />
					</div>

					<!-- HANDLING -->
					<div class="save">
						<div class="buttons">
							<q-icon v-if="!valid" name="error" color="red" size="md" class="mr-2">
								<q-tooltip anchor="top middle" self="center middle">
									There are validation errors
								</q-tooltip>
							</q-icon>
							<router-link :to="`/content/npcs`" class="btn bg-neutral-5 mr-2">Cancel</router-link>
							<q-btn label="Save" type="submit" color="primary" no-caps />
						</div>
						<div class="d-flex justify-content-start unsaved_changes">
							<template v-if="unsaved_changes">
								<div  class="orange truncate mr-2 d-none d-md-block">
									<i class="fas fa-exclamation-triangle"></i> Unsaved changes
								</div>	
								<a class="btn btn-sm bg-neutral-5" @click="revert_changes()">
									<i class="fas fa-undo" />
									Revert
								</a>
							</template>
						</div>
					</div>
				</div>
			</q-form>
		</ValidationObserver>

		<!-- COPY DIALOG -->
		<q-dialog v-model="copy_dialog">
			<hk-card :minWidth="320">
				<div slot="header" class="card-header">
					<span>Copy Existing NPC</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
				<div class="card-body">
					<q-btn-toggle
						v-if="npc_count"
						class="mb-3"
						:value="copy_resource"
						spread
						no-caps
						toggle-color="primary"
						@input="changeCopyResource($event)"
						:options="[
							{label: 'Custom NPCs', value: 'custom'},
							{label: 'SRD monsters', value: 'srd'}
						]"
					/>
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							:label="copy_resource === 'custom' ? 'Search NPC' : 'Search monster'"
							type="text" 
							autocomplete="off" 
							v-model="query" 
							@change="search"
							class="mb-3"
							:error="!!noResult"
							:error-message="noResult"
						>
							<template v-slot:append>
								<q-icon name="fas fa-search" size="xs" @click="searchNPC()" />
							</template>
						</q-input>
						<q-list :dark="$store.getters.theme === 'dark'">
							<q-item v-for="(npc, index) in searchResults" :key="index" class="bg-neutral-8">
								<q-item-section>
									{{ npc.name.capitalizeEach() }}
								</q-item-section>
								<q-item-section avatar>
									<a class="btn btn-sm bg-neutral-5" @click="copy(copy_resource === 'custom' ? npc.key : npc._id)">
										<i class="fas fa-copy"/>
									</a>
								</q-item-section>
							</q-item>
						</q-list>
				</div>
			</hk-card>
		</q-dialog>		
		
		<!-- Import Dialog  -->
		<q-dialog v-model="import_dialog">
			<hk-card :minWidth="400">
				<div slot="header" class="card-header">
					<span>Import NPC from JSON</span>
					<q-btn padding="xs" no-caps icon="fas fa-times" size="sm" flat v-close-popup />
				</div>
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

						<q-form @submit="handleSubmit(parse_JSON_input)">
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
	<hk-loader v-else name="NPC" />
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import BasicInfo from '@/components/npcs/BasicInfo';
	import Senses from '@/components/npcs/Senses';
	import AbilityScores from '@/components/npcs/AbilityScores';
	import Skills from '@/components/npcs/Skills';
	import Defenses from '@/components/npcs/Defenses';
	import SpellCasting from '@/components/npcs/SpellCasting';
	import Actions from '@/components/npcs/Actions';

	export default {
		name: 'Npcs',
		mixins: [general],
		metaInfo: {
			title: 'NPC\'s'
		},
		components: {
			BasicInfo,
			Senses,
			AbilityScores,
			Skills,
			Defenses,
			SpellCasting,
			Actions,
		},
		data() {
			return {
				userId: this.$route.params.userid || this.$store.getters.user.uid,
				npcId: this.$route.params.id,
				npc: {},
				loading: false,
				npc_copy: {},
				copy_dialog: false,
				copy_resource_setter: undefined,
				import_dialog: false,
				unsaved_changes: false,
				query: "",
				searchResults: [],
				noResult: "",
				json_file: undefined,
				json_input: "",
				tabs: [
					{
						name: "advanced",
						label: "Advanced build",
					},
					{
						name: "quick",
						label: "Quick build",
					}
				]
			}
		},
		async mounted() {
			if(this.npcId) {
				this.loading = true;
				await this.get_npc({ uid: this.userId, id: this.npcId }).then(npc => {
					npc.name = npc.name.capitalizeEach();
					this.npc = npc;
					this.npc_copy = JSON.stringify(npc);
					this.unsaved_changes = false;
					this.loading = false;
				});
			}

			var npcs_ref = db.ref(`monsters`);
			npcs_ref.on('value', async (snapshot) => {
				let npcs = snapshot.val();

				let custom = db.ref(`npcs/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customNpcs = snapshot.val();
					for(let key in customNpcs) {
						npcs.push(customNpcs[key]);
					}
				});
				this.npcs = npcs;
			});
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("npcs", ["npc_count"]),
			copy_resource: {
				get() {
					const resource = (this.npc_count) ? "custom" : "srd";
					return (this.copy_resource_setter) ? this.copy_resource_setter : resource;
				},
				set(newVal) {
					this.copy_resource_setter = newVal;
				}
			},
		},
		watch: {
			npc: {
				deep: true,
				handler(newVal) {
					if (JSON.stringify(newVal) !== this.npc_copy) {
						this.unsaved_changes = true;
					} else {
						this.unsaved_changes = false;
					}
					
					// Capitalize name
					this.npc.name = this.npc.name.capitalizeEach();
				},
			},

		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("monsters", ["get_monsters", "get_monster"]),
			...mapActions("npcs", ["add_npc", "edit_npc", "get_npc", "fetch_npcs"]),
			isOwner() {
				if (this.$route.name == 'Edit Companion') {
					return false;
				} return true;
			},
			changeCopyResource(value) {
				this.copy_resource = value;
				this.query = "";
				this.searchResults = [];
				this.noResult = "";
			},
			async search() {
				if(this.query) {
					if(this.copy_resource === "custom") {
						await this.fetch_npcs({
						query: this.query
					}).then(results => {
						if(results && results.length) {
							this.noResult = "";
							this.searchResults = results;
							this.loading_npcs = false;
						} else {
							this.searchResults = [];
							this.noResult = 'Nothing found starting with "' + this.query + '"';
						}
					});
					} else {
						await this.get_monsters({ query: { search: this.query }}).then(results => {
							if(results.meta.count === 0) {
								this.noResult = 'No results for "' + this.query + '"';
							} else {
								this.noResult = "";
								this.searchResults = results.results;
							}
						});
					}
				}
			},
			async copy(id) {
				this.copy_dialog = false;
				this.npc = (this.copy_resource === "custom")
					? await this.get_npc({ uid: this.userId, id })
					: await this.get_monster(id);

				// Clear search
				this.searchResults = [];
				this.query = "";
			},
			revert_changes() {
				this.npc = JSON.parse(this.npc_copy);
				this.npc_copy = JSON.stringify(this.npc);
				this.unsaved_changes = false;
			},
			/**
			 * Checks if a new NPC must be added, or an existing NPC must be saved.
			**/
			saveNpc() {
				if(this.$route.name === "Add NPC" && !this.npcId) {
					this.addNpc();
				} else {
					this.editNpc();
				}
			},
			addNpc() {
				this.add_npc(this.npc).then((res) => {
					// Set the npcId, so we know there is an existing NPC
					// even though we are on the AddNPC route, this we won't create multiple when hitting save again
					this.$set(this, "npcId", res);

					this.$snotify.success('Monster Saved.', 'Critical hit!', {
						position: "rightTop"
					});

					// Capitalize before stringyfy so changes found isn't triggered
					this.npc.name = this.npc.name.capitalizeEach();
					this.npc_copy = JSON.stringify(this.npc);
					this.unsaved_changes = false;
				}).catch(error => {
					this.$snotify.error('Couldn\'t save mosnter.', 'Save failed', {
						position: "rightTop"
					});
					console.error(error);
					console.log(this.npc);
				});
			},
			editNpc() {
				this.edit_npc({ 
					uid: this.userId,
					id: this.npcId,
					npc: this.npc
				}).then(() => {
					this.$snotify.success('Monster Saved.', 'Critical hit!', {
						position: "rightTop"
					});

					this.unsaved_changes = false;
	
					// Capitalize before stringyfy so changes found isn't triggered
					this.npc.name = this.npc.name.capitalizeEach();
					this.npc_copy = JSON.stringify(this.npc);
				});
			},
			loadJSON() {
				const fr = new FileReader();

				fr.onload = e => {
					const result = JSON.parse(e.target.result)
					// const formatted = JSON.stringify(result, null, 2)
					// console.log(formatted)
					delete result.key

					this.npc = result
					this.import_dialog = false
					this.json_file = undefined

					console.log(this.npc)
				}

				fr.readAsText(this.json_file)
			},
			parse_JSON_input() {

				try {
					this.npc = JSON.parse(this.json_input)
					this.import_dialog = false
					this.json_input = ""
				} 
				catch {
					console.log("Invalid JSON")
					this.$snotify.error("Invalid JSON")
				}
				
			}
		},
		beforeRouteLeave(to, from, next) {
			if (this.unsaved_changes) {
				this.$snotify.error('There are unsaved changes in the form.\n Would you like to continue?', 'Unsaved Changes', {
					buttons: [
					{ text: 'Leave', action: (toast) => { next(); this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'Stay', action: (toast) => { next(false); this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			} else {
				next()
			}
		},
	}
</script>

<style lang="scss" scoped>
.content {

	.top {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-bottom: 10px;

		.name {
			user-select: none;
			justify-content: flex-end;
			line-height: 35px;

			.img {
				width: 31px;
				height: 31px;
				background-position: center top;
				background-size: cover;
				border: solid 1px $neutral-4;
				margin: 2px 0 2px 5px;
				border-radius: 50%;
			}
		}
	}
	.save {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		position: sticky;
		bottom: 5px;
		padding: 10px 10px;
		margin: 5px 5px;
		background: $neutral-9;
		border: solid 1px $neutral-8;
		border-radius: $border-radius;
		flex-direction: row-reverse;

		.unsaved_changes {
			margin: 0 10px 0 0;
			line-height: 31px;
		}
		.buttons {
			display: flex;
			justify-content: flex-end;
		}
		@media only screen and (max-width: 343px) {
			.buttons {
				margin-bottom: 15px;
			}
		}
	}
}

</style>