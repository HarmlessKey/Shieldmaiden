<template>
	<div class="currently-sharing">
		<div class="currently-sharing__content">
			<h2 class="text-shadow">Currently sharing</h2>
			<button class="btn btn-lg bg-neutral-5" @click="$emit('stop')">
				<i class="fas fa-times mr-2" aria-hidden="true" />
				Stop sharing
			</button>
		</div>

		<iframe
			v-if="provided_campaign.campaign.sharing.youtube"
			:src="`${provided_campaign.campaign.sharing.youtube}`"
			title="YouTube video player"
			class="youtube-player"
		/>
		<img
			v-if="provided_campaign.campaign.sharing.image"
			:src="provided_campaign.campaign.sharing.image"
		/>
		<div v-if="provided_campaign.campaign.sharing.message" class="message">
			{{ provided_campaign.campaign.sharing.message.trim() }}
		</div>
	</div>
</template>

<script>
export default {
	name: "CurrentlySharing",
	inject: ["provided_campaign"],
};
</script>

<style lang="scss" scoped>
.currently-sharing {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	overflow: hidden;

	&__content {
		position: absolute;
		top: 0;
		left: 0;
		height: inherit;
		width: inherit;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: #000000b4;

		.btn {
			border: solid 1px $white;
		}
	}

	.youtube-player {
		width: 100%;
		height: 100%;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top;
	}
	.message {
		font-family: Helvetica, sans-serif, serif;
		background-image: url("~assets/_img/styles/monster-card-bg.png");
		background-color: #f7e4ba;
		color: $black;
		margin: auto;
		padding: 2rem;
		white-space: pre-line;
		height: 100%;
	}
}
</style>
