<template>
<div class="grid">
	<div class="container">

		<!-- SPELL OVERVIEW -->
		<template v-if="!$route.params.id">
			<Crumble />
			<h1><i class="fas fa-wand-magic"></i> Spells</h1>
			<p>
				If you can't find a spell, 
				it is because we are only allowed to store 
				spells from the <span v-b-tooltip.hover title="Systems Reference Document">SRD</span>.
			</p>

			<b-input-group class="mb-3">
				<input class="form-control" autocomplete="off" type="text" v-model="search" @keyup="searchSpell()" placeholder="Search spells" />
				<b-input-group-append>
					<button class="btn" @click="searchSpell()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} spells found</p>

			<b-table 
				:busy="isBusy"
				:items="searchResults" 
				:fields="fields"
				:per-page="15"
				:current-page="current"
			>
				<router-link :to="'/compendium/spells/' + data.item['.key']" slot="name" slot-scope="data">{{ data.value }}</router-link>
				<div slot="table-busy" class="loader">
					<span>Loading spells....</span>
				</div>
			</b-table>
			<div v-if="isBusy" class="loader"> <span>Loading spells....</span></div>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
			
			<!-- <a class="btn btn-block" @click="saveSpells()">Copy Spells from API</a>
			<ul>
				<li v-for="(spell, index) in allSpells" :key="index">
					{{ index + 1 }}. {{ spell.name }}
				</li>
			</ul> -->
			</template>

			<!-- WHEN A SPELL IS SELECTED -->
			<template v-else>
				<Spell :id="$route.params.id" />
			</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import Footer from '@/components/Footer.vue'
	import { mapActions } from 'vuex'
	import Spell from '@/components/compendium/Spell.vue'
	import axios from 'axios'

	export default {
		name: 'Error',
		components: {
			Crumble,
			Footer,
			Spell,
		},
		metaInfo: {
			title: 'Spells'
		},
		data() {
			return {
				id: this.$route.params.id,
				current: 1,
				fields: {
          index: {
            label: '#',
					},
          name: {
            label: 'Name',
            sortable: true
					},
          level: {
            label: 'Level',
            sortable: true
					},
				},
				search: '',
				searching: '',
				searchResults: [],
				noResult: '',
				isBusy: true,
				spells: [],
				allSpells: [],
			}
		},
		firebase() {
			return {
				spells: {
					source: db.ref('spells'),
					readyCallback: () => this.isBusy = false
				}
			}
		},
		mounted() {
			this.getSpell()
		},
		beforeMount() {
			this.searchResults = this.spells
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			saveSpells() {
				this.adding = true

				//Save all spells from the API in Firebase
				for(let key in this.allSpells) {
					let spell = this.allSpells[key]
					// console.log(spell)

					let id = spell._id

					//REMOVE UNNEEDED SHIT
					delete spell._id
					delete spell.school.url
					for(let key in spell.subclasses) {
						delete spell.subclasses[key].url
					}

					for(let key in spell.classes) {
						delete spell.classes[key].url
					}

					spell.url = encodeURI(spell.name)

					//console.log(key, spell.name, 'Added')

					db.ref('spells/' + id).set(spell);
				}
				this.adding = false
			},
			getSpell() {
				var id;
				for(id = 1; id <= 319; id++) {
					axios.get("http://www.dnd5eapi.co/api/spells/" + id)
					.then(response => {this.allSpells.push(response.data)})
				}
			},
			searchSpell() {
				this.current = 1; //Set current page to 1
				this.searchResults = [] //clear old search results
				this.searching = true // shows someone is searching

				//loop over all spells
				for (var i in this.spells) {
					var m = this.spells[i]

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
				// if someons is not searching anymore, all spells need to be shown
				if(this.search == '') {
					this.searchResults = this.spells
					this.searching = false
				}
			},
			// showSlide(monster) {
			// 	this.setSlide({
			// 		show: true,
			// 		type: 'npc',
			// 		entity: monster
			// 	})
			// },
		}
	}
</script>

<style lang="scss" scoped>
.grid {
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.container {
		padding-top: 30px;
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}

</style>