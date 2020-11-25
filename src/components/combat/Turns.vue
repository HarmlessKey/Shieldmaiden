<template>
	<div id="turns" class="d-flex justify-content-between">
		<div>
			<a class="edit">
				<i class="fas fa-cog"></i>
				<q-popup-proxy square :breakpoint="576">
					<div class="bg-gray gray-light">
						<q-list>
							<q-item>
								<q-item-section>
									<b>{{ encounter.encounter }}</b>
								</q-item-section>
							</q-item>
							<q-separator />
							<q-item v-if="!demo" clickable v-close-popup @click="broadcast()">
								<q-item-section avatar>
									<i class="far fa-dot-circle" :class="{ red: broadcasting['.value'] === $route.params.campid }"></i>
								</q-item-section>
								<q-item-section>
									{{ broadcasting['.value'] !== $route.params.campid ? "Go live" : "Cancel broadcast" }}
								</q-item-section>
							</q-item>
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
							<q-item clickable v-close-popup :to="`/encounters/${$route.params.campid}`">
								<q-item-section avatar><i class="fas fa-angle-left"></i></q-item-section>
								<q-item-section>Leave encounter</q-item-section>
							</q-item>
							<q-separator />
							<q-item clickable v-close-popup @click="confirmFinish()">
								<q-item-section avatar><i class="fas fa-times"></i></q-item-section>
								<q-item-section>End encounter</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-popup-proxy>
			</a>

			<span class="ml-2 d-none d-md-inline truncate">{{ encounter.encounter }}</span>
		</div>

		<!-- TURNS & ROUNDS -->
		<div class="round-info d-flex justify-content-center" v-if="encounter.round > 0">	
			<a  
				class="handler gray-light" 
				@click="prevTurn()"
				v-shortkey="['shift', 'arrowleft']" @shortkey="prevTurn()"
			>
				<i class="fas fa-step-backward"></i> 
				<q-tooltip anchor="top middle" self="center middle">
					Previous turn
				</q-tooltip>
			</a>

			<template v-if="encounter.round">
				<div class="mr-3">
					<div class="header">Round</div>
					<div class="number">{{ encounter.round }}</div>
				</div>
				<div>
					<div class="header">Turn</div>
					<div class="number">
						{{ encounter.turn + 1 }}<span class="small gray-hover">/{{ active_len }}</span>
					</div>
				</div>
			</template>

			<a class="handler gray-light" 
				@click="nextTurn()" 
				v-shortkey="['shift', 'arrowright']" @shortkey="nextTurn()">
				<i class="fas fa-step-forward"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Next turn
				</q-tooltip>
			</a>
		</div>
		<div class="blue" v-else>
			Set Intitative
		</div>

		
		<div class="d-flex justify-content-end center">
			<!-- BROADCASTING -->
			<span v-if="!demo" @click="broadcast()" class="live mx-2" :class="{'active': broadcasting['.value'] === $route.params.campid }">
				{{ broadcasting['.value'] !== $route.params.campid ? "Go " : "" }}
				live
			</span>

			<template v-if="encounter.round > 0">
				<div 
					class="requests d-none d-md-block" 
					v-if="encounter.requests && Object.keys(encounter.requests).length > 0"
					@click="setSlide({show: true, type: 'combat/side/Requests'})"
				>
					<i class="fas fa-bell"></i>
					<div class="notifications bg-red white animated zoomIn">
						<div>{{ Object.keys(encounter.requests).length }}</div>
					</div>
				</div>

				<div 
					class="info" @click="setSlide({
						show: true,
						type: 'combat/side/Side'
					})"
				>
					<q-icon name="info" />
				</div>
			</template>

			<template v-else>
				<span class="d-none d-md-block">
					<router-link v-if="!demo" :to="'/encounters/' + $route.params.campid" class="btn bg-gray-dark mr-2">
						<i class="fas fa-arrow-left"></i> 
						Leave
					</router-link>
				</span>
				<a class="btn" @click="set_turn({turn: 0, round: 1})">
					Start 
					<span class="ml-1 d-none d-md-inline"> 
						encounter <i class="fas fa-arrow-right"></i>
					</span>
				</a>
			</template>
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
				userId: this.$store.getters.user.uid
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
	line-height: 40px;
	background: rgba(38, 38, 38, .9);
	font-size: 20px;
	grid-area: turns;
	align-items: center;

	.center {
		align-items: center;
	}
	.live {
		cursor: pointer;
	}
	.edit {
		font-size: 28px;

		i {
			vertical-align: -2px;
		}
	}

	.handler {
		font-size: 25px;
		padding: 0 20px;
		line-height: 40px;


		&:hover {
			color: #2c97de !important;
		}
	}
	.round-info {
		line-height: 12px;
		font-size: 11px;
		text-align: center;

		.number { 
			font-weight: bold;
			font-size: 30px;
			line-height: 30px;
		}
	}
	.requests, .info {
		padding-top: 3px;
		width: 26px;
		margin: 0 15px;
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
	.info {
		margin: 0;
		padding: 0;
		display: none;
		font-size: 28px;

		.q-icon {
			vertical-align: -4px;
		}
	}
}

@media only screen and (max-width: 576px) {
	.live {
		display: none;
	}
	.info {
		display: block !important;
	}
	.edit {
		color: #b2b2b2;
	}
	.round-info {
		.header {
			margin-top: 5px;
		}

		.number { 
			font-weight: bold;
			font-size: 18px !important;
			line-height: 18px !important;
		}
	}
}

</style>