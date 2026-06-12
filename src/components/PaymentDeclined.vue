<template>
	<q-banner v-if="declined_payment" class="bg-orange mb-3 white" rounded inline-actions>
		<q-icon slot="avatar" name="fas fa-ban" size="sm" />
		<strong>Payment declined</strong><br />
		<small class="declined">
			Your last payment on Patreon was declined, your subscription will automatically be cancelled
			on <strong>{{ makeDate(userInfo.patron.pledge_end) }}</strong
			>.<br />
			Go to
			<a href="https://www.patreon.com/join/shieldmaidenapp" target="_blank" rel="noopener"
				>patreon.com</a
			>
			to check your payment details.
		</small>
		<template slot="action">
			<q-btn
				flat
				color="white"
				no-caps
				icon="fas fa-times"
				size="sm"
				padding="sm"
				@click="hide_declined = true"
			/>
		</template>
	</q-banner>
	<q-banner v-else-if="pending_payment" class="bg-blue mb-3 white" rounded inline-actions>
		<q-icon slot="avatar" name="fas fa-sync" size="sm" />
		<strong>Payment pending</strong><br />
		<small>
			Thanks for your subscription! We're still waiting on data from Patreon, this might take a few
			minutes.<br />
			It might be needed to refresh the page for your subscription to update.
		</small>
		<template slot="action">
			<q-btn
				flat
				color="white"
				no-caps
				icon="fas fa-times"
				size="sm"
				padding="sm"
				@click="hide_pending = true"
			/>
		</template>
	</q-banner>
</template>

<script>
import { mapGetters } from "vuex";
import { general } from "src/mixins/general.js";

export default {
	data() {
		return {
			hide_declined: false,
			hide_pending: false,
		};
	},
	mixins: [general],
	computed: {
		...mapGetters(["tier", "userInfo"]),
		declined_payment() {
			return (
				!this.hide_declined &&
				this.tier &&
				this.userInfo &&
				this.userInfo.patron &&
				this.userInfo.patron.last_charge_status === "Declined" &&
				new Date(this.userInfo.patron.pledge_end) > new Date()
			);
		},
		pending_payment() {
			return (
				!this.hide_pending &&
				this.userInfo &&
				this.userInfo.patron &&
				this.userInfo.patron.last_charge_status === "Pending"
			);
		},
	},
};
</script>

<style lang="scss" scoped>
.declined {
	a {
		color: $neutral-1 !important;
		text-decoration: underline;
	}
}
</style>
