<template>
	<div>
		<template v-if="!parsed && !parsing">
			<p>
				Import Harmless Key Content.<br />
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
		<!-- <hk-loader v-else-if="!parsed" prefix="Validating" :title="type_label" /> -->
		<div v-else-if="!importing">
			<template v-for="import_type in Object.keys(parsed_data)">
				<div v-if="parsed_data[import_type].length" class="mb-4" :key="import_type">
					<h3>
						{{ import_type.capitalize() }}
						<span
							:class="
								newContentCount(import_type) > tier.benefits[import_type]
									? 'red'
									: newContentCount(import_type) == tier.benefits[import_type]
									? 'neutral-2'
									: 'green'
							"
							>{{ newContentCount(import_type) }}</span
						>
						<span class="divider mx-1">/</span>
						<i
							aria-hidden="true"
							v-if="tier.benefits[import_type] == 'infinite'"
							class="far fa-infinity"
						></i>
						<template v-else>{{ tier.benefits[import_type] }}</template>
					</h3>
					<q-table
						class="sticky-header-table mb-2 no-table-margin"
						:virtual-scroll-sticky-size-start="48"
						:dark="$store.getters.theme !== 'light'"
						flat
						dense
						square
						:data="parsed_data[import_type]"
						:columns="columns"
						:row-key="(row) => `${row.meta.key}-${row.meta.overwrite}`"
						virtual-scroll
						:pagination.sync="pagination"
						:rows-per-page-options="[0]"
						selection="multiple"
						:selected.sync="selected[import_type]"
						hide-bottom
						hide-top
					>
						<template v-slot:body-cell-name="props">
							<td>
								<hk-popover v-if="props.row.meta.errors" header="Validation errors">
									<q-icon name="error" class="red" />
									<div slot="content">
										<ol class="px-3">
											<li
												v-for="(error, i) in props.row.meta.errors"
												:key="`${props.row.index}-error-${i}`"
												class="red"
											>
												<strong v-if="error.instancePath" class="neutral-1">
													{{ error.instancePath }}
												</strong>
												{{ error.message.capitalize() }}
												<template v-if="error.keyword == 'additionalProperties'">
													<span> '{{ error.params.additionalProperty }}'</span>
												</template>
											</li>
										</ol>
									</div>
								</hk-popover>
								{{ props.row.name.capitalizeEach() }}
							</td>
						</template>

						<template v-slot:body-cell-duplicate="props">
							<td class="py-0 px-1">
								<hk-popover
									v-if="
										props.row.meta.duplicate &&
										selected[import_type].find((item) => item.meta.key === props.row.meta.key)
									"
									:header="props.row.name?.capitalizeEach()"
								>
									<button class="btn btn-sm bg-neutral-5">
										<q-icon
											:name="duplicate_icon[props.row.meta.overwrite] || 'fas fa-info-circle'"
											class="mr-1"
										/>
										{{ props.row.meta.overwrite || "Select" }}
									</button>
									<div slot="content">
										<DuplicateOptions v-model="props.row" />
									</div>
								</hk-popover>
							</td>
						</template>
					</q-table>
				</div>
			</template>

			<div class="d-flex justify-content-between items-center pb-2">
				<div>
					<strong>{{ countSelected }}</strong> selected
				</div>
				<q-form @submit="importData">
					<q-btn
						color="primary"
						no-caps
						type="submit"
						:disabled="countSelected === 0 || willBeOverencumbered()"
					>
						Import
					</q-btn>
				</q-form>
			</div>
		</div>
		<div v-else>
			<h3 class="text-center">
				<!-- eslint-disable-next-line vue/no-parsing-error -->
				{{ imported < countSelected ? "Importing" : "Imported" }} {{ countSelected }}
			</h3>
			<q-linear-progress
				:dark="$store.getters.theme !== 'light'"
				stripe
				rounded
				size="20px"
				:value="imported / countSelected"
				color="primary"
				class="mb-4"
			/>

			<!-- <q-expansion-item v-if="failed_imports.length" class="mb-4">
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
			</q-expansion-item> -->

			<p v-if="imported < countSelected" class="text-center">
				<hk-animated-integer :value="imported" /> / {{ countSelected }} imported.
			</p>
			<div v-else>
				<p class="text-center green">Finished import!</p>
				<q-btn no-caps label="Close" color="neutral-5" class="full-width" />
			</div>
		</div>

		<!-- <q-dialog v-model="showSchema">
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
		</q-dialog> -->
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import campaignSchema from "src/schemas/hk-campaign-schema.json";
import encounterSchema from "src/schemas/hk-encounter-schema.json";
import npcSchema from "src/schemas/hk-npc-schema.json";
import spellSchema from "src/schemas/hk-spell-schema.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import DuplicateOptions from "./importer/DuplicateOptions";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv, ["uri"]);

export default {
	name: "ImportUserContent",
	components: { DuplicateOptions },
	data() {
		return {
			uid: this.$store.getters.user.uid,
			json_file: undefined,
			json_input: undefined,
			overwrite: true,
			parsing: false,
			parsed: false,
			showSchema: false,
			failed_imports: [],
			importing: undefined,
			imported: 0,
			import_key_map: {
				npcs: {},
				spells: {},
			},

			parsed_data: {
				npcs: [],
				spells: [],
			},
			selected: {
				npcs: [],
				spells: [],
			},
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
					name: "duplicate",
					label: "Duplicate",
					field: "duplicate",
					align: "right",
					style: "width: 0px",
					headerStyle: "width: 0px",
				},
			],
			duplicate_icon: {
				overwrite: "fas fa-pen",
				duplicate: "fas fa-copy",
				skip: "fas fa-ban",
			},
			pagination: {
				rowsPerPage: 0,
			},
		};
	},
	computed: {
		...mapGetters(["tier", "content_count", "overencumbered"]),
		...mapGetters("npcs", ["npcs", "npc_count"]),
		...mapGetters("spells", ["spells", "spell_count"]),

		countSelected() {
			return Object.values(this.selected).flat(1).length;
		},
	},
	methods: {
		...mapActions("campaigns", ["add_campaign", "get_campaign", "get_campaigns"]),
		...mapActions("encounters", ["add_encounter", "get_encounter", "get_encounters"]),
		...mapActions("npcs", ["add_npc", "edit_npc", "get_npcs", "get_npc", "reserve_npc_id"]),
		...mapActions("spells", [
			"add_spell",
			"edit_spell",
			"get_spells",
			"get_spell",
			"get_spell_id_by_name",
			"reserve_spell_id",
		]),

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
			if (!data.meta) {
				data = await this.mapOldToNew(data);
				data.meta = { export_version: "1.0" };
			}
			if (["1.0", "2.0"].includes(data.meta.export_version)) {
				await this.parseV2(data);
			}
			this.parsed = true;
		},

		async mapOldToNew(data) {
			const new_data = {
				npcs: {},
				spells: {},
			};

			if (!(data instanceof Array)) {
				data = [data];
			}

			let i = 0;
			for (const entry of data) {
				// use HK or a increasing new key to be changed later on.
				const key = entry.harmless_key ?? `new_key-${++i}`;
				if (entry.challenge_rating !== undefined) {
					// Entry is NPC
					if (Object.values(entry.custom_spells).length > 0) {
						new_data.spells = { ...new_data.spells, ...entry.custom_spells };
					}
					delete entry.custom_spells;
					new_data.npcs[key] = entry;
				} else if (entry.school !== undefined) {
					// Entry is Spell
					new_data.spells[key] = entry;
				}
			}
			return new_data;
		},

		async parseV2(data) {
			if (data.spells) {
				Object.entries(data.spells).forEach(([key, spell]) => {
					this.parseSpell(key, spell);
				});
			}
			if (data.npcs) {
				Object.entries(data.npcs).forEach(([key, npc]) => {
					this.parseNPC(key, npc);
				});
			}
			if (data.campaigns && data.encounters) {
				Object.entries(data.campaigns).forEach(([key, campaign]) => {
					this.parseCampaign(key, campaign);
				});
				Object.entries(data.encounters).forEach(([key, encounter]) => {
					this.parseEncounter(key, encounter);
				});
			}
			console.log("to import", this.parsed_data);
		},

		async parseCampaign(key, campaign) {},
		async parseEncounter(key, campaign_key, encounter) {
			delete encounter.key;
			this.removeTimestamps(encounter);

			const valid = ajv.validate(encounterSchema, encounter);

			encounter.meta = { key, campaign_key };
			encounter.meta.duplicate = await this.checkIfDuplicateEncounter(encounter);
			encounter.meta.overwrite = encounter.meta.duplicate ? "duplicate" : undefined;

			if (!valid) {
				encounter.meta.errors = ajv.errors;
			}
		},
		async parseNPC(key, npc) {
			/**
			 * 1. Remove unwanted props
			 * 2. Add meta prop to store errors and selection later on.
			 * 3. Validate spell
			 * 4. Store object in temp storage for later selection and import
			 */

			this.removeTimestamps(npc);

			this.versatileToOptions(npc);
			this.renameNpcProps(npc);

			const valid = ajv.validate(npcSchema, npc);

			npc.meta = { key };
			npc.meta.duplicate = await this.checkIfDuplicateNpc(npc);
			npc.meta.overwrite = npc.meta.duplicate ? "duplicate" : undefined;

			if (!valid) {
				npc.meta.errors = ajv.errors;
			}
			this.parsed_data.npcs.push(npc);

			console.log("parsed NPC", npc.name);
		},
		async parseSpell(key, spell) {
			/**
			 * 1. Remove unwanted props
			 * 2. Add meta prop to store errors and selection later on.
			 * 3. Validate spell
			 * 4. Store object in temp storage for later selection and import
			 */
			delete spell.key;
			this.removeTimestamps(spell);

			const valid = ajv.validate(spellSchema, spell);

			spell.meta = { key };
			spell.meta.duplicate = await this.checkIfDuplicateSpell(spell);
			spell.meta.overwrite = spell.meta.duplicate ? "duplicate" : undefined;

			if (!valid) {
				spell.meta.errors = ajv.errors;
			}

			this.parsed_data.spells.push(spell);

			console.log("parsed Spell", spell.name);
		},

		removeTimestamps(data) {
			delete data.updated;
			delete data.created;
		},

		async getKey(item, item_type) {
			const keyGenFnMap = {
				spells: this.reserve_spell_id,
				npcs: this.reserve_npc_id,
			};

			switch (item.meta.overwrite) {
				case "skip":
				case "overwrite":
					return item.meta.duplicate.key;
				case "duplicate":
				default:
					return await keyGenFnMap[item_type]();
			}
		},

		async generateKeyMap() {
			await Promise.all(
				Object.entries(this.selected).map(async ([item_type, items]) => {
					await Promise.all(
						items.map(async (item) => {
							const imported_key = item.meta.key;
							const new_key = await this.getKey(item, item_type);
							this.import_key_map[item_type][imported_key] = new_key;
						})
					);
				})
			);
		},

		async mapNpcSpellsObject(spell_obj) {
			if (!spell_obj) {
				return null;
			}
			return Object.fromEntries(
				await Promise.all(
					Object.entries(spell_obj).map(([key, spell]) => {
						return spell.custom && this.import_key_map.spells[key]
							? [this.import_key_map.spells[key], spell]
							: [key, spell];
					})
				)
			);
		},
		async importData() {
			if (this.willBeOverencumbered()) {
				console.log(
					"%cYou rolled 1 on your stealth check!",
					"color:red;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 1px black;font-weight:bold"
				);
				console.warn(
					"The developer sees that you're trying to import more than you are allowed by removing the disabled tag on the import button.",
					"You have been reported to the city guard"
				);
				return;
			}
			this.importing = true;
			await this.generateKeyMap();

			/**
			 * Importing data to DB
			 * 1. Spells
			 * 2. NPCs
			 *    - Update custom spell keys to correct keys
			 * 3. Campaigns
			 * 4. Encounters
			 *    - Use campaign key
			 *    - Update NPCs in encounter to correct keys
			 */

			await Promise.all(
				this.selected.spells.map(async (spell) => {
					const key = this.import_key_map.spells[spell.meta.key];
					const meta = { ...spell.meta };
					delete spell.meta;
					if (meta.overwrite === "skip") {
						// Skipped content is imported by default;
						this.imported++;
					} else {
						try {
							await this.add_spell({ spell, predefined_key: key });
							this.imported++;
						} catch (error) {
							this.failed_imports.push(spell);
							console.log("Failed SPELL import", error, spell);
						}
					}
				})
			);

			await Promise.all(
				this.selected.npcs.map(async (npc) => {
					const key = this.import_key_map.npcs[npc.meta.key];
					const meta = { ...npc.meta };
					delete npc.meta;
					if (meta.overwrite === "skip") {
						// Skipped content is imported by default;
						this.imported++;
					} else {
						npc.caster_spells = await this.mapNpcSpellsObject(npc.caster_spells);
						npc.innate_spells = await this.mapNpcSpellsObject(npc.innate_spells);
						try {
							await this.add_npc({ npc, predefined_key: key });
							this.imported++;
						} catch (error) {
							this.failed_imports.push(npc);
							console.log("Failed NPC import", error, npc, key);
						}
					}
				})
			);
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
		async renameNpcProps(npc) {
			const mapper = {
				damage_vulnerability: "damage_vulnerabilities",
			};
			for (const [old_key, new_key] of Object.entries(mapper)) {
				if (npc[old_key]) {
					npc[new_key] = npc[old_key];
					delete npc[old_key];
				}
			}
		},
		async checkIfDuplicateNpc(npc) {
			const npcs = await this.get_npcs();
			const dupByKey = npcs[npc.meta.key]
				? { ...npcs[npc.meta.key], key: npc.meta.key }
				: undefined;
			const dupByNameEntry = Object.entries(npcs).find(
				([key, n]) => n.name.toLowerCase() === npc.name.toLowerCase()
			);
			let dupByName = undefined;
			if (dupByNameEntry) {
				const [key, val] = dupByNameEntry;
				dupByName = {
					key,
					...val,
				};
			}

			return dupByKey || dupByName || false;
		},
		async checkIfDuplicateSpell(spell) {
			const spells = await this.get_spells();
			const dupByKey = spells[spell.meta.key]
				? { ...spells[spell.meta.key], key: spell.meta.key }
				: undefined;
			const dupByNameEntry = Object.entries(spells).find(
				([key, s]) => s.name.toLowerCase() === spell.name.toLowerCase()
			);
			let dupByName = undefined;
			if (dupByNameEntry) {
				const [key, val] = dupByNameEntry;
				dupByName = {
					key,
					...val,
				};
			}
			return dupByKey || dupByName || false;
		},

		newContentCount(import_type) {
			return (
				this.content_count[import_type] +
				this.selected[import_type]?.filter(
					(item) => item.meta.overwrite === false || item.meta.overwrite === "duplicate"
				).length
			);
		},
		willBeOverencumbered() {
			const import_types = ["npcs", "spells", "encounters", "campaigns"];

			return (
				import_types.filter(
					(import_type) => this.newContentCount(import_type) > this.tier.benefits[import_type]
				).length > 0
			);
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

.q-table {
	td {
		.btn-sm {
			padding: 2px 5px;
			font-size: 12px;
		}
	}
}
</style>
