<template>
	<div id="signin">
		<h2>Sign in to Your Account</h2>
		<form v-on:submit.prevent>
			<input class="form-control" type="email" placeholder="Email" v-model="email">
			<input class="form-control" type="password" placeholder="Password" v-model="password">
			<button type="submit" class="btn btn-block" v-on:click="signUp">Sign Up</button>
		</form>
	</div>
</template>

<script>
	import Firebase from "firebase";
	export default {
		data: function() {
			return {
				email: "",
				password: ""
			};
		},
		methods: {
			signUp: function() {
				Firebase.auth()
				.createUserWithEmailAndPassword(this.email, this.password)
				.then(
					user => {
						this.$router.replace('my-content');
					},
					error => {
						alert(error.message);
					}
					);
			}
		}
	};
</script>

<style lang="css" scoped>
#login {
	padding-top:50px;
	width: 300px;
	margin:auto;
}
input {
	margin-bottom:15px;
}
</style>