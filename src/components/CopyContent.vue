<template>
	<div>
		<q-btn-toggle
			v-if="custom_content && custom_content.length && content.length === 2"
			class="mb-3"
			:value="copy_resource"
			spread
			no-caps
			toggle-color="primary"
			@input="changeCopyResource($event)"
			:options="[
				{ label: `Custom ${type === 'monster' ? 'NPC' : type}s`, value: 'custom' },
				{ label: `SRD ${type}s`, value: 'srd' },
			]"
		/>
		<hk-input
			:label="
				copy_resource === 'custom'
					? `Search ${type === 'monster' ? 'NPCs' : type}`
					: `Search ${type}`
			"
			@keydown.enter.prevent.stop="search"
			type="text"
			autocomplete="off"
			v-model="query"
			@change="search"
			class="mb-3"
			:error="!!noResult"
			:error-message="noResult"
		>
			<button v-if="copy_resource === 'srd'" slot="before" class="btn btn" @click="show_filter = !show_filter">
				<q-icon name="fas fa-filter" size="xs" />
			</button>
			<button slot="append" class="btn btn-sm btn-clear" @click="search()">
				<q-icon name="fas fa-search" size="xs" />
			</button>
		</hk-input>
		<q-slide-transition v-if="copy_resource === 'srd'">
			<div v-show="show_filter" class="filter">
				<h3>Filter {{ type }}s</h3>
				<hk-filter 
					v-model="filter" 
					:type="type"
					@change="search()" />
			</div>
		</q-slide-transition>
		<q-list :dark="$store.getters.theme === 'dark'">
			<q-item
				v-for="(result, index) in searchResults"
				:key="index"
				class="bg-neutral-8"
				:disabled="
					copy_resource === 'custom'
						? disabledCustom.includes(result.key)
						: disabledSrd.includes(result._id)
				"
			>
				<q-item-section>
					{{ result.name.capitalizeEach() }}
				</q-item-section>
				<q-item-section avatar>
					<a
						v-if="!disabledCustom.includes(result.key)"
						class="btn btn-sm bg-neutral-5"
						@click="copy(copy_resource === 'custom' ? result.key : result._id)"
					>
						<i aria-hidden="true" class="fas" :class="`fa-${button}`" />
					</a>
				</q-item-section>
			</q-item>
		</q-list>
		<q-pagination
			v-if="copy_resource === 'srd' && totalPages > 1"
      v-model="page"
      :max="totalPages"
			:max-pages="5"
			flat
			direction-links
			class="mt-3"
			@input="fetchApiContent()"
    />
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CopyContent",
	props: {
		type: {
			type: String,
			required: true,
			default: "monster",
		},
		// Only show custom options
		content: {
			type: Array,
			default: () => {
				return ["custom", "srd"];
			},
		},
		button: {
			type: String,
			default: "copy",
		},
		// Custom results that should be disabled
		disabledCustom: {
			type: Array,
			default: () => {
				return [];
			},
		},
		// Custom results that should be disabled
		disabledSrd: {
			type: Array,
			default: () => {
				return [];
			},
		},
		// Don't fetch the full object, but return ID only
		returnId: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			query: "",
			searchResults: [],
			noResult: "",
			copy_resource_setter: undefined,
			show_filter: false,
			filter: {},
			pageSize: 10,
			page: 1,
			totalPages: 0,
		};
	},
	computed: {
		...mapGetters("npcs", ["npcs"]),
		...mapGetters("items", ["items"]),
		...mapGetters("spells", ["spells"]),
		custom_content() {
			let content = [];
			if (this.type === "monster") {
				content = this.npcs;
			} else if (this.type === "item") {
				content = this.items;
			} else if (this.type === "spell") {
				content = this.spells;
			}
			return content;
		},
		copy_resource: {
			get() {
				const resource =
					this.custom_content && this.custom_content.length && this.content.includes("custom")
						? "custom"
						: "srd";
				return this.copy_resource_setter ? this.copy_resource_setter : resource;
			},
			set(newVal) {
				this.copy_resource_setter = newVal;
			},
		},
	},
	async mounted() {
		// Get custom content
		if (this.content.includes("custom") && this.userId) {
			if (this.type === "monster") {
				await this.get_npcs();
			}
			if (this.type === "item") {
				await this.get_items();
			}
			if (this.type === "spell") {
				await this.get_spells();
			}
		}
	},
	methods: {
		...mapActions("api_monsters", ["fetch_monsters", "fetch_monster"]),
		...mapActions("npcs", ["get_npcs", "get_npc"]),
		...mapActions("api_items", ["fetch_api_items", "fetch_api_item"]),
		...mapActions("items", ["get_items", "get_item"]),
		...mapActions("api_spells", ["fetch_api_spells", "fetch_api_spell"]),
		...mapActions("spells", ["get_spells", "get_spell"]),
		changeCopyResource(value) {
			this.copy_resource = value;
			this.query = "";
			this.searchResults = [];
			this.noResult = "";
			this.page = 1;
			this.totalPages = 0;
		},
		async search() {
			// CUSTOM
			if (this.copy_resource === "custom") {
				if (this.query) {
					const results = this.custom_content.filter((result) => {
						return result.name.toLowerCase().includes(this.query.toLowerCase());
					});

					if (results && results.length) {
						this.noResult = "";
						this.searchResults = results;
					} else {
						this.searchResults = [];
						this.noResult = 'Nothing found for "' + this.query + '"';
					}
				} else {
					this.noResult = "";
					this.searchResults = [];
				}
			}
			// API
			else {
				await this.fetchApiContent();
				this.page = 1;
			}
		},

		async fetchApiContent() {
			let data;

			if (this.type === "monster") {
				data = this.fetch_monsters;
			} else if (this.type === "item") {
				data = this.fetch_api_items;
			} else if (this.type === "spell") {
				data = this.fetch_api_spells;
			}

			await data(
				{ 
					pageNumber: this.page,
					pageSize: this.pageSize,
					query: { 
						search: this.query, 
						...this.filter 
					} 
				}).then((result) => {
					if (result.meta.count === 0) {
						this.noResult = 'Nothing found for "' + this.query + '"';
						this.totalPages = 0;
					} else {
						this.noResult = "";
						this.searchResults = result.results;
						this.totalPages = Math.ceil(result.meta.count / this.pageSize);
					}
				}
			);
	},

		/**
		 * Emit the selected result
		 *
		 * @param {string} id
		 * @emits {object} result, id, recource (custom or SRD)
		 */
		async copy(id) {
			if (this.returnId) {
				this.$emit("copy", { id, resource: this.copy_resource });
			} else {
				let result;

				if (this.type === "monster") {
					result =
						this.copy_resource === "custom"
							? await this.get_npc({ uid: this.userId, id })
							: await this.fetch_monster(id);
				}
				if (this.type === "item") {
					result =
						this.copy_resource === "custom"
							? await this.get_item({ uid: this.userId, id })
							: await this.fetch_api_item(id);
				}
				if (this.type === "spell") {
					result =
						this.copy_resource === "custom"
							? await this.get_spell({ uid: this.userId, id })
							: await this.fetch_api_spell(id);
				}

				// Remove properties not needed for custom monsters
				delete result._id;
				delete result.key;
				delete result.url;
				delete result.meta;

				this.$emit("copy", { result, id, resource: this.copy_resource });
			}

			// Clear search
			this.searchResults = [];
			this.query = "";
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item {
	margin-bottom: 1px;
}
.filter {
	padding: 20px;
	margin-bottom: 15px;
	background-color: $neutral-7;
	border-radius: $border-radius;
}
</style>
