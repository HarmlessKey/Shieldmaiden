<template>
	<div class="container">
		<b-card header="Your Profile">
			<b-row>
				<b-col md="2" v-if="user.photoURL">
					<div class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
				</b-col>
				<b-col>
					<h2>{{ user.displayName}}</h2>
					<p class="info">
						<span class="gray-hover">Created:</span> {{ makeDate(user.metadata.creationTime) }}<br/>
						<span class="gray-hover">Last login:</span> {{ makeDate(user.metadata.lastSignInTime) }}
					</p>
				</b-col>
			</b-row>
		</b-card>

		<b-card header="Data">
			<b-row v-if="campaigns && players && npcs">
				<b-col md="4">
					<h2>
						Campaigns: 
						<span :class="{ 'green': true, 'red': Object.keys(campaigns).length == 2 }">{{ Object.keys(campaigns).length }} </span>
						<!-- / 2 -->
					</h2>
				</b-col>
				<b-col md="4">
					<h2>
						Players:
						<span :class="{ 'green': true, 'red': Object.keys(players).length == 6 }">{{ Object.keys(players).length }} </span>
						<!-- / 6 -->
					</h2>
				</b-col>
				<b-col md="4">
					<h2>
						NPC's: 
						<span :class="{ 'green': true, 'red': Object.keys(npcs).length == 6 }">{{ Object.keys(npcs).length }} </span>
						<!-- / 10 -->
					</h2>
				</b-col>
			</b-row>
		</b-card>

		<b-card header="Actions">
			<p><a @click="resetPassword()"><i class="fas fa-redo-alt"></i> Reset Password</a></p>
			<p><router-link to="/profile/delete-account" class="red"><i class="fas fa-trash-alt"></i> Delete account</router-link></p>
		</b-card>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Profile',
		metaInfo: {
			title: 'Profile'
		},
		data() {
			return {
				auth: firebase.auth(),
				error: ''
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'players',
				'npcs',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			makeDate(input) {
				var monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				var d = new Date(input)
				var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				var date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				return date + " at " + time;
			},
			resetPassword() {
				var emailAddress = this.user.email;

				this.auth.sendPasswordResetEmail(emailAddress).then(function() {
					// Email sent.
					console.log('Sent')
				}).catch(function(error) {
					// An error happened.
				});
			},
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