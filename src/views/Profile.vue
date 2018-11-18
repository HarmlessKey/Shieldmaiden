<template>
	<div class="container">
		<div v-if="error">{{ error }}</div>
		<div v-if="user.photoURL" class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
		<h1>Profile of {{ user.displayName}}</h1>
		<p>Created: {{ user.metadata.creationTime }}</p>
		<p>Last login: {{ user.metadata.lastSignInTime }}</p>

		<h2>Data</h2>
		<p>Campaigns: /2</p>
		<p>Players: /6</p>
		<p>NPC's: /10</p>
		<p><a @click="resetPassword()">Reset Password</a></p>
		<p><a class="red" @click="removeAlert()"><i class="fas fa-trash-alt"></i> Remove account</a></p>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'	

export default {
		name: 'Profile',
		data() {
			return {
				user: this.$store.getters.getUser,
				auth: firebase.auth(),
				error: ''
			}
		},
		created() {
			// console.log(this.user)
		},
		methods: {
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
					{text: 'Yes', action: (toast) => { this.removeUser(); this.$snotify.remove(toast.id); }, bold: true},
					{text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			removeUser() {
				this.user.delete().then(function() {

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