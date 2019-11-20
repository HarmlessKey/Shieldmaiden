<template>
	<div>
		<div id="my-content" class="container-fluid">
			<Crumble />

			<h1 v-if="campaign" class="mb-3 d-flex justify-content-between">
				{{ campaign.campaign }}
				<span @click="broadcast()" class="live" :class="{'active': broadcasting['.value'] == campaignId }">live</span>
			</h1>

			<OverEncumbered v-if="overencumbered" />

			<template v-if="noCurHp">
				<button class="btn btn-lg btn-block mb-4" @click="setCurHp()"><i class="fas fa-undo-alt"></i> Reset Players</button>

				<h3>Why am I seeing this?</h3>
				<p>
					We changed where the current HP and other stats of players are stored so players have to be readded to your campaigns, 
					one click on the button above will do this for you.
				</p>
			</template>
			<template v-else-if="tier">
				<b-row>
					<!-- SHOW ENCOUNTERS -->
					<b-col md="7">
						<h2 class="d-flex justify-content-between">
							<span>
								<span>
								Encounters
								<span v-if="encounters">( 
									<span :class="{ 'green': true, 'red': Object.keys(encounters).length >= tier.benefits.encounters }">
										{{ Object.keys(encounters).length }}
									</span> / 
									<i v-if="tier.benefits.encounters == 'infinite'" class="far fa-infinity"></i>
									<template v-else>{{ tier.benefits.encounters }}</template>
								) </span>
							</span>
							</span>
							<a v-if="Object.keys(encounters).length < tier.benefits.encounters || tier.benefits.encounters == 'infinite'" v-b-tooltip.hover title="Add Encounter" @click="setAdd(!add)"><i class="fas fa-plus green"></i></a>
						</h2>

						<b-input-group v-if="add && (Object.keys(encounters).length < tier.benefits.encounters || tier.benefits.encounters == 'infinite')" class="mb-2">
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
								<button class="btn" @click="addEncounter()"><i class="fas fa-plus"></i> Add</button>
							</b-input-group-append>				
						</b-input-group>
						<p class="validate red" v-if="add && errors.has('newEncounter')">{{ errors.first('newEncounter') }}</p>

						<OutOfSlots 
							v-else-if="tier && Object.keys(encounters).length >= tier.benefits.encounters"
							type = 'encounters'
						/>

						<table class="table table-hover">
							<thead>
								<th class="n d-none d-md-table-cell">#</th>
								<th>Encounter</th>
								<th>Entities</th>
								<th class="d-none d-lg-table-cell">Status</th>
								<th class="d-none d-lg-table-cell">Round</th>
								<th class="d-none d-lg-table-cell">Turn</th>
								<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
							</thead>
							<tbody v-if="encounters"
								name="table-row" 
								is="transition-group" 
								enter-active-class="animated flash" 
								leave-active-class="animated bounceOutLeft">
								<tr v-for="(encounter, index) in _active" :key="encounter.key" :ref="encounter.key">
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
										<td class="red d-none d-lg-table-cell">In progress</td>
										<td class="d-none d-lg-table-cell">{{ encounter.round }}</td>
										<td class="d-none d-lg-table-cell">{{ encounter.turn + 1 }}</td>
									</template>
									<template v-else>
										<td colspan="3" class="gray-hover d-none d-lg-table-cell">Not started</td>
									</template>
									<td class="align-middle p-0">
										<div class="d-flex justify-content-end">
											<div class="d-flex justify-content-end actions">
												<router-link v-if="encounter.entities" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
													<i class="fas fa-play"></i>
												</router-link>
												<a v-else class="disabled">
													<i class="fas fa-play"></i>
												</a>
												<router-link class="mx-1 " :to="'/encounters/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Edit">
													<i class="fas fa-pencil-alt"></i>
												</router-link>
												<a v-b-tooltip.hover title="Delete" @click="deleteEncounter(encounter.key, encounter.encounter)">
													<i class="fas fa-trash-alt"></i>
												</a>
											</div>

											<span class="dropleft d-sm-none actions-dropdown">
												<a class="options"
													id="options"
													data-toggle="dropdown" 
													aria-haspopup="true" 
													aria-expanded="false">
													<i class="far fa-ellipsis-v"></i>
												</a>
												<div class="dropdown-menu" aria-labelledby="options">	
													<router-link 
														v-if="encounter.entities" 
														:to="'/run-encounter/' + campaignId + '/' + encounter.key" 
														class="dropdown-item">
															
															<i class="fas fa-play"></i> Run encounter
													</router-link>
													<a v-else class="disabled dropdown-item">
														<i class="fas fa-play"></i> Run encounter
													</a>
													<router-link 
														class="mx-1 dropdown-item" 
														:to="'/encounters/' + campaignId + '/' + encounter.key">

														<i class="fas fa-pencil-alt"></i> Edit encounter
													</router-link>
													<a @click="deleteEncounter(encounter.key, encounter.encounter)"
														class="dropdown-item">
														<i class="fas fa-trash-alt"></i> Delete encounter
													</a>
												</div>
											</span>
										
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
									<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
								</thead>
								<tbody name="table-row" is="transition-group" enter-active-class="animated flash" leave-active-class="animated bounceOutLeft">
									
									<tr v-for="(encounter, index) in _finished" :key="encounter.key">
										<td>{{ index + 1 }}</td>
										<td>
											<router-link v-if="encounter.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + encounter.key" v-b-tooltip.hover title="Run Encounter">
												{{ encounter.encounter }}
											</router-link>
										</td>
										<td class="align-middle p-0">
											<div class="d-flex justify-content-end">
												<div class="d-flex justify-content-end actions">
													<a v-b-tooltip.hover title="Unfinish" @click="reset(encounter.key, hard=false)"><i class="fas fa-trash-undo"></i></a>
													<a v-b-tooltip.hover title="Reset" @click="reset(encounter.key)"><i class="fas fa-undo"></i></a>
													<a v-b-tooltip.hover title="Delete" class="ml-2" @click="deleteEncounter(encounter.key, encounter.encounter)"><i class="fas fa-trash-alt"></i></a>
												</div>
												
												<span class="dropleft d-sm-none actions-dropdown">
													<a class="options"
														id="options"
														data-toggle="dropdown" 
														aria-haspopup="true" 
														aria-expanded="false">
														<i class="far fa-ellipsis-v"></i>
													</a>
													<div class="dropdown-menu" aria-labelledby="options">	
														<a v-b-tooltip.hover title="Reset" @click="reset(encounter.key)" class="dropdown-item">
															<i class="fas fa-undo"></i> Reset encounter
														</a>
														<a v-b-tooltip.hover title="Delete" class="ml-2 dropdown-item" @click="deleteEncounter(encounter.key, encounter.encounter)">
															<i class="fas fa-trash-alt"></i> Delete encounter
														</a>
													</div>
												</span>
												
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
					</b-col>

					<!-- PLAYERS -->
					<b-col md="5">
						<h2>Players</h2>
						<Players />
					</b-col>
				</b-row>
			</template>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import PlayerLink from '@/components/PlayerLink.vue'
	import Players from '@/components/campaign/Players.vue'
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
			PlayerLink,
			draggable,
			OverEncumbered,
			OutOfSlots,
			Players
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
				add: false,
			}
		},
		firebase() {
			return {
				broadcasting: {
					source: db.ref(`broadcast/${this.user.uid}/live`),
					asObject: true
				}
			}
		},
		mounted() {
			this.fetchEncounters({
				cid: this.campaignId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		computed: {
			...mapGetters([
				'tier',
				'encounters',
				'overencumbered',
				'content_count',
				'campaign',
				'players',
				'playerInCampaign',
			]),
			// _active_drag: function() {
			// },
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
			noCurHp() {
				//Checks if all players have their curHp set
				//If not, a button  appears that sets it
				if(this.campaign) {
					for(var key in this.campaign.players) {
						if(this.campaign.players[key].curHp == undefined) {
							return true;
						} else {
							return false;
						}
					}
				}
			}
		},
		methods: {
			...mapActions([
				'fetchEncounters',
				'fetchCampaign',
			]),
			copyLink() {

				let toCopy = document.querySelector('#copy')
				toCopy.setAttribute('type', 'text') //hidden
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
			setAdd(value) {
				this.add = value;
			},
			addEncounter() {
				this.$validator.validateAll().then((result) => {
					if (result && (Object.keys(this.encounters).length < this.tier.benefits.encounters || this.tier.benefits.encounters == 'infinite')) {
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
						this.add = false;
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
			reset(id, hard=true) {
				if (hard){
					console.log("Hard reset")
					for(let key in this.encounters[id].entities) {
						let entity = this.encounters[id].entities[key]

						//Remove values
						delete entity.tempHp
						delete entity.transformed
						delete entity.stabilized
						delete entity.down
						delete entity.ac_bonus
						delete entity.meters
						delete entity.hidden

						if(entity.entityType == 'npc') {
							entity.curHp = entity.maxHp
						}
						entity.initiative = 0


						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/entities/${key}`).set(entity)

						//CLEAR LOG
						localStorage.removeItem(id);
					}
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/turn`).set(0)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/round`).set(0)
				}

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/finished`).set(false)

			},
			// onMove(evt, originalEvent) {
			// 	var index = evt.draggedContext.index
			// 	var future = evt.draggedContext.futureIndex
			// 	console.log(evt)
			// 	console.log(evt.draggedContext.index, '->', evt.draggedContext.futureIndex)
			// 	console.log("MOVED")
			// }
			broadcast() {
				//Save this is the current campaign that is being broadcasted

				if(this.broadcasting['.value'] == this.campaignId) {
					db.ref(`broadcast/${this.user.uid}/live`).remove()
				} else {
					db.ref(`broadcast/${this.user.uid}/live`).set(this.campaignId)
				}
			},
			setCurHp() {
				//Stores player with curHp under campaign
				for(var key in this.campaign.players) {
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).update({
						curHp: this.players[key].maxHp
					})
				}
				this.noCurHp = false;
			}
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.loader {
		margin-top: 20px;
	}
	.live {
		cursor: pointer;
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
}

.actions {
	a.disabled {
		color: #494747 !important;
		cursor: default !important;
		&:hover {
			background-color: transparent;
		}
	}
}

</style>