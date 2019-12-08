<template>
	<div class="general">
		<div class="container">
			<h2>We keep track, you focus on the game</h2>

			<b-row>
				<b-col sm="6">
					<iframe src="https://www.youtube.com/embed/2Xzs94mVCww" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
				</b-col>
				<b-col>
					<h3>We track everything in encounters</h3>
					
					<ul>
						<li>Current Hit Points</li>
						<li>Conditions</li>
						<li>Concentration</li>
						<li>Reactions used</li>
						<li>Custom reminders for other effects</li>
						<li>Roll monster abilities and apply damage instantly</li>
					</ul>

					<router-link to="sign-up" class="btn btn-lg">Create your first encounter</router-link>
				</b-col>
			</b-row>
			<a href="#share" class="next">
				<div>Share initiative list</div>
				<i class="fas fa-chevron-down"></i>
			</a>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'General'
	}
</script>

<style lang="scss" scoped>
	.general {
		padding-bottom: 170px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #191919;

		ul {
			margin-bottom: 30px;
		}

		iframe {
			width: 100%;
			height: 300px;
			margin-bottom: 30px;
		}
	}
</style>