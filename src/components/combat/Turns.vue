<template>
	<div id="turns" class="d-flex justify-content-between">
			<h1>
				<router-link v-if="!demo" :to="`/encounters/${$route.params.campid}`" class="mr-2"><i class="far fa-chevron-left"></i></router-link>
				<span class="d-none d-md-inline">{{ encounter.encounter }}</span>
				<a class="edit"
					id="edit"
					data-toggle="dropdown" 
					aria-haspopup="true" 
					aria-expanded="false">
					<i class="fas fa-cog"></i>
				</a>
				<div class="dropdown-menu">	
					<div class="dropdown-header">{{ encounter.encounter }}</div>
					<a v-if="!demo" class="dropdown-item" @click="setSlide({show: true, type: 'settings/Encounter'})">
						<i class="fas fa-cogs"></i> Settings
					</a>
					<a v-if="!demo" class="dropdown-item" @click="setSlide({show: true, type: 'settings/TrackEncounter'})">
						<i class="far fa-desktop"></i> Track Settings
					</a>
					<a v-if="demo" @click="reload" v-b-tooltip.hover title="Reset"><i class="far fa-sync-alt"></i> Reset encounter</a>
					<a class="dropdown-item" @click="confirmFinish()"><i class="fas fa-times"></i> End Encounter</a>
				</div>

				<!-- BROADCASTING -->
				<span v-if="!demo" @click="broadcast()" class="live" :class="{'active': broadcasting['.value'] == $route.params.campid }">live</span>
			</h1>

		<div class="round-info d-none d-md-inline">
			<span v-if="encounter.round">
				<span class="d-none d-lg-inline">Round</span>
				<span class="number mx-2">{{ encounter.round }}</span>
			</span>
			<span v-if="encounter.round">
				<span class="d-none d-lg-inline">Turn</span>
				<span class="number ml-2">
					{{ encounter.turn + 1 }}
					<span class="small gray-hover"> /{{ active_len }}</span>
				</span>
			</span>
			<span class="current-name"></span>
		</div>
		<div>
			<a v-if="encounter.round > 0" class="btn bg-gray-dark mr-2" 
				@click="prevTurn()"
				v-b-tooltip.hover title="[shift]+[arrowleft]"
				v-shortkey="['shift', 'arrowleft']" @shortkey="prevTurn()">
				<i class="fas fa-arrow-left"></i> 
				<span class="ml-1 d-none d-lg-inline">Prev turn</span>
			</a>
			<template v-if="encounter.round === 0"> 
				<router-link v-if="!demo" :to="'/encounters/' + $route.params.campid" class="btn bg-gray-dark mr-2">
					<i class="fas fa-arrow-left"></i> 
					<span class="ml-1 d-none d-lg-inline">Back</span>
				</router-link>
				<a class="btn" @click="set_turn({turn: 0, round: 1})">Start encounter <i class="fas fa-arrow-right"></i></a>
			</template>
			<a v-else class="btn" 
				@click="nextTurn()" 
				v-b-tooltip.hover title="[shift]+[arrowright]"
				v-shortkey="['shift', 'arrowright']" @shortkey="nextTurn()">
				<span class="mr-2 d-none d-md-inline">Next turn</span> <i class="fas fa-arrow-right"></i>
			</a>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { remindersMixin } from '@/mixins/reminders';

	export default {
		name: 'Turns',
		mixins: [remindersMixin],
		props: ['active_len', 'current'],
		data () {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.getUser.uid
			}
		},
		firebase() {
			return {
				broadcasting: {
					source: db.ref(`broadcast/${this.userId}/live`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'path',
				'entities',
			]),
		},
		methods: {
			...mapActions([
				'set_turn',
				'update_round',
				'set_targeted',
				'setSlide',
				'set_finished'
			]),
			reload() {
				this.$router.go();
			},
			nextTurn() {
				let turn = this.encounter.turn + 1
				let round = this.encounter.round

				if (turn >= this.active_len) {
					turn = 0
					round++
					this.update_round()
				}
				this.set_turn({turn, round})
				if(!this.demo) db.ref(`encounters/${this.path}/lastRoll`).set(false);
				this.set_targeted({ e: 'untarget', key: 'all' });
				this.checkReminders(this.current, 'endTurn');
			},
			prevTurn() {
				let turn = this.encounter.turn - 1
				let round = this.encounter.round
				if (turn < 0) {
					turn = this.active_len - 1
					round--
				}
				if (round === 0) {
					turn = 0
				}
				this.set_turn({turn, round});
				this.set_targeted({ e: 'untarget', key: 'all' });
			},
			confirmFinish() {
				this.$snotify.error('Are you sure you want to finish the encounter?', 'Finish Encounter', {
					position: "centerCenter",
					timeout: 0,
					buttons: [
						{ text: 'Finish', action: (toast) => { this.finish(); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'Cancel', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			finish() {
				this.set_finished();
			},
			broadcast() {
				//Save this is the current campaign that is being broadcasted
				if(this.broadcasting['.value'] == this.$route.params.campid) {
					db.ref(`broadcast/${this.userId}/live`).remove()
				} else {
					db.ref(`broadcast/${this.userId}/live`).set(this.$route.params.campid)
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
#turns {
	height: 65px;
	padding: 10px;
	font-size: 15px;
	line-height: 45px;
	background: rgba(38, 38, 38, .9);
	font-size: 20px;
	text-transform: uppercase;
	grid-area: turns;


	h1 {
		line-height:45px;

		a {
			margin-left: 5px;
		}
		.live {
			cursor: pointer;
			padding: 0 10px;
			margin: 10px;
			line-height: 23px;
			height: 23px;
			vertical-align: 3px;
		}
	}
}

.number { 
	display: inline-block; 
	border: solid 1px #2c97de;
	height: 45px;
	padding: 0 15px;
	font-weight: bold;
	font-size: 30px;
}
</style>