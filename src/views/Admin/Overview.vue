<template>
<div class="grid">
	<div class="container">
		<Crumble />
		<h1>Admin</h1>
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
		name: 'Admin',
		components: {
			Crumble,
			Footer,
		},
		metaInfo: {
			title: 'Admin'
		},
		data() {
			return {
				items: {
					'users': { 
						name: 'Users',
						url: 'users',
						icon: 'fas fa-users',
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
					border: transparent;
					background: none;
					text-align: center;
					font-size: 20px;
					line-height: 46px;
				}
			}
		}
	}
}

</style>