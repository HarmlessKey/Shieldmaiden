<template>
	<div v-if="tier">
		<Tutorial v-if="show_tutorial" />
		<hk-card>
			<ContentHeader type="campaigns" @add="add = !add" />

			<div class="card-body" v-if="!loading_campaigns">
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
								:style="{ backgroundImage: 'url(\'' + getBackground(campaign) + '\'' }"
							>
								<div class="d-flex justify-content-between">
									<i
										aria-hidden="true"
										class="px-1 py-2"
										:class="{
											'fas fa-eye text-shadow-6 white': !campaign.private,
											'fas fa-eye-slash text-shadow-6 white': campaign.private,
										}"
									>
										<q-tooltip anchor="top middle" self="bottom middle">
											{{ campaign.private ? "Private campaign" : "Public campaign" }}
										</q-tooltip>
									</i>
									<div class="campaign-actions">
										<template v-if="!overencumbered">
											<a
												class="btn btn-sm btn-clear white"
												@click="edit_players = { show: true, campaign: campaign }"
											>
												<i aria-hidden="true" class="fas fa-user-plus"></i>
												<q-tooltip anchor="top middle" self="bottom middle">
													Add players
												</q-tooltip>
											</a>
											<a
												class="btn btn-sm btn-clear white"
												@click="edit_campaign = { show: true, campaign: campaign }"
											>
												<i aria-hidden="true" class="fas fa-pencil"></i>
												<q-tooltip anchor="top middle" self="bottom middle"> Edit </q-tooltip>
											</a>
										</template>
										<ExportUserContent
											class="btn-sm btn-clear white"
											content-type="campaign"
											:content-id="campaign.key"
										/>
										<a
											class="btn btn-sm btn-clear white"
											@click="confirmDelete($event, campaign.key, campaign.name)"
										>
											<i aria-hidden="true" class="fas fa-trash-alt"></i>
											<q-tooltip anchor="top middle" self="bottom middle"> Delete </q-tooltip>
										</a>
									</div>
								</div>
							</div>

							<div class="card-body">
								<div class="neutral-4 mb-2">
									{{ campaign.advancement !== "milestone" ? "Experience" : "Milestone" }}
									advancement
								</div>
								<router-link class="campaign-name" :to="`${$route.path}/${campaign.key}`">
									<h3 class="truncate">
										{{ campaign.name }}
									</h3>
								</router-link>

								<div class="mb-1">
									<a
										class="btn btn-clear btn-sm"
										@click="
											!overencumbered ? (edit_players = { show: true, campaign: campaign }) : null
										"
										:disabled="overencumbered"
									>
										<i aria-hidden="true" class="fas fa-users mr-1 neutral-2" />
										{{ campaign.player_count ? campaign.player_count : "0" }}
										player{{ campaign.player_count === 1 ? "" : "s" }}
									</a>
								</div>

								<router-link class="btn btn-clear btn-sm" :to="`${$route.path}/${campaign.key}`">
									<i aria-hidden="true" class="fas fa-swords mr-2 neutral-2" />
									<span
										:class="{
											green: get_encounter_count(campaign.key),
											red: get_encounter_count(campaign.key) > tier.benefits.encounters,
										}"
									>
										{{ get_encounter_count(campaign.key) || 0 }}
									</span>
									encounter{{ get_encounter_count(campaign.key) === 1 ? "" : "s" }}
								</router-link>

								<div class="mt-4" v-if="!overencumbered">
									<router-link to="/content/players" v-if="!content_count.players" class="btn">
										<i aria-hidden="true" class="fas fa-user"></i> Create players
									</router-link>
									<template v-else-if="!campaign.player_count">
										<a class="btn" @click="edit_players = { show: true, campaign: campaign }">
											<i aria-hidden="true" class="fas fa-plus"></i> Add players
										</a>
									</template>
									<router-link
										v-else-if="!get_encounter_count(campaign.key)"
										class="btn"
										:to="`${$route.path}/${campaign.key}`"
									>
										<i aria-hidden="true" class="fas fa-swords"></i> Add encounters
									</router-link>
									<router-link :to="`${$route.path}/${campaign.key}`" v-else class="btn bg-green">
										Continue
									</router-link>
								</div>
								<div v-else class="mt-4">
									<router-link
										v-if="get_encounter_count(campaign.key) > tier.benefits.encounters"
										:to="`${$route.path}/${campaign.key}`"
										class="btn bg-red"
									>
										Too many encounters
									</router-link>
									<router-link :to="`${$route.path}/${campaign.key}`" class="btn bg-neutral-5">
										View campaign
									</router-link>
								</div>
							</div>
							<div slot="footer" class="card-footer">
								<small class="text-center neutral-3"
									><span class="">Created:</span> {{ makeDate(campaign.timestamp, true) }}</small
								>
							</div>
						</hk-card>
					</div>
				</transition-group>

				<!-- CREATE FIRST CAMPAIGN -->
				<div class="first-campaign" v-else>
					<q-form @submit="addCampaign">
						<h2 class="mt-0">Create your first campaign</h2>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							type="text"
							autocomplete="off"
							v-model="newCampaign"
							name="firstCampaign"
							label="Title of your first campaign"
							:rules="[(val) => (val && val.length > 0) || 'Enter a title for your campaign']"
						/>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							map-options
							emit-value
							label="Advancement"
							class="mt-2"
							v-model="advancement"
							:options="advancement_options"
						/>

						<q-btn
							class="btn btn-lg bg-green btn-block mt-4"
							padding="xs"
							no-caps
							type="submit"
							label="Create campaign"
						/>
					</q-form>
				</div>
			</div>
			<hk-loader v-else name="campaigns" />
		</hk-card>

		<div v-if="campaigns === undefined" class="loader"><span>Loading Campaigns...</span></div>

		<!-- New campaign dialog -->
		<q-dialog
			v-if="campaign_count < tier.benefits.campaigns || tier.benefits.encounters == 'infinite'"
			square
			v-model="add"
		>
			<div>
				<q-form @submit="addCampaign">
					<hk-card header="New campaign" class="mb-0">
						<div class="card-body">
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								type="text"
								autocomplete="off"
								v-model="newCampaign"
								name="newCampaign"
								label="Title"
								:rules="[(val) => (val && val.length > 0) || 'Enter a title']"
							/>
							<q-select
								:dark="$store.getters.theme === 'dark'"
								filled
								square
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
import { mapGetters, mapActions } from "vuex";
import { general } from "src/mixins/general.js";
import EditCampaign from "./EditCampaign";
import AddPlayers from "src/components/campaign/AddPlayers";
import ContentHeader from "src/components/userContent/ContentHeader";
import Tutorial from "src/components/userContent/Tutorial";
import ExportUserContent from "src/components/userContent/ExportUserContent";

export default {
	name: "Campaigns",
	mixins: [general],
	components: {
		EditCampaign,
		AddPlayers,
		ContentHeader,
		Tutorial,
		ExportUserContent,
	},
	data() {
		return {
			loading_campaigns: true,
			newCampaign: "",
			add: false,
			edit_players: {
				show: false,
				campaign: undefined,
			},
			edit_campaign: {
				show: false,
				campaign: undefined,
			},
			advancement: "experience",
			advancement_options: [
				{
					value: "experience",
					label: "Experience",
				},
				{
					value: "milestone",
					label: "Milestone",
				},
			],
		};
	},
	async mounted() {
		await this.get_campaigns();
		this.loading_campaigns = false;
	},
	computed: {
		...mapGetters(["user", "tier", "userInfo", "overencumbered", "content_count"]),
		...mapGetters("campaigns", ["campaign_count", "campaigns"]),
		...mapGetters("encounters", ["get_encounter_count"]),
		show_tutorial() {
			return (
				!this.content_count.campaigns ||
				!this.content_count.players ||
				!this.content_count.encounters
			);
		},
	},
	methods: {
		...mapActions("campaigns", ["get_campaigns", "add_campaign", "delete_campaign"]),
		async addCampaign() {
			if (
				this.campaign_count < this.tier.benefits.campaigns ||
				this.tier.benefits.encounters == "infinite"
			) {
				const campaign = {
					name: this.newCampaign,
					advancement: this.advancement,
					timestamp: Date.now(),
				};

				await this.add_campaign({ campaign });

				this.newCampaign = "";
				this.$snotify.success("Campaign added.", "Critical hit!", {
					position: "rightTop",
				});
				this.add = false;
			}
		},
		confirmDelete(e, key, name) {
			//Instantly delete when shift is held
			if (e.shiftKey) {
				this.delete_campaign(key);
			} else {
				this.$snotify.error(
					'Are you sure you want to delete the campaign "' + name + '"?',
					"Delete campaign",
					{
						buttons: [
							{
								text: "Yes",
								action: (toast) => {
									this.delete_campaign(key);
									this.$snotify.remove(toast.id);
								},
								bold: false,
							},
							{
								text: "No",
								action: (toast) => {
									this.$snotify.remove(toast.id);
								},
								bold: true,
							},
						],
					}
				);
			}
		},
		getBackground(campaign) {
			if (campaign.background) return campaign.background;
			if (campaign.hk_background)
				return require(`src/assets/_img/atmosphere/medium/${campaign.hk_background}-medium.jpg`);
			return require("src/assets/_img/atmosphere/medium/campaign-background-medium.jpg");
		},
		// async downloadCampaign(campaignId) {
		// 	const exporter = new ExportUserContent();
		// 	await exporter.addCampaignByIds([campaignId]);
		// 	console.log(exporter.exportData);
		// },
	},
};
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
			a.campaign-name {
				color: $neutral-1;
				&:hover {
					color: $blue;
				}
			}
			.col {
				text-align: center;
				font-size: 25px;

				a {
					width: 100%;
					display: block;
					color: $neutral-1 !important;
					text-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);

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
