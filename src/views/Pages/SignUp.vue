	<template>
	<div class="login-container">
		<div id="login">
			<img class="logo" src="../../assets/_img/logo/logo-main-alt.svg" alt="Harmless Key"/>
			<h2>Create an account</h2>
			<p v-if="error" class="red"><i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}</p>
			<form v-on:submit.prevent>
				<q-input
					:dark="$store.getters.theme === 'dark'" filled square dense 
					autocomplete="off" 
					class="email" 
					type="email" 
					placeholder="Email" 
					v-model="email"
				/>
				<q-input
					:dark="$store.getters.theme === 'dark'" filled square dense 
					autocomplete="off" 
					type="password" 
					placeholder="Password" 
					v-model="password" 
					name="password"
				/>

				<button type="submit" class="btn btn-block mt-3" v-on:click="signUp">Create account</button>
				<a class="btn btn-block google mt-2" @click="googleSignIn()">
					<img src="@/assets/_img/styles/google.png" alt="Google logo"/> 
					Sign up with Google
				</a>
			</form>
		</div>
	</div>
</template>

<script>
	import { firebase, auth } from '@/firebase';

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
				auth.createUserWithEmailAndPassword(this.email, this.password).then(
					// eslint-disable-next-line
					user => {
						this.$router.replace('/profile');
					},
					err => {
						this.error = err.message;
					});
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();

				auth.signInWithPopup(provider).then(() => {
					this.$router.replace('/profile');
				}).catch((err) => {
					this.error = err.message;
				});
			},
		}
	};
</script>