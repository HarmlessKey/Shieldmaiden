<template>
	<div class="container-fluid" v-if="users">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1 class="mb-3"><i class="fas fa-users"></i> Users ( {{ Object.keys(users).length }}, {{ Object.keys(online).length }} online )</h1>

			<b-row>
				<b-col sm="8">
					<b-input-group class="mb-3">
						<input class="form-control" type="text" autocomplete="off" v-model="search" @keyup="searchCondition()" placeholder="Search users" />
						<b-input-group-append>
							<button class="btn" @click="searchCondition()"><i class="fas fa-search"></i></button>
						</b-input-group-append>
					</b-input-group>
				</b-col>
				<b-col class="text-right">
					<h2>{{ Object.keys(users).length }} users.</h2>
				</b-col>
			</b-row>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} users found</p>
			<div class="table-responsive">
				<b-table 
					:busy="isBusy"
					:items="searchResults" 
					:fields="fields"
					:per-page="15"
					:current-page="current"
				>	
					<!-- STATUS -->
					<span slot="status" slot-scope="data">
						<template v-if="data.value === 'online'">
							<i :class="{ 'green': data.value == 'online', 'gray-hover': data.value == 'offline' }" class="fas fa-circle"></i>
						</template>
						<span v-else><i class="fas fa-circle gray-hover"></i></span>
					</span>

					<!-- USERNAME -->
					<router-link :to="'/admin/users/' + data.item['.key']" slot="username" slot-scope="data">
						<span v-if="data.value">{{ data.value }}</span>
						<span v-else>UNDEFINED</span>
					</router-link>
					
					<!-- VOUCHER -->
					<span slot="voucher" slot-scope="data" v-if="data.value">
						<span 
							v-if="tiers[data.value.id]"
							:class="{
								'blue': tiers[data.value.id].name == 'Folk Hero',
								'purple': tiers[data.value.id].name == 'Noble',
								'orange': tiers[data.value.id].name == 'Deity'
						}">
							{{ tiers[data.value.id].name }}</span>
					</span>

					<!-- PATREON -->
					<span slot="patreon" slot-scope="data" v-if="data.value">
						<span v-if="data.value === 'Expired'" class="red">{{ data.value }}</span>
						<span 
							v-else
							v-for="tier in data.value"
							:key="tier"
							class="tiers"
							:class="{
								'blue': tiers[tier].name == 'Folk Hero',
								'purple': tiers[tier].name == 'Noble',
								'orange': tiers[tier].name == 'Deity',
								'red' : tiers[tier].name == 'Former'
						}">
							{{ tiers[tier].name }}</span>
					</span>

					<!-- LIVE -->
					<span slot="live" slot-scope="data" v-if="data.value" class="red">
						Live
					</span>

					<!-- LOADER -->
					<div slot="table-busy" class="loader">
						<span>Loading users....</span>
					</div>
				</b-table>
			</div>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
		</template>

		<!-- SHOW USER -->
		<template v-else>
			<User :id="$route.params.id" />
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import User from '@/components/Admin/User.vue'
	import { mapActions } from 'vuex'

	export default {
		name: 'Users',
		components: {
			Crumble,
			User,
		},
		metaInfo: {
			title: 'Admin | Users'
		},
		data() {
			return {
				id: this.$route.params.id,
				users: undefined,
				current: 1,
				fields: {
         			 status: {
						label: 'State',
						sortable: true
					},
					username: {
						label: 'Username',
						sortable: true
					},
					email: {
						label: 'Email',
						sortable: true
					},
					voucher: {
						label: 'Voucher',
						sortable: true
					},
					patreon: {
						label: 'Patreon',
						sortable: true
					},
					live: {
						label: 'Live',
						sortable: true
					}
				},
				search: '',
				searching: '',
				searchResults: [],
				noResult: '',
				isBusy: true,
			}
		},
		firebase() {
			return {
				online: {
					source: db.ref('status').orderByChild('state').equalTo('online'),
				},
				campaigns: db.ref('users'),
				tiers: {
					source: db.ref('tiers'),
					asObject: true,
				},
			}
		},
		mounted() {
			var users = db.ref('users').orderByChild('username')
				users.on('value', async (snapshot) => {
					let users = snapshot.val()

					for(let key in users) {
						users[key]['.key'] = key;
						let email = (users[key].patreon_email) ? users[key].patreon_email : users[key].email;

						//Get Patreon
						let getPatron = db.ref(`new_patrons`).orderByChild("email").equalTo(email);
						await getPatron.on('value', (snapshot) => {
							if(snapshot.val()) {
								for(let patreonId in snapshot.val()) {
									let patron = snapshot.val()[patreonId];
									if(new Date(patron.pledge_end) >= new Date()) {
										users[key].patreon = Object.keys(patron.tiers)
									} else {
										users[key].patreon = 'Expired';
									}
								}
							}
						});

						// Get Status
						let getStatus = db.ref(`status/${key}`);
						await getStatus.on('value', (snapshot) => {
							if(snapshot.val()) {
								users[key].status = snapshot.val().state;
							}
						});

						// Get Status
						let getLive = db.ref(`broadcast/${key}/live`);
						await getLive.on('value', (snapshot) => {
							if(snapshot.val()) {
								users[key].live = snapshot.val();
							}
						});
					}
					this.users = users;
					this.searchResults = Object.values(users);
					this.isBusy = false
				});

		
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchCondition() {
				this.current = 1;
				this.searchResults = []
				this.searching = true
				for (var i in this.users) {
					var u = this.users[i]
					if(u.username) { 
						if ((u.username.toLowerCase().includes(this.search.toLowerCase()) || 
							u.email.toLowerCase().includes(this.search.toLowerCase())) 
							&& this.search != '') {
							this.noResult = ''
							this.searchResults.push(u)
						}
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
				if(this.search == '') {
					this.searchResults = Object.values(this.users);
					this.searching = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.tiers {
		&::after {
			content: ', ';
			color: #b2b2b2;
		}
		&:last-child::after {
			content: '';
		}
	}
}

</style>