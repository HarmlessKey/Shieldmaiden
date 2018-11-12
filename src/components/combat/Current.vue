<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<p>Current player</p>
	</div>
</template>

<script>

	export default {

		name: 'Current',

		data: function() {
			return {
				
			}
		},
		
		methods: {
			nextTurn: function() {
				this.$data.turn += 1;
				if (this.$data.turn > this.$data.players.length - 1) {
					this.$data.turn = 0;
				}
			}
		}
	}
</script>

<style lang="css" scoped>
#current {
	padding:15px 10px;
	grid-area: current;
}
</style>