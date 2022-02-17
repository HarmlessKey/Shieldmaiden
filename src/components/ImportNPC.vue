<template>
	<div>
		<template v-if="!parsed && !parsing">
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
		</template>
		<hk-loader v-else-if="!parsed" prefix="Validating" />
		<div v-else-if="!importing">
			<template v-for="type in Object.keys(imports)">
				<div v-if="imports[type].length" class="mb-4" :key="type">
					<p>
						Found <span :class="type === 'unique' ? 'green' : 'orange'">
							{{ imports[type].length }} {{ type === "unique" ? "new" : "duplicate" }}
						</span> NPCs
					</p>
					<q-table
						class="sticky-header-table mb-2"
						:virtual-scroll-sticky-size-start="48"
						:dark="$store.getters.theme !== 'light'"
						flat dense square
						:data="imports[type]"
						:columns="columns"
						row-key="index"
						virtual-scroll
						:pagination.sync="pagination"
						:rows-per-page-options="[0]"
						selection="multiple"
						:selected.sync="selected[type]"
						hide-bottom
					>
						<template v-slot:body-cell-invalid="props">
							<td class="text-right">
								<hk-popover v-if="props.row.errors">
									<q-icon name="error" class="red" />
									<div slot="content">
										NPC is invalid.
										<div v-for="(error, i) in props.row.errors" :key="`${props.row.index}-error-${i}`" class="red">
											{{ error.message.capitalize() }} 
										</div>
									</div>
								</hk-popover>
							</td>
						</template>
					</q-table>
					<q-toggle 
						v-if="type === 'duplicate'"
						v-model="overwrite" 
						label="Overwrite duplicates" 
						unchecked-icon="none"
					/>
				</div>
			</template>
			<div v-if="importTotal > availableSlots">
				Insufficient slots. You're trying to import <b class="red">{{ importTotal }}</b> NPCs,<br/> 
				but have only <b class="red">{{ availableSlots }}</b> slots available.
			</div>

			<div class="d-flex justify-content-end">
				<q-form @submit="import_npcs">
					<q-btn 
						color="primary" 
						no-caps 
						type="submit"
						:disabled="(!selected.unique.length && !selected.duplicate.length) || importTotal > availableSlots"
					>
						Import NPCs
					</q-btn>
				</q-form>
			</div>
		</div>
		<div v-else>
			<h3 class="text-center">
				{{ (imported &lt; importing) ? "Importing" : "Imported" }} {{ importing }} NPCs
			</h3>
			<q-linear-progress 
				:dark="$store.getters.theme !== 'light'" 
				stripe rounded size="20px" 
				:value="imported/importing" 
				color="primary" 
				class="mb-4"
			/>

			<q-expansion-item v-if="failed_imports.length" class="mb-4">
				<template slot="header">
					<q-item-section avatar>
						<b class="red">{{ failed_imports.length }}</b>
					</q-item-section>
					<q-item-section class="red">Failed imports</q-item-section>
				</template>
				<div class="bg-neutral-8 px-3 py-2">
					Import failed for these NPCs
					<ol>
						<li v-for="(failed, i) in failed_imports" :key="`failed-${i}`">
							{{ failed.capitalizeEach() }}
						</li>
					</ol>
					<p>
						Make sure there are no validation errors.<br/>
						<a @click="showSchema = true">Compare with our schema.</a>
					</p>
				</div>
			</q-expansion-item>

			<p v-if="imported < importing" class="text-center">
				<hk-animated-integer :value="imported" /> / {{ importing }} imported.
			</p>
			<div v-else>
				<p class="text-center green">
					Finished import!
				</p>
				<q-btn no-caps label="Close" color="neutral-5" class="full-width" v-close-popup />
			</div>
		</div>
		<q-dialog v-model="showSchema">
			<hk-card header="NPC Schema">
				<div slot="header" class="card-header">
					<span>NPC Schema</span>
					<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" v-close-popup />
				</div>
				<div class="card-body">
					<p>
						You can use <a href="https://www.jsonschemavalidator.net/" target="_blank">this schema validator</a> to find errors in your NPC.<br/>
						Paste our schema in the left field and the JSON of your NPC in the right.
					</p>
					<a class="btn btn-sm mb-2" @click="copySchema">Copy schema</a>
					<h3>HK NPC Schema</h3>
					<div class="bg-neutral-8 px-2 py-2 overflow-auto">
						<pre>
							{{ schema }}
						</pre>
					</div>
					<input :value="JSON.stringify(schema)" id="copy" type="hidden" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import schema from "@/schemas/hk-npc-schema.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv, ["uri"]);

export default {
	name: "ImportNPCs",
	data() { 
		return {
			schema: schema,
			showSchema: false,
			json_file: undefined,
			json_input: undefined,
			overwrite: true,
			parsing: false,
			parsed: false,
			failed_imports: [],
			importing: undefined,
			imported: 0,
			imports: {
				unique: [],
				duplicate: []
			},
			selected: {
				unique: [],
				duplicate: []
			},
			uid: this.$store.getters.user.uid,
			columns: [
				{
					name: "name",
					label: "Name",
					field: "name",
					sortable: true,
					align: "left",
					format: val => val.capitalizeEach()
				},
				{
					name: "invalid",
					label: "",
					field: "errors",
					align: "right"
				}
			],
			pagination: { 
				rowsPerPage: 0
			}
		}
	},
	computed: {
		...mapGetters(["tier"]),
		...mapGetters("npcs", ["npcs", "npc_count"]),
		availableSlots() {
			return (this.tier.benefits.npcs === "infinite") ? Infinity : this.tier.benefits.npcs - this.npc_count;
		},
		importTotal() {
			return (!this.overwrite) ? this.selected.unique.length + this.selected.duplicate.length : this.selected.unique.length;
		}
	},
	async mounted() {
		await this.get_npcs();
	},
	methods: {
		...mapActions("npcs", [
			"get_full_npcs", 
			"add_npc", 
			"edit_npc", 
			"get_npcs"
		]),
		loadJSON() {
			const fr = new FileReader();

			fr.onload = e => {
				let result = JSON.parse(e.target.result)
				this.parse(result);
			}

			fr.readAsText(this.json_file)
		},
		parseJSON() {
			try {
				const result = JSON.parse(this.json_input);
				console.log('result',result)
				this.parse(result);
			}
			catch {
				console.log("Invalid JSON");
				this.$snotify.error("Invalid JSON");
			} 
		},

		async parse(npcs) {
			this.parsing = true;
			if (!(npcs instanceof Array)) {
				npcs = [npcs];
			}

			// Validate NPCs
			for(const npc of npcs) {
				const valid = ajv.validate(schema, npc);

				if(!valid) {
					console.log(ajv.errors)
					npc.errors = ajv.errors;
				}
			}

			// Filter out duplicate NPCs
			this.imports.duplicate = npcs.filter(npc => {
				return this.npcs.map(npc => { return npc.name }).includes(npc.name);
			});
			// Add index for selection
			this.imports.duplicate.forEach((row, index) => {
				row.index = index
			});

			// Filter out new NPCs
			this.imports.unique = npcs.filter(npc => {
				return !this.npcs.map(npc => { return npc.name }).includes(npc.name);
			});
			// Add index for selection
			this.imports.unique.forEach((row, index) => {
				row.index = index
			});

			this.parsed = true;
		},
		async import_npcs() {
			if(this.importTotal <= this.availableSlots) {
				this.importing = this.selected.unique.length + this.selected.duplicate.length;
				for (const npc of this.selected.unique) {
					delete npc.index; // Was added for selecion
					try {
						await this.add_npc(npc);
					} catch {
						this.failed_imports.push(npc.name);
					}
					this.imported++;
				}
	
				for (const npc of this.selected.duplicate) {
					delete npc.index; // Was added for selecion
					if(this.overwrite) {
						// Get the id of the existing NPC with the same name
						const id = this.npcs.filter(item => { return item.name === npc.name})[0].key;
						try {
							await this.edit_npc({
								uid: this.uid,
								id,
								npc
							});
						} catch {
							this.failed_imports.push(npc.name);
						}
					} else {
						try {
							await this.add_npc(npc);
						} catch {
							this.failed_imports.push(npc.name);
						}
					}
					this.imported++;
				}
			}
		},
		copySchema() {
			const toCopy = document.querySelector('#copy')
			toCopy.setAttribute('type', 'text') //hidden
			toCopy.select()

			try {
				const successful = document.execCommand('copy');
				const msg = successful ? 'Successful' : 'Unsuccessful';

				this.$snotify.success(msg, 'Schema copied', {
					position: "rightTop"
				});
			} catch (err) {
				this.$snotify.error("Unsuccessful", 'Schema not copied', {
					position: "rightTop"
				});
			}

			/* unselect the range */
			toCopy.setAttribute('type', 'hidden')
			window.getSelection().removeAllRanges()
		},
	}
}
</script>

<style lang="scss" scoped>
	.q-expansion-item {
		background-color: $neutral-9;
	}
</style>