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

		<div v-if="loading" class="loader"> <span>Loading item....</span></div>

		<h1 class="itemTitle d-flex justify-content-between">
			{{ item.name }}
			<!-- <span v-if="userInfo && userInfo.admin ">
				<a v-if="!edit" @click="setEdit(true)" v-b-tooltip.hover title="Edit" class="mx-2"><i class="fas fa-pencil-alt"></i></a>
				<a v-else @click="setEdit(false)" v-b-tooltip.hover title="Cancel" class="mx-2"><i class="fas fa-times"></i></a>
				<a @click="checked(!item.checked)" :class="{'gray-hover': !item.checked, 'green': item.checked}"><i class="fas fa-check"></i> Item checked</a>
			</span> -->
		</h1>

		<!-- EDIT -->
		<template v-if="userInfo && userInfo.admin && edit">
			<b-row class="mb-2 mt-3">
				<b-col sm="2"><label>Name</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Item name" v-model="item.name" :value="item.name"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Type</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Item type" v-model="item.type" :value="item.type"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Rarity</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Rarity" v-model="item.rarity" :value="item.rarity"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Attunement</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Attunement" v-model="item.requires_attunement" :value="item.requires_attunement"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Description</label></b-col>
				<b-col>
					<textarea type="text" class="form-control" rows="10" placeholder="Description" v-model="item.desc"></textarea>
				</b-col>
			</b-row>

			<table class="table" v-if="item.table">
				<thead>
					<th v-for="head in item.table.header" :key="head">{{ head }}</th>
				</thead>
				<tbody>
					<tr v-for="(row, i) in item.table.rows" :key="i">
						<td v-for="(col, i) in item.table.rows[i].columns" :key="i">
							{{ col }}
						</td>
					</tr>
				</tbody>
			</table>

			<!-- TABLE -->
			<h2>Info Table</h2>
			<b-row class="mb-3">
				<b-col sm="2">
					<b-form-select name="columns" v-model="columns">
						<option >Columns</option>
						<option v-for="i in 5" :value="i" :key="i">{{ i }}</option>
					</b-form-select>
				</b-col>
				<b-col>
					<a class="btn" @click="addTable()"><i class="fas fa-plus"></i> Add table</a>
				</b-col>
			</b-row>

			<template v-if="item.tables">
				<div v-for="(table, index) in item.tables" :key="index" class="mb-5">
					<h3 class="d-flex justify-content-between">
						<span>Table {{ index }}</span>
						<a class="red" @click="removeTable(index)"><i class="fas fa-trash-alt"></i></a>
					</h3>	
					<b-row class="table-row">
						<b-col>
							<b-form-input v-model="table.name" placeholder="Table name"/>
						</b-col>
					</b-row>
					<b-row class="table-row">
						<b-col v-for="(col, i) in table.columns" :key="i">
							<b-form-input v-model="table.header[i]" placeholder="Column header"/>
						</b-col>
					</b-row>
					<b-row v-for="(row, i) in table.rows" :key="i" class="table-row">
						<b-col v-for="(col, index) in table.rows[i].columns" :key="index">
							<b-form-input v-model="table.rows[i].columns[index]" placeholder=""/>
						</b-col>
					</b-row>
					<a @click="addRow(index)" class="btn btn-block mt-4">Add Row</a>
				</div>
			</template>

			<a @click="editItem()" class="btn btn-block mt-4 bg-green">Save</a>

		</template>

		<!-- VIEW -->
		<template v-else>
			<i class="mb-3 d-block">
				{{ item.type }}, 
				<span :class="{ 
					'white': item.rarity == 'common',
					'green': item.rarity == 'uncommon',
					'blue': item.rarity == 'rare',
					'purple': item.rarity == 'very rare',
					'orange': item.rarity == 'legendary',
					'red-light': item.rarity == 'artifact',
					}">
					{{ item.rarity }}
				</span>
				<template v-if="item.requires_attunement"> ( {{ item.requires_attunement }} )</template>
			</i>

			<p style="white-space: pre-line">{{ item.desc }}</p>
			<div v-for="(table, index) in item.tables" :key="index">
				<h6 v-if="table.name">{{ table.name }}</h6>
				<table class="table mb-5">
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
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex';

	export default {
		name: 'Item',
		components: {
			Crumble,
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