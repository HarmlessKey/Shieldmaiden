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
		metaInfo() {
			return {
				title: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`,
				meta: [
					{ 
						vmid: "description", 
						name: "description", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.description}`
					},
				],
			}
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
		computed: {
			description() {
				return (this.item && this.item.desc) ? `${this.item.desc.substring(0, 110).trim()}...` : "";
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