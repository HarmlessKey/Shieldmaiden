<template>
	<div id="login">
		<h1>Harmless Key</h1>
		<p v-if="error" class="red"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
		<p v-if="success" class="green"><i class="fas fa-check"></i> {{ success }}</p>
		
		<b-form-input type="text" v-model="email" name="email" placeholder="Email" class="email"></b-form-input>
		<button class="btn btn-block mt-3" @click="resetPassword()">Reset password <i class="fas fa-redo fa-flip-horizontal"></i></button>

		<p class="text-center mt-3"><small><router-link to="/sign-in">Sign in.</router-link></small></p>
	</div>
</template>

<script>
	import { auth } from '@/firebase'

	export default {
		name: 'login',
		data() {
			return {
				email: '',
				password: '',
				error: undefined,
				success: undefined,
			}
		},
		methods: {
			resetPassword() {
				var vm = this;

				auth.sendPasswordResetEmail(this.email).then(function() {
					// Email sent.
					vm.success = 'An email was sent to ' + vm.email + ' with a link to reset your password.';
					vm.error = undefined;
				}).catch(function(err) {
					// An error happened.
					vm.error = err.message;
				});
			},
		},
	}
</script>

<style lang="scss" scoped>

</style>