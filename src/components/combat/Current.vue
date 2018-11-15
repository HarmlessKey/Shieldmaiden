<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<!-- <p>{{ getNPC(current.id) }}</p> -->
		<div v-if="current.type == 'player'">
			{{ getPlayer(current.id) }}
		</div>
		<!-- <NPC v-if="current.type == 'npc'" :npc="getNPC(current.id)" /> -->
	</div>
</template>

<script>
	import NPC from '@/components/NPC.vue'
	import { getters } from '@/mixins/getters.js'
	import axios from 'axios'

	export default {
		name: 'Current',
		components: { NPC },
		props: ['current'],
		mixins: [getters],
		data: function() {
			return {
				
			}
		},
		methods: {
			async getNPC(id) {
				return await axios.get("http://www.dnd5eapi.co/api/monsters/" + id)
				.then(response => {
					//console.log(response.data)
					return response.data
				})
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