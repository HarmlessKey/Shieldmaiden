<template>
	<div>
		<Crumble :name="user.username" />

		<div v-if="loading" class="loader"> <span>Loading user....</span></div>

		<h1>{{ user.username }}</h1>
		<i class="gray-hover">{{ user['.key'] }}</i>


	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Condition',
		components: {
			Crumble
		},
		props: ['id'],
		metaInfo() {
			return {
				title: 'Admin | ' + this.user.username,
			}
		},
		beforeMount() {
			//Because the component is loaded in another view, 
			//the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
				loading: true,
			}
		},
		firebase() {
			return {
				user: {
					source: db.ref(`users/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>
	h1 {
		margin-bottom: 5px !important;
	}
	.url {
		display: block;
		margin-bottom: 15px;
		word-break: break-all;
	}
	ul {
		margin-top: 20px;
		padding: 20px;

		li {
			margin-bottom: 20px;
		}

		&.exhaustion {
			list-style: none;
			padding: 0;
		}
	}
</style>