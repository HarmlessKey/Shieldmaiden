<template>
	<div>
		<h3 class="itemTitle d-flex justify-content-between">
			{{ data.name }}
			<!-- <span v-if="userInfo && userInfo.admin ">
				<a v-if="!edit" @click="setEdit(true)" class="mx-2">
					<i class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Edit
					</q-tooltip>
				</a>
				<a v-else @click="setEdit(false)" class="mx-2">
					<i class="fas fa-times"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Cancel
					</q-tooltip>
				</a>
				<a @click="checked(!data.checked)" :class="{'gray-hover': !data.checked, 'green': data.checked}"><i class="fas fa-check"></i> Item checked</a>
			</span> -->
		</h3>

		<!-- EDIT -->
		<!-- <template v-if="userInfo && userInfo.admin && edit">
			<b-row class="mb-2 mt-3">
				<b-col sm="2"><label>Name</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Item name" v-model="data.name" :value="data.name"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Type</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Item type" v-model="data.type" :value="data.type"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Rarity</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Rarity" v-model="data.rarity" :value="data.rarity"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Attunement</label></b-col>
				<b-col>
					<b-form-input type="text" placeholder="Attunement" v-model="data.requires_attunement" :value="data.requires_attunement"/>
				</b-col>
			</b-row>
			<b-row class="mb-2">
				<b-col sm="2"><label>Description</label></b-col>
				<b-col>
					<textarea type="text" class="form-control" rows="10" placeholder="Description" v-model="data.desc"></textarea>
				</b-col>
			</b-row>

			<table class="table" v-if="data.table">
				<thead>
					<th v-for="head in data.table.header" :key="head">{{ head }}</th>
				</thead>
				<tbody>
					<tr v-for="(row, i) in data.table.rows" :key="i">
						<td v-for="(col, i) in data.table.rows[i].columns" :key="i">
							{{ col }}
						</td>
					</tr>
				</tbody>
			</table>

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

			<template v-if="data.tables">
				<div v-for="(table, index) in data.tables" :key="index" class="mb-5">
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

		</template> -->

		<!-- VIEW -->
		<template>
			<i class="mb-3 d-block">
				{{ data.type }}, 
				<span :class="{ 
					'white': data.rarity == 'common',
					'green': data.rarity == 'uncommon',
					'blue': data.rarity == 'rare',
					'purple': data.rarity == 'very rare',
					'orange': data.rarity == 'legendary',
					'red-light': data.rarity == 'artifact',
					}">
					{{ data.rarity }}
				</span>
				<template v-if="data.requires_attunement"> ( {{ data.requires_attunement }} )</template>
			</i>

			<div style="white-space: pre-line">{{ data.desc }}</div>
			
			<div class="mt-3" v-for="(table, index) in data.tables" :key="index">
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
		</template>
	</div>
</template>

<script>
	export default {
		name: 'NPC',
		props: [
		'data'
		]
	};
</script>

<style lang="scss" scoped>


</style>
