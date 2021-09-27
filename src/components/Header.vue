<template>
	<header :class="{ invert: enviroment === 'development' }">
		<div id="header" class="d-flex justify-content-between" :class="{ 'hidden-sidebar': $route.meta.sidebar === false }">
			<div>
				<div 
					class="menu"
					@click.stop="setSideSmallScreen(!$store.getters.side_small_screen)"
				>
					<i class="fas" :class="$store.getters.side_small_screen ? 'fa-times' : 'fa-bars'"/>
				</div>
				<router-link to="/" class="logo d-flex justify-content-start" :class="{ home: $route.meta.sidebar === false }">
					<img class="icon" src="../assets/_img/logo/logo-icon-cyan.svg" alt="logo icon"/>
					<img class="wordmark d-none d-md-block" src="../assets/_img/logo/logo-wordmark.svg" alt="Harmless Key"/>
				</router-link>
			</div>

			<div class="d-flex justify-content-end">
				<div class="d-none d-sm-flex">
					<div 
						v-for="{name, icon, url} in social_media"
						class="area d-flex justify-content-end"
						:key="name"
					>
						<a class="icon" :href="url" target="_blank" rel="noopener">
							<i :class="icon" />
							<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
								{{ name }}
							</q-tooltip>
						</a>
					</div>
					<q-separator vertical dark inset class="mx-1" />
				</div>

				<div class="area d-flex justify-content-end">
					<a class="icon d-none d-md-block"
						@click="setSlide({show: true, type: 'slides/Keybindings', data: {sm: true}})">
						<i class="fas fa-keyboard"/>
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Keybindings
						</q-tooltip>
					</a>
					<a class="icon"
						@click="setSlide({show: true, type: 'slides/Compendium'})">
						<i class="fas fa-book-spells"></i>
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Compendium
						</q-tooltip>
					</a>
					<a 
						v-if="user"
						class="icon"
						@click="setSlide({show: true, type: 'PlayerLink'})">
						<i class="fas fa-share-alt"></i>
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Player link
						</q-tooltip>
					</a>
					<a class="icon roll" 
						v-shortkey="['r']" @shortkey="setSlide({show: true, type: 'slides/roll/index'})"
						@click="setSlide({show: true, type: 'slides/roll/index'})">
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Dice roller
						</q-tooltip>
					</a>
				</div>
				<q-separator vertical dark inset class="mx-1" />
				<div v-if="user" class="user">
					<span class="img" :class="{ invert: enviroment === 'development' }" v-if="user.photoURL" :style="{'background-image': 'url(' + user.photoURL + ')'}"></span>
					<i v-else class="fas fa-user"></i>
					<q-popup-proxy :offset="[9, 0]">
						<div class="bg-neutral-10">
							<q-list>
								<q-item clickable v-close-popup to="/admin" v-if="userInfo && userInfo.admin">
									<q-item-section avatar><i class="fas fa-crown"></i></q-item-section>
									<q-item-section>Admin</q-item-section>
								</q-item>
								<q-item clickable v-close-popup to="/contribute" v-if="userInfo && (userInfo.admin || userInfo.contribute)">
									<q-item-section avatar><i class="fas fa-file-edit"></i></q-item-section>
									<q-item-section>Contribute</q-item-section>
								</q-item>
								<q-item clickable v-close-popup to="/profile">
									<q-item-section avatar><i class="fas fa-user"></i></q-item-section>
									<q-item-section>Profile</q-item-section>
								</q-item>
								<q-item clickable v-close-popup to="/content">
									<q-item-section avatar><i class="fas fa-treasure-chest"></i></q-item-section>
									<q-item-section>My content</q-item-section>
								</q-item>
								<q-item clickable v-close-popup to="/settings">
									<q-item-section avatar><i class="fas fa-cogs"></i></q-item-section>
									<q-item-section>Settings</q-item-section>
								</q-item>
								<q-separator />
								<q-item clickable v-close-popup @click="signOut()">
									<q-item-section avatar><i class="fas fa-sign-out-alt"></i></q-item-section>
									<q-item-section>Sign out</q-item-section>
								</q-item>
							</q-list>
						</div>
					</q-popup-proxy>
				</div>
				<router-link v-else to="/sign-in" class="px-2">Sign in</router-link>
			</div>
		</div>
	</header>
</template>

<script>
	import { auth } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';

	export default {
		data() {
			return {
				user: auth.currentUser,
				enviroment: process.env.NODE_ENV,
				social_media: [
					{
						name: "Discord",
						icon: "fab fa-discord",
						url: "https://discord.gg/fhmKBM7"
					},
					{
						name: "Reddit",
						icon: "fab fa-reddit-alien",
						url: "https://www.reddit.com/r/HarmlessKey"
					},
					{
						name: "Facebook",
						icon: "fab fa-facebook",
						url: "https://www.facebook.com/harmlesskey"
					},
					{
						name: "Instagram",
						icon: "fab fa-instagram",
						url: "https://www.instagram.com/harmlesskey"
					},
					{
						name: "Twitter",
						icon: "fab fa-twitter-square",
						url: "https://twitter.com/KeyHarmless"
					},
				]
			}
		},
		computed: {
			...mapGetters([
				'userInfo'
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'setSideSmallScreen'
			]),
			showSlide(type) {
				this.setSlide({
					show: true,
					type,
				})
			},
			signOut: function() {
				this.$store.commit("SET_USER", undefined)
				auth.signOut()
				.then(() => {
					if(this.$route.path !== "/") this.$router.replace('/');
				});
			}
		}
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
	transition: position .4s linear;

	.icon {
		height: 40px;
	}
	.wordmark {
		margin: 13px 0 0 7px;
		height: 13px;
	}
}
a {
	color: $neutral-3 !important;

	&:hover {
		color: $blue !important;
	}
}
a.icon {
	cursor: pointer;
	font-size: 18px;
	text-align: center;
	height: 50px;
	width: 24px;
	margin-left: 8px;
	line-height: 50px !important;

	&:hover {
		color: $neutral-1 !important;
	}
	&.roll {
		margin-left: 5px;
		background-image: url('../assets/_img/logo/logo-icon-no-shield-gray-no-border.svg');
		background-size: 22px 22px;
		background-position: center;
		background-repeat: no-repeat;
	}
}
.user	{
	cursor: pointer;
	font-size: 15px;
	padding: 12px 15px 12px 10px;
	line-height: 26px !important;
	height: 50px ;
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
	}
	a.icon {
		font-size: 25px;
		padding: 0 20px;
		width: 25px;
		
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
</style>