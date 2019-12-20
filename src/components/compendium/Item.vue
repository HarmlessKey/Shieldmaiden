<template>
	<div>
		<template v-if="$route.meta.basePath != '/compendium'">
			<small class="url">url: <a :href="'https://harmlesskey.com/compendium/items/'+id" target="_blank">https://harmlesskey.com/compendium/items/{{ id }}</a></small>
			<ins class="adsbygoogle"
				v-if="(tier && !tier.benefits.ads) || tier == undefined"
				style="display:inline-block;width:285px;height:100px"
				data-ad-client="ca-pub-2711721977927243"
				data-ad-slot="5263800080">
			</ins>
		</template>
		<template v-else>
			<Crumble :name="item.name"/>
			<div v-if="(tier && !tier.benefits.ads) || tier == undefined" align="center">
				<ins class="adsbygoogle"
						style="display:block; margin-bottom:20px;"
						data-ad-client="ca-pub-2711721977927243"
						data-ad-slot="4341848074"
						data-ad-format="auto"
						data-full-width-responsive="true">
				</ins>
			</div>
		</template>

		<ViewItem :data="item" />
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex';
	import ViewItem from '@/components/ViewItem.vue';

	export default {
		name: 'Item',
		components: {
			Crumble,
			ViewItem
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.item.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Item: ' + this.item.name }
        ]
			}
		},
		beforeMount() {
			//Because the component is loaded
			//in another view, the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
				loading: true,
				edit: false,
				columns: undefined,
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'tier'
			]),
		},
		firebase() {
			return {
				item: {
					source: db.ref(`items/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		mounted() {
			this.$nextTick(function() {
				// eslint-disable-next-line
				if ($('ins').length > 0) {
					// eslint-disable-next-line
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
		},
		methods: {
			setEdit(value) {
				this.edit = value
			},
			addTable() {
				if(this.columns !== undefined) {
					if(this.item.tables == undefined) {
						this.item.tables = [];
					}
					this.item.tables.push({
						columns: this.columns,
						header: [],
						rows: [],
					})
				}
				this.$forceUpdate();
			},
			addRow(key) {
				var cols = []

				for(let i = 1; i <= this.item.tables[key].columns; i++) {
					cols.push('column '+ i)
				}
				this.item.tables[key].rows.push({
					columns: cols
				})
				this.$forceUpdate();
			},
			editItem() {
				this.$validator.validateAll().then((result) => {
					delete this.item['.key']
					if (result) {
						db.ref(`items/${this.id}/`).set(this.item);
						this.edit = false;
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
			},
			removeTable(key) {
				this.$delete(this.item.tables, key)
				this.$forceUpdate(); //IMPORTANT
			},
			checked(value) {
				db.ref(`items/${this.id}/checked`).set(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
 .itemTitle {
		margin-bottom: 5px;

		i {
			font-size: 15px;
		}
 }
	.table-row {
		padding: 10px 0;
		border-bottom: solid 1px #494747;
	}
	table {
		th:first-child, td:first-child {
			width: 0%;
		}
	}
</style>