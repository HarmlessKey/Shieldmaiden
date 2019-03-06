<template>
<div class="grid">
	<div class="container">
		<Crumble />
		<h1>Compendium</h1>
		<p>If you can't find something, 
			it is because we are only allowed to store 
			data from the <span v-b-tooltip.hover title="Systems Reference Document">SRD</span>.
		</p>
		<ul class="entities hasImg">
			<li v-for="(item, index) in items" :key="index">
				<i class="img mr-2" :class="item.icon"></i> <router-link :to="$route.path+'/'+item.url">{{ item.name }}</router-link>
			</li>
		</ul>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Footer from '@/components/Footer.vue'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Compendium',
		components: {
			Crumble,
			Footer,
		},
		metaInfo: {
			title: 'Compendium'
		},
		data() {
			return {
				items: {
					'conditions': { 
						name: 'Conditions',
						url: 'conditions',
						icon: 'fas fa-skull-crossbones',
					},
					'monsters': { 
						name: 'Monsters',
						url: 'monsters',
						icon: 'fas fa-dragon',
					},
					'spells': { 
						name: 'Spells',
						url: 'spells',
						icon: 'fas fa-wand-magic',
					},
				},
			}
		},
		methods: {

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