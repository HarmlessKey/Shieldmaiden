<template>
	<div class="share">
		<div class="home__container">
			<div class="head">
				<h2>Share a live initiative list with your players</h2>
				<div class="text">
					Show your players a live initiative list of the encounter that updates as you play.
					Perfect for at the table or if you are hosting a podcast or stream.
				</div>
			</div>

			<div class="row q-col-gutter-xl mb-5">
				<div class="col-12 col-md-6">
					<div class="video-wrapper">
						<div class="video">
							<video
								src="~assets/_img/home/track-encounter.mp4"
								muted
								autoplay
								playsinline
								alt="Share initiative screen Shieldmaiden D&amp;D Combat Tracker"
								loop
							/>
							<div class="info">An example of how your players can follow your encounters.</div>
						</div>
					</div>
				</div>
				<div class="col-12 col-md-6">
					<h3>Shows everything you need</h3>

					<q-list>
						<q-item
							v-for="({ name, icon, title }, index) in items"
							:key="`item-${index}`"
							clickable
							@click="setDialog(name)"
						>
							<q-item-section avatar>
								<i aria-hidden="true" :class="icon" class="neutral-2" />
							</q-item-section>
							<q-item-section>
								{{ title }}
							</q-item-section>
							<q-item-section avatar>
								<i aria-hidden="true" class="fas fa-eye neutral-3" />
							</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>
			<div class="d-flex justify-center">
				<router-link to="sign-up" class="btn btn-lg bg-accent">Try Shieldmaiden now!</router-link>
			</div>
		</div>

		<q-dialog v-model="dialog" square>
			<Carousel :slides="items" :slide="slide" />
		</q-dialog>
	</div>
</template>

<script>
import Carousel from "./Carousel";
import { live_initiative_texts } from "src/utils/generalConstants";

export default {
	name: "Share",
	components: {
		Carousel,
	},
	data() {
		return {
			dialog: false,
			slide: "hp",
			items: live_initiative_texts,
		};
	},
	methods: {
		setDialog(slide) {
			this.slide = slide;
			this.dialog = true;
		},
	},
};
</script>

<style lang="scss" scoped>
.share {
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
				opacity: 0.5;
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
