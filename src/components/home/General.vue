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
					<h3>Combat tracker</h3>
					
					<ul>
						<li>Current Hit Points</li>
						<li>Roll monster abilities</li>
						<li>Conditions</li>
						<li>Custom reminders </li>
						<li>Damage types</li>
						<li>Resistance, vulnerability and immunity</li>
						<li>Combat log</li>
						<li>Multi-targeting</li>
						<li>...and much more</li>
					</ul>
					<a @click="dialog = true">More info</a>

				</div>
			</div>
			<div class="d-flex justify-center">
				<router-link to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
			</div>
		</div>

		<q-dialog v-model="dialog" square>
			<Dialog />
		</q-dialog>
	</div>
</template>

<script>
	import Dialog from "./carousels/General";

	export default {
		name: 'General',
		components: {
			Dialog
		},
		data() {
			return {
				dialog: false
			}
		}
	}
</script>

<style lang="scss" scoped>
	.general {
		padding-bottom: 100px;
		min-height: calc(100vh - 50px - 55px);
		background-color: $gray-darker;

		ul {
			margin-bottom: 30px;
		}

		video {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>