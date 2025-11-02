<template>
	<div class="content" v-if="user">
		<template v-if="!userInfo || !userInfo.username">
			<hk-card header="Username">
				<div class="card-body">
					<h3>Thank you for creating a <strong>Shieldmaiden</strong> account!</h3>
					<p>To continue, please first enter a username.</p>
					<Field
						rules="required|alpha_num|min:3|max:20|username"
						name="Username"
						v-slot="{ errorMessage, meta }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							type="text"
							class="mb-2"
							autocomplete="off"
							label="Username"
							maxlength="20"
							minlength="3"
							v-model="username"
							:error="!meta.valid && meta.validated"
							:error-message="errorMessage"
						/>
						<button
							class="btn btn-block"
							:class="{ disabled: check === 'unavailable' || invalid }"
							@click="setUsername(!invalid)"
						>
							Save
						</button>
					</Field>
				</div>
			</hk-card>
		</template>
	</div>
</template>

<script>
import { db, firebase } from "src/firebase";
import { mapActions, mapGetters } from "vuex";

export default {
	name: "Username",
	data() {
		return {
			username: undefined,
			check: "available",
		};
	},
	preFetch({ store, redirect }) {
		if (!store.getters.user) {
			redirect("/sign-in");
		} else if (store.getters.userInfo.username) {
			redirect("/profile");
		}
	},
	computed: {
		...mapGetters(["user", "userInfo", "poster"]),
	},
	methods: {
		...mapActions(["reinitialize"]),
		async setUsername(valid) {
			if (valid && this.check === "available") {
				let user = {
					username: this.username,
					created: firebase.database.ServerValue.TIMESTAMP,
					email: this.user.email,
				};

				db.ref(`users/${this.user.uid}`).update(user);

				//Save searchable results in search_user
				db.ref(`search_users`).child(this.user.uid).set({
					username: this.username.toLowerCase(),
					email: this.user.email.toLowerCase(),
				});

				this.$gtm.trackEvent({
					event: "sign-up",
					method: "Set Username",
				});

				this.$snotify.success("Username saved.", "Critical hit!", {
					position: "centerTop",
				});
				await this.reinitialize();
				this.$router.replace("/profile");
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.content {
	max-width: 400px !important;

	h3 {
		font-size: 18px;
		max-width: 250px;
	}
}
</style>
