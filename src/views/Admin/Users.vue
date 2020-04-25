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

			<hk-table
				:items="users"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['username','email']"
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
			</hk-table>
		
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

	export default {
		name: 'Users',
		components: {
			Crumble,
			User
		},
		metaInfo: {
			title: 'Admin | Users'
		},
		data() {
			return {
				id: this.$route.params.id,
				users: undefined,
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
						sortable: true,
						hide: 'md'
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
				isBusy: true,
			}
		},
		firebase() {
			return {
				online: {
					source: db.ref('status').orderByChild('state').equalTo('online'),
				},
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

					//Save all users under searchUsers with lower case values
					db.ref(`search_users`).child(key).set({
						username: users[key].username.toLowerCase(),
						email: users[key].email.toLowerCase()
					});

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
				this.users = Object.values(users);
				this.isBusy = false
			});
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
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