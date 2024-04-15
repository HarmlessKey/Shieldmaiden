<template>
	<div class="general">
		<div class="container">
			<div class="head">
				<h2>We keep track, you focus on the game</h2>
				<span>
					We focus on keeping the game on the table by managing 
					everything you need to keep track of during encounters. 
					On top of that we enhance the player experience.
				</span>
			</div>

			<div class="row q-col-gutter-xl mb-5">
				<div class="col-12 col-md-8">
					<video 
						class="video" src="~assets/_img/home/multitargeting.mp4" 
						muted autoplay playsinline alt="Initiative tracker Shieldmaiden multitargeting demo" loop
					/>
				</div>
				<div class="col-12 col-md-4">			
					<q-list>
						<q-item 
							v-for="({name, icon, title}, index) in items"
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
				<router-link to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
			</div>
		</div>

		<q-dialog v-model="dialog">
			<Carousel :slides="items" :slide="slide" />
		</q-dialog>
	</div>
</template>

<script>
	import Carousel from "./Carousel";
	import { combat_tracker_texts } from "src/utils/generalConstants";

	export default {
		name: 'General',
		components: {
			Carousel
		},
		data() {
			return {
				dialog: false,
				slide: "hp",
				items: combat_tracker_texts
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
	.general {
		ul {
			margin-bottom: 30px;
		}

		video {
			width: 100%;
		}
	}
</style>