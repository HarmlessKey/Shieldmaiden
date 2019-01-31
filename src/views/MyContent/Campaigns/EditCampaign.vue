<template>
	<div>
		<div id="hasSide">
			<Sidebar/>
			<div id="my-content" class="container">
				<div class="info">
					<Crumble />

					<router-link to="/campaigns"><i class="fas fa-arrow-left"></i> Back</router-link>

					<h2 class="mt-3">Edit your campaign</h2>
					<div class="input-group mb-4" v-if="campaign">
						<input class="form-control" 
							v-validate="'required'" 
							type="text" 
							name="newCampaign" 
							v-model="campaign.campaign" 
							data-vv-as="Campaign Name"
							@change="changeName()"/>
						<div class="input-group-append">
							<button class="btn">Change Name</button>
						</div>
					</div>
					<p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>
				</div>
				
				<div id="add" class="bg-gray">
					<h2>All players</h2>
					<ul class="entities" v-if="players && campaign">
						<li v-for="(player, key) in players" 
						:key="key" 
						class="d-flex justify-content-between">
							<div class="d-flex justify-content-left">
								<span class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }"></span>
								{{ player.character_name }}
							</div>
							<template v-if="campaign.players">
								<a v-if="checkPlayer(key) < 0" 
								class="btn btn-sm bg-green"
								v-b-tooltip.hover 
								title="Add Character" 
								@click="addPlayer(key, player.character_name)">
									<span class="d-none d-md-inline mr-1">Add</span>
									<i class="fas fa-plus"></i>
								</a>
								<span v-else>
									<small><span class="d-none d-md-inline mr-1 gray-hover">Added</span></small>
									<i class="fas fa-check green"></i>
								</span>
							</a>
							</template>	
							<a v-else class="btn btn-sm bg-green" 
								v-b-tooltip.hover 
								title="Add Character" 
								@click="addPlayer(key, player.character_name)">
									<span class="d-none d-md-inline mr-1">Add</span>
									<i class="fas fa-plus"></i>
							</a>
						</li>
					</ul>
					<div v-else class="loader"><span>Loading Players...</span></div>
				</div>

				<div id="added" class="bg-gray">
					<template v-if="players && campaign">
						<h2>Players in campaign</h2>
						<ul class="entities" v-if="campaign.players">
							<li v-for="(player, key) in campaign.players" :key="key" class="d-flex justify-content-between">
								<div class="d-flex justify-content-left">
									<span class="img" :style="{ backgroundImage: 'url(\''+ players[key].avatar + '\')' }"></span>
									{{ players[key].character_name }}
								</div>
								
								<a class="btn btn-sm bg-red" v-b-tooltip.hover title="Remove Character" @click="removePlayer(key, players[key].character_name)">
									<span class="d-none d-md-inline mr-1">Remove</span>
									<i class="fas fa-minus"></i>
								</a>
							</li>
						</ul>
					</template>
					<div v-else class="loader"><span>Loading Players...</span></div>
				</div>

			</div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {
		name: 'EditCampaign',
		metaInfo: {
			title: 'Campaigns'
		},
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				newCampaign: '',
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'playerInCampaign',
			]),
		},
		mounted() {
			this.fetchCampaign({
				cid: this.campaignId, 
			})
		},
		methods: {
			...mapActions([
				'fetchCampaign',
			]),
			changeName() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/campaign`).set(
							this.campaign.campaign
						);
						this.$snotify.success('Name changed.', 'Critical hit!', {
							position: "rightTop"
						});
					}
					else {

					}
				})
			},
			addPlayer(id, name) {
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players`).child(id).set(
					'true'
				);
			},
			removePlayer(id, name) {
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players`).child(id).remove();
			},
			checkPlayer(id) {
				return (Object.keys(this.campaign.players).indexOf(id))
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-top:20px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows:auto 1fr;
		grid-gap: 20px;
		grid-template-areas: 
		"info info"
		"add added";
	}
	.info {
		grid-area:info;
	}
	.nav { 
		background:#191919;
	}
	#add {
		padding: 15px 10px;
		grid-area: add;
	}
	.tab-content {
		padding:15px 10px;
	}
	#added {
		padding: 15px 10px;
		grid-area:added;
	}
	ul.entities {
		list-style:none;
		padding:0;
		line-height:30px;
	}
	ul.entities li {
		margin-bottom:5px;
	}
	ul.entities .img {
		width: 30px;
		height: 30px;
		display: block;
		background-size: cover;
		background-position: top center;
		border: solid 1px #b2b2b2;
		background-color: #000;
		margin-right: 10px;
	}
	ul.entities li a {
		font-size:18px;
	}
	.monster {
		padding:15px;
		position:fixed;
		right:0;
		top:80px;
		height: calc(100vh - 80px);
		width:330px;
		z-index:99;
		overflow: scroll;
		border-left:solid 1px #000;
		box-shadow: 0 10px 8px #000;
	}

	.slideInRight {
		transition-duration: 0.1s;
	}

	.slideOutRight {
		transition-duration: 0.1s;
	}
	.faded {
		opacity: .3;
	}
</style>