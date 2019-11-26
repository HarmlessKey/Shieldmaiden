<template>
	<div class="container-fluid">
		<template v-if="!$route.params.id">
			<Crumble />
			<h1 class="mb-3">
				<i class="fas fa-users"></i> Users 
					<span v-if="isBusy" class="loader pl-5"></span>
				<template v-else>
					( {{ Object.keys(users).length }}, {{ Object.keys(online).length }} online )
				</template>
			</h1>

			<b-input-group class="mb-3">
				<input class="form-control" type="text" autocomplete="off" v-model="search" @keyup="searchCondition()" placeholder="Search users" />
				<b-input-group-append>
					<button class="btn" @click="searchCondition()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>


			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} users found</p>

			<HKtable
				:items="searchResults"
				:columns="fields"
				:perPage="15"
				:currentPage="current"
				:loading="isBusy"
			>
				<span slot="status" slot-scope="data">
					<template v-if="data.item === 'online'">
						<i :class="{ 'green': data.item === 'online', 'gray-hover': data.item === 'offline' }" class="fas fa-circle"></i>
					</template>
					<span v-else><i class="fas fa-circle gray-hover"></i></span>
				</span>

				<router-link :to="'/admin/users/' + data.row['.key']" slot="username" slot-scope="data">
					<span v-if="data.item">{{ data.item }}</span>
					<span v-else>UNDEFINED</span>
				</router-link>
					
				<span slot="voucher" slot-scope="data" v-if="data.item">
					<i 
						v-if="tiers[data.item.id]"
						class="fas fa-ticket-alt"
						:class="{
							'blue': tiers[data.item.id].name == 'Folk Hero',
							'purple': tiers[data.item.id].name == 'Noble',
							'orange': tiers[data.item.id].name == 'Deity'
					}"></i>
				</span>

				<span slot="patreon" slot-scope="data" v-if="data.item">
					<span v-if="data.item === 'Expired'" class="red">{{ data.item }}</span>
					<i 
						v-else-if="data.item"
						v-for="tier in data.item"
						:key="tier"
						class="fab fa-patreon"
						:class="{
							'blue': tiers[tier].name == 'Folk Hero',
							'purple': tiers[tier].name == 'Noble',
							'orange': tiers[tier].name == 'Deity',
							'red' : tiers[tier].name == 'Former'
					}"></i>
				</span>

				<span slot="live" slot-scope="data" v-if="data.item" class="red">
					<i class="far fa-dot-circle"></i>
				</span>

				<div slot="table-loading" class="loader">
					<span>Loading users...</span>
				</div>
			</HKtable>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
		</template>

		<!-- SHOW USER -->
		<template v-else>
			<User :id="$route.params.id" />
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import User from '@/components/Admin/User.vue';
	import { mapActions } from 'vuex';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'Users',
		components: {
			Crumble,
			User,
			HKtable
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
						maxContent: true,
						sortable: true
					},
					username: {
						label: 'Username',
						truncate: true,
						sortable: true
					},
					email: {
						label: 'Email',
						truncate: true,
						sortable: true
					},
					voucher: {
						label: '<i class="fas fa-ticket-alt"></i>',
						maxContent: true,
						sortable: true
					},
					patreon: {
						label: '<i class="fab fa-patreon"></i>',
						maxContent: true,
						sortable: true
					},
					live: {
						maxContent: true,
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
						users[key].status = users[key].status ? users[key].status : 'offline';
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
	.hk-table {
		margin-bottom: 30px;
	}
}

</style>