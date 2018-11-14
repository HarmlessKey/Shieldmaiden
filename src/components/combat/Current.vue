<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<p>{{ current.name }}</p>
	</div>
</template>

<script>
	export default {
		name: 'Current',
		props: ['current'],
		data: function() {
			// console.log(this.current)
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