<template>
	<div id="combat">
		<!-- Check if encounter exists -->
		<template v-if="encounter && players">
			<Turns 
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
	import { mapActions, mapGetters } from 'vuex'

	import Actions from '@/components/combat/Actions.vue'
	import Turns from '@/components/combat/Turns.vue'
	import Current from '@/components/combat/Current.vue'
	import Targets from '@/components/combat/Targets.vue'
	import Side from '@/components/combat/Side.vue'
	import SetInitiative from '@/components/combat/SetInitiative.vue'

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
			
			return {
				userId: this.$store.getters.getUser.uid,
				target: undefined,
				log: undefined
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
		},
		methods: {
			...mapActions([
				'init_Encounter',
				'track_Encounter',
				// 'generateEntities',
			]),
			log_target: function(target) {
				this.target = target
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
