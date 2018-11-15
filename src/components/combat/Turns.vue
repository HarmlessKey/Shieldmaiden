<template>
	<div id="turns" class="d-flex justify-content-between bg-gray">
		<h1>{{ title }}</h1>
		<div class="round-info">
			<span id="round">Round <span class="number mx-2">{{ round }}</span></span>
			<span id="turn">Turn <span class="number ml-2">{{ turn + 1 }}</span></span>
			<span class="current-name"></span>
		</div>
		<div>
			<a v-if="round > 0" class="btn mr-2" @click="prevTurn()"><i class="fas fa-arrow-left"></i> Prev turn</a>
			<a v-if="round == 0" class="btn" @click="start()">Start encounter <i class="fas fa-arrow-right"></i></a>
			<a v-else class="btn" @click="nextTurn()">Next turn <i class="fas fa-arrow-right"></i></a>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {
		name: 'Turns',
		props: ['round','title','turn', 'active_len'],
		data () {
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		methods: {
			start() {
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					round: 1
				})
			},
			nextTurn() {
				let turn = this.turn + 1
				let round = this.round
				if (turn >= this.active_len) {
					turn = 0
					round++
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					turn: turn,
					round: round,
				})
			},
			prevTurn() {
				let turn = this.turn - 1
				let round = this.round
				if (turn < 0) {
					turn = this.active_len - 1
					round--
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					turn: turn,
					round: round,
				})
			},
		}
	}
</script>

<style lang="css" scoped>
#turns {
	padding: 10px;
	font-size: 20px;
	text-transform: uppercase;
	grid-area: turns;
}
h1 {
	line-height:44px;
}
#turns span {
	line-height:30px;
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
</style>