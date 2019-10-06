<template>
	<div>
		<div id="hasSide">
			<Sidebar/>
			<div id="my-content" class="container-fluid">
				<Crumble />
				
				<OverEncumbered v-if="overencumbered" />

				<template v-if="players && tier">

					<h2 class="mt-3 d-flex justify-content-between">
						<span>
							Your Campaigns 
							<span v-if="campaigns && tier">( 
								<span :class="{ 'green': true, 'red': content_count.campaigns >= tier.benefits.campaigns }">
									{{ Object.keys(campaigns).length }}
								</span> / 
								<i v-if="tier.benefits.campaigns == 'infinite'" class="far fa-infinity"></i>
								<template v-else>{{ tier.benefits.campaigns }}</template>
							) </span>
						</span>
						<a v-if="content_count.campaigns < tier.benefits.campaigns || tier.benefits.encounters == 'infinite'" @click="setAdd(!add)"><i class="fas fa-plus green"></i></a>
					</h2>

					<div class="input-group" v-if="add && (content_count.campaigns < tier.benefits.campaigns || tier.benefits.encounters == 'infinite')">
						<div class="input-group" >
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
						<p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>
					</div>

					<OutOfSlots 
						v-if="tier && content_count.campaigns >= tier.benefits.campaigns"
						type = 'campaigns'
					/>

					<transition-group 
						v-if="campaigns"
						tag="div" 
						class="row mt-3" 
						name="campaigns" 
						enter-active-class="animated flash" 
						leave-active-class="animated bounceOutLeft">
						<b-col lg="4" md="6" v-for="campaign in _campaigns" :key="campaign.key">
							<div class="card" :style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }">
								<div class="card-header">
									<span class="title">
										<i class="fas fa-dungeon"></i>
										{{ campaign.campaign }}
									</span>

									<span class="actions">
										<i 
											v-if="!campaign.private" 
											class="fas fa-eye green"
											v-b-tooltip.hover
											title="Public campaign"
										></i>
										<i 
											v-else class="fas fa-eye-slash red"
											v-b-tooltip.hover
											title="Private campaign"
										></i>

										<router-link class="text-capitalize gray-hover" 
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
									<h4 class="advancement">{{ campaign.advancement ? campaign.advancement : 'experience' }}</h4>
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
													<span :class="{ 'green': true, 'red': Object.keys(allEncounters[campaign.key]).length >= tier.benefits.encounters }">
														{{ Object.keys(allEncounters[campaign.key]).length }}
													</span> 
													/
													<i v-if="tier.benefits.encounters == 'infinite'" class="far fa-infinity"></i>
													<template v-else>{{ tier.benefits.encounters }}</template>
												</template>
												<template v-else> Create</template>
											</router-link>
										</b-col>
									</b-row>
								</div>
									<small class="text-center py-1 bg-gray-active"><span class="gray-hover">Created:</span> {{ makeDate(campaign.timestamp, true) }}</small>
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
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import PlayerLink from '@/components/PlayerLink.vue'
	import { db } from '@/firebase'
	import { general } from '@/mixins/general.js'

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		mixins: [general],
		components: {
			Sidebar,
			Crumble,
			PlayerLink,
			OverEncumbered,
			OutOfSlots,
		},
		data() {
			return {
				newCampaign: '',
				add: false,
			}
		},
		mounted() {
			this.clearEncounters()
		},
		computed: {
			...mapGetters([
				'tier',
				'campaigns',
				'userInfo',
				'allEncounters',
				'players',
				'overencumbered',
				'content_count',
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
			...mapActions([
				'clearEncounters'
			]),
			setAdd(value) {
				this.add = value
			},
			addCampaign() {
				this.$validator.validateAll().then((result) => {
					if (result && (this.content_count.campaigns < this.tier.benefits.campaigns || this.tier.benefits.encounters == 'infinite')) {
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
			background-size: cover;
			background-position: center bottom;

			&.warning {
				.card-header {
					background-color: #cc3e4a;
					color: #fff;
				}
			}
			.card-header {
				background: rgba(38, 38, 38, .9);
				position: relative;

				span.title {
					display: block;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width: calc(100% - 60px);
				}
				.actions {
					position: absolute;
					right: 12px;
					top: 12px;

					a {
						margin-left: 10px;

						&:hover {
							color: #b2b2b2 !important;
						}
					}
				}
			}
			.card-body {
				background: rgba(38, 38, 38, .5);

				.advancement {
					text-transform: capitalize;
					text-align: center;
					font-size: 16px;
					margin-bottom: 20px;
				}
				
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