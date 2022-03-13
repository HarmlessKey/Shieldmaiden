<template>
<div v-if="!loadingCampaigns">
	<div class="content" v-if="!$route.params.campid">
		<div class="top">
			<span>
				<Follow v-if="user"/>
				{{ username['.value'] }}
			</span>
		</div>
		<div class="row q-col-gutter-md">		
			<div class="col-12 col-md-9">		
				<hk-card>
					<div slot="header" class="card-header">
						<span>
							<i aria-hidden="true" class="fas fa-dungeon mr-1" />
							Campaigns
						</span>
					</div>
					<div class="card-body">
						<!-- CAMPAIGNS -->
						<div v-if="campaigns" class="row q-col-gutter-md">
							<div class="col-12 col-md-6 col-lg-4" v-for="campaign in campaigns" :key="campaign['.key']">
								<hk-card class="campaign">
									<div 
										slot="image" 
										class="card-image" 
										:style="[
											campaign.background
											? { backgroundImage: 'url(\'' +campaign.background + '\')' }
											: { backgroundImage: `url(${require('src/assets/_img/atmosphere/campaign-background.webp')})` }
										]">
										<span class="live active" v-if="live['.value'] == campaign['.key']">live</span>
										<a 
											v-if="!campaign.background" 
											class="neutral-2 text-shadow-3 link" 
											target="_blank" rel="noopener"
											href="https://www.vecteezy.com/free-vector/fantasy-landscape">
											Image by Vecteezy
										</a>
									</div>

									<div class="card-body">
										
										<!-- SHOW PLAYERS -->
										<div v-if="campaign.players" class="players">
											<div 
												v-for="(player, key) in campaign.players" 
												:key="key"
												class="img"
											>
												<div v-if="player.avatar" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></div>
												<i aria-hidden="true" v-else class="hki-player" />
												<q-tooltip anchor="top middle" self="center middle">
													{{ player.character_name }}
												</q-tooltip>
											</div>
										</div>
										
										<h2 class="truncate" :class="{ 'no-players': !campaign.players }">		
											{{ campaign.name }}
										</h2>
										<div class="d-flex justify-content-center">
											<router-link :to="`/user/${dmId}/${campaign['.key']}`" class="btn">View Campaign</router-link>
										</div>						
									</div>
			
									<div slot="footer" class="card-footer neutral-3">
										Started: {{ makeDate(campaign.timestamp) }}
									</div>
								</hk-card>
							</div>
						</div>
						<div v-else>
							<p>This user has no public campaigns.</p>
						</div>
					</div>
				</hk-card>
			</div>
			<div class="col-12 col-md-3">
				<ContentSideRight />
			</div>
    </div>
	</div>

	<trackCampaign v-else />

</div>
</template>

<script>
	import { db } from "src/firebase"
	import trackCampaign from "src/components/trackCampaign"
	import { general } from "src/mixins/general.js"
	import ContentSideRight from "src/components/ContentSideRight";

	import Follow from "src/components/trackCampaign/Follow.vue"

	export default {
		name: "TrackUser",
		components: {
			trackCampaign,
			Follow,
			ContentSideRight
		},
		mixins: [general],
		data() {
			return {
				user: this.$store.getters ? this.$store.getters.user : undefined,
				dmId: this.$route.params.userid,
				campaigns: undefined,
				loadingCampaigns: true
			}
		},
		firebase() {
			return {
				username: {
					source: db.ref(`users/${this.dmId}/username`),
					asObject: true,
				},
				live: {
					source: db.ref(`broadcast/${this.dmId}/live`),
					asObject: true,
				}
			}
		},
		mounted() {
			var campaigns_ref = db.ref(`campaigns/${this.dmId}`).orderByChild('private').equalTo(null);
			campaigns_ref.on('value', async (snapshot) => {
				let campaigns = snapshot.val();
				
				//Get Players
				for(let key in snapshot.val()) {
					campaigns[key]['.key'] = key;

					for(let playerKey in campaigns[key].players) {
						let getPlayer = db.ref(`players/${this.dmId}/${playerKey}`);
						await getPlayer.on('value', (result) => {
							campaigns[key].players[playerKey] = result.val()
						});
					}
				}
				this.campaigns = campaigns;
				this.loadingCampaigns = false;
			});
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		background-color: $neutral-8;
		border-radius: $border-radius;
		padding: 15px;
		border: solid 1px $neutral-5;
		margin-bottom: 15px;
		align-items: center;
	}
	.hk-card.campaign {
		.card-image {
			display: flex;
			justify-content: flex-end;

			.live {
				border: solid 1px $neutral-3;
				line-height: 14px;
			}
			.link {
				top: 8px;

			}
		}
		.card-body {
			border-top: solid 1px $neutral-5;
			background-color: $neutral-8;

			h2 {
				text-align: center;
				margin-bottom: 20px;

				&.no-players {
					margin-top: 20px;
				}
			}
			.players {
				margin-top: -40px;
				margin-bottom: 10px;
				display: flex;
				justify-content: center;
				flex-wrap: nowrap;
				z-index: 1;
				position: relative;

				.img {
					background: $neutral-9;
					color: $neutral-2;
					height: 40px;
					width: 40px;
					line-height: 40px;
					border: solid 1px $neutral-1;
					margin: 0 10px 10px 0;
					box-sizing: border;
					border-radius: $border-radius-small;
					font-size: 28px;
					text-align: center;

					div {
						width: 100%;
						height: 100%;
						background-size: cover;
						background-position: top center;
						display: block;
					}

					&:last-child {
						margin-right: 0;
					}
				}
			}
		}
		.card-footer {
			display: block;
			padding: 3px 0;
			font-size: 12px;
			text-align: center;
		}
	}
	[data-theme="light"] {
		.hk-card.campaign .card-body .players .img {
			color: $neutral-8;
			background: $neutral-1;
		}
	}
</style>
