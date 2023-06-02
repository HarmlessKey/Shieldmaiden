<template>
	<div>
		<template v-if="!parsed && !parsing">
			<p>
				Import Harmless Key {{ type_label }}.<br />
				<small><em>Content from other sources can't be imported</em></small>
			</p>
			<q-file
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				accept=".json"
				v-model="json_file"
				@input="loadJSON()"
				label="Drag a file here or click to upload"
			>
				<template v-slot:prepend>
					<q-icon name="attach_file" />
				</template>
			</q-file>

			<h4 class="my-3 text-center">OR</h4>
			<ValidationObserver v-slot="{ handleSubmit }">
				<q-form @submit="handleSubmit(parseJSON)">
					<ValidationProvider rules="json" name="JSON" v-slot="{ errors, invalid, validated }">
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label-slot
							type="textarea"
							v-model="json_input"
							:error="invalid && validated"
							:error-message="errors[0]"
						>
							<template #label>
								<i class="fas fa-brackets-curly mr-1" aria-hidden="true" />
								JSON Input
							</template>
						</q-input>
					</ValidationProvider>
					<q-btn
						class="full-width my-2"
						color="primary"
						no-caps
						type="submit"
						:disabled="!json_input"
					>
						Parse Input
					</q-btn>
				</q-form>
			</ValidationObserver>
		</template>
		<hk-loader v-else-if="!parsed" prefix="Validating" :title="type_label" />
		<div v-else-if="!importing">
			<template v-for="import_type in Object.keys(imports)">
				<div v-if="imports[import_type].length" class="mb-4" :key="import_type">
					<p>
						Found
						<span :class="import_type === 'unique' ? 'green' : 'orange'">
							{{ imports[import_type].length }} {{ import_type === "unique" ? "new" : "duplicate" }}
						</span>
						{{ type_label }}
					</p>
					<q-table
						class="sticky-header-table mb-2 no-table-margin"
						:virtual-scroll-sticky-size-start="48"
						:dark="$store.getters.theme !== 'light'"
						flat
						dense
						square
						:data="imports[import_type]"
						:columns="columns"
						row-key="index"
						virtual-scroll
						:pagination.sync="pagination"
						:rows-per-page-options="[0]"
						selection="multiple"
						:selected.sync="selected[import_type]"
						hide-bottom
					>
						<template v-slot:body-cell-invalid="props">
							<td class="text-right">
								<hk-popover v-if="props.row.errors" header="Validation errors">
									<q-icon name="error" class="red" />
									<div slot="content">
										<ol class="px-3">
											<li
												v-for="(error, i) in props.row.errors"
												:key="`${props.row.index}-error-${i}`"
												class="red"
											>
												<strong v-if="error.instancePath" class="neutral-1">
													{{ error.instancePath }}
												</strong>
												{{ error.message.capitalize() }}
											</li>
										</ol>
									</div>
								</hk-popover>
							</td>
						</template>
					</q-table>
					<q-toggle
						v-if="import_type === 'duplicate'"
						v-model="overwrite"
						label="Overwrite duplicates"
						unchecked-icon="none"
					/>
				</div>
			</template>
			<template v-if="Object.values(custom_spells).length">
				<p>
					Found
					<span class="yellow"> {{ Object.values(custom_spells).length }}</span>
					Custom Spells
					<q-toggle
						v-model="import_custom_spells"
						label="Import custom spells"
						unchecked-icon="none"
					/>
				</p>
				<template v-if="import_custom_spells">
					<q-table
						class="sticky-header-table mb-2 no-table-margin"
						:virtual-scroll-sticky-size-start="48"
						:dark="$store.getters.theme !== 'light'"
						flat
						dense
						square
						virtual-scroll
						:pagination.sync="pagination"
						:rows-per-page-options="[0]"
						:data="Object.values(custom_spells)"
						:columns="columns"
						row-key="index"
						hide-bottom
					>
						<template v-slot:body-cell-invalid="props">
							<td class="text-right">
								<hk-popover v-if="props.row.errors" header="Validation errors">
									<q-icon name="error" class="red" />
									<div slot="content">
										<ol class="px-3">
											<li
												v-for="(error, i) in props.row.errors"
												:key="`${props.row.index}-error-${i}`"
												class="red"
											>
												<strong v-if="error.instancePath" class="neutral-1">
													{{ error.instancePath }}
												</strong>
												{{ error.message.capitalize() }}
											</li>
										</ol>
									</div>
								</hk-popover>
							</td>
						</template>
					</q-table>
					<template v-if="Object.keys(this.custom_spells).length > this.availableSpellSlots">
						<div>
							Insufficient spell slots. You're trying to import
							<strong class="red">{{ Object.keys(this.custom_spells).length }}</strong>
							spells,<br />
							but have only <strong class="red">{{ availableSpellSlots }}</strong> slots available.
						</div>
						<router-link class="btn btn-sm bg-patreon-red my-2" to="/patreon">
							<i aria-hidden="true" class="fab fa-patreon white mr-1" />
							Get more slots
						</router-link>
					</template>
				</template>
			</template>
			<div v-if="importTotal > availableSlots">
				Insufficient slots. You're trying to import
				<strong class="red">{{ importTotal }}</strong> {{ type_label }},<br />
				but have only <strong class="red">{{ availableSlots }}</strong> slots available.
			</div>

			<div class="d-flex justify-content-between items-center pb-2">
				<div>
					<strong>{{ selected.unique.length + selected.duplicate.length }}</strong> selected
				</div>
				<q-form @submit="importData">
					<q-btn
						color="primary"
						no-caps
						type="submit"
						:disabled="
							(!selected.unique.length && !selected.duplicate.length) ||
							importTotal > availableSlots
						"
					>
						Import
					</q-btn>
				</q-form>
			</div>
		</div>
		<div v-else>
			<h3 class="text-center">
				<!-- eslint-disable-next-line vue/no-parsing-error -->
				{{ imported < importing ? "Importing" : "Imported" }} {{ importing }} {{ type_label }}
			</h3>
			<q-linear-progress
				:dark="$store.getters.theme !== 'light'"
				stripe
				rounded
				size="20px"
				:value="imported / importing"
				color="primary"
				class="mb-4"
			/>

			<q-expansion-item v-if="failed_imports.length" class="mb-4">
				<template slot="header">
					<q-item-section avatar>
						<strong class="red">{{ failed_imports.length }}</strong>
					</q-item-section>
					<q-item-section class="red">Failed imports</q-item-section>
				</template>
				<div class="bg-neutral-8 px-3 py-2">
					<p>Import failed for these {{ type_label }}</p>
					<q-list dense class="mb-2">
						<q-item v-for="(failed, i) in failed_imports" :key="`failed-${i}`" class="bg-neutral-9">
							<q-item-section>
								{{ failed.name.capitalizeEach() }}
							</q-item-section>
							<q-item-section avatar>
								<hk-popover v-if="failed.errors" header="Validation errors">
									<q-icon name="error" class="red" />
									<div slot="content">
										<ol class="px-3">
											<li
												v-for="(error, index) in failed.errors"
												:key="`${i}-error-${index}`"
												class="red"
											>
												<strong v-if="error.instancePath" class="neutral-1">
													{{ error.instancePath }}
												</strong>
												{{ error.message.capitalize() }}
											</li>
										</ol>
									</div>
								</hk-popover>
							</q-item-section>
						</q-item>
					</q-list>
					<p>
						Make sure there are no validation errors.<br />
						<a @click="showSchema = true">Compare with our schema.</a>
					</p>
				</div>
			</q-expansion-item>

			<p v-if="imported < importing" class="text-center">
				<hk-animated-integer :value="imported" /> / {{ importing }} imported.
			</p>
			<div v-else>
				<p class="text-center green">Finished import!</p>
				<q-btn no-caps label="Close" color="neutral-5" class="full-width" v-close-popup />
			</div>
		</div>
		<q-dialog v-model="showSchema">
			<hk-card :header="`${type_label} Schema`">
				<div slot="header" class="card-header">
					<span>{{ type_label }} Schema</span>
					<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
				</div>
				<div class="card-body">
					<p>
						You can use
						<a href="https://www.jsonschemavalidator.net/" target="_blank" rel="noopener"
							>this schema validator</a
						>
						to find errors in your {{ type_label }}.<br />
						Paste our schema in the left field and the JSON of your {{ type_label }} in the right.
					</p>
					<a class="btn btn-sm mb-2" @click="copySchema">Copy schema</a>
					<h3>HK {{ type_label }} Schema</h3>
					<div class="bg-neutral-8 px-2 py-2 overflow-auto">
						<pre>
							{{ this.schema }}
						</pre
						>
					</div>
					<input :value="JSON.stringify(this.schema)" id="copy" type="hidden" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import npcSchema from "src/schemas/hk-npc-schema.json";
import spellSchema from "src/schemas/hk-spell-schema.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv, ["uri"]);

export default {
	name: "ImportContent",
	props: {
		type: {
			type: String,
			default: "npcs",
			required: true,
		},
	},
	data() {
		return {
			showSchema: false,
			json_file: undefined,
			json_input: undefined,
			overwrite: true,
			parsing: false,
			parsed: false,
			map_old_to_custom: {},
			custom_spells: {},
			import_custom_spells: true,
			failed_imports: [],
			importing: undefined,
			imported: 0,
			imports: {
				unique: [],
				duplicate: [],
			},
			selected: {
				unique: [],
				duplicate: [],
			},
			uid: this.$store.getters.user.uid,
			columns: [
				{
					name: "name",
					label: "Name",
					field: "name",
					sortable: true,
					align: "left",
					format: (val) => val.capitalizeEach(),
				},
				{
					name: "invalid",
					label: "",
					field: "errors",
					align: "right",
				},
			],
			pagination: {
				rowsPerPage: 0,
			},
		};
	},
	computed: {
		...mapGetters(["tier"]),
		...mapGetters("npcs", ["npcs", "npc_count"]),
		...mapGetters("spells", ["spells", "spell_count"]),
		type_label() {
			return this.type === "npcs" ? "NPCs" : "Spells";
		},
		schema() {
			return this.type === "npcs" ? npcSchema : spellSchema;
		},
		data() {
			return this.type === "npcs" ? this.npcs : this.spells;
		},
		content_count() {
			return this.type === "npcs" ? this.npc_count : this.spell_count;
		},
		availableSlots() {
			return this.tier.benefits[this.type] === "infinite"
				? Infinity
				: this.tier.benefits[this.type] - this.content_count;
		},
		availableSpellSlots() {
			return this.tier.benefits["spells"] === "infinite"
				? Infinity
				: this.tier.benefits["spells"] - this.spell_count;
		},
		importTotal() {
			return !this.overwrite
				? this.selected.unique.length + this.selected.duplicate.length
				: this.selected.unique.length;
		},
	},
	async mounted() {
		this.type === "npcs" ? await this.get_npcs() : await this.get_spells();
	},
	methods: {
		...mapActions("npcs", ["add_npc", "edit_npc", "get_npcs", "get_npc"]),
		...mapActions("spells", [
			"add_spell",
			"edit_spell",
			"get_spells",
			"get_spell",
			"get_spell_id_by_name",
			"reserve_spell_id",
		]),
		async getItem(id) {
			return this.type === "npcs"
				? this.get_npc({ uid: this.uid, id })
				: this.get_spell({ uid: this.uid, id });
		},
		async addItem(item) {
			this.type === "npcs" ? await this.add_npc(item) : await this.add_spell({ spell: item });
		},
		async editItem(id, item) {
			this.type === "npcs"
				? this.edit_npc({ uid: this.uid, id, npc: item })
				: this.edit_spell({ id, spell: item });
		},
		loadJSON() {
			const fr = new FileReader();

			fr.onload = (e) => {
				let result = JSON.parse(e.target.result);
				this.parse(result);
			};

			fr.readAsText(this.json_file);
		},
		parseJSON() {
			try {
				const result = JSON.parse(this.json_input);
				this.parse(result);
			} catch {
				this.$snotify.error("Invalid JSON");
			}
		},

		async parse(data) {
			this.parsing = true;
			if (!(data instanceof Array)) {
				data = [data];
			}

			// Validate items
			for (const item of data) {
				// Delete damage_vulnerability property.
				delete item.damage_vulnerability;
				delete item.created;
				delete item.updated;

				let checkable_item = item;
				// Parse versatile to options for NPCs
				if (this.type === "npcs") {
					checkable_item = await this.parseCustomSpells(item);
					checkable_item = this.versatileToOptions(checkable_item);
				}

				const valid = ajv.validate(this.schema, checkable_item);

				if (!valid) {
					item.errors = ajv.errors;
				}
			}

			// Filter out duplicate items
			this.imports.duplicate = data.filter((filter_item) => {
				return this.data
					.map((map_item) => {
						return map_item.name.toLowerCase();
					})
					.includes(filter_item.name.toLowerCase());
			});
			// Add index for selection
			this.imports.duplicate.forEach((row, index) => {
				row.index = index;
			});

			// Filter out new items
			this.imports.unique = data.filter((filter_item) => {
				return !this.data
					.map((map_item) => {
						return map_item.name.toLowerCase();
					})
					.includes(filter_item.name.toLowerCase());
			});
			// Add index for selection
			this.imports.unique.forEach((row, index) => {
				row.index = index;
			});

			this.parsed = true;
		},
		async importData() {
			// First check if there are custom spells from imported NPCs that need to be added.
			if (
				this.import_custom_spells &&
				this.custom_spells &&
				Object.keys(this.custom_spells).length <= this.availableSpellSlots
			) {
				for (const [key, spell] of Object.entries(this.custom_spells)) {
					try {
						// TODO: use parse function to filter out spells
						await this.add_spell({ spell: spell, predefined_key: key });
					} catch (error) {
						this.failed_imports.push(spell);
					}
				}
			}

			if (this.importTotal <= this.availableSlots) {
				this.importing = this.selected.unique.length + this.selected.duplicate.length;
				for (const item of this.selected.unique) {
					delete item.index; // Was added for selection
					delete item.player_id; // Should never be imported. Account related property.

					try {
						await this.addItem(item);
					} catch {
						this.failed_imports.push(item);
					}
					this.imported++;
				}

				for (const item of this.selected.duplicate) {
					delete item.index; // Was added for selection
					delete item.player_id; // Should never be imported. Account related property.

					if (this.overwrite) {
						// Get the id of the existing item with the same name
						const id = this.data.filter((i) => {
							return i.name.toLowerCase() === item.name.toLowerCase();
						})[0].key;
						try {
							// Fetch the full existing item
							const existing_item = this.getItem(id);

							// Keep the player_id of the existing NPC, or remove it if the existing has no player_id
							// This is an account related property for companions that shouldn't change with imports
							if (this.type === "npcs") {
								item.player_id = existing_item.player_id ? existing_item.player_id : null;
							}

							// Edit the item
							await this.editItem(id, item);
						} catch {
							this.failed_imports.push(item);
						}
					} else {
						try {
							await this.addItem(item);
						} catch {
							this.failed_imports.push(item);
						}
					}
					this.imported++;
				}
			}
		},
		copySchema() {
			const toCopy = document.querySelector("#copy");
			toCopy.setAttribute("type", "text"); //hidden
			toCopy.select();

			try {
				const successful = document.execCommand("copy");
				const msg = successful ? "Successful" : "Unsuccessful";

				this.$snotify.success(msg, "Schema copied", {
					position: "rightTop",
				});
			} catch (err) {
				this.$snotify.error("Unsuccessful", "Schema not copied", {
					position: "rightTop",
				});
			}

			/* unselect the range */
			toCopy.setAttribute("type", "hidden");
			window.getSelection().removeAllRanges();
		},

		/**
		 * Turn old versatile abilities into abilities with options
		 * @param {object} npc
		 */
		versatileToOptions(npc) {
			const ability_types = ["special_abilities", "actions", "legendary_actions", "reactions"];
			const versatile_options = ["damage_type", "magical", "dice_count", "dice_type", "fixed_val"];

			// Check all rolls in all actions in all ability types of an NPC
			for (const type of ability_types) {
				if (npc[type]) {
					for (const ability of npc[type]) {
						if (ability.versatile) {
							// Turn versatile into options
							this.$set(ability, "options", [
								ability.versatile_one || "Option 1",
								ability.versatile_two || "Option 2",
							]);
							// Remove versatile
							this.$delete(ability, "versatile");
							this.$delete(ability, "versatile_one");
							this.$delete(ability, "versatile_two");

							// In the actions find rolls with versatile options set
							if (ability.action_list && ability.action_list.length) {
								for (const action of ability.action_list) {
									if (action.rolls) {
										let options;
										for (const roll of action.rolls) {
											for (const option of versatile_options) {
												if (
													roll[`versatile_${option}`] !== undefined &&
													roll[`versatile_${option}`] !== roll[option]
												) {
													options = !options ? { [ability.options[1]]: {} } : options;
													options[ability.options[1]][option] = roll[`versatile_${option}`];
												}
												this.$delete(roll, `versatile_${option}`);
											}
											this.$set(roll, "options", options);
										}
									}
								}
							}
						}
					}
				}
			}
			return npc;
		},
		async parseCustomSpells(npc) {
			if (npc.custom_spells) {
				for (const [old_key, spell] of Object.entries(npc.custom_spells)) {
					// Check if there already is a spell with name
					delete spell.key;
					delete spell.updated;
					delete spell.created;
					const valid = ajv.validate(spellSchema, spell);
					if (!valid) {
						spell.errors = ajv.errors;
					}
					// Check if spell is already known to importer
					if (!Object.keys(this.map_old_to_custom).includes(old_key)) {
						let spell_id = await this.get_spell_id_by_name({ name: spell.name });
						if (!spell_id) {
							// Generate a id for the spell so when we can link the spell in NPC to a future spell
							const new_spell_id = await this.reserve_spell_id();
							spell_id = new_spell_id;
							this.$set(this.custom_spells, spell_id, spell);
						}

						this.map_old_to_custom[old_key] = spell_id;
					}
				}

				for (const spell_list_type of ["caster_spells", "innate_spells"]) {
					if (npc[spell_list_type]) {
						const spell_list = Object.assign({}, npc[spell_list_type]);
						for (const [spell_key, spell] of Object.entries(spell_list)) {
							if (spell.custom && spell_key in this.map_old_to_custom) {
								npc[spell_list_type][this.map_old_to_custom[spell_key]] = { ...spell };
								delete npc[spell_list_type][spell_key];
							}
						}
					}
				}
				delete npc.custom_spells;
			}
			return npc;
		},
	},
};
</script>

<style lang="scss" scoped>
.q-expansion-item {
	background-color: $neutral-9;
}
.no-table-margin::v-deep table {
	margin-bottom: 0;
}
</style>
