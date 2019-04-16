<template>
	<div>
		<Crumble :name="patron.email" />

		<div v-if="loading" class="loader"> <span>Loading patron....</span></div>

		<h1>{{ patron.email }}</h1>
		<p><i class="gray-hover">{{ patron['.key'] }}</i></p>

		
		<h2>Tier</h2>
		<p>{{ patron.tier_title }}</p>

		<h2>Status</h2>
		<p>
			<span :class="{ 'red': patron.status != 'active_patron', 'green': patron.status == 'active_patron' }">{{ patron.status }}</span>
		</p>

		<a target="_blank" :href="'https://www.patreon.com/user/creators?u='+patron['.key']">Show on Patreon</a>

	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Patron',
		components: {
			Crumble
		},
		props: ['id'],
		metaInfo() {
			return {
				title: 'Patron | ' + this.patron.email,
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
				patron: {
					source: db.ref(`patrons/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
			}
		},
		computed: {

		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>
	h1, h2 {
		margin-bottom: 5px !important;
	}
	.data {
		line-height: 25px;

		.type {
			display: inline-block;
			width: 150px;
		}
	}
</style>