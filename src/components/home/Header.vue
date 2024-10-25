<template>
	<header :class="{ scrolled: scrolled }">
		<div class="container">
			<div class="d-flex items-center">
				<img class="logo" :src="require(`../../assets/_img/logo/${logo}`)" alt="Shieldmaiden" />
				<!-- <span class="dot-app">.app</span> -->
			</div>
			<UserMenu> Account </UserMenu>
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
			return this.environment !== "live" ? "logo-main-icon-left.svg" : "logo-main-icon-left.svg";
		},
	},
	methods: {},
};
</script>

<style lang="scss" scoped>
header {
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
		}
		.dot-app {
			margin-left: 3px;
			opacity: 0.3;
			font-size: 12px;
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
	header {
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
	header {
		height: 200px;

		.container {
			.logo {
				height: 56px;
			}
		}
	}
}
</style>
