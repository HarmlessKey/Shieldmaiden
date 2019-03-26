<template>
	<div>
		<div id="hasSide">
			<Sidebar/>
			<div id="my-content" class="container-fluid">
				<Crumble />
				<PlayerLink />
				
				<template v-if="players">
					<div class="input-group">
						<input type="text" 
							class="form-control" 
							autocomplete="off"
							:class="{'input': true, 'error': errors.has('newCampaign') }" 
							v-model="newCampaign" 
							v-validate="'required'"
							data-vv-as="New Campaign" 
							name="newCampaign"
							@change="addCampaign()"
							placeholder="Add new campaign"
						/>
						<div class="input-group-append">
							<button class="btn"><i class="fas fa-plus"></i> Add</button>
						</div>				
					</div>
					<!-- <div class="red" v-else="">You have 2/2 campaigns.</div> -->
					<p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>

					<!-- <h2 v-show="campaigns === null" class="mt-3 px-2 d-flex justify-content-between"><i class="fas fa-arrow-up gray-hover">
						</i> Add your first campaign <i class="fas fa-arrow-up gray-hover"></i>
					</h2> -->

					<h2 class="mt-3">
						Your Campaigns 
						<span v-if="campaigns">( {{ Object.keys(campaigns).length }} )</span>
					</h2>

					<transition-group 
						v-if="campaigns"
						tag="div" 
						class="row" 
						name="campaigns" 
						enter-active-class="animated flash" 
						leave-active-class="animated bounceOutLeft">
						<b-col lg="4" md="6" v-for="campaign in _campaigns" :key="campaign.key">
							<div class="card">
								<div class="card-header d-flex justify-content-between">
									<span>
										<i class="fas fa-dungeon"></i>
										{{ campaign.campaign }}
									</span>

									<span>
										<router-link class="mx-2 text-capitalize gray-hover" 
											:to="'/campaigns/' + campaign.key" 
											v-b-tooltip.hover title="Edit">
												<i class="fas fa-pencil"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="gray-hover text-capitalize"
											@click="confirmDelete(campaign.key, campaign.campaign)">
												<i class="fas fa-trash-alt"></i>
										</a>
									</span>
								</div>
								<div class="card-body">
									<b-row>
										<b-col>
											<router-link :to="'/campaigns/' + campaign.key" v-b-tooltip.hover title="Players">
												<i class="fas fa-users"></i><br/>
												<template v-if="campaign.players"> {{ Object.keys(campaign.players).length }}</template>
												<template v-else> Add</template>
											</router-link>
										</b-col>

										<b-col>
												<router-link :to="'/encounters/' + campaign.key" v-b-tooltip.hover title="Encounters">
												<i class="fas fa-swords"></i><br/>
												<template v-if="allEncounters && allEncounters[campaign.key]">
													{{ Object.keys(allEncounters[campaign.key]).length }}
												</template>
												<template v-else> Create</template>
											</router-link>
										</b-col>
									</b-row>
								</div>
									<small class="text-center py-1 bg-gray-active"><span class="gray-hover">Created:</span> {{ makeDate(campaign.timestamp) }}</small>
								<router-link :to="'/encounters/' + campaign.key" class="btn">Play <i class="fas fa-play"></i></router-link>
							</div>
						</b-col>
					</transition-group>

				</template>
				<b-card header="No players" class="warning" v-else-if="players === null">
					<p>There are no players to join in your campaigns yet, let's create some first.</p>
					<router-link class="btn btn-block" to="/players/add-player">Create players</router-link>
				</b-card>
				<div v-if="campaigns === undefined" class="loader"><span>Loading Campaigns...</span></div>

				<h2>Following</h2>
				<template v-if="userInfo && users">
					<ul v-if="userInfo.follow" class="entities">
						<li v-for="(following, key) in userInfo.follow" :key="key" class="d-flex justify-content-between">
							<router-link :to="'/track-encounter/' + key" v-if="users[key]">
								{{ users[key].username }}
							</router-link>
							<template v-if="track[key]">
								<i v-show="track[key].broadcast" v-b-tooltip.hover title="Broadcasting" class="fas fa-play green"></i>
								<i v-show="!track[key].broadcast" v-b-tooltip.hover title="Not Broadcasting" class="fas fa-stop red"></i>
							</template>
						</li>
					</ul>
					<p v-else>You are currently not following other users.</p>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import PlayerLink from '@/components/PlayerLink.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		components: {
			Sidebar,
			Crumble,
			PlayerLink,
		},
		data() {
			return {
				newCampaign: '',
			}
		},
		firebase() {
			return {
				users: {
					source: db.ref(`users`),
					asObject: true
				},
				track: {
					source: db.ref(`track`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'userInfo',
				'allEncounters',
				'players',
			]),
			...mapGetters({
				user: 'getUser'
			}),
			_campaigns: function() {
				return _.chain(this.campaigns)
				.filter(function(campaign, key) {
					campaign.key = key
					return campaign
				})
				.orderBy(function(campaign){
					return parseInt(campaign.timestamp)
				} , 'asc')
				.value()
			},
		},
		methods: {
			addCampaign() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('campaigns/' + this.user.uid).push({
							campaign: this.newCampaign,
							timestamp: Date.now(),
						});
						this.newCampaign = '';
						this.$snotify.success('Campaign added.', 'Critical hit!', {
							position: "rightTop"
						});
						this.$validator.reset();
					} 
					else {
						//console.log('Not valid');
					}
				})
			},
			confirmDelete(key, name) {
				this.$snotify.error('Are you sure you want to delete the campaign "' + name + '"?', 'Delete campaign', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteCampaign(key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			deleteCampaign(key) {
				db.ref('campaigns/'+ this.user.uid).child(key).remove();
				db.ref('encounters/'+ this.user.uid).child(key).remove();
			},
			makeDate(input) {
				let monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				let d = new Date(input)
				let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
				let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
				let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

				let time = hours + ":" + minutes + ":" + seconds;
				let date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				return date + " - " + time;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		a {
			cursor: pointer;
		}
		h2.players {
			margin-bottom: 5px !important;
			text-align: center;
		}
		.card {
			&.warning {
				.card-header {
					background-color: #cc3e4a;
					color: #fff;
				}
			}
			.card-header {
				a:hover {
					color: #b2b2b2 !important;
				}
				span {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
			.card-body {
				.col {
					text-align: center;
					font-size: 25px;

					a {
						width: 100%;
						display: block;
						color: #b2b2b2 !important;

						&:hover {
							text-decoration: none;
							color: #2c97de !important;
						}
					}
					svg {
						font-size: 50px;
					}
				}
			}
		}
		ul.entities {
			li {
				i {
				 margin-top: 5px;
				}
			}
		}
	}
	
</style>