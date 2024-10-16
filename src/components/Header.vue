<template>
	<header>
		<div
			id="header"
			class="d-flex justify-content-between items-center"
			:class="{ 'hidden-sidebar': $route.meta.sidebar === false }"
		>
			<div>
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
						src="../assets/_img/logo/logo-icon-cyan.svg"
						alt="logo icon"
						:class="{ 'd-none d-md-block': environment !== 'live' }"
					/>
					<img
						class="wordmark d-none d-md-block"
						src="../assets/_img/logo/logo-wordmark.svg"
						alt="Shieldmaiden"
					/>
				</router-link>
			</div>

			<!-- ENVIRONMENT LABEL -->
			<q-chip v-if="environment !== 'live'" color="red" icon="far fa-rocket" class="white">
				<span class="ml-1">{{ environment.capitalize() }}</span>
			</q-chip>

			<div class="d-flex justify-content-end">
				<div class="area d-flex justify-content-end" :class="{ 'mr-2': maintenance }">
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
						v-if="user && !maintenance"
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
				</div>
				<template v-if="!maintenance">
					<q-separator vertical :dark="$store.getters.theme === 'dark'" inset class="mx-1" />
					<div v-if="user" class="user">
						<span
							class="img"
							v-if="user.photoURL"
							:style="{ 'background-image': 'url(' + user.photoURL + ')' }"
						></span>
						<i aria-hidden="true" v-else class="fas fa-user"></i>
						<q-popup-proxy :dark="$store.getters.theme === 'dark'" :offset="[9, 0]">
							<div class="bg-neutral-8">
								<q-list>
									<q-item clickable v-close-popup to="/admin" v-if="userInfo && userInfo.admin">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-crown"></i
										></q-item-section>
										<q-item-section>Admin</q-item-section>
									</q-item>
									<q-item
										clickable
										v-close-popup
										to="/contribute"
										v-if="userInfo && (userInfo.admin || userInfo.contribute)"
									>
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-file-edit"></i
										></q-item-section>
										<q-item-section>Contribute</q-item-section>
									</q-item>
									<q-item clickable v-close-popup to="/profile">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-user"></i
										></q-item-section>
										<q-item-section>Profile</q-item-section>
									</q-item>
									<q-item clickable v-close-popup to="/patreon">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-coins"></i
										></q-item-section>
										<q-item-section>Subscription</q-item-section>
									</q-item>
									<q-item clickable v-close-popup to="/content">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-treasure-chest"></i
										></q-item-section>
										<q-item-section>My content</q-item-section>
									</q-item>
									<q-item clickable v-close-popup to="/content/settings">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-cogs"></i
										></q-item-section>
										<q-item-section>Settings</q-item-section>
									</q-item>

									<q-item
										clickable
										v-close-popup
										@click="setTheme($store.getters.theme === 'dark' ? 'light' : 'dark')"
									>
										<q-item-section avatar
											><i
												aria-hidden="true"
												class="fas"
												:class="$store.getters.theme === 'dark' ? 'fa-sun' : 'fa-moon'"
											></i
										></q-item-section>
										<q-item-section
											>{{ $store.getters.theme === "dark" ? "Light" : "Dark" }} mode</q-item-section
										>
									</q-item>
									<q-separator />
									<q-item clickable v-close-popup @click="signOut()">
										<q-item-section avatar
											><i aria-hidden="true" class="fas fa-sign-out-alt"></i
										></q-item-section>
										<q-item-section>Sign out</q-item-section>
									</q-item>
								</q-list>
							</div>
						</q-popup-proxy>
					</div>
					<router-link v-else to="/sign-in" class="px-2">Sign in</router-link>
				</template>
			</div>
		</div>
	</header>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "Header",
	props: {
		maintenance: {
			type: [Boolean, String],
			default: false,
		},
	},
	data() {
		return {
			environment: process.env.VUE_APP_ENV_NAME,
		};
	},
	computed: {
		...mapGetters(["user", "userInfo"]),
		tabindex() {
			return this.$route.name === "RunEncounter" ? -1 : 0;
		},
	},
	methods: {
		...mapActions(["setDrawer", "setSideSmallScreen", "setTheme", "sign_out"]),
		signOut() {
			if (this.$route.path !== "/") this.$router.replace("/");
			this.sign_out();
		},
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
	margin-left: 8px;
	line-height: 50px !important;
	padding: 0;
	background: none;
	border: none;
	color: $neutral-2;

	&:hover {
		color: $neutral-1 !important;
	}
	&.roll {
		margin-left: 5px;
		background-image: url("../assets/_img/logo/logo-icon-no-shield-gray-no-border.svg");
		background-size: 22px 22px;
		background-position: center;
		background-repeat: no-repeat;
	}
}
.theme {
	padding: 15px;
	text-align: center;
	background-color: $neutral-8;

	button {
		display: block;
		margin-bottom: 10px;
		background: none;
		cursor: pointer;

		&:last-child {
			margin: 0;
		}
		border: solid 1px transparent;
		border-radius: $border-radius;
		padding: 3px;
		color: $neutral-3;

		&:hover,
		&.active {
			border-color: $blue;
			color: $neutral-1;
		}
		img {
			max-width: 150px;
			display: block;
		}
	}
}
.user {
	cursor: pointer;
	font-size: 15px;
	padding: 12px 15px 12px 10px;
	line-height: 26px !important;
	height: 50px;
	display: block;

	.img {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: inline-block;
		background-size: cover;
		background-position: center top;
	}
}
.area {
	height: 50px;
}

#header.hidden-sidebar {
	.logo {
		left: 45px;
	}
}

@media only screen and (max-width: 575px) {
	.logo {
		left: 50px !important;
	}
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
		background-image: url("../assets/_img/logo/logo-icon-no-shield-gray-dark-no-border.svg");
	}
}
</style>
