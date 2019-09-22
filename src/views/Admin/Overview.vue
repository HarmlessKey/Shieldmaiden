<template>
	<div class="container-fluid">
		<Crumble />
		<h1>Admin</h1>
		<ul class="entities hasImg">
			<li v-for="(item, index) in items" :key="index">
				<i class="img mr-2" :class="item.icon"></i>
				<div class="d-flex justify-content-between">
					<router-link :to="$route.path+'/'+item.url">{{ item.name }}</router-link>
					<span v-if="item.name == 'Users'">( {{ Object.keys(users).length }} )</span>
					<span v-if="item.name == 'Patrons'">( {{ Object.keys(patrons).length }} )</span>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Admin',
		components: {
			Crumble,
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
					'patrons': { 
						name: 'Patrons',
						url: 'patrons',
						icon: 'fab fa-patreon',
					},
				},
			}
		},
		firebase() {
			return {
				users: {
					source: db.ref('users'),
					readyCallback: () => this.isBusy = false
				},
				patrons: {
					source: db.ref('new_patrons'),
					readyCallback: () => this.isBusy = false
				},
			}
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>


	.container-fluid {
		padding: 20px;

		ul.entities {
			li {
				.img {
					border: transparent;
					background: none;
					text-align: center;
					font-size: 20px;
					line-height: 49px;
				}
			}
		}
	}


</style>