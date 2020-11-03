<template>
<div v-if="campaign">
	<template v-if="!campaign.private">
		<!-- NOT LIVE -->
		<div class="track-wrapper" 
			:style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }" 
			v-if="!encounter || broadcasting['.value'] != $route.params.campid
		">
			<div class="turns">
				<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
				<span class="title truncate">{{ campaign.campaign }}</span>
				<span>
					<span class="live" :class="{ active: broadcasting['.value'] == $route.params.campid }">live</span>
				</span>
			</div>
			<CampaignOverview :players="players" :campaign-players="campaign.players" />
		</div>

		<!-- LIVE -->
		<div 
			v-else-if="encounter && broadcasting['.value'] === $route.params.campid" 
			:style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }"
		>
			<Live :encounter="encounter" :campaign="campaign" :players="players" />
		</div>
	</template>
	<div class="track-wrapper" v-else>
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
</div>
</template>

<script>
	import { db } from '@/firebase';

	import Follow from '@/components/trackCampaign/Follow.vue';
	import Rewards from '@/components/trackCampaign/live/Rewards.vue';
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
				tier: undefined
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
		methods: {
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
	}
</style>
