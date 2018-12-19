<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<div class="scroll" v-bar v-if="current">
			<div>
				<!-- <p>{{ getNPC(current.id) }}</p> -->
				<div v-if="current.type == 'player'">
					{{ getPlayer(current.id) }}
				</div>
				<!-- <NPC v-if="current.type == 'npc'" :npc="getNPC(current.id)" /> -->
			</div>
		</div>
	</div>
</template>

<script>
	import NPC from '@/components/slides/NPC.vue'
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

<style lang="scss" scoped>
#current {
	padding-top: 15px;
	grid-area: current;
	overflow: hidden;
	
	h2 {
		padding-left: 10px !important;
		margin-bottom: 10px !important;
	}
}
.scroll {
	height: calc(100% - 30px);
}
</style>