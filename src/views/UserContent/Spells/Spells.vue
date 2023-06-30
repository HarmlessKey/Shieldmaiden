<template>
	<div v-if="tier">
		<hk-card>
			<ContentHeader type="spells">
				<ExportUserContent
					slot="actions-left"
					class="btn-sm bg-neutral-5"
					content-type="spell"
					:content-id="spellIds"
				>
					<span>Export</span>
				</ExportUserContent>
				<button
					slot="actions-right"
					class="btn btn-sm bg-neutral-5 mx-2"
					@click="import_dialog = true"
				>
					Import
				</button>
			</ContentHeader>

			<div class="card-body" v-if="!loading_spells">
				<p class="neutral-2">These are your custom spells.</p>
				<template v-if="spells.length">
					<q-input
						:dark="$store.getters.theme !== 'light'"
						v-model="search"
						borderless
						filled
						square
						debounce="300"
						clearable
						placeholder="Search spells"
					>
						<q-icon slot="prepend" name="search" />
					</q-input>

					<q-table
						:data="spells"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_spells"
						separator="none"
						:pagination="{ rowsPerPage: 15 }"
						:filter="search"
						wrap-cells
					>
						<template v-slot:body-cell="props">
							<q-td v-if="props.col.name !== 'actions'">
								<div class="truncate-cell">
									<div class="truncate">
										<router-link
											v-if="props.col.name === 'name'"
											:to="`${$route.path}/${props.key}`"
										>
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
									<i aria-hidden="true" class="fas fa-pencil" />
									<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
								</router-link>
								<ExportUserContent
									class="btn-sm bg-neutral-5 mx-2"
									content-type="spell"
									:content-id="props.key"
								/>
								<!-- <button class="btn btn-sm bg-neutral-5 mx-2" @click="exportSpell(props.key)">
									<i aria-hidden="true" class="fas fa-arrow-alt-down" />
									<q-tooltip anchor="top middle" self="center middle"> Download </q-tooltip>
								</button> -->
								<button
									class="btn btn-sm bg-neutral-5"
									@click="confirmDelete($event, props.key, props.row)"
								>
									<i aria-hidden="true" class="fas fa-trash-alt" />
									<q-tooltip anchor="top middle" self="center middle">Delete</q-tooltip>
								</button>
							</q-td>
						</template>
						<div slot="no-data" />
						<hk-loader slot="loading" name="spells" />
					</q-table>
				</template>

				<router-link
					v-if="!spells.length && !overencumbered"
					class="btn btn-lg bg-neutral-5"
					to="/content/spells/add-spell"
				>
					<i aria-hidden="true" class="fas fa-plus green mr-1" /> Create your first Spell
				</router-link>
				<router-link
					v-else-if="tier.name === 'Free'"
					class="btn bg-neutral-8 btn-block"
					to="/patreon"
				>
					Get more spell slots
				</router-link>
			</div>
			<hk-loader v-else name="spells" />
		</hk-card>

		<!-- Bulk import dialog -->
		<q-dialog v-model="import_dialog">
			<hk-card :minWidth="400">
				<div slot="header" class="card-header">
					<span>Import spells from JSON</span>
					<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
				</div>
				<div class="card-body">
					<ImportContent type="spells" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
import numeral from "numeral";
import { mapActions, mapGetters } from "vuex";
import ContentHeader from "src/components/userContent/ContentHeader";
import ImportContent from "src/components/ImportContent.vue";
import { downloadJSON } from "src/utils/generalFunctions";
import ExportUserContent from "src/components/userContent/ExportUserContent";

export default {
	name: "Spells",
	components: {
		ContentHeader,
		ImportContent,
		ExportUserContent,
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			import_dialog: false,
			loading_spells: true,
			search: "",
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
					name: "school",
					label: "School",
					field: "school",
					sortable: true,
					align: "left",
					format: (val) => val.capitalize(),
				},
				{
					name: "level",
					label: "Level",
					field: "level",
					sortable: true,
					align: "left",
					format: (val) => this.spellLevel(val),
				},
				{
					name: "actions",
					label: "",
					align: "right",
				},
			],
		};
	},
	computed: {
		...mapGetters(["tier", "overencumbered"]),
		...mapGetters("spells", ["spells"]),
		spellIds() {
			console.log(this.spells.map((spell) => spell.key));
			return this.spells.map((spell) => spell.key);
		},
	},
	async mounted() {
		await this.get_spells();
		this.loading_spells = false;
	},
	methods: {
		...mapActions(["setSlide"]),
		...mapActions("spells", ["get_spells", "get_spell", "delete_spell"]),
		spellLevel(level) {
			return level === 0 ? "Cantrip" : numeral(level).format("0o");
		},
		confirmDelete(e, key, spell) {
			//Instantly delete when shift is held
			if (e.shiftKey) {
				this.deleteSpell(key);
			} else {
				this.$snotify.error("Are you sure you want to delete " + spell.name + "?", "Delete spell", {
					timeout: false,
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.deleteSpell(key);
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				});
			}
		},
		deleteSpell(key) {
			this.delete_spell(key);
		},
	},
};
</script>
