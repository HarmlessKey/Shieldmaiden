<template>
	<div class="share">
		<div class="container">
			<div class="head">
				<h2>Share live initiative list with your players</h2>
				<span>
					Show your players a live initiative list of the encounter, that updates as you play.
				</span>
			</div>

			<b-row>
				<b-col sm="6">
					<img class="image" src="@/assets/_img/track-encounter.gif"/>
				</b-col>
				<b-col>
					<h3>Shows everything you need</h3>
					
					<ul>
						<li>Shows initiative with current on top</li>
						<li>Live updated while you play</li>
						<li>Players current health</li>
						<li>Conditions</li>
						<li>Rolls (if you want)</li>
						<li>Damage/healing meters</li>
						<li>Give atmosphere with personal background images</li>
					</ul>

					<p>Through settings you decide what is and isn’t shown to your players.</p>
					<router-link to="sign-up" class="btn btn-lg">Try it now!</router-link>
				</b-col>
			</b-row>
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
		background-color: #111111;

		.image {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>