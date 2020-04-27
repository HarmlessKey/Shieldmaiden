<template>
	<div class="">
		<p>
			Give control over this character to another user. Let your players change their base stats themselves, so it is less work for you.<br/> 
			You can always revert this and you also keep control yourself.<br/>
			Players need control over character to be able to send in damage or healing request during an encounter.
		</p>
		
		<div v-if="controlUser">
			<a @click="removeControl()" v-b-tooltip.hover title="Remove Control">
				<i class="fas fa-times red"></i>
			</a> 
			Control given to <span class="green">{{ controlUser.username }}</span> ({{ controlUser.email }}).
		</div>
		<div v-else>
			<label>Enter the full username or email.</label>
			<b-form inline>
				<b-form-input type="text" autocomplete="off"  class="mr-2 mt-2" v-model="findUser" placeholder="username or email" />

				<a class="btn mt-2" variant="primary" @click="find_user()">Find user</a>
			</b-form>
			
			<p v-if="foundUser === false && findUser != ''" class="red">User {{ findUser }} not found</p>
			<div v-else-if="foundUser && findUser !== ''">
				<hr>
				<h4>User found</h4>
				<p> 
					Username: {{ Object.values(foundUser)[0].username }}<br/>
					Email: {{ Object.values(foundUser)[0].email }}
				</p>
				<button class="btn mt-3 bg-green" @click="confirmGiveControl()">
					Give control to {{ Object.values(foundUser)[0].username }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'GiveCharacterControl',
		props: [
			'playerId',
			'control'
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				controlUser: undefined,
				findUser: undefined,
				foundUser: undefined,
			}
		},
		computed: {
		},
		beforeMount() {
			this.fetch_control()
		},
		methods: {
			fetch_control() {
				let player = db.ref(`players/${this.userId}/${this.playerId}/control`);
				player.on('value' , (snapshot) => {
					let key = snapshot.val()

					if(key) {
						let user = db.ref(`users/${key}`)

						user.on('value' , (snapshot) => {
							this.controlUser = {
								email : snapshot.val().email,
								username: snapshot.val().username,
							}
						});
					}
				});
			},
			find_user() {
				let email = db.ref(`search_users`).orderByChild('email').equalTo(this.findUser.toLowerCase());
				let username = db.ref(`search_users`).orderByChild('username').equalTo(this.findUser.toLowerCase());

				// Check username
				username.on('value' , (snapshot) => {
					if(snapshot.exists()) {
						this.foundUser = snapshot.val();
						return
					} else {
						// Check email
						email.on('value' , (snapshot) => {
							if(snapshot.val()) {
								this.foundUser = snapshot.val();
								return
							} else {
								this.foundUser = false;
							}
						});
					}
				});
			},
			confirmGiveControl() {
				this.$snotify.success('Are you sure you want to give "' + this.foundUser.username + '" control over this character?', 'Give out control', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.giveControl(); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			giveControl() {
				let userKey = Object.keys(this.foundUser)[0];

				db.ref(`players/${this.userId}/${this.playerId}/control`).set(userKey);
				db.ref(`character_control/${userKey}/${this.playerId}`).set({
					user: this.userId,
				});
			},
			removeControl() {
				db.ref(`character_control/${this.control}/${this.playerId}`).remove();
				db.ref(`players/${this.userId}/${this.playerId}/control`).remove();
				this.controlUser = undefined;
			},
		}
	};
</script>

<style lang="scss" scoped>

</style>
