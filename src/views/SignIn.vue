<template>
	<div id="login">
		<h1>Harmless Key</h1>
		<p v-if="error" class="red"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>

		<form v-on:submit.prevent>
			<b-form-input type="text" v-model="email" name="email" placeholder="Email" class="email"></b-form-input>
			<b-form-input type="password" v-model="password" placeholder="password" name="password"></b-form-input>
			<button class="btn btn-block mt-3" @click="signIn()">Sign In <i class="fas fa-sign-in-alt"></i></button>
		</form>
		<a class="btn btn-block google my-3" @click="googleSignIn()"><img src="@/assets/_img/styles/google.png" alt="Google logo"/> Sign in with Google</a>

		<p class="text-center mb-1"><small><router-link to="/forgot-password">Forgot password?</router-link></small></p>
		<p class="text-center"><small>No account yet? <router-link to="/sign-up">Create one here.</router-link></small></p>
	</div>
</template>

<script>
	import { firebase, auth } from '@/firebase'

	export default {
		name: 'login',
		data() {
			return {
				email: '',
				password: '',
				error: '',
			}
		},
		methods: {
			signIn: function() {
				auth.signInWithEmailAndPassword(this.email, this.password).then(
					(user) => {
						this.$router.replace('campaigns')
					},
					(err) => {
						this.error = err.message;
					}
					);
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();

				auth.signInWithPopup(provider).then((restult) => {
					this.$router.replace('campaigns');
				}).catch((err) => {
					this.error = err.message;
				});
			},
		},
	}
</script>

<style lang="scss" scoped>

</style>