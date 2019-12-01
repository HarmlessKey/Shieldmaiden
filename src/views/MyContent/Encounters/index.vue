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

						<!-- ACTIVE ENCOUNTERS -->
						<HKtable
							class="mb-4"
							:items="_active"
							:columns="activeColumns"
						>
							<template slot="encounter" slot-scope="data">
								<router-link v-if="data.row.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + data.row.key" v-b-tooltip.hover title="Run Encounter">
									{{ data.item }}
								</router-link>
								<template v-else>
									{{ data.item }}
								</template>
							</template>
							<template slot="entities" slot-scope="data">
								<router-link :to="'/encounters/' + campaignId + '/' + data.row.key" v-b-tooltip.hover title="Edit">
									<i class="fas fa-users"></i>
									<template v-if="data.row.entities">
										{{ Object.keys(data.row.entities).length }}
									</template>
									<template v-else> Add</template>
								</router-link>
							</template>

							<span slot="status" slot-scope="data" v-if="data.row.round > 0" class="red">In progress</span>
							<template slot="turn" slot-scope="data">{{ data.row.turn + 1 }}</template>

							<template slot="actions" slot-scope="data">
								<div class="actions">
									<router-link v-if="data.row.entities" :to="'/run-encounter/' + campaignId + '/' + data.row.key" v-b-tooltip.hover title="Run Encounter">
										<i class="fas fa-play"></i>
									</router-link>
									<a v-else class="disabled">
										<i class="fas fa-play"></i>
									</a>
									<router-link class="mx-1 " :to="'/encounters/' + campaignId + '/' + data.row.key" v-b-tooltip.hover title="Edit">
										<i class="fas fa-pencil-alt"></i>
									</router-link>
									<a v-b-tooltip.hover title="Delete" @click="deleteEncounter(data.row.key,data.row.encounter)">
										<i class="fas fa-trash-alt"></i>
									</a>
								</div>
							</template>
						</HKtable>

						<!-- FINISHED ENCOUNTERS -->
						<template v-if="_finished != 0">
							<h2>Finished Encounters</h2>
							
							<HKtable
								:items="_finished"
								:columns="finishedColumns"
								:perPage="6"
								:currentPage="currentPage"
							>
								<template slot="encounter" slot-scope="data">
									<router-link v-if="data.row.entities" class="gray-light" :to="'/run-encounter/' + campaignId + '/' + data.row.key" v-b-tooltip.hover title="Run Encounter">
										{{ data.item }}
									</router-link>
									<template v-else>
										{{ data.item }}
									</template>
								</template>

								<template slot="actions" slot-scope="data">
									<div class="actions">
										<a v-b-tooltip.hover title="Reset" @click="reset(data.row.key)"><i class="fas fa-undo"></i></a>
										<a v-b-tooltip.hover title="Delete" class="ml-2" @click="deleteEncounter(data.row.key, data.row.encounter)"><i class="fas fa-trash-alt"></i></a>
									</div>
								</template>
							</HKtable>

						</template>
						
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
	import Sidebar from '@/components/SidebarMyContent.vue';
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import Crumble from '@/components/crumble/MyContent.vue';
	import PlayerLink from '@/components/PlayerLink.vue';
	import Players from '@/components/campaign/Players.vue';
	import HKtable from '@/components/hk-components/hk-table.vue';

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
			OverEncumbered,
			OutOfSlots,
			Players,
			HKtable
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				newEncounter: '',
				copy: window.location.host + '/track-encounter/' + this.$store.getters.getUser.uid,
				add: false,
				currentPage: 1,
				activeColumns: {
                    encounter: {
						label: 'Encounter',
						maxContent: true
					},
					entities: {
						label: 'Entities',
						center: true
					},
					status: {
						label: 'Status',
						truncate: true
					},
					round: {
						label: 'Round',
						center: true,
						truncate: true
					},
					turn: {
						label: 'Turn',
						center: true,
						truncate: true
					},
                    actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true
                    }
				},
				finishedColumns: {
					encounter: {
						label: 'Encounter',
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true
                    }
				}
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
					delete entity.hidden

					if(entity.entityType == 'npc') {
						entity.curHp = entity.maxHp
					}
					entity.initiative = 0


					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/entities/${key}`).set(entity)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/finished`).set(false)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/turn`).set(0)
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${id}/round`).set(0)

					//CLEAR LOG
					localStorage.removeItem(id);
				}
			},
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