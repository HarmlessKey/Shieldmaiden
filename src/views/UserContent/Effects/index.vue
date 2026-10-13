<template>
	<div v-if="tier">
		<hk-card>
			<ContentHeader type="effects" />

			<div class="card-body" v-if="!loading_effects">
				<p class="neutral-2">These are your custom effects.</p>
				<template v-if="effects.length">
					<q-input
						:dark="$store.getters.theme !== 'light'"
						v-model="search"
						borderless
						filled
						square
						debounce="300"
						clearable
						placeholder="Search effects"
					>
						<q-icon slot="prepend" name="search" />
					</q-input>

					<q-table
						:data="effects"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_effects"
						separator="none"
						:pagination="{ rowsPerPage: 15 }"
						:filter="search"
						wrap-cells
					>
						<template v-slot:body="props">
							<q-tr :props="props">
								<q-td
									v-for="col in props.cols"
									:key="col.name"
									:props="props"
									:auto-width="col.name !== 'name'"
								>
									<template v-if="col.name !== 'actions'">
										<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.key}`">
											{{ col.value }}
										</router-link>
										<template v-else>
											{{ col.value }}
										</template>
									</template>

									<div v-else class="d-flex justify-content-end">
										<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
											<i aria-hidden="true" class="fas fa-pencil" />
											<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
										</router-link>
										<button
											class="btn btn-sm bg-neutral-5 ml-2"
											@click="confirmDelete($event, props.key, props.row)"
										>
											<i aria-hidden="true" class="fas fa-trash-alt" />
											<q-tooltip anchor="top middle" self="center middle">Delete</q-tooltip>
										</button>
									</div>
								</q-td>
							</q-tr>
						</template>
						<div slot="no-data" />
						<hk-loader slot="loading" name="effects" />
					</q-table>
				</template>

				<router-link
					v-if="!effects.length && !overencumbered"
					class="btn btn-lg bg-neutral-5"
					to="/content/effects/add-effect"
				>
					<i aria-hidden="true" class="fas fa-plus green mr-1" /> Create your first Effect
				</router-link>
				<router-link
					v-else-if="tier.name === 'Free'"
					class="btn bg-neutral-8 btn-block"
					to="/patreon"
				>
					Get more effect slots
				</router-link>
			</div>
			<hk-loader v-else name="effects" />
		</hk-card>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ContentHeader from "src/components/userContent/ContentHeader";

export default {
	name: "Effects",
	components: {
		ContentHeader,
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			import_dialog: false,
			loading_effects: true,
			search: "",
			columns: [
				{
					name: "name",
					label: "Name",
					field: "name",
					sortable: true,
					align: "left",
					format: (val) => (val ? val.capitalizeEach() : "(no name)"),
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
		...mapGetters("effects", ["effects"]),
	},
	async mounted() {
		await this.get_effects();
		this.loading_effects = false;
	},
	methods: {
		...mapActions(["setSlide"]),
		...mapActions("effects", ["get_effects", "get_effect", "delete_effect"]),
		confirmDelete(e, key, effect) {
			//Instantly delete when shift is held
			if (e.shiftKey) {
				this.deleteEffect(key);
			} else {
				this.$snotify.error(
					"Are you sure you want to delete " + effect.name + "?",
					"Delete effect",
					{
						timeout: false,
						buttons: [
							{
								text: "Yes",
								action: (toast) => {
									this.deleteEffect(key);
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
					}
				);
			}
		},
		deleteEffect(key) {
			this.delete_effect(key);
		},
	},
};
</script>
