<template>
<div class="grid">
	<div class="container">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1><i class="fas fa-dragon"></i> Monsters</h1>
			<p>
				If you can't find a monster, 
				it is because we are only allowed to store 
				monsters from the <a href="../SRD-OGL_V5.1.pdf" target="_blank">SRD</a>.
			</p>

			<b-input-group class="mb-3">
				<input class="form-control" autocomplete="off" type="text" v-model="search" @keyup="searchMonster()" placeholder="Search monsters" />
				<b-input-group-append>
					<button class="btn" @click="searchMonster()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} monsters found</p>

			<b-table 
				:busy="isBusy"
				:items="searchResults" 
				:fields="fields"
				:per-page="15"
				:current-page="current"
			>
				<router-link :to="'/compendium/monsters/' + data.item['.key']" slot="name" slot-scope="data">{{ data.value }}</router-link>
				<div slot="table-busy" class="loader">
					<span>Loading monsters....</span>
				</div>
			</b-table>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
		</template>

		<!-- SHOW MONSTER -->
		<template v-else>
			<Monster :id="$route.params.id" />
		</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import Footer from '@/components/Footer.vue'
	import Monster from '@/components/compendium/Monster.vue'
	import { mapActions } from 'vuex'

	export default {
		name: 'Error',
		components: {
			Crumble,
			Footer,
			Monster,
		},
		metaInfo: {
			title: 'Monsters'
		},
		data() {
			return {
				id: this.$route.params.id,
				monsters: undefined,
				current: 1,
				fields: {
          index: {
            label: '#',
					},
          name: {
            label: 'Name',
            sortable: true
					},
					type: {
						label: 'Type',
						sortable: true
					},
					challenge_rating: {
						label: 'CR',
						sortable: true
					},
				},
				search: '',
				searching: '',
				searchResults: [],
				noResult: '',
				isBusy: true,
			}
		},
		firebase() {
			return {
				monsters: {
					source: db.ref('monsters'),
					readyCallback: () => this.isBusy = false
				}
			}
		},
		beforeMount() {
			this.searchResults = this.monsters
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchMonster() {
				this.current = 1;
				this.searchResults = []
				this.searching = true
				for (var i in this.monsters) {
					var m = this.monsters[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
				if(this.search == '') {
					this.searchResults = this.monsters
					this.searching = false
				}
			},
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