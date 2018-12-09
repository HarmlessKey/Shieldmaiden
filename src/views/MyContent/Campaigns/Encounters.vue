<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
			<Crumble />
			<h1>Encounters</h1>
			<p>Manage the encounters in your campaign.</p>
			
			<div class="input-group">
				<input type="text" 
					class="form-control"
					:class="{'input': true, 'error': errors.has('newEncounter') }"
					v-model="newEncounter"
					v-validate="'required'" 
					name="newEncounter" 
					placeholder="Encounter Title"
					@change="addEncounter()" />
				<div class="input-group-append">
					<button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add Encounter</button>
				</div>				
			</div>
			<p class="validate red" v-if="errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>

			<!-- SHOW ENCOUNTERS -->
			<template v-if="encounters">
				<h2 class="mt-3">Encounters ( {{ Object.keys(encounters).length }} )</h2>
				<table class="table">
					<thead>
						<th>#</th>
						<th>Encounter</th>
						<th>Entities</th>
						<th>Status</th>
						<th>Round</th>
						<th>Turn</th>
						<th></th>
					</thead>
					<tbody name="table-row" is="transition-group" enter-active-class="animated flash" leave-active-class="animated bounceOutLeft">
						<tr v-for="(encounter, index) in _active" :key="encounter.key">
							<td>{{ index + 1 }}</td>
							<td>{{ encounter.encounter }}</td>
							<td>
								<router-link :to="'/encounters/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Edit">
									<i class="fas fa-users"></i>
									<template v-if="encounter.entities">
										{{ Object.keys(encounter.entities).length }}
									</template>
									<template v-else> Add</template>
								</router-link>
							</td>
							<template v-if="encounter.round != 0">
								<td class="red">In progress</td>
								<td>{{ encounter.round }}</td>
								<td>{{ encounter.turn + 1 }}</td>
							</template>
							<template v-else>
								<td colspan="3">Not started</td>
							</template>
							<td class="text-right actions">
								<router-link v-if="encounter.entities" class="green" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter"><i class="fas fa-play-circle"></i></router-link>
								<span v-else class="disabled"><i class="fas fa-play-circle"></i></span>
								<router-link class="mx-2" :to="'/encounters/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Edit"><i class="fas fa-hammer-war"></i></router-link>
								<a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter.key, encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
							</td>
						</tr>
					</tbody>
				</table>

				<template v-if="_finished != 0">
					<h2>Finished Encounters</h2>
					<table class="table">
						<thead>
							<th>#</th>
							<th>Encounter</th>
							<th></th>
						</thead>
						<tbody name="table-row" is="transition-group" enter-active-class="animated flash" leave-active-class="animated bounceOutLeft">
							
							<tr v-for="(encounter, index) in _finished" :key="encounter.key">
								<td>{{ index + 1 }}</td>
								<td>{{ encounter.encounter }}</td>
								<td class="text-right">
									<router-link class="mx-2" :to="'/encounters/encounter-statistics/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="View Statistics"><i class="fas fa-chart-area"></i></router-link>
									<a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter.key, encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
								</td>
							</tr>
						</tbody>
					</table>
				</template>
			</template>
			<h2 v-else-if="encounters === null" class="mt-3 text-center"><i class="fas fa-arrow-up gray-hover"></i> Add your first encounter <i class="fas fa-arrow-up gray-hover"></i></h2>
			<div v-else class="loader"><span>Loading encounters...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {
		name: 'EditCampaign',
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				newEncounter: '',
			}
		},
		mounted() {
			this.fetchEncounters({
				cid: this.campaignId, 
			})
		},
		computed: {
			...mapGetters([
				'encounters'
			]),
			_active: function() {
				return _.chain(this.encounters)
				.filter(function(encounter, key) {
					encounter.key = key
					return encounter.finished == false;
				})
				.orderBy(function(encounter){
					return parseInt(encounter.timestamp)
				} , 'desc')
				.value()
			},
			_finished: function() {
				return _.chain(this.encounters)
				.filter(function(encounter, key) {
					encounter.key = key
					return encounter.finished == true;
				})
				.orderBy(function(encounter){
					return parseInt(encounter.timestamp)
				} , 'desc')
				.value()
			},
		},
		methods: {
			...mapActions([
				'fetchEncounters',
			]),
			addEncounter() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('encounters/' + this.user.uid + '/' + this.campaignId).push({
							encounter: this.newEncounter, 
							round: 0, 
							turn: 0, 
							finished: false,
							timestamp: Date.now()
						});
						this.newEncounter = '';
						this.$snotify.success('Encounter added.', 'Critical hit!', {
							position: "rightTop"
						});
						this.$validator.reset();
					} 
					else {
						//console.log('Not valid');
					}
				})
			},
			deleteEncounter(key, encounter) {
				this.$snotify.error('Are you sure you want to delete "' + encounter + '"?', 'Delete encounter', {
					timeout: 5000,
					buttons: [
					{
						text: 'Yes', action: (toast) => { 
							db.ref('encounters/' + this.user.uid + '/' + this.campaignId).child(key).remove(); 
							this.$snotify.remove(toast.id); 
						}, bold: false 
					},
					{
						text: 'No', action: (toast) => { 
							this.$snotify.remove(toast.id); 
						}, 
						bold: false },
					]
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding-top: 20px;
}
.loader {
	margin-top: 20px;
}
</style>