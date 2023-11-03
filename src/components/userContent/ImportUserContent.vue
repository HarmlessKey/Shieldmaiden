<template>
	<div>
		<template v-if="import_state === 'start'">
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
		<hk-loader v-else-if="import_state === 'parsing'" title="Validating JSON" />
		<div v-else-if="import_state === 'selecting'">
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
						<template v-slot:body-cell-linked="props">
							<td>
								<hk-popover
									v-if="import_type !== 'spells' && hasLinkedEntities(import_type, props.row)"
									:header="`Linked ${linked_entity_map[import_type]}`"
								>
									<span>
										{{ getLinkedEntities(import_type, props.row).length }}
										{{ linked_entity_map[import_type] }}
									</span>
									<div slot="content">
										<p v-for="item in getLinkedEntities(import_type, props.row)" :key="item.key">
											{{ item.name.capitalize() }}
										</p>
									</div>
								</hk-popover>
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
				{{ countImported < countSelected ? "Importing" : "Imported" }} {{ selected2string }}
			</h3>
			<q-linear-progress
				:dark="$store.getters.theme !== 'light'"
				stripe
				rounded
				size="20px"
				:value="countImported / countSelected"
				color="primary"
				class="mb-4"
			/>

			<q-expansion-item v-if="countFailed > 0" class="mb-4">
				<template slot="header">
					<q-item-section avatar>
						<strong class="red">{{ countFailed }}</strong>
					</q-item-section>
					<q-item-section class="red">Failed imports</q-item-section>
				</template>
				<div
					v-for="(failed_list, failed_type) in failed_imports"
					:key="`failed-${failed_type}`"
					class="bg-neutral-8 px-3 py-2"
				>
					<p>Import failed for following {{ failed_type }}</p>
					<q-list dense class="mb-2">
						<q-item v-for="(failed, i) in failed_list" :key="`failed-${i}`" class="bg-neutral-9">
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
						<a @click="showSchemaDialog(failed_type)"
							>Compare with our {{ failed_type.substring(0, failed_type.length - 1) }} schema.</a
						>
					</p>
				</div>
			</q-expansion-item>

			<p v-if="countImported < countSelected" class="text-center">
				<hk-animated-integer :value="countImported" /> / {{ countSelected }} imported.
				<template v-if="hasFailedImports > 0">
					<p v-for="failed in failed_imports" :key="failed.harmless_key">
						{{ failed }}
					</p>
				</template>
			</p>
			<div v-else>
				<p class="text-center green">Finished import!</p>
				<q-btn
					no-caps
					:label="closeLabel"
					@click="closeAction()"
					color="neutral-5"
					class="full-width"
					v-close-popup="!isFullPage"
				/>
			</div>
		</div>

		<q-dialog v-model="showSchema">
			<hk-card>
				<div slot="header" class="card-header">
					<span>Schemas</span>
					<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
				</div>
				<div class="card-body">
					<p>
						You can use
						<a href="https://www.jsonschemavalidator.net/" target="_blank" rel="noopener"
							>these schemas validator</a
						>
						to find errors in your imported JSON.<br />
						Paste our schema in the left field and the JSON of your imported JSON in the right.
					</p>
					<a class="btn btn-sm mb-2" @click="copySchema">Copy schema</a>
					<h3>HK Schema</h3>
					<div class="bg-neutral-8 px-2 py-2 overflow-auto">
						<pre>
							{{ schema }}
						</pre
						>
					</div>
				</div>
			</hk-card>
		</q-dialog>
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
			showSchema: false,
			schema: undefined,
			import_state: "start",
			failed_imports: {
				npcs: [],
				spells: [],
			},
			imported: {
				npcs: 0,
				spells: 0,
			},
			import_key_map: {
				campaigns: {},
				encounters: {},
				npcs: {},
				spells: {},
			},
			parsed_data: {
				campaigns: [],
				encounters: [],
				npcs: [],
				spells: [],
			},
			selected: {
				campaigns: [],
				encounters: [],
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
					name: "linked",
					label: "Linked",
					field: "linked",
					align: "right",
					style: "width: 140px",
					headerStyle: "width: 140px",
				},
				{
					name: "duplicate",
					label: "Duplicate",
					field: "duplicate",
					align: "right",
					style: "width: 100px",
					headerStyle: "width: 100px",
				},
			],
			linked_entity_map: {
				campaigns: "encounters",
				encounters: "npcs",
				npcs: "spells",
			},
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
		isFullPage() {
			return this.$route.name === "Import HK Content";
		},
		closeLabel() {
			return this.isFullPage ? "Import more" : "Close";
		},
		countSelected() {
			return Object.values(this.selected).flat(1).length;
		},
		selected2string() {
			return Object.entries(this.selected)
				.filter(([T, list]) => list.length > 0)
				.reduce((accumulator, [T, list]) => `${accumulator} ${list.length} ${T.capitalize()}`, "");
		},
		countImported() {
			return Object.values(this.imported).reduce((a, b) => a + b, 0);
		},
		countFailed() {
			return Object.values(this.failed_imports).flat(1).length;
		},

		hasFailedImports() {
			return Object.fromEntries(
				Object.entries(this.failed_imports).filter(([T, list]) => list.length > 0)
			);
		},
	},
	methods: {
		...mapActions("campaigns", [
			"add_campaign",
			"get_campaign",
			"get_campaigns",
			"reserve_campaign_id",
		]),
		...mapActions("encounters", [
			"add_encounter",
			"get_encounter",
			"get_campaign_encounters",
			"reserve_encounter_id",
		]),
		...mapActions("npcs", ["add_npc", "edit_npc", "get_npcs", "get_npc", "reserve_npc_id"]),
		...mapActions("spells", [
			"add_spell",
			"edit_spell",
			"get_spells",
			"get_spell",
			"get_spell_id_by_name",
			"reserve_spell_id",
		]),
		showSchemaDialog(schema_type) {
			this.showSchema = true;
			switch (schema_type) {
				case "npcs":
					this.schema = npcSchema;
					break;
				case "spells":
					this.schema = spellSchema;
					break;
				case "encounters":
					this.schema = encounterSchema;
					break;
				case "campaigns":
					this.schema = campaignSchema;
					break;
			}
		},
		closeAction() {
			if (this.isFullPage) {
				this.import_state = "start";
			}
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
			this.import_state = "parsing";
			if (!data.meta) {
				data = await this.mapOldToNew(data);
				data.meta = { export_version: "1.0" };
			}
			if (["1.0", "2.0"].includes(data.meta.export_version)) {
				await this.parseV2(data);
			}
			this.import_state = "selecting";
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
				console.log("Will parse encounters and campaigns");
				console.log(data);
				Object.entries(data.campaigns).forEach(([campaign_key, campaign]) => {
					this.parseCampaign(campaign_key, campaign);
					Object.entries(data.encounters[campaign_key]).forEach(([encounter_key, encounter]) => {
						this.parseEncounter(encounter_key, campaign_key, encounter);
					});
				});
			}
			console.log("to import", this.parsed_data);
		},

		async parseCampaign(key, campaign) {
			console.log("Parsing campaign", campaign);
			delete campaign.key;
			this.removeTimestamps(campaign);

			const valid = ajv.validate(campaignSchema, campaign);

			campaign.meta = { key };
			// Always duplicate an imported campaign
			campaign.meta.duplicate = false;
			campaign.meta.overwrite = undefined;

			if (!valid) {
				campaign.meta.errors = ajv.errors;
			}

			this.parsed_data.campaigns.push(campaign);
			console.log("parsed Campaign", campaign.name);
		},
		async parseEncounter(key, campaign_key, encounter) {
			console.log("Parsing encounter", encounter);
			delete encounter.key;
			this.removeTimestamps(encounter);

			const valid = ajv.validate(encounterSchema, encounter);
			console.log("Encounter", encounter.name, "is valid", valid);

			encounter.meta = { key, campaign_key };
			// Always duplicate encounters and campaigns
			encounter.meta.duplicate = false;
			encounter.meta.overwrite = undefined;

			if (!valid) {
				encounter.meta.errors = ajv.errors;
			}

			this.parsed_data.encounters.push(encounter);
			console.log("parsed Encounter", encounter.name);
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
				campaigns: this.reserve_campaign_id,
				encounters: this.reserve_encounter_id,
				npcs: this.reserve_npc_id,
				spells: this.reserve_spell_id,
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
			this.import_state = "importing";
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

			this.selected.spells.forEach(async (spell) => {
				const key = this.import_key_map.spells[spell.meta.key];
				const meta = { ...spell.meta };
				delete spell.meta;
				if (meta.overwrite === "skip") {
					// Skipped content is imported by default;
					this.imported.spells++;
				} else {
					try {
						await this.add_spell({ spell, predefined_key: key });
						this.imported.spells++;
					} catch (error) {
						this.failed_imports.spells.push(spell);
						console.log("Failed SPELL import", error, spell);
					}
				}
			});

			for (const npc of this.selected.npcs) {
				const key = this.import_key_map.npcs[npc.meta.key];
				const meta = { ...npc.meta };
				delete npc.meta;
				if (meta.overwrite === "skip") {
					// Skipped content is imported by default;
					this.imported.npcs++;
				} else {
					npc.caster_spells = await this.mapNpcSpellsObject(npc.caster_spells);
					npc.innate_spells = await this.mapNpcSpellsObject(npc.innate_spells);
					try {
						await this.add_npc({ npc, predefined_key: key });
						this.imported.npcs++;
					} catch (error) {
						this.failed_imports.npcs.push(npc);
						console.log("Failed NPC import", error, npc, key);
					}
				}
			}

			this.selected.campaigns.forEach(async (campaign) => {
				const key = this.import_key_map[campaign.meta.key];
				const meta = { ...campaign.meta };
				delete campaign.meta;
				try {
					await this.add_campaign({ campaign, predefined_key: key });
					this.imported.campaigns++;
				} catch (error) {
					this.failed_imports.push(campaign);
					console.log("Failed Campaign import", error, campaign, key);
				}
			});
		},
		copySchema() {
			try {
				navigator.clipboard.writeText(JSON.stringify(this.schema));
				this.$snotify.success("Successful", "Schema copied", {
					position: "rightTop",
				});
			} catch {
				this.$snotify.error("Unsuccessful", "Schema not copied", {
					position: "rightTop",
				});
			}
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
						let is_versatile = false;
						if (ability.versatile && !ability.options) {
							// Turn versatile into options
							is_versatile = true;
							this.$set(ability, "options", [
								ability.versatile_one || "Option 1",
								ability.versatile_two || "Option 2",
							]);
						}
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
												is_versatile &&
												roll[`versatile_${option}`] !== undefined &&
												roll[`versatile_${option}`] !== roll[option]
											) {
												options = !options ? { [ability.options[1]]: {} } : options;
												options[ability.options[1]][option] = roll[`versatile_${option}`];
											}
											this.$delete(roll, `versatile_${option}`);
										}

										if (is_versatile && options) {
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
					(item) => item.meta.overwrite === undefined || item.meta.overwrite === "duplicate"
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
		hasLinkedEntities(import_type, entity) {
			return this.getLinkedEntities(import_type, entity).length > 0;
		},
		getLinkedEntities(import_type, entity) {
			switch (import_type) {
				case "campaigns":
					return this.selected.encounters
						.filter((encounter) => encounter.meta.campaign_key === entity.meta.key)
						.map((encounter) => ({
							name:
								encounter.meta.overwrite === "skip"
									? encounter.meta.duplicate.name
									: encounter.name,
							key:
								encounter.meta.overwrite === "duplicate"
									? encounter.meta.key
									: encounter.meta.duplicate.key,
						}));
				case "encounters":
					if (!entity.entities) {
						return [];
					}
					return this.selected.npcs
						.filter((npc) => {
							return Object.values(entity.entities)
								.filter((enc_npc) => enc_npc?.npc === "custom" && enc_npc.id === npc.meta.key)
								.map((enc_npc) => enc_npc.id)
								.includes(npc.meta.key);
						})
						.map((npc) => ({
							name: npc.meta.overwrite === "skip" ? npc.meta.duplicate.name : npc.name,
							key: npc.meta.overwrite === "duplicate" ? npc.meta.key : npc.meta.duplicate.key,
						}));
				case "npcs":
					const spell_lists = ["caster_spells", "innate_spells"];
					return this.selected.spells
						.filter((spell) =>
							spell_lists
								.reduce((acc, spell_type) => {
									if (entity[spell_type]) {
										return acc.concat(
											Object.entries(entity[spell_type])
												.filter(([_, s]) => s.custom)
												.map(([sk, _]) => sk)
										);
									}
									return acc;
								}, [])
								.includes(spell.meta.key)
						)
						.map((spell) => ({
							name: spell.meta.overwrite === "skip" ? spell.meta.duplicate.name : spell.name,
							key: spell.meta.overwrite === "duplicate" ? spell.meta.key : spell.meta.duplicate.key,
						}));
				default:
					return [];
			}
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
