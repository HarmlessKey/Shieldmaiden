<template>
	<div>
		<h1 class="d-none">{{ monster.name }}</h1>
		<ViewEntity :entity="monster" />
	</div>
</template>

<script>
	import { db } from '@/firebase'

	import ViewEntity from '@/components/ViewEntity.vue';

	export default {
		name: 'Monster',
		components: {
			ViewEntity: ViewEntity,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.monster.name,
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
			}
		},
		firebase() {
			return {
				monster: {
					source: db.ref(`monsters/${this.id}`),
					asObject: true,
				}
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>

</style>