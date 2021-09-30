<template>
	<tag :is="cardView ? 'hk-card' : 'div'">
		<div slot="header" :class="{ 'card-header': cardView }">
			<h1>{{ item.name }}</h1>
		</div>
		<div :class="{ 'card-body': cardView }">
			<ViewItem :data="item" />
		</div>
	</tag>
</template>

<script>
	import { db } from '@/firebase'
	import ViewItem from '@/components/ViewItem.vue';

	export default {
		name: 'Item',
		components: {
			ViewItem
		},
		props: {
			id: {
				type: String,
				required: true
			},
			cardView: {
				type: Boolean,
				default: false
			}
		},
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