<template>
	<div>
		<h2>Compendium</h2>
		<i>What are you looking for?</i>
<!-- 
		<div class="options d-flex justify-content-start">
			<a v-for="(type, name) in types" :key="name"
				@click="setType(name)"
				class="mr-2"
				:class="{ 'active': current == name}"
			>
				<span class="icon"><i :class="type.icon"></i></span>
				<q-tooltip anchor="top middle" self="center middle">
					{{ name }}
				</q-tooltip>
			</a>
		</div> -->

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
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} {{ current }} found</p>

			<!-- SHOW SEARCH RESULTS -->
			<ul class="results">
				<li v-for="(result, index) in searchResults" :key="index">
						<div class="index">{{ index + 1 }}. </div>
						<a @click="showInfo(result['.key'])">
							{{ result.name }}
							<q-tooltip anchor="top middle" self="center middle">
								Show info
							</q-tooltip>
						</a>
				</li>
			</ul>

			<!-- SHOW SELECTED RESULT -->
			<template v-if="show">
				<Monster v-if="current == 'monsters'" :id="show" />
				<Spell v-if="current == 'spells'" :id="show" />
				<Condition v-if="current == 'conditions'" :id="show" />
				<Item v-if="current == 'items'" :id="show" />
			</template>

		</template>
		<router-link v-else to="/compendium">View entire compendium</router-link>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	import Monster from '@/components/compendium/Monster.vue';
	import Item from '@/components/compendium/Item.vue';
	import Spell from '@/components/compendium/Spell.vue';
	import Condition from '@/components/compendium/Condition.vue';

	export default {
		components: {
			Monster,
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
				monsters: db.ref('monsters'),
				items: db.ref('items'),
				spells: db.ref('spells'),
				conditions: db.ref('conditions'),
			}
		},
		methods: {
			setType(type) {
				this.show = undefined //clear the previous selected item
				this.current = type;

				//Clear the search
				this.searchResults = []
				this.search = ''
				this.searching = ''
			},
			showInfo(id) {
				this.show = id;

				//Clear the search
				this.searchResults = []
				this.search = ''
				this.searching = ''
			},
			searchType() {
				this.show = undefined //clear the previous selected item
				this.searchResults = [] //clear old search results
				this.searching = true // shows someone is searching

				//loop over all spells
				for (let i in this[this.current]) {
					let m = this[this.current][i]

					//if the name of a spell contains the search words, add it to search results
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
			},
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
			color: $gray-light !important;
			border-radius: 50%;
			background-color:$gray-active;
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
			background-color:$gray-dark;
			grid-template-columns: max-content auto;
			margin-bottom: 1px;
			vertical-align: center;
			line-height: 46px;
			padding: 0 5px;

			.index {
				padding-right: 10px;
			}
		}
	}
</style>