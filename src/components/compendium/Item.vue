<template>
	<div v-if="!loading">
		<h3 class="d-flex justify-content-between">
			{{ item.name }}
		</h3>

		<i class="mb-3 d-block">
			{{ item.type }}, 
			<span :class="{ 
				'white': item.rarity == 'common',
				'green': item.rarity == 'uncommon',
				'blue': item.rarity == 'rare',
				'purple': item.rarity == 'very rare',
				'orange': item.rarity == 'legendary',
				'red-light': item.rarity == 'artifact',
				}"
			>
				{{ item.rarity }}
			</span>
			<template v-if="item.requires_attunement"> ( {{ item.requires_attunement }} )</template>
		</i>

		<div style="white-space: pre-line">{{ item.desc }}</div>
		
		<div class="mt-3" v-for="(table, index) in item.tables" :key="index">
			<h6 v-if="table.name">{{ table.name }}</h6>
			<table class="table">
				<thead>
					<th v-for="head in table.header" :key="head">{{ head }}</th>
				</thead>
				<tbody>
					<tr v-for="(row, i) in table.rows" :key="i">
						<td v-for="(col, i) in table.rows[i].columns" :key="i">
							{{ col }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<hk-loader v-else name="item" />
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: "Item",
		props: {
			// If the item is fetched in a parent component you can send the full item object in de data prop
			data: {
				type: Object
			},
			// If the id prop is passed, the item is fetched in the Monster component
			id: {
				type: String
			}
		},
		data() {
			return {
				item: {},
				loading: true
			}
		},
		async beforeMount() {
			if(this.data) {
				this.item = this.data;
				this.loading = false;
			} else {
				this.item = await this.get_api_item(this.id);
				this.loading = false;
			}			
		},
		methods: {
			...mapActions("api_items", ["get_api_item"]),
		}
	};
</script>

<style lang="scss" scoped>


</style>
