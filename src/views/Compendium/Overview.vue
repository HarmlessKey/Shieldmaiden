<template>
<div class="grid">
	<div class="container">
		<h1>Compendium</h1>
		<p>If you can't find something, 
			it is because we are only allowed to store 
			data from the <span v-b-tooltip.hover title="Systems Reference Document">SRD</span>.
		</p>
		<ul class="entities hasImg">
			<li>
				<i class="img fas fa-dragon mr-2"></i> <router-link :to="$route.path+'/monsters'">Monsters</router-link>
			</li>
			<li>
				<i class="img fas fa-wand-magic mr-2"></i> <router-link :to="$route.path+'/spells'">Spells</router-link>
			</li>
			<!-- <li>
				<i class="fas fa-skull-crossbones mr-2"></i> <router-link :to="$route.path+'/conditions'">Conditions</router-link>
			</li> -->
		</ul>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Footer from '@/components/Footer.vue'
	import { mapActions } from 'vuex'

	export default {
		name: 'Error',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Compendium'
		},
		data() {
			return {
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
					challenge_rating: {
						label: 'CR',
						sortable: true
					},
					type: {
						label: 'Type',
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
			showSlide(monster) {
				this.setSlide({
					show: true,
					type: 'npc',
					entity: monster
				})
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

		ul.entities {
			li {
				.img {
					text-align: center;
					font-size: 20px;
					line-height: 46px;
				}
			}
		}
	}
}

</style>