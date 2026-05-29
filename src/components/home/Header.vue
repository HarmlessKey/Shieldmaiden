<template>
	<header class="home-header" :class="{ scrolled: scrolled }">
		<div class="container">
			<div class="d-flex items-center">
				<img
					class="logo"
					height="56"
					:src="require(`../../assets/_img/logo/${logo}`)"
					alt="Shieldmaiden"
					fetchpriority="high"
				/>
			</div>
			<div class="d-flex justify-content-end items-center">
				<router-link class="btn btn-sm btn-clear" to="/pricing">
					Pricing
					<i class="fas fa-coins ml-1" aria-hidden="true" />
				</router-link>
				<a
					class="btn btn-sm btn-clear"
					href="https://discord.gg/dU59jgvcuq"
					target="_blank"
					rel="noopener"
					aria-label="Join our Discord"
				>
					<i class="fab fa-discord" aria-hidden="true" />
					<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
						Join our Discord
					</q-tooltip>
				</a>
				<UserMenu />
			</div>
		</div>
	</header>
</template>

<script>
import UserMenu from "../header/UserMenu.vue";

export default {
	name: "HeaderHome",
	components: {
		UserMenu,
	},
	props: {
		scrolled: {
			type: [Boolean],
			default: false,
		},
	},
	data() {
		return {
			environment: process.env.VUE_APP_ENV_NAME,
		};
	},
	computed: {
		logo() {
			return this.environment !== "live"
				? "logo-main-icon-left-red.svg"
				: "logo-main-icon-left.svg";
		},
	},
	methods: {},
};
</script>
