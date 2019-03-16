<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container-fluid" v-if="tier">
			<Crumble />

			<router-link to="/campaigns"><i class="fas fa-arrow-left"></i> Back</router-link>

			<b-row class="mt-3">
				<b-col sm="6">
					<h1>Encounters</h1>
					<p>Manage the encounters in your campaign.</p>
				</b-col>
				<b-col>
					<h2>Player View</h2>
					<p class="d-flex justify-content-between">
						<span>Let your players follow your encounters.</span>
						<a data-toggle="collapse" :href="'#track'" 
							role="button" aria-expanded="false">
							<i class="fas fa-info"></i>
						</a>
					</p>
					<p class="collapse mb-3" id="track">
						With this link your active encounter can be followed on different devices. 
						Send it to your players so they can see it on their tablets or phones, 
						or put it up on a second screen that everyone can see. 
						You control what is dispayed on the link through the <router-link to="/settings#track">settings</router-link>.
					</p>
				
					<p><a @click="copyLink()" v-b-tooltip.hover title="Click to copy"><i class="fas fa-copy"></i> - {{ copy }}</a></p>
					<input type="hidden" autocomplete="off" id="copy" :value="copy">
				</b-col>
			</b-row>
			<OverEncumbered v-if="overencumbered" />
			<OutOfSlots v-else-if="content_count.encounters >= tier.benefits.encounters"/>
			<b-input-group v-else>
				<b-form-input
					autocomplete="off" 
					type="text" 
					:class="{'input': true, 'error': errors.has('newEncounter') }"
					v-model="newEncounter"
					v-validate="'required'" 
					data-vv-as="New Encounter"
					name="newEncounter" 
					placeholder="Encounter Title"
					@change="addEncounter()"></b-form-input>
				<b-input-group-append>
					<button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add Encounter</button>
				</b-input-group-append>				
			</b-input-group>
			<p class="validate red" v-if="errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>

			<!-- BROADCAST -->
			<div @click="broadcast(broadcasting['.value'])" class="broadcast" :class="{'bg-green': broadcasting['.value'], 'bg-gray': !broadcasting['.value'] }">
				<template v-if="broadcasting['.value']">
					<h3><i class="fas fa-play"></i> Broadcasting (click to stop)</h3>
					<p class="mb-0">You are broadcasting your encounters. Anyone with the track encounter link, can follow your encounter.</p>
					<i>Turn this off when you are not running a session and building/testing your encounters.</i>
				</template>
				<template v-else>
					<h3><i class="fas fa-stop"></i> Not Broadcasting <span class="gray-hover">(click to start)</span></h3>
					<p class="mb-0">Start broadcasting to share your encounters with your players. They can follow your encounters through your personalised link above.</p>
				</template>
			</div>

			<!-- SHOW ENCOUNTERS -->
			<h2 class="mt-3">
				Your Encounters 
				<span v-if="encounters">( 
					<span :class="{ 'green': true, 'red': content_count.encounters >= tier.benefits.encounters }">{{ Object.keys(encounters).length }}</span> 
					/ {{ tier.benefits.encounters }} )
				</span>
			</h2>

			<table class="table table-hover">
				<thead>
					<th class="n d-none d-md-table-cell">#</th>
					<th>Encounter</th>
					<th>Entities</th>
					<th class="d-none d-md-table-cell">Status</th>
					<th class="d-none d-md-table-cell">Round</th>
					<th class="d-none d-md-table-cell">Turn</th>
					<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
				</thead>
				<tbody v-if="encounters"
					name="table-row" 
					is="transition-group" 
					enter-active-class="animated flash" 
					leave-active-class="animated bounceOutLeft">
					<tr v-for="(encounter, index) in _active" :key="encounter.key">
						<td class="n d-none d-md-table-cell">{{ index + 1 }}</td>
						<td>
							<router-link v-if="encounter.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
								{{ encounter.encounter }}
							</router-link>
							<template v-else>
								{{ encounter.encounter }}
							</template>
						</td>
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
							<td class="red d-none d-md-table-cell">In progress</td>
							<td class="d-none d-md-table-cell">{{ encounter.round }}</td>
							<td class="d-none d-md-table-cell">{{ encounter.turn + 1 }}</td>
						</template>
						<template v-else>
							<td colspan="3" class="gray-hover d-none d-md-table-cell">Not started</td>
						</template>
						<td>
							<div class="d-flex justify-content-end">
								<div class="d-flex justify-content-end actions">
									<router-link v-if="encounter.entities" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
										<i class="fas fa-play"></i>
									</router-link>
									<span v-else class="disabled">
										<i class="fas fa-play"></i>
									</span>
									<router-link class="mx-1 " :to="'/encounters/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Edit">
										<i class="fas fa-pencil-alt"></i>
									</router-link>
									<a v-b-tooltip.hover title="Delete" @click="deleteEncounter(encounter.key, encounter.encounter)">
										<i class="fas fa-trash-alt"></i>
									</a>
								</div>
								<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
							</div>
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
							<td>
								<router-link v-if="encounter.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
									{{ encounter.encounter }}
								</router-link>
							</td>
							<td>
								<div class="d-flex justify-content-end">
									<div class="d-flex justify-content-end actions">
										<a v-b-tooltip.hover title="Reset" @click="reset(encounter.key)"><i class="fas fa-undo"></i></a>
										<a v-b-tooltip.hover title="Delete" class="ml-2" @click="deleteEncounter(encounter.key, encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
									</div>
									<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</div>
							
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<!-- <ul v-sortable>
				<li v-for="item in list">
					{{ list.name }}
					{{ list.order }}
				</li>
			</ul> -->
			<!-- <table class="table table-hover">
				<thead>
					<th class="n d-none d-md-table-cell">#</th>
					<th>Encounter</th>
					<th>Entities</th>
					<th class="d-none d-md-table-cell">Status</th>
					<th class="d-none d-md-table-cell">Round</th>
					<th class="d-none d-md-table-cell">Turn</th>
					<th></th>
				</thead>
				<draggable :move="onMove" :list="_active" :element="'tbody'">
					<tr v-for="(encounter, index) in _active">
						<td class="n d-none d-md-table-cell">{{ index + 1 }}</td>
						<td>
							<router-link v-if="encounter.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
								{{ encounter.encounter }}
							</router-link>
							<template v-else>
								{{ encounter.encounter }}
							</template>
						</td>
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
							<td class="red d-none d-md-table-cell">In progress</td>
							<td class="d-none d-md-table-cell">{{ encounter.round }}</td>
							<td class="d-none d-md-table-cell">{{ encounter.turn + 1 }}</td>
						</template>
						<template v-else>
							<td colspan="3" class="gray-hover d-none d-md-table-cell">Not started</td>
						</template>
						<td class="actions">
							<div class="d-flex justify-content-end">
								<router-link v-if="encounter.entities" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
									<i class="fas fa-play"></i>
								</router-link>
								<span v-else class="disabled">
									<i class="fas fa-play"></i>
								</span>
								<router-link class="mx-1 " :to="'/encounters/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Edit">
									<i class="fas fa-pencil-alt"></i>
								</router-link>
								<a v-b-tooltip.hover title="Delete" @click="deleteEncounter(encounter.key, encounter.encounter)">
									<i class="fas fa-trash-alt"></i>
								</a>
							</div>
						</td>
					</tr>
				</draggable>
			</table> -->
			<div v-if="encounters === undefined" class="loader"><span>Loading encounters...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import draggable from 'vuedraggable'

	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'EditCampaign',
		metaInfo: {
			title: 'Encounters'
		},
		components: {
			Sidebar,
			Crumble,
			draggable,
			OverEncumbered,
			OutOfSlots,
		},
		data() {
			return {
				list: [
					{
						"name": "harm",
						"order": 0
					},
					{
						"name": "key",
						"order": 1
					},
				],
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				newEncounter: '',
				copy: window.location.host + '/track-encounter/' + this.$store.getters.getUser.uid,
			}
		},
		firebase() {
			return {
				broadcasting: {
					source: db.ref(`track/${this.user.uid}/broadcast`),
					asObject: true
				}
			}
		},
		mounted() {
			this.fetchEncounters({
				cid: this.campaignId, 
			})
		},
		computed: {
			...mapGetters([
				'tier',
				'encounters',
				'overencumbered',
				'content_count',
			]),
			_active_drag: function() {

			},
			_active: function() {
				return _.chain(this.encounters)
				.filter(function(encounter, key) {
					encounter.key = key
					return encounter.finished == false;
				})
				.orderBy(function(encounter){
					if (encounter.order == undefined) {
						encounter.order = 0
					}
					return parseInt(encounter.timestamp)
				} , 'asc')
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
				} , 'asc')
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
			},
			reset(id) {
				for(let key in this.encounters[id].entities) {
					let entity = this.encounters[id].entities[key]

					//Remove values
					delete entity.tempHp
					delete entity.transformed
					delete entity.stabilized
					delete entity.down
					delete entity.ac_bonuc
					delete entity.meters

					entity.curHp = entity.maxHp
					entity.initiative = 0

					// console.log(this.encounters[id].entities[key])

					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/entities/${key}`).set(
						entity
					)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/finished`).set(false)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/turn`).set(0)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/round`).set(0)

					//CLEAR LOG
					localStorage.removeItem(id);
				}
			},
			// onMove(evt, originalEvent) {
			// 	var index = evt.draggedContext.index
			// 	var future = evt.draggedContext.futureIndex
			// 	console.log(evt)
			// 	console.log(evt.draggedContext.index, '->', evt.draggedContext.futureIndex)
			// 	console.log("MOVED")
			// }
			broadcast(broadcast) {
				if(broadcast == false) { broadcast = true }
				else { broadcast = false }

				db.ref(`track/${this.user.uid}/broadcast`).set(broadcast)
			},
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.loader {
		margin-top: 20px;
	}
	.copy {
		word-wrap: break-word;
	}
	.broadcast {
		cursor: pointer;
		margin: 20px 0;
		padding: 20px;

		&.bg-green {
			color: #fff;
			animation: blink normal 3s infinite ease-in-out;
		}
		h3 {
			margin-bottom: 5px;
		}
	}
	@keyframes blink {
    0% { background-color: rgba(131, 181, 71, 1) }
    50% { background-color: rgba(131, 181, 71, 0.5) }
    100% { background-color: rgba(131, 181, 71, 1) }
	}
}
</style>