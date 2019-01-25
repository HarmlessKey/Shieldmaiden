<template>
	<div class="container">
		<h2>Are you sure you want to delete your account?</h2>
		<p>All your data will permanently be deleted.</p>
		<h2 v-if="error" class="warning bg-red">{{ error }}</h2>
		<div v-show="credentials" id="firebaseui-auth-container"></div>

		<div class="d-flex justify-content-center">
			<router-link class="btn bg-gray mr-2" to="/profile"><i class="fas fa-times"></i> Cancel</router-link>
			<a v-if="!credentials" class="btn bg-red" @click="deleteUser()"><i class="fas fa-trash-alt"></i> Permanently Remove account</a>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'	

export default {
		name: 'Profile',
		data() {
			return {
				auth: firebase.auth(),
				error: '',
				credentials: undefined,
			}
		},
		mounted() {
			var uiConfig = {
				signInSuccessUrl: '',
				signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				firebase.auth.EmailAuthProvider.PROVIDER_ID
				]
			};
			var ui = new firebaseui.auth.AuthUI(firebase.auth());
			ui.start('#firebaseui-auth-container', uiConfig);
		},
		methods: {
			login: function() {
				firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
					(user) => {
						// this.$router.replace('campaigns')
					},
					(err) => {
						// console.log('Something went wrong: ' + err.message)
						this.error = err.message
					}
					);
			},
			deleteUser(userId) {
				var vm = this;
				var user = firebase.auth().currentUser;
				var credential;

				user.delete().then(function() {
					//REMOVE ALL USER DATA
					// db.ref(`campaigns/${userId}`).remove();
					// db.ref(`encounters/${userId}`).remove();
					// db.ref(`players/${userId}`).remove();
					// db.ref(`npcs/${userId}`).remove();
					// db.ref(`settings/${userId}`).remove();
					// db.ref(`track/${userId}`).remove();

					// this.$router.replace('/');
				}).catch(function(error) {
					vm.error = error.message
					vm.credentials = true
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		text-align: center;

		.warning {
			color: #fff;
			padding: 10px;
		}
	}
</style>