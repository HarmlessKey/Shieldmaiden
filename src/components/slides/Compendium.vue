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
				:dark="$store.getters.theme === 'dark'" filled square dense
				:placeholder="`Search ${current}`"
				type="text" 
				class="mb-2"
				autocomplete="off" 
				v-model="search"
				@keyup="searchType()"
			>
				<q-icon slot="append" name="fas fa-search" size="xs" class="pointer" @click="searchType()" />
			</q-input>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult && Object.keys(searchResults).length" class="green">{{ Object.keys(searchResults).length }} {{ current }} found</p>

			<!-- SHOW SEARCH RESULTS -->
			<ul v-if="!show" class="results">
				<li v-for="(result, index) in searchResults" :key="index">
					<a @click="showInfo(result['_id'])">
						{{ result.name.capitalizeEach() }}
						<q-tooltip anchor="top middle" self="center middle">
							Show info
						</q-tooltip>
					</a>
				</li>
			</ul>

			<!-- SHOW SELECTED RESULT -->
			<div v-if="show">
				<a class="btn btn-clear btn-sm mb-2" @click="show = undefined">Close</a>
				<ViewMonster v-if="current == 'monsters'" :id="show" />
				<Spell v-if="current == 'spells'" :id="show" />
				<Condition v-if="current == 'conditions'" :id="show" />
				<Item v-if="current == 'items'" :id="show" />
			</div>

		</template>
		<router-link v-else class="btn bg-neutral-5 btn-block" to="/compendium">View entire compendium</router-link>
	</div>
</template>

<script>
	import { db } from '@/firebase'

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
				searching: '',
				searchResults: [],
				noResult: '',
			}
		},
		firebase() {
			return {
				items: db.ref('items'),
				spells: db.ref('spells'),
				conditions: db.ref('conditions'),
			}
		},
		methods: {
			...mapActions("api_monsters", ["get_monsters"]),
			setType(type) {
				this.show = undefined //clear the previous selected item
				this.current = type;

				//Clear the search
				this.searchResults = [];
				this.search = '';
				this.searching = '';
			},
			showInfo(id) {
				this.show = id;
			},
			searchType() {
				this.show = undefined //clear the previous selected item
				this.searchResults = [] //clear old search results

				if(this.current === "monsters") {
					this.searchMonsters();
				} else {
					this.searching = true // shows someone is searching

					//loop over all entries
					for (let i in this[this.current]) {
						let m = this[this.current][i]
	
						//if the name of an entry contains the search words, add it to search results
						if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
							this.noResult = ''
							this.searchResults.push(m)
						}
					}
					// If there are no results, show this
					if(this.searchResults == '' && this.search != '') {
						this.noResult = 'No results for "' + this.search + '"';
					}
					// if someons is not searching anymore
					if(this.search == '') {
						this.searching = false
					}
				}
			},
			async searchMonsters() {
				if(this.search.length >= 3) {
					this.searching = true;
					await this.get_monsters({ query: { search: this.search }}).then(results => {
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
	.options {
		margin: 20px 0;

		a {
			text-align: center;
			color: $neutral-2 !important;
			border-radius: 50%;
			width: 30px;
			height: 30px;
			display: block;
			font-size: 15px; 
			line-height: 30px;
			&:hover {
				background-color: #494747;
			}
			&.active {
				color: $blue !important;
			}
		}
	}
	ul.results {
		list-style: none;
		padding: 0;
		
		li {
			display: grid;
			background-color: $neutral-9;
			grid-template-columns: max-content auto;
			margin-bottom: 1px;
			vertical-align: center;
			line-height: 46px;
			padding: 0 10px;

			.index {
				padding-right: 10px;
			}
		}
	}
</style>