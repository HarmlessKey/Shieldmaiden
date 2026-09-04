<template>
	<div>
		<router-view />
	</div>
</template>

<script>
export default {
	name: "RunCampaignLayout",
	preFetch({ store, redirect }) {
		if (!store.getters.user) {
			redirect("/sign-in");
		} else if (store.getters.userInfoLoaded && !store.getters.userInfo?.username) {
			redirect("/set-username");
		}
	},
	data() {
		return {};
	},
};
</script>
