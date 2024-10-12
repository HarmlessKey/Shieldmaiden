<template>
	<div class="login-container delete">
		<div id="login" class="text-center">
			<img class="logo" src="../../assets/_img/logo/logo-cyan.svg" alt="Shieldmaiden" />
			<h2 class="mt-4">Are you sure you want to delete your account?</h2>
			<p class="mb-4">All your data will permanently be deleted.</p>
			<div class="d-flex justify-content-center">
				<router-link class="btn bg-neutral-4 mr-2" to="/profile"
					><i aria-hidden="true" class="fas fa-times"></i> Cancel</router-link
				>
				<a class="btn bg-red" @click="deleteUser()"
					><i aria-hidden="true" class="fas fa-trash-alt"></i> Delete account</a
				>
			</div>
		</div>
		<q-dialog v-model="sign_in_dialog">
			<SignIn
				@sign-in="handleSignIn"
				message="This is a sensitive action, please login again first"
			/>
		</q-dialog>
	</div>
</template>

<script>
import { auth } from "src/firebase";
import { mapActions } from "vuex";
import SignIn from "src/components/SignIn.vue";

export default {
	name: "DeleteAccount",
	components: {
		SignIn,
	},
	data() {
		return {
			email: undefined,
			password: undefined,
			sign_in_dialog: false,
		};
	},
	methods: {
		...mapActions(["sign_out"]),
		deleteUser() {
			var user = auth.currentUser;

			user
				.delete()
				.then(() => {
					// USER DATA IS DELETED WITH A FIREBASE CLOUD FUNCTION
					this.sign_out();
					this.$router.replace("/");
				})
				.catch((error) => {
					console.error(error);
					this.sign_in_dialog = true;
				});
		},
		handleSignIn(e) {
			if (e === "success") {
				this.sign_in_dialog = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.warning {
	color: $neutral-1;
	padding: 10px;
}
</style>
