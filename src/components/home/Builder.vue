<template>
	<div class="builder">
		<div class="container">
			<div class="head">
				<h2>Build great encounters</h2>
				<span>
					Our encounter builder is easy to use and lets you use your own custom monsters.
				</span>
			</div>

			<video
				class="video"
				src="~assets/_img/home/encounter-builder.mp4"
				muted
				autoplay
				playsinline
				alt="Shieldmaiden logo animation"
				loop
			/>

			<div class="text-center">
				<router-link to="/encounter-builder" class="btn btn-lg bg-accent"
					>Try our encounter builder</router-link
				>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Content",
};
</script>

<style lang="scss" scoped>
.builder {
	.video {
		width: 100%;
		margin-bottom: 30px;
	}
}
</style>
