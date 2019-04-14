<template>
	<div class="container-fluid">
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
					<span slot=".key" slot-scope="data">
						<template v-if="status[data.value]">
							<i :class="{ 'green': status[data.value].state == 'online', 'gray-hover': status[data.value].state == 'offline' }" class="fas fa-circle"></i>
						</template>
						<span v-else><i class="fas fa-circle gray-hover"></i></span>
					</span>

					<!-- USERNAME -->
					<router-link :to="'/admin/users/' + data.item['.key']" slot="username" slot-scope="data">{{ data.value }}</router-link>
					
					<!-- SUBSCRIPTION -->
					<span slot="voucher" slot-scope="data" v-if="data.value">
						<template v-if="tiers[data.value.id]">{{ tiers[data.value.id].name }}</template>
					</span>

					<!-- LOADER -->
					<div slot="table-busy" class="loader">
						<span>Loading users....</span>
					</div>
				</b-table>
			</div>
			<div v-if="isBusy" class="loader"> <span>Loading users....</span></div>
		
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
				current: 1,
				fields: {
          '.key': {
						label: 'State',
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
						label: 'Subscription',
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
				users: {
					source: db.ref('users').orderByChild('username'),
					readyCallback: () => this.isBusy = false
				},
				status: {
					source: db.ref('status'),
					asObject: true,
				},
				online: {
					source: db.ref('status').orderByChild('state').equalTo('online'),
					readyCallback: () => this.isBusy = false
				},
				campaigns: db.ref('users'),
				tiers: {
					source: db.ref('tiers'),
					asObject: true,
				},
			}
		},
		beforeMount() {
			this.searchResults = this.users
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
					if ((u.username.toLowerCase().includes(this.search.toLowerCase()) || 
						u.email.toLowerCase().includes(this.search.toLowerCase())) 
						&& this.search != '') {
						this.noResult = ''
						this.searchResults.push(u)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
				if(this.search == '') {
					this.searchResults = this.users
					this.searching = false
				}
			},
			patreon(email) {
				var patron = db.ref(`patrons`).orderByChild("email").equalTo(email);
				var isPatron = patron.once('value').then(function(snapshot) {
					// return snapshot.val()
					console.log(snapshot.val())
				});
				// return patron
			},
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;
}

</style>