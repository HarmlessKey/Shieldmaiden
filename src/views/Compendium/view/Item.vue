<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>{{ not_found ? "Item not found" : item.name }}</h1>
				<hk-share 
					v-if="!not_found" 
					:title="item.meta.title.capitalizeEach()"
					:text="item.meta.description" 
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
	import { mapGetters } from 'vuex';
	import Item from "src/components/compendium/Item.vue";
	import { metaCompendium } from 'src/mixins/metaCompendium';

	export default {
		name: "ViewItem",
		mixins: [
			metaCompendium,
		],
		components: {
			Item
		},
		data() {
			return {
				id: this.$route.params.id,
				loading: true,
				not_found: false
			}
		},
		async preFetch({ store, currentRoute }) {
			await store.dispatch('api_items/fetch_api_item', currentRoute.params.id, { root: true });
		},
		computed: {
			...mapGetters("api_items", ["get_api_item"]),
			item() {
				return this.get_api_item(this.id)
			}
		},
		meta() {
			return {
				title: this.item.meta.title,
				meta: this.generate_compendium_meta(this.item.meta)
			}
		},
		mounted() {
			this.$root.$emit('route-name', this.item.name.capitalizeEach())
		},
		// metaInfo() {
		// 	return {
		// 		title: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`,
		// 		meta: [
		// 			{ 
		// 				vmid: "description", 
		// 				name: "description", 
		// 				content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
		// 			},
		// 			{
		// 				vmid: "og-title",
		// 				property: "og:title", 
		// 				content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
		// 			},
		// 			{ 
		// 				vmid: "og-description", 
		// 				property: "og:description",
		// 				name: "description", 
		// 				content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
		// 			},
		// 			{ 
		// 				vmid: "twitter-title",
		// 				name: "twitter:title", 
		// 				content: `${this.item.name ? this.item.name.capitalizeEach() : "Item"} D&D 5e`
		// 			},
		// 			{ 
		// 				vmid: "twitter-description", 
		// 				name: "twitter:description",
		// 				content: `D&D 5th Edition item: ${ this.item.name ? this.item.name.capitalizeEach() : "Item" }. ${this.item.description}`
		// 			},
		// 		],
		// 	}
		// },
		
		// methods: {
		// 	...mapActions("api_items", ["fetch_api_item"]),
		// },
		// async mounted() {
		// 	await this.fetch_api_item(this.id).then(result => {
		// 		const maxLength = 160 - (25 + result.name.length);
		// 		result.description = `${result.desc.substring(0, maxLength).trim()}...`

		// 		this.item = result;
		// 		this.loading = false;
		// 	}).catch(() => {
		// 		this.not_found = true;
		// 		this.loading = false;
		// 	});
		// }
	}
</script>

<style lang="scss" scoped>

</style>