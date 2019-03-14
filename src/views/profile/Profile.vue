<template>
	<div class="container">
		<b-card header="Your Profile">
			<b-row>
				<b-col md="2" v-if="user.photoURL">
					<div class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
				</b-col>
				<b-col>
					<h2 v-if="userInfo">{{ userInfo.username }}</h2>
					<p class="info">
						<span class="gray-hover">Created:</span> {{ makeDate(user.metadata.creationTime) }}<br/>
						<span class="gray-hover">Last login:</span> {{ makeDate(user.metadata.lastSignInTime) }}
					</p>
				</b-col>
			</b-row>
		</b-card>

		<div class="card" v-if="userInfo">
			<div class="card-header"><i class="fab fa-patreon patreon-red"></i> Patreon</div>
			<div class="card-body">
				<button v-if="!userInfo.patronId" @click="linkPatreon()" class="btn btn-block bg-patreon-red">Link your Patreon</button>
			</div>
		</div>

		<b-card header="Data">
			<b-row>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="campaigns" :class="{ 'green': true, 'red': Object.keys(campaigns).length == 2 }">
						{{ Object.keys(campaigns).length }}
						</div>
						<div v-else>0</div>
						<router-link to="/campaigns" class="gray-hover">Campaigns</router-link>
					</h2>
				</b-col>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="players" :class="{ 'green': true, 'red': Object.keys(players).length == 6 }">
							{{ Object.keys(players).length }}
						</div>
						<div v-else>0</div>
						<router-link to="/players" class="gray-hover">Players</router-link>
					</h2>
				</b-col>
				<b-col class="text-center">
					<h2 class="mb-0">
						<div v-if="npcs" :class="{ 'green': true, 'red': Object.keys(npcs).length == 6 }">
							{{ Object.keys(npcs).length }}
						</div>
						<div v-else>0</div>
						<router-link to="/npcs" class="gray-hover">NPC's</router-link>
					</h2>
				</b-col>
			</b-row>
		</b-card>

		<b-card header="Actions">
			<p v-if="resetError" class="red"><i class="fas fa-exclamation-triangle"></i> {{ resetError }}</p>
			<p v-if="resetSuccess" class="green"><i class="fas fa-check"></i> {{ resetSuccess }}</p>
			<p><a @click="resetPassword()" class="gray-hover"><i class="fas fa-redo-alt blue"></i> Reset Password</a></p>
			<p><router-link to="/profile/delete-account" class="gray-hover"><i class="fas fa-trash-alt red"></i> Delete account</router-link></p>
		</b-card>
	</div>
</template>

<script>
	import { db, auth } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Profile',
		metaInfo: {
			title: 'Profile'
		},
		data() {
			return {
				error: '',
				resetError: undefined,
				resetSuccess: undefined,
			}
		},
		firebase() {
			return {
				patron: db.ref('patrons').orderByChild('email').equalTo(this.user.email)
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'players',
				'npcs',
				'userInfo',
			]),
			...mapGetters({
				user: 'getUser'
			})
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
			resetPassword() {
				var vm = this;
				var emailAddress = this.user.email;

				auth.sendPasswordResetEmail(emailAddress).then(function() {
					// Email sent.
					vm.resetSuccess = 'An email was sent to ' + emailAddress + ' with a link to reset your password.';
					vm.resetError = undefined;
				}).catch(function(error) {
					// An error happened.
					vm.error = err.message;
				});
			},
			linkPatreon() {
				db.ref(`users/${this.user.uid}/patronId`).set(this.patron[0]['.key'])
			}
		}
	}
</script>

<style lang="scss" scoped>
	.img {
		width: 100px;
		height: 100px;
		margin-bottom: 20px;
		border-radius: 50%;
		display: block;
		background-size: cover;
		background-position: center top;
	}
	.info {
		span {
			width: 80px;
			display: inline-block;
		}
	}
</style>