<template>
	<div class="hk-card-deck">
		<slot />
	</div>
</template>

<script>
	export default {
		name: 'hk-card-deck',
	}
</script>

<style lang="scss" scoped>
	.hk-card-deck {
		display: flex;
		flex-flow: row wrap;
		margin-right: -15px;
		margin-left: -15px;

		.hk-card {
			flex: 1 0 0%;
			margin-right: 15px;
			margin-bottom: 0;
			margin-left: 15px;
		}
	}
</style>