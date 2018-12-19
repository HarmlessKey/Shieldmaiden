<template>
	<div class="footer">
		<div class="top container">
			<h2>Logo</h2>
		</div>

		<div class="bottom">
			<div class="container">
				<div class="d-flex justify-content-between mb-2">
					<span>Icons made by ..., ... and .... Available on <a target="_blank" href="http://game-icons.net">http://game-icons.net</a></span>
					<router-link to="">Privacy Policy</router-link>
				</div>
				<p>Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©2018 Wizards.</p>
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
		}
		.bottom {
			padding: 20px;
			background-color: #302f2f;
		}
	}
</style>