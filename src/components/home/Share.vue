<template>
	<div class="share">
		<div class="container">
			<div class="head">
				<h2>Share live initiative list with your players</h2>
				<span>
					Show your players a live initiative list of the encounter that updates as you play. Perfect for at the table or if you are hosting a podcast or stream.
				</span>
			</div>

			<div class="row q-col-gutter-xl mb-5">
				<div class="col-12 col-md-6">
					<div class="video-wrapper">
						<div class="video">
							<video 
								src="@/assets/_img/home/track-encounter.mp4" 
								muted autoplay playsinline alt="Share initative screen Harmless Key D&amp;D Combat Tracker" loop
							/>
							<div class="info">An example of how your players can follow your encounters.</div>
						</div>
					</div>
				</div>
				<div class="col-12 col-md-6">
					<h3>Shows everything you need</h3>
					
					<q-list>
						<q-item 
							v-for="({name, icon, title}, index) in items"
							:key="`item-${index}`"
							clickable 
							@click="setDialog(name)"
						>
							<q-item-section avatar>
								<i :class="icon" />
							</q-item-section>
							<q-item-section>
								{{ title }}
							</q-item-section>
							<q-item-section avatar>
								<i class="fas fa-eye gray-hover" />
							</q-item-section>
						</q-item>
					</q-list>

				</div>
			</div>
			<div class="d-flex justify-center">
				<router-link to="sign-up" class="btn btn-lg">Try Harmless Key now!</router-link>
			</div>
		</div>
		
		<q-dialog v-model="dialog" square>
			<Carousel :slides="items" :slide="slide" />
		</q-dialog>
	</div>
</template>

<script>
	import Carousel from "./Carousel";

	export default {
		name: 'Share',
		components: {
			Carousel
		},
		data() {
			return {
				dialog: false,
				slide: "hp",
				items: [
					{
						name: "initiative",
						icon: "fas fa-list",
						title: "Initiative",
						text: "Show the initiative list on a separate screen, so your players always know what's going on."
					},
					{
						name: "live",
						icon: "fas fa-sync",
						title: "Live updates",
						text: "Every action you perform instantly updates the shared initiative list."
					},
					{
						name: "status",
						icon: "fas fa-list",
						title: "Status",
						text: "The current status of entities is displayed. "+
							"Think of hit points, armor class, conditions, etc."
					},
					{
						name: "rolls",
						icon: "fas fa-dice-d20",
						title: "Rolls",
						text: "You can choose to share your rolls and instantly display them on the shared "+
							"initiative list.<br/>"+
							"Scare your players when you roll that natural 20!"
					},
					{
						name: "meters",
						icon: "fas fa-swords",
						title: "Damage/healing meters",
						text: "Give your players a little insight in their character's worth by showing them "+
							"how much damage and healing they did."
					},
					{
						name: "atmosphere",
						icon: "fas fa-image",
						title: "Atmosphere",
						text: "Add awesome background images that perfectly set the atmosphere for your "+
							"encounters, allowing your player to fully immerse."
					},
					{
						name: "weather",
						icon: "fas fa-cloud-showers",
						title: "Weather effects",
						text: "Add a layer with weather effects to your background. "+
							"Isn't that battle on a winter landscape even better with intense snowfall?"
					},
					{
						name: "customization",
						icon: "fas fa-cogs",
						title: "Customization",
						text: "Through loads of settings you can create the shared initiative screen "+
							"that is perfect for your games. You decide what you want to show to or hide from your players."
					},
				]
			}
		},
		methods: {
			setDialog(slide) {
				this.slide = slide;
				this.dialog = true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.share {
		padding-bottom: 100px;
		background-color: #111111;

		.video-wrapper {
			padding: 0 80px;

			.video {
				width: 100%;
				height: calc(100% - 10px);
				overflow: hidden;
				border: solid 8px $black;
				background-color: $black;
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