<template>
	<div class="container">
		<template v-if="!userInfo">
			<b-card header="Username">
				<p>To continue, please first enter a username.</p>
				<b-input-group>
					<b-form-input type="text" 
						autocomplete="off"
						placeholder="Username" 
						max-length="1" 
						v-validate="'required|alpha_num|min:3'"
						data-vv-as="Username" 
						name="username"
						v-model="username" @keyup.native="checkUsername()" />
					<b-input-group-append>
						<button class="btn" :class="{
							'disabled': check == 'unavailable' || errors.has('username'), 
							}" @click="setUsername()"><i class="fas fa-check"></i> Save</button>
					</b-input-group-append>
				</b-input-group>
				<p class="validate red" v-if="errors.has('username')">{{ errors.first('username') }}</p>
				<p v-if="username">
					<span :class="{'green': check == 'available', 'red': check == 'unavailable'}">{{ username }}</span> is {{ check }}
				</p>
			</b-card>
		</template>

		<template v-else>
			<b-card header="Your Profile">
				<b-row>
					<b-col md="2" v-if="user.photoURL">
						<div class="img" :style="{'background-image': 'url(' + user.photoURL + ')'}"></div>
					</b-col>
					<b-col>
						<h2 v-if="userInfo.username">{{ userInfo.username}}</h2>
						<p class="info">
							<span class="gray-hover">Created:</span> {{ makeDate(user.metadata.creationTime) }}<br/>
							<span class="gray-hover">Last login:</span> {{ makeDate(user.metadata.lastSignInTime) }}
						</p>
					</b-col>
				</b-row>
			</b-card>

			<b-card header="Data">
				<b-row>
					<b-col md="4" v-if="campaigns">
						<h2>
							Campaigns: 
							<span :class="{ 'green': true, 'red': Object.keys(campaigns).length == 2 }">{{ Object.keys(campaigns).length }} </span>
						</h2>
					</b-col>
					<b-col md="4" v-if="players">
						<h2>
							Players:
							<span :class="{ 'green': true, 'red': Object.keys(players).length == 6 }">{{ Object.keys(players).length }} </span>
						</h2>
					</b-col>
					<b-col md="4" v-if="npcs">
						<h2>
							NPC's: 
							<span :class="{ 'green': true, 'red': Object.keys(npcs).length == 6 }">{{ Object.keys(npcs).length }} </span>
						</h2>
					</b-col>
				</b-row>
			</b-card>

			<b-card header="Actions">
				<p v-if="resetError" class="red"><i class="fas fa-exclamation-triangle"></i> {{ resetError }}</p>
				<p v-if="resetSuccess" class="green"><i class="fas fa-check"></i> {{ resetSuccess }}</p>
				<p><a @click="resetPassword()"><i class="fas fa-redo-alt"></i> Reset Password</a></p>
				<p><router-link to="/profile/delete-account" class="red"><i class="fas fa-trash-alt"></i> Delete account</router-link></p>
			</b-card>
		</template>
	</div>
</template>

<script>
	import { db, auth } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Profile',
		metaInfo: {
			title: 'Profile'
		},
		data() {
			return {
				error: '',
				resetError: undefined,
				resetSuccess: undefined,
				username: undefined,
				check: 'available',
			}
		},
		firebase() {
			return {
				usernames: db.ref('users')
			}
		},
		computed: {
			...mapGetters([
				'campaigns',
				'players',
				'npcs',
				'userInfo',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			makeDate(input) {
				let monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				let d = new Date(input)
				let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
				let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
				let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

				let time = hours + ":" + minutes + ":" + seconds;
				let date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				return date + " - " + time;
			},
			resetPassword() {
				var vm = this;
				var emailAddress = this.user.email;

				auth.sendPasswordResetEmail(emailAddress).then(function() {
					// Email sent.
					vm.resetSuccess = 'An email was sent to ' + emailAddress + ' with a link to reset your password.';
					vm.resetError = undefined;
				}).catch(function(error) {
					// An error happened.
					vm.error = err.message;
				});
			},
			checkUsername() {
				for (var i in this.usernames) {
					var user = this.usernames[i]
					if (user.username.toLowerCase() == this.username.toLowerCase()) {
						this.check = 'unavailable'
					} else {
						this.check = 'available'
					} 
				}
			},
			setUsername() {
				this.$validator.validateAll().then((result) => {
					if (result && this.check == 'available') {
						db.ref(`users/${this.user.uid}/username`).set(this.username);
						this.$snotify.success('Username saved.', 'Critical hit!', {
							position: "rightTop"
						});
						this.$validator.reset();
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.img {
		width: 100px;
		height: 100px;
		margin-bottom: 20px;
		border-radius: 50%;
		display: block;
		background-size: cover;
		background-position: center top;
	}
	.info {
		span {
			width: 80px;
			display: inline-block;
		}
	}
</style>