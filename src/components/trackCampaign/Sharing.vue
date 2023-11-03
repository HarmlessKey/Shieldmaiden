<template>
	<div class="sharing">
		<img v-if="sharing.image" :src="sharing.image" class="image" alt="Shared image"  />
		<iframe
			v-if="sharing.youtube"
			:src="`${sharing.youtube}?autoplay=1&mute=0&playsinline=1`"
			title="YouTube video player"
			class="youtube-player"
			frameborder="0"
			allow="autoplay"
		/>
		<div v-if="sharing.message" class="message">{{ sharing.message.trim() }}</div>
	</div>
</template>

<script>
export default {
	name: "Sharing",
	props: {
		sharing: {
			type: Object,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.sharing {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background: #000000b2;
	z-index: 99;
	padding: 0.5rem;
	display: flex;
	align-items: center;
	overflow-y: auto;

	.image {
		width: 100%;
		max-width: 100%;
		height: 100%;
		max-height: 100%;
		margin: auto;
		object-fit: contain;
	}
	.youtube-player {
		height: 100%;
		width: 100%;
	}
	.message {
		font-family: Helvetica, sans-serif, serif;
		background-image: url("~assets/_img/styles/monster-card-bg.png");
		background-color: #f7e4ba;
		color: $black;
		max-width: 500px;
		margin: auto;
		padding: 2rem;
		font-size: 18px;
		box-shadow: 0 10px 15px $black;
		white-space: pre-line;
		border-top-right-radius: 25px;
		border-bottom-left-radius: 25px;
	}
}
</style>
