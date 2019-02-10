<template>
	<div id="login">
		<h1>Harmless Key</h1>
		<h2>Create an account</h2>
		<p v-if="error" class="red"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
		<form v-on:submit.prevent>
			<b-form-input class="email" type="email" placeholder="Email" v-model="email"></b-form-input>
			<b-form-input type="password" placeholder="Password" v-model="password" name="password"></b-form-input>

			<button type="submit" class="btn btn-block mt-3" v-on:click="signUp">Create account</button>
			<a class="btn btn-block google mt-4" @click="googleSignIn()"><img src="@/assets/_img/styles/google.png" alt="Google logo"/> Sign up with Google</a>
		</form>
	</div>
</template>

<script>
	import firebase from "firebase";

	export default {
		data: function() {
			return {
				email: undefined,
				password: undefined,
				error: undefined,
			};
		},
		methods: {
			signUp: function() {
				firebase.auth()
				.createUserWithEmailAndPassword(this.email, this.password).then(
					user => {
						this.$router.replace('campaigns');
					},
					err => {
						this.error = err.message;
					});
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();

				firebase.auth().signInWithPopup(provider).then((restult) => {
					this.$router.replace('campaigns');
				}).catch((err) => {
					this.error = err.message;
				});
			},
		}
	};
</script>

<style lang="css" scoped>

</style>