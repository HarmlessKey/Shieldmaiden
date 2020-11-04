<template>
	<header :class="{ invert: enviroment === 'development' }">
		<div id="header" class="d-flex justify-content-between" :class="{ 'hidden-sidebar': $route.meta.sidebar === false }">
			<div>
				<div 
					class="menu"
					@click.stop="setSideSmallScreen(!$store.getters.side_small_screen)"
				>
					<i class="fas fa-bars"></i>
				</div>
				<router-link to="/" class="logo d-flex justify-content-start" :class="{ home: $route.meta.sidebar === false }">
					<img class="icon" src="../assets/_img/logo/logo-icon-cyan.svg" alt="logo icon"/>
					<img class="wordmark d-none d-md-block" src="../assets/_img/logo/logo-wordmark.svg" alt="Harmless Key"/>
				</router-link>
				
			</div>
			<div class="d-flex justify-content-end">
				<div class="area d-flex justify-content-end">
					<a href="https://discord.gg/fhmKBM7" target="_blank" class="icon">
						<i class="fab fa-discord"></i>
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Discord
						</q-tooltip>
					</a>
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
						<i class="fas fa-link"></i>
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Player link
						</q-tooltip>
					</a>
					<a class="icon roll" 
						v-shortkey="['r']" @shortkey="setSlide({show: true, type: 'slides/Roll'})"
						@click="setSlide({show: true, type: 'slides/Roll'})">
						<q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 10]">
							Dice roller
						</q-tooltip>
					</a>
				</div>
				<div v-if="user" class="user">
					<span class="img" :class="{ invert: enviroment === 'development' }" v-if="user.photoURL" :style="{'background-image': 'url(' + user.photoURL + ')'}"></span>
					<i v-else class="fas fa-user"></i>
					<q-popup-proxy square :offset="[9, 0]">
						<div class="bg-gray gray-light">
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
								<q-item clickable v-close-popup to="/campaigns">
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
				<router-link v-else to="/sign-in" class="ml-2">Sign in</router-link>
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
				enviroment: process.env.NODE_ENV
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
				auth.signOut()
				.then(() => {
					this.$router.replace('/');
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
	color:#b2b2b2 !important;

	&:hover {
		color: #2c97de !important;
	}
}
a.icon {
	cursor: pointer;
	font-size: 16px;
	text-align: center;
	height: 24px;
	width: 24px;
	margin-left: 5px;
	line-height: 24px !important;

	&:hover {
		color: #fff !important;
	}
	&.roll {
		background-image: url('../assets/_img/logo/logo-icon-no-shield-gray-no-border.svg');
		background-size: 19px 19px;
		background-position: center;
		background-repeat: no-repeat;
	}
}
.user	{
	cursor: pointer;
	font-size: 15px;
	padding: 0 5px 5px 10px;
	line-height: 25px !important;
	display: block;

	.img {
		margin-top: 3px;
		width: 25px;
		height: 25px;
		border-radius: 50%;
		display: inline-block;
		background-size: cover;
		background-position: center top;
	}
}
.area {
	padding: 3px 10px;
	border-right: solid 1px #494747;
	height: 30px;
}

#header.hidden-sidebar {
	.logo {
		left: 45px;
	}
}

@media only screen and (max-width: 600px) {
	.logo {
		left: 40px;
	}
}
</style>