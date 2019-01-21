<template>
	<div class="container-fluid" v-if="encounter && players"  :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">	
		<div class="container" v-if="encounter.finished == true">
			<h2>Encounter Finished</h2>
			<router-link class="btn" :to="'/encounters/' + $route.params.campid">Return to overview</router-link>
		</div>
		<div v-else id="combat">
			<Turns 
				:active_len="_active.length"
			/>
			<div v-if="encounter.round == 0">
				<SetInitiative 
					:_active = "_active"
					:_idle = "_idle"
				/>
			</div>
			<template v-else>
					{{ setAlive(Object.keys(_alive).length) }} <!-- Check if there alive NPC's -->
					<Current 
						:current="_active[encounter.turn]"
					/>
					<Targets 
						:_active = "_active"
						:_idle = "_idle"
					/>
					<Actions 
					:current="_active[encounter.turn]"
					@log="sendLog"
					/>
					<Side :log="log" />
			</template>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { mapActions, mapGetters } from 'vuex'
	import { db } from '@/firebase'

	import Actions from '@/components/combat/actions/Actions.vue'
	import Turns from '@/components/combat/Turns.vue'
	import Current from '@/components/combat/Current.vue'
	import Targets from '@/components/combat/Targets.vue'
	import Side from '@/components/combat/side/Side.vue'
	import SetInitiative from '@/components/combat/SetInitiative.vue'

	export default {
		name: 'app',
		metaInfo: {
			title: 'Run Encounter'
		},
		components: {
			Actions,
			Turns,
			Current,
			Targets,
			Side,
			SetInitiative,
		},
		data() {
			// Dispatch route parameters to store

			return {
				userId: this.$store.getters.getUser.uid,
				target: undefined,
				log: undefined,
				alive: undefined,
			}
		},
		mounted() {
			this.init_Encounter({
				cid: this.$route.params.campid, 
				eid: this.$route.params.encid
			})
			this.track_Encounter()
		},
		computed: {
			...mapGetters([
				'encounter',
				'players',
				'campaigns',
				'entities',
			]),
			_active: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && !entity.down;
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , 'desc')
					.value()
			},
			_idle: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return !entity.active && !entity.down;
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , 'desc')
					.value()
			},
			_alive: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && entity.curHp > 0 && entity.entityType == 'npc';
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , 'desc')
					.value()
			},
		},
		watch: {
			alive(newVal, oldVal) {
				console.log(`old: ${oldVal}, new: ${newVal}`)
				if(newVal == 0) {
					this.confirmFinish()
				}
			}
		},
		methods: {
			...mapActions([
				'init_Encounter',
				'track_Encounter',
				'set_finished',
			]),
			sendLog: function(log) {
				this.log = log;
			},
			track() {
				var track = {
					campaign: this.$route.params.campid,
					encounter: this.$route.params.encid,
				}
				db.ref('track/' + this.userId).set(track);
			},
			setAlive(n) {
				this.alive = n;
			},
			confirmFinish() {
				this.$snotify.error('All NPC\'s seem to be dead. Do you want to finish the encounter?', 'Finish Encounter', {
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
		},
		beforeMount() {
			this.track()
		}
	}
</script>

<style lang="scss">
.container-fluid {
	background-size: cover;
	background-position: center bottom;
	background-color: #191919;
	height: calc(100vh - 50px);
}
#combat {
	padding:10px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 3fr 3fr 2fr 2fr;
	grid-template-rows: 60px auto;
	grid-gap: 10px;
	grid-template-areas:
	"turns turns turns turns"
	"current targets actions side";
	position: absolute;
}
@media only screen and (max-width: 1000px) {
	#combat {
		grid-template-columns: 3fr 3fr 2fr;
		grid-template-rows: 60px auto;
		grid-gap: 10px;
		grid-template-areas:
		"turns turns turns"
		"current targets actions";
	}
}
@media only screen and (max-width: 600px) {
	#combat {
		grid-template-columns: 3fr 3fr;
		grid-template-rows: 60px 1fr 2fr;
		grid-gap: 10px;
		grid-template-areas:
		"turns turns"
		"current targets"
		"actions actions";
	}
}
@media only screen and (max-width: 360px) {
	#combat {
		grid-template-columns: 1fr;
		grid-template-rows: 60px auto;
		grid-gap: 10px;
		grid-template-areas:
		"turns"
		"current"
		"targets"
		"actions";
	}
}
</style>
