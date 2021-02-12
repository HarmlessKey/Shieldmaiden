<template>
	<div class="share">
		<div class="container">
			<div class="head">
				<h2>Share live initiative list with your players</h2>
				<span>
					Show your players a live initiative list of the encounter that updates as you play. Perfect for at the table or if you are hosting a podcast or stream.
				</span>
			</div>

			<div class="row q-col-gutter-xl">
				<div class="col-12 col-md-6">
					<div class="video-wrapper">
						<div class="video">
							<video 
								src="@/assets/_img/home/track-encounter.mp4" 
								muted autoplay playsinline alt="Share initative screen Harmless Key D&D Combat Tracker" loop
							/>
							<div class="info">An example of how your players can follow your encounters.</div>
						</div>
					</div>
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
						<li>Weather effects like rain and snow</li>
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

		.video-wrapper {
			padding: 0 80px;

			.video {
				width: 100%;
				height: calc(100% - 10px);
				overflow: hidden;
				border: solid 8px$black;
				background-color:$black;
				border-radius: 10px;
				position: relative;

				video {
					width: calc(100% + 2px);
					border-radius: 10px;
				}
				.info {
					text-align: center;
					font-style: italic;
					padding: 10px 50px 20px 50px;
					position: absolute;
					bottom: 0;
					opacity: .5;
					font-size: 12px;
					line-height: 20px;
				}
			}

		}
		@media only screen and (max-width: 567px) { 
			.video-wrapper {
				padding: 0 50px !important;

				.info {
					padding: 10px 20px 20px 20px !important;
				}
			}
		}
	}
</style>