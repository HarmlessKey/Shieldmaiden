<template>
	<div>
		<h2>Compendium</h2>
		<i>What are you looking for?</i>

		<q-tabs
				v-model="current"
				:dark="$store.getters.theme === 'dark'"
				no-caps
				class="my-3"
			>
				<q-tab 
					v-for="({name, label, icon}, index) in types" 
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
				:dark="$store.getters.theme === 'dark'" filled square
				:placeholder="`Search ${current}`"
				type="text" 
				class="mb-2"
				autocomplete="off" 
				v-model="search"
				@keyup="searchType()"
				:error="!!noResult"
				:error-message="noResult"
			>
				<q-icon slot="append" name="fas fa-search" size="xs" class="pointer" @click="searchType()" />
			</q-input>

			<!-- SHOW SEARCH RESULTS -->
			<ul v-if="!show" class="results">
				<li v-for="(result, index) in searchResults" :key="index" class="truncate">
					<a @click="show = result['_id']">
						{{ result.name.capitalizeEach() }}
						<q-tooltip anchor="top middle" self="center middle">
							Show info
						</q-tooltip>
					</a>
				</li>
			</ul>

			<!-- SHOW SELECTED RESULT -->
			<div v-if="show">
				<a class="btn btn-clear btn-sm mb-2" @click="show = undefined">
					<i aria-hidden="true" class="fas fa-times red mr-1" />
					Close
				</a>
				<ViewMonster v-if="current == 'monsters'" :id="show" />
				<Spell v-if="current == 'spells'" :id="show" />
				<Condition v-if="current == 'conditions'" :id="show" />
				<Item v-if="current == 'items'" :id="show" />
			</div>

		</template>
		<router-link v-else class="btn bg-neutral-5 mt-3 btn-block" to="/compendium">
			View entire compendium
		</router-link>
	</div>
</template>

<script>
	import ViewMonster from '@/components/compendium/Monster.vue';
	import Item from '@/components/compendium/Item.vue';
	import Spell from '@/components/compendium/Spell.vue';
	import Condition from '@/components/compendium/Condition.vue';
	import { mapActions } from "vuex";

	export default {
		components: {
			ViewMonster,
			Item,
			Spell,
			Condition,
		},
		data() {
			return {
				types: [
					{ name: 'monsters', label: 'Monsters', icon: 'fas fa-dragon' },
					{ name: 'items', label: 'Items', icon: 'fas fa-treasure-chest' },
					{ name: 'spells', label: 'Spells', icon: 'fas fa-wand-magic' },
					{ name: 'conditions', label: 'Conditions', icon: 'fas fa-flame' },
				],
				current: undefined,
				show: undefined,
				search: '',
				searchResults: [],
				noResult: '',
			}
		},
		methods: {
			...mapActions("api_monsters", ["get_monsters"]),
			...mapActions("api_items", ["get_api_items"]),
			...mapActions("api_spells", ["get_api_spells"]),
			...mapActions("api_conditions", ["get_conditions"]),
			setType(type) {
				this.show = undefined //clear the previous selected item
				this.current = type;

				//Clear the search
				this.searchResults = [];
				this.search = '';
			},
			async searchType() {
				this.show = undefined //clear the previous selected item
				this.searchResults = [] //clear old search results

				if(this.current === "monsters") {
					await this.get_monsters({ query: { search: this.search }}).then(results => {
						if(results.meta.count === 0) {
							this.noResult = 'No results for "' + this.search + '"';
						} else {
							this.noResult = "";
							this.searchResults = results.results;
						}
					});
				}
				if(this.current === "items") {
					await this.get_api_items({ query: { search: this.search }}).then(results => {
						if(results.meta.count === 0) {
							this.noResult = 'No results for "' + this.search + '"';
						} else {
							this.noResult = "";
							this.searchResults = results.results;
						}
					});
				}
				if(this.current === "spells") {
					await this.get_api_spells({ query: { search: this.search }}).then(results => {
						if(results.meta.count === 0) {
							this.noResult = 'No results for "' + this.search + '"';
						} else {
							this.noResult = "";
							this.searchResults = results.results;
						}
					});
				}
				if(this.current === "conditions") {
					await this.get_conditions({ query: { search: this.search }}).then(results => {
						if(results.meta.count === 0) {
							this.noResult = 'No results for "' + this.search + '"';
						} else {
							this.noResult = "";
							this.searchResults = results.results;
						}
					});
				}
			}
		},
	};
</script>

<style lang="scss" scoped>
	h2 {
		margin-bottom: 5px !important;
	}
	ul.results {
		list-style: none;
		padding: 0;
		
		li {
			background-color: $neutral-9;
			margin-bottom: 1px;
			vertical-align: center;
			line-height: 46px;
			padding: 0 10px;
		}
	}
</style>