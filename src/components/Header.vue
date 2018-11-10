<template>
	<header>
		<div id="header" class="d-flex justify-content-between">
			<div class="d-flex justify-content-left">
				<span class="mr-3">Logo</span>
				<nav>
					<router-link to="/">Home</router-link> |
					<router-link to="/upcoming">Upcoming</router-link> |
					<router-link to="/feedback">Feedback</router-link>
				</nav>
			</div>
			<div class="d-flex justify-content-right">
				<a class="roll-dice" href="#"><i class="fas fa-dice-d20"></i></a>
				<div v-if="user">
					<a class="user" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<i class="fas fa-user"></i>
					</a>
					<div class="dropdown-menu dropdown-menu-right">
						<router-link to="/profile" class="dropdown-item"><i class="fas fa-user-circle"></i> Profile</router-link>
						<router-link to="/campaigns" class="dropdown-item"><i class="fas fa-book-dead"></i> My Content</router-link>
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
	export default {
		computed: {
			user() {
				return this.$store.getters.getUser;
			}
		},
		methods: {
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

<style>
header a.user, header a.roll-dice	{
	cursor:pointer;
	font-size:15px;
	padding:0 10px;
	color:#b2b2b2 !important;
}
header a.user:hover, header a.roll-dice:hover {
	color:#2c97de !important;
}
header .dropdown-menu {
	top:28px !important;
	left:10px !important;
}
header .dropdown-menu button, header .dropdown-menu a {
	color:#b2b2b2 !important;
	cursor:pointer;
	font-size:15px;
}
header .dropdown-menu button:hover, header .dropdown-menu a:hover, header .dropdown-menu button.active, header .dropdown-menu a.active {
	color:#2c97de !important;
	background:none;
}
header .dropdown-divider {
	border-color:#b2b2b2;
	margin:0;
}
</style>