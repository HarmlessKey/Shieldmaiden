<template>
	<div class="content__edit" v-if="item || $route.name === 'Add item'">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveItem(valid))">
				<hk-card header="Your Item">
					<div slot="header" class="card-header">
						{{ item.name ? item.name : "New item" }}

						<!-- TODO: Copy Items via API -->
						<!-- <a v-if="$route.name == 'Add item' && !itemId" class="btn btn-sm bg-neutral-5" @click="copy_dialog = true">
							Copy item
							<i class="ml-1 fas fa-copy"/>
						</a> -->
					</div>
					<div class="card-body">
						<!-- NAME -->
						<ValidationProvider rules="max:100|required" name="Name" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Name"
								autocomplete="off"  
								type="text" 
								class="mb-2"
								v-model="item.name" 
								maxlength="100"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					
						<!-- IMAGE -->
						<div class="avatar">
							<div class="img" v-if="item.image" :style="{ backgroundImage: 'url(\'' + item.image + '\')' }"></div>
							<div class="img" v-else>
								<img src="@/assets/_img/styles/axe.svg" />
							</div>
							<div>
								<ValidationProvider rules="url" name="Image" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Image"
										autocomplete="off"  
										type="text" 
										v-model="item.image" 
										placeholder="Image URL"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
						</div>

						<ValidationProvider rules="max:5000" name="Description" v-slot="{ errors, invalid, validated }">
							<q-input
								:dark="$store.getters.theme === 'dark'" filled square
								label="Description"
								autogrow
								autocomplete="off"  
								type="text" 
								v-model="item.desc" 
								name="image" 
								maxlength="5000"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</hk-card>

				<hk-card>
					<div slot="header" class="card-header">
						<span>
							<i class="fal fa-table"></i> Info Tables
						</span>
							<a slot="after"  class="btn bg-neutral-5">
								<i class="fas fa-plus"></i> Add table
								<q-popup-proxy :dark="$store.getters.theme === 'dark'" :breakpoint="576">
									<div class="bg-neutral-8 px-2 py-2" >
											<p>Add a table</p>
											<ValidationProvider rules="required|numeric|between:1,10" name="Columns" v-slot="{ errors, invalid, validated }">
												<q-input 
													:dark="$store.getters.theme === 'dark'" filled square
													label="Columns"
													type="number" 
													max="10"
													min="1"
													class="mb-4"
													v-model="columns"
													:error="invalid && validated"
													:error-message="errors[0]"
													hint="How many columns?"
												/>
												<div class="d-flex justify-content-end mt-2">
													<q-btn flat class="bg-neutral-8 mr-1" no-caps v-close-popup>Cancel</q-btn>
													<q-btn
														color="primary"
														v-close-popup no-caps
														@click="!invalid ? addTable() : null"
														:disabled="invalid"
													>
														Add table
													</q-btn>
												</div>
											</ValidationProvider>
									</div>
								</q-popup-proxy>
							</a>
					</div>
					<div class="card-body">
						<q-list v-if="item.tables" :dark="$store.getters.theme === 'dark'" :class="`accordion`">
							<ValidationObserver v-for="(table, tableIndex) in item.tables" v-slot="{ valid }" :key="tableIndex">
								<q-expansion-item
									:dark="$store.getters.theme === 'dark'" 
									switch-toggle-side
									:group="`table-${tableIndex}`"
									:name="`table-${tableIndex}`"
									enter-active-class="animated animate__fadeIn" 
									leave-active-class="animated animate__fadeOut"
								>
									<template v-slot:header>
										<q-item-section avatar v-if="!valid">
											<q-icon name="error" color="red" />
											<q-tooltip anchor="top middle" self="center middle">
												Validation errors in table
											</q-tooltip>
										</q-item-section>
										<q-item-section>
											{{ table.name || 'Table ' + (parseInt(tableIndex)+1) }}
										</q-item-section>
										<q-item-section avatar>
											<a class="red" @click="removeTable(tableIndex)"><i class="fas fa-trash-alt"></i></a>
										</q-item-section>
									</template>

									<div class="accordion-body">
										<ValidationProvider rules="required|max:100" name="Table name" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Table name"
												v-model="table.name" 
												class="mb-3"
												name="table name"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>

										<div class="item-table" :style="{ 'grid-template-columns': `repeat(${table.columns}, auto) 30px` }">
											<div v-for="(col, i) in table.columns" :key="i" class="header">
												<ValidationProvider rules="required|max:100" :name="`Column header ${i+1}`" v-slot="{ errors, invalid, validated }">
													<q-input 
														:dark="$store.getters.theme === 'dark'" square dense
														v-model="table.header[i]" 
														:placeholder="`Column header ${i+1}`"
														maxlength="100"
														:error="invalid && validated"
														:error-message="errors[0]"
													/>
												</ValidationProvider>
											</div>
											<a @click="addRow(tableIndex)" class="remove green"><i class="fas fa-plus"/></a>
											<template v-for="(row, rowIndex) in table.rows">
												<div v-for="(col, colIndex) in table.rows[rowIndex].columns" :key="`column-${rowIndex}-${colIndex}`">
													<ValidationProvider rules="required|max:100" :name="`Column ${colIndex+1}`" v-slot="{ errors, invalid, validated }">
														<q-input 
															:dark="$store.getters.theme === 'dark'" filled square dense
															v-model="table.rows[rowIndex].columns[colIndex]" 
															:placeholder="`Column ${colIndex+1}`"
															maxlength="100"
															:error="invalid && validated"
															:error-message="errors[0]"
														/>
													</ValidationProvider>
												</div>
												<a class="red remove" @click="removeRow(tableIndex, rowIndex)" :key="`remove-${rowIndex}`"><i class="fas fa-trash-alt"></i></a>
											</template>
										</div>
										<a @click="addRow(tableIndex)" class="btn btn-block mt-4">Add Row</a>
									</div>
								</q-expansion-item>
							</ValidationObserver>
						</q-list>
					</div>
				</hk-card>


				<div class="save">
					<div class="buttons">
						<router-link to="/content/items" class="btn bg-neutral-5 mr-2">Cancel</router-link>
						<q-btn 
							type="submit"
							color="primary" 
							no-caps
						>
							{{ $route.name === "Add item" ? "Add item" : "Save" }}
						</q-btn>
					</div>
				</div>
			</q-form>
		</ValidationObserver>

		<q-dialog v-model="copy_dialog">
			<hk-card header="Copy Existing Item" :min-width="300">
				<div class="card-body">
					<q-input 
						:dark="$store.getters.theme === 'dark'" filled square dense
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
							<a class="neutral-2 mr-2" @click="copy(item)">
								<i class="fas fa-copy blue"></i>
								<span class="d-none d-md-inline ml-1">Copy</span>
								<q-tooltip anchor="top middle" self="center middle">
									Copy item
								</q-tooltip>
							</a>
						</li>
					</ul>
				</div>
			</hk-card>
		</q-dialog>	
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { skills } from '@/mixins/skills.js'
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
				userId: this.$store.getters.user.uid,
				itemId: this.$route.params.id,
				item: {},
				// Copy item data -> new component?
				search: ["name"],
				searched: undefined,
				foundItems: [],
				columns: undefined,
				copy_dialog: false
			}
		},
		async mounted() {
			if (this.itemId) {
				this.loading = true;
				this.item = await this.get_item({ uid: this.userId, id: this.itemId });
				this.item_copy = JSON.stringify(this.item);
				this.unsaved_changes = false;
				this.loading = false;
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("items", ["item_count"])
		},
		watch: {
			item: {
				deep: true,
				handler(newVal) {
					if (JSON.stringify(newVal) !== this.item.copy) {
						this.unsaved_changes = true;
					} else {
						this.unsaved_changes = false;
					}
				}
			}
		},
		methods: {
			...mapActions(['setSlide']),
			...mapActions('items', ["get_item", "add_item", "edit_item"]),

		// TODO: Copy fucntionality needs to be fixed with API calls

			// searchItems() {
			// 	const vm = this;
			// 	let searchTerm = this.searched.toLowerCase();
			// 	let results = this.items.filter( function(row) {
			// 		for (let i in vm.search) {
			// 			let key = vm.search[i];
			// 			// If field is undefined don't return row
			// 			if (row[key] == undefined) {
			// 				return
			// 			}
			// 			if (row[key].toLowerCase().includes(searchTerm)){
			// 				return row;
			// 			}
			// 		}
			// 	});
			// 	if(searchTerm === '') {
			// 		this.foundItems = [];
			// 	} else {
			// 		this.foundItems = results;
			// 	}
			// },
			// copy(item) {
			// 	this.item = item;
			// 	this.foundItems = [];
			// 	this.searched = '';
			// 	this.copy_dialog = false;
			// },
			saveItem(valid) {
				if (!valid) {
					this.$snotify.error("There are validation errors.", "Critical miss!", { position: "rightTop" });
					return;
				}
				if(this.$route.name === "Add item" && !this.itemId) {
					this.addItem();
				} else {
					this.editItem();
				}
			},
			addItem() {
				this.add_item(this.item).then((key) => {
					this.$set(this, "itemId", key);

					this.$snotify.success("Item Saved.", 'Critical hit!', {
						position: "rightTop"
					});

					this.item_copy = JSON.stringify(this.item);
					this.unsaved_changes = false;

					this.$router.replace(`/content/items/${key}`);


				}, error => {
					this.$snotify.error("Couldn't save monster.", "Save failed", {
						position: "rightTop"
					})
					console.error(error)
					console.log(this.item)
				});
			},
			editItem() {

				this.edit_item({
					uid: this.userId,
					id: this.itemId,
					item: this.item
				}).then(() => {
					this.$snotify.success("Item Saved.", 'Critical hit!', {
						position: "rightTop"
					});

					this.item_copy = JSON.stringify(this.item);
					this.unsaved_changes = false;
				}, error => {
					this.$snotify.error("Couldn't save monster.", "Save failed", {
						position: "rightTop"
					})
					console.error(error)
					console.log(this.item)
				});
			},
			addTable() {	
				if(this.columns !== undefined) {
					this.columns = parseInt(this.columns);
					if(this.item.tables === undefined) {
						this.$set(this.item, "tables", []);
					}
					this.item.tables.push({
						columns: this.columns,
						header: [],
						rows: [],
					})
				}
			},
			addRow(key) {
				var cols = [];

				for(let i = 1; i <= this.item.tables[key].columns; i++) {
					cols.push(undefined)
				}
				this.item.tables[key].rows.push({
					columns: cols
				})
			},
			removeRow(tableIndex, rowIndex) {
				this.$delete(this.item.tables[tableIndex].rows, rowIndex);
			},
			removeTable(key) {
				this.$delete(this.item.tables, key);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.avatar {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;

		.img {
			border: solid 1px $neutral-2;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}

	.add-table {
		border-bottom: solid 1px $neutral-3;
		padding-bottom: 5px;
	}
	.item-table {
		display: grid;
		grid-template-rows: minmax(46px max-content);

		.remove {
			text-align: center;
			line-height: 38px;
		}
	}
	.save {
		display: flex;
		justify-content: flex-end;

		.error {
			margin: 0 10px 0 0;
			line-height: 40px;
		}
	}
</style>