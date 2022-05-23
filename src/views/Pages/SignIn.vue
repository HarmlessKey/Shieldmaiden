<template>
	<div class="login-container">
		<div id="login">
			<img class="logo" src="../../assets/_img/logo/logo-main-alt.svg" alt="Harmless Key"/>
			<h2>Sign in</h2>
			<p v-if="error" class="red"><i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}</p>
			<form v-if="!loading" v-on:submit.prevent>
				<button class="google mb-2" @click="googleSignIn()">
					Sign in with Google
				</button>
				<hr>
				<h4 class="text-center neutral-2">
					With email and password
				</h4>
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square dense
					autocomplete="username" 
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
				<button class="btn btn-block my-3" @click="signIn()">Sign In <i aria-hidden="true" class="fas fa-sign-in-alt"></i></button>

				<p class="text-center mb-1"><small><router-link to="/forgot-password">Forgot password?</router-link></small></p>
				<div class="text-center"><small>No account yet? <router-link to="/sign-up">Create one here.</router-link></small></div>
			</form>
			<hk-loader v-else prefix="Signing you in" noBackground />
		</div>

	</div>
</template>

<script>
	import { firebase, auth } from "src/firebase";
	import { mapActions } from "vuex";

	export default {
		name: "SignIn",
		data() {
			return {
				email: "",
				password: "",
				error: "",
				loading: false,
				browser: this.$store.getters.browser,
				user: this.$store.getters.user,
			}
		},
		preFetch({ store, redirect }) {
      		if(store.getters.user) {
				redirect('/content');
			}
		},
		methods: {
			...mapActions(["reinitialize", "setUser", "setUserInfo"]),
			async signIn() {
				this.loading = true
				await auth.signInWithEmailAndPassword(this.email, this.password).then(
					async (result) => {
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();
						this.$router.replace("/content");
					},
					(err) => {
						this.error = err.message;
						this.loading = false;
					}
				);
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();
				this.loading = true;
				if(this.browser === "Edge") {
					auth.signInWithRedirect(provider).then(async (result) => {
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();
						this.$router.replace("/content");
					}).catch((err) => {
						this.error = err.message;
						this.loading = false
					});
				} else {
					auth.signInWithPopup(provider).then(async (result) => {
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();
						this.$router.replace("/content");
					}).catch((err) => {
						this.error = err.message;
						this.loading = false
					});
				}
			},
		}
	}
</script>
