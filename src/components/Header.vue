<template>
	<header>
		<div id="header" class="d-flex justify-content-between">
			<div class="d-flex justify-content-left">
				<router-link to="/">Logo</router-link>
				<!-- <nav>
					<router-link to="/">Home</router-link> |
				</nav> -->
			</div>
			<div class="d-flex justify-content-right">
				<router-link to="/feedback" v-b-tooltip.hover title="Give Feedback" class="mx-2"><i class="fas fa-comment-alt"></i></router-link>
				<a href="#" v-b-tooltip.hover title="Facebook" ><i class="fab fa-facebook-f"></i></a>
				<a class="roll-dice" v-b-tooltip.hover title="Dice Roller"  @click="showSlide()"><i class="fas fa-dice-d20"></i></a>
				<div v-if="user">
					<a class="user" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">                                  
						<span class="img" v-if="user.photoURL" :style="{'background-image': 'url(' + user.photoURL + ')'}"></span>
						<i v-else class="fas fa-user"></i>
					</a>
					<div class="dropdown-menu dropdown-menu-right">
						<router-link to="/profile" class="dropdown-item"><i class="fas fa-user-circle"></i> Profile</router-link>
						<router-link to="/campaigns" class="dropdown-item"><i class="fas fa-treasure-chest"></i> My Content</router-link>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item" v-on:click="signOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
					</div>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
	import firebase from "firebase";
	import { mapActions } from 'vuex';

	export default {
		data() {
			return {
				user: this.$store.getters.getUser
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			showSlide() {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'roll',
				})
			},
			signOut: function() {
				firebase.auth()
				.signOut()
				.then(() => {
					this.$router.replace('sign-in');
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
	top: 8px !important;
	left: 10px !important;

	button, a {
		color: #b2b2b2 !important;
		cursor: pointer;
		font-size: 15px;

		&:hover, &.active {
			color: #2c97de !important;
			background:none;
		}
	}
	.dropdown-divider {
		border-color: #b2b2b2;
		margin: 0;
	}
}



</style>