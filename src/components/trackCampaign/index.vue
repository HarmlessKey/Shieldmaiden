<template>
<div class="track-wrapper" ref="track">
	<template v-if="campaign">
			<template v-if="!campaign.private">
			<!-- NOT LIVE -->
			<template v-if="!encounter || broadcasting['.value'] !== $route.params.campid">
				<div class="top">
					<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
					<span class="title truncate">{{ campaign.campaign }}</span>
					<span>
						<span class="live" :class="{ active: broadcasting['.value'] == $route.params.campid }">live</span>
					</span>
				</div>
				<div class="campaign" :style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }">
					<CampaignOverview :players="players" :campaign-players="campaign.players" :width="width" />
				</div>
			</template>

			<!-- LIVE -->
			<div 
				v-else-if="encounter && broadcasting['.value'] === $route.params.campid" 
				:style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }"
			>
				<Live :encounter="encounter" :campaign="campaign" :players="players" :width="width" />
			</div>
		</template>
		<div v-else>
			<div class="top d-flex justify-content-between">
				<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
				Not found
				<span>
				</span>
			</div>
			<div class="container-fluid">
				<div class="container entities">
					<h2>Perception check failed</h2>
					<p>It seems we rolled a little low, this campaign can't be found.<br/>
						It is possible the campaign is set to private.</p>
				</div>
			</div>
		</div>
	</template>
</div>
</template>

<script>
	import { db } from '@/firebase';

	import Follow from '@/components/trackCampaign/Follow.vue';
	import CampaignOverview from '@/components/trackCampaign/CampaignOverview.vue';
	import ViewPlayers from '@/components/campaign/Players.vue';
	import Live from './live';

	export default {
		name: 'Trackcampaign',
		components: {
			Follow,
			CampaignOverview,
			ViewPlayers,
			Live
		},
		metaInfo: {
			title: 'Harmless Key'
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				userId: this.$route.params.userid,
				encounter: undefined,
				campaign: undefined,
				tier: undefined,
				width: 0
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
				broadcasting: {
					source: db.ref(`broadcast/${this.userId}/live`),
					asObject: true
				},
			}
		},
		beforeMount() {
			this.fetch_encounter()
		},
		mounted() {
			this.$nextTick(function() {
				window.addEventListener('resize', this.setSize);
				//Init
				this.setSize();
			});
		},
		methods: {
			setSize() {
				this.width = this.$refs.track.clientWidth;
			},
			fetch_encounter() {
				var track = db.ref(`broadcast/${this.userId}`);
				track.on('value' , (snapshot) => {
					let campId = this.$route.params.campid

					if(snapshot.val()) {
						let encId = snapshot.val().encounter

						let encounter = db.ref(`encounters/${this.userId}/${campId}/${encId}`)

						encounter.on('value' , (snapshot) => {
							let enc = snapshot.val();
							if(enc) {
								enc.key = encId;
							}
							this.encounter = enc
						});
					}
					//Get campaign for player curHP/tempHP/ACBonus/Dead/Stable/DeathSaves
					let fetchCampaign = db.ref(`campaigns/${this.userId}/${campId}`);

					fetchCampaign.on('value' , (snapshot) => {				
						this.campaign = snapshot.val();
					});
				});
			}
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.setSize);
		},
	}
</script>

<style lang="scss" scoped>
	.track-wrapper {
		height: calc(100vh - 50px);
		background-size: cover;
		background-position: center bottom;
		background-color: #191919;
		width: 100vw;
		position: relative;

		.top {
			grid-area: top;
			background: rgba(38, 38, 38, .9);
			text-transform: uppercase;
			height: 60px;
			line-height: 40px;
			padding: 10px;
			display: grid;
			grid-template-columns: max-content auto max-content;

			.title {
				text-align: center;
				padding: 0 10px;
			}
		}
		.campaign {
			height: calc(100% - 60px);
			background-size: cover;
			background-position: top center;
		}
	}
</style>
