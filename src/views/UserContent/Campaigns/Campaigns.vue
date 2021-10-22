<template>
	<div v-if="tier">
		<template v-if="players">
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

				<div class="card-body">
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
						class="row q-col-gutter-md" 
						name="campaigns" 
						enter-active-class="animated animate__fadeIn" 
						leave-active-class="animated animate__fadeOut">
						<div class="col-12 col-sm-6 col-md-4" v-for="campaign in _campaigns" :key="campaign.key">
							<hk-card>
								<!-- Image -->
								<div 
									slot="image" 
									class="card-image" 
									:style="[
										campaign.background
										? { backgroundImage: 'url(\'' +campaign.background + '\')' }
										: { backgroundImage: `url(${require('@/assets/_img/atmosphere/campaign-background.webp')})` }
									]">
									<div class="d-flex justify-content-between">
										<i 
											class="px-1 py-2"
											:class="{
												'fas fa-eye text-shadow-6 neutral-2': !campaign.private,
												'fas fa-eye-slash text-shadow-6 neutral-2': campaign.private 
											}"
										>
											<q-tooltip anchor="top middle" self="bottom middle">
												{{ campaign.private ? "Private campaign" : "Public campaign" }}
											</q-tooltip>
										</i>
										<div class="d-flex justify-content-end">
											<router-link class="btn btn-sm btn-clear mx-1" :to="`${$route.path}/${campaign.key}`">
												<i class="fas fa-pencil"></i>
												<q-tooltip anchor="top middle" self="bottom middle">
													Edit
												</q-tooltip>
											</router-link>
											<a
												class="btn btn-sm btn-clear"
												@click="confirmDelete($event, campaign.key, campaign.campaign)"
											>
												<i class="fas fa-trash-alt"></i>
												<q-tooltip anchor="top middle" self="bottom middle">
													Delete
												</q-tooltip>
											</a>
										</div>
									</div>
									<a 
										v-if="!campaign.background" 
										class="neutral-2 text-shadow-3 link" 
										target="_blank" rel="noopener"
										href="https://www.vecteezy.com/free-vector/fantasy-landscape">
										Image by Vecteezy
									</a>
								</div>

								<div class="card-body">
									<div class="neutral-4 mb-2"> 
										{{ campaign.advancement !== "milestone" ? "Experience" : "Milestone" }} advancement
									</div>
									<h3 class="truncate">
										{{ campaign.campaign }}
									</h3>

									<div class="mb-1">
										<router-link class="btn btn-clear btn-sm" :to="'/campaigns/' + campaign.key">
											<i class="fas fa-users mr-1 neutral-2"></i>
											{{ campaign.players ? Object.keys(campaign.players).length : "0" }}
											players
										</router-link>
									</div>
									
									<router-link class="btn btn-clear btn-sm" :to="'/encounters/' + campaign.key">
										<i class="fas fa-swords mr-2 neutral-2"></i>
										<template v-if="allEncounters && allEncounters[campaign.key]">
											<span :class="{ 'green': true, 'red': Object.keys(allEncounters[campaign.key]).length >= tier.benefits.encounters }">
												{{ Object.keys(allEncounters[campaign.key]).length }}
											</span>
										</template>
										<span v-else> 0</span> encounters
									</router-link>
									
									<div class="mt-4">
										<router-link to="/content/players" v-if="Object.keys(players).length === 0" class="btn bg-green ">
											<i class="fas fa-user"></i> Create players
										</router-link>
										<router-link :to="'/content/campaigns/' + campaign.key" v-else-if="!campaign.players" class="btn bg-green">
											<i class="fas fa-plus"></i> Add players
										</router-link>
										<router-link :to="'/encounters/' + campaign.key" v-else-if="!allEncounters || !allEncounters[campaign.key]" class="btn bg-green">
											<i class="fas fa-swords"></i> Add encounters
										</router-link>
										<router-link :to="'/encounters/' + campaign.key" v-else class="btn">
											Continue
										</router-link>
									</div>
								</div>
								<div slot="footer" class="card-footer">
									<small class="text-center neutral-3"><span class="">Created:</span> {{ makeDate(campaign.timestamp, true) }}</small>
								</div>
							</hk-card>
						</div>
					</transition-group>

					<!-- CREATE FIRST CAMPAIGN -->
					<div class="first-campaign" v-else>
						<q-form @submit="addCampaign">
							<h2 class="mt-0">Create your first campaign</h2>
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								type="text" 
								autocomplete="off"
								v-model="newCampaign" 
								name="firstCampaign"
								label="Title of your first campaign"
								:rules="[ val => val && val.length > 0 || 'Enter a title for your campaign']"
							/>
							<q-select 
								:dark="$store.getters.theme === 'dark'" filled square
								map-options
								emit-value
								label="Advancement"
								class="mt-2" 
								v-model="advancement" 
								:options="advancement_options"
							/>
							
							<q-btn class="btn btn-lg bg-green btn-block mt-4" type="submit" label="Create campaign" />
						</q-form>
					</div>
				</div>
			</hk-card>

		</template>
		<div v-if="campaigns === undefined" class="loader"><span>Loading Campaigns...</span></div>
			
		<!-- New campaign dialog -->
		<q-dialog 
			v-if="(content_count.campaigns < tier.benefits.campaigns || tier.benefits.encounters == 'infinite')"
			square
			v-model="add"
		>
			<div>
				<q-form @submit="addCampaign">
					<hk-card header="New campaign" class="mb-0">
						<div class="card-body">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								type="text" 
								autocomplete="off"
								v-model="newCampaign" 
								name="newCampaign"
								label="Title"
								:rules="[ val => val && val.length > 0 || 'Enter a title']"
							/>
							<q-select
								:dark="$store.getters.theme === 'dark'" filled square
								emit-value
								map-options
								label="Advancement"
								class="mt-2" 
								v-model="advancement" 
								:options="advancement_options"
							/>
						</div>

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
	
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		mixins: [general],
		components: {
			OutOfSlots
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
				return this.tier ? this.tier.benefits.campaigns - Object.keys(this.campaigns).length : 0;
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
				background: $neutral-7;
	
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
						color:$neutral-1 !important;
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
				padding: 3px 0 !important;
				text-align: center;
				
				small {
					display: inline-block;
					width: 100%;
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