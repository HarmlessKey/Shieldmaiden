<template>
	<div class="content">
		<Crumble />
		
		<OverEncumbered v-if="overencumbered" />
		
		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-9">
				<template v-if="players && tier">
					<hk-card>
						<div slot="header" class="card-header">
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
							<a 
								v-if="content_count.campaigns < tier.benefits.campaigns || tier.benefits.encounters == 'infinite'" 
								@click="add = !add"
								class="btn btn-sm"
							>
								<i class="fas fa-plus green mr-1"></i> New campaign
							</a>
						</div>


						<OutOfSlots 
							v-if="tier && content_count.campaigns >= tier.benefits.campaigns"
							type = 'campaigns'
						/>

						<!-- NO PLAYERS YET -->
						<div class="first-campaign pb-4" v-if="Object.keys(players).length === 0 && (campaigns && Object.keys(campaigns).length > 0)">
							<h2>Create players for your campaign</h2>
							<router-link to="/players" class="btn btn-lg bg-green btn-block mt-4">Create players</router-link>
						</div>

						<transition-group 
							v-if="campaigns && Object.keys(campaigns).length > 0"
							tag="div" 
							class="row q-col-gutter-md mt-3" 
							name="campaigns" 
							enter-active-class="animated animate__fadeIn" 
							leave-active-class="animated animate__fadeOut">
							<div class="col-12 col-md-6" v-for="campaign in _campaigns" :key="campaign.key">
								<hk-card 
									no-padding-footer
									:style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }"
								>
									<div slot="header" class="card-header">
										<span class="title">
											<i 
												class="mr-1"
												:class="{
													'fas fa-eye green': !campaign.private,
													'fas fa-eye-slash red': campaign.private 
												}"
											>
												<q-tooltip anchor="top middle" self="bottom middle">
													{{ campaign.private ? "Private campaign" : "Public campaign" }}
												</q-tooltip>
											</i>
											{{ campaign.campaign }}
										</span>

										<span class="actions">
											<router-link class="btn btn-sm mx-1" :to="'/campaigns/' + campaign.key">
												<i class="fas fa-pencil"></i>
												<q-tooltip anchor="top middle" self="bottom middle">
													Edit
												</q-tooltip>
											</router-link>
											<a
												class="btn btn-sm"
												@click="confirmDelete($event, campaign.key, campaign.campaign)"
											>
												<i class="fas fa-trash-alt"></i>
												<q-tooltip anchor="top middle" self="bottom middle">
													Delete
												</q-tooltip>
											</a>
										</span>
									</div>
									<div v-if="campaign.advancement != 'milestone'" class="advancement">Experience</div>
									<div v-else class="advancement">Milestone</div>
									<div class="row q-col-gutter-md">
										<div class="col">
											<router-link :to="'/campaigns/' + campaign.key">
												<i class="fas fa-users"></i><br/>
												<template v-if="campaign.players"> {{ Object.keys(campaign.players).length }}</template>
												<template v-else> Add</template>
												<q-tooltip anchor="top middle" self="center middle">
													Players
												</q-tooltip>
											</router-link>
										</div>

										<div class="col">
											<router-link :to="'/encounters/' + campaign.key">
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
												<q-tooltip anchor="top middle" self="center middle">
													Encounters
												</q-tooltip>
											</router-link>
										</div>
									</div>
									<div slot="footer" class="card-footer">
										<small class="date py-1 bg-gray-active"><span class="gray-hover">Created:</span> {{ makeDate(campaign.timestamp, true) }}</small>
										<router-link to="/players" v-if="Object.keys(players).length === 0" class="btn btn-block bg-green btn-square">Create players</router-link>
										<router-link :to="'/campaigns/' + campaign.key" v-else-if="!campaign.players" class="btn btn-block bg-green btn-square"><i class="fas fa-plus"></i> Add players</router-link>
										<router-link :to="'/encounters/' + campaign.key" v-else-if="!allEncounters || !allEncounters[campaign.key]" class="btn btn-block bg-green btn-square"><i class="fas fa-plus"></i> Create encounters</router-link>
										<router-link :to="'/encounters/' + campaign.key" v-else class="btn btn-block btn-square">Play <i class="fas fa-play"></i></router-link>
									</div>
								</hk-card>
							</div>
						</transition-group>

						<!-- CREATE FIRST CAMPAIGN -->
						<div class="first-campaign" v-else>
							<q-form @submit="addCampaign">
								<hk-card header="First campaign">
									<h2 class="mt-0">Create your first campaign</h2>
									<q-input 
										dark filled square
										type="text" 
										autocomplete="off"
										v-model="newCampaign" 
										name="firstCampaign"
										label="Title of your first campaign"
										:rules="[ val => val && val.length > 0 || 'Enter a title for your campaign']"
									/>
									<q-select 
										dark filled square
										map-options
										emit-value
										label="Advancement"
										class="mt-2" 
										v-model="advancement" 
										:options="advancement_options"
									/>
									
									<q-btn class="btn btn-lg bg-green btn-block mt-4" type="submit" label="Create campaign" />
								</hk-card>
							</q-form>
						</div>
					</hk-card>

				</template>
				<div v-if="campaigns === undefined" class="loader"><span>Loading Campaigns...</span></div>
			</div>
			<div class="col-12 col-md-3">
				<ContentSideRight page="campaigns" />
			</div>
		</div>

		<!-- New campaign dialog -->
		<q-dialog 
			v-if="(content_count.campaigns < tier.benefits.campaigns || tier.benefits.encounters == 'infinite')"
			square
			v-model="add"
		>
			<div>
				<q-form @submit="addCampaign">
					<hk-card header="New campaign" class="mb-0">
						<q-input 
							dark filled square
							type="text" 
							autocomplete="off"
							v-model="newCampaign" 
							name="newCampaign"
							label="Title"
							:rules="[ val => val && val.length > 0 || 'Enter a title']"
						/>
						<q-select
							dark filled square
							emit-value
							map-options
							label="Advancement"
							class="mt-2" 
							v-model="advancement" 
							:options="advancement_options"
						/>

						<div slot="footer" class="card-footer d-flex justify-end">
							<q-btn v-close-popup label="Cancel" class="mr-1" />
							<q-btn type="submit" color="primary" label="Add campaign" />
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import _ from 'lodash'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import Crumble from '@/components/crumble/MyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import PlayerLink from '@/components/PlayerLink.vue'
	import { db } from '@/firebase'
	import { general } from '@/mixins/general.js'
	import ContentSideRight from "@/components/ContentSideRight";

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		mixins: [general],
		components: {
			Crumble,
			PlayerLink,
			OverEncumbered,
			OutOfSlots,
			ContentSideRight
		},
		data() {
			return {
				newCampaign: '',
				add: false,
				advancement: "experience",
				advancement_options: [
					{
						value: "experience",
						label: "Experience"
					},
					{
						value: "milestone",
						label: "Milestone"
					}
				]
			}
		},
		mounted() {
			this.clearEncounters()
			this.assignPlayers()
		},
		computed: {
			...mapGetters([
				'user',
				'tier',
				'campaigns',
				'userInfo',
				'allEncounters',
				'players',
				'overencumbered',
				'content_count',
				'active_campaign'
			]),
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
			slotsLeft() {
				return this.tier.benefits.campaigns - Object.keys(this.campaigns).length
			}
		},
		methods: {
			...mapActions([
				'clearEncounters',
				'deleteCampaign',
			]),
			addCampaign() {
				if ((this.content_count.campaigns < this.tier.benefits.campaigns || this.tier.benefits.encounters == 'infinite')) {
					db.ref('campaigns/' + this.user.uid).push({
						campaign: this.newCampaign,
						advancement: this.advancement,
						timestamp: Date.now(),
					});
					this.newCampaign = '';
					this.$snotify.success('Campaign added.', 'Critical hit!', {
						position: "rightTop"
					});
					this.$validator.reset();
					this.add = false;
				}
			},
			confirmDelete(e, key, name) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteCampaign({campaign_id: key });
				} else {
					this.$snotify.error('Are you sure you want to delete the campaign "' + name + '"?', 'Delete campaign', {
						buttons: [
							{ text: 'Yes', action: (toast) => { this.deleteCampaign({campaign_id: key }); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
				}
			},
			assignPlayers() {
				for (let campaignId in this.campaigns) {
					for (let playerId in this.campaigns[campaignId].players) {
						if (Object.keys(this.players[playerId]).indexOf('campaign_id') < 0) {
							// Player not yet assigned to campaign
							db.ref(`players/${this.user.uid}/${playerId}`).update({campaign_id: campaignId});
						} else if (this.players[playerId].campaign_id !== campaignId) {
							// Player in both this campaign as other campaign
							this.$snotify.error('You have players that are used in multiple campaigns. Please make sure a player is used only once.', {
								buttons: [
									{ text: 'Ok', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
								]
							});
						}
					}
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.first-campaign {
		h2 {
			margin-top: 50px;
			text-transform: none;
			text-align: center;
			font-size: 30px;
		}
	} 
	.hk-card {
		
		.hk-card {
			background-size: cover;
			background-position: center bottom;
	
			&.warning {
				.card-header {
					background-color: $red;
					color: $white;
				}
			}
			.card-header {
				background: rgba(38, 38, 38, .9) !important;
	
				span.title {
					display: block;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width: calc(100% - 60px);
					font-size: 18px;
				}
				.actions {
					display: flex;
					justify-content: flex-end;
				}
			}
			.card-body {
				background: rgba(38, 38, 38, .5);
	
				.advancement {
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
						color:$white !important;
						text-shadow: 5px 5px 5pxrgba(0, 0, 0, .5);
	
						&:hover {
							text-decoration: none;
							color: $blue !important;
						}
					}
					svg {
						font-size: 50px;
					}
				}
			}
			.card-footer {
				padding: 0 !important;
				
				.date {
					width: 100%;
					text-align: center;
					display: block;
				}
			}
			&.openSlot {
				height: 263px;
				border: dashed 1px $gray-light !important;
				background: none !important;
	
				.card-body {
					text-align: center;
					background: none;
				}
			}
		}
	}

	
</style>