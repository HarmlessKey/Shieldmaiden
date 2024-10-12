<template>
	<div id="login">
		<img class="logo" src="../assets/_img/logo/logo-cyan.svg" alt="Shieldmaiden" />
		<h2 class="mt-3">Sign in</h2>
		<p v-if="message">{{ message }}</p>
		<p v-if="error" class="red">
			<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}
		</p>
		<button class="google mb-2" @click="googleSignIn()">Sign in with Google</button>
		<hr />
		<ValidationObserver v-if="!loading" v-slot="{ handleSubmit }">
			<q-form @submit="handleSubmit(signIn)" greedy>
				<h4 class="text-center neutral-2">With email and password</h4>
				<hk-input
					v-model="email"
					autocomplete="username"
					type="text"
					name="email"
					placeholder="Email"
					class="email"
				/>
				<hk-input
					v-model="password"
					placeholder="password"
					autocomplete="password"
					:type="showPw ? 'text' : 'password'"
				>
					<q-icon
						slot="append"
						:name="showPw ? 'fas fa-eye' : 'fas fa-eye-slash'"
						class="cursor-pointer"
						@click="showPw = !showPw"
					/>
				</hk-input>
				<button class="btn btn-block my-3" type="submit">
					Sign In <i aria-hidden="true" class="fas fa-sign-in-alt" />
				</button>

				<p class="text-center mb-1">
					<small><router-link to="/forgot-password">Forgot password?</router-link></small>
				</p>
				<div class="text-center">
					<small>No account yet? <router-link to="/sign-up">Create one here.</router-link></small>
				</div>
			</q-form>
		</ValidationObserver>
		<hk-loader v-else prefix="Signing you in" noBackground />
	</div>
</template>

<script>
import { firebase, auth } from "src/firebase";
import { mapActions } from "vuex";

export default {
	name: "SignIn",
	props: {
		message: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			showPw: false,
			email: "",
			password: "",
			error: "",
			loading: false,
			browser: this.$store.getters.browser,
			user: this.$store.getters.user,
		};
	},
	preFetch({ store, redirect }) {
		if (store.getters.user) {
			redirect("/content");
		}
	},
	methods: {
		...mapActions(["reinitialize", "setUser", "setUserInfo"]),
		async signIn() {
			this.loading = true;
			await auth.signInWithEmailAndPassword(this.email, this.password).then(
				async (result) => {
					await this.setUser(result.user);
					await this.setUserInfo();
					await this.reinitialize();

					this.$emit("sign-in", "success");

					if (this.$route.name === "signIn") {
						this.$router.replace("/content");
					}
				},
				(err) => {
					this.$emit("sign-in", err.message);

					this.error = err.message;
					this.loading = false;
				}
			);
		},
		googleSignIn() {
			const provider = new firebase.auth.GoogleAuthProvider();
			this.loading = true;
			if (this.browser === "Edge" || this.browser === "Safari") {
				auth
					.signInWithRedirect(provider)
					.then(async (result) => {
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();

						this.$emit("sign-in", "success");

						if (this.$route.name === "signIn") {
							this.$router.replace("/content");
						}
					})
					.catch((err) => {
						this.$emit("sign-in", err.message);
						this.error = err.message;
						this.loading = false;
					});
			} else {
				auth
					.signInWithPopup(provider)
					.then(async (result) => {
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();

						this.$emit("sign-in", "success");

						if (this.$route.name === "signIn") {
							this.$router.replace("/content");
						}
					})
					.catch((err) => {
						this.$emit("sign-in", err.message);
						this.error = err.message;
						this.loading = false;
					});
			}
		},
	},
};
</script>
