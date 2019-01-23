<template>
	<div class="footer">
		<div class="top container">
			<h2>Logo</h2>

			<b-row class="d-flex justify-content-between">
				<b-col sm="">
					<h2>Quick Links</h2>
					<ul>
						<li><router-link to="/updates">Updates</router-link></li>
						<li><router-link to="/documentation">Documentation</router-link></li>
						<li><router-link to="/about-us">About us</router-link></li>
					</ul>
				</b-col>
				<b-col sm="">
					<h2>Your content</h2>
					<ul v-if="user">
						<li><router-link to="/settings">Settings</router-link></li>
						<li><router-link to="/campaigns">Campaigns</router-link></li>
						<li><router-link to="/players">Players</router-link></li>
						<li><router-link to="/npcs">NPC's</router-link></li>
					</ul>
				</b-col>
			</b-row>
		</div>

		<div class="bottom">
			<div class="container">
				<small class="d-flex justify-content-between mb-1">
					<span>Icons made by Delapouite, Lorc and Skoll. Available on <a target="_blank" href="http://game-icons.net">http://game-icons.net</a>.</span>
					<router-link to="/privacy-policy">Privacy Policy</router-link>
				</small>
				<small>Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©2018 Wizards.</small>
			</div>
		</div>
	</div>
</template>

<script>


	export default {
		data() {
			return {
				user: this.$store.getters.getUser
			}
		},
		methods: {

		}
	};
</script>

<style lang="scss" scoped>
	.footer {
		background-color: #494747;

		.top {
			padding: 20px;

			ul {
				padding: 0;
				list-style: none;
			}
		}
		.bottom {
			padding: 20px;
			background-color: #302f2f;
		}
	}
</style>