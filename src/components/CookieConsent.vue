<template>
	<q-dialog v-model="show_banner" position="bottom" persistent seamless full-width>
		<div class="cookie-consent">
			<div class="mb-2">
				Our website uses first party cookies to improve your browsing experience. You can choose to
				accept or deny these cookies.
				<router-link to="/cookies">More about our cookies</router-link>
			</div>
			<div class="flex justify-end mb-2">
				<button class="btn bg-neutral-2 neutral-7" @click="setConsent(false)">Deny all</button>
				<button class="btn ml-2" @click="setConsent(true)">Accept all</button>
			</div>
		</div>
	</q-dialog>
</template>

<script>
import { Cookies } from "quasar";

export default {
	name: "CookieConsent",
	data() {
		return {
			show_banner: !Cookies.has("cookie_consent"),
			analytics_cookies: ["_ga", "_ga_KDSNCEK6X7", "_gid", "_gat"],
		};
	},
	methods: {
		setConsent(value) {
			Cookies.set("cookie_consent", value, { expires: 1000, path: "/" });

			// Delete existing analytics cookies
			if (!value) {
				for (const cookie of this.analytics_cookies) {
					Cookies.remove(cookie, { domain: ".shieldmaiden.app", path: "/" });
				}
			} else {
				this.$gtm.enable(true);
			}
			this.show_banner = false;
		},
	},
};
</script>

<style lang="scss" scoped>
.cookie-consent {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 10px 15px 0 15px;
	background-color: $neutral-1;
	color: $neutral-11;
}
</style>
