<template>
<div class="grid">
	<div class="container">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1><i class="fas fa-skull-crossbones"></i> conditions</h1>
			<p>
				If you can't find a condition, 
				it is because we are only allowed to store 
				conditions from the <span v-b-tooltip.hover title="Systems Reference Document">SRD</span>.
			</p>

			<b-input-group class="mb-3">
				<input class="form-control" autocomplete="off" type="text" v-model="search" @keyup="searchCondition()" placeholder="Search conditions" />
				<b-input-group-append>
					<button class="btn" @click="searchCondition()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} conditions found</p>

			<b-table 
				:busy="isBusy"
				:items="searchResults" 
				:fields="fields"
				:per-page="15"
				:current-page="current"
			>
				<router-link :to="'/compendium/conditions/' + data.item['.key']" slot="name" slot-scope="data">{{ data.value }}</router-link>
				<div slot="table-busy" class="loader">
					<span>Loading conditions....</span>
				</div>
			</b-table>
			<div v-if="isBusy" class="loader"> <span>Loading conditions....</span></div>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
		</template>

		<!-- SHOW CONDITION -->
		<template v-else>
			<Condition :id="$route.params.id" />
		</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import Footer from '@/components/Footer.vue'
	import Condition from '@/components/compendium/Condition.vue'
	import { mapActions } from 'vuex'

	export default {
		name: 'Conditions',
		components: {
			Crumble,
			Footer,
			Condition,
		},
		metaInfo: {
			title: 'Conditions'
		},
		data() {
			return {
				id: this.$route.params.id,
				conditions: undefined,
				current: 1,
				fields: {
          index: {
            label: '#',
					},
          name: {
            label: 'Name',
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
				conditions: {
					source: db.ref('conditions'),
					readyCallback: () => this.isBusy = false
				}
			}
		},
		beforeMount() {
			this.searchResults = this.conditions
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchCondition() {
				this.current = 1;
				this.searchResults = []
				this.searching = true
				for (var i in this.conditions) {
					var m = this.conditions[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
				if(this.search == '') {
					this.searchResults = this.conditions
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