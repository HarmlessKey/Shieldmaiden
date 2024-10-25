<template>
	<div class="sign-up">
		<div id="login">
			<img class="logo" src="../assets/_img/logo/logo-cyan.svg" alt="Shieldmaiden" />
			<h2 class="mt-3">Create an account</h2>
			<p v-if="error" class="red">
				<i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}
			</p>

			<button class="google mt-2" @click="googleSignIn()">Sign up with Google</button>
			<hr />
			<ValidationObserver v-slot="{ handleSubmit, valid }">
				<q-form v-if="!loading" @submit="handleSubmit(signUp)">
					<h4 class="text-center neutral-2">With email and password</h4>

					<hk-input
						v-model="email"
						autocomplete="username"
						class="email mb-2"
						type="email"
						label="Email"
						name="Email"
						rules="required|email"
					/>
					<hk-input
						v-model="username"
						type="text"
						class="mb-2"
						label="Username"
						name="Username"
						maxlength="20"
						minlength="3"
						rules="required|alpha_num|max:20|min:3|username"
					/>

					<hk-input
						autocomplete="new-password"
						class="mb-2"
						type="password"
						placeholder="Password"
						v-model="password"
						name="password"
						rules="required|min:6"
						minlength="6"
					/>

					<hk-input
						autocomplete="new-password"
						class="mb-2"
						type="password"
						placeholder="Confirm Password"
						v-model="confirm_password"
						rules="required|confirmed:password|min:6"
						name="Confirm Password"
						minlength="6"
					/>

					<q-btn
						no-caps
						label="Sign Up"
						class="full-width"
						color="primary"
						type="submit"
						:disabled="!valid"
					/>
				</q-form>
				<hk-loader v-else prefix="Signing you up" noBackground />
			</ValidationObserver>
		</div>
	</div>
</template>

<script>
import { db, firebase, auth } from "src/firebase";
import { mapActions } from "vuex";

export default {
	data() {
		return {
			email: undefined,
			password: undefined,
			confirm_password: undefined,
			username: undefined,
			error: undefined,
			loading: false,
		};
	},
	methods: {
		...mapActions(["reinitialize", "setUser", "setUserInfo"]),
		async createUser(uid) {
			let user = {
				username: this.username,
				email: this.email,
				created: firebase.database.ServerValue.TIMESTAMP,
			};

			await db.ref(`users/${uid}`).update(user);

			// Save searchable results in search_user
			await db.ref(`search_users`).child(uid).set({
				username: this.username.toLowerCase(),
				email: this.email.toLowerCase(),
			});
		},
		signUp: function () {
			this.loading = true;
			auth.createUserWithEmailAndPassword(this.email, this.password).then(
				// eslint-disable-next-line
				async (result) => {
					await this.createUser(result.user.uid);
					await this.setUser(result.user);
					await this.setUserInfo();
					await this.reinitialize();

					this.$gtm.trackEvent({
						event: "sign-up",
						method: "Email and Password",
					});

					this.$emit("sign-up", "success");

					if (this.$route.name === "signUp") {
						this.$router.replace("/content");
					}
				},
				(err) => {
					this.$emit("sign-up", err.message);
					this.error = err.message;
					this.loading = false;
				}
			);
		},
		googleSignIn() {
			const provider = new firebase.auth.GoogleAuthProvider();

			auth
				.signInWithPopup(provider)
				.then(() => {
					this.$gtm.trackEvent({
						event: "sign-up",
						method: "Google",
					});

					this.$emit("sign-up", "success");

					if (this.$route.name === "signUp") {
						this.$router.replace("/set-username");
					}
				})
				.catch((err) => {
					this.$emit("sign-up", err.message);
					this.error = err.message;
				});
		},
	},
};
</script>

<style lang="scss" scoped>
.sign-up {
	width: 100%;
	height: 100%;
	max-width: 360px;
	padding-top: 40px;
	overflow-y: auto;
	margin: auto;
}
</style>
