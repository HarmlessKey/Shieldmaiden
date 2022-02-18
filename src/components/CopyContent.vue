<template>
	<div>
		<q-btn-toggle
			v-if="(custom_content && custom_content.length) && content.length === 2"
			class="mb-3"
			:value="copy_resource"
			spread
			no-caps
			toggle-color="primary"
			@input="changeCopyResource($event)"
			:options="[
				{label: `Custom ${(type === 'monster') ? 'NPCs' : type }s`, value: 'custom'},
				{label: `SRD ${type}s`, value: 'srd'}
			]"
		/>
			<q-input 
				:dark="$store.getters.theme === 'dark'" filled square
				:label="copy_resource === 'custom' ? `Search ${(type === 'monster') ? 'NPCs' : type }` : `Search ${type}`"
				@keydown.enter.prevent.stop="search"
				type="text" 
				autocomplete="off" 
				v-model="query" 
				@change="search"
				class="mb-3"
				:error="!!noResult"
				:error-message="noResult"
			>
				<template v-slot:append>
					<q-icon name="fas fa-search" size="xs" @click="search()" />
				</template>
			</q-input>
			<q-list :dark="$store.getters.theme === 'dark'">
				<q-item 
					v-for="(result, index) in searchResults" 
					:key="index" 
					class="bg-neutral-8"
					:disabled="copy_resource === 'custom' ? disabledCustom.includes(result.key) : disabledSrd.includes(result._id)"
				>
					<q-item-section>
						{{ result.name.capitalizeEach() }}
					</q-item-section>
					<q-item-section avatar>
						<a v-if="!disabledCustom.includes(result.key)" class="btn btn-sm bg-neutral-5" @click="copy(copy_resource === 'custom' ? result.key : result._id)">
							<i class="fas" :class="`fa-${button}`"/>
						</a>
					</q-item-section>
				</q-item>
			</q-list>
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
				default: "monster"
			},
			// Only show custom options
			content: {
				type: Array,
				default: () => { return ["custom", "srd"]; }
			},
			button: {
				type: String,
				default: "copy"
			},
			// Custom results that should be disabled
			disabledCustom: {
				type: Array,
				default: () => { return []; }
			},
			// Custom results that should be disabled
			disabledSrd: {
				type: Array,
				default: () => { return []; }
			},
			// Don't fetch the full object, but return ID only
			returnId: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				query: "",
				searchResults: [],
				noResult: "",
				copy_resource_setter: undefined,
			}
		},
		computed: {
			...mapGetters("npcs", ["npcs"]),
			...mapGetters("items", ["items"]),
			custom_content() {
				return (this.type === "monster") ? this.npcs : (this.type === "item") ? this.items : [];
			},
			copy_resource: {
				get() {
					const resource = (this.custom_content && this.custom_content.length && this.content.includes("custom")) 
						? "custom" : "srd";
					return (this.copy_resource_setter) ? this.copy_resource_setter : resource;
				},
				set(newVal) {
					this.copy_resource_setter = newVal;
				}
			}
		},
		async mounted() {
			// Get custom content
			if(this.content.includes("custom")) {
				if(this.type === "monster") {
					await this.get_npcs();
				}
				if(this.type === "item") {
					await this.get_items();
				}
			}
		},
		methods: {
			...mapActions("api_monsters", ["get_monsters", "get_monster"]),
			...mapActions("npcs", ["get_npcs", "get_npc"]),
			...mapActions("api_items", ["get_api_items", "get_api_item"]),
			...mapActions("items", ["get_items", "get_item"]),
			...mapActions("api_spells", ["get_api_spells", "get_api_spell"]),
			changeCopyResource(value) {
				this.copy_resource = value;
				this.query = "";
				this.searchResults = [];
				this.noResult = "";
			},
			async search() {
				if(this.query) {
					// CUSTOM
					if(this.copy_resource === "custom") {
						const results = this.custom_content.filter(result => {
							return result.name.toLowerCase().includes(this.query.toLowerCase());
						});

						if(results && results.length) {
							this.noResult = "";
							this.searchResults = results;
						} else {
							this.searchResults = [];
							this.noResult = 'Nothing found for "' + this.query + '"';
						}
					} 
					// API
					else {
						// Monsters
						if(this.type === "monster") {
							await this.get_monsters({ query: { search: this.query }}).then(results => {
								if(results.meta.count === 0) {
									this.noResult = 'Nothing found for "' + this.query + '"';
								} else {
									this.noResult = "";
									this.searchResults = results.results;
								}
							});
						}
						// Items
						if(this.type === "item") {
							await this.get_api_items({ query: { search: this.query }}).then(results => {
								if(results.meta.count === 0) {
									this.noResult = 'Nothing found for "' + this.query + '"';
								} else {
									this.noResult = "";
									this.searchResults = results.results;
								}
							});
						}
						// Spells
						if(this.type === "spell") {
							await this.get_api_spells({ query: { search: this.query }}).then(results => {
								if(results.meta.count === 0) {
									this.noResult = 'Nothing found for "' + this.query + '"';
								} else {
									this.noResult = "";
									this.searchResults = results.results;
								}
							});
						}
					}
				} else {
					this.noResult = "";
					this.searchResults = [];
				}
			},

			/**
			 * Emit the selected result
			 * 
			 * @param {string} id
			 * @emits {object} result, id, recource (custom or SRD)
			 */
			async copy(id) {
				if(this.returnId) {
					this.$emit("copy", { id, resource: this.copy_resource });
				} else {
					let result;

					if(this.type === "monster") {
						result = (this.copy_resource === "custom")
							? await this.get_npc({ uid: this.userId, id })
							: await this.get_monster(id);
					}
					if(this.type === "item") {
						result = (this.copy_resource === "custom")
							? await this.get_item({ uid: this.userId, id })
							: await this.get_api_item(id);
					}
					if(this.type === "spell") {
						result = (this.copy_resource === "custom")
							? await this.get_spell({ uid: this.userId, id })
							: await this.get_api_spell(id);
					}
	
					// Remove properties not needed for custom monsters
					delete result._id;
					delete result.key;
					delete result.url;

					this.$emit("copy", { result, id, resource: this.copy_resource });
				}

				// Clear search
				this.searchResults = [];
				this.query = "";
			},
		}
	};
</script>

<style lang="scss" scoped>
	.q-item {
		margin-bottom: 1px;
	}
</style>