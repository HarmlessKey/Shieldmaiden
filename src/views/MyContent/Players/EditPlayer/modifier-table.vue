<template>
	<div>
		<h4 class="title">
			Modifiers
			<a @click="newModifier(origin), modal = true">Add Modifier</a>
		</h4>

		<hk-table
			:columns="columns"
			:items="modifiers"
		>
			<template slot="target" slot-scope="data">
				{{ data.row.subtarget || data.item.capitalize() }}
			</template>
			<template slot="value" slot-scope="data">
				<template v-if="data.item">{{ data.item }}</template>
				<template v-else-if="data.row.type === 'proficiency'">Proficiency</template>
				<template v-else-if="data.row.type === 'expertise'">Expertise</template>
			</template>
			<div slot="actions" slot-scope="data" class="actions">
					<a class="gray-hover mx-1" 
						@click="editModifier(data.row)" 
						v-b-tooltip.hover title="Edit">
						<i class="fas fa-pencil"></i>
					</a>
					<a v-b-tooltip.hover 
						title="Delete" 
						class="gray-hover"
						@click="deleteModifier(data.row['.key'])">
							<i class="fas fa-trash-alt"></i>
					</a>
				</div>
		</hk-table>
	</div>
</template>

<script>


	export default {
		name: 'ModifierTable',
		props: {
			modifiers: {
				type: Array,
				required: true
			},
			origin: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				columns: {
					name: {
						label: 'Name',
						truncate: true,
						sortable: true,
					},
					target: {
						label: 'Target',
					},
					value: {
						label: 'Value',
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
          }
				}
			}
		},
		computed: {
		
		},
		methods: {
			newModifier(origin) {
				this.modifier = {
					origin: origin,
					type: null,
					target: null,
					subtarget: null,
					ability_modifier: null,
					restrictions: []
				}
				this.modal = true;
			},
		}
	}
</script>

<style lang="scss" scoped>
	h4 {
		font-size: 16px;
		margin: 15px 0 !important;
	}
</style>