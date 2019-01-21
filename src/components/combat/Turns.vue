<template>
	<div id="turns" class="d-flex justify-content-between">
			<h1>
				{{ encounter.encounter }}
				<a class="edit"
					id="edit"
					data-toggle="dropdown" 
					aria-haspopup="true" 
					aria-expanded="false">
					<i class="fas fa-cog"></i>
				</a>
				<div class="dropdown-menu" aria-labelledby="edit">	
					<div class="dropdown-header">{{ encounter.encounter }}</div>
					<a class="dropdown-item" @click="showTrack()"><i class="far fa-desktop"></i> Track Settings</a>
					<a class="dropdown-item" @click=""><i class="fas fa-times"></i> End Encounter</a>
				</div>
			</h1>

		<div class="round-info">
			<span v-if="encounter.round" id="round">Round <span class="number mx-2">{{ encounter.round }}</span></span>
			<span v-if="encounter.round" id="turn">Turn <span class="number ml-2">{{ encounter.turn + 1 }}</span></span>
			<span class="current-name"></span>
		</div>
		<div>
			<a v-if="encounter.round > 0" class="btn bg-gray-dark mr-2" @click="prevTurn()"><i class="fas fa-arrow-left"></i> <span>Prev turn</span></a>
			<a v-if="encounter.round == 0" class="btn" @click="start()"><span>Start encounter</span> <i class="fas fa-arrow-right"></i></a>
			<a v-else class="btn" @click="nextTurn()"><span>Next turn</span> <i class="fas fa-arrow-right"></i></a>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Turns',
		props: ['active_len'],
		data () {
			return {
				// none
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'path',
				'entities'
			]),
		},
		methods: {
			...mapActions([
				'update_round',
				'set_targeted',
				'setSlide',
			]),
			showTrack() {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'track',
				})
			},
			start() {
				db.ref(`encounters/${this.path}`).update({
					round: 1
				})
			},
			nextTurn() {
				let turn = this.encounter.turn + 1
				let round = this.encounter.round
				if (turn >= this.active_len) {
					turn = 0
					round++
					this.update_round()
				}
				db.ref(`encounters/${this.path}`).update({
					turn: turn,
					round: round,
				})
				this.set_targeted(undefined);
			},
			prevTurn() {
				let turn = this.encounter.turn - 1
				let round = this.encounter.round
				if (turn < 0) {
					turn = this.active_len - 1
					round--
				}
				if (round == 0) {
					turn = 0
				}
				db.ref(`encounters/${this.path}`).update({
					turn: turn,
					round: round,
				})
				this.set_targeted(undefined);
			},
		}
	}
</script>

<style lang="scss" scoped>
#turns {
	background: rgba(38, 38, 38, .9);
	padding: 10px;
	font-size: 20px;
	text-transform: uppercase;
	grid-area: turns;

	span {
		line-height:30px;
	}
	h1 {
		line-height:44px;

		a {
			margin-left: 5px;
			font-size: 12px;
		}
	}
}

.number { 
	display:inline-block; 
	border:solid 1px #2c97de;
	height:42px;
	line-height:42px !important;
	margin-top:2px;
	padding:0 15px;
	font-weight:bold;
	font-size:30px;
}
@media only screen and (max-width: 360px) {
	.btn {
		span {
			display: none;
		}
	}
}
</style>