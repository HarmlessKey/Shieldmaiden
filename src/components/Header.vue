<template>
	<header>
		<div id="header" class="d-flex justify-content-between">
			<div class="d-flex justify-content-left">
				<router-link to="/">Harmless Key <span class="gray-hover">BETA</span></router-link>
			</div>
			<div class="d-flex justify-content-right">
				<!-- <a href="#" v-b-tooltip.hover title="Facebook" ><i class="fab fa-facebook-f"></i></a> -->
				<router-link v-if="user" to="/feedback" v-b-tooltip.hover title="Give Feedback" class="mx-2"><i class="fas fa-comment-alt"></i></router-link>
				<a class="roll-dice" 
					v-b-tooltip.hover 
					title="Compendium"  
					v-shortkey="['r']" @shortkey="showSlide('compendium')"
					@click="showSlide('compendium')"><i class="fas fa-book-spells"></i></a>
				<a class="roll-dice" 
					v-b-tooltip.hover 
					title="Dice Roller"  
					v-shortkey="['r']" @shortkey="showSlide('roll')"
					@click="showSlide('roll')"><i class="fas fa-dice-d20"></i></a>
				<div v-if="user">
					<a class="user" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">                                  
						<span class="img" v-if="user.photoURL" :style="{'background-image': 'url(' + user.photoURL + ')'}"></span>
						<i v-else class="fas fa-user"></i>
					</a>
					<div class="dropdown-menu dropdown-menu-right">
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
	import { mapActions } from 'vuex';

	export default {
		data() {
			return {
				user: auth.currentUser
			}
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
a.user, a.roll-dice	{
	cursor: pointer;
	font-size: 15px;
	padding: 0 10px;

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
.dropdown-menu {
	top: 7px !important;
	left: 10px !important;
}
</style>