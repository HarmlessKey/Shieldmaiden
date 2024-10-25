<template>
	<div class="login-container">
		<SignUp />
	</div>
</template>

<script>
import SignUp from "src/components/SignUp.vue";

export default {
	name: "SignUpPage",
	components: {
		SignUp,
	},
	preFetch({ store, redirect }) {
		if (store.getters.user) {
			redirect("/content");
		}
	},
};
</script>
