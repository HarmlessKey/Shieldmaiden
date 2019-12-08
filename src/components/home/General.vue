<template>
	<div class="share">
		<div class="container">
			<h2>We keep track, you focus on the game</h2>

			<b-row>
				<b-col sm="6">
					IMAGE
				</b-col>
				<b-col>
					<h3>We track everything in encounters</h3>
					
					<ul>
						<li>Current Hit Points</li>
						<li>Conditions</li>
						<li>Reminders (like concentration)</li>
						<li>Roll monster abilities and apply damage instantly</li>
					</ul>

					<router-link to="sign-up" class="btn btn-lg">Create your first encounter</router-link>
				</b-col>
			</b-row>
			<a href="#share" class="read-more">Share initiative list</a>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Share'
	}
</script>

<style lang="scss" scoped>
	.share {
		min-height: calc(100vh - 50px - 55px);
		background-color: #191919;

		ul {
			margin-bottom: 30px;
		}

		.image {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>