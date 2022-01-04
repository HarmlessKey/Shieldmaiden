<template>
	<div id="turns" class="d-flex justify-content-between">
		<div>
			<a class="edit">
				<i class="fas fa-cog"></i>
				<q-popup-proxy :dark="$store.getters.theme === 'dark'" :breakpoint="576">
					<q-list class="bg-neutral-8">
						<q-item>
							<q-item-section>
								<b>{{ encounter.encounter }}</b>
							</q-item-section>
						</q-item>
						<q-separator />
						<q-item 
							v-if="!demo" clickable v-close-popup
							@click="setSlide({
								show: true, 
								type: 'slides/Broadcast', 
								data: { 
									campaign_id: $route.params.campid,
									encounter_id: $route.params.encid
								}
							})"
						>
							<q-item-section avatar>
								<i class="far fa-dot-circle" :class="{ red: broadcast.live === $route.params.campid }"></i>
							</q-item-section>
							<q-item-section>
								{{ broadcast.live !== $route.params.campid ? "Go live" : "Stop broadcast" }}
							</q-item-section>
						</q-item>
						<q-item v-if="encounter.audio" clickable v-close-popup @click="open_audio_link(encounter.audio)">
							<q-item-section avatar><q-icon :class="audio_icons[audio_link_type].icon" :style="`color:${audio_icons[audio_link_type].color};`"></q-icon></q-item-section>
							<q-item-section>Audio Link</q-item-section>
						</q-item>
						<q-item clickable v-close-popup @click="setSlide({show: true, type: 'settings/Encounter'})">
							<q-item-section avatar><i class="fas fa-cogs"></i></q-item-section>
							<q-item-section>Settings</q-item-section>
						</q-item>
						<q-item clickable v-close-popup @click="setSlide({show: true, type: 'settings/TrackEncounter'})">
							<q-item-section avatar><i class="fas fa-desktop"></i></q-item-section>
							<q-item-section>Public initiatve settings</q-item-section>
						</q-item>
						<q-item clickable v-close-popup v-if="demo" @click="reload">
							<q-item-section avatar><i class="far fa-sync-alt"></i></q-item-section>
							<q-item-section>Reset encounter</q-item-section>
						</q-item>
						<q-separator />
						<q-item clickable v-close-popup :to="`/content/campaigns/${$route.params.campid}`">
							<q-item-section avatar><i class="fas fa-angle-left"></i></q-item-section>
							<q-item-section>Leave encounter</q-item-section>
						</q-item>
						<q-separator />
						<q-item clickable v-close-popup @click="confirmFinish()">
							<q-item-section avatar><i class="fas fa-times"></i></q-item-section>
							<q-item-section>End encounter</q-item-section>
						</q-item>
					</q-list>
				</q-popup-proxy>
			</a>

			<span class="ml-2 d-none d-md-inline truncate">{{ encounter.encounter }}</span>
		</div>

		<!-- TURNS & ROUNDS -->
		<div class="round-info d-flex justify-content-center" v-if="encounter.round > 0">	
			<a
				class="handler neutral-2" 
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
						{{ encounter.turn + 1 }}<span class="neutral-3"><span class="neutral-4">/</span>{{ active_len }}</span>
					</div>
				</div>
			</template>

			<a class="handler neutral-2" 
				@click="nextTurn()" 
				v-shortkey="['shift', 'arrowright']" @shortkey="nextTurn()">
				<i class="fas fa-step-forward"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Next turn
				</q-tooltip>
			</a>
		</div>
		<div v-else>
			Set Intitative
		</div>

		
		<div class="d-flex justify-content-end center">
			<span v-if="encounter.round > 0" class="timer">
				<hk-timer :value="timer || 0" :key="encounter.turn" />
				<i class="fas fa-stopwatch" />
			</span>

			<!-- BROADCASTING -->
			<span 
				v-if="!demo"
				@click="setSlide({
					show: true, 
					type: 'slides/Broadcast', 
					data: { 
						campaign_id: $route.params.campid,
						encounter_id: $route.params.encid
					}
				})" 
				class="live" 
				:class="{'active': broadcast.live === $route.params.campid }"
			>
					{{ broadcast.live === $route.params.campid ? "" : "go" }} live
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
					<i class="fas fa-bars" />
				</div>
			</template>

			<template v-else>
				<span class="d-none d-md-block">
					<router-link v-if="!demo" :to="'/content/campaigns/' + $route.params.campid" class="btn bg-neutral-8 ml-2">
						<i class="fas fa-arrow-left"></i> 
						Leave
					</router-link>
				</span>
				<a class="btn ml-2" @click="startEncounter()">
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
	import { audio } from '@/mixins/audio';

	export default {
		name: 'Turns',
		mixins: [remindersMixin, audio],
		props: ['active_len', 'current', 'next', 'settings'],
		data () {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'path',
				'broadcast'
			]),
			timer() {
				return (this.settings) ? this.settings.timer : 0;
			}
		},
		methods: {
			...mapActions([
				'set_turn',
				'update_round',
				'set_targeted',
				'setSlide',
				'set_finished',
			]),
			reload() {
				this.$router.go();
			},
			startEncounter() {
				this.set_turn({turn: 0, round: 1});
				this.checkReminders(this.next, 'startTurn');
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
				this.set_targeted({ type: 'untarget', key: 'all' });
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
				this.set_targeted({ type: 'untarget', key: 'all' });
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
			}
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
	background: $neutral-8-transparent;
	font-size: 20px;
	grid-area: turns;
	align-items: center;
	position: relative;

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
	.timer {
		margin-right: 20px;
	}

	.handler {
		font-size: 25px;
		padding: 0 20px;
		line-height: 40px;


		&:hover {
			color: $blue !important;
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
		color: $neutral-3;

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
		color: $neutral-3;
	}
	.round-info {
		.header {
			margin-top: 17px;
		}

		.number { 
			font-weight: bold;
			font-size: 18px !important;
			line-height: 18px !important;
		}
	}
	.timer {
		display: flex;
		flex-direction: row-reverse;
		margin: 0;
		font-size: 15px;
		position: absolute;
		line-height: 20px;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		border-bottom: solid 1px $neutral-4;
		padding: 0 10px;

		i {
			margin-right: 5px;
			line-height: 20px;
			font-size: 12px;
		}
	}
}

</style>