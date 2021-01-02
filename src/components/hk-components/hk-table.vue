<template>
	<div :class="classes" ref="table">
		<!-- FILTERS -->
		<div class="filters" v-if="search !== undefined">
			<q-input 
				dark filled square dense
				placeholder="Search"
				type="text" 
				class="mb-2"
				autocomplete="off" 
				v-model="searched"
				@keyup="searchData()"
			>
				<q-icon slot="append" name="fas fa-search" size="xs" class="pointer" @click="searchData()" />
			</q-input>
			<div v-if="searched !== undefined && searched !== ''" class="green result-count" :class="{'red': Object.keys(dataItems).length === 0}">{{ Object.keys(dataItems).length }} results for {{ searched }}</div>
		</div>
		<!-- TABLE -->
		<div 
			v-if="!loading"
			class="hk-table" 
			:style="{ 'grid-template-columns': templateColumns }"
		>	
			<!-- By default, show a header -->
			<template v-if="showHeader">
				<div 
					v-if="collapse" 
					class="hk-table-column hk-table-header"
					:key="`collapse-header`"
				>
				<!-- EMPTY HEADER COLUMN FOR COLLAPSE COLUMNS -->
				</div>
				<template v-for="(column, key) in columns">
					<template v-if="showColumn(column.hide)">
						<div 
							v-if="!column.sortable"
							:key="`header-${key}`"
							class="hk-table-column hk-table-header"
							:class="[{
								truncate: column.truncate,
								center: column.center,
								right: column.right
							}, column.classes]"
						>
							<span v-html="column.label"/>
							<q-tooltip v-if="column.tooltip" anchor="top middle" self="center middle">
								{{ column.tooltip }}
							</q-tooltip>
						</div>
						<div 
							v-else 
							:key="`header-${key}`"
							class="hk-table-column hk-table-header hk-table-column-sortable"
							:class="[{
								truncate: column.truncate,
								center: column.center,
								right: column.right
							}, column.classes]"
							@click="sort(key)"
						>
							<span v-html="column.label"></span>
							<span class="sort">
								<i class="fas fa-sort-up" :class="{ blue: !reverse && sortedBy === key }"></i>
								<i class="fas fa-sort-down" :class="{ blue: reverse && sortedBy === key }"></i>
							</span>
							<q-tooltip v-if="column.tooltip" anchor="top middle" self="center middle">
								{{ column.tooltip }}
							</q-tooltip>
						</div>
					</template>
				</template>
			</template>

			<!-- TABLE BODY -->
			<template v-for="(row, index) in paginatedData">
				<!-- COLLAPSE ACTION -->
				<div 
					v-if="collapse" 
					class="hk-table-column collapse-handler pointer"
					@click="setCollapsed(index)"
					:key="`collapse-action-${index}`"
					:class="{ shown: showCollapsed === index }"
				>
					<i class="fas fa-chevron-down" />
				</div>
				
				<template v-for="(column, key) in columns">
					<div 
						v-if="showColumn(column.hide)"
						class="hk-table-column"
						:key="`${key}-${index}`"
						:class="[{
							truncate: column.truncate,
							'no-padding': column.noPadding,
							center: column.center,
							right: column.right
						}, column.classes]"
					>
						<slot :name="key" :item="row[key]" :row="row" :index="index">
							{{ row[key] }}
						</slot>
					</div>
				</template>

				<!-- Collapsed data -->
				<q-slide-transition v-if="collapse" :key="`collapse-content-${index}`">
					<div 
						v-show="showCollapsed === index"
						:id="`collapse-${index}`"
						:style="{ 'grid-column': 'span ' + (columnCount + 1) }"
						class="hk-collapsed-column"
					>
						<slot name="collapse" :row="row">
							<pre>{{ row }}</pre>
						</slot>
					</div>
				</q-slide-transition>
			</template>
		</div>
		<hk-loader v-else />

		<q-pagination
			class="pagination"
			v-if="!loading && Object.keys(dataItems).length > perPage" 
      v-model="currentPage"
      :max="maxPage"
			:max-pages="5"
			color="dark"
			:direction-links="true"
      :boundary-links="true"
    />
	</div>
</template>

<script>
	import _ from 'lodash';

	export default {
		name: 'hk-table',
		props: {
			classes: {
				type: String,
				default: undefined
			},
			items: {
				type: Array,
				default: undefined
			},
			columns: {
				type: Object,
				default: undefined
			},
			showHeader: {
				type: Boolean,
				default: true
			},
			perPage: {
				type: Number,
				default: undefined
			},
			loading: {
				type: Boolean,
				default: false
			},
			search: {
				type: Array,
				default: undefined
			},
			collapse: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				columnCount: 0,
				width: 0,
				is_small: false,
				is_medium: false,
				reverse: true,
				sortedBy: undefined,
				data: undefined,
				searched: undefined,
				currentPage: 1,
				showCollapsed: undefined
			}
		},
		computed: {
			templateColumns() {
				let columnCount = 0;
				let templateColumns = (this.collapse) ? '30px' : '';
				let columns = this.columns;

				for(let index in columns) {
					let column = columns[index];
					let width = ' 1fr'; // By default, columns have an auto width

					//Check if the column should be hidden a certain width
					if(
						!column.hide 
						|| column.hide === 'sm' && !this.is_small
						|| column.hide === 'md' && (!this.is_medium && !this.is_small)
					) {
						// Overwrite the width if the column is tagged with maxContent
						if(column.maxContent) {
							width = ' max-content';
						}
						// Overwrite the width if the column has a width specified
						if(column.width) {
							width = ' ' + column.width + 'px'
						}
						// Overwrite if there is a min and max width
						// Ignored if only min or only max is provided
						if(column.min && column.max) {
							width = ' minmax(' + column.min + ' ' + column.max + ')';
						}
						templateColumns = templateColumns.concat(width);
						columnCount++;
					}
				}
				// eslint-disable-next-line
				this.columnCount = columnCount;
				return templateColumns;
			},
			dataItems: {
				// Data items must be stored in a computed variable
				// The sort function manipulates the data
				// Props should not be manipulated directly
				get() {		
					return (this.data) ? this.data : this.items;
				},
				set(newValue) {
					this.data = newValue;
					return newValue;
				}
			},
			paginatedData() {
				if(this.perPage === undefined) {
					return this.dataItems;
				} else {
					let end = this.perPage * this.currentPage;
					let start = end - this.perPage;

					return this.dataItems.slice(start, end);
				}
			},
			maxPage() {
				return Math.ceil(Object.keys(this.dataItems).length / this.perPage);
			}
		},
		methods: {
			setSize() {
				let width = this.$refs.table.clientWidth
				let small = 400;
				let medium = 500;

				this.is_medium = (width <= medium) ? true : false;
				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = this.$refs.table.clientWidth;
			},
			showColumn(hide) {
				if(hide === 'sm' && this.is_small || hide === 'md' && this.is_medium) {
					return false;
				} return true;
			},
			sort(column) {
				this.reverse = !this.reverse;
				this.sortedBy = column;

				if(this.reverse) {
					this.dataItems = _.sortBy(this.dataItems, column).reverse();
				} else {
					this.dataItems = _.sortBy(this.dataItems, column);
				}
			},
			searchData() {
				this.currentPage = 1
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
				this.dataItems = results;
			},
			setCollapsed(index) {
				this.showCollapsed = (this.showCollapsed !== index) ? index : undefined;
			}
		},
		mounted() {
			this.$nextTick(function() {
				window.addEventListener('resize', this.setSize);
				//Init
				this.setSize();
			});
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.setSize);
		}
	}
</script>

<style lang="scss" scoped>
	.hk-table {
		display: grid;
		grid-auto-rows: minmax(46px auto);
		row-gap: 1px;

		.hk-table-column {
			min-height: 35px;
			padding: 12px 10px;

			&.collapse-handler {
				i {
					transition: transform .2s linear;
				}
				&.shown {
					i.fa-chevron-down {
						transform: rotate(180deg);
					}
				}
			}
			&.no-padding {
				padding: 0;
			}
			&.truncate {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			&.center {
				text-align: center;
			}
			&.right {
				text-align: right;
			}
			&.hk-table-column-sortable {
				cursor: pointer;
				display: flex;
				justify-content: flex-start;

				.sort {
					width: 25px;
					position: relative;
					color: #494747;


					.fas {
						position: absolute;
						right: 0;

						&.fa-sort-up {
							top: 3px;
						}
						&.fa-sort-down {
							top: 6px;
						}
					}
				}
			}
		}
		.hk-collapsed-column {
			padding: 10px;

			pre {
				overflow: hidden;
				color: #494747;
			}
		}
	}
	.result-count {
		margin-bottom: 10px;
	}
	.pagination {
		margin-top: 20px;
	}
</style>