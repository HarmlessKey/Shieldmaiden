<template>
<div>
	<div class="top d-flex justify-content-between" v-if="!$route.params.campid">
		<span><i class="fas fa-user"></i> {{ username['.value'] }}</span>
		<Follow />
	</div>
	<div class="container-fluid" v-if="!$route.params.campid">
	
		<h2>Campaigns</h2>
		<!-- CAMPAIGNS -->
		<b-row v-if="campaigns" class="mt-3">
			<b-col lg="4" md="6" v-for="campaign in campaigns" :key="campaign['.key']">
				<router-link :to="`/user/${userId}/${campaign['.key']}`" class="card">
					<div class="card-header">
						<span>
							<i class="fas fa-dungeon"></i>
							{{ campaign.campaign }}
						</span>
						<span class="live active" v-if="live['.value'] == campaign['.key']">live</span>
					</div>
					<div class="card-body" :style="{ backgroundImage: 'url(\'' + campaign.background + '\')' }">
						
					</div>
						<small class="text-center py-1 bg-gray-active"><span class="gray-hover">Created:</span> {{ makeDate(campaign.timestamp) }}</small>
				</router-link>
			</b-col>
		</b-row>
	</div>

	<trackCampaign v-else />


	<!-- ADS -->
	<div class="d-flex justify-content-center">
		<ins class="adsbygoogle bg-gray-dark"
					v-if="tier && !tier.benefits.ads"
					style="display:inline-block;width:100%;height:100px"
					data-ad-client="ca-pub-2711721977927243"
					data-ad-slot="8698049578">
		</ins>
	</div>
</div>
</template>

<script>
	import { db } from '@/firebase'
	import trackCampaign from '@/components/trackCampaign'

	import Follow from '@/components/trackCampaign/Follow.vue'

	export default {
		name: 'TrackUser',
		components: {
			trackCampaign,
			Follow
		},
		metaInfo: {
			title: 'Harmless Key'
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				userId: this.$route.params.userid,
				tier: undefined,
			}
		},
		firebase() {
			return {
				username: {
					source: db.ref(`users/${this.userId}/username`),
					asObject: true,
				},
				live: {
					source: db.ref(`broadcast/${this.userId}/live`),
					asObject: true,
				},
				campaigns: db.ref(`campaigns/${this.userId}`)
			}
		},
		updated() {
			this.$nextTick(function() {
				let ins = $('ins')
				for (let i = 0; i < ins.length; i++) {
					
				}
				if ($('ins').length > 0) {
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
		},
		beforeMount() {
			this.fetch_tier()
		},
		computed: {
			
		},
		methods: {
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
			fetch_tier() {

				// return this.user
				let ret = undefined

				let path = 'tiers/basic'

				db.ref(`users/${this.userId}`).once('value', user_snap => {
					let user = user_snap.val()
					if (user.voucher) {
						if (user.voucher.date === undefined) {
							path = `tiers/${user.voucher.id}`
						} else {
							let end_date = new Date(user.voucher.date)
							let today = new Date()
							if (user.voucher && today <= end_date) {
								path = `tiers/${user.voucher.id}`
							}
						}
					}
					let vouch_tiers = db.ref(path)
					vouch_tiers.once('value', voucher_snap => {
						let voucher_order = voucher_snap.val().order
						let patrons = db.ref('patrons').orderByChild('email').equalTo(user.email)
						patrons.on('value', patron_snapshot => {

							if (patron_snapshot.val()) {
								let key = Object.keys(patron_snapshot.val())[0]
								let patron_tier = db.ref(`tiers/${patron_snapshot.val()[key].tier_id}`)
								patron_tier.once('value', tier_snapshot =>  {
									if (tier_snapshot.val().order >= voucher_order) {
										this.tier = tier_snapshot.val()
									} else {
										this.tier = voucher_snap.val()
									}
								})
							}
							else {
								this.tier = voucher_snap.val()
							}
						})
					})
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
.top {
	background: rgba(38, 38, 38, .9);
	text-transform: uppercase;
	height: 65px;
	padding: 10px;
	font-size: 15px;
	line-height: 45px;
}
	.container-fluid {

		&::-webkit-scrollbar { 
			display: none; 
		}
		padding: 30px;

		a.card {
			color: #b2b2b2 !important;

			.card-header {
				position: relative;

				.live {
					position: absolute;
					top: 8px;
					right: 8px;
				}
			}
			.card-body {
				height: 200px;
				background-size: cover;
				background-position: center bottom;
			}
			&:hover {
				text-decoration: none;
			}
		}
	}
	.adsbygoogle {
		position: fixed;
		bottom: 0;
	}
</style>
