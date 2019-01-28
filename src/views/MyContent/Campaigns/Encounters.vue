<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
			<Crumble />

			<router-link to="/campaigns"><i class="fas fa-arrow-left"></i> Back</router-link>

			<b-row class="mt-3">
				<b-col sm="6">
					<h1>Encounters</h1>
					<p>Manage the encounters in your campaign.</p>
				</b-col>
				<b-col>
					<h2>Track encounter</h2>
					<p class="d-flex justify-content-between">
						<span>Let your players follow your encounters.</span>
						<a data-toggle="collapse" :href="'#track'" 
							role="button" aria-expanded="false">
							<i class="fas fa-info"></i>
						</a>
					</p>
					<b-row class="mb-3 copy">
						<b-col sm="8">
							<a @click="copyLink()" class="mb-2">{{ copy }}</a>
						</b-col>
						<b-col sm="4">
							<a class="btn btn-block" @click="copyLink()">Copy <i class="fas fa-copy"></i></a>
							<input type="hidden" id="copy" :value="copy">
						</b-col>
					</b-row>

					<p class="collapse mb-3" id="track">
						With this link your active encounter can be followed on different devices. 
						Send it to your players so they can see it on their tablets or phones, 
						or put it up on a second screen that everyone can see. 
						You control what is dispayed on the link through the <router-link to="/settings#track">settings</router-link>.
					</p>
				</b-col>
			</b-row>
			
			<b-input-group>
				<b-form-input 
					type="text" 
					:class="{'input': true, 'error': errors.has('newEncounter') }"
					v-model="newEncounter"
					v-validate="'required'" 
					name="newEncounter" 
					placeholder="Encounter Title"
					@change="addEncounter()" /></b-form-input>
				<b-input-group-append>
					<button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add Encounter</button>
				</b-input-group-append>				
			</b-input-group>
			<p class="validate red" v-if="errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>
			
			<!-- <h2 v-show="encounters === null" class="mt-3 d-flex justify-content-between">
				<i class="fas fa-arrow-up gray-hover"></i> Add your first encounter <i class="fas fa-arrow-up gray-hover"></i>
			</h2> -->

			<!-- SHOW ENCOUNTERS -->
			<h2 class="mt-3">
				Your Encounters 
				<span v-if="encounters">( {{ Object.keys(encounters).length }} )</span>
			</h2>

			<table class="table">
				<thead>
					<th class="n">#</th>
					<th>Encounter</th>
					<th>Entities</th>
					<th class="d-none d-md-table-cell ">Status</th>
					<th class="d-none d-md-table-cell ">Round</th>
					<th class="d-none d-md-table-cell ">Turn</th>
					<th></th>
				</thead>
				<tbody v-if="encounters"
					name="table-row" 
					is="transition-group" 
					enter-active-class="animated flash" 
					leave-active-class="animated bounceOutLeft">
					<tr v-for="(encounter, index) in _active" :key="encounter.key">
						<td class="n">{{ index + 1 }}</td>
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
							<td class="red d-none d-md-table-cell ">In progress</td>
							<td class="d-none d-md-table-cell ">{{ encounter.round }}</td>
							<td class="d-none d-md-table-cell ">{{ encounter.turn + 1 }}</td>
						</template>
						<template v-else>
							<td colspan="3" class="d-none d-md-table-cell ">Not started</td>
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
								<a v-b-tooltip.hover title="Delete" class="red" @click="deleteEncounter(encounter.key, encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<div v-if="encounters === undefined" class="loader"><span>Loading encounters...</span></div>
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
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				newEncounter: '',
				copy: window.location.host + '/track-encounter/' + this.$store.getters.getUser.uid,
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
			copyLink() {

				let toCopy = document.querySelector('#copy')
				toCopy.setAttribute('type', 'text')    //hidden
				toCopy.select()

				try {
					var successful = document.execCommand('copy');
					var msg = successful ? 'Successful' : 'Unsuccessful';

					this.$snotify.success(msg, 'Link Copied!', {
						position: "rightTop"
					});
				} catch (err) {
					alert('Something went wrong, unable to copy');
				}

				/* unselect the range */
				toCopy.setAttribute('type', 'hidden')
				window.getSelection().removeAllRanges()
			},
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
.copy {
	word-wrap: break-word;
}
</style>