<template>
	<div id="current" class="bg-gray">
		<h2>Current</h2>
		<div class="scroll" v-bar v-if="current">
			<div>
				<!-- <p>{{ getNPC(current.id) }}</p> -->
				<div>
					{{ this.current }}
				</div>
				<!-- <NPC v-if="current.type == 'npc'" :npc="getNPC(current.id)" /> -->
			</div>
		</div>
	</div>
</template>

<script>
	import NPC from '@/components/NPC.vue'
	// import { getters } from '@/mixins/getters.js'
	// import axios from 'axios'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Current',
		components: { NPC },
		// mixins: [getters],
		computed: {
			...mapGetters([
				'entities',
				'active',
				'turn',
			]),
			current: function() {
				let current_key = this.active[this.turn].key
				return this.entities[current_key]
			}
		},
		// methods: {
		// 	async getNPC(id) {
		// 		return await axios.get("http://www.dnd5eapi.co/api/monsters/" + id)
		// 		.then(response => {
		// 			return response.data
		// 		})
		// 	}
		// }
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