<template>
	<div class="pb-5">
		<h2>Experience</h2>
		<b-table 
			:items="table" 
			:fields="fields"
			class="xpTable"
		>
			<span slot="proficiency" slot-scope="data">
				+{{ data.value }}
			</span>
		</b-table>
	</div>
</template>

<script>
	import { experience } from '@/mixins/experience.js'

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
	.xpTable thead th {
		font-size: 12px !important;
	}
</style>
