<template>
	<div id="targets" class="bg-gray">
		<h2>Targets</h2>
		<ul class="targets">
			<li v-for="entity in _active">
				<span v-if="entity.type == 'player'">{{ players[entity.id] }}</span>
				<Player :p=entity />
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
		props: ['encounter','players'],
		computed: {
			user() {
				return this.$store.getters.getUser;
			},
			_active: function() {
				return _.chain(this.encounter.entities)
								.filter(function(entity) {
									return entity.active == true;
								})
								.orderBy(function(entity){
									return parseInt(entity.initiative)
								} , 'desc')
								.value()
			},
			_idle: function() {
				return _.chain(this.encounter.entities)
								.filter(function(entity) {
									return entity.active == false;
								})
								.orderBy(function(entity){
									return parseInt(entity.initiative)
								} , 'desc')
								.value()
			},
			_players: function() {
				console.log(this.players)
			}
		},
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