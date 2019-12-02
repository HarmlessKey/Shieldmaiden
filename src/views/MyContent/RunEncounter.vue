<template>
	<div v-if="overencumbered">
		<OverEncumbered/>
	</div>
	<div v-else-if="encounter && players"  
		:style="[settings.background ?  {'background': 'url(\'' + encounter.background + '\')'} : {'background': ''}]">	
		
		<Finished v-if="encounter.finished" :encounter="encounter"/>

		<template v-else>
			<SetInitiative 
				v-if="encounter.round == 0"
				:_active = "_active"
				:_idle = "_idle"
			/>
			<div v-else class="combat">
				<Turns 
					:active_len="Object.keys(_active).length"
					:current="_active[encounter.turn]"
					:next="_active[encounter.turn + 1]"
				/>
				{{ setAlive(Object.keys(_alive).length) }} <!-- Check if there are alive NPC's -->
				<Current 
					:current="_active[encounter.turn]"
				/>
				<Targets 
					:_active = "_active"
					:_idle = "_idle"
				/>
				<Targeted />
				<!-- <Actions 
					:current="_active[encounter.turn]"
				/> -->
				<Side />
			</div>
		</template>
	</div>

</template>

<script>
	import _ from 'lodash'
	import { mapActions, mapGetters } from 'vuex'
	import { db } from '@/firebase'

	import Finished from '@/components/combat/Finished.vue'
	import Actions from '@/components/combat/actions/Actions.vue'
	import Turns from '@/components/combat/Turns.vue'
	import Current from '@/components/combat/Current.vue'
	import Targets from '@/components/combat/Targets.vue'
	import Targeted from '@/components/combat/Targeted.vue'
	import Side from '@/components/combat/side/Side.vue'
	import SetInitiative from '@/components/combat/SetInitiative.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'

	export default {
		name: 'app',
		metaInfo: {
			title: 'Run Encounter'
		},
		components: {
			Finished,
			Actions,
			Turns,
			Current,
			Targets,
			Targeted,
			Side,
			SetInitiative,
			OverEncumbered,
		},
		data() {
			// Dispatch route parameters to store

			return {
				userId: this.$store.getters.getUser.uid,
				target: undefined,
				alive: undefined,
			}
		},
		firebase() {
			return {
				settings: {
					source: db.ref(`settings/${this.userId}/encounter`),
					asObject: true,
				},
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
				'initialized',
				'overencumbered',
			]),
			_active: function() {
				let order = (this.settings.initOrder) ? 'asc' : 'desc'; 

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && !entity.down;
					})
					.orderBy(function(entity) {
						return entity.name
					}, 'asc')
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , order)
					.value()
			},
			_idle: function() {
				let order = (this.settings.initOrder) ? 'asc' : 'desc';

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return !entity.active && !entity.down;
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , order)
					.value()
			},
			_alive: function() {
				let order = (this.settings.initOrder) ? 'asc' : 'desc';

				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.active && entity.curHp > 0 && entity.entityType == 'npc';
					})
					.orderBy(function(entity){
						return parseInt(entity.initiative)
					} , order)
					.value()
			},
		},
		watch: {
			alive(newVal) {
				if(newVal == 0 && this.initialized) {
					this.confirmFinish()
				}
			}
		},
		beforeRouteLeave (to, from, next) {
			this.reset_store()
			this.removeTrack()
			next()
		},
		beforeRouteUpdate(to, from, next) {
			this.reset_store()
			this.removeTrack()
			next();
		},
		methods: {
			...mapActions([
				'init_Encounter',
				'track_Encounter',
				'set_finished',
				'reset_store',
			]),
			track() {
				db.ref('broadcast/' + this.userId).update({
					campaign: this.$route.params.campid,
					encounter: this.$route.params.encid,
				});
			},
			removeTrack() {
				db.ref('broadcast/' + this.userId).update({
					campaign: false,
					encounter: false,
				});
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
		},
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	background-size: cover !important;
	background-position: center bottom !important;
	background-color: #191919;
	height: calc(100vh - 50px);

	.finished {
		margin-top: 30px;
		background: rgba(38, 38, 38, .9) !important;
	}
	.combat {
		padding:10px;
		width: 100vw;
		height: calc(100% - 50px);
		display: grid;
		grid-template-columns: 3fr 4fr 3fr 2fr;
		grid-template-rows: 60px auto;
		grid-gap: 10px;
		grid-template-areas:
		"turns turns turns turns"
		"current targets targeted side";
		position: absolute;
		font-size: 12px;
		h1 {
			text-transform:uppercase;
			font-size: 15px !important;
		}
		h2 {
			text-transform:uppercase;
			font-size: 15px !important;
			margin-bottom: 20px !important;
		}
		h3 {
			font-size: 15px !important;
			margin-bottom: 15px !important;
		}
	}
	@media only screen and (max-width: 1000px) {
		.combat {
			grid-template-columns: 3fr 3fr 2fr;
			grid-template-rows: 60px auto;
			grid-gap: 10px;
			grid-template-areas:
			"turns turns turns"
			"current targeted";
		}
	}
	@media only screen and (max-width: 600px) {
		.combat {
			grid-template-columns: auto;
			grid-template-rows: 60px 1fr 2fr;
			grid-gap: 10px;
			grid-template-areas:
			"turns"
			"current"
			"targets"
			"targeted";
		}
	}
}
</style>
