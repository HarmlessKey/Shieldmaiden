<template>
	<div class="container">
		<div v-if="error">{{ error }}</div>
		<div v-if="user.photoURL" class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
		<h1>Profile of {{ user.displayName}}</h1>
		<p>Created: {{ makeDate(user.metadata.creationTime) }}</p>
		<p>Last login: {{ makeDate(user.metadata.lastSignInTime) }}</p>

		<h2>Data</h2>
		<p>
			Campaigns: 
			<span :class="{ 'green': true, 'red': Object.keys(campaigns).length == 2 }">{{ Object.keys(campaigns).length }} </span>
			/ 2
		</p>
		<p>Players:
			<span :class="{ 'green': true, 'red': Object.keys(players).length == 6 }">{{ Object.keys(players).length }} </span>
				/ 6
		</p>
		<p>NPC's: / 10</p>
		<p><a @click="resetPassword()">Reset Password</a></p>
		<p><a class="red" @click="removeAlert()"><i class="fas fa-trash-alt"></i> Remove account</a></p>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Profile',
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
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		created() {
			// console.log(this.user)
		},
		methods: {
			makeDate(input) {
				var d = new Date(input)
				var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				var date = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear();
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
			removeAlert() {
				this.$snotify.error('Are you sure you want to delete your account? All your data will be removed.', 'Delete account', {
					buttons: [
					{text: 'Yes', action: (toast) => { this.removeUser(this.user.uid); this.$snotify.remove(toast.id); }, bold: true},
					{text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			removeUser(userId) {
				
				db.ref('campaigns/'+ userId).remove();
				db.ref('encounters/'+ userId).remove();
				db.ref('players/'+ userId).remove();
				
				firebase.auth()
				.signOut()
				.then(() => {
					
				});
				this.user.delete().then(function() {
					this.$router.replace('/');
				}).catch(function(error) {
					console.log(error.message)
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.img {
		width: 80px;
		height: 80px;
		margin-bottom: 20px;
		border-radius: 50%;
		display: block;
		background-size: cover;
		background-position: center top;
	}
</style>