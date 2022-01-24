<template>
	<div v-if="tier">
		<template>
			<hk-card>
				<ContentHeader type="campaigns" @add="add = !add" />

				<div class="card-body" v-if="!loading_campaigns">
					<!-- NO PLAYERS YET -->
					<div class="first-campaign pb-4" v-if="campaign_count && !player_count">
						<h2>Create players for your campaigns</h2>
						<router-link to="/content/players" class="btn btn-lg bg-green btn-block mt-4">Create players</router-link>
					</div>

					<transition-group 
						v-if="campaigns && campaign_count"
						tag="div" 
						class="row q-col-gutter-md" 
						name="campaigns" 
						enter-active-class="animated animate__fadeIn" 
						leave-active-class="animated animate__fadeOut"
					>
						<div class="col-12 col-sm-6 col-md-4" v-for="campaign in campaigns" :key="campaign.key">
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
												'fas fa-eye text-shadow-6 white': !campaign.private,
												'fas fa-eye-slash text-shadow-6 white': campaign.private 
											}"
										>
											<q-tooltip anchor="top middle" self="bottom middle">
												{{ campaign.private ? "Private campaign" : "Public campaign" }}
											</q-tooltip>
										</i>
										<div class="campaign-actions">
											<template v-if="!overencumbered">
												<a class="btn btn-sm btn-clear white" @click="edit_players = { show: true, campaign: campaign }">
													<i class="fas fa-user-plus"></i>
													<q-tooltip anchor="top middle" self="bottom middle">
														Add players
													</q-tooltip>
												</a>
												<a class="btn btn-sm btn-clear white" @click="edit_campaign = { show: true, campaign: campaign }">
													<i class="fas fa-pencil"></i>
													<q-tooltip anchor="top middle" self="bottom middle">
														Edit
													</q-tooltip>
												</a>
											</template>
											<a
												class="btn btn-sm btn-clear white"
												@click="confirmDelete($event, campaign.key, campaign.name)"
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
										class="white text-shadow-3 link" 
										target="_blank" rel="noopener"
										href="https://www.vecteezy.com/free-vector/fantasy-landscape"
									>
										Image by Vecteezy
									</a>
								</div>

								<div class="card-body">
									<div class="neutral-4 mb-2"> 
										{{ campaign.advancement !== "milestone" ? "Experience" : "Milestone" }} advancement
									</div>
									<h3 class="truncate">
										{{ campaign.name }}
									</h3>

									<div class="mb-1">
										<a 
											class="btn btn-clear btn-sm" 
											@click="!overencumbered ? edit_players = { show: true, campaign: campaign } : null"
											:disabled="overencumbered"
										>
											<i class="fas fa-users mr-1 neutral-2" />
											{{ campaign.player_count ? campaign.player_count : "0" }}
											player{{ campaign.player_count === 1 ? "" : "s" }}
										</a>
									</div>
									
									<router-link class="btn btn-clear btn-sm" :to="`${$route.path}/${campaign.key}`">
										<i class="fas fa-swords mr-2 neutral-2" />
											<span 
												:class="{ 
													'green': get_encounter_count(campaign.key), 
													'red': get_encounter_count(campaign.key) > tier.benefits.encounters 
												}"
											>
												{{ get_encounter_count(campaign.key) || 0 }}
											</span>
											encounter{{ get_encounter_count(campaign.key) === 1 ? "" : "s" }}
									</router-link>
									
									<div class="mt-4" v-if="!overencumbered">
										<router-link to="/content/players" v-if="!player_count" class="btn ">
											<i class="fas fa-user"></i> Create players
										</router-link>
										<a 
											v-else-if="!campaign.player_count" class="btn"
											@click="edit_players = { show: true, campaign: campaign }" 
										>
											<i class="fas fa-plus"></i> Add players
										</a>
										<router-link 
											v-else-if="!get_encounter_count(campaign.key)" class="btn"
											:to="`${$route.path}/${campaign.key}`" 
										>
											<i class="fas fa-swords"></i> Add encounters
										</router-link>
										<router-link :to="`${$route.path}/${campaign.key}`" v-else class="btn bg-green">
											Continue
										</router-link>
									</div>
									<div v-else class="mt-4">
										<router-link 
											v-if="get_encounter_count(campaign.key) > tier.benefits.encounters"
											:to="`${$route.path}/${campaign.key}`" class="btn bg-red"
										>
											Too many encounters
										</router-link>
										<router-link :to="`${$route.path}/${campaign.key}`" class="btn bg-neutral-5">
											View campaign
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
							
							<q-btn class="btn btn-lg bg-green btn-block mt-4" padding="xs" no-caps type="submit" label="Create campaign" />
						</q-form>
					</div>
				</div>
				<hk-loader v-else name="campaigns" />
			</hk-card>

		</template>
		<div v-if="campaigns === undefined" class="loader"><span>Loading Campaigns...</span></div>
			
		<!-- New campaign dialog -->
		<q-dialog 
			v-if="(campaign_count < tier.benefits.campaigns || tier.benefits.encounters == 'infinite')"
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
							<q-btn v-close-popup no-caps label="Cancel" class="mr-1" />
							<q-btn type="submit" no-caps color="primary" label="Add campaign" />
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>

		<!-- Edit campaign dialog -->
		<q-dialog v-if="!overencumbered" v-model="edit_campaign.show">
			<EditCampaign :campaign="edit_campaign.campaign" @close="edit_campaign.show = false" />
		</q-dialog>

		<!-- Edit campaign dialog -->
		<q-dialog v-if="!overencumbered" v-model="edit_players.show">
			<AddPlayers :campaign="edit_players.campaign" />
		</q-dialog>
	</div>
</template>

<script>	
	import { mapGetters, mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';
	import EditCampaign from "./EditCampaign";
	import AddPlayers from "./AddPlayers";
	import ContentHeader from "@/components/userContent/ContentHeader";

	export default {
		name: 'Campaigns',
		metaInfo: {
			title: 'Campaigns'
		},
		mixins: [general],
		components: {
			EditCampaign,
			AddPlayers,
			ContentHeader
		},
		data() {
			return {
				loading_campaigns: true,
				newCampaign: '',
				add: false,
				edit_players: {
					show: false,
					campaign: undefined
				},
				edit_campaign: {
					show: false,
					campaign: undefined
				},
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
		async mounted() {
			await this.get_campaigns();
			this.loading_campaigns = false;
		},
		computed: {
			...mapGetters([
				'user',
				'tier',
				'userInfo',
				'overencumbered'
			]),
			...mapGetters("players", ["player_count"]),
			...mapGetters("campaigns", ["campaign_count", "campaigns"]),
			...mapGetters("encounters", ["get_encounter_count"])
		},
		methods: {
			...mapActions("campaigns", ["get_campaigns", "add_campaign", "delete_campaign"]),
			async addCampaign() {
				if ((this.campaign_count < this.tier.benefits.campaigns || this.tier.benefits.encounters == 'infinite')) {
					const campaign = {
						name: this.newCampaign,
						advancement: this.advancement,
						timestamp: Date.now(),
					};

					await this.add_campaign(campaign);

					this.newCampaign = '';
					this.$snotify.success('Campaign added.', 'Critical hit!', {
						position: "rightTop"
					});
					this.add = false;
				}
			},
			confirmDelete(e, key, name) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.delete_campaign(key);
				} else {
					this.$snotify.error('Are you sure you want to delete the campaign "' + name + '"?', 'Delete campaign', {
						buttons: [
							{ text: 'Yes', action: (toast) => { this.delete_campaign(key); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
				}
			}
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
	
			.campaign-actions {
				.btn {
					text-shadow: 0 0 6px $black;
					margin-left: 2px;

					&:hover {
						text-shadow: none;
					}
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
				border: dashed 1px $neutral-4 !important;
				background: none !important;
	
				.card-body {
					text-align: center;
					background: none;
				}
			}
		}
	}

	
</style>