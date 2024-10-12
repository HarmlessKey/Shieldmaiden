<template>
	<div class="login-container">
		<SignIn />
	</div>
</template>

<script>
import SignIn from "src/components/SignIn.vue";

export default {
	name: "SignInPage",
	components: {
		SignIn,
	},
	preFetch({ store, redirect }) {
		if (store.getters.user) {
			redirect("/content");
		}
	},
};
</script>
