<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<p>{{ current.name }}</p>
		<div v-if="current.type == 'player'">
			{{ getPlayer(current.id) }}
		</div>
	</div>
</template>

<script>
	import { getters } from '@/mixins/getters.js'
	export default {
		name: 'Current',
		props: ['current'],
		mixins: [getters],
		data: function() {
			return {
				
			}
		},
		methods: {
		
		}
	}
</script>

<style lang="css" scoped>
#current {
	padding:15px 10px;
	grid-area: current;
}
</style>