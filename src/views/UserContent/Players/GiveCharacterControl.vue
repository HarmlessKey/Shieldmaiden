<template>
	<div>
		<p>
			Give control over this character to another user. Let your players change their base stats themselves, 
			so it is less work for you.<br/> 
			You can always revert this and you also keep control yourself.<br/>
			Players need control over character to be able to send in damage or healing request during an encounter.
		</p>
		
		<div v-if="controlUser">
			<a @click="removeControl()">
				<i aria-hidden="true" class="fas fa-times red"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Remove control
				</q-tooltip>
			</a> 
			Control given to <span class="green">{{ controlUser.username }}</span> ({{ controlUser.email }}).
		</div>
		<div v-else>
			<label>Enter the full username or email.</label>
			<q-input
				:dark="$store.getters.theme === 'dark'" filled square dense
				label="Username or email"
				v-model="findUser"
				autocomplete="off"
				@keydown.enter.prevent.stop="find_user()"
			>
				<q-icon slot="append" size="xs" class="blue pointer" @click="find_user()" name="fas fa-search">
					<q-tooltip anchor="top middle" self="center middle">
						Search
					</q-tooltip>
				</q-icon>
			</q-input>
			
			<p v-if="foundUser === false && findUser != ''" class="red">User {{ findUser }} not found</p>
			<div v-else-if="foundUser && findUser !== ''">
				<hr>
				<h4>User found</h4>
				<p> 
					Username: {{ Object.values(foundUser)[0].username }}<br/>
					Email: {{ Object.values(foundUser)[0].email }}
				</p>
				<button class="btn mt-3 bg-green" @click.prevent="confirmGiveControl()">
					Give control to {{ Object.values(foundUser)[0].username }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from "src/firebase";
	import { mapActions } from "vuex";

	export default {
		name: "GiveCharacterControl",
		props: [
			"playerId",
			"control"
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				controlUser: undefined,
				findUser: undefined,
				foundUser: undefined,
			}
		},
		beforeMount() {
			this.fetch_control();
		},
		methods: {
			...mapActions("players", ["give_out_control", "remove_control"]),
			fetch_control() {
				if(this.control) {
					let user = db.ref(`search_users/${this.control}`)

					user.on("value" , (snapshot) => {
						this.controlUser = {
							email : snapshot.val().email,
							username: snapshot.val().username,
						}
					});
				}
			},
			find_user() {
				let email = db.ref(`search_users`).orderByChild("email").equalTo(this.findUser.toLowerCase());
				let username = db.ref(`search_users`).orderByChild("username").equalTo(this.findUser.toLowerCase());

				// Check username
				username.once("value" , (snapshot) => {
					if(snapshot.exists()) {
						this.foundUser = snapshot.val();
						return;
					} else {
						// Check email
						email.once('value' , (result) => {
							if(result.val()) {
								this.foundUser = result.val();
								return;
							} else {
								this.foundUser = false;
							}
						});
					}
				});
			},
			confirmGiveControl() {
				this.$snotify.success('Are you sure you want to give "' + Object.values(this.foundUser)[0].username + '" control over this character?', 'Give out control', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.giveControl(); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			async giveControl() {
				let user_id = Object.keys(this.foundUser)[0];

				await this.give_out_control({
					id: this.playerId,
					user_id
				});
				this.controlUser = {
					username: Object.values(this.foundUser)[0].username,
					email: Object.values(this.foundUser)[0].email,
				}
			},
			async removeControl() {
				await this.remove_control({ 
					uid: this.userId, 
					id: this.playerId, 
					owner_id: this.control 
				});
				this.controlUser = undefined;
			},
		}
	};
</script>