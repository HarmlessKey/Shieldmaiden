<template>
	<div>
		<q-tabs
			v-model="current"
			:dark="$store.getters.theme === 'dark'"
			outside-arrows
			mobile-arrows
			no-caps
			class="mb-2"
		>
			<q-tab
				v-for="({ name, label, icon }, index) in types"
				:name="name"
				:icon="icon"
				@click="setType(name)"
				:key="`tab-${index}`"
			>
				<q-tooltip anchor="top middle" self="center middle">
					{{ label }}
				</q-tooltip>
			</q-tab>
		</q-tabs>

		<template v-if="current">
			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				:placeholder="`Search ${current}`"
				type="text"
				clearable
				autocomplete="off"
				v-model="search"
				@keyup="searchType()"
				:error="!!noResult"
				:error-message="noResult"
			>
				<q-icon
					slot="prepend"
					name="fas fa-search"
					size="xs"
					class="pointer"
					@click="searchType()"
				/>
			</q-input>

			<q-btn-toggle
				v-if="showEditionToggle"
				class="mb-2"
				v-model="editionModel"
				spread
				no-caps
				toggle-color="primary"
				:options="editionOptions"
			/>

			<!-- SHOW SEARCH RESULTS -->
			<ul v-if="!show" class="results">
				<li
					v-for="(result, index) in searchResults"
					:key="index"
					class="truncate d-flex justify-between cursor-pointer"
					@click="show = result['_id']"
				>
					<span>
						{{ result.name.capitalizeEach() }}
						<q-tooltip anchor="top middle" self="center middle"> Show info </q-tooltip>
					</span>
					<span class="neutral-2">{{ result.edition || "5e" }}</span>
				</li>
			</ul>

			<!-- SHOW SELECTED RESULT -->
			<div v-if="show">
				<a class="btn btn-clear btn-sm mb-2 block" @click="show = undefined">
					<i aria-hidden="true" class="fas fa-times red mr-1" />
					Close
				</a>
				<ViewMonster v-if="current === 'monsters'" :id="show" :edition="activeEdition" />
				<Spell v-if="current === 'spells'" :id="show" :edition="activeEdition" />
				<Condition v-if="current === 'conditions'" :id="show" :edition="activeEdition" />
				<Item v-if="current === 'items'" :id="show" :edition="activeEdition" />
			</div>
		</template>
	</div>
</template>

<script>
import ViewMonster from "src/components/compendium/Monster.vue";
import Item from "src/components/compendium/Item.vue";
import Spell from "src/components/compendium/Spell.vue";
import Condition from "src/components/compendium/Condition.vue";
import { mapGetters, mapActions } from "vuex";
import { editions } from "src/utils/generalConstants";

export default {
	components: {
		ViewMonster,
		Item,
		Spell,
		Condition,
	},
	props: {
		// Fixed edition to search/show, e.g. a campaign's edition. When omitted, the
		// component shows its own toggle backed by the `compendium_edition` store value.
		edition: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			types: [
				{ name: "monsters", label: "Monsters", icon: "fas fa-dragon" },
				{ name: "items", label: "Items", icon: "fas fa-treasure-chest" },
				{ name: "spells", label: "Spells", icon: "fas fa-wand-magic" },
				{ name: "conditions", label: "Conditions", icon: "fas fa-flame" },
			],
			current: "monsters",
			show: undefined,
			search: "",
			searchResults: [],
			noResult: "",
		};
	},
	computed: {
		...mapGetters(["compendium_edition"]),
		showEditionToggle() {
			return !this.edition;
		},
		activeEdition() {
			return this.edition || this.compendium_edition;
		},
		// The API expects no edition for 5e content; only pass it for 5.5e
		apiEdition() {
			return this.activeEdition === "5.5e" ? "5.5e" : undefined;
		},
		editionOptions() {
			return editions.map((e) => ({ label: e.label.replace("D&D ", ""), value: e.value }));
		},
		editionModel: {
			get() {
				return this.compendium_edition;
			},
			set(value) {
				this.set_compendium_edition(value);
			},
		},
	},
	watch: {
		activeEdition() {
			this.show = undefined;
			this.searchResults = [];
			this.noResult = "";
			if (this.search) {
				this.searchType();
			}
		},
	},
	methods: {
		...mapActions(["set_compendium_edition"]),
		...mapActions("api_monsters", ["fetch_monsters"]),
		...mapActions("api_items", ["fetch_api_items"]),
		...mapActions("api_spells", ["fetch_api_spells"]),
		...mapActions("api_conditions", ["fetch_conditions"]),
		setType(type) {
			this.show = undefined; //clear the previous selected item
			this.current = type;

			//Clear the search
			this.searchResults = [];
			this.search = "";
		},
		async searchType() {
			this.show = undefined; //clear the previous selected item
			this.searchResults = []; //clear old search results
			let data;

			if (this.current === "monsters") {
				data = this.fetch_monsters;
			}
			if (this.current === "items") {
				data = this.fetch_api_items;
			}
			if (this.current === "spells") {
				data = this.fetch_api_spells;
			}
			if (this.current === "conditions") {
				data = this.fetch_conditions;
			}

			data({ query: { search: this.search }, edition: this.apiEdition }).then((results) => {
				if (results.meta.count === 0) {
					this.noResult = 'No results for "' + this.search + '"';
				} else {
					this.noResult = "";
					this.searchResults = results.results;
				}
			});
		},
	},
};
</script>

<style lang="scss" scoped>
ul.results {
	list-style: none;
	padding: 0;

	li {
		background-color: $neutral-9;
		margin-bottom: 1px;
		vertical-align: center;
		line-height: 46px;
		padding: 0 10px;

		&:hover {
			background-color: $neutral-8;
		}
	}
}
</style>
