<template>
	<header>
		<div id="header" class="d-flex justify-content-between">
			<div class="d-flex justify-content-left">
				<router-link to="/">Harmless Key <span class="gray-hover d-none d-md-inline">BETA</span></router-link>
			</div>
			<div class="d-flex justify-content-end">
				<div class="area d-flex justify-content-end">
					<!-- <a href="https://www.patreon.com/harmlesskey" target="_blank" v-b-tooltip.hover title="Patreon" class="icon patreon"><i class="fab fa-patreon"></i></a> -->
					<a href="https://www.facebook.com/harmlesskey" target="_blank" v-b-tooltip.hover title="Facebook" class="icon"><i class="fab fa-facebook-f"></i></a>
					<a href="https://www.reddit.com/r/HarmlessKey" target="_blank" v-b-tooltip.hover title="Reddit" class="icon"><i class="fab fa-reddit-alien"></i></a>
					<router-link v-if="user" class="icon" to="/feedback" v-b-tooltip.hover title="Give Feedback"><i class="fas fa-comment-alt"></i></router-link>
				</div>
				<div class="area d-flex justify-content-end">
					<a class="icon" 
						v-b-tooltip.hover 
						title="Compendium"  
						v-shortkey="['r']" @shortkey="showSlide('compendium')"
						@click="showSlide('compendium')"><i class="fas fa-book-spells"></i></a>
					<a class="icon" 
						v-b-tooltip.hover 
						title="Dice Roller"  
						v-shortkey="['r']" @shortkey="showSlide('roll')"
						@click="showSlide('roll')"><i class="fas fa-dice-d20"></i></a>
				</div>
				<div v-if="user">
					<a class="user" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">                                  
						<span class="img" v-if="user.photoURL" :style="{'background-image': 'url(' + user.photoURL + ')'}"></span>
						<i v-else class="fas fa-user"></i>
					</a>
					<div class="dropdown-menu dropdown-menu-right">
						<router-link v-if="userInfo && userInfo.admin" to="/admin" class="dropdown-item"><i class="fas fa-crown"></i> Admin</router-link>
						<router-link to="/profile" class="dropdown-item"><i class="fas fa-user-circle"></i> Profile</router-link>
						<router-link to="/campaigns" class="dropdown-item"><i class="fas fa-treasure-chest"></i> My Content</router-link>
						<router-link to="/settings" class="dropdown-item"><i class="fas fa-cogs"></i> Settings</router-link>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item" v-on:click="signOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
					</div>
				</div>
				<router-link v-else to="/sign-in">Sign in</router-link>
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
				// admin: this.$store.getters.userInfo.admin
			}
		},
		computed: {
			...mapGetters([
				'userInfo'
			]),
		},
		methods: {
			...mapActions([
				'setSlide'
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
a {
	color: #b2b2b2 !important;

	&:hover {
		color: #2c97de !important;
		text-decoration: none;
	}
}
a.icon {
	cursor: pointer;
	font-size: 13px;
	text-align: center;
	height: 24px;
	width: 24px;
	margin-left: 3px;
	line-height: 24px !important;
	border-radius: 50%;

	&.patreon {
		color: rgb(232, 91, 70) !important;
	}
	&:hover {
		color: #fff !important;
		background: #262626;
	}
}
a.user	{
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
.dropdown-menu {
	top: -2px !important;
	left: 10px !important;
}
</style>