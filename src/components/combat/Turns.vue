<template>
	<div id="turns" class="d-flex justify-content-between">
			<h1>
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
					<a class="dropdown-item" @click="slide('settings')"><i class="fas fa-cogs"></i> Settings</a>
					<a class="dropdown-item" @click="slide('track')"><i class="far fa-desktop"></i> Track Settings</a>
					<a class="dropdown-item" @click="confirmFinish()"><i class="fas fa-times"></i> End Encounter</a>
				</div>
			</h1>

		<div class="round-info">
			<span v-if="encounter.round"><span class="d-none d-md-inline">Round</span> <span class="number mx-2">{{ encounter.round }}</span></span>
			<span v-if="encounter.round"><span class="d-none d-md-inline">Turn</span> <span class="number ml-2">{{ encounter.turn + 1 }}<span class="small gray-hover"> /{{ active_len }}</span></span></span>
			<span class="current-name"></span>
		</div>
		<div>
			<a v-if="encounter.round > 0" class="btn bg-gray-dark mr-2" @click="prevTurn()">
				<i class="fas fa-arrow-left"></i> 
				<span class="ml-1 d-none d-md-inline">Prev turn</span>
			</a>
			<template v-if="encounter.round == 0"> 
				<router-link :to="'/encounters/' + $route.params.campid" class="btn bg-gray-dark mr-2">
					<i class="fas fa-arrow-left"></i> 
					<span class="ml-1 d-none d-md-inline">Back</span>
				</router-link>
				<a class="btn" @click="start()">Start encounter <i class="fas fa-arrow-right"></i></a>
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
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Turns',
		props: ['active_len', 'current'],
		data () {
			return {
				// none
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
				'update_round',
				'set_targeted',
				'setSlide',
				'set_finished',
				'set_targetReminder',
			]),
			slide(type) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: type,
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

				this.reminders(this.current, 'endTurn')
			},
			reminders(target, trigger){
				for(let key in target.reminders) {
					if(target.reminders[key].trigger == trigger) {

						//Buttons to remove or keep reminder
						if(target.reminders[key].action != 'remove') {
							var buttons = [
								{ 
									text: 'Keep Reminder', 
									action: (toast) => { 
										this.$snotify.remove(toast.id); 
									}, bold: false
								},
								{ 
									text: 'Remove', 
									action: (toast) => { 
										this.set_targetReminder({
											action: 'remove',
											entity: target.key,
											key: key,
										}); 
										this.$snotify.remove(toast.id); 
									}, bold: false
								},
							]
						}
						else {
							var buttons = ''
						}

						this.$snotify.warning(
							target.name + ': ' + target.reminders[key].notify,
							target.reminders[key].title, 
							{
								position: "centerCenter",
								timeout: 0,
								buttons
							}
						);
						if(target.reminders[key].action == 'remove')
						this.set_targetReminder({
							action: 'remove',
							entity: target.key,
							key: key,
						}); 
					}
				}
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