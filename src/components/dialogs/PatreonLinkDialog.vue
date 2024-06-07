<template>
	<hk-dialog ref="dialog" persistent position="top" header="Link your Patreon account" class="mt-3">
		<h2 class="mb-1">Access your benefits</h2>
		<p>
			To access the benefits of your subscription, you have to link your Patreon account to your
			Shieldmaiden account.
		</p>
		You can link your accounts at any time from your profile page, or use the button below to link
		them directly.

		<PatreonLinkButton slot="footer" />
	</hk-dialog>
</template>

<script>
import PatreonLinkButton from "../PatreonLinkButton.vue";

export default {
	name: "PatreonLinkDialog",
	components: {
		PatreonLinkButton,
	},
	data() {
		return {};
	},
	computed: {},
	methods: {
		show() {
			this.$refs.dialog.show();
		},
		hide() {
			this.$refs.dialog.hide();
		},
	},
};
</script>

<style lang="scss" scoped>
::v-deep {
	.hk-card {
		border-radius: $border-radius !important;
		margin-top: 75px;
	}
}
</style>
