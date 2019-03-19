<template>
	<div>
		<h2>Compendium</h2>
		<i>What are you looking for?</i>

		<div class="options d-flex justify-content-start">
			<a v-for="(type, name) in types" :key="name"
				@click="setType(name)"
				class="mr-2"
				:class="{ 'active': current == name}"
				v-b-tooltip.hover :title="name">
				<span class="icon"><i :class="type.icon"></i></span>
			</a>
		</div>

		<template v-if="current">
			<b-input-group class="mb-3">
				<input class="form-control" type="text" v-model="search" @keyup="searchType()" :placeholder="'Search ' + current" />
				<b-input-group-append>
					<button class="btn" @click="searchType()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} {{ current }} found</p>

			<!-- SHOW SEARCH RESULTS -->
			<ul class="entities">
				<li v-for="(result, index) in searchResults" :key="index">
						<span class="gray-hover">{{ index + 1 }}. </span>
						<a v-b-tooltip.hover title="Show Info" @click="showInfo(result['.key'])">{{ result.name }}</a>
				</li>
			</ul>

			<!-- SHOW SELECTED RESULT -->
			<template v-if="show">
				<Monster v-if="current == 'monsters'" :id="show" />
				<Spell v-if="current == 'spells'" :id="show" />
				<Condition v-if="current == 'conditions'" :id="show" />
			</template>

		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	import Monster from '@/components/compendium/Monster.vue'
	import Spell from '@/components/compendium/Spell.vue'
	import Condition from '@/components/compendium/Condition.vue'

	export default {
		components: {
			Monster,
			Spell,
			Condition,
		},
		data() {
			return {
				types: {
					'monsters': { icon: 'fas fa-dragon' },
					'spells': { icon: 'fas fa-wand-magic' },
					'conditions': { icon: 'fas fa-skull-crossbones' },
				},
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
			color: #b2b2b2 !important;
			border-radius: 50%;
			background-color: #302f2f;
			width: 30px;
			height: 30px;
			display: block;
			font-size: 15px; 
			line-height: 30px;
			&:hover {
				background-color: #494747;
			}
			&.active {
				color: #2c97de !important;
			}
		}
	}
</style>