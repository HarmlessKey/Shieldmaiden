<template>
	<ViewItem :data="item" />
</template>

<script>
	import { db } from '@/firebase'
	import ViewItem from '@/components/ViewItem.vue';

	export default {
		name: 'Item',
		components: {
			ViewItem
		},
		props: ['id'],
		firebase() {
			return {
				item: {
					source: db.ref(`items/${this.id}`),
					asObject: true,
					readyCallback: () => this.$emit('name', this.item.name)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>