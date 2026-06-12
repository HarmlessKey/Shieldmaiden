<template>
	<a :href="patreonOauthUrl" rel="noopener" class="btn">
		<hk-icon icon="fa fa-link" />
		Link Patreon account
	</a>
</template>

<script>
export default {
	data() {
		return {
			client_id: process.env.VUE_APP_PATREON_CLIENT_ID,
			redirect_uri: `${window.origin}/link-patreon-account`,
			scope: encodeURIComponent("identity identity[email]"),
		};
	},
	computed: {
		patreonOauthUrl() {
			return `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&scope=${this.scope}`;
		},
	},
};
</script>
