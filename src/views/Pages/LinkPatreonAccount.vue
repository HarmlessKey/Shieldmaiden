<template>
	<hk-card header="Link your Patreon account">
		<hk-loader v-if="loading" />
		<div v-else class="card-body">
			<template v-if="$route.query?.code && !patreon_auth">
				<p>Something went wrong while fetching your Patreon account, please try again.</p>
				<PatreonLinkButton />
			</template>
			<template v-else>
				{{ patreon_auth.access_token }}
				<pre>{{ patreon_user?.data }}</pre>
			</template>
		</div>
	</hk-card>
</template>

<script>
import PatreonLinkButton from "src/components/PatreonLinkButton.vue";
import { mapGetters } from "vuex";

export default {
	name: "LinkPatreonAccount",
	components: {
		PatreonLinkButton,
	},
	data() {
		return {
			loading: false,
		};
	},
	async preFetch({ store, redirect, currentRoute }) {
		if (currentRoute.query?.code) {
			await store.dispatch("authenticate_patreon_user", currentRoute.query.code, { root: true });
			await store.dispatch("get_patreon_user", null, { root: true });
		}
	},
	computed: {
		...mapGetters(["patreon_auth", "patreon_user"]),
	},
};
</script>
