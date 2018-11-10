<template>
	<div id="targets" class="bg-gray">
		<h2>Targets</h2>
		<ul class="targets">
			<li v-for="player in players">
				<Player :p=player />
			</li>
		</ul>
	</div>
</template>

<script>
	import Player from './Player.vue'
	import { db } from '@/firebase'

	export default {
		name: 'Targets',
		components: {
			Player,
		},
		computed: {
			user() {
				return this.$store.getters.getUser;
			}
		},
		firebase: {
			players: db.ref('players')
		}
	}
</script>

<style lang="css" scoped>

#targets {
	padding:15px 10px;
	grid-area: targets;
}
ul.targets {
	list-style:none;
	padding:0;
}
</style>