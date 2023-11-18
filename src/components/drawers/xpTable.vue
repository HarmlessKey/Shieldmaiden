<template>
	<div class="pb-5">
		<h2>Experience</h2>
		<hk-table 
			:items="table" 
			:columns="fields"
			class="xpTable"
		>
			<span slot="proficiency" slot-scope="data">
				+{{ data.item }}
			</span>
		</hk-table>
	</div>
</template>

<script>
	import { experience } from 'src/mixins/experience.js'

	export default {
		name: 'DeathSaves',
		mixins: [experience],
		data() {
			return {
				fields: {
					xp: {
						label: 'Experience',
					},
					level: {
						label: 'Level',
					},
					proficiency: {
						label: 'Proficiency bonus',
					},
				}
			}
		},
		computed: {
			table() {
				return Object.values(this.xpTable);
			}
		},
		methods: {
		
		}
	};
</script>

<style>
	.xpTable .hk-table-header {
		font-size: 12px !important;
	}
</style>
