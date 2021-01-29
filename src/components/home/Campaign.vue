<template>
	<div class="campaign">
		<div class="container">
			<div class="head">
				<h2>Campaign Manager</h2>
				<span>
					Our tool started out as a combat tracker for Dungeons & Dragons, but it has grown a lot. Over time it has become so much more than that, but if you simply want to run your encounters it is still perfect for just that.
				</span>
			</div>

			<div class="row q-col-gutter-xl">
				<div class="col-12 col-md-6">
					<video 
						class="video" src="@/assets/_img/home/player-overview.mp4" 
						muted autoplay playsinline alt="D&D Combat Tracker Harmless Key player overview" loop
					/>
				</div>
				<div class="col-12 col-md-6">
					<h3>More than an encounter tool,<br/> if you want it to be.</h3>
					
					<ul>
						<li>Keep track of player status outside combat</li>
						<li>Track party loot</li>
						<li>Track party currency</li>
						<li>Track player experience points</li>
					</ul>

					<router-link to="sign-up" class="btn btn-lg">Start a campaign</router-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'General'
	}
</script>

<style lang="scss" scoped>
	.campaign {
		padding-bottom: 50px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #181818;

		ul {
			margin-bottom: 30px;
		}
		video {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>