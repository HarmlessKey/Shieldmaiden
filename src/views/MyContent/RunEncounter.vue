<template>
	<div id="combat">
		<!-- Check if encounter exists -->
		<template v-if="encounter && Object.keys(players).length">
			<Turns 
				:round="encounter.round" 
				:title="encounter.encounter" 
				:turn="encounter.turn"
				:active_len="_active.length"
			/>
			<div v-if="encounter.round == 0">
				<SetInitiative 
					:entities="encounter.entities"
					:_active="_active"
					:_idle="_idle"
				/>
			</div>
			<template v-else>
					<Current
						:current="_active[encounter.turn]"
					/>
					<Targets 
						:_active="_active"
						:_idle="_idle"
						@target="log_target"
					/>
					<Actions 
					:target="target"
					:round="encounter.round" 
					:turn="encounter.turn"
					:current="_active[encounter.turn]"
					@log="sendLog"
					/>
					<Side :log="log" />
			</template>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash'
	// import firebase from 'firebase'
	import { mapGetters } from 'vuex'

	import Actions from '@/components/combat/Actions.vue'
	import Turns from '@/components/combat/Turns.vue'
	import Current from '@/components/combat/Current.vue'
	import Targets from '@/components/combat/Targets.vue'
	import Side from '@/components/combat/Side.vue'
	import SetInitiative from '@/components/combat/SetInitiative.vue'
	import { db } from '@/firebase'

	export default {
		name: 'app',
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
			this.$store.dispatch('setCampaignId', this.$route.params.campid)
			this.$store.dispatch('setEncounterId', this.$route.params.encid)
			this.$store.dispatch('fetchEncounter')
			this.$store.dispatch('fetchPlayers')
			return {
				userId: this.$store.getters.getUser.uid,
				target: undefined,
				log: [],
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'encounter',
				'players',
			]),
			_active: function() {
				return _.chain(this.encounter.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.active == true;
								})
								.orderBy(function(entity){
									return parseInt(entity.initiative)
								} , 'desc')
								.value()
			},
			_idle: function() {
				return _.chain(this.encounter.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.active == false;
								})
								.orderBy(function(entity){
									return parseInt(entity.initiative)
								} , 'desc')
								.value()
			},
			// currentEntity: function() {
			// 	return 
			// }
		},
		methods: {
			log_target: function(target) {
				this.target = target
				// this.target = _.find(this._active, {'key':target.key})
			},
			sendLog: function(log) {
				this.log = log;
			}
		}
	}
</script>

<style lang="scss">
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
@media only screen and (max-width: 600px) {
	#combat {
		grid-template-rows: 1fr 3fr 3fr 3fr 3fr;
		grid-template-columns: auto;
		grid-gap: 5px;
		grid-template-areas: 
		"current"
		"targets"
		"actions"
		"side";
	}
}
</style>
