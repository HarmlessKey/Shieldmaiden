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
				<q-menu square>
					<q-list>
						<q-item>
							<q-item-section>
								<b>{{ encounter.encounter }}</b>
							</q-item-section>
						</q-item>
						<q-separator />
						<q-item clickable v-close-popup  @click="setSlide({show: true, type: 'settings/Encounter'})">
							<q-item-section avatar><i class="fas fa-cogs"></i></q-item-section>
							<q-item-section>Settings</q-item-section>
						</q-item>
						<q-item clickable v-close-popup  @click="setSlide({show: true, type: 'settings/TrackEncounter'})">
							<q-item-section avatar><i class="fas fa-desktop"></i></q-item-section>
							<q-item-section>Track settings</q-item-section>
						</q-item>
						<q-item clickable v-close-popup v-if="demo" @click="reload">
							<q-item-section avatar><i class="far fa-sync-alt"></i></q-item-section>
							<q-item-section>Reset encounter</q-item-section>
						</q-item>
						<q-separator />
						<q-item clickable v-close-popup @click="confirmFinish()">
							<q-item-section avatar><i class="fas fa-times"></i></q-item-section>
							<q-item-section>End encounter</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</a>

			<!-- BROADCASTING -->
			<span v-if="!demo" @click="broadcast()" class="live" :class="{'active': broadcasting['.value'] == $route.params.campid }">live</span>
		</h1>

		<div class="round-info d-none d-md-flex justify-content-center" v-if="encounter.round">
			<div class="mr-3">
				<div>Round</div>
				<div class="number">{{ encounter.round }}</div>
			</div>
			<div>
				<div>Turn</div>
				<div class="number">
					{{ encounter.turn + 1 }}<span class="small gray-hover">/{{ active_len }}</span>
				</div>
			</div>
		</div>
		<div class="blue" v-else>
			Set Intitative
		</div>
		<div class="d-flex justify-content-end">
			<div 
				class="requests" 
				v-if="encounter.requests && Object.keys(encounter.requests).length > 0"
				@click="setSlide({show: true, type: 'combat/side/Requests'})"
			>
				<i class="fas fa-bell"></i>
				<div class="notifications bg-red white animated zoomIn">
					<div>{{ Object.keys(encounter.requests).length }}</div>
				</div>
			</div>
			<a v-if="encounter.round > 0" class="btn bg-gray-dark mr-2" 
				@click="prevTurn()"
				v-shortkey="['shift', 'arrowleft']" @shortkey="prevTurn()">
				<i class="fas fa-arrow-left"></i> 
				<span class="ml-1 d-none d-lg-inline">Prev turn</span>
				<q-tooltip anchor="top middle" self="center middle">
					[shift]+[arrow left]
				</q-tooltip>
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
				v-shortkey="['shift', 'arrowright']" @shortkey="nextTurn()">
				<span class="mr-2 d-none d-md-inline">Next turn</span> <i class="fas fa-arrow-right"></i>
				<q-tooltip anchor="top middle" self="center middle">
					[shift]+[arrow right]
				</q-tooltip>
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
				//Save the current campaign that is being broadcasted
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
	user-select: none;
	height: 60px;
	padding: 10px;
	font-size: 15px;
	line-height: 36px;
	background: rgba(38, 38, 38, .9);
	font-size: 20px;
	text-transform: uppercase;
	grid-area: turns;


	h1 {
		line-height: 36px;

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
	.round-info {
		line-height: 12px;
		font-size: 11px;
		text-align: center;

		.number { 
			height: 40px;
			font-weight: bold;
			font-size: 30px;
			line-height: 30px;
		}
	}
	.requests {
		padding-top: 3px;
		width: 26px;
		margin-right: 15px;
		position: relative;
		cursor: pointer;

		.notifications {
			user-select: none;
			position: absolute;
			top: -1px;
			right: -3px;
			height: 20px;
			width: 20px;
			border-radius: 50%;
			
			div {
				position: absolute;
				width: inherit;
				height: inherit;
				line-height: 20px;
				text-align: center;
				font-size: 13px;
			}
		}
	}
}

</style>