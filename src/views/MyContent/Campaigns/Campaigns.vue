<template>
	<div>
		<div id="hasSide">
			<Sidebar/>
			<div id="my-content" class="container">
				<Crumble />
				<h1>Campaigns</h1>
				<p>Welcome to your campaigns overview.</p>
				
				<template v-if="players">
					<template v-if="Object.keys(players).length > 0">
						<div class="input-group">
							<input type="text" 
								class="form-control" 
								:class="{'input': true, 'error': errors.has('newCampaign') }" 
								v-model="newCampaign" 
								v-validate="'required'" 
								name="newCampaign"
								@change="addCampaign()"
								placeholder="Add new campaign"
							/>
							<div class="input-group-append">
								<button class="btn"><i class="fas fa-plus"></i> Add</button>
							</div>				
						</div>
						<!-- <div class="red" v-else="">You have 2/2 campaigns.</div> -->
						<p class="validate red" v-if="errors.has('newCampaign')">{{ errors.first('newCampaign') }}</p>
					</template>
					<template v-else>
						<h2 class="red">No players yet</h2>
						<p>Let's start with making some players that can join your campaigns.</p>
						<router-link class="btn" to="/players/add-player">Create player</router-link>
					</template>
					<template v-if="campaigns">
						
						<h2 class="mt-3">Campaigns ( {{ Object.keys(campaigns).length }} )</h2>
						<table class="table">
							<thead>
								<th>#</th>
								<th>Campaign</th>
								<th>Players</th>
								<th>Encounters</th>
								<th></th>
							</thead>
							<tbody name="table-row" 
								is="transition-group"
								enter-active-class="animated flash"
								leave-active-class="animated bounceOutLeft">
								<tr v-for="(campaign, index) in _campaigns" :key="campaign.key">
									<td>{{ index + 1 }}</td>
									<td>{{ campaign.campaign }}</td>
									<td>
										<router-link :to="'/campaigns/' + campaign.key" v-b-tooltip.hover title="Edit">
											<template v-if="campaign.players">{{ Object.keys(campaign.players).length }}</template>
											<template v-else>Add</template>
										</router-link>
									</td>
									<td>
										<router-link :to="'/encounters/' + campaign.key" v-b-tooltip.hover title="Edit">
											<template v-if="allEncounters[campaign.key]">
												{{ Object.keys(allEncounters[campaign.key]).length }}
											</template>
											<template v-else>Edit</template>
										</router-link>
									</td>
									<td class="text-right actions">
										<router-link class="mx-2" 
											:to="'/campaigns/' + campaign.key" 
											v-b-tooltip.hover title="Edit"><i class="fas fa-edit"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="red"
											@click="confirmDelete(campaign.key, campaign.campaign)">
												<i class="fas fa-trash-alt"></i>
										</a>
									</td>
								</tr>
							</tbody>
						</table>
					</template>
				</template>
				<div v-else class="loader"><span>Loading campaigns...</span></div>
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
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
				'allEncounters',
				'players',
			]),
			...mapGetters({
				user: 'getUser'
			}),
			_campaigns: function() {
				return _.chain(this.campaigns)
				.filter(function(campaign, key) {
					campaign.key = key
					return campaign
				})
				.orderBy(function(campaign){
					return parseInt(campaign.timestamp)
				} , 'desc')
				.value()
			},
		},
		methods: {
			addCampaign() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref('campaigns/' + this.user.uid).push({
							campaign: this.newCampaign,
							timestamp: Date.now(),
						});
						this.newCampaign = '';
						this.$snotify.success('Campaign added.', 'Critical hit!', {
							position: "rightTop"
						});
					} 
					else {
						//console.log('Not valid');
					}
				})
			},
			confirmDelete(key, name) {
				this.$snotify.error('Are you sure you want to delete the campaign "' + name + '"?', 'Delete campaign', {
					buttons: [
					{ text: 'Yes', action: (toast) => { this.deleteCampaign(key); this.$snotify.remove(toast.id); }, bold: false},
					{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
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