<template>
	<div id="targets" class="bg-gray">
		<h2>Targets</h2>
		<ul class="targets">
			<li class="target" v-for="entity in _target_order">
				<!-- <span v-if="entity.type=='player'">entity.key</span> -->
				<span class="initiative">{{ entity.initiative }}</span>
				<span v-if="entity.type=='player'" class="img" :style="{'background-image': 'url(' + players[entity.id].avatar + ')'}"></span>
				<span v-else class="img" :style="{'background-image': 'url(' + require('@/assets/logo.png') + ')'}"></span>
				<span class="ac">{{ entity.ac }}</span>
				<div class="progress health-bar">
					<div class="progress-bar bg-green" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">{{ entity.name }}</div>
				</div>
				<span class="hp"><span class="green current mr-1">{{ entity.maxhp }}</span>/<span class="max ml-1">{{ entity.maxhp }}</span></span>
			</li>
			<button @click='nextTurn()'>next turn</button>
			<!-- {{_target_order}} -->
		</ul>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {
		name: 'Targets',
		props: ['encounter','players'],
		data() {
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		computed: {
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
			_target_order: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._active)
				return Array.from(turns.slice(t).concat(turns.slice(0,t)), i => this._active[i])
			},
		},
		methods: {
			nextTurn() {
				let turn = this.encounter.turn + 1
				let round = this.encounter.round
				if (turn >= this._active.length) {
					turn = 0
					round++
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					turn: turn,
					round: round,
				})
			},
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

.target {
	display: grid;
	grid-template-columns: 30px 30px 30px 3fr 2fr;
	grid-template-rows: 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"initiative img ac hp-bar hp-bar hp-bar hp hp";
	
	line-height:30px;
	margin-bottom:8px;
	border:solid 1px #262626;
	cursor:pointer;
}
.target:hover {
	border:solid 1px #2c97de;
}
.active {
	border-color:#2c97de !important;
	box-shadow: 0px 0px 10px rgba(44, 151, 222, .5);
}
.progress { 
	height:30px;
	background-color:#4c4c4c;
	margin-right:5px;
}
.progress div { 
	color:#191919;
	white-space:nowrap;
	overflow:hidden;
	text-overflow: ellipsis;
	text-align:left;
	padding-left:10px;
}
.initiative, .ac, .img {
	text-align:center;
}
.initiative {
	grid-area: initiative;
}
.img {
	background-color:#191919;
	background-position:center top;
	background-repeat:no-repeat;
	background-size:cover;
	color:#cc3e4a;
	font-size:20px;
	line-height:30px;
	grid-area: img;
}
.ac {
	background-color:#4c4c4c;
	font-weight:bold;
	color:#191919;
	grid-area: ac;
}
.hp {
	text-align:right;
}
</style>