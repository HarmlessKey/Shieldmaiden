<template>
	<div>
		<h3 class="itemTitle d-flex justify-content-between">
			{{ data.name }}
		</h3>

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
