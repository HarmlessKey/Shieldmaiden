<template>
	<!-- Check if encounter exists -->
	<div v-if="encounter.round != undefined && Object.keys(players).length">
		<Turns :round="encounter.round" :title="encounter.encounter" :turn="encounter.turn"/>
		<div v-if="encounter.round == 0">
			<SetInitiative 
				:entities="encounter.entities" 
			/>
		</div>
		<div v-else>
			<div id="combat">
				<Current />
				<Targets 
					:encounter="encounter"
					:players="players"
				/>
				<Actions />
				<Side />
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import firebase from 'firebase'

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
		firebase() {
			return {
				encounter: {
					source: db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`),
					asObject: true,
				},
				players: {
					source:db.ref(`players/${this.userId}`),
					asObject: true,
				}
			}
		},
		data() {
			console.log('data')
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		methods: {
			
		}
	}
</script>

<style>
#combat {
	padding:72px 10px 10px 10px;
	width: 100vw;
	height: calc(100vh - 85px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: auto;
	grid-gap: 10px;
	grid-template-areas: 
	"current targets actions side";
}

@media only screen and (max-width: 600px) {
	#combat {
		grid-template-rows: 1fr 3fr 3fr 3fr 3fr;
		grid-template-columns: auto;
		grid-gap: 5px;
		grid-template-areas: 
		"header"
		"current"
		"targets"
		"actions"
		"side";
	}
}

</style>
