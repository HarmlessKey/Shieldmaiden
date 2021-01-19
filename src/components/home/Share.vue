<template>
	<div class="share">
		<div class="container">
			<div class="head">
				<h2>Share live initiative list with your players</h2>
				<span>
					Show your players a live initiative list of the encounter that updates as you play. Perfect for at the table or if you are hosting a podcast or stream.
				</span>
			</div>

			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-6">
					<video 
						class="video" src="@/assets/_img/home/track-encounter.mp4" 
						muted autoplay playsinline alt="Share initative screen Harmless Key D&D Combat Tracker" loop
					/>
				</div>
				<div class="col-12 col-md-6">
					<h3>Shows everything you need</h3>
					
					<ul>
						<li>Initiative with current on top</li>
						<li>Live updates while playing</li>
						<li>Players' current health</li>
						<li>Conditions</li>
						<li>Rolls (if you want)</li>
						<li>Damage/healing meters</li>
						<li>Atmosphere created by added personal background images</li>
					</ul>

					<p>Through different settings you decide what is and isn't visible for your players.</p>
					<router-link to="sign-up" class="btn btn-lg">Try it now!</router-link>
				</div>
			</div>

			<a class="next" href="#campaign">
				<div>Campaign Manager</div>
				<i class="fas fa-chevron-down"></i>
			</a>
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
		padding-bottom: 170px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #111111;

		.video {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>