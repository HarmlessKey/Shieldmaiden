<template>
	<div class="content">
		<h2>Are you sure you want to delete your account?</h2>
		<p>All your data will permanently be deleted.</p>
		<p v-if="error" class="red">{{ error }}</p>

		<div id="login" v-show="credentials">
			<form v-on:submit.prevent>
			<q-input 
				:dark="$store.getters.theme === 'dark'" filled square dense
				autocomplete="off" 
				type="text" 
				v-model="email" 
				name="email" 
				placeholder="Email" 
				class="email"
			/>
			<q-input 
				:dark="$store.getters.theme === 'dark'" filled square dense
				autocomplete="off" 
				type="password" 
				v-model="password" 
				placeholder="password" 
				name="password"
			/>
			<button class="btn btn-block mt-3" @click="signIn()">Sign In <i class="fas fa-sign-in-alt"></i></button>
		</form>
		<a class="btn btn-block google my-3" @click="googleSignIn()"><img src="@/assets/_img/styles/google.png" alt="Google logo"/> Sign in with Google</a>
		</div>

		<div class="d-flex justify-content-center">
			<router-link class="btn bg-gray mr-2" to="/profile"><i class="fas fa-times"></i> Cancel</router-link>
			<a v-if="!credentials" class="btn bg-red" @click="deleteUser()"><i class="fas fa-trash-alt"></i> Permanently Remove account</a>
		</div>
	</div>
</template>

<script>
	import { firebase, db, auth } from '@/firebase'	

export default {
		name: 'Profile',
		data() {
			return {
				email: undefined,
				password: undefined,
				error: '',
				credentials: undefined,
			}
		},
		methods: {
			signIn: function() {
				auth.signInWithEmailAndPassword(this.email, this.password).then(
					// eslint-disable-next-line
					(user) => {

					},
					(err) => {
						this.error = err.message;
					}
				);
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();
				// eslint-disable-next-line
				auth.signInWithPopup(provider).then((result) => {
					this.credentials = undefined;
					this.error = undefined;
				}).catch((err) => {
					this.error = err.message;
				});
			},
			deleteUser() {
				var vm = this;
				var user = auth.currentUser;

				user.delete().then(function() {
					//REMOVE ALL USER DATA
					db.ref(`campaigns/${user.uid}`).remove();
					db.ref(`encounters/${user.uid}`).remove();
					db.ref(`players/${user.uid}`).remove();
					db.ref(`npcs/${user.uid}`).remove();
					db.ref(`reminders/${user.uid}`).remove();
					db.ref(`custom_items/${user.uid}`).remove();
					db.ref(`settings/${user.uid}`).remove();
					db.ref(`broadcast/${user.uid}`).remove();
					db.ref(`users/${user.uid}`).remove();
					db.ref(`search_users/${user.uid}`).remove();

					vm.$router.replace('/');
				}).catch(function(error) {
					vm.error = error.message
					vm.credentials = true
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		text-align: center;

		.warning {
			color:$neutral-1;
			padding: 10px;
		}
		#login {
			padding: 0;
		}
	}
</style>