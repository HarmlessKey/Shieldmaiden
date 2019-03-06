<template>
	<div>
		<small v-if="$route.meta.basePath != '/compendium'" class="url">url: <a :href="'https://harmlesskey.com/compendium/monsters/'+id" target="_blank">https://harmlesskey.com/compendium/monsters/{{ id }}</a></small>
		<Crumble v-else :name="monster.name"/>

		<div v-if="loading" class="loader"> <span>Loading monster....</span></div>

		<h1 class="d-none">{{ monster.name }}</h1>
		<ViewEntity :entity="monster" />
	</div>
</template>

<script>
	import { db } from '@/firebase'

	import ViewEntity from '@/components/ViewEntity.vue';
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Monster',
		components: {
			Crumble,
			ViewEntity,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.monster.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Monster: ' + this.monster.name }
        ]
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
				monster: {
					source: db.ref(`monsters/${this.id}`),
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
	.url {
		display: block;
		margin-bottom: 15px;
		word-break: break-all;
	}
</style>