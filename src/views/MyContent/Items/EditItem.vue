<template>
	<div v-if="overencumbered" class='container'>
		<OverEncumbered/>
	</div>
	<div class="content" v-else-if="item || $route.name == 'AddItem'">
		<div class="form">
			<hk-card header="Copy Existing Item" v-if="$route.name == 'AddItem'">
				<q-input 
					dark filled square dense
					label="Search items"
					type="text" 
					autocomplete="off" 
					v-model="searched"
					@keyup="searchItems()" 
				>
					<q-icon slot="append" name="fas fa-search" class="pointer" size="xs" @click="searchItems()" />
				</q-input>
				<div v-if="searched !== undefined && searched !== ''" class="green result-count" :class="{'red': Object.keys(foundItems).length === 0}">{{ Object.keys(foundItems).length }} results for {{ searched }}</div>
				<ul class="entities mt-3" v-if="foundItems">
					<li  v-for="(item, index) in foundItems" :key="'item-'+index" class="d-flex justify-content-between">
						<div class="d-flex justify-content-left">
							<a @click="setSlide({show: true, type: 'ViewItem', data: item})" class="mr-2">
								<i class="fas fa-info-circle"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Show info
								</q-tooltip>
							</a>
							{{ item.name }}
						</div>
						<a class="gray-hover" @click="copy(item)">
							<i class="fas fa-copy blue"></i>
							<span class="d-none d-md-inline ml-1">Copy</span>
							<q-tooltip anchor="top middle" self="center middle">
								Copy item
							</q-tooltip>
						</a>
					</li>
				</ul>
			</hk-card>
		
			<hk-card header="Your Item">
				<!-- NAME -->
				<q-input 
					dark filled square dense
					label="Name"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					v-model="item.name" 
					v-validate="'max:100|required'" 
					maxlength="100"
					data-vv-as="Name"
					id="name"
					name="name" 
				/>
				<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
			
				<!-- IMAGE -->
				<div class="avatar">
					<div class="img" v-if="item.image" :style="{ backgroundImage: 'url(\'' + item.image + '\')' }"></div>
					<div class="img" v-else>
						<img src="@/assets/_img/styles/axe.svg" />
					</div>
					<div>
						<q-input 
							dark filled square
							label="image"
							autocomplete="off"  
							type="text" 
							v-model="item.image" 
							v-validate="'url'" 
							data-vv-as="image"
							name="image" 
							id="image"
							placeholder="Image URL"
						/>
						<p class="validate red" v-if="errors.has('image')">{{ errors.first('image') }}</p>
					</div>
				</div>

				<q-input
					dark filled square dense
					label="Description"
					autogrow
					class="mb-4"
					autocomplete="off"  
					type="text" 
					v-model="item.desc" 
					name="image" 
					id="image"
				/>

				<!-- TABLE -->
				<label class="d-flex justify-content-between add-table">
					<span>
						<i class="fal fa-table"></i> Info Tables
					</span>
					<span class="d-flex justify-content-end">
						<q-input 
							dark filled square dense
							label="Columns"
							type="number" 
							v-validate="'numeric|max_value:10|min_value:1'" 
							max="10"
							min="1"
							name="columns"
							v-model="columns"
							class="mr-2"
						/>
						
						<a @click="!errors.has('columns') ? addTable() : null" :class="{ disabled: errors.has('columns')}"><i class="fas fa-plus"></i> Add table</a>
					</span>
				</label>

				<template v-if="item.tables">
					<div v-for="(table, tableIndex) in item.tables" :key="tableIndex" class="mb-5">
						<h3 class="d-flex justify-content-between">
							<span>{{ table.name || 'Table ' + (parseInt(tableIndex)+1) }}</span>
							<a class="red" @click="removeTable(tableIndex)"><i class="fas fa-trash-alt"></i></a>
						</h3>

						<q-input 
							dark filled square dense
							label="Table name"
							v-model="table.name" 
							class="mb-3"
							name="table name"
							v-validate="'required'" 
						/>
						<p class="validate red" v-if="errors.has('table name')">{{ errors.first('table name') }}</p>

						<div class="item-table" :style="{ 'grid-template-columns': `repeat(${table.columns}, auto) 30px` }">
							<div v-for="(col, i) in table.columns" :key="i" class="header">
								<q-input 
									dark filled square dense
									v-model="table.header[i]" 
									:placeholder="`Column header ${i+1}`"
									v-validate="'max:100|required'"
									maxlength="100"
									:data-vv-as="`column header ${i+1}`"
									:name="`column-header-${i+1}`"
								/>
								<p class="validate red" v-if="errors.has(`column-header-${i+1}`)">{{ errors.first(`column-header-${i+1}`) }}</p>
							</div>
							<div></div>
							<template v-for="(row, rowIndex) in table.rows">
								<div v-for="(col, colIndex) in table.rows[rowIndex].columns" :key="`column-${rowIndex}-${colIndex}`">
									<q-input 
										dark filled square dense
										v-model="table.rows[rowIndex].columns[colIndex]" 
										:placeholder="`Column ${colIndex+1}`"
										v-validate="'max:100|required'"
										maxlength="100"
										:data-vv-as="`column ${colIndex+1}`"
										:name="`cell-${rowIndex+1}-${colIndex+1}`"
									/>
									<p class="validate red" v-if="errors.has(`cell-${rowIndex+1}-${colIndex+1}`)">{{ errors.first(`cell-${rowIndex+1}-${colIndex+1}`) }}</p>
								</div>
								<a class="red remove" @click="removeRow(tableIndex, rowIndex)" :key="`remove-${rowIndex}`"><i class="fas fa-trash-alt"></i></a>
							</template>
						</div>
						<a @click="addRow(tableIndex)" class="btn btn-block mt-4">Add Row</a>
					</div>
				</template>
			</hk-card>
		</div>

		<div class="save">
			<p class="error red" v-if="errors.items && errors.items.length > 0">There is an error in your form.</p>
			<router-link to="/items" class="btn bg-gray mr-2">Cancel</router-link>
			<button v-if="$route.name == 'AddItem'" class="btn" @click="addItem()"><i class="fas fa-plus"></i> Add Item</button>
			<button 
				v-else 
				:disabled="errors.items && errors.items.length > 0"
				class="btn" 
				@click="editItem()"
			>
				<i class="fas fa-check"></i> Save
			</button>
		</div>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { skills } from '@/mixins/skills.js'
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import { general } from '@/mixins/general.js'


	export default {
		name: 'Items',
		mixins: [general, skills],
		metaInfo: {
			title: 'Items'
		},
		components: {
			OverEncumbered,
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				itemId: this.$route.params.id,
				search: ["name"],
                searched: undefined,
				foundItems: [],
				columns: undefined
			}
		},
		mounted() {
			var items = db.ref(`items`);
			items.on('value', async (snapshot) => {
				let items = snapshot.val();
				items = Object.values(items);

				let custom = db.ref(`custom_items/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customItems = snapshot.val();
					for(let key in customItems) {
						items.push(customItems[key]);
					}
				});
				this.items = items;
				this.loadingItems = false;
			});
		},
		firebase() {
			return {
				item: {
					source: db.ref(`custom_items/${this.userId}/${this.itemId}`),
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchItems() {
				const vm = this;
				let searchTerm = this.searched.toLowerCase();
				let results = this.items.filter( function(row) {
					for (let i in vm.search) {
                        let key = vm.search[i];
						// If field is undefined don't return row
						if (row[key] == undefined) {
							return
						}
						if (row[key].toLowerCase().includes(searchTerm)){
							return row;
						}
					}
				});
				if(searchTerm === '') {
					this.foundItems = [];
				} else {
					this.foundItems = results;
				}
			},
			copy(item) {
				this.item = item;
				this.foundItems = [];
				this.searched = '';
			},
			addItem() {
				// THIS IS UGLY
				delete this.item['.value'];
				delete this.item['.key'];

				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('custom_items/' + this.userId).push(this.item);
						this.$router.replace('/items')
					} else {
						//console.log('Not valid');
					}
				})
			},
			editItem() {
				// THIS IS UGLY
				delete this.item['.key']

				// UGLY ENDS HERE
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`custom_items/${this.userId}/${this.itemId}`).set(this.item);
						this.$router.replace('/items')
					} else {
						this.$snotify.error('There is something wrong in your form, scroll up to fix it.', 'Error', {
						});
					}
				})
			},
			addTable() {	
				if(this.columns !== undefined) {
					this.columns = parseInt(this.columns);
					if(this.item.tables === undefined) {
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
					cols.push(undefined)
				}
				this.item.tables[key].rows.push({
					columns: cols
				})
				this.$forceUpdate();
			},
			removeRow(tableIndex, rowIndex) {
				this.$delete(this.item.tables[tableIndex].rows, rowIndex);
				this.$forceUpdate(); //IMPORTANT
			},
			removeTable(key) {
				this.$delete(this.item.tables, key);
				this.$forceUpdate(); //IMPORTANT
			},
		}
	}
</script>

<style lang="scss" scoped>
.content {
	display: grid;
	height: calc(100vh - 50px) !important;
	grid-template-rows: auto 60px;

	.form {
		overflow-y: scroll;

		&::-webkit-scrollbar {
			display: none;
		}
		
		.avatar {
			display: grid;
			grid-template-columns: 56px 1fr;
			grid-column-gap: 10px;

			.img {
				border: solid 1px #b2b2b2;
				display: block;
				width: 56px;
				height: 56px;
				background-size: cover;
				background-position: center top;
			}
		}
		label {
			line-height: 37px;
			margin-bottom: 20px;

			&.add-table {
				border-bottom: solid 1px #5c5757;
				padding-bottom: 5px;

				input[type=number] {
					max-width: 110px;
					margin-right: 10px;
				}
			}
		}
		.item-table {
			display: grid;
			grid-template-rows: minmax(46px max-content);

			.header {
				font-weight: bold;
				border-bottom: solid 1px #5c5757;
				padding-bottom: 5px;
				margin-bottom: 10px;
			}
			.remove {
				text-align: center;
				line-height: 38px;
			}
		}
	}
	.save {
		display: flex;
		justify-content: flex-end;
		padding: 10px 0;
		border-top: solid 1px #5c5757;

		.error {
			margin: 0 10px 0 0;
			line-height: 40px;
		}
	}
}



</style>