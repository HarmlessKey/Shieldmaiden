<template>
	<div>
		<div id="hasSide">
			<Sidebar/>
			<div id="my-content" class="container">
				<Crumble />
				<h1>Campaigns</h1>
				<p>Welcome to your campaigns overview.</p>
				
				<template v-if="players">
					<div class="input-group">
						<input type="text" 
							class="form-control" 
							:class="{'input': true, 'error': errors.has('newCampaign') }" 
							v-model="newCampaign" 
							v-validate="'required'" 
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
						<b-col lg="6" v-for="(campaign, index) in _campaigns" :key="campaign.key">
							<div class="card">
								<div class="card-header d-flex justify-content-between">
									<span>
										<i class="fas fa-dungeon"></i>
										{{ campaign.campaign }}
									</span>

									<span>
										<router-link class="mx-2" 
											:to="'/campaigns/' + campaign.key" 
											v-b-tooltip.hover title="Edit"><i class="fas fa-hammer-war"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="red"
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
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				newCampaign: '',
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-top:20px;

		a {
			cursor:pointer;
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
	}
	
</style>