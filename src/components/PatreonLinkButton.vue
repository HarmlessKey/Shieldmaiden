<template>
	<a :href="patreonOauthUrl" rel="noopener" class="btn bg-patreon-red">
		<hk-icon icon="fa fa-link" />
		Link Patreon account
	</a>
</template>

<script>
export default {
	data() {
		return {
			client_id: process.env.VUE_APP_PATREON_CLIENT_ID,
			redirect_uri: "http://localhost:8080/link-patreon-account",
		};
	},
	computed: {
		patreonOauthUrl() {
			return `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}`;
		},
	},
};
</script>

<style lang="scss" scoped></style>
