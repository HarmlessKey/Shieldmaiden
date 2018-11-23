<template>
	<div id="hasSide">
		<Sidebar/>
		<div id="my-content" class="container">
			<Crumble />
			<h1>Campaigns</h1>
			<p>Welcome to your campaigns overview.</p>
			
			<template v-if="campaigns && players">
				<template v-if="Object.keys(players).length > 0">
					<div class="input-group">
						<input type="text" 
							class="form-control" 
							:class="{'input': true, 'error': errors.has('newCampaign') }" 
							v-model="newCampaign" 
							v-validate="'required'" 
							name="newCampaign" 
							placeholder="Add new campaign"
						/>
						<div class="input-group-append">
							<button class="btn" @click="addCampaign()"><i class="fas fa-plus"></i> Add</button>
						</div>				
					</div>
					<p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>
				</template>
				<template v-else>
					<h2 class="red">No players yet</h2>
					<p>Let's start with making some players that can join your campaigns.</p>
					<router-link class="btn" to="/players/add-player">Create player</router-link>
				</template>
				<ul id="campaigns" class="mt-3">
					<transition-group name="list" enter-active-class="animated pulse" leave-active-class="animated bounceOutLeft">
						<li class="bg-gray" v-for="(campaign, key) in campaigns" :key="key">
							<h2>
								{{ campaign.campaign }} 
								<a v-b-tooltip.hover title="Delete" class="red" @click="deleteCampaign(key)">
									<i class="fas fa-trash-alt"></i>
								</a>
							</h2>
							<router-link :to="'/campaigns/' + key"> Edit</router-link>
							<router-link :to="'/encounters/' + key"> Encounters</router-link>

							<!-- PLAYERS IN CAMPAIGN -->
							<h2 class="players" v-if="campaign.players">Players</h2>
							<div class="d-flex justify-content-center">
								<!-- <span v-for="(player, key) in campaign.players" 
									:key="key"
									v-b-tooltip.hover
									:title="players[player.player].character_name"
									class="img"
									:style="{ backgroundImage: 'url(' + players[player.player].avatar + ')' }">
								</span> -->
								<span v-for="(player, key) in campaign.players" 
									:key="key"
									v-b-tooltip.hover
									:title="players[player.player].character_name"
									class="img">
								</span>
							</div>
						</li>
					</transition-group>
				</ul>
			</template>
			<div v-else class="loader"><span>Loading campaigns...</span></div>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import Crumble from '@/components/CrumbleMyContent.vue'
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Campaigns',
		components: {
			Sidebar,
			Crumble,
		},
		data() {
			return {
				newCampaign: '',
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'players',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			addCampaign() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('campaigns/' + this.user.uid).push({campaign: this.newCampaign});
						this.newCampaign = '';
						this.$snotify.success('Campaign added.', 'Critical hit!', {
							position: "rightTop"
						});
					} else {
					//console.log('Not valid');
				}
			})
			},
			confirmDelete(key) {
				this.$snotify.error('Are you sure you want to delete the campaign?', 'Delete campaign', {
					buttons: [
					{text: 'Yes', action: (toast) => { this.deleteCampaign(key); this.$snotify.remove(toast.id); }, bold: false},
					{text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
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

<style lang="css" scoped>
.container {
	padding-top:20px;
}
ul#campaigns {
	list-style:none;
	padding:0;
}
ul#campaigns li {
	padding:10px;
	margin-bottom:15px
}
a {
	cursor:pointer;
}
.img {
	width: 50px;
	height: 50px;
	display: block;
	background-size: cover;
	background-position: top center;
	border: solid 1px #b2b2b2;
	background-color: #000;
	margin-right: 10px;
	margin:2px;
}
h2.players {
	margin-bottom: 5px !important;
	text-align: center;
}
</style>