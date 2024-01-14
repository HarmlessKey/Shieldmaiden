	<template>
	<div class="login-container">
		<div id="login">
			<img class="logo" src="../../assets/_img/logo/logo-main-alt.svg" alt="Harmless Key"/>
			<h2>Create an account</h2>
			<p v-if="error" class="red"><i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}</p>
					
			<button class="google mt-2" @click="googleSignIn()">
				Sign up with Google
			</button>
			<hr>
			<ValidationObserver v-slot="{ handleSubmit, valid }">
				<q-form v-if="!loading" @submit="handleSubmit(signUp)">

					<h4 class="text-center neutral-2">
						With email and password
					</h4>
					
					<ValidationProvider 
						rules="required|email" 
						name="Email" 
						v-slot="{ errors, invalid, validated}"
					>
						<hk-input
							autocomplete="username" 
							class="email mb-2"
							type="email" 
							label="Email" 
							v-model="email"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<ValidationProvider 
						rules="required|alpha_num|max:20|min:3|username"
						name="Username" 
						v-slot="{ errors, invalid, validated }"
					>
						<hk-input 
							type="text" 
							class="mb-2"
							label="Username" 
							maxlength="20"
							minlength="3"
							v-model="username"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					
					</ValidationProvider>

					<ValidationProvider
						rules="required"
						vid="password"
						name="Password"
						v-slot="{ errors, invalid, validated}"
					>
						<hk-input
							autocomplete="new-password" 
							class="mb-2"
							type="password"
							placeholder="Password" 
							v-model="password" 
							name="password"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<ValidationProvider
						rules="required|confirmed:password"
						name="Confirm Password"
						v-slot="{ errors, invalid, validated}"
					>
						<hk-input
							autocomplete="new-password"
							class="mb-2"
							type="password" 
							placeholder="Confirm Password" 
							v-model="confirm_password"
							name="confirm-password"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<q-btn no-caps label="Sign Up" class="full-width" color="primary" type="submit" :disabled="!valid" />
				</q-form>
				<hk-loader v-else prefix="Signing you up" noBackground />
			</ValidationObserver>
		</div>
	</div>
</template>

<script>
	import { db, firebase, auth } from 'src/firebase';
	import { mapActions } from 'vuex';

	export default {
		data: function() {
			return {
				email: undefined,
				password: undefined,
				confirm_password: undefined,
				username: undefined,
				error: undefined,
				loading: false,
			};
		},
		preFetch({ store, redirect }) {
			if(store.getters.user) {
				redirect('/content');
			}
		},
		methods: {
			...mapActions(["reinitialize", "setUser", "setUserInfo"]),
			async createUser(uid) {
				let user = {
					username: this.username,
					email: this.email
				}

				await db.ref(`users/${uid}`).update(user);

				//Save searchable results in search_user
				await db.ref(`search_users`).child(uid).set({
					username: this.username.toLowerCase(),
					email: this.email.toLowerCase()
				});
					
			},
			signUp: function() {
				this.loading = true
				auth.createUserWithEmailAndPassword(this.email, this.password).then(
					// eslint-disable-next-line
					async result => {
						await this.createUser(result.user.uid);
						await this.setUser(result.user);
						await this.setUserInfo();
						await this.reinitialize();
						this.$router.replace("/content");
					},
					err => {
						this.error = err.message;
						this.loading = false;
					});
			},
			googleSignIn() {
				const provider = new firebase.auth.GoogleAuthProvider();

				auth.signInWithPopup(provider).then(() => {
					this.$router.replace('/set-username');
				}).catch((err) => {
					this.error = err.message;
				});
			},
		}
	};
</script>