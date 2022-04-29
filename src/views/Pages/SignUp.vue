	<template>
	<div class="login-container">
		<div id="login">
			<img class="logo" src="../../assets/_img/logo/logo-main-alt.svg" alt="Harmless Key"/>
			<h2>Create an account</h2>
			<p v-if="error" class="red"><i aria-hidden="true" class="fas fa-exclamation-triangle"></i> {{ error }}</p>
			<ValidationObserver v-slot="{ handleSubmit, valid }">
				<q-form @submit="handleSubmit(signUp)">
					
					<ValidationProvider 
						rules="required|email" 
						name="Email" 
						v-slot="{ errors, invalid, validated}"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'" filled square dense 
							autocomplete="off" 
							class="email" 
							type="email" 
							placeholder="Email" 
							v-model="email"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<ValidationProvider 
						rules="required" 
						name="Username" 
						v-slot="{ errors, invalid, validated}"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'" filled square dense 
							autocomplete="off" 
							class="username" 
							type="username" 
							placeholder="Username" 
							v-model="username" @keyup.native="checkUsername()"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
						<p v-if="username" class="pl-1">
							<i aria-hidden="true" class="fas mr-1" :class="{'green fa-check': check == 'available', 'red fa-times': check === 'unavailable'}" />
								<strong>{{ username }}</strong> is {{ check }}
						</p>
					</ValidationProvider>

					<ValidationProvider
						rules="required"
						vid="password"
						name="Password"
						v-slot="{ errors, invalid, validated}"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'" filled square dense 
							autocomplete="off" 
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
						<q-input
							:dark="$store.getters.theme === 'dark'" filled square dense 
							autocomplete="off"
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
			</ValidationObserver>
			<a class="btn btn-block google mt-2" @click="googleSignIn()">
				<img src="~assets/_img/styles/google.png" alt="Google logo"/> 
				Sign up with Google
			</a>
		</div>
	</div>
</template>

<script>
	import { db, firebase, auth } from 'src/firebase';

	export default {
		data: function() {
			return {
				email: undefined,
				password: undefined,
				confirm_password: undefined,
				username: undefined,
				error: undefined,
				check: undefined

			};
		},
		methods: {
			checkUsername() {
				
				let username = db.ref(`search_users`).orderByChild('username').equalTo(this.username.toLowerCase());

				// Check username
				username.on('value' , (snapshot) => {
					if(snapshot.exists()) {
						this.check = 'unavailable';
						return
					} else {
						this.check = 'available';
					}
				});

			},
			setUsername(valid) {
				if (valid && this.check === "available") {
					let user = {
						username: this.username,
						email: this.user.email
					}

					db.ref(`users/${this.user.uid}`).update(user);

					//Save searchable results in search_user
					db.ref(`search_users`).child(this.user.uid).set({
						username: this.username.toLowerCase(),
						email: this.user.email.toLowerCase()
					});

					this.$snotify.success('Username saved.', 'Critical hit!', {
						position: "centerTop"
					});
					this.$router.replace('/profile');
				}
			},
			signUp: function() {
				auth.createUserWithEmailAndPassword(this.email, this.password).then(
					// eslint-disable-next-line
					user => {
						this.$router.replace('/set-username');
					},
					err => {
						this.error = err.message;
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