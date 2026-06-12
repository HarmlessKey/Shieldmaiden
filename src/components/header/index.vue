<template>
	<header id="header">
		<div
			class="header d-flex justify-content-between items-center"
			:class="{
				'hidden-sidebar': $route.meta.sidebar === false && !$route.name !== 'home',
			}"
		>
			<div class="d-flex items-center gap-1">
				<div class="menu" @click.stop="setSideSmallScreen(!$store.getters.side_small_screen)">
					<i
						aria-hidden="true"
						class="fas"
						:class="$store.getters.side_small_screen ? 'fa-times' : 'fa-bars'"
					/>
				</div>
				<router-link
					to="/"
					class="logo d-flex justify-content-start gap-1 items-center"
					:class="{ home: $route.meta.sidebar === false }"
					:tabindex="tabindex"
				>
					<img
						class="icon"
						src="../../assets/_img/logo/logo-icon-cyan.svg"
						alt="logo icon"
						:class="{ 'd-none d-md-block': environment !== 'live' }"
					/>
					<img
						class="wordmark d-none d-md-block"
						src="../../assets/_img/logo/logo-wordmark.svg"
						alt="Shieldmaiden"
					/>
				</router-link>
			</div>

			<!-- ENVIRONMENT LABEL -->
			<q-chip v-if="environment !== 'live'" color="red" icon="far fa-rocket" class="white">
				<span class="ml-1">{{ environment.capitalize() }}</span>
			</q-chip>

			<UserMenu>
				<button
					class="icon d-none d-md-block"
					aria-label="Keybindings"
					:tabindex="tabindex"
					@click="setDrawer({ show: true, type: 'drawers/Keybindings', data: { sm: true } })"
				>
					<i aria-hidden="true" class="fas fa-keyboard" />
					<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
						Keybindings
					</q-tooltip>
				</button>
				<button
					class="icon"
					aria-label="Compendium"
					:tabindex="tabindex"
					@click="setDrawer({ show: true, type: 'drawers/Compendium' })"
				>
					<i aria-hidden="true" class="fas fa-book-spells"></i>
					<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
						Compendium
					</q-tooltip>
				</button>
				<button
					v-if="user"
					aria-label="Live initiative link"
					class="icon"
					:tabindex="tabindex"
					@click="setDrawer({ show: true, type: 'PlayerLink' })"
				>
					<i aria-hidden="true" class="fas fa-share-alt"></i>
					<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
						Public initiative
					</q-tooltip>
				</button>
				<button
					class="icon roll"
					aria-label="Dice roller"
					v-shortkey="['r']"
					:tabindex="tabindex"
					@shortkey="setDrawer({ show: true, type: 'drawers/roll/index' })"
					@click="setDrawer({ show: true, type: 'drawers/roll/index' })"
				>
					<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
						Dice roller
					</q-tooltip>
				</button>
				<q-separator vertical :dark="$store.getters.theme === 'dark'" inset class="mx-1" />
			</UserMenu>
		</div>
	</header>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import UserMenu from "./UserMenu.vue";

export default {
	name: "Header",
	components: {
		UserMenu,
	},
	props: {
		maintenance: {
			type: [Boolean, String],
			default: false,
		},
	},
	data() {
		return {
			environment: process.env.VUE_APP_ENV_NAME,
			sign_in_dialog: false,
		};
	},
	computed: {
		...mapGetters(["user", "userInfo"]),
		tabindex() {
			return this.$route.name === "RunEncounter" ? -1 : 0;
		},
	},
	methods: {
		...mapActions(["setDrawer", "setSideSmallScreen"]),
	},
};
</script>

<style lang="scss" scoped>
.menu {
	display: block;
	cursor: pointer;
	width: 20px;
	text-align: center;
	line-height: 50px;
	height: 50px;
	padding: 0 15px;
}
.logo {
	position: absolute;
	left: 5px;
	top: 5px;
	height: 40px;
	transition: position 0.4s linear;

	.icon {
		height: 40px;
	}
	.wordmark {
		height: 13px;
	}
}
a.icon,
button.icon {
	cursor: pointer;
	font-size: 18px;
	text-align: center;
	height: 50px;
	width: 24px;
	padding: 0;
	background: none;
	border: none;
	color: $neutral-2;

	&:hover {
		color: $neutral-1 !important;
	}
	&.roll {
		background-image: url("../../assets/_img/logo/logo-icon-no-shield-gray-no-border.svg");
		background-size: 22px 22px;
		background-position: center;
		background-repeat: no-repeat;
	}
}

.area {
	height: 50px;
}

.header.hidden-sidebar {
	position: relative;

	.logo {
		left: 45px;
	}
}

@media only screen and (max-width: 575px) {
	.menu {
		font-size: 25px;
		width: 41px;
		padding: 0 10px;
	}
	a.icon,
	button.icon {
		font-size: 25px;
		width: 30px;

		&.roll {
			padding-left: 30px;
			background-size: 27px 27px;
			background-position: center;
			background-repeat: no-repeat;
		}
	}
	.user {
		padding: 10px 15px 10px 10px;

		.img {
			height: 30px;
			width: 30px;
		}
	}
}
[data-theme="light"] {
	a.icon.roll {
		background-image: url("../../assets/_img/logo/logo-icon-no-shield-gray-dark-no-border.svg");
	}
}
</style>
