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

<style lang="scss">
header.home-header {
	width: 100%;
	position: fixed;
	top: 0;
	z-index: 999;
	transition: all 0.3s ease-in-out;
	height: 80px;

	.container {
		padding: 0 20px;
		max-width: 1280px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100%;

		.logo {
			height: 36px;
			aspect-ratio: 156 / 36;
		}
		.dot-app {
			margin-left: 3px;
			opacity: 0.3;
			font-size: 12px;
		}
		.btn {
			box-sizing: border-box;
		}
	}

	&.scrolled {
		background-color: $neutral-11;
		height: $header-height;

		.container {
			.logo {
				height: 35px;
			}
		}
	}
}

@media only screen and (min-width: $md-breakpoint) {
	header.home-header {
		height: 145px;

		.container {
			.logo {
				height: 56px;
			}
		}
		.user-menu {
			font-size: 18px;

			&::v-deep {
				.user-btn {
					font-size: 25px;
				}
			}
		}
	}
}

@media only screen and (min-width: $lg-breakpoint) {
	header.home-header {
		height: 200px;

		.container {
			.logo {
				height: 56px;
			}
		}
	}
}
</style>
