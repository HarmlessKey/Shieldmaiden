<template>
	<div class="general">
		<div class="container">
			<div class="head">
				<h2>We keep track, you focus on the game</h2>
				<span>
					We focus on keeping the game on the table by managing everything you need to keep track of during encounters. On top of that we enhance the player experience.
				</span>
			</div>

			<div class="row q-col-gutter-xl">
				<div class="col-12 col-md-8">
					<video 
						class="video" src="@/assets/_img/home/multitargeting.mp4" 
						muted autoplay playsinline alt="Initiative tracker Harmless Key multitargeting demo" loop
					/>
				</div>
				<div class="col-12 col-md-4">
					<h3>We track everything in combat</h3>
					
					<ul>
						<li>Current Hit Points</li>
						<li>Conditions</li>
						<li>Concentration</li>
						<li>Reactions used</li>
						<li>Damage types</li>
						<li>Resistance, vulnerability and immunity</li>
						<li>Custom reminders for other effects</li>
						<li>Multi-targeting (perfect for AOE damage)</li>
						<li>Roll monster abilities and instantly apply damage</li>
					</ul>

					<router-link to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
				</div>
			</div>
			<a href="#builder" class="next">
				<div>Build encounters</div>
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
		background-color: $gray-darker;

		ul {
			margin-bottom: 30px;
		}

		iframe {
			width: 100%;
			height: 300px;
			margin-bottom: 30px;
		}
		video {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>