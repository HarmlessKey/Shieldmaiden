<template>
	<div>
		<q-input
			v-if="controlUser"
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			label="Controlled by"
			:value="controlUser.username"
			readonly
		>
			<button slot="append" class="btn btn-sm bg-neutral-5" @click="removeControl()">
				<i aria-hidden="true" class="fas fa-times red" />
				<q-tooltip anchor="top middle" self="center middle"> Remove control </q-tooltip>
			</button>
		</q-input>
		<div v-else>
			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Give control to player"
				v-model="findUser"
				autocomplete="off"
				@keydown.enter.prevent.stop="find_user()"
				placeholder="Search for username or email"
				:error="foundUser === false && findUser !== ''"
				:error-message="`User not found`"
			>
				<button slot="append" class="btn btn-sm bg-neutral-5" @click="find_user()">
					<i aria-hidden="true" class="fas fa-search" />
				</button>

				<hk-popover slot="after" header="Give player control">
					<q-icon name="info" />
					<template #content>
						Give control over this character to another user. Let your players change their base
						stats themselves, so it is less work for you.<br />
						You can always revert this and you also keep control yourself.<br />
						Players need control over character to be able to send in damage or healing request
						during an encounter.
					</template>
				</hk-popover>
			</q-input>
			<div v-if="foundUser && findUser !== ''" class="bg-neutral-5 p-2">
				<p>
					Username: <strong>{{ Object.values(foundUser)[0].username }}</strong
					><br />
				</p>
				<button class="btn btn-block bg-green" @click.prevent="confirmGiveControl()">
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
	props: {
		playerId: {
			type: String,
			required: true,
		},
		control: {
			type: String,
		},
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			controlUser: undefined,
			findUser: undefined,
			foundUser: undefined,
		};
	},
	beforeMount() {
		this.fetch_control();
	},
	methods: {
		...mapActions("players", ["give_out_control", "remove_control"]),
		fetch_control() {
			if (this.control) {
				let user = db.ref(`search_users/${this.control}`);

				user.on("value", (snapshot) => {
					this.controlUser = {
						email: snapshot.val().email,
						username: snapshot.val().username,
					};
				});
			}
		},
		find_user() {
			if (this.findUser) {
				let email = db
					.ref(`search_users`)
					.orderByChild("email")
					.equalTo(this.findUser.toLowerCase());
				let username = db
					.ref(`search_users`)
					.orderByChild("username")
					.equalTo(this.findUser.toLowerCase());

				// Check username
				username.once("value", (snapshot) => {
					if (snapshot.exists()) {
						this.foundUser = snapshot.val();
						return;
					} else {
						// Check email
						email.once("value", (result) => {
							if (result.val()) {
								this.foundUser = result.val();
								return;
							} else {
								this.foundUser = false;
							}
						});
					}
				});
			}
		},
		confirmGiveControl() {
			this.$snotify.success(
				'Are you sure you want to give "' +
					Object.values(this.foundUser)[0].username +
					'" control over this character?',
				"Give out control",
				{
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.giveControl();
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		async giveControl() {
			let user_id = Object.keys(this.foundUser)[0];

			await this.give_out_control({
				id: this.playerId,
				user_id,
			});
			this.controlUser = {
				username: Object.values(this.foundUser)[0].username,
				email: Object.values(this.foundUser)[0].email,
			};
			this.$emit("set", user_id);
		},
		async removeControl() {
			await this.remove_control({
				uid: this.control,
				id: this.playerId,
				owner_id: this.userId,
			});
			this.controlUser = undefined;
			this.$emit("remove");
		},
	},
};
</script>
