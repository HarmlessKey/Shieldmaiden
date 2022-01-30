<template>
	<div>
		<q-btn-toggle
			v-if="npc_count && !customOnly"
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
					<q-icon name="fas fa-search" size="xs" @click="searchNPC()" />
				</template>
			</q-input>
			<q-list :dark="$store.getters.theme === 'dark'">
				<q-item 
					v-for="(npc, index) in searchResults" 
					:key="index" 
					class="bg-neutral-8"
					:disabled="disabledCustom.includes(npc.key)"
				>
					<q-item-section>
						{{ npc.name.capitalizeEach() }}
					</q-item-section>
					<q-item-section avatar>
						<a v-if="!disabledCustom.includes(npc.key)" class="btn btn-sm bg-neutral-5" @click="copy(copy_resource === 'custom' ? npc.key : npc._id)">
							<i class="fas" :class="add ? 'fa-plus' : 'fa-copy'"/>
						</a>
					</q-item-section>
				</q-item>
			</q-list>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: "CopyMonster",
		props: {
			customOnly: {
				type: Boolean,
				default: false
			},
			add: {
				type: Boolean,
				default: false
			},
			disabledCustom: {
				type: Array,
				default: () => { return []; }
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
			...mapGetters("npcs", ["npcs", "npc_count"]),
			copy_resource: {
				get() {
					const resource = (this.npc_count || this.customOnly) ? "custom" : "srd";
					return (this.copy_resource_setter) ? this.copy_resource_setter : resource;
				},
				set(newVal) {
					this.copy_resource_setter = newVal;
				}
			},
		},
		async mounted() {
			await this.get_npcs();
		},
		methods: {
			...mapActions("api_monsters", ["get_monsters", "get_monster"]),
			...mapActions("npcs", ["get_npcs", "get_npc"]),
			changeCopyResource(value) {
				this.copy_resource = value;
				this.query = "";
				this.searchResults = [];
				this.noResult = "";
			},
			async search() {
				if(this.query) {
					if(this.copy_resource === "custom") {
						const results = this.npcs.filter(npc => {
							return npc.name.toLowerCase().includes(this.query.toLowerCase());
						});

						if(results && results.length) {
							this.noResult = "";
							this.searchResults = results;
							this.loading_npcs = false;
						} else {
							this.searchResults = [];
							this.noResult = 'Nothing found starting with "' + this.query + '"';
						}
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
				} else {
					this.noResult = "";
					this.searchResults = [];
				}
			},
			async copy(id) {
				const npc = (this.copy_resource === "custom")
					? await this.get_npc({ uid: this.userId, id })
					: await this.get_monster(id);

					// Remove properties not needed for custom monsters
					delete npc._id;
					delete npc.key;
					delete npc.url;

					this.$emit("copy", { npc, id });

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