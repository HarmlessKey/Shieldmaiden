<template>
	<div class="login-container delete">
			<div id="login">
				<h2>Are you sure you want to delete your account?</h2>
				<p>All your data will permanently be deleted.</p>
				<p v-if="error" class="red">{{ error }}</p>

				<template v-if="credentials">
					<form v-on:submit.prevent>
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							autocomplete="off" 
							type="text" 
							v-model="email" 
							name="email" 
							placeholder="Email" 
							class="email mb-1"
						/>
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							autocomplete="off" 
							type="password" 
							v-model="password" 
							placeholder="password" 
							name="password"
						/>
						<button class="btn btn-block mt-3" @click="signIn()">Sign In <i aria-hidden="true" class="fas fa-sign-in-alt"></i></button>
					</form>
					<button class="google my-3" @click="googleSignIn()">
						Sign in with Google
					</button>
				</template>

				<div class="d-flex justify-content-center">
					<router-link class="btn bg-neutral-4 mr-2" to="/profile"><i aria-hidden="true" class="fas fa-times"></i> Cancel</router-link>
					<a v-if="!credentials" class="btn bg-red" @click="deleteUser()"><i aria-hidden="true" class="fas fa-trash-alt"></i> Delete account</a>
				</div>
			</div>
	</div>
</template>

<script>
	import { firebase, auth } from 'src/firebase';
	import { mapActions } from 'vuex';

export default {
		name: 'Profile',
		data() {
			return {
				email: undefined,
				password: undefined,
				error: '',
				credentials: undefined
			}
		},
		methods: {
			...mapActions(["sign_out"]),
			signIn() {
				auth.signInWithEmailAndPassword(this.email, this.password).then(
					// eslint-disable-next-line
					(err) => {
						this.credentials = undefined;
						this.error = undefined;
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
					// USER DATA IS DELETED WITH A FIREBASE CLOUD FUNCTION
					vm.sign_out();
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

.warning {
	color:$neutral-1;
	padding: 10px;
}
#login {
	padding: 25px !important;
	max-width: 400px;
}

</style>