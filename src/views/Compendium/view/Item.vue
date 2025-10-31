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
					<p>Could not find item <strong>{{ id }}</strong></p>
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
	import Item from "src/components/compendium/Item";
	import { metaCompendium } from 'src/mixins/metaCompendium';
	import { eventBus } from 'src/utils/eventBus';

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
				title: this.item?.meta?.title,
				meta: this.generate_compendium_meta(this.item?.meta)
			}
		},
		mounted() {
			if(this.item) {
				this.loading = false;
				eventBus.emit('route-name', this.item?.name.capitalizeEach())
			} else {
				this.not_found = true;
				this.loading = false;
			}
		}
	}
</script>