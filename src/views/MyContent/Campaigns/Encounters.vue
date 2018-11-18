<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
			<Crumble />
			<h1>Encounters</h1>
			<p>Manage the encounters in your campaign.</p>
			
			<div class="input-group">
				<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('newEncounter') }" v-model="newEncounter" v-validate="'required'" name="newEncounter" placeholder="Encounter Title" />
				<div class="input-group-append">
					<button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add Encounter</button>
				</div>				
			</div>
			<p class="validate red" v-if="errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>

			<!-- SHOW ENCOUNTERS -->
			<h2 class="mt-3">Encounters</h2>
			<table class="table">
				<thead>
					<th>#</th>
					<th>Encounter</th>
					<th>Status</th>
					<th>Round</th>
					<th>Turn</th>
					<th></th>
				</thead>
				<tbody name="table-row" is="transition-group" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
					<tr v-for="(encounter, index) in encounters" :key="encounter['.key']">
						<td>{{ index + 1 }}</td>
						<td>{{ encounter.encounter }}</td>
						<template v-if="encounter.round != 0">
							<td class="red">In progress</td>
							<td>{{ encounter.round }}</td>
							<td>{{ encounter.turn + 1 }}</td>
						</template>
						<template v-else>
							<td colspan="3">Not started</td>
						</template>
						<td class="text-right">
							<router-link class="green" :to="'/run-encounter/' + campaignId + '/' + encounter['.key']" v-b-tooltip.hover title="Run Encounter"><i class="fas fa-play-circle"></i></router-link>
							<router-link class="mx-2" :to="'/encounters/' + campaignId + '/' + encounter['.key']" v-b-tooltip.hover title="Edit"><i class="fas fa-edit"></i></router-link>
							<a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter['.key'], encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
						</td>
					</tr>
				</tbody>
			</table>
			<div v-if="loading == true" class="loader"><span>Loading encounters...</span></div>

			<h2>Finished Encounters</h2>
			<table class="table">
				<thead>
					<th>#</th>
					<th>Encounter</th>
					<th></th>
				</thead>
				<tbody name="table-row" is="transition-group" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
					
					<tr v-for="(encounter, index) in encounters_finished" :key="encounter['.key']">
						<td>{{ index + 1 }}</td>
						<td>{{ encounter.encounter }}</td>
						<td class="text-right">
							<router-link class="mx-2" :to="'/encounters/encounter-statistics/' + campaignId + '/' + encounter['.key']" v-b-tooltip.hover title="View Statistics"><i class="fas fa-chart-area"></i></router-link>
							<a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter['.key'], encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
						</td>
					</tr>
				</tbody>
			</table>
			<div v-if="loading == true" class="loader"><span>Loading encounters...</span></div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
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
				newEncounter: '',
				campaignId: this.$route.params.campid,
				userId: firebase.auth().currentUser.uid,
				newCampaign: {},
				loading: true,
			}
		},
		firebase() {
			return {
				encounters: {
					source: db.ref('encounters/'+ this.userId).child(this.campaignId).orderByChild('finished').equalTo(false),
					readyCallback: () => this.loading = false
				},
				encounters_finished: {
					source: db.ref('encounters/'+ this.userId).child(this.campaignId).orderByChild('finished').equalTo(true),
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			addEncounter() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('encounters/'+ this.userId +'/'+ this.campaignId).push({encounter: this.newEncounter, round: 0, turn: 0, finished: false});
						this.newEncounter = '';
						this.$snotify.success('Encounter added.', 'Critical hit!', {
							position: "rightTop"
						});
					} else {
					//console.log('Not valid');
				}
			})
			},
			deleteEncounter(key, encounter) {
				this.$snotify.error('Are you sure you want to delete "' + encounter + '"?', 'Delete encounter', {
					timeout: 5000,
					buttons: [
					{text: 'Yes', action: (toast) => { db.ref('encounters/' + this.userId + '/' + this.campaignId).child(key).remove(); this.$snotify.remove(toast.id); }, bold: false},
					{text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},				]
				});
			}
		}
	}
</script>

<style lang="css" scoped>
.container {
	padding-top:20px;
}
table router-link, table a {
	font-size:15px;
}
th:first-child, td:first-child {
	width:10px;
}
</style>