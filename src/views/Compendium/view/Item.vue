<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>{{ not_found ? "Item not found" : item.name }}</h1>
				<hk-share 
					v-if="!not_found" 
					:title="item.name" 
					:text="`${item.name} D&D 5e. ${item.description}`" 
					size="sm"
				/>
			</div>
			<div class="card-body">
				<div v-if="not_found">
					<p>Could not find item <b>{{ id }}</b></p>
					<router-link to="/compendium/items" class="btn bg-neutral-5">
						Find items
					</router-link>
				</div>
				<Item v-else :data="item" />
			</div>
		</template>
		<hk-loader v-else name="item" />
	</hk-card>
</template>

<script>
	import { mapActions } from 'vuex';
	import Item from "@/components/compendium/Item.vue";

	export default {
		name: "ViewItem",
		components: {
			Item
		},
		metaInfo() {
			return {
				title: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`,
				meta: [
					{ 
						vmid: "description", 
						name: "description", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
					},
				],
			}
		},
		data() {
			return {
				id: this.$route.params.id,
				item: {},
				loading: true,
				not_found: false
			}
		},
		methods: {
			...mapActions("api_items", ["get_api_item"]),
		},
		async mounted() {
			await this.get_api_item(this.id).then(result => {
				const maxLength = 160 - (25 + result.name.length);
				result.description = `${result.desc.substring(0, maxLength).trim()}...`

				this.item = result;
				this.loading = false;
			}).catch(() => {
				this.not_found = true;
				this.loading = false;
			});
		}
	}
</script>

<style lang="scss" scoped>

</style>